/* =========================================================================
   WORLD SCRIPTS 5 (data only): scripts for thirteen more of the new worlds. Same shape as pack-story-worlds-3.js. Original wording written for Forge.
   ========================================================================= */
(function(F){
  "use strict";
  if (!F.packs) return;
  const W = (id, intro, qs, beats) => ({ id, intro, qs, beats });
  const B = (about, ...o) => ({ about, o });

  F.packs.add("worldScripts", [
    W("old-republic", "The Old Republic rewards the party: a ship with a very good kitchen, a crew of strangers and a galaxy that keeps asking them to choose a side.", [
      ["diplomat", "{w} talks the two delegations into the same room and the same drink, and then lets the drink do the rest."],
      ["comfort", "{w} sits up with the crew member who cannot sleep, and says something unexpectedly useful about the stars."],
      ["leader", "{w} takes the call from the Council, rolls their eyes and makes the decision anyway."],
      ["scout", "{w} leaves the ship at dawn, finds the lost temple and returns with two stories and a very odd rock."],
      ["moral", "{w} stops the group before the raid, asks who is on the other side and, annoyingly, changes the plan."]
    ], [
      B("pair", ["curious", "You land on the first planet for a short visit. {A} and {B} leave a week later with a map, a grudge and a new member for the crew."], ["steady", "You take the mission slowly. {A} and {B} turn a very short list of orders into a very well-organised campaign."]),
      B("lead", ["driven", "{lead} gives the order, points the ship at the horizon and trusts the crew to catch up. They do."], ["cautious", "{lead} asks four questions about the mission, the planet and the strange cargo before even touching the controls."]),
      B("other", ["warm", "{other} holds the ship's table together with a single, excellent stew and a long conversation about nothing."], ["analytic", "{other} reads the ancient text and discovers that the whole mission was a mistranslation, and a good one."]),
      B("gap", ["close", "You complete the mission on the same side of the same argument, and share a rare, quiet toast in the galley."], ["far", "You each see the mission differently, and the ship, which is used to this, simply adds another table."])
    ]),
    W("rapture", "Rapture rewards the sceptic: a grand ideal, a damp corridor and a very persuasive voice on the radio that is entirely sure it knows best.", [
      ["skeptic", "{w} reads the manifesto on the wall, raises an eyebrow and asks who is paying for the lighting."],
      ["puzzle", "{w} pieces together the audio diaries into a very uncomfortable timeline and a surprisingly useful map."],
      ["survive", "{w} walks through the flooded corridor with a steady head and an unreasonable amount of tape."],
      ["tempted", "{w}, who has just found a shiny, glowing, thoroughly suspicious bottle and is, naturally, reading the label."],
      ["calm", "{w} watches the walls leak, the lights flicker and the radio announce something dramatic, and says, quietly, 'Right.'"]
    ], [
      B("pair", ["cautious", "You descend in the bathysphere with a lamp and a list. {A} and {B} are careful, quiet and well-equipped for the opening scene."], ["bold", "You step out of the lift and into the first ballroom. {A} and {B} are brave, quick and completely wrong about the carpet."]),
      B("lead", ["steady", "{lead} walks into the most dramatic lobby in the ocean and does not look up. It is almost an insult to the architecture."], ["nervy", "{lead} jumps at every sound, and every sound, in this city, is justified."]),
      B("other", ["analytic", "{other} finds the schematic in the dust and works out which of the doors is a very old trap."], ["warm", "{other} talks to the frightened child in the corner, and the whole lobby seems, for a moment, to forget the leak."]),
      B("gap", ["close", "You leave the city in the same bathysphere, quiet, damp and in perfect agreement about the architecture."], ["far", "One of you read the manifesto with sympathy and one with dread, and the ride up is a very polite seminar."])
    ]),
    W("columbia", "Columbia rewards the improviser: a floating city, a parade and a very pleasant smile over a very large secret.", [
      ["scout", "{w} takes the skyline, finds the quiet street and finds out, almost by accident, which window is open."],
      ["daredevil", "{w} swings off the rail with a cheerful wave and lands, to everyone's astonishment, on the right balcony."],
      ["puzzle", "{w} notices that the parade has a pattern, the sky has a seam and the flags are slightly the wrong way round."],
      ["comfort", "{w} sits with the frightened girl on the carousel and says something that makes the whole sky less loud."],
      ["caught", "{w}. A very polite, very cheerful guard, and a very awkward moment with a pamphlet.", "Who gets recognised first?"]
    ], [
      B("pair", ["improviser", "You arrive at the fair with a ticket and a very vague idea. {A} and {B} are, by noon, in a parade, a church and a chase."], ["cautious", "You walk the fair slowly, looking at the flags and the faces. {A} and {B} notice, very early, that none of the smiles reach the eyes."]),
      B("lead", ["bold", "{lead} steps into the street and takes the rail. The skyline shifts, the crowd gasps and the fair is, briefly, theirs."], ["steady", "{lead} walks calmly through the market, past the guards and into the one place that nobody had thought to lock."]),
      B("other", ["analytic", "{other} reads the fine print on the pamphlet and finds the clause that explains the whole city."], ["warm", "{other} finds the lost child at the carnival and returns her, and gets, in return, a very useful map."]),
      B("gap", ["close", "You leave the floating city together, a little singed and quietly pleased, with the sun in your eyes."], ["far", "You each find a different truth about the city, and spend the descent politely deciding which one to believe."])
    ]),
    W("oldest-house", "The Oldest House rewards the adaptable: a building that rearranges itself, a quiet bureaucracy and a coffee machine with opinions.", [
      ["puzzle", "{w} reads the shifting floorplan like a very long sentence and finds the single door that stays put."],
      ["calm", "{w} watches the walls rearrange themselves and says, mildly, that this is probably a Tuesday."],
      ["fix", "{w} repairs the strange machine in a cupboard that does not exist and never will again."],
      ["skeptic", "{w} says, flatly, that the lights should not be able to do that, and then goes to check the fuse."],
      ["scout", "{w} goes down the corridor that was not there a second ago, and comes back with a file, a coffee and a very odd look."]
    ], [
      B("pair", ["improviser", "You arrive on your first day and are given a badge, a floor and a map that is already wrong. {A} and {B} adapt within the hour."], ["planner", "You make a list of the rules. {A} and {B} spend a very long morning discovering which ones are actually true."]),
      B("lead", ["steady", "{lead} walks into the room that was a lift a moment ago, nods and says 'Good morning' to the very slightly confused furniture."], ["nervy", "{lead} jumps at every shifting wall, and every shifting wall, to be fair, was a little rude."]),
      B("other", ["analytic", "{other} takes a pencil and maps the building, and finds that it is, remarkably, consistent about being inconsistent."], ["funny", "{other} narrates the building's moods with such affection that the corridors, for a while, behave."]),
      B("gap", ["close", "You finish the shift in the same office, with the same slightly wild look and a mug that has begun to hum."], ["far", "You each find a different version of the building, and compare notes over a coffee that definitely was not there before."])
    ]),
    W("death-stranding", "The Broken America rewards the carrier: a long road, a heavy pack and the quiet belief that a delivered parcel is a small act of faith.", [
      ["persist", "{w}, who has carried the same load across the same mountain for three days and is still counting steps, patiently."],
      ["scout", "{w} reads the terrain, picks the route and plans the whole crossing before the first step."],
      ["loner", "{w} wanders off up the ridge alone, and returns, at dusk, with a better path and an inexplicable amount of moss."],
      ["comfort", "{w} sits by the weary porter and, without a word, shares the last of the water."],
      ["calm", "{w} watches the rain begin and the ground tremble and simply adjusts the pack."]
    ], [
      B("pair", ["steady", "You set out across the first plain with a heavy load and no talk. {A} and {B} find a rhythm, and the road, somehow, is lighter."], ["cautious", "You plan the crossing for a week. {A} and {B} learn the ridges, the rain and the quiet habits of the road."]),
      B("lead", ["steady", "{lead} takes the front, finds the path and sets the pace. It is nothing dramatic, only a very good walk."], ["driven", "{lead} announces the route and the hour, and the whole line falls in behind."]),
      B("other", ["warm", "{other} leaves a small, unexpected gift at the next waystation, and a stranger, down the road, is a little less alone."], ["analytic", "{other} reads the weather and the terrain and, with a single quiet note, reroutes the whole delivery."]),
      B("gap", ["close", "You reach the far city together, tired and quiet, and hand over the parcel, and the moment is, strangely, enormous."], ["far", "You each take a different route to the same place, and arrive on the same evening with very different stories and the same parcel."])
    ]),
    W("outer-wilds", "The Outer Wilds rewards the explorer: a tiny spaceship, a twenty-two minute loop and a very large amount of delighted, systematic curiosity.", [
      ["scout", "{w} launches before the pre-flight check is finished, and returns, twenty minutes later, with a theory."],
      ["puzzle", "{w} reads the alien inscription on a wall, connects it to the star's pulse and quietly writes a note to a future self."],
      ["calm", "{w} watches the sun go supernova with a mild, almost scholarly interest."],
      ["dream", "{w}, who has a list of every planet and a plan for the next loop."],
      ["persist", "{w}, who has died eleven times in the same cave and is, politely, still planning the twelfth."]
    ], [
      B("pair", ["curious", "You launch the ship for a short trip. {A} and {B} return, twenty minutes later, with a notebook full of questions and a smile."], ["planner", "You make a list of everything to check. {A} and {B} get through four items before the sun goes out."]),
      B("lead", ["bold", "{lead} points the ship at the unknown and presses the button. The universe, to everyone's amusement, replies."], ["steady", "{lead} reads the instruments, takes the long way round and lands, softly, exactly where it needed to be."]),
      B("other", ["analytic", "{other} compares the log entries and finds the loop's one quiet discrepancy, and the whole question changes."], ["warm", "{other} shares a marshmallow with the quiet, enormous silence at the edge of the system, and finds it, strangely, answers."]),
      B("gap", ["close", "You reach the answer at the same moment, in the same cave, with the same very small, very enormous understanding."], ["far", "You each take a different loop, and it is only afterwards that you realise you were both asking the same question."])
    ]),
    W("no-mans-sky", "The Endless Galaxy rewards the settler: a good base, a better name for the planet and a lot of delight in the small, strange things.", [
      ["scout", "{w} flies over three planets before breakfast, names each one and leaves a very polite flag on the nicest."],
      ["engineer", "{w} builds a base on the cliff, with a view and a surprisingly good kitchen, from a handful of local minerals."],
      ["dream", "{w} has a map of seventeen systems and a list of the creatures they would like to meet."],
      ["loner", "{w} lands on an empty moon and spends a week there, content, naming stones."],
      ["bond", "{w} befriends the local fauna, the passing trader and the very friendly robot in the first hour."]
    ], [
      B("pair", ["curious", "You land on a new planet at dusk. {A} and {B} name the first plant, the first creature and the first slightly alarming rock."], ["relaxed", "You settle on a quiet moon. {A} and {B} spend a month on a very comfortable base and a very small list."]),
      B("lead", ["bold", "{lead} points the ship at the nearest bright thing and presses the button. It turns out to be wonderful."], ["steady", "{lead} fuels the ship, checks the charts and plots the jump, without drama and with a small mug of tea."]),
      B("other", ["inventive", "{other} builds an elegant, slightly ridiculous device from three lumps of metal, and it, impressively, works."], ["warm", "{other} shares a cup with the traveller at the outpost, and the two spend a happy, pointless evening."]),
      B("gap", ["close", "You settle on the same hill, name it the same name and watch the same two suns set."], ["far", "You each settle on a different planet, and spend the evening, pleasantly, on a call, describing each other's skies."])
    ]),
    W("revachol", "Revachol rewards the thinker: a tired city, a very large amount of rain and an inner monologue that has opinions about everything.", [
      ["skeptic", "{w} questions the evidence, the witness and, after a moment, the nature of evidence itself."],
      ["clown", "{w} makes a very good joke in the middle of a very bad interrogation, and wins the room."],
      ["puzzle", "{w} connects the missing boot, the strange shirt and the very sticky wall into a story that is quite upsetting."],
      ["loner", "{w} wanders off to check a hunch, a bar and the peculiar fog, and returns, strangely, with a new theory."],
      ["tempted", "{w}, who has just been offered a drink and a cigarette and a very reasonable excuse."]
    ], [
      B("pair", ["curious", "You arrive at the scene with a notebook and a hangover. {A} and {B} start with the smallest clue and end with the largest question."], ["analytic", "You work the case in order, line by line. {A} and {B} find, in the end, that the order was the whole point."]),
      B("lead", ["funny", "{lead} opens the interrogation with a joke and ends with a thesis. The suspect, impressed, tells everything."], ["serious", "{lead} reads the evidence with a straight face and a very dry voice, and the room, uneasily, agrees."]),
      B("other", ["analytic", "{other} notes down every detail and finds, in the margin, a small, polite contradiction."], ["warm", "{other} stays with the grieving witness, over a very long and very quiet tea."]),
      B("gap", ["close", "You close the case together, sit on the pier and agree, quietly, that it was not entirely solved, and that this was acceptable."], ["far", "You each solve a different case, and the answers, uncomfortably, fit."])
    ]),
    W("hyrule", "Hyrule rewards the adventurer: a sword, a puzzle and the instinct that there is something under that very suspicious rock.", [
      ["scout", "{w} runs across the field, climbs the nearest tower and plots a route that is mostly sensible and mostly vertical."],
      ["puzzle", "{w} stares at the statue, the torch and the odd little switch and slowly realises it is a song."],
      ["dream", "{w}, who has a list of every shrine and a plan to open them all by next season."],
      ["daredevil", "{w} glides off the cliff, grabs the shiny thing and lands, ever so slightly, on the right side."],
      ["bond", "{w} befriends the cook, the horse and the very serious guard, in that order, and gets a free potion."]
    ], [
      B("pair", ["curious", "You set out from the village for a small errand. {A} and {B} return, a season later, with a new sword, a new friend and a very strange hat."], ["planner", "You make a list of shrines. {A} and {B} open eleven in a week and are, for a moment, almost smug."]),
      B("lead", ["bold", "{lead} walks straight up to the big, mysterious gate and tries the handle. It opens. It was, strictly speaking, a surprise."], ["cautious", "{lead} tests the floor, the wall and the very tempting chest, before touching anything. It was a trap. It was always a trap."]),
      B("other", ["analytic", "{other} reads the old stone, spots the pattern and plays the three notes that make the whole temple hum."], ["warm", "{other} shares a meal with the traveller on the road, and gets, in return, a very odd and very useful key."]),
      B("gap", ["close", "You reach the castle together, battered and pleased, and share a quiet moment on the hill before the last door."], ["far", "You each solve a different half of the temple, and it works, which neither of you will admit was luck."])
    ]),
    W("hallownest", "Hallownest rewards the quiet: a deep, ruined kingdom, a small bright lantern and the patience to learn a hard room by heart.", [
      ["persist", "{w}, who has fallen in the same pit nine times and, calmly, begins the tenth."],
      ["puzzle", "{w} studies the strange carvings and quietly realises it is a map of the whole kingdom."],
      ["loner", "{w} slips away down the cracked tunnel and returns, hours later, with a small, quiet secret."],
      ["calm", "{w} watches the enormous bug advance and, with a mild sigh, begins the pattern."],
      ["sacrifice", "{w} gives up the last charm so {o} can reach the great gate."]
    ], [
      B("pair", ["cautious", "You descend slowly into the first caverns, mapping every turn. {A} and {B} learn the quiet rhythm of the place."], ["bold", "You leap into the first chasm with a small nail and a very large optimism. {A} and {B} are, repeatedly, surprised by the floor."]),
      B("lead", ["steady", "{lead} faces the great knight in the arena with a calm that is, in its way, a conversation."], ["nervy", "{lead} jumps early, jumps late and, at last, jumps correctly. The knight, impressed, falls."]),
      B("other", ["analytic", "{other} watches the boss's pattern for two tries and writes it down, quietly, on a very small scrap."], ["warm", "{other} sits with the lonely stag at the bench and shares, wordlessly, a very small warm light."]),
      B("gap", ["close", "You reach the final room together, tired, silent and strangely at peace, and stand for a while before the door."], ["far", "You each find a different path to the last room, and meet there, in complete agreement about nothing at all."])
    ]),
    W("stardew-valley", "Pelican Town rewards the patient: a small plot, a long year and the slow, steady magic of showing up every day.", [
      ["caretaker", "{w} knows every neighbour's favourite gift, birthday and secret grudge about the library."],
      ["trainer", "{w} is up at dawn, watering the whole field and humming."],
      ["plan", "{w} lays out the whole year on a calendar: crops, festivals and one very modest, very ambitious greenhouse."],
      ["bond", "{w} befriends the entire town by the first festival, and is invited to six dinners."],
      ["clown", "{w} turns the Egg Festival into a stand-up routine and wins, somehow, a very small trophy."]
    ], [
      B("pair", ["relaxed", "You inherit a small, overgrown farm. {A} and {B} spend the first spring clearing weeds and the first summer, happily, ignoring the clock."], ["planner", "You make a calendar for the year. {A} and {B} get through every season in order and have a surprisingly good harvest."]),
      B("lead", ["steady", "{lead} waters the field before the sun is up, and by the end of the week, the whole town is quietly inspired."], ["nervy", "{lead} panics about the first harvest, the market and the weather, and then wins best pumpkin."]),
      B("other", ["warm", "{other} visits the shy neighbour every week with a gift and a joke, and by winter, the two are quite good friends."], ["inventive", "{other} builds an unusual but useful contraption for the barn, and the animals are, strangely, delighted."]),
      B("gap", ["close", "You finish the year on the same porch with the same very small cup of tea and a quiet, shared pride."], ["far", "One of you is a farmer and one is a miner, and the valley, with great patience, learns to need both."])
    ]),
    W("lordran", "Lordran rewards the stubborn: a bonfire, a long road and the unflinching belief that the next attempt will be slightly better.", [
      ["persist", "{w}, who has died here nine times and is, with a calm and very slightly smug expression, taking the tenth."],
      ["trusted", "{w}, whose summoning sign is the one everyone in the world will choose, given the choice."],
      ["tempted", "{w}, who has just seen a very shiny chest in a very quiet room and is, bravely, checking it for teeth."],
      ["calm", "{w} watches the enormous knight lumber into the arena and, with a faint, patient smile, begins to count."],
      ["comfort", "{w} sits at the bonfire with the weary traveller, and shares a very small, very welcome piece of kindness."]
    ], [
      B("pair", ["cautious", "You descend the first stairs slowly, shield up. {A} and {B} learn the patrol routes, the weak ledges and a small, practical prayer."], ["bold", "You charge the first gate with more spirit than armour. {A} and {B} are, repeatedly, educated by a very large rock."]),
      B("lead", ["steady", "{lead} faces the great knight without hurrying. Three patient mistakes later, the knight has met, politely, its match."], ["nervy", "{lead} rolls too early, rolls too late and rolls into the corner. It works. Nobody discusses it."]),
      B("other", ["analytic", "{other} watches the boss twice and writes down every move on a scrap of parchment, and on the third try it is a dance."], ["warm", "{other} tends the fire, shares the flask and keeps the party's spirits, with some difficulty, afloat."]),
      B("gap", ["close", "You light the final bonfire together and sit, side by side, in a very warm, very exhausted silence."], ["far", "You reach the same fire by different roads, and spend the evening comparing scars."])
    ]),
    W("ashina", "Ashina rewards the patient swordsman: a snowy castle, a rhythm to learn and a very respectful bow before every very rude fight.", [
      ["persist", "{w}, who learns the old swordsman's pattern, bows and tries again, and again, with a very faint smile."],
      ["calm", "{w} watches the enormous blade descend and, with a small, unhurried step, is no longer there."],
      ["scout", "{w} slips across the roof, over the wall and into the courtyard, and returns with a plan and a very polite bow."],
      ["sacrifice", "{w} holds the gate, for just long enough, so that {o} can reach the lord."],
      ["duty", "{w} carries out the order, polishes the blade and bows, without a single word, to the quiet old master."]
    ], [
      B("pair", ["cautious", "You approach the first castle by the roof, in silence. {A} and {B} learn the patrol, the lantern and the very patient dog."], ["bold", "You walk straight up to the gate and announce yourselves. {A} and {B} are brave, polite and, shortly, educated."]),
      B("lead", ["steady", "{lead} faces the old master with a still, quiet bow, and the duel, for a long moment, is a very beautiful conversation."], ["driven", "{lead} presses the attack, parries the answer and finishes the duel in a single, startled breath."]),
      B("other", ["analytic", "{other} watches the old master's rhythm for three duels and quietly writes down the one gap."], ["warm", "{other} shares a cup of sake with the wounded guard, and the castle, for an evening, seems less like a war."]),
      B("gap", ["close", "You stand together on the snowy rooftop at dawn, and neither of you says a thing, and it is plenty."], ["far", "You each serve a different master for a season, and meet, at the last gate, with a bow."])
    ])
  ]);
})(Forge);
