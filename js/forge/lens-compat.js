/* =========================================================================
   FORGE LENS COMPATIBILITY - one compatibility score PER LENS (Friendship, Romance, Everyday).

   The old engine produced one universal percentage and the lenses re-told it. This module gives every
   lens its own score. Nothing here is derived from the universal score: each lens reads the same 17
   behavioural facets of the two people (core.js) but asks a different set of questions and weighs them
   differently, so the same pair can honestly be a great friendship, a rocky romance and an easy everyday fit.

   HOW A LENS SCORE IS BUILT
   1. Seven "living together" signals answer the human questions: will they enjoy each other, will they argue
      constantly, does one overwhelm the other, does one steady the other, do the strengths complement, are
      the disagreements healthy, can one understand the other. They look at how the two personalities
      INTERACT (clashes, complements, who is louder, who is steadier), not just how far apart the numbers are.
   2. Each lens has its own aspects (friendship: shared interests, adventure, humour, trust ...; romance:
      closeness, affection, long-term, conflict ...; everyday: teamwork, reliability, boundaries ...), each a
      small recipe of the same interaction terms over different facets.
   3. The lens score is the weighted mean of its aspects and signals, stretched onto 0-100 with a per-lens
      calibration. Pure and deterministic: same two people, same lens, same answer, in either order.

   The packs (pack-lenses.js) still own the wording. The aspects here that name a pack `cat` supply the level
   for that section, so a section can never disagree with the lens score above it.

   Names passed in must already be HTML-safe; returned text is meant to be inserted as HTML.
   ========================================================================= */
