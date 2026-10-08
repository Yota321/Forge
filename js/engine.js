/* ---- Blocked-storage safety net -------------------------------------------
   Every page's first script. With site data blocked (some private modes,
   "block all cookies", locked-down managed browsers) merely *reading*
   window.localStorage throws a SecurityError -- which, since global.js
   reads it at load, took the whole app down to a blank page. If either
   store is unusable, swap in an in-memory stand-in so Forge still runs
   (just without persisting across reloads) and flag it so the UI can say
   so. No-op, and zero cost, when storage works normally. */
(function ensureUsableStorage(){
  function memoryStorage(){
    const m = new Map();
    return {
      get length(){ return m.size; },
      key(i){ return Array.from(m.keys())[i] ?? null; },
      getItem(k){ return m.has(String(k)) ? m.get(String(k)) : null; },
      setItem(k, v){ m.set(String(k), String(v)); },
      removeItem(k){ m.delete(String(k)); },
      clear(){ m.clear(); },
    };
  }
  ["localStorage", "sessionStorage"].forEach(name => {
    let ok = true;
    try {
      const s = window[name];
      const probe = "__pf_probe__";
      s.setItem(probe, "1");
      s.removeItem(probe);
    } catch(e){ ok = false; }
    if (!ok){
      try { Object.defineProperty(window, name, { value: memoryStorage(), configurable: true }); } catch(e){ /* nothing more to do */ }
      window.PF_STORAGE_VOLATILE = true;
    }
  });
})();

/* =========================================================================
   FORGE - PERSONALITY ENGINE
   Archetype/question/content data, scoring, QuizSession, compatibility,
   code encode/decode, quiz-progress persistence, shared-link URL helpers.
   No DOM access here - pure computation, shared by every page.
   ========================================================================= */



/* =========================================================================
   PERSONAFORGE, DATA MODULE
   25 hidden dimensions, an adaptive question bank (10 clusters), 12 core
   archetypes, 6 soul types, and career/relationship reference tables.
   ========================================================================= */

const DIMENSIONS = [
  "confidence","logic","creativity","humor","adaptability","curiosity",
  "empathy","leadership","patience","drive","risk","trust","kindness",
  "discipline","socialEnergy","selfAwareness","planning","resilience",
  "optimism","independence","emotionalStability","competitiveness",
  "responsibility","persistence","openMindedness"
];

/* Short display labels for the radar chart specifically. The prose labels
   used elsewhere (DIM_LABELS in engine.js) are fine in a sentence, but
   "emotionalStability" or "openMindedness" spelled out is too wide to sit
   next to 24 other labels around a circle without clipping the edge of
   the canvas, so these are deliberately compact. */
const RADAR_LABELS = {
  confidence:"Confidence", logic:"Logic", creativity:"Creativity",
  humor:"Humor", adaptability:"Adaptable", curiosity:"Curiosity",
  empathy:"Empathy", leadership:"Leadership", patience:"Patience",
  drive:"Drive", risk:"Risk", trust:"Trust", kindness:"Kindness",
  discipline:"Discipline", socialEnergy:"Social", selfAwareness:"Self-Aware",
  planning:"Planning", resilience:"Resilience", optimism:"Optimism",
  independence:"Independent", emotionalStability:"Stability",
  competitiveness:"Competitive", responsibility:"Responsible",
  persistence:"Persistent", openMindedness:"Open-Minded",
};

function emptyDims(){
  const d = {};
  DIMENSIONS.forEach(k => d[k] = 0);
  return d;
}

/* ---- Question bank -----------------------------------------------------
   10 clusters x 20 questions = 200 authored scenarios. Every question has
   exactly 3 answers, each nudging 3-5 dimensions by -2..+2.
   The adaptive engine (see engine.js) asks a fixed 15-question core set
   first (CORE_QUESTION_IDS), then two batches of 10 chosen by
   information value against the accumulated answers (16-35), then
   continues one question at a time only if confidence isn't there yet,
   up to 45 total. Adding more questions to any cluster array just grows
   the pool the adaptive stages pick from; no other code needs to change.
------------------------------------------------------------------------- */

/* =========================================================================
   FORGE v2.1 - QUESTION BANK (complete rewrite)
   120 questions: 15 fixed "core" questions (see CORE_QUESTION_IDS below,
   asked first, identical order, every user) + 105 adaptively-selectable
   "pool" questions grouped here by emotional-pacing category (fun,
   everyday, reflective, moral, emotional, weird -- see purpose/tone/
   difficulty on each question for why). Every option carries a "why"
   string: internal-only metadata explaining the psychological reasoning
   behind its dimension deltas (never shown to the user, surfaced only
   through result-page self-explanation and future engine debugging).
   "tags" on an option are permanently added to session.tags once chosen;
   "unlockConditions.anyTags" on a pool question gates its eligibility on
   the adaptive engine having seen at least one of those tags so far --
   this is the literal "your answer to Q3 can unlock Q56" branching the
   spec asked for, layered on top of the existing info-gain ranking
   (computeQuestionInfoValue still picks the single best question among
   whatever is currently unlocked). "validates":"dim" (was "validates" in
   v2.0 too) re-measures a dimension an earlier, differently-themed
   question already touched, feeding _checkValidation()'s contradiction
   tracking unchanged from v2.0. */
const QUESTION_BANK = {

  fun: [
  { id:"c02", text:"You wake up and somehow have one completely free day: no obligations, no consequences tomorrow.", illustration:"lightbulb", type:"fun", tone:"playful", difficulty:"light", purpose:"A zero-stakes wish reveals what a person actually values when nothing is being tested.", measures:["curiosity","drive","openMindedness"], validates:null,
    options:[
      { text:"Chase something reckless you've always wanted to try", d:{risk:2,curiosity:1,drive:1}, reason:"Spending a truly free day on a risk you'd normally justify against shows risk tolerance is a real preference, not just circumstance.", tradeoff:"Gains upside, at the cost of the goodwill the other path here would have offered instead.", reveals:["Accepts uncertainty in exchange for upside", "Chooses exploration over certainty", "Pushes toward the outcome even under resistance"], tags:["adventurous"] },
      { text:"Spend it slowly with the people who matter most to you", d:{kindness:2,socialEnergy:1,patience:1}, reason:"Given total freedom, choosing people over novelty reveals where meaning is actually located.", tradeoff:"Gains goodwill, at the cost of the upside the other path here would have offered instead.", reveals:["Chooses someone else's comfort over their own convenience", "Draws energy from engaging with others", "Tolerates discomfort rather than forcing resolution"], tags:["warm","loyal"] },
      { text:"Disappear alone somewhere quiet and think", d:{independence:2,selfAwareness:1,openMindedness:1}, reason:"Using rare unstructured time for solitude over stimulation points to an introspective default, not fatigue-driven withdrawal.", tradeoff:"Gains autonomy, at the cost of the upside the other path here would have offered instead.", reveals:["Chooses self-reliance over relying on others", "Names an uncomfortable truth about themselves", "Stays open to being wrong"], tags:["reflective","independent"] } ]},
  { id:"c06", text:"You wake up inside your favorite story, and the characters have no idea you're not supposed to be there.", illustration:"doorway", type:"fun", tone:"playful", difficulty:"light", purpose:"An impossible, low-cost fantasy prompt reveals which impulse wins when reality's rules don't apply.", measures:["risk","leadership","curiosity"], validates:null,
    options:[
      { text:"Jump straight into the action and try to help however you can", d:{risk:2,kindness:1,drive:1}, reason:"Choosing to act inside a world where the stakes feel real but the consequences don't shows the impulse to help is instinctive, not calculated.", tradeoff:"Gains upside, at the cost of the insight the other path here would have offered instead.", reveals:["Chooses the less certain, more interesting path", "Softens a hard truth to protect someone", "Keeps moving rather than settling"], tags:["bold","adventurous"] },
      { text:"Stay out of the plot and just quietly explore the world", d:{curiosity:2,independence:1,openMindedness:1}, reason:"Prioritizing exploration over involvement even somewhere consequence-free suggests curiosity outweighs the pull toward mattering.", tradeoff:"Gains insight, at the cost of the upside the other path here would have offered instead.", reveals:["Follows a question rather than letting it go", "Chooses self-reliance over relying on others", "Stays open to being wrong"], tags:["curious","independent"] },
      { text:"Try to take the lead and steer the story your way", d:{leadership:2,confidence:1,competitiveness:1}, reason:"Wanting to author the outcome rather than participate in someone else's story, even hypothetically, is a real leadership tell.", tradeoff:"Gains control, at the cost of the upside the other path here would have offered instead.", reveals:["Takes the lead without being asked", "Acts before being fully sure", "Keeps pushing rather than settling for a tie"], tags:["bold","competitive"] } ]},
  { id:"c10", text:"You have to choose how a shared project with a friend gets finished, and you disagree on the approach.", illustration:"bridge", type:"fun", tone:"light", difficulty:"light", purpose:"Everyday collaborative friction, low stakes, reads decision style under mild social cost.", measures:["leadership","adaptability","competitiveness"], validates:null,
    options:[
      { text:"Push for your approach, you're fairly sure it's better", d:{confidence:2,leadership:1,competitiveness:1}, reason:"Holding your position against a friend's preference, even mildly, over something you believe is better shows conviction outweighs harmony here.", tradeoff:"Gains conviction, at the cost of the goodwill the other path here would have offered instead.", reveals:["Backs their own judgment under pressure", "Steps into the gap when no one else will", "Measures the situation by whether they're winning"], tags:["bold","competitive"] },
      { text:"Go with theirs, the friendship matters more than being right", d:{kindness:2,adaptability:1,independence:-1}, reason:"Deliberately yielding on something you disagree with for the relationship's sake is a real, specific tradeoff, not indifference.", tradeoff:"Gains goodwill, at the cost of autonomy.", reveals:["Chooses someone else's comfort over their own convenience", "Adjusts course rather than forcing a plan through", "Chooses connection or reliance over going it alone"], tags:["warm","loyal"] },
      { text:"Find a version that borrows from both, even if it's messier", d:{creativity:2,patience:1,planning:1}, reason:"Choosing the harder synthesis over either clean option reflects a preference for integration over efficiency.", tradeoff:"Gains originality, at the cost of the conviction the other path here would have offered instead.", reveals:["Builds a new option instead of picking a given one", "Lets a situation play out before intervening", "Prepares rather than improvising"], tags:["pragmatist","curious"] } ]},
  { id:"f01", text:"An alien lands, politely asks you for directions to the nearest café, and seems completely unbothered by the fact that it's an alien.", illustration:"compass", type:"fun", tone:"playful", difficulty:"light", purpose:"Absurd-but-mundane framing tests default reaction to genuinely novel stimuli.", measures:["curiosity","emotionalStability","socialEnergy"], validates:null, unlockConditions:{anyTags:["curious","independent"]},
    options:[
      { text:"Give clear directions like this happens every day", d:{emotionalStability:2,logic:1,adaptability:1}, reason:"Treating the impossible as routine reveals a baseline that resists being rattled by novelty, not a lack of wonder.", tradeoff:"Gains composure, at the cost of the insight the other path here would have offered instead.", reveals:["Keeps a level head when things get tense", "Reasons through a situation before acting", "Changes approach when the situation shifts"], tags:["pragmatist","independent"] },
      { text:"Ask it a dozen questions before it can even leave", d:{curiosity:2,socialEnergy:1,openMindedness:1}, reason:"Prioritizing the opportunity to learn over the mundane task at hand shows curiosity overriding social script.", tradeoff:"Gains insight, at the cost of the composure the other path here would have offered instead.", reveals:["Follows a question rather than letting it go", "Leans toward people rather than away from them", "Stays open to being wrong"], tags:["curious","playful"] },
      { text:"Walk it there yourself just to see where this goes", d:{risk:1,curiosity:1,drive:1,humor:1}, reason:"Choosing direct involvement in something bizarre over safely disengaging is a genuine pull toward novelty over caution; treating an alien asking for directions as a fun bit to play along with, rather than a crisis, is a genuine light touch.", tradeoff:"Gains upside, at the cost of the composure the other path here would have offered instead.", reveals:["Accepts uncertainty in exchange for upside", "Chooses exploration over certainty", "Pushes toward the outcome even under resistance"], tags:["adventurous","bold","playful"] } ]},
  { id:"f02", text:"You're granted one minor superpower, but only for a single day.", illustration:"lightbulb", type:"fun", tone:"playful", difficulty:"light", purpose:"A wish-fulfillment prompt that separates fantasy-of-power from fantasy-of-ease.", measures:["drive","curiosity","independence"], validates:null, unlockConditions:{anyTags:["bold","competitive","adventurous"]},
    options:[
      { text:"The power to be unbeatable at anything you attempt today", d:{competitiveness:2,confidence:1,drive:1}, reason:"Choosing dominance over convenience or insight, even temporarily, is a specific tell about what winning means to you.", tradeoff:"Gains an edge, at the cost of the insight the other path here would have offered instead.", reveals:["Measures the situation by whether they're winning", "Backs their own judgment under pressure", "Pushes toward the outcome even under resistance"], tags:["competitive","bold"] },
      { text:"The power to know exactly what anyone is really thinking", d:{curiosity:2,logic:1,trust:-1}, reason:"Trading other people's privacy for total insight into them reveals how much uncertainty about others actually bothers you.", tradeoff:"Gains insight, at the cost of closeness.", reveals:["Chooses exploration over certainty", "Relies on logic over instinct", "Withholds trust until it's proven"], tags:["curious","analytical"] },
      { text:"The power to undo any one mistake, just for today", d:{planning:1,resilience:-1,emotionalStability:1}, reason:"Wanting a safety net rather than power or knowledge suggests risk-aversion runs deeper than it usually shows.", tradeoff:"Gains preparedness, at the cost of forward motion.", reveals:["Prepares rather than improvising", "Lets a setback actually land before moving on", "Keeps a level head when things get tense"], tags:["cautious"] } ]},
  { id:"f03", text:"You get cast, without warning, as the protagonist of the last movie you watched.", illustration:"masks", type:"fun", tone:"playful", difficulty:"light", purpose:"Tests instinct toward control versus improvisation when suddenly thrust into unfamiliar stakes.", measures:["leadership","adaptability","risk"], validates:null, unlockConditions:{anyTags:["adventurous","bold","curious"]},
    options:[
      { text:"Try to improve on the character's choices as you go", d:{confidence:2,leadership:1,creativity:1}, reason:"Assuming you can outperform a story already written shows a specific confidence in your own judgment over the established plan.", tradeoff:"Gains conviction, at the cost of the consistency the other path here would have offered instead.", reveals:["Acts before being fully sure", "Takes the lead without being asked", "Builds a new option instead of picking a given one"], tags:["bold","competitive"] },
      { text:"Follow the plot exactly, it clearly worked out fine before", d:{discipline:2,patience:1,planning:1}, reason:"Trusting a proven path over your own improvisation, even where the outcome is already known, reflects real risk-aversion.", tradeoff:"Gains consistency, at the cost of the conviction the other path here would have offered instead.", reveals:["Holds a personal standard even without anyone watching", "Tolerates discomfort rather than forcing resolution", "Structures uncertainty before acting"], tags:["cautious","pragmatist"] },
      { text:"Immediately go off-script and see what happens instead", d:{risk:2,curiosity:2,adaptability:-1}, reason:"Choosing the unknown over a guaranteed outcome purely out of curiosity is a genuine risk-seeking impulse.", tradeoff:"Gains upside, at the cost of flexibility.", reveals:["Accepts uncertainty in exchange for upside", "Chooses exploration over certainty", "Holds the original plan despite new information"], tags:["adventurous","curious"] } ]},
  { id:"f04", text:"You're handed a time machine that only works once, for exactly one hour, anywhere in your own past.", illustration:"clock", type:"fun", tone:"playful", difficulty:"medium", purpose:"A single-use wish forces a real priority between correction, closure, and reliving.", measures:["persistence","emotionalStability","openMindedness"], validates:null, unlockConditions:{anyTags:["reflective","idealist"]},
    options:[
      { text:"Go fix the one decision you still regret", d:{persistence:2,discipline:1,emotionalStability:-1}, reason:"Spending your only hour on correction rather than reliving good moments shows regret outweighs nostalgia for you.", tradeoff:"Gains follow-through, at the cost of composure.", reveals:["Keeps going after the initial effort stops paying off", "Holds a personal standard even without anyone watching", "Lets the moment's weight actually register"], tags:["idealist","reflective"] },
      { text:"Go relive one perfect, ordinary hour you didn't appreciate enough", d:{optimism:2,kindness:1,openMindedness:1}, reason:"Choosing appreciation over correction reveals a instinct to savor rather than fix.", tradeoff:"Gains ease, at the cost of the follow-through the other path here would have offered instead.", reveals:["Expects things to work out", "Softens a hard truth to protect someone", "Stays open to being wrong"], tags:["warm","reflective"] },
      { text:"Use it to warn your past self about something big coming", d:{planning:2,responsibility:1,risk:-1}, reason:"Prioritizing prevention over either fixing or savoring the past shows a forward-looking, risk-averse instinct even when looking backward.", tradeoff:"Gains preparedness, at the cost of upside.", reveals:["Structures uncertainty before acting", "Takes ownership even when it costs them", "Protects against a worse outcome over a better one"], tags:["cautious","analytical"] } ]},
  { id:"f05", text:"You're offered a role as the villain in a story where the villain is clearly, deliberately, the more interesting character.", illustration:"masks", type:"fun", tone:"playful", difficulty:"light", purpose:"Reads comfort with being disliked in exchange for being memorable.", measures:["confidence","independence","openMindedness"], validates:null, unlockConditions:{anyTags:["bold","independent","competitive"]},
    options:[
      { text:"Take it without hesitation, interesting beats liked every time", d:{confidence:2,independence:1,openMindedness:1}, reason:"Choosing impact over likability, even in something as low-stakes as a story role, is a genuine values signal.", tradeoff:"Gains conviction, at the cost of the connection the other path here would have offered instead.", reveals:["Backs their own judgment under pressure", "Trusts their own judgment over consensus", "Reconsiders a position when given a reason to"], tags:["bold","independent"] },
      { text:"Take it, but try to make the villain sympathetic anyway", d:{empathy:2,creativity:1,openMindedness:1}, reason:"Refusing to let a role be purely one-note reflects discomfort with simple, uncomplicated judgment of anyone.", tradeoff:"Gains connection, at the cost of the conviction the other path here would have offered instead.", reveals:["Reads the emotional stakes before acting", "Builds a new option instead of picking a given one", "Stays open to being wrong"], tags:["warm","curious"] },
      { text:"Pass, you'd rather be liked than remembered", d:{socialEnergy:1,kindness:1,confidence:-1}, reason:"Choosing warmth over impact even hypothetically shows a real preference ordering, not just modesty.", tradeoff:"Gains engagement, at the cost of conviction.", reveals:["Leans toward people rather than away from them", "Softens a hard truth to protect someone", "Lets doubt slow down a decision"], tags:["loyal","cautious"] } ]},
  { id:"f06", text:"You find a door in your home that definitely wasn't there yesterday. It's just slightly open.", illustration:"doorway", type:"fun", tone:"playful", difficulty:"light", purpose:"An impossible-but-personal prompt separates curiosity from caution under genuine mystery.", measures:["curiosity","risk","planning"], validates:null, unlockConditions:{anyTags:["curious","adventurous"]},
    options:[
      { text:"Open it immediately, whatever's there, you want to know", d:{curiosity:2,risk:2,patience:-1}, reason:"Choosing immediate knowledge over any precaution at all is a strong, specific curiosity signal.", tradeoff:"Gains insight, at the cost of stability.", reveals:["Follows a question rather than letting it go", "Chooses the less certain, more interesting path", "Acts rather than waiting it out"], tags:["curious","adventurous"] },
      { text:"Grab something useful first, then go look", d:{planning:2,risk:1,logic:1}, reason:"Preparing before engaging with the unknown shows curiosity tempered by real caution, not suppressed by it.", tradeoff:"Gains preparedness, at the cost of the insight the other path here would have offered instead.", reveals:["Prepares rather than improvising", "Chooses the less certain, more interesting path", "Reasons through a situation before acting"], tags:["pragmatist","cautious"] },
      { text:"Close it, note where it was, and go on with your day", d:{discipline:1,independence:1,curiosity:-1}, reason:"Actively choosing not to investigate something this strange is a genuine, deliberate cap on curiosity when uncertainty feels too open-ended.", tradeoff:"Gains consistency, at the cost of insight.", reveals:["Holds a personal standard even without anyone watching", "Trusts their own judgment over consensus", "Prefers the familiar over the unknown"], tags:["cautious"] } ]},
  { id:"f07", text:"You're given the chance to instantly master any one skill, but you'll never know what it feels like to struggle to learn it.", illustration:"key", type:"fun", tone:"light", difficulty:"medium", purpose:"Tests whether mastery or the process of earning it is actually valued more.", measures:["persistence","drive","openMindedness"], validates:"persistence", unlockConditions:{anyTags:["competitive","independent"]},
    options:[
      { text:"Take it, the result matters more than how you got there", d:{drive:2,competitiveness:1,persistence:-1}, reason:"Choosing the outcome over the process, when explicitly offered both, is a clean, real read on what actually motivates you.", tradeoff:"Gains momentum, at the cost of follow-through.", reveals:["Keeps moving rather than settling", "Keeps pushing rather than settling for a tie", "Knows when to stop rather than pushing further"], tags:["competitive","pragmatist"] },
      { text:"Pass, the struggle is the part that actually makes it feel earned", d:{persistence:2,discipline:1,resilience:1}, reason:"Turning down a genuine shortcut specifically because it removes the struggle shows the process itself is where the value lives.", tradeoff:"Gains follow-through, at the cost of the momentum the other path here would have offered instead.", reveals:["Sees something through past the easy stopping point", "Follows through on principle rather than convenience", "Treats a setback as temporary"], tags:["idealist","independent"] },
      { text:"Take it, then immediately go find something harder to struggle with", d:{drive:1,curiosity:2,persistence:1}, reason:"Accepting the shortcut but redirecting the saved effort elsewhere reveals an appetite for challenge that isn't tied to any one skill.", tradeoff:"Gains insight, at the cost of the an edge the other path here would have offered instead.", reveals:["Follows a question rather than letting it go", "Keeps moving rather than settling", "Sees something through past the easy stopping point"], tags:["adventurous","competitive"] } ]},
  { id:"f08", text:"A genie offers you three wishes, but warns that every wish will be granted in the most literal, technically-correct way possible.", illustration:"lightbulb", type:"fun", tone:"playful", difficulty:"light", purpose:"Reveals whether caution or ambition wins when a known trap is explicitly disclosed upfront.", measures:["logic","risk","planning"], validates:null, unlockConditions:{anyTags:["analytical","cautious"]},
    options:[
      { text:"Spend the first wish just closing every loophole in the other two", d:{logic:2,planning:2,risk:-1}, reason:"Sacrificing a third of your total upside purely to control for a known risk shows real risk-aversion under an explicit warning.", tradeoff:"Gains clarity, at the cost of upside.", reveals:["Reasons through a situation before acting", "Prepares rather than improvising", "Chooses the safer, more certain path"], tags:["analytical","cautious"] },
      { text:"Wish for something so simple there's barely room to misinterpret it", d:{discipline:1,logic:1,drive:-1}, reason:"Deliberately shrinking your ambition to fit inside what's safely literal reveals a preference for certainty over upside.", tradeoff:"Gains consistency, at the cost of momentum.", reveals:["Follows through on principle rather than convenience", "Reasons through a situation before acting", "Chooses ease over pushing further"], tags:["cautious","pragmatist"] },
      { text:"Go big anyway, a technically-correct version of something amazing is still amazing", d:{risk:2,optimism:2,drive:1,humor:1}, reason:"Accepting the disclosed trap in exchange for a shot at something large shows real appetite for upside over guaranteed safety; leaning into the absurdity of a 'technically-correct' loophole rather than fighting it is itself a small, genuine sense of humor about the situation.", tradeoff:"Gains upside, at the cost of the clarity the other path here would have offered instead.", reveals:["Accepts uncertainty in exchange for upside", "Frames setbacks as temporary", "Pushes toward the outcome even under resistance"], tags:["adventurous","bold"] } ]},
  { id:"f09", text:"You can swap lives with a complete stranger for exactly one week, no memories lost on either side afterward.", illustration:"mirror", type:"fun", tone:"light", difficulty:"light", purpose:"Tests appetite for novelty against attachment to one's own life as it currently is.", measures:["curiosity","adaptability","independence"], validates:null, unlockConditions:{anyTags:["curious","adventurous","independent"]},
    options:[
      { text:"Pick someone whose life looks nothing like yours", d:{curiosity:2,adaptability:2,openMindedness:1}, reason:"Choosing maximum contrast over comfort shows curiosity about difference outweighs the appeal of an easier week.", tradeoff:"Gains insight, at the cost of the autonomy the other path here would have offered instead.", reveals:["Chooses exploration over certainty", "Adjusts course rather than forcing a plan through", "Reconsiders a position when given a reason to"], tags:["curious","adventurous"] },
      { text:"Pass entirely, your own life is the one you'd rather be living", d:{independence:1,emotionalStability:1,curiosity:-1}, reason:"Turning down a completely consequence-free novelty offer is a genuine statement of contentment, not lack of imagination.", tradeoff:"Gains autonomy, at the cost of insight.", reveals:["Trusts their own judgment over consensus", "Stays steady under pressure", "Prefers the familiar over the unknown"], tags:["independent","loyal"] },
      { text:"Pick someone specific whose choices you've always quietly judged", d:{empathy:1,curiosity:1,confidence:1}, reason:"Using the swap to actually test a judgment rather than just for novelty shows curiosity aimed at understanding, not escape.", tradeoff:"Gains connection, at the cost of the flexibility the other path here would have offered instead.", reveals:["Prioritizes how someone else is feeling", "Chooses exploration over certainty", "Backs their own judgment under pressure"], tags:["curious","reflective"] } ]},
  { id:"f10", text:"You wake up and, for exactly 24 hours, no one who sees you can lie to you, whether they want to or not.", illustration:"scales", type:"fun", tone:"light", difficulty:"medium", purpose:"Absolute-truth premise tests appetite for unfiltered honesty against comfort with ambiguity.", measures:["trust","curiosity","emotionalStability"], validates:"trust", unlockConditions:{anyTags:["idealist","analytical"]},
    options:[
      { text:"Spend the day asking everyone you know the questions you've always wondered about", d:{curiosity:2,trust:1,confidence:1}, reason:"Using a rare truth-guarantee to actively seek out uncomfortable answers shows the pull toward certainty beats fear of what you'll hear.", tradeoff:"Gains insight, at the cost of the composure the other path here would have offered instead.", reveals:["Follows a question rather than letting it go", "Gives someone the benefit of the doubt", "Acts before being fully sure"], tags:["curious","bold"] },
      { text:"Avoid asking anything you're not sure you actually want answered", d:{emotionalStability:1,patience:1,curiosity:-1}, reason:"Having guaranteed honesty available and still choosing not to use it reveals real limits on how much truth you actually want.", tradeoff:"Gains composure, at the cost of insight.", reveals:["Stays steady under pressure", "Tolerates discomfort rather than forcing resolution", "Prefers the familiar over the unknown"], tags:["cautious","reflective"] },
      { text:"Use it mostly to check whether people around you are okay, not to catch anyone out", d:{empathy:2,kindness:1,trust:1}, reason:"Directing an unlimited truth tool toward care rather than curiosity or suspicion shows where your attention actually goes first.", tradeoff:"Gains connection, at the cost of the insight the other path here would have offered instead.", reveals:["Prioritizes how someone else is feeling", "Chooses someone else's comfort over their own convenience", "Extends trust before it's fully earned"], tags:["warm","loyal"] } ]},
  { id:"f11", text:"You're offered the chance to relive today exactly once more, keeping everything you now know.", illustration:"clock", type:"fun", tone:"light", difficulty:"light", purpose:"Tests appetite for optimization over acceptance of an already-lived, ordinary day.", measures:["planning","optimism","persistence"], validates:null, unlockConditions:{anyTags:["analytical","pragmatist"]},
    options:[
      { text:"Take it and try to make every part of today slightly better", d:{planning:2,drive:1,persistence:1}, reason:"Choosing to optimize an already-fine day rather than accept it shows a real, low-key perfectionist streak.", tradeoff:"Gains preparedness, at the cost of the ease the other path here would have offered instead.", reveals:["Prepares rather than improvising", "Keeps moving rather than settling", "Sees something through past the easy stopping point"], tags:["pragmatist","analytical"] },
      { text:"Pass, today happened the way it happened for a reason", d:{optimism:1,emotionalStability:1,openMindedness:-1}, reason:"Declining a genuinely free redo out of acceptance rather than indifference is a specific, real philosophical stance.", tradeoff:"Gains ease, at the cost of room to be wrong.", reveals:["Expects things to work out", "Keeps a level head when things get tense", "Holds a position rather than reconsidering it"], tags:["idealist","independent"] },
      { text:"Take it just to see how differently it could go for fun", d:{curiosity:2,creativity:1,planning:-1}, reason:"Wanting the replay purely for the experiment, not to fix or accept anything, shows curiosity as the dominant motive here.", tradeoff:"Gains insight, at the cost of preparedness.", reveals:["Follows a question rather than letting it go", "Builds a new option instead of picking a given one", "Improvises rather than preparing"], tags:["curious","playful"] } ]},
  { id:"f12", text:"You're given a magic notebook: whatever you write in it about tomorrow comes true, but only once, ever.", illustration:"key", type:"fun", tone:"light", difficulty:"medium", purpose:"A single guaranteed outcome forces a real ranking of personal, relational, and abstract goods.", measures:["drive","kindness","openMindedness"], validates:null, unlockConditions:{anyTags:["idealist","warm"]},
    options:[
      { text:"Write something that guarantees a big win for yourself", d:{drive:2,confidence:1,competitiveness:1}, reason:"Using a single guaranteed outcome on yourself over anyone else is a clean, honest read on where self-interest actually ranks.", tradeoff:"Gains momentum, at the cost of the goodwill the other path here would have offered instead.", reveals:["Pushes toward the outcome even under resistance", "Backs their own judgment under pressure", "Measures the situation by whether they're winning"], tags:["competitive","bold"] },
      { text:"Write something that quietly fixes a hard day for someone you love", d:{kindness:2,empathy:1,drive:-1}, reason:"Spending a once-ever guarantee on someone else's ordinary hard day, not your own big moment, is a real and specific generosity.", tradeoff:"Gains goodwill, at the cost of momentum.", reveals:["Chooses someone else's comfort over their own convenience", "Prioritizes how someone else is feeling", "Chooses ease over pushing further"], tags:["warm","loyal"] },
      { text:"Write something vague enough to leave room for how it plays out", d:{creativity:2,openMindedness:1,planning:-1}, reason:"Refusing to fully lock down even a guaranteed outcome shows discomfort with removing all uncertainty from life.", tradeoff:"Gains originality, at the cost of preparedness.", reveals:["Builds a new option instead of picking a given one", "Stays open to being wrong", "Improvises rather than preparing"], tags:["curious","independent"] } ]},
  { id:"f13", text:"For one day, you can understand and speak to any animal, but they can also understand and speak back to you, honestly, about you.", illustration:"heart", type:"fun", tone:"playful", difficulty:"light", purpose:"A whimsical premise smuggling in a real ego-versus-curiosity test.", measures:["selfAwareness","curiosity","confidence"], validates:null, unlockConditions:{anyTags:["curious","reflective"]},
    options:[
      { text:"Seek it out anyway, honest feedback is honest feedback", d:{selfAwareness:2,confidence:1,openMindedness:1}, reason:"Actively pursuing unfiltered judgment from an unexpected source, even knowing it might sting, shows genuine appetite for self-knowledge.", tradeoff:"Gains self-knowledge, at the cost of the levity the other path here would have offered instead.", reveals:["Notices their own patterns in real time", "Backs their own judgment under pressure", "Reconsiders a position when given a reason to"], tags:["reflective","idealist"] },
      { text:"Mostly just enjoy the novelty and skip the personal questions", d:{humor:2,curiosity:1,selfAwareness:-1}, reason:"Choosing the fun of the premise over the harder self-knowledge angle it opens up is a real, specific avoidance.", tradeoff:"Gains levity, at the cost of self-knowledge.", reveals:["Finds the lighter angle under pressure", "Follows a question rather than letting it go", "Doesn't examine their own reaction too closely"], tags:["playful","cautious"] },
      { text:"Ask only the animals you already trust, not strangers' pets", d:{trust:1,empathy:1,independence:1}, reason:"Being selective about whose honesty you're willing to hear shows trust matters more than raw information here.", tradeoff:"Gains closeness, at the cost of the self-knowledge the other path here would have offered instead.", reveals:["Gives someone the benefit of the doubt", "Reads the emotional stakes before acting", "Chooses self-reliance over relying on others"], tags:["loyal","cautious"] } ]},
  { id:"f14", text:"You're handed the aux cord at a party full of people whose taste you don't know at all.", illustration:"star", type:"fun", tone:"playful", difficulty:"light", purpose:"Everyday social-risk read disguised as a trivial choice.", measures:["confidence","socialEnergy","risk"], validates:null, unlockConditions:{anyTags:["playful","bold"]},
    options:[
      { text:"Play something you genuinely love, taste be damned", d:{confidence:2,independence:1,risk:1}, reason:"Prioritizing authenticity over guaranteed crowd approval in a low-stakes but visible moment is a real confidence tell.", tradeoff:"Gains conviction, at the cost of the engagement the other path here would have offered instead.", reveals:["Backs their own judgment under pressure", "Trusts their own judgment over consensus", "Accepts uncertainty in exchange for upside"], tags:["bold","independent"] },
      { text:"Play the safest crowd-pleaser you can think of", d:{socialEnergy:1,adaptability:1,risk:-1}, reason:"Optimizing for group comfort over self-expression, even somewhere this trivial, reflects a genuine social-harmony default.", tradeoff:"Gains engagement, at the cost of upside.", reveals:["Draws energy from engaging with others", "Adjusts course rather than forcing a plan through", "Protects against a worse outcome over a better one"], tags:["pragmatist","warm"] },
      { text:"Hand it to someone else, you'd rather not be the one people judge", d:{socialEnergy:-1,independence:1,confidence:-1}, reason:"Declining a low-stakes spotlight moment entirely is a small but real data point about comfort with being watched.", tradeoff:"Gains autonomy, at the cost of engagement.", reveals:["Chooses distance over engagement", "Chooses self-reliance over relying on others", "Lets doubt slow down a decision"], tags:["cautious"] } ]},
  { id:"f15", text:"You can permanently trade your sense of humor for guaranteed, unshakeable confidence in everything you do.", illustration:"masks", type:"fun", tone:"light", difficulty:"medium", purpose:"Forces a tradeoff between two genuinely likeable traits rather than trait versus flaw.", measures:["humor","confidence","openMindedness"], validates:"confidence", unlockConditions:{anyTags:["playful","bold"]},
    options:[
      { text:"Take the trade, confidence opens more doors than humor ever has", d:{confidence:2,drive:1,humor:-2}, reason:"Willingly giving up something genuinely valued for a different, more instrumentally useful trait is a real priority signal.", tradeoff:"Gains conviction, at the cost of levity.", reveals:["Acts before being fully sure", "Takes the moment seriously rather than lightly", "Keeps moving rather than settling"], tags:["pragmatist","bold"] },
      { text:"Refuse, humor is too close to who you actually are to trade away", d:{humor:1,openMindedness:1,independence:1}, reason:"Protecting a trait purely because it feels core to identity, even against a strong incentive, shows real self-continuity matters more than optimization.", tradeoff:"Gains levity, at the cost of the conviction the other path here would have offered instead.", reveals:["Uses humor to navigate the moment", "Reconsiders a position when given a reason to", "Trusts their own judgment over consensus"], tags:["independent","loyal"] },
      { text:"Ask if you can trade only half, you'd rather not lose either fully", d:{planning:1,logic:1,drive:-1}, reason:"Trying to negotiate rather than accept the binary reveals discomfort with fully sacrificing either trait.", tradeoff:"Gains preparedness, at the cost of momentum.", reveals:["Structures uncertainty before acting", "Relies on logic over instinct", "Chooses ease over pushing further"], tags:["analytical","cautious"] } ]},
  { id:"f16", text:"You're told you can become fluent in any single subject overnight, but everyone will assume you've always known it, with no credit for the shortcut.", illustration:"lightbulb", type:"fun", tone:"light", difficulty:"medium", purpose:"Tests whether recognition or capability is the actual draw behind wanting to learn something.", measures:["curiosity","confidence","independence"], validates:null, unlockConditions:{anyTags:["curious","competitive"]},
    options:[
      { text:"Take it without hesitation, knowing it is worth more than being seen learning it", d:{curiosity:2,independence:1,drive:1}, reason:"Accepting zero credit in exchange for pure capability shows the knowledge itself is the actual goal.", tradeoff:"Gains insight, at the cost of the originality the other path here would have offered instead.", reveals:["Chooses exploration over certainty", "Trusts their own judgment over consensus", "Pushes toward the outcome even under resistance"], tags:["independent","curious"] },
      { text:"Take it, but pick something no one will ever think to test you on", d:{creativity:1,curiosity:1,risk:-1}, reason:"Hedging against the one risk of the offer, being caught out, shows a careful streak even inside a fantasy scenario.", tradeoff:"Gains originality, at the cost of upside.", reveals:["Builds a new option instead of picking a given one", "Follows a question rather than letting it go", "Chooses the safer, more certain path"], tags:["cautious","analytical"] },
      { text:"Turn it down, not getting credit for the effort would bother you more than you'd expect", d:{confidence:-1,responsibility:1,socialEnergy:1}, reason:"Admitting recognition matters enough to decline free mastery is an honest, slightly uncomfortable self-read.", tradeoff:"Gains accountability, at the cost of conviction.", reveals:["Lets doubt slow down a decision", "Accepts accountability without being asked", "Leans toward people rather than away from them"], tags:["reflective"] } ]},
  { id:"f17", text:"You get to design one new, completely useless holiday that everyone in the world has to celebrate.", illustration:"star", type:"fun", tone:"playful", difficulty:"light", purpose:"An open-ended creative prompt with zero constraints reveals what a person defaults to building.", measures:["creativity","kindness","humor"], validates:null, unlockConditions:{anyTags:["playful","warm"]},
    options:[
      { text:"A day where everyone has to tell one person something they usually don't say", d:{kindness:2,empathy:1,trust:1}, reason:"Defaulting to a holiday built around connection, unprompted, shows where your instincts go when nothing is required of you.", tradeoff:"Gains goodwill, at the cost of the levity the other path here would have offered instead.", reveals:["Chooses someone else's comfort over their own convenience", "Prioritizes how someone else is feeling", "Extends trust before it's fully earned"], tags:["warm","idealist"] },
      { text:"A day dedicated entirely to doing something ridiculous just because", d:{humor:2,openMindedness:1,adaptability:1}, reason:"Choosing pure absurdity over anything meaningful when given total freedom shows a genuine playful streak, not just a joke answer.", tradeoff:"Gains levity, at the cost of the goodwill the other path here would have offered instead.", reveals:["Finds the lighter angle under pressure", "Stays open to being wrong", "Changes approach when the situation shifts"], tags:["playful","adventurous"] },
      { text:"A day with no plans allowed at all, mandatory unstructured time", d:{independence:2,patience:1,discipline:-1}, reason:"Building a holiday around enforced stillness reveals how much unstructured time is actually valued.", tradeoff:"Gains autonomy, at the cost of consistency.", reveals:["Chooses self-reliance over relying on others", "Lets a situation play out before intervening", "Lets a standard slide when it's inconvenient"], tags:["independent","reflective"] } ]},
  { id:"f18", text:"You discover you can talk to your reflection, and it disagrees with a decision you're about to make.", illustration:"mirror", type:"fun", tone:"light", difficulty:"medium", purpose:"A literalized inner-conflict prompt reads how self-doubt actually gets handled.", measures:["confidence","selfAwareness","independence"], validates:"confidence", unlockConditions:{anyTags:["reflective","independent"]},
    options:[
      { text:"Hear it out, it might be voicing something you've been avoiding", d:{selfAwareness:2,openMindedness:1,confidence:-1}, reason:"Taking your own doubt seriously enough to actually pause is a real, if uncomfortable, form of self-awareness.", tradeoff:"Gains self-knowledge, at the cost of conviction.", reveals:["Names an uncomfortable truth about themselves", "Stays open to being wrong", "Lets doubt slow down a decision"], tags:["reflective","idealist"] },
      { text:"Thank it for the input and do what you were already planning", d:{confidence:2,independence:1,discipline:1}, reason:"Acknowledging the doubt without being moved by it shows conviction that holds even against your own second-guessing.", tradeoff:"Gains conviction, at the cost of the self-knowledge the other path here would have offered instead.", reveals:["Backs their own judgment under pressure", "Trusts their own judgment over consensus", "Holds a personal standard even without anyone watching"], tags:["bold","independent"] },
      { text:"Get oddly defensive about being questioned by your own reflection", d:{confidence:-1,emotionalStability:-1,selfAwareness:1}, reason:"Reacting emotionally to a literalized version of your own doubt is an honest, if unflattering, tell about how doubt actually lands on you.", tradeoff:"Gains self-knowledge, at the cost of conviction.", reveals:["Lets doubt slow down a decision", "Feels the disruption rather than absorbing it quietly", "Names an uncomfortable truth about themselves"], tags:["intense"] } ]},
  { id:"f19", text:"You can permanently remove the concept of boredom from your life, but you'll also lose the restlessness that pushes you to try new things.", illustration:"hourglass", type:"fun", tone:"light", difficulty:"medium", purpose:"Tests whether discomfort is understood as purely negative or as functionally useful.", measures:["curiosity","persistence","drive"], validates:null, unlockConditions:{anyTags:["curious","adventurous"]},
    options:[
      { text:"Keep the restlessness, it's uncomfortable but it's what moves you forward", d:{drive:2,persistence:1,resilience:1}, reason:"Choosing to keep a source of discomfort because of what it produces shows discomfort isn't automatically something to eliminate for you.", tradeoff:"Gains momentum, at the cost of the ease the other path here would have offered instead.", reveals:["Keeps moving rather than settling", "Sees something through past the easy stopping point", "Treats a setback as temporary"], tags:["idealist","adventurous"] },
      { text:"Take the trade, permanent contentment sounds like a good deal", d:{optimism:2,patience:1,drive:-1}, reason:"Willingly trading ambition for ease is a genuine, specific preference, not laziness.", tradeoff:"Gains ease, at the cost of momentum.", reveals:["Expects things to work out", "Lets a situation play out before intervening", "Chooses ease over pushing further"], tags:["pragmatist","independent"] },
      { text:"Try to find a version where you keep the drive but lose the discomfort", d:{creativity:1,logic:1,planning:1}, reason:"Refusing the binary and looking for a third option even in a hypothetical shows a habitual unwillingness to accept forced tradeoffs.", tradeoff:"Gains originality, at the cost of the momentum the other path here would have offered instead.", reveals:["Reaches for an unconventional solution", "Relies on logic over instinct", "Structures uncertainty before acting"], tags:["analytical","curious"] } ]},
  { id:"f20", text:"You're placed in a room with a button that does something completely unknown. No instructions, no context.", illustration:"key", type:"fun", tone:"light", difficulty:"light", purpose:"Pure novelty-versus-caution read with zero information to reason from.", measures:["risk","curiosity","patience"], validates:"risk", unlockConditions:{anyTags:["adventurous","cautious"]},
    options:[
      { text:"Press it immediately, unknown is more interesting than safe", d:{risk:2,curiosity:2,patience:-1}, reason:"Acting with zero information purely because the unknown is appealing is about as clean a risk-tolerance read as exists.", tradeoff:"Gains upside, at the cost of stability.", reveals:["Chooses the less certain, more interesting path", "Follows a question rather than letting it go", "Acts rather than waiting it out"], tags:["adventurous","bold"] },
      { text:"Look for any clue at all before deciding anything", d:{logic:2,patience:1,planning:1}, reason:"Refusing to act without any information at all, even under mild pressure to just do something, shows a real analytical default.", tradeoff:"Gains clarity, at the cost of the upside the other path here would have offered instead.", reveals:["Reasons through a situation before acting", "Lets a situation play out before intervening", "Prepares rather than improvising"], tags:["analytical","cautious"] },
      { text:"Leave it alone entirely, some things don't need pressing", d:{discipline:1,independence:1,risk:-2}, reason:"Declining the unknown outright, with no attempt to even investigate, is a stronger caution signal than simply hesitating.", tradeoff:"Gains consistency, at the cost of upside.", reveals:["Protects against a worse outcome over a better one", "Holds a personal standard even without anyone watching", "Trusts their own judgment over consensus"], tags:["cautious"] } ]},
  { id:"f21", text:"You get a single do-over on any embarrassing moment from your life, but you have to pick just one, forever.", illustration:"hourglass", type:"fun", tone:"light", difficulty:"medium", purpose:"Tests attachment to past mistakes versus acceptance, using a lighthearted frame.", measures:["emotionalStability","resilience","selfAwareness"], validates:null, unlockConditions:{anyTags:["reflective","cautious"]},
    options:[
      { text:"Pick the one that still makes you cringe the most, just to finally let it go", d:{emotionalStability:2,resilience:1,selfAwareness:1}, reason:"Spending your one do-over on relief rather than strategic gain shows how much unresolved embarrassment actually weighs on you.", tradeoff:"Gains composure, at the cost of the ease the other path here would have offered instead.", reveals:["Stays steady under pressure", "Recovers forward rather than dwelling", "Notices their own patterns in real time"], tags:["reflective","intense"] },
      { text:"Skip it, even the cringiest moments are part of how you got here", d:{resilience:2,optimism:1,openMindedness:1}, reason:"Turning down a genuinely free fix out of acceptance of your own history is a real, settled kind of self-regard.", tradeoff:"Gains forward motion, at the cost of the composure the other path here would have offered instead.", reveals:["Recovers forward rather than dwelling", "Frames setbacks as temporary", "Reconsiders a position when given a reason to"], tags:["independent","idealist"] },
      { text:"Pick a small one almost no one else even remembers", d:{selfAwareness:1,independence:1,confidence:-1}, reason:"Choosing a moment that mattered mostly to you, not the most socially damaging one, reveals private embarrassment weighs more than public ones.", tradeoff:"Gains self-knowledge, at the cost of conviction.", reveals:["Notices their own patterns in real time", "Trusts their own judgment over consensus", "Second-guesses their own read of a situation"], tags:["reflective"] } ]},
  ],

  everyday: [
  { id:"c01", text:"You're the first to arrive at a small gathering, and it's just you and someone you barely know for the next ten minutes.", illustration:"conversation", type:"everyday", tone:"light", difficulty:"light", purpose:"First read on social initiation style before anything else colors it.", measures:["socialEnergy","confidence","curiosity"], validates:"socialEnergy",
    options:[
      { text:"Start asking them real questions about themselves", d:{socialEnergy:2,curiosity:2,empathy:1}, reason:"Choosing to invest in a near-stranger under mild pressure signals genuine social appetite, not just tolerance.", tradeoff:"Gains engagement, at the cost of the flexibility the other path here would have offered instead.", reveals:["Leans toward people rather than away from them", "Follows a question rather than letting it go", "Reads the emotional stakes before acting"], tags:["warm","curious"] },
      { text:"Make it easy for both of you with some light small talk", d:{socialEnergy:1,adaptability:1,patience:1}, reason:"Small talk as a bridge rather than a real dive shows comfort with people without needing depth immediately.", tradeoff:"Gains engagement, at the cost of the insight the other path here would have offered instead.", reveals:["Leans toward people rather than away from them", "Changes approach when the situation shifts", "Lets a situation play out before intervening"], tags:["pragmatist"] },
      { text:"Check your phone and let the silence sit for a bit", d:{independence:2,socialEnergy:-1}, reason:"Choosing comfortable silence over forced effort under no real stakes reflects a genuine preference for solitude, not shyness.", tradeoff:"Gains autonomy, at the cost of engagement.", reveals:["Trusts their own judgment over consensus", "Draws energy from stepping back", "Chooses self-reliance over relying on others"], tags:["independent","cautious"] } ]},
  { id:"c04", text:"A friend asks you to review something they made and clearly hope you'll love it. You don't.", illustration:"scales", type:"everyday", tone:"serious", difficulty:"medium", purpose:"Classic honesty-versus-harmony fork, early and low-stakes enough to be a clean read.", measures:["trust","kindness","confidence"], validates:null,
    options:[
      { text:"Tell them exactly what you think, gently but plainly", d:{trust:2,confidence:1,kindness:-1}, reason:"Prioritizing their ability to actually improve over their feelings in the moment is a real, specific value trade, not just bluntness.", tradeoff:"Gains closeness, at the cost of goodwill.", reveals:["Extends trust before it's fully earned", "Backs their own judgment under pressure", "Chooses honesty or fairness over someone's comfort"], tags:["idealist","bold"] },
      { text:"Lead with what's working, and fold in the concerns carefully", d:{kindness:2,empathy:1,trust:1}, reason:"Delivering the same honest content but sequenced for how it lands shows care without sacrificing truth, a distinct path from either pure honesty or pure protection.", tradeoff:"Gains goodwill, at the cost of the conviction the other path here would have offered instead.", reveals:["Chooses someone else's comfort over their own convenience", "Prioritizes how someone else is feeling", "Extends trust before it's fully earned"], tags:["warm","pragmatist"] },
      { text:"Focus on encouragement and let the flaws go unmentioned", d:{kindness:2,trust:-1,empathy:1}, reason:"Choosing their comfort over their growth in this exact moment is a genuine, if costly, prioritization of the relationship over the work.", tradeoff:"Gains goodwill, at the cost of closeness.", reveals:["Softens a hard truth to protect someone", "Stays guarded rather than assuming good faith", "Reads the emotional stakes before acting"], tags:["loyal"] } ]},
  { id:"c05", text:"Your plans for tonight get cancelled last-minute, with zero warning.", illustration:"anchor", type:"everyday", tone:"light", difficulty:"light", purpose:"A minor, universal irritant with no real stakes — reveals baseline emotional reactivity.", measures:["emotionalStability","adaptability","optimism"], validates:"emotionalStability",
    options:[
      { text:"Shrug and immediately make a new plan for yourself", d:{adaptability:2,optimism:1,independence:1}, reason:"Converting a disruption into an opportunity with no visible friction shows genuinely low reactivity to minor setbacks.", tradeoff:"Gains flexibility, at the cost of the self-knowledge the other path here would have offered instead.", reveals:["Adjusts course rather than forcing a plan through", "Frames setbacks as temporary", "Trusts their own judgment over consensus"], tags:["pragmatist","independent"] },
      { text:"Feel disproportionately annoyed about it for longer than it deserves", d:{emotionalStability:-1,selfAwareness:1}, reason:"Noticing the reaction outsizes the event is itself a real, honest signal about emotional volatility under trivial stress.", tradeoff:"Gains self-knowledge, at the cost of composure.", reveals:["Lets the moment's weight actually register", "Notices their own patterns in real time", "Feels the disruption rather than absorbing it quietly"], tags:["intense"] },
      { text:"Text them back something a little sharper than you meant to", d:{confidence:1,patience:-1,socialEnergy:-1}, reason:"Letting minor frustration leak into the response rather than absorbing it reflects a lower patience threshold under small provocations.", tradeoff:"Gains conviction, at the cost of stability.", reveals:["Acts before being fully sure", "Acts rather than waiting it out", "Chooses distance over engagement"], tags:["bold"] } ]},
  { id:"c08", text:"Someone you're close to keeps making the same mistake, and it's starting to affect you too.", illustration:"puzzle", type:"everyday", tone:"serious", difficulty:"medium", purpose:"Distinguishes conflict-avoidance from genuine patience under recurring, personal cost.", measures:["patience","leadership","trust"], validates:"patience",
    options:[
      { text:"Say directly that this pattern needs to change, now", d:{leadership:2,confidence:1,patience:-1}, reason:"Naming a repeated pattern plainly, rather than the single incident, requires confidence that the relationship can survive direct pressure.", tradeoff:"Gains control, at the cost of stability.", reveals:["Takes the lead without being asked", "Acts before being fully sure", "Acts rather than waiting it out"], tags:["bold","idealist"] },
      { text:"Bring it up carefully, focused on how it's affecting you specifically", d:{empathy:1,trust:1,leadership:1}, reason:"Framing it around impact rather than blame is a distinct strategy from confrontation, aimed at preserving the relationship while still changing something.", tradeoff:"Gains connection, at the cost of the conviction the other path here would have offered instead.", reveals:["Reads the emotional stakes before acting", "Gives someone the benefit of the doubt", "Takes the lead without being asked"], tags:["warm","pragmatist"] },
      { text:"Keep absorbing it and hope it resolves on its own", d:{patience:2,independence:-1,emotionalStability:-1}, reason:"Continuing to carry a cost you've already named as real, rather than raising it, is a genuine and specific tolerance for friction over confrontation.", tradeoff:"Gains stability, at the cost of autonomy.", reveals:["Lets a situation play out before intervening", "Chooses connection or reliance over going it alone", "Feels the disruption rather than absorbing it quietly"], tags:["loyal","cautious"] } ]},
  { id:"c12", text:"An unfamiliar problem lands on you with no instructions and no one to ask.", illustration:"maze", type:"everyday", tone:"light", difficulty:"medium", purpose:"Reads default problem-solving posture under genuine uncertainty, not simulated novelty.", measures:["logic","creativity","resilience"], validates:null,
    options:[
      { text:"Break it into smaller pieces and work through them one at a time", d:{logic:2,planning:1,discipline:1}, reason:"Imposing structure on genuine uncertainty rather than improvising shows a systemic default under pressure.", tradeoff:"Gains clarity, at the cost of the flexibility the other path here would have offered instead.", reveals:["Relies on logic over instinct", "Structures uncertainty before acting", "Holds a personal standard even without anyone watching"], tags:["analytical","pragmatist"] },
      { text:"Just start trying things and adjust based on what happens", d:{creativity:1,risk:1,adaptability:2}, reason:"Choosing action over analysis when no clear path exists reveals comfort with uncertainty itself.", tradeoff:"Gains flexibility, at the cost of the clarity the other path here would have offered instead.", reveals:["Changes approach when the situation shifts", "Builds a new option instead of picking a given one", "Chooses the less certain, more interesting path"], tags:["adventurous","curious"] },
      { text:"Sit with it a while before touching anything", d:{patience:2,logic:1,resilience:1}, reason:"Resisting the urge to act immediately under pressure to look productive is a specific, deliberate form of composure.", tradeoff:"Gains stability, at the cost of the preparedness the other path here would have offered instead.", reveals:["Tolerates discomfort rather than forcing resolution", "Relies on logic over instinct", "Recovers forward rather than dwelling"], tags:["reflective","cautious"] } ]},
  { id:"c15", text:"A stranger stops you and asks for directions somewhere you don't actually know well.", illustration:"compass", type:"everyday", tone:"light", difficulty:"light", purpose:"Closing core question: low-stakes helpfulness-versus-honesty read to end on a light, revealing note.", measures:["kindness","confidence","trust"], validates:"kindness",
    options:[
      { text:"Admit you're not sure, and try to help them figure it out anyway", d:{kindness:2,trust:1,openMindedness:1}, reason:"Staying engaged after admitting uncertainty, rather than disengaging, shows the helping impulse outlasts the ego cost of not knowing.", tradeoff:"Gains goodwill, at the cost of the clarity the other path here would have offered instead.", reveals:["Chooses someone else's comfort over their own convenience", "Extends trust before it's fully earned", "Reconsiders a position when given a reason to"], tags:["warm","pragmatist"] },
      { text:"Point them toward someone or something more likely to actually know", d:{logic:1,kindness:1,planning:1}, reason:"Redirecting to a better source rather than guessing or walking away is a distinct, efficiency-first form of helpfulness.", tradeoff:"Gains clarity, at the cost of the closeness the other path here would have offered instead.", reveals:["Reasons through a situation before acting", "Softens a hard truth to protect someone", "Prepares rather than improvising"], tags:["analytical"] },
      { text:"Take a guess with more confidence than you actually have", d:{confidence:1,trust:-1,risk:1}, reason:"Prioritizing seeming useful over being accurate, even for a stranger you'll never see again, is a small but real and specific choice.", tradeoff:"Gains conviction, at the cost of closeness.", reveals:["Backs their own judgment under pressure", "Withholds trust until it's proven", "Accepts uncertainty in exchange for upside"], tags:["bold"] } ]},
  { id:"e01", text:"You're in line and the person ahead of you is undercharged by the register, and doesn't notice.", illustration:"scales", type:"everyday", tone:"light", difficulty:"light", purpose:"A small, victimless-seeming honesty test with no one watching.", measures:["responsibility","discipline","independence"], validates:"responsibility", unlockConditions:{anyTags:["idealist","analytical"]},
    options:[
      { text:"Point it out to the cashier before they leave", d:{responsibility:2,discipline:1,trust:1}, reason:"Correcting an error that costs a stranger nothing to ignore shows the standard applies even when no one's checking.", tradeoff:"Gains accountability, at the cost of the autonomy the other path here would have offered instead.", reveals:["Accepts accountability without being asked", "Follows through on principle rather than convenience", "Gives someone the benefit of the doubt"], tags:["idealist"] },
      { text:"Say nothing, it's not really your problem to fix", d:{independence:1,responsibility:-1}, reason:"Letting a minor, harmless error slide when it isn't yours to manage reflects where you draw the line on responsibility.", tradeoff:"Gains autonomy, at the cost of accountability.", reveals:["Trusts their own judgment over consensus", "Lets responsibility sit with someone else", "Chooses self-reliance over relying on others"], tags:["pragmatist","independent"] },
      { text:"Mention it to your own cashier instead, just to be safe on your end", d:{discipline:1,planning:1,independence:1}, reason:"Redirecting concern to your own transaction rather than a stranger's shows responsibility scoped tightly to what's actually yours.", tradeoff:"Gains consistency, at the cost of the accountability the other path here would have offered instead.", reveals:["Follows through on principle rather than convenience", "Prepares rather than improvising", "Chooses self-reliance over relying on others"], tags:["cautious","pragmatist"] } ]},
  { id:"e02", text:"You're deep into a task when someone interrupts with something that could clearly wait.", illustration:"anchor", type:"everyday", tone:"light", difficulty:"light", purpose:"Reads patience and boundary-setting under a minor, common irritation.", measures:["patience","discipline","kindness"], validates:"patience", unlockConditions:{anyTags:["analytical","independent"]},
    options:[
      { text:"Stop and give them your full attention anyway", d:{kindness:2,patience:1,discipline:-1}, reason:"Sacrificing your own momentum for someone else's non-urgent need, every time, is a real and costly kindness default.", tradeoff:"Gains goodwill, at the cost of consistency.", reveals:["Softens a hard truth to protect someone", "Lets a situation play out before intervening", "Lets a standard slide when it's inconvenient"], tags:["warm","loyal"] },
      { text:"Ask them to give you a few minutes to finish first", d:{discipline:2,planning:1,confidence:1}, reason:"Protecting your own focus while still committing to respond shows boundaries that don't require conflict.", tradeoff:"Gains consistency, at the cost of the goodwill the other path here would have offered instead.", reveals:["Holds a personal standard even without anyone watching", "Structures uncertainty before acting", "Backs their own judgment under pressure"], tags:["pragmatist","independent"] },
      { text:"Answer quickly but stay visibly a little short about it", d:{patience:-1,confidence:1,socialEnergy:-1}, reason:"Letting mild irritation show rather than fully masking it is an honest, if less polished, reaction to boundary pressure.", tradeoff:"Gains conviction, at the cost of stability.", reveals:["Acts rather than waiting it out", "Acts before being fully sure", "Chooses distance over engagement"], tags:["bold"] } ]},
  { id:"e03", text:"You lend something to a friend and it comes back damaged, with no explanation offered.", illustration:"anchor", type:"everyday", tone:"serious", difficulty:"medium", purpose:"Distinguishes assertiveness from conflict-avoidance under a concrete, personal cost.", measures:["confidence","trust","patience"], validates:"confidence", unlockConditions:{anyTags:["bold","loyal"]},
    options:[
      { text:"Ask directly what happened, it's a fair question", d:{confidence:2,trust:-1,leadership:1}, reason:"Asking outright, even knowing it might feel like an accusation, shows the need for an answer outweighs the discomfort of asking.", tradeoff:"Gains conviction, at the cost of closeness.", reveals:["Backs their own judgment under pressure", "Withholds trust until it's proven", "Steps into the gap when no one else will"], tags:["bold","idealist"] },
      { text:"Let it go, the friendship is worth more than the object", d:{kindness:2,patience:1,independence:-1}, reason:"Explicitly weighing the relationship against the loss and choosing the relationship is a real, specific tradeoff, not passivity.", tradeoff:"Gains goodwill, at the cost of autonomy.", reveals:["Softens a hard truth to protect someone", "Lets a situation play out before intervening", "Chooses connection or reliance over going it alone"], tags:["warm","loyal"] },
      { text:"Mention it lightly, half-joking, to leave them an easy opening", d:{empathy:1,humor:1,confidence:1}, reason:"Choosing an indirect approach that still raises the issue shows a preference for low-conflict resolution over silence or confrontation.", tradeoff:"Gains connection, at the cost of the control the other path here would have offered instead.", reveals:["Prioritizes how someone else is feeling", "Uses humor to navigate the moment", "Backs their own judgment under pressure"], tags:["pragmatist","warm"] } ]},
  { id:"e04", text:"You're asked to help with something you have zero experience in, on short notice.", illustration:"puzzle", type:"everyday", tone:"light", difficulty:"light", purpose:"Reads default reaction to being asked to operate outside competence.", measures:["confidence","adaptability","responsibility"], validates:null, unlockConditions:{anyTags:["pragmatist","bold"]},
    options:[
      { text:"Say yes and figure it out as you go", d:{confidence:2,adaptability:1,risk:1}, reason:"Committing before you're sure you can deliver shows real comfort with visible risk of failure.", tradeoff:"Gains conviction, at the cost of the accountability the other path here would have offered instead.", reveals:["Acts before being fully sure", "Changes approach when the situation shifts", "Chooses the less certain, more interesting path"], tags:["bold","adventurous"] },
      { text:"Say yes, but ask for help from someone who actually knows it", d:{responsibility:1,socialEnergy:1,planning:1}, reason:"Accepting the responsibility while openly seeking support shows confidence doesn't require pretending to already know.", tradeoff:"Gains accountability, at the cost of the conviction the other path here would have offered instead.", reveals:["Takes ownership even when it costs them", "Draws energy from engaging with others", "Structures uncertainty before acting"], tags:["pragmatist","warm"] },
      { text:"Be upfront that you're not the right person for this", d:{selfAwareness:2,responsibility:1,confidence:-1}, reason:"Declining clearly, even at the cost of seeming less capable, protects the outcome over your own image.", tradeoff:"Gains self-knowledge, at the cost of conviction.", reveals:["Notices their own patterns in real time", "Takes ownership even when it costs them", "Second-guesses their own read of a situation"], tags:["cautious","idealist"] } ]},
  { id:"e05", text:"A routine you've followed for a long time stops working the way it used to.", illustration:"hourglass", type:"everyday", tone:"light", difficulty:"light", purpose:"Tests attachment to habit versus willingness to abandon a familiar system.", measures:["adaptability","discipline","openMindedness"], validates:"adaptability", unlockConditions:{anyTags:["pragmatist","curious"]},
    options:[
      { text:"Overhaul it completely and try something new", d:{adaptability:2,openMindedness:1,creativity:1}, reason:"Abandoning a long routine at the first real sign it's failing shows low attachment to habit for its own sake.", tradeoff:"Gains flexibility, at the cost of the stability the other path here would have offered instead.", reveals:["Adjusts course rather than forcing a plan through", "Reconsiders a position when given a reason to", "Reaches for an unconventional solution"], tags:["adventurous","curious"] },
      { text:"Tweak it slightly and give it more time first", d:{patience:2,discipline:1,planning:1}, reason:"Preferring incremental adjustment over overhaul reflects real investment in what's already been built.", tradeoff:"Gains stability, at the cost of the flexibility the other path here would have offered instead.", reveals:["Lets a situation play out before intervening", "Follows through on principle rather than convenience", "Prepares rather than improvising"], tags:["pragmatist","cautious"] },
      { text:"Keep doing it exactly the same, it'll probably sort itself out", d:{discipline:1,persistence:1,adaptability:-1}, reason:"Sticking with a visibly failing routine anyway is a genuine, specific resistance to change, not just inertia.", tradeoff:"Gains consistency, at the cost of flexibility.", reveals:["Holds a personal standard even without anyone watching", "Keeps going after the initial effort stops paying off", "Holds the original plan despite new information"], tags:["independent"] } ]},
  { id:"e06", text:"You're most of the way through something slow and tedious when you realize there was a much easier way to do it, and there's no time left to start over properly.", illustration:"maze", type:"everyday", tone:"light", difficulty:"light", purpose:"Tests reaction to wasted effort: sunk cost versus pure forward optimization.", measures:["logic","emotionalStability","persistence"], validates:null, unlockConditions:{anyTags:["analytical","pragmatist"]},
    options:[
      { text:"Switch immediately, no point finishing the slow way now", d:{logic:2,adaptability:1,persistence:-1}, reason:"Abandoning invested effort the moment a better path appears shows low sunk-cost attachment.", tradeoff:"Gains clarity, at the cost of follow-through.", reveals:["Reasons through a situation before acting", "Changes approach when the situation shifts", "Knows when to stop rather than pushing further"], tags:["analytical","pragmatist"] },
      { text:"Finish this one the old way, then switch for next time", d:{discipline:2,persistence:1,planning:1}, reason:"Finishing what you started even knowing it's inefficient shows completion matters more than optimization mid-task.", tradeoff:"Gains consistency, at the cost of the clarity the other path here would have offered instead.", reveals:["Holds a personal standard even without anyone watching", "Keeps going after the initial effort stops paying off", "Structures uncertainty before acting"], tags:["independent","pragmatist"] },
      { text:"Feel a little annoyed at yourself for not catching it sooner", d:{selfAwareness:1,emotionalStability:-1,confidence:-1}, reason:"Letting a minor inefficiency actually bother you, rather than shrugging it off, is a real, specific reactivity signal.", tradeoff:"Gains self-knowledge, at the cost of composure.", reveals:["Notices their own patterns in real time", "Lets the moment's weight actually register", "Second-guesses their own read of a situation"], tags:["reflective","intense"] } ]},
  { id:"e07", text:"Someone consistently shows up late to things you organize, without ever really apologizing for it.", illustration:"hourglass", type:"everyday", tone:"serious", difficulty:"medium", purpose:"Recurring, low-grade disrespect tests the threshold for calling something out.", measures:["patience","leadership","trust"], validates:"patience", unlockConditions:{anyTags:["bold","loyal"]},
    options:[
      { text:"Say something directly the next time it happens", d:{leadership:2,confidence:1,patience:-1}, reason:"Naming a pattern rather than continuing to absorb it individually shows a real limit to your patience threshold.", tradeoff:"Gains control, at the cost of stability.", reveals:["Takes the lead without being asked", "Acts before being fully sure", "Acts rather than waiting it out"], tags:["bold","idealist"] },
      { text:"Start planning around it quietly instead of confronting it", d:{planning:2,adaptability:1,independence:1}, reason:"Adjusting your own behavior rather than raising the issue is a real, specific strategy: solve it yourself rather than through them.", tradeoff:"Gains preparedness, at the cost of the control the other path here would have offered instead.", reveals:["Structures uncertainty before acting", "Adjusts course rather than forcing a plan through", "Trusts their own judgment over consensus"], tags:["pragmatist","independent"] },
      { text:"Keep letting it go, it's not worth the tension over something small", d:{patience:2,kindness:1,confidence:-1}, reason:"Continuing to absorb a recurring cost specifically to avoid conflict is a genuine, if costly, conflict-avoidance pattern.", tradeoff:"Gains stability, at the cost of conviction.", reveals:["Lets a situation play out before intervening", "Softens a hard truth to protect someone", "Lets doubt slow down a decision"], tags:["loyal","cautious"] } ]},
  { id:"e08", text:"You're given feedback on something you worked hard on, and it's more critical than you expected.", illustration:"scales", type:"everyday", tone:"serious", difficulty:"medium", purpose:"Tests emotional processing of criticism against actual effort invested.", measures:["resilience","emotionalStability","openMindedness"], validates:"resilience", unlockConditions:{anyTags:["reflective","idealist"]},
    options:[
      { text:"Take it in and start figuring out what to actually change", d:{resilience:2,openMindedness:1,discipline:1}, reason:"Moving straight to action on hard feedback, without a visible sting first, shows a genuinely low ego-defense response.", tradeoff:"Gains forward motion, at the cost of the self-knowledge the other path here would have offered instead.", reveals:["Treats a setback as temporary", "Stays open to being wrong", "Follows through on principle rather than convenience"], tags:["idealist","pragmatist"] },
      { text:"Feel it sting for a while before you're able to use it", d:{emotionalStability:-1,selfAwareness:1,resilience:1}, reason:"Admitting the sting rather than performing immediate acceptance is an honest, specific emotional read.", tradeoff:"Gains self-knowledge, at the cost of composure.", reveals:["Lets the moment's weight actually register", "Notices their own patterns in real time", "Recovers forward rather than dwelling"], tags:["reflective","intense"] },
      { text:"Push back on the parts you don't think are fair", d:{confidence:2,logic:1,openMindedness:-1}, reason:"Contesting feedback rather than absorbing it outright shows real confidence in your own judgment under challenge.", tradeoff:"Gains conviction, at the cost of room to be wrong.", reveals:["Acts before being fully sure", "Reasons through a situation before acting", "Holds a position rather than reconsidering it"], tags:["bold","independent"] } ]},
  { id:"e09", text:"You have a full day planned, and a close friend calls needing to talk through something hard, right now.", illustration:"heart", type:"everyday", tone:"serious", difficulty:"medium", purpose:"Direct conflict between personal plans and someone else's real need.", measures:["kindness","planning","independence"], validates:"kindness", unlockConditions:{anyTags:["warm","loyal"]},
    options:[
      { text:"Drop everything, the plan can be rebuilt later", d:{kindness:2,adaptability:1,planning:-1}, reason:"Sacrificing a full day's structure for someone's immediate need shows people consistently outrank your own schedule.", tradeoff:"Gains goodwill, at the cost of preparedness.", reveals:["Chooses someone else's comfort over their own convenience", "Adjusts course rather than forcing a plan through", "Improvises rather than preparing"], tags:["warm","loyal"] },
      { text:"Make time for a real conversation, but keep it to a set window", d:{planning:1,empathy:1,discipline:1}, reason:"Protecting some of your day while still being fully present shows care doesn't require total self-sacrifice.", tradeoff:"Gains preparedness, at the cost of the goodwill the other path here would have offered instead.", reveals:["Structures uncertainty before acting", "Prioritizes how someone else is feeling", "Holds a personal standard even without anyone watching"], tags:["pragmatist","warm"] },
      { text:"Offer a proper time later today instead of right now", d:{planning:2,independence:1,empathy:-1}, reason:"Holding your plan and offering a later slot, even for something hard, shows your own structure carries real weight for you.", tradeoff:"Gains preparedness, at the cost of connection.", reveals:["Structures uncertainty before acting", "Trusts their own judgment over consensus", "Prioritizes the outcome over someone's feelings"], tags:["independent","analytical"] } ]},
  { id:"e10", text:"You notice you're the only one in a group who actually read the details before a decision gets made.", illustration:"puzzle", type:"everyday", tone:"light", difficulty:"light", purpose:"Tests whether being the informed one prompts leadership or quiet frustration.", measures:["leadership","responsibility","patience"], validates:null, unlockConditions:{anyTags:["analytical","bold"]},
    options:[
      { text:"Speak up and walk everyone through what actually matters here", d:{leadership:2,responsibility:1,confidence:1}, reason:"Stepping in to fix an information gap the group doesn't even know exists shows initiative that doesn't wait to be asked.", tradeoff:"Gains control, at the cost of the preparedness the other path here would have offered instead.", reveals:["Takes the lead without being asked", "Accepts accountability without being asked", "Acts before being fully sure"], tags:["bold","analytical"] },
      { text:"Quietly flag the one or two most important details, nothing more", d:{planning:1,discipline:1,patience:1}, reason:"Choosing minimal, targeted correction over a full takeover shows restraint even when you clearly know more.", tradeoff:"Gains preparedness, at the cost of the control the other path here would have offered instead.", reveals:["Structures uncertainty before acting", "Holds a personal standard even without anyone watching", "Tolerates discomfort rather than forcing resolution"], tags:["pragmatist","cautious"] },
      { text:"Let the group decide and mention the details only if it goes wrong", d:{patience:2,independence:1,responsibility:-1}, reason:"Withholding relevant information you have, specifically to avoid taking over, is a genuine, if costly, deference.", tradeoff:"Gains stability, at the cost of accountability.", reveals:["Tolerates discomfort rather than forcing resolution", "Trusts their own judgment over consensus", "Lets responsibility sit with someone else"], tags:["independent"] } ]},
  { id:"e11", text:"You catch yourself about to repeat a story you've definitely already told this same person before.", illustration:"mirror", type:"everyday", tone:"light", difficulty:"light", purpose:"Tiny, universal social-awareness moment with an easy escape either way.", measures:["selfAwareness","socialEnergy","humor"], validates:null, unlockConditions:{anyTags:["reflective","playful"]},
    options:[
      { text:"Call it out yourself before they have to", d:{selfAwareness:2,humor:1,confidence:1}, reason:"Naming your own repetition before anyone else does costs a little ego but shows you're tracking the interaction closely.", tradeoff:"Gains self-knowledge, at the cost of the engagement the other path here would have offered instead.", reveals:["Notices their own patterns in real time", "Uses humor to navigate the moment", "Backs their own judgment under pressure"], tags:["reflective","bold"] },
      { text:"Just tell it anyway, a good story earns a repeat", d:{confidence:1,socialEnergy:1,selfAwareness:-1}, reason:"Not being bothered by repeating yourself reflects low self-monitoring in low-stakes social moments.", tradeoff:"Gains conviction, at the cost of self-knowledge.", reveals:["Backs their own judgment under pressure", "Draws energy from engaging with others", "Doesn't examine their own reaction too closely"], tags:["independent","playful"] },
      { text:"Catch yourself mid-sentence and awkwardly pivot", d:{selfAwareness:1,emotionalStability:-1,socialEnergy:-1}, reason:"The visible scramble to redirect shows real-time self-monitoring winning out, even clumsily, over just continuing.", tradeoff:"Gains self-knowledge, at the cost of composure.", reveals:["Names an uncomfortable truth about themselves", "Feels the disruption rather than absorbing it quietly", "Chooses distance over engagement"], tags:["cautious"] } ]},
  { id:"e12", text:"You're asked your honest opinion on a decision that's already been made and can't be changed.", illustration:"scales", type:"everyday", tone:"light", difficulty:"light", purpose:"Reads honesty when it has literally no practical use, only social cost or relief.", measures:["trust","kindness","confidence"], validates:"trust", unlockConditions:{anyTags:["idealist","warm"]},
    options:[
      { text:"Give your real opinion, it's already done but honesty still matters", d:{trust:2,confidence:1,kindness:-1}, reason:"Choosing candor even where it can't change anything shows honesty is valued for its own sake, not just its usefulness.", tradeoff:"Gains closeness, at the cost of goodwill.", reveals:["Gives someone the benefit of the doubt", "Acts before being fully sure", "Chooses honesty or fairness over someone's comfort"], tags:["idealist","bold"] },
      { text:"Focus on the positives since there's nothing to be gained from criticizing now", d:{kindness:2,optimism:1,trust:-1}, reason:"Withholding a now-useless criticism to spare feelings, specifically because it can't help anymore, is a deliberate kindness calculation.", tradeoff:"Gains goodwill, at the cost of closeness.", reveals:["Chooses someone else's comfort over their own convenience", "Frames setbacks as temporary", "Withholds trust until it's proven"], tags:["warm","pragmatist"] },
      { text:"Say you're glad it's settled and leave your real opinion out of it entirely", d:{independence:1,patience:1,trust:-1}, reason:"Declining to even engage with the question shows a preference for staying neutral once a decision is locked in.", tradeoff:"Gains autonomy, at the cost of closeness.", reveals:["Chooses self-reliance over relying on others", "Lets a situation play out before intervening", "Stays guarded rather than assuming good faith"], tags:["cautious","independent"] } ]},
  { id:"e13", text:"You're given more praise than you think you actually deserve for something.", illustration:"star", type:"everyday", tone:"light", difficulty:"light", purpose:"Reads honesty-about-self under a flattering, low-cost incentive to just accept it.", measures:["selfAwareness","confidence","responsibility"], validates:"selfAwareness", unlockConditions:{anyTags:["idealist","reflective"]},
    options:[
      { text:"Gently correct it and give proper credit to what actually helped", d:{selfAwareness:2,responsibility:1,confidence:-1}, reason:"Turning down excess praise you didn't fully earn, when accepting it costs nothing, shows accuracy matters over flattering ease.", tradeoff:"Gains self-knowledge, at the cost of conviction.", reveals:["Notices their own patterns in real time", "Takes ownership even when it costs them", "Second-guesses their own read of a situation"], tags:["idealist","reflective"] },
      { text:"Accept it graciously and move on", d:{confidence:1,socialEnergy:1,selfAwareness:-1}, reason:"Taking praise at face value without correcting it reflects comfort with a flattering read standing uncorrected.", tradeoff:"Gains conviction, at the cost of self-knowledge.", reveals:["Backs their own judgment under pressure", "Draws energy from engaging with others", "Doesn't examine their own reaction too closely"], tags:["pragmatist"] },
      { text:"Feel oddly uncomfortable but not sure how to say so without it being weird", d:{selfAwareness:1,socialEnergy:-1,confidence:-1}, reason:"Noticing the discomfort but not acting on it shows a gap between self-awareness and the confidence to act on it socially.", tradeoff:"Gains self-knowledge, at the cost of engagement.", reveals:["Notices their own patterns in real time", "Draws energy from stepping back", "Second-guesses their own read of a situation"], tags:["cautious"] } ]},
  { id:"e14", text:"You're the one person in a group who has to deliver bad news that isn't your fault, but will land on you anyway.", illustration:"scales", type:"everyday", tone:"serious", difficulty:"medium", purpose:"Tests willingness to absorb unfair social cost for the sake of the group.", measures:["responsibility","confidence","resilience"], validates:null, unlockConditions:{anyTags:["bold","loyal"]},
    options:[
      { text:"Deliver it straightforwardly and let the reaction land where it lands", d:{confidence:2,responsibility:1,resilience:1}, reason:"Accepting an unfair blast radius without deflecting it elsewhere shows willingness to absorb cost for the group's sake.", tradeoff:"Gains conviction, at the cost of the closeness the other path here would have offered instead.", reveals:["Acts before being fully sure", "Accepts accountability without being asked", "Treats a setback as temporary"], tags:["bold","idealist"] },
      { text:"Be upfront that this wasn't your call before explaining it", d:{responsibility:1,trust:1,confidence:1}, reason:"Protecting your own record while still delivering the message shows fairness to yourself matters alongside the task.", tradeoff:"Gains accountability, at the cost of the forward motion the other path here would have offered instead.", reveals:["Takes ownership even when it costs them", "Extends trust before it's fully earned", "Backs their own judgment under pressure"], tags:["pragmatist","analytical"] },
      { text:"Find a way to have someone else deliver it instead", d:{independence:1,planning:1,responsibility:-1}, reason:"Redirecting an unfair burden rather than absorbing it, when you actually can, is a real and specific self-protective instinct.", tradeoff:"Gains autonomy, at the cost of accountability.", reveals:["Trusts their own judgment over consensus", "Structures uncertainty before acting", "Lets responsibility sit with someone else"], tags:["cautious","independent"] } ]},
  { id:"e15", text:"A plan you're excited about depends on someone else, and they keep pushing the timeline back.", illustration:"hourglass", type:"everyday", tone:"light", difficulty:"medium", purpose:"Tests patience and control-need under a delay outside your influence.", measures:["patience","leadership","independence"], validates:"patience", unlockConditions:{anyTags:["independent","analytical"]},
    options:[
      { text:"Set a real deadline and be direct about needing it kept", d:{leadership:2,confidence:1,patience:-1}, reason:"Imposing structure on someone else's delay shows low tolerance for open-ended waiting.", tradeoff:"Gains control, at the cost of stability.", reveals:["Takes the lead without being asked", "Acts before being fully sure", "Acts rather than waiting it out"], tags:["bold","analytical"] },
      { text:"Find a version of the plan that doesn't depend on their timing", d:{independence:2,creativity:1,adaptability:1}, reason:"Rerouting around the dependency entirely, rather than pushing on it, shows a preference for control over persuasion.", tradeoff:"Gains autonomy, at the cost of the control the other path here would have offered instead.", reveals:["Trusts their own judgment over consensus", "Reaches for an unconventional solution", "Adjusts course rather than forcing a plan through"], tags:["independent","pragmatist"] },
      { text:"Let it slide and adjust your own expectations instead", d:{patience:2,adaptability:1,drive:-1}, reason:"Absorbing someone else's delay without pushing back reflects genuine tolerance for things outside your control.", tradeoff:"Gains stability, at the cost of momentum.", reveals:["Lets a situation play out before intervening", "Changes approach when the situation shifts", "Chooses ease over pushing further"], tags:["cautious","loyal"] } ]},
  { id:"e16", text:"You're mid-decision on something small when you notice you're overthinking it far more than it deserves.", illustration:"maze", type:"everyday", tone:"light", difficulty:"light", purpose:"Tests self-regulation once excessive deliberation is actually noticed in real time.", measures:["discipline","selfAwareness","confidence"], validates:null, unlockConditions:{anyTags:["analytical","reflective"]},
    options:[
      { text:"Force yourself to just pick one and move on", d:{discipline:2,confidence:1,planning:-1}, reason:"Cutting off deliberation on purpose, once you notice it's disproportionate, shows real self-regulation rather than just drifting into a decision.", tradeoff:"Gains consistency, at the cost of preparedness.", reveals:["Follows through on principle rather than convenience", "Acts before being fully sure", "Improvises rather than preparing"], tags:["pragmatist","bold"] },
      { text:"Let yourself keep weighing it, it clearly matters enough to you", d:{patience:1,persistence:1,discipline:-1}, reason:"Continuing to deliberate even after noticing the excess reveals how much small decisions genuinely weigh on you.", tradeoff:"Gains stability, at the cost of consistency.", reveals:["Lets a situation play out before intervening", "Sees something through past the easy stopping point", "Lets a standard slide when it's inconvenient"], tags:["reflective","cautious"] },
      { text:"Ask someone else to just decide for you", d:{independence:-1,socialEnergy:1,confidence:-1}, reason:"Handing the decision off rather than resolving it yourself, even for something small, is a real and specific choice about where effort goes.", tradeoff:"Gains engagement, at the cost of autonomy.", reveals:["Chooses connection or reliance over going it alone", "Leans toward people rather than away from them", "Lets doubt slow down a decision"], tags:["warm"] } ]},
  { id:"e17", text:"You're complimented on something you didn't actually put much effort into, while something you worked hard on goes unnoticed.", illustration:"star", type:"everyday", tone:"light", difficulty:"light", purpose:"Tests whether recognition or personal standards matter more when they diverge.", measures:["confidence","selfAwareness","responsibility"], validates:null, unlockConditions:{anyTags:["independent","idealist"]},
    options:[
      { text:"Let it go, you know what actually took the effort", d:{independence:2,confidence:1,selfAwareness:1}, reason:"Being unbothered when recognition and effort don't line up shows your own standard matters more than external validation.", tradeoff:"Gains autonomy, at the cost of the closeness the other path here would have offered instead.", reveals:["Chooses self-reliance over relying on others", "Acts before being fully sure", "Names an uncomfortable truth about themselves"], tags:["independent","idealist"] },
      { text:"Mention, lightly, which one actually took the real work", d:{confidence:1,trust:1,socialEnergy:1}, reason:"Correcting the record instead of just accepting the mismatch shows recognition does matter to you, even if gently pursued.", tradeoff:"Gains conviction, at the cost of the autonomy the other path here would have offered instead.", reveals:["Acts before being fully sure", "Gives someone the benefit of the doubt", "Leans toward people rather than away from them"], tags:["pragmatist"] },
      { text:"Feel quietly bothered by it for longer than you'd like to admit", d:{selfAwareness:1,emotionalStability:-1,confidence:-1}, reason:"Admitting it lingers, rather than claiming total indifference, is an honest read on how much recognition actually matters.", tradeoff:"Gains self-knowledge, at the cost of composure.", reveals:["Names an uncomfortable truth about themselves", "Feels the disruption rather than absorbing it quietly", "Lets doubt slow down a decision"], tags:["reflective"] } ]},
  { id:"e18", text:"You're halfway through explaining something when you realize the other person already understood it minutes ago.", illustration:"mirror", type:"everyday", tone:"light", difficulty:"light", purpose:"Small, universal awkwardness read on self-monitoring speed.", measures:["selfAwareness","humor","confidence"], validates:null, unlockConditions:{anyTags:["playful","reflective"]},
    options:[
      { text:"Call it out with a laugh and wrap it up fast", d:{humor:2,selfAwareness:1,confidence:1}, reason:"Naming the overexplaining yourself, lightly, shows comfort turning a small misstep into something shared rather than awkward.", tradeoff:"Gains levity, at the cost of the consistency the other path here would have offered instead.", reveals:["Uses humor to navigate the moment", "Notices their own patterns in real time", "Backs their own judgment under pressure"], tags:["playful","bold"] },
      { text:"Just keep going, finishing the thought properly", d:{discipline:1,persistence:1,selfAwareness:-1}, reason:"Finishing regardless of the cue reflects a preference for completing your own thought over reading the room in real time.", tradeoff:"Gains consistency, at the cost of self-knowledge.", reveals:["Follows through on principle rather than convenience", "Sees something through past the easy stopping point", "Doesn't examine their own reaction too closely"], tags:["independent"] },
      { text:"Cut it short abruptly, a little embarrassed", d:{selfAwareness:1,emotionalStability:-1,socialEnergy:-1}, reason:"The visible abruptness shows real discomfort at being caught out, even over something this minor.", tradeoff:"Gains self-knowledge, at the cost of composure.", reveals:["Names an uncomfortable truth about themselves", "Feels the disruption rather than absorbing it quietly", "Chooses distance over engagement"], tags:["cautious"] } ]},
  { id:"e19", text:"Something you own breaks in a way that's mostly your own fault, at an inconvenient time.", illustration:"anchor", type:"everyday", tone:"light", difficulty:"light", purpose:"Reads self-blame processing under a minor, self-caused setback.", measures:["responsibility","emotionalStability","resilience"], validates:null, unlockConditions:{anyTags:["analytical","pragmatist"]},
    options:[
      { text:"Own it immediately and deal with fixing it", d:{responsibility:2,resilience:1,discipline:1}, reason:"Moving straight to repair without dwelling on the self-blame shows a practical relationship with your own mistakes.", tradeoff:"Gains accountability, at the cost of the self-knowledge the other path here would have offered instead.", reveals:["Takes ownership even when it costs them", "Recovers forward rather than dwelling", "Holds a personal standard even without anyone watching"], tags:["pragmatist","independent"] },
      { text:"Feel annoyed at yourself for longer than the situation really calls for", d:{emotionalStability:-1,selfAwareness:1,discipline:1}, reason:"Letting frustration at yourself outlast the actual inconvenience is an honest, specific self-criticism signal.", tradeoff:"Gains self-knowledge, at the cost of composure.", reveals:["Feels the disruption rather than absorbing it quietly", "Names an uncomfortable truth about themselves", "Follows through on principle rather than convenience"], tags:["intense","reflective"] },
      { text:"Shrug it off, these things happen", d:{optimism:2,adaptability:1,responsibility:-1}, reason:"Moving on without much self-directed friction at all shows a genuinely light relationship with your own errors.", tradeoff:"Gains ease, at the cost of accountability.", reveals:["Expects things to work out", "Changes approach when the situation shifts", "Lets responsibility sit with someone else"], tags:["independent","pragmatist"] } ]},
  { id:"e20", text:"You have to choose between two ways to spend a free evening: one relaxing, one productive but a little draining.", illustration:"hourglass", type:"everyday", tone:"light", difficulty:"light", purpose:"Simple, recurring real-life tradeoff between rest and output.", measures:["drive","discipline","patience"], validates:"drive", unlockConditions:{anyTags:["pragmatist","competitive"]},
    options:[
      { text:"Pick the productive one, you'll feel better having used the time well", d:{drive:2,discipline:1,patience:-1}, reason:"Choosing output over rest on unstructured personal time shows drive operating even without external pressure.", tradeoff:"Gains momentum, at the cost of stability.", reveals:["Keeps moving rather than settling", "Follows through on principle rather than convenience", "Acts rather than waiting it out"], tags:["competitive","pragmatist"] },
      { text:"Pick the relaxing one without a shred of guilt", d:{patience:2,emotionalStability:1,drive:-1}, reason:"Choosing rest cleanly, with no productivity guilt attached, reflects a genuinely low internal pressure to always be doing something.", tradeoff:"Gains stability, at the cost of momentum.", reveals:["Tolerates discomfort rather than forcing resolution", "Stays steady under pressure", "Chooses ease over pushing further"], tags:["independent","loyal"] },
      { text:"Try to squeeze in a little of both and end up doing neither fully", d:{planning:-1,adaptability:1,optimism:1}, reason:"Refusing to just pick one, even at the cost of doing both halfway, shows discomfort with clean tradeoffs.", tradeoff:"Gains flexibility, at the cost of preparedness.", reveals:["Improvises rather than preparing", "Changes approach when the situation shifts", "Expects things to work out"], tags:["curious"] } ]},
  { id:"e21", text:"You're mid-argument with someone you care about and realize you're actually winning the argument, but hurting them in the process.", illustration:"scales", type:"everyday", tone:"serious", difficulty:"heavy", purpose:"A genuine cost-tradeoff between being right and being kind, mid-conflict.", measures:["empathy","competitiveness","kindness"], validates:"empathy", unlockConditions:{anyTags:["intense","warm"]},
    options:[
      { text:"Stop and back off, even though you could keep pushing", d:{empathy:2,kindness:1,competitiveness:-1}, reason:"Voluntarily giving up a winning position mid-argument for someone else's sake is a costly, real empathy signal.", tradeoff:"Gains connection, at the cost of an edge.", reveals:["Reads the emotional stakes before acting", "Softens a hard truth to protect someone", "Steps back from a contest rather than pressing an advantage"], tags:["warm","loyal"] },
      { text:"Finish the point, but soften how you land it", d:{competitiveness:1,empathy:1,confidence:1}, reason:"Refusing to fully abandon your position while adjusting delivery shows both conviction and care operating together.", tradeoff:"Gains an edge, at the cost of the goodwill the other path here would have offered instead.", reveals:["Measures the situation by whether they're winning", "Prioritizes how someone else is feeling", "Backs their own judgment under pressure"], tags:["pragmatist"] },
      { text:"Keep going, being right matters more to you in the moment than it probably should", d:{competitiveness:2,confidence:1,empathy:-1}, reason:"Admitting the pull to keep winning outweighs the visible hurt is an honest, uncomfortable self-read.", tradeoff:"Gains an edge, at the cost of connection.", reveals:["Keeps pushing rather than settling for a tie", "Acts before being fully sure", "Prioritizes the outcome over someone's feelings"], tags:["bold","intense"] } ]},
  { id:"e22", text:"You're offered an easy way out of a commitment you made, and nobody would ever know you took it.", illustration:"key", type:"everyday", tone:"serious", difficulty:"medium", purpose:"Tests whether commitment holds when the accountability is entirely internal.", measures:["responsibility","discipline","independence"], validates:"responsibility", unlockConditions:{anyTags:["idealist","independent"]},
    options:[
      { text:"Follow through anyway, you said you would", d:{responsibility:2,discipline:1,persistence:1}, reason:"Honoring a commitment with zero external accountability shows the standard is internal, not performative.", tradeoff:"Gains accountability, at the cost of the flexibility the other path here would have offered instead.", reveals:["Accepts accountability without being asked", "Follows through on principle rather than convenience", "Sees something through past the easy stopping point"], tags:["idealist","independent"] },
      { text:"Take the out, the commitment wasn't that serious to begin with", d:{adaptability:1,independence:1,responsibility:-1}, reason:"Reassessing the actual weight of the commitment rather than treating all promises as equally binding is a specific, honest calibration.", tradeoff:"Gains flexibility, at the cost of accountability.", reveals:["Adjusts course rather than forcing a plan through", "Trusts their own judgment over consensus", "Lets responsibility sit with someone else"], tags:["pragmatist"] },
      { text:"Take it, but feel guilty enough to make it up some other way", d:{responsibility:1,emotionalStability:-1,kindness:1}, reason:"Taking the easier path but still feeling obligated to compensate shows commitment matters even when you don't fully honor it.", tradeoff:"Gains accountability, at the cost of composure.", reveals:["Takes ownership even when it costs them", "Lets the moment's weight actually register", "Chooses someone else's comfort over their own convenience"], tags:["reflective"] } ]},
  { id:"e23", text:"You're asked to make a decision on behalf of a group, quickly, with incomplete information.", illustration:"compass", type:"everyday", tone:"light", difficulty:"medium", purpose:"Tests decisiveness under real, mild pressure and incomplete data.", measures:["confidence","logic","leadership"], validates:"confidence", unlockConditions:{anyTags:["bold","analytical"]},
    options:[
      { text:"Decide quickly with what you have and own the outcome", d:{confidence:2,leadership:1,risk:1}, reason:"Committing under real uncertainty rather than stalling for more data shows decisiveness that tolerates being wrong.", tradeoff:"Gains conviction, at the cost of the preparedness the other path here would have offered instead.", reveals:["Acts before being fully sure", "Takes the lead without being asked", "Chooses the less certain, more interesting path"], tags:["bold","competitive"] },
      { text:"Buy a little more time to get at least one more piece of information", d:{planning:2,logic:1,patience:1}, reason:"Slowing down a time-pressured decision specifically to reduce uncertainty shows a real preference for information over speed.", tradeoff:"Gains preparedness, at the cost of the conviction the other path here would have offered instead.", reveals:["Structures uncertainty before acting", "Relies on logic over instinct", "Tolerates discomfort rather than forcing resolution"], tags:["analytical","cautious"] },
      { text:"Make the call, but immediately flag how uncertain it actually is", d:{responsibility:1,confidence:1,trust:1}, reason:"Deciding while being transparent about the uncertainty shows accountability paired with honesty about its limits.", tradeoff:"Gains accountability, at the cost of the control the other path here would have offered instead.", reveals:["Takes ownership even when it costs them", "Backs their own judgment under pressure", "Extends trust before it's fully earned"], tags:["idealist","pragmatist"] } ]},
  { id:"e24", text:"You're suddenly given a lot more say over something than you actually feel ready to handle.", illustration:"key", type:"everyday", tone:"light", difficulty:"medium", purpose:"Reads reaction to autonomy exceeding current confidence.", measures:["confidence","independence","resilience"], validates:null, unlockConditions:{anyTags:["independent","cautious"]},
    options:[
      { text:"Take it and grow into it as you go", d:{confidence:2,independence:1,risk:1}, reason:"Accepting autonomy before feeling fully ready shows comfort growing into responsibility rather than waiting to feel prepared.", tradeoff:"Gains conviction, at the cost of the preparedness the other path here would have offered instead.", reveals:["Backs their own judgment under pressure", "Trusts their own judgment over consensus", "Accepts uncertainty in exchange for upside"], tags:["bold","adventurous"] },
      { text:"Ask for a bit of structure or check-ins to start", d:{planning:1,discipline:1,confidence:-1}, reason:"Requesting scaffolding rather than either refusing or bluffing readiness shows a specific, honest way of managing the gap.", tradeoff:"Gains preparedness, at the cost of conviction.", reveals:["Structures uncertainty before acting", "Holds a personal standard even without anyone watching", "Second-guesses their own read of a situation"], tags:["pragmatist","analytical"] },
      { text:"Voice that you're not sure you're the right person for this yet", d:{selfAwareness:2,responsibility:1,confidence:-1}, reason:"Naming the mismatch directly, even at some cost to how capable you look, protects the outcome over your image.", tradeoff:"Gains self-knowledge, at the cost of conviction.", reveals:["Names an uncomfortable truth about themselves", "Accepts accountability without being asked", "Lets doubt slow down a decision"], tags:["cautious","idealist"] } ]},
  { id:"e25", text:"You realize partway through a long task that the original goal has quietly become pointless.", illustration:"maze", type:"everyday", tone:"light", difficulty:"medium", purpose:"Tests attachment to completion versus willingness to cut a now-meaningless loss.", measures:["persistence","logic","discipline"], validates:"persistence", unlockConditions:{anyTags:["analytical","independent"]},
    options:[
      { text:"Stop immediately, finishing something pointless helps no one", d:{logic:2,adaptability:1,persistence:-1}, reason:"Cutting a task the moment its purpose disappears, regardless of effort already spent, shows low sunk-cost pull.", tradeoff:"Gains clarity, at the cost of follow-through.", reveals:["Relies on logic over instinct", "Adjusts course rather than forcing a plan through", "Knows when to stop rather than pushing further"], tags:["analytical","independent"] },
      { text:"Finish it anyway, quitting midway would bother you more than wasted effort", d:{persistence:2,discipline:1,logic:-1}, reason:"Prioritizing completion over logic once you're already committed shows persistence functions somewhat independently of purpose.", tradeoff:"Gains follow-through, at the cost of clarity.", reveals:["Keeps going after the initial effort stops paying off", "Holds a personal standard even without anyone watching", "Leans on instinct over analysis"], tags:["independent","idealist"] },
      { text:"Repurpose it toward something that's actually still useful", d:{creativity:2,adaptability:1,planning:1}, reason:"Refusing either to quit or to finish blindly, and instead redirecting the effort, shows a resourceful middle path as a real default.", tradeoff:"Gains originality, at the cost of the clarity the other path here would have offered instead.", reveals:["Reaches for an unconventional solution", "Adjusts course rather than forcing a plan through", "Structures uncertainty before acting"], tags:["pragmatist","curious"] } ]},
  { id:"e26", text:"Someone close to you makes a choice you think is genuinely a bad idea, but it's entirely their decision to make.", illustration:"bridge", type:"everyday", tone:"serious", difficulty:"medium", purpose:"Tests boundary between care and control over someone else's autonomy.", measures:["kindness","independence","openMindedness"], validates:"kindness", unlockConditions:{anyTags:["warm","independent"]},
    options:[
      { text:"Say your concerns clearly once, then support whatever they choose", d:{kindness:2,trust:1,openMindedness:1}, reason:"Voicing concern exactly once and then genuinely stepping back respects both honesty and their autonomy.", tradeoff:"Gains goodwill, at the cost of the autonomy the other path here would have offered instead.", reveals:["Softens a hard truth to protect someone", "Gives someone the benefit of the doubt", "Stays open to being wrong"], tags:["warm","idealist"] },
      { text:"Stay quiet, it's their life to run, not yours", d:{independence:2,openMindedness:1,kindness:-1}, reason:"Withholding even one round of concern shows a strong default respect for other people's autonomy over your own worry.", tradeoff:"Gains autonomy, at the cost of goodwill.", reveals:["Chooses self-reliance over relying on others", "Stays open to being wrong", "Chooses honesty or fairness over someone's comfort"], tags:["independent","cautious"] },
      { text:"Keep bringing it up until you're sure they've really heard you", d:{persistence:1,kindness:1,independence:-1}, reason:"Continuing to push past the point of a single clear warning shows care overriding boundary-respect here.", tradeoff:"Gains follow-through, at the cost of autonomy.", reveals:["Keeps going after the initial effort stops paying off", "Chooses someone else's comfort over their own convenience", "Chooses connection or reliance over going it alone"], tags:["loyal","intense"] } ]},
  { id:"e27", text:"You're in a group where the conversation has drifted somewhere you find genuinely uncomfortable.", illustration:"conversation", type:"everyday", tone:"serious", difficulty:"medium", purpose:"Tests willingness to disrupt group flow for personal comfort or principle.", measures:["confidence","socialEnergy","openMindedness"], validates:null, unlockConditions:{anyTags:["bold","cautious"]},
    options:[
      { text:"Say plainly that you'd rather talk about something else", d:{confidence:2,independence:1,socialEnergy:-1}, reason:"Interrupting group momentum for your own comfort, even mildly, shows a real willingness to disrupt the room.", tradeoff:"Gains conviction, at the cost of engagement.", reveals:["Acts before being fully sure", "Chooses self-reliance over relying on others", "Chooses distance over engagement"], tags:["bold","independent"] },
      { text:"Steer it elsewhere naturally without drawing attention to why", d:{adaptability:2,socialEnergy:1,logic:1}, reason:"Redirecting quietly rather than naming the discomfort shows social smoothness winning over directness here.", tradeoff:"Gains flexibility, at the cost of the conviction the other path here would have offered instead.", reveals:["Changes approach when the situation shifts", "Leans toward people rather than away from them", "Reasons through a situation before acting"], tags:["pragmatist","analytical"] },
      { text:"Sit with the discomfort rather than disrupt the group's flow", d:{patience:2,emotionalStability:-1,socialEnergy:-1}, reason:"Tolerating real discomfort specifically to avoid disrupting the group is a genuine, costly form of social deference.", tradeoff:"Gains stability, at the cost of composure.", reveals:["Tolerates discomfort rather than forcing resolution", "Lets the moment's weight actually register", "Draws energy from stepping back"], tags:["cautious","loyal"] } ]},
  { id:"e28", text:"You notice a small mistake that nobody else has caught, one that won't actually matter until much later.", illustration:"puzzle", type:"everyday", tone:"light", difficulty:"medium", purpose:"Tests whether distant, low-visibility consequences still trigger responsibility now.", measures:["responsibility","planning","patience"], validates:"responsibility", unlockConditions:{anyTags:["analytical","idealist"]},
    options:[
      { text:"Flag it now, even though it'll seem like it doesn't matter yet", d:{responsibility:2,planning:1,confidence:1}, reason:"Raising a concern before it's urgent, when it's easy to stay quiet, shows responsibility that isn't triggered only by visible pressure.", tradeoff:"Gains accountability, at the cost of the stability the other path here would have offered instead.", reveals:["Takes ownership even when it costs them", "Structures uncertainty before acting", "Backs their own judgment under pressure"], tags:["idealist","analytical"] },
      { text:"Make a note and bring it up closer to when it'll actually matter", d:{planning:2,patience:1,discipline:1}, reason:"Timing the concern deliberately rather than raising it immediately shows a measured, low-friction sense of responsibility.", tradeoff:"Gains preparedness, at the cost of the accountability the other path here would have offered instead.", reveals:["Structures uncertainty before acting", "Tolerates discomfort rather than forcing resolution", "Holds a personal standard even without anyone watching"], tags:["pragmatist","cautious"] },
      { text:"Assume someone else will probably catch it before then", d:{independence:-1,optimism:1,responsibility:-1}, reason:"Deferring a known issue to someone else's future vigilance is a real, specific gap in how far your responsibility extends.", tradeoff:"Gains ease, at the cost of autonomy.", reveals:["Chooses connection or reliance over going it alone", "Frames setbacks as temporary", "Lets responsibility sit with someone else"], tags:["independent"] } ]},
  { id:"e29", text:"A decision you have to make will disappoint one of two people close to you, no matter what you choose.", illustration:"bridge", type:"everyday", tone:"serious", difficulty:"heavy", purpose:"A real, unavoidable cost forces an explicit priority between two relationships.", measures:["kindness","confidence","emotionalStability"], validates:null, unlockConditions:{anyTags:["intense","loyal"]},
    options:[
      { text:"Decide based on who actually needs this more right now", d:{empathy:2,logic:1,kindness:1}, reason:"Ranking need over history or fairness as the deciding factor shows a specific, situational moral logic.", tradeoff:"Gains connection, at the cost of the conviction the other path here would have offered instead.", reveals:["Prioritizes how someone else is feeling", "Relies on logic over instinct", "Chooses someone else's comfort over their own convenience"], tags:["warm","analytical"] },
      { text:"Decide based on what you genuinely think is the right call, and accept the fallout", d:{confidence:2,discipline:1,kindness:-1}, reason:"Prioritizing your own judgment of correctness over managing either person's feelings is a real, costly conviction.", tradeoff:"Gains conviction, at the cost of goodwill.", reveals:["Backs their own judgment under pressure", "Holds a personal standard even without anyone watching", "Chooses honesty or fairness over someone's comfort"], tags:["idealist","bold"] },
      { text:"Try to find some version that softens the blow for both, even if it's imperfect", d:{creativity:1,patience:1,planning:1}, reason:"Refusing the clean binary and searching for a messier middle path shows discomfort with a forced either/or.", tradeoff:"Gains originality, at the cost of the connection the other path here would have offered instead.", reveals:["Builds a new option instead of picking a given one", "Lets a situation play out before intervening", "Prepares rather than improvising"], tags:["pragmatist","warm"] } ]},
  { id:"e30", text:"You're recognized publicly for something, and you know the recognition is only partly deserved.", illustration:"star", type:"everyday", tone:"light", difficulty:"light", purpose:"A second, lighter pass at partial-credit honesty, framed as public rather than private.", measures:["responsibility","confidence","selfAwareness"], validates:"responsibility", unlockConditions:{anyTags:["idealist","pragmatist"]},
    options:[
      { text:"Publicly share the credit with whoever else helped", d:{responsibility:2,kindness:1,confidence:-1}, reason:"Redistributing credit in a visible, public moment costs more socially than doing it privately would, showing real commitment to accuracy.", tradeoff:"Gains accountability, at the cost of conviction.", reveals:["Takes ownership even when it costs them", "Chooses someone else's comfort over their own convenience", "Second-guesses their own read of a situation"], tags:["idealist","warm"] },
      { text:"Accept it graciously in the moment, and clarify it one-on-one later", d:{socialEnergy:1,planning:1,responsibility:1}, reason:"Separating the public moment from the private correction shows a preference for accuracy without public awkwardness.", tradeoff:"Gains engagement, at the cost of the goodwill the other path here would have offered instead.", reveals:["Leans toward people rather than away from them", "Prepares rather than improvising", "Accepts accountability without being asked"], tags:["pragmatist"] },
      { text:"Just accept it, recognition evens out over time anyway", d:{optimism:2,independence:1,responsibility:-1}, reason:"Letting an imperfect distribution of credit stand on a long-run fairness assumption is a real, specific rationalization.", tradeoff:"Gains ease, at the cost of accountability.", reveals:["Frames setbacks as temporary", "Trusts their own judgment over consensus", "Lets responsibility sit with someone else"], tags:["independent"] } ]},
  ],

  reflective: [
  { id:"c03", text:"You realize, mid-conversation, that you were wrong about something you argued for confidently a minute ago.", illustration:"mirror", type:"reflective", tone:"serious", difficulty:"medium", purpose:"Tests whether ego yields to accuracy in the moment it actually costs something.", measures:["selfAwareness","confidence","openMindedness"], validates:"selfAwareness",
    options:[
      { text:"Say so immediately, right in front of everyone", d:{selfAwareness:2,openMindedness:1,confidence:1}, reason:"Correcting yourself publicly the instant you notice costs status, so choosing it over quietly moving on reflects a real premium on accuracy over image.", tradeoff:"Gains self-knowledge, at the cost of the stability the other path here would have offered instead.", reveals:["Notices their own patterns in real time", "Reconsiders a position when given a reason to", "Backs their own judgment under pressure"], tags:["idealist"] },
      { text:"Let the conversation move on and correct it with them privately after", d:{selfAwareness:2,patience:1,kindness:1}, reason:"Still fixing it, but protecting the moment's flow, shows the correction matters more than the audience.", tradeoff:"Gains self-knowledge, at the cost of the room to be wrong the other path here would have offered instead.", reveals:["Names an uncomfortable truth about themselves", "Lets a situation play out before intervening", "Softens a hard truth to protect someone"], tags:["pragmatist","warm"] },
      { text:"Stay quiet about it unless someone actually calls it out", d:{independence:1,confidence:-1,selfAwareness:-1}, reason:"Letting a known error stand rather than volunteer the cost of correcting it is a real, if unflattering, data point about how much status weighs against accuracy.", tradeoff:"Gains autonomy, at the cost of conviction.", reveals:["Trusts their own judgment over consensus", "Second-guesses their own read of a situation", "Doesn't examine their own reaction too closely"], tags:["cautious"] } ]},
  { id:"c13", text:"What would actually hurt more: being completely misunderstood by someone close to you, or being quietly forgotten by everyone else?", illustration:"masks", type:"reflective", tone:"philosophical", difficulty:"heavy", purpose:"A forced ranking of closeness-pain versus significance-pain, no comfortable third option offered.", measures:["selfAwareness","socialEnergy","emotionalStability"], validates:null,
    options:[
      { text:"Being misunderstood by someone close, that's the one that actually stays with you", d:{empathy:2,trust:1,emotionalStability:-1}, reason:"Ranking a single relationship's clarity above being remembered at all shows identity is anchored in specific bonds, not broader significance.", tradeoff:"Gains connection, at the cost of composure.", reveals:["Reads the emotional stakes before acting", "Gives someone the benefit of the doubt", "Feels the disruption rather than absorbing it quietly"], tags:["warm","intense"] },
      { text:"Being forgotten, at least being misunderstood means you mattered enough to argue about", d:{socialEnergy:1,independence:1,selfAwareness:1}, reason:"Reframing being misunderstood as proof you mattered, and ranking erasure as worse, reveals a need for significance over harmony.", tradeoff:"Gains engagement, at the cost of the connection the other path here would have offered instead.", reveals:["Draws energy from engaging with others", "Trusts their own judgment over consensus", "Notices their own patterns in real time"], tags:["independent","reflective"] },
      { text:"Neither, honestly, disappointing yourself quietly is the one that actually lingers", d:{selfAwareness:2,confidence:-1,discipline:1}, reason:"Rejecting both externally-caused pains in favor of an internally-generated one shows self-judgment outweighs how others see you.", tradeoff:"Gains self-knowledge, at the cost of conviction.", reveals:["Notices their own patterns in real time", "Second-guesses their own read of a situation", "Holds a personal standard even without anyone watching"], tags:["reflective","idealist"] } ]},
  { id:"r01", text:"You think about the version of yourself from several years ago.", illustration:"mirror", type:"reflective", tone:"philosophical", difficulty:"medium", purpose:"Tests self-continuity: pride, distance, or discomfort with an earlier self.", measures:["selfAwareness","optimism","emotionalStability"], validates:"selfAwareness", unlockConditions:{anyTags:["reflective","idealist"]},
    options:[
      { text:"Feel mostly proud of how far you've come", d:{optimism:2,confidence:1,resilience:1}, reason:"Framing growth as the dominant story rather than the gap or the errors shows a genuinely forward-oriented self-narrative.", tradeoff:"Gains ease, at the cost of the self-knowledge the other path here would have offered instead.", reveals:["Frames setbacks as temporary", "Backs their own judgment under pressure", "Recovers forward rather than dwelling"], tags:["idealist","independent"] },
      { text:"Feel a strange distance, like they were a different person entirely", d:{selfAwareness:2,openMindedness:1,creativity:1}, reason:"Experiencing your past self as almost separate suggests identity is understood as something that changes substantially, not just accumulates.", tradeoff:"Gains self-knowledge, at the cost of the ease the other path here would have offered instead.", reveals:["Names an uncomfortable truth about themselves", "Stays open to being wrong", "Builds a new option instead of picking a given one"], tags:["reflective","curious"] },
      { text:"Feel a little embarrassed by choices that seemed fine back then", d:{selfAwareness:1,emotionalStability:-1,discipline:1}, reason:"Judging your past self by current standards, rather than granting it context, reveals a fairly demanding internal bar.", tradeoff:"Gains self-knowledge, at the cost of composure.", reveals:["Names an uncomfortable truth about themselves", "Feels the disruption rather than absorbing it quietly", "Follows through on principle rather than convenience"], tags:["intense"] } ]},
  { id:"r02", text:"You're alone with your thoughts longer than usual, with nothing to distract you.", illustration:"hourglass", type:"reflective", tone:"philosophical", difficulty:"medium", purpose:"Reads comfort with unstructured introspection versus need for stimulation.", measures:["independence","emotionalStability","curiosity"], validates:"independence", unlockConditions:{anyTags:["reflective","independent"]},
    options:[
      { text:"Settle into it, it's rare to get this kind of quiet", d:{independence:2,emotionalStability:1,patience:1}, reason:"Treating extended solitude as a resource rather than a gap to fill shows genuine comfort inside your own head.", tradeoff:"Gains autonomy, at the cost of the self-knowledge the other path here would have offered instead.", reveals:["Chooses self-reliance over relying on others", "Keeps a level head when things get tense", "Lets a situation play out before intervening"], tags:["independent","reflective"] },
      { text:"Start actively working through something you've been avoiding thinking about", d:{selfAwareness:2,resilience:1,discipline:1}, reason:"Using unstructured time deliberately to confront something difficult, rather than just resting, shows introspection used with intent.", tradeoff:"Gains self-knowledge, at the cost of the autonomy the other path here would have offered instead.", reveals:["Notices their own patterns in real time", "Recovers forward rather than dwelling", "Holds a personal standard even without anyone watching"], tags:["idealist","intense"] },
      { text:"Start looking for something, anything, to fill the silence", d:{socialEnergy:1,curiosity:1,independence:-1}, reason:"Needing to interrupt your own quiet fairly quickly is an honest, specific limit on how much unstructured introspection you actually want.", tradeoff:"Gains engagement, at the cost of autonomy.", reveals:["Draws energy from engaging with others", "Chooses exploration over certainty", "Chooses connection or reliance over going it alone"], tags:["playful","curious"] } ]},
  { id:"r03", text:"You think about what people who know you well would say your biggest flaw is.", illustration:"mirror", type:"reflective", tone:"serious", difficulty:"medium", purpose:"Tests self-perception accuracy versus self-protective blind spots.", measures:["selfAwareness","openMindedness","emotionalStability"], validates:"selfAwareness", unlockConditions:{anyTags:["reflective","idealist"]},
    options:[
      { text:"You already know exactly what they'd say, and you agree", d:{selfAwareness:2,openMindedness:1,confidence:1}, reason:"Being able to name and accept a real flaw without defensiveness reflects a genuinely accurate, unguarded self-model.", tradeoff:"Gains self-knowledge, at the cost of the insight the other path here would have offered instead.", reveals:["Names an uncomfortable truth about themselves", "Stays open to being wrong", "Acts before being fully sure"], tags:["idealist","reflective"] },
      { text:"You can guess, but you'd probably argue with some of it", d:{confidence:1,openMindedness:-1,selfAwareness:1}, reason:"Anticipating the criticism but still contesting parts of it shows self-awareness paired with real resistance to full agreement.", tradeoff:"Gains conviction, at the cost of room to be wrong.", reveals:["Acts before being fully sure", "Holds a position rather than reconsidering it", "Names an uncomfortable truth about themselves"], tags:["independent","bold"] },
      { text:"You genuinely have no idea, and that's a little unsettling", d:{selfAwareness:-1,curiosity:1,emotionalStability:-1}, reason:"Admitting a real gap in how you're perceived, rather than guessing confidently, is an honest and specific limit of self-knowledge.", tradeoff:"Gains insight, at the cost of self-knowledge.", reveals:["Doesn't examine their own reaction too closely", "Chooses exploration over certainty", "Lets the moment's weight actually register"], tags:["cautious"] } ]},
  { id:"r04", text:"You notice a pattern: you tend to react to a certain kind of situation the same way, every time.", illustration:"maze", type:"reflective", tone:"serious", difficulty:"medium", purpose:"Tests whether recognizing a pattern actually leads to trying to change it.", measures:["selfAwareness","discipline","persistence"], validates:null, unlockConditions:{anyTags:["reflective","analytical"]},
    options:[
      { text:"Start actively trying to break the pattern next time it comes up", d:{discipline:2,persistence:1,selfAwareness:1}, reason:"Moving from noticing to actively intervening shows self-awareness translating into real behavioral effort.", tradeoff:"Gains consistency, at the cost of the room to be wrong the other path here would have offered instead.", reveals:["Holds a personal standard even without anyone watching", "Keeps going after the initial effort stops paying off", "Notices their own patterns in real time"], tags:["idealist","analytical"] },
      { text:"Just note it and accept it as part of how you operate", d:{selfAwareness:1,openMindedness:1,discipline:-1}, reason:"Choosing acceptance over correction, once the pattern is named, reflects comfort with your own defaults rather than a drive to optimize them.", tradeoff:"Gains self-knowledge, at the cost of consistency.", reveals:["Names an uncomfortable truth about themselves", "Stays open to being wrong", "Lets a standard slide when it's inconvenient"], tags:["independent","reflective"] },
      { text:"Feel a little frustrated that you keep doing it anyway", d:{emotionalStability:-1,selfAwareness:1,resilience:-1}, reason:"Recognizing the pattern without yet managing to change it, and being bothered by that gap, is an honest, specific tension.", tradeoff:"Gains self-knowledge, at the cost of composure.", reveals:["Lets the moment's weight actually register", "Notices their own patterns in real time", "Lets a setback actually land before moving on"], tags:["intense"] } ]},
  { id:"r05", text:"You consider what you actually want your life to look like in ten years, honestly, not the impressive version.", illustration:"compass", type:"reflective", tone:"philosophical", difficulty:"medium", purpose:"Separates genuine desire from performed ambition.", measures:["drive","independence","optimism"], validates:null, unlockConditions:{anyTags:["reflective","idealist"]},
    options:[
      { text:"Something quiet and stable, closer to home than you'd admit out loud", d:{patience:1,kindness:1,drive:-1}, reason:"Admitting the honest answer is smaller and calmer than the expected ambitious one is a real, vulnerable disclosure.", tradeoff:"Gains stability, at the cost of momentum.", reveals:["Tolerates discomfort rather than forcing resolution", "Chooses someone else's comfort over their own convenience", "Chooses ease over pushing further"], tags:["independent","warm"] },
      { text:"Something bigger than where you are now, and you're not embarrassed about wanting that", d:{drive:2,confidence:1,competitiveness:1}, reason:"Owning real ambition without hedging it shows drive isn't just performed for others.", tradeoff:"Gains momentum, at the cost of the stability the other path here would have offered instead.", reveals:["Pushes toward the outcome even under resistance", "Backs their own judgment under pressure", "Measures the situation by whether they're winning"], tags:["competitive","bold"] },
      { text:"Honestly, you're not sure yet, and that doesn't bother you much", d:{openMindedness:2,curiosity:1,planning:-1}, reason:"Being genuinely comfortable with an unresolved future, rather than forcing an answer, shows real tolerance for ambiguity.", tradeoff:"Gains room to be wrong, at the cost of preparedness.", reveals:["Stays open to being wrong", "Follows a question rather than letting it go", "Improvises rather than preparing"], tags:["curious","independent"] } ]},
  { id:"r06", text:"You think about a relationship that ended, for whatever reason.", illustration:"bridge", type:"reflective", tone:"intimate", difficulty:"heavy", purpose:"Tests how endings are processed: closure, resentment, or growth.", measures:["emotionalStability","openMindedness","resilience"], validates:"emotionalStability", unlockConditions:{anyTags:["reflective","intense"]},
    options:[
      { text:"Mostly feel grateful for what it was, even though it ended", d:{optimism:2,openMindedness:1,resilience:1}, reason:"Holding gratitude alongside loss, rather than letting the ending define the whole relationship, shows real emotional integration.", tradeoff:"Gains ease, at the cost of the self-knowledge the other path here would have offered instead.", reveals:["Frames setbacks as temporary", "Reconsiders a position when given a reason to", "Recovers forward rather than dwelling"], tags:["idealist","warm"] },
      { text:"Still feel a flicker of something unresolved about it", d:{emotionalStability:-1,selfAwareness:1,persistence:1}, reason:"Admitting lingering unresolve, rather than claiming full closure, is an honest, specific emotional read.", tradeoff:"Gains self-knowledge, at the cost of composure.", reveals:["Feels the disruption rather than absorbing it quietly", "Names an uncomfortable truth about themselves", "Sees something through past the easy stopping point"], tags:["intense","reflective"] },
      { text:"Have mostly moved past it and rarely think about it at all", d:{independence:2,resilience:1,emotionalStability:1}, reason:"Genuine emotional distance, not suppression, from something that once mattered shows real processing has happened.", tradeoff:"Gains autonomy, at the cost of the ease the other path here would have offered instead.", reveals:["Trusts their own judgment over consensus", "Recovers forward rather than dwelling", "Stays steady under pressure"], tags:["independent"] } ]},
  { id:"r07", text:"You consider whether you're more shaped by the people around you or by decisions you made alone.", illustration:"mirror", type:"reflective", tone:"philosophical", difficulty:"medium", purpose:"A direct self-theory question about locus of identity formation.", measures:["independence","socialEnergy","selfAwareness"], validates:"independence", unlockConditions:{anyTags:["reflective","independent"]},
    options:[
      { text:"Mostly the people, you're a product of who you've been close to", d:{socialEnergy:1,trust:1,kindness:1}, reason:"Attributing identity primarily to relationships rather than solitary choice shows a genuinely relational self-model.", tradeoff:"Gains engagement, at the cost of the autonomy the other path here would have offered instead.", reveals:["Leans toward people rather than away from them", "Gives someone the benefit of the doubt", "Softens a hard truth to protect someone"], tags:["warm","loyal"] },
      { text:"Mostly your own decisions, even the ones made against advice", d:{independence:2,confidence:1,persistence:1}, reason:"Crediting solitary choice over social influence, especially decisions made against advice, shows a self-authored identity model.", tradeoff:"Gains autonomy, at the cost of the engagement the other path here would have offered instead.", reveals:["Trusts their own judgment over consensus", "Backs their own judgment under pressure", "Keeps going after the initial effort stops paying off"], tags:["independent","bold"] },
      { text:"Honestly, more the hard moments than either people or choices", d:{resilience:2,selfAwareness:1,emotionalStability:1}, reason:"Attributing identity to adversity itself, rather than to people or agency, is a distinct third theory of self.", tradeoff:"Gains forward motion, at the cost of the engagement the other path here would have offered instead.", reveals:["Treats a setback as temporary", "Names an uncomfortable truth about themselves", "Keeps a level head when things get tense"], tags:["reflective","intense"] } ]},
  { id:"r08", text:"You think about the last time you were genuinely proud of yourself, not because anyone else noticed.", illustration:"star", type:"reflective", tone:"serious", difficulty:"light", purpose:"Tests source of self-worth: private standards versus external validation.", measures:["confidence","independence","drive"], validates:null, unlockConditions:{anyTags:["independent","idealist"]},
    options:[
      { text:"It came easily to mind, private wins matter as much as public ones", d:{confidence:2,independence:1,selfAwareness:1}, reason:"Having an easy, ready answer shows private accomplishment is a genuine, active source of self-worth, not an afterthought.", tradeoff:"Gains conviction, at the cost of the momentum the other path here would have offered instead.", reveals:["Backs their own judgment under pressure", "Trusts their own judgment over consensus", "Notices their own patterns in real time"], tags:["independent","idealist"] },
      { text:"You had to think for a while before one came to mind", d:{selfAwareness:1,confidence:-1,drive:1}, reason:"The difficulty recalling one suggests self-worth leans more on external recognition than private satisfaction.", tradeoff:"Gains self-knowledge, at the cost of conviction.", reveals:["Notices their own patterns in real time", "Second-guesses their own read of a situation", "Pushes toward the outcome even under resistance"], tags:["reflective"] },
      { text:"It's tied to something small that would look unimpressive to anyone else", d:{openMindedness:1,independence:1,confidence:1}, reason:"Valuing something outwardly unremarkable shows your internal standard runs independently of how impressive things look.", tradeoff:"Gains room to be wrong, at the cost of the self-knowledge the other path here would have offered instead.", reveals:["Reconsiders a position when given a reason to", "Trusts their own judgment over consensus", "Backs their own judgment under pressure"], tags:["reflective","curious"] } ]},
  { id:"r09", text:"You consider how much of what you do is actually for yourself versus for how it looks to others.", illustration:"masks", type:"reflective", tone:"serious", difficulty:"medium", purpose:"Direct self-audit of intrinsic versus extrinsic motivation.", measures:["independence","selfAwareness","confidence"], validates:"independence", unlockConditions:{anyTags:["reflective","idealist"]},
    options:[
      { text:"Mostly for yourself, and you're fairly confident about that", d:{independence:2,confidence:1,selfAwareness:1}, reason:"Claiming a mostly intrinsic motivation with confidence, rather than hedging, is a strong, specific self-report.", tradeoff:"Gains autonomy, at the cost of the engagement the other path here would have offered instead.", reveals:["Chooses self-reliance over relying on others", "Acts before being fully sure", "Names an uncomfortable truth about themselves"], tags:["independent","idealist"] },
      { text:"Honestly, more for how it looks than you'd like to admit", d:{selfAwareness:2,confidence:-1,socialEnergy:1}, reason:"Admitting a less flattering truth about your own motives, unprompted, is itself a real act of self-awareness.", tradeoff:"Gains self-knowledge, at the cost of conviction.", reveals:["Notices their own patterns in real time", "Second-guesses their own read of a situation", "Draws energy from engaging with others"], tags:["reflective"] },
      { text:"It depends entirely on which part of your life you're talking about", d:{adaptability:1,openMindedness:1,selfAwareness:1}, reason:"Refusing to generalize across your whole life and insisting on nuance shows a specific resistance to oversimplifying yourself.", tradeoff:"Gains flexibility, at the cost of the autonomy the other path here would have offered instead.", reveals:["Changes approach when the situation shifts", "Stays open to being wrong", "Names an uncomfortable truth about themselves"], tags:["analytical","curious"] } ]},
  { id:"r10", text:"You think about the last time you truly changed your mind about something important, not just adjusted it slightly.", illustration:"lightbulb", type:"reflective", tone:"serious", difficulty:"medium", purpose:"Tests genuine openness to revision versus attachment to prior positions.", measures:["openMindedness","confidence","curiosity"], validates:"openMindedness", unlockConditions:{anyTags:["curious","analytical"]},
    options:[
      { text:"It comes to mind easily, and you're glad it happened", d:{openMindedness:2,curiosity:1,confidence:1}, reason:"Easily recalling a real mind-change, and viewing it positively, shows genuine comfort with revising deeply held views.", tradeoff:"Gains room to be wrong, at the cost of the consistency the other path here would have offered instead.", reveals:["Reconsiders a position when given a reason to", "Chooses exploration over certainty", "Backs their own judgment under pressure"], tags:["curious","idealist"] },
      { text:"It's hard to think of one, your core views don't shift much", d:{discipline:1,persistence:1,openMindedness:-1}, reason:"Struggling to recall genuine belief-revision suggests real stability, or resistance, in your core convictions.", tradeoff:"Gains consistency, at the cost of room to be wrong.", reveals:["Follows through on principle rather than convenience", "Sees something through past the easy stopping point", "Holds a position rather than reconsidering it"], tags:["independent"] },
      { text:"It happened, but it still stings a little to admit", d:{selfAwareness:1,confidence:-1,openMindedness:1}, reason:"Being open enough to have changed your mind but still uncomfortable admitting it shows openness and ego operating in tension.", tradeoff:"Gains self-knowledge, at the cost of conviction.", reveals:["Notices their own patterns in real time", "Second-guesses their own read of a situation", "Reconsiders a position when given a reason to"], tags:["reflective","intense"] } ]},
  { id:"r11", text:"You consider what you'd actually do with total anonymity for a week, no consequences, no one recognizing you anywhere.", illustration:"masks", type:"reflective", tone:"philosophical", difficulty:"medium", purpose:"Tests what surfaces when social consequence is fully removed.", measures:["risk","independence","openMindedness"], validates:null, unlockConditions:{anyTags:["adventurous","independent"]},
    options:[
      { text:"Probably something a little reckless you've never let yourself do", d:{risk:2,curiosity:1,discipline:-1}, reason:"What surfaces when consequences vanish reveals a real appetite that's normally kept in check, not invented in the moment.", tradeoff:"Gains upside, at the cost of consistency.", reveals:["Chooses the less certain, more interesting path", "Follows a question rather than letting it go", "Lets a standard slide when it's inconvenient"], tags:["adventurous","bold"] },
      { text:"Honestly, probably not that different from your normal week", d:{discipline:2,independence:1,emotionalStability:1}, reason:"Behavior staying consistent even without any social consequence suggests your normal conduct isn't primarily performance.", tradeoff:"Gains consistency, at the cost of the upside the other path here would have offered instead.", reveals:["Follows through on principle rather than convenience", "Chooses self-reliance over relying on others", "Keeps a level head when things get tense"], tags:["independent","idealist"] },
      { text:"You'd probably just watch how people treat someone they don't recognize", d:{curiosity:2,empathy:1,selfAwareness:1}, reason:"Using anonymity to observe rather than to indulge shows curiosity about others outweighing personal escape.", tradeoff:"Gains insight, at the cost of the upside the other path here would have offered instead.", reveals:["Follows a question rather than letting it go", "Reads the emotional stakes before acting", "Names an uncomfortable truth about themselves"], tags:["curious","reflective"] } ]},
  { id:"r12", text:"You think about whether you trust your gut instinct or your careful reasoning more, when they genuinely disagree.", illustration:"scales", type:"reflective", tone:"serious", difficulty:"medium", purpose:"Direct self-theory question about decision-making trust.", measures:["logic","confidence","risk"], validates:"logic", unlockConditions:{anyTags:["analytical","bold"]},
    options:[
      { text:"Your gut, it's been right often enough to earn that trust", d:{confidence:2,risk:1,logic:-1}, reason:"Explicitly trusting instinct over deliberate reasoning, and being able to justify why, shows a real, earned confidence in intuition.", tradeoff:"Gains conviction, at the cost of clarity.", reveals:["Acts before being fully sure", "Chooses the less certain, more interesting path", "Trusts feeling over evidence"], tags:["bold","independent"] },
      { text:"Your reasoning, gut feelings have led you wrong too often", d:{logic:2,discipline:1,risk:-1}, reason:"Distrusting instinct specifically because of past errors shows a reasoning preference built from experience, not just temperament.", tradeoff:"Gains clarity, at the cost of upside.", reveals:["Reasons through a situation before acting", "Follows through on principle rather than convenience", "Chooses the safer, more certain path"], tags:["analytical","cautious"] },
      { text:"It depends on how much time you actually have to decide", d:{adaptability:2,planning:1,logic:1}, reason:"Making the choice conditional on circumstance rather than picking a permanent default shows a flexible decision framework.", tradeoff:"Gains flexibility, at the cost of the conviction the other path here would have offered instead.", reveals:["Changes approach when the situation shifts", "Prepares rather than improvising", "Reasons through a situation before acting"], tags:["pragmatist","curious"] } ]},
  { id:"r13", text:"Think about which feels better: someone genuinely depending on you, or needing no one at all.", illustration:"anchor", type:"reflective", tone:"serious", difficulty:"medium", purpose:"Direct self-report on dependency orientation.", measures:["independence","kindness","socialEnergy"], validates:"independence", unlockConditions:{anyTags:["warm","independent"]},
    options:[
      { text:"Being needed, there's real meaning in someone relying on you", d:{kindness:2,responsibility:1,socialEnergy:1}, reason:"Finding meaning specifically in being relied upon, rather than in freedom, shows a relationally-anchored sense of purpose.", tradeoff:"Gains goodwill, at the cost of the autonomy the other path here would have offered instead.", reveals:["Chooses someone else's comfort over their own convenience", "Takes ownership even when it costs them", "Draws energy from engaging with others"], tags:["warm","loyal"] },
      { text:"Being independent, needing no one is its own kind of relief", d:{independence:2,confidence:1,socialEnergy:-1}, reason:"Framing self-sufficiency as relief rather than isolation shows independence is a genuine preference, not a defense mechanism.", tradeoff:"Gains autonomy, at the cost of engagement.", reveals:["Chooses self-reliance over relying on others", "Acts before being fully sure", "Chooses distance over engagement"], tags:["independent"] },
      { text:"Neither feels quite right, you'd rather it be mutual", d:{trust:1,empathy:1,independence:-1}, reason:"Rejecting both poles in favor of reciprocity shows discomfort with any one-directional relational frame.", tradeoff:"Gains closeness, at the cost of autonomy.", reveals:["Extends trust before it's fully earned", "Prioritizes how someone else is feeling", "Chooses connection or reliance over going it alone"], tags:["reflective","warm"] } ]},
  { id:"r14", text:"You think about a belief you hold that you're aware most people around you don't share.", illustration:"lightbulb", type:"reflective", tone:"serious", difficulty:"medium", purpose:"Tests comfort holding minority positions under mild social isolation.", measures:["independence","confidence","openMindedness"], validates:null, unlockConditions:{anyTags:["independent","idealist"]},
    options:[
      { text:"You hold it comfortably and don't feel much need to defend it", d:{independence:2,confidence:1,emotionalStability:1}, reason:"Genuine comfort in a minority position, without needing validation, shows internal conviction that doesn't depend on consensus.", tradeoff:"Gains autonomy, at the cost of the self-knowledge the other path here would have offered instead.", reveals:["Chooses self-reliance over relying on others", "Acts before being fully sure", "Keeps a level head when things get tense"], tags:["independent","idealist"] },
      { text:"You hold it, but it does bother you a little to be the odd one out", d:{selfAwareness:1,emotionalStability:-1,confidence:1}, reason:"Keeping the belief despite real discomfort about being isolated shows conviction outweighing, but not eliminating, the social cost.", tradeoff:"Gains self-knowledge, at the cost of composure.", reveals:["Notices their own patterns in real time", "Lets the moment's weight actually register", "Backs their own judgment under pressure"], tags:["reflective","bold"] },
      { text:"You quietly soften how you express it, depending on the room", d:{adaptability:2,socialEnergy:1,confidence:-1}, reason:"Adjusting expression by audience, while still privately holding the belief, shows social calibration outranking full consistency.", tradeoff:"Gains flexibility, at the cost of conviction.", reveals:["Adjusts course rather than forcing a plan through", "Draws energy from engaging with others", "Second-guesses their own read of a situation"], tags:["pragmatist","cautious"] } ]},
  { id:"r15", text:"You consider what actually motivates you more, on average: avoiding failure or chasing success.", illustration:"compass", type:"reflective", tone:"serious", difficulty:"medium", purpose:"Direct self-theory question about approach versus avoidance motivation.", measures:["drive","risk","confidence"], validates:"drive", unlockConditions:{anyTags:["competitive","cautious"]},
    options:[
      { text:"Chasing success, the upside is what actually gets you moving", d:{drive:2,risk:1,optimism:1}, reason:"Naming reward-seeking as the primary engine, rather than fear-avoidance, is a specific, honest motivational self-report.", tradeoff:"Gains momentum, at the cost of the consistency the other path here would have offered instead.", reveals:["Pushes toward the outcome even under resistance", "Accepts uncertainty in exchange for upside", "Frames setbacks as temporary"], tags:["competitive","bold"] },
      { text:"Avoiding failure, honestly, that's the stronger pull", d:{discipline:1,planning:1,risk:-1}, reason:"Admitting avoidance is the stronger motivator, even though success-language sounds better, is an honest and less flattering self-read.", tradeoff:"Gains consistency, at the cost of upside.", reveals:["Holds a personal standard even without anyone watching", "Structures uncertainty before acting", "Protects against a worse outcome over a better one"], tags:["cautious","analytical"] },
      { text:"Neither much, you're mostly driven by curiosity about how things turn out", d:{curiosity:2,openMindedness:1,drive:-1}, reason:"Rejecting both fear and ambition as the primary driver, in favor of curiosity, points to a genuinely different motivational structure.", tradeoff:"Gains insight, at the cost of momentum.", reveals:["Follows a question rather than letting it go", "Stays open to being wrong", "Chooses ease over pushing further"], tags:["curious","independent"] } ]},
  { id:"r16", text:"You think about whether you generally forgive people faster than you forgive yourself.", illustration:"heart", type:"reflective", tone:"intimate", difficulty:"heavy", purpose:"Tests asymmetry between self-directed and other-directed forgiveness.", measures:["kindness","selfAwareness","emotionalStability"], validates:"kindness", unlockConditions:{anyTags:["reflective","intense"]},
    options:[
      { text:"Definitely others, you're much harder on yourself", d:{selfAwareness:2,discipline:1,emotionalStability:-1}, reason:"Naming a real double standard against yourself is an honest, uncomfortable, and specific self-observation.", tradeoff:"Gains self-knowledge, at the cost of composure.", reveals:["Names an uncomfortable truth about themselves", "Follows through on principle rather than convenience", "Feels the disruption rather than absorbing it quietly"], tags:["intense","idealist"] },
      { text:"Definitely yourself, other people's mistakes stick with you longer", d:{trust:-1,discipline:1,kindness:-1}, reason:"Admitting a harsher standard for others than for yourself is a less flattering but genuinely honest self-read.", tradeoff:"Gains consistency, at the cost of closeness.", reveals:["Withholds trust until it's proven", "Holds a personal standard even without anyone watching", "Chooses honesty or fairness over someone's comfort"], tags:["independent"] },
      { text:"Roughly the same, you try to hold one consistent standard", d:{discipline:2,kindness:1,selfAwareness:1}, reason:"Claiming consistency across self and others, if accurate, reflects a genuinely stable, principle-based approach to forgiveness.", tradeoff:"Gains consistency, at the quiet cost of whichever other approach this moment also allowed.", reveals:["Follows through on principle rather than convenience", "Softens a hard truth to protect someone", "Names an uncomfortable truth about themselves"], tags:["idealist","analytical"] } ]},
  { id:"r17", text:"You consider whether your sense of humor is mostly a way to connect, or mostly a way to deflect.", illustration:"masks", type:"reflective", tone:"serious", difficulty:"medium", purpose:"Tests self-honesty about the function humor actually serves.", measures:["humor","selfAwareness","emotionalStability"], validates:"humor", unlockConditions:{anyTags:["playful","reflective"]},
    options:[
      { text:"Mostly connection, it's how you get close to people", d:{humor:2,socialEnergy:1,trust:1}, reason:"Framing humor as relational glue rather than a shield shows it's functioning as intended: bringing people closer, not keeping them at bay.", tradeoff:"Gains levity, at the cost of the self-knowledge the other path here would have offered instead.", reveals:["Finds the lighter angle under pressure", "Leans toward people rather than away from them", "Gives someone the benefit of the doubt"], tags:["warm","playful"] },
      { text:"Honestly, more deflection than you'd like to admit", d:{selfAwareness:2,emotionalStability:-1,humor:1}, reason:"Admitting humor is doing defensive work, not just social work, is a specific and uncomfortable piece of self-knowledge.", tradeoff:"Gains self-knowledge, at the cost of composure.", reveals:["Notices their own patterns in real time", "Lets the moment's weight actually register", "Uses humor to navigate the moment"], tags:["reflective","intense"] },
      { text:"It depends entirely on who you're with", d:{adaptability:2,socialEnergy:1,selfAwareness:1}, reason:"Recognizing that humor's function shifts by relationship rather than staying fixed shows situational self-awareness.", tradeoff:"Gains flexibility, at the cost of the levity the other path here would have offered instead.", reveals:["Adjusts course rather than forcing a plan through", "Draws energy from engaging with others", "Notices their own patterns in real time"], tags:["analytical","curious"] } ]},
  { id:"r18", text:"Think about the last time you actually asked for help with something you probably could have muscled through alone.", illustration:"key", type:"reflective", tone:"serious", difficulty:"medium", purpose:"Tests actual, not aspirational, comfort asking for support.", measures:["independence","confidence","trust"], validates:"independence", unlockConditions:{anyTags:["independent","warm"]},
    options:[
      { text:"It comes to mind easily, asking for help has never felt like a big deal", d:{trust:2,socialEnergy:1,independence:-1}, reason:"Easy recall of asking for help, without framing it as a struggle, shows genuine comfort rather than a rare exception.", tradeoff:"Gains closeness, at the cost of autonomy.", reveals:["Gives someone the benefit of the doubt", "Leans toward people rather than away from them", "Chooses connection or reliance over going it alone"], tags:["warm","pragmatist"] },
      { text:"It's genuinely hard to think of one, you tend to work through things solo", d:{independence:2,discipline:1,trust:-1}, reason:"Difficulty recalling an instance of asking for help suggests self-reliance is a strong, consistent default, not situational.", tradeoff:"Gains autonomy, at the cost of closeness.", reveals:["Chooses self-reliance over relying on others", "Follows through on principle rather than convenience", "Stays guarded rather than assuming good faith"], tags:["independent"] },
      { text:"You can think of one, and you still feel a little odd about having needed it", d:{selfAwareness:1,confidence:-1,trust:1}, reason:"Recalling the instance but still carrying discomfort about it shows the need for help and the ease with it aren't the same thing.", tradeoff:"Gains self-knowledge, at the cost of conviction.", reveals:["Notices their own patterns in real time", "Second-guesses their own read of a situation", "Extends trust before it's fully earned"], tags:["reflective","cautious"] } ]},
  { id:"r19", text:"If everything you'd built or achieved disappeared tomorrow, think about what would still be left to define you.", illustration:"star", type:"reflective", tone:"philosophical", difficulty:"medium", purpose:"Forces a ranking between achievement-identity and relational-identity.", measures:["drive","kindness","independence"], validates:null, unlockConditions:{anyTags:["competitive","warm"]},
    options:[
      { text:"By what you've achieved, that's the part that actually feels solid", d:{drive:2,confidence:1,competitiveness:1}, reason:"Anchoring identity in accomplishment rather than relationships shows a self-concept built on demonstrable output.", tradeoff:"Gains momentum, at the cost of the goodwill the other path here would have offered instead.", reveals:["Pushes toward the outcome even under resistance", "Backs their own judgment under pressure", "Measures the situation by whether they're winning"], tags:["competitive","independent"] },
      { text:"By the people close to you, that's the part that would remain if everything else went away", d:{kindness:2,socialEnergy:1,trust:1}, reason:"Choosing relational identity as the more durable core reveals what you'd fall back on if achievement disappeared.", tradeoff:"Gains goodwill, at the cost of the momentum the other path here would have offered instead.", reveals:["Chooses someone else's comfort over their own convenience", "Draws energy from engaging with others", "Extends trust before it's fully earned"], tags:["warm","loyal"] },
      { text:"Neither, really, more by whether you stayed true to your own standards", d:{discipline:2,selfAwareness:1,independence:1}, reason:"Rejecting both external categories in favor of an internal, principle-based identity shows a distinct third anchor entirely.", tradeoff:"Gains consistency, at the cost of the momentum the other path here would have offered instead.", reveals:["Holds a personal standard even without anyone watching", "Notices their own patterns in real time", "Trusts their own judgment over consensus"], tags:["idealist","reflective"] } ]},
  { id:"r20", text:"You think about whether you actually enjoy the process of working toward a goal, or mostly just want to already be finished.", illustration:"hourglass", type:"reflective", tone:"serious", difficulty:"medium", purpose:"Tests process-orientation versus pure outcome-orientation.", measures:["persistence","drive","patience"], validates:"persistence", unlockConditions:{anyTags:["competitive","independent"]},
    options:[
      { text:"You genuinely enjoy the middle part, the working-toward is half the appeal", d:{persistence:2,patience:1,drive:1}, reason:"Genuine enjoyment of the process, not just tolerance of it, shows persistence is intrinsically rewarding, not just endured.", tradeoff:"Gains follow-through, at the cost of the autonomy the other path here would have offered instead.", reveals:["Keeps going after the initial effort stops paying off", "Tolerates discomfort rather than forcing resolution", "Pushes toward the outcome even under resistance"], tags:["idealist","independent"] },
      { text:"Honestly, you mostly just want to already be on the other side of it", d:{drive:2,patience:-1,persistence:-1}, reason:"Admitting the process itself holds little appeal is an honest, specific outcome-first motivational profile.", tradeoff:"Gains momentum, at the cost of stability.", reveals:["Pushes toward the outcome even under resistance", "Moves to resolve tension quickly", "Knows when to stop rather than pushing further"], tags:["competitive","bold"] },
      { text:"It depends entirely on whether you chose the goal yourself", d:{independence:1,drive:1,adaptability:1}, reason:"Making enjoyment conditional on ownership of the goal, rather than the goal itself, reveals autonomy as the real driver.", tradeoff:"Gains autonomy, at the cost of the follow-through the other path here would have offered instead.", reveals:["Trusts their own judgment over consensus", "Pushes toward the outcome even under resistance", "Adjusts course rather than forcing a plan through"], tags:["independent","analytical"] } ]},
  { id:"r21", text:"You consider whether the people who know you best would describe you the same way you'd describe yourself.", illustration:"mirror", type:"reflective", tone:"serious", difficulty:"medium", purpose:"Tests perceived alignment between self-image and how you're actually seen.", measures:["selfAwareness","confidence","socialEnergy"], validates:"selfAwareness", unlockConditions:{anyTags:["reflective","warm"]},
    options:[
      { text:"Pretty closely, you don't think there's much of a gap", d:{selfAwareness:2,confidence:1,emotionalStability:1}, reason:"Confidently claiming alignment between self-image and outside perception suggests either genuine accuracy or limited scrutiny of the gap.", tradeoff:"Gains self-knowledge, at the cost of the room to be wrong the other path here would have offered instead.", reveals:["Names an uncomfortable truth about themselves", "Acts before being fully sure", "Keeps a level head when things get tense"], tags:["independent","idealist"] },
      { text:"Probably not, there's likely a side of you that doesn't come across", d:{selfAwareness:1,socialEnergy:-1,openMindedness:1}, reason:"Suspecting a real gap between self-image and perception, without being certain, shows honest uncertainty about your own visibility.", tradeoff:"Gains self-knowledge, at the cost of engagement.", reveals:["Names an uncomfortable truth about themselves", "Chooses distance over engagement", "Stays open to being wrong"], tags:["reflective","cautious"] },
      { text:"You genuinely don't think about it much either way", d:{independence:1,confidence:1,selfAwareness:-1}, reason:"Not particularly caring how the two compare shows self-image isn't primarily built in reference to outside perception.", tradeoff:"Gains autonomy, at the cost of self-knowledge.", reveals:["Trusts their own judgment over consensus", "Backs their own judgment under pressure", "Doesn't examine their own reaction too closely"], tags:["independent"] } ]},
  { id:"r22", text:"You think about whether you'd rather be quietly respected by a few people, or broadly liked by many.", illustration:"star", type:"reflective", tone:"serious", difficulty:"medium", purpose:"Forces a ranking between depth and breadth of social regard.", measures:["socialEnergy","independence","confidence"], validates:null, unlockConditions:{anyTags:["independent","competitive"]},
    options:[
      { text:"Quietly respected by a few, that feels like the more real version", d:{independence:2,confidence:1,selfAwareness:1}, reason:"Choosing depth of regard over breadth, unprompted, shows a genuine preference for substance over reach.", tradeoff:"Gains autonomy, at the cost of the engagement the other path here would have offered instead.", reveals:["Chooses self-reliance over relying on others", "Acts before being fully sure", "Names an uncomfortable truth about themselves"], tags:["independent","idealist"] },
      { text:"Broadly liked, there's something appealing about being easy for people to warm to", d:{socialEnergy:2,adaptability:1,kindness:1}, reason:"Explicitly valuing wide likability over narrow respect reveals a real, specific social orientation toward breadth.", tradeoff:"Gains engagement, at the cost of the autonomy the other path here would have offered instead.", reveals:["Leans toward people rather than away from them", "Changes approach when the situation shifts", "Softens a hard truth to protect someone"], tags:["warm","playful"] },
      { text:"Neither much appeals to you as a goal in itself", d:{independence:1,openMindedness:1,confidence:1}, reason:"Rejecting both framings as things worth optimizing for shows social regard isn't a primary driver for you at all.", tradeoff:"Gains autonomy, at the cost of the self-knowledge the other path here would have offered instead.", reveals:["Chooses self-reliance over relying on others", "Stays open to being wrong", "Acts before being fully sure"], tags:["independent","reflective"] } ]},
  ],

  moral: [
  { id:"c07", text:"You're given credit in front of others for something that was actually a team effort.", illustration:"star", type:"moral", tone:"serious", difficulty:"heavy", purpose:"A genuine no-escape ethics fork: every option costs someone something, including possibly you.", measures:["responsibility","confidence","kindness"], validates:null,
    options:[
      { text:"Correct it on the spot and name who actually did the work", d:{responsibility:2,confidence:1,trust:1}, reason:"Giving up personal credit in the moment it's being handed to you, publicly, is a costly, real commitment to fairness over image.", tradeoff:"Gains accountability, at the cost of the goodwill the other path here would have offered instead.", reveals:["Accepts accountability without being asked", "Acts before being fully sure", "Gives someone the benefit of the doubt"], tags:["idealist","bold"] },
      { text:"Let the moment pass, then make sure the credit reaches them privately later", d:{responsibility:1,kindness:1,independence:1}, reason:"Still correcting the record, but avoiding the public correction, trades some fairness for social ease — a real, different cost than option A.", tradeoff:"Gains accountability, at the cost of the conviction the other path here would have offered instead.", reveals:["Accepts accountability without being asked","Softens a hard truth to protect someone","Chooses self-reliance over relying on others"], tags:["pragmatist"] },
      { text:"Accept it and mention their part only if it's specifically asked", d:{confidence:1,responsibility:-1,independence:1}, reason:"Letting misplaced credit stand unless directly challenged is a real, if uncomfortable, admission of how much the moment is worth to you.", tradeoff:"Gains conviction, at the cost of accountability.", reveals:["Backs their own judgment under pressure", "Lets responsibility sit with someone else", "Trusts their own judgment over consensus"], tags:["cautious"] } ]},
  { id:"c14", text:"You're offered a shortcut that isn't technically against any rule, but it clearly isn't what the rule was meant to allow.", illustration:"key", type:"moral", tone:"serious", difficulty:"heavy", purpose:"Distinguishes rule-literalism from rule-intent as a genuine values fork, without an escape option.", measures:["trust","competitiveness","discipline"], validates:null,
    options:[
      { text:"Take it, it's fair game if it's technically allowed", d:{competitiveness:2,risk:1,trust:-1}, reason:"Choosing letter-of-the-rule over its intent when there's a real advantage on the table is a genuine, specific value: outcomes over spirit.", tradeoff:"Gains an edge, at the cost of closeness.", reveals:["Keeps pushing rather than settling for a tie", "Chooses the less certain, more interesting path", "Stays guarded rather than assuming good faith"], tags:["competitive","pragmatist"] },
      { text:"Skip it, and quietly flag that the rule probably needs fixing", d:{discipline:2,responsibility:1}, reason:"Refusing the loophole and addressing the gap itself, rather than just personally abstaining, is a distinct, systemic form of integrity.", tradeoff:"Gains consistency, at the cost of the an edge the other path here would have offered instead.", reveals:["Follows through on principle rather than convenience", "Accepts accountability without being asked", "Holds a personal standard even without anyone watching"], tags:["idealist","analytical"] },
      { text:"Skip it for yourself, but you won't judge anyone else who takes it", d:{discipline:1,openMindedness:2,independence:1}, reason:"Holding a personal standard without projecting it onto others reflects a real, specific kind of moral individualism.", tradeoff:"Gains room to be wrong, at the cost of the an edge the other path here would have offered instead.", reveals:["Reconsiders a position when given a reason to", "Holds a personal standard even without anyone watching", "Trusts their own judgment over consensus"], tags:["independent","reflective"] } ]},
  { id:"m01", text:"You find out your close friend has been unfaithful to their partner, who is also someone you know.", illustration:"scales", type:"moral", tone:"serious", difficulty:"heavy", purpose:"Classic loyalty-versus-honesty dilemma with a real relationship on each side.", measures:["trust","kindness","responsibility"], validates:"trust", unlockConditions:{anyTags:["idealist","loyal"]},
    options:[
      { text:"Tell the partner directly, they deserve to know", d:{trust:2,responsibility:2,kindness:-1}, reason:"Prioritizing the wronged person's right to know over your friend's secret is a costly, specific stand for honesty over loyalty.", tradeoff:"Gains closeness, at the cost of goodwill.", reveals:["Gives someone the benefit of the doubt", "Accepts accountability without being asked", "Chooses honesty or fairness over someone's comfort"], tags:["idealist","bold"] },
      { text:"Keep the secret, but stop covering for it in any other way", d:{trust:-1,independence:1,kindness:1}, reason:"Protecting the friendship while refusing further complicity is a genuine middle stance, not the same as full loyalty.", tradeoff:"Gains autonomy, at the cost of closeness.", reveals:["Withholds trust until it's proven", "Trusts their own judgment over consensus", "Chooses someone else's comfort over their own convenience"], tags:["loyal","pragmatist"] },
      { text:"Push your friend hard to confess it themselves, on a real deadline", d:{leadership:1,responsibility:1,trust:1}, reason:"Refusing to either tell or fully protect, and instead forcing your friend's hand, shifts the cost onto them rather than resolving it yourself.", tradeoff:"Gains control, at the cost of the autonomy the other path here would have offered instead.", reveals:["Steps into the gap when no one else will", "Takes ownership even when it costs them", "Extends trust before it's fully earned"], tags:["idealist","bold"] } ]},
  { id:"m02", text:"You witness someone take credit for a serious mistake that was actually caused by someone else who's already struggling.", illustration:"scales", type:"moral", tone:"serious", difficulty:"heavy", purpose:"Justice-versus-mercy fork where correcting the record actively hurts someone vulnerable.", measures:["responsibility","kindness","trust"], validates:"responsibility", unlockConditions:{anyTags:["idealist","warm"]},
    options:[
      { text:"Correct the record, the truth matters even if it lands badly", d:{responsibility:2,trust:1,kindness:-1}, reason:"Choosing accuracy even when it worsens someone's already hard situation is a real, costly commitment to fairness.", tradeoff:"Gains accountability, at the cost of goodwill.", reveals:["Takes ownership even when it costs them", "Extends trust before it's fully earned", "Chooses honesty or fairness over someone's comfort"], tags:["idealist","bold"] },
      { text:"Say nothing publicly, but quietly help the struggling person recover from it", d:{kindness:2,empathy:1,responsibility:-1}, reason:"Letting the misattribution stand while working around it to help the person harmed is a genuine, different form of care.", tradeoff:"Gains goodwill, at the cost of accountability.", reveals:["Chooses someone else's comfort over their own convenience", "Prioritizes how someone else is feeling", "Lets responsibility sit with someone else"], tags:["warm","pragmatist"] },
      { text:"Go directly to the person who took credit and demand they fix it themselves", d:{leadership:1,confidence:1,responsibility:1}, reason:"Forcing the responsible party to correct it themselves, rather than doing it for them or staying silent, shifts accountability without you absorbing the fallout.", tradeoff:"Gains control, at the cost of the closeness the other path here would have offered instead.", reveals:["Takes the lead without being asked", "Acts before being fully sure", "Accepts accountability without being asked"], tags:["bold","idealist"] } ]},
  { id:"m03", text:"You can guarantee a good outcome for someone you love by being dishonest with someone else who trusts you completely.", illustration:"key", type:"moral", tone:"serious", difficulty:"heavy", purpose:"Direct conflict between two real people's interests with no third path available.", measures:["trust","kindness","responsibility"], validates:"trust", unlockConditions:{anyTags:["loyal","idealist"]},
    options:[
      { text:"Go through with it, the person you love matters more here", d:{kindness:2,trust:-2}, reason:"Choosing loyalty to someone you love over honesty to someone who trusts you is a real, specific ranking of relationships.", tradeoff:"Gains goodwill, at the cost of closeness.", reveals:["Softens a hard truth to protect someone", "Stays guarded rather than assuming good faith", "Chooses someone else's comfort over their own convenience"], tags:["loyal","warm"] },
      { text:"Refuse, and tell the person you love you won't do it this way", d:{trust:2,responsibility:1,kindness:-1}, reason:"Protecting your own integrity even at the cost of disappointing someone you love shows principle outranking closeness here.", tradeoff:"Gains closeness, at the cost of goodwill.", reveals:["Gives someone the benefit of the doubt", "Accepts accountability without being asked", "Chooses honesty or fairness over someone's comfort"], tags:["idealist","independent"] },
      { text:"Tell the trusting person the full truth yourself, and let the outcome fall where it falls", d:{trust:2,responsibility:2,kindness:-2}, reason:"Refusing to be dishonest at all, even by omission, and accepting whatever damage that causes, is the costliest but most principle-driven path.", tradeoff:"Gains closeness, at the cost of goodwill.", reveals:["Gives someone the benefit of the doubt", "Accepts accountability without being asked", "Chooses honesty or fairness over someone's comfort"], tags:["idealist","bold"] } ]},
  { id:"m04", text:"You can help one of two people who both genuinely need it, but not both, and time is running out to decide.", illustration:"bridge", type:"moral", tone:"serious", difficulty:"heavy", purpose:"A forced allocation dilemma with no way to split the resource.", measures:["kindness","logic","responsibility"], validates:null, unlockConditions:{anyTags:["intense","analytical"]},
    options:[
      { text:"Help whichever one you're closer to, that bond means something", d:{kindness:1,trust:1,logic:-1}, reason:"Letting closeness decide, rather than treating both needs as equal, is an honest, specific prioritization of relationship over impartiality.", tradeoff:"Gains goodwill, at the cost of clarity.", reveals:["Chooses someone else's comfort over their own convenience", "Extends trust before it's fully earned", "Leans on instinct over analysis"], tags:["loyal","warm"] },
      { text:"Help whichever one's need is objectively more urgent, regardless of closeness", d:{logic:2,responsibility:1,kindness:-1}, reason:"Overriding personal closeness in favor of a more impartial standard shows fairness ranked above relationship here.", tradeoff:"Gains clarity, at the cost of goodwill.", reveals:["Reasons through a situation before acting", "Accepts accountability without being asked", "Chooses honesty or fairness over someone's comfort"], tags:["idealist","analytical"] },
      { text:"Make the call fast on instinct and live with not being sure it was right", d:{confidence:1,risk:1,emotionalStability:-1}, reason:"Accepting a decision made under real uncertainty, rather than freezing, shows a willingness to act despite the cost of doubt.", tradeoff:"Gains conviction, at the cost of composure.", reveals:["Backs their own judgment under pressure", "Accepts uncertainty in exchange for upside", "Lets the moment's weight actually register"], tags:["bold","intense"] } ]},
  { id:"m05", text:"You discover a way to get real, lasting recognition for your work, but it requires letting someone else believe something untrue about their own contribution.", illustration:"star", type:"moral", tone:"serious", difficulty:"heavy", purpose:"Ambition-versus-honesty where the dishonesty is passive, by omission, not an active lie.", measures:["responsibility","competitiveness","trust"], validates:"responsibility", unlockConditions:{anyTags:["competitive","idealist"]},
    options:[
      { text:"Let the misunderstanding stand and take the recognition", d:{competitiveness:2,drive:1,trust:-2}, reason:"Accepting a real gain built on someone else's false belief, even passively, is a specific and costly choice about what recognition is worth to you.", tradeoff:"Gains an edge, at the cost of closeness.", reveals:["Keeps pushing rather than settling for a tie", "Stays guarded rather than assuming good faith", "Keeps moving rather than settling"], tags:["competitive","bold"] },
      { text:"Correct their understanding, even though it costs you the recognition", d:{trust:2,responsibility:2,competitiveness:-1}, reason:"Actively giving up a real gain to prevent someone else's false belief from standing shows honesty outranking ambition.", tradeoff:"Gains closeness, at the cost of an edge.", reveals:["Gives someone the benefit of the doubt", "Accepts accountability without being asked", "Steps back from a contest rather than pressing an advantage"], tags:["idealist","independent"] },
      { text:"Take partial recognition and make sure they still get real credit too", d:{responsibility:1,creativity:1,competitiveness:1}, reason:"Refusing the clean binary and engineering a split outcome shows a preference for shared truth over either full gain or full sacrifice.", tradeoff:"Gains accountability, at the cost of the momentum the other path here would have offered instead.", reveals:["Accepts accountability without being asked", "Builds a new option instead of picking a given one", "Keeps pushing rather than settling for a tie"], tags:["pragmatist","analytical"] } ]},
  { id:"m06", text:"Someone asks you to keep a secret that, if kept, protects them but leaves someone else genuinely misinformed about something that affects their life.", illustration:"key", type:"moral", tone:"serious", difficulty:"heavy", purpose:"Confidentiality versus a third party's right to relevant information.", measures:["trust","responsibility","independence"], validates:"trust", unlockConditions:{anyTags:["loyal","idealist"]},
    options:[
      { text:"Keep the secret exactly as asked", d:{trust:1,responsibility:-1}, reason:"Honoring the specific request even at a real cost to a third party's informed decisions shows confidentiality weighted very heavily.", tradeoff:"Gains closeness, at the cost of accountability.", reveals:["Extends trust before it's fully earned", "Lets responsibility sit with someone else", "Gives someone the benefit of the doubt"], tags:["loyal"] },
      { text:"Tell the person who asked that you can't keep this one, and let them decide what happens next", d:{responsibility:2,trust:1,confidence:1}, reason:"Refusing complicity while still not unilaterally breaking the confidence yourself is a distinct middle path with its own real cost.", tradeoff:"Gains accountability, at the cost of the originality the other path here would have offered instead.", reveals:["Accepts accountability without being asked", "Gives someone the benefit of the doubt", "Acts before being fully sure"], tags:["idealist","bold"] },
      { text:"Find a way to get the missing information to the third party without naming the source", d:{creativity:2,responsibility:1,trust:-1}, reason:"Trying to serve both obligations by protecting the source while still surfacing the truth is a resourceful, if riskier, third path.", tradeoff:"Gains originality, at the cost of closeness.", reveals:["Reaches for an unconventional solution", "Takes ownership even when it costs them", "Withholds trust until it's proven"], tags:["analytical","pragmatist"] } ]},
  { id:"m07", text:"You have to decide whether to enforce a rule exactly as written on someone who broke it for a genuinely sympathetic reason.", illustration:"scales", type:"moral", tone:"serious", difficulty:"heavy", purpose:"Justice-as-consistency versus justice-as-context.", measures:["discipline","empathy","responsibility"], validates:"discipline", unlockConditions:{anyTags:["analytical","warm"]},
    options:[
      { text:"Enforce it exactly as written, the rule has to mean the same thing for everyone", d:{discipline:2,responsibility:1,empathy:-1}, reason:"Holding the line even against a sympathetic exception shows consistency valued over context here.", tradeoff:"Gains consistency, at the cost of connection.", reveals:["Follows through on principle rather than convenience", "Accepts accountability without being asked", "Prioritizes the outcome over someone's feelings"], tags:["idealist","analytical"] },
      { text:"Make an exception, the reason behind it genuinely changes what's fair here", d:{empathy:2,kindness:1,discipline:-1}, reason:"Bending a rule for context, even knowing it sets a precedent, shows fairness understood as situational rather than absolute.", tradeoff:"Gains connection, at the cost of consistency.", reveals:["Prioritizes how someone else is feeling", "Chooses someone else's comfort over their own convenience", "Lets a standard slide when it's inconvenient"], tags:["warm","pragmatist"] },
      { text:"Enforce it, but do what you can afterward to soften the actual consequence", d:{responsibility:1,kindness:1,discipline:1}, reason:"Refusing to bend the rule itself while still working to reduce its impact shows both consistency and empathy operating together, at some cost to each.", tradeoff:"Gains accountability, at the cost of the connection the other path here would have offered instead.", reveals:["Takes ownership even when it costs them", "Chooses someone else's comfort over their own convenience", "Holds a personal standard even without anyone watching"], tags:["pragmatist","idealist"] } ]},
  { id:"m08", text:"You can prevent a real, upcoming disappointment for someone you care about, but only by taking a choice away from them without telling them.", illustration:"puzzle", type:"moral", tone:"serious", difficulty:"heavy", purpose:"Protective paternalism versus respecting someone's right to their own outcome.", measures:["independence","kindness","trust"], validates:"independence", unlockConditions:{anyTags:["warm","independent"]},
    options:[
      { text:"Step in and quietly redirect things so they never have to face it", d:{kindness:2,independence:-1,trust:-1}, reason:"Choosing to protect someone from pain by overriding their autonomy, without their knowledge, is a real and costly paternalism.", tradeoff:"Gains goodwill, at the cost of autonomy.", reveals:["Softens a hard truth to protect someone", "Chooses connection or reliance over going it alone", "Stays guarded rather than assuming good faith"], tags:["warm","loyal"] },
      { text:"Let them face it, it's their outcome to have, even if it hurts", d:{independence:2,trust:1,kindness:-1}, reason:"Respecting someone's right to their own disappointment, even when you could prevent it, shows autonomy outranking protection.", tradeoff:"Gains autonomy, at the cost of goodwill.", reveals:["Trusts their own judgment over consensus", "Extends trust before it's fully earned", "Chooses honesty or fairness over someone's comfort"], tags:["independent","idealist"] },
      { text:"Tell them what you see coming and let them decide how to handle it", d:{trust:2,empathy:1,confidence:1}, reason:"Giving them the information rather than deciding for them, even though it removes the element of surprise, respects their agency while still caring enough to warn them.", tradeoff:"Gains closeness, at the cost of the goodwill the other path here would have offered instead.", reveals:["Extends trust before it's fully earned", "Prioritizes how someone else is feeling", "Backs their own judgment under pressure"], tags:["idealist","warm"] } ]},
  { id:"m09", text:"You're the only one who can stop a plan you helped build, once you realize it will genuinely hurt someone who trusted the group.", illustration:"bridge", type:"moral", tone:"serious", difficulty:"heavy", purpose:"Personal cost of principle: stopping something you helped create.", measures:["responsibility","leadership","persistence"], validates:null, unlockConditions:{anyTags:["idealist","bold"]},
    options:[
      { text:"Stop it, even though you helped build it and it'll cost you credibility", d:{responsibility:2,confidence:1,persistence:-1}, reason:"Reversing your own position publicly, at real cost to your standing, shows principle outweighing consistency or pride.", tradeoff:"Gains accountability, at the cost of follow-through.", reveals:["Accepts accountability without being asked", "Acts before being fully sure", "Knows when to stop rather than pushing further"], tags:["idealist","bold"] },
      { text:"Try to quietly modify it so the harm is minimized without stopping it entirely", d:{creativity:1,responsibility:1,leadership:1}, reason:"Working within the plan to reduce harm, rather than halting it outright, reflects a preference for repair over rupture.", tradeoff:"Gains originality, at the cost of the conviction the other path here would have offered instead.", reveals:["Reaches for an unconventional solution", "Takes ownership even when it costs them", "Steps into the gap when no one else will"], tags:["pragmatist","analytical"] },
      { text:"Let it proceed, you already committed and others are counting on it too", d:{persistence:1,responsibility:-1}, reason:"Prioritizing your commitment to the group over the harm you now foresee is a real, uncomfortable but honest choice.", tradeoff:"Gains follow-through, at the cost of accountability.", reveals:["Sees something through past the easy stopping point", "Lets responsibility sit with someone else", "Keeps going after the initial effort stops paying off"], tags:["loyal","independent"] } ]},
  { id:"m10", text:"You can take an opportunity that's clearly better for you, knowing it will cost someone else something they can't easily recover from.", illustration:"roadsplit", type:"moral", tone:"serious", difficulty:"heavy", purpose:"Self-interest versus someone else's real, disproportionate cost.", measures:["competitiveness","empathy","independence"], validates:"competitiveness", unlockConditions:{anyTags:["competitive","warm"]},
    options:[
      { text:"Take it, opportunities like this don't come around twice", d:{competitiveness:2,drive:1,empathy:-1}, reason:"Choosing a real personal gain over someone else's disproportionate loss is a specific, honest statement about where self-interest sits for you.", tradeoff:"Gains an edge, at the cost of connection.", reveals:["Measures the situation by whether they're winning", "Pushes toward the outcome even under resistance", "Prioritizes the outcome over someone's feelings"], tags:["competitive","bold"] },
      { text:"Pass on it, you couldn't live with what it costs them", d:{empathy:2,kindness:1,competitiveness:-1}, reason:"Giving up a genuine advantage specifically because of its cost to someone else shows empathy outweighing ambition here.", tradeoff:"Gains connection, at the cost of an edge.", reveals:["Reads the emotional stakes before acting", "Softens a hard truth to protect someone", "Steps back from a contest rather than pressing an advantage"], tags:["warm","idealist"] },
      { text:"Take it, but do what you can afterward to help them recover from the cost", d:{competitiveness:1,responsibility:1,kindness:1}, reason:"Accepting the gain while committing to offset the damage shows an attempt to hold both self-interest and care at once, at a real cost to the cleanness of either.", tradeoff:"Gains an edge, at the cost of the momentum the other path here would have offered instead.", reveals:["Keeps pushing rather than settling for a tie", "Accepts accountability without being asked", "Softens a hard truth to protect someone"], tags:["pragmatist","analytical"] } ]},
  ],

  emotional: [
  { id:"c11", text:"You find out a decision you made a while ago accidentally hurt someone you care about.", illustration:"heart", type:"emotional", tone:"intimate", difficulty:"heavy", purpose:"Tests guilt processing and repair instinct when intent was never malicious.", measures:["empathy","responsibility","emotionalStability"], validates:"empathy",
    options:[
      { text:"Reach out immediately, even though it's uncomfortable to bring up", d:{empathy:2,responsibility:2,confidence:-1}, reason:"Reopening a closed, uncomfortable topic unprompted to make it right costs real comfort, showing repair matters more than avoiding awkwardness.", tradeoff:"Gains connection, at the cost of conviction.", reveals:["Reads the emotional stakes before acting", "Accepts accountability without being asked", "Lets doubt slow down a decision"], tags:["idealist","warm"] },
      { text:"Wait for the right moment so it doesn't feel forced or sudden", d:{planning:1,empathy:1,patience:1}, reason:"Still intending repair, but on a timeline chosen for their comfort rather than your urgency, shows a different, more measured form of care.", tradeoff:"Gains preparedness, at the cost of the accountability the other path here would have offered instead.", reveals:["Prepares rather than improvising", "Reads the emotional stakes before acting", "Lets a situation play out before intervening"], tags:["pragmatist"] },
      { text:"Carry the guilt privately and let your future actions make up for it", d:{responsibility:1,emotionalStability:-1,independence:1}, reason:"Choosing silent compensation over direct acknowledgment is a genuine, if avoidant, way of taking responsibility.", tradeoff:"Gains accountability, at the cost of composure.", reveals:["Takes ownership even when it costs them", "Lets the moment's weight actually register", "Trusts their own judgment over consensus"], tags:["cautious","reflective"] } ]},
  { id:"em01", text:"You have feelings for a close friend, and saying so could either deepen the friendship or end it completely.", illustration:"heart", type:"emotional", tone:"intimate", difficulty:"heavy", purpose:"Classic vulnerability-versus-safety fork with a real, named relationship at stake.", measures:["risk","confidence","trust"], validates:"risk", unlockConditions:{anyTags:["intense","bold"]},
    options:[
      { text:"Tell them, the uncertainty of not knowing is worse than the risk", d:{risk:2,confidence:1,emotionalStability:-1}, reason:"Choosing to risk a valued friendship rather than live with unspoken feelings shows honesty with yourself outweighing safety.", tradeoff:"Gains upside, at the cost of composure.", reveals:["Accepts uncertainty in exchange for upside", "Backs their own judgment under pressure", "Lets the moment's weight actually register"], tags:["bold","idealist"] },
      { text:"Keep it to yourself and let the friendship stay exactly as it is", d:{patience:1,independence:1,risk:-2}, reason:"Protecting a known good over a possible better one shows real risk-aversion specifically where it costs the most.", tradeoff:"Gains stability, at the cost of upside.", reveals:["Protects against a worse outcome over a better one", "Tolerates discomfort rather than forcing resolution", "Trusts their own judgment over consensus"], tags:["cautious","loyal"] },
      { text:"Let it show a little and see how they respond before deciding anything further", d:{emotionalStability:1,adaptability:1,confidence:1}, reason:"Testing the water incrementally rather than committing to either extreme shows a measured, information-gathering approach to vulnerability.", tradeoff:"Gains composure, at the cost of the upside the other path here would have offered instead.", reveals:["Stays steady under pressure", "Adjusts course rather than forcing a plan through", "Backs their own judgment under pressure"], tags:["pragmatist","reflective"] } ]},
  { id:"em02", text:"You could make an irreversible sacrifice, right now, to meaningfully help someone you love.", illustration:"heart", type:"emotional", tone:"intimate", difficulty:"heavy", purpose:"Tests where self-preservation sits relative to love, when the cost is permanent.", measures:["kindness","independence","resilience"], validates:null, unlockConditions:{anyTags:["loyal","intense"]},
    options:[
      { text:"Do it without much hesitation, this is what love actually costs sometimes", d:{kindness:2,resilience:1,independence:-1}, reason:"Accepting a permanent personal cost quickly, without extended deliberation, shows the sacrifice barely registers as a choice at all.", tradeoff:"Gains goodwill, at the cost of autonomy.", reveals:["Softens a hard truth to protect someone", "Treats a setback as temporary", "Chooses connection or reliance over going it alone"], tags:["loyal","warm"] },
      { text:"Do it, but you'll carry what it cost you for a long time", d:{kindness:1,emotionalStability:-1,resilience:1}, reason:"Following through while openly acknowledging the lasting cost shows love winning without pretending the sacrifice is free.", tradeoff:"Gains goodwill, at the cost of composure.", reveals:["Chooses someone else's comfort over their own convenience", "Lets the moment's weight actually register", "Recovers forward rather than dwelling"], tags:["intense","idealist"] },
      { text:"Look hard for a version that helps them without being irreversible", d:{creativity:1,planning:1,independence:1}, reason:"Refusing to accept the sacrifice as truly necessary until every alternative is exhausted shows self-preservation still has real weight for you.", tradeoff:"Gains originality, at the cost of the goodwill the other path here would have offered instead.", reveals:["Reaches for an unconventional solution", "Structures uncertainty before acting", "Trusts their own judgment over consensus"], tags:["analytical","independent"] } ]},
  { id:"em03", text:"You think about someone you've lost touch with, or lost entirely, who you never got to say something important to.", illustration:"heart", type:"emotional", tone:"intimate", difficulty:"heavy", purpose:"Tests how unresolved emotional business is carried or released.", measures:["emotionalStability","resilience","selfAwareness"], validates:"emotionalStability", unlockConditions:{anyTags:["reflective","intense"]},
    options:[
      { text:"You've found peace with it, even without ever getting to say it", d:{resilience:2,emotionalStability:1,optimism:1}, reason:"Reaching genuine peace without the closure of actually saying it shows real internal resolution, not avoidance.", tradeoff:"Gains forward motion, at the cost of the self-knowledge the other path here would have offered instead.", reveals:["Treats a setback as temporary", "Keeps a level head when things get tense", "Expects things to work out"], tags:["independent","idealist"] },
      { text:"It still catches you off guard sometimes, even now", d:{emotionalStability:-1,selfAwareness:1,persistence:1}, reason:"Admitting it still surfaces unexpectedly, rather than claiming it's fully settled, is an honest, specific emotional read.", tradeoff:"Gains self-knowledge, at the cost of composure.", reveals:["Lets the moment's weight actually register", "Notices their own patterns in real time", "Keeps going after the initial effort stops paying off"], tags:["intense","reflective"] },
      { text:"You've found other ways to say it, even if they'll never hear it", d:{creativity:1,kindness:1,emotionalStability:1}, reason:"Actively creating a substitute form of closure shows a specific, resourceful way of processing something unfinished.", tradeoff:"Gains originality, at the cost of the forward motion the other path here would have offered instead.", reveals:["Reaches for an unconventional solution", "Chooses someone else's comfort over their own convenience", "Stays steady under pressure"], tags:["reflective","warm"] } ]},
  { id:"em04", text:"Someone in your family disappointed you in a way that still affects how you see them.", illustration:"heart", type:"emotional", tone:"intimate", difficulty:"heavy", purpose:"Family loyalty versus honest disappointment, a harder version of forgiveness.", measures:["kindness","trust","emotionalStability"], validates:"trust", unlockConditions:{anyTags:["loyal","intense"]},
    options:[
      { text:"You've mostly let it go, family gets a different standard than most people", d:{kindness:2,patience:1,trust:1}, reason:"Extending a specifically higher tolerance to family, by name, shows a deliberate, not automatic, forgiveness standard.", tradeoff:"Gains goodwill, at the cost of the self-knowledge the other path here would have offered instead.", reveals:["Chooses someone else's comfort over their own convenience", "Tolerates discomfort rather than forcing resolution", "Extends trust before it's fully earned"], tags:["loyal","warm"] },
      { text:"You've forgiven it, but the way you see them has genuinely changed", d:{selfAwareness:2,emotionalStability:1,trust:-1}, reason:"Separating forgiveness from restored trust shows a nuanced, honest emotional accounting rather than an all-or-nothing resolution.", tradeoff:"Gains self-knowledge, at the cost of closeness.", reveals:["Notices their own patterns in real time", "Stays steady under pressure", "Withholds trust until it's proven"], tags:["reflective","idealist"] },
      { text:"You haven't really forgiven it, and you're not sure you owe that yet", d:{independence:1,confidence:1,trust:-2}, reason:"Refusing forgiveness on a timeline that isn't yours, even for family, shows real boundaries around what's owed automatically.", tradeoff:"Gains autonomy, at the cost of closeness.", reveals:["Withholds trust until it's proven", "Trusts their own judgment over consensus", "Backs their own judgment under pressure"], tags:["independent","bold"] } ]},
  { id:"em05", text:"You consider whether you've ever felt genuinely lonely in a room full of people who care about you.", illustration:"anchor", type:"emotional", tone:"intimate", difficulty:"heavy", purpose:"Distinguishes loneliness from isolation, a specific and revealing distinction.", measures:["socialEnergy","selfAwareness","emotionalStability"], validates:null, unlockConditions:{anyTags:["reflective","intense"]},
    options:[
      { text:"Yes, more than once, and it's a strange kind of lonely to explain", d:{selfAwareness:2,emotionalStability:-1,openMindedness:1}, reason:"Naming a specific, hard-to-articulate feeling shows deep self-observation rather than a generic answer.", tradeoff:"Gains self-knowledge, at the cost of composure.", reveals:["Names an uncomfortable truth about themselves", "Feels the disruption rather than absorbing it quietly", "Stays open to being wrong"], tags:["reflective","intense"] },
      { text:"Not really, being around people who care tends to actually reach you", d:{socialEnergy:2,trust:1,optimism:1}, reason:"Genuine relief from presence, rather than performed contentment, shows connection functionally working for you as intended.", tradeoff:"Gains engagement, at the cost of the self-knowledge the other path here would have offered instead.", reveals:["Draws energy from engaging with others", "Extends trust before it's fully earned", "Frames setbacks as temporary"], tags:["warm","loyal"] },
      { text:"You're honestly not sure you'd recognize it if it happened", d:{selfAwareness:-1,independence:1,curiosity:1}, reason:"Admitting uncertainty about your own emotional state, rather than claiming clarity either way, is an honest and specific limit of self-knowledge.", tradeoff:"Gains autonomy, at the cost of self-knowledge.", reveals:["Doesn't examine their own reaction too closely", "Trusts their own judgment over consensus", "Chooses exploration over certainty"], tags:["independent","cautious"] } ]},
  { id:"em06", text:"You think about whether you've ever loved someone more than they loved you back, and whether you've made peace with that.", illustration:"heart", type:"emotional", tone:"intimate", difficulty:"heavy", purpose:"Tests processing of asymmetric love, a common but rarely named experience.", measures:["emotionalStability","confidence","resilience"], validates:"emotionalStability", unlockConditions:{anyTags:["intense","reflective"]},
    options:[
      { text:"Yes, and you've made real peace with it, it doesn't define how you love now", d:{resilience:2,emotionalStability:1,optimism:1}, reason:"Genuine resolution that doesn't color future relationships shows real emotional processing rather than lingering guardedness.", tradeoff:"Gains forward motion, at the cost of the self-knowledge the other path here would have offered instead.", reveals:["Treats a setback as temporary", "Keeps a level head when things get tense", "Expects things to work out"], tags:["idealist","independent"] },
      { text:"Yes, and honestly, it still shapes how carefully you love now", d:{selfAwareness:1,trust:-1,resilience:1}, reason:"Admitting the imbalance still influences your caution today is an honest, specific, less comfortable disclosure.", tradeoff:"Gains self-knowledge, at the cost of closeness.", reveals:["Names an uncomfortable truth about themselves", "Stays guarded rather than assuming good faith", "Treats a setback as temporary"], tags:["cautious","reflective"] },
      { text:"You try hard not to keep score like that in the first place", d:{kindness:1,openMindedness:1,confidence:1}, reason:"Rejecting the framing of love as something measured or balanced shows a distinct philosophy about how it should work.", tradeoff:"Gains goodwill, at the cost of the forward motion the other path here would have offered instead.", reveals:["Softens a hard truth to protect someone", "Stays open to being wrong", "Acts before being fully sure"], tags:["idealist","warm"] } ]},
  { id:"em07", text:"You consider a moment you were genuinely, deeply proud of someone else, more than you've ever told them.", illustration:"star", type:"emotional", tone:"intimate", difficulty:"medium", purpose:"Tests whether love and pride get expressed or just privately held.", measures:["kindness","socialEnergy","confidence"], validates:null, unlockConditions:{anyTags:["warm","loyal"]},
    options:[
      { text:"You should probably just tell them, so you decide to", d:{confidence:2,kindness:1,socialEnergy:1}, reason:"Acting on the realization rather than just noting it shows expression winning over the comfort of staying private.", tradeoff:"Gains conviction, at the cost of the self-knowledge the other path here would have offered instead.", reveals:["Backs their own judgment under pressure", "Chooses someone else's comfort over their own convenience", "Draws energy from engaging with others"], tags:["warm","bold"] },
      { text:"You think about telling them, but it stays unsaid, as usual", d:{socialEnergy:-1,selfAwareness:1,confidence:-1}, reason:"Naming the pattern of holding back, honestly, without pretending you'll change it, is a real self-observation.", tradeoff:"Gains self-knowledge, at the cost of engagement.", reveals:["Chooses distance over engagement", "Names an uncomfortable truth about themselves", "Lets doubt slow down a decision"], tags:["reflective","cautious"] },
      { text:"You show it in how you treat them instead of saying it outright", d:{kindness:2,responsibility:1,socialEnergy:-1}, reason:"Choosing action over words as your love language shows a specific, consistent way of expressing care that doesn't require saying it.", tradeoff:"Gains goodwill, at the cost of engagement.", reveals:["Softens a hard truth to protect someone", "Accepts accountability without being asked", "Chooses distance over engagement"], tags:["independent","loyal"] } ]},
  { id:"em08", text:"You think about whether you trust people quickly and get hurt sometimes, or trust slowly and miss out sometimes.", illustration:"key", type:"emotional", tone:"intimate", difficulty:"medium", purpose:"Direct self-report on trust calibration and its known cost.", measures:["trust","risk","emotionalStability"], validates:"trust", unlockConditions:{anyTags:["warm","cautious"]},
    options:[
      { text:"Quickly, and yes, it's cost you before, but you'd rather risk it than close off", d:{trust:2,risk:1,openMindedness:1}, reason:"Continuing to trust quickly despite known past cost shows the value placed on openness outweighs the pain of being wrong.", tradeoff:"Gains closeness, at the cost of the consistency the other path here would have offered instead.", reveals:["Gives someone the benefit of the doubt", "Chooses the less certain, more interesting path", "Stays open to being wrong"], tags:["warm","adventurous"] },
      { text:"Slowly, and you're at peace with whatever that costs you in missed connection", d:{trust:-1,discipline:1,independence:1}, reason:"Accepting the tradeoff of slower trust, including its real cost, shows a deliberate, examined caution rather than fear.", tradeoff:"Gains consistency, at the cost of closeness.", reveals:["Stays guarded rather than assuming good faith", "Follows through on principle rather than convenience", "Chooses self-reliance over relying on others"], tags:["cautious","independent"] },
      { text:"It's changed a lot depending on who's hurt you most recently", d:{emotionalStability:-1,adaptability:1,selfAwareness:1}, reason:"Admitting your trust calibration shifts with recent experience, rather than staying fixed, is an honest, specific volatility.", tradeoff:"Gains flexibility, at the cost of composure.", reveals:["Lets the moment's weight actually register", "Adjusts course rather than forcing a plan through", "Notices their own patterns in real time"], tags:["reflective","intense"] } ]},
  { id:"em09", text:"You consider the last time you truly needed someone and whether you actually let them see that.", illustration:"anchor", type:"emotional", tone:"intimate", difficulty:"heavy", purpose:"Tests the gap between needing support and being willing to show it.", measures:["independence","trust","emotionalStability"], validates:"independence", unlockConditions:{anyTags:["independent","reflective"]},
    options:[
      { text:"You let them see it fully, there wasn't much point hiding it", d:{trust:2,socialEnergy:1,independence:-1}, reason:"Full, unguarded visibility in a moment of real need shows trust operating even under the most vulnerable conditions.", tradeoff:"Gains closeness, at the cost of autonomy.", reveals:["Extends trust before it's fully earned", "Draws energy from engaging with others", "Chooses connection or reliance over going it alone"], tags:["warm","idealist"] },
      { text:"You let them help, but you kept a version of yourself composed the whole time", d:{discipline:1,independence:1,emotionalStability:1}, reason:"Accepting support while still maintaining some composure shows need and self-control coexisting rather than one overriding the other.", tradeoff:"Gains consistency, at the cost of the closeness the other path here would have offered instead.", reveals:["Follows through on principle rather than convenience", "Chooses self-reliance over relying on others", "Keeps a level head when things get tense"], tags:["independent","cautious"] },
      { text:"Honestly, you don't think you let them fully see it, even now", d:{independence:2,selfAwareness:1,trust:-1}, reason:"Admitting you kept real need hidden even from someone close is an honest, specific, less comfortable disclosure about your own guardedness.", tradeoff:"Gains autonomy, at the cost of closeness.", reveals:["Chooses self-reliance over relying on others", "Names an uncomfortable truth about themselves", "Stays guarded rather than assuming good faith"], tags:["independent","intense"] } ]},
  { id:"em10", text:"You think about whether you've ever forgiven someone mostly for your own sake, not really for theirs.", illustration:"scales", type:"emotional", tone:"intimate", difficulty:"heavy", purpose:"Tests understanding of forgiveness as self-directed relief versus relational repair.", measures:["kindness","selfAwareness","independence"], validates:"kindness", unlockConditions:{anyTags:["reflective","idealist"]},
    options:[
      { text:"Yes, and you're fine with that being the real reason", d:{selfAwareness:2,independence:1,kindness:1}, reason:"Naming self-interest as a legitimate motive for forgiveness, without discomfort, shows a mature, unsentimental view of it.", tradeoff:"Gains self-knowledge, at the cost of the consistency the other path here would have offered instead.", reveals:["Notices their own patterns in real time", "Trusts their own judgment over consensus", "Chooses someone else's comfort over their own convenience"], tags:["independent","idealist"] },
      { text:"You'd like to think it was for them, but honestly, probably not entirely", d:{selfAwareness:2,confidence:-1,kindness:-1}, reason:"Admitting the less flattering truth behind your own forgiveness, rather than the comfortable story, is a real act of honesty.", tradeoff:"Gains self-knowledge, at the cost of conviction.", reveals:["Notices their own patterns in real time", "Second-guesses their own read of a situation", "Chooses honesty or fairness over someone's comfort"], tags:["reflective","intense"] },
      { text:"You try to make sure it's genuinely for the other person, not just relief", d:{kindness:2,discipline:1,empathy:1}, reason:"Actively checking your own motive and steering it toward the other person shows forgiveness treated as a discipline, not just a feeling.", tradeoff:"Gains goodwill, at the cost of the self-knowledge the other path here would have offered instead.", reveals:["Softens a hard truth to protect someone", "Follows through on principle rather than convenience", "Reads the emotional stakes before acting"], tags:["idealist","warm"] } ]},
  { id:"em11", text:"You consider whether the people who love you know the version of you that exists when no one's watching.", illustration:"masks", type:"emotional", tone:"intimate", difficulty:"heavy", purpose:"Tests perceived gap between the private self and the self shown to loved ones.", measures:["trust","selfAwareness","independence"], validates:"trust", unlockConditions:{anyTags:["intense","independent"]},
    options:[
      { text:"Mostly yes, there isn't that much distance between the two versions", d:{trust:2,emotionalStability:1,selfAwareness:1}, reason:"Claiming close alignment between private and shown selves suggests real integration rather than compartmentalization.", tradeoff:"Gains closeness, at the cost of the autonomy the other path here would have offered instead.", reveals:["Gives someone the benefit of the doubt", "Keeps a level head when things get tense", "Names an uncomfortable truth about themselves"], tags:["idealist","warm"] },
      { text:"Some of them do, but not all, and that's been on purpose", d:{independence:1,trust:-1,selfAwareness:1}, reason:"Deliberately gating access to your private self, even from people who love you, shows a specific, examined kind of guardedness.", tradeoff:"Gains autonomy, at the cost of closeness.", reveals:["Trusts their own judgment over consensus", "Withholds trust until it's proven", "Notices their own patterns in real time"], tags:["independent","cautious"] },
      { text:"Probably not, and that gap bothers you more than you usually let on", d:{selfAwareness:2,emotionalStability:-1,trust:-1}, reason:"Admitting the gap exists and that it's a real source of discomfort, unprompted, is a costly and honest disclosure.", tradeoff:"Gains self-knowledge, at the cost of composure.", reveals:["Names an uncomfortable truth about themselves", "Feels the disruption rather than absorbing it quietly", "Stays guarded rather than assuming good faith"], tags:["reflective","intense"] } ]},
  ],

  weird: [
  { id:"c09", text:"You can only ever keep one memory for the rest of your life. Every other one will fade completely.", illustration:"hourglass", type:"weird", tone:"philosophical", difficulty:"heavy", purpose:"Forces a value ranking (identity vs. connection vs. achievement) with no real-world escape.", measures:["selfAwareness","kindness","openMindedness"], validates:null,
    options:[
      { text:"A memory of the person you love most", d:{kindness:2,trust:1,emotionalStability:1}, reason:"Choosing connection as the one thing worth preserving over everything else you've ever done says relationships anchor your sense of self.", tradeoff:"Gains goodwill, at the cost of the conviction the other path here would have offered instead.", reveals:["Chooses someone else's comfort over their own convenience", "Extends trust before it's fully earned", "Stays steady under pressure"], tags:["warm","loyal"] },
      { text:"The memory of the moment you were proudest of yourself", d:{confidence:2,drive:1,persistence:1}, reason:"Preserving self-earned achievement over any relationship or comfort points to identity being built primarily on your own record.", tradeoff:"Gains conviction, at the cost of the goodwill the other path here would have offered instead.", reveals:["Backs their own judgment under pressure", "Pushes toward the outcome even under resistance", "Keeps going after the initial effort stops paying off"], tags:["competitive","independent"] },
      { text:"A completely ordinary, quiet moment that meant nothing to anyone else", d:{selfAwareness:2,openMindedness:1,creativity:1}, reason:"Choosing the unremarkable over the impressive or the beloved reveals meaning-making that runs against convention entirely.", tradeoff:"Gains self-knowledge, at the cost of the goodwill the other path here would have offered instead.", reveals:["Names an uncomfortable truth about themselves", "Stays open to being wrong", "Builds a new option instead of picking a given one"], tags:["reflective","curious"] } ]},
  { id:"w01", text:"Tomorrow, everyone who knows you wakes up having completely forgotten who you are. You remember everything.", illustration:"masks", type:"weird", tone:"philosophical", difficulty:"heavy", purpose:"Tests identity: is selfhood built from relationships or held independently of them.", measures:["independence","socialEnergy","resilience"], validates:"independence", unlockConditions:{anyTags:["reflective","independent"]},
    options:[
      { text:"Try to rebuild the closest relationships from scratch, one at a time", d:{persistence:2,kindness:1,socialEnergy:1}, reason:"Choosing to reconstruct specific bonds rather than start entirely fresh shows those relationships matter more than the ease of a clean slate.", tradeoff:"Gains follow-through, at the cost of the room to be wrong the other path here would have offered instead.", reveals:["Keeps going after the initial effort stops paying off", "Chooses someone else's comfort over their own convenience", "Draws energy from engaging with others"], tags:["loyal","idealist"] },
      { text:"Take it as a strange kind of freedom and start over as someone slightly different", d:{openMindedness:2,curiosity:1,independence:1}, reason:"Treating a forced reset as opportunity rather than loss suggests identity feels more fluid than fixed for you.", tradeoff:"Gains room to be wrong, at the cost of the follow-through the other path here would have offered instead.", reveals:["Stays open to being wrong", "Follows a question rather than letting it go", "Chooses self-reliance over relying on others"], tags:["adventurous","independent"] },
      { text:"Feel the loss more than anything else, even knowing you'd survive it", d:{emotionalStability:-1,selfAwareness:1,resilience:1}, reason:"Letting the grief register fully, rather than immediately reframing it, shows how much being known actually anchors you.", tradeoff:"Gains self-knowledge, at the cost of composure.", reveals:["Lets the moment's weight actually register", "Notices their own patterns in real time", "Recovers forward rather than dwelling"], tags:["intense","reflective"] } ]},
  { id:"w02", text:"You're offered the chance to permanently remove exactly one emotion from your life, forever.", illustration:"heart", type:"weird", tone:"philosophical", difficulty:"heavy", purpose:"Forces a real ranking of which emotional capacity is most expendable.", measures:["emotionalStability","openMindedness","resilience"], validates:null, unlockConditions:{anyTags:["intense","analytical"]},
    options:[
      { text:"Fear, it's cost you more chances than it's ever actually protected you from", d:{risk:2,confidence:1,resilience:1}, reason:"Naming fear specifically, with a clear cost-benefit reasoning, shows a deliberate, examined relationship with your own caution.", tradeoff:"Gains upside, at the cost of the room to be wrong the other path here would have offered instead.", reveals:["Chooses the less certain, more interesting path", "Acts before being fully sure", "Treats a setback as temporary"], tags:["adventurous","bold"] },
      { text:"Nothing, even the painful ones are doing something you'd miss", d:{openMindedness:2,resilience:1,emotionalStability:1}, reason:"Refusing the offer entirely shows a belief that emotional range itself, including its costs, is worth preserving whole.", tradeoff:"Gains room to be wrong, at the cost of the upside the other path here would have offered instead.", reveals:["Stays open to being wrong", "Treats a setback as temporary", "Keeps a level head when things get tense"], tags:["idealist","reflective"] },
      { text:"Jealousy, it's the one that makes you feel worst about who you are", d:{selfAwareness:2,kindness:1,confidence:-1}, reason:"Naming a specifically shame-inducing emotion, rather than a merely unpleasant one, is a more vulnerable and specific disclosure.", tradeoff:"Gains self-knowledge, at the cost of conviction.", reveals:["Notices their own patterns in real time", "Chooses someone else's comfort over their own convenience", "Second-guesses their own read of a situation"], tags:["reflective","intense"] } ]},
  { id:"w03", text:"You're offered true immortality, but everyone you'll ever love will still age and die on a normal timeline.", illustration:"hourglass", type:"weird", tone:"philosophical", difficulty:"heavy", purpose:"Separates the appeal of endless time from the cost of endless outliving.", measures:["emotionalStability","optimism","independence"], validates:null, unlockConditions:{anyTags:["intense","independent"]},
    options:[
      { text:"Take it, more time to matter to more people across more lifetimes outweighs the losses", d:{optimism:2,independence:1,resilience:1}, reason:"Accepting repeated loss as the price of expanded impact shows a specific, high-tolerance relationship with grief.", tradeoff:"Gains ease, at the cost of the goodwill the other path here would have offered instead.", reveals:["Frames setbacks as temporary", "Trusts their own judgment over consensus", "Recovers forward rather than dwelling"], tags:["idealist","adventurous"] },
      { text:"Refuse, outliving everyone you love isn't immortality, it's a different kind of ending", d:{kindness:1,emotionalStability:1,independence:-1}, reason:"Rejecting a genuinely tempting offer because of relational cost, not fear of death itself, reveals where meaning is actually located.", tradeoff:"Gains goodwill, at the cost of autonomy.", reveals:["Chooses someone else's comfort over their own convenience", "Stays steady under pressure", "Chooses connection or reliance over going it alone"], tags:["loyal","warm"] },
      { text:"Take it, but you already know it'll change who you let yourself get close to", d:{selfAwareness:2,trust:-1,resilience:1}, reason:"Accepting the offer while honestly forecasting how it will reshape your future relationships shows unusual self-prediction under a hypothetical.", tradeoff:"Gains self-knowledge, at the cost of closeness.", reveals:["Notices their own patterns in real time", "Withholds trust until it's proven", "Recovers forward rather than dwelling"], tags:["reflective","cautious"] } ]},
  { id:"w04", text:"You can know the exact date of your own death, with complete certainty, right now.", illustration:"hourglass", type:"weird", tone:"philosophical", difficulty:"heavy", purpose:"Tests appetite for certainty even when the information could only ever be a burden or a compass.", measures:["curiosity","emotionalStability","planning"], validates:"curiosity", unlockConditions:{anyTags:["analytical","cautious"]},
    options:[
      { text:"Yes, you'd rather plan your life around the truth than guess forever", d:{planning:2,curiosity:1,logic:1}, reason:"Choosing certainty specifically to enable better planning shows a preference for control over comfortable ambiguity.", tradeoff:"Gains preparedness, at the cost of the room to be wrong the other path here would have offered instead.", reveals:["Structures uncertainty before acting", "Chooses exploration over certainty", "Relies on logic over instinct"], tags:["analytical","pragmatist"] },
      { text:"No, some uncertainty is what actually makes life feel open", d:{openMindedness:2,optimism:1,curiosity:-1}, reason:"Declining guaranteed knowledge to preserve a sense of open possibility is a specific, deliberate choice about how you want to live.", tradeoff:"Gains room to be wrong, at the cost of insight.", reveals:["Reconsiders a position when given a reason to", "Frames setbacks as temporary", "Prefers the familiar over the unknown"], tags:["idealist","independent"] },
      { text:"You'd want to know, but you're honestly not sure you could handle it well", d:{selfAwareness:2,emotionalStability:-1,curiosity:1}, reason:"Wanting the information while openly doubting your own capacity to carry it is an unusually honest, self-aware answer.", tradeoff:"Gains self-knowledge, at the cost of composure.", reveals:["Names an uncomfortable truth about themselves", "Feels the disruption rather than absorbing it quietly", "Follows a question rather than letting it go"], tags:["reflective","intense"] } ]},
  { id:"w05", text:"You discover that everyone around you might be a simulation, but there's no way to ever prove it either way.", illustration:"maze", type:"weird", tone:"philosophical", difficulty:"medium", purpose:"Tests reaction to genuinely unfalsifiable uncertainty about the nature of reality itself.", measures:["curiosity","emotionalStability","openMindedness"], validates:null, unlockConditions:{anyTags:["curious","analytical"]},
    options:[
      { text:"Keep living exactly as you were, unprovable things aren't worth reorganizing your life around", d:{discipline:2,logic:1,emotionalStability:1}, reason:"Treating unfalsifiable uncertainty as practically irrelevant shows a strong preference for actionable reality over abstract doubt.", tradeoff:"Gains consistency, at the cost of the insight the other path here would have offered instead.", reveals:["Follows through on principle rather than convenience", "Reasons through a situation before acting", "Keeps a level head when things get tense"], tags:["pragmatist","analytical"] },
      { text:"Feel a real, lingering unease about it, even knowing there's nothing to do with that feeling", d:{emotionalStability:-1,curiosity:1,openMindedness:1}, reason:"Letting an unresolvable question genuinely unsettle you, rather than filing it away, shows real engagement with existential uncertainty.", tradeoff:"Gains insight, at the cost of composure.", reveals:["Lets the moment's weight actually register", "Chooses exploration over certainty", "Reconsiders a position when given a reason to"], tags:["reflective","intense"] },
      { text:"Find it kind of freeing, if nothing can be proven, nothing has to be feared too much either", d:{optimism:2,openMindedness:1,independence:1}, reason:"Converting radical uncertainty into permission rather than dread shows a distinct, low-anxiety relationship with the unknown.", tradeoff:"Gains ease, at the cost of the consistency the other path here would have offered instead.", reveals:["Expects things to work out", "Stays open to being wrong", "Chooses self-reliance over relying on others"], tags:["independent","curious"] } ]},
  { id:"w06", text:"You can permanently guarantee you'll never be misunderstood again, but only by giving up the ability to be truly surprised by anyone.", illustration:"puzzle", type:"weird", tone:"philosophical", difficulty:"heavy", purpose:"Trades certainty about others against the openness that makes people worth discovering.", measures:["trust","curiosity","openMindedness"], validates:null, unlockConditions:{anyTags:["curious","analytical"]},
    options:[
      { text:"Take it, being understood correctly, always, is worth losing the surprises", d:{trust:2,emotionalStability:1,curiosity:-1}, reason:"Prioritizing certainty about being understood over the pleasure of surprise shows a strong need for relational clarity.", tradeoff:"Gains closeness, at the cost of insight.", reveals:["Extends trust before it's fully earned", "Stays steady under pressure", "Prefers the familiar over the unknown"], tags:["analytical","idealist"] },
      { text:"Refuse, the surprises are half of what makes people worth knowing", d:{curiosity:2,openMindedness:1,trust:-1}, reason:"Protecting the capacity for surprise, even at the cost of ongoing misunderstanding, shows curiosity about people outranks certainty about them.", tradeoff:"Gains insight, at the cost of closeness.", reveals:["Follows a question rather than letting it go", "Stays open to being wrong", "Stays guarded rather than assuming good faith"], tags:["curious","independent"] },
      { text:"Refuse, being occasionally misunderstood keeps you a little more honest about explaining yourself", d:{selfAwareness:1,discipline:1}, reason:"Framing misunderstanding as functionally useful, not just tolerable, shows an unusually reframed relationship with a normally unwanted cost.", tradeoff:"Gains self-knowledge, at the cost of the closeness the other path here would have offered instead.", reveals:["Names an uncomfortable truth about themselves", "Follows through on principle rather than convenience", "Notices their own patterns in real time"], tags:["reflective","idealist"] } ]},
  { id:"w07", text:"You wake up one day fluent in the thoughts of everyone nearby, but they can hear yours too, all the time, with no way to turn it off.", illustration:"mirror", type:"weird", tone:"philosophical", difficulty:"heavy", purpose:"Forces confrontation with total, permanent transparency, no privacy in either direction.", measures:["trust","selfAwareness","socialEnergy"], validates:"trust", unlockConditions:{anyTags:["independent","intense"]},
    options:[
      { text:"Try to make peace with it, most of what's in your head isn't actually that bad", d:{confidence:2,openMindedness:1,trust:1}, reason:"Assuming your inner life can withstand full exposure shows real confidence in your own private self.", tradeoff:"Gains conviction, at the cost of the self-knowledge the other path here would have offered instead.", reveals:["Backs their own judgment under pressure", "Reconsiders a position when given a reason to", "Extends trust before it's fully earned"], tags:["idealist","independent"] },
      { text:"Panic a little, there's a version of your thoughts you never meant for anyone to hear", d:{selfAwareness:2,emotionalStability:-1,trust:-1}, reason:"Admitting real unfiltered thought would be damaging if exposed is an unusually honest confession under a hypothetical.", tradeoff:"Gains self-knowledge, at the cost of composure.", reveals:["Names an uncomfortable truth about themselves", "Feels the disruption rather than absorbing it quietly", "Stays guarded rather than assuming good faith"], tags:["reflective","intense"] },
      { text:"Try to isolate yourself until you can figure out how to live with it", d:{independence:2,socialEnergy:-2,planning:1}, reason:"Choosing withdrawal as the first response to involuntary exposure shows a strong instinct to control access to yourself.", tradeoff:"Gains autonomy, at the cost of engagement.", reveals:["Trusts their own judgment over consensus", "Draws energy from stepping back", "Structures uncertainty before acting"], tags:["independent","cautious"] } ]},
  { id:"w08", text:"You're told that one, and only one, of your core memories is actually false, implanted, but you can never find out which.", illustration:"mirror", type:"weird", tone:"philosophical", difficulty:"heavy", purpose:"Tests tolerance for irreducible uncertainty about the reliability of your own past.", measures:["emotionalStability","curiosity","openMindedness"], validates:null, unlockConditions:{anyTags:["reflective","curious"]},
    options:[
      { text:"Try to figure out which one anyway, even knowing you'll never really know", d:{curiosity:2,persistence:1,emotionalStability:-1}, reason:"Pursuing an explicitly unresolvable question anyway shows a real discomfort with unexamined uncertainty.", tradeoff:"Gains insight, at the cost of composure.", reveals:["Follows a question rather than letting it go", "Sees something through past the easy stopping point", "Feels the disruption rather than absorbing it quietly"], tags:["curious","intense"] },
      { text:"Let it go, all of them still feel like yours either way", d:{emotionalStability:2,openMindedness:1,independence:1}, reason:"Treating authenticity of feeling as more important than provable authenticity of origin shows a specific, settled philosophy of self.", tradeoff:"Gains composure, at the cost of the insight the other path here would have offered instead.", reveals:["Keeps a level head when things get tense", "Stays open to being wrong", "Chooses self-reliance over relying on others"], tags:["independent","idealist"] },
      { text:"Quietly hope it's the hardest one, that would almost be a relief", d:{selfAwareness:1,resilience:1,optimism:-1}, reason:"Wishing the false memory is specifically the most painful one reveals which part of your past you'd most want to not be real.", tradeoff:"Gains self-knowledge, at the cost of ease.", reveals:["Notices their own patterns in real time", "Recovers forward rather than dwelling", "Names the real cost rather than softening it"], tags:["reflective","intense"] } ]},
  { id:"w09", text:"Every choice you've ever made turns out to have been genuinely, provably the only one you could have made, no free will at all.", illustration:"puzzle", type:"weird", tone:"philosophical", difficulty:"heavy", purpose:"Tests emotional and moral reaction to determinism made suddenly, personally certain.", measures:["responsibility","emotionalStability","openMindedness"], validates:null, unlockConditions:{anyTags:["analytical","reflective"]},
    options:[
      { text:"It changes very little, you'd still make the same choices the same way", d:{discipline:2,independence:1,emotionalStability:1}, reason:"Treating the metaphysical fact as practically irrelevant to how you live shows a grounded, function-over-theory disposition.", tradeoff:"Gains consistency, at the cost of the ease the other path here would have offered instead.", reveals:["Holds a personal standard even without anyone watching", "Trusts their own judgment over consensus", "Stays steady under pressure"], tags:["pragmatist","analytical"] },
      { text:"It's oddly comforting, less pressure if it was never really a choice anyway", d:{optimism:1,patience:1,responsibility:-1}, reason:"Finding relief in reduced personal responsibility, rather than existential dread, shows a specific, self-protective relationship with blame.", tradeoff:"Gains ease, at the cost of accountability.", reveals:["Expects things to work out", "Lets a situation play out before intervening", "Lets responsibility sit with someone else"], tags:["independent","cautious"] },
      { text:"It genuinely unsettles you more than you'd expect", d:{emotionalStability:-2,selfAwareness:1,curiosity:1}, reason:"Letting an abstract philosophical fact actually disturb you shows how much personal agency matters to your sense of self.", tradeoff:"Gains self-knowledge, at the cost of composure.", reveals:["Feels the disruption rather than absorbing it quietly", "Names an uncomfortable truth about themselves", "Follows a question rather than letting it go"], tags:["reflective","intense"] } ]},
  { id:"w10", text:"You can permanently trade the ability to feel regret for the ability to never again feel truly lost.", illustration:"compass", type:"weird", tone:"philosophical", difficulty:"heavy", purpose:"Trades one uncomfortable but functional emotion for another, testing which discomfort is seen as more useful.", measures:["resilience","planning","openMindedness"], validates:null, unlockConditions:{anyTags:["reflective","cautious"]},
    options:[
      { text:"Take it, never feeling lost sounds like real, permanent stability", d:{planning:2,emotionalStability:1,confidence:1}, reason:"Choosing certainty of direction over the corrective sting of regret shows stability ranked above self-correction.", tradeoff:"Gains preparedness, at the cost of the follow-through the other path here would have offered instead.", reveals:["Prepares rather than improvising", "Keeps a level head when things get tense", "Acts before being fully sure"], tags:["analytical","cautious"] },
      { text:"Refuse, regret is uncomfortable but it's how you actually learn anything", d:{persistence:1,discipline:1,resilience:1}, reason:"Keeping a genuinely painful emotion specifically for its instructive value shows discomfort tolerated in service of growth.", tradeoff:"Gains follow-through, at the cost of the preparedness the other path here would have offered instead.", reveals:["Keeps going after the initial effort stops paying off", "Holds a personal standard even without anyone watching", "Recovers forward rather than dwelling"], tags:["idealist","independent"] },
      { text:"Refuse, feeling lost sometimes is what pushes you to actually change direction", d:{adaptability:2,curiosity:1,openMindedness:1}, reason:"Valuing disorientation as a catalyst rather than a problem to eliminate shows a distinct, growth-oriented relationship with confusion.", tradeoff:"Gains flexibility, at the cost of the preparedness the other path here would have offered instead.", reveals:["Adjusts course rather than forcing a plan through", "Chooses exploration over certainty", "Reconsiders a position when given a reason to"], tags:["adventurous","curious"] } ]},
  { id:"w11", text:"You learn that after you die, you'll be remembered accurately, in full, by exactly one person, forever, and forgotten completely by everyone else.", illustration:"star", type:"weird", tone:"philosophical", difficulty:"heavy", purpose:"Forces a choice between depth and breadth of legacy, the final version of a recurring theme.", measures:["socialEnergy","independence","kindness"], validates:null, unlockConditions:{anyTags:["independent","warm"]},
    options:[
      { text:"That's genuinely enough, one real, full memory beats a thousand partial ones", d:{independence:2,kindness:1,confidence:1}, reason:"Finding depth alone sufficient, without needing broader legacy, shows real contentment with intimate, not wide, significance.", tradeoff:"Gains autonomy, at the cost of the engagement the other path here would have offered instead.", reveals:["Trusts their own judgment over consensus", "Chooses someone else's comfort over their own convenience", "Backs their own judgment under pressure"], tags:["independent","idealist"] },
      { text:"It stings a little, you'd have liked to matter to more people than that", d:{socialEnergy:1,selfAwareness:1,confidence:-1}, reason:"Admitting the narrowness bothers you, even while accepting it, is an honest, less flattering but specific disclosure.", tradeoff:"Gains engagement, at the cost of conviction.", reveals:["Leans toward people rather than away from them", "Names an uncomfortable truth about themselves", "Lets doubt slow down a decision"], tags:["reflective","intense"] },
      { text:"You mostly just hope it's someone who actually understood you, not just loved you", d:{trust:1,empathy:1,selfAwareness:1}, reason:"Prioritizing accurate understanding over affection alone as the thing worth being remembered by reveals what you actually value in being known.", tradeoff:"Gains closeness, at the cost of the autonomy the other path here would have offered instead.", reveals:["Gives someone the benefit of the doubt", "Reads the emotional stakes before acting", "Names an uncomfortable truth about themselves"], tags:["idealist","reflective"] } ]},
  ],
};

/* Flatten with cluster tag attached (cluster == the pacing category above) */
const QUESTIONS = Object.entries(QUESTION_BANK).flatMap(([cluster, qs]) =>
  qs.map(q => ({ ...q, cluster }))
);

/* ---- Question illustrations (v2.0) --------------------------------------
   One clean line-art icon per scenario, reused across many questions
   rather than one bespoke drawing each. Every icon is drawn on the same
   0-100 viewBox with the same stroke rules (see quiz.js's renderer), so
   they read as one consistent set rather than 20 different styles.
   currentColor + no fill means they theme automatically (dark/light,
   and the archetype accent once a result exists). Deliberately abstract
   shapes (a fork in a road, a paired mask, a compass) so the icon sets
   a mood for the scenario without hinting at which answer is "right". */
const QUESTION_ILLUSTRATIONS = {
  compass: `<circle cx="50" cy="50" r="34"/><polygon points="50,26 58,50 50,58 42,50" fill="currentColor" stroke="none"/><circle cx="50" cy="50" r="3" fill="currentColor" stroke="none"/>`,
  mountain: `<path d="M12 72 L38 34 L52 54 L64 38 L88 72 Z"/><circle cx="38" cy="28" r="4"/>`,
  puzzle: `<path d="M30 30 h20 a6 6 0 0 1 0 12 a6 6 0 1 0 0 16 h-20 z"/><path d="M50 30 h20 v28 h-8 a6 6 0 1 1 0 -12"/>`,
  bridge: `<path d="M14 62 Q50 30 86 62"/><line x1="26" y1="62" x2="26" y2="76"/><line x1="74" y1="62" x2="74" y2="76"/><line x1="14" y1="76" x2="86" y2="76"/>`,
  handshake: `<path d="M16 46 L38 46 L50 58 L62 46 L84 46"/><path d="M38 46 L46 38 L58 38 L62 46"/><path d="M40 58 L46 64 L54 64 L60 58"/>`,
  storm: `<path d="M28 46 a16 16 0 0 1 4 -31 a20 20 0 0 1 38 6 a14 14 0 0 1 -2 25 z"/><polyline points="52,52 44,68 54,68 46,84"/>`,
  lantern: `<rect x="36" y="34" width="28" height="36" rx="6"/><line x1="50" y1="20" x2="50" y2="34"/><path d="M40 20 h20"/><circle cx="50" cy="52" r="5" fill="currentColor" stroke="none"/><line x1="50" y1="70" x2="50" y2="80"/>`,
  chess: `<path d="M42 78 h16 l-3 -10 h-10 z"/><rect x="40" y="68" width="20" height="6" rx="2"/><path d="M45 58 h10 l4 10 h-18 z"/><circle cx="50" cy="42" r="10"/><path d="M46 32 h8 M50 28 v8"/>`,
  tree: `<line x1="50" y1="52" x2="50" y2="82"/><circle cx="50" cy="34" r="20"/>`,
  doorway: `<rect x="32" y="18" width="36" height="64" rx="2"/><path d="M68 20 L84 26 L84 78 L68 82"/><circle cx="60" cy="52" r="2.5" fill="currentColor" stroke="none"/>`,
  roadsplit: `<line x1="50" y1="84" x2="50" y2="56"/><line x1="50" y1="56" x2="26" y2="18"/><line x1="50" y1="56" x2="74" y2="18"/>`,
  clock: `<circle cx="50" cy="50" r="34"/><line x1="50" y1="50" x2="50" y2="28"/><line x1="50" y1="50" x2="66" y2="58"/>`,
  lightbulb: `<circle cx="50" cy="42" r="20"/><path d="M42 60 h16 v10 a8 8 0 0 1 -16 0 z"/><line x1="46" y1="80" x2="54" y2="80"/><line x1="50" y1="8" x2="50" y2="16"/><line x1="24" y1="42" x2="16" y2="42"/><line x1="84" y1="42" x2="76" y2="42"/>`,
  maze: `<rect x="16" y="16" width="68" height="68"/><path d="M16 34 h34 v18 h-18 M84 66 h-34 v-18 h18"/>`,
  masks: `<ellipse cx="38" cy="50" rx="20" ry="26" transform="rotate(-8 38 50)"/><ellipse cx="62" cy="50" rx="20" ry="26" transform="rotate(8 62 50)"/><circle cx="33" cy="44" r="2.5" fill="currentColor" stroke="none"/><circle cx="67" cy="44" r="2.5" fill="currentColor" stroke="none"/>`,
  mirror: `<ellipse cx="50" cy="40" rx="22" ry="28"/><line x1="50" y1="68" x2="50" y2="82"/><line x1="38" y1="82" x2="62" y2="82"/>`,
  key: `<circle cx="30" cy="50" r="14"/><line x1="44" y1="50" x2="80" y2="50"/><line x1="70" y1="50" x2="70" y2="60"/><line x1="78" y1="50" x2="78" y2="58"/>`,
  conversation: `<path d="M14 26 h44 a6 6 0 0 1 6 6 v22 a6 6 0 0 1 -6 6 h-14 l-10 10 v-10 h-14 a6 6 0 0 1 -6 -6 v-22 a6 6 0 0 1 6 -6 z"/><path d="M56 44 h24 a6 6 0 0 1 6 6 v16 a6 6 0 0 1 -6 6 h-4 l0 8 l-9 -8 h-11 a6 6 0 0 1 -6 -6 v-6" opacity="0.6"/>`,
  scales: `<line x1="50" y1="14" x2="50" y2="70" /><line x1="24" y1="30" x2="76" y2="30"/><path d="M24 30 l-10 22 h20 z"/><path d="M76 30 l-10 22 h20 z"/><line x1="38" y1="82" x2="62" y2="82"/><line x1="50" y1="70" x2="50" y2="82"/>`,
  hourglass: `<path d="M28 16 h44 M28 84 h44 M32 16 v14 l16 20 l16 -20 v-14 M32 84 v-14 l16 -20 l16 20 v14"/>`,
  heart: `<path d="M50 82 C20 60 10 40 10 26 a16 16 0 0 1 30 -8 a16 16 0 0 1 30 8 c0 14 -10 34 -40 56 z"/>`,
  star: `<polygon points="50,14 61,40 89,42 66,60 74,88 50,72 26,88 34,60 11,42 39,40"/>`,
  anchor: `<circle cx="50" cy="20" r="7"/><line x1="50" y1="27" x2="50" y2="78"/><line x1="34" y1="40" x2="66" y2="40"/><path d="M22 56 a28 28 0 0 0 56 0" /><line x1="22" y1="56" x2="22" y2="48"/><line x1="78" y1="56" x2="78" y2="48"/>`,
};


/* ---- The 12 core archetypes ---------------------------------------- */
/* Each archetype carries a small "signature" of {dim, weight} pairs used
   by the matching algorithm (see engine.js: matchArchetype). */

const ARCHETYPES = [
  { id:"stormcaller", name:"The Stormcaller", title:"Command Presence", icon:"⛈️",
    colors:["#818CF8","#38BDF8"],
    image:"assets/archetypes/stormcaller.webp",
    signature:[{dim:"leadership",w:2},{dim:"confidence",w:2},{dim:"risk",w:1}],
    description:"You don't wait for a room to find its energy, you bring it. When things get tense, people look to you first, and you usually already have an answer.",
    strengths:["Decisive under pressure","Magnetic presence","Rallies people fast"],
    weaknesses:["Can steamroll quieter voices","Impatient with hesitation","Struggles to sit still"],
    workStyle:"Takes the room, sets the pace, expects people to keep up.",
    stressResponse:"Gets louder and more directive, not quieter.",
    friendshipStyle:"The one who organizes the group and actually makes it happen.",
    datingStyle:"Flirts like it's a competition, means it anyway.",
    leadershipStyle:"Leads from the front, out loud, no committee required.",
    learningStyle:"Learns by taking charge of something real, not by watching.",
    communicationStyle:"Blunt, fast, doesn't dress things up much.",
    decisionMaking:"Decides quickly and owns it, right or wrong.",
    idealEnvironments:["High-stakes rooms","Teams that need a push","Anywhere with a clear stage"],
    hobbies:["Public speaking or debate","Competitive sports","Organizing group trips"],
    growthAdvice:"Not every room needs a captain. Some just need you to listen first.",
    bestTeammate:"Someone calm who tempers the intensity without dimming it.",
    worstTeammate:"Another Stormcaller fighting for the same mic.",
    quote:"Somebody has to say it first." },

  { id:"architect", name:"The Architect", title:"Builder of Systems", icon:"🏛️",
    colors:["#34D399","#CBD5E1"],
    image:"assets/archetypes/architect.webp",
    signature:[{dim:"planning",w:2},{dim:"discipline",w:2},{dim:"logic",w:1}],
    description:"You think in blueprints. Before anyone else has a plan, you already have three, plus a backup for when the first one breaks.",
    strengths:["Long-term planning","Reliability","Clear-headed problem solving"],
    weaknesses:["Resists improvisation","Can seem distant","Overinvests in process"],
    workStyle:"Systematic, prefers owning process and infrastructure end-to-end.",
    stressResponse:"Retreats into organizing something, anything.",
    friendshipStyle:"Consistent and dependable, not flashy about it.",
    datingStyle:"Shows love through stability and follow-through.",
    leadershipStyle:"Leads by designing systems people can actually trust.",
    learningStyle:"Builds the mental framework first, fills in detail after.",
    communicationStyle:"Measured, considered, rarely impulsive.",
    decisionMaking:"Slow and thorough, would rather be right than first.",
    idealEnvironments:["Structured organizations","Long-horizon projects","Quiet, independent work"],
    hobbies:["Building or making things","Puzzles and logic games","Organizing anything, honestly"],
    growthAdvice:"Not every moment needs a system. Some just need presence.",
    bestTeammate:"An energetic connector who brings the system to life.",
    worstTeammate:"Someone allergic to structure or follow-through.",
    quote:"Good systems are just kindness with a plan." },

  { id:"sentinel", name:"The Sentinel", title:"Unshaken Ground", icon:"🛡️",
    colors:["#60A5FA","#2DD4BF"],
    image:"assets/archetypes/sentinel.webp",
    signature:[{dim:"responsibility",w:2},{dim:"emotionalStability",w:2},{dim:"trust",w:1}],
    description:"You're who people call when things actually go wrong, not because you love the chaos, but because you don't flinch in it.",
    strengths:["Steady under pressure","Deeply reliable","Protective of people who matter"],
    weaknesses:["Struggles to ask for help","Carries too much quietly","Can resist change"],
    workStyle:"Holds the line, shows up every time, no exceptions.",
    stressResponse:"Gets more composed, not less, right when it counts.",
    friendshipStyle:"The friend who actually answers at 2am.",
    datingStyle:"Slow to open up, unshakeable once they do.",
    leadershipStyle:"Leads by being the person others can lean on.",
    learningStyle:"Learns through repetition until it's second nature.",
    communicationStyle:"Calm, grounded, says less than it's thinking.",
    decisionMaking:"Weighs risk to the people involved before anything else.",
    idealEnvironments:["Teams under real pressure","Long-term commitments","Anywhere trust actually matters"],
    hobbies:["Strength training","Caretaking, plants or people","Long, familiar routines"],
    growthAdvice:"Being needed isn't the same as being okay. Let someone hold it sometimes.",
    bestTeammate:"Someone spontaneous who gets you to loosen the grip a little.",
    worstTeammate:"Someone who treats your steadiness as a given, never a gift.",
    quote:"I don't move unless it matters. Then I don't stop." },

  { id:"pathfinder", name:"The Pathfinder", title:"Off the Map", icon:"🧭",
    colors:["#FBBF24","#34D399"],
    image:"assets/archetypes/pathfinder.webp",
    signature:[{dim:"curiosity",w:2},{dim:"adaptability",w:2},{dim:"independence",w:1}],
    description:"Comfort zones bore you a little. You'd rather figure it out as you go than follow someone else's map, even when their map is fine.",
    strengths:["Fast adaptation","Genuine curiosity","Comfortable with uncertainty"],
    weaknesses:["Struggles to commit to one path","Underplans logistics","Gets restless with routine"],
    workStyle:"Improvises well, gets bored fast once a thing becomes routine.",
    stressResponse:"Changes something, anything, rather than sit with it.",
    friendshipStyle:"The friend with the story nobody else has.",
    datingStyle:"Exciting, a little unpredictable, hard to pin down early on.",
    leadershipStyle:"Leads by finding the way nobody else saw yet.",
    learningStyle:"Learns by wandering into it, not by studying it first.",
    communicationStyle:"Curious, tangential, asks more questions than it answers.",
    decisionMaking:"Chooses the interesting option over the safe one, often.",
    idealEnvironments:["New or unfamiliar settings","Loosely structured projects","Anywhere with room to explore"],
    hobbies:["Travel, planned or not","Trying new hobbies constantly","Getting intentionally lost"],
    growthAdvice:"Finishing the path is sometimes the more interesting part.",
    bestTeammate:"A planner who catches the logistics you'd rather skip.",
    worstTeammate:"Someone who needs the whole route mapped before step one.",
    quote:"The map is just someone else's opinion." },

  { id:"archivist", name:"The Archivist", title:"Keeper of Detail", icon:"📚",
    colors:["#A78BFA","#F472B6"],
    image:"assets/archetypes/archivist.webp",
    signature:[{dim:"selfAwareness",w:2},{dim:"patience",w:2},{dim:"logic",w:1}],
    description:"You remember the detail everyone else forgot, and you're quietly the person with the most context in the room.",
    strengths:["Deep pattern memory","Careful, considered judgment","Quiet expertise"],
    weaknesses:["Slow to speak up","Overthinks small decisions","Holds onto old context too long"],
    workStyle:"Thorough, prefers to actually understand before acting.",
    stressResponse:"Goes inward, replays details until it makes sense.",
    friendshipStyle:"Remembers the thing you mentioned once, months ago.",
    datingStyle:"Notices everything, says little until it's sure.",
    leadershipStyle:"Leads by knowing more than anyone expected them to.",
    learningStyle:"Reads everything first, asks questions second.",
    communicationStyle:"Precise, quiet, chooses words carefully.",
    decisionMaking:"Wants the full picture before committing to anything.",
    idealEnvironments:["Research-heavy work","Low-noise environments","Roles that reward depth over speed"],
    hobbies:["Reading widely","Archiving or collecting things","Trivia and deep-dive rabbit holes"],
    growthAdvice:"You don't need the full picture to say something true right now.",
    bestTeammate:"Someone decisive who turns your context into action.",
    worstTeammate:"Someone who wants an answer before you've actually thought about it.",
    quote:"Context is the whole job." },

  { id:"dreamweaver", name:"The Dreamweaver", title:"Half Elsewhere", icon:"🌙",
    colors:["#F472B6","#818CF8"],
    image:"assets/archetypes/dreamweaver.webp",
    signature:[{dim:"creativity",w:2},{dim:"openMindedness",w:2},{dim:"empathy",w:1}],
    description:"Your head is a little bit somewhere else, mid-idea, half a world you're still building. Most of your best thinking happens sideways.",
    strengths:["Original thinking","Emotionally attuned","Comfortable with ambiguity"],
    weaknesses:["Loses the thread on logistics","Can seem scattered","Avoids hard practical calls"],
    workStyle:"Nonlinear, follows the idea wherever it actually leads.",
    stressResponse:"Escapes into imagination rather than facing it head-on.",
    friendshipStyle:"The friend with the wildest, most specific inside jokes.",
    datingStyle:"Romantic in a way that's more felt than said.",
    leadershipStyle:"Leads by making people feel like more is possible.",
    learningStyle:"Learns through story, metaphor, and association.",
    communicationStyle:"Expressive, imagistic, occasionally hard to pin down.",
    decisionMaking:"Follows what feels right before what looks rational.",
    idealEnvironments:["Creative, low-rigid-structure work","Rooms that welcome weird ideas","Anywhere imagination is currency"],
    hobbies:["Writing or art","Daydreaming, unironically","Music that means something specific"],
    growthAdvice:"An idea only changes anything once it lands somewhere real.",
    bestTeammate:"A grounded finisher who turns the idea into something shipped.",
    worstTeammate:"Someone who needs everything decided before the fun part starts.",
    quote:"I'm not distracted. I'm just also somewhere else." },

  { id:"vanguard", name:"The Vanguard", title:"Leading Edge", icon:"☄️",
    colors:["#FB923C","#FACC15"],
    image:"assets/archetypes/vanguard.webp",
    signature:[{dim:"drive",w:2},{dim:"competitiveness",w:2},{dim:"risk",w:1}],
    description:"You go first, on purpose. Waiting for permission has never really been your style, and it shows in everything you touch.",
    strengths:["Bold initiative","Relentless drive","Thrives under competition"],
    weaknesses:["Impulsive follow-through","Burns out fast","Skips the boring but necessary steps"],
    workStyle:"Fast-paced, thrives on momentum and visible progress.",
    stressResponse:"Pushes harder and faster, sometimes to a fault.",
    friendshipStyle:"The friend who starts the plan nobody else would suggest.",
    datingStyle:"Intense, all-in early, occasionally too fast for their own good.",
    leadershipStyle:"Leads by example, from the front, at full speed.",
    learningStyle:"Learns by doing, not by reading about it first.",
    communicationStyle:"Enthusiastic, direct, occasionally overwhelming.",
    decisionMaking:"Fast, confident, occasionally regretted later.",
    idealEnvironments:["High-energy teams","Competitive settings","Anything with a real deadline"],
    hobbies:["Competitive sports","Adventure or extreme activities","Anything with a scoreboard"],
    growthAdvice:"Speed is a strength until it starts making your decisions for you.",
    bestTeammate:"A grounded planner who catches what you miss.",
    worstTeammate:"Someone equally impulsive with no one steering.",
    quote:"Ask forgiveness, not permission." },

  { id:"oracle", name:"The Oracle", title:"Sees the Undercurrent", icon:"🔮",
    colors:["#38BDF8","#A78BFA"],
    image:"assets/archetypes/oracle.webp",
    signature:[{dim:"empathy",w:2},{dim:"curiosity",w:2},{dim:"selfAwareness",w:1}],
    description:"You notice what people don't say out loud. Half the time you know how something's going to land before it does.",
    strengths:["Reads people accurately","Sharp intuition","Comfortable naming hard truths"],
    weaknesses:["Overthinks other people's motives","Can seem cryptic","Absorbs others' moods too easily"],
    workStyle:"Reads the room before reading the brief.",
    stressResponse:"Withdraws to process what it's sensing before saying anything.",
    friendshipStyle:"Knows something's wrong before you've said a word.",
    datingStyle:"Perceptive to a fault, sometimes overanalyzes what's actually simple.",
    leadershipStyle:"Leads by naming the thing nobody else was willing to say.",
    learningStyle:"Learns by watching patterns, not by being told the rule.",
    communicationStyle:"Thoughtful, a little indirect, precise when it matters.",
    decisionMaking:"Trusts the gut read, then checks it against the facts.",
    idealEnvironments:["Roles centered on people","Quiet spaces to actually think","Anywhere nuance is valued"],
    hobbies:["People-watching, unapologetically","Journaling","Astrology, tarot, or anything symbolic"],
    growthAdvice:"Not every read needs to be spoken out loud right away.",
    bestTeammate:"Someone direct who turns your read into a real conversation.",
    worstTeammate:"Someone who dismisses a read just because they can't see it yet.",
    quote:"I already knew, I was just waiting for you to say it." },

  { id:"luminary", name:"The Luminary", title:"Warm Light", icon:"🏮",
    colors:["#FACC15","#FB7185"],
    image:"assets/archetypes/luminary.webp",
    signature:[{dim:"optimism",w:2},{dim:"socialEnergy",w:2},{dim:"kindness",w:1}],
    description:"People leave conversations with you feeling a little more capable than when they walked in. That's not an accident, it's just how you show up.",
    strengths:["Genuinely encouraging","Easy to be around","Brings out the best in others"],
    weaknesses:["Avoids necessary conflict","Overextends for others","Struggles to sit with negativity"],
    workStyle:"Collaborative, energizes the room without needing the spotlight.",
    stressResponse:"Reaches for connection rather than isolation.",
    friendshipStyle:"The friend who remembers everyone's good news.",
    datingStyle:"Warm, affirming, makes people feel genuinely seen.",
    leadershipStyle:"Leads by making people believe they can do more than they thought.",
    learningStyle:"Learns best alongside other people, out loud.",
    communicationStyle:"Warm, affirming, generous with encouragement.",
    decisionMaking:"Weighs how it affects everyone, not just the outcome.",
    idealEnvironments:["People-centered work","Collaborative teams","Anywhere morale actually matters"],
    hobbies:["Hosting people","Volunteering","Group activities of almost any kind"],
    growthAdvice:"Some conversations need honesty more than they need comfort.",
    bestTeammate:"A straight-shooter who says the hard thing you're avoiding.",
    worstTeammate:"Someone who mistakes your warmth for a lack of a backbone.",
    quote:"Bring your own light and the room follows." },

  { id:"catalyst", name:"The Catalyst", title:"Where It Starts", icon:"⚡",
    colors:["#FDE047","#FB923C"],
    image:"assets/archetypes/catalyst.webp",
    signature:[{dim:"humor",w:2},{dim:"adaptability",w:1},{dim:"drive",w:1}],
    description:"Things move when you're in the room, conversations open up, plans actually happen. You're rarely the loudest, but you're often the reason it started.",
    strengths:["Breaks the ice fast","Reads the room's energy","Turns talk into action"],
    weaknesses:["Struggles to finish what it starts","Avoids sitting still","Uses humor to dodge hard topics"],
    workStyle:"Gets things moving, hands off the follow-through happily.",
    stressResponse:"Jokes through it, sometimes instead of feeling it.",
    friendshipStyle:"The friend who turns a boring night into a story.",
    datingStyle:"Playful first, sincere once it's earned trust.",
    leadershipStyle:"Leads by making the first move so everyone else can too.",
    learningStyle:"Learns by jumping in and making it fun.",
    communicationStyle:"Quick, funny, disarms tension on instinct.",
    decisionMaking:"Decides based on momentum, worries about the details later.",
    idealEnvironments:["Fast-moving teams","Social, high-energy settings","Anywhere that needs a spark"],
    hobbies:["Stand-up or improv","Hosting spontaneous plans","Anything mildly chaotic and fun"],
    growthAdvice:"Starting things is a real skill. Finishing them is too.",
    bestTeammate:"A steady closer who picks up exactly where you left off.",
    worstTeammate:"Someone who needs everything serious, all the time.",
    quote:"I didn't plan this, but I'm not mad about it." },

  { id:"maverick", name:"The Maverick", title:"Own Rules", icon:"🗡️",
    colors:["#94A3B8","#F87171"],
    image:"assets/archetypes/maverick.webp",
    signature:[{dim:"independence",w:2},{dim:"openMindedness",w:1},{dim:"risk",w:1}],
    description:"You'd rather be right and alone than comfortable and wrong. Rules get a fair hearing from you, then get questioned anyway.",
    strengths:["Thinks independently","Unbothered by consensus","Genuinely original"],
    weaknesses:["Resists structure on principle","Can isolate unnecessarily","Dismisses good advice too fast"],
    workStyle:"Prefers full ownership, chafes under close oversight.",
    stressResponse:"Pulls away to handle it alone, on its own terms.",
    friendshipStyle:"Small, fiercely chosen circle, no interest in the rest.",
    datingStyle:"Guarded at first, deeply loyal once someone's actually in.",
    leadershipStyle:"Leads by doing it differently and being right often enough to earn it.",
    learningStyle:"Learns by taking it apart and rebuilding it their own way.",
    communicationStyle:"Blunt, unfiltered, says the thing others won't.",
    decisionMaking:"Trusts its own read over the group's, most of the time.",
    idealEnvironments:["Autonomous roles","Small teams with real trust","Anywhere original thinking is welcome"],
    hobbies:["Solo projects and side quests","Unconventional interests","Anything nobody asked them to do"],
    growthAdvice:"Being different isn't the same as being right. Check sometimes.",
    bestTeammate:"Someone who earns trust slowly and doesn't push for it.",
    worstTeammate:"Someone who needs constant consensus to move at all.",
    quote:"I heard the rule. I have a different plan." },

  { id:"visionary", name:"The Visionary", title:"Sees It Finished", icon:"✨",
    colors:["#C4B5FD","#5EEAD4"],
    image:"assets/archetypes/visionary.webp",
    signature:[{dim:"persistence",w:2},{dim:"creativity",w:1},{dim:"confidence",w:1}],
    description:"You see the finished version before anyone else believes it's possible, and you're stubborn enough to actually build toward it.",
    strengths:["Big-picture thinking","Unshakeable persistence","Inspires belief in others"],
    weaknesses:["Impatient with small steps","Can ignore inconvenient details","Sets the bar unreasonably high"],
    workStyle:"Works backward from the end goal, fills in the middle as needed.",
    stressResponse:"Zooms out further instead of narrowing in.",
    friendshipStyle:"The friend who believes in your plans before you fully do.",
    datingStyle:"Sees the long game early, sometimes too early.",
    leadershipStyle:"Leads by painting the picture until everyone else can see it too.",
    learningStyle:"Learns by connecting it to the bigger goal, not the isolated fact.",
    communicationStyle:"Big-picture, persuasive, occasionally short on detail.",
    decisionMaking:"Chooses whatever moves the long-term vision forward.",
    idealEnvironments:["Ambitious, long-horizon work","Rooms open to big ideas","Anywhere the goal is allowed to be large"],
    hobbies:["Goal-setting, unironically","Reading about the future","Building toward something personal"],
    growthAdvice:"The next small step matters as much as the whole vision.",
    bestTeammate:"A detail-oriented closer who makes the vision actually work.",
    worstTeammate:"Someone who can't see past the next two weeks.",
    quote:"I'm not there yet. I've just already seen it." },
];

/* ---- Careers (fit computed from dimensions, not hardcoded per archetype) */
const CAREERS = [
  { name:"UX Designer", dims:["empathy","creativity","logic"] },
  { name:"UI Designer", dims:["creativity","discipline","selfAwareness"] },
  { name:"Product Designer", dims:["creativity","logic","leadership"] },
  { name:"Illustrator / Artist", dims:["creativity","independence","curiosity"] },
  { name:"Graphic Designer", dims:["creativity","discipline","curiosity"] },
  { name:"Software Engineer", dims:["logic","discipline","patience"] },
  { name:"Data Analyst", dims:["logic","patience","curiosity"] },
  { name:"Architect", dims:["planning","creativity","discipline"] },
  { name:"Civil Engineer", dims:["planning","logic","discipline"] },
  { name:"Doctor / Clinician", dims:["empathy","discipline","resilience"] },
  { name:"Nurse", dims:["empathy","resilience","patience"] },
  { name:"Physical Therapist", dims:["patience","empathy","discipline"] },
  { name:"Teacher / Educator", dims:["patience","empathy","leadership"] },
  { name:"School Counselor", dims:["empathy","patience","selfAwareness"] },
  { name:"Entrepreneur", dims:["risk","drive","confidence"] },
  { name:"Small Business Owner", dims:["drive","discipline","adaptability"] },
  { name:"Researcher / Scientist", dims:["curiosity","logic","patience"] },
  { name:"Environmental Scientist", dims:["curiosity","planning","discipline"] },
  { name:"Writer", dims:["creativity","independence","selfAwareness"] },
  { name:"Journalist", dims:["curiosity","confidence","logic"] },
  { name:"Editor", dims:["logic","discipline","creativity"] },
  { name:"Film / Video Director", dims:["creativity","leadership","confidence"] },
  { name:"Video Editor", dims:["creativity","patience","discipline"] },
  { name:"Game Designer", dims:["creativity","logic","curiosity"] },
  { name:"Musician / Performer", dims:["creativity","confidence","humor"] },
  { name:"Psychologist / Therapist", dims:["empathy","patience","selfAwareness"] },
  { name:"Social Worker", dims:["empathy","kindness","resilience"] },
  { name:"Lawyer", dims:["logic","confidence","discipline"] },
  { name:"Paralegal", dims:["discipline","logic","patience"] },
  { name:"Chef", dims:["creativity","discipline","risk"] },
  { name:"Pastry Chef", dims:["discipline","creativity","patience"] },
  { name:"Marketing Strategist", dims:["creativity","socialEnergy","adaptability"] },
  { name:"Sales Manager", dims:["confidence","socialEnergy","drive"] },
  { name:"Human Resources Manager", dims:["empathy","leadership","discipline"] },
  { name:"Animator", dims:["creativity","patience","discipline"] },
  { name:"Operations / Project Manager", dims:["planning","discipline","leadership"] },
  { name:"Financial Analyst", dims:["logic","discipline","patience"] },
  { name:"Accountant", dims:["discipline","logic","patience"] },
  { name:"Urban Planner", dims:["planning","empathy","logic"] },
  { name:"Event Planner", dims:["planning","socialEnergy","adaptability"] },
  { name:"Firefighter / EMT", dims:["resilience","confidence","kindness"] },
  { name:"Military / Law Enforcement", dims:["discipline","resilience","leadership"] },
  { name:"Diplomat / Foreign Service", dims:["empathy","adaptability","leadership"] },
  { name:"Nonprofit Program Manager", dims:["kindness","leadership","planning"] },
  { name:"Data Scientist", dims:["logic","curiosity","discipline"] },
  { name:"Product Manager", dims:["leadership","logic","adaptability"] },
];

/* ---- Relationship pairing types (compatibility computed in engine.js) -- */
const RELATIONSHIP_TYPES = [
  { key:"friendship", label:"Friendship" },
  { key:"dating", label:"Dating" },
  { key:"marriage", label:"Marriage" },
  { key:"business", label:"Business Partner" },
  { key:"creative", label:"Creative Partner" },
  { key:"travel", label:"Travel Partner" },
  { key:"gaming", label:"Gaming Partner" },
  { key:"study", label:"Study Partner" },
  { key:"roommate", label:"Roommate" },
];

/* ---- Lines shown during brief "calculating" transitions ----------------
   Rotated randomly, a mix of genuine-sounding processing steps and a
   couple of lighter ones, purely as a loading-state flourish. */
const CALC_LINES = [
  "Calculating cool factor",
  "Calculating baseline friendship motor",
  "Reading between the lines",
  "Cross-referencing your instincts",
  "Weighing risk against reason",
  "Measuring your patience threshold",
  "Checking how you handle a bad Tuesday",
  "Comparing this answer against the last one",
  "Running the numbers on your empathy",
  "Mapping your decision pattern",
  "Adjusting for how you actually think, not just what you picked",
  "Testing for consistency",
  "Locating your stress response",
  "Estimating your social battery",
  "Narrowing down your archetype",
  "Weighing loyalty against independence",
  "Checking your leadership signal",
  "Recalculating after that last answer",
];

/* ---- Lines shown while two codes are being compared --------------------- */
const COMPATIBILITY_CALC_LINES = [
  "Decoding both profiles",
  "Cross-referencing every trait",
  "Weighing shared strengths",
  "Checking for friction points",
  "Measuring trust overlap",
  "Comparing decision styles",
  "Working out who leads and who supports",
  "Running the numbers across 31 categories",
  "Finding your duo title",
  "Calculating chemistry",
  "Almost got your compatibility score",
];

/* =========================================================================
   V2 ADDITIONS
   Everything below was new for the old v2 update. (PF4 note: PF1/2/3
   codes are no longer decoded at all -- see decodeCode()'s `obsolete`
   handling further down -- so this section header is now purely
   historical, not a compatibility guarantee.)
   ========================================================================= */

/* ---- Archetype extras: animal, element, symbol -------------------------
   primaryColor, secondaryColor, lifeMotto and favoriteEnvironment are all
   derived directly from existing archetype fields (colors, quote,
   idealEnvironments) rather than re-authored, so there is nothing new to
   keep in sync. hiddenPotential is generated from each archetype's own
   strengths/weaknesses in engine.js, also with no separate authoring. */
const ARCHETYPE_EXTRAS = {
  "stormcaller": { animal:"Lion", element:"Storm", symbol:"\u26C8" },
  "architect": { animal:"Beaver", element:"Earth", symbol:"\uD83C\uDFDB" },
  "sentinel": { animal:"Wolf", element:"Earth", symbol:"\uD83D\uDEE1" },
  "pathfinder": { animal:"Mountain Goat", element:"Earth", symbol:"\uD83E\uDDED" },
  "archivist": { animal:"Tortoise", element:"Shadow", symbol:"\uD83D\uDCDC" },
  "dreamweaver": { animal:"Moth", element:"Dream", symbol:"\uD83C\uDF19" },
  "vanguard": { animal:"Cheetah", element:"Fire", symbol:"\u2604" },
  "oracle": { animal:"Owl", element:"Shadow", symbol:"\uD83D\uDD2E" },
  "luminary": { animal:"Firefly", element:"Light", symbol:"\uD83C\uDFEE" },
  "catalyst": { animal:"Hawk", element:"Fire", symbol:"\u26A1" },
  "maverick": { animal:"Raven", element:"Metal", symbol:"\uD83D\uDDE1" },
  "visionary": { animal:"Falcon", element:"Air", symbol:"\u2728" },
};

/* ---- Narrative roles ---------------------------------------- */
const NARRATIVE_ROLES = [
  { name:"Hero", icon:"\u2694", signature:[{dim:"leadership",w:2},{dim:"kindness",w:1},{dim:"resilience",w:1}],
    description:"You're the one who ends up carrying the weight when it matters, not because you asked to, but because you didn't look away." },
  { name:"Main Character", icon:"\u2B50", signature:[{dim:"confidence",w:2},{dim:"drive",w:1},{dim:"creativity",w:1}],
    description:"Things seem to happen around you, and somehow you're rarely just in the background of your own life." },
  { name:"Anti Hero", icon:"\uD83D\uDDA4", signature:[{dim:"independence",w:2},{dim:"risk",w:1},{dim:"competitiveness",w:1}],
    description:"You do the right thing eventually, just rarely the tidy, expected way." },
  { name:"Mentor", icon:"\uD83D\uDCD6", signature:[{dim:"empathy",w:1},{dim:"patience",w:2},{dim:"selfAwareness",w:1}],
    description:"People end up learning more from watching you than from anything you actually say." },
  { name:"Guardian", icon:"\uD83D\uDEE1", signature:[{dim:"responsibility",w:2},{dim:"trust",w:1},{dim:"kindness",w:1}],
    description:"You quietly decide who and what is worth protecting, and then you just do it." },
  { name:"Strategist", icon:"\u265F", signature:[{dim:"logic",w:2},{dim:"planning",w:2}],
    description:"While everyone else reacts, you're already three moves further into the situation." },
  { name:"Explorer", icon:"\uD83E\uDDED", signature:[{dim:"curiosity",w:2},{dim:"openMindedness",w:1},{dim:"risk",w:1}],
    description:"Unfamiliar territory doesn't worry you, it's usually the whole reason you showed up." },
  { name:"Rebel", icon:"\uD83D\uDD25", signature:[{dim:"independence",w:1},{dim:"risk",w:2},{dim:"competitiveness",w:1}],
    description:"Rules get your attention mostly by existing, and you're rarely satisfied with \"that's just how it's done\"." },
  { name:"Trickster", icon:"\uD83C\uDFAD", signature:[{dim:"humor",w:2},{dim:"creativity",w:1},{dim:"adaptability",w:1}],
    description:"You'd rather solve a problem sideways than head-on, and it's more fun that way anyway." },
  { name:"Mastermind", icon:"\uD83E\uDDE0", signature:[{dim:"logic",w:1},{dim:"leadership",w:1},{dim:"independence",w:1}],
    description:"You see the whole board, and you're usually already several steps ahead of the conversation." },
  { name:"Visionary", icon:"\uD83D\uDD2E", signature:[{dim:"creativity",w:2},{dim:"drive",w:1},{dim:"optimism",w:1}],
    description:"You're pulled toward what things could become, more than what they already are." },
  { name:"Wild Card", icon:"\uD83C\uDCCF", signature:[{dim:"adaptability",w:2},{dim:"openMindedness",w:1},{dim:"humor",w:1}],
    description:"Nobody's quite sure what you'll do next, including, some days, you." },
  { name:"Comic Relief", icon:"\uD83D\uDE02", signature:[{dim:"humor",w:2},{dim:"socialEnergy",w:1},{dim:"optimism",w:1}],
    description:"You lighten a room without even trying, and it matters more than people usually say out loud." },
  { name:"Survivor", icon:"\uD83E\uDEB6", signature:[{dim:"resilience",w:2},{dim:"persistence",w:1},{dim:"emotionalStability",w:1}],
    description:"You've been through enough that very little catches you fully off guard anymore." },
  { name:"Rival", icon:"\uD83C\uDFC6", signature:[{dim:"competitiveness",w:2},{dim:"confidence",w:1},{dim:"drive",w:1}],
    description:"You do your best work when there's someone or something to measure yourself against." },
  { name:"Villain", icon:"\uD83D\uDC79", signature:[{dim:"independence",w:1},{dim:"competitiveness",w:1},{dim:"trust",w:-2}],
    description:"You've stopped needing the room's approval, for better and occasionally worse." },
  { name:"Hidden Villain", icon:"\uD83C\uDFAD", signature:[{dim:"selfAwareness",w:1},{dim:"independence",w:1},{dim:"trust",w:-1}],
    description:"You keep your real agenda close, and people rarely see it coming." },
  { name:"Chosen One", icon:"\u2728", signature:[{dim:"optimism",w:1},{dim:"resilience",w:1},{dim:"drive",w:1}],
    description:"Things seem to keep testing you specifically, and you keep rising to it anyway." },
  { name:"Lone Wolf", icon:"\uD83D\uDC3A", signature:[{dim:"independence",w:2},{dim:"resilience",w:1}],
    description:"You handle your own weather. Backup is nice, but you were never counting on it." },
];

/* ---- Media Match: characters and fictional worlds mapped to the same
   25 dimensions ---------------------------------------------------------
   v1.1. Deliberately NOT LLM-generated, at runtime or otherwise: a
   hand-curated local dataset, scored with the exact same scoreBySignature()
   every list above already uses (NARRATIVE_ROLES, FANTASY_WEAPONS, etc.),
   so "characters like you" is architecturally identical to "your fantasy
   weapon" rather than a bolted-on second system. No network calls and no
   fetched metadata/artwork -- names, sources, and short original
   observations only (personality analysis of a public fictional character,
   not reproduced text), consistent with the rest of the app running fully
   offline. `role` is how they'd show up in their own story; `energy` is
   the one-line feel, used as the card's subtitle. */
const MEDIA_CHARACTERS = [
  { name:"L", source:"Death Note", sourceType:"anime", role:"The Detective",
    signature:[{dim:"logic",w:2},{dim:"independence",w:1},{dim:"curiosity",w:1}],
    energy:"Methodical, a few steps ahead of everyone else in the room." },
  { name:"Hermione Granger", source:"Harry Potter", sourceType:"book", role:"The One Who Actually Prepared",
    signature:[{dim:"discipline",w:2},{dim:"planning",w:1},{dim:"logic",w:1}],
    energy:"Shows up over-prepared because under-prepared has never once worked out." },
  { name:"Tony Stark", source:"Iron Man", sourceType:"movie", role:"The Builder",
    signature:[{dim:"creativity",w:2},{dim:"confidence",w:1},{dim:"drive",w:1}],
    energy:"Solves the unsolvable problem, then can't stop tinkering with the solution." },
  { name:"Geralt of Rivia", source:"The Witcher", sourceType:"game", role:"The Reluctant Professional",
    signature:[{dim:"independence",w:2},{dim:"resilience",w:1},{dim:"discipline",w:1}],
    energy:"Didn't want to get involved. Got involved anyway. Handled it." },
  { name:"Michael Scott", source:"The Office", sourceType:"show", role:"The Heart of the Room",
    signature:[{dim:"humor",w:2},{dim:"socialEnergy",w:1},{dim:"optimism",w:1}],
    energy:"Needs everyone to like them, and somehow that's exactly what makes it work." },
  { name:"Katniss Everdeen", source:"The Hunger Games", sourceType:"book", role:"The One Who Carries It",
    signature:[{dim:"resilience",w:2},{dim:"responsibility",w:1},{dim:"independence",w:1}],
    energy:"Never asked to lead. Leads anyway, because someone has to." },
  { name:"Light Yagami", source:"Death Note", sourceType:"anime", role:"The One With A Plan For Everything",
    signature:[{dim:"logic",w:2},{dim:"planning",w:1},{dim:"competitiveness",w:1},{dim:"trust",w:-1}],
    energy:"Convinced they're the only one thinking clearly. Often is. That's the problem." },
  { name:"Frodo Baggins", source:"The Lord of the Rings", sourceType:"book", role:"The Unlikely One Who Sees It Through",
    signature:[{dim:"kindness",w:1},{dim:"persistence",w:2},{dim:"responsibility",w:1}],
    energy:"Smallest person in the room, carries the heaviest thing anyway." },
  { name:"Sherlock Holmes", source:"Sherlock Holmes", sourceType:"book", role:"The Observer",
    signature:[{dim:"logic",w:2},{dim:"curiosity",w:1},{dim:"confidence",w:1}],
    energy:"Notices the detail everyone else walked past without seeing." },
  { name:"Aang", source:"Avatar: The Last Airbender", sourceType:"show", role:"The One Who Looks For Another Way",
    signature:[{dim:"kindness",w:1},{dim:"adaptability",w:1},{dim:"optimism",w:1}],
    energy:"Has every reason to fight fire with fire, keeps looking for a better option." },
  { name:"Tyrion Lannister", source:"Game of Thrones", sourceType:"show", role:"The Sharpest Mind In The Room",
    signature:[{dim:"logic",w:1},{dim:"humor",w:1},{dim:"selfAwareness",w:1}],
    energy:"Talks their way out of rooms most people never talk their way into." },
  { name:"Naruto Uzumaki", source:"Naruto", sourceType:"anime", role:"The One Who Doesn't Stay Down",
    signature:[{dim:"optimism",w:1},{dim:"persistence",w:2},{dim:"socialEnergy",w:1}],
    energy:"Gets knocked down exactly as often as everyone else. Gets up more." },
  { name:"Elizabeth Bennet", source:"Pride and Prejudice", sourceType:"book", role:"The One Who Won't Pretend",
    signature:[{dim:"independence",w:1},{dim:"selfAwareness",w:1},{dim:"confidence",w:1}],
    energy:"Would rather be alone than agree with something they don't actually think." },
  { name:"Rick Sanchez", source:"Rick and Morty", sourceType:"show", role:"The Smartest Person In Any Room",
    signature:[{dim:"logic",w:2},{dim:"independence",w:1},{dim:"risk",w:1},{dim:"trust",w:-1}],
    energy:"Right about almost everything, and exhausted by how often that's true." },
  { name:"Mikasa Ackerman", source:"Attack on Titan", sourceType:"anime", role:"The One Who Doesn't Waver",
    signature:[{dim:"responsibility",w:1},{dim:"resilience",w:1},{dim:"discipline",w:1}],
    energy:"Decides what matters once, then never has to decide it again." },
  { name:"Deadpool", source:"Deadpool", sourceType:"movie", role:"The One Who Won't Take It Seriously",
    signature:[{dim:"humor",w:2},{dim:"risk",w:1},{dim:"adaptability",w:1}],
    energy:"Turns literally anything into a joke, usually because the alternative is worse." },
  { name:"Aragorn", source:"The Lord of the Rings", sourceType:"movie", role:"The Leader Who Didn't Want The Job",
    signature:[{dim:"leadership",w:1},{dim:"responsibility",w:1},{dim:"resilience",w:1}],
    energy:"Spent years avoiding the throne. Shows up anyway when it actually matters." },
  { name:"Velma Dinkley", source:"Scooby-Doo", sourceType:"show", role:"The One Who Solves It",
    signature:[{dim:"logic",w:1},{dim:"curiosity",w:1},{dim:"planning",w:1}],
    energy:"Already knows who did it, and is mostly waiting for everyone else to catch up." },
  { name:"Kratos", source:"God of War", sourceType:"game", role:"The One Trying To Be Better Than He Was",
    signature:[{dim:"discipline",w:1},{dim:"resilience",w:1},{dim:"responsibility",w:1}],
    energy:"Spent a lifetime being what the situation demanded, is done being that now." },
  { name:"Am\u00E9lie Poulain", source:"Am\u00E9lie", sourceType:"movie", role:"The Quiet Architect Of Other People's Good Days",
    signature:[{dim:"creativity",w:1},{dim:"curiosity",w:1},{dim:"kindness",w:1}],
    energy:"Notices the small thing that would make someone's day, then just does it." },
  { name:"Walter White", source:"Breaking Bad", sourceType:"show", role:"The One Who Decided Enough Was Enough",
    signature:[{dim:"drive",w:2},{dim:"competitiveness",w:1},{dim:"independence",w:1}],
    energy:"Spent a lifetime being underestimated, then made that everyone else's problem." },
  { name:"Luna Lovegood", source:"Harry Potter", sourceType:"book", role:"The One Who Isn't Performing For Anyone",
    signature:[{dim:"openMindedness",w:2},{dim:"curiosity",w:1},{dim:"optimism",w:1}],
    energy:"Says the true, strange thing everyone else was too self-conscious to say." },
  { name:"Levi Ackerman", source:"Attack on Titan", sourceType:"anime", role:"The One Who Holds The Standard",
    signature:[{dim:"discipline",w:2},{dim:"leadership",w:1},{dim:"competitiveness",w:1}],
    energy:"Expects a lot, mostly because they expect exactly that much of themselves." },
  { name:"Furiosa", source:"Mad Max", sourceType:"movie", role:"The One Who Gets People Out",
    signature:[{dim:"resilience",w:1},{dim:"independence",w:1},{dim:"leadership",w:1}],
    energy:"Has a plan, has had it for a while, was just waiting for the right moment." },
  { name:"Ted Lasso", source:"Ted Lasso", sourceType:"show", role:"The One Who Believes In People Anyway",
    signature:[{dim:"optimism",w:2},{dim:"kindness",w:1},{dim:"patience",w:1}],
    energy:"Knows exactly how this could go badly, chooses kindness first anyway." },
];
const MEDIA_WORLDS = [
  { name:"Hogwarts", source:"Harry Potter", role:"Where curiosity gets rewarded, not just tolerated",
    signature:[{dim:"curiosity",w:2},{dim:"kindness",w:1},{dim:"openMindedness",w:1}],
    energy:"A world that takes wonder seriously and figures loyalty matters more than power." },
  { name:"The Fellowship's Road", source:"The Lord of the Rings", role:"Where the small, steady ones matter most",
    signature:[{dim:"persistence",w:2},{dim:"responsibility",w:1},{dim:"kindness",w:1}],
    energy:"A long, unglamorous journey that only works because someone refuses to quit." },
  { name:"Starfleet", source:"Star Trek", role:"Where curiosity is the whole mission",
    signature:[{dim:"curiosity",w:1},{dim:"logic",w:1},{dim:"optimism",w:1}],
    energy:"An exploration-first world that assumes most problems have a reasoned way through." },
  { name:"The Heist Crew", source:"a good heist story", role:"Where everyone's specialty actually matters",
    signature:[{dim:"planning",w:2},{dim:"risk",w:1},{dim:"adaptability",w:1}],
    energy:"A world built on one plan, a dozen contingencies, and trusting the person next to you." },
  { name:"The Found-Family Sitcom", source:"a good ensemble comedy", role:"Where the group is the whole point",
    signature:[{dim:"socialEnergy",w:1},{dim:"humor",w:1},{dim:"kindness",w:1}],
    energy:"A world where the people around you matter more than whatever the plot is about." },
  { name:"The Last Outpost", source:"a post-apocalyptic survival story", role:"Where you keep people alive, including yourself",
    signature:[{dim:"resilience",w:2},{dim:"independence",w:1},{dim:"emotionalStability",w:1}],
    energy:"A world with no safety net, which is exactly the kind you'd actually hold together." },
  { name:"The Noir City", source:"a detective mystery", role:"Where the truth is in the detail no one else caught",
    signature:[{dim:"logic",w:2},{dim:"curiosity",w:1},{dim:"independence",w:1}],
    energy:"A world that rewards paying closer attention than everyone else in the room." },
  { name:"The Tournament Arc", source:"a competitive shonen story", role:"Where you keep getting back up",
    signature:[{dim:"drive",w:1},{dim:"competitiveness",w:1},{dim:"persistence",w:1}],
    energy:"A world that keeps raising the bar, and keeps finding you already climbing it." },
];

/* ---- Historical Minds (v1.1) -------------------------------------------
   Feature 5's own hard rule: no living people. Every entry below died
   well before 2000 -- checked by hand against `died`, which exists
   specifically so that rule stays auditable rather than just asserted.
   Framed strictly around cognitive/behavioral style (how they worked,
   thought, or persisted), never around politics or moral judgment, for
   the same reason MEDIA_CHARACTERS keeps its own descriptions to
   personality analysis rather than biography. */
const HISTORICAL_MINDS = [
  { name:"Marie Curie", field:"Scientist", died:1934, role:"The One Who Kept Going Regardless",
    signature:[{dim:"discipline",w:2},{dim:"curiosity",w:1},{dim:"persistence",w:1}],
    energy:"Worked through years of tedious, thankless measurement to get to one real answer." },
  { name:"Albert Einstein", field:"Scientist", died:1955, role:"The One Who Questioned The Obvious Answer",
    signature:[{dim:"creativity",w:2},{dim:"curiosity",w:1},{dim:"independence",w:1}],
    energy:"Took the assumption everyone else built on and asked what if it's wrong." },
  { name:"Leonardo da Vinci", field:"Polymath", died:1519, role:"The One Who Couldn't Pick Just One Thing",
    signature:[{dim:"curiosity",w:2},{dim:"creativity",w:1},{dim:"openMindedness",w:1}],
    energy:"Treated every field as one connected question, not separate boxes." },
  { name:"Nikola Tesla", field:"Inventor", died:1943, role:"The One Who Saw The Thing Before It Existed",
    signature:[{dim:"creativity",w:2},{dim:"independence",w:1},{dim:"risk",w:1}],
    energy:"Built for a future that hadn't caught up to the idea yet." },
  { name:"Charles Darwin", field:"Naturalist", died:1882, role:"The One Who Watched Longer Than Anyone Else",
    signature:[{dim:"curiosity",w:1},{dim:"patience",w:2},{dim:"discipline",w:1}],
    energy:"Spent decades collecting quiet evidence before saying anything out loud." },
  { name:"Jane Austen", field:"Writer", died:1817, role:"The One Who Saw Exactly What People Were Doing",
    signature:[{dim:"selfAwareness",w:1},{dim:"humor",w:1},{dim:"logic",w:1}],
    energy:"Noticed the social game everyone was playing and wrote it down precisely." },
  { name:"Virginia Woolf", field:"Writer", died:1941, role:"The One Who Went Looking Inward",
    signature:[{dim:"creativity",w:1},{dim:"selfAwareness",w:2},{dim:"independence",w:1}],
    energy:"Trusted an inner train of thought most people talk themselves out of following." },
  { name:"Mahatma Gandhi", field:"Reformer", died:1948, role:"The One Who Waited You Out",
    signature:[{dim:"discipline",w:1},{dim:"patience",w:2},{dim:"persistence",w:1}],
    energy:"Chose the slower, harder method on purpose and stayed with it for decades." },
  { name:"Socrates", field:"Philosopher", died:-399, role:"The One Who Just Kept Asking Why",
    signature:[{dim:"curiosity",w:2},{dim:"logic",w:1},{dim:"independence",w:1}],
    energy:"Made people defend an idea until they realized they hadn't examined it at all." },
  { name:"Ada Lovelace", field:"Mathematician", died:1852, role:"The One Who Saw What The Machine Could Become",
    signature:[{dim:"creativity",w:1},{dim:"logic",w:2},{dim:"curiosity",w:1}],
    energy:"Looked at a calculating machine and saw something closer to imagination." },
  { name:"Mark Twain", field:"Writer", died:1910, role:"The One Who Said It Through A Joke",
    signature:[{dim:"humor",w:2},{dim:"independence",w:1},{dim:"openMindedness",w:1}],
    energy:"Got away with saying the sharp true thing because it was also funny." },
  { name:"Isaac Newton", field:"Scientist", died:1727, role:"The One Who Wouldn't Stop Until It Resolved",
    signature:[{dim:"logic",w:2},{dim:"discipline",w:1},{dim:"independence",w:1}],
    energy:"Disappeared into a single hard problem until it actually gave way." },
  { name:"Confucius", field:"Philosopher", died:-479, role:"The One Who Thought In Systems Of Duty",
    signature:[{dim:"discipline",w:1},{dim:"patience",w:1},{dim:"responsibility",w:2}],
    energy:"Built an entire way of living around what people owed each other." },
  { name:"Vincent van Gogh", field:"Artist", died:1890, role:"The One Who Felt It Before He Understood It",
    signature:[{dim:"creativity",w:2},{dim:"openMindedness",w:1},{dim:"drive",w:1}],
    energy:"Painted what he felt at full intensity, unfiltered by whether it was expected." },
  { name:"Harriet Tubman", field:"Strategist", died:1913, role:"The One Who Went Back For The Others",
    signature:[{dim:"resilience",w:1},{dim:"responsibility",w:1},{dim:"risk",w:1}],
    energy:"Got out, then spent years going back into danger to get others out too." },
  { name:"Marcus Aurelius", field:"Philosopher", died:180, role:"The One Who Wrote To Steady Himself",
    signature:[{dim:"discipline",w:1},{dim:"emotionalStability",w:2},{dim:"selfAwareness",w:1}],
    energy:"Kept a private, honest ledger of his own mind instead of performing certainty." },
  { name:"Emily Dickinson", field:"Poet", died:1886, role:"The One Who Didn't Need The Room",
    signature:[{dim:"independence",w:2},{dim:"selfAwareness",w:1},{dim:"creativity",w:1}],
    energy:"Did the work entirely on her own terms, with almost no audience at all." },
  { name:"Alan Turing", field:"Mathematician", died:1954, role:"The One Who Reduced It To Its Real Shape",
    signature:[{dim:"logic",w:2},{dim:"curiosity",w:1},{dim:"independence",w:1}],
    energy:"Cut straight through the noise in a problem to the one question that mattered." },
];

/* ---- Aesthetic vibes --------------------------------------- */
const AESTHETIC_VIBES = [
  { name:"Minimalist", signature:[{dim:"discipline",w:2},{dim:"planning",w:1},{dim:"independence",w:1}],
    colors:"Monochrome, with a single considered accent color",
    fontPairing:"A clean grotesk sans, generous whitespace, nothing decorative",
    clothing:"Neutral tones, a few well-made basics rather than a lot of pieces",
    room:"Uncluttered, with only objects you'd defend keeping",
    workspace:"One screen, a closed tab list, nothing on the desk you don't use daily" },
  { name:"Maximalist", signature:[{dim:"creativity",w:2},{dim:"openMindedness",w:1},{dim:"humor",w:1}],
    colors:"Layered and saturated, more is more and it still works",
    fontPairing:"An expressive display face paired with a plain, quiet body font",
    clothing:"Pattern on pattern, secondhand pieces that already have a story",
    room:"Every wall doing something, nothing left blank",
    workspace:"Covered in reference material and half-finished ideas" },
  { name:"Moody", signature:[{dim:"independence",w:2},{dim:"selfAwareness",w:1},{dim:"risk",w:1}],
    colors:"Deep charcoal and ink, one warm point of light",
    fontPairing:"A narrow serif for headlines, monospace for detail",
    clothing:"Mostly black, well-tailored, quietly expensive-looking",
    room:"Low light, very few objects, each one deliberate",
    workspace:"One lamp, a closed door, minimal notifications" },
  { name:"Bright and Playful", signature:[{dim:"humor",w:2},{dim:"socialEnergy",w:1},{dim:"optimism",w:1}],
    colors:"Warm, saturated primaries",
    fontPairing:"A rounded sans with big, friendly headlines",
    clothing:"Color blocking, one slightly silly accessory",
    room:"Plants, posters, visible personality everywhere",
    workspace:"Sticky notes, music on, a little chaos that works" },
  { name:"Classic and Structured", signature:[{dim:"responsibility",w:2},{dim:"discipline",w:1},{dim:"planning",w:1}],
    colors:"Navy, cream, and forest green",
    fontPairing:"A traditional serif with a restrained sans for interface text",
    clothing:"Tailored and timeless, rarely trend-driven",
    room:"Symmetry, good lighting, nothing out of place",
    workspace:"Labeled folders and an actual calendar on the wall" },
  { name:"Bohemian", signature:[{dim:"openMindedness",w:2},{dim:"curiosity",w:1},{dim:"creativity",w:1}],
    colors:"Earth tones and warm textiles",
    fontPairing:"A handwritten accent font over a soft serif body",
    clothing:"Layered and textured, well-traveled",
    room:"Plants, textiles, souvenirs that each have a story",
    workspace:"A mess that only makes sense to you, and that's fine" },
  { name:"Industrial", signature:[{dim:"logic",w:1},{dim:"discipline",w:1},{dim:"independence",w:1}],
    colors:"Concrete grey and black steel, one raw wood tone",
    fontPairing:"A monospace headline over a utilitarian sans body",
    clothing:"Functional, durable, unfussy",
    room:"Exposed materials, minimal decoration",
    workspace:"Built for output, not for showing off" },
  { name:"Soft and Cozy", signature:[{dim:"kindness",w:2},{dim:"patience",w:1},{dim:"empathy",w:1}],
    colors:"Warm neutrals and muted pastels",
    fontPairing:"A rounded, soft serif with generous line height",
    clothing:"Layered knits, comfort over statement",
    room:"Warm lighting, soft textures, a blanket always within reach",
    workspace:"A candle, a plant, something handmade nearby" },
];

/* ---- Ideal environments ------------------------------------ */
const ENVIRONMENT_PROFILES = [
  { name:"Remote", signature:[{dim:"independence",w:2},{dim:"discipline",w:1}] },
  { name:"Office", signature:[{dim:"socialEnergy",w:1},{dim:"discipline",w:1},{dim:"planning",w:1}] },
  { name:"Startup", signature:[{dim:"risk",w:2},{dim:"drive",w:1}] },
  { name:"Corporate", signature:[{dim:"responsibility",w:2},{dim:"planning",w:1}] },
  { name:"Nature", signature:[{dim:"curiosity",w:1},{dim:"independence",w:1},{dim:"openMindedness",w:1}] },
  { name:"City", signature:[{dim:"socialEnergy",w:2},{dim:"curiosity",w:1}] },
  { name:"Night", signature:[{dim:"independence",w:1},{dim:"creativity",w:1},{dim:"openMindedness",w:1}] },
  { name:"Morning", signature:[{dim:"discipline",w:2},{dim:"planning",w:1}] },
  { name:"Coffee Shop", signature:[{dim:"socialEnergy",w:1},{dim:"curiosity",w:1},{dim:"creativity",w:1}] },
  { name:"Library", signature:[{dim:"patience",w:2},{dim:"discipline",w:1}] },
  { name:"Home", signature:[{dim:"kindness",w:1},{dim:"patience",w:1},{dim:"independence",w:1}] },
  { name:"Freelancer", signature:[{dim:"independence",w:2},{dim:"adaptability",w:1}] },
  { name:"Research", signature:[{dim:"curiosity",w:2},{dim:"patience",w:1}] },
  { name:"Teaching", signature:[{dim:"patience",w:1},{dim:"empathy",w:1},{dim:"leadership",w:1}] },
  { name:"Creative Studio", signature:[{dim:"creativity",w:2},{dim:"openMindedness",w:1}] },
  { name:"Management", signature:[{dim:"leadership",w:2},{dim:"responsibility",w:1}] },
];

/* ---- Stress responses --------------------------------------- */
const STRESS_RESPONSES = [
  { name:"Fight", description:"You meet pressure head-on and push back rather than pull away.",
    signature:[{dim:"competitiveness",w:2},{dim:"confidence",w:1},{dim:"risk",w:1}] },
  { name:"Flight", description:"You create distance from the source of the stress until you can think clearly again.",
    signature:[{dim:"independence",w:2},{dim:"adaptability",w:1}] },
  { name:"Freeze", description:"Everything pauses for a moment before you can figure out the next move.",
    signature:[{dim:"emotionalStability",w:-2},{dim:"patience",w:1}] },
  { name:"Humor", description:"You defuse the tension, for yourself as much as anyone else, with a joke.",
    signature:[{dim:"humor",w:2},{dim:"adaptability",w:1}] },
  { name:"Planning", description:"You channel the stress directly into a plan, even an imperfect one.",
    signature:[{dim:"planning",w:2},{dim:"discipline",w:1}] },
  { name:"Isolation", description:"You process it alone before you're ready to bring anyone else in.",
    signature:[{dim:"independence",w:2},{dim:"socialEnergy",w:-1}] },
  { name:"Seeking Comfort", description:"You reach for warmth and reassurance, from people or routines you trust.",
    signature:[{dim:"empathy",w:1},{dim:"kindness",w:1},{dim:"socialEnergy",w:1}] },
  { name:"Talking It Out", description:"Saying it out loud to someone else is how you actually process it.",
    signature:[{dim:"socialEnergy",w:2},{dim:"trust",w:1}] },
];

/* ---- Percentage-breakdown categories (Updates 8, 9, 10) ----------------- */
const THINKING_CATEGORIES = [
  { name:"Visual", dims:["creativity","curiosity"] },
  { name:"Logical", dims:["logic","logic"] },
  { name:"Creative", dims:["creativity","openMindedness"] },
  { name:"Strategic", dims:["planning","leadership"] },
  { name:"Abstract", dims:["curiosity","openMindedness"] },
  { name:"Practical", dims:["discipline","responsibility"] },
];
const LEARNING_CATEGORIES = [
  { name:"Reading", dims:["independence","patience"] },
  { name:"Watching", dims:["patience","curiosity"] },
  { name:"Teaching", dims:["leadership","empathy"] },
  { name:"Experimenting", dims:["curiosity","risk"] },
  { name:"Building", dims:["discipline","persistence"] },
  { name:"Discussion", dims:["socialEnergy","curiosity"] },
];
const DECISION_CATEGORIES = [
  { name:"Logic", dims:["logic","logic"] },
  { name:"Emotion", dims:["empathy","empathy"] },
  { name:"Instinct", dims:["risk","confidence"] },
  { name:"Curiosity", dims:["curiosity","openMindedness"] },
  { name:"Experience", dims:["selfAwareness","resilience"] },
];
const LOVE_LANGUAGE_CATEGORIES = [
  { name:"Physical Touch", dims:["socialEnergy","trust"] },
  { name:"Words of Affirmation", dims:["empathy","confidence"] },
  { name:"Quality Time", dims:["patience","trust","kindness"] },
  { name:"Acts of Service", dims:["responsibility","kindness","discipline"] },
  { name:"Gift Giving", dims:["creativity","drive","kindness"] },
];

/* ---- Attachment and conflict styles -------------------------- */
const ATTACHMENT_STYLES = [
  { name:"Secure", signature:[{dim:"trust",w:2},{dim:"emotionalStability",w:1},{dim:"empathy",w:1}],
    description:"You're generally comfortable with closeness and don't assume the worst when things go quiet." },
  { name:"Anxious", signature:[{dim:"trust",w:-1},{dim:"emotionalStability",w:-2},{dim:"empathy",w:1}],
    description:"You feel things in relationships intensely, and reassurance genuinely helps." },
  { name:"Avoidant", signature:[{dim:"independence",w:2},{dim:"trust",w:-1}],
    description:"You value your independence in relationships enough that closeness can sometimes feel like pressure." },
  { name:"Disorganized", signature:[{dim:"emotionalStability",w:-2},{dim:"independence",w:-1},{dim:"trust",w:-1}],
    description:"You want closeness and also feel wary of it, sometimes both in the same conversation." },
];
const CONFLICT_STYLES = [
  { name:"Assertive", signature:[{dim:"confidence",w:2},{dim:"leadership",w:1}],
    description:"You say what's wrong directly, early, before it has time to build up." },
  { name:"Avoidant", signature:[{dim:"independence",w:2},{dim:"socialEnergy",w:-1}],
    description:"You'd rather let small things pass than turn every disagreement into a conversation." },
  { name:"Collaborative", signature:[{dim:"empathy",w:2},{dim:"adaptability",w:1}],
    description:"You look for the version of the disagreement where both people actually get something they need." },
  { name:"Accommodating", signature:[{dim:"kindness",w:2},{dim:"patience",w:1}],
    description:"You tend to prioritize keeping the peace, sometimes more than getting your own way." },
];

/* ---- Entertainment taste profiles ---------------------------- */
const ENTERTAINMENT_PROFILES = [
  { name:"Epic and Adventurous", signature:[{dim:"risk",w:1},{dim:"drive",w:1},{dim:"optimism",w:1}],
    music:"Orchestral scores, anthemic rock", movie:"Epic adventure, fantasy",
    tv:"Long-arc fantasy series", book:"Epic fantasy, adventure fiction" },
  { name:"Dark and Cerebral", signature:[{dim:"logic",w:1},{dim:"independence",w:1},{dim:"selfAwareness",w:1}],
    music:"Moody electronic, post-rock", movie:"Psychological thriller, neo-noir",
    tv:"Prestige crime drama", book:"Literary fiction, philosophy" },
  { name:"Warm and Comforting", signature:[{dim:"kindness",w:1},{dim:"patience",w:1},{dim:"empathy",w:1}],
    music:"Acoustic, indie folk", movie:"Heartfelt drama, slice of life",
    tv:"Cozy sitcom", book:"Contemporary fiction, memoir" },
  { name:"Bold and Energetic", signature:[{dim:"humor",w:1},{dim:"socialEnergy",w:1},{dim:"confidence",w:1}],
    music:"Pop, hip hop", movie:"Action comedy",
    tv:"Ensemble comedy", book:"Fast-paced thriller" },
  { name:"Strange and Original", signature:[{dim:"creativity",w:1},{dim:"openMindedness",w:1},{dim:"curiosity",w:1}],
    music:"Experimental, genre-blending", movie:"Surreal indie, arthouse",
    tv:"Anthology sci-fi", book:"Speculative fiction, magical realism" },
  { name:"Sharp and Strategic", signature:[{dim:"logic",w:1},{dim:"planning",w:1},{dim:"leadership",w:1}],
    music:"Classical, instrumental", movie:"Heist, courtroom drama",
    tv:"Political drama", book:"Nonfiction, strategy and history" },
  { name:"Romantic and Emotional", signature:[{dim:"empathy",w:1},{dim:"trust",w:1},{dim:"optimism",w:1}],
    music:"Soul, R&B ballads", movie:"Romance, coming of age",
    tv:"Romantic drama", book:"Romance, emotionally driven fiction" },
  { name:"Rebellious and Independent", signature:[{dim:"independence",w:1},{dim:"risk",w:1},{dim:"competitiveness",w:1}],
    music:"Punk, alt rock", movie:"Underdog sports drama, heist",
    tv:"Antihero drama", book:"Gritty realism, rebellion narratives" },
];

/* ---- Achievements -------------------------------------------
   Each test runs against normalized dimensions (-10..10). Deterministic,
   no randomness, so the same profile always unlocks the same badges. */
const ACHIEVEMENTS = [
  { name:"Professional Overthinker", icon:"\uD83E\uDDE0", description:"High logic and high self-awareness, a dangerous combination for a quiet Sunday.",
    test: nd => nd.logic >= 5 && nd.selfAwareness >= 5 },
  { name:"Chaos Gremlin", icon:"\uD83D\uDE08", description:"High risk, high humor, low discipline. A menace, affectionately.",
    test: nd => nd.risk >= 5 && nd.humor >= 4 && nd.discipline <= -1 },
  { name:"Human Wikipedia", icon:"\uD83D\uDCDA", description:"Curiosity that doesn't really have an off switch.",
    test: nd => nd.curiosity >= 6 },
  { name:"Main Character Energy", icon:"\u2B50", description:"Confidence and drive, stacked.",
    test: nd => nd.confidence >= 6 && nd.drive >= 5 },
  { name:"Golden Retriever", icon:"\uD83D\uDC15", description:"High kindness, high optimism, genuinely happy to see people.",
    test: nd => nd.kindness >= 6 && nd.optimism >= 5 },
  { name:"Black Cat", icon:"\uD83D\uDC08\u200D\u2B1B", description:"Independent, a little chaotic, weirdly good company.",
    test: nd => nd.independence >= 6 && nd.humor >= 4 },
  { name:"Certified Therapist Friend", icon:"\uD83E\uDEC2", description:"People end up telling you things they haven't told anyone else.",
    test: nd => nd.empathy >= 6 && nd.patience >= 5 },
  { name:"Touch Grass", icon:"\uD83C\uDF31", description:"Low social energy, high independence, genuinely content alone.",
    test: nd => nd.socialEnergy <= -4 && nd.independence >= 5 },
  { name:"Walking Green Flag", icon:"\uD83C\uDFF3", description:"High trust, high kindness, high responsibility. The whole package.",
    test: nd => nd.trust >= 6 && nd.kindness >= 5 && nd.responsibility >= 5 },
  { name:"Clutch Machine", icon:"\uD83C\uDFAF", description:"Resilient and disciplined under real pressure.",
    test: nd => nd.resilience >= 6 && nd.discipline >= 5 },
  { name:"Built Different", icon:"\uD83E\uDEA8", description:"Persistence and drive that doesn't run out early.",
    test: nd => nd.persistence >= 6 && nd.drive >= 5 },
  { name:"Night Owl Thinker", icon:"\uD83E\uDD89", description:"Open-minded and independent, the two traits of someone who does their best thinking off-schedule.",
    test: nd => nd.openMindedness >= 5 && nd.independence >= 5 },
  { name:"Walking Red Flag (Self-Aware About It)", icon:"\uD83D\uDEA9", description:"Competitive and guarded, but at least you know it.",
    test: nd => nd.trust <= -3 && nd.competitiveness >= 5 && nd.selfAwareness >= 3 },
  { name:"Overthinks the Group Chat", icon:"\uD83D\uDCAC", description:"High self-awareness and moderate social energy, so every message gets reread twice.",
    test: nd => nd.selfAwareness >= 6 && nd.socialEnergy >= 0 && nd.socialEnergy <= 4 },
  { name:"Quiet Storm", icon:"\u26C8", description:"Low social energy but high leadership, influence without needing the room.",
    test: nd => nd.socialEnergy <= 0 && nd.leadership >= 5 },
  { name:"Comeback Season", icon:"\uD83D\uDD01", description:"High resilience and high optimism after clearly being tested.",
    test: nd => nd.resilience >= 5 && nd.optimism >= 5 && nd.emotionalStability <= 2 },
];

/* =========================================================================
   V3 ADDITIONS
   Deeper compatibility categories, confidence/stability support, fantasy
   and story roles, friendship and work profiles, extra fun-fact lookup
   tables. Nothing above this line changes.
   ========================================================================= */

/* ---- Compatibility categories (Update: Better Compatibility Algorithm) -
   type "similarity": scored on how alike the two people are on these dims.
   type "combined": scored on how much of this energy exists between them
   together, regardless of whether they're alike. */
const COMPATIBILITY_CATEGORIES = [
  { name:"Friendship", type:"similarity", dims:["trust","kindness","socialEnergy"] },
  { name:"Romantic Compatibility", type:"similarity", dims:["empathy","trust","confidence"] },
  { name:"Marriage", type:"similarity", dims:["patience","trust","discipline"] },
  { name:"Long Distance", type:"similarity", dims:["independence","trust","discipline"] },
  { name:"Communication", type:"similarity", dims:["socialEnergy","logic","empathy"] },
  { name:"Conflict Resolution", type:"similarity", dims:["patience","empathy","logic"] },
  { name:"Trust", type:"similarity", dims:["trust"] },
  { name:"Emotional Support", type:"similarity", dims:["empathy","kindness","patience"] },
  { name:"Humor", type:"combined", dims:["humor"] },
  { name:"Adventure", type:"combined", dims:["risk","curiosity","adaptability"] },
  { name:"Gaming Partner", type:"similarity", dims:["patience","logic","humor"] },
  { name:"Travel Partner", type:"similarity", dims:["adaptability","risk","curiosity"] },
  { name:"Study Partner", type:"similarity", dims:["discipline","patience","logic"] },
  { name:"Business Partner", type:"similarity", dims:["drive","logic","discipline"] },
  { name:"Creative Partner", type:"similarity", dims:["creativity","adaptability","curiosity"] },
  { name:"Startup Partner", type:"combined", dims:["risk","drive","adaptability"] },
  { name:"Roommate", type:"similarity", dims:["patience","trust","discipline"] },
  { name:"Daily Lifestyle", type:"similarity", dims:["discipline","planning","socialEnergy"] },
  { name:"Work Habits", type:"similarity", dims:["discipline","responsibility","planning"] },
  { name:"Leadership Balance", type:"similarity", dims:["leadership"] },
  { name:"Problem Solving", type:"similarity", dims:["logic","creativity","adaptability"] },
  { name:"Emotional Intelligence", type:"similarity", dims:["empathy","selfAwareness"] },
  { name:"Social Energy Balance", type:"similarity", dims:["socialEnergy"] },
  { name:"Life Goals", type:"similarity", dims:["drive","optimism","planning"] },
  { name:"Risk Taking", type:"similarity", dims:["risk"] },
  { name:"Decision Style", type:"similarity", dims:["logic","risk","curiosity"] },
  { name:"Learning Style", type:"similarity", dims:["independence","curiosity","socialEnergy"] },
  { name:"Future Planning", type:"similarity", dims:["planning","optimism"] },
  { name:"Reliability", type:"similarity", dims:["responsibility","discipline","trust"] },
  { name:"Fun Together", type:"combined", dims:["humor","socialEnergy","optimism"] },
  { name:"Chaos Together", type:"combined", dims:["risk","humor"] },
  { name:"Teamwork", type:"combined", dims:["leadership","adaptability","responsibility"] },
  { name:"Growth Potential", type:"combined", dims:["optimism","curiosity","resilience"] },
];

/* Overview metrics (Compare 2.0): a fixed, human-labeled subset of the
   categories above, in the order the overview grid shows them. Keeping
   this as a name->category mapping instead of duplicating scoring logic
   means the overview numbers and the "all categories" list underneath
   are always the exact same computation, never two slightly different
   ideas of "Trust" or "Communication". */
const COMPARE_OVERVIEW_METRICS = [
  { label:"Friendship", category:"Friendship" },
  { label:"Teamwork", category:"Teamwork" },
  { label:"Leadership", category:"Leadership Balance" },
  { label:"Communication", category:"Communication" },
  { label:"Conflict", category:"Conflict Resolution" },
  { label:"Trust", category:"Trust" },
  { label:"Decision Making", category:"Decision Style" },
  { label:"Creativity", category:"Creative Partner" },
  { label:"Growth Potential", category:"Growth Potential" },
];

/* ---- "Who does X more" comparisons -------------------------------------- */
const WHO_COMPARISONS = [
  { label:"Plans More", dim:"planning" },
  { label:"Takes More Risks", dim:"risk" },
  { label:"Leads More", dim:"leadership" },
  { label:"Supports More", dim:"kindness" },
  { label:"Comforts More", dim:"empathy" },
  { label:"Motivates More", dim:"drive" },
  { label:"Listens Better", dim:"patience" },
  { label:"Decides Faster", dim:"confidence" },
  { label:"Is More Creative", dim:"creativity" },
  { label:"Is More Practical", dim:"discipline" },
  { label:"Is More Curious", dim:"curiosity" },
  { label:"Is More Competitive", dim:"competitiveness" },
  { label:"Is More Social", dim:"socialEnergy" },
  { label:"Is More Independent", dim:"independence" },
  { label:"Is More Organized", dim:"planning" },
  { label:"Is More Emotionally Reactive", dim:"emotionalStability", invert:true },
  { label:"Is More Logical", dim:"logic" },
];

/* ---- Fantasy roles (Update: Fantasy Role) -------------------------------- */
const FANTASY_ROLES = [
  { name:"Knight", icon:"\u2694", signature:[{dim:"discipline",w:1},{dim:"responsibility",w:2},{dim:"resilience",w:1}],
    description:"You hold the line. Discipline and duty come before comfort, every time." },
  { name:"Mage", icon:"\uD83D\uDD2E", signature:[{dim:"logic",w:2},{dim:"curiosity",w:1}],
    description:"You study the underlying rules of things until you can bend them." },
  { name:"Healer", icon:"\uD83D\uDC9A", signature:[{dim:"empathy",w:2},{dim:"kindness",w:1}],
    description:"You notice pain before it's spoken and you don't walk past it." },
  { name:"Ranger", icon:"\uD83C\uDFF9", signature:[{dim:"independence",w:1},{dim:"curiosity",w:1},{dim:"patience",w:1}],
    description:"You're most yourself off the marked trail, self-reliant and observant." },
  { name:"Bard", icon:"\uD83C\uDFB5", signature:[{dim:"humor",w:1},{dim:"socialEnergy",w:1},{dim:"creativity",w:1}],
    description:"You move rooms with words, and you're rarely short of either." },
  { name:"Rogue", icon:"\uD83D\uDDE1", signature:[{dim:"risk",w:1},{dim:"adaptability",w:1},{dim:"independence",w:1}],
    description:"Rules are more of a starting position than a boundary for you." },
  { name:"Necromancer", icon:"\uD83D\uDC80", signature:[{dim:"independence",w:2},{dim:"logic",w:1}],
    description:"You're comfortable in territory most people avoid, literally or otherwise." },
  { name:"Summoner", icon:"\uD83D\uDC09", signature:[{dim:"leadership",w:1},{dim:"creativity",w:1},{dim:"socialEnergy",w:1}],
    description:"You rarely do it all yourself, you're good at bringing the right help in." },
  { name:"Alchemist", icon:"\u2697", signature:[{dim:"curiosity",w:2},{dim:"creativity",w:1}],
    description:"You're always mid-experiment, combining things nobody else thought to combine." },
  { name:"Blacksmith", icon:"\uD83D\uDD28", signature:[{dim:"discipline",w:1},{dim:"persistence",w:2}],
    description:"You build things that last through sheer repeated, unglamorous effort." },
  { name:"Monk", icon:"\uD83E\uDDD8", signature:[{dim:"patience",w:2},{dim:"selfAwareness",w:1}],
    description:"You've done the internal work most people put off indefinitely." },
  { name:"Guardian", icon:"\uD83D\uDEE1", signature:[{dim:"responsibility",w:2},{dim:"trust",w:1}],
    description:"Something or someone is always under your watch, by choice." },
  { name:"Beast Tamer", icon:"\uD83E\uDD8A", signature:[{dim:"empathy",w:1},{dim:"patience",w:1},{dim:"trust",w:1}],
    description:"You earn trust slowly, from people and animals both, and it holds." },
  { name:"Explorer", icon:"\uD83E\uDDED", signature:[{dim:"curiosity",w:2},{dim:"risk",w:1}],
    description:"Unmapped territory is an invitation, not a warning." },
  { name:"Captain", icon:"\u2693", signature:[{dim:"leadership",w:1},{dim:"confidence",w:1},{dim:"responsibility",w:1}],
    description:"You take the wheel because someone has to and you trust yourself with it." },
  { name:"Scholar", icon:"\uD83D\uDCDA", signature:[{dim:"logic",w:1},{dim:"curiosity",w:1},{dim:"discipline",w:1}],
    description:"You'd rather fully understand something than just get by with it." },
  { name:"Oracle", icon:"\uD83D\uDD2E", signature:[{dim:"selfAwareness",w:2},{dim:"empathy",w:1}],
    description:"You sense where things are heading before most people name it." },
  { name:"Inventor", icon:"\u2699", signature:[{dim:"creativity",w:1},{dim:"logic",w:1},{dim:"persistence",w:1}],
    description:"You'd rather build the thing that doesn't exist yet than wait for someone else to." },
  { name:"Merchant", icon:"\uD83D\uDCB0", signature:[{dim:"socialEnergy",w:1},{dim:"drive",w:1},{dim:"adaptability",w:1}],
    description:"You read a deal, and a room, quickly, and you rarely leave empty-handed." },
  { name:"Dragon Rider", icon:"\uD83D\uDC09", signature:[{dim:"risk",w:1},{dim:"trust",w:1},{dim:"confidence",w:1}],
    description:"You bond fast with something powerful and back it completely once you do." },
];

/* ---- Friend type (Friendship Profile) ------------------------------------ */
const FRIEND_TYPES = [
  { name:"The Fun Friend", signature:[{dim:"humor",w:2},{dim:"socialEnergy",w:1}] },
  { name:"The Therapist Friend", signature:[{dim:"empathy",w:2},{dim:"patience",w:1}] },
  { name:"The Golden Retriever Friend", signature:[{dim:"kindness",w:2},{dim:"optimism",w:1}] },
  { name:"The Black Cat Friend", signature:[{dim:"independence",w:2},{dim:"humor",w:1}] },
  { name:"The Protective Friend", signature:[{dim:"responsibility",w:2},{dim:"trust",w:1}] },
  { name:"The Planner Friend", signature:[{dim:"planning",w:2},{dim:"discipline",w:1}] },
  { name:"The Wildcard Friend", signature:[{dim:"risk",w:1},{dim:"humor",w:1},{dim:"adaptability",w:1}] },
  { name:"The Steady Friend", signature:[{dim:"resilience",w:1},{dim:"trust",w:1},{dim:"patience",w:1}] },
];

/* ---- Motivation styles (Motivation Profile) ------------------------------- */
const MOTIVATION_STYLES = [
  { name:"Driven by Mastery", signature:[{dim:"discipline",w:1},{dim:"persistence",w:1},{dim:"curiosity",w:1}] },
  { name:"Driven by Recognition", signature:[{dim:"confidence",w:1},{dim:"competitiveness",w:1},{dim:"drive",w:1}] },
  { name:"Driven by Connection", signature:[{dim:"empathy",w:1},{dim:"socialEnergy",w:1},{dim:"kindness",w:1}] },
  { name:"Driven by Purpose", signature:[{dim:"responsibility",w:1},{dim:"optimism",w:1},{dim:"drive",w:1}] },
  { name:"Driven by Freedom", signature:[{dim:"independence",w:2},{dim:"risk",w:1}] },
];

/* ---- Soul Type: a separate, deeper identity lens ---------------------------
   Not the archetype system and not scored against it — this is a second,
   independent read of the same normDims, structured like the other
   scoreBySignature() lookups above (mythical creature, motivation style,
   etc.), just with a fixed 6-item palette instead of 12 archetypes. The
   archetype answers "which of 12 patterns fits your answers best"; soul
   type answers "which single core motivation shows up strongest," a
   coarser, more elemental read that intentionally overlaps with (rather
   than derives from) the archetype score. Colors and their meanings are a
   fixed, non-negotiable palette — do not add or reorder entries. */
const SOUL_TYPES = [
  { name:"Crimson", hex:"#DC2626", trait:"Passion", meaning:"Intensity, desire, chasing what actually lights you up.", signature:[{dim:"drive",w:2},{dim:"competitiveness",w:1},{dim:"confidence",w:1}] },
  { name:"Ember", hex:"#F59E0B", trait:"Growth", meaning:"Steady growth, building something that lasts through the setbacks.", signature:[{dim:"persistence",w:2},{dim:"resilience",w:1},{dim:"optimism",w:1}] },
  { name:"Dawn", hex:"#FDE047", trait:"Hope", meaning:"Hope, believing the next chapter is worth showing up for.", signature:[{dim:"optimism",w:2},{dim:"trust",w:1}] },
  { name:"Verdant", hex:"#22C55E", trait:"Compassion", meaning:"Compassion, caring for people without needing credit for it.", signature:[{dim:"kindness",w:2},{dim:"empathy",w:1}] },
  { name:"Azure", hex:"#38BDF8", trait:"Wisdom", meaning:"Wisdom, the kind that comes from actually paying attention.", signature:[{dim:"selfAwareness",w:1},{dim:"logic",w:1},{dim:"patience",w:1}] },
  { name:"Astral", hex:"#818CF8", trait:"Vision", meaning:"Vision, seeing the shape of something before it exists.", signature:[{dim:"creativity",w:1},{dim:"openMindedness",w:2},{dim:"curiosity",w:1}] },
];
// Signature totals aren't all equal (Crimson/Ember/Astral sum to 4,
// Dawn/Verdant/Azure sum to 3), so a raw weighted-sum comparison gives the
// lighter signatures a permanently lower ceiling regardless of how well
// their dims are satisfied. Scaling each item's raw score by
// maxWeight/itsOwnWeight puts every item on the same max-achievable scale
// before they're compared, without changing anything for the ones already
// at maxWeight.
function signatureMaxWeight(list){
  return Math.max(...list.map(item => item.signature.reduce((s, x) => s + x.w, 0)));
}
const SOUL_MAX_WEIGHT = signatureMaxWeight(SOUL_TYPES);
function scoreSoulTypes(normDims){
  return SOUL_TYPES.map(s => {
    const totalWeight = s.signature.reduce((sum, x) => sum + x.w, 0);
    const raw = s.signature.reduce((sum, x) => sum + (normDims[x.dim] || 0) * x.w, 0);
    return { item: s, score: raw * (SOUL_MAX_WEIGHT / totalWeight) };
  }).sort((a, b) => b.score - a.score);
}
function computeSoulType(normDims){ return scoreSoulTypes(normDims)[0].item; }

/* ---- Fun extra profiles: mythical creature, season, weather, planet ------- */
const MYTHICAL_CREATURES = [
  { name:"Phoenix", signature:[{dim:"resilience",w:2},{dim:"optimism",w:1}] },
  { name:"Dragon", signature:[{dim:"confidence",w:1},{dim:"leadership",w:1},{dim:"risk",w:1}] },
  { name:"Kitsune", signature:[{dim:"creativity",w:1},{dim:"humor",w:1},{dim:"adaptability",w:1}] },
  { name:"Griffin", signature:[{dim:"responsibility",w:1},{dim:"leadership",w:1}] },
  { name:"Selkie", signature:[{dim:"independence",w:1},{dim:"emotionalStability",w:-1}] },
  { name:"Unicorn", signature:[{dim:"kindness",w:2},{dim:"trust",w:1}] },
  { name:"Sphinx", signature:[{dim:"logic",w:2},{dim:"curiosity",w:1}] },
  { name:"Kraken", signature:[{dim:"independence",w:2},{dim:"competitiveness",w:1}] },
];
const SEASONS = [
  { name:"Spring", signature:[{dim:"optimism",w:1},{dim:"openMindedness",w:1}] },
  { name:"Summer", signature:[{dim:"socialEnergy",w:1},{dim:"drive",w:1}] },
  { name:"Autumn", signature:[{dim:"selfAwareness",w:1},{dim:"patience",w:1}] },
  { name:"Winter", signature:[{dim:"independence",w:1},{dim:"discipline",w:1}] },
];
const TIMES_OF_DAY = [
  { name:"Golden Hour", signature:[{dim:"creativity",w:1},{dim:"optimism",w:1}] },
  { name:"Midnight", signature:[{dim:"independence",w:1},{dim:"creativity",w:1}] },
  { name:"Early Morning", signature:[{dim:"discipline",w:1},{dim:"planning",w:1}] },
  { name:"Midday", signature:[{dim:"drive",w:1},{dim:"socialEnergy",w:1}] },
];
const CHESS_PIECES = [
  { name:"The King", signature:[{dim:"responsibility",w:2},{dim:"patience",w:1}] },
  { name:"The Queen", signature:[{dim:"leadership",w:1},{dim:"adaptability",w:1},{dim:"drive",w:1}] },
  { name:"The Knight", signature:[{dim:"creativity",w:1},{dim:"risk",w:1}] },
  { name:"The Bishop", signature:[{dim:"logic",w:1},{dim:"independence",w:1}] },
  { name:"The Rook", signature:[{dim:"discipline",w:2}] },
  { name:"The Pawn Who Reaches the End", signature:[{dim:"persistence",w:2},{dim:"resilience",w:1}] },
];

/* =========================================================================
   V4 ADDITIONS
   Framework approximations, consistency-check pairs, duo titles, and the
   remaining profile lookup tables. Nothing above this line changes.
   ========================================================================= */

/* ---- Consistency check ---------------------------------------------------
   Pairs of existing questions from different clusters that already probe
   overlapping traits, phrased differently because they were written for
   different scenarios. If both members of a pair get asked in the same
   run (adaptive selection means that's not guaranteed), the engine can
   check whether the chosen answers pulled in the same direction on their
   shared dimension. This reuses real content rather than needing a
   second, secretly-duplicated question bank. */
// Every "a" here is a question the bank itself tags validates:"dim" - it
// was authored specifically to re-measure a dimension some other question
// already covers, in a deliberately different scenario. "b" is that
// bank's own strongest other question for the same dimension. Generated
// from the bank's own validates tags and per-dimension weights rather
// than hand-picked a second time, so there's exactly one place ("dim"
// coverage in the question bank) this can drift out of sync with.
const CONSISTENCY_PAIRS = [
  { a:"c01", b:"r22", dim:"socialEnergy" },
  { a:"c03", b:"c09", dim:"selfAwareness" },
  { a:"c05", b:"f01", dim:"emotionalStability" },
  { a:"c08", b:"c12", dim:"patience" },
  { a:"c11", b:"c13", dim:"empathy" },
  { a:"c15", b:"c02", dim:"kindness" },
  { a:"f07", b:"f04", dim:"persistence" },
  { a:"f10", b:"c04", dim:"trust" },
  { a:"f15", b:"c09", dim:"confidence" },
  { a:"f18", b:"c09", dim:"confidence" },
  { a:"f20", b:"c02", dim:"risk" },
  { a:"e01", b:"c07", dim:"responsibility" },
  { a:"e02", b:"c08", dim:"patience" },
  { a:"e03", b:"c09", dim:"confidence" },
  { a:"e05", b:"c05", dim:"adaptability" },
  { a:"e07", b:"c08", dim:"patience" },
  { a:"e08", b:"f21", dim:"resilience" },
  { a:"e09", b:"c02", dim:"kindness" },
  { a:"e12", b:"c04", dim:"trust" },
  { a:"e13", b:"c03", dim:"selfAwareness" },
  { a:"e15", b:"c08", dim:"patience" },
  { a:"e20", b:"f07", dim:"drive" },
  { a:"e21", b:"c11", dim:"empathy" },
  { a:"e22", b:"c07", dim:"responsibility" },
  { a:"e23", b:"c09", dim:"confidence" },
  { a:"e25", b:"f04", dim:"persistence" },
  { a:"e26", b:"c02", dim:"kindness" },
  { a:"e28", b:"c07", dim:"responsibility" },
  { a:"e30", b:"c07", dim:"responsibility" },
  { a:"r01", b:"c03", dim:"selfAwareness" },
  { a:"r02", b:"c01", dim:"independence" },
  { a:"r03", b:"c03", dim:"selfAwareness" },
  { a:"r06", b:"f01", dim:"emotionalStability" },
  { a:"r07", b:"c01", dim:"independence" },
  { a:"r09", b:"c01", dim:"independence" },
  { a:"r10", b:"c14", dim:"openMindedness" },
  { a:"r12", b:"c12", dim:"logic" },
  { a:"r13", b:"c01", dim:"independence" },
  { a:"r15", b:"f07", dim:"drive" },
  { a:"r16", b:"c02", dim:"kindness" },
  { a:"r17", b:"f13", dim:"humor" },
  { a:"r18", b:"c01", dim:"independence" },
  { a:"r20", b:"f04", dim:"persistence" },
  { a:"r21", b:"c03", dim:"selfAwareness" },
  { a:"m01", b:"c04", dim:"trust" },
  { a:"m02", b:"c07", dim:"responsibility" },
  { a:"m03", b:"c04", dim:"trust" },
  { a:"m05", b:"c07", dim:"responsibility" },
  { a:"m06", b:"c04", dim:"trust" },
  { a:"m07", b:"c14", dim:"discipline" },
  { a:"m08", b:"c01", dim:"independence" },
  { a:"m10", b:"c14", dim:"competitiveness" },
  { a:"em01", b:"c02", dim:"risk" },
  { a:"em03", b:"f01", dim:"emotionalStability" },
  { a:"em04", b:"c04", dim:"trust" },
  { a:"em06", b:"f01", dim:"emotionalStability" },
  { a:"em08", b:"c04", dim:"trust" },
  { a:"em09", b:"c01", dim:"independence" },
  { a:"em10", b:"c02", dim:"kindness" },
  { a:"em11", b:"c04", dim:"trust" },
  { a:"w01", b:"c01", dim:"independence" },
  { a:"w04", b:"c01", dim:"curiosity" },
  { a:"w07", b:"c04", dim:"trust" },
];

/* ---- Framework approximations (Update: Personality System) ---------------
   Clearly secondary to the PersonaForge archetype. Big Five and DISC are
   percentage breakdowns; MBTI and Enneagram pick a best match the same
   way archetypes do. */
const BIG_FIVE_CATEGORIES = [
  { name:"Openness", dims:["openMindedness","curiosity","creativity"] },
  { name:"Conscientiousness", dims:["discipline","responsibility","planning"] },
  { name:"Extraversion", dims:["socialEnergy","confidence"] },
  { name:"Agreeableness", dims:["kindness","empathy","trust"] },
  { name:"Neuroticism", dims:["emotionalStability"], invert:true },
];
const DISC_CATEGORIES = [
  { name:"D, Dominance", dims:["leadership","confidence","competitiveness"] },
  { name:"I, Influence", dims:["socialEnergy","humor","confidence"] },
  { name:"S, Steadiness", dims:["patience","trust","kindness"] },
  { name:"C, Conscientiousness", dims:["discipline","logic","planning"] },
];
const ENNEAGRAM_TYPES = [
  { name:"Type 1, The Reformer", signature:[{dim:"discipline",w:2},{dim:"responsibility",w:1}] },
  { name:"Type 2, The Helper", signature:[{dim:"kindness",w:2},{dim:"empathy",w:1}] },
  { name:"Type 3, The Achiever", signature:[{dim:"drive",w:2},{dim:"confidence",w:1}] },
  { name:"Type 4, The Individualist", signature:[{dim:"creativity",w:1},{dim:"selfAwareness",w:2}] },
  { name:"Type 5, The Investigator", signature:[{dim:"curiosity",w:1},{dim:"independence",w:2}] },
  { name:"Type 6, The Loyalist", signature:[{dim:"trust",w:1},{dim:"responsibility",w:1},{dim:"risk",w:-1}] },
  { name:"Type 7, The Enthusiast", signature:[{dim:"optimism",w:1},{dim:"humor",w:1},{dim:"risk",w:1}] },
  { name:"Type 8, The Challenger", signature:[{dim:"confidence",w:1},{dim:"leadership",w:1},{dim:"competitiveness",w:1}] },
  { name:"Type 9, The Peacemaker", signature:[{dim:"patience",w:2},{dim:"adaptability",w:1}] },
];
/* ---- Human Values --------------------------------------------------------
   A motivational layer, separate from archetype/frameworks: not "what
   type are you" but "what seems to move you when you decide things".
   Each value is a weighted signature over the same 25 measured
   dimensions, scored the same way archetype signatures are, so nothing
   new is being invented, just a different lens on the same evidence.
   Explicitly PersonaForge's interpretation, not a validated instrument. */
const HUMAN_VALUES = [
  { id:"determination", name:"Determination", icon:"\uD83D\uDCAA",
    signature:[{dim:"drive",w:2},{dim:"persistence",w:2},{dim:"discipline",w:1}],
    why:"how much you push through rather than let go" },
  { id:"justice", name:"Justice", icon:"\u2696\uFE0F",
    signature:[{dim:"responsibility",w:2},{dim:"logic",w:1},{dim:"trust",w:1}],
    why:"how much fairness and accountability shape your calls" },
  { id:"compassion", name:"Compassion", icon:"\uD83E\uDEC2",
    signature:[{dim:"empathy",w:2},{dim:"kindness",w:2}],
    why:"how readily you feel and respond to what others are going through" },
  { id:"curiosity", name:"Curiosity", icon:"\uD83D\uDD0D",
    signature:[{dim:"curiosity",w:2},{dim:"openMindedness",w:1}],
    why:"how much unanswered questions pull at you" },
  { id:"bravery", name:"Bravery", icon:"\uD83E\uDDA1",
    signature:[{dim:"risk",w:2},{dim:"confidence",w:1},{dim:"resilience",w:1}],
    why:"how willing you are to act despite the odds or the fear" },
  { id:"integrity", name:"Integrity", icon:"\uD83E\uDEA8",
    signature:[{dim:"trust",w:2},{dim:"selfAwareness",w:1},{dim:"responsibility",w:1}],
    why:"how consistent you stay between what you believe and what you do" },
  { id:"hope", name:"Hope", icon:"\u2728",
    signature:[{dim:"optimism",w:2},{dim:"resilience",w:1}],
    why:"how much you expect things to work out, even under pressure" },
  { id:"wisdom", name:"Wisdom", icon:"\uD83E\uDD89",
    signature:[{dim:"selfAwareness",w:2},{dim:"logic",w:1},{dim:"openMindedness",w:1}],
    why:"how much reflection shapes your judgment before you act" },
  { id:"kindness", name:"Kindness", icon:"\uD83D\uDC9E",
    signature:[{dim:"kindness",w:2},{dim:"empathy",w:1},{dim:"patience",w:1}],
    why:"how naturally you extend warmth without being asked" },
  { id:"creativity", name:"Creativity", icon:"\uD83C\uDFA8",
    signature:[{dim:"creativity",w:2},{dim:"openMindedness",w:1},{dim:"curiosity",w:1}],
    why:"how much you reach for a new angle instead of the obvious one" },
  { id:"discipline", name:"Discipline", icon:"\uD83C\uDFAF",
    signature:[{dim:"discipline",w:2},{dim:"planning",w:1},{dim:"persistence",w:1}],
    why:"how consistently you follow through on your own structure" },
  { id:"loyalty", name:"Loyalty", icon:"\uD83E\uDD1D",
    signature:[{dim:"trust",w:2},{dim:"patience",w:1},{dim:"responsibility",w:1}],
    why:"how much you stay committed once you're in" },
  { id:"freedom", name:"Freedom", icon:"\uD83E\uDD85",
    signature:[{dim:"independence",w:2},{dim:"adaptability",w:1},{dim:"risk",w:1}],
    why:"how much you protect your own room to choose" },
  { id:"responsibility", name:"Responsibility", icon:"\uD83E\uDEA2",
    signature:[{dim:"responsibility",w:2},{dim:"discipline",w:1},{dim:"planning",w:1}],
    why:"how seriously you treat the things you're accountable for" },
];

/* ---- Seven Sins / Heavenly Virtues (fun profile) --------------------------
   A playful, explicitly non-serious lens: each axis is one measured
   dimension read two ways. The Sin reading and the Virtue reading are
   opposite ends of the exact same evidence, nothing is recalculated,
   only the label and direction flip. */
const SIN_VIRTUE_AXES = [
  { dim:"confidence", sinLabel:"Pride", virtueLabel:"Humility", sinIsHigh:true },
  { dim:"competitiveness", sinLabel:"Greed", virtueLabel:"Charity", sinIsHigh:true },
  { dim:"patience", sinLabel:"Wrath", virtueLabel:"Patience", sinIsHigh:false },
  { dim:"kindness", sinLabel:"Envy", virtueLabel:"Kindness", sinIsHigh:false },
  { dim:"risk", sinLabel:"Lust", virtueLabel:"Chastity", sinIsHigh:true },
  { dim:"discipline", sinLabel:"Gluttony", virtueLabel:"Temperance", sinIsHigh:false },
  { dim:"drive", sinLabel:"Sloth", virtueLabel:"Diligence", sinIsHigh:false },
];

const MBTI_AXES = [
  { letters:["E","I"], posDims:["socialEnergy"], negDims:[] },
  { letters:["N","S"], posDims:["openMindedness","curiosity"], negDims:["discipline","planning"] },
  { letters:["F","T"], posDims:["empathy","kindness"], negDims:["logic"] },
  { letters:["P","J"], posDims:["adaptability","risk"], negDims:["discipline","planning"] },
];

/* ---- Duo titles for the compare page --------------------------------------
   Keyed by element pairs from ARCHETYPE_EXTRAS, sorted alphabetically so
   the lookup works regardless of who's "person A". Falls back to a
   generic template when there's no special pairing. */
const DUO_TITLES = {
  "Fire|Ice": "Fire & Ice",
  "Fire|Fire": "Twin Flames",
  "Water|Fire": "Steam and Spark",
  "Earth|Air": "Roots and Wind",
  "Light|Shadow": "Sun & Moon",
  "Metal|Fire": "Forge Partners",
  "Storm|Earth": "Calm and Chaos",
  "Water|Water": "Deep Waters",
  "Air|Air": "Kindred Spirits",
  "Earth|Earth": "Built to Last",
  "Light|Light": "Twin Beacons",
  "Shadow|Shadow": "Quiet Understanding",
  "Ice|Storm": "Cold Front",
  "Water|Air": "Tide and Wind",
};

/* ---- Fantasy extras: weapon, companion, kingdom --------------------------- */
const FANTASY_WEAPONS = [
  { name:"A precisely balanced longsword", signature:[{dim:"discipline",w:1},{dim:"responsibility",w:1}] },
  { name:"A staff carved with half-finished runes", signature:[{dim:"curiosity",w:1},{dim:"logic",w:1}] },
  { name:"Twin daggers, never both sheathed at once", signature:[{dim:"risk",w:1},{dim:"adaptability",w:1}] },
  { name:"A warhammer that's more often used to build than break", signature:[{dim:"persistence",w:1},{dim:"discipline",w:1}] },
  { name:"A longbow, kept for range and patience alike", signature:[{dim:"patience",w:1},{dim:"independence",w:1}] },
  { name:"A shield older than anyone can explain", signature:[{dim:"responsibility",w:1},{dim:"trust",w:1}] },
  { name:"A voice, sharper than most blades in the right moment", signature:[{dim:"socialEnergy",w:1},{dim:"confidence",w:1}] },
  { name:"A satchel of half-tested alchemical tricks", signature:[{dim:"creativity",w:1},{dim:"curiosity",w:1}] },
];
const FANTASY_COMPANIONS = [
  { name:"A war-scarred wolf who trusts almost no one else", signature:[{dim:"independence",w:1},{dim:"trust",w:1}] },
  { name:"A small dragon still learning to control its fire", signature:[{dim:"creativity",w:1},{dim:"risk",w:1}] },
  { name:"A raven that shows up exactly when needed", signature:[{dim:"curiosity",w:1},{dim:"selfAwareness",w:1}] },
  { name:"A steady warhorse, unfazed by almost anything", signature:[{dim:"resilience",w:1},{dim:"patience",w:1}] },
  { name:"A talking cat who mostly offers unsolicited opinions", signature:[{dim:"humor",w:1},{dim:"confidence",w:1}] },
  { name:"A quiet familiar spirit, more sensed than seen", signature:[{dim:"empathy",w:1},{dim:"openMindedness",w:1}] },
];
const FANTASY_KINGDOMS = [
  { name:"A mountain hold built to outlast every siege", signature:[{dim:"discipline",w:1},{dim:"responsibility",w:1}] },
  { name:"A floating city that answers to no single ruler", signature:[{dim:"independence",w:2}] },
  { name:"A forest realm where the borders move with the seasons", signature:[{dim:"adaptability",w:1},{dim:"openMindedness",w:1}] },
  { name:"A port city that trades in everything, including secrets", signature:[{dim:"socialEnergy",w:1},{dim:"curiosity",w:1}] },
  { name:"A small, fiercely loyal village, not a kingdom by choice", signature:[{dim:"kindness",w:1},{dim:"trust",w:1}] },
  { name:"An empire still being built, one campaign at a time", signature:[{dim:"drive",w:1},{dim:"leadership",w:1}] },
];

/* ---- Fun profile extras: flower, planet, constellation, gemstone, weather - */
const FLOWERS = [
  { name:"Black Dahlia", signature:[{dim:"independence",w:1},{dim:"selfAwareness",w:1}] },
  { name:"Sunflower", signature:[{dim:"optimism",w:1},{dim:"socialEnergy",w:1}] },
  { name:"Wild Poppy", signature:[{dim:"risk",w:1},{dim:"creativity",w:1}] },
  { name:"White Orchid", signature:[{dim:"discipline",w:1},{dim:"patience",w:1}] },
  { name:"Wisteria", signature:[{dim:"kindness",w:1},{dim:"empathy",w:1}] },
  { name:"Thistle", signature:[{dim:"resilience",w:1},{dim:"independence",w:1}] },
];
const PLANETS = [
  { name:"Mars", signature:[{dim:"drive",w:1},{dim:"competitiveness",w:1}] },
  { name:"Neptune", signature:[{dim:"creativity",w:1},{dim:"selfAwareness",w:1}] },
  { name:"Saturn", signature:[{dim:"discipline",w:1},{dim:"responsibility",w:1}] },
  { name:"Venus", signature:[{dim:"empathy",w:1},{dim:"kindness",w:1}] },
  { name:"Mercury", signature:[{dim:"adaptability",w:1},{dim:"curiosity",w:1}] },
  { name:"Jupiter", signature:[{dim:"leadership",w:1},{dim:"optimism",w:1}] },
];
const CONSTELLATIONS = [
  { name:"Orion", signature:[{dim:"confidence",w:1},{dim:"leadership",w:1}] },
  { name:"Lyra", signature:[{dim:"creativity",w:1},{dim:"humor",w:1}] },
  { name:"Draco", signature:[{dim:"independence",w:1},{dim:"resilience",w:1}] },
  { name:"Cassiopeia", signature:[{dim:"selfAwareness",w:1},{dim:"confidence",w:1}] },
  { name:"Pegasus", signature:[{dim:"optimism",w:1},{dim:"risk",w:1}] },
  { name:"Ursa Minor", signature:[{dim:"patience",w:1},{dim:"trust",w:1}] },
];
const GEMSTONES = [
  { name:"Garnet", signature:[{dim:"drive",w:1},{dim:"competitiveness",w:1}] },
  { name:"Sapphire", signature:[{dim:"logic",w:1},{dim:"discipline",w:1}] },
  { name:"Moonstone", signature:[{dim:"empathy",w:1},{dim:"selfAwareness",w:1}] },
  { name:"Obsidian", signature:[{dim:"independence",w:1},{dim:"confidence",w:1}] },
  { name:"Citrine", signature:[{dim:"optimism",w:1},{dim:"socialEnergy",w:1}] },
  { name:"Emerald", signature:[{dim:"kindness",w:1},{dim:"trust",w:1}] },
];
const WEATHER_TYPES = [
  { name:"Clear Sky", signature:[{dim:"optimism",w:1},{dim:"emotionalStability",w:1}] },
  { name:"Thunderstorm", signature:[{dim:"drive",w:1},{dim:"competitiveness",w:1}] },
  { name:"Fog", signature:[{dim:"independence",w:1},{dim:"selfAwareness",w:1}] },
  { name:"Steady Rain", signature:[{dim:"patience",w:1},{dim:"discipline",w:1}] },
  { name:"First Snow", signature:[{dim:"creativity",w:1},{dim:"openMindedness",w:1}] },
  { name:"Golden Hour Light", signature:[{dim:"kindness",w:1},{dim:"optimism",w:1}] },
];
const COFFEE_ORDERS = [
  { name:"Black, no sugar, no apology", signature:[{dim:"discipline",w:1},{dim:"independence",w:1}] },
  { name:"Oversized oat milk latte, extra shot", signature:[{dim:"socialEnergy",w:1},{dim:"drive",w:1}] },
  { name:"Whatever's seasonal, decided on the spot", signature:[{dim:"curiosity",w:1},{dim:"adaptability",w:1}] },
  { name:"The same order every single time", signature:[{dim:"discipline",w:1},{dim:"patience",w:1}] },
  { name:"Matcha, and a little smug about it", signature:[{dim:"selfAwareness",w:1},{dim:"openMindedness",w:1}] },
  { name:"Iced, regardless of the weather", signature:[{dim:"risk",w:1},{dim:"confidence",w:1}] },
];



/* =========================================================================
   PERSONAFORGE, ENGINE MODULE
   All algorithms documented inline. Pure functions, no DOM, fully testable.
   ========================================================================= */

const CLUSTERS = Object.keys(QUESTION_BANK);
// v2.0: one single adaptive flow, no more Quick Read/Balanced/Deep Dive
// choice - the whole point of a continuously-adaptive engine is that it
// already stops as soon as it's confident, so a person no longer needs to
// pre-commit to a depth that a fixed-length quiz would have required.
const CORE_LENGTH = 15;            // everyone answers exactly these 15 first, always
const MIN_ADAPTIVE_QUESTIONS = 20; // never stops before this many total, even if confident earlier - one clean read of the core 15 isn't enough evidence on its own to end an assessment
const MAX_QUESTIONS = 50;          // hard ceiling, never exceeded, no matter how uncertain
const CONFIDENCE_TARGET = 80;      // stop as soon as this confident, any time after MIN_ADAPTIVE_QUESTIONS
const CONFIDENCE_SCALE = 7;        // score-gap that counts as "fully confident", tuned against real score distributions

/* ---- Which dimensions matter most to the framework projections ---------
   Same idea as the old cluster-weight table, but for MBTI/Big
   Five/DISC/Enneagram instead of clusters. Used by the info-value
   question ranking below so "improves framework confidence" is a real,
   computed signal rather than a hand-authored tag. */
function computeFrameworkDimensionWeights(){
  const weights = {};
  DIMENSIONS.forEach(d => weights[d] = 0);
  MBTI_AXES.forEach(axis => {
    axis.posDims.concat(axis.negDims).forEach(d => { weights[d] = (weights[d] || 0) + 1; });
  });
  BIG_FIVE_CATEGORIES.forEach(cat => cat.dims.forEach(d => { weights[d] = (weights[d] || 0) + 1; }));
  DISC_CATEGORIES.forEach(cat => cat.dims.forEach(d => { weights[d] = (weights[d] || 0) + 1; }));
  ENNEAGRAM_TYPES.forEach(type => type.signature.forEach(s => { weights[s.dim] = (weights[s.dim] || 0) + Math.abs(s.w); }));
  return weights;
}
const FRAMEWORK_DIMENSION_WEIGHTS = computeFrameworkDimensionWeights();

const QUESTIONS_BY_ID = {};
QUESTIONS.forEach(q => { QUESTIONS_BY_ID[q.id] = q; });

/* ---- The fixed core set --------------------------------------------------
   Every user gets exactly these 15 questions, in this order, first - no
   seed, no shuffle. Hand-sequenced (v2.1) to mix all six pacing categories
   -- everyday, fun, reflective, moral, emotional, weird -- so the first
   read of someone never leans on just one register, and to establish an
   initial "tags" set (see QuizSession.tags below) before the adaptive
   pool's unlockConditions ever need to be checked. */
const CORE_QUESTION_IDS = ["c01","c02","c03","c04","c05","c06","c07","c08","c09","c10","c11","c12","c13","c14","c15"];

/* -------------------------------------------------------------------------
   ALGORITHM: Continuous adaptive question selection (v2.0)

   Replaces the old fixed-batch staging (15 fixed, then two blocks of 10,
   then a single confidence checkpoint at 35) with a genuinely continuous
   loop: after the 15 fixed core questions, ONE question is chosen at a
   time, and confidence is recalculated after every single answer, not in
   batches. As soon as the assessment is confident enough (and at least
   MIN_ADAPTIVE_QUESTIONS have been asked), it stops - anywhere from 20 to
   50, not a fixed set of possible lengths.

   Every answer after the core 15 re-evaluates, from scratch, which
   dimension the engine still has the least evidence for, which two
   archetypes/souls are currently closest (and so most worth separating),
   and whether any dimension the bank calls a "validation" pair has just
   disagreed with itself. Nothing here is randomized or branches by which
   specific answer was picked - two people who answer identically get
   identical questions at every step, because the ranking is a pure
   function of the running answer history.

   computeQuestionInfoValue() is unchanged from the old engine (it never
   depended on the specific question bank, only on dimensions/signatures/
   running history), so the same four signals - uncertainty, archetype
   separation, soul separation, framework relevance, minus overlap
   redundancy - still drive which single question gets asked next.

   VALIDATION QUESTIONS: a question tagged validates:"dim" is one the bank
   author already knows re-measures a dimension some earlier, differently-
   themed question also touched. When one is answered, _checkValidation()
   compares the direction this answer nudges that dimension against the
   dimension's running sign so far. Agreement is invisible (that's the
   expected case); disagreement increments session.contradictions, which
   computeAssessmentConfidence() reads as a real, if modest, certainty
   penalty - the same "I said two different things about myself" signal a
   psychologist would actually notice. */

// Deterministic per-(seed, questionId, position) jitter in roughly [-0.8, 0.8].
// Same seed always produces the same run (still fully reproducible/testable),
// but different people no longer converge on an identical "magnet" question.
function seededJitter(seed, questionId, position){
  let h = (seed || 0) * 2654435761 + position * 40503;
  for (let i = 0; i < questionId.length; i++){
    h = (h * 33 + questionId.charCodeAt(i)) | 0;
  }
  h = h ^ (h >>> 16);
  const frac = ((h >>> 0) % 1000) / 1000; // 0..0.999
  return (frac - 0.5) * 1.6; // -0.8 .. 0.8
}

function computeQuestionInfoValue(q, session, top, second, soulTop, soulSecond){
  const dimSet = new Set();
  q.options.forEach(opt => Object.keys(opt.d).forEach(d => dimSet.add(d)));
  const avgMag = (d) => q.options.reduce((s,o) => s + Math.abs(o.d[d] || 0), 0) / q.options.length;

  let uncertainty = 0;
  dimSet.forEach(d => {
    const confidence = getDimensionConfidence(session, d); // 0-1, lower = less evidence so far
    uncertainty += (1 - confidence) * avgMag(d);
  });

  let separation = 0;
  if (top && second){
    const diff = {};
    top.signature.forEach(s => { diff[s.dim] = (diff[s.dim] || 0) + s.w; });
    second.signature.forEach(s => { diff[s.dim] = (diff[s.dim] || 0) - s.w; });
    dimSet.forEach(d => { separation += Math.abs(diff[d] || 0) * avgMag(d); });
  }

  let soulSeparation = 0;
  if (soulTop && soulSecond){
    const soulDiff = {};
    soulTop.signature.forEach(s => { soulDiff[s.dim] = (soulDiff[s.dim] || 0) + s.w; });
    soulSecond.signature.forEach(s => { soulDiff[s.dim] = (soulDiff[s.dim] || 0) - s.w; });
    dimSet.forEach(d => { soulSeparation += Math.abs(soulDiff[d] || 0) * avgMag(d); });
  }

  let framework = 0;
  dimSet.forEach(d => { framework += (FRAMEWORK_DIMENSION_WEIGHTS[d] || 0) * 0.3; });

  // PF4 fix (audit Priority 2): this used to sum uncapped across every
  // prior answer, so a "generalist" dimension like confidence or
  // selfAwareness -- touched by dozens of questions across the whole
  // bank -- would rack up an ever-growing redundancy penalty with no
  // ceiling, while the matching uncertainty *benefit* above saturates
  // at 4 touches. By round 25 that made redundancy alone outweigh the
  // question's entire score by ~8 points regardless of content quality,
  // which is what was silently burying w11/em06/em04/w07 the whole run,
  // not just at one position. Capping each dimension's contribution at
  // the same saturation point as its uncertainty benefit (still using
  // real evidence, just no longer unbounded) fixes the asymmetry.
  let redundancy = 0;
  const dimTouchTotals = {};
  session.answers.forEach(a => {
    if (!a) return;
    dimSet.forEach(d => { if (d in a.d) dimTouchTotals[d] = (dimTouchTotals[d] || 0) + Math.min(Math.abs(a.d[d]), 1); });
  });
  dimSet.forEach(d => { redundancy += Math.min(dimTouchTotals[d] || 0, 4); });

  // A tied-dimension bonus: if this question's dims include two of the
  // *current* top archetype's or soul's own signature dims and those two
  // are themselves close in normalized value for this session so far
  // (a real tie, not just "both unmeasured"), a question that moves them
  // apart is worth more than the generic separation score above already
  // captures, since separation there only looks at inter-archetype
  // differences, not intra-session ties between the dims themselves.
  let tieBreak = 0;
  if (session && session.dims){
    dimSet.forEach(d1 => dimSet.forEach(d2 => {
      if (d1 >= d2) return;
      const v1 = session.dims[d1] || 0, v2 = session.dims[d2] || 0;
      if (Math.abs(v1 - v2) < 2) tieBreak += avgMag(d1) + avgMag(d2);
    }));
  }

  // Emotional pacing (PF4): information gain still dominates the score
  // (it ranges roughly -5..+8 with tight gaps near the top; these nudges
  // are sized to flip a close tie, not override a real informational
  // lead). Two adjustments, both read off the actual answer history:
  // (1) a heavier discount the closer a *second* heavy question in a row
  // would land -- this alone rarely eliminates a heavy candidate, it's
  // the hard filter in _pickNextQuestion that stops a third; (2) a small
  // bonus for a lighter category (fun/everyday) right after a moral or
  // emotional question, so the quiz gets a breath rather than stacking
  // two heavy registers back to back even when the categories differ.
  let pacing = 0;
  const answered = session.answers.filter(Boolean);
  const prev = answered[answered.length - 1];
  const prevQ = prev && QUESTIONS_BY_ID[prev.questionId];
  if (prevQ){
    if (q.difficulty === "heavy" && prevQ.difficulty === "heavy") pacing -= 1.5;
    if ((prevQ.type === "moral" || prevQ.type === "emotional") && (q.type === "fun" || q.type === "everyday")) pacing += 1.0;
  }

  return uncertainty * 1.0 + separation * 0.65 + soulSeparation * 0.5 + framework * 0.15 + tieBreak * 0.2 - redundancy * 0.35 + pacing;
}

// "pace" is the one visible choice onboarding still offers (Quick Read /
// Balanced / Deep Dive) - it no longer selects between three different
// engines, since there's only the one continuous adaptive engine now. It
// just narrows or widens the [min, max] range that engine is allowed to
// stop within: Quick Read biases toward stopping as early as that range
// permits, Deep Dive raises the floor so it always asks nearly the full
// range regardless of how confident it gets, Balanced (the default) uses
// the full 20-50 range on its own merits.
const PACE_BOUNDS = {
  quick: { min: 15, max: 25 },
  balanced: { min: MIN_ADAPTIVE_QUESTIONS, max: MAX_QUESTIONS },
  deep: { min: 45, max: MAX_QUESTIONS },
};
class QuizSession {
  constructor(seed = Date.now() % 100000, name = "", pace = "balanced"){
    // seed is kept only for the save/resume payload shape (harmless,
    // unused for question selection, which is purely a function of the
    // running answer history now).
    this.seed = seed;
    this.name = name;
    this.pace = PACE_BOUNDS[pace] ? pace : "balanced";
    const bounds = PACE_BOUNDS[this.pace];
    this.minAdaptive = bounds.min;
    this.maxQuestions = bounds.max;
    this.dims = emptyDims();
    this.answers = [];              // sparse: index-aligned with this.plan, entries or null
    this.clusterAffinity = {};
    CLUSTERS.forEach(c => this.clusterAffinity[c] = 0);
    this.clusterAsked = {};
    CLUSTERS.forEach(c => this.clusterAsked[c] = 0);
    this.usedIds = new Set();
    this.plan = CORE_QUESTION_IDS.map(id => QUESTIONS_BY_ID[id]).filter(Boolean);
    this.cursor = 0;
    // dimSign/dimEvidenceCount track, per dimension, the running direction
    // and how many separate questions have touched it - what
    // _checkValidation() compares a later validates:dim answer against.
    this.dimSign = {};
    this.contradictions = 0;
    this.confidencePct = 0;
    this.justExtended = false; // kept for encouragement()'s message, set once minAdaptive is crossed without stopping yet
    // v2.1: the branching-unlock mechanism. Every option carries "tags"
    // (bold, warm, curious, ...); once chosen, its tags are added here
    // permanently (never removed, even if the answer is later edited -
    // a door someone opened doesn't quietly close again). A pool question
    // with unlockConditions.anyTags is only a real candidate for
    // _pickNextQuestion once at least one of those tags is present, so
    // two people who answer the core 15 differently genuinely see
    // different slices of the remaining 105 become reachable, on top of
    // the existing info-gain ranking choosing the best among them.
    this.tags = new Set();
  }

  totalLength(){ return Math.max(this.cursor, this.minAdaptive); }
  maxLength(){ return this.maxQuestions; }

  current(){
    if (this.cursor >= this.maxQuestions) return null;
    if (this.cursor >= this.plan.length){
      const next = this._pickNextQuestion();
      if (!next) return null;
      this.plan.push(next);
    }
    return this.plan[this.cursor];
  }

  currentAnswer(){
    return this.answers[this.cursor] || null;
  }

  /* Ranks every not-yet-used, not-already-planned question by information
     value against the state right now, and returns the single best one.
     Deterministic given the running answer history - nothing here reads
     the clock or the seed, so two people with identical answers so far
     always get an identical next question too. */
  _pickNextQuestion(){
    const planned0 = new Set(this.plan.map(p => p.id));
    const unusedPlanned0 = q => !this.usedIds.has(q.id) && !planned0.has(q.id);
    // PF4 (audit Priority 2): even after capping the redundancy penalty,
    // w11/em06/em04/w07 measure dimensions (confidence, trust,
    // selfAwareness, kindness, emotionalStability, socialEnergy) that the
    // fixed core 15 already covers so thoroughly that these four never
    // win on pure information gain, no matter the persona - their
    // deficit is real, not a formula bug, and forcing them to win the
    // normal ranking would mean overriding genuine info gain, which the
    // brief explicitly rules out. Since these were independently flagged
    // as some of the strongest-written content in the bank, they get one
    // narrow, explicit guarantee instead: a single reserved checkpoint
    // partway through the adaptive run (still gated by the normal unlock
    // tags, just not by the info-gain race), the same kind of
    // "bypass the ranking on purpose" exception CORE_QUESTION_IDS already
    // uses for the fixed 15, just for one slot instead of fifteen.
    const FLAGSHIP_POOL_IDS = ["w11", "em06", "em04", "w07"];
    // Must land BEFORE minAdaptive, the earliest point isComplete() can
    // ever end the quiz, or a confident persona could finish before this
    // checkpoint is ever reached and the guarantee would silently do
    // nothing for them. (For "quick" pace, minAdaptive === CORE_LENGTH,
    // so there's no room for this guarantee at all - by design, a quick
    // read may ask zero adaptive questions.)
    const flagshipCheckpoint = Math.max(CORE_LENGTH, this.minAdaptive - 1);
    if (this.cursor === flagshipCheckpoint){
      const unlocked0 = q => !q.unlockConditions || q.unlockConditions.anyTags.some(t => this.tags.has(t));
      const available = FLAGSHIP_POOL_IDS.map(id => QUESTIONS_BY_ID[id]).filter(q => q && unusedPlanned0(q) && unlocked0(q));
      if (available.length){
        const pick = available[Math.abs(this.seed || 0) % available.length];
        return pick;
      }
    }
    const nd = this.normalizedDims();
    const match = matchArchetype(nd);
    const top = match.ranked[0].archetype, second = match.ranked[1].archetype;
    const soulRanked = scoreSoulTypes(nd);
    const soulTop = soulRanked[0].item, soulSecond = soulRanked[1].item;
    const planned = new Set(this.plan.map(p => p.id));
    const unusedPlanned = q => !this.usedIds.has(q.id) && !planned.has(q.id);
    const unlocked = q => !q.unlockConditions || q.unlockConditions.anyTags.some(t => this.tags.has(t));
    let candidates = QUESTIONS.filter(q => unusedPlanned(q) && unlocked(q));
    // Falling back to every not-yet-used question if tags haven't unlocked
    // anything yet (shouldn't happen once the core 15 have run, but this
    // guarantees the engine can never stall with real dimensions still
    // unread just because nothing happens to be unlocked).
    if (!candidates.length) candidates = QUESTIONS.filter(unusedPlanned);
    if (!candidates.length) return null;
    // Emotional pacing (PF4), hard rule: never let a THIRD consecutive
    // "heavy" question through at all, on top of the soft discount
    // computeQuestionInfoValue already applies against a second one.
    // Falls back to the unfiltered list if that would empty the
    // candidate pool, so this can never stall the assessment.
    const answered = this.answers.filter(Boolean);
    const last2 = answered.slice(-2).map(a => QUESTIONS_BY_ID[a.questionId]);
    if (last2.length === 2 && last2.every(q => q && q.difficulty === "heavy")){
      const nonHeavy = candidates.filter(q => q.difficulty !== "heavy");
      if (nonHeavy.length) candidates = nonHeavy;
    }
    // PF4 magnet-question fix (audit Priority 2): the root cause traced
    // for f07/f08/e25 dominating ~90-95% of every run isn't a broken
    // formula, it's that the fixed core 15 leaves persistence/planning/
    // logic/drive completely or almost completely untouched, so every
    // persona's uncertainty term ranks the same 2-3 questions highest
    // right at position 16, regardless of their actual answers - a real
    // near-tie that just always resolves the same way. A small
    // session-seeded jitter (deterministic per seed, so a given person's
    // run is still fully reproducible) only flips genuinely close scores;
    // a question with a real informational lead still always wins.
    let best = candidates[0], bestScore = -Infinity;
    candidates.forEach(q => {
      const score = computeQuestionInfoValue(q, this, top, second, soulTop, soulSecond) + seededJitter(this.seed, q.id, this.cursor);
      if (score > bestScore){ bestScore = score; best = q; }
    });
    return best;
  }

  /* A validates:dim question deliberately re-measures a dimension some
     earlier, differently-themed question already touched. Comparing this
     answer's direction against that dimension's running sign so far is a
     real (if simple) test of self-consistency: two very differently-
     framed scenarios pointing the same way is good evidence; pointing
     opposite ways means at least one of them doesn't reflect how this
     person actually tends to act, which is exactly the kind of thing that
     should cost some confidence rather than being silently averaged away. */
  _checkValidation(q, delta){
    if (!q.validates) return;
    const dim = q.validates;
    const priorSign = this.dimSign[dim];
    const newSign = Math.sign(delta[dim] || 0);
    if (priorSign && newSign && priorSign !== newSign){
      this.contradictions++;
    }
  }

  /* Editing an already-answered question first reverts its dimension and
     cluster-affinity contribution, then re-applies the new choice, so
     going back and changing an answer produces a fully correct result
     rather than double-counting. */
  _revert(idx){
    const prev = this.answers[idx];
    if (!prev) return;
    Object.entries(prev.d).forEach(([dim, val]) => { this.dims[dim] -= val; });
    const magnitude = Object.values(prev.d).reduce((s, v) => s + Math.abs(v), 0);
    this.clusterAffinity[prev.cluster] -= magnitude;
    this.answers[idx] = null;
  }

  answer(optionIndex){
    const q = this.current();
    if (!q) return;
    const opt = q.options[optionIndex];
    const editing = !!this.answers[this.cursor];
    if (editing){
      this._revert(this.cursor);
    } else {
      this.usedIds.add(q.id);
      this.clusterAsked[q.cluster] = (this.clusterAsked[q.cluster] || 0) + 1;
    }
    this._checkValidation(q, opt.d);
    let magnitude = 0;
    Object.entries(opt.d).forEach(([dim, val]) => {
      this.dims[dim] = (this.dims[dim] || 0) + val;
      magnitude += Math.abs(val);
      const sign = Math.sign(this.dims[dim]);
      if (sign) this.dimSign[dim] = sign;
    });
    this.clusterAffinity[q.cluster] += magnitude;
    (opt.tags || []).forEach(t => this.tags.add(t));
    this.answers[this.cursor] = { questionId: q.id, cluster: q.cluster, optionIndex, text: opt.text, d: opt.d, reveals: opt.reveals || [], questionType: q.type };
    this.cursor++;
    this.justExtended = false;
    if (editing) this._recalculateFutureQuestions();
    else this._updateConfidence();
  }

  /* The one continuous confidence check, run after every new answer past
     the fixed core (not just at one fixed checkpoint): recompute where
     things stand, and if MIN_ADAPTIVE_QUESTIONS have been asked and
     confidence has crossed CONFIDENCE_TARGET, the assessment can end
     right here - anywhere from 20 to 50 questions, whichever the evidence
     actually supports, rather than one of a small fixed set of lengths. */
  _updateConfidence(){
    const nd = this.normalizedDims();
    const match = matchArchetype(nd);
    const conf = computeAssessmentConfidence(match.ranked, nd, this, false);
    this.confidencePct = conf.overall;
    if (this.cursor >= this.minAdaptive) this.justExtended = false;
    else if (this.cursor >= CORE_LENGTH) this.justExtended = true;
  }

  /* Changing an earlier answer shifts the running dimension totals, which
     means whatever the adaptive engine was about to ask next may no
     longer be the right call. Rather than re-picking questions that were
     already answered (which would silently discard real answers), this
     only drops the still-blank tail beyond the furthest answered
     question, so the very next unanswered question gets freshly chosen
     against the updated state instead of a stale plan. */
  _recalculateFutureQuestions(){
    let highest = -1;
    for (let i = 0; i < this.answers.length; i++){ if (this.answers[i]) highest = i; }
    if (this.plan.length > highest + 1){
      this.plan.length = highest + 1;
    }
    this._updateConfidence();
  }

  goBack(){
    if (this.cursor > 0) this.cursor--;
  }

  goForward(){
    // only allowed onto a question that already has a recorded answer,
    // otherwise there's nothing to advance into without answering it
    if (this.answers[this.cursor]) this.cursor++;
  }

  canGoBack(){ return this.cursor > 0; }
  canSkipForward(){ return !!this.answers[this.cursor]; }

  /* current/total/max for the progress bar: total is an honest *estimate*
     (MIN_ADAPTIVE_QUESTIONS while still building the core evidence, or the
     stop point once confidence has actually been reached), not a promise -
     see "Estimated remaining questions" in the quiz UI, which is worded to
     match: a continuously-adaptive length genuinely doesn't know its own
     final size in advance the way a fixed-length quiz does. */
  progress(){
    return { current: this.cursor, total: this.totalLength(), max: this.maxQuestions };
  }
  isComplete(){
    if (this.cursor >= this.maxQuestions) return true;
    if (this.cursor < this.minAdaptive) return false;
    return this.confidencePct >= CONFIDENCE_TARGET;
  }

  encouragement(){
    if (this.isComplete()) return "That's everything I need.";
    if (this.cursor === 0) return "Let's start.";
    if (this.cursor < CORE_LENGTH) return "Just getting started here.";
    if (this.cursor >= CORE_LENGTH && this.cursor < CORE_LENGTH + 3) return "I'm starting to get a sense of you.";
    if (this.confidencePct >= CONFIDENCE_TARGET - 15) return "Two strong matches are close, digging a little deeper.";
    if (this.cursor >= this.maxQuestions - 5) return "Almost there, just a couple more.";
    return "Good pace, keep going.";
  }

  normalizedDims(){
    // A targeted retake (js/forge/retake.js) blends its few new answers into
    // the person's existing profile instead of replacing it.
    if (this.targeted && typeof Forge !== "undefined" && Forge.retake) return Forge.retake.blendDims(this);
    // clamp to a stable -10..10 range regardless of quiz length, for the
    // encoding and archetype matching steps below.
    const out = {};
    DIMENSIONS.forEach(k => {
      out[k] = Math.max(-10, Math.min(10, Math.round(this.dims[k])));
    });
    return out;
  }

  /* ---- Save / restore, so a mid-quiz break never loses answers -----------
     serialize() captures every bit of session state needed to resume
     exactly where it left off, including the running dimension totals and
     the adaptive plan already built, so resuming isn't a fresh guess, it
     picks up on the very next unanswered question. */
  serialize(){
    return {
      seed: this.seed,
      name: this.name,
      pace: this.pace,
      dims: this.dims,
      answers: this.answers,
      clusterAffinity: this.clusterAffinity,
      clusterAsked: this.clusterAsked,
      usedIds: Array.from(this.usedIds),
      plan: this.plan,
      cursor: this.cursor,
      dimSign: this.dimSign,
      contradictions: this.contradictions,
      confidencePct: this.confidencePct,
      tags: Array.from(this.tags),
      assessmentKind: this.assessmentKind || "full",
      targeted: this.targeted || null,
      savedAt: Date.now(),
    };
  }
}

function restoreQuizSession(saved){
  const s = Object.create(QuizSession.prototype);
  s.seed = saved.seed;
  s.name = saved.name || "";
  s.pace = PACE_BOUNDS[saved.pace] ? saved.pace : "balanced";
  const bounds = PACE_BOUNDS[s.pace];
  s.minAdaptive = bounds.min;
  s.maxQuestions = bounds.max;
  s.dims = saved.dims;
  s.answers = saved.answers;
  s.clusterAffinity = saved.clusterAffinity;
  s.clusterAsked = saved.clusterAsked;
  s.usedIds = new Set(saved.usedIds);
  s.plan = saved.plan;
  s.cursor = saved.cursor;
  s.dimSign = saved.dimSign || {};
  s.contradictions = saved.contradictions || 0;
  s.confidencePct = saved.confidencePct || 0;
  s.tags = new Set(saved.tags || []);
  s.justExtended = false;
  if (saved.assessmentKind === "targeted" && saved.targeted){
    s.assessmentKind = "targeted";
    s.targeted = saved.targeted;
    // a targeted run is exactly its planned questions long
    s.minAdaptive = s.maxQuestions = s.plan.length;
  }
  return s;
}


/* -------------------------------------------------------------------------
   ALGORITHM: Archetype matching
   Each archetype has a small "signature": 3 weighted dimensions that most
   define it. Score = sum(normalizedDim[dim] * weight) for each archetype,
   the highest score wins. This is a lightweight weighted-vector match, so
   it rewards a person for being distinctively strong in an archetype's
   core traits rather than requiring an exact 20-dimension fingerprint,
   which keeps results feeling specific without demanding improbable
   precision. The full ranked list is returned too, so the result page can
   show how every other archetype scored, not just the top one.
------------------------------------------------------------------------- */

// Same fix as scoreSoulTypes below: The Catalyst/Maverick/Visionary sum to
// 4 while every other archetype sums to 5, which gave them a permanently
// lower ceiling in a raw weighted-sum comparison. Scale each archetype's
// raw score by maxWeight/itsOwnWeight so they're compared on the same
// max-achievable scale.
const ARCHETYPE_MAX_WEIGHT = signatureMaxWeight(ARCHETYPES);
function matchArchetype(normDims){
  const scored = ARCHETYPES.map(a => {
    const totalWeight = a.signature.reduce((sum, s) => sum + s.w, 0);
    const raw = a.signature.reduce((sum, s) => sum + (normDims[s.dim] || 0) * s.w, 0);
    const score = raw * (ARCHETYPE_MAX_WEIGHT / totalWeight);
    return { archetype: a, score };
  }).sort((x, y) => y.score - x.score);
  return { primary: scored[0].archetype, runnerUp: scored[1].archetype, ranked: scored };
}

/* -------------------------------------------------------------------------
   ALGORITHM: Sub-profile (why two people with the same archetype differ)
   An archetype is decided by only 3 signature dimensions, so two people
   can land on the same one while still being genuinely different once you
   look at the other 17. This finds the two dimensions the person scores
   highest on outside the archetype's own signature, and turns that into a
   short, specific sentence, so results within the same archetype aren't
   interchangeable.
------------------------------------------------------------------------- */

function computeSubProfile(normDims, archetype){
  const sigDims = new Set(archetype.signature.map(s => s.dim));
  const rest = DIMENSIONS.filter(d => !sigDims.has(d))
    .map(d => ({ d, v: normDims[d] || 0 }))
    .sort((a, b) => b.v - a.v);
  const top = rest.slice(0, 2).filter(x => x.v > 0);
  if (top.length === 0){
    return `Within ${archetype.name}, your other traits are fairly balanced, no single one pulling much harder than the rest.`;
  }
  const labels = top.map(x => DIM_LABELS[x.d]);
  return `Within ${archetype.name}, you lean especially into ${labels.join(" and ")}, which shapes your version of this type a little differently from someone else who tested the same result.`;
}

/* -------------------------------------------------------------------------
   ALGORITHM: Measured traits
   Each trait is a plain, deterministic formula over normalized dimensions
   (0-100 scale). No randomness anywhere in this file, so the same answers
   always produce the same reading, the way an actual assessment should.
------------------------------------------------------------------------- */

function pct(v){ return Math.round(((v + 10) / 20) * 100); }

/* -------------------------------------------------------------------------
   CANONICAL DIMENSION ACCESSORS (Phase 1)
   Every feature that reads a personality dimension should go through one
   of these four, instead of reaching into normDims or session state with
   its own inline formula. This is the single source of truth the rest of
   the pipeline (archetypes, careers, frameworks, compatibility, results)
   is built on, so a future change to how a dimension is measured only
   has to happen in one place.
   ------------------------------------------------------------------------- */

// Raw dimension value, -10..10.
function getDimensionScore(normDims, dim){
  return (normDims && normDims[dim]) || 0;
}

// 0-100 view of the same value. Same math pct() always used, just named
// for what it does at call sites that read a dimension, not a raw delta.
function getDimensionPercent(normDims, dim){
  return pct(getDimensionScore(normDims, dim));
}

// How much real evidence exists for one dimension in a completed quiz
// session: how many answered questions touched it, and the total
// magnitude of their deltas. Returns null when there's no session to
// read (e.g. a profile decoded from a shared code carries no answer
// history), which callers should treat as genuinely unknown, not as
// zero evidence.
function getDimensionEvidence(session, dim){
  if (!session || !session.answers) return null;
  let count = 0, magnitude = 0;
  session.answers.forEach(a => {
    if (!a || !a.d || !(dim in a.d)) return;
    count++;
    magnitude += Math.abs(a.d[dim]);
  });
  return { count, magnitude };
}

// A 0-1 confidence read for a single dimension. More answers that
// touched it, and a clearer accumulated signal (not just one weak
// nudge), means more confidence in that specific number. Returns 0.5
// (explicitly "unknown", not "neutral" or "zero") when there's no
// session to measure evidence from.
function getDimensionConfidence(session, dim){
  const evidence = getDimensionEvidence(session, dim);
  if (!evidence) return 0.5;
  const countFactor = Math.min(1, evidence.count / 4);
  const magnitudeFactor = Math.min(1, evidence.magnitude / 12);
  return Math.round((countFactor * 0.6 + magnitudeFactor * 0.4) * 100) / 100;
}

function computeMeasuredTraits(normDims){
  const clamp = v => Math.max(1, Math.min(100, Math.round(v)));
  const g = k => pct(normDims[k] || 0);
  return {
    "Emotional Steadiness": clamp((g("resilience") + g("patience") + g("selfAwareness")) / 3),
    "Decision Confidence": clamp((g("confidence") + g("logic") + g("drive")) / 3),
    "Social Stamina": clamp((g("socialEnergy") + g("adaptability")) / 2),
    "Creative Output": clamp((g("creativity") + g("curiosity") + g("independence")) / 3),
    "Focus Capacity": clamp((g("discipline") + g("patience") + g("planning")) / 3),
    "Risk Tolerance": clamp(g("risk")),
    "Empathy Index": clamp((g("empathy") + g("kindness")) / 2),
    "Leadership Presence": clamp((g("leadership") + g("confidence") + g("drive")) / 3),
    "Adaptability Score": clamp(g("adaptability")),
    "Resilience Rating": clamp((g("resilience") + g("discipline")) / 2),
    "Trust Radius": clamp(g("trust")),
    "Independence Level": clamp(g("independence")),
    "Friendship Reliability": clamp((g("trust") + g("kindness") + g("patience") + g("empathy")) / 4),
    "Growth Mindset": clamp((g("selfAwareness") + g("curiosity") + g("optimism")) / 3),
    "Communication Clarity": clamp((g("logic") + g("confidence") + g("empathy")) / 3),
    "Stress Recovery": clamp((g("resilience") + g("optimism") + g("patience")) / 3),
  };
}

/* "Life Balance" is a presentational grouping, not a separate measured
   instrument: it recombines the same 25 scored dimensions used everywhere
   else into 5 familiar buckets (Work/Social/Personal/Learning/Wellbeing),
   the same way computeMeasuredTraits() above turns raw dims into
   friendlier composite names. No new data is collected or invented for
   this — see the result page's Life Balance card for the same disclosure
   shown to the person. */
function computeLifeBalance(normDims){
  const clamp = v => Math.max(1, Math.min(100, Math.round(v)));
  const g = k => pct(normDims[k] || 0);
  return {
    "Work": clamp((g("drive") + g("discipline") + g("responsibility") + g("persistence")) / 4),
    "Social": clamp((g("socialEnergy") + g("empathy") + g("kindness")) / 3),
    "Personal": clamp((g("selfAwareness") + g("independence") + g("patience")) / 3),
    "Learning": clamp((g("curiosity") + g("openMindedness") + g("adaptability")) / 3),
    "Wellbeing": clamp((g("emotionalStability") + g("resilience") + g("optimism")) / 3),
  };
}

/* Same idea as computeLifeBalance() just above: recombines real scored
   dims into 4 motivation-flavored facets so the Motivation card has
   actual numbers to show, not just the single MOTIVATION_STYLES name. */
function computeMotivationFacets(normDims){
  const clamp = v => Math.max(1, Math.min(100, Math.round(v)));
  const g = k => pct(normDims[k] || 0);
  return {
    "Purpose": clamp(g("responsibility")),
    "Ambition": clamp(g("drive")),
    "Consistency": clamp(g("persistence")),
    "Exploration": clamp((g("curiosity") + g("openMindedness")) / 2),
  };
}

/* -------------------------------------------------------------------------
   ALGORITHM: Career matching
   For each career, fit = average normalized score across its 3 signature
   dimensions. Tiers: >=65 Excellent, >=45 Good, else Avoid (shown as a
   growth note rather than a value judgement). A one-line "why" is
   generated from whichever of the 3 dimensions scored highest for the
   person, referencing that trait by name.
------------------------------------------------------------------------- */

const DIM_LABELS = {
  confidence:"confidence", logic:"logical thinking", creativity:"creativity",
  humor:"humor", adaptability:"adaptability", curiosity:"curiosity",
  empathy:"empathy", leadership:"leadership", patience:"patience",
  drive:"drive", risk:"risk tolerance", trust:"trust", kindness:"kindness",
  discipline:"discipline", socialEnergy:"social energy",
  selfAwareness:"self-awareness", planning:"planning", resilience:"resilience",
  optimism:"optimism", independence:"independence",
  emotionalStability:"emotional stability", competitiveness:"competitiveness",
  responsibility:"responsibility", persistence:"persistence",
  openMindedness:"open-mindedness"
};

function computeCareers(normDims){
  return CAREERS.map(c => {
    const scores = c.dims.map(d => pct(normDims[d] || 0));
    const fit = Math.round(scores.reduce((a,b)=>a+b,0) / scores.length);
    const topDimIdx = scores.indexOf(Math.max(...scores));
    const topDim = c.dims[topDimIdx];
    const tier = fit >= 70 ? "Excellent Match" : fit >= 55 ? "Good Match" : fit >= 40 ? "Possible Match" : "Avoid";
    const why = tier === "Avoid"
      ? `Your natural ${DIM_LABELS[c.dims[scores.indexOf(Math.min(...scores))]]} leans elsewhere, so this isn't a strength fit today.`
      : tier === "Possible Match"
      ? `Your ${DIM_LABELS[topDim]} helps here, but it isn't the strongest lane for you.`
      : `Your ${DIM_LABELS[topDim]} lines up well with what this path demands.`;
    return { name:c.name, fit, tier, why };
  }).sort((a,b) => b.fit - a.fit);
}

/* -------------------------------------------------------------------------
   ALGORITHM: Relationship matches
   Each relationship type weights a different subset of dimensions, using
   the person's own scores to describe how they show up in that dynamic
   (not a two-person comparison, that's the Compare page, below).
------------------------------------------------------------------------- */

const RELATIONSHIP_WEIGHTS = {
  friendship: ["trust","kindness","socialEnergy"],
  dating: ["empathy","trust","confidence"],
  marriage: ["patience","trust","discipline"],
  business: ["drive","logic","discipline"],
  creative: ["creativity","adaptability","curiosity"],
  travel: ["adaptability","risk","curiosity"],
  gaming: ["patience","logic","humor"],
  study: ["discipline","patience","logic"],
  roommate: ["patience","trust","discipline"],
};

function computeRelationshipStyles(normDims){
  return RELATIONSHIP_TYPES.map(r => {
    const dims = RELATIONSHIP_WEIGHTS[r.key];
    const score = Math.round(dims.reduce((s,d)=>s+getDimensionPercent(normDims,d),0) / dims.length);
    return { key:r.key, label:r.label, score };
  });
}

/* -------------------------------------------------------------------------
   ALGORITHM: Personality code encode/decode (versioned)
   Format:  [Name-]PF<version>-<archetypeIndex base36>-<N dims base36>-<checksum>

   PF4: this is a complete redesign (new question bank, new adaptive
   engine, new scoring model), and PF1/PF2/PF3 codes are permanently
   obsolete as of this version. Earlier versions of this file used to
   backfill old codes into the current dimension layout so they'd never
   break; PF4 deliberately does NOT do that anymore (no compatibility
   layer, no conversion, no reused scoring) - a code from an earlier
   version is recognized only well enough to say so. decodeCode()
   returns `{ obsolete: true, version }` for any version below the
   current one; every page that shows a decoded profile must check that
   flag first and show the "please retake the assessment" message
   instead of attempting to render a profile from it.
   Every dimension is clamped to -10..10, shifted to 0..20 so it always
   encodes as a single base36 digit. The checksum is a simple mod-36 sum of
   all digit values plus the archetype index, guarding against typos.
   Fully local, no server round trip needed to decode either the name or
   the traits.
------------------------------------------------------------------------- */

const B36 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Two independent version numbers, per the depth-tier/versioning audit:
//  - The INTERNAL schema version (the number actually written into the
//    code string as "PFn") identifies the wire *shape* -- how many digits,
//    what they mean. It only ever goes up, and a number is never reused
//    once shipped, so decodeCode() can always tell a genuine old code from
//    a new one by version number alone. It is never shown to users.
//  - The PUBLIC version (SCHEMA_TO_PUBLIC_VERSION below) is a purely
//    editorial label shown in UI copy. Development schemas 1-3 (the old,
//    pre-redesign product) are never public. Schema 4 (already shipped)
//    and schema 5 (this release: adds the depth-tier digit, see below)
//    are both still "PersonaForge 1" -- nothing user-facing changed
//    generation, an internal capability was just added. A future schema
//    bump only becomes a new public number when a release earns one; that
//    is a deliberate decision made at the time, not a formula.
const LEGACY_CODE_VERSION = 4; // frozen shape: 25 dim digits, no depth digit -- must decode forever, unchanged
const CODE_VERSION = 5;        // current encode target: 25 dim digits + 1 depth-tier digit
const SCHEMA_TO_PUBLIC_VERSION = { 4: 1, 5: 1 };
function publicVersionLabel(schemaVersion){
  const v = SCHEMA_TO_PUBLIC_VERSION[schemaVersion];
  return v ? `PersonaForge ${v}` : "PersonaForge";
}

// The result-depth tier (Quick Read / Balanced / Deep Dive) a code was
// generated at, packed as one extra base36 digit (schema 5+ only) so
// Compare/Party Compare can warn about a Quick Read profile from a bare
// pasted code, not just the local user's own session metadata.
const DEPTH_TIER_TO_CODE = { short: "0", balanced: "1", deep: "2" };
const DEPTH_TIER_FROM_CODE = { "0": "short", "1": "balanced", "2": "deep" };
// session.pace -> the same "short"/"balanced"/"deep" vocabulary result.meta
// uses, mirroring OB_LENGTH_OPTIONS' depth field in quiz.js (kept as an
// independent copy so engine.js never depends on quiz.js load order).
const PACE_TO_DEPTH = { quick: "short", balanced: "balanced", deep: "deep" };

function sanitizeName(name){
  return (name || "").trim().replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20);
}

function encodeCode(archetypeId, normDims, name, resultDepth){
  const archIdx = ARCHETYPES.findIndex(a => a.id === archetypeId);
  const archDigit = B36[archIdx] || "0";
  let digits = "";
  let checksum = archIdx;
  DIMENSIONS.forEach(dim => {
    const shifted = Math.max(0, Math.min(20, (normDims[dim] || 0) + 10));
    digits += B36[shifted];
    checksum += shifted;
  });
  const depthChar = DEPTH_TIER_TO_CODE[resultDepth] || DEPTH_TIER_TO_CODE.balanced;
  digits += depthChar;
  checksum += B36.indexOf(depthChar);
  const checkDigit = B36[checksum % 36];
  const base = `PF${CODE_VERSION}-${archDigit}-${digits}-${checkDigit}`;
  const cleanName = sanitizeName(name);
  return cleanName ? `${cleanName}-${base}` : base;
}

function decodeCode(code){
  try {
    const raw = code.trim();
    let name = "";
    let body = raw;
    const firstParts = raw.split("-");
    if (firstParts[0] && !/^PF\d+$/i.test(firstParts[0])){
      name = sanitizeName(firstParts[0]);
      body = firstParts.slice(1).join("-");
    }
    const parts = body.trim().toUpperCase().split("-");
    if (parts.length !== 4) return null;
    const [versionTag, archDigit, digits, checkDigit] = parts;
    const versionMatch = /^PF(\d+)$/.exec(versionTag);
    if (!versionMatch) return null;
    const version = parseInt(versionMatch[1], 10);
    if (version < LEGACY_CODE_VERSION){
      // PF1/PF2/PF3: recognized only as "obsolete", never decoded or
      // migrated. No archetype/normDims are returned - there is nothing
      // safe to render from an old scoring model.
      return { obsolete: true, version, name };
    }
    const archIdx = B36.indexOf(archDigit);
    if (archIdx < 0 || !ARCHETYPES[archIdx]) return null;

    // Schema LEGACY_CODE_VERSION (4) is the frozen legacy-current shape --
    // exactly one base36 digit per dimension, no depth-tier digit -- and it
    // must keep decoding exactly as it always has, forever: those codes
    // are already out in the wild (shared links, QR codes, saved groups)
    // and must "load normally, compare normally, export normally, never
    // force a retest." Schema CODE_VERSION (5) and any later schema append
    // one extra trailing digit encoding resultDepth.
    const hasDepthDigit = version >= CODE_VERSION;
    const expectedDigitCount = DIMENSIONS.length + (hasDepthDigit ? 1 : 0);
    if (digits.length !== expectedDigitCount) return null;

    let checksum = archIdx;
    const normDims = emptyDims();
    for (let i = 0; i < DIMENSIONS.length; i++){
      const val = B36.indexOf(digits[i]);
      if (val < 0 || val > 20) return null;
      checksum += val;
      normDims[DIMENSIONS[i]] = val - 10;
    }
    let depthTier = null;
    if (hasDepthDigit){
      const depthChar = digits[DIMENSIONS.length];
      if (!(depthChar in DEPTH_TIER_FROM_CODE)) return null;
      checksum += B36.indexOf(depthChar);
      depthTier = DEPTH_TIER_FROM_CODE[depthChar];
    }
    if (B36[checksum % 36] !== checkDigit) return null;

    return {
      archetype: ARCHETYPES[archIdx],
      normDims,
      name,
      version,
      // "short" | "balanced" | "deep" | null (unknown -- schema 4 codes
      // predate this field and never carried a depth tier at all).
      depthTier,
    };
  } catch (e){
    return null;
  }
}

// decodeCode()'s own .archetype is whatever archIdx was baked into the
// code string at encode time -- correct then, but stale the moment
// matchArchetype's scoring changes, since (unlike normDims) it's never
// recomputed just from decoding. Every page that displays an archetype
// from a decoded code (Compare, Party Compare, the inline compare-with-a-
// code widget on Results) should run it through this first, so none of
// them can show a different archetype than the same person's own Result/
// Profile/Growth pages, which already recompute fresh.
function freshenDecoded(decoded){
  if (!decoded || decoded.obsolete) return decoded;
  return { ...decoded, archetype: matchArchetype(decoded.normDims).primary };
}

// The exact message PF4 shows anywhere an obsolete PF1/PF2/PF3 code was
// entered or loaded, instead of attempting to render (or migrate) a
// profile from it. Centralized so every call site shows identical
// wording, per the "do not attempt automatic migration" requirement.
const OBSOLETE_CODE_MESSAGE = "This result was created with an earlier generation of PersonaForge. The current PersonaForge is a complete redesign with a new adaptive engine, new question bank, new scoring model, and improved psychological interpretation. To receive an accurate result, please retake the assessment.";

// Shown above Compare/Party Compare results when at least one decoded
// profile's depthTier is "short" (Quick Read) -- possible for any pasted
// code (not just the local user's own) now that depthTier travels inside
// the code itself (schema CODE_VERSION+). A legacy schema-4 code's
// depthTier is null (genuinely unknown, not "not quick"), so it never
// triggers this, same as a Balanced/Deep Dive code wouldn't.
const QUICK_READ_COMPARE_WARNING = "This comparison includes at least one Quick Read profile. Some conclusions may be less certain than comparisons created from the full assessment.";
function quickReadCompareWarningHtml(depthTiers){
  if (!depthTiers.some(d => d === "short")) return "";
  return `<p class="center-note quick-read-compare-warning" style="text-align:left">${obEsc(QUICK_READ_COMPARE_WARNING)}</p>`;
}

/* -------------------------------------------------------------------------
   ALGORITHM: Compatibility (Compare page)
   For two decoded profiles, compute:
   - relationshipScore: overall closeness, weighted toward complementary
     (not just identical) traits: leadership plus patience, drive plus
     planning, social energy plus empathy, and risk plus discipline are
     all treated as good complements, not just close matches.
   - communicationScore, adventureScore, creativeScore, trustScore: simple
     paired averages and similarity on relevant dimension clusters.
   - sharedStrengths / conflictAreas: dimensions where both score high
     (shared) versus dimensions with the largest gap (friction risk).
------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------
   ALGORITHM: Compatibility (rewritten, empirically calibrated)
   The previous version scored almost every pair 75-90% because it
   averaged similarity across 25 near-independent dimensions, and
   averaging many independent numbers mathematically compresses variance
   toward a narrow middle band regardless of who's being compared, the
   same reason a class average barely moves no matter which two students
   you pick. This version fixes that two ways:
   1. traitSimilarity() uses a steep, calibrated falloff (spread=5,
      power=1.8) instead of a gentle linear one, so real differences
      register instead of being smoothed away.
   2. The raw composite is then passed through calibrateScore(), a
      piecewise remap whose anchor points were derived empirically by
      simulating 1000+ real quiz sessions, measuring the actual raw score
      distribution, and mapping its percentiles onto the target
      real-world bands (most pairs land "mixed" to "good", "exceptional"
      is genuinely rare). This was verified afterward against 500 more
      simulated pairs: about 1% land under 20, 16% in 20-40, 37% in
      40-60, 22% in 60-75, 18% in 75-90, and 5% above 90, close to the
      intended distribution, with a real identical-profile match scoring
      100 and true opposites scoring 0.
------------------------------------------------------------------------- */

function traitSimilarity(a, b, spread, power){
  const gap = Math.abs((a||0) - (b||0));
  const normalized = Math.min(1, gap / (spread || 5));
  return 100 * (1 - Math.pow(normalized, power || 1.8));
}

const COMPATIBILITY_CALIBRATION_ANCHORS = [
  [0,0], [43.6,20], [56.0,40], [66.7,60], [74.2,75], [82.0,90], [90.7,100]
];
function calibrateScore(raw){
  const anchors = COMPATIBILITY_CALIBRATION_ANCHORS;
  if (raw <= anchors[0][0]) return anchors[0][1];
  for (let i = 1; i < anchors.length; i++){
    if (raw <= anchors[i][0]){
      const [x0,y0] = anchors[i-1], [x1,y1] = anchors[i];
      const t = (raw - x0) / (x1 - x0);
      return Math.round(y0 + t * (y1 - y0));
    }
  }
  return 100;
}

const COMPATIBILITY_CORE_DIMS = ["trust","empathy","kindness","patience","emotionalStability","socialEnergy","independence","openMindedness"];
const COMPATIBILITY_COMPLEMENT_PAIRS = [["leadership","patience"],["drive","planning"],["risk","discipline"]];

function compatibilityBand(score){
  if (score < 20) return "Extremely Incompatible";
  if (score < 40) return "Difficult";
  if (score < 60) return "Mixed";
  if (score < 75) return "Good";
  if (score < 90) return "Excellent";
  return "Exceptional";
}

/* Similarity is a different question from compatibility: it asks "how
   alike are you", not "how well do you function together". It's an
   unweighted read across every dimension, with no bonus for the kind of
   complementary differences (one leads, one supports) that compatibility
   specifically rewards, which is exactly why the two numbers can and
   often do disagree. */
function computeSimilarityScore(a, b){
  const vals = DIMENSIONS.map(d => traitSimilarity(a[d], b[d], 6, 1.4));
  const raw = vals.reduce((s,v) => s+v, 0) / vals.length;
  return calibrateScore(raw);
}

/* A lightweight, defensible proxy for how much real signal a profile
   carries, since a decoded code doesn't retain how many questions were
   actually answered. Profiles with traits sitting mostly near neutral
   read as less certain than ones with clear, decisive scores. */
function computeComparisonConfidence(profileA, profileB){
  const strength = (nd) => {
    const vals = DIMENSIONS.map(d => Math.abs(nd[d] || 0));
    return vals.reduce((s,v) => s+v, 0) / vals.length;
  };
  const avgStrength = (strength(profileA.normDims) + strength(profileB.normDims)) / 2;
  return Math.max(55, Math.min(99, Math.round(55 + avgStrength * 7)));
}

function computeCompatibility(profileA, profileB){
  const a = profileA.normDims, b = profileB.normDims;

  const coreVals = COMPATIBILITY_CORE_DIMS.map(d => traitSimilarity(a[d], b[d], 5, 1.8));
  const core = coreVals.reduce((s,v) => s+v, 0) / coreVals.length;
  const complementBonus = COMPATIBILITY_COMPLEMENT_PAIRS.reduce((sum, [x,y]) => {
    const gap = Math.abs((a[x]||0) - (b[y]||0));
    return sum + Math.max(0, (10 - gap) / 10) * 3;
  }, 0);
  const rawOverall = Math.max(0, Math.min(100, core * 0.85 + complementBonus));
  const relationshipScore = calibrateScore(rawOverall);

  const communicationScore = calibrateScore((traitSimilarity(a.socialEnergy,b.socialEnergy,5,1.8) + traitSimilarity(a.trust,b.trust,5,1.8) + traitSimilarity(a.empathy,b.empathy,5,1.8)) / 3);
  const adventureScore = calibrateScore((traitSimilarity(a.risk,b.risk,5,1.8) + traitSimilarity(a.adaptability,b.adaptability,5,1.8) + traitSimilarity(a.curiosity,b.curiosity,5,1.8)) / 3);
  const creativeScore = calibrateScore((traitSimilarity(a.creativity,b.creativity,5,1.8) + traitSimilarity(a.curiosity,b.curiosity,5,1.8)) / 2);
  const trustScore = calibrateScore((traitSimilarity(a.trust,b.trust,5,1.8) + traitSimilarity(a.kindness,b.kindness,5,1.8)) / 2);

  const similarityScore = computeSimilarityScore(a, b);
  const comparisonConfidence = computeComparisonConfidence(profileA, profileB);
  const band = compatibilityBand(relationshipScore);
  const similarityGap = Math.abs(similarityScore - relationshipScore);
  const similarityNote = similarityGap < 8
    ? "Your similarity and compatibility scores are close, how alike you are lines up with how well you function together."
    : similarityScore > relationshipScore
    ? `You're more alike (${similarityScore}%) than you are compatible (${relationshipScore}%), being similar doesn't automatically mean you balance each other well.`
    : `You're more compatible (${relationshipScore}%) than you are similar (${similarityScore}%), your differences are doing real work here, not just canceling each other out.`;

  const shared = DIMENSIONS.filter(d => a[d] >= 3 && b[d] >= 3).sort((x,y)=>(b[y]+a[y])-(b[x]+a[x])).slice(0,4);
  const conflicts = DIMENSIONS.map(d => ({ d, gap: Math.abs(a[d]-b[d]) })).sort((x,y)=>y.gap-x.gap).slice(0,3).map(x=>x.d);

  return { relationshipScore, communicationScore, adventureScore, creativeScore, trustScore,
    similarityScore, comparisonConfidence, band, similarityNote,
    sharedStrengths: shared.map(d => DIM_LABELS[d]), conflictAreas: conflicts.map(d => DIM_LABELS[d]) };
}

/* =========================================================================
   V2 ADDITIONS
   New computed profiles for the v2 update. All of these are pure
   functions over a 25-dimension normDims object, nothing here changes how
   the original scoring, matching, or codes behave.
   ========================================================================= */

/* ---- Generic signature scorer, reused by several profiles below -------- */
function scoreBySignature(list, normDims){
  return list.map(item => ({
    item,
    score: item.signature.reduce((sum, s) => sum + (normDims[s.dim] || 0) * s.w, 0),
  })).sort((a, b) => b.score - a.score);
}

/* ---- Generic percentage-breakdown scorer, reused by thinking/learning/
   decision/love-language profiles. Every category's raw value is an
   average of pct() over its listed dimensions, then the whole set is
   normalized to sum to 100 so it reads like a breakdown, not a set of
   independent scores. ------------------------------------------------- */
function computePercentageProfile(categories, normDims){
  const raw = categories.map(c => ({
    name: c.name,
    val: c.dims.reduce((s, d) => s + pct(normDims[d] || 0), 0) / c.dims.length,
  }));
  const total = raw.reduce((s, r) => s + r.val, 0) || 1;
  const withPct = raw.map(r => ({ name: r.name, pct: Math.round((r.val / total) * 100) }));
  withPct.sort((a, b) => b.pct - a.pct);
  const drift = 100 - withPct.reduce((s, r) => s + r.pct, 0);
  if (withPct.length) withPct[0].pct += drift;
  return withPct;
}

/* ---- Personality mix: primary/secondary/third percentages -- */
function computePersonalityMix(ranked){
  const top3 = ranked.slice(0, 3);
  const minScore = Math.min(...top3.map(r => r.score));
  const shifted = top3.map(r => Math.max(0.5, r.score - minScore + 1));
  const total = shifted.reduce((a, b) => a + b, 0);
  const pcts = shifted.map(v => Math.round((v / total) * 100));
  const drift = 100 - pcts.reduce((a, b) => a + b, 0);
  pcts[0] += drift;
  return top3.map((r, i) => ({ archetype: r.archetype, pct: Math.max(1, pcts[i]) }));
}

/* ---- Social profile ------------------------------------------ */
function computeSocialProfile(normDims){
  const spectrumPct = pct(normDims.socialEnergy || 0);
  const category = spectrumPct <= 35 ? "Introvert" : spectrumPct >= 65 ? "Extrovert" : "Ambivert";
  const socialBattery = clamp1to100((pct(normDims.socialEnergy || 0) + pct(normDims.adaptability || 0)) / 2);
  const empathyPct = pct(normDims.empathy || 0), humorPct = pct(normDims.humor || 0), logicPct = pct(normDims.logic || 0);
  let conversationStyle;
  if (empathyPct >= humorPct && empathyPct >= logicPct) conversationStyle = "Deep, one-on-one conversations over small talk";
  else if (humorPct >= logicPct) conversationStyle = "Playful, quick back-and-forth banter";
  else conversationStyle = "Idea-driven discussion, small talk is just the warm-up";
  let groupSizePreference;
  if (spectrumPct <= 35 && pct(normDims.independence || 0) >= 55) groupSizePreference = "One person, or a very small, familiar group";
  else if (spectrumPct >= 65) groupSizePreference = "The bigger the group, the more energy in the room";
  else groupSizePreference = "Small, familiar groups over big unpredictable ones";
  const communicationStyle = pct(normDims.confidence || 0) >= 60
    ? "Direct and upfront, says what it is"
    : pct(normDims.empathy || 0) >= 60
    ? "Careful and considerate, reads the room before speaking"
    : "Measured, tends to think before responding";
  return { spectrumPct, category, socialBattery, conversationStyle, groupSizePreference, communicationStyle };
}
function clamp1to100(v){ return Math.max(1, Math.min(100, Math.round(v))); }

/* ---- Relationship profile ------------------------------------ */
function computeRelationshipProfile(normDims){
  const loveLanguages = computePercentageProfile(LOVE_LANGUAGE_CATEGORIES, normDims);
  const attachmentStyle = scoreBySignature(ATTACHMENT_STYLES, normDims)[0].item;
  const conflictStyle = scoreBySignature(CONFLICT_STYLES, normDims)[0].item;
  const trustLevel = pct(normDims.trust || 0);
  const jealousyLevel = clamp1to100(100 - (pct(normDims.trust || 0) + pct(normDims.emotionalStability || 0)) / 2);
  const personalSpace = pct(normDims.independence || 0);
  const emotionalIntimacy = clamp1to100((pct(normDims.empathy || 0) + pct(normDims.trust || 0)) / 2);
  const leadScore = pct(normDims.leadership || 0), followScore = pct(normDims.patience || 0);
  const gap = leadScore - followScore;
  let relationshipDynamic;
  if (Math.abs(gap) <= 12 && pct(normDims.adaptability || 0) >= 60) relationshipDynamic = "Adaptive, switches depending on the situation";
  else if (gap > 12) relationshipDynamic = "Usually Leads";
  else if (gap < -12) relationshipDynamic = "Usually Follows";
  else relationshipDynamic = "Balanced";
  return { loveLanguages, attachmentStyle, conflictStyle, trustLevel, jealousyLevel, personalSpace, emotionalIntimacy, relationshipDynamic };
}

/* ---- Narrative role ------------------------------------------ */
function computeNarrativeRole(normDims){
  const ranked = scoreBySignature(NARRATIVE_ROLES, normDims);
  return { primary: ranked[0].item, runnerUp: ranked[1].item };
}

/* ---- Identity tagline (v1.4) --------------------------------------------
   The one-line "The Curious Builder" under a profile's identity card --
   deliberately a different flavor from NARRATIVE_ROLES above (which reads
   as a fictional-story archetype, Hero/Trickster/Villain) since a profile
   card is a personal identity statement, not a casting choice. Same
   scoreBySignature() mechanism as everything else, just its own list. */
const IDENTITY_TAGLINES = [
  { name:"The Curious Builder", signature:[{dim:"curiosity",w:1},{dim:"creativity",w:1}] },
  { name:"The Quiet Strategist", signature:[{dim:"logic",w:1},{dim:"patience",w:1},{dim:"socialEnergy",w:-1}] },
  { name:"The Gentle Challenger", signature:[{dim:"kindness",w:1},{dim:"competitiveness",w:1}] },
  { name:"The Visionary Explorer", signature:[{dim:"creativity",w:1},{dim:"risk",w:1}] },
  { name:"The Steady Anchor", signature:[{dim:"emotionalStability",w:1},{dim:"responsibility",w:1}] },
  { name:"The Warm Realist", signature:[{dim:"empathy",w:1},{dim:"logic",w:1}] },
  { name:"The Restless Optimist", signature:[{dim:"optimism",w:1},{dim:"drive",w:1},{dim:"patience",w:-1}] },
  { name:"The Careful Rebel", signature:[{dim:"independence",w:1},{dim:"discipline",w:1}] },
  { name:"The Bright Skeptic", signature:[{dim:"logic",w:1},{dim:"openMindedness",w:1},{dim:"trust",w:-1}] },
  { name:"The Loyal Wildcard", signature:[{dim:"trust",w:1},{dim:"adaptability",w:1}] },
  { name:"The Patient Perfectionist", signature:[{dim:"patience",w:1},{dim:"discipline",w:1}] },
  { name:"The Bold Listener", signature:[{dim:"confidence",w:1},{dim:"empathy",w:1}] },
  { name:"The Grounded Dreamer", signature:[{dim:"creativity",w:1},{dim:"emotionalStability",w:1}] },
  { name:"The Sharp Diplomat", signature:[{dim:"logic",w:1},{dim:"kindness",w:1}] },
  { name:"The Playful Perfectionist", signature:[{dim:"humor",w:1},{dim:"discipline",w:1}] },
  { name:"The Fierce Protector", signature:[{dim:"responsibility",w:1},{dim:"risk",w:1}] },
  { name:"The Independent Optimist", signature:[{dim:"independence",w:1},{dim:"optimism",w:1}] },
  { name:"The Quiet Observer", signature:[{dim:"selfAwareness",w:1},{dim:"socialEnergy",w:-1},{dim:"curiosity",w:1}] },
  { name:"The Social Strategist", signature:[{dim:"socialEnergy",w:1},{dim:"planning",w:1}] },
  { name:"The Resilient Idealist", signature:[{dim:"resilience",w:1},{dim:"optimism",w:1}] },
];
function computeIdentityTagline(normDims){
  return scoreBySignature(IDENTITY_TAGLINES, normDims)[0].item.name;
}

/* ---- Contradiction Engine (v1.6) -----------------------------------------
   Finds genuine tensions: two dimensions that are BOTH strongly true at
   once, where that combination is unusual rather than expected. A
   contradiction only counts if both sides clear a real threshold --
   this is why the list is often short (0-2 entries) or occasionally
   empty for a given profile, on purpose. Forcing a contradiction onto
   someone who doesn't have one would be exactly the generic, could-
   describe-anyone text this whole engine exists to avoid. Every pair's
   explanation is hand-written to name the specific tension, never a
   templated "you have both X and Y." */
const CONTRADICTION_PAIRS = [
  { dimA:"logic", dimB:"empathy", label:"Logical, but deeply empathetic",
    explanation:"You default to reasoning things through, but empathy runs just as strong underneath it -- most people who lead with logic learn to mute this. You didn't." },
  { dimA:"independence", dimB:"socialEnergy", label:"Independent, but socially energized",
    explanation:"You genuinely need your own space, and you're genuinely recharged by people. Not a contradiction you've resolved, just two real pulls you carry at once." },
  { dimA:"planning", dimB:"risk", label:"A planner who still takes the leap",
    explanation:"You don't wing decisions, you map them out. And then you still take the bigger risk anyway, calculated rather than avoided." },
  { dimA:"discipline", dimB:"curiosity", label:"Disciplined, but restlessly curious",
    explanation:"Structure keeps you grounded, curiosity keeps pulling you toward whatever's unexplored. You built the routine that makes room for both." },
  { dimA:"creativity", dimB:"logic", label:"Analytical and imaginative at once",
    explanation:"You think in systems and in leaps, both running hot. Most people are stronger in one; you never fully picked a side." },
  { dimA:"competitiveness", dimB:"kindness", label:"Competitive, without the edge",
    explanation:"You genuinely want to win, and you're genuinely kind about it. Those two don't usually survive in the same person without one quietly eating the other." },
  { dimA:"confidence", dimB:"patience", label:"Confident, but in no hurry to prove it",
    explanation:"You're sure of yourself without needing the room to see it right away -- confidence that doesn't need an audience." },
  { dimA:"leadership", dimB:"patience", label:"Leads, but doesn't rush the room",
    explanation:"You're comfortable setting the direction, and just as comfortable waiting for people to actually get there. Rarer than either trait alone." },
  { dimA:"optimism", dimB:"selfAwareness", label:"Hopeful, with your eyes open",
    explanation:"You expect things to work out, and you're clear-eyed about exactly why they might not. Optimism that isn't denial." },
  { dimA:"responsibility", dimB:"risk", label:"Reliable, but not risk-averse",
    explanation:"People can count on you to follow through, and you're still willing to bet on the uncertain option. Those two usually trade off against each other." },
];
function computeContradictions(normDims){
  const THRESHOLD = 2.5; // both dims must clear this (of -10..10) to count as genuinely, simultaneously true
  return CONTRADICTION_PAIRS
    .map(c => ({ ...c, a: normDims[c.dimA] || 0, b: normDims[c.dimB] || 0 }))
    .filter(c => c.a >= THRESHOLD && c.b >= THRESHOLD)
    .map(c => ({ ...c, strength: Math.min(c.a, c.b), aPct: pct(c.a), bPct: pct(c.b) }))
    .sort((x, y) => y.strength - x.strength)
    .slice(0, 3);
}

/* ---- Media Match (v1.1) ------------------------------------------------
   Explains a signature match in the same short, human register as the
   rest of the report: names the one or two dimensions that actually
   drove the score, using the same DIM_LABELS prose every other section
   already reads from, rather than exposing raw dim keys or weights. */
function explainSignatureMatch(signature, normDims){
  const contributions = signature
    .map(s => ({ dim: s.dim, val: (normDims[s.dim] || 0) * s.w }))
    .filter(c => c.val > 0)
    .sort((a, b) => b.val - a.val);
  const top = contributions.slice(0, 2).map(c => DIM_LABELS[c.dim] || c.dim);
  if (!top.length) return "A read that lines up with your overall shape more than any one trait.";
  if (top.length === 1) return `Your ${top[0]} is what makes this one feel familiar.`;
  return `Your ${top[0]} and ${top[1]} make this one feel familiar.`;
}
/* =========================================================================
   PERSONALITY ATLAS (v1.2)
   ---------------------------------------------------------------------
   Replaces the three separate v1.1 datasets (MEDIA_CHARACTERS,
   MEDIA_WORLDS, HISTORICAL_MINDS -- kept as-is below, unchanged content,
   already written and reviewed) with one category-agnostic entity list
   and one scoring/diversity/explanation engine that doesn't know or care
   what a "Character" or a "World" is. Adding a new category later (Role,
   Profession, Organization, ...) means adding entities with a category
   string and an entry in ATLAS_CATEGORY_CONFIG below -- never touching
   scoreAtlasEntity, selectDiverseAtlas, or the result page's render loop.

   Why not the literal field list from the brief (franchise/universe/
   country/occupation/alignment/importance/sharePriority/...)? Every one
   of those is real for SOME category and meaningless for others (a World
   has no "occupation", a Profession has no "franchise"), so hard-coding
   them as required fields would mean most entities carry half a dozen
   null fields forever. Entities instead carry a small required core
   (id/name/category/medium/source/role/energy/signature) plus whatever
   category-specific fields that entity actually has -- `tags` covers
   the rest generically. Improves on the brief's schema rather than
   copying it, per "do not blindly copy this."

   Diversity, not just rank: subcategory is *derived* from each entity's
   own strongest signature dimension (ATLAS_DIM_TO_BUCKET below), not
   hand-tagged per entity -- so a future entity needs zero manual
   classification to participate in diversity-aware selection, it just
   works from its own signature like everything else here already does.
   ========================================================================= */
const ATLAS_DIM_TO_BUCKET = {
  logic:"Analyst", curiosity:"Explorer", creativity:"Visionary", humor:"Trickster",
  adaptability:"Explorer", empathy:"Heart", leadership:"Leader", patience:"Guardian",
  drive:"Achiever", risk:"Maverick", trust:"Guardian", kindness:"Heart",
  discipline:"Strategist", socialEnergy:"Heart", selfAwareness:"Outsider",
  planning:"Strategist", resilience:"Survivor", optimism:"Heart",
  independence:"Maverick", emotionalStability:"Guardian", competitiveness:"Achiever",
  responsibility:"Guardian", persistence:"Survivor", openMindedness:"Explorer",
};
function atlasBucketFor(signature){
  const top = [...signature].sort((a, b) => Math.abs(b.w) - Math.abs(a.w))[0];
  return (top && ATLAS_DIM_TO_BUCKET[top.dim]) || "Wildcard";
}
// Built once at load, not per match -- every entity's signature magnitude
// (used to normalize its score below) and diversity bucket are computed
// a single time and cached on the entity object itself ("cache signatures,
// cache normalized vectors, reuse calculations"), not recomputed on every
// computeAtlasMatch() call. At today's ~50 entities this wouldn't matter;
// at 10,000+ it's the difference between O(n) and O(n) per match instead
// of O(n) work repeated on every single result page load.
function buildAtlasEntities(){
  const fromCharacters = MEDIA_CHARACTERS.map(c => ({
    id: `character:${c.name}`, name: c.name, category: "Character", medium: c.sourceType,
    source: c.source, role: c.role, energy: c.energy, signature: c.signature,
  }));
  const fromWorlds = MEDIA_WORLDS.map(w => ({
    id: `world:${w.name}`, name: w.name, category: "World", medium: "Fiction",
    source: w.source, role: w.role, energy: w.energy, signature: w.signature,
  }));
  const fromHistory = HISTORICAL_MINDS.map(h => ({
    id: `historical:${h.name}`, name: h.name, category: "HistoricalFigure", medium: "Real",
    source: h.field, role: h.role, energy: h.energy, signature: h.signature, died: h.died,
  }));
  const all = [...fromCharacters, ...fromWorlds, ...fromHistory];
  all.forEach(e => {
    e._sigMagnitude = e.signature.reduce((s, sig) => s + Math.abs(sig.w), 0) || 1;
    e.subcategory = atlasBucketFor(e.signature);
  });
  return all;
}
const ATLAS_ENTITIES = buildAtlasEntities();

// Normalized, not raw: a plain dot-product (what scoreBySignature() above
// uses for every OTHER signature list in this file, e.g. NARRATIVE_ROLES)
// structurally favors entities with more/heavier signature weights,
// independent of fit quality -- a {w:2,w:1,w:1} entity outscores a
// {w:2} entity even on an identical normDims read. That bias is fine for
// the small, hand-balanced lists it was built for, but the Atlas mixes
// entities with very different signature sizes across categories, so it
// needs a fair comparison: divide by the entity's own weight magnitude.
function scoreAtlasEntity(entity, normDims){
  const raw = entity.signature.reduce((s, sig) => s + (normDims[sig.dim] || 0) * sig.w, 0);
  return raw / entity._sigMagnitude;
}
// Greedy top-N capped per diversity bucket: walks the score-sorted list
// and skips (doesn't discard -- just defers) any entity whose bucket
// already has maxPerBucket picks, so "top 5" can't silently become five
// Analyst-bucket detectives. Falls through to filling remaining slots
// ignoring the cap only if the pool genuinely doesn't have enough
// diversity to fill `count` otherwise, so a thin category still returns
// something rather than an artificially short list.
function selectDiverseAtlas(scored, count, maxPerBucket){
  const picked = [];
  const bucketCounts = {};
  for (const s of scored){
    if (picked.length >= count) break;
    const used = bucketCounts[s.entity.subcategory] || 0;
    if (used >= maxPerBucket) continue;
    picked.push(s);
    bucketCounts[s.entity.subcategory] = used + 1;
  }
  if (picked.length < count){
    for (const s of scored){
      if (picked.length >= count) break;
      if (picked.includes(s)) continue;
      picked.push(s);
    }
  }
  return picked;
}
function explainSignatureContrast(signature, normDims){
  const contributions = signature
    .map(s => ({ dim: s.dim, val: (normDims[s.dim] || 0) * s.w }))
    .filter(c => c.val < 0)
    .sort((a, b) => a.val - b.val);
  const top = contributions.slice(0, 2).map(c => DIM_LABELS[c.dim] || c.dim);
  if (!top.length) return "A genuinely different shape from yours, not one sharp opposite trait, just an overall different balance.";
  if (top.length === 1) return `Your read on ${top[0]} runs the opposite direction from this one.`;
  return `Your read on ${top[0]} and ${top[1]} both run the opposite direction from this one.`;
}
// Category registry: the one place a future category gets added.
// minScore is a confidence floor (on the same normalized scale
// scoreAtlasEntity returns, roughly -10..10) -- a category whose best
// available match doesn't clear it is left out of the result entirely
// ("do not force every category to appear") rather than shown with a
// weak, unconvincing top pick.
const ATLAS_CATEGORY_CONFIG = {
  Character: { label: "Characters Like You", count: 3, maxPerBucket: 1, minScore: 1.2 },
  World: { label: "Worlds You'd Fit Into", count: 2, maxPerBucket: 2, minScore: 0.6 },
  HistoricalFigure: { label: "Historical Minds", count: 2, maxPerBucket: 1, minScore: 1.2 },
};
function computeAtlasMatch(normDims){
  // Characters are matched, ranked and explained by ONE engine (js/forge/characters.js).
  // This function only delegates, so the Atlas, the timeline's "matched X" statements and the
  // Character Explanation page can never disagree. The scoring below remains for worlds and
  // historical minds, and as the fallback if the character engine isn't loaded on a page.
  const FC = (typeof Forge !== "undefined" && Forge.characters && Forge.characters.roster().length) ? Forge.characters : null;
  const byCategory = {};
  ATLAS_ENTITIES.forEach(e => { (byCategory[e.category] = byCategory[e.category] || []).push(e); });

  const sections = [];
  const featuredIds = new Set();
  Object.entries(ATLAS_CATEGORY_CONFIG).forEach(([category, cfg]) => {
    if (category === "Character" && FC){
      const items = FC.atlasItems(normDims, cfg.count);
      if (items.length && items[0].matchPct >= 35){
        items.forEach(i => featuredIds.add(i.id));
        sections.push({ category, label: cfg.label, items });
      }
      return;
    }
    const pool = byCategory[category] || [];
    if (!pool.length) return;
    const scored = pool.map(entity => ({ entity, score: scoreAtlasEntity(entity, normDims) })).sort((a, b) => b.score - a.score);
    if (scored[0].score < cfg.minScore) return;
    const picked = selectDiverseAtlas(scored, cfg.count, cfg.maxPerBucket);
    picked.forEach(s => featuredIds.add(s.entity.id));
    sections.push({
      category, label: cfg.label,
      items: picked.map(s => ({ ...s.entity, explanation: explainSignatureMatch(s.entity.signature, normDims) })),
    });
  });

  // Stories: derived from the Character section's own top matches (each
  // one already implies its source story).
  const seenSources = new Set();
  const stories = [];
  let expectedEntity = null;
  if (FC){
    const prof = FC.profileFrom({ normDims });
    FC.rank(prof).forEach((x, idx) => {
      if (idx === 0) expectedEntity = { id: "character:" + x.char.name, name: x.char.name };
      if (stories.length >= 3 || seenSources.has(x.char.universe)) return;
      seenSources.add(x.char.universe);
      stories.push({ source: x.char.universe, medium: x.char.medium, role: x.char.role, characterId: x.char.id, explanation: FC.shortWhy(prof, x) });
    });
  } else {
    const charScored = (byCategory.Character || []).map(e => ({ entity: e, score: scoreAtlasEntity(e, normDims) })).sort((a, b) => b.score - a.score);
    charScored.forEach(s => {
      if (stories.length >= 3 || seenSources.has(s.entity.source)) return;
      seenSources.add(s.entity.source);
      stories.push({ source: s.entity.source, medium: s.entity.medium, role: s.entity.role, explanation: explainSignatureMatch(s.entity.signature, normDims) });
    });
    expectedEntity = charScored[0] && charScored[0].entity;
  }
  if (stories.length) sections.push({ category: "Story", label: "Stories You'd Fit Into", items: stories });

  // Unexpected Match: the single best-scoring entity from whichever category didn't already
  // clear its own confidence bar above (characters are excluded when the character engine owns them).
  const pool2 = FC ? ATLAS_ENTITIES.filter(e => e.category !== "Character") : ATLAS_ENTITIES;
  const allScored = pool2.map(entity => ({ entity, score: scoreAtlasEntity(entity, normDims) })).sort((a, b) => b.score - a.score);
  const unexpected = allScored.find(s => !featuredIds.has(s.entity.id) && s.score >= 0.5);
  if (unexpected){
    const baseExplanation = explainSignatureMatch(unexpected.entity.signature, normDims);
    const explanation = (expectedEntity && expectedEntity.id !== unexpected.entity.id)
      ? `Most people who read like you would expect ${expectedEntity.name}. ${baseExplanation.replace(/^Your/, "But your")}`
      : baseExplanation;
    sections.push({
      category: "Unexpected", label: "Unexpected Match",
      items: [{ ...unexpected.entity, explanation, expectedName: expectedEntity ? expectedEntity.name : null }],
    });
  }

  // Opposite Personality: framed as contrast rather than a match.
  if (FC){
    const sel = FC.selections(FC.profileFrom({ normDims }));
    if (sel && sel.opposite){
      const o = sel.opposite;
      sections.push({ category: "Opposite", label: "Opposite Personality", items: [{ id: "character:" + o.char.name, characterId: o.char.id, name: o.char.name, category: "Character", medium: o.char.medium, source: o.char.universe, role: o.char.role, energy: o.char.energy,
        explanation: "A very different shape from yours: " + FC.cards({ normDims }).cards.find(c => c.kind === "opposite").blurb.replace(/^A very different shape from yours: /, "") }] });
    }
  } else {
    const opposite = allScored[allScored.length - 1];
    if (opposite && opposite.score < 0){
      sections.push({
        category: "Opposite", label: "Opposite Personality",
        items: [{ ...opposite.entity, explanation: explainSignatureContrast(opposite.entity.signature, normDims) }],
      });
    }
  }

  return sections;
}

/* ---- Atlas enrichment provider interface (v1.2, unused by default) -----
   No providers are registered anywhere in this app -- this is the seam
   a future one (AniList, TMDB, IGDB, OpenLibrary, Wikidata, ...) would
   plug into without touching computeAtlasMatch/scoreAtlasEntity/
   selectDiverseAtlas above. A provider only ever ADDS fields (image,
   links, a richer description) to an entity already fully valid on its
   own; the Atlas is complete and correct with zero providers registered,
   which is also what keeps it working with no network and no API keys.
   enrichAtlasEntity() is not called anywhere yet -- wiring it into
   result.js's render path is future work, deliberately not done here
   per "do NOT integrate APIs yet." */
const ATLAS_PROVIDERS = [];
function registerAtlasProvider(provider){ ATLAS_PROVIDERS.push(provider); }
async function enrichAtlasEntity(entity){
  let enriched = entity;
  for (const provider of ATLAS_PROVIDERS){
    try {
      const extra = await provider.enrich(entity);
      if (extra) enriched = { ...enriched, ...extra };
    } catch (e) { /* provider unavailable or failed -- entity stays as local data, never blocks */ }
  }
  return enriched;
}

/* ---- Thinking, learning, decision profiles (Updates 8, 9, 10) ----------- */
function computeThinkingProfile(normDims){ return computePercentageProfile(THINKING_CATEGORIES, normDims); }
function computeLearningProfile(normDims){ return computePercentageProfile(LEARNING_CATEGORIES, normDims); }
function computeDecisionProfile(normDims){ return computePercentageProfile(DECISION_CATEGORIES, normDims); }

/* ---- Stress response, ranked --------------------------------- */
function computeStressResponses(normDims){
  return scoreBySignature(STRESS_RESPONSES, normDims).slice(0, 3).map(r => r.item);
}

/* ---- Ideal environments, ranked ------------------------------ */
function computeEnvironments(normDims){
  return scoreBySignature(ENVIRONMENT_PROFILES, normDims).slice(0, 4).map(r => r.item.name);
}

/* ---- Aesthetic profile ---------------------------------------- */
function computeAesthetic(normDims){
  return scoreBySignature(AESTHETIC_VIBES, normDims)[0].item;
}

/* ---- Entertainment predictions --------------------------------- */
function computeEntertainment(normDims){
  const ranked = scoreBySignature(ENTERTAINMENT_PROFILES, normDims);
  return { primary: ranked[0].item, secondary: ranked[1].item };
}

/* ---- Achievements ---------------------------------------------- */
function computeAchievements(normDims){
  return ACHIEVEMENTS.filter(a => a.test(normDims));
}

/* ---- Archetype extras: animal, element, symbol, hidden
   potential, plus the fields that are just aliases of existing archetype
   fields so nothing needed re-authoring. ------------------------------- */
function getArchetypeExtras(archetype){
  const lookup = ARCHETYPE_EXTRAS[archetype.id] || { animal:"Fox", element:"Fire", symbol:"\u2726" };
  const hiddenPotential = `The flip side of "${archetype.weaknesses[0]}" is usually unclaimed ${archetype.strengths[2] ? archetype.strengths[2].toLowerCase() : archetype.strengths[0].toLowerCase()}, once it stops being treated like a flaw.`;
  return {
    animal: lookup.animal,
    element: lookup.element,
    symbol: lookup.symbol,
    primaryColor: archetype.colors[0],
    secondaryColor: archetype.colors[1],
    lifeMotto: archetype.quote,
    favoriteEnvironment: archetype.idealEnvironments[0],
    hiddenPotential,
  };
}

/* ---- Just for fun stats ---------------------------------------
   Kept deliberately separate from computeMeasuredTraits(), which stays the
   serious, no-randomness read. This one is explicitly playful and labeled
   as such wherever it's shown, never presented as an actual assessment. */
function computeFunStats(normDims){
  const g = k => pct(normDims[k] || 0);
  const clamp = v => Math.max(1, Math.min(100, Math.round(v)));
  return {
    "Aura": clamp((g("confidence") + g("independence") + g("selfAwareness")) / 3),
    "Rizz": clamp((g("confidence") + g("humor") + g("socialEnergy")) / 3),
    "Chaos": clamp((g("risk") + g("humor") + (100 - g("planning"))) / 3),
    "Main Character Energy": clamp((g("confidence") + g("drive") + g("creativity")) / 3),
    "NPC Energy": clamp(100 - (g("independence") + g("confidence") + g("creativity")) / 3),
    "Plot Armor": clamp((g("resilience") + g("optimism") + g("persistence")) / 3),
    "Academic IQ": clamp((g("logic") + g("discipline") + g("curiosity")) / 3),
    "Street IQ": clamp((g("adaptability") + g("risk") + g("selfAwareness")) / 3),
    "Charisma": clamp((g("confidence") + g("humor") + g("leadership")) / 3),
    "Comfort Level": clamp((g("trust") + g("patience") + g("emotionalStability")) / 3),
    "Adventure": clamp((g("risk") + g("curiosity") + g("adaptability")) / 3),
    "Braincells": clamp((g("logic") + g("selfAwareness") + g("discipline")) / 3),
    "Clutch Factor": clamp((g("resilience") + g("confidence") + g("discipline")) / 3),
    "Fashion": clamp((g("creativity") + g("confidence") + g("openMindedness")) / 3),
    "Taste": clamp((g("selfAwareness") + g("creativity") + g("discipline")) / 3),
    "Vibes": clamp((g("optimism") + g("humor") + g("emotionalStability")) / 3),
    "Energy": clamp((g("drive") + g("socialEnergy") + g("competitiveness")) / 3),
  };
}

/* =========================================================================
   PROFILE DEPTH FEATURES
   Personality confidence/stability, hidden strengths and weaknesses,
   fantasy role, friendship/motivation/fun-extra profiles, and a much
   deeper compatibility engine. Nothing above this line changes.
   ========================================================================= */

/* ---- Personality confidence and stability ------------------------------- */
/* -------------------------------------------------------------------------
   ALGORITHM: Assessment Confidence
   Five components, matched one-to-one to what "confident" is actually
   supposed to mean for a layered archetype+soul read, not a speed proxy
   and not a single archetype-gap number:
     - archetypeSeparation: how far the top archetype candidate is ahead
                             of the runner-up (the original gap-based
                             signal)
     - consistency:         agreement across paired situations that touch
                             similar ground (computeConsistency)
     - soulCertainty:       the equivalent gap-based signal for the 6 soul
                             types — archetype and soul are determined
                             together from the same answers, so soul
                             ambiguity should drag overall confidence down
                             exactly like archetype ambiguity does, not be
                             invisible to it
     - sinVirtueCertainty:  how polarized the 7 sin/virtue axes are (close
                             to 50/50 on every axis means the "dominant"
                             sin or virtue is barely dominant at all, a
                             coin flip dressed up as an insight)
     - tieBreakerScore:     did Balanced mode need the extra 15 questions
                             beyond the 35-question checkpoint? Needing
                             them is itself a signal the profile wasn't
                             clear-cut going in, so it costs a modest
                             amount even if the extra questions eventually
                             cleared things up. Neutral (100) for Quick
                             Read/Deep Dive, where the concept doesn't
                             apply, and for Balanced runs that resolved at
                             the checkpoint without needing them.
   When no session is available (a profile decoded from a shared code),
   consistency and tieBreakerScore can't be measured, so overall is
   computed from the three signals that only need normDims
   (archetypeSeparation, soulCertainty, sinVirtueCertainty) with a visible
   note explaining why. */
function computeAssessmentConfidence(ranked, normDims, session){
  const gap = ranked[0].score - ranked[1].score;
  const archetypeSeparation = Math.max(0, Math.min(100, Math.round((gap / CONFIDENCE_SCALE) * 100)));
  const avgOthers = ranked.slice(1).reduce((s, r) => s + r.score, 0) / (ranked.length - 1);
  const stabilityRaw = ranked[0].score - avgOthers;
  const stabilityPct = Math.max(0, Math.min(100, Math.round((stabilityRaw / (CONFIDENCE_SCALE * 1.5)) * 100)));

  const soulRanked = scoreSoulTypes(normDims);
  const soulGap = soulRanked[0].score - soulRanked[1].score;
  const soulCertainty = Math.max(0, Math.min(100, Math.round((soulGap / CONFIDENCE_SCALE) * 100)));

  const sinVirtueAxes = computeSinVirtueProfile(normDims);
  const sinVirtueCertainty = Math.round(
    sinVirtueAxes.reduce((s, ax) => s + Math.abs(ax.sinPct - 50) * 2, 0) / sinVirtueAxes.length
  );

  if (!session || !session.answers){
    const overall = Math.max(0, Math.min(100, Math.round(
      archetypeSeparation * 0.45 + soulCertainty * 0.35 + sinVirtueCertainty * 0.2
    )));
    return {
      confidencePct: overall,
      stabilityPct,
      overall,
      consistency: null, tieBreakerScore: null,
      archetypeSeparation, soulCertainty, sinVirtueCertainty,
      note: "This code carries no answer history to measure consistency or tie-breaker use from, so this reflects separation and certainty only.",
    };
  }

  const consistencyResult = computeConsistency(session);
  const consistency = consistencyResult.pct;

  // v2.0: one continuous adaptive flow rather than a fixed-mode checkpoint,
  // so "needed extra questions beyond the baseline" is itself a signal
  // regardless of which pace was chosen - going past this session's own
  // minAdaptive (pace-specific: Quick Read's floor is lower than Deep
  // Dive's) means confidence genuinely wasn't there yet at the earliest
  // point this session was allowed to stop.
  const sessionMin = session.minAdaptive || MIN_ADAPTIVE_QUESTIONS, sessionMax = session.maxQuestions || MAX_QUESTIONS;
  let tieBreakerScore = 100;
  if (session.cursor > sessionMin && sessionMax > sessionMin){
    const extra = Math.min(session.cursor - sessionMin, sessionMax - sessionMin);
    tieBreakerScore = Math.round(100 - (extra / (sessionMax - sessionMin)) * 40);
  }

  // A validates:dim question disagreeing with the dimension's own earlier
  // running direction is real evidence the person's answers aren't fully
  // self-consistent on that trait - a plain, if small, certainty cost per
  // contradiction, capped so a couple of genuinely ambivalent traits don't
  // sink the whole read.
  const contradictionPenalty = Math.min(20, (session.contradictions || 0) * 6);

  const overall = Math.max(0, Math.min(100, Math.round(
    archetypeSeparation * 0.30 + consistency * 0.20 + soulCertainty * 0.20 +
    sinVirtueCertainty * 0.15 + tieBreakerScore * 0.15 - contradictionPenalty
  )));

  return {
    confidencePct: overall, // kept as the headline field existing UI already reads
    stabilityPct,
    overall, consistency, archetypeSeparation, soulCertainty, sinVirtueCertainty, tieBreakerScore,
    contradictions: session.contradictions || 0, contradictionPenalty,
    note: null,
  };
}

/* ---- Hidden strengths and weaknesses -------------------------------------
   Dimensions outside the matched archetype's own 3-dimension signature
   that still score notably high or low, the traits a person has that
   their "headline" type doesn't already advertise. */
function computeHiddenTraits(normDims, archetype){
  const sigDims = new Set(archetype.signature.map(s => s.dim));
  const outside = DIMENSIONS.filter(d => !sigDims.has(d)).map(d => ({ d, v: normDims[d] || 0 }));
  const hiddenStrengths = outside.filter(x => x.v > 0).sort((a,b) => b.v - a.v).slice(0, 3).map(x => DIM_LABELS[x.d]);
  const hiddenWeaknesses = outside.filter(x => x.v < 0).sort((a,b) => a.v - b.v).slice(0, 3).map(x => DIM_LABELS[x.d]);
  return { hiddenStrengths, hiddenWeaknesses };
}

/* ---- Fantasy role, friend type, motivation, fun extras -------------------
   All reuse the same signature-scoring pattern as archetypes. */
function computeFantasyRole(normDims){ return scoreBySignature(FANTASY_ROLES, normDims)[0].item; }
function computeFriendType(normDims){ return scoreBySignature(FRIEND_TYPES, normDims)[0].item; }
function computeMotivation(normDims){ return scoreBySignature(MOTIVATION_STYLES, normDims)[0].item; }
function computeMythicalCreature(normDims){ return scoreBySignature(MYTHICAL_CREATURES, normDims)[0].item; }
function computeSeason(normDims){ return scoreBySignature(SEASONS, normDims)[0].item; }
function computeTimeOfDay(normDims){ return scoreBySignature(TIMES_OF_DAY, normDims)[0].item; }
function computeChessPiece(normDims){ return scoreBySignature(CHESS_PIECES, normDims)[0].item; }

/* ---- Friendship profile scores -------------------------------------------- */
function computeFriendshipProfile(normDims){
  return {
    type: computeFriendType(normDims),
    reliableScore: pct(normDims.responsibility || 0),
    comfortScore: pct(normDims.kindness || 0),
    chaosScore: clamp1to100((pct(normDims.risk||0) + pct(normDims.humor||0)) / 2),
    listeningSkill: pct(normDims.patience || 0),
    adviceSkill: clamp1to100((pct(normDims.logic||0) + pct(normDims.empathy||0)) / 2),
    planningSkill: pct(normDims.planning || 0),
  };
}

/* -------------------------------------------------------------------------
   ALGORITHM: Deep compatibility (category breakdown)
   Runs every category in COMPATIBILITY_CATEGORIES, produces a ranked list
   of scores, a set of dynamically generated explanation sentences built
   from the actual dimension comparisons (not fixed text), a full set of
   "who does X more" comparisons, and a couple of generated activity
   suggestions plus fun-fact lines. Keeps computeCompatibility() above
   completely intact for anything already relying on the simpler version.
------------------------------------------------------------------------- */

function scoreCategory(cat, a, b){
  if (cat.type === "combined"){
    const vals = cat.dims.map(d => (pct(a[d]||0) + pct(b[d]||0)) / 2);
    return Math.round(vals.reduce((s,v) => s+v, 0) / vals.length);
  }
  const sims = cat.dims.map(d => traitSimilarity(a[d]||0, b[d]||0, 5, 1.8));
  const raw = sims.reduce((s,v) => s+v, 0) / sims.length;
  return calibrateScore(raw);
}

function generateCompatibilityExplanations(a, b, nameA, nameB){
  const A = nameA || "Person A", B = nameB || "Person B";
  const lines = [];
  const gap = (dim) => (a[dim]||0) - (b[dim]||0);

  if (Math.abs(gap("leadership")) >= 4){
    const leader = gap("leadership") > 0 ? A : B;
    const other = leader === A ? B : A;
    lines.push(`${leader} naturally takes the lead while ${other} is more comfortable supporting, which tends to work well if you both actually like it that way.`);
  }
  if ((a.patience||0) < -1 && (b.patience||0) < -1){
    lines.push(`You both tend to avoid conflict rather than lean into it, which can work in the short term but may delay solving problems that need airing out.`);
  }
  if (Math.abs(gap("planning")) >= 4){
    const planner = gap("planning") > 0 ? A : B;
    const other = planner === A ? B : A;
    lines.push(`${planner} enjoys planning things out while ${other} prefers to improvise, so you'll naturally divide who handles structure and who handles spontaneity.`);
  }
  if ((a.responsibility||0) >= 3 && (b.responsibility||0) >= 3){
    lines.push(`You both take responsibility seriously, which means things generally get done without either of you having to chase the other.`);
  }
  if (Math.abs(gap("socialEnergy")) >= 5){
    const social = gap("socialEnergy") > 0 ? A : B;
    const other = social === A ? B : A;
    lines.push(`${social} tends to bring the social energy while ${other} recharges in quieter settings, which can balance out well with a little give on both sides.`);
  }
  if ((a.trust||0) >= 3 && (b.trust||0) >= 3){
    lines.push(`Trust comes relatively easily to both of you, which tends to make the whole relationship lower-friction.`);
  }
  if ((a.trust||0) <= -2 || (b.trust||0) <= -2){
    lines.push(`At least one of you tends to guard trust carefully, so it may take real time and consistency before this relationship feels fully secure.`);
  }
  if (Math.abs(gap("risk")) >= 5){
    const riskier = gap("risk") > 0 ? A : B;
    const other = riskier === A ? B : A;
    lines.push(`${riskier} is far more comfortable with risk than ${other} is, so travel and big decisions may need extra conversation to land somewhere you both feel good about.`);
  }
  if ((a.humor||0) >= 3 && (b.humor||0) >= 3){
    lines.push(`You both lead with humor, which makes hard conversations easier to survive and easy ones a lot more fun.`);
  }
  if (Math.abs(gap("independence")) >= 5){
    const indep = gap("independence") > 0 ? A : B;
    const other = indep === A ? B : A;
    lines.push(`${indep} needs more independence day-to-day than ${other} does, worth naming directly so it doesn't get quietly misread as distance.`);
  }
  return lines.slice(0, 6);
}

function computeWhoComparisons(a, b, nameA, nameB){
  const A = nameA || "Person A", B = nameB || "Person B";
  return WHO_COMPARISONS.map(c => {
    let av = a[c.dim] || 0, bv = b[c.dim] || 0;
    if (c.invert){ av = -av; bv = -bv; }
    const diff = av - bv;
    const winner = Math.abs(diff) <= 1 ? "Evenly matched" : (diff > 0 ? A : B);
    return { label: c.label, winner };
  });
}

const ACTIVITY_TEMPLATES = [
  { dims:["risk","curiosity"], activity:"A spontaneous multi-city trip with no fixed itinerary", vacation:"Backpacking somewhere neither of you has been", business:"A scrappy early-stage venture that rewards moving fast", hobby:"Trying a new adrenaline sport together", weekend:"A last-minute road trip with no real plan",
    solveProblems:"By trying something and adjusting fast rather than mapping it out first", crisis:"You'd move first and figure out the plan while already moving", friendship:"Built fast, over a shared spontaneous story rather than a slow build-up" },
  { dims:["creativity","openMindedness"], activity:"A collaborative art, music, or writing project", vacation:"A slow trip built around galleries, music, and local art scenes", business:"A creative studio or content brand", hobby:"Building something together with your hands", weekend:"A open-ended creative afternoon with zero deadline",
    solveProblems:"By reframing the problem itself before accepting the obvious answer", crisis:"You'd look for the unconventional way out others wouldn't consider", friendship:"Built on ideas you can only really have with each other" },
  { dims:["discipline","planning"], activity:"Training for something together with a real endpoint", vacation:"A well-planned trip with a clear itinerary and reservations made early", business:"An operations-heavy business that rewards consistency", hobby:"A shared fitness or skill-building routine", weekend:"A productive weekend with a satisfying list to check off",
    solveProblems:"By breaking it into steps and working the steps, in order", crisis:"You'd default to whatever the plan already accounted for", friendship:"Built slowly, through consistency shown over real time" },
  { dims:["empathy","kindness"], activity:"Volunteering somewhere together", vacation:"A quiet, restorative trip focused on connection over sightseeing", business:"A mission-driven venture or nonprofit", hobby:"Cooking for people you both care about", weekend:"A low-key weekend hosting people you love",
    solveProblems:"By checking in on who it actually affects before deciding anything", crisis:"You'd focus on making sure everyone's actually okay first", friendship:"Built on really being there, not just being around" },
  { dims:["humor","socialEnergy"], activity:"Hosting a big, chaotic game night", vacation:"A trip built around festivals, nightlife, and meeting people", business:"Something public-facing and social, like events or hospitality", hobby:"An improv or comedy class together", weekend:"A weekend packed with plans and people",
    solveProblems:"By talking it out loud with other people until it clicks", crisis:"You'd rally people and keep morale from collapsing", friendship:"Built loud, immediate, and easy from the very first conversation" },
];
function computePerfectActivities(a, b){
  const combined = {};
  DIMENSIONS.forEach(d => combined[d] = ((a[d]||0) + (b[d]||0)) / 2);
  const scored = ACTIVITY_TEMPLATES.map(t => ({
    t, score: t.dims.reduce((s,d) => s + combined[d], 0) / t.dims.length,
  })).sort((x,y) => y.score - x.score);
  return scored[0].t;
}

/* -------------------------------------------------------------------------
   ALGORITHM: Group compatibility (party of up to 5)
   Runs the existing pairwise compatibility for every pair in the group,
   then layers on group-level reads: an overall average, the strongest and
   weakest pair, each person's most distinctive trait relative to the
   group average (their "role"), traits the whole group shares, and the
   traits with the most spread (likely friction points for the group as a
   whole, not just one pair).
------------------------------------------------------------------------- */
/* ---- Party Compare v1.1: "the cast" ------------------------------------
   Five named roles, each scored the same way every signature-based list
   in this file already is (scoreBySignature's dot-product, just inlined
   per-role here since this needs the *winning person*, not a ranked list
   of items). Deliberately not forced to be five different people -- in a
   3-5 person group it's completely normal, and informative, for one
   person to carry more than one role; nothing here manufactures a false
   balance the group doesn't actually have. */
const GROUP_ROLE_SIGNATURES = {
  stabilizer: [{dim:"emotionalStability",w:1},{dim:"resilience",w:1},{dim:"discipline",w:1}],
  energizer: [{dim:"socialEnergy",w:1},{dim:"optimism",w:1}],
  steerer: [{dim:"leadership",w:1},{dim:"confidence",w:1}],
  humanizer: [{dim:"empathy",w:1},{dim:"kindness",w:1}],
  challenger: [{dim:"competitiveness",w:1},{dim:"risk",w:1}],
  // v1.2: three more, same mechanism, no changes to computeGroupCast()
  // needed to add them -- this is the payoff of scoring roles generically
  // instead of hand-writing a winner-finder per role.
  planner: [{dim:"discipline",w:1},{dim:"planning",w:2}],
  strategist: [{dim:"logic",w:1},{dim:"independence",w:1}],
  chaosAgent: [{dim:"risk",w:1},{dim:"humor",w:1}],
};
const GROUP_ROLE_LABELS = {
  stabilizer: { roleName:"The Stabilizer", roleDescription:"Keeps the group steady when things get stressful or uncertain." },
  energizer: { roleName:"The Energizer", roleDescription:"Brings the social momentum that keeps everyone's energy up." },
  steerer: { roleName:"The Steerer", roleDescription:"Naturally ends up setting the direction, whether or not they asked to." },
  humanizer: { roleName:"The Humanizer", roleDescription:"Keeps the group's decisions grounded in how people actually feel." },
  challenger: { roleName:"The Challenger", roleDescription:"Pushes the group past its comfortable default." },
  planner: { roleName:"The Planner", roleDescription:"Has a structure in mind before anyone else has finished reacting." },
  strategist: { roleName:"The Strategist", roleDescription:"Sees the whole board and plays several moves ahead of the conversation." },
  chaosAgent: { roleName:"The Chaos Agent", roleDescription:"Is exactly as likely to save the plan as blow it up, on purpose." },
};
function computeGroupCast(profiles, names){
  const label = (i) => names[i] || `Person ${i + 1}`;
  return Object.entries(GROUP_ROLE_SIGNATURES).map(([role, signature]) => {
    const scored = profiles.map((p, idx) => ({
      idx,
      score: signature.reduce((s, sig) => s + (p.normDims[sig.dim] || 0) * sig.w, 0),
    })).sort((a, b) => b.score - a.score);
    const winner = scored[0];
    return {
      role,
      ...GROUP_ROLE_LABELS[role],
      personName: label(winner.idx),
      archetype: profiles[winner.idx].archetype,
    };
  });
}

// A couple of fun, game/story-framed one-liners on top of the Cast --
// deliberately NOT more role cards (the grid is full enough already at 8
// roles), just two named narrative beats the way a party in an actual
// game or story gets talked about. Same signature-scoring mechanism as
// everything above, just phrased as a scenario instead of a role.
function computeGroupNarrative(profiles, names){
  const label = (i) => names[i] || `Person ${i + 1}`;
  const winnerFor = (signature) => {
    const scored = profiles.map((p, idx) => ({
      idx, score: signature.reduce((s, sig) => s + (p.normDims[sig.dim] || 0) * sig.w, 0),
    })).sort((a, b) => b.score - a.score);
    return label(scored[0].idx);
  };
  return {
    survivesLongest: winnerFor([{dim:"resilience",w:1},{dim:"emotionalStability",w:1},{dim:"adaptability",w:1}]),
    stepsUpFirst: winnerFor([{dim:"responsibility",w:1},{dim:"kindness",w:1},{dim:"risk",w:1}]),
  };
}

function computeGroupCompatibility(profiles, names){
  const n = profiles.length;
  const label = (i) => names[i] || `Person ${i + 1}`;

  const pairwise = [];
  for (let i = 0; i < n; i++){
    for (let j = i + 1; j < n; j++){
      const c = computeCompatibility(profiles[i], profiles[j]);
      pairwise.push({ i, j, nameA: label(i), nameB: label(j), score: c.relationshipScore });
    }
  }
  const overallScore = Math.round(pairwise.reduce((s,p) => s + p.score, 0) / pairwise.length);
  const sortedPairs = [...pairwise].sort((a,b) => b.score - a.score);
  const bestPair = sortedPairs[0];
  const toughestPair = sortedPairs[sortedPairs.length - 1];

  const avgDims = {};
  DIMENSIONS.forEach(d => {
    avgDims[d] = profiles.reduce((s,p) => s + (p.normDims[d] || 0), 0) / n;
  });

  const roles = profiles.map((p, idx) => {
    const diffs = DIMENSIONS.map(d => ({ d, diff: (p.normDims[d] || 0) - avgDims[d] }));
    diffs.sort((a,b) => Math.abs(b.diff) - Math.abs(a.diff));
    const top = diffs[0];
    return {
      name: label(idx),
      archetype: p.archetype,
      standoutTrait: DIM_LABELS[top.d],
      direction: top.diff >= 0 ? "more" : "less",
    };
  });

  const groupSharedStrengths = DIMENSIONS
    .filter(d => profiles.every(p => (p.normDims[d] || 0) >= 3))
    .map(d => DIM_LABELS[d]).slice(0, 5);

  const groupFriction = DIMENSIONS.map(d => {
    const vals = profiles.map(p => p.normDims[d] || 0);
    const mean = vals.reduce((a,b) => a+b, 0) / n;
    const variance = vals.reduce((s,v) => s + (v-mean)*(v-mean), 0) / n;
    return { d, variance };
  }).sort((a,b) => b.variance - a.variance).slice(0, 3).map(x => DIM_LABELS[x.d]);

  let vibe = "The Crew";
  if (avgDims.risk > 3 && avgDims.humor > 2) vibe = "Chaos Squad";
  else if (avgDims.empathy > 3 && avgDims.kindness > 2) vibe = "The Support System";
  else if (avgDims.leadership > 3) vibe = "The Council";
  else if (avgDims.creativity > 3) vibe = "The Collective";
  else if (avgDims.discipline > 3) vibe = "The Operation";

  /* ------------------- PARTY COMPARE 2.0 -------------------------------
     Everything below reads the whole group as one system rather than a
     stack of pairs: dominant type/soul, group-wide strength/blind-spot
     reads, and a set of named "team" metrics, each a simple, clearly
     labeled aggregate (an average or a spread) over normDims the group
     already has — no field here needs anything a pasted party code
     doesn't actually carry. */
  const g = (k) => pct(avgDims[k] || 0);
  const stdevPct = (dims) => {
    const vals = profiles.map(p => dims.reduce((s,d) => s + pct(p.normDims[d]||0), 0) / dims.length);
    const mean = vals.reduce((a,b)=>a+b,0) / n;
    const variance = vals.reduce((s,v) => s + (v-mean)*(v-mean), 0) / n;
    return Math.sqrt(variance);
  };

  const archCounts = {};
  profiles.forEach(p => { archCounts[p.archetype.id] = (archCounts[p.archetype.id] || 0) + 1; });
  const archOrder = Object.entries(archCounts).sort((a,b) => b[1] - a[1]);
  const dominantArchetype = archOrder[0][1] > 1
    ? { archetype: ARCHETYPES.find(a => a.id === archOrder[0][0]), count: archOrder[0][1] }
    : null;

  const souls = profiles.map(p => computeSoulType(p.normDims));
  const soulCounts = {};
  souls.forEach(s => { soulCounts[s.name] = (soulCounts[s.name] || 0) + 1; });
  const soulOrder = Object.entries(soulCounts).sort((a,b) => b[1] - a[1]);
  const dominantSoul = soulOrder[0][1] > 1
    ? { soul: souls.find(s => s.name === soulOrder[0][0]), count: soulOrder[0][1] }
    : null;

  const groupStrengths = DIMENSIONS.filter(d => avgDims[d] >= 2.5).sort((a,b) => avgDims[b]-avgDims[a]).slice(0,5).map(d => DIM_LABELS[d]);
  const groupWeaknesses = DIMENSIONS.filter(d => avgDims[d] <= -2.5).sort((a,b) => avgDims[a]-avgDims[b]).slice(0,5).map(d => DIM_LABELS[d]);
  const sharedBlindSpots = DIMENSIONS.filter(d => profiles.every(p => (p.normDims[d]||0) <= -2)).map(d => DIM_LABELS[d]).slice(0,4);

  const presentArchIds = new Set(profiles.map(p => p.archetype.id));
  const missingArchetypes = ARCHETYPES.filter(a => !presentArchIds.has(a.id)).slice(0, 5).map(a => a.name);

  // "Average Confidence" for a group: pasted party codes carry no saved
  // confidence score (only a freshly-completed quiz does), so this reads
  // as how far each person's answers sit from neutral on average — a
  // consistently available proxy for "how defined a read this is",
  // clearly labeled as such wherever it's shown rather than passed off
  // as the same confidence percentage the individual result page shows.
  const avgSignalStrength = Math.round(profiles.reduce((s,p) => {
    const vals = DIMENSIONS.map(d => Math.abs(p.normDims[d]||0));
    return s + (vals.reduce((a,b)=>a+b,0) / vals.length) / 10 * 100;
  }, 0) / n);

  const metrics = {
    creativityIndex: Math.round((g("creativity") + g("openMindedness") + g("curiosity")) / 3),
    leadershipBalance: Math.round((g("leadership") + g("confidence")) / 2),
    empathyBalance: Math.round((g("empathy") + g("kindness")) / 2),
    conflictRisk: Math.round(Math.min(100, stdevPct(["patience","trust","risk","planning","independence"]) * 2.2)),
    innovationScore: Math.round((g("creativity") + g("adaptability") + g("curiosity")) / 3),
    teamStability: Math.round((g("emotionalStability") + g("resilience") + g("discipline")) / 3),
    decisionSpeed: Math.round((g("confidence") + (100 - g("patience"))) / 2),
    socialEnergy: g("socialEnergy"),
    planningPct: Math.round((g("planning") + g("discipline")) / 2),
    riskTolerance: g("risk"),
    communicationHealth: Math.round((g("empathy") + g("socialEnergy") + g("trust")) / 3),
    groupDiversity: Math.round(Math.min(100, stdevPct(DIMENSIONS) * 2)),
    growthPotential: Math.round((g("optimism") + g("curiosity") + g("resilience")) / 3),
    avgConfidence: avgSignalStrength,
  };
  metrics.actionPct = 100 - metrics.planningPct;

  const identity = vibe;
  const report = generateGroupReport({ metrics, dominantArchetype, dominantSoul, groupStrengths, groupWeaknesses, sharedBlindSpots, overallScore, n });

  return {
    n, pairwise, overallScore, bestPair, toughestPair, roles, groupSharedStrengths, groupFriction, vibe,
    identity, dominantArchetype, dominantSoul, groupStrengths, groupWeaknesses, sharedBlindSpots, missingArchetypes,
    metrics, report, cast: computeGroupCast(profiles, names), narrative: computeGroupNarrative(profiles, names),
  };
}

const GROUP_REPORT_TEMPLATES = [
  { test: m => m.leadershipBalance >= 60 && m.teamStability <= 45, text: g => `This group has strong leadership but lacks stabilizing personalities to keep that momentum steady under pressure.` },
  { test: m => m.creativityIndex >= 60 && m.conflictRisk >= 55, text: g => `Most members approach problems creatively, but conflict resolution may become difficult once pressure builds.` },
  { test: m => m.communicationHealth >= 60 && m.groupDiversity >= 55, text: g => `Communication runs healthy here even across a genuinely diverse mix of personalities, a combination that usually takes real effort to earn.` },
  { test: m => m.socialEnergy >= 60 && m.riskTolerance >= 55, text: g => `This is a high-energy, risk-tolerant group, plans will move fast, but someone will need to occasionally ask "should we, though?"` },
  { test: m => m.socialEnergy <= 40 && m.teamStability >= 55, text: g => `A quieter, steadier group than a loud one, decisions here are more likely to be careful than fast.` },
  { test: m => m.groupDiversity <= 35, text: g => `This group thinks unusually alike for its size, which makes coordination easy but leaves real blind spots uncovered.` },
  { test: m => m.groupDiversity >= 65, text: g => `A genuinely wide spread of personalities here, that's a real asset for covering blind spots, but it also means less shared default behavior to fall back on.` },
  { test: m => m.conflictRisk >= 60, text: g => `Conflict risk runs on the higher side, mostly from real differences in trust, patience, and risk tolerance rather than personal friction.` },
  { test: m => m.growthPotential >= 60, text: g => `Individually and together, this group tends to lean into change rather than resist it.` },
];
function generateGroupReport(ctx){
  const { metrics, dominantArchetype, dominantSoul, groupStrengths, groupWeaknesses, sharedBlindSpots, overallScore, n } = ctx;
  const lines = [];
  if (dominantArchetype) lines.push(`${dominantArchetype.count} of ${n} lean toward ${dominantArchetype.archetype.name}, the closest thing this group has to a shared default.`);
  else lines.push(`No archetype repeats in this group, everyone's read as a genuinely different type.`);
  if (dominantSoul) lines.push(`${dominantSoul.count} share a ${dominantSoul.soul.name} soul type (${dominantSoul.soul.trait.toLowerCase()}).`);
  GROUP_REPORT_TEMPLATES.forEach(t => { if (lines.length < 5 && t.test(metrics)) lines.push(t.text(metrics)); });
  if (groupStrengths.length) lines.push(`As a group, ${groupStrengths.slice(0,3).join(", ")} stand out as shared strengths.`);
  if (groupWeaknesses.length) lines.push(`${groupWeaknesses.slice(0,2).join(" and ")} run low across most of the group, worth planning around rather than assuming someone else will cover it.`);
  if (sharedBlindSpots.length) lines.push(`Everyone here is quietly weaker on ${sharedBlindSpots.slice(0,2).join(" and ")}, a genuine shared blind spot, not just one person's gap.`);
  if (lines.length < 2) lines.push(overallScore >= 60 ? "Overall, this group reads as genuinely well-matched." : "Overall, this group is more a set of real differences than a single shared type, which can still work well with a little intention.");
  return lines.slice(0, 6);
}

function computeDeepCompatibility(profileA, profileB, nameA, nameB){
  const a = profileA.normDims, b = profileB.normDims;
  const base = computeCompatibility(profileA, profileB);
  const categories = COMPATIBILITY_CATEGORIES.map(cat => ({
    name: cat.name,
    score: scoreCategory(cat, a, b),
  })).sort((x,y) => y.score - x.score);
  const explanations = generateCompatibilityExplanations(a, b, nameA, nameB);
  const whoComparisons = computeWhoComparisons(a, b, nameA, nameB);
  const activities = computePerfectActivities(a, b);
  const funFacts = [
    `What ${nameA || "Person A"} could secretly admire about ${nameB || "Person B"}: their ${DIM_LABELS[Object.keys(b).sort((x,y)=>(b[y]||0)-(b[x]||0))[0]]}.`,
    `What ${nameB || "Person B"} could teach ${nameA || "Person A"}: how they handle ${DIM_LABELS[Object.keys(b).sort((x,y)=>(b[y]||0)-(b[x]||0))[0]]}.`,
    `What makes this pairing unique: ${base.sharedStrengths.length ? "a real overlap in " + base.sharedStrengths.slice(0,2).join(" and ") : "how differently you each approach the same situations"}.`,
  ];
  return { ...base, categories, explanations, whoComparisons, activities, funFacts };
}

/* -------------------------------------------------------------------------
   COMPARE 2.0
   Everything computeDeepCompatibility doesn't already cover: a fixed
   Overview scorecard (COMPARE_OVERVIEW_METRICS, read straight off the
   categories list computeDeepCompatibility already scored, so the two
   never disagree), a side-by-side "Layer Comparison" pulling from fields
   that already exist per-profile (archetype narrative fields, soul type,
   sin/virtue, thinking/decision profiles, fun stats — nothing here is
   newly authored data, just newly paired up), and a generic per-dimension
   agree/disagree/balance pass that replaces "just a percentage" with an
   actual reason, built from the same normDims two profiles already carry.
------------------------------------------------------------------------- */
function computeCompareOverview(categories){
  const byName = {};
  categories.forEach(c => { byName[c.name] = c.score; });
  return COMPARE_OVERVIEW_METRICS.map(m => ({ label: m.label, score: byName[m.category] || 0 }));
}

// Friction-prone dims: a large gap here is worth calling out as a real
// conflict risk, not just "a difference" — these are the defaults people
// actually clash over day to day, not e.g. a harmless creativity gap.
const CONFLICT_RISK_DIMS = new Set(["patience","trust","risk","planning","independence","emotionalStability","responsibility"]);

function computeAgreementMap(a, b, nameA, nameB){
  const A = nameA || "Person A", B = nameB || "Person B";
  const rows = DIMENSIONS.map(d => {
    const av = a[d] || 0, bv = b[d] || 0;
    return {
      d, av, bv, gap: av - bv,
      bothStrongSame: Math.abs(av) >= 3 && Math.abs(bv) >= 3 && Math.sign(av) === Math.sign(bv) && av !== 0,
      opposite: Math.sign(av) !== Math.sign(bv) && Math.abs(av) >= 2 && Math.abs(bv) >= 2,
    };
  });

  const agree = rows.filter(r => r.bothStrongSame)
    .sort((x, y) => Math.min(Math.abs(y.av), Math.abs(y.bv)) - Math.min(Math.abs(x.av), Math.abs(x.bv)))
    .slice(0, 4)
    .map(r => ({ dim: r.d, label: DIM_LABELS[r.d],
      text: `${A} and ${B} both lean strongly toward ${DIM_LABELS[r.d].toLowerCase()}, so this rarely needs negotiating, it's just how you both already operate.` }));

  const disagree = rows.filter(r => r.opposite && Math.abs(r.gap) >= 5)
    .sort((x, y) => Math.abs(y.gap) - Math.abs(x.gap))
    .slice(0, 4)
    .map(r => {
      const leader = r.av > r.bv ? A : B, other = leader === A ? B : A;
      return { dim: r.d, label: DIM_LABELS[r.d],
        text: `${leader} leans one way on ${DIM_LABELS[r.d].toLowerCase()} while ${other} leans the opposite, a real difference in default setting, worth naming directly rather than assuming it'll just resolve itself.`,
        conflictRisk: CONFLICT_RISK_DIMS.has(r.d) };
    });

  const balance = rows.filter(r => !r.opposite && !r.bothStrongSame && Math.abs(r.gap) >= 5)
    .sort((x, y) => Math.abs(y.gap) - Math.abs(x.gap))
    .slice(0, 4)
    .map(r => {
      const higher = r.av > r.bv ? A : B, lower = higher === A ? B : A;
      return { dim: r.d, label: DIM_LABELS[r.d],
        text: `${higher} carries more ${DIM_LABELS[r.d].toLowerCase()} than ${lower} does, so ${lower} can lean on ${higher} here rather than trying to match it, a complementary strength, not a gap to close.` };
    });

  return { agree, disagree, balance, conflictAreas: disagree.filter(r => r.conflictRisk) };
}

// What each person brings that the other is comparatively lighter on: the
// two dims where they most exceed the other, one-directional (unlike
// computeAgreementMap's balance list, which is symmetric).
function computeWhatEachBrings(a, b, nameA, nameB){
  const bringsFor = (self, other) => DIMENSIONS
    .map(d => ({ d, gap: (self[d]||0) - (other[d]||0) }))
    .sort((x, y) => y.gap - x.gap)
    .slice(0, 2)
    .filter(r => r.gap >= 3)
    .map(r => DIM_LABELS[r.d]);
  return {
    a: { name: nameA || "Person A", traits: bringsFor(a, b) },
    b: { name: nameB || "Person B", traits: bringsFor(b, a) },
  };
}

function topVirtues(sinVirtue){
  return [...sinVirtue].sort((x, y) => y.virtuePct - x.virtuePct).slice(0, 3).map(v => v.virtueLabel);
}
function topTendencies(normDims){
  return DIMENSIONS.map(d => ({ d, v: normDims[d] || 0 }))
    .sort((x, y) => Math.abs(y.v) - Math.abs(x.v)).slice(0, 3)
    .map(r => DIM_LABELS[r.d]);
}
const COMPARE_FUN_STAT_KEYS = ["Aura", "Rizz", "Charisma", "Chaos", "Main Character Energy", "Adventure"];

// Emotion-relevant subset of the 25 dims, used by Compare 2.0's "Emotion
// Radar" (a second, narrower overlay chart than the full "Mind Map" one).
const EMOTION_RADAR_DIMS = ["empathy","emotionalStability","optimism","trust","kindness","socialEnergy","humor","resilience","selfAwareness"];

// Deliberately re-derives everything from normDims via the same compute*()
// functions the result page uses, rather than reading precomputed fields
// (.soul, .sinVirtue, .funStats, ...) off profileA/profileB — a pasted
// Compare code only ever decodes to { archetype, normDims, name, version },
// never the full extras bundle a freshly computed result carries, so this
// has to work from normDims alone to be correct on every call site.
function computeCompareLayers(profileA, archA, profileB, archB, nameA, nameB){
  const a = profileA.normDims, b = profileB.normDims;
  const A = nameA || "Person A", B = nameB || "Person B";
  const pair = (av, bv) => ({ a: av, b: bv });
  const soulA = computeSoulType(a), soulB = computeSoulType(b);
  const sinVirtueA = computeSinVirtueProfile(a), sinVirtueB = computeSinVirtueProfile(b);
  const funStatsA = computeFunStats(a), funStatsB = computeFunStats(b);
  const relA = computeRelationshipProfile(a), relB = computeRelationshipProfile(b);
  const decA = computeDecisionProfile(a), decB = computeDecisionProfile(b);
  const thinkA = computeThinkingProfile(a), thinkB = computeThinkingProfile(b);
  return {
    archetype: pair({ name: archA.name, icon: archA.icon }, { name: archB.name, icon: archB.icon }),
    soul: pair(soulA, soulB),
    topVirtues: pair(topVirtues(sinVirtueA), topVirtues(sinVirtueB)),
    topTendencies: pair(topTendencies(a), topTendencies(b)),
    funStats: COMPARE_FUN_STAT_KEYS.map(k => ({ label: k, a: funStatsA[k], b: funStatsB[k] })),
    strengths: pair(archA.strengths, archB.strengths),
    weaknesses: pair(archA.weaknesses, archB.weaknesses),
    stressResponse: pair(archA.stressResponse, archB.stressResponse),
    leadershipStyle: pair(archA.leadershipStyle, archB.leadershipStyle),
    learningStyle: pair(archA.learningStyle, archB.learningStyle),
    workStyle: pair(archA.workStyle, archB.workStyle),
    communicationStyle: pair(archA.communicationStyle, archB.communicationStyle),
    growthAdvice: pair(archA.growthAdvice, archB.growthAdvice),
    relationshipStyle: pair(relA.relationshipDynamic, relB.relationshipDynamic),
    decisionStyle: pair(decA[0].name, decB[0].name),
    thinkingStyle: pair(thinkA[0].name, thinkB[0].name),
    agreement: computeAgreementMap(a, b, A, B),
    brings: computeWhatEachBrings(a, b, A, B),
  };
}

/* =========================================================================
   PF4 ADDITIONS: Pattern Memory & Cross-Dimension Insights (Priorities 6-7)

   The result engine should explain a person by the THEMES that recurred
   across many unrelated situations, not by grading individual answers.
   Every option already carries reveals[]: 3 short, present-tense
   behavioral-pattern phrases drawn from a shared ~84-phrase vocabulary
   (see the DIM_REVEALS table used to author them), specifically so the
   SAME phrase can legitimately recur across totally different questions
   -- a moral dilemma and a fun hypothetical can both reveal "chooses the
   less certain, more interesting path" without that being a coincidence.
   computeBehavioralPatterns() tallies which phrases actually recurred
   for THIS person's real answers, requires at least 3 different
   questions from at least 2 different categories to agree (so it's a
   real cross-situation theme, not one heavy question's phrasing quirk),
   and turns the survivors into natural "across several situations, you
   repeatedly..." sentences via REVEAL_PAST_TENSE below. ------------------ */

// Only the ~50 first words that actually appear in the reveals vocabulary
// need converting; everything else in a phrase is left untouched other
// than the pronoun swaps applied globally below.
const VERB_PAST_TENSE = {
  Accepts:"Accepted", Acts:"Acted", Adjusts:"Adjusted", Backs:"Backed", Builds:"Built",
  Changes:"Changed", Chooses:"Chose", "Doesn't":"Didn't", Draws:"Drew", Expects:"Expected",
  Extends:"Extended", Feels:"Felt", Finds:"Found", Follows:"Followed", Frames:"Framed",
  Gives:"Gave", Holds:"Held", Improvises:"Improvised", Keeps:"Kept", Knows:"Knew",
  Leans:"Leaned", Lets:"Let", Measures:"Measured", Moves:"Moved", Names:"Named",
  Notices:"Noticed", Prefers:"Preferred", Prepares:"Prepared", Prioritizes:"Prioritized",
  Protects:"Protected", Pushes:"Pushed", Reaches:"Reached", Reads:"Read", Reasons:"Reasoned",
  Reconsiders:"Reconsidered", Recovers:"Recovered", Relies:"Relied",
  "Second-guesses":"Second-guessed", Sees:"Saw", Softens:"Softened", Stays:"Stayed",
  Steps:"Stepped", Structures:"Structured", Takes:"Took", Tolerates:"Tolerated",
  Treats:"Treated", Trusts:"Trusted", Uses:"Used", Withholds:"Withheld",
};

// Converts one reveals phrase (present-tense, third-person, e.g. "Backs
// their own judgment under pressure") into a past-tense, second-person
// clause fit for "Across several situations, you repeatedly ___"
// ("backed your own judgment under pressure").
function revealToPastTenseClause(phrase){
  const words = phrase.split(" ");
  const verb = VERB_PAST_TENSE[words[0]] || words[0];
  words[0] = verb;
  let s = words.join(" ");
  s = s.replace(/\btheir own\b/g, "your own")
       .replace(/\bthemselves\b/g, "yourself")
       .replace(/\bthey're\b/g, "you're");
  return s.charAt(0).toLowerCase() + s.slice(1);
}

/* Finds reveals phrases that recurred across at least 3 different
   answers spanning at least 2 different question categories -- a real,
   repeated theme rather than one question's specific framing. Returns
   up to 4, ranked by how often they recurred, each as a ready-to-display
   sentence plus the raw phrase/count for anything that wants the data
   instead of the prose. */
function computeBehavioralPatterns(session){
  if (!session || !session.answers) return [];
  const counts = new Map(); // phrase -> { count, categories:Set, questionIds:Set }
  session.answers.forEach(a => {
    if (!a || !a.reveals) return;
    a.reveals.forEach(phrase => {
      if (!counts.has(phrase)) counts.set(phrase, { count:0, categories:new Set(), questionIds:new Set() });
      const entry = counts.get(phrase);
      entry.count++;
      entry.categories.add(a.questionType || a.cluster);
      entry.questionIds.add(a.questionId);
    });
  });
  const patterns = [];
  counts.forEach((entry, phrase) => {
    if (entry.questionIds.size >= 3 && entry.categories.size >= 2){
      patterns.push({ phrase, count: entry.questionIds.size, categories: entry.categories.size,
        sentence: `Across ${entry.questionIds.size} different, mostly unrelated situations, you repeatedly ${revealToPastTenseClause(phrase)}.` });
    }
  });
  patterns.sort((a,b) => b.count - a.count || b.categories - a.categories);
  return patterns.slice(0, 4);
}

/* ---- Cross-dimension insights (Priority 7) -------------------------------
   Some of the most interesting things about a person aren't a single
   high or low score, it's two traits that don't usually travel together
   showing up at once. Each rule below names a real tension using the
   session's own normalized dims, only firing when both sides are
   genuinely present (not just "not opposite"), so these read as
   observations earned by the actual answers, not a fixed list applied
   to everyone. */
const CROSS_DIMENSION_INSIGHTS = [
  { a:"empathy", b:"trust", dir:[1,-1], text:"You read other people's feelings closely, but that doesn't automatically translate into trusting them, you extend understanding and caution at the same time." },
  { a:"confidence", b:"emotionalStability", dir:[1,-1], text:"You back your own judgment readily, but that confidence doesn't come with an unshakeable calm underneath it, the two run on separate tracks for you." },
  { a:"curiosity", b:"risk", dir:[1,-1], text:"You're genuinely pulled toward the unknown, but not toward the danger that sometimes comes with it, your curiosity and your caution have learned to coexist." },
  { a:"kindness", b:"trust", dir:[1,-1], text:"You extend real warmth to people even when you haven't fully decided to trust them, kindness for you isn't conditional on certainty." },
  { a:"independence", b:"kindness", dir:[1,1], text:"You value self-reliance and warmth toward others at the same time, in you, independence isn't the same thing as distance." },
  { a:"openMindedness", b:"discipline", dir:[1,1], text:"You hold real personal standards while staying genuinely open to being wrong, conviction and flexibility aren't in tension for you the way they are for most people." },
  { a:"leadership", b:"patience", dir:[1,1], text:"You're willing to take charge, but not in a hurry to, your leadership comes with more patience than the stereotype usually allows." },
  { a:"competitiveness", b:"kindness", dir:[1,1], text:"You track whether you're winning and still lead with warmth toward the people you're winning against, those two rarely sit together this comfortably." },
  { a:"resilience", b:"emotionalStability", dir:[1,-1], text:"You recover from setbacks quickly, but that doesn't mean they don't land hard on the way through, your resilience is earned, not automatic." },
  { a:"planning", b:"adaptability", dir:[1,1], text:"You like real structure and you change course easily when the structure stops fitting, for you those aren't opposites." },
];

function computeCrossDimensionInsights(normDims){
  const THRESHOLD = 3; // normDims run roughly -10..10; needs a real lean, not noise
  const insights = [];
  CROSS_DIMENSION_INSIGHTS.forEach(rule => {
    const av = normDims[rule.a] || 0, bv = normDims[rule.b] || 0;
    const aOk = rule.dir[0] > 0 ? av >= THRESHOLD : av <= -THRESHOLD;
    const bOk = rule.dir[1] > 0 ? bv >= THRESHOLD : bv <= -THRESHOLD;
    if (aOk && bOk) insights.push({ a:rule.a, b:rule.b, text:rule.text });
  });
  return insights.slice(0, 3);
}

/* =========================================================================
   V4 ADDITIONS
   Consistency check, framework approximations, duo titles, and the
   remaining fantasy/fun profile extras.
   ========================================================================= */

/* ---- Consistency check ---------------------------------------------------
   Only counts pairs where both questions actually got asked in this run,
   since the adaptive engine won't hit every pair every time. Two answers
   "agree" if they moved their shared dimension in the same direction.
   Falls back to a neutral baseline when too few pairs were asked to say
   anything meaningful. */
function computeConsistency(session){
  const answeredById = {};
  session.answers.forEach(a => { if (a) answeredById[a.questionId] = a; });
  let agree = 0, total = 0;
  CONSISTENCY_PAIRS.forEach(pair => {
    const a = answeredById[pair.a], b = answeredById[pair.b];
    if (!a || !b) return;
    const av = a.d[pair.dim] || 0, bv = b.d[pair.dim] || 0;
    if (av === 0 || bv === 0) return;
    total++;
    if ((av > 0) === (bv > 0)) agree++;
  });
  if (total < 2){
    return { pct: 88, pairsChecked: total, note: "Not enough overlapping situations were asked this run to measure it precisely, this is a typical baseline." };
  }
  const pct = Math.round((agree / total) * 100);
  return { pct, pairsChecked: total, note: `Based on ${total} pair${total === 1 ? "" : "s"} of separate situations that touch similar ground.` };
}

/* ---- Framework approximations (secondary to the PersonaForge archetype) - */
function computeBigFive(normDims){
  return BIG_FIVE_CATEGORIES.map(c => {
    const vals = c.dims.map(d => c.invert ? (100 - getDimensionPercent(normDims,d)) : getDimensionPercent(normDims,d));
    return { name: c.name, pct: Math.round(vals.reduce((s,v)=>s+v,0) / vals.length) };
  });
}
function computeDISC(normDims){
  const raw = DISC_CATEGORIES.map(c => ({
    name: c.name,
    val: c.dims.reduce((s,d) => s + getDimensionPercent(normDims,d), 0) / c.dims.length,
  }));
  const total = raw.reduce((s,r)=>s+r.val,0) || 1;
  return raw.map(r => ({ name: r.name, pct: Math.round((r.val/total)*100) })).sort((a,b)=>b.pct-a.pct);
}
function computeEnneagram(normDims){
  return scoreBySignature(ENNEAGRAM_TYPES, normDims)[0].item;
}
function computeMBTI(normDims){
  let type = "";
  MBTI_AXES.forEach(axis => {
    const posSum = axis.posDims.reduce((s,d) => s + getDimensionScore(normDims,d), 0);
    const negSum = axis.negDims.reduce((s,d) => s + getDimensionScore(normDims,d), 0);
    const positive = (posSum - negSum) >= 0;
    type += positive ? axis.letters[0] : axis.letters[1];
  });
  return type;
}

/* =========================================================================
   FRAMEWORKS DEEP DIVE (frameworks.html)
   The compact framework card on the result page already shows the MBTI
   type, Enneagram type, and DISC/Big Five bars — this expands the exact
   same computed numbers (nothing here is a second scoring system) into a
   full per-letter/per-trait breakdown with real strength percentages and
   plain-language explanations, for the "read the whole thing" crowd.
   Every one of these frameworks is explicitly a Forge-generated
   projection, not a licensed or certified instrument (see legal.html's
   disclaimer) — the explanations below keep that framing rather than
   presenting it as clinical fact.
   ========================================================================= */
const MBTI_LETTER_MEANINGS = {
  E: "Energized by people and external activity, thinks out loud, recharges by being around others.",
  I: "Energized by solitude and internal reflection, thinks things through before speaking, recharges alone.",
  N: "Drawn to patterns, possibilities, and the abstract over the immediate and concrete.",
  S: "Grounded in the concrete and the present, trusts direct experience over speculation.",
  F: "Decides by weighing people and values, asks who a decision actually affects.",
  T: "Decides by weighing logic and consistency, asks whether a decision actually holds up.",
  P: "Keeps options open, comfortable improvising, prefers flexibility to a fixed plan.",
  J: "Prefers a decided plan, comfortable committing early, prefers structure to open-endedness.",
};
function computeMBTIBreakdown(normDims){
  return MBTI_AXES.map(axis => {
    const posSum = axis.posDims.reduce((s,d) => s + getDimensionScore(normDims,d), 0);
    const negSum = axis.negDims.reduce((s,d) => s + getDimensionScore(normDims,d), 0);
    const maxPossible = (axis.posDims.length + axis.negDims.length) * 10 || 10;
    const diff = posSum - negSum;
    const strengthPct = Math.max(0, Math.min(100, Math.round(((diff + maxPossible) / (2 * maxPossible)) * 100)));
    const letter = diff >= 0 ? axis.letters[0] : axis.letters[1];
    return { letter, otherLetter: diff >= 0 ? axis.letters[1] : axis.letters[0], strengthPct: diff >= 0 ? strengthPct : 100 - strengthPct, meaning: MBTI_LETTER_MEANINGS[letter] };
  });
}

const BIG_FIVE_EXPLANATIONS = {
  Openness: { high: "Curious and drawn to new ideas, art, and unfamiliar experience over the tried-and-true.", low: "Prefers the familiar and proven over novelty for its own sake." },
  Conscientiousness: { high: "Organized, follows through, comfortable with structure and long-term commitments.", low: "Improvises well, resists over-planning, comfortable leaving things loosely structured." },
  Extraversion: { high: "Draws energy from people and activity, comfortable being the center of a room.", low: "Draws energy from quiet and solitude, prefers smaller, calmer settings." },
  Agreeableness: { high: "Cooperative and trusting by default, prioritizes harmony and other people's comfort.", low: "Direct and skeptical by default, prioritizes honesty over smoothing things over." },
  Neuroticism: { high: "Feels emotional shifts vividly and quickly, more reactive to stress in the moment.", low: "Emotionally steady under pressure, slower to react, harder to rattle." },
};
function computeBigFiveBreakdown(normDims){
  return computeBigFive(normDims).map(t => ({
    ...t,
    explanation: t.pct >= 55 ? BIG_FIVE_EXPLANATIONS[t.name].high : t.pct <= 45 ? BIG_FIVE_EXPLANATIONS[t.name].low : "Sits close to the middle here, genuinely situational rather than a strong lean either way.",
  }));
}

const DISC_EXPLANATIONS = {
  "D, Dominance": "Direct, results-focused, comfortable taking charge and pushing for a decision.",
  "I, Influence": "Persuasive and social, moves people through enthusiasm and connection rather than authority.",
  "S, Steadiness": "Steady and cooperative, prefers consistency and dislikes sudden, forced change.",
  "C, Conscientiousness": "Careful and precise, prioritizes accuracy and doing it right over doing it fast.",
};
function computeDISCBreakdown(normDims){
  const ranked = computeDISC(normDims);
  return ranked.map((d, i) => ({ ...d, explanation: DISC_EXPLANATIONS[d.name], isPrimary: i === 0 }));
}

const ENNEAGRAM_EXPLANATIONS = {
  "Type 1, The Reformer": "Principled and improvement-driven, holds itself (and often others) to a real standard.",
  "Type 2, The Helper": "Relationship-focused and generous, finds meaning in being genuinely needed.",
  "Type 3, The Achiever": "Driven by visible success and momentum, uncomfortable standing still.",
  "Type 4, The Individualist": "Identity-driven and introspective, wants to feel genuinely distinct, not interchangeable.",
  "Type 5, The Investigator": "Knowledge-driven and self-contained, needs to actually understand something before engaging.",
  "Type 6, The Loyalist": "Security-driven and loyal, plans for what could go wrong before it happens.",
  "Type 7, The Enthusiast": "Possibility-driven and upbeat, allergic to boredom and closed doors.",
  "Type 8, The Challenger": "Control-driven and assertive, uncomfortable being vulnerable or pushed around.",
  "Type 9, The Peacemaker": "Harmony-driven and easygoing, avoids conflict and forced confrontation when it can.",
};
function computeEnneagramBreakdown(normDims){
  const ranked = scoreBySignature(ENNEAGRAM_TYPES, normDims);
  return {
    core: ranked[0].item, coreExplanation: ENNEAGRAM_EXPLANATIONS[ranked[0].item.name],
    wing: ranked[1].item, wingExplanation: ENNEAGRAM_EXPLANATIONS[ranked[1].item.name],
  };
}

function computeFrameworksDeepDive(normDims){
  return {
    mbti: { type: computeMBTI(normDims), axes: computeMBTIBreakdown(normDims) },
    bigFive: computeBigFiveBreakdown(normDims),
    disc: computeDISCBreakdown(normDims),
    enneagram: computeEnneagramBreakdown(normDims),
  };
}
/* -------------------------------------------------------------------------
   ALGORITHM: Human Values
   Scores every value in HUMAN_VALUES the same way archetype matching
   scores a signature: weighted sum over the relevant dimensions,
   normalized against the maximum that signature could possibly reach
   (so a value with a heavier signature isn't unfairly favored), returns
   the top 5. Each result carries which measured dimensions it came from
   and their actual values, so the explanation can point at real
   evidence instead of a generic sentence. */
function computeHumanValues(normDims){
  const scored = HUMAN_VALUES.map(v => {
    const raw = v.signature.reduce((s,x) => s + getDimensionScore(normDims, x.dim) * x.w, 0);
    const maxPossible = v.signature.reduce((s,x) => s + 10 * x.w, 0);
    const pct = Math.max(0, Math.min(100, Math.round(((raw + maxPossible) / (2 * maxPossible)) * 100)));
    const topDim = [...v.signature].sort((a,b) => Math.abs(getDimensionScore(normDims,b.dim)) - Math.abs(getDimensionScore(normDims,a.dim)))[0];
    return { value: v, pct, topDim: topDim.dim, topDimPct: getDimensionPercent(normDims, topDim.dim) };
  });
  scored.sort((a,b) => b.pct - a.pct);
  return scored.slice(0, 5).map(s => ({
    id: s.value.id, name: s.value.name, icon: s.value.icon, pct: s.pct,
    explanation: `${s.pct}% reflects ${s.value.why}, most visibly in your ${DIM_LABELS[s.topDim]} (${s.topDimPct}%).`,
    inferredFrom: s.value.signature.map(x => DIM_LABELS[x.dim]),
  }));
}

/* -------------------------------------------------------------------------
   ALGORITHM: Seven Sins / Heavenly Virtues (fun, non-serious)
   Each of the 7 axes is one measured dimension read two directions.
   Nothing is recomputed between modes, the same normDims values just get
   read as either the sin-side or virtue-side percentage depending on
   sinIsHigh, so "only the interpretation changes" holds literally, not
   just in spirit. */
function computeSinVirtueProfile(normDims){
  return SIN_VIRTUE_AXES.map(axis => {
    const raw = getDimensionPercent(normDims, axis.dim);
    const sinPct = axis.sinIsHigh ? raw : 100 - raw;
    const virtuePct = 100 - sinPct;
    return { dim: axis.dim, sinLabel: axis.sinLabel, virtueLabel: axis.virtueLabel, sinPct, virtuePct };
  });
}

function computeFrameworkApproximations(normDims){
  return {
    bigFive: computeBigFive(normDims),
    disc: computeDISC(normDims),
    enneagram: computeEnneagram(normDims),
    mbti: computeMBTI(normDims),
  };
}

/* ---- Duo title and crest for the compare page ----------------------------- */
function computeDuoTitle(archA, archB){
  const extrasA = getArchetypeExtras(archA), extrasB = getArchetypeExtras(archB);
  const key1 = `${extrasA.element}|${extrasB.element}`;
  const key2 = `${extrasB.element}|${extrasA.element}`;
  const title = DUO_TITLES[key1] || DUO_TITLES[key2] || `${archA.name.replace("The ","")} & ${archB.name.replace("The ","")}`;
  return { title, colorA: extrasA.primaryColor, colorB: extrasB.primaryColor, iconA: archA.icon, iconB: archB.icon };
}

/* ---- Fantasy and fun profile extras ---------------------------------------- */
function computeFantasyWeapon(normDims){ return scoreBySignature(FANTASY_WEAPONS, normDims)[0].item; }
function computeFantasyCompanion(normDims){ return scoreBySignature(FANTASY_COMPANIONS, normDims)[0].item; }
function computeFantasyKingdom(normDims){ return scoreBySignature(FANTASY_KINGDOMS, normDims)[0].item; }
function computeFlower(normDims){ return scoreBySignature(FLOWERS, normDims)[0].item; }
function computePlanet(normDims){ return scoreBySignature(PLANETS, normDims)[0].item; }
function computeConstellation(normDims){ return scoreBySignature(CONSTELLATIONS, normDims)[0].item; }
function computeGemstone(normDims){ return scoreBySignature(GEMSTONES, normDims)[0].item; }
function computeWeather(normDims){ return scoreBySignature(WEATHER_TYPES, normDims)[0].item; }
function computeCoffeeOrder(normDims){ return scoreBySignature(COFFEE_ORDERS, normDims)[0].item; }

/* ---------------- QUIZ PROGRESS PERSISTENCE ------------------------------
   Going home mid-quiz (or just closing the tab) never throws answers away.
   Progress is saved to localStorage and picked back up on the exact next
   unanswered question, not restarted from scratch. */
const QUIZ_PROGRESS_KEY = "pf_quiz_progress";
function saveQuizProgress(){
  if (!session || session.cursor <= 0 || session.isComplete()) return;
  try{ localStorage.setItem(QUIZ_PROGRESS_KEY, JSON.stringify(session.serialize())); }
  catch(e){ /* storage unavailable, skip silently */ }
}
function getSavedQuizProgress(){
  try{
    const raw = localStorage.getItem(QUIZ_PROGRESS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch(e){ return null; }
}
function clearQuizProgress(){
  try{ localStorage.removeItem(QUIZ_PROGRESS_KEY); } catch(e){ /* ignore */ }
}

/* ---------------- ONBOARDING PROGRESS PERSISTENCE ------------------------
   Mirrors QUIZ_PROGRESS_KEY above: a refresh mid-onboarding (name / about
   you / your experience) should never reset the wizard back to step 1.
   Cleared the moment the actual quiz starts (startQuiz() -> clearQuizProgress
   already runs alongside it) since at that point the real quiz-progress
   key takes over as the thing worth resuming. */
const ONBOARDING_PROGRESS_KEY = "pf_onboarding_progress";
function saveOnboardingProgress(step, name, meta){
  try{ localStorage.setItem(ONBOARDING_PROGRESS_KEY, JSON.stringify({ step, name: name || "", meta: meta || {}, savedAt: Date.now() })); }
  catch(e){ /* storage unavailable, skip silently */ }
}
function getSavedOnboardingProgress(){
  try{
    const raw = localStorage.getItem(ONBOARDING_PROGRESS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch(e){ return null; }
}
function clearOnboardingProgress(){
  try{ localStorage.removeItem(ONBOARDING_PROGRESS_KEY); } catch(e){ /* ignore */ }
}

/* ---------------- shareable profile links --------------------------------
   The QR already encodes a URL with ?code=..., but until now nothing on
   load ever read that parameter back out, so scanning it just opened a
   blank landing page. This closes that loop: on boot, and whenever a
   result is shown, the address bar carries the code, so the QR, a copied
   link, and the browser's own URL bar are all the same shareable thing.
   Query-param format (?code=...) is the primary, fully-supported form
   since it works on any static host with zero extra setup. A trailing
   path segment that looks like a code (e.g. /PersonaForge/Yota-PF4-...)
   is also read as a best-effort fallback, but actually serving that path
   on GitHub Pages needs a 404->index.html redirect set up in the repo;
   without it, only the ?code= form will reach the app at all.
   Version-agnostic regex on purpose -- a literal /-PF[12]-/ here was a
   real bug found in the PF4 QA pass: it silently failed to recognize any
   PF4 code arriving via a bookmarked/shared path-segment URL. */
function getProfileCodeFromURL(){
  const params = new URLSearchParams(location.search);
  // URLSearchParams.get() has already percent-decoded this. It used to be
  // run through decodeURIComponent() a second time, which throws an
  // uncaught URIError on any value containing a literal "%" (e.g.
  // ?code=abc%25) -- a blank page from a link someone could type by hand.
  const fromQuery = params.get("code");
  if (fromQuery) return fromQuery;
  const segments = location.pathname.split("/").filter(Boolean);
  const last = segments[segments.length - 1] || "";
  if (/-PF\d+-/.test(last)){
    try { return decodeURIComponent(last); } catch(e){ return last; }
  }
  return null;
}

function setShareableURL(code){
  if (!code || !window.history || !history.replaceState) return;
  const url = new URL(location.href);
  url.search = "";
  url.searchParams.set("code", code);
  // Rewrites THIS page's own entry (the result you are looking at) instead of stacking a new one on every render, so Back from a
  // result leaves the result rather than stepping through copies of it.
  if (url.toString() !== location.href) history.replaceState({ code }, "", url.toString());
}

function clearShareableURL(){
  if (!window.history || !history.pushState) return;
  const url = new URL(location.href);
  url.search = "";
  history.pushState({}, "", url.toString());
}

let pendingSharedCode = null;
let pendingSharedProfile = null;

function tryLoadProfileFromURL(){
  const code = getProfileCodeFromURL();
  if (!code) return false;
  const decoded = decodeCode(code);
  if (!decoded) return false;
  pendingSharedCode = code;
  pendingSharedProfile = decoded;
  renderSharedLinkInterstitial();
  return true;
}

/* =========================================================================
   FORGE - RESULT BUILDING
   Used both for a freshly completed quiz and for viewing a shared/saved
   code: builds the full profile-extras bundle and the final result
   object, plus the small local history log.
   ========================================================================= */
function buildProfileExtras(normDims, archetype, ranked, session){
  return {
    mix: computePersonalityMix(ranked),
    soul: computeSoulType(normDims),
    humanValues: computeHumanValues(normDims),
    lifeBalance: computeLifeBalance(normDims),
    motivationFacets: computeMotivationFacets(normDims),
    sinVirtue: computeSinVirtueProfile(normDims),
    narrativeRole: computeNarrativeRole(normDims),
    identityTagline: computeIdentityTagline(normDims),
    contradictions: computeContradictions(normDims),
    atlas: computeAtlasMatch(normDims),
    social: computeSocialProfile(normDims),
    relationship: computeRelationshipProfile(normDims),
    thinking: computeThinkingProfile(normDims),
    learning: computeLearningProfile(normDims),
    decision: computeDecisionProfile(normDims),
    stress: computeStressResponses(normDims),
    environments: computeEnvironments(normDims),
    achievements: computeAchievements(normDims),
    aesthetic: computeAesthetic(normDims),
    entertainment: computeEntertainment(normDims),
    extras: getArchetypeExtras(archetype),
    funStats: computeFunStats(normDims),
    confidence: computeAssessmentConfidence(ranked, normDims, session),
    hidden: computeHiddenTraits(normDims, archetype),
    fantasyRole: computeFantasyRole(normDims),
    friendship: computeFriendshipProfile(normDims),
    motivation: computeMotivation(normDims),
    mythicalCreature: computeMythicalCreature(normDims),
    season: computeSeason(normDims),
    timeOfDay: computeTimeOfDay(normDims),
    chessPiece: computeChessPiece(normDims),
    frameworks: computeFrameworkApproximations(normDims),
    fantasyWeapon: computeFantasyWeapon(normDims),
    fantasyCompanion: computeFantasyCompanion(normDims),
    fantasyKingdom: computeFantasyKingdom(normDims),
    flower: computeFlower(normDims),
    planet: computePlanet(normDims),
    constellation: computeConstellation(normDims),
    gemstone: computeGemstone(normDims),
    weather: computeWeather(normDims),
    coffeeOrder: computeCoffeeOrder(normDims),
    behavioralPatterns: computeBehavioralPatterns(session),
    crossDimensionInsights: computeCrossDimensionInsights(normDims),
  };
}

/* Takes the session explicitly (rather than reading a global) since this
   runs on quiz.html, where the quiz session lives, and its result then
   travels to result.html for display. */
function computeResult(session){
  const normDims = session.normalizedDims();
  const match = matchArchetype(normDims);
  const resultDepth = (session.meta && session.meta.resultDepth) || PACE_TO_DEPTH[session.pace] || "balanced";
  const code = encodeCode(match.primary.id, normDims, session.name, resultDepth);
  const result = {
    name: session.name || "",
    // Written back explicitly (not just spread from session.meta) so the
    // rendered report's depth-gating and the code's own encoded depth
    // digit can never silently disagree -- both trace back to this one
    // resolved `resultDepth`, not two independently-defaulted copies.
    meta: { ...(session.meta || {}), resultDepth },
    normDims,
    archetype: match.primary,
    runnerUp: match.runnerUp,
    ranked: match.ranked,
    subProfile: computeSubProfile(normDims, match.primary),
    code,
    careers: computeCareers(normDims),
    relationships: computeRelationshipStyles(normDims),
    traits: computeMeasuredTraits(normDims),
    consistency: computeConsistency(session),
    // Real count, not an estimate -- the Confidence Engine (v1.7) wants
    // genuine evidence ("1,900 answered questions"), not a guess derived
    // from pace/depth after the fact.
    questionCount: session.cursor,
    dimConfidence: (() => {
      if (session.targeted && typeof Forge !== "undefined" && Forge.retake) return Forge.retake.blendConfidence(session);
      const o = {}; DIMENSIONS.forEach(d => { o[d] = getDimensionConfidence(session, d); }); return o;
    })(),
    assessmentKind: session.assessmentKind || "full",
    questionIds: (session.plan || []).slice(0, session.cursor).map(q => q && q.id).filter(Boolean),
    ...buildProfileExtras(normDims, match.primary, match.ranked, session),
  };
  if (session.targeted && typeof Forge !== "undefined" && Forge.retake){
    result.confidence = Forge.retake.finalizeConfidence(session, result.confidence);
  }
  localStorage.setItem("pf_last_code", code);
  saveToTimeline(result);
  ensureLocalProfile(result);
  clearQuizProgress();
  return result;
}

/* ---------------- LOCAL PROFILE ------------------------------------------
   The "identity hub" behind the Profile page (see profile.html/js). Not an
   account: nothing here ever leaves the device, there's no login, and it's
   provisioned automatically the moment a first result exists — completing
   the assessment IS creating a local profile, no separate signup step.
   A retake just updates it in place with the newest read; name/avatar are
   the only fields a person edits directly, from the Profile page. */
const PF_PROFILE_KEY = "pf_local_profile";

function generateProfileId(){
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  // Fallback for environments without crypto.randomUUID (older browsers,
  // or a non-secure context) -- still unique enough for a local-only id.
  return "pf-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
}

// PF4: fills in any of the profile's required fields that are missing,
// on whatever profile object is passed in (a brand new one or an
// existing one being read back). Lazy-migration, same pattern as
// getFullTimeline()'s legacy tagging: an existing profile from before
// PF4 just quietly gains profileId/assessmentHistory/preferences/
// statistics/pfVersion the next time it's touched, nothing is ever
// dropped or reset.
function ensureProfileSchema(p){
  if (!p.profileId) p.profileId = generateProfileId();
  if (!p.createdAt) p.createdAt = Date.now();
  if (!p.name) p.name = "";
  if (p.avatar === undefined) p.avatar = null;
  if (!p.assessmentHistory) p.assessmentHistory = [];
  if (!p.preferences) p.preferences = {};
  if (!p.statistics) p.statistics = { totalAssessments: 0, firstAssessmentAt: null, lastAssessmentAt: null };
  // v1.4 identity fields -- same lazy-fill-in-place pattern as everything
  // above (an existing profile just quietly gains these the next time
  // it's touched, nothing dropped or reset). All optional, all editable
  // later from Profile's Edit Profile section; onboarding also writes
  // ageGroup/gender/occupation/country here the moment a result completes
  // (see ensureLocalProfile()) so a retake never has to ask again.
  if (p.nickname === undefined) p.nickname = "";
  if (p.birthday === undefined) p.birthday = null;
  if (p.ageGroup === undefined) p.ageGroup = "";
  if (p.gender === undefined) p.gender = "";
  if (p.pronouns === undefined) p.pronouns = "";
  if (p.occupation === undefined) p.occupation = "";
  if (p.country === undefined) p.country = "";
  if (p.location === undefined) p.location = "";
  if (p.bio === undefined) p.bio = "";
  if (p.favoriteColor === undefined) p.favoriteColor = null;
  // Internal schema stamp only -- never shown to users. Always the current
  // CODE_VERSION, unconditionally overwritten on every touch (this isn't a
  // migration flag, just a "profile last seen by schema N" marker).
  p.pfVersion = `PF${CODE_VERSION}`;
  p.lastOpened = Date.now();
  return p;
}

function getLocalProfile(){
  try{
    const raw = JSON.parse(localStorage.getItem(PF_PROFILE_KEY) || "null");
    if (!raw) return null;
    const p = ensureProfileSchema(raw);
    saveLocalProfile(p);
    return p;
  }
  catch(e){ return null; }
}
function saveLocalProfile(p){
  try{ localStorage.setItem(PF_PROFILE_KEY, JSON.stringify(p)); } catch(e){ /* storage unavailable, skip silently */ }
  // v1.5: keeps the multi-profile index's summary row for the active
  // profile in sync on every save, automatically -- this is the ONE
  // touch point the whole multi-profile system needed in code that
  // already existed. Every other function in the app that reads/writes
  // pf_local_profile, pf_history, pf_journal_entries, etc. is completely
  // unaware multiple profiles exist at all; see PROFILE_SCOPED_KEYS below
  // for why.
  try{ syncActiveProfileIntoIndex(p); } catch(e){ /* index unavailable, skip silently */ }
}

/* =========================================================================
   MULTIPLE PROFILES (v1.5)
   ---------------------------------------------------------------------
   Architecture: the ACTIVE profile's data keeps living at the exact
   canonical keys it always has (pf_local_profile, pf_history,
   pf_journal_entries, pf_last_code, pf_suggestion_feedback, plus
   in-progress quiz/onboarding state) -- nothing renamed, nothing
   refactored. A new lightweight index (pf_profiles_index) tracks the
   roster of profiles as small summaries (id/name/nickname/avatar-or-
   soul-color/code/depth/version/dates) for the switcher UI, plus which
   profile is currently "live" at the canonical keys. Switching profiles
   snapshots the outgoing profile's canonical-key data into one JSON blob
   under pf_profile_data:<id>, then restores the incoming profile's blob
   back onto the canonical keys.

   Why this instead of tagging every record with a profileId and
   filtering everywhere? That approach would touch every read site across
   engine.js/profile.js/growth.js/journal.js/home.js/result.js/improve.js/
   frameworks.js -- dozens of call sites, each a chance to introduce a
   regression, for a feature request that's explicit about "reuse current
   systems" and "do not introduce regressions." The swap-at-the-canonical-
   keys design means every one of those files keeps working completely
   unchanged, oblivious that more than one profile can exist. It also
   means "open to the most recently used profile by default" is true for
   free -- whatever was live at the canonical keys when the tab last
   closed is exactly what's there next time, no extra bookkeeping.
   A device that predates v1.5 has no index yet; ensureProfilesIndex()
   wraps its single existing pf_local_profile (if any) as the first
   profile the first time any multi-profile code runs, touching nothing
   else -- so this is a zero-risk migration, not a rewrite.
   ========================================================================= */
const PROFILES_INDEX_KEY = "pf_profiles_index";
// Every canonical key that belongs to "whichever profile is active right
// now" -- snapshotted/restored as one unit on every profile switch.
// pf_quiz_progress/pf_onboarding_progress are included so an in-progress
// assessment started under one profile is never silently lost if the
// person switches away and back mid-quiz ("no information should
// disappear", carried over from v1.4). pf_saved_groups (Compare's saved
// party rosters) is deliberately NOT included -- a roster of other
// people's codes to compare against reasonably stays shared across all
// of this device's own profiles, not duplicated per profile.
const PROFILE_SCOPED_KEYS = [
  "pf_local_profile", "pf_history", "pf_journal_entries", "pf_last_code",
  "pf_suggestion_feedback", "pf_quiz_progress", "pf_onboarding_progress",
];

function getProfilesIndex(){
  try{
    const raw = JSON.parse(localStorage.getItem(PROFILES_INDEX_KEY) || "null");
    if (raw && Array.isArray(raw.profiles)) return raw;
  } catch(e){ /* fall through */ }
  return null;
}
function saveProfilesIndex(idx){
  try{ localStorage.setItem(PROFILES_INDEX_KEY, JSON.stringify(idx)); } catch(e){ /* storage unavailable, skip silently */ }
}
function profileSummaryFrom(p){
  return {
    id: p.profileId, name: p.name || "", nickname: p.nickname || "",
    avatarImage: (p.avatarImage && isSafeAvatarDataUrl(p.avatarImage)) ? p.avatarImage : null,
    soulHex: isSafeHexColor(p.soulHex) ? p.soulHex : null,
    code: p.code || null, pfVersion: p.pfVersion || "", lastResultDepth: p.lastResultDepth || "",
    createdAt: p.createdAt || Date.now(), updatedAt: p.updatedAt || p.createdAt || Date.now(),
  };
}
// Lazily bootstraps the index from whatever single profile already
// exists at the canonical keys -- the one-time, zero-risk migration
// path for any device that had PersonaForge before v1.5.
function ensureProfilesIndex(){
  let idx = getProfilesIndex();
  if (idx) return idx;
  idx = { profiles: [], activeProfileId: null };
  try{
    const raw = JSON.parse(localStorage.getItem(PF_PROFILE_KEY) || "null");
    if (raw && raw.profileId){
      idx.profiles.push(profileSummaryFrom(raw));
      idx.activeProfileId = raw.profileId;
    }
  } catch(e){ /* no existing profile to migrate -- an empty index is correct */ }
  saveProfilesIndex(idx);
  return idx;
}
function syncActiveProfileIntoIndex(p){
  if (!p || !p.profileId) return;
  const idx = ensureProfilesIndex();
  const i = idx.profiles.findIndex(s => s.id === p.profileId);
  const summary = profileSummaryFrom(p);
  if (i >= 0) idx.profiles[i] = summary; else idx.profiles.push(summary);
  idx.activeProfileId = p.profileId;
  saveProfilesIndex(idx);
}
function snapshotActiveProfileData(){
  const snap = {};
  PROFILE_SCOPED_KEYS.forEach(k => { const v = localStorage.getItem(k); if (v !== null) snap[k] = v; });
  return snap;
}
function restoreProfileData(snap){
  PROFILE_SCOPED_KEYS.forEach(k => localStorage.removeItem(k));
  if (snap) Object.entries(snap).forEach(([k, v]) => { try{ localStorage.setItem(k, v); } catch(e){ /* skip */ } });
}
function listProfiles(){
  return ensureProfilesIndex().profiles.slice().sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}
function getActiveProfileId(){
  return ensureProfilesIndex().activeProfileId;
}
// Switches which profile's data is live at the canonical keys. Returns
// true on success. No-ops (returns true) if the requested profile is
// already active, so callers never need to check first.
function switchToProfile(id){
  const idx = ensureProfilesIndex();
  if (idx.activeProfileId === id) return true;
  if (!idx.profiles.some(s => s.id === id)) return false;
  if (idx.activeProfileId){
    localStorage.setItem(`pf_profile_data:${idx.activeProfileId}`, JSON.stringify(snapshotActiveProfileData()));
  }
  const incomingRaw = localStorage.getItem(`pf_profile_data:${id}`);
  // A corrupted stored blob used to throw here -- after the outgoing
  // profile had already been snapshotted, and leaving that profile
  // permanently unswitchable-to. Treating unreadable data as "empty
  // profile" keeps the switcher working; the person loses only the one
  // profile's unreadable data, not the ability to use it again.
  let incoming = null;
  try { incoming = incomingRaw ? JSON.parse(incomingRaw) : null; } catch(e){ incoming = null; }
  restoreProfileData(incoming);
  localStorage.removeItem(`pf_profile_data:${id}`);
  idx.activeProfileId = id;
  saveProfilesIndex(idx);
  return true;
}
// Snapshots the current profile away (if any) and clears the canonical
// keys for a genuinely fresh start -- the caller is expected to send the
// person through full onboarding next (a brand-new profile has no
// assessment yet, same "first launch" treatment as no profile at all).
function createNewProfile(name){
  const idx = ensureProfilesIndex();
  if (idx.activeProfileId){
    localStorage.setItem(`pf_profile_data:${idx.activeProfileId}`, JSON.stringify(snapshotActiveProfileData()));
  }
  restoreProfileData(null);
  idx.activeProfileId = null;
  saveProfilesIndex(idx);
  return createLocalProfileIfMissing(name || "");
}
// Renames a profile whether or not it's currently active -- an inactive
// profile's name lives in two places (the index summary, and inside its
// own pf_profile_data:<id> snapshot), both kept in sync so a later switch
// never shows a stale name.
function renameProfile(id, name){
  // Same 20-char ceiling as the quiz name field and sanitizeImportedLocalProfile();
  // the only caller is a native prompt() with no maxlength of its own.
  name = typeof name === "string" ? name.trim().slice(0, 20) : "";
  const idx = ensureProfilesIndex();
  const summary = idx.profiles.find(s => s.id === id);
  if (!summary) return false;
  summary.name = name;
  summary.updatedAt = Date.now();
  saveProfilesIndex(idx);
  if (idx.activeProfileId === id){
    updateLocalProfile({ name, nameIsCustom: name.length > 0 });
    return true;
  }
  const key = `pf_profile_data:${id}`;
  const raw = localStorage.getItem(key);
  if (raw){
    try{
      const snap = JSON.parse(raw);
      if (snap.pf_local_profile){
        const lp = JSON.parse(snap.pf_local_profile);
        lp.name = name; lp.nameIsCustom = name.length > 0;
        snap.pf_local_profile = JSON.stringify(lp);
        localStorage.setItem(key, JSON.stringify(snap));
      }
    } catch(e){ /* leave the index summary as the source of truth */ }
  }
  return true;
}
// Deletes a profile entirely (all of its snapshot data, its index
// entry). If it was the active one, switches to the next most-recently-
// used remaining profile, or clears to a true "no profile" state if it
// was the last one.
function deleteProfileById(id){
  const idx = ensureProfilesIndex();
  const wasActive = idx.activeProfileId === id;
  idx.profiles = idx.profiles.filter(s => s.id !== id);
  localStorage.removeItem(`pf_profile_data:${id}`);
  if (wasActive){
    restoreProfileData(null);
    idx.activeProfileId = null;
    const next = idx.profiles.slice().sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))[0];
    saveProfilesIndex(idx);
    if (next) switchToProfile(next.id);
  } else {
    saveProfilesIndex(idx);
  }
}

// The PF4 onboarding Step 04 ("Begin PF4 Assessment") calls this before
// ever starting the quiz: "check if a profile exists, use it if so,
// create one automatically if not" -- a person should never need to
// take a separate action to have a profile. Anonymous by default
// (name stays "" until a real result or a typed name attaches one).
function createLocalProfileIfMissing(name){
  const existing = getLocalProfile();
  if (existing) return existing;
  const p = ensureProfileSchema({ createdAt: Date.now(), avatar: null, name: name || "" });
  saveLocalProfile(p);
  return p;
}

function ensureLocalProfile(result){
  try{
    const existing = getLocalProfile();
    const p = existing || ensureProfileSchema({ createdAt: Date.now(), avatar: null, name: "" });
    // Only overwrite the name from a fresh result if the person hasn't
    // already set a custom one on the Profile page — a retake taken
    // anonymously ("Skip for now") shouldn't blank out a name they typed
    // in afterward.
    if (result.name && !p.nameIsCustom) p.name = result.name;
    p.code = result.code;
    p.archetypeId = result.archetype.id;
    p.archetypeName = result.archetype.name;
    p.archetypeIcon = result.archetype.icon;
    p.soul = result.soul.name;
    p.soulHex = result.soul.hex;
    p.confidencePct = result.confidence ? result.confidence.confidencePct : null;
    p.lastResultDepth = (result.meta && result.meta.resultDepth) || p.lastResultDepth || "";
    // v1.4: fill-if-empty only, never overwrite -- an answer someone gave
    // once during onboarding persists onto the profile so a retake never
    // has to ask again, but if they've since edited it from Profile's
    // Edit Profile section (or just left it blank on purpose), a later
    // retake's onboarding answer never clobbers that choice.
    const meta = result.meta || {};
    if (meta.ageGroup && !p.ageGroup) p.ageGroup = meta.ageGroup;
    if (meta.gender && !p.gender) p.gender = meta.gender;
    if (meta.occupation && !p.occupation) p.occupation = meta.occupation;
    if (meta.country && !p.country) p.country = meta.country;
    p.updatedAt = Date.now();
    // Keep assessmentHistory/statistics in sync with the active (PF4-only)
    // timeline every time a result is saved, rather than a second,
    // independently-drifting store -- pf_history via getActiveTimeline()
    // stays the one detailed source of truth.
    const active = getActiveTimeline();
    p.assessmentHistory = active.map(h => ({ code: h.code, archetype: h.archetype, timestamp: h.timestamp }));
    p.statistics = {
      totalAssessments: active.length,
      firstAssessmentAt: active.length ? active[0].timestamp : null,
      lastAssessmentAt: active.length ? active[active.length - 1].timestamp : null,
    };
    saveLocalProfile(p);
    return p;
  } catch(e){ return null; }
}
function updateLocalProfile(fields){
  const p = getLocalProfile() || ensureProfileSchema({ createdAt: Date.now(), avatar: null, name: "" });
  Object.assign(p, fields, { updatedAt: Date.now() });
  saveLocalProfile(p);
  return p;
}
/* ---------------- RECOMMENDATION ENGINE (Improve page) --------------------
   Six broad "tendency tags" that curated content (books/films/music/
   habits/social actions/reflection prompts) is authored against, each
   scored against normDims with the exact same weighted-signature pattern
   ARCHETYPES/SOUL_TYPES already use (scoreBySignature) — so which tag(s)
   a person gets is a real read of their actual profile, not a random
   pick. The top two tags blend together (more weight from the primary),
   so the result feels specific without being a rigid 1-of-6 bucket. */
const RECOMMENDATION_TAGS = [
  {
    id: "calm-reflective", label: "Calm & Reflective",
    signature: [{dim:"patience",w:2},{dim:"selfAwareness",w:2},{dim:"emotionalStability",w:1},{dim:"risk",w:-1},{dim:"socialEnergy",w:-1}],
    content: {
      books: ["Man's Search for Meaning — Viktor Frankl", "The Untethered Soul — Michael Singer", "Quiet — Susan Cain"],
      films: ["Lost in Translation", "Paterson", "My Neighbor Totoro"],
      music: ["Nils Frahm", "Bon Iver", "a slow instrumental playlist"],
      podcasts: ["On Being with Krista Tippett", "The Slow Home Podcast"],
      habits: ["A 10-minute unplugged walk before checking your phone", "One page of journaling before bed", "A single-tasking hour, notifications off"],
      socialActions: ["Text one person you've been meaning to check on, just to check on them", "Suggest a quiet one-on-one instead of a group hangout this week"],
      reflectionPrompts: ["What's one thing that felt like \"too much\" this week, and why?", "When did you last feel fully at ease, and what made that possible?"],
    },
  },
  {
    id: "high-energy-ambitious", label: "High-Energy & Ambitious",
    signature: [{dim:"drive",w:2},{dim:"competitiveness",w:2},{dim:"confidence",w:1},{dim:"risk",w:1}],
    content: {
      books: ["Can't Hurt Me — David Goggins", "The Obstacle Is the Way — Ryan Holiday", "Atomic Habits — James Clear"],
      films: ["Whiplash", "Rocky", "The Social Network"],
      music: ["a high-tempo workout playlist", "Kendrick Lamar", "The Prodigy"],
      podcasts: ["The Diary of a CEO", "Rich Roll"],
      habits: ["Pick one goal and give it a hard deadline this week", "A short, intense workout instead of a long easy one", "Timebox your biggest task to the first hour of your day"],
      socialActions: ["Challenge a friend to something with a real stake", "Ask someone you respect for one piece of direct feedback"],
      reflectionPrompts: ["What's the thing you're avoiding because it's actually hard, not because it's pointless?", "Where is your speed helping you, and where is it costing you?"],
    },
  },
  {
    id: "compassionate-connector", label: "Compassionate & Connected",
    signature: [{dim:"empathy",w:2},{dim:"kindness",w:2},{dim:"socialEnergy",w:1}],
    content: {
      books: ["The Four Agreements — Don Miguel Ruiz", "Braiding Sweetgrass — Robin Wall Kimmerer", "Tuesdays with Morrie — Mitch Albom"],
      films: ["Paddington 2", "Coco", "Won't You Be My Neighbor?"],
      music: ["a warm acoustic/folk playlist", "Sufjan Stevens", "a community choir recording"],
      podcasts: ["We Can Do Hard Things", "Ten Percent Happier"],
      habits: ["Cook for someone else this week, not just yourself", "Write one honest thank-you message and actually send it", "Volunteer an hour somewhere local"],
      socialActions: ["Organize a small gathering, even a low-key one", "Reach out to someone who's been quiet lately"],
      reflectionPrompts: ["Who made your week better, and have they heard that from you?", "Where are you giving more than you're receiving, and is that sustainable?"],
    },
  },
  {
    id: "visionary-creative", label: "Visionary & Creative",
    signature: [{dim:"creativity",w:2},{dim:"openMindedness",w:2},{dim:"curiosity",w:1}],
    content: {
      books: ["The War of Art — Steven Pressfield", "Sapiens — Yuval Noah Harari", "Steal Like an Artist — Austin Kleon"],
      films: ["Everything Everywhere All at Once", "Spirited Away", "Arrival"],
      music: ["Tame Impala", "an ambient/experimental electronic playlist", "a film-score playlist"],
      podcasts: ["99% Invisible", "Song Exploder"],
      habits: ["Sketch, write, or build something with zero goal of finishing it", "Change one part of your routine just to see what happens", "Spend 20 minutes somewhere you've never been in your own city"],
      socialActions: ["Share an unfinished idea with someone instead of waiting until it's polished", "Ask someone wildly different from you what they're excited about right now"],
      reflectionPrompts: ["What idea have you been sitting on because it feels \"too weird\"?", "If nobody would judge the outcome, what would you actually try?"],
    },
  },
  {
    id: "structured-builder", label: "Structured & Steady",
    signature: [{dim:"discipline",w:2},{dim:"planning",w:2},{dim:"responsibility",w:1}],
    content: {
      books: ["Deep Work — Cal Newport", "The Compound Effect — Darren Hardy", "Getting Things Done — David Allen"],
      films: ["The Martian", "Apollo 13", "Ford v Ferrari"],
      music: ["a focus/instrumental playlist", "steady, low-lyric background music"],
      podcasts: ["The Tim Ferriss Show", "Cortex"],
      habits: ["Batch your small tasks into one block instead of scattering them", "Set up one system this week that removes a decision you keep re-making", "A short end-of-day review of what actually got done"],
      socialActions: ["Offer to organize something for a group that keeps almost-happening", "Share a system or template that's helped you with someone who's struggling"],
      reflectionPrompts: ["What keeps falling through the cracks, and is it a discipline problem or a system problem?", "Where would one small process actually save you real time?"],
    },
  },
  {
    id: "curious-explorer", label: "Curious & Exploring",
    signature: [{dim:"curiosity",w:2},{dim:"adaptability",w:2},{dim:"independence",w:1}],
    content: {
      books: ["Born to Run — Christopher McDougall", "The Alchemist — Paulo Coelho", "In Patagonia — Bruce Chatwin"],
      films: ["Into the Wild", "The Secret Life of Walter Mitty", "180° South"],
      music: ["a global/world-music playlist", "travel-podcast-style storytelling audio"],
      podcasts: ["No Such Thing as Fish", "Radiolab"],
      habits: ["Take a genuinely new route somewhere this week", "Try one food, place, or activity you've never tried", "Ask a stranger (safely, publicly) one real question"],
      socialActions: ["Invite someone to try something neither of you has done before", "Ask a friend from a different background how they see a situation you're in"],
      reflectionPrompts: ["What's a question you're curious about but haven't looked into yet?", "When did \"not knowing what would happen\" work out better than planning would have?"],
    },
  },
];
/* ---------------- SUGGESTION FEEDBACK ("completed"/"skipped") -----------
   A single lightweight per-visit signal per tag ("tried something today"
   vs "not for me today") rather than tracking every individual bullet —
   simpler to store, simpler to show, and still a real local-behavior
   input into which tag gets picked next time (see the affinity bonus in
   computeRecommendationProfile() below). */
const SUGGESTION_FEEDBACK_KEY = "pf_suggestion_feedback";
function getSuggestionFeedback(){
  try{ return JSON.parse(localStorage.getItem(SUGGESTION_FEEDBACK_KEY) || "[]"); } catch(e){ return []; }
}
function recordSuggestionFeedback(tagId, status){
  const log = getSuggestionFeedback();
  log.push({ tagId, status, timestamp: Date.now() });
  try{ localStorage.setItem(SUGGESTION_FEEDBACK_KEY, JSON.stringify(log.slice(-100))); } catch(e){ /* ignore */ }
}
// A gentle nudge, not a rewrite: +3 per "tried" and -1 per "skipped",
// capped so a long history can shift which of two close tags wins but
// can never override what the actual personality signature says.
function tagAffinityBonus(tagId){
  const log = getSuggestionFeedback();
  const bonus = log.reduce((s, e) => s + (e.tagId === tagId ? (e.status === "tried" ? 3 : -1) : 0), 0);
  return Math.max(-10, Math.min(10, bonus));
}

// high-energy-ambitious sums to a signature weight of 6 while every other
// tag sums to 5 (by |w|, since a negative-weight dim's max contribution is
// the same magnitude as a positive one), giving it a permanently higher
// ceiling in a raw comparison — the same issue fixed for archetypes/souls
// above, via the same fix: scale by maxWeight/itsOwnWeight first.
const RECOMMENDATION_TAG_MAX_WEIGHT = signatureMaxWeight(RECOMMENDATION_TAGS.map(t => ({
  signature: t.signature.map(s => ({ dim: s.dim, w: Math.abs(s.w) })),
})));
const RECOMMENDATION_UNUSED_DIMS = DIMENSIONS.filter(d =>
  !RECOMMENDATION_TAGS.some(t => t.signature.some(s => s.dim === d))
);
function computeRecommendationProfile(normDims){
  const ranked = RECOMMENDATION_TAGS.map(item => {
    const totalWeight = item.signature.reduce((sum, s) => sum + Math.abs(s.w), 0);
    const raw = item.signature.reduce((sum, s) => sum + (normDims[s.dim] || 0) * s.w, 0);
    const score = raw * (RECOMMENDATION_TAG_MAX_WEIGHT / totalWeight);
    return { item, score };
  })
    .map(r => ({ ...r, score: r.score + tagAffinityBonus(r.item.id) }))
    .sort((a,b) => b.score - a.score);
  const primary = ranked[0].item, secondary = ranked[1].item;
  // Two people can land on the identical primary+secondary tag pair while
  // still being different people underneath — right now that meant byte-
  // identical suggestions for both, since blend() always sliced from the
  // start of each tag's fixed lists. RECOMMENDATION_UNUSED_DIMS are the
  // dims no tag signature reads (so they never affected which tag won),
  // used here as a real, if secondary, personality signal to rotate which
  // items from that same pool come up first, instead of the same books
  // and films every time two people share a tag pair.
  const seed = RECOMMENDATION_UNUSED_DIMS.reduce((s, d) => s + (normDims[d] || 0), 0);
  const rotate = (arr, offset, count) => {
    if (!arr.length) return [];
    const n = ((offset % arr.length) + arr.length) % arr.length;
    return Array.from({ length: Math.min(count, arr.length) }, (_, i) => arr[(n + i) % arr.length]);
  };
  const blend = (key, primaryCount, secondaryCount) => [
    ...rotate(primary.content[key], seed, primaryCount),
    ...rotate(secondary.content[key], seed + 1, secondaryCount),
  ];
  return {
    primary, secondary,
    books: blend("books", 2, 1),
    films: blend("films", 2, 1),
    music: blend("music", 2, 1),
    podcasts: blend("podcasts", 1, 1),
    habits: blend("habits", 2, 1),
    socialActions: blend("socialActions", 1, 1),
    reflectionPrompts: blend("reflectionPrompts", 1, 1),
  };
}

/* Check-in cadence: after CHECK_IN_DAYS since the last check-in (or since
   the profile's own last result if none yet), the Improve page offers a
   lightweight "how did that go?" retake prompt instead of showing it every
   single visit. */
const CHECK_IN_DAYS = 4;
function getImproveCheckInState(){
  let state;
  try{ state = JSON.parse(localStorage.getItem("pf_improve_checkin") || "null"); } catch(e){ state = null; }
  const profile = getLocalProfile();
  const since = (state && state.lastSeenAt) || (profile && profile.updatedAt) || Date.now();
  const daysSince = (Date.now() - since) / (1000 * 60 * 60 * 24);
  return { daysSince, dueForCheckIn: daysSince >= CHECK_IN_DAYS };
}
function markImproveCheckInSeen(){
  try{ localStorage.setItem("pf_improve_checkin", JSON.stringify({ lastSeenAt: Date.now() })); } catch(e){ /* ignore */ }
}

/* ---------------- IMPORT SANITIZATION --------------------------------
   A .pf file is untrusted input the moment it isn't one Forge itself
   just exported — someone can hand-edit one, or share a crafted one.
   Several fields from it (ids, hex colors, an avatar data URL) end up
   interpolated straight into rendered HTML/attributes elsewhere
   (journal/group ids in an inline onclick, soulHex in a style attribute,
   avatarImage in an <img src>), so importProfile() validates each one
   against a strict allowlist pattern before it's ever written to
   localStorage, rather than trusting it because it merely parsed as
   JSON. Anything that fails validation is dropped, not fixed up. */
function isSafeId(id){ return typeof id === "string" && /^[A-Za-z0-9_-]{1,64}$/.test(id); }
function isSafeHexColor(hex){ return typeof hex === "string" && /^#[0-9a-fA-F]{3,8}$/.test(hex); }
function isSafeAvatarDataUrl(url){ return typeof url === "string" && url.length <= 300000 && /^data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/]+=*$/.test(url); }
function sanitizeImportedJournal(entries){
  if (!Array.isArray(entries)) return [];
  return entries.filter(e => e && isSafeId(e.id) && typeof e.timestamp === "number").map(e => ({
    id: e.id,
    timestamp: e.timestamp,
    mood: Math.max(1, Math.min(5, Number(e.mood) || 3)),
    text: typeof e.text === "string" ? e.text.slice(0, 600) : "",
    prompt: typeof e.prompt === "string" ? e.prompt.slice(0, 300) : null,
  }));
}
const VALID_RECOMMENDATION_TAG_IDS = new Set(["calm-reflective","high-energy-ambitious","compassionate-connector","visionary-creative","structured-builder","curious-explorer"]);
function sanitizeImportedSuggestionFeedback(log){
  if (!Array.isArray(log)) return [];
  return log.filter(e => e && VALID_RECOMMENDATION_TAG_IDS.has(e.tagId) && (e.status === "tried" || e.status === "skipped") && typeof e.timestamp === "number").slice(-100);
}
function sanitizeImportedGroups(groups){
  if (!Array.isArray(groups)) return [];
  return groups.filter(g => g && isSafeId(g.id)).map(g => ({
    id: g.id,
    name: typeof g.name === "string" ? g.name.slice(0, 40) : "Unnamed Group",
    codes: Array.isArray(g.codes) ? g.codes.filter(c => typeof c === "string").slice(0, 10) : [],
    createdAt: typeof g.createdAt === "number" ? g.createdAt : Date.now(),
  }));
}
function sanitizeImportedLocalProfile(p){
  if (!p || typeof p !== "object") return null;
  return {
    createdAt: typeof p.createdAt === "number" ? p.createdAt : Date.now(),
    updatedAt: typeof p.updatedAt === "number" ? p.updatedAt : Date.now(),
    name: typeof p.name === "string" ? p.name.slice(0, 20) : "",
    nameIsCustom: !!p.nameIsCustom,
    avatarImage: isSafeAvatarDataUrl(p.avatarImage) ? p.avatarImage : null,
    code: typeof p.code === "string" ? p.code : undefined,
    archetypeId: typeof p.archetypeId === "string" ? p.archetypeId : undefined,
    archetypeName: typeof p.archetypeName === "string" ? p.archetypeName : undefined,
    archetypeIcon: typeof p.archetypeIcon === "string" ? p.archetypeIcon.slice(0, 8) : undefined,
    soul: typeof p.soul === "string" ? p.soul.slice(0, 30) : undefined,
    soulHex: isSafeHexColor(p.soulHex) ? p.soulHex : undefined,
    confidencePct: typeof p.confidencePct === "number" ? p.confidencePct : null,
    // PF4 profile-schema fields (QA pass): without these, an imported
    // profile would silently lose its profileId on the very next read
    // (ensureProfileSchema() would mint a brand new one, since it only
    // fills in fields that are actually missing) -- a real identity-
    // continuity bug, not just a cosmetic gap. assessmentHistory/
    // statistics/lastOpened are deliberately left out of this allowlist:
    // they're derived from pf_history (already imported separately above)
    // and re-synced automatically the next time ensureLocalProfile() runs,
    // so re-deriving them fresh is correct, not a loss.
    // profileId is restricted to isSafeId()'s character set (not just a
    // length cap, security review v1.5) -- it's used as a literal
    // localStorage key suffix (pf_profile_data:<id>) and rendered in the
    // Profile Switcher, and every profileId this app itself ever
    // generates (crypto.randomUUID() or the pf-<base36> fallback) already
    // satisfies this, so a real exported profile always round-trips.
    profileId: isSafeId(p.profileId) ? p.profileId : undefined,
    preferences: (p.preferences && typeof p.preferences === "object" && !Array.isArray(p.preferences)) ? p.preferences : undefined,
    // v1.5 identity fields (security review: these were missing from
    // this allowlist entirely, which is why they never had an import
    // path -- an allowlist that drops a field is a functional gap here,
    // not a safety feature, since every field below is separately type/
    // length-checked exactly like name and soul above it).
    nickname: typeof p.nickname === "string" ? p.nickname.slice(0, 20) : undefined,
    birthday: typeof p.birthday === "string" ? p.birthday.slice(0, 10) : undefined,
    ageGroup: typeof p.ageGroup === "string" ? p.ageGroup.slice(0, 20) : undefined,
    gender: typeof p.gender === "string" ? p.gender.slice(0, 20) : undefined,
    pronouns: typeof p.pronouns === "string" ? p.pronouns.slice(0, 20) : undefined,
    occupation: typeof p.occupation === "string" ? p.occupation.slice(0, 30) : undefined,
    country: typeof p.country === "string" ? p.country.slice(0, 30) : undefined,
    location: typeof p.location === "string" ? p.location.slice(0, 30) : undefined,
    bio: typeof p.bio === "string" ? p.bio.slice(0, 200) : undefined,
    favoriteColor: isSafeHexColor(p.favoriteColor) ? p.favoriteColor : undefined,
    lastResultDepth: ["short","balanced","deep"].includes(p.lastResultDepth) ? p.lastResultDepth : undefined,
  };
}

/* ---------------- JOURNAL --------------------------------------------
   A daily mood + short-text check-in, entirely local (see the Journal
   page). Each entry gets a stable id via crypto.randomUUID() rather than
   an array index or timestamp-as-id — the local-first behavior doesn't
   change today, but a stable id is what a future optional-sync layer
   would need to merge records across devices without collisions, so
   this is written that way from the start rather than retrofitted later. */
const JOURNAL_KEY = "pf_journal_entries";
function getJournalEntries(){
  try{
    const raw = JSON.parse(localStorage.getItem(JOURNAL_KEY) || "[]");
    // One malformed record (null, wrong type) used to make the sort throw
    // and the catch below hide the ENTIRE journal; drop just the bad ones.
    return Array.isArray(raw) ? raw.filter(e => e && typeof e === "object" && typeof e.timestamp === "number").sort((a,b) => a.timestamp - b.timestamp) : [];
  } catch(e){ return []; }
}
function saveJournalEntries(entries){
  try{ localStorage.setItem(JOURNAL_KEY, JSON.stringify(entries)); } catch(e){ /* storage unavailable, skip silently */ }
}
function addJournalEntry({ mood, text, prompt }){
  const entries = getJournalEntries();
  const entry = {
    id: (crypto.randomUUID ? crypto.randomUUID() : `j_${Date.now()}_${Math.random().toString(36).slice(2)}`),
    timestamp: Date.now(),
    mood: Math.max(1, Math.min(5, mood || 3)),
    text: (text || "").slice(0, 600),
    prompt: prompt || null,
  };
  entries.push(entry);
  // Capped like every other growing local-storage list in the app
  // (pf_history at 10, suggestion feedback at 100) -- this one was the
  // one outlier with no bound at all. getJournalEntries() returns
  // oldest-first, so this drops the oldest entries once over the cap,
  // same as pf_history's own `while (history.length > 10) history.shift()`.
  // 3650 is a decade of daily entries, generous enough that no realistic
  // user hits it, while still giving this list an actual ceiling.
  while (entries.length > 3650) entries.shift();
  saveJournalEntries(entries);
  return entry;
}
function deleteJournalEntry(id){
  saveJournalEntries(getJournalEntries().filter(e => e.id !== id));
}
function localDateKey(ts){
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}
function getTodaysJournalEntry(){
  const todayKey = localDateKey(Date.now());
  const entries = getJournalEntries();
  return entries.find(e => localDateKey(e.timestamp) === todayKey) || null;
}
// Consecutive-day streak, counting today or yesterday as the anchor (a
// streak isn't "broken" just because today's entry hasn't happened yet)
// and walking backward one calendar day at a time through however many
// unique days in a row have at least one entry.
function computeJournalStreak(){
  const entries = getJournalEntries();
  if (!entries.length) return { current: 0, longest: 0, totalEntries: 0 };
  const days = new Set(entries.map(e => localDateKey(e.timestamp)));
  const oneDay = 24 * 60 * 60 * 1000;
  let cursor = Date.now();
  if (!days.has(localDateKey(cursor)) && !days.has(localDateKey(cursor - oneDay))){
    return { current: 0, longest: computeLongestJournalStreak(days), totalEntries: entries.length };
  }
  if (!days.has(localDateKey(cursor))) cursor -= oneDay;
  let current = 0;
  while (days.has(localDateKey(cursor))){ current++; cursor -= oneDay; }
  return { current, longest: Math.max(current, computeLongestJournalStreak(days)), totalEntries: entries.length };
}
function computeLongestJournalStreak(daySet){
  const oneDay = 24 * 60 * 60 * 1000;
  const dayNums = [...daySet].map(k => {
    const [y,m,d] = k.split("-").map(Number);
    return Math.floor(new Date(y, m, d).getTime() / oneDay);
  }).sort((a,b) => a-b);
  let longest = 0, run = 0, prev = null;
  dayNums.forEach(n => {
    run = (prev !== null && n === prev + 1) ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = n;
  });
  return longest;
}

/* ---------------- PROGRESS / LEVEL (gamification) --------------------
   A light XP/level layer over activity Forge already tracks (retakes,
   journal entries, the trait-based ACHIEVEMENTS a result unlocks) —
   not a new subsystem to maintain, just a score over three things that
   already exist. Deliberately simple thresholds rather than a fancy
   curve: this is meant to feel encouraging, not like a min-maxed game. */
const PROGRESS_LEVELS = [
  { level: 1, minXp: 0, title: "Newcomer" },
  { level: 2, minXp: 60, title: "Newcomer" },
  { level: 3, minXp: 140, title: "Explorer" },
  { level: 4, minXp: 240, title: "Explorer" },
  { level: 5, minXp: 360, title: "Adept" },
  { level: 6, minXp: 500, title: "Adept" },
  { level: 7, minXp: 660, title: "Grounded" },
  { level: 8, minXp: 840, title: "Grounded" },
  { level: 9, minXp: 1040, title: "Forge Veteran" },
  { level: 10, minXp: 1260, title: "Forge Veteran" },
];
function computeProgress(normDims){
  const retakeCount = getActiveTimeline().length;
  const journalCount = getJournalEntries().length;
  const achievementCount = normDims ? computeAchievements(normDims).length : 0;
  const xp = retakeCount * 30 + journalCount * 8 + achievementCount * 15;
  let tier = PROGRESS_LEVELS[0];
  for (const t of PROGRESS_LEVELS){ if (xp >= t.minXp) tier = t; }
  const nextTier = PROGRESS_LEVELS.find(t => t.minXp > xp);
  return {
    xp, level: tier.level, title: tier.title,
    nextLevelXp: nextTier ? nextTier.minXp : null,
    progressToNext: nextTier ? Math.round(((xp - tier.minXp) / (nextTier.minXp - tier.minXp)) * 100) : 100,
    retakeCount, journalCount, achievementCount,
  };
}

/* ---------------- GROUPS (saved party rosters) ------------------------
   Party Compare already accepts 3-5 pasted codes per visit; this just
   lets a person name and save that exact roster so re-visiting "Book
   Club" or "The Roommates" doesn't mean re-pasting every code again.
   Entries again use a stable id for the same future-sync reason as the
   journal above. */
const GROUPS_KEY = "pf_groups";
function getSavedGroups(){
  try{
    const raw = JSON.parse(localStorage.getItem(GROUPS_KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch(e){ return []; }
}
function saveGroup(name, codes){
  const groups = getSavedGroups();
  const group = {
    id: (crypto.randomUUID ? crypto.randomUUID() : `g_${Date.now()}_${Math.random().toString(36).slice(2)}`),
    name: (name || "Unnamed Group").slice(0, 40),
    codes: codes.slice(0, 10),
    createdAt: Date.now(),
  };
  groups.unshift(group);
  try{ localStorage.setItem(GROUPS_KEY, JSON.stringify(groups.slice(0, 20))); } catch(e){ /* ignore */ }
  return group;
}
function deleteSavedGroup(id){
  const groups = getSavedGroups().filter(g => g.id !== id);
  try{ localStorage.setItem(GROUPS_KEY, JSON.stringify(groups)); } catch(e){ /* ignore */ }
}

/* ---------------- TIMELINE / PERSONALITY KNOWLEDGE GRAPH (v1.7) ----------
   Each completed result becomes one snapshot in pf_history. Immutable in
   the sense that matters: normDims, code, archetype/soul-at-the-time,
   confidence, consistency, and depth are never recomputed or altered
   after the fact -- they're what was actually true on that run.

   What's deliberately NOT stored here: full Atlas match objects,
   contradiction explanation text, or anything else that's a pure
   function of normDims. Storing those per-snapshot would duplicate
   regenerable content and mean a future Atlas/explanation improvement
   could never reach past snapshots. Instead this stores compact
   *reference* fields (names/labels only -- atlasTopMatchName,
   contradictionLabels, narrativeRoleName, identityTagline) cheap enough
   to scan across the whole timeline for Memory Engine statements ("you've
   matched Sherlock Holmes three times"), plus normDims itself, so
   hydrateTimelineEntry() (below) can always recompute the full rich
   detail on demand, current logic, for any single snapshot someone
   actually opens. One data shape, read by Timeline/Confidence/Memory/
   Growth/Relationship features alike -- not a separate store per feature.

   Cap raised from 10 to 500 (was a real bug this rewrite incidentally
   fixes: applyStoredConfidence() looks up a result's original confidence
   by code, so anyone past 10 retakes was already silently losing that
   lookup for their earliest runs). 500 is a defensive ceiling, not a
   realistic one -- weekly retakes for a decade -- matching every other
   growing list in this app (journal at 3650, suggestion feedback at
   100), not a literal "never overwrite, unbounded" store, which would be
   a genuine, unbounded localStorage-growth risk this codebase has
   avoided everywhere else on purpose. */
const TIMELINE_CAP = 500;
function saveToTimeline(result){
  try{
    const history = JSON.parse(localStorage.getItem("pf_history") || "[]");
    const contradictions = computeContradictions(result.normDims);
    history.push({
      code: result.code,
      name: result.name,
      archetype: result.archetype.name,
      archetypeId: result.archetype.id,
      soul: result.soul ? result.soul.name : null,
      confidencePct: result.confidence ? result.confidence.confidencePct : null,
      consistencyPct: result.consistency ? result.consistency.pct : null,
      depth: (result.meta && result.meta.resultDepth) || null,
      questionCount: typeof result.questionCount === "number" ? result.questionCount : null,
      normDims: result.normDims,
      traits: result.traits,
      timestamp: Date.now(),
      version: CODE_VERSION,
      // Compact derived references (see header comment) -- cheap enough
      // to scan across hundreds of entries, never the full computed object.
      contradictionLabels: contradictions.map(c => c.label),
      atlasTopMatchName: (result.atlas.find(s => s.category === "Character") || {}).items?.[0]?.name || null,
      narrativeRoleName: result.narrativeRole ? result.narrativeRole.primary.name : null,
      identityTagline: result.identityTagline || null,
      // Forge model (v2): per-dimension confidence MEASURED from this
      // assessment's own answers (0..1). Absent on older entries, which the
      // Forge layer estimates instead and labels as estimated.
      dimConfidence: result.dimConfidence || null,
      assessmentKind: result.assessmentKind || "full",
      // ids of the questions answered in this run, so a later targeted retake
      // can prefer questions this person hasn't already seen.
      questionIds: Array.isArray(result.questionIds) ? result.questionIds.slice(0, 60) : null,
    });
    while (history.length > TIMELINE_CAP) history.shift();
    localStorage.setItem("pf_history", JSON.stringify(history));
  } catch(e){ /* storage unavailable, skip silently */ }
}
// Re-derives the full rich detail for one snapshot, current logic, from
// its immutable normDims -- the "hydrate on demand" half of the
// architecture above. Never called in a loop over the whole timeline
// (that would be the wasteful, "recompute everything to scan for one
// string" mistake this design specifically avoids); only when a UI
// actually opens one specific snapshot.
function hydrateTimelineEntry(entry){
  return {
    ...entry,
    contradictions: computeContradictions(entry.normDims),
    atlas: computeAtlasMatch(entry.normDims),
    narrativeRole: computeNarrativeRole(entry.normDims),
    identityTagline: computeIdentityTagline(entry.normDims),
  };
}
// Lazy migration for snapshots saved before v1.7: the new compact
// reference fields are backfilled from each entry's own already-stored
// normDims the first time the timeline is read, written back once, same
// "archive/enrich, never destroy" pattern the `legacy` flag already
// uses just below. depth/consistencyPct have no safe way to reconstruct
// (that information was never captured pre-v1.7) so they stay null on
// old entries -- an honest gap, not a guess.
function ensureTimelineSnapshotFields(h){
  let changed = false;
  if (h.contradictionLabels === undefined){
    h.contradictionLabels = computeContradictions(h.normDims).map(c => c.label);
    changed = true;
  }
  if (h.atlasTopMatchName === undefined){
    const atlas = computeAtlasMatch(h.normDims);
    h.atlasTopMatchName = (atlas.find(s => s.category === "Character") || {}).items?.[0]?.name || null;
    changed = true;
  }
  if (h.narrativeRoleName === undefined){
    h.narrativeRoleName = computeNarrativeRole(h.normDims).primary.name;
    changed = true;
  }
  if (h.identityTagline === undefined){
    h.identityTagline = computeIdentityTagline(h.normDims);
    changed = true;
  }
  if (h.depth === undefined) { h.depth = null; changed = true; }
  if (h.consistencyPct === undefined) { h.consistencyPct = null; changed = true; }
  if (h.questionCount === undefined) { h.questionCount = null; changed = true; }
  return changed;
}
function getPreviousTimelineEntry(){
  const history = getActiveTimeline();
  return history.length >= 2 ? history[history.length - 2] : null;
}
// PF4: any entry saved by an earlier CODE_VERSION is lazily tagged
// `legacy: true` the first time it's read (written back once, so this
// only runs one time per old entry) rather than deleted or migrated --
// "archive, don't delete" per the PF4 versioning requirement. Every
// consumer that feeds history/growth/comparisons/statistics should read
// getActiveTimeline() instead, so a PF1/2/3 result never gets compared
// against PF4's different scoring model; getFullTimeline() itself still
// returns everything, including legacy entries, for the Privacy & Data
// page and for "delete archived legacy results" specifically.
function getFullTimeline(){
  try{
    const history = JSON.parse(localStorage.getItem("pf_history") || "[]");
    let changed = false;
    history.forEach(h => {
      if (h.legacy === undefined){
        // Compared against LEGACY_CODE_VERSION (the oldest schema still
        // fully supported), not CODE_VERSION (the current *encode*
        // target) -- otherwise every already-issued schema-4 result would
        // get wrongly archived the moment CODE_VERSION next bumps, which
        // is exactly the "never force a retest" guarantee this field
        // exists to protect.
        const isLegacy = (h.version || 1) < LEGACY_CODE_VERSION;
        if (isLegacy){ h.legacy = true; changed = true; }
      }
      // v1.7 Knowledge Graph fields: skipped for legacy (pre-PF4) entries
      // on purpose -- their normDims were scored under a different,
      // retired system, so running the current Atlas/contradiction/
      // narrative-role logic against them would produce results that
      // don't actually describe what that old result meant. Those stay
      // null, same as depth/consistency already do for any pre-v1.7 entry.
      if (!h.legacy && ensureTimelineSnapshotFields(h)) changed = true;
    });
    if (changed){ try{ localStorage.setItem("pf_history", JSON.stringify(history)); } catch(e){ /* ignore */ } }
    return history;
  }
  catch(e){ return []; }
}
function getActiveTimeline(){
  return getFullTimeline().filter(h => !h.legacy);
}

/* ---------------- CONFIDENCE ENGINE (v1.7) --------------------------------
   Replaces a bare percentage with an evidence-based read: how much Forge
   actually knows about this person, from real counts (assessments,
   elapsed time, questions answered, measured consistency) -- never a
   single formula pretending those don't matter. Every tier requires BOTH
   enough assessments AND real elapsed time (five retakes in one sitting
   isn't "very high confidence", it's just repetition), and where
   consistency data exists, it has to actually be high. */
function computeConfidenceEngine(){
  const history = getActiveTimeline();
  const n = history.length;
  if (!n) return null;
  const firstTs = history[0].timestamp, lastTs = history[history.length - 1].timestamp;
  const spanDays = Math.max(0, Math.round((lastTs - firstTs) / 86400000));
  const spanMonths = Math.round(spanDays / 30);
  const totalQuestions = history.reduce((s, h) => s + (h.questionCount || 0), 0);
  const consistencyValues = history.map(h => h.consistencyPct).filter(v => typeof v === "number");
  const avgConsistency = consistencyValues.length ? Math.round(consistencyValues.reduce((a, b) => a + b, 0) / consistencyValues.length) : null;
  const deepCount = history.filter(h => h.depth === "deep").length;

  let label;
  if (n >= 6 && spanDays >= 60 && (avgConsistency === null || avgConsistency >= 70)) label = "Very High";
  else if (n >= 3 && spanDays >= 14) label = "High";
  else if (n >= 2) label = "Building";
  else label = "Initial";

  return { assessmentCount: n, spanDays, spanMonths, totalQuestions, avgConsistency, deepCount, label, firstTimestamp: firstTs, lastTimestamp: lastTs };
}

/* ---------------- MEMORY ENGINE (v1.7) -------------------------------------
   Every statement here is a direct read of stored snapshot data -- a
   measured delta between two real entries, a repeated field value, a
   label that appeared or stopped appearing. Nothing is templated
   flattery and nothing fires without real evidence clearing a real
   threshold (a 1-point dimension wobble isn't "you've changed"). Returns
   0-5 statements depending on what the person's actual history supports;
   an empty array for someone with under 2 real assessments is correct,
   not a bug. */
function computeMemoryStatements(){
  const history = getActiveTimeline();
  if (history.length < 2) return [];
  const statements = [];
  const first = history[0], last = history[history.length - 1];
  const monthsAgo = Math.max(0, Math.round((last.timestamp - first.timestamp) / (1000 * 60 * 60 * 24 * 30)));
  const timeLabel = monthsAgo >= 1 ? `Over the last ${monthsAgo} month${monthsAgo === 1 ? "" : "s"}` : "Across your recent assessments";

  // Biggest single-dimension shift between the first and most recent run.
  let biggestDim = null, biggestDelta = 0;
  DIMENSIONS.forEach(d => {
    const delta = (last.normDims[d] || 0) - (first.normDims[d] || 0);
    if (Math.abs(delta) > Math.abs(biggestDelta)){ biggestDelta = delta; biggestDim = d; }
  });
  if (biggestDim && Math.abs(biggestDelta) >= 3){
    // DIM_LABELS entries are all nouns ("kindness", "risk tolerance",
    // "logical thinking") everywhere else in this file -- a "you've
    // become more {label}" phrasing that expects an adjective breaks on
    // most of them ("more kindness" isn't a sentence). "has grown/faded"
    // reads correctly against every single label in that object.
    statements.push(`${timeLabel}, your ${DIM_LABELS[biggestDim]} has ${biggestDelta > 0 ? "grown noticeably" : "faded noticeably"}.`);
  }

  // Most stable dimension across the whole history (lowest variance),
  // only worth saying with enough runs to actually call it a pattern.
  if (history.length >= 3){
    let stableDim = null, stableVariance = Infinity;
    DIMENSIONS.forEach(d => {
      const vals = history.map(h => h.normDims[d] || 0);
      const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
      const variance = vals.reduce((s, v) => s + (v - mean) * (v - mean), 0) / vals.length;
      if (variance < stableVariance){ stableVariance = variance; stableDim = d; }
    });
    if (stableDim && stableVariance < 2){
      statements.push(`Your ${DIM_LABELS[stableDim]} has stayed consistent across all ${history.length} assessments -- one of the few things that hasn't moved.`);
    }
  }

  // A repeated Atlas character match -- real pattern, not one-off noise.
  const matchCounts = {};
  history.forEach(h => { if (h.atlasTopMatchName) matchCounts[h.atlasTopMatchName] = (matchCounts[h.atlasTopMatchName] || 0) + 1; });
  const repeatedMatch = Object.entries(matchCounts).sort((a, b) => b[1] - a[1])[0];
  if (repeatedMatch && repeatedMatch[1] >= 2){
    statements.push(`You've matched ${repeatedMatch[0]} ${repeatedMatch[1]} times now -- not a fluke, a real pattern.`);
  }

  // A contradiction that showed up in the first read but hasn't since.
  const firstLabels = new Set(first.contradictionLabels || []);
  const lastLabels = new Set(last.contradictionLabels || []);
  const resolved = [...firstLabels].find(l => !lastLabels.has(l));
  if (resolved) statements.push(`"${resolved}" showed up in your first assessment but hasn't since -- that tension resolved somewhere along the way.`);
  const newContradiction = [...lastLabels].find(l => !firstLabels.has(l));
  if (newContradiction) statements.push(`"${newContradiction}" is new since your first assessment -- a tension that wasn't there before.`);

  // Confidence trend, only worth naming past a real threshold.
  const confidenceValues = history.map(h => h.confidencePct).filter(v => typeof v === "number");
  if (confidenceValues.length >= 2){
    const delta = confidenceValues[confidenceValues.length - 1] - confidenceValues[0];
    if (Math.abs(delta) >= 10){
      statements.push(`Your match confidence has ${delta > 0 ? "climbed" : "dropped"} ${Math.abs(delta)} points since your first assessment -- Forge's read on you has gotten ${delta > 0 ? "sharper" : "less certain"} over time.`);
    }
  }

  return statements.slice(0, 5);
}

// Without a live session, computeAssessmentConfidence() falls back to a
// coarser formula (no consistency/tie-breaker terms), which produces a
// visibly different number than the one the person actually saw on their
// Results page for that same run. Every place that rebuilds a result from
// a bare code (this device's own timeline, a decoded ?code=/reload, an
// export with no live lastResult) has the exact same problem and the exact
// same fix: if a local timeline entry for this code exists, its
// confidencePct is that original, session-aware number, so reuse it
// instead of letting Home/Growth/Improve/Journal/Frameworks/Profile/the
// Results page/an exported .pf file each show a different confidence for
// what is supposed to be one result. Was three separate copies of this
// lookup-and-override; centralized here so there's exactly one version to
// keep correct.
function applyStoredConfidence(extras, code){
  const entry = getFullTimeline().find(h => h.code === code);
  if (entry && typeof entry.confidencePct === "number"){
    extras.confidence = { ...extras.confidence, confidencePct: entry.confidencePct, overall: entry.confidencePct };
  }
  return extras;
}

// Reconstructs a full result-shaped object (normDims + every computed
// extra) from the timeline's own last entry — used by every page that
// needs "the latest result" without a live quiz session to draw one
// from (Growth, Improve, Journal, Frameworks, Home's dashboard). Was
// copy-pasted into each of those files with a per-page suffix; centralized
// here so there's exactly one version to keep correct.
function buildResultFromLatestTimeline(){
  const history = getActiveTimeline();
  if (!history.length) return null;
  const entry = history[history.length - 1];
  const decoded = decodeCode(entry.code);
  // PF4: an obsolete PF1/PF2/PF3 timeline entry is treated the same as
  // "no result yet" here rather than crashing every page that calls this
  // -- those pages already have a graceful empty state, and there is no
  // safe profile to reconstruct from an old code anyway.
  if (!decoded || decoded.obsolete) return null;
  const match = matchArchetype(decoded.normDims);
  const extras = applyStoredConfidence(
    buildProfileExtras(decoded.normDims, match.primary, match.ranked, null),
    entry.code
  );
  return { name: decoded.name, meta: { resultDepth: decoded.depthTier }, normDims: decoded.normDims, archetype: match.primary, ...extras };
}

// "Growth-coded" dims: the ones that read as genuine development rather
// than just personal style (e.g. more/less humor isn't "growth" the way
// more resilience or self-awareness is) — used to separate "Improved
// Tendencies" from the neutral before/after list.
const GROWTH_CODED_DIMS = ["resilience","confidence","discipline","optimism","selfAwareness","persistence","emotionalStability","responsibility"];

function computeGrowthTimeline(result){
  const history = getActiveTimeline();
  const retakeCount = history.length;
  const previous = getPreviousTimelineEntry();
  const entries = history.map(h => ({ ...h, dateLabel: new Date(h.timestamp).toLocaleDateString() }));

  const base = { retakeCount, entries, previous, hasPrevious: !!previous,
    majorChanges: [], unchangedTraits: [], improvedTendencies: [],
    archetypeChange: { changed: false }, soulChange: { changed: false },
    confidenceTrend: { direction: "unknown", from: null, to: result.confidence ? result.confidence.confidencePct : null },
    badges: [] };

  if (!previous){
    base.badges.push("First Assessment");
    return base;
  }

  const prevDims = previous.normDims || {};
  const deltas = DIMENSIONS.map(d => ({ d, before: pct(prevDims[d]||0), after: pct(result.normDims[d]||0) }))
    .map(x => ({ ...x, delta: x.after - x.before }));

  base.majorChanges = deltas.filter(x => Math.abs(x.delta) >= 12).sort((a,b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0,5)
    .map(x => ({ label: DIM_LABELS[x.d], before: x.before, after: x.after, delta: x.delta }));
  base.unchangedTraits = deltas.filter(x => Math.abs(x.delta) <= 3).map(x => DIM_LABELS[x.d]).slice(0,6);
  base.improvedTendencies = deltas.filter(x => GROWTH_CODED_DIMS.includes(x.d) && x.delta >= 6)
    .sort((a,b) => b.delta - a.delta).map(x => ({ label: DIM_LABELS[x.d], delta: x.delta }));

  // A changed archetype/soul between two LOW-confidence reads is often just
  // ordinary answer noise landing on the other side of a close tie, not a
  // real shift in who someone is. Only trust the change enough to badge it
  // when both the earlier and the current read were confident readings in
  // their own right -- otherwise it's reported as unchanged rather than as
  // a shift that didn't actually happen.
  const NOISE_GUARD_CONFIDENCE = 50;
  const prevConfidentEnough = typeof previous.confidencePct !== "number" || previous.confidencePct >= NOISE_GUARD_CONFIDENCE;
  const currentConfidentEnough = !result.confidence || result.confidence.confidencePct >= NOISE_GUARD_CONFIDENCE;
  const shiftIsTrustworthy = prevConfidentEnough && currentConfidentEnough;

  const prevArchetypeId = previous.archetypeId || (ARCHETYPES.find(a => a.name === previous.archetype) || {}).id;
  if (prevArchetypeId && prevArchetypeId !== result.archetype.id && shiftIsTrustworthy){
    base.archetypeChange = { changed: true, from: previous.archetype, to: result.archetype.name };
    base.badges.push("Archetype Shift");
  }
  const prevSoulName = previous.soul || (previous.normDims ? computeSoulType(previous.normDims).name : null);
  const currentSoulName = result.soul ? result.soul.name : computeSoulType(result.normDims).name;
  if (prevSoulName && prevSoulName !== currentSoulName && shiftIsTrustworthy){
    base.soulChange = { changed: true, from: prevSoulName, to: currentSoulName };
    base.badges.push("Soul Shift");
  }

  if (typeof previous.confidencePct === "number" && result.confidence){
    const diff = result.confidence.confidencePct - previous.confidencePct;
    base.confidenceTrend = { direction: diff > 3 ? "up" : diff < -3 ? "down" : "flat", from: previous.confidencePct, to: result.confidence.confidencePct };
    if (diff > 3) base.badges.push("Rising Confidence");
  }

  if (retakeCount >= 3) base.badges.push(`${retakeCount} Retakes`);
  if (base.improvedTendencies.length >= 2) base.badges.push("Consistent Growth");
  if (base.majorChanges.length === 0 && base.unchangedTraits.length >= 15) base.badges.push("Steady & Consistent");

  return base;
}

/* ---------------- LIVING NOTES (Home dashboard) --------------------------
   Short, human-sounding observations built entirely from computeGrowthTimeline's
   own numbers — "You're still mostly X, but calmer lately" reads like Forge
   noticed something, but every word traces back to a real delta, nothing
   is invented or randomized. Capped at 3 short lines so Home stays a
   dashboard, not another wall of cards. */
const DIM_TREND_PHRASES = {
  patience: { up: "more patient", down: "quicker to react" },
  emotionalStability: { up: "calmer", down: "more reactive" },
  socialEnergy: { up: "more outgoing", down: "more reserved" },
  confidence: { up: "more assured", down: "less sure of yourself" },
  drive: { up: "more driven", down: "more laid-back" },
  risk: { up: "bolder", down: "more careful" },
  creativity: { up: "more exploratory", down: "more practical-minded" },
  discipline: { up: "more structured", down: "more improvised" },
  empathy: { up: "more attuned to others", down: "more self-focused" },
  optimism: { up: "more optimistic", down: "more guarded" },
  independence: { up: "more independent", down: "more collaborative" },
};
function computeLivingNotes(result, growth){
  const notes = [];
  if (!growth || !growth.hasPrevious){
    notes.push("This is your first read on this device, everything from here is a comparison point.");
    return notes;
  }

  // Note 1: archetype/soul continuity + the single biggest recent shift,
  // phrased with the curated trend map when it's one of those dims.
  if (growth.archetypeChange.changed){
    notes.push(`Your read shifted from ${growth.archetypeChange.from} to ${growth.archetypeChange.to} recently, worth a proper look on Growth.`);
  } else {
    const trendDim = growth.majorChanges.find(c => DIM_TREND_PHRASES[Object.keys(DIM_LABELS).find(k => DIM_LABELS[k] === c.label)]);
    const dimKey = trendDim ? Object.keys(DIM_LABELS).find(k => DIM_LABELS[k] === trendDim.label) : null;
    const phrase = dimKey ? DIM_TREND_PHRASES[dimKey][trendDim.delta > 0 ? "up" : "down"] : null;
    notes.push(phrase
      ? `You're still mostly ${result.archetype.name.replace(/^The /, "")}, but your last few reads look ${phrase}.`
      : `You're still mostly ${result.archetype.name.replace(/^The /, "")}, holding fairly steady since your last read.`);
  }

  // Note 2: confidence trend, straight from computeGrowthTimeline.
  if (growth.confidenceTrend.direction === "up"){
    notes.push(`Confidence has risen across your recent runs, ${growth.confidenceTrend.from}% to ${growth.confidenceTrend.to}%.`);
  } else if (growth.confidenceTrend.direction === "down"){
    notes.push(`Confidence has softened a little lately, ${growth.confidenceTrend.from}% to ${growth.confidenceTrend.to}%, often just means you're between two real types right now.`);
  } else if (growth.confidenceTrend.direction === "flat"){
    notes.push("Confidence has stayed stable across your recent assessments.");
  }

  // Note 3: the clearest single improvement, if there is one.
  if (growth.improvedTendencies.length){
    notes.push(`Your ${growth.improvedTendencies[0].label.toLowerCase()} has grown a little since your last check-in.`);
  }

  return notes.slice(0, 3);
}

/* ---------------- WEEKLY PERSONA SNAPSHOT --------------------------------
   A named, curated subset of the same before/after deltas Growth already
   computes, framed by real elapsed time rather than an assumed weekly
   cadence (retakes are irregular) — "Since your last check-in, 4 days
   ago" instead of pretending everyone retakes on a schedule. */
// Labeled "Self-Confidence" (not "Confidence") specifically because this
// card sits right next to Growth's "Confidence Trend", which is a
// completely different number — how sure the assessment itself is about
// which archetype fits you, not the personality trait. Same underlying
// dimension/calculation either way, this only changes the label.
const SNAPSHOT_DIMS = [
  { key: "confidence", label: "Self-Confidence" },
  { key: "patience", label: "Patience" },
  { key: "emotionalStability", label: "Stress", invert: true },
  { key: "socialEnergy", label: "Social Energy" },
];
function computeWeeklySnapshot(result, growth){
  if (!growth || !growth.hasPrevious) return null;
  const daysSince = Math.max(0, Math.round((Date.now() - growth.previous.timestamp) / 86400000));
  const prevDims = growth.previous.normDims || {};
  const deltas = SNAPSHOT_DIMS.map(({ key, label, invert }) => {
    const before = pct(prevDims[key] || 0), after = pct(result.normDims[key] || 0);
    const delta = invert ? before - after : after - before;
    return { label, delta };
  });
  return { daysSince, deltas, hasNotableChange: deltas.some(d => Math.abs(d.delta) >= 5) };
}

/* ---------------- SMART RETAKE NUDGE -------------------------------------
   Replaces a flat "Retake Assessment" everywhere with a line that
   actually reflects whether a retake seems worth it right now, using
   only signals Forge already has (days since last read, journal
   engagement, improve check-in state) — never a hard sell, always
   framed as "might," never "must." */
function computeRetakeNudge(growth, journalStreak){
  if (!growth || !growth.hasPrevious){
    return "Curious how you'd read today? There's no baseline yet, so this first one sets it.";
  }
  const daysSince = Math.max(0, Math.round((Date.now() - growth.previous.timestamp) / 86400000));
  const engaged = (journalStreak && journalStreak.current >= 3) || growth.improvedTendencies.length >= 2;
  if (engaged){
    return "Your recent check-ins suggest real movement, a retake could reveal a new pattern.";
  }
  if (daysSince >= 21){
    return "It's been a while since your last read, you may have changed enough for a new one.";
  }
  if (daysSince >= 10){
    return "A retake could reveal whether anything's actually shifted since last time.";
  }
  return "The most honest way to check where you land is to just take it again.";
}

function buildResultFromDecoded(decoded, code){
  const normDims = decoded.normDims;
  // decoded.archetype is whatever archIdx was baked into the code string at
  // encode time -- correct then, but a stale second source of truth the
  // moment matchArchetype's own scoring changes (e.g. a later engine
  // update), since everything below it (ranked, runnerUp, subProfile,
  // buildProfileExtras) already recomputes fresh from normDims. Using
  // match.primary here instead means the archetype header and the Full
  // Ranking list can never disagree about who's #1, on any page that
  // reaches a result this way (reloading/bookmarking your own result,
  // viewing someone else's shared code) -- same single source already used
  // by computeResult() and buildResultFromLatestTimeline().
  const match = matchArchetype(normDims);
  // applyStoredConfidence: decodeCode() has no confidence field to fall
  // back on (it isn't part of the code string), but this device's own
  // timeline does, if this code happens to be one of this device's own
  // past results -- reload/bookmark/?code= all reach a result this way,
  // and all three are really "look at MY result again," not a fresh
  // computation. A code with no matching local entry (e.g. someone else's
  // shared code) has nothing to borrow from, so it keeps the session-less
  // estimate, same as before.
  const extras = applyStoredConfidence(
    buildProfileExtras(normDims, match.primary, match.ranked, null),
    code
  );
  return {
    name: decoded.name || "",
    meta: { resultDepth: decoded.depthTier },
    normDims,
    archetype: match.primary,
    runnerUp: match.runnerUp,
    ranked: match.ranked,
    subProfile: computeSubProfile(normDims, match.primary),
    code,
    careers: computeCareers(normDims),
    relationships: computeRelationshipStyles(normDims),
    traits: computeMeasuredTraits(normDims),
    consistency: null,
    ...extras,
  };
}

