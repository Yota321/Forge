/* =========================================================================
   WORLD SCRIPTS 6 (data only): scripts for thirteen more of the new worlds. Same shape as pack-story-worlds-3.js. Original wording written for Forge.
   ========================================================================= */
(function(F){
  "use strict";
  if (!F.packs) return;
  const W = (id, intro, qs, beats) => ({ id, intro, qs, beats });
  const B = (about, ...o) => ({ about, o });

  F.packs.add("worldScripts", [
    W("teyvat", "Teyvat rewards the traveller: a bright map, a good festival in every city and a party that grows with every very reasonable detour.", [
      ["scout", "{w} opens the next map, finds the hidden chest and, politely, tells the whole party where the best dessert is."],
      ["clown", "{w} turns the city festival into an improv show, and the whole square, delighted, plays along."],
      ["bond", "{w} befriends the baker, the guard and the very shy bard in a single afternoon."],
      ["puzzle", "{w} reads the ancient mechanism, the petals and the faint hum and plays the correct note."],
      ["comfort", "{w} sits with the frightened child at the festival and, with a very small trick, turns the whole sky pink."]
    ], [
      B("pair", ["curious", "You arrive in the first city for a short visit. {A} and {B} leave a week later with a new friend, a recipe and a very mysterious key."], ["relaxed", "You spend the first week at the festival. {A} and {B} sample every stall and, quite rightly, call it research."]),
      B("lead", ["bold", "{lead} points at the mountain and says 'Up'. The party, cheerfully, follows."], ["steady", "{lead} checks the map, the weather and the supplies, and calls the climb at exactly the right hour."]),
      B("other", ["warm", "{other} cooks a meal that makes the whole party, for a moment, forget the quest."], ["analytic", "{other} reads the old text, notices the clause that nobody has looked at and opens a very odd door."]),
      B("gap", ["close", "You reach the next city on the same evening, laughing and a little tired, and share a very good dumpling."], ["far", "You each follow a different quest, and, at the festival, trade the stories over a very small candle."])
    ]),
    W("fodlan", "Fódlan rewards the teacher: a monastery, a classroom and the quiet conviction that the right word at the right time can change a war.", [
      ["leader", "{w} takes the class, the plan and the very awkward silence, and makes a decision that, somehow, works."],
      ["study", "{w} has the notes, the maps and the very careful flash cards ready by the second day."],
      ["diplomat", "{w} sits down with two warring students and a cup of tea and, quietly, ends the feud."],
      ["schemer", "{w} has already worked out which house, which professor and which strategy will matter in the final exam."],
      ["comfort", "{w} sees the student who has been quiet all week, and sits with them in the garden."]
    ], [
      B("pair", ["planner", "You run the first term like a campaign. {A} and {B} have a schedule, a syllabus and a very tidy battle plan."], ["warm", "You start the term with a tea party. {A} and {B} learn every student's name and, by autumn, every student's story."]),
      B("lead", ["driven", "{lead} gives the order on the field, and the class, with a grin, follows into the hardest battle of the year."], ["steady", "{lead} waits for the right moment, gives a short word of advice and watches the whole squad find their feet."]),
      B("other", ["analytic", "{other} reads the enemy's formation and finds the gap, and the final exam becomes a very elegant battle."], ["warm", "{other} writes a short letter to each student after the fight, and the whole class, quietly, gets braver."]),
      B("gap", ["close", "You graduate the class together and watch them walk into a very large, unclear future, side by side."], ["far", "You each teach a different house, and, on the last night, share the same, unexpected pride."])
    ]),
    W("midgar", "Midgar rewards the misfit party: a very large city, a very small band of rebels and a planet that is, rather politely, asking for help.", [
      ["leader", "{w} takes the sword, the job and the first, doubtful step, and the party follows."],
      ["comfort", "{w} sits with the weary fighter after the raid and, with a smile, makes the whole night a little lighter."],
      ["bond", "{w} befriends the flower seller, the kid and the very cranky shopkeeper in a single afternoon."],
      ["sacrifice", "{w} stays behind on the platform so the others can reach the train."],
      ["scared", "{w}, who is quietly terrified of the reactor, and is, with a very small laugh, going in anyway."]
    ], [
      B("pair", ["bold", "You leave the slums with a plan, a sword and a very large bag. {A} and {B} are brave, loud and, quite quickly, famous."], ["cautious", "You study the reactor for a week. {A} and {B} learn the schedule, the vents and a very useful rumour."]),
      B("lead", ["driven", "{lead} makes the first jump, the first swing and the first speech, and the whole band, a bit startled, follows."], ["nervy", "{lead} doubts, hesitates and, at the last moment, takes the shot that wins the day."]),
      B("other", ["warm", "{other} patches the wounded and remembers every name, and the party stays a party."], ["analytic", "{other} reads the map, finds the hidden route and quietly rewrites the heist."]),
      B("gap", ["close", "You finish the mission on the same train, in the same silence, with the same very small smile."], ["far", "You each take a different job on the same night, and meet, quite by accident, in the same alley."])
    ]),
    W("courtroom", "The Courtroom rewards the bluff: a witness stand, a very awkward contradiction and the courage to say 'Hold it' at precisely the wrong moment.", [
      ["puzzle", "{w} spots the one contradiction in a twenty-minute testimony and, with a flourish, points at it."],
      ["entrance", "{w} makes the dramatic entrance into the courtroom, to a very small gasp, and a very large file."],
      ["skeptic", "{w} says, loudly, that the witness's story does not make sense, and is, to everyone's astonishment, right."],
      ["persist", "{w}, who has been arguing the same point for three hours and is, patiently, about to win it."],
      ["clown", "{w} makes a joke at exactly the wrong moment, and the judge, to everyone's surprise, laughs."]
    ], [
      B("pair", ["planner", "You prepare the case for a week. {A} and {B} have a binder, a diagram and a very polite argument about the exhibit."], ["improviser", "You walk in with a hunch and a bluff. {A} and {B} are, by the third witness, quite convinced it is a plan."]),
      B("lead", ["bold", "{lead} points at the witness and says the line. The whole courtroom, to a person, leans forward."], ["steady", "{lead} waits, takes a careful breath and asks the one question that changes the trial."]),
      B("other", ["analytic", "{other} reads the autopsy, the map and the very small receipt and finds the thread that unravels the whole case."], ["warm", "{other} stays with the nervous defendant between sessions, and the whole trial, quietly, changes tone."]),
      B("gap", ["close", "You win the case together and share a quiet bowl of noodles in the hallway, with the same very small grin."], ["far", "You each argue a different half of the case, and the judge, delighted, declares it, an unusual, enjoyable draw."])
    ]),
    W("kamurocho", "Kamurocho rewards the sincere: a neon street, a karaoke night and the unshakeable belief that a good meal can solve almost anything.", [
      ["protect", "{w} steps between the gangster and the shopkeeper and says, politely, that this is not the evening for it."],
      ["clown", "{w} sings the karaoke so badly and so sincerely that the whole bar, to a person, stands and cheers."],
      ["bond", "{w} befriends the noodle chef, the rival and the very suspicious cat in a single evening."],
      ["persist", "{w}, who has been punched, thrown and soaked in the rain and is, with a nod, still going."],
      ["sacrifice", "{w} takes the beating so {o} can reach the stairs, and says it was nothing."]
    ], [
      B("pair", ["hopeful", "You start the evening with a favour for a friend. {A} and {B} end it with a very large fight, a very small victory and a very good ramen."], ["steady", "You take the district one street at a time. {A} and {B} learn every alley, every bar and every very well-meaning thug."]),
      B("lead", ["steady", "{lead} walks into the club without a word, and the whole room, from the bouncer to the band, goes quiet."], ["bold", "{lead} kicks the door, announces the favour and takes the first punch. The evening is, briefly, theirs."]),
      B("other", ["funny", "{other} turns the grim standoff into a karaoke challenge, and the villain, to his dismay, loses."], ["warm", "{other} sits with the crying kid on the steps, and the whole street, quietly, relaxes."]),
      B("gap", ["close", "You finish the night on the same bench, with the same very good noodles and the same quiet pride."], ["far", "You each fix a different problem on the same street, and meet, battered and delighted, at the same stall."])
    ]),
    W("underworld", "The Underworld rewards the escape artist: a long staircase, a very large family and a surprising number of people who would, secretly, like you to make it.", [
      ["persist", "{w}, who has died in the same corridor eleven times and is, with a smile, taking the twelfth."],
      ["charmer", "{w} wins over the guard, the shade and the three-headed dog with a very good joke."],
      ["argue", "{w} contradicts the family at dinner, loudly and, in a small way, affectionately."],
      ["daredevil", "{w} leaps the chasm, grabs the very shiny thing and lands, with a flourish, on the wrong side of the plan."],
      ["bond", "{w} befriends the cook, the ghost and the sulking god in a single afternoon."]
    ], [
      B("pair", ["bold", "You make the first run with a sword and a very good joke. {A} and {B} are loud, quick and very well-armed."], ["cautious", "You study the first floor for three runs. {A} and {B} learn the monsters, the traps and the very good meal at the end."]),
      B("lead", ["driven", "{lead} charges down the staircase, shouting a very polite challenge. The monsters, bewildered, make way."], ["steady", "{lead} walks the long hall at a measured pace, and the first guard, to everyone's surprise, gives way."]),
      B("other", ["warm", "{other} sits at the family dinner, gives each member a very honest compliment and, for a moment, disarms the whole house."], ["analytic", "{other} watches the guard's pattern, notes the gap and slips through with a small, tidy bow."]),
      B("gap", ["close", "You reach the surface together, blinking in the daylight, and share, for a moment, a very surprised laugh."], ["far", "You each find a different way out, and meet, to your delight, at exactly the same spot."])
    ]),
    W("arcadia-bay", "Arcadia Bay rewards the honest: a foggy coast, a small town and the very small, very important choices that decide how it ends.", [
      ["comfort", "{w} notices the friend who has stopped talking, sits next to her and says nothing, which is exactly right."],
      ["rulebreak", "{w} sneaks into the school after hours with a grin and a very good reason."],
      ["puzzle", "{w} lays out the photographs on the floor and, slowly, finds the pattern."],
      ["scared", "{w}, who is quietly terrified and holding it together with a very small joke."],
      ["loner", "{w} wanders down to the lighthouse alone and returns, hours later, with a very good photograph."]
    ], [
      B("pair", ["warm", "You meet up at the diner after years apart. {A} and {B} spend the evening catching up, and the weekend, quietly, changing everything."], ["cautious", "You meet at the lighthouse, wary and sad. {A} and {B} take a long, honest, slightly awkward walk along the shore."]),
      B("lead", ["bold", "{lead} breaks into the school after dark, with a flashlight and a plan. It is not a good plan. It is, somehow, the right one."], ["steady", "{lead} listens to the long, awkward silence and, finally, says the true thing."]),
      B("other", ["analytic", "{other} lines up the photographs, the notes and the timeline, and finds the date that does not fit."], ["warm", "{other} stays with the friend who is grieving, and the whole weekend becomes about her."]),
      B("gap", ["close", "You watch the storm from the same hill, quiet, close and quite sure of one thing."], ["far", "You each make a different choice at the lighthouse, and the town, for a moment, holds its breath."])
    ]),
    W("occult-tokyo", "The Occult Underground rewards the unfazed: a haunted tunnel, a very polite alien and a group chat that has, at this point, lost all hope of normality.", [
      ["daredevil", "{w} opens the haunted tunnel door with a hearty shout and, to everyone's alarm, a very good result."],
      ["scared", "{w}, who is quietly terrified of the ghost and is, with a very small voice, asking it for its name."],
      ["clown", "{w} narrates the whole supernatural incident in a running commentary that makes the ghost, to its own surprise, laugh."],
      ["puzzle", "{w} reads the cursed note, the strange stain and the very odd symbol and, with a snap, understands."],
      ["protect", "{w} steps between the ghost and the new friend, with a cheerful scowl and a lunch box."]
    ], [
      B("pair", ["improviser", "You enter the tunnel with a flashlight and a very bad plan. {A} and {B} are, by midnight, in a negotiation with a spirit."], ["bold", "You walk straight up to the haunted house and ring the bell. {A} and {B} are loud, brave and, shortly, in a very strange tea party."]),
      B("lead", ["driven", "{lead} kicks open the door and shouts a challenge to the whole supernatural world. The world, startled, answers."], ["nervy", "{lead} screams, runs and trips on the carpet. It was, in hindsight, the exact sequence that broke the curse."]),
      B("other", ["funny", "{other} turns the demon's demand into a very silly contract, and the whole exchange, to everyone's relief, is a draw."], ["analytic", "{other} reads the ghost's story and finds the one detail that has been, patiently, waiting for someone to notice."]),
      B("gap", ["close", "You leave the tunnel together, giggling and shaken, with a very strange souvenir and a very good new friend."], ["far", "You each take a different side of the haunting, and the ghost, entertained, lets you both stay for dinner."])
    ]),
    W("fiore", "Fiore rewards the guild: a noisy hall, a quest board and a very firm belief that the property damage is part of the budget.", [
      ["trainer", "{w} is up at dawn, training with a cheerful ferocity that wakes the whole dorm."],
      ["protect", "{w} steps in front of the enemy, grins and says a very loud thing about friendship."],
      ["bond", "{w} befriends the entire guild by lunch and has six invitations to dinner."],
      ["clown", "{w} starts a brawl at breakfast that, by dinner, becomes a very official tournament."],
      ["leader", "{w} gives a speech so earnest that the guild, to a mage, stands up and cheers."]
    ], [
      B("pair", ["hopeful", "You join the guild for a single quest. {A} and {B} leave a season later with a team, a scar and a very large debt for a broken fountain."], ["bold", "You take the hardest job on the board. {A} and {B} are loud, fearless and, remarkably, on time."]),
      B("lead", ["driven", "{lead} charges the enemy with a cheerful shout, and the whole guild, grinning, joins in."], ["steady", "{lead} holds the line with a calm that makes the whole squad, for a moment, feel unbeatable."]),
      B("other", ["warm", "{other} tends the wounded and starts the post-fight feast, and the guild, for a night, is a family."], ["analytic", "{other} reads the enemy's spell, finds the counter and, quietly, saves the whole day."]),
      B("gap", ["close", "You finish the job in the same breath and celebrate at the same table, with the same large mug."], ["far", "You each take a different job in the same town, and, by the evening, are both in the same, very happy brawl."])
    ]),
    W("clover-kingdom", "The Clover Kingdom rewards the underdog: a squad, a grimoire and the stubborn certainty that effort counts for more than it should.", [
      ["trainer", "{w} is up before the sun, swinging the same sword and shouting the same promise."],
      ["dream", "{w}, who has a goal, a plan and a very loud way of announcing both."],
      ["persist", "{w}, who has failed the same test five times and is, with a grin, taking the sixth."],
      ["leader", "{w} takes the front of the squad with a wide grin, and the squad, bewildered, follows."],
      ["comfort", "{w} brings a very good stew to the weary squad and, with a bad joke, turns the whole mood."]
    ], [
      B("pair", ["hopeful", "You join the squad for a short trial. {A} and {B} are, by the end of the week, loud, loyal and a little scorched."], ["competitive", "You start the first day with a rivalry. {A} and {B} turn a very small contest into a very large friendship."]),
      B("lead", ["driven", "{lead} announces the goal, takes the first swing and, to everyone's surprise, brings the squad with them."], ["steady", "{lead} faces the strong opponent with a calm that makes the squad, for the first time, believe."]),
      B("other", ["warm", "{other} patches up the squad after the mission and, with a loud, silly speech, brightens the whole hall."], ["analytic", "{other} reads the enemy's magic, spots the flaw and, with a short note, saves the day."]),
      B("gap", ["close", "You finish the exam together and, with a loud shout, celebrate the first of many victories."], ["far", "You each train in a different style and, at the exam, meet in the middle, surprised and pleased."])
    ]),
    W("kabuki-district", "The Kabuki District rewards the unserious: a stuffy apartment, a ridiculous job and the grudging conviction that being a good friend is the only plan.", [
      ["clown", "{w} turns the most serious interrogation into a bit, and the suspect, helplessly, joins in."],
      ["loot", "{w} wins the argument over the last parfait with a speech so earnest that it ends in a tie."],
      ["protect", "{w} steps in front of the thug, yawns and says, 'Not today.'"],
      ["stubborn", "{w} refuses to pay the rent, the bill and the very large fine, on principle."],
      ["comfort", "{w} sits with the sad stranger, says nothing and buys them a very large dessert."]
    ], [
      B("pair", ["relaxed", "You take a job that is mostly a nap. {A} and {B} are, by noon, in a chase, a fight and a very awkward tea."], ["funny", "You start the day with a joke. {A} and {B} end it with a very large, very stupid and very sincere rescue."]),
      B("lead", ["steady", "{lead} faces the strongest opponent with a lazy half-smile, and, with a single, calm strike, ends it."], ["bold", "{lead} bursts in, shouting something rude and heroic, and the room, startled, parts."]),
      B("other", ["warm", "{other} quietly pays the bill, calms the crowd and returns the lost cat, and nobody, ever, mentions it."], ["analytic", "{other} reads the fine print on the contract and finds the clause that changes the whole job."]),
      B("gap", ["close", "You finish the day on the same couch, with the same large dessert, in the same comfortable, ridiculous silence."], ["far", "You each take a different job on the same street, and are, by dinner, in the same fight."])
    ]),
    W("tokyo-3", "Tokyo-3 rewards the steady: a city that unfolds into a fortress, a quiet crew and a very young person being asked to do a very large thing.", [
      ["comfort", "{w} makes breakfast for the pilot who has stopped speaking and sits there while it is not eaten."],
      ["calm", "{w} watches the enormous thing arrive and, with a clipped voice, gives the order."],
      ["duty", "{w} reports for duty, checks every gauge and quietly makes everyone's afternoon safer."],
      ["scared", "{w} is secretly terrified and, with a very small hand on the controls, takes the shot."],
      ["moral", "{w} asks the one question at the briefing that nobody, until then, had thought to ask."]
    ], [
      B("pair", ["steady", "You report for the first sortie. {A} and {B} are quiet, careful and quite surprised by how very large the problem is."], ["cautious", "You study the simulator for a week. {A} and {B} learn the controls, the schedule and each other's silences."]),
      B("lead", ["steady", "{lead} gives the order in a clipped, calm voice, and the whole control room, as one, moves."], ["nervy", "{lead} hesitates, then says the word. It is the right word, and the room, relieved, exhales."]),
      B("other", ["warm", "{other} sits with the pilot after the fight, and in the silence, a very small, honest conversation begins."], ["analytic", "{other} reads the readouts, finds the pattern and quietly points out the weak point."]),
      B("gap", ["close", "You finish the mission together and sit, for a long moment, in the same quiet, with the same small, unspoken thanks."], ["far", "You each handle a different part of the fight, and meet, in the aftermath, with a very careful, grateful nod."])
    ]),
    W("seasoning-city", "Seasoning City rewards the kind: a quiet suburb, a very powerful kid and a ghost that would, honestly, just like a snack.", [
      ["calm", "{w} watches the ghost loom, the lights flicker and the ground shake, and quietly offers it a drink."],
      ["comfort", "{w} sits with the sad spirit and listens, and the whole room, to everyone's relief, calms."],
      ["skeptic", "{w} raises an eyebrow at the price list and, with a flat look, asks if the exorcism is refundable."],
      ["charmer", "{w} gives the whole crowd a pitch so smooth that the ghost, to its own surprise, buys the package."],
      ["protect", "{w} steps between the spirit and the shy friend, with a worried face and a very large reserve."]
    ], [
      B("pair", ["warm", "You set up a very small consultation office. {A} and {B} spend the first day on a ghost, a lost cat and a very sincere pep talk."], ["relaxed", "You start the day with a snack and a mild haunting. {A} and {B} are, by dusk, entirely at home."]),
      B("lead", ["steady", "{lead} faces the huge spirit with a calm voice and a gentle suggestion, and the whole thing, to everyone's surprise, lies down."], ["funny", "{lead} gives the ghost a very good speech, a very bad discount and a small, honest apology."]),
      B("other", ["analytic", "{other} reads the haunted house's history and finds the one small, sad thing that started it."], ["warm", "{other} listens to the lonely spirit for an hour and, in doing so, ends the haunting."]),
      B("gap", ["close", "You finish the day on the same step, with the same snack and the same quiet, contented air."], ["far", "You each handle a different case on the same street, and meet, tired and happy, at the same corner shop."])
    ])
  ]);
})(Forge);
