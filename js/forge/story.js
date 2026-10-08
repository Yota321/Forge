/* =========================================================================
   FORGE STORY ENGINE: one continuous article about two people.

   The Compare page used to be a stack of reports. This module composes ONE story from engines that already exist:
     - the lens score and its aspects (lens-compat.js) and the lens pack's sections (pack-lenses.js, via experience.js)
     - the original compatibility reads (computeDeepCompatibility / computeCompareLayers, passed in by the page)
     - the character engine (characters.js) for the characters each person resembles
     - the world and team rankings Party already uses (experience.js)
     - the story packs (pack-story*.js, pack-scenarios-2.js): authored vocabulary, world scripts, ventures and situations
   It adds NO scoring of its own beyond comparing the two people's 17 facets with weights written in those packs.
   Every sentence is chosen by the pair's own personalities; nothing is random (a seeded rotation is used only so a
   "show me other situations" button can move on, and the same pair always gets the same first page).

   Chapters, in the order they are read:
     overall, why, balance, struggle, communication, decision, conflict, characters, worlds, teams, stories, situations, ending
   Each source of text is assigned to exactly one chapter, and a global "seen" set drops any sentence already used, so no
   paragraph appears twice.

   Names passed in must already be HTML-safe (the Compare page escapes them once); returned text is meant to be inserted as HTML.
   ========================================================================= */
