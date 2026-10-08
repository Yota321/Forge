/* =========================================================================
   WORLD SCRIPTS (data only). "If the two of you entered ..." for the pair article (js/forge/story.js).

   questions   the "Who ...?" library: key -> { q: default question, w: facet weights (higher score wins), tie }.
               A script line may override the question text. The winner is whoever scores higher on those weights; a close call
               uses the tie line instead of pretending there is a winner.
   presets     named personality leanings used by the story beats ("cautious", "bold", "close" ...).
   worldScripts  one per world id (ids come from pack-party.js / pack-worlds.js):
       intro   one line about what the world rewards          qs     [[questionKey, answer, questionOverride?], ...]
       beats   four beats, each { about, o: [[preset, text], ...] }. The engine picks the option whose preset fits the person
               (about: "pair" = both blended, "lead" = the one who takes point, "other" = the other one, "gap" = how alike you are:
               presets "close" / "far"). So the mini-story is written FROM the personalities, never at random.
   Tokens: {A} {B} {lead} {other} {w} (winner) {o} (the other). Original wording, personality only; no quotes from any work.
   ========================================================================= */
(function(F){
  "use strict";
  if (!F.packs) return;
  const A = F.packs.add;

  A("story", [
    { id: "questions", data: {
      survive:   { q: "Who survives longest?",            w: { steadiness: 1, flex: 0.8, persist: 1, structure: 0.5 } },
      protect:   { q: "Who protects everyone?",           w: { warmth: 1, persist: 0.8, boldness: 0.6, steadiness: 0.4 } },
      caught:    { q: "Who gets caught first?",           w: { steadiness: -1, boldness: 0.8, patience: -0.6, structure: -0.6 } },
      puzzle:    { q: "Who solves the puzzle?",           w: { analysis: 1.2, patience: 0.8, invent: 0.6 } },
      sacrifice: { q: "Who sacrifices themselves?",       w: { warmth: 1, persist: 1, trust: 0.7, boldness: 0.5, compete: -0.6 } },
      prefect:   { q: "Who becomes the responsible one?", w: { structure: 1, trust: 0.5, warmth: 0.4, analysis: 0.4, compete: -0.2 } },
      rulebreak: { q: "Who breaks the rules?",            w: { structure: -1, boldness: 0.9, autonomy: 0.7 } },
      study:     { q: "Who studies hardest?",             w: { structure: 1, analysis: 0.8, persist: 0.7 } },
      hero:      { q: "Who ends up saving the day?",      w: { persist: 1, boldness: 0.8, warmth: 0.6, initiative: 0.8 } },
      leader:    { q: "Who takes the lead?",              w: { initiative: 1.2, boldness: 0.5, social: 0.4 } },
      diplomat:  { q: "Who talks their way out of it?",   w: { social: 1, warmth: 0.8, flex: 0.6, trust: 0.5 } },
      schemer:   { q: "Who is playing the longer game?",  w: { analysis: 0.8, trust: -0.8, compete: 0.8, autonomy: 0.5 } },
      scout:     { q: "Who goes ahead to scout?",         w: { explore: 1.2, boldness: 0.8, flex: 0.8 } },
      engineer:  { q: "Who builds the thing?",            w: { invent: 1.4, analysis: 0.7, persist: 0.4 } },
      charmer:   { q: "Who wins over the room?",          w: { social: 1, humor: 0.8, warmth: 0.4 } },
      skeptic:   { q: "Who asks the awkward question?",   w: { analysis: 0.9, autonomy: 1, trust: -0.9 } },
      clown:     { q: "Who keeps the mood up?",           w: { humor: 1.4, social: 0.7, optimism: 0.6 } },
      loner:     { q: "Who wanders off alone?",           w: { autonomy: 1.2, social: -0.8 } },
      daredevil: { q: "Who does the reckless thing?",     w: { boldness: 1.4, flex: 0.6, steadiness: 0.2 } },
      calm:      { q: "Who stays calm?",                  w: { steadiness: 1.4, patience: 0.8 } },
      trainer:   { q: "Who trains hardest?",              w: { persist: 1, compete: 0.7, optimism: 0.6, structure: 0.3 } },
      caretaker: { q: "Who looks after everyone?",        w: { warmth: 1.2, patience: 0.8, trust: 0.5 } },
      loot:      { q: "Who wins the argument over the loot?", w: { compete: 1, social: 0.6, autonomy: 0.4, boldness: 0.3 } },
      fix:       { q: "Who fixes whatever breaks?",       w: { invent: 1, analysis: 0.8, persist: 0.8 } },
      plan:      { q: "Who makes the plan?",              w: { structure: 1, analysis: 1, initiative: 0.5 } },
      lost:      { q: "Who gets lost first?",             w: { structure: -0.8, explore: 0.8, flex: 0.3, analysis: -0.5 } },
      fame:      { q: "Who ends up famous?",              w: { social: 1, boldness: 0.8, compete: 0.6, humor: 0.5 } },
      secret:    { q: "Who keeps the secret?",            w: { patience: 0.8, autonomy: 0.6, steadiness: 0.6, trust: -0.2 } },
      tempted:   { q: "Who is tempted first?",            w: { boldness: 0.6, compete: 0.7, trust: -0.3, patience: -0.8 } },
      bond:      { q: "Who makes friends fastest?",       w: { social: 1, warmth: 0.8, trust: 0.6 } },
      mentor:    { q: "Who ends up mentoring the other?", w: { patience: 1, analysis: 0.6, warmth: 0.6, steadiness: 0.6 } },
      scared:    { q: "Who is secretly terrified?",       w: { steadiness: -1, boldness: -0.6, optimism: -0.3 } },
      avenger:   { q: "Who becomes the hero first?",      w: { initiative: 1, boldness: 0.8, persist: 0.6, warmth: 0.4 } },
      argue:     { q: "Who argues with the genius?",      w: { autonomy: 0.9, compete: 0.7, analysis: 0.6, trust: -0.3 } },
      trusted:   { q: "Who does the team trust first?",   w: { warmth: 0.8, persist: 0.8, steadiness: 0.8, compete: -0.4 } },
      manip:     { q: "Who gets talked into it?",         w: { trust: 1, warmth: 0.6, optimism: 0.4, analysis: -0.5 } },
      entrance:  { q: "Who makes the dramatic entrance?", w: { boldness: 1, humor: 0.7, social: 0.6, initiative: 0.5 } },
      duty:      { q: "Who takes the duty seriously?",    w: { structure: 0.9, persist: 0.8, trust: 0.4, steadiness: 0.4 } },
      pilot:     { q: "Who flies the ship?",              w: { flex: 1, boldness: 0.9, initiative: 0.5, humor: 0.3 } },
      moral:     { q: "Who worries about the moral cost?", w: { warmth: 1, analysis: 0.5, patience: 0.4, compete: -0.5 } },
      grind:     { q: "Who is secretly keeping score?",   w: { compete: 1.2, persist: 0.6, autonomy: 0.4 } },
      dream:     { q: "Who has the biggest dream?",       w: { optimism: 1, boldness: 0.8, explore: 0.8, initiative: 0.4 } },
      persist:   { q: "Who keeps going when everyone else is spent?", w: { persist: 1.2, steadiness: 0.6, patience: 0.6 } },
      comfort:   { q: "Who notices when someone is struggling?", w: { warmth: 1.2, patience: 0.6, social: 0.3 } },
      rumor:     { q: "Who hears everything first?",      w: { social: 1, explore: 0.6, humor: 0.4, warmth: 0.3 } },
      stubborn:  { q: "Who refuses to back down?",        w: { persist: 1, compete: 0.7, autonomy: 0.7, flex: -0.6 } }
    } },
    { id: "tie", data: [
      "Too close to call: {A} and {B} would both step up, in different ways.",
      "Honestly a toss-up. {A} and {B} would trade this one back and forth all day.",
      "No clear winner here. It would depend entirely on who was having the better day.",
      "A dead heat. {A} and {B} would each claim it, and each have a point.",
      "Neither of you has the edge. It would come down to mood, weather and snacks.",
      "{A} and {B} are level on this one, which is its own kind of compliment.",
      "The honest answer is both of you, taking turns without ever agreeing who started.",
      "Truly even. Whoever got there first would win it, and you would both argue about who that was."
    ] },
    { id: "presets", data: {
      cautious: { boldness: -1, steadiness: 0.2, structure: 0.4 }, bold: { boldness: 1, initiative: 0.5 },
      planner: { structure: 1, analysis: 0.6 }, improviser: { structure: -1, flex: 1 },
      warm: { warmth: 1, trust: 0.5 }, cool: { warmth: -1, analysis: 0.5 },
      funny: { humor: 1, optimism: 0.5 }, serious: { humor: -1, optimism: -0.4 },
      curious: { explore: 1, invent: 0.5 }, steady: { steadiness: 1, patience: 0.6 },
      nervy: { steadiness: -1, patience: -0.4 }, competitive: { compete: 1, initiative: 0.4 },
      coop: { compete: -1, warmth: 0.5 }, loner: { autonomy: 1, social: -0.6 },
      social: { social: 1, warmth: 0.4 }, analytic: { analysis: 1, patience: 0.4 },
      instinct: { analysis: -1, flex: 0.5 }, driven: { persist: 1, initiative: 0.6 },
      relaxed: { persist: -0.6, patience: 0.3, initiative: -0.5 }, trusting: { trust: 1, warmth: 0.4 },
      guarded: { trust: -1, autonomy: 0.4 }, inventive: { invent: 1, explore: 0.5 },
      hopeful: { optimism: 1, humor: 0.3 }, grim: { optimism: -1, humor: -0.4 }
    } }
  ]);

  const W = (id, intro, qs, beats) => ({ id, intro, qs, beats });
  const B = (about, ...o) => ({ about, o });

  A("worldScripts", [
    W("resident-evil", "Resident Evil rewards calm hands, shared ammunition and the nerve to open one more door.", [
      ["survive", "{w} keeps a clear head, counts every bullet and treats the map like scripture. {o} would be excellent company for exactly as long as the lights stayed on."],
      ["protect", "{w} steps between the corridor and {o} without being asked, and then pretends it was nothing."],
      ["caught", "{w}. Not through weakness, just a talent for opening the one door everybody agreed to leave closed.", "Who gets infected first?"],
      ["puzzle", "{w} stares at the strange statue until it turns into a list of small problems, then solves the list. {o} holds the torch and offers moral support."],
      ["sacrifice", "{w} stays behind to hold the door, says 'I'll catch up' and means it slightly too much."]
    ], [
      B("pair", ["cautious", "You edge into the mansion lobby sweeping every corner. {A} and {B} spend ten careful minutes on the first room and find everything worth finding in it."], ["bold", "You walk into the lobby already halfway through the second door. {A} and {B} find the interesting things quickly, and the unpleasant ones even faster."]),
      B("lead", ["steady", "When the first thing lurches out of the dark, {lead} doesn't flinch. One clear instruction, one steady aim, and the corridor is yours again."], ["nervy", "When the first thing lurches out of the dark, {lead} shouts something unprintable and throws the nearest heavy object. It works. Nobody discusses it afterwards."]),
      B("other", ["analytic", "{other} notices the pattern on the locked door and the way the statues face, and quietly turns three separate clues into one working key."], ["warm", "{other} keeps the group talking in the dark corridors, which matters more than it sounds: panic travels badly in silence."]),
      B("gap", ["close", "You get out together with half the ammunition and all the nerve, finishing each other's sentences in the helicopter."], ["far", "You get out by different routes, arguing over the radio the whole way, and meet at the helipad with two completely different accounts of what happened."])
    ]),

    W("hogwarts", "A castle full of secrets rewards curiosity, loyalty and the occasional rule bent for a very good reason.", [
      ["prefect", "{w}, with very little discussion: neat robes, a good memory for the rulebook and a disapproving look that somehow still comes across as kind.", "Who becomes Prefect?"],
      ["rulebreak", "{w}, with a reasonable explanation prepared in advance and an excellent reason to be in the corridor after midnight."],
      ["study", "{w} is in the library before breakfast with three books open and a colour-coded plan. {o} is there for the company and the snacks."],
      ["hero", "{w}, though only after {o} supplies the one clue everyone else missed. Defeating the great dark wizard is, as ever, a team effort.", "Who defeats the Dark Lord?"],
      ["lost", "{w} follows a staircase that was clearly heading somewhere important and ends up in a broom cupboard on the wrong floor. It was, they insist, a shortcut.", "Who gets lost on the moving staircases?"]
    ], [
      B("pair", ["curious", "On the very first night you both wander off to find the castle's secrets. {A} and {B} know three hidden passages before the week is out."], ["planner", "Timetables, maps and a shared revision schedule appear within days. {A} and {B} are the first-years who actually know where the dungeons are."]),
      B("lead", ["bold", "When something goes quietly wrong in the third-floor corridor, {lead} is already moving. Permission can be requested afterwards."], ["analytic", "When something goes quietly wrong, {lead} heads to the library first and returns with exactly the right old book and a plan."]),
      B("other", ["warm", "{other} keeps everyone together when it gets frightening, and somehow remembers each friend's favourite sweets for afterwards."], ["funny", "{other} turns the most nerve-racking moment into a joke that goes down in house history."]),
      B("gap", ["close", "You finish the year with the house cup, a stack of detentions and the particular loyalty of people who solved a mystery together."], ["far", "You finish the year in different houses with different friends and one shared story that each of you tells completely differently."])
    ]),

    W("marvel", "A team-up of ordinary people with impossible problems, and a standing invitation to make it worse before you make it better.", [
      ["avenger", "{w}, almost immediately. {o} is invited to the second meeting once the first one has been tidied up.", "Who becomes an Avenger first?"],
      ["argue", "{w} has a better idea than the genius in the room and says so, loudly, at the worst possible time. They are, annoyingly, sometimes right.", "Who argues with Tony?"],
      ["trusted", "{w}. Steadiness and a habit of showing up make the captain's decision very easy.", "Who does Cap trust first?"],
      ["manip", "{w}. A little warmth and a little faith in people is all the trickster needs, and the rest of the plan arrives right on schedule.", "Who does Loki manipulate?"],
      ["entrance", "{w}, via a window nobody was using and with a line that was slightly better than it needed to be.", "Who does the dramatic landing?"]
    ], [
      B("pair", ["bold", "The call comes in the middle of dinner. {A} and {B} are out the door before anyone finishes explaining, which saves a lot of time and creates several new problems."], ["cautious", "The call comes in and {A} and {B} actually read the briefing. In a world of improvisers, this is quietly the most heroic thing anyone does all week."]),
      B("lead", ["driven", "{lead} takes point on the street, calls the plays and keeps the crowd moving. It works about as well as the plan survives."], ["instinct", "{lead} sees the whole thing go sideways, shrugs and invents a better plan mid-fall. It is, somehow, the plan that works."]),
      B("other", ["analytic", "{other} finds the weak point in the villain's machine from three streets away and calmly explains it over the comms, twice."], ["funny", "{other} has the whole team laughing mid-battle, which does more for morale than any speech."]),
      B("gap", ["close", "You win with a team-up that looks rehearsed and wasn't, and the cleanup afterwards is the most efficient in the city's history."], ["far", "You win in two completely different styles at the same time. The press calls it chaos. The two of you call it range."])
    ]),

    W("dc", "A world of icons who keep choosing to do the right thing, even when the right thing is inconvenient.", [
      ["hero", "{w}, because they keep standing back up. It isn't speed or strength; it's that quitting is simply not on the list.", "Who inspires the city?"],
      ["moral", "{w} carries every decision around for days and still shows up with a kind word. The cape and cowl are optional."],
      ["plan", "{w} already has a plan, a backup plan and a contingency for the backup plan. {o} is told only the first one."],
      ["leader", "{w}, in the quiet way: nobody remembers being asked to follow, they just do."],
      ["calm", "{w} stays level when the sky is falling, which is the one superpower nobody has to be born with."]
    ], [
      B("pair", ["steady", "You start in the dark, patrolling the same blocks until you know every rooftop. {A} and {B} become the quiet constant the city never notices."], ["hopeful", "You start in daylight, the kind of heroes who wave at the crowd. {A} and {B} make the city feel like it's going to be fine."]),
      B("lead", ["planner", "{lead} lays out the whole operation in advance: entry points, backups and a fallback for the fallback. The villain never gets a turn."], ["bold", "{lead} goes straight in and trusts the others to keep up. It's reckless, and everyone follows, which is the most heroic bit."]),
      B("other", ["warm", "{other} talks to the frightened bystanders and gets everyone out safely while the big fight goes on elsewhere."], ["driven", "{other} won't stop, won't retreat and somehow gets back up again. The villain's confidence slowly leaves the building."]),
      B("gap", ["close", "You win without a word being said between you, a perfect rhythm built from years of trust you haven't actually had yet."], ["far", "You win with two very different philosophies and an argument on the way home about which one was right. Both were."])
    ]),

    W("mass-effect", "One ship, a crew of very different people and a galaxy where every decision lands on somebody.", [
      ["leader", "{w}, with a voice that makes a difficult order sound like a reasonable suggestion.", "Who commands the ship?"],
      ["engineer", "{w} is down in the engine room with a wrench, a theory and an alarming amount of enthusiasm. {o} holds the flashlight."],
      ["diplomat", "{w} sits across from the hostile ambassador and turns a standoff into a lunch invitation."],
      ["moral", "{w} lies awake over the hard calls and still makes them. The crew notices, and trusts them more because of it."],
      ["bond", "{w}. By the end of the first mission they know everyone's backstory, favourite music and one thing they're pretending is fine.", "Who gets everyone talking on shore leave?"]
    ], [
      B("pair", ["planner", "The crew briefing is thorough, colour-coded and slightly intimidating. {A} and {B} take the mission seriously long before anyone else does."], ["social", "Before the ship has left the dock, {A} and {B} know the whole crew by name. It turns out that matters more than anyone expected."]),
      B("lead", ["steady", "When the alarms sound, {lead} gives three short orders and the ship does exactly what it should. The crew exhales."], ["bold", "When the alarms sound, {lead} turns the ship straight at the problem. The crew grips their seats and trusts the call."]),
      B("other", ["analytic", "{other} reads the enemy's pattern from the sensors, spots the gap and delivers the answer one second before it matters."], ["warm", "{other} is the one the crew goes to when it gets hard, and the one who always has time to listen."]),
      B("gap", ["close", "You finish the mission with a crew that behaves like a family and a captain's log that is mostly about the two of you quietly agreeing."], ["far", "You finish the mission with a crew that quietly takes sides, a captain's log full of 'on the one hand' and the best arguments in the fleet."])
    ]),

    W("witcher", "A grim, funny, morally grey world that rewards people who can think for themselves and charge accordingly.", [
      ["skeptic", "{w} wants to know who is really paying, why the village is suddenly so cheerful and what happened to the last person who took this job.", "Who asks who is really paying?"],
      ["loner", "{w}, usually with a good reason, a mutter and a talent for being exactly where the trouble is."],
      ["loot", "{w}, with an invoice so well argued that the village elder pays it twice."],
      ["caught", "{w}. Not by the monster, but by a bard with a very good song and a very bad memory of the details.", "Who ends up in the ballad?"],
      ["caretaker", "{w}, though they'd call it 'making sure the contract is fulfilled' and look away."]
    ], [
      B("pair", ["loner", "You arrive in the village separately and pretend you don't know each other, which saves explaining why you're both here."], ["warm", "You arrive in the village together and somehow end up with a seat by the fire and a very good stew. The job can wait ten minutes."]),
      B("lead", ["guarded", "{lead} reads the room, doubles the price and asks one more question than everyone else. The monster turns out to be the least of it."], ["bold", "{lead} accepts the job without reading the contract. It's a good job, and a bad contract, and a very good story."]),
      B("other", ["analytic", "{other} studies the creature's tracks, the old books and the local gossip and turns three contradictory stories into one useful fact."], ["funny", "{other} keeps everyone's spirits up with the driest commentary in the Continent, which saves everyone's nerves more than once."]),
      B("gap", ["close", "You split the pay, finish each other's grumbles and leave the village arguing over whether you were worth the money. You were."], ["far", "You split the pay, argue about the split and end up back on the same road because it's quieter with company."])
    ]),

    W("night-city", "Bright lights, sharp edges and a city that favours people who can adapt faster than the plan can fall apart.", [
      ["loner", "{w}, with a plan nobody else knows about and a back door nobody else can find.", "Who goes off the grid?"],
      ["daredevil", "{w}. 'Technically it's only illegal if you're caught' is a philosophy, and they're committed."],
      ["engineer", "{w} wires something together from three broken gadgets and a pocket full of cables. It shouldn't work, and it does, loudly."],
      ["schemer", "{w}, and it's three moves deeper than anyone is giving them credit for."],
      ["calm", "{w}, who has the rare ability to stay precisely as cool as the neon is hot."]
    ], [
      B("pair", ["improviser", "You hit the street with no plan at all, which in this city is the most flexible plan there is. {A} and {B} are somehow already ahead of everyone who made one."], ["planner", "You hit the street with a plan, a map of the back alleys and a contingency for the contingency. In a city of improvisers, this is its own kind of edge."]),
      B("lead", ["bold", "{lead} walks into the wrong party with total confidence and leaves with exactly the thing they came for."], ["guarded", "{lead} trusts nobody, checks everything twice and ends up being right about the one thing that matters."]),
      B("other", ["inventive", "{other} improvises a way through the locked system with an adapter that definitely isn't legal, and absolutely works."], ["steady", "{other} keeps their head while everything around them explodes in neon, and talks the group out of the corner they've been backed into."]),
      B("gap", ["close", "You leave with the job done, the debts cleared and a quiet understanding that you're the only two people you trust."], ["far", "You leave with the job done and a long argument about how, which is how you know you'll be partners next week too."])
    ]),

    W("star-wars", "Rebels, smugglers and mystics making it up as they go, with a ship that is held together by optimism.", [
      ["pilot", "{w}, with a cheerful disregard for the odds and a landing that the ship has opinions about.", "Who flies the ship?"],
      ["hero", "{w}, by not giving up when the plan is clearly unwinnable. It tends to be that, rather than the speeches."],
      ["scout", "{w} has already walked out into the dunes to see what's out there and comes back with something useful and a sunburn."],
      ["clown", "{w} cracks a joke at exactly the wrong moment, and it turns out to be exactly the right one."],
      ["trusted", "{w}. Steady in a way that sparks a little hope in everyone near them, which is all a rebellion actually needs.", "Who does the rebellion believe in first?"]
    ], [
      B("pair", ["improviser", "You take the first job without reading the details, which in this galaxy is the traditional way. {A} and {B} are airborne before anyone asks any questions."], ["planner", "You actually check the route, the fuel and the exits. In a galaxy of improvisers, {A} and {B} are suspiciously well organised."]),
      B("lead", ["bold", "{lead} pushes the throttle forward into the asteroid field and trusts the ship. The ship, for once, trusts them back."], ["steady", "{lead} flies calmly through the worst of it, as if the asteroid field were a bit of weather."]),
      B("other", ["funny", "{other} narrates the whole escape with commentary that keeps the crew from panicking, mostly by being absurd."], ["inventive", "{other} fixes the engine with something that wasn't designed to be an engine part, and the whole ship hums."]),
      B("gap", ["close", "You reach the rendezvous with half the cargo and all of the hope, finishing each other's jokes in the cockpit."], ["far", "You reach the rendezvous with an argument about the route that continues for the entire next mission. The ship, somehow, has no complaints."])
    ]),

    W("four-nations", "A world that rewards balance, growth and the willingness to learn from everyone you meet.", [
      ["bond", "{w}. By the second village they've made three friends, two allies and one very loyal animal companion.", "Who makes friends in every village?"],
      ["mentor", "{w}, patiently, with a lesson about balance that lands about three days after it's said."],
      ["trainer", "{w}, who has decided to master something new before breakfast and does so out of sheer stubbornness."],
      ["scout", "{w} has already found the hidden temple, the secret path and a shortcut that turns out to be a very long way round."],
      ["clown", "{w}. The group's mood is always a little better with them around, and every important lesson arrives disguised as a joke."]
    ], [
      B("pair", ["hopeful", "You set off at dawn with nothing but each other and a very optimistic map. {A} and {B} make the world feel a little more possible."], ["steady", "You set off at a calm pace with plenty of supplies. {A} and {B} turn out to be the kind of travellers every village is glad to see."]),
      B("lead", ["driven", "{lead} trains until they drop, gets back up and does it again. It's irritating to watch and impossible not to admire."], ["curious", "{lead} learns something from every single person they meet, whether or not they asked to teach it."]),
      B("other", ["warm", "{other} sits with the grieving and listens, and somehow the whole group feels a little lighter afterwards."], ["funny", "{other} cheers up a very tense negotiation with a story that nobody was expecting."]),
      B("gap", ["close", "You master your lessons in step, and the two of you move together like a rehearsed performance."], ["far", "You each master a different art, and the combination turns out to be exactly what the world needed."])
    ]),

    W("hidden-leaf", "A world where effort, rivalry and friendship all become a kind of power.", [
      ["trainer", "{w}, who is training before sunrise and still training when everyone else has gone home, quietly proving a point to nobody.", "Who trains until they drop?"],
      ["grind", "{w}, quietly. Every rival gets filed, every goal gets a ranking, and nobody is told."],
      ["hero", "{w}, with a stubborn kind of optimism that bends the whole village slowly towards believing in them."],
      ["bond", "{w}. Within a week the shopkeepers are saving them the good snacks."],
      ["sacrifice", "{w} steps in front of an attack meant for a friend and shrugs it off afterwards with a very bad excuse."]
    ], [
      B("pair", ["driven", "You enrol at the academy with something to prove. {A} and {B} are the first ones on the training field and the last ones off it."], ["relaxed", "You enrol at the academy with a good attitude and a better lunch. {A} and {B} are surprisingly good at the parts everyone else struggles with."]),
      B("lead", ["competitive", "{lead} challenges the strongest rival in the class on day one. It goes badly, then better, and then well."], ["hopeful", "{lead} never stops believing in the plan, and that confidence turns out to be catching."]),
      B("other", ["analytic", "{other} works out the enemy's technique by watching one move, and quietly passes the answer to the team."], ["warm", "{other} remembers everyone's birthday and everyone's fear, which matters more than another new technique."]),
      B("gap", ["close", "You graduate with a bond that shows in how you fight: no calls, no signals, just two people who read each other perfectly."], ["far", "You graduate with two very different fighting styles that somehow cover each other's blind spots."])
    ]),

    W("grand-line", "Big dreams, bigger crews and an ocean that rewards anyone who simply keeps going.", [
      ["dream", "{w}, loudly and often, with a map that is mostly enthusiasm.", "Who has the biggest dream?"],
      ["fix", "{w} patches the hull, the sail and the morale, usually without being asked and almost never thanked."],
      ["loot", "{w}, who would argue with the sea itself if it tried to take a share."],
      ["lost", "{w}. The compass has opinions but so do they, and they win."],
      ["bond", "{w}. Within a day of landing they've befriended the dockmaster, the mayor and a very suspicious cook."]
    ], [
      B("pair", ["hopeful", "You set sail on a boat that is slightly too small for your dreams. {A} and {B} hoist the sail anyway."], ["planner", "You set sail with a proper chart, a ration plan and a rota for watches. {A} and {B} are the most organised pirates in the fleet, which is a different kind of dangerous."]),
      B("lead", ["bold", "{lead} declares the next destination without consulting anyone, and the crew grins and goes along."], ["steady", "{lead} holds the wheel through the storm and sings a little, which is oddly the most reassuring thing possible."]),
      B("other", ["inventive", "{other} builds something clever from the wreckage, and the ship sails faster than it ever did."], ["funny", "{other} turns a very serious standoff into a feast and a friend, which was not the plan."]),
      B("gap", ["close", "You find the treasure together and the best part is the argument over what it means. You agree."], ["far", "You find the treasure separately, in two different places, and it turns out to be the same treasure. Nobody explains it."])
    ]),

    W("middle-earth", "A long road, an impossible task and the friends who carry each other through it.", [
      ["persist", "{w}, step after step, long after the singing stops and the supplies run thin.", "Who keeps walking when everyone else is spent?"],
      ["trusted", "{w}. Steadiness and a quiet loyalty make them the person the whole company leans on.", "Who does the company lean on?"],
      ["scout", "{w} has gone ahead to see what is on the ridge, and comes back with news that makes everyone put down their lunch."],
      ["calm", "{w}, who looks at the mountain and says 'well, we'd better start walking'."],
      ["sacrifice", "{w} stays behind on the bridge. They say it's tactical. It isn't."]
    ], [
      B("pair", ["steady", "You set out from a quiet village with very little, and the quiet turns out to be an advantage. {A} and {B} are the pair nobody noticed until the road was long."], ["curious", "You set out from a quiet village already wondering what is over the next hill. {A} and {B} turn out to be the pair who learn the most from the journey."]),
      B("lead", ["driven", "{lead} keeps walking when the weather turns and the road disappears. Somebody has to, and it has become a habit."], ["warm", "{lead} makes sure the smallest and slowest of the company are never alone on the road."]),
      B("other", ["inventive", "{other} repairs something the whole company thought was lost, and not for the first time."], ["steady", "{other} holds the line in the narrow pass while the rest slip through, and stays calm throughout."]),
      B("gap", ["close", "You reach the last mountain together, walking at the same pace, with the particular silence of people who need no words."], ["far", "You reach the last mountain by different paths and meet there, each with a story the other could not have guessed."])
    ]),

    W("piltover", "Two cities, one brilliant and one scrappy, and invention that changes everything for better and worse.", [
      ["engineer", "{w} has the glowing prototype, a very bad idea for what to do with it and the kind of confidence that either wins prizes or starts fires.", "Who builds the prototype?"],
      ["daredevil", "{w}. The invention hasn't been tested, but there's a very good chance it will work, so that's practically science."],
      ["schemer", "{w}, who is three moves ahead in a city that rewards it, and treats everyone politely until it doesn't."],
      ["moral", "{w} asks whether anyone should build the thing at all, at the exact moment everyone has already built it."],
      ["loner", "{w}, who has gone down into the undercity alone to prove a point and found one."]
    ], [
      B("pair", ["inventive", "You start in a cramped workshop with a lot of parts and a bad idea. {A} and {B} turn it into the thing the city is talking about by the end of the month."], ["planner", "You start with the plans, the budget and the permits. {A} and {B} are the unglamorous reason the city's biggest invention actually works."]),
      B("lead", ["bold", "{lead} demonstrates the machine before anyone has checked it. It works. The council needs a few minutes to recover."], ["analytic", "{lead} checks every number, every connection and every assumption, then checks them again. The first demo is flawless and a little boring."]),
      B("other", ["warm", "{other} makes sure the people who need the invention can actually use it, which turns out to be the harder half of the invention."], ["guarded", "{other} reads the contract the investors sent and finds the one clause that would have lost them everything."]),
      B("gap", ["close", "You finish the project together and hand it to the city, and it becomes exactly the thing you both meant it to be."], ["far", "You finish the project from two opposite directions, and the city can never quite decide whose idea it was."])
    ])
  ]);
})(typeof Forge !== "undefined" ? Forge : (globalThis.Forge = globalThis.Forge || {}));
if (typeof module !== "undefined" && module.exports) module.exports = Forge;
