/* =========================================================================
   FORGE COMPAT - two-person relationship model.

   pair(a,b)      -> shared "pair features" every other piece reads from
   axes           -> 12 transparent 0..100 scores, each a weighted list of
                     TERMS over facets (so any number is traceable)
   MODES          -> First Contact / Bond / Friendship: different WEIGHTS,
                     different interpretations, different report sections
   shape(mode)    -> the SHAPE of the relationship (the main story). The
                     weighted overall is a footnote, never the headline.

   Similarity is not always good and difference is not always bad: the
   Shared and Complementary axes are scored separately, and several axes
   reward a difference (e.g. one fast decider + one analyser).

   DOUBLE-COUNTING GUARD: every axis term lists the facets it reads. A
   mode's EXPOSURE of a facet is the sum over axes of (axis weight x the
   share of that axis made of that facet). tests/compat.test.js asserts no
   facet's exposure exceeds EXPOSURE_CAP in any mode.
   ========================================================================= */
(function(F){
  "use strict";
  const C = F.compat = {};
  const U = k => v => F.toUnit(v);                     // RAW -> 0..1
  const hi = v => F.clamp((F.num(v, 0) - 1) / 7, 0, 1); // how strongly "present" (0 below +1, 1 at +8)
  C.EXPOSURE_CAP = 0.2;

  /* ---------------- pair features ---------------- */
  C.pair = function(a, b, names){
    names = names || {};
    const A = { name: F.capText(String(names.a != null ? names.a : (a.identity && a.identity.name) || "Person A"), 40) || "Person A", p: a, f: a.facets };
    const B = { name: F.capText(String(names.b != null ? names.b : (b.identity && b.identity.name) || "Person B"), 40) || "Person B", p: b, f: b.facets };
    const pf = { A, B };
    pf.al = k => 1 - Math.abs(A.f[k] - B.f[k]) / 20;                      // alignment of one facet, 0..1
    pf.diff = k => A.f[k] - B.f[k];
    pf.hi = k => [hi(A.f[k]), hi(B.f[k])];
    pf.unit = k => [F.toUnit(A.f[k]), F.toUnit(B.f[k])];
    pf.bothHigh = k => Math.min(hi(A.f[k]), hi(B.f[k]));
    pf.maxHi = k => Math.max(hi(A.f[k]), hi(B.f[k]));
    pf.owner = (k, margin) => { const d = A.f[k] - B.f[k]; const m = margin == null ? 2.5 : margin; return d >= m ? "A" : d <= -m ? "B" : "tie"; };
    pf.who = k => pf.owner(k) === "A" ? A : pf.owner(k) === "B" ? B : null;
    pf.higher = k => A.f[k] >= B.f[k] ? A : B;
    pf.lower = k => A.f[k] >= B.f[k] ? B : A;
    // cross(k1,k2): one person strong in k1 while the other is strong in k2, and not both strong in both
    pf.cross = (k1, k2) => {
      const x = Math.min(hi(A.f[k1]), hi(B.f[k2])) * (1 - 0.5 * Math.min(hi(A.f[k2]), hi(B.f[k1])));
      const y = Math.min(hi(B.f[k1]), hi(A.f[k2])) * (1 - 0.5 * Math.min(hi(B.f[k2]), hi(A.f[k1])));
      return Math.max(x, y);
    };
    // a "who is who" for a cross pair (who brings k1, who brings k2)
    pf.crossWho = (k1, k2) => (Math.min(hi(A.f[k1]), hi(B.f[k2])) >= Math.min(hi(B.f[k1]), hi(A.f[k2]))) ? { k1: A, k2: B } : { k1: B, k2: A };
    pf.gaps = F.FACET_KEYS.map(k => ({ facet: k, diff: A.f[k] - B.f[k], abs: Math.abs(A.f[k] - B.f[k]) })).sort((x, y) => y.abs - x.abs);
    pf.confidence = (function(){
      const ca = a.confidence.overall, cb = b.confidence.overall;
      const vals = [ca, cb].filter(v => v != null);
      const pct = vals.length ? Math.round(F.mean(vals)) : null;
      const low = vals.some(v => v < 50);
      const shallow = [a.depth, b.depth].includes("short");
      return { pct, level: F.confidenceLevel(pct), low, shallow,
        note: low || shallow ? "At least one of these profiles is a quick or low-confidence read, so treat this as a first impression rather than a settled picture." : null };
    })();
    pf.identical = F.FACET_KEYS.every(k => Math.abs(A.f[k] - B.f[k]) < 0.01);
    return pf;
  };

  /* ---------------- axes ---------------- */
  const term = (w, facets, fn) => ({ w, facets, fn });
  const mean2 = (x) => (x[0] + x[1]) / 2;
  const COMP = [["invent", "structure"], ["analysis", "initiative"], ["boldness", "steadiness"], ["warmth", "analysis"], ["flex", "structure"], ["explore", "persist"], ["initiative", "patience"], ["social", "autonomy"]];
  const open = f => F.toUnit((f.trust + f.warmth + f.social) / 3);
  const speed = f => (f.initiative + f.boldness - f.analysis) / 3;
  const closeness = f => (f.social + f.warmth - f.autonomy) / 3;

  C.AXES = {
    shared:        { label: "Shared traits",         terms: F.FACET_KEYS.map(k => term(1 / F.FACET_KEYS.length, [k], pf => pf.al(k))) },
    complementary: { label: "Complementary traits",  transform: s => Math.min(1, s * 2.1), terms: COMP.map(([a, b]) => term(1 / COMP.length, [a, b], pf => pf.cross(a, b))) },
    communication: { label: "Communication",         terms: [
      term(0.30, ["social"], pf => pf.al("social")), term(0.25, ["warmth"], pf => pf.al("warmth")), term(0.20, ["analysis"], pf => pf.al("analysis")),
      term(0.25, ["trust", "warmth", "social"], pf => Math.min(open(pf.A.f), open(pf.B.f)))] },
    decision:      { label: "Decision making",       terms: [
      term(0.35, ["initiative", "boldness", "analysis"], pf => 1 - Math.abs(speed(pf.A.f) - speed(pf.B.f)) / 20),
      term(0.25, ["analysis", "initiative"], pf => Math.min(1, pf.cross("analysis", "initiative") * 1.6)),
      term(0.20, ["autonomy"], pf => 1 - 0.85 * pf.bothHigh("autonomy")),
      term(0.20, ["warmth"], pf => F.mean(pf.unit("warmth")))] },
    emotional:     { label: "Emotional dynamics",    terms: [
      term(0.35, ["warmth"], pf => F.mean(pf.unit("warmth"))),
      term(0.35, ["steadiness"], pf => { const u = pf.unit("steadiness"); return 0.7 * Math.max(u[0], u[1]) + 0.3 * Math.min(u[0], u[1]); }),
      term(0.30, ["optimism"], pf => pf.al("optimism"))] },
    energy:        { label: "Energy",                terms: [
      term(0.40, ["social"], pf => pf.al("social")), term(0.30, ["initiative"], pf => pf.al("initiative")),
      term(0.15, ["optimism"], pf => pf.al("optimism")), term(0.15, ["steadiness"], pf => pf.al("steadiness"))] },
    trust:         { label: "Trust",                 terms: [
      term(0.40, ["trust"], pf => Math.min.apply(null, pf.unit("trust"))),
      term(0.30, ["structure", "persist"], pf => F.mean([F.toUnit((pf.A.f.structure + pf.A.f.persist) / 2), F.toUnit((pf.B.f.structure + pf.B.f.persist) / 2)])),
      term(0.30, ["warmth"], pf => F.mean(pf.unit("warmth")))] },
    conflict:      { label: "Conflict",              terms: [
      term(0.40, ["patience", "steadiness"], pf => F.mean([F.toUnit((pf.A.f.patience + pf.A.f.steadiness) / 2), F.toUnit((pf.B.f.patience + pf.B.f.steadiness) / 2)])),
      term(0.30, ["boldness", "warmth"], pf => 1 - F.clamp(Math.abs(pf.diff("boldness")) / 16, 0, 1) * 0.6 - F.clamp(Math.abs(pf.diff("warmth")) / 16, 0, 1) * 0.3),
      term(0.30, ["compete"], pf => 1 - 0.8 * pf.bothHigh("compete"))] },
    activities:    { label: "Activities",            terms: [
      term(0.30, ["explore"], pf => pf.al("explore")), term(0.20, ["boldness"], pf => pf.al("boldness")), term(0.20, ["humor"], pf => pf.al("humor")),
      term(0.15, ["social"], pf => pf.al("social")), term(0.15, ["invent", "structure"], pf => Math.min(1, 0.4 + pf.cross("invent", "structure")))] },
    values:        { label: "Values",                terms: [
      term(0.25, ["warmth"], pf => pf.al("warmth")), term(0.20, ["structure"], pf => pf.al("structure")), term(0.20, ["explore"], pf => pf.al("explore")),
      term(0.20, ["trust"], pf => pf.al("trust")), term(0.15, ["optimism"], pf => pf.al("optimism"))] },
    independence:  { label: "Independence",          terms: [
      term(0.70, ["social", "warmth", "autonomy"], pf => 1 - F.clamp(Math.abs(closeness(pf.A.f) - closeness(pf.B.f)) / 20, 0, 1)),
      term(0.30, ["autonomy"], pf => pf.al("autonomy"))] },
    adaptability:  { label: "Adaptability",          terms: [
      term(0.50, ["flex"], pf => Math.min.apply(null, pf.unit("flex"))), term(0.30, ["flex"], pf => pf.al("flex")), term(0.20, ["explore"], pf => F.mean(pf.unit("explore")))] },
  };
  C.AXIS_KEYS = Object.keys(C.AXES);

  C.scoreAxes = function(pf){
    const out = {};
    C.AXIS_KEYS.forEach(k => {
      const ax = C.AXES[k];
      let s = 0, wsum = 0;
      ax.terms.forEach(t => { s += t.w * F.clamp(t.fn(pf), 0, 1); wsum += t.w; });
      let v = wsum ? s / wsum : 0;
      if (ax.transform) v = ax.transform(v);
      out[k] = Math.round(F.clamp(v, 0, 1) * 100);
    });
    return out;
  };

  /* ---------------- modes ---------------- */
  C.MODES = {
    "first-contact": { label: "First Contact", tagline: "How an early meeting is likely to feel", audience: "someone you've just met", weights: {
      communication: 0.20, energy: 0.16, activities: 0.16, shared: 0.12, adaptability: 0.08, complementary: 0.08, emotional: 0.05, values: 0.05, decision: 0.04, trust: 0.03, conflict: 0.03 } },
    "bond":          { label: "Bond", tagline: "The long-term shape of a close relationship", audience: "a partner", weights: {
      emotional: 0.14, conflict: 0.14, trust: 0.13, communication: 0.12, values: 0.10, independence: 0.09, decision: 0.09, adaptability: 0.07, complementary: 0.06, energy: 0.03, shared: 0.03 } },
    "friendship":    { label: "Friendship", tagline: "What it's like to be friends or teammates", audience: "a friend or teammate", weights: {
      activities: 0.16, energy: 0.14, communication: 0.11, trust: 0.11, adaptability: 0.10, shared: 0.09, complementary: 0.08, conflict: 0.08, decision: 0.05, emotional: 0.05, independence: 0.03 } },
  };
  C.MODE_KEYS = Object.keys(C.MODES);
  // weights are stored as above; normalized here so they always sum to exactly 1
  C.normalizedWeights = function(mode){
    const w = C.MODES[mode].weights; const total = F.sum(Object.values(w));
    const out = {}; Object.keys(w).forEach(k => { out[k] = w[k] / total; }); return out;
  };

  /* Exposure of each facet to a mode's overall = sum over axes of
     (normalized axis weight x the facet's share of that axis's terms). */
  C.exposure = function(mode){
    const nw = C.normalizedWeights(mode); const ex = {};
    Object.keys(nw).forEach(axisKey => {
      const ax = C.AXES[axisKey]; const tw = F.sum(ax.terms.map(t => t.w));
      ax.terms.forEach(t => { t.facets.forEach(k => { ex[k] = (ex[k] || 0) + nw[axisKey] * (t.w / tw) / t.facets.length; }); });
    });
    return ex;
  };

  /* ---------------- shapes (the main story) ---------------- */
  const SHAPES = [
    { id: "mirror",      when: (a, pf) => F.clamp((a.shared - 68) / 14, 0, 1) * F.clamp((52 - a.complementary) / 18, 0, 1) },
    { id: "puzzle",      when: (a, pf) => F.clamp((a.complementary - 55) / 20, 0, 1) * F.clamp((70 - a.shared) / 15, 0, 1) },
    { id: "spark-anchor", when: (a, pf) => F.clamp((Math.abs(pf.diff("initiative")) - 3) / 5, 0, 1) * F.clamp((a.trust - 50) / 20, 0, 1) * F.clamp((Math.abs(pf.diff("steadiness")) - 1.5) / 4, 0, 1) },
    { id: "parallel",    when: (a, pf) => F.clamp((a.independence - 62) / 18, 0, 1) * pf.bothHigh("autonomy") },
    { id: "push-pull",   when: (a, pf) => F.clamp((50 - a.conflict) / 15, 0, 1) * F.clamp((Math.abs(pf.diff("boldness")) - 4) / 5, 0, 1) },
    { id: "easy-tide",   when: (a, pf) => F.clamp((F.mean(Object.values(a)) - 66) / 12, 0, 1) * F.clamp((Math.min.apply(null, Object.values(a)) - 40) / 15, 0, 1) },
    { id: "slow-burn",   when: (a, pf) => F.clamp((a.trust - 58) / 18, 0, 1) * F.clamp((62 - a.energy) / 18, 0, 1) * F.clamp((60 - a.communication) / 20, 0, 1) },
    { id: "fireworks",   when: (a, pf) => F.clamp((a.energy - 68) / 16, 0, 1) * F.clamp((55 - a.emotional) / 16, 0, 1) },
    { id: "odd-couple",  when: (a, pf) => F.clamp((45 - a.shared) / 15, 0, 1) * F.clamp((a.complementary - 45) / 20, 0, 1) },
    { id: "workshop",    when: (a, pf) => F.clamp((a.activities - 68) / 15, 0, 1) * F.clamp((a.communication - 55) / 20, 0, 1) },
  ];
  C.SHAPE_TEXT = {
    mirror:       { "first-contact": ["Familiar faces", "You'll probably recognise yourselves in each other quickly. Easy to start, so the work is staying curious about what's different."], bond: ["Two of a kind", "Similar wiring means a lot goes unsaid and unexplained. The risk is shared blind spots, since neither of you may notice what the other would."], friendship: ["Same wavelength", "You'll tend to want the same things at the same time. Easy fun; plan deliberately for the things neither of you is naturally good at."] },
    puzzle:       { "first-contact": ["Different pieces", "Early conversation may feel a little unfamiliar, which is often what makes it interesting. Each of you has what the other lacks."], bond: ["A good fit of differences", "Your strengths sit in different places. Done well that's a real asset; done badly it's two people misreading each other's defaults."], friendship: ["Better together", "Between you, more bases are covered than either of you would cover alone. The friendship works best when each leads where they're strongest."] },
    "spark-anchor": { "first-contact": ["Spark and steadiness", "One of you brings momentum and the other keeps things grounded. Expect different paces early on."], bond: ["Spark and anchor", "One of you pushes forward while the other steadies. A strong pairing when both feel valued for it; tiring when one is cast permanently in a role."], friendship: ["The starter and the steadier", "One of you proposes things, one of you makes them actually happen. That works as long as the second person's contribution is noticed."] },
    parallel:     { "first-contact": ["Comfortable distance", "You both value independence, so don't expect instant closeness. Respecting each other's space is the quickest way in."], bond: ["Parallel lines", "Two independent people can build a lot side by side. Closeness will need to be chosen on purpose rather than assumed."], friendship: ["Doing our own thing, together", "A friendship with plenty of room. It stays alive through deliberate check-ins rather than constant contact."] },
    "push-pull":  { "first-contact": ["Different gears", "Your approaches to speaking up differ, which can feel like friction at the start even when there's goodwill."], bond: ["Push and pull", "One of you tends to press and the other to retreat when things get tense. Naming the pattern is the single most useful thing you can do about it."], friendship: ["Direct meets careful", "One of you says it straight and the other prefers to smooth it over. Fine for fun, tricky for disagreements."] },
    "easy-tide":  { "first-contact": ["Easy tide", "Most things line up on paper: pace, tone and interests. Early conversation will probably flow."], bond: ["Easy tide", "Few obvious fault lines. The challenge is complacency: even good fits need talking about what matters."], friendship: ["Natural friends", "Little to work around. The friendship should be low-maintenance and easy to enjoy."] },
    "slow-burn":  { "first-contact": ["Slow start", "Not a spark at first sight, but the foundations are sound. Give it a second meeting before judging."], bond: ["Slow burn", "Trust is the strong suit and it builds quietly. Don't mistake a low-key start for a low ceiling."], friendship: ["The long haul", "This is the kind of friendship that gets better with time rather than intensity."] },
    fireworks:    { "first-contact": ["Fireworks", "Big energy together. Great start, and worth checking that you're both still comfortable once the novelty settles."], bond: ["Fireworks", "High energy together, with a less even emotional landing. Exciting; keep an eye on how each of you recovers."], friendship: ["Chaos in a good way", "Plenty of energy and fun. Make sure the quieter moments are taken care of too."] },
    "odd-couple": { "first-contact": ["The unexpected pair", "You're quite different on paper, and the differences are useful ones. Curiosity will get you further than comparison."], bond: ["The odd couple", "Different instincts in most places, but they tend to supply what the other lacks. It takes explanation and generosity."], friendship: ["Unlikely friends", "You wouldn't swap each other, and that's what makes it work."] },
    workshop:     { "first-contact": ["Instant projects", "Shared interests and good communication: you'll probably end up planning something by the end of the first conversation."], bond: ["Partners in projects", "You do things together well. Make sure the relationship has room that isn't about doing."], friendship: ["The workshop", "Doing things together is the heart of this friendship. Gaming, building, planning, it'll all go well."] },
    blend:        { "first-contact": ["A blend", "No single pattern stands out. Expect it to feel like itself rather than like a type."], bond: ["A blend", "A mix of similarities and differences without one dominant story. The specifics below matter more than the label."], friendship: ["A mixed blend", "Several things work and a few don't, with no single story. The details below are more useful than the headline."] },
  };
  C.chooseShape = function(axes, pf, mode){
    const scored = SHAPES.map(s => ({ id: s.id, s: s.when(axes, pf) })).filter(x => x.s > 0.12).sort((a, b) => b.s - a.s);
    const id = scored.length ? scored[0].id : "blend";
    const txt = C.SHAPE_TEXT[id][mode];
    return { id, name: txt[0], text: txt[1], strength: scored.length ? F.round1(scored[0].s * 100) / 100 : 0, alsoRead: scored.slice(1, 3).map(x => x.id) };
  };

  /* ---------------- full computation ---------------- */
  /* a/b: normalized profiles. names: {a,b}. mode: one of MODE_KEYS. */
  C.compute = function(a, b, mode, names){
    if (!a || !b || !a.ok || !b.ok) return { ok: false, reason: "two valid profiles are needed" };
    if (!C.MODES[mode]) return { ok: false, reason: "unknown mode" };
    const pf = C.pair(a, b, names);
    const axes = C.scoreAxes(pf);
    const nw = C.normalizedWeights(mode);
    const overall = Math.round(F.sum(Object.keys(nw).map(k => nw[k] * axes[k])));
    const shape = C.chooseShape(axes, pf, mode);
    const ranked = C.AXIS_KEYS.map(k => ({ axis: k, label: C.AXES[k].label, score: axes[k], weight: F.round1(F.clamp01(nw[k] || 0) * 1000) / 1000 })).sort((x, y) => y.score - x.score);
    const important = ranked.filter(r => r.weight >= 0.08);
    return { ok: true, mode, pf, axes, overall, overallNote: "A single summary number. The shape and the specifics below are the real story.", shape, ranked,
      strongest: important.slice(0, 3), weakest: important.slice(-3).reverse(), confidence: pf.confidence, identical: pf.identical,
      axisReads: C.AXIS_KEYS.reduce((o, k) => { o[k] = C.axisRead(k, axes[k], pf); return o; }, {}) };
  };

  /* One-line, evidence-citing reading of each axis. */
  C.axisRead = function(k, score, pf){
    const A = pf.A.name, B = pf.B.name;
    const lvl = score >= 70 ? "strong" : score >= 55 ? "good" : score >= 42 ? "mixed" : "a stretch";
    const reads = {
      shared: () => { const top = F.FACET_KEYS.filter(f => pf.bothHigh(f) >= 0.5).sort((x, y) => pf.bothHigh(y) - pf.bothHigh(x)).slice(0, 2).map(f => F.facetLabel(f).toLowerCase()); return top.length ? `You both lean strongly toward ${F.listJoin(top)}.` : `You overlap in places but don't share one strong lean.`; },
      complementary: () => { const best = COMP.map(([x, y]) => ({ x, y, v: pf.cross(x, y) })).sort((p, q) => q.v - p.v)[0]; if (!best || best.v < 0.25) return "Few obvious places where one of you covers the other."; const w = pf.crossWho(best.x, best.y); return `${w.k1.name} brings ${F.facetLabel(best.x).toLowerCase()}; ${w.k2.name} brings ${F.facetLabel(best.y).toLowerCase()}.`; },
      communication: () => `Your social style is ${pf.al("social") >= 0.75 ? "similar" : "different"} and your directness vs warmth is ${pf.al("warmth") >= 0.75 && pf.al("analysis") >= 0.75 ? "well matched" : "not identical"}.`,
      decision: () => { const s = speed(pf.A.f) - speed(pf.B.f); return Math.abs(s) >= 3 ? `${s > 0 ? A : B} tends to decide faster; ${s > 0 ? B : A} wants more time.` : "You decide at a similar pace."; },
      emotional: () => `${pf.higher("steadiness").name} is the steadier of the two; ${pf.higher("warmth").name} is the warmer.`,
      energy: () => pf.al("social") >= 0.75 ? "Similar social energy, so plans are easy to agree on." : `${pf.higher("social").name} wants more company than ${pf.lower("social").name}.`,
      trust: () => `Trust is ${pf.unit("trust").every(u => u >= 0.62) ? "extended readily on both sides" : "likely to build with time"}.`,
      conflict: () => Math.abs(pf.diff("boldness")) >= 5 ? `${pf.higher("boldness").name} is more likely to say it straight; ${pf.lower("boldness").name} more likely to hold back.` : "You approach disagreement in similar ways.",
      activities: () => pf.al("explore") >= 0.75 ? "Similar appetite for trying new things." : `${pf.higher("explore").name} will usually want more novelty.`,
      values: () => pf.al("warmth") >= 0.8 && pf.al("trust") >= 0.8 ? "Closely aligned on how people should treat each other." : "Some differences in what matters most.",
      independence: () => Math.abs(closeness(pf.A.f) - closeness(pf.B.f)) < 4 ? "You want a similar amount of closeness." : `${closeness(pf.A.f) > closeness(pf.B.f) ? A : B} wants more closeness than ${closeness(pf.A.f) > closeness(pf.B.f) ? B : A}.`,
      adaptability: () => `${pf.lower("flex").name} is the one who may need more notice when plans change.`,
    };
    return { score, level: lvl, text: reads[k]() };
  };

  /* ---------------- predict before you compare ---------------- */
  C.PREDICTIONS = [
    { id: "agree", label: "We'll agree on most things" }, { id: "complement", label: "We'll complement each other" }, { id: "clash", label: "We'll clash a lot" },
    { id: "similar", label: "We're weirdly similar" }, { id: "understand", label: "They'll understand me easily" }, { id: "hard-comm", label: "Our communication will be difficult" },
  ];
  C.pairKey = function(codeA, codeB){ return F.hashString([String(codeA), String(codeB)].sort().join("|")).toString(36); };
  /* Judge a prediction against the computed model. Returns a friendly note, never a score for the person. */
  C.resolvePrediction = function(choice, res){
    if (!res || !res.ok) return null;
    const a = res.axes;
    const tests = {
      agree: [a.values >= 65 && a.shared >= 58, "You expected to see eye to eye, and the model agrees: your values and style line up."],
      complement: [a.complementary >= 55 && a.shared <= 68, "You expected differences that help, and the model sees them: you cover different ground."],
      clash: [a.conflict <= 45 || C.AXIS_KEYS.filter(k => a[k] < 40).length >= 3, "You expected friction, and the model does see some rough edges worth knowing about."],
      similar: [a.shared >= 72, "You expected to be very alike, and you are, on most of the traits Forge measures."],
      understand: [a.communication >= 68, "You expected to be understood easily, and your communication styles do line up well."],
      "hard-comm": [a.communication <= 46, "You expected communication to take work, and the model agrees it will need some care."],
    };
    const t = tests[choice]; if (!t) return null;
    return { shape: res.shape.id, matched: !!t[0], note: t[0] ? t[1] : "Forge reads it differently from your guess. Neither is wrong: your guess is what you've lived, the model is what the profiles suggest. That gap is the interesting part." };
  };
})(Forge);
if (typeof module !== "undefined" && module.exports) module.exports = Forge;
