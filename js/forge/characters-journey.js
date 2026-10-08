/* =========================================================================
   FORGE CHARACTERS - JOURNEY, "WHY NOT", CLUSTERS, FUTURES, RELATED WORLDS
   Extends the one character engine (js/forge/characters.js). Nothing here
   scores a character on its own: every number comes from C.matchOne (the
   same per-trait agreement model), the timeline's snapshots, the growth
   engine's trends/experiments, and the Atlas's own world scoring.

   WHAT EACH PIECE MEANS
   journey      your closest character at every saved assessment, recomputed
                from that assessment's saved scores with today's character
                data (so history stays comparable). A step between two
                assessments says WHICH of your trait changes moved the match,
                using the exact per-trait point shifts, never a guess.
   whyNot       for a nearby alternative: the traits you and both characters
                share, where they differ, and the per-trait point gap that put
                one ahead of the other (the gaps add up exactly to the lead).
   cluster      characters near this one in trait space, weighted toward the
                ones that also fit you, plus what connects them.
   futures      "what if" projections. A trend projection continues half of your
                measured pace for ~90 days; a lean-in projection assumes a modest
                shift in the traits a direction builds. Both are labelled as
                possibilities, never predictions.
   relatedWorlds worlds whose signature (the Atlas's own) rewards the traits that
                define this character.
   ========================================================================= */
