/* =========================================================================
   FORGE CHARACTERS - the ONE character match + explanation engine.

   profile -> match (per-facet agreement) -> rank -> explain -> UI
   Everything that shows a character anywhere in the app (Result, Compare,
   Party, Profile, worlds, the Atlas in engine.js, the explanation page)
   calls this module. There is no second scoring path and no second
   explanation path.

   HOW A MATCH IS SCORED (all numbers come from here, none are invented)
   ----------------------------------------------------------------------
   For every facet k the character DEFINES (traits[k], RAW -10..10):
     weight_k    = |trait_k| / sum|trait|                 (what matters to them)
     agree_k     = clamp(1 - |you_k - trait_k| / (|trait_k| + 4), -1, 1)
   similarity S  = sum weight_k * agree_k                   (-1..1)
   match %       = clamp(100 * (S - S0) / (S1 - S0))        S0 = BASELINE, S1 = CEILING
   contribution_k = 100 * weight_k * (agree_k - S0) / (S1 - S0)
   so the displayed contributions SUM EXACTLY to the match % (before the
   0..100 clamp), and a negative number really is a facet pulling it down.

   LANGUAGE RULES: the engine never says the person IS a character. Every
   sentence is "your profile aligns with", "forge found a similarity
   because", "you appear more X than". tests/characters.test.js enforces it.
   ========================================================================= */
