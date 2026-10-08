/* =========================================================================
   FORGE ACHIEVEMENTS
   Each achievement is a pure function of real, stored data (assessments,
   check-ins, experiments, comparisons, predictions, events, usage marks).
   Nothing rewards a click: every condition describes something that
   actually happened. evaluate() is deterministic; sync() records the first
   time each one was earned and reports which are new.
   ========================================================================= */
(function(F){
  "use strict";
  const A = F.achievements = {};
  const DAY = 86400000;
  const prog = (value, target) => ({ value: Math.min(value, target), target });
  const distinct = arr => new Set(arr).size;

  /* ctx: {snapshots, checkins, experiments, comparisons, predictions, events, marks, counters, profile, contradictions, worlds} */
  A.DEFS = [
    { id: "first-read", title: "First Read", desc: "Complete your first assessment.", hint: "Take the assessment once.",
      test: c => ({ ok: c.snapshots.length >= 1, p: prog(c.snapshots.length, 1), ev: "1 assessment" }) },
    { id: "first-comparison", title: "First Comparison", desc: "Compare yourself with someone.", hint: "Open Compare and paste a friend's code.",
      test: c => ({ ok: c.comparisons.length >= 1, p: prog(c.comparisons.length, 1), ev: `${c.comparisons.length} comparison(s)` }) },
    { id: "three-lenses", title: "Three Lenses", desc: "Read a comparison in all three modes: First Contact, Bond and Friendship.", hint: "Try the same pair in each mode.",
      test: c => { const m = distinct(c.comparisons.filter(x => x.mode !== "party").map(x => x.mode)); return { ok: m >= 3, p: prog(m, 3), ev: `${m} of 3 modes` }; } },
    { id: "group-think", title: "Group Think", desc: "Run a Party Compare with four or more people.", hint: "Add four people in Party Compare.",
      test: c => { const best = Math.max(0, ...c.comparisons.filter(x => x.mode === "party").map(x => x.names.length)); return { ok: best >= 4, p: prog(best, 4), ev: `largest group: ${best}` }; } },
    { id: "longitudinal", title: "Longitudinal", desc: "Hold three assessments spread over at least two months.", hint: "Retake a couple of times, a few weeks apart.",
      test: c => { const s = c.snapshots, span = s.length >= 2 ? (s[s.length - 1].timestamp - s[0].timestamp) / DAY : 0; const ok = s.length >= 3 && span >= 60; return { ok, p: prog(Math.min(s.length, 3) + Math.min(span, 60) / 60, 4), ev: `${s.length} assessments over ${Math.round(span)} days` }; } },
    { id: "profile-archaeologist", title: "Profile Archaeologist", desc: "Build a history of five assessments.", hint: "Keep retaking over time.",
      test: c => ({ ok: c.snapshots.length >= 5, p: prog(c.snapshots.length, 5), ev: `${c.snapshots.length} assessments` }) },
    { id: "pattern-finder", title: "Pattern Finder", desc: "Have Forge detect a multi-trait pattern in how you changed between two assessments.", hint: "Needs two assessments where several traits moved together.",
      test: c => { let n = 0; for (let i = 1; i < c.snapshots.length; i++){ const wc = F.timeline.whatChanged(c.snapshots[i - 1], c.snapshots[i], c.snapshots.slice(0, i - 1)); if (wc.ok && wc.patterns.length) n++; } return { ok: n >= 1, p: prog(n, 1), ev: `${n} pattern(s) found` }; } },
    { id: "self-contradiction", title: "Self-Contradiction", desc: "Your profile holds three or more opposing traits at once. That's called being a person.", hint: "Some profiles are more contradictory than others.",
      test: c => ({ ok: c.contradictions >= 3, p: prog(c.contradictions, 3), ev: `${c.contradictions} tensions` }) },
    { id: "check-in-habit", title: "Check-in Habit", desc: "Complete check-ins in four different weeks.", hint: "Do a quick check-in once a week.",
      test: c => { const weeks = distinct(c.checkins.map(x => Math.floor(x.ts / (7 * DAY)))); return { ok: weeks >= 4, p: prog(weeks, 4), ev: `${weeks} week(s)` }; } },
    { id: "experimenter", title: "Experimenter", desc: "Finish a growth experiment and record whether it helped.", hint: "Start an experiment and answer 'Did it help?' afterwards.",
      test: c => { const n = c.experiments.filter(e => e.outcome).length; return { ok: n >= 1, p: prog(n, 1), ev: `${n} finished` }; } },
    { id: "closer-look", title: "A Closer Look", desc: "Complete a targeted retake and raise Forge's confidence by at least 8 points.", hint: "Answer the targeted questions Forge suggests.",
      test: c => { let best = 0; for (let i = 1; i < c.snapshots.length; i++){ const a = c.snapshots[i - 1].confidence.overall, b = c.snapshots[i].confidence.overall; if (c.snapshots[i].kind === "targeted" && a != null && b != null) best = Math.max(best, b - a); } return { ok: best >= 8, p: prog(Math.max(0, best), 8), ev: `best gain: +${Math.max(0, best)}` }; } },
    { id: "predictor", title: "Predictor", desc: "Predict a comparison and see how it turned out.", hint: "Use 'Predict before you compare'.",
      test: c => { const n = c.predictions.filter(x => x.observed).length; return { ok: n >= 1, p: prog(n, 1), ev: `${n} resolved` }; } },
    { id: "well-calibrated", title: "Well Calibrated", desc: "Be right about three comparisons you predicted.", hint: "Predict a few and check.",
      test: c => { const n = c.predictions.filter(x => x.observed && x.observed.matched).length; return { ok: n >= 3, p: prog(n, 3), ev: `${n} matched` }; } },
    { id: "event-keeper", title: "Event Keeper", desc: "Log three life events and have an assessment taken after at least one.", hint: "Add events in the Journal timeline, then retake.",
      test: c => { const after = c.events.filter(e => c.snapshots.some(s => s.timestamp > e.ts)).length; return { ok: c.events.length >= 3 && after >= 1, p: prog(Math.min(c.events.length, 3) + Math.min(after, 1), 4), ev: `${c.events.length} events` }; } },
    { id: "world-walker", title: "World Walker", desc: "Explore matches from four different kinds of story: games, films, books, myths and more.", hint: "Open Worlds and try different media.",
      test: c => { const n = distinct((c.worlds || []).map(w => w.medium)); return { ok: n >= 4, p: prog(n, 4), ev: `${n} media types` }; } },
    { id: "own-your-data", title: "Own Your Data", desc: "Export a .forge backup of your profile.", hint: "Profile → Export.",
      test: c => ({ ok: !!(c.marks && c.marks.exported), p: prog(c.marks && c.marks.exported ? 1 : 0, 1), ev: c.marks && c.marks.exported ? "exported" : "not yet" }) },
    { id: "shared-it", title: "Shared It", desc: "Share your profile card or manual.", hint: "Use Share on your result or manual.",
      test: c => ({ ok: !!(c.marks && c.marks.shared), p: prog(c.marks && c.marks.shared ? 1 : 0, 1), ev: c.marks && c.marks.shared ? "shared" : "not yet" }) },
  ];

  A.evaluate = function(ctx){
    ctx = Object.assign({ snapshots: [], checkins: [], experiments: [], comparisons: [], predictions: [], events: [], marks: {}, counters: {}, contradictions: 0, worlds: [] }, ctx || {});
    return A.DEFS.map(d => {
      let r; try{ r = d.test(ctx); } catch(e){ r = { ok: false, p: prog(0, 1), ev: "" }; }
      return { id: d.id, title: d.title, desc: d.desc, hint: d.hint, unlocked: !!r.ok, progress: r.p, evidence: r.ev };
    });
  };

  /* Gathers context from real stores (browser path). */
  A.context = function(extra){
    const snaps = (F.timeline && F.timeline.snapshots) ? F.timeline.snapshots() : [];
    const last = snaps[snaps.length - 1];
    let contradictions = 0;
    try{ if (last && typeof computeContradictions === "function") contradictions = computeContradictions(last.dims).length; } catch(e){ contradictions = 0; }
    const ach = F.store.getAchievements();
    return Object.assign({ snapshots: snaps, checkins: F.store.list("checkins"), experiments: F.store.list("experiments"), comparisons: F.store.list("comparisons"),
      predictions: F.store.list("predictions"), events: F.store.list("events"), marks: ach.marks, counters: ach.counters, contradictions }, extra || {});
  };

  /* Records first-earned timestamps; returns the achievements earned just now. */
  A.sync = function(ctx, now){
    const list = A.evaluate(ctx || A.context());
    const store = F.store.getAchievements();
    const fresh = [];
    list.forEach(a => { if (a.unlocked && !store.unlocked[a.id]){ store.unlocked[a.id] = { ts: now || Date.now(), evidence: String(a.evidence || "").slice(0, 200) }; fresh.push(a); } });
    if (fresh.length) F.store.setAchievements(store);
    return { all: list.map(a => Object.assign({}, a, { earnedTs: store.unlocked[a.id] ? store.unlocked[a.id].ts : null })), fresh };
  };
})(Forge);
if (typeof module !== "undefined" && module.exports) module.exports = Forge;
