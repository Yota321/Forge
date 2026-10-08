/* =========================================================================
   FORGE EXPERIENCE ENGINE - turns existing personality data into stories.

   It adds NO scoring of its own. Everything is read from what Forge already measures:
     - the 17 behavioural facets (core.js) of each person, and
     - for pairs, the compatibility categories the existing engine already computed
       (computeDeepCompatibility), so Friendship / Romance / Everyday are three LENSES on
       the same compatibility result, never three different scores.
   What it decides is only WHICH authored line to show, by comparing those numbers with the
   thresholds and weights written in the packs (js/forge/pack-lenses.js, pack-party.js).
   Everything those packs describe is data: add an entry, get a new scenario, universe, team,
   story, role or lens. No franchise is mentioned anywhere in this file.

   Names passed in must already be HTML-safe (the Compare/Party pages escape them once at the
   source); returned text is meant to be inserted as HTML.
   ========================================================================= */
(function(F){
  "use strict";
  const P = () => F.packs;
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const mean = a => a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0;
  const sd = a => { const m = mean(a); return Math.sqrt(mean(a.map(x => (x - m) * (x - m)))); };
  const fill = (t, m) => String(t == null ? "" : t).replace(/\{(\w+)\}/g, (_, k) => (m[k] != null ? m[k] : ""));
  const facetsOf = p => (p && p.facets) ? p.facets : F.computeFacets((p && p.normDims) || {});
  const wsum = w => Object.keys(w || {}).reduce((s, k) => s + Math.abs(w[k]), 0) || 1;
  /* weighted facet score on the facets' own -10..10 scale */
  const fscore = (w, f) => Object.keys(w || {}).reduce((s, k) => s + w[k] * (f[k] || 0), 0) / wsum(w);
  const list = a => a.length > 1 ? a.slice(0, -1).join(", ") + " and " + a[a.length - 1] : (a[0] || "");
  const lc = s => String(s).toLowerCase();
  const E = F.experience = {};

  /* ---------------------------------------------------------------- pair lenses */
  const band3 = s => s >= 72 ? "high" : s >= 48 ? "mid" : "low";
  const meter = s => clamp(Math.ceil(s / 20), 1, 5);

  /* Best of a list of entries scored against two people (roles: person A plays role 0, B role 1, or swapped). */
  function bestDuo(entries, fa, fb){
    let best = null;
    entries.forEach(e => {
      const [r0, r1] = e.roles;
      const s1 = fscore(r0, fa) + fscore(r1, fb), s2 = fscore(r0, fb) + fscore(r1, fa);
      const swapped = s2 > s1, s = Math.max(s1, s2);
      if (!best || s > best.s) best = { e, s, first: swapped ? "B" : "A" };
    });
    return best;
  }
  function bestPick(entries, fm){
    let best = null;
    entries.forEach(e => { const s = fscore(e.needs, fm); if (!best || s > best.s) best = { e, s }; });
    return best;
  }

  /* lensId, A/B = { normDims, name } with HTML-safe names, deep = computeDeepCompatibility(A, B, nameA, nameB) */
  E.pair = function(lensId, A, B, deep, opts){
    opts = opts || {};
    const lens = P().byId("lenses", lensId);
    if (!lens) return null;
    const nameA = A.name || "Person A", nameB = B.name || "Person B";
    const fa = facetsOf(A), fb = facetsOf(B);
    const fm = {}; F.FACET_KEYS.forEach(k => { fm[k] = (fa[k] + fb[k]) / 2; });
    /* Each lens owns its score (js/forge/lens-compat.js): the sections below read THIS lens's own aspects, falling back to the
       all-purpose categories only for a section the lens has no aspect for. */
    const own = F.lensCompat ? F.lensCompat.pair(lensId, A, B) : null;
    const cats = {}; ((deep && deep.categories) || []).forEach(c => { cats[c.name] = c.score; });
    if (own) Object.keys(own.cats).forEach(k => { cats[k] = own.cats[k]; });
    const names = { A: nameA, B: nameB };
    const sections = [];
    (lens.sections || []).forEach(sec => {
      const base = { id: sec.id, type: sec.type, title: sec.title, icon: sec.icon || "" };
      if (sec.type === "category"){
        const s = cats[sec.category];
        if (s == null) return;
        const b = band3(s);
        sections.push(Object.assign(base, { level: meter(s), word: (sec.words || ["Needs care", "Workable", "Natural"])[["low", "mid", "high"].indexOf(b)], text: fill(sec[b], names) }));
      } else if (sec.type === "who"){
        const sa = fscore(sec.weights, fa), sb = fscore(sec.weights, fb), gap = Math.abs(sa - sb);
        const lead = sa >= sb ? "A" : "B", other = lead === "A" ? "B" : "A";
        const m = { lead: names[lead], other: names[other], A: nameA, B: nameB };
        sections.push(Object.assign(base, { winner: names[lead], close: gap < 1.2, text: fill(gap < 1.2 && sec.tie ? sec.tie : sec.text, m) }));
      } else if (sec.type === "duo"){
        const d = bestDuo(sec.duos, fa, fb);
        const first = d.first === "A" ? nameA : nameB, second = d.first === "A" ? nameB : nameA;
        sections.push(Object.assign(base, { name: d.e.name, emoji: d.e.icon || "", text: fill(d.e.text, { first, second, A: nameA, B: nameB }) }));
      } else if (sec.type === "pick"){
        const p = bestPick(sec.options, fm);
        sections.push(Object.assign(base, { name: p.e.name, emoji: p.e.icon || "", text: fill(p.e.text, names) }));
      } else if (sec.type === "list"){
        const src = sec.source;
        let items = [];
        if (src === "shared") items = (deep.sharedStrengths || []).slice(0, 4);
        else if (src === "conflicts") items = (deep.conflictAreas || []).slice(0, 3);
        else if (src === "activities" && deep.activities) items = (sec.fields || ["activity", "vacation", "hobby", "weekend"]).map(k => deep.activities[k]).filter(Boolean).slice(0, 4);
        sections.push(Object.assign(base, { items, intro: fill(sec.intro || "", names), empty: fill(sec.empty || "", names) }));
      }
    });
    // scenarios: facet-driven "what would happen if ..." for this lens
    const scenarios = P().get("scenarios").filter(s => (s.lens || []).includes(lensId) || (s.lens || []).includes("all")).map(s => {
      const cover = {}; Object.keys(s.needs).forEach(k => { cover[k] = 0.65 * Math.max(fa[k], fb[k]) + 0.35 * ((fa[k] + fb[k]) / 2); });
      const score = fscore(s.needs, cover);
      const b = score >= 2.6 ? "great" : score >= 0.2 ? "good" : "rough";
      const sa = fscore(s.lead || s.needs, fa), sb = fscore(s.lead || s.needs, fb);
      const lead = sa >= sb ? nameA : nameB, other = sa >= sb ? nameB : nameA;
      return { id: s.id, title: s.title, icon: s.icon || "", world: s.world || "", band: b, label: (s.labels || { great: "You'd thrive", good: "You'd manage", rough: "You'd struggle (hilariously)" })[b], text: fill(s[b], { lead, other, A: nameA, B: nameB }) };
    });
    // relationship types (Companionship): the same compatibility categories, told for siblings, coworkers, mentors and so on
    const relations = (lens.relations || []).map(r => { const sc = cats[r.category]; const b = sc == null ? "mid" : band3(sc); return { id: r.id, name: r.name, icon: r.icon || "", text: fill(r[b], names), tip: r.tip || "" }; });
    // The headline reads the categories THIS lens is about (all computed by the existing engine), so it can never
    // contradict the sections underneath it. If the caller can't supply the engine's band function, the overall band is used.
    const used = (lens.sections || []).filter(x => x.type === "category" && cats[x.category] != null).map(x => cats[x.category]);
    const lensScore = own ? own.score : used.length ? mean(used) : (deep ? deep.relationshipScore : 50);
    const band = own ? own.band : typeof opts.bandOf === "function" ? opts.bandOf(lensScore) : (deep ? deep.band : "Mixed");
    const hl = (lens.headlines && lens.headlines[band]) || lens.headlines && lens.headlines._ || "";
    return { lens: { id: lens.id, name: lens.name, icon: lens.icon, eyebrow: lens.eyebrow, blurb: lens.blurb, tone: lens.tone },
      headline: fill(hl, names), band, score: Math.round(lensScore), level: meter(lensScore), sections, scenarios, relations,
      helping: own ? own.helping : [], costing: own ? own.costing : [], answers: own ? own.answers : [] };
  };
  /* Every lens's own score for the same two people: [{ id, name, icon, score, band }]. Cheap (no sections). */
  E.scores = function(A, B){
    if (!F.lensCompat) return [];
    return P().get("lenses").map(l => { const r = F.lensCompat.pair(l.id, A, B); return r ? { id: l.id, name: l.name, icon: l.icon, score: r.score, band: r.band } : null; }).filter(Boolean);
  };
  E.lenses = () => P().get("lenses").map(l => ({ id: l.id, name: l.name, icon: l.icon, blurb: l.blurb, short: l.short }));

  /* ---------------------------------------------------------------- party */
  /* entry scoring against group aggregates: needs (group mean), spread (how different you are), peak (strongest member) */
  function aggScore(e, agg){
    let s = 0;
    Object.keys(e.needs || {}).forEach(k => { s += e.needs[k] * agg.mean[k]; });
    Object.keys(e.spread || {}).forEach(k => { s += e.spread[k] * (agg.sd[k] - 3.5) * 2; });
    Object.keys(e.peak || {}).forEach(k => { s += e.peak[k] * agg.max[k]; });
    return s / (wsum(e.needs) + wsum(e.spread) + wsum(e.peak) || 1);
  }
  const hashStr = t => { let h = 0; for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) >>> 0; return h; };

  /* ---- variety weighting. A raw best-score pick would hand the same few entries to most groups (an entry whose needs
     happen to line up with the typical person wins everywhere). The "variety" config pack holds, per kind, how much each entry
     over- or under-scores across a large set of groups (offsets) and how far a near-tie may rotate (jitter). The adjusted
     score is  raw - strength * offset + a small hash of THIS group's personalities  - so groups that really differ get
     different picks, a clear winner still wins, and the same group always gets the same answer. */
  function varietyFor(fp){
    const V = P().byId("config", "variety") || {};
    return (kind, id, s) => {
      const k = (V.strengths && V.strengths[kind] != null) ? V.strengths[kind] : (V.strength == null ? 1 : V.strength);
      const off = (V.offsets && V.offsets[kind] && V.offsets[kind][id]) || 0, amp = (V.jitter && V.jitter[kind]) || 0;
      return s - k * off + amp * ((hashStr(fp + "|" + kind + "|" + id) % 10007) / 5003.5 - 1);
    };
  }
  function pickBest(kind, agg, only, adj, tables){
    const rows = [];
    P().get(kind).forEach(e => { if (only && !only(e)) return; rows.push({ e, s: aggScore(e, agg) }); });
    if (tables) tables[kind] = rows.map(r => ({ id: r.e.id, s: r.s }));
    let best = null;
    rows.forEach(r => { const a = adj ? adj(kind, r.e.id, r.s) : r.s; if (!best || a > best.a) best = { e: r.e, s: r.s, a }; });
    return best;
  }
  const WORLD_ATTRS = ["difficulty", "cooperation", "danger", "optimism", "creativity", "adaptability", "leadership", "exploration", "survival"];
  const LEVEL_WORD = ["", "very low", "low", "moderate", "high", "very high"];

  /* ---- shared by Party and the pair story (js/forge/story.js): the group's facet aggregates, the ranked worlds and the ranked teams. */
  function aggregateOf(profiles){
    const names = profiles.map((p, i) => p.name || ("Person " + (i + 1)));
    const fac = profiles.map(facetsOf);
    const agg = { mean: {}, sd: {}, max: {}, min: {} };
    F.FACET_KEYS.forEach(k => { const v = fac.map(f => f[k]); agg.mean[k] = mean(v); agg.sd[k] = sd(v); agg.max[k] = Math.max.apply(null, v); agg.min[k] = Math.min.apply(null, v); });
    const fp = fac.map(f => F.FACET_KEYS.map(k => Math.round(f[k] * 2)).join(",")).sort().join("|");
    return { names, fac, agg, fp };
  }
  function worldRank(agg, adj, tables){
    const lens = P().merged("universes").map(u => { const s = aggScore(u, agg), kind = (u.scope || "world") === "universe" ? "universe" : "world"; return { u, s, kind, a: adj(kind, u.id, s) }; }).sort((a, b) => b.a - a.a);
    if (tables){ tables.world = lens.filter(x => x.kind === "world").map(x => ({ id: x.u.id, s: x.s })); tables.universe = lens.filter(x => x.kind === "universe").map(x => ({ id: x.u.id, s: x.s })); }
    return lens;
  }
  /* ranked: one character ranking per person ([{ char, pct }]). Returns every team that fits, best first (each with its person -> member pairing). */
  function teamRank(names, ranked, agg, adj, tables){
    const n = names.length;
    const teams = P().merged("teams").map(t => {
      const cand = [];
      ranked.forEach((rl, i) => t.members.forEach(m => { const hit = rl.find(x => x.char.id === m); if (hit) cand.push({ i, m, pct: hit.pct, char: hit.char }); }));
      cand.sort((a, b) => b.pct - a.pct);
      const usedP = new Set(), usedM = new Set(), pairing = [];
      cand.forEach(c => { if (usedP.has(c.i) || usedM.has(c.m)) return; usedP.add(c.i); usedM.add(c.m); pairing.push(c); });
      // anyone left over still counts for their closest member at a discount (a team can be bigger or smaller than the group)
      let total = pairing.reduce((s, c) => s + c.pct, 0);
      for (let i = 0; i < n; i++) if (!usedP.has(i)){ const c = cand.find(x => x.i === i); if (c) total += c.pct * 0.55; }
      const coverage = Math.min(1, n / t.members.length);
      let score = total / n * (0.7 + 0.3 * coverage);
      if (t.needs){ const ethos = clamp((aggScore(t, agg) + 10) / 20 * 100, 0, 100); score = score * 0.75 + ethos * 0.25; }
      if (t.ideal){ const lo = t.ideal[0], hi = t.ideal[1]; score += (n >= lo && n <= hi) ? 3 : -Math.min(6, 2 * (n < lo ? lo - n : n - hi)); }
      return { t, score, pairing };
    }).filter(x => x.pairing.length >= Math.min(2, n));
    if (tables) tables.teams = teams.map(x => ({ id: x.t.id, s: x.score }));
    teams.forEach(x => { x.adj = adj("teams", x.t.id, x.score); });
    teams.sort((a, b) => b.adj - a.adj);
    return teams;
  }
  E.aggregate = aggregateOf;
  E.variety = (fp) => varietyFor(fp);
  /* The same world / team ranking Party uses, for any group of two or more. profiles: [{ normDims, name }] */
  E.rankWorlds = function(profiles){ const g = aggregateOf(profiles); return worldRank(g.agg, varietyFor(g.fp)); };
  E.rankTeams = function(profiles, ranker){ const g = aggregateOf(profiles); return teamRank(g.names, profiles.map(p => ranker(p)), g.agg, varietyFor(g.fp)); };

  /* profiles: [{ normDims, name(HTML-safe) }]. `ranker(profile)` is the character engine's ranked list (injectable for tests). */
  E.party = function(profiles, opts){
    opts = opts || {};
    const n = profiles.length;
    if (n < 2) return null;
    const { names, fac, agg, fp } = aggregateOf(profiles);
    const adj = varietyFor(fp), tables = opts.collect ? {} : null;

    // ---- "who is the ...?" cards: highest weighted score wins; the line is authored
    const roles = P().merged("roles");
    const roleCards = roles.map(r => {
      const sc = fac.map(f => fscore(r.weights, f));
      let wi = 0; sc.forEach((s, i) => { if (s > sc[wi]) wi = i; });
      const rest = sc.filter((_, i) => i !== wi), edge = rest.length ? sc[wi] - Math.max.apply(null, rest) : 0;
      return { id: r.id, title: r.title, icon: r.icon || "", rpg: r.rpg || "", winner: names[wi], index: wi, shared: edge < 0.8 && n > 1, line: fill(r.line, { name: names[wi] }), scores: sc };
    });
    const by = {}; roleCards.forEach(c => { by[c.id] = c.winner; });
    const baseTokens = Object.assign({ n: String(n), names: list(names), group: n + " of you" }, by);
    /* A text that mentions several roles should name DIFFERENT people where the group allows it: among just the roles
       that text uses, give each person their strongest remaining role (highest standing relative to the group). */
    const tokensFor = text => {
      const used = roleCards.filter(c => new RegExp("\\{" + c.id + "\\}").test(text || ""));
      if (used.length < 2) return baseTokens;
      const cand = [];
      used.forEach(c => c.scores.forEach((sc, i) => cand.push({ id: c.id, i, rel: sc - mean(c.scores) })));
      cand.sort((a, b) => b.rel - a.rel);
      const pT = new Set(), rT = new Set(), t = Object.assign({}, baseTokens);
      cand.forEach(x => { if (pT.has(x.i) || rT.has(x.id)) return; pT.add(x.i); rT.add(x.id); t[x.id] = names[x.i]; });
      return t;
    };

    // ---- everyone's role: each person gets their most distinctive role, no two the same
    const pairs = [];
    roleCards.forEach(c => c.scores.forEach((s, i) => pairs.push({ i, id: c.id, rel: s - mean(c.scores) })));
    pairs.sort((a, b) => b.rel - a.rel);
    const takenP = new Set(), takenR = new Set(), assign = {};
    pairs.forEach(x => { if (takenP.has(x.i) || takenR.has(x.id)) return; takenP.add(x.i); takenR.add(x.id); assign[x.i] = x.id; });
    const cast = names.map((nm, i) => { const r = roles.find(q => q.id === assign[i]) || roles[0]; return { name: nm, roleId: r ? r.id : "", role: r ? r.name || r.title : "", rpg: r ? r.rpg || "" : "", icon: r ? r.icon || "" : "", text: r ? fill(r.cast || r.line, { name: nm }) : "" }; });

    // ---- team identity: how closely each person resembles a team member (the character engine), blended with the team's own ethos
    let team = null;
    const ranker = opts.ranker;
    if (ranker){
      const ranked = profiles.map(p => ranker(p));              // each: [{ char, pct }]
      const teams = teamRank(names, ranked, agg, adj, tables);
      if (teams.length){
        const top = teams[0];
        team = { id: top.t.id, name: top.t.name, franchise: top.t.franchise || "", group: top.t.group || "", blurb: fill(top.t.blurb, tokensFor(top.t.blurb)),
          matches: top.pairing.slice(0, 5).map(c => ({ person: names[c.i], character: c.char.name, role: c.char.role })),
          why: fill(top.t.why || "", tokensFor(top.t.why)), runnersUp: teams.slice(1, 3).map(x => ({ id: x.t.id, name: x.t.name })) };
      }
    }

    // ---- worlds and universes (same pool; "scope" decides which list an entry competes in)
    const lens = worldRank(agg, adj, tables);
    const describe = (x, others) => {
      const u = x.u;
      const loves = Object.keys(u.needs).filter(k => u.needs[k] > 0).sort((a, b) => u.needs[b] * agg.mean[b] - u.needs[a] * agg.mean[a]).slice(0, 2).map(k => lc(F.facetLabel(k)));
      const dominant = Object.keys(u.needs).filter(k => u.needs[k] > 0).sort((a, b) => u.needs[b] - u.needs[a]).slice(0, 3).map(k => F.facetLabel(k));
      const feel = u.attrs ? WORLD_ATTRS.map((k, i) => ({ key: k, level: u.attrs[i] || 0, word: LEVEL_WORD[u.attrs[i] || 0] })) : [];
      return { id: u.id, name: u.name, franchise: u.franchise || u.name, scope: u.scope || "world", blurb: fill(u.blurb, tokensFor(u.blurb)), dominant, feel,
        why: fill(u.why || "", Object.assign({ loves: list(loves) }, tokensFor(u.why))), runnersUp: others.slice(0, 2).map(y => y.u.name) };
    };
    const ofScope = sc => lens.filter(x => (x.u.scope || "world") === sc);
    const wl = ofScope("world"), un = ofScope("universe");
    const world = wl[0] ? describe(wl[0], wl.slice(1)) : null;
    const universe = un[0] ? describe(un[0], un.slice(1)) : null;

    // ---- group compatibility: the Friendship engine only, over every pairing in the group
    const friendship = F.lensCompat ? F.lensCompat.group(profiles.map((p, i) => ({ facets: fac[i], name: names[i] })), "friendship") : null;

    const pick = (b) => b ? { id: b.e.id, name: b.e.name || "", icon: b.e.icon || "", text: fill(b.e.text, tokensFor(b.e.text)) } : null;
    const pb = kind => pickBest(kind, agg, null, adj, tables);
    const storyP = pb("stories"), dynP = pb("dynamics"), archP = pb("storyTypes"), funP = pb("outcomes");
    const adventure = pick(pb("adventures")), survivalScenario = pick(pb("survivalScenarios")), sitcom = pick(pb("sitcoms"));
    const rpgParty = pick(pb("rpgParties")), leadership = pick(pb("leadership"));
    // a few more stories, so the page has more than one memorable scenario
    const storyList = P().get("stories").map(e => ({ e, s: adj("stories", e.id, aggScore(e, agg)) })).sort((a, b) => b.s - a.s).slice(0, 3).map(x => pick(x));
    if (opts.collect) opts.collect(tables);

    // ---- survival chances: facets that help a group stay alive, plus whether the key roles are actually covered
    const sv = P().byId("config", "survival") || { weights: { steadiness: 1, flex: 1, structure: 1, persist: 1, trust: 1 }, covered: [] };
    const base = fscore(sv.weights, Object.fromEntries(F.FACET_KEYS.map(k => [k, agg.mean[k] * 0.5 + agg.max[k] * 0.5])));
    const coverageScore = (sv.covered || []).length ? mean(sv.covered.map(id => { const c = roleCards.find(x => x.id === id); return c ? clamp((Math.max.apply(null, c.scores) + 4) / 12, 0, 1) : 0; })) : 0.5;
    const sIdx = clamp((base + 10) / 20 * 0.7 + coverageScore * 0.3, 0, 1);
    const words = sv.words || ["Grim", "Shaky", "Decent", "Strong", "Formidable"];
    const level = clamp(Math.ceil(sIdx * 5), 1, 5);
    const survival = { level, word: words[level - 1], text: fill((sv.text || {})[level] || "", tokensFor((sv.text || {})[level])) };

    // ---- strengths, weaknesses and likely conflicts, each from the authored per-facet lines
    const fl = P().byId("config", "facetLines") || { lines: {} };
    const fw = P().byId("config", "facetWeak") || { lines: {} };
    const who = (k, hi) => { let best = 0; fac.forEach((f, i) => { if (hi ? f[k] > fac[best][k] : f[k] < fac[best][k]) best = i; }); return names[best]; };
    const strengthKeys = F.FACET_KEYS.filter(k => fl.lines[k]).sort((a, b) => (agg.mean[b] + 0.35 * agg.max[b]) - (agg.mean[a] + 0.35 * agg.max[a])).slice(0, 3);
    const clashKeys = F.FACET_KEYS.filter(k => fl.lines[k]).sort((a, b) => agg.sd[b] - agg.sd[a]).slice(0, 3);
    const weakKeys = F.FACET_KEYS.filter(k => fw.lines[k]).sort((a, b) => (agg.mean[a] + 0.35 * agg.max[a]) - (agg.mean[b] + 0.35 * agg.max[b])).slice(0, 3);
    const strengths = strengthKeys.map(k => ({ facet: F.facetLabel(k), text: fill(fl.lines[k].strength, Object.assign({ top: who(k, true) }, baseTokens)) }));
    const weaknesses = weakKeys.map(k => ({ facet: F.facetLabel(k), text: fw.lines[k] }));
    const conflicts = clashKeys.map(k => ({ facet: F.facetLabel(k), high: who(k, true), low: who(k, false), text: fill(fl.lines[k].clash, Object.assign({ high: who(k, true), low: who(k, false) }, baseTokens)) }));
    const strength = strengths[0] || null, conflict = conflicts[0] || null;

    // ---- chemistry: who is alike, who will need translating, who bridges them (all from the same facets)
    let chemistry = null;
    if (n >= 2){
      const dist = (i, j, keys) => mean(keys.map(k => Math.abs(fac[i][k] - fac[j][k])));
      const all = F.FACET_KEYS;
      let close = null, far = null;
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++){ const d = dist(i, j, all); if (!close || d < close.d) close = { i, j, d }; if (!far || d > far.d) far = { i, j, d }; }
      const gapKey = (p) => all.slice().sort((a, b) => Math.abs(fac[p.i][b] - fac[p.j][b]) - Math.abs(fac[p.i][a] - fac[p.j][a]))[0];
      const likeKey = (p) => all.filter(k => Math.abs(fac[p.i][k]) >= 3).sort((a, b) => Math.abs(fac[p.i][a] - fac[p.j][a]) - Math.abs(fac[p.i][b] - fac[p.j][b]))[0] || all[0];
      const cfg = P().byId("config", "chemistry") || { alike: [], apart: [], bridge: [] };
      const pickFrame = (arr, seed) => arr.length ? arr[hashStr(seed) % arr.length] : "";
      const lines = [];
      if (cfg.alike.length) lines.push(fill(pickFrame(cfg.alike, names[close.i] + names[close.j]), { a: names[close.i], b: names[close.j], facet: lc(F.facetLabel(likeKey(close))) }));
      if (cfg.apart.length && (far.i !== close.i || far.j !== close.j)){
        lines.push(fill(pickFrame(cfg.apart, names[far.i] + names[far.j]), { a: names[far.i], b: names[far.j], facet: lc(F.facetLabel(gapKey(far))) }));
        if (n >= 3 && cfg.bridge.length){
          let bridge = null; for (let m = 0; m < n; m++){ if (m === far.i || m === far.j) continue; const d = Math.max(dist(m, far.i, all), dist(m, far.j, all)); if (!bridge || d < bridge.d) bridge = { m, d }; }
          if (bridge) lines.push(fill(pickFrame(cfg.bridge, names[bridge.m] + names[far.i]), { bridge: names[bridge.m] }));
        }
      }
      chemistry = { closest: [names[close.i], names[close.j]], furthest: [names[far.i], names[far.j]], lines };
    }

    return { n, names, friendship, roleCards, cast, team, world, universe, story: pick(storyP), stories: storyList, dynamic: pick(dynP), archetype: pick(archP), funny: pick(funP),
      adventure, survivalScenario, sitcom, rpgParty, leadership, survival, strength, conflict, strengths, weaknesses, conflicts, chemistry };
  };

  /* A plain-text version for sharing (copy/paste into a chat). */
  E.summary = function(r, label){
    if (!r) return "";
    const strip = t => String(t == null ? "" : t).replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#0?39;/g, "'");
    const L = [];
    L.push((label || "Our PersonaForge party") + " (" + r.n + " people)");
    if (r.friendship) L.push("Group friendship compatibility: " + r.friendship.score + "% (" + r.friendship.band + ")");
    if (r.friendship && r.friendship.best.length) L.push("Best friends: " + r.friendship.best.slice(0, 3).map(p => p.a + " & " + p.b + " " + p.score + "%").join(", "));
    if (r.friendship && r.friendship.weakest && r.friendship.pairs.length > 1) L.push("Weakest pair: " + r.friendship.weakest.a + " & " + r.friendship.weakest.b);
    if (r.team) L.push("Team: " + r.team.name);
    if (r.world) L.push("World: " + r.world.name);
    if (r.universe) L.push("Universe: " + r.universe.name);
    if (r.sitcom) L.push("Sitcom: " + r.sitcom.name);
    if (r.adventure) L.push("Adventure: " + r.adventure.name);
    if (r.rpgParty) L.push("RPG party: " + r.rpgParty.name);
    if (r.leadership) L.push("Leadership: " + r.leadership.name);
    if (r.survival) L.push("Survival chances: " + r.survival.word);
    if (r.story) L.push("", r.story.text);
    return strip(L.join("\n"));
  };
})(typeof Forge !== "undefined" ? Forge : (globalThis.Forge = globalThis.Forge || {}));
if (typeof module !== "undefined" && module.exports) module.exports = Forge;
