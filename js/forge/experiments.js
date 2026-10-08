/* =========================================================================
   FORGE GROWTH ENGINE + EXPERIMENTS
   A growth plan for one person: strengths, frictions, uncertain areas and a
   few small, time-boxed experiments. An experiment is a thing to TRY, never
   a claim that practising it changes personality. After the window ends the
   person records whether it helped (Yes / No / Not sure), and that outcome
   changes which experiments are suggested next.
   ========================================================================= */
(function(F){
  "use strict";
  const G = F.growth = {};
  const { H, L, AND, OR, GAP } = F.insights;
  const ex = (id, facet, title, text, when, o) => Object.assign({ id, facet, title, text, when, days: 7, level: "standard", minutes: 10, measure: "Notice whether it felt easier by day 7." }, o || {});

  G.LIBRARY = [
    ex("reversible-two-minutes", "analysis", "Two-minute reversible decisions", "For one week, make small reversible decisions within two minutes (what to eat, which route, which task first) and don't revisit them.", OR(GAP("analysis", "initiative", 2.5), AND(H("analysis"), L("boldness", 0, 5))), { measure: "Did deciding quickly feel better, worse, or about the same?" }),
    ex("decision-deadline", "analysis", "Give decisions a deadline", "For one week, put a deadline of tomorrow at noon on every non-urgent decision. Decide by then, even if it's imperfect.", AND(H("analysis"), L("initiative", 0, 6))),
    ex("ship-at-seventy", "structure", "Send it at 70%", "Once a day, share or finish something at about 70% done instead of polishing it.", AND(H("structure"), H("analysis", 0, 6), L("flex", 0, 5)), { level: "stretch" }),
    ex("first-five", "initiative", "Five-minute start", "Pick the thing you've been avoiding and work on it for exactly five minutes. You may stop after that.", OR(L("initiative", 1, 6), GAP("analysis", "initiative", 2.5))),
    ex("one-anchor", "structure", "One anchor habit", "Pick one thing (same time each day) and keep it for the week. Don't add anything else yet.", L("structure", 1, 6)),
    ex("tomorrow-three", "structure", "Tomorrow's top three", "Each evening, write the three things that matter most tomorrow. Do those first.", L("structure", 0.5, 5), { minutes: 5 }),
    ex("unplanned-hour", "flex", "One unplanned hour", "Leave one hour a day with no plan and notice what you do with it.", AND(H("structure"), L("flex", 0, 5)), { level: "gentle" }),
    ex("change-one-routine", "flex", "Change one small routine", "Change a small routine (route, order, place) each day and notice how it feels.", L("flex", 1, 6), { level: "gentle", minutes: 5 }),
    ex("one-reach-out", "social", "One easy reach-out", "Message one person a day for a week with no agenda. Just 'thinking of you'.", L("social", 1, 6), { level: "gentle", minutes: 5 }),
    ex("solo-block", "autonomy", "A protected solo block", "Protect one 90-minute uninterrupted block a day for focused work.", AND(H("social"), L("autonomy", 0, 6)), { minutes: 90 }),
    ex("ask-how", "warmth", "Ask how they actually are", "In each conversation, ask one real question about how the other person is doing, then listen to the whole answer.", L("warmth", 0.5, 5), { minutes: 5 }),
    ex("say-preference", "boldness", "Offer your preference first", "Once a day, say what you'd actually choose before asking what others want.", AND(H("warmth"), L("boldness", 0, 5)), { level: "gentle", minutes: 2 }),
    ex("tiny-risk", "boldness", "A tiny, safe risk", "Once a day, do one slightly uncomfortable thing: a small ask, a small 'no', a small opinion.", L("boldness", 1, 6)),
    ex("pause-before-reply", "steadiness", "The ten-minute pause", "For anything that spikes you, wait ten minutes before replying.", OR(L("steadiness", 0.5, 5), L("patience", 0.5, 5)), { minutes: 10 }),
    ex("move-first", "steadiness", "Move before the hard thing", "A ten-minute walk or stretch before the hardest task of the day.", L("steadiness", 0, 5), { level: "gentle" }),
    ex("slow-one-thing", "patience", "Do one thing slowly", "Choose one routine task a day and do it deliberately slowly.", L("patience", 1, 6), { level: "gentle", minutes: 5 }),
    ex("finish-small", "persist", "Finish one small thing", "Finish one small thing completely each day before starting another.", L("persist", 1, 6)),
    ex("new-input", "explore", "One new input a day", "Try one new input per day: a route, a podcast episode, a place, a chapter.", L("explore", 1, 6), { level: "gentle", minutes: 15 }),
    ex("ten-bad-ideas", "invent", "Ten bad ideas", "Before choosing an approach, write ten bad ideas about the problem first.", L("invent", 1, 6), { minutes: 10 }),
    ex("small-reliance", "trust", "Let someone help", "Let someone help with one small thing each day.", L("trust", 1, 6), { level: "gentle", minutes: 2 }),
    ex("name-their-win", "compete", "Name one win that isn't yours", "Each day, tell someone one thing they did well.", AND(H("compete"), L("warmth", 0, 5)), { minutes: 2 }),
    ex("three-went-fine", "optimism", "Three things that went fine", "Each night, write three things that went fine today.", L("optimism", 1, 6), { level: "gentle", minutes: 3 }),
    ex("co-work", "social", "Work next to someone", "Do one work session alongside another person, in the same room or on a call.", AND(H("autonomy"), L("social", 0, 6)), { level: "gentle", minutes: 45 }),
    ex("one-light-moment", "humor", "One light moment", "Add one deliberately playful moment to your day: a joke, a silly message, a small game.", L("humor", 1, 6), { level: "gentle", minutes: 2 }),
    ex("explain-it", "social", "Explain it out loud", "Once a day, explain something you're working on to another person in two minutes.", AND(H("analysis"), L("social", 0, 6)), { minutes: 5 }),
    ex("write-the-tangle", "analysis", "Ten-minute brain dump", "When your head is full, write for ten minutes without editing, then circle the one thing that matters.", AND(H("analysis", 0, 6), L("steadiness", 0, 6)), { level: "gentle", minutes: 10 }),
    ex("protect-recovery", "steadiness", "Thirty minutes with nothing in it", "Schedule thirty minutes a day with nothing in it. No input, no tasks.", () => 0, { level: "gentle", minutes: 30 }),
    ex("tiny-wins", "structure", "Collect tiny wins", "Do three small, concrete things a day and tick them off visibly.", () => 0, { level: "gentle", minutes: 10 }),
  ];
  /* Experiments that BUILD a facet. They also qualify when that facet is among this person's own lowest,
     even if it isn't low in absolute terms: real profiles are often high across the board, and the
     most useful place to experiment is still wherever you're relatively least practised. */
  G.EDGE = new Set(["first-five", "one-anchor", "tomorrow-three", "change-one-routine", "one-reach-out", "ask-how", "tiny-risk", "pause-before-reply", "move-first", "slow-one-thing", "finish-small", "new-input", "ten-bad-ideas", "small-reliance", "three-went-fine", "one-light-moment", "say-preference"]);
  G.experimentFor = function(facet){ return G.LIBRARY.find(e => e.facet === facet) || null; };
  const byId = id => G.LIBRARY.find(e => e.id === id) || null;

  /* ---------------- outcomes feed back into ranking ---------------- */
  G.outcomeStats = function(list){
    const byFacet = {}, byId2 = {};
    (list || []).forEach(r => {
      if (!r.outcome) return;
      const w = r.outcome === "yes" ? 1 : r.outcome === "no" ? -1 : 0;
      byFacet[r.facet || (byId(r.key) || {}).facet] = (byFacet[r.facet || (byId(r.key) || {}).facet] || 0) + w;
      byId2[r.key] = (byId2[r.key] || 0) + w;
    });
    return { byFacet, byId: byId2 };
  };

  /* Rank experiments for this person. ctx: {state, experiments (store list), now}. */
  G.suggest = function(profile, ctx, n){
    ctx = ctx || {}; n = n || 3;
    if (!profile || !profile.ok) return [];
    const exps = (Array.isArray(ctx.experiments) ? ctx.experiments : []).filter(x => x && typeof x === "object");
    const active = new Set(exps.filter(e => e.status === "active").map(e => e.key));
    const stats = G.outcomeStats(exps);
    const strained = !!(ctx.state && ctx.state.strained);
    const out = [];
    const rankAsc = F.FACET_KEYS.slice().sort((a, b) => profile.facets[a] - profile.facets[b]);
    G.LIBRARY.forEach(e => {
      if (active.has(e.id)) return;
      let s = e.when(profile);
      if (G.EDGE.has(e.id) && profile.facets[e.facet] <= 5){ const rank = rankAsc.indexOf(e.facet); s = Math.max(s, F.clamp(0.72 - rank * 0.07, 0, 0.72)); }
      if (strained){
        if (e.level === "gentle") s = Math.max(s, e.id === "protect-recovery" ? 0.9 : s) + 0.12;
        if (e.level === "stretch") s *= 0.3;
      } else if (e.id === "protect-recovery") s = 0;
      if (e.id === "tiny-wins") s = ctx.state && ctx.state.controlLevel != null && ctx.state.controlLevel <= 0.3 ? 0.8 : 0;
      const fb = stats.byFacet[e.facet] || 0, fbId = stats.byId[e.id] || 0;
      s *= fbId < 0 ? 0.5 : 1;                                 // you tried this and it didn't help: much less likely
      s += F.clamp(fb, -2, 2) * 0.06;                          // other experiments on this facet helped: slightly more likely
      const tried = exps.filter(x => x.key === e.id).length;
      s -= Math.min(0.2, tried * 0.08);                        // freshness
      if (s >= 0.28) out.push({ experiment: e, score: F.round1(s * 100) / 100 });
    });
    out.sort((a, b) => b.score - a.score);
    // one experiment per facet in a single batch keeps suggestions varied
    const seen = new Set(), picked = [];
    for (const x of out){ if (seen.has(x.experiment.facet)) continue; seen.add(x.experiment.facet); picked.push(x); if (picked.length >= n) break; }
    return picked.map(x => {
      const ev = F.insights.evidenceFor(profile, [x.experiment.facet]);
      const why = ev.length ? `Your ${ev[0].label.toLowerCase()} reads ${ev[0].band} (${F.round1(ev[0].value)}). ` : "";
      const extra = strained ? "Because your latest check-in shows more strain than usual, Forge is keeping this gentle." : "";
      return { id: x.experiment.id, title: x.experiment.title, text: x.experiment.text, days: x.experiment.days, level: x.experiment.level, minutes: x.experiment.minutes,
        facet: x.experiment.facet, measure: x.experiment.measure, score: x.score, evidence: ev,
        why: (why + "This is something to try, not a prescription. It may or may not help." + (extra ? " " + extra : "")).trim() };
    });
  };

  /* ---------------- start / finish ---------------- */
  G.start = function(id, now){
    const e = byId(id); if (!e) return null;
    const active = F.store.list("experiments").find(x => x.key === id && x.status === "active");
    if (active) return active;
    return F.store.add("experiments", { key: id, title: e.title, startedTs: now || Date.now(), durationDays: e.days, status: "active", facet: e.facet });
  };
  G.recordOutcome = function(recordId, outcome, note, now){
    if (!["yes", "no", "unsure"].includes(outcome)) return null;
    return F.store.update("experiments", recordId, { status: "completed", outcome, outcomeTs: now || Date.now(), note: note || "" });
  };
  G.abandon = function(recordId){ return F.store.update("experiments", recordId, { status: "abandoned" }); };
  G.active = function(){ return F.store.list("experiments").filter(e => e.status === "active"); };
  /* Experiments whose window has ended and still need an answer. */
  G.due = function(now){
    now = now || Date.now();
    return G.active().filter(e => now >= e.startedTs + e.durationDays * 86400000);
  };
  G.daysLeft = (e, now) => Math.max(0, Math.ceil((e.startedTs + e.durationDays * 86400000 - (now || Date.now())) / 86400000));

  /* ---------------- "this month" from the timeline ---------------- */
  G.thisMonth = function(snaps){
    if (!snaps || snaps.length < 2) return { ok: false, reason: "need at least two assessments" };
    const last = snaps[snaps.length - 1];
    // earliest snapshot within 45 days of the latest, else the previous one
    const cutoff = last.timestamp - 45 * 86400000;
    const base = snaps.slice(0, -1).filter(s => s.timestamp >= cutoff)[0] || snaps[snaps.length - 2];
    const facets = F.timeline.compareFacets(base, last).filter(f => Math.abs(f.delta) >= 1.5).sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, 4);
    const items = facets.map(f => { const s = F.timeline.STORY[f.facet]; return { facet: f.facet, arrow: f.delta > 0 ? "up" : "down", text: f.delta > 0 ? s.up : s.down, delta: f.delta }; });
    return { ok: true, since: base.timestamp, to: last.timestamp, items, gapDays: F.daysBetween(base.timestamp, last.timestamp) };
  };

  /* ---------------- the plan ---------------- */
  G.plan = function(profile, ctx){
    ctx = ctx || {};
    if (!profile || !profile.ok) return { ok: false, reason: "no profile" };
    const ranked = F.FACET_KEYS.map(k => ({ k, v: profile.facets[k] })).sort((a, b) => b.v - a.v);
    const strengths = ranked.filter(x => x.v >= 3).slice(0, 3).map(x => ({ facet: x.k, label: F.facetLabel(x.k), text: F.timeline.describeFacet(x.k, x.v), evidence: F.insights.evidenceFor(profile, [x.k])[0] }));
    const frictions = [];
    // friction = a strong facet that pulls against another, or a notably low facet
    const pairs = [["analysis", "initiative", "Strong analysis with slower starts can turn thoroughness into waiting."], ["warmth", "boldness", "A warm, careful style can leave your own view unspoken."], ["autonomy", "social", "Strong independence with lower social appetite can read as distance."], ["initiative", "patience", "Quick starts with a short fuse can feel pushy."], ["structure", "flex", "Strong structure with low flexibility makes surprises costly."]];
    pairs.forEach(([a, b, text]) => { const gap = profile.facets[a] - profile.facets[b]; if (gap >= 4 && profile.facets[a] >= 2.5) frictions.push({ facets: [a, b], text, gap: F.round1(gap), evidence: F.insights.evidenceFor(profile, [a, b]) }); });
    ranked.slice(-3).filter(x => x.v <= -3).forEach(x => frictions.push({ facets: [x.k], text: `${F.facetLabel(x.k)} is where you're lowest. Often just the other side of a strength, occasionally a limit.`, gap: F.round1(-x.v), evidence: F.insights.evidenceFor(profile, [x.k]) }));
    return {
      ok: true,
      strengths, frictions: frictions.sort((a, b) => b.gap - a.gap).slice(0, 3),
      uncertain: profile.uncertainty.areas.slice(0, 2),
      suggestions: G.suggest(profile, ctx, 3),
      thisMonth: G.thisMonth(ctx.snapshots || []),
      active: (ctx.experiments || []).filter(e => e && e.status === "active"),
      due: (ctx.experiments || []).filter(e => e && e.status === "active" && (ctx.now || Date.now()) >= e.startedTs + e.durationDays * 86400000),
      note: "Experiments are small things to try. Forge doesn't claim they change who you are.",
    };
  };
})(Forge);
if (typeof module !== "undefined" && module.exports) module.exports = Forge;
