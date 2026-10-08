/* =========================================================================
   ASK FORGE - a profile-grounded question answerer. No LLM, no network.

   question -> intent (keyword scoring) -> reasoner -> structured answer
   Every answer is: lead, the factors Forge sees (each with the evidence it
   used), what tends to help and WHY, a confidence reading, and a plain
   disclaimer when the supporting data is weak. If nothing in the profile
   supports a claim, the claim is not made.
   ========================================================================= */
(function(F){
  "use strict";
  const A = F.ask = {};
  const { H, L, AND, OR, GAP, M: MID } = F.insights;

  const fac = F.facetLabel;
  const topFacet = p => F.FACET_KEYS.slice().sort((a, b) => p.facets[b] - p.facets[a])[0];
  const lowFacet = p => F.FACET_KEYS.slice().sort((a, b) => p.facets[a] - p.facets[b])[0];
  const evLine = e => `${e.label.toLowerCase()}: ${e.band} (${F.round1(e.value)})`;

  /* A candidate explanation. when() -> 0..1; help is what tends to help; why
     is generated from the evidence so it always cites the person's own numbers. */
  const cand = (id, title, facets, when, detail, help) => ({ id, title, facets, when, detail, help });

  function reason(p, ctx, cfg){
    const scored = cfg.candidates.map(c => ({ c, s: c.when(p, ctx) })).filter(x => x.s >= (cfg.min || 0.3)).sort((a, b) => b.s - a.s);
    const top = scored.slice(0, cfg.max || 3);
    const resolve = (v) => typeof v === "function" ? v(p) : v;
    const factors = top.map(x => {
      const ev = F.insights.evidenceFor(p, resolve(x.c.facets));
      return { id: x.c.id, title: resolve(x.c.title), detail: typeof x.c.detail === "function" ? x.c.detail(p) : x.c.detail, strength: F.round1(x.s * 100) / 100, evidence: ev };
    });
    const helps = top.map((x, i) => ({ text: typeof x.c.help === "function" ? x.c.help(p) : x.c.help, why: `Because ${F.listJoin(factors[i].evidence.slice(0, 2).map(evLine))}.`, forFactor: x.c.id }));
    return { factors, helps };
  }

  /* ---------------- intents ---------------- */
  const INTENTS = [];
  const intent = (id, title, keys, examples, build) => INTENTS.push({ id, title, keys, examples, build });

  /* 1. procrastination */
  intent("procrastination", "Why you might put things off", ["procrastinat", "put off", "putting off", "avoid start", "can't start", "cant start", "delay", "lazy", "stuck starting", "get started", "putting things off", "put things off", "keep putting", "keep avoiding", "can't just start", "leave it to the last"],
    ["Why do I procrastinate?"], (p, ctx) => {
    const st = ctx && ctx.state;
    const cands = [
      cand("no-first-step", "There's no obvious first step", ["structure", "analysis", "initiative"], OR(L("structure"), GAP("analysis", "initiative", 2.5)),
        "You tend to do best when a task has edges. When it's open-ended, starting feels like choosing among a dozen ways in.",
        "Give yourself a concrete first action rather than a vague deadline. \"Open the document and write the heading\" counts."),
      cand("distant-payoff", "The payoff feels far away", ["explore", "persist", "patience"], AND(H("explore"), OR(L("persist"), L("patience"))),
        "Your attention is pulled by what's interesting now, so rewards weeks away feel faint.",
        "Create a nearer reward: a mini-deadline today, or pair the task with something you enjoy."),
      cand("imposed", "It feels imposed", ["autonomy"], H("autonomy", 2, 7),
        "Tasks that arrive with someone else's rules attached tend to sap your drive faster than the work itself would.",
        "Take back one choice, even if the task is fixed: when you do it, in what order, or how."),
      cand("low-curiosity", "It isn't interesting enough to start", ["explore", "invent"], L("explore", 1.5, 6),
        "Starting costs more when nothing about the task catches your curiosity.",
        "Find the interesting sub-question inside it and begin there."),
      cand("overload", "There are too many ways to do it", ["analysis", "steadiness"], AND(H("analysis"), L("steadiness", 0.5, 5)),
        "You tend to see the options clearly, which can turn into weighing them instead of beginning.",
        "Cap it at two options and decide with a timer. A reversible choice made now beats a perfect one later."),
      cand("perfectionism", "The bar feels high", ["structure", "analysis", "flex"], AND(H("structure"), H("analysis"), L("flex", 0, 5)),
        "High standards can make a rough first attempt feel not worth starting.",
        "Make the first version deliberately rough and give it ten minutes. Editing is easier than beginning."),
      cand("alone", "It's solitary and unrewarded", ["social", "warmth"], AND(H("social"), H("warmth", 0, 5)),
        "You get energy from other people, so long solo stretches can lose momentum.",
        "Work next to someone, or tell a friend what you'll have done by tonight."),
      cand("low-boldness", "You're worried about doing it badly", ["boldness", "optimism"], AND(L("boldness"), L("optimism", 0, 5)),
        "A preference for the safe option can make the unknown first attempt feel riskier than it is.",
        "Pick the smallest version that can't really go wrong and start there."),
    ];
    if (st && st.stressLoad >= 0.7) cands.push(cand("state-stress", "You're under more stress than usual right now", ["steadiness", "patience"], () => 0.75,
      "Your latest check-in shows stress above your usual, and avoidance tends to rise when load does.",
      "Shrink the task to ten minutes and protect some recovery time, rather than pushing harder."));
    const r = reason(p, ctx, { candidates: cands, max: 3 });
    return { lead: r.factors.length ? "Forge sees a few likely contributors, based on how your answers cluster:" : "Nothing in your profile points strongly to one reason you'd put things off, so Forge would rather not guess.", ...r, followUps: ["How do I stay motivated?", "How do I make decisions?"] };
  });

  /* 2. decisions */
  intent("decisions", "How you make decisions", ["decid", "decision", "choice", "choose", "indecis", "pick between", "make up my mind"],
    ["How do I make decisions?"], (p, ctx) => {
    const cands = [
      cand("deliberate", "You deliberate before you commit", ["analysis", "boldness"], AND(H("analysis"), L("boldness", 0, 5)), "You weigh options and lean toward the safer path. You decide better with the information on the table.", "Set a decision deadline so thoroughness doesn't become delay."),
      cand("analyse-commit", "You analyse, then commit hard", ["analysis", "boldness"], AND(H("analysis"), H("boldness")), "Careful thinking followed by decisive action: you're rarely wobbly once you've chosen.", "Check whether you've collected enough information; you're fast enough to afford a short pause."),
      cand("fast", "You decide fast and adjust", ["initiative", "analysis"], AND(H("initiative"), L("analysis", 0, 5)), "You'd rather move and correct than wait for perfect information.", "Name the decisions that are hard to undo and slow down for those."),
      cand("people", "You weigh how it lands on people", ["warmth"], H("warmth", 2, 7), "Impact on others is a real input for you, sometimes the main one.", "Say out loud which option you'd pick if nobody's feelings were involved, then compare."),
      cand("own", "You want to own the call", ["autonomy"], H("autonomy", 2, 7), "You take input but resist deciding by committee.", "Ask for input before, not during, the decision."),
      cand("together", "You like deciding with someone you trust", ["autonomy", "trust"], AND(L("autonomy", 0, 6), H("trust", 1, 6)), "A sounding board improves your choices and speeds them up.", "Pick one person as your default sounding board."),
      cand("reversible", "Reversibility matters a lot to you", ["flex", "boldness"], AND(H("flex"), H("boldness", 0.5, 5)), "You move quickly when you know you can back out.", "Ask 'could I undo this?' early; it unlocks your speed."),
    ];
    const r = reason(p, ctx, { candidates: cands, max: 3 });
    return { lead: r.factors.length ? "From your profile, this is how decisions tend to go for you:" : "Your decision-making doesn't lean strongly in one direction, so Forge can't point to a single style.", ...r, followUps: ["Why do I procrastinate?", "What stresses me?"] };
  });

  /* 3. stress */
  intent("stress", "What stresses you", ["stress", "overwhelm", "pressure", "burn", "too much", "cope", "coping", "frazzled"],
    ["What stresses me?"], (p, ctx) => {
    const cands = [
      cand("unstructured", "Shifting plans and goalposts", ["structure", "flex"], AND(H("structure"), L("flex", 0, 5)), "You rely on knowing what's coming. Last-minute changes cost you more than they cost most people.", "Ask for the plan's non-negotiables early so you can let the rest move."),
      cand("micro", "Being managed too closely", ["autonomy"], H("autonomy", 2, 7), "Little room to choose how you work drains you quickly.", "Agree outcomes up front and ask for room on the method."),
      cand("vague", "Unclear goals", ["structure", "analysis"], OR(H("structure"), H("analysis", 2, 7)), "You like to know what success means before you start.", "Write the definition of done in one line and confirm it with whoever set the task."),
      cand("conflict", "Unresolved tension between people", ["warmth", "steadiness"], AND(H("warmth"), L("steadiness", 0, 5)), "You absorb the mood of a room, so friction can stay with you.", "Name the tension and decide one small step; unresolved is heavier than uncomfortable."),
      cand("social-load", "Too much social time", ["social"], L("social", 1.5, 6), "Long stretches around people without a break wear you down.", "Block quiet gaps between social commitments before you need them."),
      cand("isolation", "Too little contact", ["social"], H("social", 2, 7), "Long stretches alone take more out of you than you might expect.", "Schedule contact, even a call, on the days you're working alone."),
      cand("rush", "Being rushed to decide", ["analysis", "initiative"], GAP("analysis", "initiative", 2.5), "You think things through, so pressure to answer early is costly.", "Ask 'when do you actually need this?'; the real deadline is often later."),
      cand("reactive", "Pressure itself", ["steadiness", "patience"], AND(L("steadiness", 0.5, 5), L("patience", 0, 5)), "Your patience shortens quickly when load rises.", "Take a short physical break before responding to anything that spikes you."),
    ];
    const st = ctx && ctx.state;
    const r = reason(p, ctx, { candidates: cands, max: 3 });
    const lead = r.factors.length ? "Forge sees these as your most likely sources of strain:" : "No single trigger stands out in your profile.";
    const extra = st && st.stressLoad >= 0.7 ? "Your latest check-in also shows stress above your usual right now, so this may be a heavier week than your baseline." : null;
    return { lead, ...r, stateNote: extra, followUps: ["What helps me recover?", "How do I behave under pressure?"] };
  });

  /* 4. motivation */
  intent("motivation", "What motivates you", ["motivat", "drive me", "what drives", "inspire", "stay focused", "keep going", "care about", "get excited"],
    ["What motivates me?"], (p, ctx) => {
    const cands = [
      cand("novel", "Novelty and figuring things out", ["explore", "invent"], OR(H("explore"), H("invent")), "New problems pull you in more than familiar ones.", "Turn routine work into a question to answer or a thing to improve."),
      cand("impact", "Knowing it helps someone", ["warmth"], H("warmth", 2, 7), "Work with a visible human payoff keeps you going.", "Connect tasks to the person they help, even if it's imaginary at first."),
      cand("challenge", "A real challenge", ["compete", "initiative"], OR(H("compete"), H("initiative", 3, 8)), "A bit of difficulty and something to beat sharpens you.", "Set a stretch target with a number attached."),
      cand("ownership", "Ownership", ["autonomy"], H("autonomy", 2, 7), "Responsibility you can shape is a stronger motivator for you than reward.", "Ask for the outcome, not the instructions."),
      cand("progress", "Visible progress", ["structure", "persist"], AND(H("structure"), H("persist", 0.5, 5)), "Crossing things off and finishing properly keeps you steady.", "Break projects into steps you can see ticking off."),
      cand("people", "Doing it with people you enjoy", ["social", "humor"], AND(H("social"), H("humor", 0, 5)), "Good company is part of the fuel.", "Build in shared check-ins or work alongside someone."),
      cand("hope", "A believable better outcome", ["optimism"], H("optimism", 2, 7), "A believable picture of how it could go well does a lot for you.", "Write what 'good' looks like before you start."),
    ];
    const r = reason(p, ctx, { candidates: cands, max: 3 });
    return { lead: r.factors.length ? "These tend to move you most:" : "No single motivator dominates your profile.", ...r, followUps: ["Why do I procrastinate?", "What drains me?"] };
  });

  /* 5. groups */
  intent("groups", "How you behave in groups", ["group", "team", "friends", "party", "social", "crowd", "meeting", "people around"],
    ["How do I behave in groups?"], (p, ctx) => {
    const cands = [
      cand("starter", "You tend to get things started", ["initiative", "social"], AND(H("initiative"), H("social", 0.5, 5)), "You bring energy and momentum when a group is deciding what to do.", "Leave space after you propose; quieter people often need a beat to join."),
      cand("organiser", "You end up with the plan", ["structure"], H("structure", 2, 7), "Groups tend to hand you the list, the calendar or the logistics.", "Say so if you'd rather someone else held it this time."),
      cand("smoother", "You notice tension early and smooth it", ["warmth", "steadiness"], AND(H("warmth"), H("steadiness", 0, 5)), "You often act as the group's stabilizer.", "Check you're not absorbing everyone else's disagreements."),
      cand("observer", "You watch first and speak with purpose", ["analysis", "social"], AND(H("analysis"), L("social", 0, 5)), "You offer fewer comments, but usually relevant ones.", "Share your take earlier; groups usually benefit."),
      cand("wild", "You push the group toward trying it", ["boldness", "humor"], AND(H("boldness"), H("humor", 0, 5)), "You're likely to be the one who says 'let's just do it'.", "Say what makes it safe enough; it brings the cautious ones along."),
      cand("challenger", "You'll challenge the plan if it has a hole", ["analysis", "autonomy"], AND(H("analysis"), H("autonomy", 0, 5)), "You question the plan; it's rarely personal.", "Offer a better option alongside the objection."),
      cand("supporter", "You make sure everyone's okay", ["warmth", "initiative"], AND(H("warmth"), L("initiative", 0, 5)), "You often put your own preferences second.", "State one preference out loud each time."),
    ];
    const r = reason(p, ctx, { candidates: cands, max: 3 });
    return { lead: r.factors.length ? "In a group, Forge sees you tending to:" : "Your group behavior doesn't lean strongly either way; it likely depends on the group.", ...r, followUps: ["How do I handle conflict?", "What drains me?"] };
  });

  /* 6. environment */
  intent("environment", "What environment suits you", ["environment", "workplace", "office", "remote", "where should i work", "surroundings", "setting", "space"],
    ["What kind of environment suits me?"], (p, ctx) => {
    const cands = [
      cand("quiet", "Quiet, with room to focus", ["social", "autonomy"], AND(L("social", 0.5, 5), H("autonomy", 0.5, 5)), "You do your best work with few interruptions.", "Protect two uninterrupted blocks a day."),
      cand("busy", "Busy and sociable", ["social"], H("social", 3, 8), "People nearby to bounce things off make you better.", "Choose rooms where conversation is normal."),
      cand("structured", "Clear processes and predictable rhythms", ["structure"], H("structure", 2, 7), "A tidy, ordered setting keeps you at your best.", "Create a small, consistent routine around the start of the day."),
      cand("fluid", "Fluid and changing", ["structure", "flex"], AND(L("structure"), H("flex")), "You thrive with room to improvise.", "Avoid roles with rigid process and heavy sign-off."),
      cand("new", "Places where new ideas are welcome", ["explore", "invent"], OR(H("explore"), H("invent")), "You do better where trying things is normal.", "Look for teams that ship small experiments."),
      cand("kind", "Supportive, kind teams", ["warmth", "trust"], H("warmth", 2, 7), "How people treat each other matters a lot to how well you work.", "Ask how the team handles mistakes before accepting a role."),
      cand("ambitious", "Ambitious and fast-moving", ["compete", "initiative"], AND(H("compete"), H("initiative", 0.5, 5)), "Real stakes and pace keep you engaged.", "Pair it with deliberate recovery."),
    ];
    const r = reason(p, ctx, { candidates: cands, max: 3 });
    return { lead: r.factors.length ? "Your profile points toward:" : "Nothing in your profile strongly favors one kind of environment.", ...r, followUps: ["How do I collaborate?", "How much autonomy do I prefer?"] };
  });

  /* 7. learning */
  intent("learning", "How you learn", ["learn", "study", "memor", "revise", "teach me", "pick up", "understand things"],
    ["How do I learn?"], (p, ctx) => {
    const cands = [
      cand("explore", "By exploring on your own first", ["explore", "autonomy"], AND(H("explore"), H("autonomy", 0.5, 5)), "You do well with a starting point and freedom to wander.", "Start with a question, not a syllabus."),
      cand("principle", "By understanding why first", ["analysis"], H("analysis", 2, 7), "You want the principle before the procedure.", "Look for the underlying model before drilling examples."),
      cand("doing", "By doing it badly first", ["initiative", "invent"], AND(H("initiative"), H("invent", 0, 5)), "Trying it teaches you faster than reading about it.", "Build a rough version in the first hour."),
      cand("talk", "Through conversation", ["social", "warmth"], AND(H("social"), H("warmth", 0, 5)), "Explaining things to someone else makes them stick.", "Teach it to a friend after each session."),
      cand("steady", "Through steady, ordered practice", ["structure", "persist"], AND(H("structure"), H("persist", 0.5, 5)), "Work through a sequence and you retain it.", "Use a plan with weekly checkpoints."),
      cand("bursts", "In short, varied bursts", ["explore", "persist"], AND(H("explore"), L("persist", 0, 5)), "Long grinds lose you; variety keeps you in.", "Use 20-30 minute sessions on rotating topics."),
    ];
    const r = reason(p, ctx, { candidates: cands, max: 3 });
    return { lead: r.factors.length ? "You tend to learn best:" : "Your learning style doesn't lean strongly in one direction.", ...r, followUps: ["How do I make decisions?", "What motivates me?"] };
  });

  /* 8. misunderstand / blind spots */
  intent("blindspots", "What you may misunderstand about yourself", ["misunderstand", "blind spot", "blindspot", "wrong about myself", "don't see about myself", "about myself", "others see", "how do others see", "perceive me"],
    ["What am I likely to misunderstand about myself?"], (p, ctx) => {
    const cands = [
      cand("slow-vs-stuck", "You may be quicker than you feel", ["analysis", "initiative"], GAP("analysis", "initiative", 2.5), "Taking time to think can feel like indecision from the inside, but you're often further along than you look.", "Notice how often your considered answer turns out to be the right one."),
      cand("space-vs-distance", "Needing space isn't distance", ["autonomy", "social"], AND(H("autonomy"), L("social", 0, 5)), "You may assume people understand your need for quiet; many read it as disinterest.", "Say 'I need a bit of space and I'll be back' out loud."),
      cand("direct-vs-cold", "Directness can read as coldness", ["analysis", "warmth"], AND(H("analysis"), L("warmth", 0, 5)), "What feels efficient to you may land harder than you intend.", "Add one sentence of acknowledgement before the point."),
      cand("agreeable-hides", "Agreeableness can hide your opinions", ["warmth", "boldness"], AND(H("warmth"), L("boldness", 0, 5)), "You may underestimate how much your real view is wanted.", "Offer your actual preference first once a day."),
      cand("fast-reads-impatient", "Speed can look like impatience", ["initiative", "patience"], AND(H("initiative"), L("patience", 0, 5)), "Your enthusiasm may come across as pushing.", "Pause after you propose something and ask what others think."),
      cand("calm-hides-strain", "Calm can hide strain", ["steadiness", "social"], AND(H("steadiness"), L("social", 0, 5)), "People may assume you're fine because you look it.", "Tell one person when you're not."),
      cand("adaptable-hides-wants", "Flexibility can hide what you want", ["flex", "autonomy"], AND(H("flex"), L("autonomy", 0, 5)), "You adapt easily, so groups may not learn your preferences.", "Pick a plan you'd choose, not just accept."),
      cand("humor-covers", "Humor may be doing some covering", ["humor", "steadiness"], AND(H("humor"), L("steadiness", 0, 5)), "Jokes can be how you carry stress without showing it.", "Check in with yourself when the jokes get frequent."),
      // Universal-but-personal: whatever comes most naturally is the thing people underrate in themselves.
      cand("natural-strength", p => `${fac(topFacet(p))} may be worth more than you think`, p => [topFacet(p)], p => F.clamp01(p.facets[topFacet(p)] / 8), p => `${fac(topFacet(p))} comes so naturally to you that you may not notice it's a strength. Other people usually do.`, "Ask two people what they rely on you for; compare it with what you'd have guessed."),
      cand("outside-in", "Your quieter side may be louder than you think", p => [lowFacet(p)], p => F.clamp01(-p.facets[lowFacet(p)] / 8), p => `You're comparatively low on ${fac(lowFacet(p)).toLowerCase()}, which is easy to over-read as a flaw. It's a preference, and often just the other side of a strength.`, "Name one situation where that lower setting actually helps you."),
    ];
    const contradictions = (typeof computeContradictions === "function") ? computeContradictions(p.dims).slice(0, 2) : [];
    const r = reason(p, ctx, { candidates: cands, max: 3 });
    const tension = contradictions.map(c => c.label);
    return { lead: r.factors.length ? "Based on your profile, these are the gaps Forge would watch for between how you see yourself and how you may come across:" : "Nothing in your profile suggests a big gap between your inside and outside.", ...r, tensions: tension, followUps: ["What changed since my last assessment?", "What is Forge still unsure about?"] };
  });

  /* 9. conflict */
  intent("conflict", "How you handle conflict", ["conflict", "argue", "argument", "fight", "disagree", "confront", "tension"],
    ["How do I handle conflict?"], (p, ctx) => {
    const cands = [
      cand("avoid", "You avoid it longer than you should", ["warmth", "boldness"], AND(H("warmth"), L("boldness", 0, 5)), "You'd rather keep the peace, so issues build before you raise them.", "Raise it when it's small: one sentence, early."),
      cand("direct", "You say it straight", ["boldness", "compete"], OR(H("boldness", 2, 7), H("compete", 2, 7)), "You'd rather clear the air than let it sit.", "Open with what you want to fix, not what went wrong."),
      cand("facts", "You settle things with facts", ["analysis"], H("analysis", 2, 7), "Feelings-first framing can lose you.", "Name the feeling in one sentence so it doesn't leak out as sharpness."),
      cand("relationship-first", "You need the relationship acknowledged first", ["warmth"], H("warmth", 3, 8), "You can't fully argue the issue until the bond feels safe.", "Start with 'this matters to me because I care about us'."),
      cand("flare", "You flare and cool quickly", ["patience", "steadiness"], AND(L("patience"), L("steadiness", 0, 5)), "Your reaction is fast; so is your recovery.", "Take ten minutes before replying to anything that spiked you."),
      cand("withdraw", "You withdraw to think", ["autonomy", "social"], AND(H("autonomy"), L("social", 0, 5)), "Silence is processing, not punishment, but others may not know that.", "Say when you'll come back to it."),
      cand("level", "You stay level", ["patience", "steadiness"], AND(H("patience"), H("steadiness", 0, 5)), "You tend to want to understand the other side.", "Make sure you voice your own side too."),
    ];
    const r = reason(p, ctx, { candidates: cands, max: 3 });
    return { lead: r.factors.length ? "In a disagreement, Forge sees you tending to:" : "Nothing in your profile strongly predicts how you handle disagreement.", ...r, followUps: ["How do I communicate?", "What stresses me?"] };
  });

  /* 10. communication */
  intent("communication", "How you communicate", ["communicat", "text", "talk to", "express", "listen", "explain", "speak", "message"],
    ["How do I communicate?"], (p, ctx) => {
    const cands = [
      cand("direct", "Direct and to the point", ["analysis", "warmth"], AND(H("analysis"), L("warmth", 0, 5)), "You say what you mean. Others sometimes read it as coolness.", "Add a line of context or warmth when the message is hard."),
      cand("tone", "Attentive to tone", ["warmth"], H("warmth", 2, 7), "You soften hard messages and notice how things land.", "Be sure the actual request still comes through."),
      cand("thinking-aloud", "You think out loud", ["social", "humor"], AND(H("social"), H("humor", 0, 5)), "Conversation is how you figure things out; humor is how you connect.", "Flag when you're brainstorming vs. deciding."),
      cand("written", "You do your best thinking in writing", ["analysis", "social"], AND(H("analysis"), L("social", 0, 5)), "Written beats spoken for important things.", "Ask for time to reply in writing on big topics."),
      cand("quiet", "You process before you speak", ["autonomy", "social"], AND(H("autonomy"), L("social", 0, 5)), "Quiet isn't disengaged.", "Tell people 'give me a moment to think'."),
      cand("slow-trust", "You open up slowly", ["trust"], L("trust", 1.5, 6), "Candour follows consistency.", "Pick one person and practise telling them something real."),
    ];
    const r = reason(p, ctx, { candidates: cands, max: 3 });
    return { lead: r.factors.length ? "Your communication tends to look like this:" : "Your communication style doesn't lean strongly any one way.", ...r, followUps: ["How do I handle conflict?", "How do I behave in groups?"] };
  });

  /* 11. recovery */
  intent("recovery", "What helps you recover", ["recover", "recharge", "rest", "relax", "unwind", "burnout", "reset"],
    ["What helps me recover?"], (p, ctx) => {
    const cands = [
      cand("alone", "Time alone", ["social"], L("social", 1.5, 6), "Quiet with nothing scheduled restores you.", "Block it in your calendar like any other appointment."),
      cand("people", "Time with people you like", ["social"], H("social", 2, 7), "Company recharges you.", "Plan one easy social thing after hard weeks."),
      cand("new", "Something completely different", ["explore"], H("explore", 2, 7), "Novelty unrelated to the problem resets you.", "Keep a short list of things you've been curious about."),
      cand("order", "Putting things back in order", ["structure"], H("structure", 2, 7), "Tidying and lists give you back control.", "Do a 10-minute reset of your space and your list."),
      cand("move", "Something physical", ["steadiness"], L("steadiness", 0.5, 5), "Movement brings you back faster than thinking does.", "Walk before you try to solve it."),
      cand("write", "Writing it out", ["analysis"], H("analysis", 2, 7), "Getting the tangle onto a page lets you think.", "Ten minutes, no editing."),
      cand("laugh", "Laughing", ["humor"], H("humor", 2, 7), "Humor lets you put the weight down.", "Keep a go-to funny person or show."),
    ];
    const r = reason(p, ctx, { candidates: cands, max: 3 });
    return { lead: r.factors.length ? "Forge sees these as your likeliest ways back to baseline:" : "No single recovery style stands out.", ...r, followUps: ["What stresses me?", "What drains me?"] };
  });

  /* 12. strengths / growth areas */
  intent("strengths", "Where your strengths are", ["strength", "good at", "best at", "talent", "what am i good", "advantage"],
    ["What are my strengths?"], (p, ctx) => {
    const top = F.FACET_KEYS.map(k => ({ k, v: p.facets[k] })).sort((a, b) => b.v - a.v).filter(x => x.v >= 3).slice(0, 4);
    const factors = top.map(x => ({ id: x.k, title: fac(x.k), detail: F.timeline.describeFacet(x.k, x.v), strength: F.clamp01(x.v / 8), evidence: F.insights.evidenceFor(p, [x.k]) }));
    const helps = top.slice(0, 3).map(x => ({ text: `Look for work and roles that use your ${fac(x.k).toLowerCase()}.`, why: `Because ${evLine(F.insights.evidenceFor(p, [x.k])[0])}.`, forFactor: x.k }));
    return { lead: factors.length ? "Your most pronounced strengths:" : "Your profile is fairly balanced, so no one strength dominates.", factors, helps, followUps: ["What should I work on?", "What am I likely to misunderstand about myself?"] };
  });
  intent("growth", "Where you could grow", ["improve", "weakness", "work on", "get better", "develop", "growth area", "blind"],
    ["What should I work on?"], (p, ctx) => {
    const low = F.FACET_KEYS.map(k => ({ k, v: p.facets[k] })).sort((a, b) => a.v - b.v).filter(x => x.v <= -1.5).slice(0, 3);
    const factors = low.map(x => ({ id: x.k, title: fac(x.k), detail: F.timeline.describeFacet(x.k, x.v), strength: F.clamp01(-x.v / 8), evidence: F.insights.evidenceFor(p, [x.k]) }));
    const helps = low.map(x => ({ text: (F.growth && F.growth.experimentFor ? (F.growth.experimentFor(x.k) || {}).title : null) || `Try one small, repeatable practice around ${fac(x.k).toLowerCase()} this week.`, why: `Because ${evLine(F.insights.evidenceFor(p, [x.k])[0])}.`, forFactor: x.k }));
    return { lead: factors.length ? "These are the lower-scoring areas, not flaws, just where a little deliberate practice would go furthest:" : "Nothing in your profile is notably low, so growth is more about preference than gaps.", factors, helps, followUps: ["What are my strengths?", "What changed since my last assessment?"] };
  });

  /* 13. relationships */
  intent("relationships", "How you show up in relationships", ["relationship", "partner", "dating", "love", "romantic", "boyfriend", "girlfriend", "friendship", "friend"],
    ["How do I behave in relationships?"], (p, ctx) => {
    const cands = [
      cand("attuned", "You tune into how people feel", ["warmth"], H("warmth", 2, 7), "You notice moods early and respond to them.", "Tell people what you've noticed; they can't always see that you have."),
      cand("space", "You need independence inside closeness", ["autonomy"], H("autonomy", 2, 7), "You value room to be yourself even when you're close.", "Name your need for space as a preference, not a verdict."),
      cand("slow-open", "You open up gradually", ["trust"], L("trust", 1.5, 6), "Trust builds through consistency.", "Share small things on purpose; they add up."),
      cand("trusting", "You extend trust readily", ["trust", "warmth"], AND(H("trust"), H("warmth", 0.5, 5)), "You assume good intent, which makes closeness quick.", "Notice if you're skipping the 'getting to know' part."),
      cand("playful", "You use humor to bond", ["humor", "social"], AND(H("humor"), H("social", 0, 5)), "Play is part of how affection shows up for you.", "Make space for the unjokey conversations too."),
      cand("steady", "You're steady in the hard moments", ["steadiness", "patience"], AND(H("steadiness"), H("patience", 0.5, 5)), "People may lean on your calm.", "Make sure someone is steadying you, too."),
    ];
    const r = reason(p, ctx, { candidates: cands, max: 3 });
    return { lead: r.factors.length ? "In close relationships, Forge sees you tending to:" : "Nothing in your profile strongly predicts your relationship style.", ...r, followUps: ["How do I handle conflict?", "How do I communicate?"] };
  });

  /* 14. summary */
  intent("summary", "A short read on you", ["who am i", "describe me", "summar", "tell me about me", "about me", "overview"],
    ["Who am I, in short?"], (p, ctx) => {
    const top = F.FACET_KEYS.map(k => ({ k, v: p.facets[k] })).sort((a, b) => b.v - a.v).slice(0, 3);
    const low = F.FACET_KEYS.map(k => ({ k, v: p.facets[k] })).sort((a, b) => a.v - b.v).slice(0, 1);
    const lead = `${p.archetype ? `Your closest archetype is ${p.archetype.name}. ` : ""}Your strongest pulls are ${F.listJoin(top.map(x => fac(x.k).toLowerCase()))}${low[0] && low[0].v <= -2 ? `, and you're lower on ${fac(low[0].k).toLowerCase()}` : ""}.`;
    const factors = top.map(x => ({ id: x.k, title: fac(x.k), detail: F.timeline.describeFacet(x.k, x.v), strength: F.clamp01(x.v / 8), evidence: F.insights.evidenceFor(p, [x.k]) }));
    return { lead, factors, helps: [], followUps: ["What are my strengths?", "What is Forge still unsure about?"] };
  });

  /* 15. what changed */
  intent("changed", "What's changed since last time", ["changed", "since my last", "different from before", "last assessment", "last time", "evolv", "growing", "grown"],
    ["What changed since my last assessment?"], (p, ctx) => {
    const snaps = ctx && ctx.snapshots || [];
    if (snaps.length < 2) return { lead: "There's only one assessment on record, so there's nothing to compare yet. Retake later and Forge will show you what moved.", factors: [], helps: [], noData: true, followUps: ["What is Forge still unsure about?"] };
    const wc = F.timeline.whatChanged(snaps[snaps.length - 2], snaps[snaps.length - 1], snaps.slice(0, -2));
    const factors = wc.real.concat(wc.state).slice(0, 3).map(d => ({ id: d.dim, title: d.label, detail: `${d.before} → ${d.after}. ${d.class === "real" ? "Forge reads this as a real shift." : "This may be a state fluctuation rather than a lasting change."}`, strength: F.clamp01(Math.abs(d.weighted) / 8), evidence: [] }));
    return { lead: wc.headline, factors, helps: [], caveats: wc.caveats, changeDetail: wc, followUps: ["What should I work on?", "What stresses me?"] };
  });

  /* 16. what Forge is unsure about */
  intent("unsure", "What Forge is still unsure about", ["unsure", "don't know", "dont know", "certain", "accurate", "confiden", "how sure", "reliable", "trust this"],
    ["What is Forge still unsure about?"], (p, ctx) => {
    const areas = p.uncertainty.areas.slice(0, 3);
    const factors = areas.map(a => ({ id: a.area, title: F.sentenceCase(a.label), detail: `Forge is about ${Math.round(a.confidence)}% sure here. The least certain pieces are ${F.listJoin(a.weakestDims.map(d => F.dimLabel(d)))}.`, strength: a.uncertainty, evidence: [] }));
    return { lead: p.confidence.overall != null ? `Overall, Forge's read on you is ${p.confidence.level} confidence (${p.confidence.overall}%). The areas it knows least about are:` : "Forge doesn't have an overall confidence reading for this profile. The areas it knows least about are:", factors, helps: [{ text: "Answer a few targeted questions to firm these up.", why: "Because those areas had the weakest supporting evidence.", forFactor: "retake" }], suggestRetake: true, followUps: ["What changed since my last assessment?"] };
  });

  A.INTENTS = INTENTS;
  A.STARTERS = ["Why do I procrastinate?", "How do I make decisions?", "What stresses me?", "What motivates me?", "How do I behave in groups?", "What kind of environment suits me?", "How do I learn?", "What am I likely to misunderstand about myself?", "What changed since my last assessment?"];

  /* ---------------- detection ---------------- */
  function normalize(q){ return String(q || "").toLowerCase().replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ").trim(); }
  A.detect = function(question){
    const q = normalize(question);
    if (!q) return [];
    const scored = INTENTS.map(it => {
      let s = 0;
      it.keys.forEach(k => { if (q.includes(k)) s += k.length >= 6 ? 2 : 1.4; });
      it.examples.forEach(e => { if (normalize(e) === q) s += 5; });
      return { id: it.id, score: s };
    }).filter(x => x.score > 0).sort((a, b) => b.score - a.score);
    return scored;
  };

  A.answer = function(profile, question, ctx){
    ctx = ctx || {};
    if (!profile || !profile.ok) return { ok: false, reason: "No profile to answer from. Take the assessment first." };
    const q = String(question || "").slice(0, 200);
    const detected = A.detect(q);
    if (!detected.length || detected[0].score < 1.4){
      return { ok: true, intent: "unknown", question: q, lead: "Forge can answer questions about how you work, decide, learn, cope, relate and change, but not that one. Try one of these:", factors: [], helps: [], suggestions: A.STARTERS.slice(0, 6), confidence: null, disclaimer: null };
    }
    const it = INTENTS.find(i => i.id === detected[0].id);
    const built = it.build(profile, ctx);
    const ev = [].concat.apply([], built.factors.map(f => f.evidence || []));
    const conf = ev.length ? F.insights.confidenceNote(profile, ev) : { pct: profile.confidence.overall != null ? profile.confidence.overall : 50, level: profile.confidence.level, hedge: "may", value: 0.5 };
    const overallLow = profile.confidence.overall != null && profile.confidence.overall < 50;
    const disclaimer = (conf.pct < 55 || overallLow)
      ? `Forge is less certain here (${conf.pct}% on the evidence behind this). Treat it as a starting point, and answer a few more questions to sharpen it.`
      : null;
    return Object.assign({ ok: true, intent: it.id, title: it.title, question: q, alsoMatched: detected.slice(1, 3).map(d => d.id), confidence: { pct: conf.pct, level: conf.level }, disclaimer }, built);
  };

  /* Evidence table for the "what Forge used" panel. */
  A.evidenceSummary = function(answer){
    const rows = []; const seen = new Set();
    (answer.factors || []).forEach(f => (f.evidence || []).forEach(e => { if (!seen.has(e.facet)){ seen.add(e.facet); rows.push(e); } }));
    return rows;
  };
})(Forge);
if (typeof module !== "undefined" && module.exports) module.exports = Forge;