(function(F){
  "use strict";
  const S = F.story = {};
  const P = () => F.packs;
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const mean = a => a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0;
  const lc = s => String(s).toLowerCase();
  const cap = s => { s = String(s == null ? "" : s); return s.charAt(0).toUpperCase() + s.slice(1); };
  const fill = (t, m) => String(t == null ? "" : t).replace(/\{(\w+)\}/g, (_, k) => (m && m[k] != null ? m[k] : ""));
  const hashStr = t => { let h = 0; t = String(t); for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) >>> 0; return h; };
  const data = id => { const e = P() && P().byId("story", id); return e ? e.data : null; };
  const facetsOf = p => (p && p.facets) ? p.facets : F.computeFacets((p && p.normDims) || {});
  const wsum = w => Object.keys(w || {}).reduce((s, k) => s + Math.abs(w[k]), 0) || 1;
  const fscore = (w, f) => Object.keys(w || {}).reduce((s, k) => s + w[k] * ((f && f[k]) || 0), 0) / wsum(w);
  const list = a => F.listJoin ? F.listJoin(a) : (a.length > 1 ? a.slice(0, -1).join(", ") + " and " + a[a.length - 1] : (a[0] || ""));
  const pickBy = (arr, seed) => arr && arr.length ? arr[hashStr(seed) % arr.length] : "";

  /* "plan every move" -> "plans every move". Every behaviour phrase starts with a base-form verb (pack-story.js). */
  const IRREGULAR = { have: "has", do: "does", go: "goes", be: "is" };
  S.third = function(phrase){
    const m = String(phrase || "").match(/^(\w+)(.*)$/);
    if (!m) return String(phrase || "");
    const v = m[1], rest = m[2];
    if (IRREGULAR[v]) return IRREGULAR[v] + rest;
    if (/[^aeiou]y$/i.test(v)) return v.slice(0, -1) + "ies" + rest;
    if (/(s|x|z|ch|sh)$/i.test(v)) return v + "es" + rest;
    return v + "s" + rest;
  };
  /* a character's name in running text: "Peter", but "Iron Man" and "The Doctor" keep both words */
  const TITLES = /^(the|mr|mrs|ms|dr|captain|count|king|queen|lord|lady|iron|black|doctor|professor|ser|sir|major|agent|general|commander|prince|princess|solid|jack|young|old|big|little|dark|master|mister)\b/i;
  S.nick = function(c){
    if (!c) return "";
    const parts = String(c.name || "").split(/\s+/).filter(Boolean);
    if (parts.length <= 1) return c.name;
    return (c.short && !TITLES.test(parts[0]) && c.short.length > 3) ? c.short : c.name;
  };

  /* ------------------------------------------------------------ context for one pair */
  function makeContext(lensId, A, B){
    const fa = facetsOf(A), fb = facetsOf(B);
    const nameA = A.name || "Person A", nameB = B.name || "Person B";
    const fm = {}; F.FACET_KEYS.forEach(k => { fm[k] = (fa[k] + fb[k]) / 2; });
    const takePoint = { initiative: 1.2, boldness: 0.6, persist: 0.3 };
    const aLeads = fscore(takePoint, fa) >= fscore(takePoint, fb);
    const ctx = { lensId, A, B, nameA, nameB, fa, fb, fm, lead: aLeads ? nameA : nameB, other: aLeads ? nameB : nameA, leadF: aLeads ? fa : fb, otherF: aLeads ? fb : fa, seen: new Set(), seedKey: lensId + "|" + [nameA, nameB].sort().join("|") };
    ctx.names = { A: nameA, B: nameB, lead: ctx.lead, other: ctx.other };
    return ctx;
  }
  /* each sentence is used once across the whole article */
  const norm = t => String(t || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().toLowerCase();
  function once(ctx, text){ const k = norm(text); if (!k || ctx.seen.has(k)) return null; ctx.seen.add(k); return text; }
  const onceAll = (ctx, arr) => (arr || []).map(t => once(ctx, t)).filter(Boolean);

  /* ------------------------------------------------------------ role tokens ({leader}, {peace}, {chaos} ...) for the pair */
  function roleTokens(ctx){
    if (ctx._roles) return ctx._roles;
    const roles = P().merged("roles");
    const cards = roles.map(r => { const sa = fscore(r.weights, ctx.fa), sb = fscore(r.weights, ctx.fb); return { id: r.id, sa, sb, win: sa >= sb ? ctx.nameA : ctx.nameB }; });
    ctx._roles = cards;
    return cards;
  }
  function tokensFor(ctx, text){
    const base = Object.assign({ A: ctx.nameA, B: ctx.nameB, names: ctx.nameA + " and " + ctx.nameB, group: "the two of you", n: "2" }, ctx.names);
    roleTokens(ctx).forEach(c => { base[c.id] = c.win; });
    const used = roleTokens(ctx).filter(c => new RegExp("\\{" + c.id + "\\}").test(text || ""));
    if (used.length < 2) return base;
    const cand = [];
    used.forEach(c => { cand.push({ id: c.id, who: ctx.nameA, rel: c.sa - (c.sa + c.sb) / 2 }); cand.push({ id: c.id, who: ctx.nameB, rel: c.sb - (c.sa + c.sb) / 2 }); });
    cand.sort((a, b) => b.rel - a.rel);
    const pT = new Set(), rT = new Set(), t = Object.assign({}, base);
    cand.forEach(x => { if (pT.has(x.who) || rT.has(x.id)) return; pT.add(x.who); rT.add(x.id); t[x.id] = x.who; });
    return t;
  }

  /* ------------------------------------------------------------ tracks: the personality-driven sentences of a chapter */
  S.trackLines = function(ctx, chapter, max){
    const tr = (data("tracks") || {})[chapter] || [];
    const out = [];
    tr.forEach(t => {
      const sa = fscore(t.w, ctx.fa), sb = fscore(t.w, ctx.fb), gap = Math.abs(sa - sb), avg = (sa + sb) / 2;
      const m = { A: ctx.nameA, B: ctx.nameB, h: sa >= sb ? ctx.nameA : ctx.nameB, l: sa >= sb ? ctx.nameB : ctx.nameA };
      let line = null;
      if (gap >= 2.2) line = cap(fill(t.hi, m)) + ", while " + fill(t.lo, m) + ".";
      else if (avg >= 1.5 && t.both) line = fill(t.both.hi, m);
      else if (avg <= -1.5 && t.both) line = fill(t.both.lo, m);
      if (line){ out.push({ id: t.id, gap, text: line, gapNote: gap >= 4.2 && t.gap ? fill(t.gap, m) : "" }); }
    });
    out.sort((a, b) => b.gap - a.gap);
    return out.slice(0, max || 3);
  };

  /* ------------------------------------------------------------ crossover: how two characters (or two people) interact */
  function behaviorOf(traits, key){ const B = data("behave"); const v = traits[key]; return B && B[key] ? (v >= 0 ? B[key].hi : B[key].lo) : ""; }
  function topDistinct(tx, ty, exclude){
    let best = null;
    Object.keys(tx).forEach(k => {
      if (k === exclude) return;
      const v = tx[k], o = ty[k] || 0;
      if (Math.abs(v) < 3) return;
      const sc = (v - o) * Math.sign(v);                 // how much further out X sits than Y, in X's own direction
      if (sc > 0 && (!best || sc > best.sc)) best = { k, sc };
    });
    if (best) return best.k;
    // nothing clearly more extreme: fall back to X's own strongest trait
    const ks = Object.keys(tx).filter(k => k !== exclude).sort((a, b) => Math.abs(tx[b]) - Math.abs(tx[a]));
    return ks[0] || null;
  }
  function sharedTrait(tx, ty){
    let best = null;
    Object.keys(tx).forEach(k => {
      if (ty[k] == null || Math.sign(tx[k]) !== Math.sign(ty[k]) || tx[k] === 0) return;
      const m = Math.min(Math.abs(tx[k]), Math.abs(ty[k]));
      if (m >= 3 && (!best || m > best.m)) best = { k, m, hi: tx[k] > 0 };
    });
    return best;
  }
  /* X, Y = { name, traits } (traits: facet -> -10..10). Returns { paragraph, pa, pb, shared } or null. */
  S.duoLine = function(X, Y, lensId, seed, opts){
    opts = opts || {};
    const fr = (data("frames") || {})[lensId] || (data("frames") || {}).friendship, br = data("bridge");
    if (!fr || !br) return null;
    const ka = topDistinct(X.traits, Y.traits, null);
    const kb = topDistinct(Y.traits, X.traits, ka);
    if (!ka || !kb) return null;
    const pa = behaviorOf(X.traits, ka), pb = behaviorOf(Y.traits, kb);
    if (!pa || !pb) return null;
    const frame = pickBy(fr, seed + "|f");
    const sentence = fill(frame, { a: X.name, b: Y.name, pa, pb, pa3: S.third(pa), pb3: S.third(pb) });
    const sh = sharedTrait(X.traits, Y.traits);
    const SH = data("share");
    const bridge = sh && SH && SH[sh.k] ? fill(pickBy(br.shared, seed + "|s"), { s: SH[sh.k][sh.hi ? "hi" : "lo"] }) : pickBy(br.none, seed + "|n");
    const parts = [sentence, bridge];
    if (opts.value) parts.push(fill(br.value, { v: opts.value }));
    if (opts.sim != null){ const band = opts.sim >= 70 ? "twin" : opts.sim >= 45 ? "mid" : "far"; parts.push(pickBy(br.verdict[band], seed + "|v")); }
    return { paragraph: parts.join(" "), pa, pb, ka, kb, shared: sh ? { facet: sh.k, phrase: SH && SH[sh.k] ? SH[sh.k][sh.hi ? "hi" : "lo"] : "" } : null };
  };

  const AREA_FOR_CHAPTER = { balance: "leadership", struggle: "stress", communication: "communication", decision: "decision", conflict: "conflict" };
  function characterPair(ctx){
    if (ctx._chars !== undefined) return ctx._chars;
    const C = F.characters;
    ctx._chars = null;
    if (!C || !C.profileFrom) return null;
    try{
      const pA = C.profileFrom({ normDims: ctx.A.normDims, name: ctx.A.name, code: ctx.A.code }), pB = C.profileFrom({ normDims: ctx.B.normDims, name: ctx.B.name, code: ctx.B.code });
      if (!pA.ok || !pB.ok) return null;
      const lA = C.rank(pA), lB = C.rank(pB);
      const a = lA[0];
      // two people can resemble the same character: give the second person their next-closest one so the crossover is a real pair
      const b = lB[0].char.id !== a.char.id ? lB[0] : lB[1];
      ctx._chars = { a, b, pA, pB, lA, lB };
    } catch(e){ ctx._chars = null; }
    return ctx._chars;
  }
  /* The crossover section, and the echo sentences the other chapters use to refer back to it. */
  S.crossover = function(ctx){
    const cp = characterPair(ctx), C = F.characters;
    if (!cp) return null;
    const X = { name: S.nick(cp.a.char), traits: cp.a.char.traits }, Y = { name: S.nick(cp.b.char), traits: cp.b.char.traits };
    const sim = C.traitSimilarity ? C.traitSimilarity(cp.a.char, cp.b.char) : 50;
    const sv = (cp.a.char.values || []).filter(v => (cp.b.char.values || []).includes(v));
    const value = sv.length ? lc(C.VALUES[sv[0]] || sv[0]) : "";
    const seed = ctx.seedKey + "|" + cp.a.char.id + "|" + cp.b.char.id;
    const duo = S.duoLine(X, Y, ctx.lensId, seed, { sim, value });
    const SH = data("share");
    const sharedAll = Object.keys(X.traits).filter(k => Y.traits[k] != null && Math.sign(X.traits[k]) === Math.sign(Y.traits[k]) && Math.min(Math.abs(X.traits[k]), Math.abs(Y.traits[k])) >= 3)
      .sort((p, q) => Math.min(Math.abs(Y.traits[q]), Math.abs(X.traits[q])) - Math.min(Math.abs(Y.traits[p]), Math.abs(X.traits[p]))).slice(0, 3)
      .map(k => ({ facet: k, label: F.facetLabel(k), text: SH && SH[k] ? cap("both " + SH[k][X.traits[k] > 0 ? "hi" : "lo"]) + "." : "" })).filter(x => x.text)
    const sharedList = sharedAll.filter(x => !(duo && duo.paragraph.toLowerCase().includes(x.text.toLowerCase().replace(/.$/, ""))));   // what the paragraph already said is not listed again
    const diffs = Object.keys(X.traits).filter(k => Y.traits[k] != null && Math.abs(X.traits[k] - Y.traits[k]) >= 6 && C.PHRASE[k])
      .sort((p, q) => Math.abs(Y.traits[q] - X.traits[q]) - Math.abs(Y.traits[p] - X.traits[p])).slice(0, 3)
      .map(k => { const d = X.traits[k] - Y.traits[k], big = Math.abs(d) >= 9, hi = d > 0 ? X : Y, lo = d > 0 ? Y : X; return { facet: k, label: F.facetLabel(k), text: `${hi.name} is ${big ? "far" : "noticeably"} more ${C.PHRASE[k].more} than ${lo.name}.` }; });
    const whyOf = side => { try{ return C.speakAbout(C.shortWhy(side === "a" ? cp.pA : cp.pB, cp[side]), side === "a" ? ctx.nameA : ctx.nameB); } catch(e){ return ""; } };
    const partsOf = side => ((cp[side].match && cp[side].match.parts) || []).slice(0, 8).map(p => ({ facet: p.facet, label: p.label, you: p.you, them: p.them, points: p.points }));
    const person = (side, who) => ({ parts: partsOf(side), person: who, id: cp[side].char.id, name: cp[side].char.name, nick: S.nick(cp[side].char), universe: cp[side].char.universe, role: cp[side].char.role, pct: cp[side].pct, why: whyOf(side) });
    // how they would handle each part of life, from the style data the character engine already holds
    const stylesOf = (c, area) => { const st = c.styles && c.styles[area]; const def = C.AREA && C.AREA[area] && C.AREA[area].styles && C.AREA[area].styles[st]; return def ? { key: st, label: def.label, they: def.they } : null; };
    const lineFor = (area, label) => {
      const sa = stylesOf(cp.a.char, area), sb = stylesOf(cp.b.char, area);
      if (!sa || !sb) return null;
      const text = sa.key === sb.key ? `${X.name} and ${Y.name} are alike here: each of them ${sa.they}.` : `${X.name} ${sa.they}; ${Y.name} ${sb.they}.`;
      return { area, label, text, same: sa.key === sb.key };
    };
    // Five areas are told inside the chapters they belong to (balance, struggle, talking, deciding, conflict), so that the story
    // connects. The Characters chapter shows the OTHER areas, so no sentence is ever repeated.
    const echoes = {};
    [["leadership", "Taking charge"], ["decision", "Deciding"], ["communication", "Talking"], ["conflict", "Disagreeing"], ["stress", "Under pressure"]].forEach(([a, l]) => { const e = lineFor(a, l); if (e) echoes[a] = e; });
    const interplay = [["motivation", "What drives them"], ["learning", "How they learn"], ["work", "At work"], ["group", "In a group"]].map(([a, l]) => lineFor(a, l)).filter(Boolean);
    return { a: person("a", ctx.nameA), b: person("b", ctx.nameB), title: `${X.name} + ${Y.name}`, paragraph: duo ? duo.paragraph : "", shared: sharedList, sharedSaid: sharedAll.length > 0 && !sharedList.length, differences: diffs, interplay, echoes, sim, value, nickA: X.name, nickB: Y.name,
      cpA: cp.a.char, cpB: cp.b.char, kind: sim >= 70 ? "alike" : sim >= 45 ? "complementary" : "contrasting" };
  };
  /* one sentence tying a chapter back to the characters ("the same split you'd see between A and B") */
  function echo(ctx, chapter, cross){
    if (!cross) return "";
    const area = AREA_FOR_CHAPTER[chapter]; if (!area) return "";
    const it = cross.echoes && cross.echoes[area]; if (!it) return "";
    const LEAD = {
      balance:       { same: "Your fictional twins pull in the same direction here.", diff: "Your fictional twins split it the way you do." },
      struggle:      { same: "Under pressure your fictional twins react alike.", diff: "Under pressure your fictional twins react differently, which echoes the friction above." },
      communication: { same: "Your fictional twins talk alike.", diff: "Your fictional twins talk differently too." },
      decision:      { same: "Your fictional twins make up their minds alike.", diff: "Your fictional twins decide differently too." },
      conflict:      { same: "Your fictional twins disagree alike.", diff: "Your fictional twins disagree differently too." }
    }[chapter];
    return `${LEAD[it.same ? "same" : "diff"]} ${it.text}`;
  }

  /* ------------------------------------------------------------ the beat engine: stories written FROM personalities */
  function distance(ctx){ return mean(F.FACET_KEYS.map(k => Math.abs(ctx.fa[k] - ctx.fb[k]))); }
  S.CLOSE = 3.1;
  function pickBeat(ctx, beat){
    const pre = data("presets") || {};
    let subj = ctx.fm;
    if (beat.about === "lead") subj = ctx.leadF; else if (beat.about === "other") subj = ctx.otherF;
    if (beat.about === "gap"){
      const close = distance(ctx) < S.CLOSE;
      const o = beat.o.find(x => x[0] === (close ? "close" : "far")) || beat.o[0];
      return o[1];
    }
    let best = null;
    beat.o.forEach((o, i) => { const s = fscore(pre[o[0]] || {}, subj); if (!best || s > best.s) best = { s, text: o[1] }; });
    return best ? best.text : "";
  }
  function storyFrom(ctx, beats){
    return beats.map(b => fill(pickBeat(ctx, b), ctx.names)).filter(Boolean);
  }

  /* ------------------------------------------------------------ worlds */
  function worldCard(ctx, ranked, script, cross){
    const u = ranked.u, lib = data("questions") || {}, tie = data("tie") || [], tieMore = data("tieMore") || [];
    const qs = (script.qs || []).map(([key, answer, override], i) => {
      const def = lib[key]; if (!def) return null;
      const sa = fscore(def.w, ctx.fa), sb = fscore(def.w, ctx.fb), gap = Math.abs(sa - sb);
      const q = override || def.q;
      if (gap < 0.4){
        // a genuine dead heat; a tie line is never used twice in one article
        const start = hashStr(ctx.seedKey + "|" + u.id + "|" + key); let line = "";
        for (let t = 0; t < tie.length && !line; t++){ const cand = fill(tie[(start + t) % tie.length], ctx.names); if (!ctx.seen.has(norm(cand))){ ctx.seen.add(norm(cand)); line = cand; } }
        for (let t = 0; t < tieMore.length && !line; t++){ const cand = fill(tieMore[(start + t) % tieMore.length], ctx.names); if (!ctx.seen.has(norm(cand))){ ctx.seen.add(norm(cand)); line = cand; } }   // the reserve, when the first eight are spent
        return { key, q, tie: true, winner: "", text: line || fill(tie[start % tie.length], ctx.names) };
      }
      const w = sa >= sb ? ctx.nameA : ctx.nameB, o = sa >= sb ? ctx.nameB : ctx.nameA;
      return { key, q, tie: false, winner: w, text: fill(answer, { w, o, A: ctx.nameA, B: ctx.nameB }) };
    }).filter(Boolean);
    const loves = Object.keys(u.needs).filter(k => u.needs[k] > 0).sort((a, b) => u.needs[b] * ctx.fm[b] - u.needs[a] * ctx.fm[a]).slice(0, 2).map(k => lc(F.facetLabel(k)));
    const tk = t => fill(t, Object.assign({ loves: list(loves) }, tokensFor(ctx, t)));
    const dominant = Object.keys(u.needs).filter(k => u.needs[k] > 0).sort((a, b) => u.needs[b] - u.needs[a]).slice(0, 3).map(k => F.facetLabel(k));
    const ATTRS = ["difficulty", "cooperation", "danger", "optimism", "creativity", "adaptability", "leadership", "exploration", "survival"], WORD = ["", "very low", "low", "moderate", "high", "very high"];
    const feel = u.attrs ? ATTRS.map((k, i) => ({ key: k, level: u.attrs[i] || 0, word: WORD[u.attrs[i] || 0] })) : [];
    // tie the world back to the characters: whoever is native here, else whichever fits it best
    let echoLine = "";
    if (cross){
      const notes = P().notes ? P().notes : null;
      const homeOf = c => { try{ const n = notes && notes(c.id); return n && n.world; } catch(e){ return null; } };
      const nat = [cross.cpA, cross.cpB].find(c => homeOf(c) === u.id || (P().franchise && P().franchise(c.id) === u.franchise));
      const fitA = fscore(u.needs, cross.cpA.traits), fitB = fscore(u.needs, cross.cpB.traits);
      const c = nat || (fitA >= fitB ? cross.cpA : cross.cpB), who = S.nick(c);
      const tops = Object.keys(c.traits).filter(k => Math.abs(c.traits[k]) >= 3).sort((a, b) => Math.abs(c.traits[b]) - Math.abs(c.traits[a]));
      const bests = tops.map(k => behaviorOf(c.traits, k)).filter(Boolean);
      // never the same sentence twice: move to the character's next strongest trait if this one was already used
      for (let i = 0; i <= bests.length && !echoLine; i++){
        const ph = bests[i] || "";
        const cand = nat ? `${who} is actually from here, and the resemblance shows${ph ? `: they ${ph}` : ""}.` : `Of the characters you resemble, ${who} would be most at home here${ph ? `, since they ${ph}` : ""}.`;
        if (!ctx.seen.has(norm(cand))){ ctx.seen.add(norm(cand)); echoLine = cand; }
      }
    }
    // every world's "why" opens with the same kind of sentence ("It rewards X and Y."); two worlds can love the same two traits, so the second card keeps only what is new
    const leadOnce = text => { const m = /^([^.!?]+[.!?])\s+(.+)$/.exec(text); if (!m) return text; const k = norm(m[1]); ctx._whyLeads = ctx._whyLeads || new Set(); if (ctx._whyLeads.has(k)) return m[2]; ctx._whyLeads.add(k); return text; };
    const card = { id: u.id, name: u.name, franchise: u.franchise || u.name, scope: u.scope || "world", title: `If the two of you entered ${u.name}`, intro: tk(script.intro || ""), blurb: tk(u.blurb || "") === tk(script.intro || "") ? "" : tk(u.blurb || ""), why: leadOnce(tk(u.why || "")), dominant, feel,
      story: storyFrom(ctx, script.beats || []), qs, echo: echoLine, fit: ranked.a };
    card.depth = S.depth && S.depth.worldExtra ? S.depth.worldExtra(ctx, ranked, card) : null;
    return card;
  }
  S.worlds = function(ctx, ranked, cross, n){
    const scripts = {}; P().get("worldScripts").forEach(s => { scripts[s.id] = s; });
    const shown = [], seenFr = new Set();
    ranked.forEach(r => {
      if (shown.length >= (n || 4) || !scripts[r.u.id]) return;
      const fr = r.u.franchise || r.u.name; if (seenFr.has(fr)) return;
      seenFr.add(fr); shown.push(worldCard(ctx, r, scripts[r.u.id], cross));
    });
    const shownIds = new Set(shown.map(w => w.id));
    const also = ranked.filter(r => !shownIds.has(r.u.id)).slice(0, 8).map(r => ({ id: r.u.id, name: r.u.name, franchise: r.u.franchise || r.u.name, scope: r.u.scope || "world" }));
    return { cards: shown, also, scripted: Object.keys(scripts).length };
  };

  /* ------------------------------------------------------------ teams: why the pair fits, and who plays which role */
  const TEAM_ROLES = [
    { id: "leads", label: "Naturally leads", role: "leader", both: "{A} and {B} would trade the lead depending on the day, and neither would mind." },
    { id: "supports", label: "Supports everyone", role: "support", both: "{A} and {B} would back everyone up equally, which makes for a very well-supported team." },
    { id: "chaos", label: "Creates the chaos", role: "chaos", both: "{A} and {B} would take turns causing it, usually at the same moment." },
    { id: "alive", label: "Keeps everyone alive", w: { steadiness: 1.5, structure: 1, warmth: 1, patience: 1, flex: 0.5 }, line: "{name} counts supplies, spots the exits and keeps the mood level while they do it.", both: "{A} and {B} would both keep one eye on the exits, so the team is in safe hands." },
    { id: "fixes", label: "Fixes the mistakes", w: { analysis: 1, invent: 0.8, persist: 0.8, patience: 0.4 }, line: "{name} quietly repairs whatever went wrong, usually before anyone has noticed it broke.", both: "{A} and {B} would each quietly fix what the other breaks." }
  ];
  S.teamRoles = function(ctx){
    const roles = P().merged("roles");
    return TEAM_ROLES.map(t => {
      const r = t.role ? roles.find(x => x.id === t.role) : null, w = t.w || (r && r.weights) || {};
      const sa = fscore(w, ctx.fa), sb = fscore(w, ctx.fb), gap = Math.abs(sa - sb);
      const win = sa >= sb ? ctx.nameA : ctx.nameB, line = t.line || (r && r.line) || "";
      return { id: t.id, label: t.label, who: gap < 0.8 ? "Both of you" : win, shared: gap < 0.8, text: gap < 0.8 ? fill(t.both || "", { A: ctx.nameA, B: ctx.nameB }) : fill(line, { name: win }) };
    });
  };
  /* what the team is like from the inside: who leads, who supports, how the people work together, what makes it function, where it breaks down (pack-teams-2..4; older teams have none) */
  const ABOUT = [["lead", "Who naturally leads"], ["supports", "Who holds it together"], ["dynamics", "How they work together"], ["works", "What makes it work"], ["friction", "Where conflict appears"]];
  function aboutTeam(ctx, t){
    if (!t.lead) return null;
    const rows = ABOUT.map(([k, label]) => ({ key: k, label, text: t[k] ? once(ctx, t[k]) || "" : "" })).filter(r => r.text);
    return rows.length ? rows : null;
  }
  S.teams = function(ctx, rankedTeams, n){
    return rankedTeams.slice(0, n || 3).map(x => {
      const t = x.t, tk = s => fill(s, tokensFor(ctx, s));
      const pair = x.pairing.slice(0, 2).map(c => ({ person: c.i === 0 ? ctx.nameA : ctx.nameB, character: c.char.name, id: c.char.id, role: c.char.role, pct: c.pct }));
      const card = { id: t.id, name: t.name, group: t.group || "", franchise: t.franchise || "", blurb: tk(t.blurb || ""), why: tk(t.why || ""), pairing: pair, size: t.members ? t.members.length : 0 };
      card.about = aboutTeam(ctx, t);
      card.depth = S.depth && S.depth.teamExtra ? S.depth.teamExtra(ctx, x, card) : null;
      return card;
    });
  };

  /* ------------------------------------------------------------ ventures (longer stories) */
  S.ventures = function(ctx, n){
    const rows = P().get("ventures").map(v => ({ v, s: fscore(v.needs, ctx.fm) + 0.35 * (hashStr(ctx.seedKey + "|" + v.id) % 1000) / 500 })).sort((a, b) => b.s - a.s);
    return rows.slice(0, n || 3).map(({ v }) => ({ id: v.id, icon: v.icon, title: `If the two of you ${v.title}`, story: storyFrom(ctx, v.beats) }));
  };

  /* ------------------------------------------------------------ situations (short outcomes; a seeded rotation makes them replayable) */
  function allSituations(ctx){
    const lensId = ctx.lensId;
    const rows = P().get("scenarios").filter(s => (s.lens || []).includes(lensId) || (s.lens || []).includes("all")).map(s => {
      const cover = {}; Object.keys(s.needs).forEach(k => { cover[k] = 0.65 * Math.max(ctx.fa[k], ctx.fb[k]) + 0.35 * ((ctx.fa[k] + ctx.fb[k]) / 2); });
      return { s, sc: fscore(s.needs, cover) };
    });
    // Absolute scores bunch up (most pairs "thrive" at most things), so a situation is told as a strength or a struggle relative to
    // THIS pair's own range, and never contradicts the absolute reading (a clearly poor fit cannot be a strength, and the reverse).
    const ordered = rows.slice().sort((a, b) => b.sc - a.sc), rank = new Map(ordered.map((r, i) => [r.s.id, i]));
    return rows.map(({ s, sc }) => {
      const pos = rank.get(s.id) / Math.max(1, rows.length - 1);
      let b = pos < 0.34 ? "great" : pos > 0.68 ? "rough" : "good";
      if (b === "great" && sc < 0.2) b = "good";                 // a clearly poor fit is never sold as a strength
      const wobble = b === "rough" && sc >= 2.6;                 // weakest FOR THIS PAIR, though still a decent fit: told lightly
      const la = fscore(s.lead || s.needs, ctx.fa), lb = fscore(s.lead || s.needs, ctx.fb);
      const lead = la >= lb ? ctx.nameA : ctx.nameB, other = la >= lb ? ctx.nameB : ctx.nameA;
      return { id: s.id, title: s.title, icon: s.icon || "", world: s.world || "", band: b, label: wobble ? "You'd wobble (hilariously)" : (s.labels || { great: "You'd thrive", good: "You'd manage", rough: "You'd struggle (hilariously)" })[b], text: fill(s[b], { lead, other, A: ctx.nameA, B: ctx.nameB }), score: sc, plays: S.depth && S.depth.plays ? S.depth.plays(ctx, s) : [] };
    });
  }
  const seeded = (arr, seed) => arr.map(x => ({ x, k: hashStr(seed + "|" + x.id) })).sort((a, b) => a.k - b.k).map(o => o.x);
  S.situations = function(ctx, round, per, exclude){
    per = per || 8; round = Math.max(0, round | 0);
    const pool = allSituations(ctx).filter(s => !(exclude && exclude.has(s.id)));
    const g = seeded(pool.filter(s => s.band === "great"), ctx.seedKey), m = seeded(pool.filter(s => s.band === "good"), ctx.seedKey), r = seeded(pool.filter(s => s.band === "rough"), ctx.seedKey);
    const order = []; const max = Math.max(g.length, m.length, r.length);
    for (let i = 0; i < max; i++){ [g[i], r[i], m[i]].forEach(x => { if (x) order.push(x); }); }
    if (!order.length) return { items: [], total: 0, round: 0, rounds: 0 };
    const rounds = Math.max(1, Math.ceil(order.length / per)), rr = round % rounds;
    const usedK = new Set();                                  // a facet is described once per page, so two situations never read the same
    const items = order.slice(rr * per, rr * per + per).map(it => { const p = (it.plays || []).find(c => !usedK.has(c.k) && !ctx.seen.has(norm(c.text))); if (p){ usedK.add(p.k); ctx.seen.add(norm(p.text)); } return Object.assign({}, it, { plays: p ? p.text : "", playsFacet: p ? p.k : "" }); });
    return { items, total: order.length, round: rr, rounds, counts: { g: g.length, m: m.length, r: r.length } };
  };

  /* ------------------------------------------------------------ chapters ASSIGNMENT of the lens pack's sections: each lands in exactly one chapter */
  const ASSIGN = {
    friendship: { why: ["trust", "adventure"], balance: ["chaos", "alive", "duo"], struggle: ["arguments"], communication: ["keepintouch"], decision: ["problem"], conflict: [], strengths: ["strengths"], activities: ["activities"] },
    romance: { why: ["trust", "attract", "needs"], balance: ["balance", "support"], struggle: ["growth"], communication: ["comm", "affection", "love"], decision: ["future", "longterm"], conflict: ["conflict"], strengths: ["strengths"], activities: [] },
    companionship: { why: ["teamwork", "reliable"], balance: ["duo", "respect", "calm"], struggle: ["blind", "boundaries"], communication: ["comm"], decision: ["decide", "learning"], conflict: [], strengths: ["strengths"], activities: [] }
  };
  function sectionsFor(r, lensId, chapter){
    const ids = (ASSIGN[lensId] || ASSIGN.friendship)[chapter] || [];
    return ids.map(id => r.sections.find(s => s.id === id)).filter(Boolean);
  }
  function leftoverSections(r, lensId){
    const a = ASSIGN[lensId] || ASSIGN.friendship, used = new Set([].concat(a.why, a.balance, a.struggle, a.communication, a.decision, a.conflict, a.strengths, a.activities));
    return r.sections.filter(s => !used.has(s.id));
  }

  /* ------------------------------------------------------------ the article */
  /* src: { deep, layers, rankWorlds, rankTeams, ranker, bandOf, round }   (deep/layers come from the page's existing compatibility functions) */
  S.pair = function(lensId, A, B, src){
    src = src || {};
    const E = F.experience;
    if (!E || !P()) return null;
    const ctx = makeContext(lensId, A, B);
    const deep = src.deep || {}, layers = src.layers || {};
    const r = E.pair(lensId, A, B, deep, { bandOf: src.bandOf });
    if (!r) return null;
    const lensFr = (data("lens") || {})[lensId] || (data("lens") || {}).friendship || {};
    const L = (ch, i) => (lensFr[ch] || [])[i] || "";
    const agree = layers.agreement || { agree: [], disagree: [], balance: [], conflictAreas: [] };
    const cross = S.crossover(ctx);
    // two characters matched for the same traits are explained once (the second card says so), never the same sentence under both
    if (cross && cross.a && cross.b && cross.a.why && cross.a.why === cross.b.why) cross.b.why = "The same traits point to this match.";
    const A_ = ctx.nameA, B_ = ctx.nameB;
    const ans = id => (r.answers || []).find(a => a.id === id);
    const qa = ids => ids.map(id => ans(id)).filter(Boolean).map(a => ({ q: a.q, text: a.text })).filter(x => once(ctx, x.text));
    const secs = (ch) => sectionsFor(r, lensId, ch);

    /* ---- 1. overall */
    const lifts = onceAll(ctx, (r.helping || []).map(x => x.text)), holds = onceAll(ctx, (r.costing || []).slice(0, 2).map(x => x.text));
    const meaning = ((data("meaning") || {})[lensId] || {})[r.band] || "";
    const overall = { eyebrow: "THE SHORT VERSION", title: "How this pairing reads.", lead: L("overall", 0), score: r.score, band: r.band, meaning, lifts, holds, relations: r.relations || [] };

    /* ---- 2. why it works */
    const explain = onceAll(ctx, (deep.explanations || []).slice(0, 3));
    const agreeAll = (agree.agree || []).map(x => x.text);
    const agreeTexts = onceAll(ctx, agreeAll.slice(0, 1));
    const whySecs = secs("why"), strengthSec = secs("strengths")[0];
    const why = { eyebrow: "WHY IT WORKS", title: "What holds this together.", lead: L("why", 0), paras: explain.concat(agreeTexts), sections: whySecs, shared: (deep.sharedStrengths || []).slice(0, 8), qa: qa(["enjoy", "understand"]), strengthsIntro: strengthSec ? strengthSec.intro : "",
      more: { title: "More common ground", items: onceAll(ctx, agreeAll.slice(1)) } };

    /* ---- 3. balance (what each of you brings, your identities and the full profile live here) */
    const balLines = S.trackLines(ctx, "balance", 3).map(t => t.text);
    const balAll = (agree.balance || []).map(x => x.text);
    const full = layers.topVirtues ? { virtues: layers.topVirtues, tendencies: layers.topTendencies, strengths: layers.strengths, weaknesses: layers.weaknesses, stress: layers.stressResponse, funStats: layers.funStats || [] } : null;
    const balance = { eyebrow: "HOW YOU BALANCE EACH OTHER", title: "Who does what, without being asked.", lead: L("balance", 0), lines: onceAll(ctx, balLines), complement: onceAll(ctx, balAll.slice(0, 1)),
      sections: secs("balance"), brings: layers.brings || null, who: deep.whoComparisons || [], leadership: layers.leadershipStyle || null, identity: layers.archetype && layers.soul ? { archetype: layers.archetype, soul: { a: { name: layers.soul.a.name, trait: layers.soul.a.trait }, b: { name: layers.soul.b.name, trait: layers.soul.b.trait } }, meaning: { a: layers.soul.a.meaning || "", b: layers.soul.b.meaning || "" } } : null, full,
      qa: qa(["complement", "steady", "room"]), echo: echo(ctx, "balance", cross), closer: L("balance", 1), more: { title: "More ways you complement each other", items: onceAll(ctx, balAll.slice(1)) } };

    /* ---- 4. struggle */
    const sTracks = S.trackLines(ctx, "struggle", 3);
    const disAll = (agree.disagree || []).map(x => x.text);
    const frictionTexts = onceAll(ctx, disAll.slice(0, 1));
    const struggle = { eyebrow: "WHERE YOU NATURALLY STRUGGLE", title: "The friction, said plainly.", lead: L("struggle", 0), lines: onceAll(ctx, sTracks.map(t => t.text)), notes: onceAll(ctx, sTracks.map(t => t.gapNote).filter(Boolean)), frictions: frictionTexts,
      sections: secs("struggle"), friction: (deep.conflictAreas || []).slice(0, 5), echo: echo(ctx, "struggle", cross), closer: L("struggle", 1), more: { title: "More places you differ", items: onceAll(ctx, disAll.slice(1).concat((deep.explanations || []).slice(3))) } };

    /* ---- 5. communication */
    const communication = { eyebrow: "COMMUNICATION", title: "How the two of you talk.", lead: L("communication", 0), lines: onceAll(ctx, S.trackLines(ctx, "communication", 3).map(t => t.text)), sections: secs("communication"),
      styles: layers.communicationStyle ? { a: layers.communicationStyle.a, b: layers.communicationStyle.b } : null, relStyle: layers.relationshipStyle ? { a: layers.relationshipStyle.a, b: layers.relationshipStyle.b } : null, relLabel: lensId === "companionship" ? "How each of you attaches" : "How each of you shows up",
      echo: echo(ctx, "communication", cross), closer: L("communication", 1) };

    /* ---- 6. decision making */
    const pair2 = k => layers[k] ? { a: layers[k].a, b: layers[k].b } : null;
    const decision = { eyebrow: "DECISION MAKING", title: "How you make up your minds.", lead: L("decision", 0), lines: onceAll(ctx, S.trackLines(ctx, "decision", 3).map(t => t.text)), sections: secs("decision"),
      styles: pair2("decisionStyle"), thinking: pair2("thinkingStyle"), learning: pair2("learningStyle"), echo: echo(ctx, "decision", cross), closer: L("decision", 1) };

    /* ---- 7. conflict (the friction-prone areas the original report listed live here) */
    const areaAll = (agree.conflictAreas || []).map(x => x.text);
    const conflict = { eyebrow: "CONFLICT STYLE", title: "How you disagree, and make up.", lead: L("conflict", 0), lines: onceAll(ctx, S.trackLines(ctx, "conflict", 3).map(t => t.text)), sections: secs("conflict"), qa: qa(["calm", "healthy"]),
      areas: onceAll(ctx, areaAll.slice(0, 1)), echo: echo(ctx, "conflict", cross), closer: L("conflict", 1), more: { title: "Where friction tends to start", items: onceAll(ctx, areaAll.slice(1)) } };

    /* ---- 8-11. characters, worlds, teams, stories */
    const profiles = [{ normDims: A.normDims, name: A.name }, { normDims: B.normDims, name: B.name }];
    const rankedW = (src.rankWorlds ? src.rankWorlds(profiles) : E.rankWorlds(profiles));
    const worlds = S.worlds(ctx, rankedW, cross, 4);
    let teamsRanked = [];
    try{ teamsRanked = src.rankTeams ? src.rankTeams(profiles) : (src.ranker ? E.rankTeams(profiles, src.ranker) : []); } catch(e){ teamsRanked = []; }
    const teams = { cards: S.teams(ctx, teamsRanked, 3), roles: S.teamRoles(ctx) };
    teams.orgs = S.depth && S.depth.orgs ? S.depth.orgs(ctx, 3, new Set(teams.cards.map(t => String(t.name).replace(/^The\s+/i, "").toLowerCase()))) : [];
    const ventures = S.ventures(ctx, 3);
    const characters = { eyebrow: "CHARACTERS", title: "Your fictional twins.", lead: L("characters", 0), cross, duo: S.depth && S.depth.duo ? S.depth.duo(ctx, cross) : null };
    const worldsCh = { eyebrow: "WORLDS", title: "If you both entered…", lead: L("worlds", 0), cards: worlds.cards, also: worlds.also };
    const teamsCh = { eyebrow: "TEAMS", title: "Where you'd fit on a team.", lead: L("teams", 0), cards: teams.cards, roles: teams.roles, orgs: teams.orgs };
    const storiesCh = { eyebrow: "STORIES", title: "Written from how you're wired.", lead: L("stories", 0), items: ventures };

    /* ---- 12. situations */
    const shownWorlds = new Set(worlds.cards.map(w => w.id));
    const sit = S.situations(ctx, src.round || 0, 8, shownWorlds);
    const leftover = leftoverSections(r, lensId);
    const acts = deep.activities || {};
    const actItems = [["Perfect activity", acts.activity], ["Perfect hobby", acts.hobby], ["Perfect weekend", acts.weekend], ["Perfect vacation", acts.vacation], ["Perfect business", acts.business], ["How you'd solve problems", acts.solveProblems], ["How you'd handle a crisis", acts.crisis], ["How this pairing gets built", acts.friendship]];
    const activities = actItems.filter(x => x[1]).map(x => ({ label: x[0], text: x[1] })).filter(x => once(ctx, x.text));
    const echoSit = cross ? pickBy(["Think of them as {a} and {b} on a day off.", "Picture {a} and {b} handling each of these, and you will not be far off.", "Whatever happens, expect the {a} and {b} dynamic to turn up."], ctx.seedKey + "|sit") : "";
    const situations = { eyebrow: "SITUATIONS", title: "What happens when it gets real.", lead: L("situations", 0), echo: cross ? fill(echoSit, { a: cross.nickA, b: cross.nickB }) : "", items: sit.items, round: sit.round, rounds: sit.rounds, total: sit.total, counts: sit.counts, practice: leftover, activities, workStyle: pair2("workStyle") };

    /* ---- the bridges between chapters (characters -> worlds -> teams -> situations -> the score) */
    const bridges = S.depth && S.depth.bridges ? S.depth.bridges(ctx, { cross, world: worlds.cards[0], team: teams.cards[0], sit: sit.counts ? { n: sit.total, g: sit.counts.g, r: sit.counts.r } : null, score: r.score }) : {};
    worldsCh.bridge = bridges.worlds || ""; teamsCh.bridge = bridges.teams || ""; situations.bridge = bridges.situations || "";

    /* ---- 13. ending */
    const scores = E.scores(A, B);
    const brings = layers.brings || null;
    const topWorld = worlds.cards[0], topTeam = teams.cards[0];
    const bits = [];
    if (cross) bits.push(`In a story you would read as ${cross.nickA} and ${cross.nickB}${cross.kind === "complementary" ? ", a pairing that works because it isn't a mirror" : cross.kind === "alike" ? ", two of a kind" : ", a contrast that makes the plot"}.`);
    if (topWorld || topTeam) bits.push(`${topWorld ? `You'd be at home in ${topWorld.name}` : ""}${topWorld && topTeam ? ", and " : ""}${topTeam ? `the ${topTeam.name.replace(/^The /, "")} would have a place for both of you` : ""}.`);
    const growth = layers.growthAdvice ? { a: layers.growthAdvice.a, b: layers.growthAdvice.b } : null;
    const cats = (deep.categories || []).map(c => ({ name: c.name, score: c.score }));
    const final = S.depth && S.depth.finale ? S.depth.finale(ctx, { score: r.score, categories: deep.categories, cross, world: topWorld, team: topTeam }) : null;
    const ending = { eyebrow: "THE LAST PAGE", title: "How the book closes.", final, lead: L("ending", 0), bridge: bridges.ending || "", score: r.score, band: r.band, closing: L("ending", 1), scores, summary: bits.filter(x => once(ctx, x)), funFacts: onceAll(ctx, deep.funFacts || []), growth,
      confidence: deep.comparisonConfidence != null ? { pct: deep.comparisonConfidence, similarity: deep.similarityScore != null ? deep.similarityScore : null, note: deep.similarityNote || "" } : null, categories: cats };

    // two people who share an answer are told it once ("both of you"), never the same sentence under each name
    const merge = o => { if (Array.isArray(o)) o.forEach(merge); else if (o && typeof o === "object") { if (typeof o.a === "string" && typeof o.b === "string" && o.a.length >= 20 && o.a === o.b) { o.b = ""; o.same = true; } Object.keys(o).forEach(k => { if (k !== "cpA" && k !== "cpB") merge(o[k]); }); } };
    merge({ communication, decision, balance, ending, characters, situations });
    return { lens: r.lens, lensId, names: { A: A_, B: B_ }, hero: { score: r.score, band: r.band, headline: r.headline, meaning },
      chapters: { overall, why, balance, struggle, communication, decision, conflict, characters: characters, worlds: worldsCh, teams: teamsCh, stories: storiesCh, situations, ending },
      order: ["overall", "why", "balance", "struggle", "communication", "decision", "conflict", "characters", "worlds", "teams", "stories", "situations", "ending"], crossover: cross };
  };

  /* Re-pick situations only (the "show me others" button): same pair, next page. */
  S.nextSituations = function(lensId, A, B, round, excludeIds){
    const ctx = makeContext(lensId, A, B);
    return S.situations(ctx, round, 8, new Set(excludeIds || []));
  };
  /* helpers shared with js/forge/story-depth.js */
  S._h = { data, fill, cap, lc, once, onceAll, pickBy, hashStr, fscore, norm, behaviorOf, list };
})(typeof Forge !== "undefined" ? Forge : (globalThis.Forge = globalThis.Forge || {}));
if (typeof module !== "undefined" && module.exports) module.exports = Forge;
