/* =========================================================================
   STORY PACK (data only). The vocabulary the pair article is written from (js/forge/story.js).

   Nothing here scores anyone. The story engine reads the two people's facets (and the characters they resemble),
   compares them with the weights written here, and picks the authored line that fits. Add a line, get a line.

   behave     what someone HIGH or LOW on a facet does on a team. Every phrase starts with a base-form verb so the engine can
              say "would plan every move" or "plans every move".
   share      what two people HIGH or LOW on the same facet have in common ("both refuse to quit").
   tracks     per chapter, the personality dimensions the chapter talks about. A track = facet weights + four lines:
              hi / lo (one person is clearly higher: {h} the higher, {l} the lower) and both.hi / both.lo ({A} {B}).
   frames     per lens, how the crossover paragraph opens; verdicts close it.
   lens       per lens, one opening and one closing line per chapter, so each lens tells its own story, not the same story reworded.
   Tokens: {A} {B} (the two people), {h} {l} (higher / lower on a track). Keep every line friendly, PG and free of numbers.
   ========================================================================= */
(function(F){
  "use strict";
  if (!F.packs) return;
  const A = F.packs.add;

  A("story", [
    /* ---------------------------------------------------------------- facet vocabulary */
    { id: "behave", data: {
      structure:  { hi: "plan every move before anyone else has finished thinking", lo: "improvise, trusting it will come together" },
      initiative: { hi: "take point without being asked", lo: "wait for the right moment before stepping in" },
      persist:    { hi: "refuse to quit, long after it stops being sensible", lo: "know when to walk away and try something else" },
      warmth:     { hi: "make sure nobody gets left behind", lo: "keep feelings out of it, staying on the task" },
      social:     { hi: "talk to everyone in the room", lo: "work best from a quiet corner" },
      humor:      { hi: "keep spirits up with a joke at exactly the wrong moment", lo: "stay perfectly serious when it matters" },
      autonomy:   { hi: "go it alone, trusting their own judgement", lo: "check in with the team before any big move" },
      steadiness: { hi: "stay calm when everything goes wrong", lo: "feel every bit of the pressure, visibly" },
      flex:       { hi: "adapt on the fly when the plan falls apart", lo: "stick to the routine that already works" },
      boldness:   { hi: "go straight at the risky option", lo: "check every exit before committing" },
      trust:      { hi: "give people the benefit of the doubt", lo: "want proof before trusting anyone" },
      compete:    { hi: "treat everything as a race worth winning", lo: "care more about the team winning than about being the winner" },
      patience:   { hi: "wait it out while everyone else panics", lo: "want it fixed now, not eventually" },
      optimism:   { hi: "insist it will all work out", lo: "expect the worst, packing for it just in case" },
      analysis:   { hi: "work out exactly how it all fits together", lo: "trust their gut over the spreadsheet" },
      explore:    { hi: "want to see what is around the next corner", lo: "stick with the ground they already know" },
      invent:     { hi: "build something new out of whatever is lying around", lo: "stick with what is proven to work" }
    } },
    { id: "share", data: {
      structure:  { hi: "plan before they act", lo: "are happiest improvising" },
      initiative: { hi: "step forward when it counts", lo: "would rather watch before acting" },
      persist:    { hi: "refuse to quit", lo: "know when to let go" },
      warmth:     { hi: "care about the people around them", lo: "keep their distance from sentiment" },
      social:     { hi: "come alive around other people", lo: "recharge best alone" },
      humor:      { hi: "reach for a joke under pressure", lo: "take things seriously" },
      autonomy:   { hi: "think for themselves", lo: "believe in the team over the individual" },
      steadiness: { hi: "stay level when it gets loud", lo: "feel pressure keenly" },
      flex:       { hi: "adapt without complaining", lo: "like a dependable routine" },
      boldness:   { hi: "take the risk", lo: "stay careful" },
      trust:      { hi: "give people a chance", lo: "keep their guard up" },
      compete:    { hi: "play to win", lo: "would rather cooperate than compete" },
      patience:   { hi: "can wait things out", lo: "hate waiting" },
      optimism:   { hi: "believe things work out", lo: "expect trouble" },
      analysis:   { hi: "think things through", lo: "go with instinct" },
      explore:    { hi: "chase the unknown", lo: "prefer the familiar" },
      invent:     { hi: "make new things", lo: "trust proven methods" }
    } },

    /* ---------------------------------------------------------------- tracks: the personality-driven sentences of each chapter */
    { id: "tracks", data: {
      balance: [
        { id: "drive", w: { initiative: 1, boldness: 0.6, persist: 0.4 },
          hi: "{h} pushes things forward", lo: "{l} makes sure the push goes somewhere sensible",
          both: { hi: "You both push, so momentum is never the problem. Steering sometimes is.", lo: "Neither of you pushes hard, so you move at an easy pace and rarely rush each other." } },
        { id: "structure", w: { structure: 1, analysis: 0.5, persist: 0.3 },
          hi: "{h} keeps the plan and the calendar", lo: "{l} keeps it loose and leaves room for the unplanned",
          both: { hi: "You both like a plan, so things get done and nobody has to ask twice.", lo: "You're both loose about plans, so the day is whatever you make it." } },
        { id: "heart", w: { warmth: 1, humor: 0.5, social: 0.4 },
          hi: "{h} carries the emotional temperature of the room", lo: "{l} brings the cooler head",
          both: { hi: "You're both warm, so there is always someone checking how the other is doing.", lo: "You're both practical about feelings, which is efficient and occasionally a little cool." } },
        { id: "steady", w: { steadiness: 1, patience: 0.6 },
          hi: "{h} is the calm one when things wobble", lo: "{l} feels the wobble first, which makes {l} a useful early warning",
          both: { hi: "You're both hard to rattle, so a bad day rarely becomes a bad week.", lo: "You both feel pressure quickly, so agree on a signal for 'pause'." } }
      ],
      struggle: [
        { id: "pace", w: { patience: 1, steadiness: 0.4, structure: 0.3 },
          hi: "{h} is happy to take things slowly", lo: "{l} wants it done now",
          both: { hi: "You're both patient, so the risk is that nobody ever says 'let's decide'.", lo: "You're both impatient, so small delays can feel bigger than they are." },
          gap: "You may find yourselves running at different speeds, and each reading the other's pace as a comment on them." },
        { id: "space", w: { autonomy: 1, social: -0.6 },
          hi: "{h} needs time alone to recharge", lo: "{l} would rather recharge in company",
          both: { hi: "You both need your own space, so remember to check in before the silence gets long.", lo: "You both want company, so being alone at the wrong time hits you both hard." },
          gap: "One of you hears 'I need space' as rejection and the other means it as self-care. Say which it is." },
        { id: "control", w: { initiative: 0.8, compete: 0.6, autonomy: 0.5, flex: -0.6 },
          hi: "{h} likes to be the one steering", lo: "{l} goes along until it matters, then digs in",
          both: { hi: "You both reach for the wheel, so decide in advance who drives on which road.", lo: "Neither of you grabs the wheel, so a plan can drift while you both politely defer." },
          gap: "The risk is a pattern: one of you proposes, the other quietly resents it, and nobody names it." },
        { id: "risk", w: { boldness: 1, optimism: 0.4, structure: -0.4 },
          hi: "{h} is quicker to take a risk", lo: "{l} sees the downside first",
          both: { hi: "You both back a bold call, so the risk is rarely too small.", lo: "You both play it safe, so your biggest risk is never trying the thing you'd love." },
          gap: "A decision that feels exciting to one of you can feel reckless to the other. Agree what 'too far' means before you get there." }
      ],
      communication: [
        { id: "voice", w: { social: 1, humor: 0.5, boldness: 0.4, autonomy: -0.3 },
          hi: "{h} talks things through out loud and works them out as they speak", lo: "{l} thinks first and speaks once it is worked out",
          both: { hi: "You both talk freely, so little stays unsaid for long, though sometimes nobody gets a word in.", lo: "You're both on the quiet side. Silence will feel comfortable, and some things will go unsaid." } },
        { id: "direct", w: { boldness: 0.6, compete: 0.6, warmth: -0.8, trust: -0.2, autonomy: 0.4 },
          hi: "{h} says it straight, even when it stings", lo: "{l} softens things and chooses words for how they will land",
          both: { hi: "You're both blunt, so you always know where you stand.", lo: "You're both gentle communicators, which is kind, but hard topics can wait too long." } },
        { id: "listen", w: { warmth: 1, patience: 1, social: -0.3 },
          hi: "{h} listens all the way to the end of the sentence", lo: "{l} tends to start answering before the other has finished",
          both: { hi: "You're both good listeners, so conversations go deep.", lo: "Neither of you is a natural listener. Check that you've both actually understood." } }
      ],
      decision: [
        { id: "speed", w: { initiative: 1, boldness: 1, analysis: -0.8, patience: -0.5 },
          hi: "{h} decides fast and corrects course on the way", lo: "{l} wants the facts before committing",
          both: { hi: "You both decide quickly, so things move fast and occasionally too fast.", lo: "You both like to think it over, so decisions are careful and sometimes very slow." } },
        { id: "evidence", w: { analysis: 1, structure: 0.6, explore: 0.2 },
          hi: "{h} wants the reasoning laid out", lo: "{l} goes with what feels right",
          both: { hi: "You both want the logic on the table, so decisions are well argued.", lo: "You both trust your instincts, so decisions are quick and very personal." } },
        { id: "gamble", w: { boldness: 1.2, optimism: 0.5, structure: -0.5 },
          hi: "{h} is happy to bet on a good feeling", lo: "{l} wants the downside covered first",
          both: { hi: "You both back a bold call, so the question is who remembers the fallback.", lo: "You both protect the downside, so plans are sturdy and a little timid." } }
      ],
      conflict: [
        { id: "heat", w: { compete: 1, initiative: 0.6, steadiness: -0.8, patience: -0.6 },
          hi: "{h} reacts fast and hot, then moves on", lo: "{l} stays level and takes time before answering",
          both: { hi: "You both run warm, so arguments are loud, short and rarely personal.", lo: "You both run cool, so arguments are quiet, and issues can sit unspoken." } },
        { id: "repair", w: { warmth: 0.8, patience: 0.8, flex: 0.6, trust: 0.5 },
          hi: "{h} makes the first move to repair things", lo: "{l} needs a little time before making up",
          both: { hi: "You both reach out quickly afterwards, so a row rarely outlasts the evening.", lo: "Neither of you apologises first, so a standoff can outlast the argument." } },
        { id: "retreat", w: { autonomy: 0.7, social: -0.5, boldness: -0.6, warmth: -0.2 },
          hi: "{h} would rather withdraw than argue it out", lo: "{l} wants it said out loud and settled today",
          both: { hi: "You both retreat to think, so disagreements can quietly go underground.", lo: "You both want it out in the open, so you settle things fast." } }
      ]
    } },

    /* ---------------------------------------------------------------- crossover: how two characters (or two people) interact */
    { id: "frames", data: {
      friendship: [
        "If {a} and {b} worked together, {a} would {pa} while {b} would {pb}.",
        "On the same team, {a} {pa3}. {b}, meanwhile, {pb3}.",
        "Put {a} and {b} in the same crew and the split is obvious at once: {a} {pa3}, and {b} {pb3}."
      ],
      romance: [
        "If {a} and {b} ever crossed paths, {a} would {pa} and {b} would {pb}.",
        "Side by side, {a} {pa3} while {b} {pb3}.",
        "Imagine {a} and {b} as a pair: {a} would {pa}, and {b} would {pb}."
      ],
      companionship: [
        "Sharing an office, {a} would {pa} while {b} would {pb}.",
        "Across the same working day, {a} {pa3} and {b} {pb3}.",
        "Put {a} and {b} on one project and {a} would {pa}, while {b} would {pb}."
      ]
    } },
    { id: "bridge", data: {
      shared: [
        "Neither does it the same way, yet both {s}.",
        "They are less different than they look: both {s}.",
        "And underneath it, both {s}."
      ],
      none: [
        "They have little in common on paper, which is exactly what makes the pairing interesting.",
        "On paper they share almost nothing, so every shared moment would be a surprise."
      ],
      value: "Both are driven by {v}.",
      verdict: {
        twin: ["That similarity would make them quick allies, and just as quick to repeat each other's mistakes.", "They'd understand each other without trying. Maybe a little too well."],
        mid: ["That difference is exactly why they work.", "Different instincts, same direction. That is a good team."],
        far: ["It would take some translating, but nobody would forget the result.", "They'd clash first and respect each other second, which is a classic way to start a good story."]
      }
    } },

    /* ---------------------------------------------------------------- per-lens chapter openings and closings */
    { id: "lens", data: {
      friendship: {
        overall: ["The number is only the headline. Here's the story behind it.", "Treat it as a mood, not a verdict: this is how the friendship tends to feel."],
        why: ["Start with what holds the friendship together, then where it bends.", ""],
        balance: ["Good friends are rarely the same person twice. Here's how the two of you divide the work of being a duo.", "Between you, someone usually has to be the planner, and someone the reason there's a story to tell."],
        struggle: ["Every friendship has its friction points. Naming them is half the fix.", "Friends can disagree about plenty and still be on each other's side. These are the places it happens."],
        communication: ["Friends talk in the gaps between plans: the banter, the group chats, the late replies.", "A shared inside joke does more for a friendship's communication than any rule."],
        decision: ["Friends decide things constantly: where to eat, what to do, whose turn it is to choose.", "When in doubt, take turns choosing. It solves most friendship decisions."],
        conflict: ["Friends fight about small things loudly and big things rarely. Here's how you do it.", "Friendships survive on repair. The faster you can laugh about it, the stronger you are."],
        characters: ["Every duo has a fictional twin. Here's who the two of you would be on screen.", ""],
        worlds: ["Drop the two of you into other worlds and the personalities show up fast.", ""],
        teams: ["Every great story has a team. Here are the ones that would have you both on the roster.", ""],
        stories: ["Longer stories, because the best friendships end up in them.", ""],
        situations: ["The same chemistry, out in the world, in situations nobody planned for.", ""],
        ending: ["Putting it together.", "Whatever the number says, the friendships worth having are the ones that ask for a little effort."]
      },
      romance: {
        overall: ["The number is only the headline. Here's the story behind it.", "Take it as a mood, not a verdict: this is how the relationship tends to feel."],
        why: ["Start with what holds you together, then where it asks for care.", ""],
        balance: ["Partnerships work because two people cover each other's gaps. Here's how you divide the emotional and practical load.", "Between you, someone keeps the plan and someone keeps the warmth. Notice who is who."],
        struggle: ["No pairing is frictionless. These are the places you'd feel it, said gently.", "Differences are not warnings. They are just the places that need a conversation."],
        communication: ["In a relationship, how you say something matters nearly as much as what you say.", "Say the soft thing out loud sooner than feels necessary. It almost always lands better than expected."],
        decision: ["Big decisions are easier when you know how each of you makes them.", "Agree on how you'll decide the big things before you face one."],
        conflict: ["Every couple argues. What matters is how you argue and how you make up.", "Repair matters more than being right. The sooner one of you reaches out, the better you do."],
        characters: ["Stories love a pair. Here's the fictional duo the two of you resemble.", ""],
        worlds: ["Drop the two of you into other worlds and see who the pair would be.", ""],
        teams: ["Great stories have great partnerships inside a team. Here's where you'd both fit.", ""],
        stories: ["A few stories about the two of you, written from how you're wired.", ""],
        situations: ["The same chemistry, in the life you'd build.", ""],
        ending: ["Putting it together.", "No score decides a relationship. What you do with the differences does."]
      },
      companionship: {
        overall: ["The number is only the headline. Here's the story behind it.", "Treat it as a mood, not a verdict: this is how the two of you tend to work side by side."],
        why: ["Start with how the two of you actually work side by side.", ""],
        balance: ["Good working pairs split the work without arguing about it. Here's how you naturally do.", "Between you, someone usually holds the plan and someone holds the pace."],
        struggle: ["Even good pairs have friction points. These are yours, plainly.", "None of this is a flaw. It's the list of things worth agreeing on early."],
        communication: ["In everyday life, good communication is mostly clarity: who is doing what, by when.", "Agree where things get written down and you'll avoid most misunderstandings."],
        decision: ["Shared decisions go smoothly when you know each other's defaults.", "Say who has the final say on what, before it matters."],
        conflict: ["Disagreements at work, at home or in the family are easier when you know each other's style.", "Be specific about what you disagree on. It shrinks the argument."],
        characters: ["Even ordinary pairs have fictional twins. Here are yours.", ""],
        worlds: ["Drop the two of you into other worlds and the working styles show fast.", ""],
        teams: ["Every working pair has a team it would slot into. Here are yours.", ""],
        stories: ["A few stories about the two of you at work, written from how you're wired.", ""],
        situations: ["The same chemistry, in ordinary days and extraordinary ones.", ""],
        ending: ["Putting it together.", "Good everyday pairs are not identical. They simply agree on the things that matter."]
      }
    } },

    /* ---------------------------------------------------------------- what the number means, by lens and band */
    { id: "meaning", data: {
      friendship: {
        "Exceptional": "A friendship other people notice. You'd fall into step almost without trying.",
        "Excellent": "A strong friendship with real range: you'd enjoy the quiet days and the wild ones.",
        "Good": "A dependable friendship. Easy most days, with a couple of habits worth negotiating.",
        "Mixed": "A friendship that works because of its differences, not despite them. It would ask for some effort.",
        "Difficult": "A friendship that would need patience. You'd find your rhythm, but not instantly.",
        "Extremely Incompatible": "On paper, an unlikely friendship. If it happened, it would be earned, and probably unforgettable."
      },
      romance: {
        "Exceptional": "A rare kind of ease. The things that usually take couples years to work out already sit in your favour.",
        "Excellent": "A strong match with real warmth. The differences between you are the kind that deepen things.",
        "Good": "A solid foundation, with a few differences worth talking about out loud.",
        "Mixed": "A pairing that would ask for care. Plenty to build on, and some things you'd have to say plainly.",
        "Difficult": "A pairing that would need real work. Not impossible, just not automatic.",
        "Extremely Incompatible": "Almost every default sits in a different place. It could still work with effort, but the effort would be real."
      },
      companionship: {
        "Exceptional": "A remarkably easy pairing. In ordinary life you'd barely have to think about it.",
        "Excellent": "A strong everyday fit. Plans stick, space is respected and the rhythm is shared.",
        "Good": "A practical, reliable fit, with a couple of working habits worth agreeing on.",
        "Mixed": "A pairing that works with a little structure. Clear roles help a lot.",
        "Difficult": "A pairing that would need clear agreements to run smoothly in day-to-day life.",
        "Extremely Incompatible": "Very different defaults. Day to day, you'd need explicit rules to keep things easy."
      }
    } }
  ]);
})(typeof Forge !== "undefined" ? Forge : (globalThis.Forge = globalThis.Forge || {}));
if (typeof module !== "undefined" && module.exports) module.exports = Forge;