(function(F){
  "use strict";
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const mean = a => a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0;
  const u = x => clamp((x + 10) / 20, 0, 1);               // facet (-10..10) -> 0..1
  const relu = x => Math.max(0, x);
  const fill = (t, m) => String(t == null ? "" : t).replace(/\{(\w+)\}/g, (_, k) => (m[k] != null ? m[k] : ""));
  const facetsOf = p => (p && p.facets) ? p.facets : F.computeFacets((p && p.normDims) || {});
  const LC = F.lensCompat = {};

  /* ------------------------------------------------------------ interaction terms (each returns 0..1, 1 = good) */
  const T = {
    /* alike on these facets */
    match: (a, b, ks) => mean(ks.map(k => 1 - Math.pow(Math.min(1, Math.abs(a[k] - b[k]) / 9), 1.5))),
    /* BOTH bring it: the weaker of the two counts most */
    both: (a, b, ks) => mean(ks.map(k => 0.65 * u(Math.min(a[k], b[k])) + 0.35 * u((a[k] + b[k]) / 2))),
    /* at least ONE brings it (the pair is covered) */
    cover: (a, b, ks) => mean(ks.map(k => 0.7 * u(Math.max(a[k], b[k])) + 0.3 * u((a[k] + b[k]) / 2))),
    /* the pair's average */
    mean: (a, b, ks) => mean(ks.map(k => u((a[k] + b[k]) / 2))),
    /* NOT both strongly high (two strong wills collide; one is fine) */
    calm: (a, b, ks) => mean(ks.map(k => 1 - Math.sqrt(relu(a[k]) * relu(b[k])) / 10)),
    /* one has the first facet, the other the second (either way round): they cover each other */
    cmp: (a, b, ks) => Math.max(Math.sqrt(u(a[ks[0]]) * u(b[ks[1]])), Math.sqrt(u(b[ks[0]]) * u(a[ks[1]])))
  };
  const loud = f => (f.social + f.initiative + f.boldness) / 3;
  const steadyOf = f => (f.steadiness + f.patience) / 2;

  /* ------------------------------------------------------------ the seven "can they live with each other" signals */
  LC.SIGNALS = {
    enjoy: { q: "Will you enjoy spending time together?",
      hi: "Yes. Time together would feel easy and a bit fun.", mid: "Mostly. Some things you'd both love, some you'd do for each other.", lo: "Not automatically. You'd have to find the things you both like.",
      up: "You'd simply enjoy each other's company.", down: "Finding things you both enjoy would take some looking.",
      calc: (a, b) => 0.3 * T.match(a, b, ["social"]) + 0.25 * T.mean(a, b, ["humor"]) + 0.2 * T.mean(a, b, ["optimism"]) + 0.25 * (0.5 * T.match(a, b, ["explore"]) + 0.5 * T.mean(a, b, ["explore"])) },
    calm: { q: "Will you argue constantly?",
      hi: "Unlikely. Two even tempers don't give each other much to push against.", mid: "Now and then, over the usual things, and it passes.", lo: "It's a real risk. You both push back, so small things can turn into big ones.",
      up: "You wouldn't give each other much to fight about.", down: "You both push back, so small disagreements could escalate.",
      calc: (a, b) => 0.35 * T.calm(a, b, ["compete"]) + 0.25 * T.calm(a, b, ["initiative"]) + 0.2 * T.both(a, b, ["patience"]) + 0.2 * T.both(a, b, ["steadiness"]) },
    room: { q: "Does one of you overwhelm the other?",
      hi: "No. Neither of you takes up all the air in the room.", mid: "{big} brings more energy, and {soft} copes fine as long as there's room to answer back.", lo: "Possibly. {big} is much louder and {soft} could end up going along with things just to keep the peace.",
      up: "Neither of you would crowd the other.", down: "{big} comes on much stronger than {soft}, who could end up giving way.",
      calc: (a, b) => { const la = loud(a), lb = loud(b), soft = la <= lb ? a : b; const pressure = clamp(Math.abs(la - lb) / 8, 0, 1) * (1 - u(soft.autonomy)); return 1 - 0.9 * pressure; },
      who: (a, b, A, B) => loud(a) >= loud(b) ? { big: A, soft: B } : { big: B, soft: A } },
    steady: { q: "Does one of you steady the other?",
      hi: "Yes. {steady} is the calm one in a storm and it rubs off.", mid: "A bit. When one wobbles, the other usually holds.", lo: "Not much. When things get stormy, nobody is the calm one, so agree to pause before reacting.",
      up: "One of you would keep the other steady in a storm.", down: "When things get stormy, neither of you is naturally the calm one.",
      calc: (a, b) => 0.6 * u(Math.max(steadyOf(a), steadyOf(b))) + 0.4 * u((steadyOf(a) + steadyOf(b)) / 2),
      who: (a, b, A, B) => steadyOf(a) >= steadyOf(b) ? { steady: A } : { steady: B } },
    complement: { q: "Do your strengths complement each other?",
      hi: "Very much. What one finds hard, the other tends to find easy.", mid: "In places. You cover some of each other's gaps and share a few.", lo: "Not much. You're strong in the same places and thin in the same places, so borrow help from outside.",
      up: "What one finds hard, the other finds easy.", down: "You're strong and thin in the same places.",
      calc: (a, b) => 0.5 * mean([["initiative", "structure"], ["invent", "analysis"], ["warmth", "analysis"], ["boldness", "steadiness"], ["social", "autonomy"], ["explore", "persist"]].map(p => T.cmp(a, b, p))) + 0.5 * T.cover(a, b, ["initiative", "structure", "analysis", "invent", "warmth", "flex"]) },
    healthy: { q: "Are your disagreements healthy or exhausting?",
      hi: "Healthy. You can disagree and still be on each other's side.", mid: "Mixed. Some of it clears the air and some of it lingers.", lo: "Exhausting at times. Disagreements may leave you both drained, so set the rules for a fight early.",
      up: "You can disagree and still be on each other's side.", down: "Disagreements would leave you both drained.",
      calc: (a, b, s) => 0.5 * T.both(a, b, ["trust", "patience", "warmth"]) + 0.3 * s.calm + 0.2 * T.both(a, b, ["steadiness"]) },
    understand: { q: "Can one of you understand the other?",
      hi: "Yes. At least one of you reads the other easily.", mid: "Mostly. Some things need explaining, and that's fine.", lo: "It takes effort. You process things so differently that you'd have to ask rather than assume.",
      up: "One of you reads the other easily.", down: "You'd have to ask rather than assume.",
      calc: (a, b) => 0.4 * T.cover(a, b, ["warmth"]) + 0.35 * T.match(a, b, ["warmth", "social", "flex"]) + 0.25 * T.both(a, b, ["flex"]) }
  };

  /* ------------------------------------------------------------ the lenses
     item: { id, label, w, cat?, terms:[[fn, facets, weight]], up, down }   (fn "sig" reads a signal by name)
     w:0 items score a pack section (via cat) without counting towards the lens score. */
  const L = (id, label, w, terms, up, down, cat) => ({ id, label, w, terms, up, down, cat: cat || null });
  const SG = (id, w) => ({ sig: id, w });

  LC.LENSES = {
    friendship: {
      cal: { lo: 0.596, hi: 0.756 },
      items: [
        L("interests", "Shared interests", 1.5, [["match", ["explore", "invent", "humor"], 0.5], ["mean", ["explore", "invent"], 0.25], ["mean", ["humor"], 0.25]], "You'd find the same things worth doing.", "You get excited about different things, so shared plans take some negotiating.", "Creative Partner"),
        L("adventure", "Adventure", 1.5, [["both", ["boldness", "explore"], 0.4], ["match", ["boldness", "flex"], 0.3], ["cover", ["flex"], 0.3]], "Say 'let's try it' and you'd both mean it.", "One of you wants the plan and the other wants the surprise.", "Adventure"),
        L("humour", "Humour", 1.5, [["match", ["humor"], 0.4], ["mean", ["humor"], 0.35], ["mean", ["optimism"], 0.25]], "You'd laugh at the same things.", "Your senses of humour don't always land on each other.", null),
        L("trust", "Trust", 0.9, [["both", ["trust"], 0.5], ["both", ["warmth"], 0.3], ["calm", ["compete"], 0.2]], "Trust would come easily.", "Trust would need time and kept promises.", "Trust"),
        L("communication", "Staying in touch", 1.1, [["match", ["social"], 0.35], ["both", ["warmth"], 0.25], ["both", ["patience"], 0.2], ["mean", ["humor"], 0.2]], "Staying in touch would feel effortless.", "You keep in touch in different ways and could miss each other's signals.", "Communication"),
        L("support", "Supporting each other", 0.7, [["cover", ["warmth"], 0.45], ["cover", ["steadiness"], 0.35], ["both", ["warmth"], 0.2]], "When one of you struggles, the other would notice.", "Neither of you naturally leads with comfort, so say what you need out loud.", null),
        L("recovery", "Bouncing back from a fight", 0.8, [["both", ["patience"], 0.35], ["both", ["steadiness"], 0.35], ["both", ["flex"], 0.15], ["calm", ["compete"], 0.15]], "Arguments would blow over quickly.", "After a fight it could take a while to feel normal again.", null),
        SG("enjoy", 1.6), SG("understand", 0.4), SG("calm", 0.6),
        L("solving", "Solving problems", 0, [["cmp", ["invent", "analysis"], 0.35], ["cover", ["analysis", "invent"], 0.3], ["mean", ["flex"], 0.2], ["calm", ["initiative"], 0.15]], "", "", "Problem Solving"),
        L("travel", "Travelling", 0, [["match", ["structure"], 0.3], ["mean", ["flex"], 0.35], ["match", ["boldness"], 0.35]], "", "", "Travel Partner"),
        L("gaming", "Gaming", 0, [["calm", ["compete"], 0.3], ["mean", ["humor"], 0.25], ["both", ["patience"], 0.2], ["match", ["analysis"], 0.25]], "", "", "Gaming Partner"),
        L("study", "Studying", 0, [["both", ["structure"], 0.35], ["cover", ["analysis"], 0.25], ["match", ["social"], 0.15], ["both", ["persist"], 0.25]], "", "", "Study Partner"),
        L("teams", "Working together", 0, [["cmp", ["initiative", "structure"], 0.3], ["both", ["flex"], 0.2], ["cover", ["initiative"], 0.2], ["calm", ["initiative"], 0.15], ["both", ["trust"], 0.15]], "", "", "Teamwork")
      ]
    },
    romance: {
      cal: { lo: 0.573, hi: 0.755 },
      items: [
        L("closeness", "Emotional closeness", 1.6, [["both", ["warmth"], 0.45], ["match", ["warmth"], 0.2], ["match", ["social"], 0.15], ["match", ["autonomy"], 0.2]], "You'd feel close without working at it.", "You show closeness in different ways, which can feel like distance until you translate.", "Emotional Intelligence"),
        L("affection", "Affection", 0.8, [["cover", ["warmth"], 0.4], ["mean", ["humor", "optimism"], 0.3], ["match", ["social"], 0.3]], "Warmth would be easy and visible.", "Affection might be quieter than one of you wants.", null),
        L("longterm", "Long-term fit", 1.1, [["match", ["structure"], 0.25], ["both", ["persist"], 0.3], ["both", ["patience"], 0.2], ["both", ["trust"], 0.25]], "You'd be building toward the same long game.", "You'd need to talk about what lasting actually looks like.", "Marriage"),
        L("conflict", "Handling conflict", 1.6, [["both", ["patience"], 0.3], ["both", ["steadiness"], 0.3], ["calm", ["compete"], 0.2], ["calm", ["initiative"], 0.1], ["both", ["flex"], 0.1]], "You could have the hard conversations without it getting personal.", "Hard conversations could spark fast and cool slowly.", "Conflict Resolution"),
        L("security", "Emotional security", 1.6, [["both", ["steadiness"], 0.4], ["both", ["trust"], 0.35], ["cover", ["steadiness"], 0.25]], "You'd feel steady with each other, even in rough weeks.", "Rough weeks could feel shakier than they should.", null),
        L("vulnerability", "Being vulnerable", 1.3, [["both", ["trust"], 0.4], ["both", ["warmth"], 0.3], ["calm", ["compete"], 0.3]], "You could be honest about the soft stuff.", "Opening up could feel risky for one or both of you.", "Trust"),
        L("living", "Living together", 0.8, [["match", ["structure"], 0.35], ["both", ["patience"], 0.25], ["match", ["social"], 0.2], ["match", ["autonomy"], 0.2]], "Sharing a home would run smoothly.", "Daily routines would need an honest talk.", "Roommate"),
        L("future", "A shared future", 1.0, [["match", ["optimism"], 0.25], ["both", ["persist"], 0.2], ["cmp", ["initiative", "structure"], 0.25], ["match", ["structure"], 0.15], ["both", ["trust"], 0.15]], "You'd be pointed at the same horizon.", "Your pictures of the future would need lining up.", "Life Goals"),
        L("communication", "Talking it through", 0.9, [["match", ["social"], 0.25], ["both", ["warmth"], 0.3], ["both", ["patience"], 0.25], ["mean", ["flex"], 0.2]], "You'd say what you mean and be heard.", "You could talk past each other on the big topics.", "Communication"),
        L("support", "Showing up", 0.6, [["cover", ["warmth"], 0.4], ["cover", ["steadiness"], 0.3], ["both", ["warmth"], 0.3]], "You'd show up for each other without being asked.", "One of you might need more comfort than the other naturally gives.", "Emotional Support"),
        SG("steady", 1.2), SG("understand", 1.2), SG("calm", 1.0)
      ]
    },
    companionship: {
      cal: { lo: 0.635, hi: 0.781 },
      items: [
        L("teamwork", "Teamwork", 1.2, [["cmp", ["initiative", "structure"], 0.3], ["cover", ["initiative"], 0.15], ["both", ["flex"], 0.2], ["both", ["trust"], 0.15], ["calm", ["initiative"], 0.2]], "You'd split a job naturally: one leads, one backs.", "Without clear roles you'd step on each other.", "Teamwork"),
        L("work", "Working side by side", 1.0, [["both", ["structure"], 0.35], ["both", ["persist"], 0.25], ["match", ["structure"], 0.2], ["cover", ["analysis"], 0.2]], "Projects would move at a pace you both can live with.", "You'd work at different speeds and to different standards.", "Work Habits"),
        L("reliability", "Reliability", 1.2, [["both", ["structure"], 0.35], ["both", ["persist"], 0.3], ["both", ["trust"], 0.35]], "Each of you can be counted on, so plans stick.", "Reliability is uneven, so agree on deadlines early.", "Reliability"),
        L("practical", "Practical talk", 1.1, [["match", ["analysis"], 0.25], ["both", ["patience"], 0.25], ["match", ["structure"], 0.25], ["both", ["flex"], 0.25]], "Practical conversations would be simple and clear.", "You'd explain things differently and need to double-check.", "Communication"),
        L("boundaries", "Respecting space", 1.0, [["both", ["autonomy"], 0.4], ["match", ["social"], 0.3], ["sig", ["room"], 0.3]], "You'd respect each other's space without being asked.", "Space and boundaries would need to be said out loud.", "Social Energy Balance"),
        L("family", "Family and close quarters", 0.9, [["both", ["warmth"], 0.3], ["both", ["patience"], 0.3], ["both", ["steadiness"], 0.25], ["calm", ["compete"], 0.15]], "You'd be patient enough with each other to share a table for years.", "Under pressure, patience could wear thin.", null),
        L("roommates", "Roommates", 0.9, [["match", ["structure"], 0.35], ["both", ["patience"], 0.25], ["match", ["social"], 0.15], ["both", ["autonomy"], 0.25]], "You'd share a space without drama.", "House rules would matter.", "Roommate"),
        L("coworkers", "Coworkers", 0.9, [["calm", ["initiative"], 0.3], ["both", ["structure"], 0.2], ["both", ["steadiness"], 0.25], ["match", ["analysis"], 0.25]], "You'd be easy colleagues.", "Different work styles would need managing.", "Business Partner"),
        L("classmates", "Classmates", 0.7, [["both", ["structure"], 0.3], ["cover", ["analysis"], 0.25], ["both", ["explore"], 0.2], ["match", ["social"], 0.25]], "You'd study well side by side.", "You'd get more done working separately.", "Study Partner"),
        L("decide", "Deciding things", 0.4, [["match", ["analysis"], 0.3], ["match", ["boldness"], 0.3], ["both", ["flex"], 0.2], ["calm", ["initiative"], 0.2]], "You'd reach decisions without a fight.", "Decisions could be slow or contested.", "Decision Style"),
        L("learning", "Learning together", 0.4, [["both", ["explore"], 0.3], ["match", ["autonomy"], 0.2], ["match", ["social"], 0.25], ["cover", ["analysis"], 0.25]], "You'd learn well together.", "You'd need to agree on how to learn.", "Learning Style"),
        L("leadership", "Leadership and respect", 0.4, [["calm", ["initiative"], 0.5], ["cmp", ["initiative", "flex"], 0.3], ["both", ["trust"], 0.2]], "Respect would run both ways and the lead could pass back and forth.", "You may both reach for the wheel.", "Leadership Balance"),
        L("daily", "Daily rhythm", 0.4, [["match", ["structure"], 0.4], ["match", ["social"], 0.3], ["both", ["patience"], 0.3]], "Your daily rhythms line up.", "Your daily rhythms differ.", "Daily Lifestyle"),
        SG("calm", 1.0), SG("room", 1.0), SG("complement", 0.8),
        L("fun", "Good company", 0, [["mean", ["humor"], 0.3], ["match", ["social"], 0.3], ["mean", ["optimism"], 0.2], ["match", ["explore"], 0.2]], "", "", "Fun Together"),
        L("sibling", "Sorting out disagreements", 0, [["both", ["patience"], 0.3], ["both", ["steadiness"], 0.3], ["calm", ["compete"], 0.2], ["calm", ["initiative"], 0.1], ["both", ["flex"], 0.1]], "", "", "Conflict Resolution")
      ]
    }
  };

  /* ------------------------------------------------------------ evaluation */
  const bandOf = s => s < 20 ? "Extremely Incompatible" : s < 40 ? "Difficult" : s < 60 ? "Mixed" : s < 75 ? "Good" : s < 90 ? "Excellent" : "Exceptional";
  LC.bandOf = bandOf;

  function signals(a, b){
    const s = {};
    ["enjoy", "calm", "room", "steady", "complement", "healthy", "understand"].forEach(k => { s[k] = clamp(LC.SIGNALS[k].calc(a, b, s), 0, 1); });
    return s;
  }
  function itemValue(it, a, b, sig){
    if (it.sig) return sig[it.sig];
    let v = 0, w = 0;
    it.terms.forEach(([fn, ks, tw]) => { v += tw * (fn === "sig" ? sig[ks[0]] : T[fn](a, b, ks)); w += tw; });
    return clamp(v / (w || 1), 0, 1);
  }
  const stretch = (raw, cal) => clamp(Math.round(5 + 91 * ((raw - cal.lo) / (cal.hi - cal.lo))), 3, 98);

  /* Raw aspect values are all squeezed into roughly 0.5-0.8, so "0.7" is not "good", it is just typical. Every value is therefore read
     against how that aspect usually comes out across many pairs (LC.NORM, generated by .claude/tools/calibrate-lens.js into
     js/forge/lens-norm.js): z = how far above or below a typical pair. Scores, section levels, "what's working / what needs care" and
     the honest answers all read z, so a low score always has something visible behind it. Without LC.NORM a rough fixed scale is used. */
  const zOf = (kind, lensId, id, v) => {
    const N = LC.NORM, n = N && (kind === "sig" ? N.signals && N.signals[id] : N.items && N.items[lensId] && N.items[lensId][id]);
    return n ? clamp((v - n[0]) / n[1], -3, 3) : clamp((v - 0.58) / 0.1, -3, 3);
  };
  const pctOfZ = z => clamp(Math.round(58 + 22 * z), 3, 98);

  /* Raw measurements (used by the calibrator): { sig, vals } */
  LC.measure = function(lensId, A, B){
    const lens = LC.LENSES[lensId], a = facetsOf(A), b = facetsOf(B), sig = signals(a, b);
    return { sig, vals: lens.items.map(it => itemValue(it, a, b, sig)), items: lens.items };
  };

  /* A, B: { normDims | facets, name } -> { lens, score, band, aspects, cats, signals, helping, costing, answers } */
  LC.pair = function(lensId, A, B){
    const lens = LC.LENSES[lensId];
    if (!lens) return null;
    const a = facetsOf(A), b = facetsOf(B);
    const nameA = A.name || "Person A", nameB = B.name || "Person B";
    const sig = signals(a, b);   // every term is symmetric in (a, b), so the result never depends on who is "A"
    let sum = 0, wsum = 0, rawSum = 0;
    const aspects = lens.items.map(it => {
      const v = itemValue(it, a, b, sig), w = it.w || 0;
      const z = it.sig ? zOf("sig", lensId, it.sig, v) : zOf("item", lensId, it.id, v);
      sum += w * z; wsum += w; rawSum += w * v;
      const sg = it.sig ? LC.SIGNALS[it.sig] : null;
      return { id: it.sig || it.id, label: sg ? sg.q : it.label, w, v, z, pct: pctOfZ(z), cat: it.cat || null, signal: !!it.sig, up: sg ? sg.up : it.up, down: sg ? sg.down : it.down };
    });
    const zbar = wsum ? sum / wsum : 0, raw = wsum ? rawSum / wsum : 0.5;
    const ln = LC.NORM && LC.NORM.lens && LC.NORM.lens[lensId];
    const score = ln ? clamp(Math.round(58 + 22 * (zbar - ln[0]) / ln[1]), 3, 98) : stretch(raw, lens.cal);
    const cats = {};
    aspects.forEach(x => { if (x.cat) cats[x.cat] = x.pct; });
    const toks = { A: nameA, B: nameB };
    const rank = aspects.filter(x => x.w > 0 && (x.up || x.down)).map(x => ({ x, c: x.w * x.z }));
    const text = (x, good) => fill(good ? x.up : x.down, Object.assign({}, toks, sigWho(x.id, a, b, nameA, nameB)));
    const helping = rank.filter(r => r.x.z >= 0.3).sort((p, q) => q.c - p.c).slice(0, 3).map(r => ({ id: r.x.id, label: r.x.label, text: text(r.x, true) }));
    const costing = rank.filter(r => r.x.z <= -0.3).sort((p, q) => p.c - q.c).slice(0, 3).map(r => ({ id: r.x.id, label: r.x.label, text: text(r.x, false) }));
    const answers = Object.keys(LC.SIGNALS).map(k => {
      const sg = LC.SIGNALS[k], z = zOf("sig", lensId, k, sig[k]), lv = z >= 0.35 ? "hi" : z <= -0.35 ? "lo" : "mid";
      return { id: k, q: sg.q, level: lv, text: fill(sg[lv], Object.assign({}, toks, sigWho(k, a, b, nameA, nameB))) };
    });
    return { lens: lensId, score, band: bandOf(score), raw, zbar, aspects, cats, signals: sig, helping, costing, answers };
  };
  function sigWho(id, a, b, A, B){ const s = LC.SIGNALS[id]; return (s && s.who) ? s.who(a, b, A, B) : {}; }

  /* Score only (cheap, used for party pair grids). */
  LC.score = (lensId, A, B) => { const r = LC.pair(lensId, A, B); return r ? r.score : null; };

  /* ---------------------------------------------------------------- groups */
  /* The group's Friendship compatibility is the friendship engine alone: every pairing's friendship score,
     averaged and tempered by the weakest link (a group is only as comfortable as its worst pairing). */
  LC.group = function(people, lensId){
    lensId = lensId || "friendship";
    const facets = people.map(facetsOf), n = people.length, names = people.map((p, i) => p.name || ("Person " + (i + 1)));
    const pairs = [];
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++){
      const r = LC.pair(lensId, { facets: facets[i], name: names[i] }, { facets: facets[j], name: names[j] });
      pairs.push({ i, j, a: names[i], b: names[j], score: r.score, band: r.band, why: (r.helping[0] || {}).text || "", gripe: (r.costing[0] || {}).text || "", helping: r.helping, costing: r.costing });
    }
    if (!pairs.length) return null;
    const scores = pairs.map(p => p.score), avg = mean(scores), min = Math.min.apply(null, scores);
    const score = Math.round(0.8 * avg + 0.2 * min);
    const order = (p, q) => q.score - p.score || (p.a + p.b < q.a + q.b ? -1 : 1);
    const best = pairs.slice().sort(order).slice(0, 5);
    const weakest = pairs.slice().sort((p, q) => -order(p, q))[0];
    return { lens: lensId, score, band: bandOf(score), average: Math.round(avg), pairs, best, weakest };
  };
})(typeof Forge !== "undefined" ? Forge : (globalThis.Forge = globalThis.Forge || {}));
if (typeof module !== "undefined" && module.exports) module.exports = Forge;
