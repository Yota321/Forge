/* =========================================================================
   FORGE TARGETED RETAKE ("retake only what changed") + CONFIDENCE GROWTH
   Instead of repeating the whole assessment, ask the 8-12 questions that
   would tell Forge the most about this person right now.

   1. Score every dimension's priority from five measurable signals:
        uncertainty   how weakly measured it is (1 - dimension confidence)
        instability   how much it varied across earlier assessments
        recent change how far it moved between the last two assessments
        staleness     how old the read is, weighted by how state-sensitive
                      the dimension is
        ambiguity     whether it separates the top two archetypes
   2. Pick questions greedily by information value (spread of the answer
      options on the still-valuable dimensions), with diminishing returns so
      the set covers several areas rather than one.
   3. Blend new answers into the existing profile by EVIDENCE WEIGHT:
        combined = nPrior/(nPrior+nNew) * (prior + sumNew)
      Answering the way you did before leaves the profile where it was;
      answering differently moves it in proportion to how much new evidence
      exists. A handful of answers can never overwrite a full assessment.
   ========================================================================= */
(function(F){
  "use strict";
  const R = F.retake = {};
  const W = { U: 0.42, I: 0.18, C: 0.16, S: 0.12, A: 0.12 };
  R.MIN_Q = 8; R.MAX_Q = 12; R.TARGETS = 6;
  const NPRIOR_BASE = { short: 3, balanced: 4, deep: 6 };

  /* ---------------- priorities ---------------- */
  R.priorities = function(profile, ctx){
    ctx = ctx || {};
    const snaps = ctx.snapshots || [];
    const now = ctx.now || Date.now();
    const ageDays = profile.timestamp ? Math.max(0, (now - profile.timestamp) / 86400000) : 90;
    // archetype ambiguity: dims that distinguish the top two candidates
    let ambDims = {};
    try{
      if (profile.ranking && profile.ranking.length >= 2 && typeof ARCHETYPES !== "undefined"){
        const a = ARCHETYPES.find(x => x.id === profile.ranking[0].id), b = ARCHETYPES.find(x => x.id === profile.ranking[1].id);
        const gap = Math.abs(profile.ranking[0].score - profile.ranking[1].score);
        const ambiguity = F.clamp01(1 - gap / 3);
        const diff = {};
        a.signature.forEach(s => { diff[s.dim] = (diff[s.dim] || 0) + s.w; });
        b.signature.forEach(s => { diff[s.dim] = (diff[s.dim] || 0) - s.w; });
        Object.keys(diff).forEach(d => { ambDims[d] = F.clamp01(Math.abs(diff[d]) / 3) * ambiguity; });
      }
    } catch(e){ ambDims = {}; }
    const last = snaps.length >= 2 ? snaps[snaps.length - 1] : null, prev = snaps.length >= 2 ? snaps[snaps.length - 2] : null;
    return DIMENSIONS.map(d => {
      const conf = profile.confidence.dims[d] ? profile.confidence.dims[d].value : 0.5;
      const U = 1 - conf;
      const series = snaps.map(s => s.dims[d]);
      const I = series.length >= 2 ? F.clamp01(F.stdev(series) / 4) : 0;
      const C = (last && prev) ? F.clamp01(Math.abs(last.dims[d] - prev.dims[d]) / 6) : 0;
      const sens = (F.timeline && F.timeline.STATE_SENSITIVITY[d]) || 0.3;
      const S = F.clamp01((ageDays / 180 - 0.15)) * (0.4 + sens);
      const A = ambDims[d] || 0;
      const priority = W.U * U + W.I * I + W.C * C + W.S * S + W.A * A;
      const reasons = [];
      if (U >= 0.45) reasons.push("Forge is least certain about this");
      if (I >= 0.4) reasons.push("it has varied between your assessments");
      if (C >= 0.4) reasons.push("it moved recently");
      if (S >= 0.3) reasons.push("it hasn't been checked in a while");
      if (A >= 0.3) reasons.push("it helps separate your top two archetypes");
      return { dim: d, label: F.dimLabel(d), priority: F.round1(priority * 1000) / 1000, uncertainty: F.round1(U * 100) / 100, reasons, conf };
    }).sort((a, b) => b.priority - a.priority);
  };

  /* ---------------- question selection ---------------- */
  const spread = (q, d) => {
    let lo = Infinity, hi = -Infinity;
    q.options.forEach(o => { const v = (o.d && o.d[d]) || 0; if (v < lo) lo = v; if (v > hi) hi = v; });
    return hi - lo;
  };
  R.selectQuestions = function(targets, opts){
    opts = opts || {};
    const exclude = new Set(opts.exclude || []);
    const min = opts.min || R.MIN_Q, max = opts.max || R.MAX_Q;
    const pr = {}; targets.forEach(t => { pr[t.dim] = t.priority; });
    const chosen = []; const used = new Set();
    const pool = QUESTIONS.slice();
    let firstGain = null;
    const gainOf = q => { let g = 0; for (const d in pr) g += pr[d] * spread(q, d); return g; };
    const tryPick = (allowExcluded) => {
      let best = null, bestGain = 0;
      pool.forEach(q => {
        if (used.has(q.id)) return;
        if (!allowExcluded && exclude.has(q.id)) return;
        const g = gainOf(q) - (exclude.has(q.id) ? 0.25 : 0);              // seen before: allowed, but penalised
        if (g > bestGain + 1e-9 || (Math.abs(g - bestGain) < 1e-9 && best && q.id < best.id)){ best = q; bestGain = g; }
      });
      return best ? { q: best, gain: bestGain } : null;
    };
    while (chosen.length < max){
      let pick = tryPick(false) || tryPick(true);
      if (!pick) break;
      if (firstGain == null) firstGain = pick.gain;
      if (chosen.length >= min && pick.gain < firstGain * 0.35) break;
      used.add(pick.q.id); chosen.push(pick);
      for (const d in pr){ if (spread(pick.q, d) >= 1) pr[d] *= 0.62; }       // diminishing returns on the dims this question covered
    }
    // order: alternate heavy/light so the run never stacks heavy questions
    const heavy = chosen.filter(c => c.q.difficulty === "heavy"), light = chosen.filter(c => c.q.difficulty !== "heavy");
    const ordered = []; while (heavy.length || light.length){ if (light.length) ordered.push(light.shift()); if (heavy.length) ordered.push(heavy.shift()); }
    return ordered;
  };

  /* ---------------- the plan ---------------- */
  /* profile: normalized (latest). ctx: {snapshots, now, focusDims, askedIds}. */
  R.plan = function(profile, ctx){
    ctx = ctx || {};
    if (!profile || !profile.ok) return { ok: false, reason: "no profile" };
    const ranked = R.priorities(profile, ctx);
    let targets;
    if (ctx.focusDims && ctx.focusDims.length) targets = ctx.focusDims.map(d => ranked.find(r => r.dim === d)).filter(Boolean);
    else targets = ranked.filter(r => r.priority >= 0.18).slice(0, R.TARGETS);
    if (targets.length < 3 && !(ctx.focusDims && ctx.focusDims.length)) targets = ranked.slice(0, 3);
    const strong = ranked.every(r => r.conf >= 0.8 && r.priority < 0.15);
    const lastQ = ctx.snapshots && ctx.snapshots.length ? (ctx.snapshots[ctx.snapshots.length - 1].questionIds || []) : [];
    const exclude = (ctx.askedIds || []).concat(lastQ);
    const sel = R.selectQuestions(targets, { exclude });
    const questionIds = sel.map(s => s.q.id);
    // projected effect (an estimate, labelled as one)
    const touches = {}; targets.forEach(t => { touches[t.dim] = 0; });
    sel.forEach(s => targets.forEach(t => { if (spread(s.q, t.dim) >= 1) touches[t.dim]++; }));
    const gains = targets.map(t => { const n = touches[t.dim]; const cNew = Math.min(1, n / 4) * 0.6 + Math.min(1, n * 1.2 / 12) * 0.4; return (1 - (1 - t.conf) * (1 - 0.7 * cNew)) - t.conf; });
    const from = profile.confidence.overall;
    const gain = Math.round(F.clamp(F.mean(gains) * 60, 0, 25));
    const areasHit = F.unique([].concat.apply([], Object.keys(F.AREAS).filter(k => F.AREAS[k].dims.some(d => targets.some(t => t.dim === d))).map(k => F.AREAS[k].label)));
    return {
      ok: true, needed: !strong, targets, questionIds, questionCount: questionIds.length,
      areas: areasHit.slice(0, 4),
      summary: strong ? "Forge already knows you well. There's nothing urgent to revisit." : `We already know a lot about you. Forge wants to revisit ${areasHit.length || targets.length} area${(areasHit.length || targets.length) === 1 ? "" : "s"}.`,
      explain: "These questions focus on the areas Forge was least certain about, plus anything that has moved recently.",
      projected: from != null ? { from, to: Math.min(98, from + gain), estimate: true } : null,
    };
  };

  /* ---------------- session ---------------- */
  R.createSession = function(profile, plan, opts){
    opts = opts || {};
    if (!plan || !plan.ok || !plan.questionIds.length) return null;
    const depth = profile.depth || "balanced";
    const nBase = NPRIOR_BASE[depth] || 4;
    const nPrior = {}, priorConf = {};
    DIMENSIONS.forEach(d => {
      const c = profile.confidence.dims[d] ? profile.confidence.dims[d].value : 0.5;
      priorConf[d] = c;
      nPrior[d] = Math.max(2, Math.round(nBase * (0.5 + c)));
    });
    const s = new QuizSession(opts.seed != null ? opts.seed : (Date.now() % 100000), profile.identity.name || "", "balanced");
    s.plan = plan.questionIds.map(id => QUESTIONS_BY_ID[id]).filter(Boolean);
    s.minAdaptive = s.maxQuestions = s.plan.length;
    s.assessmentKind = "targeted";
    s.meta = Object.assign({}, opts.meta || {}, { resultDepth: depth });
    s.targeted = { priorDims: Object.assign({}, profile.dims), priorConf, priorOverall: profile.confidence.overall, nPrior, targets: plan.targets.map(t => t.dim),
      questionIds: plan.questionIds.slice(), priorCode: profile.profileCode, priorTs: profile.timestamp, createdAt: Date.now() };
    return s;
  };

  const touches = (session, d) => session.answers.filter(a => a && a.d && (d in a.d)).length;
  R.blendDims = function(session){
    const tg = session.targeted; const out = {};
    DIMENSIONS.forEach(d => {
      const prior = F.num(tg.priorDims[d], 0), nNew = touches(session, d);
      if (!nNew){ out[d] = F.clampRaw(prior); return; }
      const sumNew = F.num(session.dims[d], 0), nP = tg.nPrior[d] || 4;
      out[d] = F.clampRaw(nP / (nP + nNew) * (prior + sumNew));
    });
    return out;
  };
  R.blendConfidence = function(session){
    const tg = session.targeted; const out = {};
    DIMENSIONS.forEach(d => {
      const cP = F.num(tg.priorConf[d], 0.5), nNew = touches(session, d);
      if (!nNew){ out[d] = F.round1(cP * 100) / 100; return; }
      const cN = getDimensionConfidence(session, d);
      const nP = tg.nPrior[d] || 4;
      const meanNew = F.num(session.dims[d], 0) / nNew, meanPrior = F.num(tg.priorDims[d], 0) / nP;
      const agree = Math.abs(meanNew - meanPrior) <= 1.2 ? 1.05 : 0.92;
      out[d] = F.round1(F.clamp01((1 - (1 - cP) * (1 - 0.7 * cN)) * agree) * 100) / 100;
    });
    return out;
  };
  R.finalizeConfidence = function(session, conf){
    const tg = session.targeted; const now = R.blendConfidence(session);
    const gains = tg.targets.map(d => now[d] - F.num(tg.priorConf[d], 0.5));
    const from = tg.priorOverall != null ? tg.priorOverall : conf.confidencePct;
    const gain = Math.round(F.clamp(F.mean(gains) * 60, -10, 25));
    const to = F.clampPct(from + gain);
    return Object.assign({}, conf, { confidencePct: to, overall: to, targeted: { from, to, gain }, note: "Targeted retake: confidence reflects how much firmer the revisited areas are." });
  };

  /* Before/after report shown after a targeted retake. prior/after are normalized profiles. */
  R.outcome = function(prior, after){
    if (!prior || !after || !prior.ok || !after.ok) return { ok: false };
    const areas = Object.keys(F.AREAS).map(k => {
      const a = F.AREAS[k];
      const c = p => F.mean(a.dims.map(d => p.confidence.dims[d] ? p.confidence.dims[d].value : 0.5));
      return { area: k, label: a.label, from: Math.round(c(prior) * 100), to: Math.round(c(after) * 100) };
    }).map(x => Object.assign(x, { gain: x.to - x.from })).sort((a, b) => b.gain - a.gain);
    const wc = F.timeline ? F.timeline.whatChanged(prior, after, []) : null;
    return { ok: true, confidence: { from: prior.confidence.overall, to: after.confidence.overall }, areas, improved: areas.filter(a => a.gain >= 3).slice(0, 4), whatChanged: wc,
      explanation: "These questions focused on the areas Forge was least certain about." };
  };
})(Forge);
if (typeof module !== "undefined" && module.exports) module.exports = Forge;
