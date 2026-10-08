/* =========================================================================
   FORGE TIMELINE + CHANGE ENGINE
   Turns the stored snapshot history (engine.js pf_history) into a
   longitudinal story. Pure functions over normalized snapshots; the only
   storage touch is Forge.timeline.snapshots(), which reads the engine's
   own timeline, so the engine remains the single source of truth.

   WHAT A "CHANGE" MEANS HERE
   For every dimension between two snapshots we compute
     delta            absolute change, RAW points (-20..20)
     normalized       delta / 20               (-1..1)
     relative         delta / max(2,|before|)  (how large vs where you started)
     weighted         delta * sqrt(confBefore*confAfter)   (confidence-weighted)
   and then classify it:
     "real"      meaningful, well-measured, and either persistent across
                 >=3 snapshots or separated by enough time that a passing
                 mood is an unlikely explanation
     "state"     meaningful but likely a state fluctuation: a state-sensitive
                 dimension, a short gap, or a value that reverted vs earlier
     "lowconf"   large, but one of the two reads was weakly measured
     "noise"     inside the expected retest wobble (shown, never narrated)
   Nothing here claims a cause. Wording is always "your answers suggest",
   "Forge is seeing", "may indicate".
   ========================================================================= */
(function(F){
  "use strict";
  const T = F.timeline = {};
  const dimList = () => DIMENSIONS;

  /* How much each dimension tends to move with passing mood/circumstance
     rather than long-run character (0 stable .. 1 very state-sensitive). */
  T.STATE_SENSITIVITY = {
    emotionalStability: 0.8, optimism: 0.7, socialEnergy: 0.65, patience: 0.6, drive: 0.6, resilience: 0.5, risk: 0.4, confidence: 0.4,
    trust: 0.35, competitiveness: 0.35, persistence: 0.3, leadership: 0.3, humor: 0.3, adaptability: 0.3, empathy: 0.25, selfAwareness: 0.25,
    discipline: 0.25, planning: 0.25, kindness: 0.2, independence: 0.2, openMindedness: 0.2, responsibility: 0.2, creativity: 0.2, curiosity: 0.2, logic: 0.15,
  };
  T.MIN_REAL = 3;            // RAW points
  T.SHORT_GAP_DAYS = 14;

  /* ---------------- snapshots ---------------- */
  /* entries: engine timeline entries (or anything normalizeProfile accepts).
     Returns normalized snapshots, oldest -> newest, legacy (<PF4) excluded. */
  T.snapshots = function(entries){
    let list = entries;
    if (!list){
      try{ list = typeof getActiveTimeline === "function" ? getActiveTimeline() : []; } catch(e){ list = []; }
    }
    const raw = (Array.isArray(list) ? list : []).filter(e => e && typeof e === "object" && !e.legacy);
    const snaps = [];
    raw.slice().sort((a, b) => F.num(a.timestamp, 0) - F.num(b.timestamp, 0)).forEach(e => {
      const p = F.normalizeProfile(e, { historyDims: snaps.map(s => s.dims) });
      if (p.ok){ p.kind = e.assessmentKind || "full"; p.questionIds = Array.isArray(e.questionIds) ? e.questionIds.filter(x => typeof x === "string").slice(0, 80) : []; p.index = snaps.length; snaps.push(p); }
    });
    snaps.forEach((s, i) => { s.index = i; });
    return snaps;
  };

  T.series = function(snaps, key){
    const isFacet = !!F.FACETS[key];
    return snaps.map(s => ({ ts: s.timestamp, index: s.index, value: isFacet ? s.facets[key] : s.dims[key],
      conf: isFacet ? F.mean(Object.keys(F.FACETS[key].w).map(d => s.confidence.dims[d] ? s.confidence.dims[d].value : 0.5)) : (s.confidence.dims[key] ? s.confidence.dims[key].value : 0.5) }));
  };

  /* ---------------- per-dimension change ---------------- */
  function noiseBand(conf){ return 1.5 + (1 - conf) * 2.5; }          // RAW points of expected retest wobble
  function dimConf(snap, d){ return snap.confidence.dims[d] ? snap.confidence.dims[d].value : 0.5; }

  /* prior: earlier snapshots (before `a`) used to judge persistence/reversion. */
  T.compareDims = function(a, b, prior){
    prior = prior || [];
    const gapDays = (a.timestamp && b.timestamp) ? F.daysBetween(a.timestamp, b.timestamp) : null;
    const out = [];
    dimList().forEach(d => {
      const before = a.dims[d], after = b.dims[d];
      const delta = after - before;
      const ca = dimConf(a, d), cb = dimConf(b, d);
      const pairConf = Math.sqrt(ca * cb);
      const weighted = delta * pairConf;
      const band = noiseBand(pairConf);
      let cls = "noise";
      const abs = Math.abs(delta);
      const sens = T.STATE_SENSITIVITY[d] || 0.3;
      const shortGap = gapDays != null && gapDays < T.SHORT_GAP_DAYS;
      const stateRisk = sens * (gapDays == null ? 0.6 : Math.exp(-gapDays / 21));
      // reversion: after is closer to the earlier baseline than to `before`
      let reverted = false, persisted = false;
      if (prior.length){
        const base = F.mean(prior.map(p => p.dims[d]));
        reverted = Math.abs(after - base) < Math.abs(before - base) * 0.6 && Math.abs(before - base) >= 3;
        persisted = prior.length >= 1 && Math.sign(after - base) === Math.sign(delta) && Math.abs(after - base) >= T.MIN_REAL;
      }
      if (abs >= T.MIN_REAL && abs > band){
        if (Math.min(ca, cb) < 0.4) cls = "lowconf";
        else if (reverted || (stateRisk >= 0.4 && shortGap) || (shortGap && sens >= 0.5)) cls = "state";
        else if (Math.abs(weighted) >= 2.2 && (persisted || (gapDays != null && gapDays >= 21) || sens <= 0.3)) cls = "real";
        else cls = "state";
      }
      out.push({ dim: d, label: F.dimLabel(d), before, after, delta, normalized: F.round1(delta / 20 * 100) / 100,
        relative: F.round1(delta / Math.max(2, Math.abs(before)) * 100) / 100, weighted: F.round1(weighted), confidence: F.round1(pairConf * 100) / 100,
        class: cls, stateSensitivity: sens, direction: delta > 0 ? "up" : delta < 0 ? "down" : "flat" });
    });
    return out;
  };

  T.compareFacets = function(a, b){
    return F.FACET_KEYS.map(k => ({ facet: k, label: F.facetLabel(k), before: a.facets[k], after: b.facets[k], delta: F.round1(b.facets[k] - a.facets[k]) }));
  };

  /* ---------------- how a facet reads at a level (THEN / NOW) ---------------- */
  const STORY = {
    analysis:   { low: "You tended to go with instinct more than analysis.", mid: "You balanced analysis with gut feel.", high: "You tended to analyze before acting.", up: "leaning harder on analysis before deciding", down: "trusting instinct over analysis more often" },
    initiative: { low: "You tended to wait for a clearer starting point.", mid: "You started things when the moment felt right.", high: "You tended to start things and carry them forward.", up: "starting things more readily", down: "waiting longer before starting" },
    boldness:   { low: "You tended to prefer the safer option.", mid: "You took risks selectively.", high: "You tended to lean toward the bold option.", up: "more willing to take risks", down: "more careful about risk" },
    structure:  { low: "You tended to improvise rather than plan.", mid: "You planned the important parts and left the rest open.", high: "You tended to plan carefully and follow through.", up: "leaning on plans and routines more", down: "holding plans more loosely" },
    flex:       { low: "You tended to prefer things staying as planned.", mid: "You adjusted when you needed to.", high: "You tended to adapt easily when things changed.", up: "adapting more easily", down: "preferring things to stay predictable" },
    social:     { low: "You tended to recharge alone and keep social time small.", mid: "You enjoyed company in measured doses.", high: "You tended to be energized by being around people.", up: "more energized by other people", down: "wanting more time to yourself" },
    warmth:     { low: "You tended to keep your emotional distance.", mid: "You were warm with people you knew.", high: "You tended to tune into how others feel.", up: "tuning into others more", down: "keeping more emotional distance" },
    autonomy:   { low: "You tended to prefer working things out with others.", mid: "You balanced independence with collaboration.", high: "You tended to value doing things your own way.", up: "valuing independence more", down: "leaning toward collaboration" },
    explore:    { low: "You tended to stick with what you knew.", mid: "You explored when something caught your interest.", high: "You tended to go looking for new things.", up: "reaching for new ideas and experiences", down: "settling into familiar ground" },
    invent:     { low: "You tended to prefer proven approaches.", mid: "You mixed proven and new approaches.", high: "You tended to come up with original angles.", up: "generating more original ideas", down: "favoring proven approaches" },
    steadiness: { low: "You tended to feel pressure quickly.", mid: "You stayed fairly level most days.", high: "You tended to stay calm under pressure.", up: "staying steadier under pressure", down: "feeling pressure more quickly" },
    patience:   { low: "You tended to want things to move faster.", mid: "You were patient when it mattered.", high: "You tended to let things take the time they take.", up: "being more patient", down: "wanting things to move faster" },
    persist:    { low: "You tended to move on when something stalled.", mid: "You stuck with things that mattered.", high: "You tended to keep going when it got hard.", up: "following through longer", down: "moving on sooner when something stalls" },
    trust:      { low: "You tended to wait for trust to be earned.", mid: "You extended trust gradually.", high: "You tended to give people the benefit of the doubt.", up: "extending trust more readily", down: "being more guarded" },
    compete:    { low: "You tended to avoid competition.", mid: "You competed when it was fun or mattered.", high: "You tended to push yourself against others.", up: "more drawn to competition", down: "less drawn to competition" },
    humor:      { low: "You tended to keep things serious.", mid: "You used humor in moderation.", high: "You tended to bring playfulness into things.", up: "bringing in more humor", down: "keeping things more serious" },
    optimism:   { low: "You tended to expect problems first.", mid: "You were realistic about how things might go.", high: "You tended to expect things to work out.", up: "expecting good outcomes more", down: "expecting problems more" },
  };
  T.STORY = STORY;
  const level = v => v >= 3 ? "high" : v <= -3 ? "low" : "mid";
  T.describeFacet = function(key, value){ const s = STORY[key]; return s ? s[level(value)] : ""; };

  /* ---------------- cross-dimension interaction patterns ----------------
     Each pattern requires several facet moves at once; strength is the
     weakest required move, so a single large change can't fake a pattern. */
  const P = (id, title, req, text, caution) => ({ id, title, req, text, caution: caution || null });
  T.PATTERNS = [
    P("independent-connected", "Independent, but more connected", { autonomy: 1, social: 1 }, "You haven't necessarily become less independent. You may be becoming more comfortable doing things with other people."),
    P("further-alone", "Leaning into self-reliance", { autonomy: 1, social: -1 }, "Forge is seeing more preference for working things out on your own, with less appetite for company."),
    P("ideas-and-reach", "More ideas, more reach", { invent: 1, explore: 1 }, "Curiosity and original thinking both moved up together. That often shows up as taking on new directions."),
    P("calm-risk", "Bolder, and steadier about it", { boldness: 1, steadiness: 1 }, "More willingness to take risks alongside more steadiness. That combination usually reads as confidence rather than recklessness."),
    P("risk-pressure", "Bolder, with less steadiness", { boldness: 1, steadiness: -1 }, "More risk-taking while feeling less steady may be excitement or may be pressure. A check-in can help tell which.", "state"),
    P("looser-plans", "Looser plans, more flexibility", { structure: -1, flex: 1 }, "You may be trading schedules for adaptability: fewer fixed plans and an easier time when things change."),
    P("more-structure", "More structure, less give", { structure: 1, flex: -1 }, "More planning and routine alongside less flexibility. Reliable, though it can leave less room for surprises."),
    P("deliberate", "More deliberate", { analysis: 1, initiative: -1 }, "More analysis before acting and slower starts. Useful for big decisions, costly if it becomes waiting."),
    P("act-first", "Acting first", { analysis: -1, initiative: 1 }, "You may be trusting momentum over analysis. Often a sign you're comfortable with reversible decisions."),
    P("shorter-fuse", "Shorter fuse", { steadiness: -1, patience: -1 }, "Less steadiness and less patience together. This often tracks a busy or stressful stretch rather than a change in character.", "state"),
    P("hopeful-persistent", "Hopeful and persistent", { optimism: 1, persist: 1 }, "More expectation that things work out and more willingness to keep going when they don't, straight away."),
    P("withdrawing", "Quieter and less steady", { social: -1, steadiness: -1 }, "Less appetite for company and less steadiness at the same time. Worth being gentle with; check-ins can show if it's a passing state.", "state"),
    P("competitive-edge", "More competitive, less warm", { compete: 1, warmth: -1 }, "More drive to compete with a bit less emotional attunement. Common when stakes feel high."),
    P("opening-up", "Opening up", { trust: 1, warmth: 1 }, "More trust and more attunement to others, which usually makes relationships easier to start and to keep."),
    P("guarded", "More guarded", { trust: -1, warmth: -1 }, "Less trust and less attunement. Often follows a disappointment, and often softens again."),
    P("playful-outgoing", "More playful and outgoing", { humor: 1, social: 1 }, "Humor and social energy moved up together, which tends to make groups easier to be in."),
    P("routine-follow-through", "Follow-through with routines", { persist: 1, structure: 1 }, "More staying power supported by more structure. A solid base for long projects."),
    P("take-ownership", "Taking more ownership", { initiative: 1, autonomy: 1 }, "More initiative together with more independence: you may be taking charge of things you used to wait on."),
    P("easing-off", "Easing off", { initiative: -1, persist: -1 }, "Less drive to start and less staying power. Can be rest, can be burnout; context matters.", "state"),
  ];

  T.detectPatterns = function(facetDeltas, opts){
    opts = opts || {};
    const min = opts.minMove != null ? opts.minMove : 1.5;
    const byFacet = {}; facetDeltas.forEach(f => byFacet[f.facet] = f.delta);
    const hits = [];
    T.PATTERNS.forEach(p => {
      let strength = Infinity, ok = true;
      for (const k in p.req){
        const need = p.req[k], d = byFacet[k];
        if (d == null || Math.sign(d) !== need || Math.abs(d) < min){ ok = false; break; }
        strength = Math.min(strength, Math.abs(d));
      }
      if (ok) hits.push({ id: p.id, title: p.title, text: p.text, caution: p.caution, strength: F.round1(strength), facets: Object.keys(p.req) });
    });
    return hits.sort((a, b) => b.strength - a.strength);
  };

  /* ---------------- "What Changed?" ---------------- */
  /* from/to: normalized snapshots. prior: snapshots before `from` (optional). */
  T.whatChanged = function(from, to, prior){
    if (!from || !to || !from.ok || !to.ok) return { ok: false, reason: "need two snapshots" };
    prior = prior || [];
    const gapDays = (from.timestamp && to.timestamp) ? F.daysBetween(from.timestamp, to.timestamp) : null;
    const dims = T.compareDims(from, to, prior);
    const facets = T.compareFacets(from, to);
    const real = dims.filter(d => d.class === "real").sort((a, b) => Math.abs(b.weighted) - Math.abs(a.weighted));
    const state = dims.filter(d => d.class === "state").sort((a, b) => Math.abs(b.weighted) - Math.abs(a.weighted));
    const lowconf = dims.filter(d => d.class === "lowconf").sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
    const stable = dims.filter(d => d.class === "noise" && Math.abs(d.delta) <= 1).sort((a, b) => Math.abs(a.delta) - Math.abs(b.delta));
    // Only narrate patterns built from facets whose underlying moves are classed real or state (not noise/lowconf alone)
    const patterns = T.detectPatterns(facets);
    const biggest = patterns[0] || null;
    const bigFacet = facets.slice().sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))[0];

    const thenNow = facets.filter(f => Math.abs(f.delta) >= 2 && level(f.before) !== level(f.after))
      .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, 4)
      .map(f => ({ facet: f.facet, label: f.label, then: T.describeFacet(f.facet, f.before), now: T.describeFacet(f.facet, f.after), delta: f.delta }));

    let headline;
    if (!real.length && !state.length) headline = "Compared with your previous profile, Forge isn't seeing a meaningful shift. That's information too: your read is holding steady.";
    else if (biggest) headline = `Your biggest shift: ${biggest.title.toLowerCase()}. ${biggest.text}`;
    else if (bigFacet && Math.abs(bigFacet.delta) >= 1.5){
      const s = STORY[bigFacet.facet];
      headline = `Your biggest shift: ${F.facetLabel(bigFacet.facet).toLowerCase()}. Forge is seeing you ${bigFacet.delta > 0 ? s.up : s.down}.`;
    } else headline = "Compared with your previous profile, Forge sees a few small moves but nothing that stands out.";

    const caveats = [];
    if (gapDays != null && gapDays < T.SHORT_GAP_DAYS) caveats.push(`These two reads are only ${gapDays} day${gapDays === 1 ? "" : "s"} apart, so some of what moved may be mood or circumstances rather than character.`);
    if (lowconf.length) caveats.push(`${lowconf.length} change${lowconf.length === 1 ? " is" : "s are"} based on a weakly measured read, so Forge isn't treating ${lowconf.length === 1 ? "it" : "them"} as real yet.`);
    if (from.kind === "targeted" || to.kind === "targeted") caveats.push("One of these reads was a targeted retake covering only some areas.");
    const archChanged = from.archetype && to.archetype && from.archetype.id !== to.archetype.id;
    const bothConfident = (from.confidence.overall == null || from.confidence.overall >= 50) && (to.confidence.overall == null || to.confidence.overall >= 50);
    return {
      ok: true, fromTs: from.timestamp, toTs: to.timestamp, gapDays,
      headline, biggestShift: biggest || (bigFacet ? { id: "facet-" + bigFacet.facet, title: F.facetLabel(bigFacet.facet), text: headline, facets: [bigFacet.facet], strength: Math.abs(bigFacet.delta) } : null),
      patterns, thenNow, real, state, lowconf, stable: stable.slice(0, 8), dims, facets, caveats,
      archetype: { changed: !!archChanged, from: from.archetype && from.archetype.name, to: to.archetype && to.archetype.name, trusted: !!(archChanged && bothConfident) },
      confidence: { from: from.confidence.overall, to: to.confidence.overall, delta: (from.confidence.overall != null && to.confidence.overall != null) ? to.confidence.overall - from.confidence.overall : null },
    };
  };

  /* Convenience selectors the UI uses: previous / first / any selected index. */
  T.compareWith = function(snaps, toIndex, mode, selectedIndex){
    const to = snaps[toIndex]; if (!to) return { ok: false, reason: "no snapshot" };
    let fromIndex;
    if (mode === "first") fromIndex = 0;
    else if (mode === "selected") fromIndex = selectedIndex;
    else fromIndex = toIndex - 1;
    if (fromIndex == null || fromIndex < 0 || fromIndex >= toIndex) return { ok: false, reason: "no earlier snapshot to compare with" };
    return T.whatChanged(snaps[fromIndex], to, snaps.slice(0, fromIndex));
  };

  /* Longer-run view: for each facet, direction over ALL snapshots with a
     simple least-squares slope in RAW points per 90 days. Only reported with
     >= 3 snapshots spanning >= 30 days; shorter histories return null. */
  T.trends = function(snaps){
    if (snaps.length < 3) return null;
    const span = F.daysBetween(snaps[0].timestamp, snaps[snaps.length - 1].timestamp);
    if (span < 30) return null;
    const t0 = snaps[0].timestamp;
    return F.FACET_KEYS.map(k => {
      const xs = snaps.map(s => (s.timestamp - t0) / 86400000), ys = snaps.map(s => s.facets[k]);
      const mx = F.mean(xs), my = F.mean(ys);
      let num = 0, den = 0; xs.forEach((x, i) => { num += (x - mx) * (ys[i] - my); den += (x - mx) * (x - mx); });
      const slope = den ? num / den : 0;
      return { facet: k, label: F.facetLabel(k), per90: F.round1(slope * 90), start: ys[0], end: ys[ys.length - 1], direction: Math.abs(slope * 90) < 1 ? "steady" : slope > 0 ? "rising" : "falling" };
    }).sort((a, b) => Math.abs(b.per90) - Math.abs(a.per90));
  };

  /* Event-linked view: what Forge observed after a life event the person
     recorded. Compares the last snapshot at/before the event with the latest
     snapshot after it. Wording is observational and never causal. */
  T.afterEvent = function(snaps, event){
    if (!event || !snaps.length) return { ok: false, reason: "no data" };
    const before = snaps.filter(s => s.timestamp <= event.ts).pop();
    const afterList = snaps.filter(s => s.timestamp > event.ts);
    if (!before) return { ok: false, reason: "no snapshot from before this event" };
    if (!afterList.length) return { ok: false, reason: "no snapshot taken since this event yet" };
    const after = afterList[afterList.length - 1];
    const wc = T.whatChanged(before, after, snaps.filter(s => s.timestamp < before.timestamp));
    const moves = wc.real.concat(wc.state).slice(0, 4).map(d => ({ label: d.label, delta: d.delta, class: d.class }));
    const text = moves.length
      ? `After this event, Forge observed: ${F.listJoin(moves.map(m => `${m.label} ${m.delta > 0 ? "up" : "down"} ${Math.abs(m.delta)}`))}. That's what the data shows, not a claim that the event caused it.`
      : "After this event, Forge didn't observe a clear change in your profile.";
    return { ok: true, before, after, wc, moves, text };
  };
})(Forge);
if (typeof module !== "undefined" && module.exports) module.exports = Forge;
