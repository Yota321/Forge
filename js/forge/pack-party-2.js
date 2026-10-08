/* =========================================================================
   PARTY PACK 2 (data only): everything the expanded Party results read beyond pack-party.js.
     roles / rolesMeta   six more roles, and an RPG class for every role (original 12 + new 6)
     adventures          "Top Adventure"          survivalScenarios   "Top Survival Scenario"
     sitcoms             "Top Sitcom"             rpgParties          "Top RPG Party"
     leadership          "Top Leadership Structure"
     config/facetWeak    one "where the group is thin" line per facet
     config/chemistry    alternative phrasings for the chemistry paragraph (picked deterministically from the names)
   Scoring fields are the same as in pack-party.js (needs / spread / peak against the group's facets). Tokens:
   role ids ({leader} {peace} {chaos} {solver} {detail} {sacrifice} {push} {carry} {heart} {scout} {skeptic} {strategist}
   {tank} {negotiator} {inventor} {comic} {support} {wildcard}), {names}, {n}.
   ========================================================================= */
(function(F){
  "use strict";
  if (!F.packs) return;
  const A = F.packs.add;

  A("roles", [
    { id: "tank", icon: "🧱", title: "Who takes the hits?", name: "The Tank", weights: { steadiness: 1.2, persist: 1, boldness: 0.6, patience: 0.5, warmth: 0.3, compete: 0.2 },
      line: "{name} stands in the doorway and says 'go on, I've got this.'", cast: "{name} absorbs the pressure so everyone else can work." },
    { id: "negotiator", icon: "🤝", title: "Who talks you out of trouble?", name: "The Negotiator", weights: { social: 1, warmth: 0.8, flex: 0.8, patience: 0.6, analysis: 0.4, humor: 0.4 },
      line: "{name} can talk to anyone and usually walks away with a deal.", cast: "{name} turns standoffs into conversations." },
    { id: "inventor", icon: "🔧", title: "Who builds the weird solution?", name: "The Inventor", weights: { invent: 1.5, explore: 0.8, flex: 0.5, analysis: 0.5, persist: 0.3 },
      line: "{name} will assemble something unbelievable from whatever is lying around.", cast: "{name} turns scrap and curiosity into answers." },
    { id: "comic", icon: "😂", title: "Who keeps spirits up with jokes?", name: "The Comic Relief", weights: { humor: 1.5, social: 0.8, optimism: 0.7, flex: 0.4 },
      line: "{name} makes the worst moment of the trip the one you laugh about for years.", cast: "{name} makes the hard parts lighter." },
    { id: "support", icon: "🤲", title: "Who always has everyone's back?", name: "The Support", weights: { warmth: 1, trust: 0.9, steadiness: 0.6, patience: 0.7, compete: -0.6, initiative: -0.2 },
      line: "{name} notices who needs something before they ask.", cast: "{name} is the one everyone quietly relies on." },
    { id: "wildcard", icon: "🃏", title: "Who is the wildcard?", name: "The Wildcard", weights: { flex: 1.2, autonomy: 0.9, boldness: 0.7, structure: -0.6, trust: -0.2 },
      line: "{name} does the one thing nobody planned for, and it turns out to be the thing that worked.", cast: "{name} is impossible to predict and often exactly what's needed." },
  ]);

  A("rolesMeta", [
    { id: "leader", rpg: "Paladin" }, { id: "peace", rpg: "Cleric" }, { id: "chaos", rpg: "Sorcerer" }, { id: "solver", rpg: "Wizard" },
    { id: "detail", rpg: "Ranger" }, { id: "sacrifice", rpg: "Fighter" }, { id: "push", rpg: "Monk" }, { id: "carry", rpg: "Druid" },
    { id: "heart", rpg: "Bard" }, { id: "scout", rpg: "Rogue" }, { id: "skeptic", rpg: "Warlock" }, { id: "strategist", rpg: "Tactician" },
    { id: "tank", rpg: "Barbarian" }, { id: "negotiator", rpg: "Diplomat" }, { id: "inventor", rpg: "Artificer" }, { id: "comic", rpg: "Jester" },
    { id: "support", rpg: "Healer" }, { id: "wildcard", rpg: "Wild Mage" },
  ]);

  A("adventures", [
    { id: "temple", icon: "🏺", name: "The Lost Temple Expedition", needs: { explore: 1, analysis: 0.7, boldness: 0.6, persist: 0.6, patience: 0.4 },
      text: "You'd find the lost temple. {detail} reads the carvings, {scout} spots the trap and {leader} makes the call about whether the treasure is worth taking." },
    { id: "heist", icon: "🎩", name: "A Heist at a Very Fancy Party", needs: { flex: 0.9, social: 0.7, analysis: 0.7, boldness: 0.6, structure: 0.4 },
      text: "You'd pull off the elegant heist. {negotiator} works the guest list, {strategist} has the floor plan memorized and {chaos} 'borrows' exactly the wrong painting, which somehow helps." },
    { id: "rescue", icon: "🚁", name: "A Rescue Across Enemy Lines", needs: { boldness: 0.8, steadiness: 0.8, trust: 0.7, initiative: 0.7, persist: 0.7 },
      text: "You'd bring everyone home. {leader} calls the route, {tank} holds the narrow gap and {peace} keeps the rescued calm until you're clear." },
    { id: "mountains", icon: "⛰️", name: "A Long Quest Across the Mountains", needs: { persist: 1, trust: 0.8, steadiness: 0.7, warmth: 0.6, optimism: 0.4 },
      text: "You'd reach the far side, slowly. {push} won't let anyone quit, {carry} keeps the packs balanced and {heart} makes the cold nights bearable." },
    { id: "road", icon: "🚐", name: "A Road Trip That Becomes Legend", needs: { flex: 0.9, humor: 0.8, social: 0.7, optimism: 0.6, structure: -0.6 },
      text: "You'd take the wrong exit on purpose. {comic} runs the playlist, {scout} finds the diner, and the trip you planned for a weekend turns into a story people retell for years." },
    { id: "detective", icon: "🔎", name: "The Case Nobody Else Could Solve", needs: { analysis: 1, explore: 0.7, persist: 0.7, autonomy: 0.4, structure: 0.4 },
      text: "You'd crack it. {detail} notices the inconsistency, {solver} connects it to the one thing it shouldn't connect to, and {skeptic} saves you from the obvious suspect." },
    { id: "sailing", icon: "⛵", name: "Sailing to the Edge of the Map", needs: { explore: 1, boldness: 0.8, optimism: 0.7, flex: 0.7, trust: 0.5 },
      text: "You'd sail past where the chart ends. {scout} takes the lookout, {leader} names the ship and {carry} keeps it from sinking while everyone else is admiring the view." },
    { id: "salvage", icon: "🚀", name: "A Space Salvage Run Gone Wrong", needs: { flex: 0.9, invent: 0.8, humor: 0.7, boldness: 0.6, autonomy: 0.4 },
      text: "You'd make it back with the wrong cargo and a better story. {inventor} rewires the airlock, {wildcard} says 'what if we just left?' and {tank} pretends not to be nervous." },
    { id: "monster", icon: "🐉", name: "A Monster-Hunting Contract", needs: { boldness: 0.8, persist: 0.8, analysis: 0.6, steadiness: 0.6, compete: 0.4 },
      text: "You'd take the contract and get paid. {detail} researches the beast, {tank} takes the first hit and {strategist} has the plan for the second." },
    { id: "town", icon: "🏘️", name: "Building a Town From Nothing", needs: { structure: 0.8, persist: 0.9, warmth: 0.7, trust: 0.7, invent: 0.5 },
      text: "You'd build a town that outlasts you. {strategist} draws the plan, {carry} does the first hundred days of work and {heart} makes sure it feels like home." },
    { id: "tournament", icon: "🏆", name: "The Tournament Everyone Underestimates You In", needs: { compete: 0.9, persist: 0.8, optimism: 0.6, boldness: 0.6, humor: 0.4 },
      text: "You'd win the tournament nobody expected you to. {push} drags everyone through the early rounds, {chaos} confuses the favorite and {leader} does the speech afterwards." },
    { id: "diplomacy", icon: "🕊️", name: "A Mission Between Two Rival Kingdoms", needs: { warmth: 0.8, patience: 0.9, analysis: 0.6, trust: 0.7, compete: -0.6 },
      text: "You'd get the treaty signed. {negotiator} finds common ground, {peace} defuses the evening banquet and {detail} spots what the fine print was hiding." },
    { id: "academy", icon: "🏫", name: "Escaping a Strange Academy After Dark", needs: { explore: 0.8, flex: 0.8, humor: 0.6, trust: 0.7, boldness: 0.5 },
      text: "You'd get out, barely. {scout} finds the unlocked window, {comic} keeps everyone from panicking and {solver} works out why the portraits keep moving." },
  ]);

  A("survivalScenarios", [
    { id: "outbreak", icon: "🧟", name: "A Resident Evil-style outbreak", needs: { steadiness: 1, flex: 0.9, boldness: 0.6, structure: 0.6, trust: 0.7 },
      text: "In a Resident Evil-style outbreak your group would become a STARS-like team: {leader} gives the orders, {solver} reads the files nobody else will, {scout} checks the next room and {peace} keeps everyone's head clear." },
    { id: "wasteland", icon: "🚙", name: "A wasteland with one working vehicle", needs: { persist: 1, flex: 0.9, steadiness: 0.7, boldness: 0.7, trust: 0.5 },
      text: "In a wasteland you'd survive on one good vehicle. {inventor} keeps it running, {leader} picks where to drive and {tank} guards the fuel like it's family." },
    { id: "island", icon: "🏝️", name: "A deserted island", needs: { flex: 1, structure: 0.8, warmth: 0.7, persist: 0.8, trust: 0.7 },
      text: "Stranded on an island you'd be rescued in good shape. {carry} builds the shelter, {scout} finds the water and {heart} keeps morale from sinking." },
    { id: "first-contact", icon: "👽", name: "An alien first-contact situation", needs: { explore: 0.9, analysis: 0.8, steadiness: 0.8, warmth: 0.6, flex: 0.7 },
      text: "Meeting aliens, you'd start the conversation well. {negotiator} opens with a handshake, {solver} works out the language and {skeptic} asks, quietly, if anyone checked the ship." },
    { id: "winter", icon: "❄️", name: "A long winter in an isolated cabin", needs: { patience: 1, warmth: 0.8, structure: 0.7, steadiness: 0.8, social: 0.3 },
      text: "Snowed in for months, you'd come out closer. {carry} rations the firewood, {peace} referees the board games and {comic} keeps the cabin from becoming a horror film." },
    { id: "blackout", icon: "🌃", name: "A city-wide blackout", needs: { flex: 0.9, trust: 0.8, warmth: 0.7, initiative: 0.6, steadiness: 0.7 },
      text: "In the dark, your group would be the one the building relies on. {leader} organizes the stairwells, {support} checks on the neighbors and {inventor} improvises light from a bicycle." },
    { id: "mansion", icon: "🏚️", name: "A haunted mansion overnight", needs: { boldness: 0.7, steadiness: 0.8, humor: 0.7, trust: 0.7, analysis: 0.5 },
      text: "In the haunted mansion you'd leave by dawn with the deed. {tank} opens the creaky door, {comic} keeps the screaming to a minimum and {detail} figures out which of the portraits is real." },
    { id: "dungeon", icon: "🗝️", name: "A dungeon with no map", needs: { explore: 0.9, flex: 0.9, boldness: 0.7, trust: 0.7, analysis: 0.5 },
      text: "In the dungeon you'd find the way out and the treasure. {scout} goes ahead, {solver} works out the riddles and {wildcard} does the thing that opens the third door." },
  ]);

  A("sitcoms", [
    { id: "b99", icon: "🚔", name: "Brooklyn Nine-Nine", needs: { humor: 0.9, trust: 0.9, persist: 0.6, initiative: 0.5, warmth: 0.7, structure: 0.2 },
      text: "Your sitcom dynamic resembles Brooklyn Nine-Nine: {leader} commands the squad, {comic} ruins the serious moment on purpose and {strategist} shows up with a binder." },
    { id: "office", icon: "🖇️", name: "The Office", needs: { social: 0.8, humor: 0.9, structure: -0.5, warmth: 0.6, compete: 0.3 },
      text: "Your sitcom dynamic resembles The Office: {chaos} runs the meeting, {carry} runs everything else and {heart} organizes the party nobody asked for." },
    { id: "friends", icon: "☕", name: "Friends", needs: { social: 1, warmth: 0.9, humor: 0.8, trust: 0.8, flex: 0.4 },
      text: "Your sitcom dynamic resembles Friends: the same sofa, the same coffee, {heart} hosting and {comic} somehow turning every plan into a bit." },
    { id: "parks", icon: "🏛️", name: "Parks and Recreation", needs: { optimism: 0.9, initiative: 0.8, warmth: 0.8, persist: 0.7, humor: 0.6, structure: 0.5 },
      text: "Your sitcom dynamic resembles Parks and Recreation: {push} has a seven-point plan, {support} has everyone's back and {skeptic} is deeply unimpressed by all of it, lovingly." },
    { id: "community", icon: "🎓", name: "Community", needs: { humor: 0.8, flex: 0.8, social: 0.6, invent: 0.6, structure: -0.6, trust: 0.5 },
      text: "Your sitcom dynamic resembles Community: {chaos} turns an ordinary day into an event, {inventor} builds a blanket fort that functions and {detail} notices the in-joke before it happens." },
    { id: "lasso", icon: "⚽", name: "Ted Lasso", needs: { optimism: 1, warmth: 0.9, trust: 0.7, humor: 0.6, patience: 0.6 },
      text: "Your sitcom dynamic resembles Ted Lasso: {heart} believes in everyone, {support} brings the biscuits and {skeptic} slowly comes around." },
  ]);

  A("rpgParties", [
    { id: "balanced", icon: "⚖️", name: "A Balanced Party", needs: { trust: 0.6, flex: 0.5, steadiness: 0.5 }, spread: { analysis: 0.3, warmth: 0.3, boldness: 0.3 },
      text: "A balanced adventuring party, with a front line, a healer and someone clever, which is the kind that actually finishes campaigns." },
    { id: "glass-cannon", icon: "💥", name: "A Glass-Cannon Party", needs: { boldness: 0.9, compete: 0.7, initiative: 0.6, steadiness: -0.5, patience: -0.4 },
      text: "A glass-cannon party: enormous damage, no health to speak of. You'd win quickly or very dramatically." },
    { id: "fortress", icon: "🏰", name: "A Fortress Party", needs: { steadiness: 1, persist: 0.8, structure: 0.6 },
      text: "A fortress party. Nobody dies and nothing moves quickly, but you're nearly impossible to beat." },
    { id: "disaster", icon: "🎪", name: "A Lovable Disaster Party", needs: { humor: 0.8, flex: 0.6, structure: -0.9, steadiness: -0.4, social: 0.6 },
      text: "A lovable disaster party. You'd survive on improvisation, luck and a very good rapport with the game master." },
    { id: "thinkers", icon: "🧠", name: "A Think-First Party", needs: { analysis: 1, structure: 0.7, patience: 0.6, boldness: -0.3 },
      text: "A think-first party. Every door is examined, every plan has a plan, and the dungeon is solved before anyone opens it." },
    { id: "charismatic", icon: "🎭", name: "A Charismatic Party", needs: { social: 0.9, warmth: 0.7, humor: 0.6, flex: 0.5 },
      text: "A charismatic party. You'd win most encounters by talking, and the rest by befriending the villain." },
  ]);

  A("leadership", [
    { id: "captain", icon: "🧭", name: "One Clear Captain", peak: { initiative: 1 }, spread: { initiative: 0.8 },
      text: "{leader} makes the final call, and everyone is glad someone does." },
    { id: "co-captains", icon: "🤝", name: "Co-Captains", needs: { initiative: 0.5, trust: 0.6, warmth: 0.4 }, spread: { initiative: -0.6 },
      text: "Two or three of you share the wheel, and it works because you trust each other's instincts." },
    { id: "rotating", icon: "🔄", name: "Rotating Leadership", needs: { flex: 0.8, trust: 0.7, humor: 0.3 }, spread: { initiative: -0.3, analysis: 0.2 },
      text: "Whoever knows the situation best leads it, and nobody minds handing over the wheel." },
    { id: "council", icon: "🪑", name: "A Council of Equals", needs: { warmth: 0.8, patience: 0.8, trust: 0.7 }, spread: { initiative: -0.8 },
      text: "Decisions are made together, slowly and thoroughly, and they tend to stick." },
    { id: "leaderless", icon: "🌊", name: "Leaderless but Functional", needs: { autonomy: 0.7, flex: 0.7, structure: -0.5, initiative: -0.5 },
      text: "Nobody is officially in charge, and it works because everyone quietly does their part." },
    { id: "backbone", icon: "🏗️", name: "The Quiet Backbone Model", needs: { steadiness: 0.8, structure: 0.7, persist: 0.8, initiative: -0.3, social: -0.4 },
      text: "The loudest voice isn't the one steering. {carry} quietly keeps the course." },
    { id: "cheerleader", icon: "📣", name: "Leadership by Enthusiasm", needs: { optimism: 0.8, social: 0.8, warmth: 0.6, initiative: 0.4 },
      text: "{heart} leads by enthusiasm, and the group follows because it's more fun that way." },
  ]);

  A("config", [
    { id: "facetWeak", lines: {
      explore: "You tend to stick with what you know. New places and new ideas take a deliberate push.",
      invent: "Practical beats inventive here. If you need a clever workaround, you may have to go looking for one.",
      analysis: "Quick instincts outrun careful analysis. Slowing down before the big decisions would pay off.",
      structure: "Plans tend to be loose. Deadlines and details may need someone to own them on purpose.",
      initiative: "It can take a while for anyone to start. Someone has to say 'let's go' first.",
      persist: "Stamina fades when things get long. Plan for a second wind or a handoff.",
      warmth: "You're better at solving problems than at checking in. A moment for feelings would help the group.",
      social: "You're a quieter group than most. Big social settings may drain more than they give.",
      humor: "You take things seriously. A little levity would make the hard parts easier.",
      autonomy: "You lean on each other a lot. Time apart, or a person who goes their own way, might help.",
      steadiness: "Pressure rattles the group. Having a calm voice agreed in advance would help.",
      flex: "Surprises are costly for you. A backup plan for the backup plan is worth having.",
      boldness: "You're cautious. Someone may need to take the first risk so the rest feel safe to follow.",
      trust: "Trust comes slowly. Small, reliable wins will do more than big gestures.",
      compete: "You're not especially driven to win. Goals may need a push to stay urgent.",
      patience: "You're quick to want it done. Waiting for good things is not your strength.",
      optimism: "You see the risks first. Good news may need to be said out loud to count.",
    } },
    { id: "chemistry", alike: [
      "{a} and {b} look at {facet} in nearly the same way, which saves the group a lot of explaining.",
      "On {facet}, {a} and {b} are the closest pair in the room: they rarely need to discuss it.",
      "{a} and {b} are on the same page about {facet}, and probably finish each other's thoughts on it.",
      "If you need two people to agree on {facet} quickly, it's {a} and {b}.",
    ], apart: [
      "{a} and {b} see {facet} very differently, so they'll be the ones translating for each other.",
      "The biggest gap in the group is between {a} and {b} on {facet}, which is where the best arguments will start.",
      "{a} and {b} will have the most to learn from each other about {facet}.",
      "Expect {a} and {b} to disagree about {facet}, and expect that to end up improving the plan.",
    ], bridge: [
      "{bridge} is the one most likely to sit between them and keep everyone talking.",
      "{bridge} has the best chance of bridging that gap without anyone noticing.",
      "If it gets tense, {bridge} is who the rest of you will turn to.",
      "{bridge} is the natural go-between when those two disagree.",
    ] },
  ]);
})(typeof Forge !== "undefined" ? Forge : (globalThis.Forge = globalThis.Forge || {}));
if (typeof module !== "undefined" && module.exports) module.exports = Forge;
