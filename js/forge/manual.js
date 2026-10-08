/* =========================================================================
   FORGE OPERATING MANUAL
   "How to work with me", written in the first person, assembled entirely
   from the person's own facets via Forge.insights rules. A line only
   appears when the profile supports it; sections with nothing strongly
   indicated say so plainly rather than padding with generic advice.
   ========================================================================= */
(function(F){
  "use strict";
  const M = F.manual = {};
  const { H, L, M: MID, AND, OR, GAP, D, DL, ALWAYS, rule } = F.insights;

  /* Each section: key, title, rules[]. `group` stops near-duplicate lines. */
  M.SECTIONS = [
    { key: "workBest", title: "How I work best", rules: [
      rule("wb1", "auto", ["autonomy", "structure"], AND(H("autonomy"), H("structure")), "Give me autonomy and a clear objective. I do my best work owning the how."),
      rule("wb2", "auto", ["autonomy", "structure"], AND(H("autonomy"), L("structure")), "Give me the goal and some room. I'd rather find my own route than follow a fixed process."),
      rule("wb3", "auto", ["autonomy", "warmth"], AND(L("autonomy"), H("warmth")), "Let me work alongside someone. I do better with a collaborator than in silence."),
      rule("wb4", "plan", ["structure"], H("structure"), "Plans, owners and deadlines help me. I relax once I know what \"done\" looks like."),
      rule("wb5", "plan", ["structure", "flex"], AND(L("structure"), H("flex")), "Don't over-specify. A direction and the freedom to adapt gets more out of me than a checklist."),
      rule("wb6", "make", ["invent"], H("invent"), "Experiment first, refine later. I think by making things."),
      rule("wb7", "pace", ["analysis", "initiative"], GAP("analysis", "initiative", 3), "Give me time to think it through before I commit. Rushing me gets worse answers, not faster ones."),
      rule("wb8", "pace", ["initiative"], H("initiative"), "Let me start. Momentum is how I get clarity."),
      rule("wb9", "stay", ["persist"], H("persist"), "Give me the long, slow problems. I get steadier the longer something takes."),
      rule("wb10", "stay", ["persist", "explore"], AND(L("persist"), H("explore")), "Keep things varied. I do my best work in bursts on things that interest me."),
      rule("wb11", "score", ["compete"], H("compete"), "A visible scoreboard helps. Friendly competition sharpens me."),
      rule("wb12", "calm", ["steadiness"], H("steadiness"), "Hand me the messy, urgent thing. I tend to stay level when others speed up."),
    ]},
    { key: "learn", title: "How I learn", rules: [
      rule("l1", "ex", ["explore", "autonomy"], AND(H("explore"), H("autonomy")), "I learn by wandering off and finding things out myself. Give me a starting point, not a syllabus."),
      rule("l2", "ex", ["structure", "persist"], AND(H("structure"), H("persist")), "Give me an order to learn things in and I'll work through it steadily."),
      rule("l3", "an", ["analysis"], H("analysis"), "I want to understand why before how. Show me the principle and I'll build the rest."),
      rule("l4", "do", ["initiative", "invent"], AND(H("initiative"), OR(H("invent"), L("analysis"))), "Let me try it badly first. I learn faster from doing than from reading about it."),
      rule("l5", "soc", ["warmth", "social"], AND(H("social"), H("warmth")), "I learn well in conversation. Explaining it to someone else is how it sticks."),
      rule("l6", "soc", ["autonomy", "social"], AND(H("autonomy"), L("social")), "I take things in best alone first, then discuss once I've got my own view."),
      rule("l7", "var", ["explore", "persist"], AND(H("explore"), L("persist")), "Short, varied sessions beat one long grind for me."),
      rule("l8", "re", ["persist", "structure"], AND(H("persist"), L("explore")), "Repetition doesn't bore me. I can drill something until it's solid."),
      rule("l9", "ctx", ["flex", "explore"], AND(H("flex"), H("explore")), "Give me real, changing examples. Abstract material alone loses me."),
    ]},
    { key: "decide", title: "How I make decisions", rules: [
      rule("d1", "sp", ["analysis", "boldness"], AND(H("analysis"), L("boldness")), "I weigh options carefully and prefer the safer path. I decide better with all the information on the table."),
      rule("d2", "sp", ["analysis", "boldness"], AND(H("analysis"), H("boldness")), "I analyse, then commit hard. Once I've decided I'm rarely wobbly about it."),
      rule("d3", "sp", ["initiative", "analysis"], AND(H("initiative"), L("analysis")), "I'd rather decide quickly and correct as I go. A fast 'good enough' beats a slow 'perfect' for me."),
      rule("d4", "ppl", ["warmth"], H("warmth"), "I consider how a decision lands on people. Tell me who it affects and I'll weigh it properly."),
      rule("d5", "ppl", ["warmth", "analysis"], AND(L("warmth"), H("analysis")), "I decide on the merits. If feelings matter to the outcome, say so explicitly; I may not volunteer them."),
      rule("d6", "rev", ["boldness", "flex"], AND(H("flex"), H("boldness")), "Tell me if a decision is reversible. If it is, I'll move fast."),
      rule("d7", "ovr", ["analysis", "steadiness"], AND(H("analysis"), L("steadiness")), "Too many options overwhelm me. Narrow it to two or three and I'll choose."),
      rule("d8", "own", ["autonomy"], H("autonomy"), "I want to own the call. I'll take input, but I'd rather not decide by committee."),
      rule("d9", "own", ["warmth", "autonomy"], AND(L("autonomy"), H("trust")), "I like deciding together and sleeping on big choices with someone I trust."),
    ]},
    { key: "communicate", title: "How I communicate", rules: [
      rule("c1", "dir", ["analysis", "warmth"], AND(H("analysis"), L("warmth")), "I'm direct and I mean what I say. Don't read coldness into it."),
      rule("c2", "dir", ["warmth"], H("warmth"), "I pay attention to tone and I soften hard messages. If I'm being gentle, I still mean it."),
      rule("c3", "ctx", ["analysis"], H("analysis", 3, 8), "Give me the context first, then the actual request. I answer better when I understand the situation."),
      rule("c4", "q", ["autonomy", "social"], AND(H("autonomy"), L("social")), "Quiet doesn't necessarily mean disengaged. I often process before I speak."),
      rule("c5", "talk", ["social", "humor"], AND(H("social"), H("humor")), "I think out loud and use humor to connect. A joke from me usually means I like you."),
      rule("c6", "talk", ["social"], AND(H("social"), L("analysis")), "I talk things through live. Calls and conversation beat long written threads for me."),
      rule("c7", "write", ["analysis", "social"], AND(H("analysis"), L("social")), "Written beats spoken for important things. It lets me think before I answer."),
      rule("c8", "tru", ["trust"], L("trust"), "I take a while to open up. Consistency over time is what earns my candour."),
      rule("c9", "tru", ["trust", "warmth"], AND(H("trust"), H("warmth")), "I assume good intent and say what I'm feeling fairly early."),
    ]},
    { key: "pressure", title: "How I behave under pressure", rules: [
      rule("p1", "m", ["steadiness"], H("steadiness"), "I tend to get calmer and more practical when things go wrong."),
      rule("p2", "m", ["steadiness", "initiative"], AND(L("steadiness"), H("initiative")), "I move faster under pressure, which helps and can also make me abrupt."),
      rule("p3", "m", ["steadiness", "autonomy"], AND(L("steadiness"), H("autonomy")), "I pull inwards under pressure. Checking in lightly helps more than crowding me."),
      rule("p4", "m", ["steadiness", "social"], AND(L("steadiness"), H("social")), "I reach for people when stressed. Talking it through is how I settle."),
      rule("p5", "a", ["analysis", "steadiness"], AND(H("analysis"), L("steadiness")), "I can over-analyse when stressed. A concrete next step brings me back."),
      rule("p6", "b", ["patience"], L("patience"), "My patience shortens fast under load. If I snap, it's usually the pressure, not you."),
      rule("p7", "b", ["patience"], H("patience"), "I stay patient longer than most, which sometimes means I hold things in until late."),
      rule("p8", "r", ["persist"], H("persist"), "I dig in under pressure rather than bail."),
    ]},
    { key: "drains", title: "What drains me", rules: [
      rule("dr1", "soc", ["social"], L("social"), "Back-to-back social time. I need quiet gaps between people."),
      rule("dr2", "soc", ["social"], H("social"), "Long stretches alone with no one to bounce things off."),
      rule("dr3", "str", ["structure"], L("structure"), "Rigid process and being told exactly how to do things."),
      rule("dr4", "str", ["structure"], H("structure"), "Shifting goalposts and plans that change without notice."),
      rule("dr5", "dec", ["analysis", "initiative"], GAP("analysis", "initiative", 3), "Being pushed to decide before I've had time to think."),
      rule("dr6", "mic", ["autonomy"], H("autonomy"), "Being micro-managed. It costs me more energy than the work itself."),
      rule("dr7", "rep", ["explore"], H("explore"), "Doing the same thing the same way for too long."),
      rule("dr8", "conf", ["warmth", "trust"], AND(H("warmth"), L("steadiness")), "Unresolved tension between people. I absorb it."),
      rule("dr9", "vague", ["structure", "analysis"], OR(H("structure"), H("analysis")), "Vague goals with no definition of success."),
    ]},
    { key: "motivates", title: "What motivates me", rules: [
      rule("m1", "g", ["explore"], H("explore"), "Novelty and the chance to figure something out."),
      rule("m2", "g", ["invent"], H("invent"), "Making something that didn't exist before."),
      rule("m3", "g", ["warmth"], H("warmth"), "Knowing my work actually helps someone."),
      rule("m4", "g", ["compete"], H("compete"), "A real challenge, ideally one I might lose."),
      rule("m5", "g", ["autonomy"], H("autonomy"), "Ownership. Give me responsibility and I'll rise to it."),
      rule("m6", "g", ["structure", "persist"], AND(H("structure"), H("persist")), "Visible progress and finishing things properly."),
      rule("m7", "g", ["social", "humor"], AND(H("social"), H("humor")), "Doing it with people I enjoy."),
      rule("m8", "g", ["initiative"], H("initiative"), "Momentum and quick wins that keep it moving."),
      rule("m9", "g", ["optimism"], H("optimism"), "A believable path to something better."),
    ]},
    { key: "recover", title: "What helps me recover", rules: [
      rule("r1", "s", ["social"], L("social"), "Time alone, with nothing scheduled and nobody needing anything."),
      rule("r2", "s", ["social"], H("social"), "Time with people I like. Company recharges me."),
      rule("r3", "n", ["explore"], H("explore"), "Doing something new that has nothing to do with the problem."),
      rule("r4", "n", ["structure"], H("structure"), "Getting things back in order: a tidy desk, a clear list."),
      rule("r5", "p", ["steadiness"], L("steadiness"), "A walk or something physical before I try to think straight."),
      rule("r6", "p", ["analysis"], H("analysis"), "Writing it out. Getting the tangle onto a page lets me think."),
      rule("r7", "h", ["humor"], H("humor"), "Laughing at it. Humor lets me put the weight down."),
      rule("r8", "w", ["warmth", "trust"], AND(H("warmth"), H("trust")), "One honest conversation with someone I trust."),
    ]},
    { key: "groups", title: "How I behave in groups", rules: [
      rule("g1", "lead", ["initiative", "social"], AND(H("initiative"), H("social")), "I tend to get things started and keep the energy up."),
      rule("g2", "lead", ["initiative"], AND(H("initiative"), L("social")), "I'll take charge if nobody does, but I'm not looking for the spotlight."),
      rule("g3", "plan", ["structure"], H("structure"), "I'm the one who ends up with the plan, the list or the calendar."),
      rule("g4", "mediate", ["warmth", "steadiness"], AND(H("warmth"), H("steadiness")), "I notice tension early and tend to smooth it over."),
      rule("g5", "obs", ["analysis", "social"], AND(H("analysis"), L("social")), "I watch first and speak when I have something useful to add."),
      rule("g6", "wild", ["boldness", "humor"], AND(H("boldness"), H("humor")), "I'm likely the one who says \"let's just do it\" and makes it fun."),
      rule("g7", "chal", ["analysis", "autonomy"], AND(H("analysis"), H("autonomy")), "I'll challenge the plan if I think it has a hole. It's not personal."),
      rule("g8", "sup", ["warmth", "social"], AND(H("warmth"), L("initiative")), "I make sure everyone's okay and often put my own preferences second."),
      rule("g9", "flex", ["flex"], H("flex"), "I adapt to whatever the group needs, which can hide what I actually want."),
    ]},
    { key: "conflict", title: "How I handle conflict", rules: [
      rule("cf1", "a", ["warmth", "boldness"], AND(H("warmth"), L("boldness")), "I avoid conflict longer than I should. If I raise something, it's been on my mind a while."),
      rule("cf2", "a", ["boldness", "compete"], OR(H("boldness"), H("compete")), "I'd rather say it straight and clear the air."),
      rule("cf3", "b", ["analysis"], H("analysis"), "I want to settle disagreements with facts. Feelings-first framing can lose me."),
      rule("cf4", "b", ["warmth"], H("warmth", 3, 8), "I need the relationship acknowledged before I can talk about the issue."),
      rule("cf5", "c", ["patience", "steadiness"], AND(L("patience"), L("steadiness")), "I can flare up fast and cool down fast. Give me a few minutes."),
      rule("cf6", "c", ["patience", "steadiness"], AND(H("patience"), H("steadiness")), "I stay level in an argument and usually want to understand the other side."),
      rule("cf7", "d", ["autonomy", "social"], AND(H("autonomy"), L("social")), "I may withdraw to think. It isn't punishment; I'll come back."),
      rule("cf8", "e", ["trust"], L("trust"), "It takes me longer to trust that things are repaired. Follow-through matters."),
    ]},
    { key: "feedback", title: "How I like feedback", rules: [
      rule("f1", "a", ["analysis"], H("analysis"), "Specific and evidence-based. Tell me exactly what and why."),
      rule("f2", "a", ["warmth"], H("warmth"), "Kind but honest. Start with what's working, then be clear about what isn't."),
      rule("f3", "b", ["autonomy"], H("autonomy"), "Private and in writing, so I can digest it before reacting."),
      rule("f4", "b", ["social"], H("social"), "In conversation, so I can respond and ask questions."),
      rule("f5", "c", ["compete", "persist"], OR(H("compete"), H("persist")), "Straight. I'd rather hear the hard version early."),
      rule("f6", "d", ["steadiness"], L("steadiness"), "Give me a moment before the follow-up. I take criticism personally first, then usefully."),
    ]},
    { key: "misread", title: "What people may misunderstand about me", rules: [
      rule("mi1", "a", ["autonomy", "social"], AND(H("autonomy"), L("social")), "Needing space is not disinterest. It's how I stay engaged."),
      rule("mi2", "a", ["analysis", "warmth"], AND(H("analysis"), L("warmth")), "My directness can read as cold. It's usually just efficiency."),
      rule("mi3", "b", ["warmth", "boldness"], AND(H("warmth"), L("boldness")), "My agreeableness can hide real opinions. Ask me directly."),
      rule("mi4", "c", ["initiative", "social"], AND(H("initiative"), H("social")), "My speed can come across as impatience. I'm usually just excited."),
      rule("mi5", "d", ["analysis", "initiative"], GAP("analysis", "initiative", 3), "Taking time isn't indecision. I'm usually further along than I look."),
      rule("mi6", "e", ["humor", "steadiness"], AND(H("humor"), L("steadiness")), "Jokes sometimes cover stress. If I'm very funny, check in."),
      rule("mi7", "f", ["steadiness", "initiative"], AND(H("steadiness"), L("social")), "Staying calm doesn't mean I'm not affected."),
      rule("mi8", "g", ["structure", "flex"], AND(H("structure"), L("flex")), "Liking plans isn't rigidity about people; it's how I stay reliable."),
    ]},
    { key: "environments", title: "What environments suit me", rules: [
      rule("e1", "q", ["social", "autonomy"], AND(L("social"), H("autonomy")), "Quiet, with room to focus and few interruptions."),
      rule("e2", "q", ["social"], H("social", 3, 8), "Busy and sociable, with people nearby to bounce things off."),
      rule("e3", "s", ["structure"], H("structure"), "Clear processes, tidy surroundings, predictable rhythms."),
      rule("e4", "s", ["structure", "flex"], AND(L("structure"), H("flex")), "Fluid, changing, with room to improvise."),
      rule("e5", "n", ["explore", "invent"], OR(H("explore"), H("invent")), "Places where new ideas are welcome and trying things is normal."),
      rule("e6", "t", ["warmth", "trust"], H("warmth"), "Supportive teams where people are kind to each other."),
      rule("e7", "c", ["compete", "initiative"], AND(H("compete"), H("initiative")), "Ambitious, fast-moving places with real stakes."),
    ]},
    { key: "autonomy", title: "How much autonomy I prefer", rules: [
      rule("a1", "a", ["autonomy"], H("autonomy", 3, 8), "A lot. I'd like clear outcomes and then to be left to get on with it."),
      rule("a2", "a", ["autonomy"], MID("autonomy"), "A moderate amount. I like a clear brief and the freedom to shape the details."),
      rule("a3", "a", ["autonomy"], L("autonomy"), "Less than most. I like direction, regular check-ins and knowing someone's in it with me."),
      rule("a4", "b", ["autonomy", "structure"], AND(H("autonomy"), L("structure")), "Don't confuse autonomy with no support. I still want a place to bring problems."),
      rule("a5", "b", ["autonomy", "initiative"], AND(L("autonomy"), H("initiative")), "I'll take initiative, but I'd like to know I have backing before I do."),
    ]},
    { key: "collaborate", title: "How I collaborate", rules: [
      rule("co1", "r", ["structure", "autonomy"], AND(H("structure"), H("autonomy")), "Split the work clearly, agree the interface, then let me own my part."),
      rule("co2", "r", ["flex", "social"], AND(H("flex"), H("social")), "Work in the same room or on a live call. I'm best when we're bouncing off each other."),
      rule("co3", "t", ["initiative"], H("initiative"), "I'll start and expect to be told if I'm steering off course."),
      rule("co4", "t", ["analysis", "initiative"], GAP("analysis", "initiative", 3), "I'll want to understand the plan before I begin, then I'm reliable."),
      rule("co5", "w", ["warmth"], H("warmth"), "I'll check how everyone's doing and don't mind taking the supportive role."),
      rule("co6", "w", ["compete"], H("compete"), "I'd like us to set a target and beat it."),
      rule("co7", "i", ["invent"], H("invent"), "I'll bring options and the odd odd idea. Treat them as drafts, not demands."),
      rule("co8", "i", ["persist", "structure"], AND(H("persist"), H("structure")), "I'll be the one who finishes the last 10%."),
    ]},
  ];

  const HONEST_EMPTY = "Nothing in my profile pulls strongly either way here, so just ask me.";

  M.build = function(profile, opts){
    opts = opts || {};
    if (!profile || !profile.ok) return { ok: false, reason: "no usable profile" };
    const sections = M.SECTIONS.map(sec => {
      const lines = F.insights.pick(profile, sec.rules, opts.perSection || 4);
      return { key: sec.key, title: sec.title, lines, honestEmpty: lines.length === 0 ? HONEST_EMPTY : null };
    });
    const strengthTotal = F.sum(sections.map(s => s.lines.length));
    const lowConf = profile.confidence.overall != null && profile.confidence.overall < 50;
    return {
      ok: true, version: 1,
      name: profile.identity.name || "", archetype: profile.archetype && profile.archetype.name, code: profile.profileCode,
      sections, lineCount: strengthTotal,
      caveats: lowConf ? ["Forge's read on you is still low-confidence, so treat this as a starting draft and retake or answer a few more questions to sharpen it."] : [],
      note: "Built only from your own results. Nothing here is a diagnosis; edit or ignore anything that doesn't fit.",
    };
  };

  /* Plain text / markdown. `only` limits sections (privacy-safe sharing). */
  M.toText = function(manual, opts){
    opts = opts || {};
    if (!manual || !manual.ok) return "";
    const only = opts.only ? new Set(opts.only) : null;
    const name = manual.name ? `${manual.name}'s` : "My";
    const out = [`${name} Operating Manual`, manual.archetype ? `(${manual.archetype}, via Forge)` : "", ""];
    manual.sections.forEach(s => {
      if (only && !only.has(s.key)) return;
      out.push(s.title.toUpperCase());
      if (s.lines.length) s.lines.forEach(l => out.push("- " + l.text)); else out.push("- " + (s.honestEmpty || ""));
      out.push("");
    });
    out.push(manual.note);
    return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  };
  M.toMarkdown = function(manual, opts){
    if (!manual || !manual.ok) return "";
    const only = opts && opts.only ? new Set(opts.only) : null;
    const name = manual.name ? `${manual.name}'s` : "My";
    const out = [`# ${name} Operating Manual`, manual.archetype ? `*${manual.archetype} · generated with Forge*` : "", ""];
    manual.sections.forEach(s => {
      if (only && !only.has(s.key)) return;
      out.push(`## ${s.title}`);
      if (s.lines.length) s.lines.forEach(l => out.push("- " + l.text)); else out.push("- " + (s.honestEmpty || ""));
      out.push("");
    });
    out.push(`> ${manual.note}`);
    return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  };
  /* The subset that is safe to share by default: no stress/conflict/misread. */
  M.SHARE_SAFE = ["workBest", "learn", "communicate", "motivates", "feedback", "environments", "autonomy", "collaborate"];
})(Forge);
if (typeof module !== "undefined" && module.exports) module.exports = Forge;
