/* =========================================================================
   FORGE STORY DEPTH: the Characters, Worlds, Teams and Situations chapters as small features of their own.

   story.js builds the article and calls this module (Forge.story.depth) for the parts that need more than a paragraph:
     duo          what kind of duo two characters make, why each person matches theirs, what they are good at together,
                  where they struggle and where they would clash (hand-written character notes + trait data)
     worldExtra   inside a world: the part each person would play, how the two survive it, the biggest advantage, the biggest challenge
     teamExtra    inside a team: who leads, who follows, each person's part, where friction appears, how outsiders would describe the pair,
                  and how effective the team would really be
     plays        how each person would play a situation, from the facets that situation turns on
     bridges      the sentence that leads from each chapter into the next
   Like story.js it adds NO scoring of its own: it compares the two people's 17 facets, weighted by the world's / team's / situation's own
   needs from the packs, and picks authored lines (pack-story-depth*.js). Everything is optional: with the packs missing the article
   simply omits these parts. Names passed in are already HTML-safe.
   ========================================================================= */
(function(F){
  "use strict";
  const S = F.story;
  if (!S || !S._h) return;
  const H = S._h, P = () => F.packs, D = () => H.data("depth") || {};
  const FK = () => F.FACET_KEYS || [];
  const label = k => (F.facetLabel ? F.facetLabel(k) : k);
  const lcl = s => String(s == null ? "" : s).replace(/^./, c => c.toLowerCase());
  const lab = k => lcl(label(k));
  const behave = () => H.data("behave") || {};
  const share = () => H.data("share") || {};
  const ph = (k, hi) => { const b = behave()[k]; return b ? (hi ? b.hi : b.lo) : ""; };
  const third = p => S.third(p);
  const sgn = v => (v >= 0 ? 1 : -1);
  const valid = k => FK().indexOf(k) >= 0;
  const needKeys = needs => Object.keys(needs || {}).filter(k => valid(k) && Math.abs(needs[k]) >= 0.25);

  /* what a need asks for: positive weight = the high end of the facet, negative = the low end */
  const supply = (ctx, k, w) => w * (w >= 0 ? 0.65 * Math.max(ctx.fa[k], ctx.fb[k]) + 0.35 * ctx.fm[k] : 0.65 * Math.min(ctx.fa[k], ctx.fb[k]) + 0.35 * ctx.fm[k]);

  /* ------------------------------------------------------------ characters: the duo */
  S.depth = {};
  S.depth.duo = function(ctx, cross){
    if (!cross) return null;
    const d = D(), nx = cross.nickA, ny = cross.nickB, SH = share();
    const notesOf = c => (P().notes ? P().notes(c.id) : null) || {};
    const nA = notesOf(cross.cpA), nB = notesOf(cross.cpB);
    const kinds = ((d.duoKind || {})[ctx.lensId] || (d.duoKind || {}).friendship || {})[cross.kind] || [];
    const line = kinds.length ? H.once(ctx, H.fill(H.pickBy(kinds, ctx.seedKey + "|duo"), { x: nx, y: ny })) : "";
    const kindLabel = { alike: "A mirror duo", complementary: "A complementary duo", contrasting: "An odd-couple duo" }[cross.kind] || "A duo";
    const roleB = String(cross.b.role || "").replace(/^The\s+/, "the ");
    const reasons = (side, who, nick) => {
      const out = [];
      (cross[side].parts || []).slice().sort((p, q) => q.points - p.points).forEach(p => {
        if (out.length >= 3 || !SH[p.facet]) return;
        if (sgn(p.you) !== sgn(p.them) || Math.min(Math.abs(p.you), Math.abs(p.them)) < 2.5) return;
        const t = H.once(ctx, `${who} and ${nick} both ${SH[p.facet][p.them > 0 ? "hi" : "lo"]}.`);
        if (t) out.push({ facet: p.facet, label: p.label, text: t });
      });
      return out;
    };
    const items = (arr, n) => (arr || []).slice(0, n);
    const sA = nA.strengths || [], sB = nB.strengths || [], wA = nA.weaknesses || [], wB = nB.weaknesses || [];
    const seed = ctx.seedKey + "|clash";
    const q = t => "\u201c" + lcl(t) + "\u201d";                     // the notes are not all verb phrases, so they are quoted, never grammatically joined
    const clashes = [];
    // 1. where the two characters pull in opposite directions (grammar-safe vocabulary from pack-story.js)
    const X = cross.cpA.traits || {}, Y = cross.cpB.traits || {};
    const pulls = Object.keys(X).filter(k => Y[k] != null && behave()[k] && sgn(X[k]) !== sgn(Y[k]) && Math.abs(X[k] - Y[k]) >= 8)
      .sort((p, r) => Math.abs(Y[r] - X[r]) - Math.abs(Y[p] - X[p])).slice(0, 1);
    pulls.forEach(k => clashes.push(`Trouble starts around ${lab(k)}: ${nx} ${third(ph(k, X[k] > 0))}, while ${ny} ${third(ph(k, Y[k] > 0))}.`));
    // 2. and 3. their written weak spots and strengths meeting
    if (wA[0] && wB[0]) clashes.push(H.pickBy([`Where it gets interesting: ${nx}\u2019s ${q(wA[0])} meets ${ny}\u2019s ${q(wB[0])}.`, `${nx}\u2019s ${q(wA[0])} and ${ny}\u2019s ${q(wB[0])} do not make for an easy afternoon.`], seed + "1"));
    if (sA[0] && wB[0]) clashes.push(`${nx}: ${q(sA[0])}. ${ny}: ${q(wB[0])}. Side by side, you can see where it grinds.`);
    else if (sB[0] && wA[0]) clashes.push(`${ny}: ${q(sB[0])}. ${nx}: ${q(wA[0])}. Side by side, you can see where it grinds.`);
    return {
      kind: cross.kind, label: kindLabel, name: `${cross.a.role} and ${roleB}`, line,
      why: { a: reasons("a", ctx.nameA, nx), b: reasons("b", ctx.nameB, ny) },
      strengths: [{ who: nx, items: items(sA, 3) }, { who: ny, items: items(sB, 3) }],
      weaknesses: [{ who: nx, items: items(wA, 3) }, { who: ny, items: items(wB, 3) }],
      clashes: H.onceAll(ctx, clashes)
    };
  };

  /* ------------------------------------------------------------ worlds: roles, survival, advantage, challenge */
  const SLOT = {
    lead:  { initiative: 1.2, boldness: 0.6, persist: 0.3 },
    care:  { warmth: 1.2, trust: 0.5, steadiness: 0.5, patience: 0.4 },
    brain: { analysis: 1.2, structure: 0.6, invent: 0.4 },
    wild:  { boldness: 0.8, humor: 0.6, flex: 0.8, explore: 0.6, autonomy: 0.4 }
  };
  const slotNeed = (needs, slot) => { const w = SLOT[slot]; let t = 0, s = 0; Object.keys(w).forEach(k => { t += Math.max(0, needs[k] || 0) * w[k]; s += w[k]; }); return t / s; };

  S.depth.worldExtra = function(ctx, ranked){
    const u = ranked && ranked.u; if (!u) return null;
    const wd = P().byId ? P().byId("worldDepth", u.id) : null; if (!wd) return null;
    const d = D(), needs = u.needs || {}, seed = ctx.seedKey + "|" + u.id;
    // roles: the people take the two parts the world needs most, each where they are naturally stronger
    const cand = [];
    Object.keys(SLOT).forEach(slot => {
      const sa = H.fscore(SLOT[slot], ctx.fa), sb = H.fscore(SLOT[slot], ctx.fb), m = (sa + sb) / 2, nd = 2 * slotNeed(needs, slot);
      cand.push({ slot, who: ctx.nameA, v: sa - m + nd }, { slot, who: ctx.nameB, v: sb - m + nd });
    });
    cand.sort((a, b) => b.v - a.v);
    const usedW = new Set(), usedS = new Set(), roles = [];
    cand.forEach(c => { if (usedW.has(c.who) || usedS.has(c.slot) || !wd.roles[c.slot]) return; usedW.add(c.who); usedS.add(c.slot); roles.push({ who: c.who, slot: c.slot, title: wd.roles[c.slot][0], text: H.fill(wd.roles[c.slot][1], { n: c.who }) }); });
    roles.sort((a, b) => (a.who === ctx.nameA ? -1 : 1) - (b.who === ctx.nameA ? -1 : 1));
    // the part nobody naturally plays: the world's most-needed slot that nobody took
    const open = Object.keys(SLOT).filter(s => !usedS.has(s) && wd.roles[s]).sort((a, b) => slotNeed(needs, b) - slotNeed(needs, a))[0];
    const openName = open ? lcl(wd.roles[open][0]).replace(/^the\s+/, "") : "";
    const gap = open ? H.once(ctx, H.pickBy([`Nobody naturally plays the ${openName}, and in ${u.name} that is the part you would miss first.`, `The ${openName} chair stays empty in ${u.name}: you would have to share it, or borrow a friend.`], seed + "|gap")) : "";

    // the pair's strongest and weakest need in this world; a facet already used by an earlier world card is passed over, so the cards differ
    const ks = needKeys(needs).map(k => ({ k, w: needs[k], s: supply(ctx, k, needs[k]) }));
    const used = ctx._worldFacets = ctx._worldFacets || { adv: new Set(), chal: new Set() };
    const pick = (list, set) => list.find(x => !set.has(x.k)) || list[0];
    const best = pick(ks.slice().sort((a, b) => b.s - a.s), used.adv), worst = pick(ks.slice().sort((a, b) => a.s - b.s), used.chal);
    const fr = d.worldFrames || {};
    let advantage = "", challenge = "", advantageLabel = "", advantageOwner = "";
    if (best && fr.advantage){
      used.adv.add(best.k);
      const hiSide = best.w >= 0, ownerIsA = (hiSide ? ctx.fa[best.k] >= ctx.fb[best.k] : ctx.fa[best.k] <= ctx.fb[best.k]);
      const owner = ownerIsA ? ctx.nameA : ctx.nameB, other = ownerIsA ? ctx.nameB : ctx.nameA, ot = ownerIsA ? ctx.fb : ctx.fa;
      const own = owner + " " + third(ph(best.k, hiSide));
      const alsoOther = (hiSide ? ot[best.k] >= 2 : ot[best.k] <= -2) ? ", and " + other + " is not far behind" : "";
      const lb = lab(best.k); advantageLabel = lb; advantageOwner = owner;
      advantage = H.once(ctx, H.fill(H.pickBy(fr.advantage, seed + "|adv"), { edge: wd.edge, label: lb, Label: H.cap(lb), owner: own + alsoOther })) || "";
    }
    if (worst && fr.challenge){
      used.chal.add(worst.k);
      const needHi = worst.w >= 0, want = ph(worst.k, needHi), lb = lab(worst.k);
      const weakA = needHi ? ctx.fa[worst.k] < 1 : ctx.fa[worst.k] > -1, weakB = needHi ? ctx.fb[worst.k] < 1 : ctx.fb[worst.k] > -1;
      const aLess = needHi ? ctx.fa[worst.k] <= ctx.fb[worst.k] : ctx.fa[worst.k] >= ctx.fb[worst.k];   // who is further from what the world asks
      const slow = aLess ? ctx.nameA : ctx.nameB, quick = aLess ? ctx.nameB : ctx.nameA;
      let weakline;
      if (weakA && weakB) weakline = "neither of you naturally " + (want ? want : "has it");
      else if (weakA || weakB) weakline = (weakA ? ctx.nameA : ctx.nameB) + " does not naturally " + want + ", though " + (weakA ? ctx.nameB : ctx.nameA) + " does";
      else weakline = slow + " is slower than " + quick + " to " + want;
      challenge = H.once(ctx, H.fill(H.pickBy(fr.challenge, seed + "|chal"), { trap: wd.trap, label: lb, Label: H.cap(lb), weakline })) || "";
    }
    // survival: how well the pair covers what the world demands
    const demand = needKeys(needs);
    const sc = demand.length ? demand.reduce((t, k) => t + supply(ctx, k, needs[k]) * Math.abs(needs[k]), 0) / demand.reduce((t, k) => t + Math.abs(needs[k]), 0) : 0;
    // harder, more dangerous worlds ask for more: the bar moves with the world own difficulty and danger meters (universe attrs)
    const at = u.attrs || [], bar = S.SURVIVE + 0.5 * ((at[0] || 3) - 3) + 0.5 * ((at[2] || 3) - 3);
    const strong = sc >= bar;
    const survive = H.fill(wd.survive[strong ? 0 : 1], ctx.names);
    return { roles, gap, advantage, challenge, survive, strong, sc, advantageLabel, advantageOwner };
  };
  S.SURVIVE = 4.3;

  /* ------------------------------------------------------------ teams */
  S.depth.teamExtra = function(ctx, x, card){
    const t = x && x.t; if (!t) return null;
    const d = D(), needs = t.needs || {}, seed = ctx.seedKey + "|" + t.id, tl = d.teamLead || {};
    const idx = ctx._teamIdx = (ctx._teamIdx || 0) + 1;                        // each team card takes the next variant, so no line repeats
    const nth = arr => (arr && arr.length) ? arr[(H.hashStr(ctx.seedKey) + idx) % arr.length] : "";
    // who leads and who follows
    const takePoint = { initiative: 1.2, boldness: 0.6, persist: 0.3 };
    const gap = Math.abs(H.fscore(takePoint, ctx.fa) - H.fscore(takePoint, ctx.fb));
    let leads, follows = "";
    if (gap < 0.8){ leads = H.fill(nth(tl.shared), ctx.names); }
    else {
      leads = H.fill(nth(tl.lead), ctx.names);
      const of = ctx.leadF === ctx.fa ? ctx.fb : ctx.fa;
      const key = of.warmth >= 3 ? "followKeen" : of.autonomy >= 2 ? "followAsk" : "followEasy";
      follows = H.fill(nth(tl[key]), ctx.names);
    }
    // each person's part: the thing the team needs that they carry most
    const ks = needKeys(needs);
    const used = new Set(), usedP = new Set(), parts = [], cand = [];
    const own = (who, k) => (who === ctx.nameA ? ctx.fa[k] : ctx.fb[k]);
    ks.forEach(k => [ctx.nameA, ctx.nameB].forEach(who => cand.push({ k, who, v: Math.abs(needs[k]) * (needs[k] >= 0 ? own(who, k) : -own(who, k)) })));
    cand.sort((a, b) => b.v - a.v);
    const seenParts = ctx._teamParts = ctx._teamParts || new Set();      // a person is not given the same part on two team cards
    [true, false].forEach(strict => cand.forEach(c => { if (usedP.has(c.who) || used.has(c.k) || (strict && seenParts.has(c.who + "|" + c.k))) return; const text = H.once(ctx, H.pickBy([`${c.who} carries the team's ${lab(c.k)}: they ${ph(c.k, needs[c.k] >= 0)}.`, `The team's ${lab(c.k)} sits with ${c.who}, who would ${ph(c.k, needs[c.k] >= 0)}.`, `${c.who} is where the team gets its ${lab(c.k)}: they ${ph(c.k, needs[c.k] >= 0)}.`], seed + c.who + c.k)); if (!text) return; usedP.add(c.who); used.add(c.k); seenParts.add(c.who + "|" + c.k); parts.push({ who: c.who, label: label(c.k), text }); }));
    parts.sort((a, b) => (a.who === ctx.nameA ? -1 : 1) - (b.who === ctx.nameA ? -1 : 1));
    // friction: the need the two differ on most, or, if they agree, the one they both lack
    let friction = "";
    const gaps = ks.map(k => ({ k, g: Math.abs(ctx.fa[k] - ctx.fb[k]) * Math.abs(needs[k]) })).sort((a, b) => b.g - a.g);
    const usedFr = ctx._teamFr = ctx._teamFr || new Set();                  // a facet is named as the friction on one team card only, however many teams care about it
    const gap1 = gaps.find(x => x.g >= 1.6 && !usedFr.has(x.k));
    if (gap1){
      usedFr.add(gap1.k);
      const k = gap1.k, aHi = ctx.fa[k] >= ctx.fb[k], h = aHi ? ctx.nameA : ctx.nameB, l = aHi ? ctx.nameB : ctx.nameA;
      const fr3 = [`Friction would show up around ${lab(k)}: ${h} ${third(ph(k, true))}, while ${l} ${third(ph(k, false))}, and this team leans on that every day.`, `The rough edge is ${lab(k)}: ${h} ${third(ph(k, true))}, and ${l} ${third(ph(k, false))}. In ${THE(t.name)}, that is where the arguments would start.`, `${h} ${third(ph(k, true))} and ${l} ${third(ph(k, false))}, which is the one place where ${lab(k)} could pull you apart.`];
      friction = H.pickBy(fr3, seed + "|fr");
    } else {
      const lack = ks.map(k => ({ k, s: supply(ctx, k, needs[k]) })).sort((a, b) => a.s - b.s)[0];
      if (lack) friction = `There is little to argue about, which is its own risk: neither of you is strong on ${lab(lack.k)}, and this team would feel that first.`;
    }
    friction = friction ? (H.once(ctx, friction) || "") : "";
    // how outsiders would describe the pair, leaning on what this team values
    const OUT = d.outsider || {};
    const ranked = FK().filter(k => OUT[k]).map(k => ({ k, v: Math.abs(ctx.fm[k]) * (1 + Math.abs(needs[k] || 0)), side: ctx.fm[k] >= 0 ? "hi" : "lo" })).sort((a, b) => b.v - a.v);
    let outsiders = "", contrast = "";
    if (ranked.length >= 3 && d.outsiderFrames){
      // two teams can lean on the same three traits; the second then takes the next frame (and, failing that, the next three traits) rather than going without
      const frames = d.outsiderFrames, start = H.hashStr(seed + "|out");
      for (let off = 0; off + 3 <= Math.min(ranked.length, 6) && !outsiders; off += 3){
        const w = ranked.slice(off, off + 3).map(r => OUT[r.k][r.side]);
        for (let i = 0; i < frames.length && !outsiders; i++) outsiders = H.once(ctx, H.fill(frames[(start + i) % frames.length], { names: ctx.nameA + " and " + ctx.nameB, a: w[0], b: w[1], c: w[2] })) || "";
      }
      const g = FK().filter(k => OUT[k]).map(k => ({ k, g: Math.abs(ctx.fa[k] - ctx.fb[k]) })).sort((a, b) => b.g - a.g)[0];
      if (g && g.g >= 3.5 && d.outsiderContrast){
        const aHi = ctx.fa[g.k] >= ctx.fb[g.k];
        contrast = H.once(ctx, H.fill(H.pickBy(d.outsiderContrast, seed + "|con"), { h: aHi ? ctx.nameA : ctx.nameB, l: aHi ? ctx.nameB : ctx.nameA, ha: OUT[g.k].hi, la: OUT[g.k].lo })) || "";
      }
    }
    // effectiveness
    const demandK = ks, cov = demandK.length ? demandK.reduce((t, k) => t + supply(ctx, k, needs[k]) * Math.abs(needs[k]), 0) / demandK.reduce((t, k) => t + Math.abs(needs[k]), 0) : 0;
    const sc = 0.5 * (x.score || 0) + 0.5 * ((cov + 10) * 5), level = sc >= S.TEAM_LEVELS[0] ? 5 : sc >= S.TEAM_LEVELS[1] ? 4 : sc >= S.TEAM_LEVELS[2] ? 3 : sc >= S.TEAM_LEVELS[3] ? 2 : 1;   // the team fit, and how well the pair covers what it needs
    const vpool = (d.teamVerdict || {})[level] || [];
    let verdict = "";
    for (let i = 0; i < vpool.length && !verdict; i++) verdict = H.once(ctx, vpool[i]) || "";
    const strongK = ks.map(k => ({ k, s: supply(ctx, k, needs[k]) })).sort((a, b) => b.s - a.s);
    const note = strongK.length >= 2 ? `For ${THE(t.name)}, you are strongest on ${lab(strongK[0].k)} and thinnest on ${lab(strongK[strongK.length - 1].k)}.` : "";
    return { leads, follows, parts, friction, outsiders, contrast, effective: { cov, level, label: (d.teamLevel || {})[level] || "", text: verdict, note } };
  };
  S.TEAM_LEVELS = [74, 71, 68, 65];

  /* ------------------------------------------------------------ organizations: the culture the pair would suit, and the part each would hold */
  /* An organization is matched like a world: by what it rewards (its needs) against what the two people supply together. Cards come from different
     franchises and groups, so three cards are three different kinds of place. Nothing here feeds the compatibility score. */
  /* how well the two of them cover what each organization rewards (raw, before the variety adjustment); also read by .claude/tools/calibrate-variety-new.js */
  S.depth.orgFit = function(ctx){
    return (P().get("orgs") || []).map(o => {
      const ks = needKeys(o.needs), tot = ks.reduce((t, k) => t + Math.abs(o.needs[k]), 0) || 1;
      return { o, ks, cov: ks.reduce((t, k) => t + supply(ctx, k, o.needs[k]) * Math.abs(o.needs[k]), 0) / tot };
    });
  };
  S.depth.orgs = function(ctx, n, avoid){
    const fit = S.depth.orgFit(ctx); if (!fit.length) return [];
    // the same variety adjustment Party and the world / team ranking use (pack-variety.js), so no organization wins for everyone
    const E = F.experience, fp = [ctx.fa, ctx.fb].map(f => FK().map(k => Math.round(f[k] * 2)).join(",")).sort().join("|");
    const adj = E && E.variety ? E.variety(fp) : null;
    const rows = fit.map(r => Object.assign(r, { v: adj ? adj("orgs", r.o.id, r.cov) : r.cov + 0.6 * (H.hashStr(ctx.seedKey + "|org|" + r.o.id) % 1000) / 1000 })).sort((a, b) => b.v - a.v);
    const seenF = new Set(), seenG = new Set(), picked = [];
    rows.forEach(r => {
      if (picked.length >= (n || 3)) return;
      const f = r.o.franchise || r.o.name, g = r.o.group || f;
      if (seenF.has(f) || seenG.has(g)) return;
      if (avoid && avoid.has(String(r.o.name).replace(/^The\s+/i, "").toLowerCase())) return;       // an organization with the same name as a team already shown would only say it again
      seenF.add(f); seenG.add(g); picked.push(r);
    });
    return picked.map(r => {
      const o = r.o, needs = o.needs || {}, roles = o.roles || {};
      // the two parts the organization needs most, each taken by whoever is naturally stronger at it
      const cand = [];
      Object.keys(SLOT).forEach(slot => {
        const sa = H.fscore(SLOT[slot], ctx.fa), sb = H.fscore(SLOT[slot], ctx.fb), m = (sa + sb) / 2, nd = 2 * slotNeed(needs, slot);
        cand.push({ slot, who: ctx.nameA, v: sa - m + nd }, { slot, who: ctx.nameB, v: sb - m + nd });
      });
      cand.sort((a, b) => b.v - a.v);
      const usedW = new Set(), usedS = new Set(), parts = [];
      cand.forEach(c => { if (usedW.has(c.who) || usedS.has(c.slot) || !roles[c.slot]) return; usedW.add(c.who); usedS.add(c.slot); parts.push({ who: c.who, slot: c.slot, title: roles[c.slot] }); });
      parts.sort((a, b) => (a.who === ctx.nameA ? -1 : 1) - (b.who === ctx.nameA ? -1 : 1));
      const sk = r.ks.map(k => ({ k, s: supply(ctx, k, needs[k]) })).sort((a, b) => b.s - a.s);
      const note = sk.length >= 2 ? H.once(ctx, `For ${THE(o.name)}, you are strongest on ${lab(sk[0].k)} and thinnest on ${lab(sk[sk.length - 1].k)}.`) || "" : "";
      const text = k => (o[k] ? H.once(ctx, o[k]) || "" : "");
      return { id: o.id, name: o.name, franchise: o.franchise || "", group: o.group || "", blurb: text("blurb"), rewards: text("rewards"), struggles: text("struggles"), parts, culture: text("culture"), leadership: text("leadership"), communication: text("communication"), conflict: text("conflict"), note };
    });
  };

  /* ------------------------------------------------------------ situations: how each person would play one */
  S.depth.plays = function(ctx, s){
    const needs = s.needs || {}, SH = share();
    const rows = needKeys(needs).map(k => ({ k, g: Math.abs(ctx.fa[k] - ctx.fb[k]), w: Math.abs(needs[k]) }));
    const out = [];
    const hiLo = (k, h, l) => ({ hi: third(ph(k, true)), lo: third(ph(k, false)), h, l });
    const frames = [
      (k, v) => "On " + lab(k) + ", " + v.h + " " + v.hi + " while " + v.l + " " + v.lo + ".",
      (k, v) => v.h + " " + v.hi + "; " + v.l + " " + v.lo + ". That is the part of " + lab(k) + " that decides this one.",
      (k, v) => "This one turns on " + lab(k) + ": " + v.h + " " + v.hi + ", and " + v.l + " " + v.lo + "."
    ];
    rows.filter(r => r.g >= 2.5 && sgn(ctx.fa[r.k]) !== sgn(ctx.fb[r.k]) && behave()[r.k]).sort((a, b) => b.g * b.w - a.g * a.w).slice(0, 3).forEach(r => {
      const aHi = ctx.fa[r.k] >= ctx.fb[r.k];
      out.push({ k: r.k, text: frames[H.hashStr(ctx.seedKey + "|" + s.id + "|" + r.k) % frames.length](r.k, hiLo(r.k, aHi ? ctx.nameA : ctx.nameB, aHi ? ctx.nameB : ctx.nameA)) });
    });
    const bothF = [(p) => "Neither of you needs convincing here: both of you " + p + ".", (p) => "Both of you " + p + ", which is half the battle in this one.", (p) => "On this one the two of you start from the same place: you both " + p + "."];
    rows.filter(r => sgn(ctx.fa[r.k]) === sgn(ctx.fb[r.k]) && Math.min(Math.abs(ctx.fa[r.k]), Math.abs(ctx.fb[r.k])) >= 2 && SH[r.k]).sort((a, b) => b.w * Math.abs(ctx.fm[b.k]) - a.w * Math.abs(ctx.fm[a.k])).slice(0, 2).forEach(r => {
      out.push({ k: r.k, text: bothF[H.hashStr(ctx.seedKey + "|" + s.id + "|b" + r.k) % bothF.length](SH[r.k][ctx.fm[r.k] > 0 ? "hi" : "lo"]) });
    });
    return out;
  };

  /* ------------------------------------------------------------ bridges: each chapter leads into the next */
  const THE = n => String(n || "").replace(/^The\s+/, "the ");
  const fillIfKnown = (variants, tokens, seed) => {
    const start = H.hashStr(seed);
    for (let i = 0; i < variants.length; i++){
      const v = variants[(start + i) % variants.length], names = (v.match(/\{(\w+)\}/g) || []).map(s => s.slice(1, -1));
      if (names.every(n => tokens[n] != null && tokens[n] !== "")) return H.fill(v, tokens);
    }
    return "";
  };
  S.depth.bridges = function(ctx, info){
    const b = (D().bridges) || {}, seed = ctx.seedKey, out = { worlds: "", teams: "", situations: "", ending: "" };
    const cross = info.cross, w = info.world, t = info.team, tw = w && w.depth;
    const need = tw && tw.advantageLabel, strong = tw && tw.advantageOwner;
    const base = { x: cross && cross.nickA, y: cross && cross.nickB, w: w && THE(w.name), W: w && w.name, t: t && THE(t.name), need, Need: need && H.cap(need), strong, n: info.sit && info.sit.n, g: info.sit && info.sit.g, r: info.sit && info.sit.r, score: info.score };
    out.worlds = fillIfKnown(b.worlds || [], base, seed + "|bw");
    out.teams = fillIfKnown(b.teams || [], base, seed + "|bt");
    out.situations = fillIfKnown(b.situations || [], base, seed + "|bs");
    out.ending = fillIfKnown(b.ending || [], base, seed + "|be");
    Object.keys(out).forEach(k => { if (out[k] && !H.once(ctx, out[k])) out[k] = ""; });
    return out;
  };

  /* ------------------------------------------------------------ the last page: the narrator closes the book */
  const NUM_ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
  const NUM_TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
  const inWords = n => { n = Math.max(0, Math.min(100, Math.round(n))); if (n === 100) return "one hundred"; if (n < 20) return NUM_ONES[n]; return NUM_TENS[Math.floor(n / 10)] + (n % 10 ? "-" + NUM_ONES[n % 10] : ""); };
  /* Two to four paragraphs written from THIS pair's report, never a fixed ending: the score in words, their strongest and weakest area, how they talk and
     how they disagree (from their own traits), the characters they resemble, the world and team they met, and the trait that runs through all of it.
     info: { score, categories: [{ name, score }], cross, world, team }. Adds no score of its own. */
  S.depth.finale = function(ctx, info){
    const f = H.data("finale"); if (!f || !info) return null;
    const seed = ctx.seedKey + "|finale", A = ctx.nameA, B = ctx.nameB;
    const score = Math.round(info.score), band = score >= 75 ? "veryHigh" : score >= 60 ? "high" : score >= 40 ? "medium" : "low";
    const cats = (info.categories || []).filter(c => c && c.name).slice().sort((a, b) => b.score - a.score);
    const strong = cats[0] ? String(cats[0].name).toLowerCase() : "", weak = cats.length > 1 ? String(cats[cats.length - 1].name).toLowerCase() : "";
    // the trait that runs through the pair: what they share most strongly, or failing that where they differ most
    const keys = FK().filter(k => behave()[k]);
    const sharedK = keys.map(k => ({ k, v: sgn(ctx.fa[k]) === sgn(ctx.fb[k]) ? Math.min(Math.abs(ctx.fa[k]), Math.abs(ctx.fb[k])) : 0 })).sort((a, b) => b.v - a.v)[0];
    const gapK = keys.map(k => ({ k, v: Math.abs(ctx.fa[k] - ctx.fb[k]) })).sort((a, b) => b.v - a.v)[0];
    const themeKey = sharedK && sharedK.v >= 2 ? sharedK.k : (gapK ? gapK.k : null), theme = themeKey ? lab(themeKey) : "";
    // how they talk and how they disagree, in their own traits
    const SH = share();
    const clause = pool => {
      const rows = pool.filter(k => keys.indexOf(k) >= 0).map(k => ({ k, gap: Math.abs(ctx.fa[k] - ctx.fb[k]), same: sgn(ctx.fa[k]) === sgn(ctx.fb[k]) ? Math.min(Math.abs(ctx.fa[k]), Math.abs(ctx.fb[k])) : 0 }));
      const g = rows.slice().sort((a, b) => b.gap - a.gap)[0], s = rows.slice().sort((a, b) => b.same - a.same)[0];
      if (g && g.gap >= 2){ const aHi = ctx.fa[g.k] >= ctx.fb[g.k], hi = aHi ? A : B, lo = aHi ? B : A; return `${hi} ${third(ph(g.k, true))}, while ${lo} ${third(ph(g.k, false))}`; }
      if (s && s.same >= 0.5 && SH[s.k]) return `${A} and ${B} both ${SH[s.k][ctx.fm[s.k] >= 0 ? "hi" : "lo"]}`;
      if (g && g.gap > 0.3){ const aHi = ctx.fa[g.k] >= ctx.fb[g.k], hi = aHi ? A : B, lo = aHi ? B : A; return `${hi} ${third(ph(g.k, true))}, while ${lo} ${third(ph(g.k, false))}`; }
      return "";
    };
    const talk = clause(["warmth", "social", "humor", "analysis", "trust", "optimism"]), fight = clause(["compete", "patience", "steadiness", "flex", "boldness", "autonomy"]);
    // the world and team they met, and who plays which part there
    const w = info.world, t = info.team, cross = info.cross, rl = w && w.depth && w.depth.roles && w.depth.roles.length === 2 ? w.depth.roles : null;
    const part = r => "the " + lcl(String(r.title).replace(/^The\s+/, ""));
    const tk = { A, B, x: cross && cross.nickA, y: cross && cross.nickB, score: inWords(score), Score: H.cap(inWords(score)), strong, weak, theme, Theme: H.cap(theme), talk, Talk: talk, fight, Fight: fight,
      world: w && THE(w.name), team: t && THE(t.name), cast: rl ? `${rl[0].who} would be ${part(rl[0])} and ${rl[1].who} ${part(rl[1])}` : "" };
    const p1 = fillIfKnown((f.openers[band] || []).filter(v => strong || !/\{strong\}/.test(v)), tk, seed + "|o");
    const mid = talk && fight ? fillIfKnown(f.middles || [], tk, seed + "|m") : talk ? fillIfKnown(f.talkOnly || [], tk, seed + "|m") : fight ? fillIfKnown(f.fightOnly || [], tk, seed + "|m") : "";
    const cast = w && t ? fillIfKnown(f.casts || [], tk, seed + "|c") : (t ? fillIfKnown(f.castsNoWorld || [], tk, seed + "|c") : (w ? fillIfKnown(f.castsNoTeam || [], tk, seed + "|c") : fillIfKnown(f.castsBare || [], tk, seed + "|c")));
    const ref = theme ? fillIfKnown(f.reflections || [], tk, seed + "|r") : "";
    const end = fillIfKnown((f.endings || {})[band] || [], tk, seed + "|e");
    const paragraphs = [p1, mid, cast, [ref, end].filter(Boolean).join(" ")].filter(Boolean);
    paragraphs.forEach((p, i) => { if (!H.once(ctx, p)) paragraphs[i] = ""; });
    const out = paragraphs.filter(Boolean);
    return out.length >= 2 ? { title: f.title, paragraphs: out } : null;
  };
})(Forge);
