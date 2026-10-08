/* =========================================================================
   FORGE STATE - the "how you're doing" layer, deliberately separate from
   personality ("who you are").

   PERSONALITY  stable dimensions from the assessment. A single check-in
                NEVER edits them.
   STATE        six 0..100 readings from a ~60-second check-in:
                energy (derived), stress, social appetite, motivation,
                sense of control, decision speed.
   Every reading is also judged AGAINST A BASELINE derived from the person's
   own personality, so "social appetite 30" means different things for an
   outgoing profile and a reserved one. Features read state through
   Forge.state.context(), which only returns a recent, sufficiently
   confident state.
   ========================================================================= */
(function(F){
  "use strict";
  const St = F.state = {};
  St.KEYS = ["energy", "stress", "social", "motivation", "control", "decisions"];
  St.ASKED = ["decisions", "social", "motivation", "stress", "control"];
  St.LABEL = { energy: "Energy", stress: "Stress", social: "Social appetite", motivation: "Motivation", control: "Sense of control", decisions: "Decision speed" };
  St.STALE_DAYS = 14;

  /* Three phrasings per area (rotated across check-ins so it never reads as a
     repeated form). Options are ordered low -> high on the STATE scale, so
     answer 1..5 maps directly to 0..100 via (n-1)*25. */
  St.QUESTIONS = {
    decisions: [
      { text: "How have you been making decisions lately?", options: ["Overthinking everything", "Slower and more careful than usual", "About my normal pace", "Faster than I usually would", "Mostly on instinct"] },
      { text: "When a choice came up this week, how did you handle it?", options: ["Kept putting it off", "Weighed it for a long time", "Took a normal amount of time", "Decided quickly", "Went with my gut right away"] },
      { text: "Lately, how quickly do you settle on things?", options: ["Very slowly", "A bit slowly", "Normally", "Quicker than usual", "Almost immediately"] },
    ],
    social: [
      { text: "How socially energized have you felt lately?", options: ["I've wanted to be left alone", "Less social than usual", "About normal", "More social than usual", "I've wanted people around constantly"] },
      { text: "When someone invited you to something recently, how did it feel?", options: ["Draining just to think about", "Easier to decline than accept", "Fine either way", "Appealing", "I was the one organizing it"] },
      { text: "How much have you wanted time with other people this week?", options: ["Almost none", "Less than usual", "The usual amount", "More than usual", "A lot"] },
    ],
    motivation: [
      { text: "How motivated have you been lately?", options: ["Barely able to start things", "Lower than usual", "About normal", "Higher than usual", "Fired up"] },
      { text: "How easy has it been to get going on things that matter?", options: ["Really hard", "Harder than usual", "About as usual", "Easier than usual", "Almost effortless"] },
      { text: "When you picture the next few weeks, how much do you want to get done?", options: ["Not much, honestly", "Less than I normally would", "The usual", "More than usual", "Everything"] },
    ],
    stress: [
      { text: "How stressed have you felt lately?", options: ["Not at all", "A little", "Moderately", "Quite stressed", "Overwhelmed"] },
      { text: "How much pressure have you been carrying this week?", options: ["Hardly any", "Some", "A fair amount", "A lot", "More than I can comfortably hold"] },
      { text: "How often have small things felt like a lot lately?", options: ["Never", "Rarely", "Sometimes", "Often", "Nearly always"] },
    ],
    control: [
      { text: "How much control have you felt over your time?", options: ["Almost none", "Not much", "Some", "Quite a lot", "Full control"] },
      { text: "How much have your days felt like your own choice lately?", options: ["Not at all", "Not very", "Partly", "Mostly", "Completely"] },
      { text: "How on top of things have you felt this week?", options: ["Buried", "Behind", "Roughly keeping up", "Comfortably ahead", "Right on top of it"] },
    ],
  };

  /* A check-in = one phrasing per area. variant defaults to a deterministic
     rotation (so tests are reproducible) but callers may pass any integer. */
  St.buildCheckIn = function(variant){
    const v = (variant == null ? 0 : Math.abs(Math.round(variant))) | 0;
    const questions = St.ASKED.map((key, i) => {
      const set = St.QUESTIONS[key];
      const q = set[(v + i) % set.length];
      return { key, text: q.text, options: q.options.slice() };
    });
    return { variant: v % 10, questions };
  };
  St.nextVariant = function(history){ return (history && history.length ? history[history.length - 1].variant + 1 : 0) % 10; };

  /* answers: {decisions:1..5, ...}. Missing/invalid answers are ignored; a
     check-in needs at least 3 valid answers to count. Energy is DERIVED, not
     asked, and is labelled as such everywhere it is shown. */
  St.score = function(answers){
    const s = {}; let n = 0;
    St.ASKED.forEach(k => {
      const v = Math.round(F.num(answers && answers[k], NaN));
      if (v >= 1 && v <= 5){ s[k] = (v - 1) * 25; n++; }
    });
    if (n < 3) return null;
    const m = s.motivation != null ? s.motivation : 50, t = s.stress != null ? s.stress : 50, c = s.control != null ? s.control : 50;
    s.energy = Math.round(F.clamp(0.45 * m + 0.35 * (100 - t) + 0.2 * c, 0, 100));
    return s;
  };

  /* ---------------- baseline from personality ---------------- */
  St.baseline = function(profile){
    const f = profile && profile.facets ? profile.facets : F.computeFacets(profile && profile.dims || {});
    const b = x => Math.round(F.clamp(x, 15, 85));
    return {
      social: b(50 + 4.5 * f.social),
      motivation: b(55 + 2.2 * f.initiative + 1.6 * f.persist),
      stress: b(50 - 3 * f.steadiness - 1.5 * f.patience),
      control: b(50 + 2 * f.structure + 1.4 * f.autonomy + 1.4 * f.steadiness),
      decisions: b(50 + 2.6 * f.boldness + 1.6 * f.initiative - 2.6 * f.analysis),
      energy: b(55 + 1.8 * f.optimism + 1.2 * f.initiative + 0.8 * f.steadiness),
    };
  };
  const DEV_BAND = { small: 10, notable: 18, large: 28 };
  St.deviations = function(state, profile){
    const base = St.baseline(profile), out = {};
    St.KEYS.forEach(k => {
      if (state[k] == null) return;
      const d = Math.round(state[k] - base[k]);
      const mag = Math.abs(d);
      out[k] = { value: state[k], baseline: base[k], delta: d, level: mag >= DEV_BAND.large ? (d > 0 ? "much higher" : "much lower") : mag >= DEV_BAND.notable ? (d > 0 ? "higher" : "lower") : mag >= DEV_BAND.small ? (d > 0 ? "a little higher" : "a little lower") : "about usual" };
    });
    return out;
  };

  /* Plain-language reading of a state for THIS person. Stress is the one
     reading where "higher" is the unwelcome direction, so phrasing differs. */
  const PHRASE = {
    energy:     { up: "Your energy is higher than usual for you.", down: "Your energy is lower than usual for you." },
    stress:     { up: "Stress is running higher than usual for you.", down: "Stress is running lower than usual for you." },
    social:     { up: "You're more social than your usual.", down: "Your social appetite is lower than your usual." },
    motivation: { up: "Motivation is higher than your usual.", down: "Motivation is lower than your usual." },
    control:    { up: "You're feeling more in control of your time than usual.", down: "You're feeling less in control of your time than usual." },
    decisions:  { up: "You're deciding faster than usual.", down: "You're deciding more slowly than usual." },
  };
  St.interpret = function(state, profile){
    const dev = St.deviations(state, profile);
    const moved = St.KEYS.filter(k => dev[k] && Math.abs(dev[k].delta) >= DEV_BAND.notable).sort((a, b) => Math.abs(dev[b].delta) - Math.abs(dev[a].delta));
    const lines = moved.map(k => PHRASE[k][dev[k].delta > 0 ? "up" : "down"]);
    const headline = moved.length
      ? "Your personality hasn't necessarily changed. Your current state has."
      : "Right now you're close to your usual baseline.";
    // Gentle, hedged context for common combinations. Never a diagnosis.
    const m = {}; moved.forEach(k => m[k] = dev[k].delta > 0 ? 1 : -1);
    const notes = [];
    if (m.stress === 1 && m.social === -1) notes.push("Higher stress together with a lower social appetite often follows a demanding stretch. It commonly eases once the load does.");
    if (m.energy === -1 && m.motivation === -1) notes.push("Low energy and low motivation together are worth treating as a signal to rest rather than a verdict on you.");
    if (m.control === -1 && m.stress === 1) notes.push("Feeling less in control while stressed is common when a lot is happening at once. Small, concrete wins tend to help.");
    if (m.decisions === 1 && m.stress === 1) notes.push("Deciding faster than usual while stressed can mean pushing through. It's worth double-checking the bigger decisions.");
    if (m.energy === 1 && m.motivation === 1) notes.push("Higher energy and motivation: a good window for the thing you've been putting off.");
    return { headline, lines, notes, deviations: dev, movedKeys: moved, nearBaseline: moved.length === 0 };
  };

  /* Confidence in the CURRENT state reading, 0..100: more check-ins recently
     means a steadier picture; a single check-in is a snapshot, not a trend. */
  St.stateConfidence = function(history, now){
    now = now || Date.now();
    const recent = (history || []).filter(h => now - h.ts <= 30 * 86400000);
    if (!recent.length) return 0;
    const n = recent.length;
    const base = 30 + 12 * Math.min(4, n - 1) + (n >= 2 ? 6 : 0);
    const age = (now - recent[recent.length - 1].ts) / 86400000;
    return Math.round(F.clamp(base - Math.max(0, age - 3) * 2, 10, 85));
  };

  /* ---------------- change since previous ---------------- */
  St.changeSince = function(prev, cur){
    if (!prev || !cur) return [];
    return St.KEYS.filter(k => prev[k] != null && cur[k] != null).map(k => ({ key: k, label: St.LABEL[k], from: prev[k], to: cur[k], delta: cur[k] - prev[k] }))
      .filter(c => Math.abs(c.delta) >= 15).sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  };

  /* ---------------- persistence + journal link ---------------- */
  St.history = function(){ return F.store.list("checkins"); };
  St.latest = function(maxAgeDays){
    const h = St.history(); if (!h.length) return null;
    const last = h[h.length - 1];
    const age = (Date.now() - last.ts) / 86400000;
    return age <= (maxAgeDays == null ? St.STALE_DAYS : maxAgeDays) ? last : null;
  };
  /* Saves a check-in. opts: {note, linkJournal:boolean, now}. If a note is
     given and linkJournal is true, a journal entry is also written (using the
     engine's own addJournalEntry) and linked by id. Never touches the
     personality profile or timeline. */
  St.saveCheckIn = function(answers, opts){
    opts = opts || {};
    const state = St.score(answers);
    if (!state) return { ok: false, reason: "answer at least three questions" };
    const history = St.history();
    const now = opts.now || Date.now();
    let journalId = null;
    if (opts.linkJournal && opts.note && typeof addJournalEntry === "function"){
      try{
        const mood = Math.max(1, Math.min(5, Math.round(1 + 4 * (0.5 * state.energy + 0.5 * (100 - state.stress)) / 100)));
        const e = addJournalEntry({ mood, text: String(opts.note).slice(0, 600), prompt: "Quick check-in" });
        journalId = e && e.id || null;
      } catch(e){ /* journal unavailable: check-in still saves */ }
    }
    const rec = F.store.add("checkins", { ts: now, answers, state, variant: opts.variant != null ? opts.variant : St.nextVariant(history), note: opts.note || "", journalId });
    if (!rec) return { ok: false, reason: "could not save" };
    const prev = history.length ? history[history.length - 1] : null;
    return { ok: true, record: rec, previous: prev };
  };

  /* What other features may read. Returns null when no usable state exists
     (none yet, stale, or too weakly supported), so callers fall back to
     personality-only behaviour rather than guessing. */
  St.context = function(profile, now){
    now = now || Date.now();
    const h = St.history();
    if (!h.length) return null;
    const last = h[h.length - 1];
    if ((now - last.ts) / 86400000 > St.STALE_DAYS) return null;
    const dev = St.deviations(last.state, profile);
    const conf = St.stateConfidence(h, now);
    const u = k => last.state[k] != null ? last.state[k] / 100 : 0.5;
    return { ts: last.ts, state: last.state, deviations: dev, confidence: conf,
      stressLoad: u("stress"), socialBattery: u("social"), motivationLevel: u("motivation"), controlLevel: u("control"), energyLevel: u("energy"),
      strained: u("stress") >= 0.7 || (u("energy") <= 0.3 && u("motivation") <= 0.3), lowConfidenceState: conf < 40 };
  };

  /* Time series for the state chart. */
  St.series = function(key){ return St.history().filter(h => h.state[key] != null).map(h => ({ ts: h.ts, value: h.state[key] })); };
})(Forge);
if (typeof module !== "undefined" && module.exports) module.exports = Forge;