(function(F){
  "use strict";
  const C = F.characters;
  if (!C) return;
  const clamp = F.clamp, r1 = x => Math.round(x * 10) / 10;
  const MOVE = 1.5;                         // a trait change (RAW points) worth narrating
  const DAMP = 0.5;                         // a trend projection continues half of the recent pace
  const HORIZON_DAYS = 90;
  const LEAN_SHIFT = 3;                     // assumed, modest shift for a "lean in" projection
  const stub = facets => ({ facets });
  const full = src => { const out = {}; F.FACET_KEYS.forEach(k => { const v = src ? src[k] : null; out[k] = typeof v === "number" && isFinite(v) ? clamp(v, -10, 10) : 0; }); return out; };
  const arrow = d => d > 0 ? "↑" : "↓";
  const phr = (facet, hi) => { const p = C.PHRASE[facet]; return p ? (hi ? p.more : p.less) : facet; };
  const lc = s => String(s).toLowerCase();

  /* ---------------- ranking from bare facets (no stored profile needed) ---------------- */
  C.rankFacets = function(facets){
    const f = full(facets);
    return C.roster().map(c => { const m = C.matchOne(stub(f), c); return { char: c, match: m, pct: m.pct, S: m.S }; })
      .sort((a, b) => b.S - a.S || (a.char.id < b.char.id ? -1 : 1));
  };
  const pointsMap = (facets, c) => { const m = C.matchOne(stub(full(facets)), c); const o = {}; m.parts.forEach(p => { o[p.facet] = p.points; }); return { map: o, raw: m.raw, pct: m.pct }; };

  /* How moving from one set of facets to another changes the lead of B over A (or B's own score when A is
     omitted), trait by trait. The row shifts add up EXACTLY to total, which is the change in raw score. */
  C.shift = function(fromFacets, toFacets, charB, charA){
    const f0 = full(fromFacets), f1 = full(toFacets);
    const b0 = pointsMap(f0, charB), b1 = pointsMap(f1, charB), a0 = charA ? pointsMap(f0, charA) : null, a1 = charA ? pointsMap(f1, charA) : null;
    let total = 0;
    const rows = F.FACET_KEYS.map(k => {
      const d = ((b1.map[k] || 0) - (b0.map[k] || 0)) - (charA ? ((a1.map[k] || 0) - (a0.map[k] || 0)) : 0);
      total += d;
      return { facet: k, label: F.facetLabel(k), shift: d, userDelta: r1(f1[k] - f0[k]) };
    }).sort((a, b) => Math.abs(b.shift) - Math.abs(a.shift));
    return { rows, total, check: (b1.raw - b0.raw) - (charA ? (a1.raw - a0.raw) : 0) };
  };

  /* Engine sentences are written to the person themselves ("your profile", "you tend to"). When the page shows
     someone else's profile, the same sentences are restated about them, so one wording source serves both. */
  C.speakAbout = function(text, name){
    const given = typeof name === "string" && name.trim();
    const n = given ? name.trim() : "this profile", N = given ? n : "This profile", Poss = N + "'s";
    return String(text == null ? "" : text)
      .replace(/Forge sees you as/g, `Forge sees ${n} as`)
      .replace(/\bYour profile\b/g, Poss + " profile")
      .replace(/\bYou (appear|tend)\b/g, (m, v) => `${N} ${v}s`)
      .replace(/\byou (appear|tend)\b/g, "they $1")
      .replace(/: you (-?\d)/g, `: ${n} $1`)
      .replace(/\byours\b/g, "theirs").replace(/\byourself\b/g, "themselves")
      .replace(/\bYour\b/g, Poss).replace(/\byour\b/g, "their")
      .replace(/\byou\b/g, "they");
  };

  /* =====================================================================
     1. JOURNEY
     ===================================================================== */
  C.snapshots = function(){
    try{ return F.timeline ? F.timeline.snapshots() : []; } catch(e){ return []; }
  };
  const _lists = typeof WeakMap !== "undefined" ? new WeakMap() : null;
  const listFor = snap => { if (_lists && _lists.has(snap)) return _lists.get(snap); const l = C.rankFacets(snap.facets); if (_lists) _lists.set(snap, l); return l; };
  const lite = x => ({ id: x.char.id, name: x.char.name, short: x.char.short, universe: x.char.universe, pct: x.pct });
  const pctOf = (list, id) => { const i = list.findIndex(x => x.char.id === id); return i < 0 ? null : { pct: list[i].pct, rank: i + 1 }; };

  function entryFor(snap){
    const list = listFor(snap);
    const top = list[0], second = list[1] || null;
    return { index: snap.index, ts: snap.timestamp, kind: snap.kind || "full", confidence: snap.confidence ? snap.confidence.overall : null,
      main: lite(top), runnerUp: second ? lite(second) : null, margin: second ? top.pct - second.pct : null, close: !!second && top.pct - second.pct <= 2 };
  }

  const PREFIX = {
    previous: { sub: "Your recent profile", moved: n => `moved closer to ${n.B} than to ${n.A}`, same: "Your recent profile" },
    first: { sub: "Compared with your first assessment, your profile", moved: n => `now sits closer to ${n.B} than to ${n.A}`, same: "Compared with your first assessment, your profile" },
    selected: { sub: "Compared with the assessment you picked, your profile", moved: n => `now sits closer to ${n.B} than to ${n.A}`, same: "Compared with the assessment you picked, your profile" },
  };

  /* mode: "previous" | "first" | "selected" (selectedIndex = the earlier assessment to compare with) */
  C.journeyCompare = function(snaps, toIndex, mode, selectedIndex){
    snaps = Array.isArray(snaps) ? snaps : C.snapshots();
    const to = snaps[toIndex];
    if (!to || !to.facets) return { ok: false, reason: "no assessment" };
    mode = PREFIX[mode] ? mode : "previous";
    const fromIndex = mode === "first" ? 0 : mode === "selected" ? selectedIndex : toIndex - 1;
    if (!Number.isInteger(fromIndex) || fromIndex < 0 || fromIndex >= toIndex || !snaps[fromIndex]) return { ok: false, reason: "no earlier assessment to compare with" };
    const from = snaps[fromIndex];
    const fe = entryFor(from), te = entryFor(to);
    const fl = listFor(from), tl = listFor(to);
    const A = C.byId(fe.main.id), B = C.byId(te.main.id);
    const moved = fe.main.id !== te.main.id;
    const pre = PREFIX[mode];

    const changes = F.FACET_KEYS.map(k => ({ facet: k, label: F.facetLabel(k), before: r1(from.facets[k]), after: r1(to.facets[k]), delta: r1(to.facets[k] - from.facets[k]) }))
      .filter(c => Math.abs(c.delta) >= MOVE).sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, 5);

    const sh = moved ? C.shift(from.facets, to.facets, B, A) : C.shift(from.facets, to.facets, A, null);
    const pctNow = { A: pctOf(tl, A.id), B: pctOf(tl, B.id) }, pctBefore = { A: pctOf(fl, A.id), B: pctOf(fl, B.id) };
    const pctChange = moved ? null : te.main.pct - fe.main.pct;
    const wantPositive = moved ? true : te.main.pct >= fe.main.pct;
    const drivers = sh.rows.filter(r => Math.abs(r.userDelta) >= 0.5 && (wantPositive ? r.shift >= 0.8 : r.shift <= -0.8))
      .sort((a, b) => wantPositive ? b.shift - a.shift : a.shift - b.shift).slice(0, 3)
      .map(r => ({ facet: r.facet, label: r.label, userDelta: r.userDelta, shift: r1(r.shift) }));
    const against = sh.rows.filter(r => Math.abs(r.userDelta) >= 0.5 && (wantPositive ? r.shift <= -0.8 : r.shift >= 0.8))
      .sort((a, b) => wantPositive ? a.shift - b.shift : b.shift - a.shift).slice(0, 1)
      .map(r => ({ facet: r.facet, label: r.label, userDelta: r.userDelta, shift: r1(r.shift) }));

    const nearTie = moved && Math.abs(pointsMap(from.facets, B).raw - pointsMap(from.facets, A).raw) < 4;
    let headline, detail;
    if (moved){
      headline = `${pre.sub} ${pre.moved({ A: A.name, B: B.name })}.`;
      detail = drivers.length
        ? `This appears to be driven by ${F.listJoin(drivers.map(d => `${lc(d.label)} ${arrow(d.userDelta)}`))}, which fit ${B.short}'s profile better than ${A.short}'s.`
        : `No single trait explains it: the two were already close, so several small shifts were enough to change the order.`;
    } else if (Math.abs(pctChange) < 2){
      headline = `${pre.same} still aligns most closely with ${A.name}, and the match is essentially unchanged (${fe.main.pct}% to ${te.main.pct}%).`;
      detail = changes.length ? `Forge did notice some trait movement (${F.listJoin(changes.slice(0, 3).map(c => `${lc(c.label)} ${arrow(c.delta)}`))}), but it didn't change how closely ${A.short} fits.` : `Forge didn't notice meaningful movement in your traits.`;
    } else {
      headline = `${pre.same} still aligns most closely with ${A.name}, and the match ${pctChange > 0 ? "grew" : "softened"} from ${fe.main.pct}% to ${te.main.pct}%.`;
      detail = drivers.length ? `This appears to be driven by ${F.listJoin(drivers.map(d => `${lc(d.label)} ${arrow(d.userDelta)}`))}, moving ${pctChange > 0 ? "closer to" : "further from"} ${A.short}'s profile.` : `It reflects several small shifts rather than one clear trait.`;
    }

    const caveats = [];
    if (F.timeline){
      try{ const wc = F.timeline.whatChanged(from, to, snaps.slice(0, fromIndex)); if (wc && wc.ok) wc.caveats.forEach(c => caveats.push(c)); } catch(e){ /* optional */ }
    } else if (from.kind === "targeted" || to.kind === "targeted") caveats.push("One of these reads was a targeted retake covering only some areas.");
    if ((fe.confidence != null && fe.confidence < 50) || (te.confidence != null && te.confidence < 50)) caveats.push("One of these reads had lower overall confidence, so treat the difference as tentative.");
    if (nearTie || (moved && (fe.close || te.close))) caveats.push("The two characters scored very close together, so a small change can flip their order.");
    caveats.push("Matches are recalculated from each assessment's saved scores with today's character data, so a past match may differ from what was shown then.");

    return { ok: true, mode, fromIndex, toIndex, from: fe, to: te, moved, pctChange, changes, drivers, against, headline, detail, caveats,
      crossing: [ { id: A.id, name: A.name, before: pctBefore.A && pctBefore.A.pct, after: pctNow.A && pctNow.A.pct }, moved ? { id: B.id, name: B.name, before: pctBefore.B && pctBefore.B.pct, after: pctNow.B && pctNow.B.pct } : null ].filter(Boolean),
      check: { total: sh.total, direct: sh.check } };
  };

  C.journey = function(opts){
    opts = opts || {};
    let snaps;
    try{ snaps = Array.isArray(opts.snaps) ? opts.snaps : C.snapshots(); } catch(e){ snaps = []; }
    snaps = snaps.filter(s => s && s.facets && s.ok !== false);
    if (!snaps.length) return { ok: false, reason: "no assessments", entries: [] };
    const entries = snaps.map(entryFor);
    entries.forEach((e, i) => {
      if (!i) return;
      const t = C.journeyCompare(snaps, i, "previous");
      e.step = t.ok ? { moved: t.moved, headline: t.headline, detail: t.detail, changes: t.changes, caveats: t.caveats, pctChange: t.pctChange, crossing: t.crossing } : null;
    });
    return { ok: true, entries, count: entries.length, switches: entries.filter(e => e.step && e.step.moved).length, snaps };
  };

  /* how one character's match to you has moved across assessments */
  C.characterHistory = function(charId, snaps){
    const c = C.byId(charId); if (!c) return [];
    snaps = Array.isArray(snaps) ? snaps : C.snapshots();
    return snaps.filter(s => s && s.facets).map(s => { const p = pctOf(listFor(s), c.id); return { index: s.index, ts: s.timestamp, pct: p ? p.pct : null, rank: p ? p.rank : null, kind: s.kind || "full" }; });
  };

  /* =====================================================================
     2. WHY NOT THIS CHARACTER?
     ===================================================================== */
  function pairDelta(profile, xe, ye){
    const X = xe.char, Y = ye.char;
    const px = pointsMap(profile.facets, X), py = pointsMap(profile.facets, Y);
    const keys = F.unique(Object.keys(X.traits).concat(Object.keys(Y.traits)));
    const rows = keys.map(k => ({ facet: k, label: F.facetLabel(k), diff: (px.map[k] || 0) - (py.map[k] || 0) })).sort((a, b) => b.diff - a.diff);
    const lead = px.raw - py.raw;
    const identical = JSON.stringify(Object.keys(X.traits).sort().map(k => [k, X.traits[k]])) === JSON.stringify(Object.keys(Y.traits).sort().map(k => [k, Y.traits[k]]));
    const shared = keys.filter(k => X.traits[k] != null && Y.traits[k] != null && Math.sign(X.traits[k]) === Math.sign(Y.traits[k]) && Math.min(Math.abs(X.traits[k]), Math.abs(Y.traits[k])) >= 3
        && C.agree(profile.facets[k], X.traits[k]) >= 0.35 && C.agree(profile.facets[k], Y.traits[k]) >= 0.35)
      .sort((a, b) => Math.min(Math.abs(Y.traits[b]), Math.abs(X.traits[b])) - Math.min(Math.abs(Y.traits[a]), Math.abs(X.traits[a]))).slice(0, 4)
      .map(k => ({ facet: k, label: F.facetLabel(k), line: phr(k, X.traits[k] > 0), you: F.round1(profile.facets[k]) }));
    const differ = keys.filter(k => X.traits[k] != null && Y.traits[k] != null && Math.abs(X.traits[k] - Y.traits[k]) >= 5)
      .sort((a, b) => Math.abs(Y.traits[b] - X.traits[b]) - Math.abs(Y.traits[a] - X.traits[a])).slice(0, 3)
      .map(k => { const d = X.traits[k] - Y.traits[k], big = Math.abs(d) >= 8, hiChar = d > 0 ? X : Y, loChar = d > 0 ? Y : X;
        return { facet: k, label: F.facetLabel(k), x: X.traits[k], y: Y.traits[k], text: `${hiChar.short} is ${big ? "considerably " : ""}more ${C.PHRASE[k].more} than ${loChar.short}.` }; });
    const youLean = ye.match.parts.filter(p => p.points < 0 && Math.abs(p.you - p.them) >= 3).sort((a, b) => a.points - b.points).slice(0, 2).map(p => {
      const d = p.you - p.them, big = Math.abs(d) >= 8, ph = C.PHRASE[p.facet];
      return { facet: p.facet, label: p.label, you: F.round1(p.you), them: p.them, text: d > 0 ? `Forge sees you as ${big ? "considerably" : "noticeably"} more ${ph.more} than ${Y.short}.` : `${Y.short} is ${big ? "considerably" : "noticeably"} more ${ph.more} than your answers suggest.` };
    });
    const favoursX = rows.filter(r => r.diff >= 1).slice(0, 3).map(r => ({ facet: r.facet, label: r.label, points: r1(r.diff) }));
    const favoursY = rows.filter(r => r.diff <= -1).sort((a, b) => a.diff - b.diff).slice(0, 2).map(r => ({ facet: r.facet, label: r.label, points: r1(-r.diff) }));
    let summary;
    if (identical) summary = `Forge holds the same traits for ${X.short} and ${Y.short}, so it cannot separate them; their order comes only from a tie-break.`;
    else if (Math.abs(lead) < 1) summary = `Forge sees ${X.short} and ${Y.short} as close to a tie for your profile.`;
    else if (lead > 0) summary = `Forge placed ${X.short} ahead of ${Y.short} by ${r1(lead)} points${favoursX.length ? `, mostly on ${F.listJoin(favoursX.map(f => lc(f.label)))}` : ", without one trait standing out"}.`;
    else summary = `Forge ranked ${Y.short} ahead of ${X.short} by ${r1(-lead)} points${favoursY.length ? `, mostly on ${F.listJoin(favoursY.map(f => lc(f.label)))}` : ", without one trait standing out"}.`;
    return { lead, rows, shared, differ, youLean, favoursX, favoursY, identical, summary };
  }

  C.whyNot = function(input, charId, opts){
    opts = opts || {};
    const profile = C.profileFrom(input);
    if (!profile.ok) return { ok: false, reason: profile.errors && profile.errors[0] || "no profile" };
    const X = C.byId(charId);
    if (!X) return { ok: false, reason: "unknown character", notFound: true };
    const list = C.rank(profile);
    const xi = list.findIndex(e => e.char.id === X.id), xe = list[xi];
    let pool = xi <= 3 ? list.slice(0, 4).filter(e => e.char.id !== X.id) : list.slice(0, 3);   // the real contenders for "why not"
    pool = pool.slice(0, Math.max(1, Math.min(3, opts.n || 3)));
    const alternatives = pool.map(ye => {
      const d = pairDelta(profile, xe, ye), rank = list.findIndex(e => e.char.id === ye.char.id) + 1;
      return Object.assign({ id: ye.char.id, name: ye.char.name, short: ye.char.short, universe: ye.char.universe, role: ye.char.role, pct: ye.pct, rank, relation: rank < xi + 1 ? "above" : "below",
        lead: r1(d.lead), identical: d.identical, summary: d.summary, shared: d.shared, differ: d.differ, youLean: d.youLean, favoursX: d.favoursX, favoursY: d.favoursY,
        check: { sum: d.rows.reduce((s, r) => s + r.diff, 0), lead: d.lead } });
    });
    return { ok: true, base: { id: X.id, name: X.name, short: X.short, pct: xe.pct, rank: xi + 1 }, alternatives,
      note: "Every statement here comes from the per-trait points behind the match. Nothing is inferred beyond them." };
  };

  /* =====================================================================
     3. CLUSTERS
     ===================================================================== */
  C.traitSimilarity = function(a, b){
    const ab = C.matchOne(stub(full(a.traits)), b).raw, ba = C.matchOne(stub(full(b.traits)), a).raw;
    return clamp(Math.round((ab + ba) / 2), 0, 100);
  };

  C.cluster = function(input, charId, opts){
    opts = opts || {};
    const X = C.byId(charId);
    if (!X) return { ok: false, reason: "unknown character", notFound: true };
    const profile = input ? C.profileFrom(input) : null;
    const hasProfile = !!(profile && profile.ok);
    const list = hasProfile ? C.rank(profile) : [];
    const userPct = id => { const e = list.find(x => x.char.id === id); return e ? e.pct : null; };
    const cands = C.roster().filter(c => c.id !== X.id).map(c => {
      const sim = C.traitSimilarity(X, c), up = hasProfile ? userPct(c.id) : null;
      return { char: c, similarity: sim, userPct: up, combined: hasProfile ? 0.5 * sim + 0.5 * (up || 0) : sim };
    }).filter(m => m.similarity >= 35).sort((a, b) => b.combined - a.combined || (a.char.id < b.char.id ? -1 : 1)).slice(0, Math.max(1, Math.min(4, opts.n || 3)));
    const members = cands.map(m => ({ id: m.char.id, name: m.char.name, short: m.char.short, universe: m.char.universe, role: m.char.role, similarity: m.similarity, userPct: m.userPct, combined: Math.round(m.combined) }));

    // what connects them: traits all (or most) of the group define the same way
    let connects = { kind: "none", facets: [], text: members.length ? `${X.short} and these characters overlap in a few traits, but Forge doesn't find one clear common thread.` : `Forge doesn't hold a close neighbour for ${X.short}.` };
    if (members.length){
      const group = [X].concat(cands.map(m => m.char));
      const stat = Object.keys(X.traits).filter(k => Math.abs(X.traits[k]) >= 3).map(k => {
        const agreeing = group.filter(g => g.traits[k] != null && Math.sign(g.traits[k]) === Math.sign(X.traits[k]) && Math.abs(g.traits[k]) >= 3);
        return { facet: k, count: agreeing.length, strength: Math.min.apply(null, agreeing.map(g => Math.abs(g.traits[k]))) };
      });
      const all = stat.filter(s => s.count === group.length).sort((a, b) => b.strength - a.strength);
      const most = stat.filter(s => s.count >= Math.ceil(group.length / 2) && s.count < group.length).sort((a, b) => b.count - a.count || b.strength - a.strength);
      const chosen = (all.length ? all : most).slice(0, 3);
      if (chosen.length){
        const kind = all.length ? "all" : "most";
        const lines = chosen.map(s => C.PHRASE[s.facet][X.traits[s.facet] > 0 ? "charHi" : "charLo"]);
        connects = { kind, facets: chosen.map(s => ({ facet: s.facet, label: F.facetLabel(s.facet), line: C.PHRASE[s.facet][X.traits[s.facet] > 0 ? "charHi" : "charLo"], count: s.count })),
          text: `${kind === "all" ? "What they all share" : "What most of them share"}: ${F.listJoin(lines)}.` };
      }
    }

    // what makes the anchor the strongest match for THIS profile (honest if it isn't)
    let whyStrongest = { available: false, text: hasProfile ? "" : "Take the assessment to see how this group compares for your profile.", rows: [], anchorIsTop: null };
    if (hasProfile && members.length){
      const xe = list.find(e => e.char.id === X.id);
      const group = [{ char: X, pct: xe.pct, match: xe.match }].concat(cands.map(m => ({ char: m.char, pct: m.userPct, match: list.find(e => e.char.id === m.char.id).match })));
      const top = group.slice().sort((a, b) => b.match.S - a.match.S)[0];
      const anchorIsTop = top.char.id === X.id;
      const others = group.filter(g => g.char.id !== X.id);
      const avg = k => F.mean(others.map(o => { const p = o.match.parts.find(q => q.facet === k); return p ? p.points : 0; }));
      const rows = xe.match.parts.map(p => ({ facet: p.facet, label: p.label, you: p.you, edge: p.points - avg(p.facet) })).filter(r => r.edge >= 1).sort((a, b) => b.edge - a.edge).slice(0, 3);
      const phrases = rows.map(r => C.PHRASE[r.facet][r.you >= 0 ? "userHi" : "userLo"]);
      if (anchorIsTop) whyStrongest = { available: true, anchorIsTop, rows: rows.map(r => ({ facet: r.facet, label: r.label, edge: r1(r.edge) })),
        text: rows.length ? `${X.short} fits your ${F.listJoin(phrases)} more closely than ${F.listJoin(others.map(o => o.char.short))} do.` : `${X.short} edges out the others for your profile, without one trait standing out.` };
      else whyStrongest = { available: true, anchorIsTop, rows: rows.map(r => ({ facet: r.facet, label: r.label, edge: r1(r.edge) })),
        text: `Within this group, ${top.char.short} fits your profile slightly better (${top.pct}% against ${xe.pct}%). ${X.short} is shown because of the traits it shares with them, not because it is your strongest match here.` };
    }
    return { ok: true, anchor: { id: X.id, name: X.name, short: X.short, universe: X.universe, pct: hasProfile ? userPct(X.id) : null }, members, connects, whyStrongest, hasProfile,
      method: "Neighbours are ranked half by how closely their defining traits resemble the character's, and half by how well they fit your profile." };
  };

  /* =====================================================================
     4. POSSIBLE FUTURE MATCHES (projections, always labelled)
     ===================================================================== */
  C.DIRECTIONS = [
    { key: "creative", label: "Creative exploration", shifts: { explore: LEAN_SHIFT, invent: LEAN_SHIFT } },
    { key: "leadership", label: "Leadership", shifts: { initiative: LEAN_SHIFT, boldness: 2 } },
    { key: "calm", label: "Calm under pressure", shifts: { steadiness: LEAN_SHIFT, patience: 2 } },
    { key: "connection", label: "Connecting with people", shifts: { warmth: LEAN_SHIFT, social: 2 } },
    { key: "structure", label: "Structure and follow-through", shifts: { structure: LEAN_SHIFT, persist: 2 } },
  ];

  function activeExperiments(){
    try{ return F.growth && F.store ? F.growth.active() : []; } catch(e){ return []; }
  }

  C.futures = function(input, opts){
    opts = opts || {};
    const profile = C.profileFrom(input);
    if (!profile.ok) return { ok: false, reason: profile.errors && profile.errors[0] || "no profile" };
    const list = C.rank(profile), cur = list[0];
    let snaps; try{ snaps = Array.isArray(opts.snaps) ? opts.snaps : C.snapshots(); } catch(e){ snaps = []; }
    const pctNow = id => (list.find(x => x.char.id === id) || {}).pct;

    // ---- trend projection
    let trend = { available: false, reason: "Forge needs at least three assessments spread over a month before it will project a trend." };
    let tr = null; try{ tr = F.timeline ? F.timeline.trends(snaps) : null; } catch(e){ tr = null; }
    if (tr){
      const moving = tr.filter(t => Math.abs(t.per90) >= 1);
      const basis = { assessments: snaps.length, spanDays: F.daysBetween(snaps[0].timestamp, snaps[snaps.length - 1].timestamp) };
      if (!moving.length) trend = { available: true, steady: true, basis, text: "Your profile has been steady across your assessments, so continuing as you are would most likely keep your closest characters the same." };
      else {
        const projected = full(profile.facets);
        moving.forEach(t => { projected[t.facet] = clamp(projected[t.facet] + t.per90 * DAMP, -10, 10); });
        const pl = C.rankFacets(projected), top = pl[0], changed = top.char.id !== cur.char.id;
        const sh = C.shift(profile.facets, projected, top.char, changed ? cur.char : null);
        const drivers = sh.rows.filter(r => Math.abs(r.userDelta) >= 0.5 && r.shift >= 0.8).slice(0, 3).map(r => ({ facet: r.facet, label: r.label, userDelta: r.userDelta, shift: r1(r.shift) }));
        const closer = pl.slice(0, 6).map(x => ({ x, gain: x.pct - (pctNow(x.char.id) || 0) })).sort((a, b) => b.gain - a.gain)[0];
        trend = { available: true, steady: false, basis, assumption: `Forge continues half of your recent pace for about ${HORIZON_DAYS} days.`,
          moves: moving.slice(0, 4).map(t => ({ facet: t.facet, label: t.label, per90: t.per90, direction: t.direction })),
          projectedTop: { id: top.char.id, name: top.char.name, short: top.char.short, pct: top.pct, currentPct: pctNow(top.char.id), changed },
          closer: closer && closer.gain >= 2 ? { id: closer.x.char.id, name: closer.x.char.name, gain: closer.gain, pct: closer.x.pct } : null, drivers,
          text: changed
            ? `If your recent trends continue, your profile could move closer to ${top.char.name} (${pctNow(top.char.id)}% to ${top.pct}%)${drivers.length ? `, helped by ${F.listJoin(drivers.map(d => `${lc(d.label)} ${arrow(d.userDelta)}`))}` : ""}.`
            : `If your recent trends continue, ${cur.char.name} would most likely remain your closest match (${cur.pct}% to ${top.pct}%).` };
      }
    }

    // ---- "if you leaned more into ..."
    const active = activeExperiments();
    const dirs = C.DIRECTIONS.map(d => {
      const keys = Object.keys(d.shifts);
      const mine = active.filter(e => d.shifts[e.facet]);
      return { d, mine, room: -F.mean(keys.map(k => profile.facets[k])) };
    }).sort((a, b) => (b.mine.length ? 100 : 0) + b.room - ((a.mine.length ? 100 : 0) + a.room)).slice(0, Math.max(1, opts.directions || 3));
    const leanings = dirs.map(({ d, mine }) => {
      const projected = full(profile.facets);
      const applied = Object.keys(d.shifts).map(k => { const before = projected[k]; projected[k] = clamp(before + d.shifts[k], -10, 10); return { facet: k, label: F.facetLabel(k), from: r1(before), to: r1(projected[k]) }; }).filter(a => a.to !== a.from);
      const pl = C.rankFacets(projected), top = pl[0], changed = top.char.id !== cur.char.id;
      const gain = pl.slice(0, 6).map(x => ({ x, gain: x.pct - (pctNow(x.char.id) || 0) })).sort((a, b) => b.gain - a.gain)[0];
      const closer = gain && gain.gain >= 2 ? { id: gain.x.char.id, name: gain.x.char.name, short: gain.x.char.short, before: pctNow(gain.x.char.id), after: gain.x.pct } : null;
      return { key: d.key, label: d.label, assumed: applied, experiments: mine.map(e => e.title || e.key), closer, topChanges: changed, top: { id: top.char.id, name: top.char.name, pct: top.pct },
        text: !applied.length ? `You already sit near the top of the scale on these traits, so leaning further into ${lc(d.label)} wouldn't change your matches.`
          : closer ? `If you leaned more into ${lc(d.label)} (an assumed shift in ${F.listJoin(applied.map(a => lc(a.label)))}), you could move closer to ${closer.name} (${closer.before}% to ${closer.after}%)${changed ? `, who would become your closest match` : ""}.`
          : `Leaning more into ${lc(d.label)} (an assumed shift in ${F.listJoin(applied.map(a => lc(a.label)))}) wouldn't noticeably change your closest characters.` };
    });
    return { ok: true, kind: "possibility", trend, leanings,
      disclaimer: "These are what-if projections from your own history and a modest assumed shift. They are possibilities, not predictions: people change in ways no model can foresee." };
  };

  /* =====================================================================
     5. RELATED WORLDS (the Atlas's own scoring, fed with the character's traits)
     ===================================================================== */
  C.impliedDims = function(c){
    const acc = {}, ws = {};
    Object.keys(c.traits).forEach(k => { const fw = F.FACETS[k] && F.FACETS[k].w; if (!fw) return; Object.keys(fw).forEach(d => { acc[d] = (acc[d] || 0) + c.traits[k] * fw[d]; ws[d] = (ws[d] || 0) + fw[d]; }); });
    const out = {}; Object.keys(acc).forEach(d => { out[d] = clamp(acc[d] / ws[d], -10, 10); });
    return out;
  };

  C.relatedWorlds = function(charId, input){
    const c = C.byId(charId);
    if (!c) return { ok: false, reason: "unknown character", notFound: true };
    const sameUniverse = C.roster().filter(x => x.universe === c.universe && x.id !== c.id).map(x => ({ id: x.id, name: x.name, role: x.role }));
    if (typeof ATLAS_ENTITIES === "undefined" || typeof scoreAtlasEntity !== "function") return { ok: true, sameUniverse, ownWorlds: [], worlds: [], available: false };
    const dims = C.impliedDims(c);
    const profile = input ? C.profileFrom(input) : null;
    const rate = w => {
      const score = scoreAtlasEntity(w, dims);
      const contributions = w.signature.map(s => ({ dim: s.dim, label: F.dimLabel(s.dim), est: dims[s.dim] || 0, points: (dims[s.dim] || 0) * s.w / w._sigMagnitude })).sort((a, b) => b.points - a.points);
      const reasons = contributions.filter(x => x.points > 0.3).slice(0, 2);
      const fromFacet = d => { const k = Object.keys(c.traits).filter(f => F.FACETS[f].w[d] && c.traits[f] > 0).sort((a, b) => c.traits[b] * F.FACETS[b].w[d] - c.traits[a] * F.FACETS[a].w[d])[0]; return k ? F.facetLabel(k) : null; };
      return { name: w.name, source: w.source, role: w.role, energy: w.energy, score: r1(score), reasons: reasons.map(x => ({ dim: x.dim, label: x.label, points: r1(x.points), fromTrait: fromFacet(x.dim) })),
        userFit: profile && profile.ok ? r1(scoreAtlasEntity(w, profile.dims)) : null,
        text: reasons.length ? `${w.name} rewards ${F.listJoin(reasons.map(x => lc(x.label)))}, which run through ${c.short}'s profile.` : `${w.name} doesn't strongly reward the traits Forge holds for ${c.short}.` };
    };
    const worlds = ATLAS_ENTITIES.filter(e => e.category === "World").map(rate);
    const ownWorlds = worlds.filter(w => w.source === c.universe).sort((a, b) => b.score - a.score);
    const seen = new Set(); const other = [];
    worlds.filter(w => w.source !== c.universe && w.score >= 2).sort((a, b) => b.score - a.score || (a.name < b.name ? -1 : 1)).forEach(w => { if (other.length < 3 && !seen.has(w.source)) { seen.add(w.source); other.push(w); } });
    return { ok: true, available: true, sameUniverse, ownWorlds, worlds: other,
      method: `Each world's signature (the same one the Atlas uses) is scored against the traits Forge holds for ${c.short}. Traits Forge has no data for count as neutral.` };
  };
})(Forge);
if (typeof module !== "undefined" && module.exports) module.exports = Forge;
