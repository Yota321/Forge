/* =========================================================================
   FORGE STORE - per-profile persistence for everything beyond the profile
   code + timeline that engine.js already owns: check-ins, growth
   experiments, life events, compare predictions, comparison history,
   achievements and share preferences.

   - Every key is registered in engine.js's PROFILE_SCOPED_KEYS, so the
     existing multi-profile switcher snapshots/restores them with the rest
     of a profile's data, with no change to that mechanism.
   - Every read is tolerant (corrupt JSON, wrong types, missing fields) and
     every write goes through a sanitizer: storage is treated as untrusted,
     because imports and old app versions both write to it.
   - A schemaVersion + ordered migrations (see MIGRATIONS) keep old data
     loading in newer versions. Data written by a NEWER app is read, never
     rewritten downward.
   ========================================================================= */
(function(F){
  "use strict";
  const S = F.store = {};
  S.SCHEMA_VERSION = 1;
  S.KEYS = {
    checkins: "pf_checkins", experiments: "pf_experiments", events: "pf_events", predictions: "pf_predictions",
    comparisons: "pf_comparisons", achievements: "pf_achievements", sharePrefs: "pf_share_prefs", meta: "pf_forge_meta",
  };
  S.CAPS = { checkins: 400, experiments: 200, events: 500, predictions: 200, comparisons: 150 };

  // Make the existing profile switcher carry these keys along.
  try{
    if (typeof PROFILE_SCOPED_KEYS !== "undefined"){
      Object.values(S.KEYS).forEach(k => { if (!PROFILE_SCOPED_KEYS.includes(k)) PROFILE_SCOPED_KEYS.push(k); });
    }
  } catch(e){ /* engine not loaded: only happens in isolated tests */ }

  const store = () => { try{ return localStorage; } catch(e){ return null; } };
  const isObj = v => v && typeof v === "object" && !Array.isArray(v);
  const num = F.num;
  const ts = v => (typeof v === "number" && isFinite(v) && v > 0 && v < 4102444800000) ? Math.round(v) : null;   // before 2100
  const likert = v => { const n = Math.round(num(v, NaN)); return n >= 1 && n <= 5 ? n : null; };
  const pct = v => Math.round(F.clamp(num(v, 0), 0, 100));

  /* ---------------- sanitizers (one per record type) ---------------- */
  S.sanitize = {
    checkin(r){
      if (!isObj(r) || !ts(r.ts)) return null;
      const answers = {};
      if (isObj(r.answers)) Object.keys(r.answers).slice(0, 12).forEach(k => { const v = likert(r.answers[k]); if (v && /^[a-z]{2,20}$/.test(k)) answers[k] = v; });
      const state = {};
      if (isObj(r.state)) ["energy", "stress", "social", "motivation", "control", "decisions"].forEach(k => { if (typeof r.state[k] === "number") state[k] = pct(r.state[k]); });
      if (!Object.keys(state).length) return null;
      return { id: F.isSafeId(r.id) ? r.id : F.id("ci"), ts: ts(r.ts), answers, state, variant: Math.round(F.clamp(num(r.variant, 0), 0, 9)),
        note: F.capText(r.note, 300), journalId: F.isSafeId(r.journalId) ? r.journalId : null };
    },
    experiment(r){
      if (!isObj(r) || !ts(r.startedTs) || !F.isSafeId(r.key || "")) return null;
      const status = ["active", "completed", "abandoned"].includes(r.status) ? r.status : "active";
      const outcome = ["yes", "no", "unsure"].includes(r.outcome) ? r.outcome : null;
      return { id: F.isSafeId(r.id) ? r.id : F.id("ex"), key: r.key, title: F.capText(r.title, 120), startedTs: ts(r.startedTs),
        durationDays: Math.round(F.clamp(num(r.durationDays, 7), 1, 60)), status, outcome, outcomeTs: ts(r.outcomeTs), note: F.capText(r.note, 300),
        facet: (F.FACETS[r.facet] ? r.facet : null) };
    },
    event(r){
      if (!isObj(r) || !ts(r.ts)) return null;
      const text = F.capText(typeof r.text === "string" ? r.text.trim() : "", 280);
      if (!text) return null;
      const snap = isObj(r.snapshot) ? { code: F.capText(r.snapshot.code, 120) || null, snapshotTs: ts(r.snapshot.snapshotTs) } : null;
      const st = isObj(r.stateAtEvent) ? (function(){ const o = {}; ["energy", "stress", "social", "motivation", "control", "decisions"].forEach(k => { if (typeof r.stateAtEvent[k] === "number") o[k] = pct(r.stateAtEvent[k]); }); return o; })() : null;
      return { id: F.isSafeId(r.id) ? r.id : F.id("ev"), ts: ts(r.ts), text, kind: ["life", "work", "relationship", "health", "learning", "other"].includes(r.kind) ? r.kind : "other",
        snapshot: snap, stateAtEvent: st && Object.keys(st).length ? st : null, journalId: F.isSafeId(r.journalId) ? r.journalId : null,
        // The user's OWN interpretation, only ever shown as theirs (never presented as a Forge finding).
        userInterpretation: F.capText(r.userInterpretation, 300) };
    },
    prediction(r){
      if (!isObj(r) || !ts(r.ts)) return null;
      const MODES = ["first-contact", "bond", "friendship"];
      const CHOICES = ["agree", "complement", "clash", "similar", "understand", "hard-comm"];
      if (!MODES.includes(r.mode) || !CHOICES.includes(r.choice)) return null;
      return { id: F.isSafeId(r.id) ? r.id : F.id("pr"), ts: ts(r.ts), mode: r.mode, choice: r.choice, pairKey: F.capText(r.pairKey, 40),
        otherName: F.capText(r.otherName, 40), observed: isObj(r.observed) ? { shape: F.capText(r.observed.shape, 40), matched: !!r.observed.matched, note: F.capText(r.observed.note, 200) } : null };
    },
    comparison(r){
      if (!isObj(r) || !ts(r.ts)) return null;
      const MODES = ["first-contact", "bond", "friendship", "party"];
      if (!MODES.includes(r.mode)) return null;
      const names = Array.isArray(r.names) ? r.names.slice(0, 8).map(n => F.capText(String(n), 40)) : [];
      const codes = Array.isArray(r.codes) ? r.codes.slice(0, 8).map(c => F.capText(String(c), 120)) : [];
      return { id: F.isSafeId(r.id) ? r.id : F.id("cm"), ts: ts(r.ts), mode: r.mode, names, codes, scenarioCount: Math.round(F.clamp(num(r.scenarioCount, 0), 0, 50)) };
    },
    achievements(r){
      const out = { unlocked: {}, marks: {}, counters: {} };
      if (isObj(r) && isObj(r.marks)) Object.keys(r.marks).slice(0, 40).forEach(k => { if (/^[a-z0-9-]{2,30}$/.test(k) && ts(r.marks[k])) out.marks[k] = ts(r.marks[k]); });
      if (isObj(r) && isObj(r.counters)) Object.keys(r.counters).slice(0, 40).forEach(k => { if (/^[a-z0-9-]{2,30}$/.test(k)) out.counters[k] = Math.round(F.clamp(num(r.counters[k], 0), 0, 1000000)); });
      if (isObj(r) && isObj(r.unlocked)) Object.keys(r.unlocked).slice(0, 80).forEach(k => {
        if (/^[a-z0-9-]{2,40}$/.test(k) && ts(r.unlocked[k] && r.unlocked[k].ts)) out.unlocked[k] = { ts: ts(r.unlocked[k].ts), evidence: F.capText(r.unlocked[k].evidence, 200) };
      });
      return out;
    },
    sharePrefs(r){
      const d = { name: true, archetype: true, traits: true, communication: true, work: true, world: true, manual: false };
      const o = Object.assign({}, d);
      if (isObj(r)) Object.keys(d).forEach(k => { if (typeof r[k] === "boolean") o[k] = r[k]; });
      return o;
    },
  };
  const SANITIZER_FOR = { checkins: "checkin", experiments: "experiment", events: "event", predictions: "prediction", comparisons: "comparison" };

  /* ---------------- raw read/write ---------------- */
  function rawRead(key){
    const s = store(); if (!s) return null;
    try{ return F.safeJSON(s.getItem(key), null); } catch(e){ return null; }
  }
  function rawWrite(key, value){
    const s = store(); if (!s) return false;
    try{ s.setItem(key, JSON.stringify(value)); return true; } catch(e){ return false; }   // quota/blocked: callers carry on in memory
  }

  S.list = function(name){
    const key = S.KEYS[name]; if (!key) return [];
    const raw = rawRead(key);
    if (!Array.isArray(raw)) return [];
    const san = S.sanitize[SANITIZER_FOR[name]];
    const out = [];
    const seen = new Set();
    raw.forEach(r => { const c = san ? san(r) : r; if (c && !seen.has(c.id)){ seen.add(c.id); out.push(c); } });
    return out.sort((a, b) => (a.ts || a.startedTs || 0) - (b.ts || b.startedTs || 0));
  };
  S.save = function(name, list){
    const cap = S.CAPS[name] || 1000;
    const trimmed = list.slice(-cap);
    return rawWrite(S.KEYS[name], trimmed);
  };
  S.add = function(name, record){
    const san = S.sanitize[SANITIZER_FOR[name]];
    const clean = san ? san(record) : null;
    if (!clean) return null;
    const list = S.list(name);
    const i = list.findIndex(r => r.id === clean.id);
    if (i >= 0) list[i] = clean; else list.push(clean);
    S.save(name, list.sort((a, b) => (a.ts || a.startedTs || 0) - (b.ts || b.startedTs || 0)));
    return clean;
  };
  S.update = function(name, id, patch){
    const list = S.list(name);
    const i = list.findIndex(r => r.id === id);
    if (i < 0) return null;
    const san = S.sanitize[SANITIZER_FOR[name]];
    const clean = san(Object.assign({}, list[i], patch, { id }));
    if (!clean) return null;
    list[i] = clean; S.save(name, list);
    return clean;
  };
  S.remove = function(name, id){
    const list = S.list(name); const next = list.filter(r => r.id !== id);
    if (next.length === list.length) return false;
    S.save(name, next); return true;
  };
  S.clear = function(name){ const s = store(); if (s) try{ s.removeItem(S.KEYS[name]); } catch(e){} };

  S.getAchievements = function(){ return S.sanitize.achievements(rawRead(S.KEYS.achievements)); };
  S.setAchievements = function(a){ return rawWrite(S.KEYS.achievements, S.sanitize.achievements(a)); };
  /* Lightweight usage facts (first time something happened / how many times). */
  S.mark = function(name, now){ const a = S.getAchievements(); if (!a.marks[name]){ a.marks[name] = now || Date.now(); S.setAchievements(a); return true; } return false; };
  S.bump = function(name, by){ const a = S.getAchievements(); a.counters[name] = (a.counters[name] || 0) + (by || 1); S.setAchievements(a); return a.counters[name]; };
  S.getSharePrefs = function(){ return S.sanitize.sharePrefs(rawRead(S.KEYS.sharePrefs)); };
  S.setSharePrefs = function(p){ return rawWrite(S.KEYS.sharePrefs, S.sanitize.sharePrefs(p)); };

  /* ---------------- meta + migrations ---------------- */
  // Ordered, idempotent steps. Add a new entry (never edit a shipped one) when
  // the shape of any record above changes.
  const MIGRATIONS = {
    1: function(){
      // First Forge-model version: re-save every list through its sanitizer so
      // whatever earlier/hand-edited data exists is brought to a valid shape.
      Object.keys(SANITIZER_FOR).forEach(name => { const raw = rawRead(S.KEYS[name]); if (raw !== null) S.save(name, S.list(name)); });
    },
  };
  S.registerMigration = function(version, fn){ if (!MIGRATIONS[version]) MIGRATIONS[version] = fn; };
  S.getMeta = function(){
    const m = rawRead(S.KEYS.meta);
    return isObj(m) ? { schemaVersion: Math.max(0, Math.round(num(m.schemaVersion, 0))), applied: Array.isArray(m.applied) ? m.applied.filter(n => typeof n === "number").slice(-50) : [], lastMigratedAt: ts(m.lastMigratedAt) }
      : { schemaVersion: 0, applied: [], lastMigratedAt: null };
  };
  S.ensure = function(){
    const meta = S.getMeta();
    if (meta.schemaVersion > S.SCHEMA_VERSION) return { migrated: false, newerThanApp: true, from: meta.schemaVersion, to: meta.schemaVersion };
    let v = meta.schemaVersion, ran = [];
    while (v < S.SCHEMA_VERSION){
      v++;
      try{ if (MIGRATIONS[v]) MIGRATIONS[v](); ran.push(v); } catch(e){ return { migrated: false, error: String(e && e.message || e), from: meta.schemaVersion, to: v - 1 }; }
    }
    if (ran.length) rawWrite(S.KEYS.meta, { schemaVersion: v, applied: meta.applied.concat(ran), lastMigratedAt: Date.now() });
    return { migrated: ran.length > 0, from: meta.schemaVersion, to: v };
  };

  /* ---------------- whole-store export/import (used by .forge) ---------------- */
  S.exportAll = function(){
    const out = {};
    Object.keys(SANITIZER_FOR).forEach(n => { out[n] = S.list(n); });
    out.achievements = S.getAchievements();
    out.sharePrefs = S.getSharePrefs();
    return out;
  };
  /* mode "merge": union by id, existing local data wins on id collision.
     Returns counts so the UI can say exactly what happened. */
  S.importAll = function(data, mode){
    const report = { added: {}, skipped: {}, invalid: {} };
    if (!isObj(data)) return report;
    Object.keys(SANITIZER_FOR).forEach(name => {
      const incoming = Array.isArray(data[name]) ? data[name] : [];
      const san = S.sanitize[SANITIZER_FOR[name]];
      const have = mode === "replace" ? [] : S.list(name);
      const ids = new Set(have.map(r => r.id));
      let added = 0, skipped = 0, invalid = 0;
      incoming.slice(0, (S.CAPS[name] || 1000) * 2).forEach(r => {
        const c = san(r);
        if (!c){ invalid++; return; }
        if (ids.has(c.id)){ skipped++; return; }
        ids.add(c.id); have.push(c); added++;
      });
      S.save(name, have.sort((a, b) => (a.ts || a.startedTs || 0) - (b.ts || b.startedTs || 0)));
      report.added[name] = added; report.skipped[name] = skipped; report.invalid[name] = invalid;
    });
    if (isObj(data.achievements)){
      const cur = mode === "replace" ? { unlocked: {}, marks: {}, counters: {} } : S.getAchievements();
      const inc = S.sanitize.achievements(data.achievements);
      Object.keys(inc.unlocked).forEach(k => { if (!cur.unlocked[k] || inc.unlocked[k].ts < cur.unlocked[k].ts) cur.unlocked[k] = inc.unlocked[k]; });
      Object.keys(inc.marks).forEach(k => { if (!cur.marks[k] || inc.marks[k] < cur.marks[k]) cur.marks[k] = inc.marks[k]; });
      Object.keys(inc.counters).forEach(k => { cur.counters[k] = Math.max(cur.counters[k] || 0, inc.counters[k]); });
      S.setAchievements(cur);
    }
    if (isObj(data.sharePrefs) && mode === "replace") S.setSharePrefs(data.sharePrefs);
    return report;
  };
})(Forge);
if (typeof module !== "undefined" && module.exports) module.exports = Forge;