(function(F){
  "use strict";
  const C = F.characters = {};
  const num = F.num, clamp = F.clamp;

  /* Calibration, measured over 1500 random profiles x the whole roster
     (tests/characters.test.js re-measures and fails if it drifts):
       median pair S ~ 0.38, 95th percentile ~ 0.59, best-of-roster for a random profile ~ 0.60,
       top matches for real quiz profiles ~ 0.75-0.78.
     S0 = 0.30 maps to 0% (below a typical pair), S1 = 0.85 maps to 100% (an excellent match that
     is rarely reached), so an unrelated profile's best match lands near 50% and a strong one 80%+. */
  C.BASELINE = 0.30;
  C.CEILING = 0.85;

  /* ---------------- taxonomies: nine areas, each style a facet signature ---------------- */
  const st = (label, sig, you, they) => ({ label, sig, you, they });
  C.AREAS = [
    { key: "decision", label: "Decision making", uncertain: "how you make decisions", styles: {
      analytical: st("Analytical", { analysis: 8, boldness: -1, initiative: -2, structure: 3 }, "weigh the evidence before committing", "weighs the evidence before committing"),
      instinctive: st("Instinct-led", { initiative: 6, analysis: -5, boldness: 5 }, "go with instinct and adjust as things move", "goes with instinct and adjusts as things move"),
      consulting: st("Consulting", { warmth: 5, trust: 5, autonomy: -4 }, "decide with people you trust", "decides with the people they trust"),
      principled: st("Principled", { structure: 5, warmth: 3, persist: 4, flex: -3 }, "decide by principle and stick to it", "decides by principle and sticks to it"),
      gambler: st("Bold improviser", { boldness: 8, flex: 5, analysis: -3 }, "back bold, improvised bets", "backs bold, improvised bets"),
      cautious: st("Cautious", { boldness: -6, analysis: 4, steadiness: 2 }, "protect the downside before anything else", "protects the downside before anything else") } },
    { key: "learning", label: "Learning", uncertain: "how you learn", styles: {
      explorer: st("Self-directed explorer", { explore: 8, autonomy: 6, structure: -2 }, "learn by wandering off and finding things out yourself", "learns by wandering off and finding things out for themselves"),
      systematic: st("Systematic builder", { structure: 7, persist: 5, analysis: 3 }, "learn step by step in a deliberate order", "learns step by step in a deliberate order"),
      experimental: st("Hands-on experimenter", { initiative: 6, invent: 6, analysis: -2 }, "learn by trying things and seeing what happens", "learns by trying things and seeing what happens"),
      social: st("Learns with others", { social: 6, warmth: 4 }, "learn through conversation and other people", "learns through conversation and other people"),
      specialist: st("Deep specialist", { analysis: 6, persist: 6, social: -4 }, "learn by going deep on one thing at a time", "learns by going deep on one thing at a time") } },
    { key: "communication", label: "Communication", uncertain: "how you express yourself", styles: {
      direct: st("Direct", { analysis: 4, warmth: -4, boldness: 4 }, "say it plainly and move on", "says it plainly and moves on"),
      warm: st("Warm", { warmth: 8, trust: 4 }, "lead with care for how it lands", "leads with care for how it lands"),
      playful: st("Playful", { humor: 8, social: 5 }, "use humor and energy to connect", "uses humor and energy to connect"),
      reserved: st("Reserved", { social: -6, analysis: 3, autonomy: 3 }, "say less and mean more", "says less and means more"),
      commanding: st("Commanding", { initiative: 6, boldness: 5, compete: 3 }, "speak with conviction and expect to be followed", "speaks with conviction and expects to be followed") } },
    { key: "leadership", label: "Leadership", uncertain: "leadership under pressure", styles: {
      reluctant: st("Reluctant, steady", { initiative: 1, persist: 5, warmth: 3, autonomy: 2 }, "step up when it matters, without seeking the role", "steps up when it matters, without seeking the role"),
      driver: st("Driver", { initiative: 8, boldness: 5, social: 4 }, "set the direction and bring people with you", "sets the direction and brings people along"),
      architect: st("Architect", { analysis: 5, structure: 6, social: -2 }, "lead through plans and clear structure", "leads through plans and clear structure"),
      servant: st("Supportive", { warmth: 7, patience: 5, initiative: -2 }, "lead by supporting the people around you", "leads by supporting the people around them"),
      lone: st("Self-reliant", { autonomy: 8, social: -5, initiative: 3 }, "lead by example and mostly on your own terms", "leads by example and mostly on their own terms") } },
    { key: "conflict", label: "Conflict", uncertain: "your conflict style", styles: {
      confront: st("Confrontational", { boldness: 7, compete: 4, patience: -3 }, "meet disagreement head-on", "meets disagreement head-on"),
      avoid: st("Peacekeeping", { warmth: 5, boldness: -6 }, "keep the peace and avoid a direct clash", "keeps the peace and avoids a direct clash"),
      strategic: st("Strategic", { analysis: 6, steadiness: 3, warmth: -2 }, "pick your moment and argue it carefully", "picks their moment and argues it carefully"),
      withdraw: st("Withdrawing", { autonomy: 6, social: -4, steadiness: -2 }, "withdraw to think before responding", "withdraws to think before responding"),
      mediate: st("Mediating", { warmth: 6, patience: 6, steadiness: 4 }, "stay level and look for common ground", "stays level and looks for common ground") } },
    { key: "stress", label: "Stress", uncertain: "how you handle pressure", styles: {
      steady: st("Steady under pressure", { steadiness: 8, patience: 3 }, "tend to stay calm and practical", "stays calm and practical"),
      accelerate: st("Pushes through", { initiative: 6, steadiness: -3, patience: -4 }, "speed up and push through", "speeds up and pushes through"),
      inward: st("Turns inward", { autonomy: 5, social: -4, steadiness: -3 }, "pull inward and carry it alone", "pulls inward and carries it alone"),
      people: st("Leans on people", { social: 6, warmth: 4, steadiness: -2 }, "reach for other people", "reaches for other people"),
      overthink: st("Over-analyses", { analysis: 6, steadiness: -5 }, "turn it over and over in your head", "turns it over and over in their head") } },
    { key: "motivation", label: "Motivation", uncertain: "what actually drives you", styles: {
      curiosity: st("Curiosity", { explore: 8, invent: 3 }, "be driven by wanting to figure things out", "is driven by wanting to figure things out"),
      duty: st("Duty", { structure: 6, persist: 5, warmth: 2 }, "be driven by responsibility and follow-through", "is driven by responsibility and follow-through"),
      connection: st("Connection", { warmth: 8, social: 4, trust: 3 }, "be driven by the people you care about", "is driven by the people they care about"),
      mastery: st("Mastery", { persist: 7, compete: 6, structure: 2 }, "be driven to get better and to win", "is driven to get better and to win"),
      freedom: st("Freedom", { autonomy: 8, boldness: 3, structure: -3 }, "be driven by independence and room to move", "is driven by independence and room to move"),
      justice: st("Purpose", { warmth: 4, boldness: 3, structure: 3, persist: 4 }, "be driven by a sense of what's right", "is driven by a sense of what's right") } },
    { key: "work", label: "Work style", uncertain: "how you work", styles: {
      independent: st("Independent maker", { autonomy: 7, invent: 3, social: -3 }, "work best on your own, owning the how", "works best alone, owning the how"),
      executor: st("Structured executor", { structure: 7, persist: 5 }, "plan, then see things through", "plans, then sees things through"),
      collaborative: st("Collaborative builder", { warmth: 5, social: 5, trust: 4 }, "do your best work alongside other people", "does their best work alongside other people"),
      adaptor: st("Improvising adaptor", { flex: 8, boldness: 2, structure: -3 }, "adapt on the fly rather than follow a plan", "adapts on the fly rather than following a plan"),
      strategist: st("Strategic planner", { analysis: 6, structure: 4, initiative: 1 }, "think several steps ahead before moving", "thinks several steps ahead before moving") } },
    { key: "group", label: "Group role", uncertain: "your role in a group", styles: {
      strategist: st("Strategist", { analysis: 6, structure: 4, social: -1 }, "end up working out the plan", "ends up working out the plan"),
      catalyst: st("Catalyst", { initiative: 6, social: 6, humor: 3 }, "get things moving and keep the energy up", "gets things moving and keeps the energy up"),
      glue: st("The glue", { warmth: 7, steadiness: 4, patience: 4 }, "keep the group together", "keeps the group together"),
      challenger: st("Challenger", { analysis: 4, autonomy: 4, boldness: 3, warmth: -3 }, "question the plan when it has a hole", "questions the plan when it has a hole"),
      anchor: st("Anchor", { steadiness: 7, persist: 5, patience: 3 }, "hold steady when others wobble", "holds steady when others wobble"),
      scout: st("Scout", { explore: 7, boldness: 4, flex: 4 }, "go ahead and find what's out there", "goes ahead and finds what's out there"),
      specialist: st("Specialist", { analysis: 5, persist: 5, social: -3 }, "bring deep expertise to a narrow thing", "brings deep expertise to a narrow thing") } },
  ];
  C.AREA = Object.fromEntries(C.AREAS.map(a => [a.key, a]));

  C.VALUES = { truth: "Truth", loyalty: "Loyalty", family: "Family", freedom: "Freedom", justice: "Justice", knowledge: "Knowledge", honor: "Honor", kindness: "Kindness", courage: "Courage",
    achievement: "Achievement", creativity: "Creativity", community: "Community", humility: "Humility" };
  C.MOTIVATIONS = { curiosity: "Curiosity", duty: "Duty", connection: "Connection", mastery: "Mastery", freedom: "Freedom", justice: "A sense of what's right" };

  /* ---------------- facet phrase library ---------------- */
  // userHi/Lo: how the PERSON's trait is described; charHi/Lo: what the CHARACTER shows. more/less: comparative adjectives.
  const P = (userHi, userLo, charHi, charLo, more, less) => ({ userHi, userLo, charHi, charLo, more, less });
  C.PHRASE = {
    explore: P("strong curiosity", "preference for the familiar", "drive to find out what's out there", "comfort with what they already know", "curious", "settled in the familiar"),
    invent: P("inventive streak", "preference for proven methods", "habit of making new things", "trust in tried approaches", "inventive", "drawn to proven methods"),
    analysis: P("analytical thinking", "instinct-led thinking", "habit of reasoning things through", "reliance on instinct", "analytical", "instinct-driven"),
    structure: P("preference for structure and follow-through", "ease with improvising", "discipline and planning", "comfort improvising", "organized", "improvisational"),
    initiative: P("tendency to start things", "tendency to wait for clarity", "readiness to act first", "willingness to wait and watch", "quick to start", "slower to start"),
    persist: P("staying power", "readiness to change course", "refusal to quit", "readiness to move on", "persistent", "quicker to change course"),
    warmth: P("attunement to other people", "emotional self-containment", "care for the people around them", "emotional reserve", "attuned to others", "emotionally reserved"),
    social: P("social energy", "preference for time alone", "ease around people", "preference for solitude", "outgoing", "reserved"),
    humor: P("playfulness", "serious streak", "humor", "seriousness", "playful", "serious"),
    autonomy: P("preference for independence", "preference for working with others", "self-reliance", "reliance on others", "independent", "collaborative"),
    steadiness: P("composure under pressure", "sensitivity to pressure", "calm in a crisis", "visible reaction to pressure", "calm under pressure", "easily rattled"),
    flex: P("adaptability", "preference for stability", "ease with change", "preference for things staying put", "adaptable", "settled in routine"),
    boldness: P("appetite for risk", "caution", "willingness to gamble", "caution", "risk-seeking", "cautious"),
    trust: P("readiness to trust", "guardedness", "openness to trusting others", "guardedness", "trusting", "guarded"),
    compete: P("competitive drive", "preference for cooperation over competition", "will to win", "disinterest in competing", "competitive", "cooperative"),
    patience: P("patience", "urgency", "patience", "impatience", "patient", "impatient"),
    optimism: P("optimism", "realism that leans cautious", "belief that things can work out", "expectation of difficulty", "optimistic", "guarded"),
  };
  // a few hand-written combinations read better than the generic composer
  const COMBO = {
    "autonomy+explore": (n) => `Your strong curiosity combined with your preference for independent exploration closely resembles ${n}'s approach to learning.`,
    "analysis+explore": (n) => `Your analytical thinking paired with a pull toward finding things out mirrors how ${n} goes after a problem.`,
    "persist+structure": (n) => `Your staying power together with your preference for structure and follow-through looks a lot like how ${n} sees things through.`,
    "analysis+structure": (n) => `Your analytical, organized way of working lines up with how ${n} plans and reasons things through.`,
    "humor+social": (n) => `Your playfulness and social energy together resemble ${n}'s ease with people and use of humor.`,
    "optimism+persist": (n) => `Your optimism combined with your staying power resembles ${n}'s refusal to give up on how things can turn out.`,
    "trust+warmth": (n) => `Your readiness to trust and your attunement to other people closely echo ${n}'s warmth toward the people around them.`,
    "autonomy+steadiness": (n) => `Your independence combined with composure under pressure resembles how ${n} handles things alone.`,
    "boldness+initiative": (n) => `Your appetite for risk and your tendency to start things resemble ${n}'s readiness to act first.`,
    "flex+invent": (n) => `Your adaptability and inventive streak together resemble ${n}'s habit of improvising solutions.`,
    "patience+warmth": (n) => `Your patience and your attunement to others resemble ${n}'s steady, caring way with people.`,
    "analysis+autonomy": (n) => `Your analytical thinking and preference for working independently resemble ${n}'s self-directed way of solving problems.`,
    "compete+initiative": (n) => `Your competitive drive and tendency to start things resemble ${n}'s push to move first and win.`,
    "persist+steadiness": (n) => `Your staying power and composure under pressure resemble ${n}'s steadiness when things get hard.`,
  };

  /* ---------------- slugs, roster ---------------- */
  C.slug = function(name){
    return String(name == null ? "" : name).normalize ? String(name).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) : String(name).toLowerCase().replace(/[^a-z0-9]+/g, "-");
  };
  const hue = id => F.hashString("hue:" + id) % 360;
  const initials = name => { const parts = String(name).replace(/[^A-Za-z0-9À-ɏ ]/g, " ").split(/\s+/).filter(Boolean); return ((parts[0] || "?")[0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase(); };

  /* Derive facet traits from a legacy dimension signature, for any roster
     entry that has no curated attributes. Honest about it: dataQuality 0.7. */
  function deriveFromSignature(sig){
    const traits = {}; (sig || []).forEach(s => { F.FACET_KEYS.forEach(k => { const w = F.FACETS[k].w[s.dim]; if (w) traits[k] = (traits[k] || 0) + s.w * 2.4 * (w / Object.values(F.FACETS[k].w).reduce((a, b) => a + b, 0)) * 3; }); });
    Object.keys(traits).forEach(k => { traits[k] = Math.round(clamp(traits[k], -9, 9)); if (!traits[k]) delete traits[k]; });
    return traits;
  }

  const SHORT = { "don-quixote": "Don Quixote", "monkey-d-luffy": "Luffy", "rachel-roth": "Raven", "diana-prince": "Wonder Woman", "power-girl": "Power Girl" };
  const shortName = (id, name) => SHORT[id] || String(name).split(/\s+/)[0];
  C.shortName = shortName;
  const plain = n => String(n).replace(/\s*\([^)]*\)\s*$/, "");   // "Raven (Rachel Roth)" reads as "Raven" inside a sentence; headings keep the full name

  let _roster = null;
  C.roster = function(){
    if (_roster) return _roster;
    const data = F.CHARACTER_DATA || {};
    const base = (typeof MEDIA_CHARACTERS !== "undefined" ? MEDIA_CHARACTERS : []).map(m => ({ id: C.slug(m.name), name: m.name, universe: m.source, medium: m.sourceType, role: m.role, energy: m.energy, signature: m.signature }));
    const extra = (F.CHARACTER_EXTRA || []).map(e => ({ id: e.id, name: e.name, universe: e.source, medium: e.sourceType, role: e.role, energy: e.energy, signature: null }));
    const seen = new Set(); const out = [];
    base.concat(extra).forEach(c => {
      if (!c.id || seen.has(c.id)) return;                       // duplicate ids: first wins
      seen.add(c.id);
      const d = data[c.id];
      let traits, styles, values, motivations, quality;
      if (d){ traits = d.traits; styles = Object.assign({}, d.styles); values = d.values; motivations = d.motivations; quality = 1; if (!styles.motivation && motivations && motivations[0]) styles.motivation = motivations[0]; }
      else { traits = deriveFromSignature(c.signature); styles = {}; values = []; motivations = []; quality = 0.7; }
      const clean = {}; Object.keys(traits || {}).forEach(k => { if (F.FACETS[k] && Number.isFinite(traits[k])) clean[k] = clamp(traits[k], -10, 10); });
      if (!Object.keys(clean).length) return;                    // nothing to match on: not a usable character
      out.push({ id: c.id, name: String(c.name), short: shortName(c.id, c.name), universe: String(c.universe || ""), medium: String(c.medium || "story"), role: String(c.role || ""), energy: String(c.energy || ""),
        traits: clean, styles: styles || {}, decisionStyle: (styles || {}).decision || null, socialStyle: (styles || {}).group || null, leadership: (styles || {}).leadership || null,
        values: (values || []).filter(v => C.VALUES[v]), motivations: (motivations || []).filter(m => C.MOTIVATIONS[m]), source: "curated", dataQuality: quality,
        portrait: { hue: hue(c.id), mono: initials(c.name) } });
    });
    _roster = out;
    return out;
  };
  C.byId = function(id){ if (typeof id !== "string") return null; const k = id.trim().toLowerCase(); return C.roster().find(c => c.id === k) || null; };
  C._resetRoster = function(){ _roster = null; _cache = null; };

  /* ---------------- safe profile input ---------------- */
  /* Accepts a normalized profile, a raw {normDims}/{dims}, a profile code, or a
     timeline entry. Repairs bad values rather than throwing; reports repairs. */
  C.profileFrom = function(input, opts){
    opts = opts || {};
    if (input && input.ok && input.dims && input.facets && input.confidence) return input;
    let src = input;
    if (typeof src === "string") src = { code: src };
    if (!src || typeof src !== "object") return Object.assign(F.emptyProfile(), { errors: ["no profile"] });
    const repairs = [];
    let dimsIn = src.normDims || src.dims || null;
    let decodedName = null;
    if (!dimsIn && typeof src.code === "string"){
      const d = typeof decodeCode === "function" ? decodeCode(src.code) : null;
      if (d && d.obsolete) return Object.assign(F.emptyProfile(), { errors: ["obsolete code"], obsolete: true });
      if (d){ dimsIn = d.normDims; decodedName = d.name; }
    }
    if (!dimsIn || typeof dimsIn !== "object") return Object.assign(F.emptyProfile(), { errors: ["no dimensions"] });
    const fixed = {}; let valid = 0;
    DIMENSIONS.forEach(d => {
      const v = dimsIn[d];
      if (typeof v === "number" && isFinite(v)){ fixed[d] = F.clampRaw(v); valid++; if (v < -10 || v > 10) repairs.push("clamped " + d); }
      else { fixed[d] = 0; repairs.push("repaired " + d); }
    });
    if (valid < 12) return Object.assign(F.emptyProfile(), { errors: ["too few dimensions to read"] });
    const conf = {};
    if (src.dimConfidence && typeof src.dimConfidence === "object"){ DIMENSIONS.forEach(d => { if (typeof src.dimConfidence[d] === "number") conf[d] = src.dimConfidence[d]; }); }
    DIMENSIONS.forEach(d => { if (!(typeof dimsIn[d] === "number" && isFinite(dimsIn[d])) ) conf[d] = 0.15; });   // repaired values are barely known
    const p = F.normalizeProfile({ normDims: fixed, name: src.name || decodedName || "", dimConfidence: Object.keys(conf).length ? conf : null, confidencePct: typeof src.confidencePct === "number" && isFinite(src.confidencePct) ? src.confidencePct : (src.confidence && isFinite(src.confidence.confidencePct) ? src.confidence.confidencePct : null),
      code: typeof src.code === "string" ? src.code : null, depth: src.depth || src.depthTier || null, timestamp: typeof src.timestamp === "number" ? src.timestamp : null });
    p.repairs = repairs;
    return p;
  };
  /* This device's own latest profile (with its measured per-dimension confidence), or null. */
  C.localProfile = function(){
    try{
      const h = typeof getActiveTimeline === "function" ? getActiveTimeline() : [];
      if (h.length){ const p = C.profileFrom(h[h.length - 1]); if (p.ok) return p; }
      const code = localStorage.getItem("pf_last_code");
      if (code){ const p = C.profileFrom({ code }); if (p.ok) return p; }
    } catch(e){ /* corrupted storage: no local profile */ }
    return null;
  };

  /* ---------------- scoring ---------------- */
  const agree = (u, t) => clamp(1 - Math.abs(u - t) / (Math.abs(t) + 4), -1, 1);
  C.agree = agree;

  C.matchOne = function(profile, c){
    const keys = Object.keys(c.traits);
    const totalW = F.sum(keys.map(k => Math.abs(c.traits[k]))) || 1;
    const S0 = C.BASELINE, S1 = C.CEILING;
    let S = 0;
    const parts = keys.map(k => {
      const w = Math.abs(c.traits[k]) / totalW, a = agree(profile.facets[k], c.traits[k]);
      S += w * a;
      return { facet: k, label: F.facetLabel(k), you: profile.facets[k], them: c.traits[k], weight: w, agreement: a, points: 100 * w * (a - S0) / (S1 - S0) };
    });
    const raw = 100 * (S - S0) / (S1 - S0);
    const pct = Math.round(clamp(raw, 0, 100));
    return { id: c.id, S, raw, pct, parts };
  };

  let _cache = null;
  const key = p => DIMENSIONS.map(d => p.dims[d]).join(",");
  C.rank = function(profile){
    profile = C.profileFrom(profile);
    if (!profile.ok) return [];
    const k = key(profile);
    if (_cache && _cache.key === k) return _cache.list;
    const list = C.roster().map(c => { const m = C.matchOne(profile, c); return { char: c, match: m, pct: m.pct, S: m.S }; })
      .sort((a, b) => b.S - a.S || (a.char.id < b.char.id ? -1 : 1));
    _cache = { key: k, list };
    return list;
  };

  /* Result-page set: main, runner-up (preferring a different universe), growth, opposite. */
  C.selections = function(profile){
    profile = C.profileFrom(profile);
    const list = C.rank(profile); if (!list.length) return null;
    const main = list[0];
    const runner = list.slice(1).find(x => x.char.universe !== main.char.universe) || list[1] || null;
    // growth: a good-enough match who is strong where this person is comparatively low
    const lowest = F.FACET_KEYS.slice().sort((a, b) => profile.facets[a] - profile.facets[b]).slice(0, 4);
    const chosen = new Set([main.char.id, runner && runner.char.id]);
    let growth = null, growthScore = -1;
    list.forEach(x => {
      if (chosen.has(x.char.id) || x.pct < 35) return;
      const gains = lowest.filter(k => x.char.traits[k] != null && x.char.traits[k] >= 3).map(k => clamp((x.char.traits[k] - profile.facets[k]) / 10, 0, 1));
      if (!gains.length) return;
      const g = 0.5 * (x.pct / 100) + 0.5 * F.mean(gains) * Math.min(1, gains.length / 2);
      if (g > growthScore){ growthScore = g; growth = Object.assign({}, x, { growthFacets: lowest.filter(k => x.char.traits[k] != null && x.char.traits[k] >= 3) }); }
    });
    const opposite = list[list.length - 1] && list[list.length - 1].char.id !== main.char.id ? list[list.length - 1] : null;
    return { main, runnerUp: runner, growth, opposite, count: list.length };
  };

  /* ---------------- confidence ---------------- */
  const facetConf = (profile, k) => F.mean(Object.keys(F.FACETS[k].w).map(d => profile.confidence.dims[d] ? profile.confidence.dims[d].value : 0.4));
  C.areaConfidence = function(profile, charStyleSig, userStyleSig){
    const facets = F.unique(Object.keys(charStyleSig || {}).concat(Object.keys(userStyleSig || {})));
    return facets.length ? F.mean(facets.map(k => facetConf(profile, k))) : 0.5;
  };
  C.confidence = function(profile, entry, list){
    const c = entry.char, m = entry.match;
    const wsum = F.sum(m.parts.map(p => p.weight)) || 1;
    const evidence = F.sum(m.parts.map(p => p.weight * facetConf(profile, p.facet))) / wsum;
    const idx = list.findIndex(x => x.char.id === c.id);
    const next = list[idx + 1], margin = next ? clamp((entry.pct - next.pct) / 14, 0, 1) : 1;
    const distinct = clamp((entry.pct - 45) / 40, 0, 1);
    const decisiveness = idx === 0 ? margin : distinct;
    const coverage = clamp(Object.keys(c.traits).length / 9, 0, 1);
    const quality = c.dataQuality;
    const pct = Math.round(100 * clamp(0.5 * evidence + 0.2 * decisiveness + 0.15 * coverage + 0.15 * quality, 0, 1));
    return { pct, level: pct >= 75 ? "High" : pct >= 55 ? "Moderate" : "Low", parts: { evidence: Math.round(evidence * 100), decisiveness: Math.round(decisiveness * 100), coverage: Math.round(coverage * 100), dataQuality: Math.round(quality * 100) } };
  };

  /* ---------------- area comparison (same yardstick for you and them) ---------------- */
  C.styleAffinity = function(profile, sig){
    const ks = Object.keys(sig); const tw = F.sum(ks.map(k => Math.abs(sig[k]))) || 1;
    return ks.reduce((s, k) => s + Math.abs(sig[k]) / tw * agree(profile.facets[k], sig[k]), 0);   // -1..1
  };
  C.userStyle = function(profile, areaKey){
    const area = C.AREA[areaKey];
    const scored = Object.keys(area.styles).map(sk => ({ key: sk, aff: C.styleAffinity(profile, area.styles[sk].sig) })).sort((a, b) => b.aff - a.aff);
    return scored[0];
  };

  // A style the person ALSO shows most strongly is a strong overlap. A different style can overlap at most partially.
  const verdict = (aff, same) => same ? "Strong overlap" : aff >= 0.45 ? "Partial overlap" : "Different approach";

  /* ---------------- the explanation ---------------- */
  C.explain = function(input, charId, opts){
    opts = opts || {};
    const profile = C.profileFrom(input);
    if (!profile.ok) return { ok: false, reason: profile.errors && profile.errors[0] || "no profile" };
    const c = C.byId(charId);
    if (!c) return { ok: false, reason: "unknown character", notFound: true };
    const list = C.rank(profile);
    const entry = list.find(x => x.char.id === c.id);
    const name = c.name, nm = c.short;       // full name for headings, first name in running text
    const m = entry.match;

    // ---- evidence: signed contributions that sum to the match percentage
    const sortedParts = m.parts.slice().sort((a, b) => b.points - a.points);
    const top = sortedParts.filter(p => p.points > 0).slice(0, 5);
    const bottom = sortedParts.filter(p => p.points < 0).slice(-2).reverse();
    const shown = F.unique(top.concat(bottom).map(p => p.facet));
    const rest = m.parts.filter(p => !shown.includes(p.facet));
    const evidence = {
      rows: top.concat(bottom).map(p => ({ facet: p.facet, label: p.label, points: Math.round(p.points * 10) / 10, you: F.round1(p.you), them: p.them, youBand: F.band(p.you) })),
      other: rest.length ? { count: rest.length, points: Math.round(F.sum(rest.map(p => p.points)) * 10) / 10 } : null,
      total: Math.round(m.raw * 10) / 10, clamped: m.raw < 0 || m.raw > 100,
      note: "Each number is how many match points that trait added (or took away). They add up to the overall match.",
    };

    // ---- trace: every number behind the percentage, so nothing is a black box.
    // Contributions already include each trait's weight; the model has no hidden bonuses or penalties,
    // only trait contributions that add to the score (agreement above baseline) or take from it.
    const rnd1 = x => Math.round(x * 10) / 10;
    const traceRows = m.parts.map(p => ({ facet: p.facet, label: p.label, you: F.round1(p.you), them: p.them, weightPct: Math.round(p.weight * 1000) / 10, agreement: Math.round(p.agreement * 100) / 100, points: rnd1(p.points) }));
    const trace = {
      formula: `match % = 100 × (similarity − ${C.BASELINE}) ÷ (${C.CEILING} − ${C.BASELINE}), where similarity is the weight-averaged agreement across ${nm}'s defining traits`,
      similarity: Math.round(m.S * 1000) / 1000, baseline: C.BASELINE, ceiling: C.CEILING, raw: rnd1(m.raw), pct: entry.pct, clamped: m.raw < 0 || m.raw > 100,
      rows: traceRows.slice().sort((a, b) => b.points - a.points),
      contributed: traceRows.filter(r => r.points > 0).sort((a, b) => b.points - a.points),
      reduced: traceRows.filter(r => r.points < 0).sort((a, b) => a.points - b.points),
      bonuses: [], penalties: traceRows.filter(r => r.points < 0).sort((a, b) => a.points - b.points),
      sums: { contributed: rnd1(F.sum(m.parts.filter(p => p.points > 0).map(p => p.points))), reduced: rnd1(F.sum(m.parts.filter(p => p.points < 0).map(p => p.points))) },
      note: "Forge applies no hidden bonuses. A trait either adds points (your answer sits close to the character's) or takes points away (it sits far from it).",
    };

    // ---- why: reasons built from aligned-sign facets, preferring pairs
    const aligned = sortedParts.filter(p => p.points > 0 && Math.sign(p.you) === Math.sign(p.them) && Math.abs(p.you) >= 2 && Math.abs(p.them) >= 3);
    const reasons = [];
    const used = new Set();
    for (let i = 0; i < aligned.length && reasons.length < 3; i++){
      if (used.has(aligned[i].facet)) continue;
      const a = aligned[i]; const b = aligned.slice(i + 1).find(x => !used.has(x.facet));
      used.add(a.facet);
      let text, facets = [a.facet];
      if (b){
        used.add(b.facet); facets = [a.facet, b.facet];
        const key = facets.slice().sort().join("+");
        // hand-written combos describe the HIGH side of both traits; any low or mixed pair uses the sign-aware composer
        const bothHigh = a.you >= 0 && a.them >= 0 && b.you >= 0 && b.them >= 0;
        text = COMBO[key] && bothHigh ? COMBO[key](nm) : composePair(a, b, nm);
      } else text = composeOne(a, nm);
      reasons.push({ facets, text, points: Math.round(F.sum(facets.map(f => m.parts.find(p => p.facet === f).points)) * 10) / 10 });
    }
    const alignedCount = m.parts.filter(p => p.agreement >= 0.55).length;
    const lead = reasons.length
      ? `Your profile most closely aligns with ${plain(name)}'s ${F.listJoin(reasons[0].facets.map(f => phrase(f, c.traits[f] >= 0 ? "charHi" : "charLo")))}.`
      : `Your profile shows only a modest overall alignment with ${plain(name)}.`;
    const why = [`Forge compared your ${F.FACET_KEYS.length} behavioural facets with the ${m.parts.length} traits that define ${plain(name)}. ${alignedCount} of those ${m.parts.length} line up closely with yours.`]
      .concat(reasons.map(r => r.text));

    // ---- behavioural similarities across nine areas
    const similarities = C.AREAS.map(area => {
      const themKey = c.styles[area.key];
      const them = themKey && area.styles[themKey];
      const you = C.userStyle(profile, area.key);
      const youStyle = area.styles[you.key];
      if (!them) return { area: area.key, label: area.label, available: false };
      const aff = C.styleAffinity(profile, them.sig);
      const evFacets = Object.keys(them.sig).sort((x, y) => Math.abs(them.sig[y]) - Math.abs(them.sig[x])).slice(0, 2);
      const evidenceLine = evFacets.map(f => `${F.facetLabel(f).toLowerCase()}: you ${F.round1(profile.facets[f])}, ${nm} ${them.sig[f] > 0 ? "high" : "low"}`).join("; ");
      const v = verdict(aff, you.key === themKey);
      let text;
      if (you.key === themKey) text = `Your answers point the same way as ${nm} here: you tend to ${youStyle.you}, much as ${nm} ${them.they}.`;
      else if (v === "Partial overlap") text = `${nm} ${them.they}. Your answers suggest you tend to ${youStyle.you}, which overlaps in places.`;
      else text = `${nm} ${them.they}, while your answers lean toward a ${youStyle.label.toLowerCase()} approach: you tend to ${youStyle.you}.`;
      return { area: area.key, label: area.label, available: true, yours: { key: you.key, label: youStyle.label }, theirs: { key: themKey, label: them.label }, affinity: Math.round(clamp(aff, 0, 1) * 100), verdict: v, text, evidence: evidenceLine, facets: evFacets };
    });

    // ---- differences (never "you are")
    const diffs = m.parts.map(p => ({ p, d: p.you - p.them })).filter(x => Math.abs(x.d) >= 4).sort((a, b) => Math.abs(b.d) - Math.abs(a.d)).slice(0, 4).map(({ p, d }) => {
      const ph = C.PHRASE[p.facet]; const big = Math.abs(d) >= 8;
      const text = d > 0
        ? `You appear ${big ? "considerably " : ""}more ${ph.more} than ${nm}.`
        : `${nm} is ${big ? "considerably " : ""}more ${ph.more} than your answers suggest.`;
      return { facet: p.facet, label: p.label, you: F.round1(p.you), them: p.them, delta: Math.round(d * 10) / 10, direction: d > 0 ? "you-higher" : "they-higher", text };
    });
    const differencesNote = diffs.length ? null : `Your profile and ${nm}'s don't differ sharply on any defining trait.`;

    // ---- confidence + uncertainty
    const conf = C.confidence(profile, entry, list);
    const byArea = C.AREAS.map(area => {
      const themKey = c.styles[area.key]; const them = themKey && area.styles[themKey]; const you = C.userStyle(profile, area.key);
      const ac = C.areaConfidence(profile, them && them.sig, area.styles[you.key].sig);
      return { area: area.key, label: area.uncertain, name: area.label, confidence: Math.round(ac * 100), facets: F.unique(Object.keys((them && them.sig) || {}).concat(Object.keys(area.styles[you.key].sig))) };
    }).sort((a, b) => a.confidence - b.confidence);
    const uncertain = byArea.filter(a => a.confidence < 62).slice(0, 3);
    // trait-level certainty for the traits that define this character, strongest first
    const byFacet = m.parts.map(p => ({ facet: p.facet, label: p.label, confidence: Math.round(facetConf(profile, p.facet) * 100), weightPct: Math.round(p.weight * 100) }))
      .sort((a, b) => b.confidence - a.confidence || b.weightPct - a.weightPct);
    // a defining trait Forge is clearly unsure about is worth firming up even when the overall read is solid
    const shaky = byFacet.filter(f => f.confidence < 55 && f.weightPct >= 8).map(f => f.facet);
    const focusSets = uncertain.map(u => u.facets).concat(shaky.length ? [shaky] : []);
    const weakDims = F.unique([].concat.apply([], focusSets.map(fs => [].concat.apply([], fs.map(f => Object.keys(F.FACETS[f].w))).map(d => ({ d, c: profile.confidence.dims[d] ? profile.confidence.dims[d].value : 0.4 })).sort((a, b) => a.c - b.c).slice(0, 3).map(x => x.d)))).slice(0, 6);
    const recommend = conf.pct < 75 || uncertain.length > 0 || shaky.length > 0;
    // the targeted-retake plan for these exact weak spots (own profile only: it reads this device's history)
    let plan = null;
    if (opts.plan && recommend && F.retake && F.retake.plan){
      try{
        const pl = F.retake.plan(profile, { snapshots: F.timeline ? F.timeline.snapshots() : [], focusDims: weakDims });
        if (pl && pl.ok) plan = { questionCount: pl.questionCount, projected: pl.projected, areas: pl.areas };
      } catch(e){ plan = null; }
    }
    const confidence = { pct: conf.pct, level: conf.level, parts: conf.parts, byArea, byFacet,
      summary: conf.level === "High" ? "Forge has a firm read on the traits this comparison rests on." : conf.level === "Moderate" ? "Forge has a reasonable read, with some areas still thin." : "Forge's read on the traits this comparison rests on is still thin, so treat it as a first look.",
      uncertain, retake: { recommended: recommend, focusDims: weakDims, url: `quiz.html?mode=targeted&focus=${weakDims.join(",")}`, plan },
      repaired: (profile.repairs || []).length };

    return {
      ok: true, character: publicChar(c), matchPct: entry.pct, rank: list.findIndex(x => x.char.id === c.id) + 1, of: list.length,
      headline: lead, why, reasons, evidence, trace, similarities, differences: diffs, differencesNote, confidence,
      profile: { name: profile.identity.name, code: profile.profileCode },
    };
  };

  function phrase(facet, which){ const p = C.PHRASE[facet]; return p ? p[which] : facet; }
  function composeOne(a, name){
    const hiYou = a.you >= 0;
    return `Your ${phrase(a.facet, hiYou ? "userHi" : "userLo")} closely mirrors ${plain(name)}'s ${phrase(a.facet, a.them >= 0 ? "charHi" : "charLo")}.`;
  }
  function composePair(a, b, name){
    const uA = phrase(a.facet, a.you >= 0 ? "userHi" : "userLo"), uB = phrase(b.facet, b.you >= 0 ? "userHi" : "userLo");
    const cA = phrase(a.facet, a.them >= 0 ? "charHi" : "charLo"), cB = phrase(b.facet, b.them >= 0 ? "charHi" : "charLo");
    return `Your ${uA} combined with your ${uB} resembles ${plain(name)}'s ${cA} and ${cB}.`;
  }
  function publicChar(c){
    return { id: c.id, name: c.name, short: c.short, universe: c.universe, medium: c.medium, role: c.role, energy: c.energy, source: c.source, dataQuality: c.dataQuality,
      decisionStyle: c.decisionStyle, socialStyle: c.socialStyle, leadership: c.leadership,
      values: c.values.map(v => ({ key: v, label: C.VALUES[v] })), motivations: c.motivations.map(v => ({ key: v, label: C.MOTIVATIONS[v] })),
      styles: Object.keys(c.styles).map(a => ({ area: a, label: C.AREA[a] ? C.AREA[a].label : a, style: c.styles[a], styleLabel: C.AREA[a] && C.AREA[a].styles[c.styles[a]] ? C.AREA[a].styles[c.styles[a]].label : c.styles[a] })),
      traits: Object.keys(c.traits).map(k => ({ facet: k, label: F.facetLabel(k), value: c.traits[k] })).sort((a, b) => Math.abs(b.value) - Math.abs(a.value)), portrait: c.portrait };
  }
  C.publicChar = publicChar;

  /* ---------------- cards for the Result / Compare / Party / Profile surfaces ---------------- */
  C.shortWhy = function(profile, entry){
    const aligned = entry.match.parts.filter(p => p.points > 0 && Math.sign(p.you) === Math.sign(p.them) && Math.abs(p.you) >= 2).sort((a, b) => b.points - a.points).slice(0, 2);
    if (!aligned.length) return `Forge found a modest overall similarity.`;
    return `Forge found a similarity because of your ${F.listJoin(aligned.map(p => phrase(p.facet, p.you >= 0 ? "userHi" : "userLo")))}.`;
  };
  C.cards = function(input){
    const profile = C.profileFrom(input);
    if (!profile.ok) return null;
    const sel = C.selections(profile); if (!sel) return null;
    const list = C.rank(profile);
    const mk = (kind, label, x, blurb) => x ? ({ kind, label, id: x.char.id, name: x.char.name, universe: x.char.universe, role: x.char.role, medium: x.char.medium, pct: x.pct, portrait: x.char.portrait, blurb,
      confidence: C.confidence(profile, x, list) }) : null;
    const growthBlurb = sel.growth ? `Strong where your profile is comparatively quieter: ${F.listJoin(sel.growth.growthFacets.slice(0, 2).map(k => F.facetLabel(k).toLowerCase()))}.` : "";
    const oppBlurb = sel.opposite ? `A very different shape from yours: ${F.listJoin(sel.opposite.match.parts.slice().sort((a, b) => a.points - b.points).slice(0, 2).map(p => F.facetLabel(p.facet).toLowerCase()))} pull the other way.` : "";
    return {
      profile: { name: profile.identity.name, code: profile.profileCode, confidence: profile.confidence.overall },
      cards: [mk("main", "Main character", sel.main, C.shortWhy(profile, sel.main)), mk("runner-up", "Runner-up", sel.runnerUp, sel.runnerUp ? C.shortWhy(profile, sel.runnerUp) : ""),
        mk("growth", "Growth character", sel.growth, growthBlurb), mk("opposite", "Opposite character", sel.opposite, oppBlurb)].filter(Boolean),
    };
  };

  /* ---------------- bridge for engine.js's atlas ---------------- */
  C.atlasItems = function(normDims, n, opts){
    opts = opts || {};
    const profile = C.profileFrom({ normDims });
    if (!profile.ok) return [];
    const list = C.rank(profile); const out = []; const seenU = new Set();
    list.forEach(x => { if (out.length >= n) return; if (opts.distinctUniverse !== false && seenU.has(x.char.universe)) return; seenU.add(x.char.universe); out.push(x); });
    return out.map(x => ({ id: "character:" + x.char.name, characterId: x.char.id, name: x.char.name, category: "Character", medium: x.char.medium, source: x.char.universe, role: x.char.role, energy: x.char.energy,
      matchPct: x.pct, explanation: C.shortWhy(profile, x) }));
  };
  C.topMatchName = function(normDims){ const p = C.profileFrom({ normDims }); const l = p.ok ? C.rank(p) : []; return l.length ? l[0].char.name : null; };

  /* ---------------- links ---------------- */
  C.url = function(id, opts){
    opts = opts || {};
    let u = "character.html?c=" + encodeURIComponent(String(id));
    if (opts.code) u += "&p=" + encodeURIComponent(String(opts.code));
    if (opts.name && !opts.code) u += "&n=" + encodeURIComponent(String(opts.name).slice(0, 20));
    return u;
  };
  C.worldUrl = function(name, opts){ opts = opts || {}; return "character.html?w=" + encodeURIComponent(String(name)) + (opts.code ? "&p=" + encodeURIComponent(String(opts.code)) : ""); };
  C.open = function(id, opts){ if (typeof location !== "undefined") location.href = C.url(id, opts); };

  /* ---------------- emblem (original one-colour icon per character) + placeholder fallback ---------------- */
  /* One path per roster character, drawn INLINE (stroke = the surrounding text colour). Nothing is fetched, so it can
     not 404, be blocked (file://, CORS, mask rules) or go stale in a cache. assets/characters/icons/<id>.svg holds the
     same artwork as standalone files; a test keeps both identical. A character with no entry gets the monogram below. */
  /* EMBLEM-PATHS:start */
  const EMBLEM_PATHS = {
    "l": "M4 40.25V24.25h18.67v16zM25.33 40.25V24.25h18.67v16zM14.67 21.58V5.58h18.67v16z",
    "hermione-granger": "M24 10.46v32.5M24 10.46c-5-3.75-12.5-5-20-3.75v30c7.5-1.25 15 0 20 3.75M24 10.46c5-3.75 12.5-5 20-3.75v30c-7.5-1.25-15 0-20 3.75",
    "tony-stark": "M24 3.88l16.84 9.47v21.05l-16.84 9.47l-16.84-9.47V13.35zM24 15.46l8.42 4.74v9.47L24 34.4l-8.42-4.74v-9.47zM24 24.93h0.01",
    "geralt-of-rivia": "M24 4.11v31.11M19.56 9.66l4.44-5.56l4.44 5.56M14 35.22h20M24 35.22v8.89",
    "michael-scott": "M4.5 17.12h29.68v15.48a10.32 10.32 0 0 1-10.32 10.32h-9.03a10.32 10.32 0 0 1-10.32-10.32zM34.18 20.99h3.87a6.45 6.45 0 0 1 0 12.9h-3.87M12.24 2.93c-2.58 2.58 2.58 5.16 0 7.74M21.28 2.93c-2.58 2.58 2.58 5.16 0 7.74",
    "katniss-everdeen": "M13.84 4c17.65 4.71 17.65 35.29 0 40M13.84 4v40M4.43 24h40M37.37 16.94l7.06 7.06l-7.06 7.06",
    "light-yagami": "M23.89 14.61c-3.64-3.64-15.76-3.64-15.76 9.7c0 9.7 7.27 19.39 15.76 19.39s15.76-9.7 15.76-19.39c0-13.33-12.12-13.33-15.76-9.7zM23.89 14.61c0-4.85 2.42-8.48 7.27-10.91",
    "frodo-baggins": "M24 2.16v14.86M11.43 29.59a12.57 12.57 0 1 0 25.14 0a12.57 12.57 0 1 0-25.14 0M17.14 29.59a6.86 6.86 0 1 0 13.71 0a6.86 6.86 0 1 0-13.71 0",
    "sherlock-holmes": "M4.87 20.2a15.29 15.29 0 1 0 30.59 0a15.29 15.29 0 1 0-30.59 0M31.93 31.96l12.94 12.94M11.93 17.85a9.41 9.41 0 0 1 7.06-7.06",
    "aang": "M3.6 18.28h24.46a6.67 6.67 0 1 0-6.67-6.67M3.6 28.29h33.35a6.67 6.67 0 1 1-6.67 6.67M3.6 38.29h15.56",
    "tyrion-lannister": "M11.06 5.49h25.88c0 12.94-4.71 21.18-12.94 21.18S11.06 18.43 11.06 5.49zM24 26.66v16.47M13.41 45.49h21.18M13.41 13.72h21.18",
    "naruto-uzumaki": "M20.78 26.05a3.75 3.75 0 0 1 7.5 0a7.5 7.5 0 0 1-15 0a11.25 11.25 0 0 1 22.5 0a15 15 0 0 1-30 0a18.75 18.75 0 0 1 37.5 0",
    "elizabeth-bennet": "M42.93 3.37C25.43 3.37 14.18 13.37 11.68 28.37l-6.25 15l15-6.25C35.43 34.62 45.43 23.37 42.93 3.37zM5.43 43.37l18.75-18.75",
    "rick-sanchez": "M24 4c-7.78 0-13.33 8.89-13.33 20s5.56 20 13.33 20s13.33-8.89 13.33-20S31.78 4 24 4zM24 12.89c-3.33 0-6.67 4.44-6.67 11.11s3.33 11.11 6.67 11.11s6.67-4.44 6.67-11.11s-3.33-11.11-6.67-11.11z",
    "mikasa-ackerman": "M2.73 15.34c6.86-6.86 32-6.86 38.86 0v9.14c-6.86-6.86-32-6.86-38.86 0zM30.16 23.34l4.57 17.14l8-3.43l-3.43-13.71",
    "deadpool": "M4 43.34L38.67 3.34M44 43.34L9.33 3.34M8 28.68l10.67 8M29.33 36.68l10.67-8",
    "velma-dinkley": "M5.14 8.46h12.5a5 5 0 1 1 10 0h15v12.5a5 5 0 1 0 0 10v12.5H5.14z",
    "kratos": "M3.48 45.56L30.15 8.89M22.37 18.89l10-13.33l10 8.89l-5.56 12.22z",
    "amelie-poulain": "M6.22 20.54h35.56v21.11H6.22zM4 13.87h40v6.67H4zM24 13.87v27.78M24 13.87c-4.44-8.89-13.33-6.67-10-1.11c2.22 3.33 10 1.11 10 1.11zM24 13.87c4.44-8.89 13.33-6.67 10-1.11c-2.22 3.33-10 1.11-10 1.11z",
    "walter-white": "M17.42 2.69h13.15M19.62 2.69v14.25L7.56 37.76a3.29 3.29 0 0 0 2.85 4.93h27.18A3.29 3.29 0 0 0 40.44 37.76L28.38 16.93V2.69M13.04 31.18h21.92",
    "luna-lovegood": "M30.85 3.9a20.02 20.02 0 1 0 11.78 31.79A17.66 17.66 0 0 1 30.85 3.9zM35.56 16.85h0.01M40.27 25.09h0.01",
    "levi-ackerman": "M26.18 39.92l13.33-13.33M29.51 36.59L5.26 12.34A4.44 4.44 0 0 1 3.96 9.19V4.37h4.82a4.44 4.44 0 0 1 3.14 1.3L36.18 29.92M30.25 11.41l5.74-5.74A4.44 4.44 0 0 1 39.14 4.37H43.96v4.82a4.44 4.44 0 0 1-1.3 3.14l-5.74 5.74M32.85 33.26l8.89 8.89M39.51 44.37l4.44-4.44M8.4 28.81l8.89 8.89M8.4 44.37l-4.44-4.44M13.96 34.37L6.18 42.15",
    "furiosa": "M21.08 10.85L21.42 4L26.58 4L26.92 10.85L31.3 12.65L36.36 7.93L40.07 11.64L35.35 16.7L37.15 21.08L44 21.42L44 26.58L37.15 26.92L35.35 31.3L40.07 36.36L36.36 40.07L31.3 35.35L26.92 37.15L26.58 44L21.42 44L21.08 37.15L16.7 35.35L11.64 40.07L7.93 36.36L12.65 31.3L10.85 26.92L4 26.58L4 21.42L10.85 21.08L12.65 16.7L7.93 11.64L11.64 7.93L16.7 12.65zM18.38 24a5.62 5.62 0 1 0 11.24 0a5.62 5.62 0 1 0-11.24 0",
    "ted-lasso": "M19.06 24.72a12.5 12.5 0 1 0 25 0a12.5 12.5 0 1 0-25 0M21.56 17.22L4.06 12.22v10l17.5 5M31.56 24.72h0.01",
    "hamlet": "M6.22 33.05L4 9.72l12.22 11.11l7.78-13.33l7.78 13.33l12.22-11.11l-2.22 23.33zM7.33 39.72h33.33",
    "alice": "M6.98 26.92a16.97 16.97 0 1 0 33.94 0a16.97 16.97 0 1 0-33.94 0M23.94 9.95V3.89M19.1 3.89h9.7M23.94 26.92v-9.7M23.94 26.92l6.06 3.64",
    "pinocchio": "M8 5.02h32M24 5.02v19.43M11.43 5.02l4.57 33.14M36.57 5.02l-4.57 33.14M18.29 30.16a5.71 5.71 0 1 0 11.43 0a5.71 5.71 0 1 0-11.43 0M24 35.88v9.14M16 39.31l8-2.29l8 2.29",
    "odysseus": "M7 24a17 17 0 1 0 34 0a17 17 0 1 0-34 0M31 17l-4 10l-10 4l4-10zM24 4v4M24 40v4",
    "spock": "M5.52 7.5l8.48 23.03M16.43 3.86l4.85 26.67M30.98 3.86l-4.85 26.67M41.88 7.5l-8.48 23.03M14.01 30.53c0 9.7 2.42 13.33 9.7 13.33s9.7-3.64 9.7-13.33M34.61 35.38l7.27-4.85",
    "samwise-gamgee": "M8.21 19.27h31.58v11.58a7.37 7.37 0 0 1-7.37 7.37H15.58a7.37 7.37 0 0 1-7.37-7.37zM4 19.27h40M16.63 14.01c0-5.26 14.74-5.26 14.74 0",
    "zuko": "M24.05 2.67c2.29 10.29 12.57 14.86 12.57 26.29a12.57 12.57 0 0 1-25.14 0c0-6.86 4.57-10.29 5.71-17.14c2.29 3.43 4.57 5.71 6.86 6.86c-1.14-4.57-1.14-10.29 0-16zM24.05 42.67c-3.43 0-5.71-2.29-5.71-5.71c0-3.43 3.43-5.71 5.71-9.14c2.29 3.43 5.71 5.71 5.71 9.14c0 3.43-2.29 5.71-5.71 5.71z",
    "spike-spiegel": "M24 2.63l4 14l14 11v4l-14-3l-1 8l4 3v3l-7-2l-7 2v-3l4-3l-1-8l-14 3v-4l14-11z",
    "edward-elric": "M4 23.95a20 20 0 1 0 40 0a20 20 0 1 0-40 0M24 3.95l17.33 30H6.67zM24 31.73a0 0 0 0 0 0 0M18.44 25.06a5.56 5.56 0 1 0 11.11 0a5.56 5.56 0 1 0-11.11 0",
    "monkey-d-luffy": "M10 28.31c0-10 6-16 14-16s14 6 14 16M4 30.31c6 5 34 5 40 0M10 25.31c9 3 19 3 28 0",
    "atticus-finch": "M24 6.81v33M13 40.81h22M9 12.81h30M10 12.81L4 26.81h12zM38 12.81l-6 14h12zM4 26.81a6 6 0 0 0 12 0M32 26.81a6 6 0 0 0 12 0",
    "don-quixote": "M24 21.56L5.82 3.38M24 21.56l18.18 18.18M24 21.56l18.18-18.18M24 21.56L5.82 39.74M24 21.56v21.82M16.73 43.38h14.55M21.58 21.56a2.42 2.42 0 1 0 4.85 0a2.42 2.42 0 1 0-4.85 0",
    "aragorn": "M24 42.46V13.58M15.11 42.46h17.78M24 33.58l-11.11-8.89M24 33.58l11.11-8.89M24 24.69l-8.89-8.89M24 24.69l8.89-8.89M24 13.58V2.46"
  };
  /* EMBLEM-PATHS:end */
  C.emblemPath = function(id){ return Object.prototype.hasOwnProperty.call(EMBLEM_PATHS, id) ? EMBLEM_PATHS[id] : (F.packs && F.packs.emblems && Object.prototype.hasOwnProperty.call(F.packs.emblems, id) ? F.packs.emblems[id] : null); };
  /* the user's supplied artwork, used exactly (js/forge/pack-emblem-art.js): { vb, body } or null */
  C.emblemArt = function(id){ const A = F.packs && F.packs.emblemArt && F.packs.emblemArt.characters; return A && Object.prototype.hasOwnProperty.call(A, id) ? A[id] : null; };
  C.emblemUrl = function(id){ return (Object.prototype.hasOwnProperty.call(EMBLEM_PATHS, id) || (F.packs && F.packs.emblems && Object.prototype.hasOwnProperty.call(F.packs.emblems, id))) ? "assets/characters/icons/" + id + ".svg" : null; };

  /* ---------------- portrait: emblem when one exists, else the generated placeholder ---------------- */
  C.portraitSVG = function(c, size, opts){
    size = size || 96;
    const emblem = id => Object.prototype.hasOwnProperty.call(EMBLEM_PATHS, id) ? EMBLEM_PATHS[id] : (F.packs && F.packs.emblems && Object.prototype.hasOwnProperty.call(F.packs.emblems, id) ? F.packs.emblems[id] : null);
    const art = !(opts && opts.placeholder) ? C.emblemArt(c.id) : null;
    const d = !(opts && opts.placeholder) ? emblem(c.id) : null;
    if (art){
      const nm = String(c.name || c.id).replace(/[&<>"']/g, "");
      return `<span class="cx-emblem" role="img" aria-label="${nm} emblem" style="--sz:${size}px"><svg class="cx-emblem-svg" viewBox="${art.vb}" fill="currentColor" stroke="none" aria-hidden="true" focusable="false">${art.body}</svg></span>`;
    }
    if (d){
      const nm = String(c.name || c.id).replace(/[&<>"']/g, "");
      return `<span class="cx-emblem" role="img" aria-label="${nm} emblem" style="--sz:${size}px"><svg class="cx-emblem-svg" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="${d}"/></svg></span>`;
    }
    const ch = c.portrait || { hue: hue(c.id || c.name), mono: initials(c.name) };
    const h = ch.hue, h2 = (h + 48) % 360;
    const id = "pg" + F.hashString(c.id || c.name).toString(36);
    return `<svg class="cx-portrait-svg" role="img" aria-label="${String(c.name).replace(/[&<>"']/g, "")} portrait" width="${size}" height="${size}" viewBox="0 0 100 100"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${h} 55% 34%)"/><stop offset="1" stop-color="hsl(${h2} 60% 22%)"/></linearGradient></defs><rect x="2" y="2" width="96" height="96" rx="26" fill="url(#${id})" stroke="#F4F3FF" stroke-opacity=".9" stroke-width="3"/><circle cx="50" cy="38" r="15" fill="#F4F3FF" fill-opacity=".18"/><path d="M22 86c3-18 15-27 28-27s25 9 28 27" fill="#F4F3FF" fill-opacity=".14"/><text x="50" y="60" text-anchor="middle" font-family="Clash Display, system-ui, sans-serif" font-weight="700" font-size="34" fill="#F4F3FF">${String(ch.mono).replace(/[&<>"']/g, "")}</text></svg>`;
  };

  /* ---------------- worlds (same engine, honest about what a world is) ---------------- */
  C.worldView = function(input, worldName){
    const profile = C.profileFrom(input); if (!profile.ok) return { ok: false, reason: "no profile" };
    const ent = typeof ATLAS_ENTITIES !== "undefined" ? ATLAS_ENTITIES.find(e => e.category === "World" && e.name === worldName) : null;
    if (!ent){
      // not an Atlas world: it may be one of the experience-pack worlds (Compare and Party link to these by id)
      const pw = F.packs && F.packs.merged && typeof worldName === "string" ? F.packs.merged("universes").find(u => u.id === worldName || u.name === worldName) : null;
      if (!pw) return { ok: false, notFound: true, reason: "unknown world" };
      const ks = Object.keys(pw.needs || {}), tw = ks.reduce((s, k) => s + Math.abs(pw.needs[k]), 0) || 1;
      const contributions = ks.map(k => ({ dim: k, label: F.facetLabel(k).toLowerCase(), weight: pw.needs[k], you: profile.facets[k] || 0, points: Math.round((profile.facets[k] || 0) * pw.needs[k] / tw * 100) / 100 })).sort((a, b) => b.points - a.points);
      const score = contributions.reduce((s, c) => s + c.points, 0);
      const fr = pw.franchise || pw.name;
      const chars = C.rank(profile).filter(x => (F.packs.franchise ? F.packs.franchise(x.char.id) : x.char.universe) === fr || x.char.universe === fr).map(x => ({ id: x.char.id, name: x.char.name, role: x.char.role, pct: x.pct }));
      const loves = contributions.filter(c => c.weight > 0).sort((a, b) => b.weight - a.weight).slice(0, 3).map(c => c.label);
      const pos = contributions.filter(c => c.points > 0).slice(0, 2).map(c => c.label);
      return { ok: true, pack: true, world: { id: pw.id, name: pw.name, source: fr, role: pw.blurb || "", energy: loves.length ? `It rewards ${F.listJoin(loves)}.` : "" }, score: Math.round(score * 100) / 100, scoreScale: "-10 to 10", contributions, characters: chars,
        summary: pos.length ? `Forge found a similarity with ${pw.name} because ${F.listJoin(pos)} ${pos.length > 1 ? "stand" : "stands"} out in your profile.` : `Forge found only a loose similarity with ${pw.name}: no single trait stands out.` };
    }
    const score = scoreAtlasEntity(ent, profile.dims);
    const contributions = ent.signature.map(s => ({ dim: s.dim, label: F.dimLabel(s.dim), weight: s.w, you: profile.dims[s.dim] || 0, points: Math.round((profile.dims[s.dim] || 0) * s.w / ent._sigMagnitude * 100) / 100 })).sort((a, b) => b.points - a.points);
    const chars = C.rank(profile).filter(x => x.char.universe === ent.source).map(x => ({ id: x.char.id, name: x.char.name, role: x.char.role, pct: x.pct }));
    return { ok: true, world: { name: ent.name, source: ent.source, role: ent.role, energy: ent.energy }, score: Math.round(score * 100) / 100, scoreScale: "-10 to 10 on the Atlas scale", contributions, characters: chars,
      summary: `Forge found a similarity with ${ent.name} because ${F.listJoin(contributions.filter(c => c.points > 0).slice(0, 2).map(c => c.label))} ${contributions.filter(c => c.points > 0).length > 1 ? "stand" : "stands"} out in your profile.`.replace("because  stand", "because no single trait stands").replace("because  stands", "because no single trait stands") };
  };
})(Forge);
if (typeof module !== "undefined" && module.exports) module.exports = Forge;
