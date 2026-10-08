/* =========================================================================
   FORGE ARCHIVE (.forge)  - export, validate, migrate, plan, import.

   One JSON document containing everything a person owns:
     profile, history (timeline), journal, checkIns, experiments, events,
     predictions, comparisons, achievements, groups, suggestionFeedback,
     settings, sharePrefs
   with a schemaVersion (migrations below), an integrity checksum (warns on
   hand-edits, never rejects them) and strict sanitization on the way in:
   an archive is untrusted input, exactly like any other file a user opens.

   Import never destroys silently: plan() reports what would be added,
   skipped or overwritten; apply() then runs in one of three modes
     "new-profile"  creates a separate saved profile (default, for other
                    people's files and for restoring on a new device)
     "merge"        adds to the current profile, existing data wins on conflict
     "replace"      replaces the current profile's data (requires confirm)
   ========================================================================= */
(function(F){
  "use strict";
  const P = F.pkg = {};
  P.FORMAT = "forge-archive";
  P.SCHEMA_VERSION = 1;
  P.MAX_BYTES = 6 * 1024 * 1024;
  P.EXT = ".forge";
  const isObj = v => v && typeof v === "object" && !Array.isArray(v);
  const num = F.num;

  /* ---------------- checksum (FNV-1a over canonical JSON) ---------------- */
  function canon(v){
    if (Array.isArray(v)) return "[" + v.map(canon).join(",") + "]";
    if (isObj(v)) return "{" + Object.keys(v).sort().map(k => JSON.stringify(k) + ":" + canon(v[k])).join(",") + "}";
    return JSON.stringify(v === undefined ? null : v);
  }
  P.checksum = function(data){ return F.hashString(canon(data)).toString(36); };

  /* ---------------- build ---------------- */
  P.DATA_KEYS = ["profile", "history", "journal", "checkIns", "experiments", "events", "predictions", "comparisons", "achievements", "groups", "suggestionFeedback", "settings", "sharePrefs"];
  P.build = function(opts){
    opts = opts || {};
    const inc = Object.assign({ journal: true, checkIns: true, experiments: true, events: true, predictions: true, comparisons: true, achievements: true, groups: true, settings: true }, opts.include || {});
    const safe = (fn, fb) => { try{ return fn(); } catch(e){ return fb; } };
    const store = F.store.exportAll();
    const data = {
      profile: safe(() => getLocalProfile(), null),
      history: safe(() => getFullTimeline(), []),
      journal: inc.journal ? safe(() => getJournalEntries(), []) : [],
      checkIns: inc.checkIns ? store.checkins : [],
      experiments: inc.experiments ? store.experiments : [],
      events: inc.events ? store.events : [],
      predictions: inc.predictions ? store.predictions : [],
      comparisons: inc.comparisons ? store.comparisons : [],
      achievements: inc.achievements ? store.achievements : { unlocked: {}, marks: {}, counters: {} },
      groups: inc.groups ? safe(() => getSavedGroups(), []) : [],
      suggestionFeedback: safe(() => getSuggestionFeedback(), []),
      settings: inc.settings ? { theme: safe(() => localStorage.getItem("pf_theme"), null), sound: safe(() => localStorage.getItem("pf_sound"), null) } : {},
      sharePrefs: store.sharePrefs,
    };
    const prof = data.profile;
    return {
      format: P.FORMAT, schemaVersion: P.SCHEMA_VERSION, generator: "PersonaForge", exportedAt: Date.now(),
      owner: { name: prof && prof.name ? String(prof.name).slice(0, 40) : "", code: prof && prof.code ? prof.code : (safe(() => localStorage.getItem("pf_last_code"), null) || null) },
      counts: { history: data.history.length, journal: data.journal.length, checkIns: data.checkIns.length, experiments: data.experiments.length, events: data.events.length, comparisons: data.comparisons.length },
      data, checksum: P.checksum(data),
    };
  };
  P.serialize = a => JSON.stringify(a, null, 2);
  P.filename = function(archive){
    const n = ((archive && archive.owner && archive.owner.name) || "Forge-Profile").replace(/[^a-z0-9_-]+/gi, "_").replace(/^_+|_+$/g, "") || "Forge-Profile";
    const d = new Date(archive && archive.exportedAt || Date.now()); const pad = x => String(x).padStart(2, "0");
    return `${n}-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${P.EXT}`;
  };

  /* ---------------- sanitizers for sections the store doesn't own ---------------- */
  const IDRE = /^[A-Za-z0-9_-]{1,64}$/;
  P.sanitizeHistoryEntry = function(e){
    if (!isObj(e)) return null;
    const ts = typeof e.timestamp === "number" && isFinite(e.timestamp) && e.timestamp > 0 && e.timestamp < 4102444800000 ? Math.round(e.timestamp) : null;
    if (!ts || typeof e.code !== "string") return null;
    const d = (typeof decodeCode === "function") ? decodeCode(e.code) : null;
    if (!d) return null;                                   // not a valid code at all: drop
    const legacy = !!d.obsolete;                           // obsolete (<PF4) entries are kept archived, exactly as the engine does
    const out = { code: e.code.slice(0, 120), name: F.capText(String(e.name || (d.name || "")), 40), archetype: F.capText(String(e.archetype || ""), 60), archetypeId: IDRE.test(e.archetypeId || "") ? e.archetypeId : null,
      soul: e.soul ? F.capText(String(e.soul), 40) : null, confidencePct: typeof e.confidencePct === "number" ? F.clampPct(e.confidencePct) : null,
      consistencyPct: typeof e.consistencyPct === "number" ? F.clampPct(e.consistencyPct) : null, depth: ["short", "balanced", "deep"].includes(e.depth) ? e.depth : null,
      questionCount: typeof e.questionCount === "number" ? Math.round(F.clamp(e.questionCount, 0, 200)) : null, timestamp: ts, version: Math.round(F.clamp(num(e.version, 1), 1, 99)) };
    if (legacy){ out.legacy = true; out.normDims = isObj(e.normDims) ? e.normDims : {}; return out; }
    out.normDims = d.normDims;                             // the CODE is the source of truth; stored dims can't disagree with it
    if (isObj(e.traits)){ out.traits = {}; Object.keys(e.traits).slice(0, 30).forEach(k => { if (typeof e.traits[k] === "number") out.traits[F.capText(k, 40)] = F.clampPct(e.traits[k]); }); }
    if (isObj(e.dimConfidence)){ out.dimConfidence = {}; DIMENSIONS.forEach(dm => { if (typeof e.dimConfidence[dm] === "number") out.dimConfidence[dm] = F.round1(F.clamp01(e.dimConfidence[dm]) * 100) / 100; }); }
    out.assessmentKind = e.assessmentKind === "targeted" ? "targeted" : "full";
    if (Array.isArray(e.questionIds)) out.questionIds = e.questionIds.filter(x => typeof x === "string" && /^[a-z0-9_-]{1,12}$/i.test(x)).slice(0, 60);
    if (Array.isArray(e.contradictionLabels)) out.contradictionLabels = e.contradictionLabels.filter(x => typeof x === "string").slice(0, 8).map(x => F.capText(x, 80));
    ["atlasTopMatchName", "narrativeRoleName", "identityTagline"].forEach(k => { if (typeof e[k] === "string") out[k] = F.capText(e[k], 120); });
    return out;
  };
  const histKey = e => `${e.code}|${e.timestamp}`;

  /* ---------------- migrations ---------------- */
  // Archive-shape migrations, applied in order from the file's version up to
  // SCHEMA_VERSION. Add `P.ARCHIVE_MIGRATIONS[n] = fn(archive) -> archive` when the shape changes
  // (never edit a shipped step). Version 1 is the first shipped shape, so there are none yet.
  P.ARCHIVE_MIGRATIONS = {};
  // The separate, older ".pf" ("forge-profile" v1/v2) payloads are converted into the archive shape here.
  P.MIGRATIONS = {
    1: function(old){
      return { format: P.FORMAT, schemaVersion: 1, generator: "PersonaForge (legacy .pf)", exportedAt: num(old.exportedAt, Date.now()),
        owner: { name: String(old.name || (old.localProfile && old.localProfile.name) || "").slice(0, 40), code: typeof old.code === "string" ? old.code : null },
        data: { profile: old.localProfile || null, history: Array.isArray(old.history) ? old.history : (Array.isArray(old.growthTimeline) ? old.growthTimeline : []),
          journal: old.journal || [], groups: old.groups || [], suggestionFeedback: old.suggestionFeedback || [], settings: old.settings || {},
          checkIns: [], experiments: [], events: [], predictions: [], comparisons: [], achievements: {}, sharePrefs: {} },
        legacyCode: typeof old.code === "string" ? old.code : null };
    },
  };

  /* ---------------- parse + validate ---------------- */
  P.parse = function(text){
    const res = { ok: false, errors: [], warnings: [], archive: null, source: null, migratedFrom: null };
    if (typeof text !== "string"){ res.errors.push("Not a text file."); return res; }
    if (text.length > P.MAX_BYTES){ res.errors.push("That file is too large to be a Forge archive."); return res; }
    let raw; try{ raw = JSON.parse(text); } catch(e){ res.errors.push("That file couldn't be read. It may be corrupted or isn't a Forge file."); return res; }
    if (!isObj(raw)){ res.errors.push("That file doesn't contain a Forge archive."); return res; }
    let a = raw;
    if (raw.format === "forge-profile" || (!raw.format && typeof raw.code === "string")){
      a = P.MIGRATIONS[1](raw); res.source = "pf-legacy"; res.migratedFrom = typeof raw.version === "number" ? raw.version : 0;
      res.warnings.push("This is an older .pf file; it was converted to the new format.");
    } else if (raw.format === P.FORMAT){
      res.source = "forge";
      if (typeof raw.schemaVersion !== "number") res.warnings.push("Archive has no version; assuming the current one.");
      else if (raw.schemaVersion > P.SCHEMA_VERSION) res.warnings.push("This archive is from a newer version of Forge. Known data will import; anything newer is ignored.");
      else if (raw.schemaVersion < P.SCHEMA_VERSION){ for (let v = raw.schemaVersion + 1; v <= P.SCHEMA_VERSION; v++){ if (P.ARCHIVE_MIGRATIONS[v]) a = P.ARCHIVE_MIGRATIONS[v](a); } res.migratedFrom = raw.schemaVersion; res.warnings.push("This archive was made by an older version of Forge and was upgraded on import."); }
      if (a === raw && isObj(raw.data) && typeof raw.checksum === "string" && P.checksum(raw.data) !== raw.checksum) res.warnings.push("The file's integrity check doesn't match, so it may have been edited. Forge will still validate everything on the way in.");
    } else { res.errors.push("That file isn't a Forge archive."); return res; }
    const d = isObj(a.data) ? a.data : {};
    const out = { owner: isObj(a.owner) ? { name: F.capText(String(a.owner.name || ""), 40), code: typeof a.owner.code === "string" ? a.owner.code.slice(0, 120) : null } : { name: "", code: null }, exportedAt: num(a.exportedAt, 0) || null, data: {} };

    // history: validate every entry, dedupe, newest cap
    const seen = new Set(); const hist = [];
    (Array.isArray(d.history) ? d.history : []).slice(0, 2000).forEach(e => { const s = P.sanitizeHistoryEntry(e); if (s && !seen.has(histKey(s))){ seen.add(histKey(s)); hist.push(s); } });
    const droppedHist = (Array.isArray(d.history) ? d.history.length : 0) - hist.length;
    if (droppedHist > 0) res.warnings.push(`${droppedHist} timeline entr${droppedHist === 1 ? "y was" : "ies were"} invalid or duplicated and skipped.`);
    out.data.history = hist.sort((x, y) => x.timestamp - y.timestamp).slice(-(typeof TIMELINE_CAP !== "undefined" ? TIMELINE_CAP : 500));

    out.data.journal = typeof sanitizeImportedJournal === "function" ? sanitizeImportedJournal(d.journal) : [];
    out.data.groups = typeof sanitizeImportedGroups === "function" ? sanitizeImportedGroups(d.groups) : [];
    out.data.suggestionFeedback = typeof sanitizeImportedSuggestionFeedback === "function" ? sanitizeImportedSuggestionFeedback(d.suggestionFeedback) : [];
    out.data.profile = isObj(d.profile) && typeof sanitizeImportedLocalProfile === "function" ? sanitizeImportedLocalProfile(d.profile) : null;
    // store-owned sections reuse the store's own sanitizers
    const S = F.store;
    out.data.checkIns = (Array.isArray(d.checkIns) ? d.checkIns : []).slice(0, 1000).map(S.sanitize.checkin).filter(Boolean);
    out.data.experiments = (Array.isArray(d.experiments) ? d.experiments : []).slice(0, 500).map(S.sanitize.experiment).filter(Boolean);
    out.data.events = (Array.isArray(d.events) ? d.events : []).slice(0, 1000).map(S.sanitize.event).filter(Boolean);
    out.data.predictions = (Array.isArray(d.predictions) ? d.predictions : []).slice(0, 500).map(S.sanitize.prediction).filter(Boolean);
    out.data.comparisons = (Array.isArray(d.comparisons) ? d.comparisons : []).slice(0, 500).map(S.sanitize.comparison).filter(Boolean);
    out.data.achievements = S.sanitize.achievements(d.achievements);
    out.data.sharePrefs = S.sanitize.sharePrefs(d.sharePrefs);
    out.data.settings = { theme: isObj(d.settings) && (d.settings.theme === "light" || d.settings.theme === "dark") ? d.settings.theme : null, sound: isObj(d.settings) && (d.settings.sound === "on" || d.settings.sound === "off") ? d.settings.sound : null };

    // identity of the person: an archive needs at least a profile, a history entry or an owner code
    const code = out.owner.code && typeof decodeCode === "function" ? decodeCode(out.owner.code) : null;
    if (!out.data.history.length && !(out.data.profile && out.data.profile.code) && !(code && !code.obsolete)){
      res.errors.push("That archive doesn't contain any Forge profile data."); return res;
    }
    if (code && code.obsolete) res.warnings.push(OBSOLETE_CODE_MESSAGE);
    res.archive = out; res.ok = true;
    res.summary = { name: out.owner.name || (code && code.name) || "", history: out.data.history.length, journal: out.data.journal.length, checkIns: out.data.checkIns.length, experiments: out.data.experiments.length, events: out.data.events.length, comparisons: out.data.comparisons.length };
    return res;
  };

  /* ---------------- plan (dry run) ---------------- */
  P.plan = function(parsed){
    if (!parsed || !parsed.ok) return { ok: false };
    const d = parsed.archive.data;
    const curHist = (function(){ try{ return getFullTimeline(); } catch(e){ return []; } })();
    const have = new Set(curHist.map(histKey));
    const newHist = d.history.filter(h => !have.has(histKey(h))).length;
    const curJournal = (function(){ try{ return getJournalEntries(); } catch(e){ return []; } })();
    const jIds = new Set(curJournal.map(j => j.id));
    const cur = (function(){ try{ return getLocalProfile(); } catch(e){ return null; } })();
    const hasLocal = !!(cur && (cur.code || curHist.length));
    const S = F.store; const countNew = (name, list) => { const ids = new Set(S.list(name).map(r => r.id)); return list.filter(r => !ids.has(r.id)).length; };
    return {
      ok: true, hasLocalData: hasLocal, currentName: cur && cur.name || "",
      incomingName: parsed.summary.name,
      add: { history: newHist, journal: d.journal.filter(j => !jIds.has(j.id)).length, checkIns: countNew("checkins", d.checkIns), experiments: countNew("experiments", d.experiments), events: countNew("events", d.events), comparisons: countNew("comparisons", d.comparisons) },
      skip: { history: d.history.length - newHist },
      willOverwrite: { replaceMode: ["profile", "history", "journal", "checkIns", "experiments", "events", "comparisons"].filter(k => hasLocal) },
      recommended: hasLocal ? "new-profile" : "replace",
      note: hasLocal ? "You already have data on this device. 'Import as a new profile' keeps everything you have." : "No existing profile here, so this restores it directly.",
    };
  };

  /* ---------------- apply ---------------- */
  P.apply = function(parsed, mode, opts){
    opts = opts || {};
    if (!parsed || !parsed.ok) return { ok: false, reason: "nothing to import" };
    if (!["new-profile", "merge", "replace"].includes(mode)) return { ok: false, reason: "unknown mode" };
    if (mode === "replace" && !opts.confirmed) return { ok: false, reason: "replace needs confirmation", needsConfirm: true };
    const d = parsed.archive.data;
    const report = { ok: true, mode, added: {}, skipped: {}, createdProfileId: null };
    const ls = localStorage;
    const write = (k, v) => { try{ ls.setItem(k, JSON.stringify(v)); return true; } catch(e){ return false; } };

    if (mode === "new-profile"){
      const nm = (d.profile && d.profile.name) || parsed.archive.owner.name || "";
      const created = typeof createNewProfile === "function" ? createNewProfile(nm) : null;
      report.createdProfileId = created && created.profileId || null;
    }
    const fresh = mode === "new-profile" || mode === "replace";
    if (mode === "replace"){
      // clear this profile's own data first (the profile switcher keeps other profiles intact)
      ["pf_history", "pf_journal_entries", "pf_last_code", "pf_suggestion_feedback"].forEach(k => { try{ ls.removeItem(k); } catch(e){} });
      Object.keys(F.store.KEYS).forEach(n => { if (n !== "meta") try{ ls.removeItem(F.store.KEYS[n]); } catch(e){} });
    }

    // history
    const curHist = fresh ? [] : (function(){ try{ return getFullTimeline(); } catch(e){ return []; } })();
    const have = new Set(curHist.map(histKey)); let addedH = 0;
    d.history.forEach(h => { if (!have.has(histKey(h))){ have.add(histKey(h)); curHist.push(h); addedH++; } });
    curHist.sort((a, b) => a.timestamp - b.timestamp);
    write("pf_history", curHist.slice(-(typeof TIMELINE_CAP !== "undefined" ? TIMELINE_CAP : 500)));
    report.added.history = addedH; report.skipped.history = d.history.length - addedH;

    // last code
    const newest = [...curHist].reverse().find(h => !h.legacy);
    const ownerCode = parsed.archive.owner.code && (function(){ const c = decodeCode(parsed.archive.owner.code); return c && !c.obsolete ? parsed.archive.owner.code : null; })();
    if (fresh || !ls.getItem("pf_last_code")){ const lc = (newest && newest.code) || ownerCode; if (lc) ls.setItem("pf_last_code", lc); }

    // journal
    const curJ = fresh ? [] : (function(){ try{ return getJournalEntries(); } catch(e){ return []; } })();
    const jIds = new Set(curJ.map(j => j.id)); let addedJ = 0;
    d.journal.forEach(j => { if (!jIds.has(j.id)){ jIds.add(j.id); curJ.push(j); addedJ++; } });
    write("pf_journal_entries", curJ.sort((a, b) => a.timestamp - b.timestamp).slice(-3650));
    report.added.journal = addedJ;

    // store-owned sections
    const sr = F.store.importAll({ checkins: d.checkIns, experiments: d.experiments, events: d.events, predictions: d.predictions, comparisons: d.comparisons, achievements: d.achievements }, "merge");
    Object.keys(sr.added).forEach(k => { report.added[k] = sr.added[k]; report.skipped[k] = sr.skipped[k]; });
    if (fresh) F.store.setSharePrefs(d.sharePrefs);

    // groups + suggestion feedback (device-wide / per-profile respectively)
    if (d.groups.length){ const cur = (function(){ try{ return getSavedGroups(); } catch(e){ return []; } })(); const ids = new Set(cur.map(g => g.id)); d.groups.forEach(g => { if (!ids.has(g.id)) cur.push(g); }); write(typeof GROUPS_KEY !== "undefined" ? GROUPS_KEY : "pf_groups", cur.slice(-50)); }
    if (d.suggestionFeedback.length && (fresh || !ls.getItem("pf_suggestion_feedback"))) write("pf_suggestion_feedback", d.suggestionFeedback);

    // profile record: fresh -> adopt; merge -> only fill what is empty
    if (d.profile && typeof saveLocalProfile === "function"){
      let prof = d.profile; const cur = fresh ? null : getLocalProfile();
      if (cur){ prof = Object.assign({}, cur); Object.keys(d.profile).forEach(k => { if (prof[k] == null || prof[k] === "" || prof[k] === undefined) prof[k] = d.profile[k]; }); }
      if (report.createdProfileId) prof.profileId = report.createdProfileId;
      else if (cur && cur.profileId) prof.profileId = cur.profileId;
      else delete prof.profileId;
      if (!prof.code) { const lc = ls.getItem("pf_last_code"); if (lc) prof.code = lc; }
      try{ saveLocalProfile(prof); } catch(e){ /* non-fatal */ }
    }
    if (opts.applySettings && d.settings){ if (d.settings.theme) ls.setItem("pf_theme", d.settings.theme); if (d.settings.sound) ls.setItem("pf_sound", d.settings.sound); }
    try{ F.store.ensure(); } catch(e){}
    return report;
  };
})(Forge);
if (typeof module !== "undefined" && module.exports) module.exports = Forge;
