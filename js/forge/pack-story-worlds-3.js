/* =========================================================================
   WORLD SCRIPTS 3 (data only): the question-and-story script for thirteen of the new worlds (pack-worlds-2.js), same shape as
   pack-story-worlds.js:  W(id, intro, [[question, answer, override?] x5], [beat x4]),  B(about, [preset, text], [preset, text]).
   Answers use {w} (the person it fits) and {o} (the other); beats use {A} {B} {lead} {other}. Original wording written for Forge.
   ========================================================================= */
(function(F){
  "use strict";
  if (!F.packs) return;
  const W = (id, intro, qs, beats) => ({ id, intro, qs, beats });
  const B = (about, ...o) => ({ about, o });

  F.packs.add("worldScripts", [
    W("tamriel", "Tamriel rewards the wanderer: a map with too many markers, a rumour in every tavern and a very forgiving relationship with time.", [
      ["scout", "{w} has already crested the next hill and is waving, cheerfully, at something that is probably a dragon. {o} catches up with the map and a plan."],
      ["lost", "{w}, going straight past a perfectly good road because a distant cave looked interesting."],
      ["caught", "{w}. Not out of malice; the shop was open, the shelf was low and the guard was looking the other way for exactly four seconds.", "Who gets caught pocketing the spoon?"],
      ["loot", "{w} wins it by calmly asking for the one item {o} had not realised was the valuable one."],
      ["dream", "{w}, who has a list of every province and a plan to see them before the second winter."]
    ], [
      B("pair", ["improviser", "You leave the first town with no destination and three side quests, and by dusk {A} and {B} have been in a library, a cave and a mild argument with a bear."], ["planner", "You mark the map before you leave. {A} and {B} get through six quests in a week and are somehow, unreasonably, still thorough."]),
      B("lead", ["bold", "{lead} walks into the first ruin like it owes them money. The dust settles, the door opens and everyone, briefly, agrees it was a good idea."], ["cautious", "{lead} checks the floor, the walls and the ceiling before stepping in. There was a trap. There always is."]),
      B("other", ["curious", "{other} reads the odd inscription on the wall and quietly realises it is a map to somewhere better than the one you were going."], ["warm", "{other} befriends every innkeeper, and so you are never short of a hot meal, a bed or the useful local rumour."]),
      B("gap", ["close", "You come back the same way you left, laden, tired and finishing each other's stories, with three more quests than you started with."], ["far", "You split at the crossroads over a map you each read differently, and reunite a month later with two entirely different maps."])
    ]),
    W("runeterra", "Runeterra rewards ambition, a faction to answer to and the willingness to be on the wrong side of someone's grudge.", [
      ["leader", "{w} walks into the war council already holding the plan. Whether {o} agrees is a separate matter, and quite a good argument."],
      ["schemer", "{w}, who has been quietly weighing three alliances while {o} was still choosing a side."],
      ["argue", "{w} cheerfully contradicts every strategist in the room and is right often enough to be allowed to."],
      ["trusted", "{w}, whose word is the one the city-state believes when everyone else is posturing."],
      ["stubborn", "{w} does not concede a point, a district or a duel, even when the other side has already won."]
    ], [
      B("pair", ["competitive", "You arrive as rivals in the same city and leave as the most formidable pair in it. {A} and {B} keep score loudly and quite happily."], ["coop", "You enter as champions of different banners and end up on the same wall. {A} and {B} cover for each other more than either would admit."]),
      B("lead", ["driven", "{lead} gives a speech that is mostly an ultimatum, and the room stands up anyway. It is not a plan, but it is a very good start."], ["steady", "{lead} waits out three hours of debate, says one calm sentence, and the room changes its mind."]),
      B("other", ["analytic", "{other} reads the contract, the map and the old treaty and finds the clause that makes the war a conversation instead."], ["guarded", "{other} watches who speaks, who does not and who keeps looking at the door, and acts on exactly that."]),
      B("gap", ["close", "You win a city together, argue about who should hold it and agree, to everyone's surprise, that it should be both of you."], ["far", "You win the city on different terms. {A} wants to rebuild it and {B} wants to hold it, and for a while it has two banners."])
    ]),
    W("lands-between", "The Lands Between rewards patience, a long breath before a boss and the humility to admit that the thing is much bigger than you.", [
      ["persist", "{w}, who has fought the same boss eleven times and is already thinking about the twelfth, calmly, with a slightly better plan."],
      ["calm", "{w}, who breathes out, rolls aside and does not let the third hit rattle the fourth."],
      ["puzzle", "{w} reads the strange lore on a broken statue, notices what it implies about the dungeon, and quietly saves the party an hour."],
      ["loner", "{w}, who wanders off to explore a ruin everybody else was told to avoid, and returns with something shiny and slightly cursed."],
      ["sacrifice", "{w} stays on the bridge for just a little too long so that {o} can reach the next bonfire."]
    ], [
      B("pair", ["cautious", "You approach the first castle slowly. {A} and {B} learn the patrol routes, the weak ledges and the one very tempting shortcut that is definitely a trap."], ["bold", "You charge the first gate with more confidence than equipment. {A} and {B} die quite gloriously and get through on the fifth try."]),
      B("lead", ["steady", "{lead} steps into the boss arena as though entering a quiet church. Three small, patient mistakes later, the giant is on its knees."], ["nervy", "{lead} rolls too early, rolls too late and rolls into a wall. It works anyway, and nobody ever talks about how."]),
      B("other", ["analytic", "{other} watches the boss's pattern for two attempts and writes it on a scrap of paper. On the third, it is a dance, and a short one."], ["warm", "{other} tends to the fallen, shares a flask and keeps the moral of the party intact on a road that has very little of it."]),
      B("gap", ["close", "You reach the great tree together, exhausted and in total agreement about the next step. It is not a victory, exactly, but it is yours."], ["far", "You reach the same tree by different roads. {A} has the sword and {B} has the secret, and you spend an evening deciding which counts."])
    ]),
    W("yharnam", "Yharnam rewards calm hands, a good torch and a very honest appraisal of how much you really want to know.", [
      ["survive", "{w} keeps a steady pace, counts every vial and refuses to open a door that sounds like it is breathing. {o} follows, grateful."],
      ["scared", "{w}, who is secretly terrified and handling it by being unflappably polite to everything with claws."],
      ["puzzle", "{w} reads the strange notes in the gutter and realises the street plan is a very old and very rude map."],
      ["tempted", "{w}, who has just seen something in a jar and is, against all advice, going to ask about it."],
      ["caught", "{w}. Not through fear; they stopped to read the very interesting book in the very wrong room.", "Who gets caught reading in the wrong room?"]
    ], [
      B("pair", ["cautious", "You edge into the first alley, listening. {A} and {B} count the lamps, mark the doors and find a safe room by pure, unglamorous attention."], ["bold", "You walk down the middle of the street like it belongs to you. {A} and {B} are, briefly, correct, and then a lot more careful."]),
      B("lead", ["steady", "{lead} faces the beast at the end of the street with a slow, practised calm. It is not brave exactly, just entirely unrushed, and that is enough."], ["nervy", "{lead} fires too early, panics at the second sound and wins on a technicality involving a lantern. They will not describe it again."]),
      B("other", ["analytic", "{other} notices the pattern in the sounds, the lamps and the doors, and works out which street is safe at which hour."], ["warm", "{other} keeps talking in a calm voice through the worst of it, and somehow the night becomes just a little less long."]),
      B("gap", ["close", "You reach the morning together, tired, spattered and certain of one thing: whatever the dream was, neither of you would have done it alone."], ["far", "You each read the night differently. {A} saw a plan and {B} saw a warning, and by dawn you are agreeing very carefully to disagree."])
    ]),
    W("silent-hill", "Silent Hill rewards steady nerves, honest answers and the willingness to walk into the fog without telling it what you expect to see.", [
      ["calm", "{w} walks through the fog like it is weather. {o} watches, impressed, and keeps one hand on the nearest rail."],
      ["scared", "{w}, who has not said a word in four minutes and is gripping the flashlight a little too tightly."],
      ["comfort", "{w}, who notices the shaking hands, offers the last piece of chocolate and says exactly nothing about it."],
      ["skeptic", "{w} says, flatly, that the radio is not a ghost, the fog is not a metaphor and they will be sitting in the car, thanks."],
      ["persist", "{w}, who keeps going through the third corridor, the second stairwell and the fourth identical door, because stopping would be worse."]
    ], [
      B("pair", ["cautious", "You enter the town slowly, with a map and a rule: never go anywhere alone. {A} and {B} keep it for nearly twenty minutes."], ["bold", "You walk straight into the fog because standing still is worse. {A} and {B} get a surprising distance before the radio starts to hiss."]),
      B("lead", ["steady", "{lead} turns a corner, sees something that should not be there, and keeps walking at exactly the same pace. The thing, confused, steps aside."], ["nervy", "{lead} sees it, says something unprintable and runs three blocks. It was a mannequin. It was also, to be fair, not the first mannequin."]),
      B("other", ["warm", "{other} talks quietly through the worst stretch, about nothing in particular, and the fog is a little less loud."], ["guarded", "{other} says nothing, watches everything and notices the one door that is the wrong colour."]),
      B("gap", ["close", "You leave the town in the same car, in the same silence, and for once it is a comfortable one."], ["far", "You each came here for something different. {A} found theirs and {B} found a different thing, and you do not talk about it until the next county."])
    ]),
    W("raccoon-city", "Raccoon City rewards cool heads on the worst night of your life, and the decency to look back for whoever you passed in the street.", [
      ["survive", "{w} counts ammunition, checks every window and knows which alley is a dead end by the smell. {o} sticks close and learns fast."],
      ["protect", "{w} steps between the shuffling figure and {o} without being asked, and then pretends it was an accident."],
      ["scout", "{w} runs ahead to check the street, finds the working car, and quietly marks the corner that is full of things."],
      ["sacrifice", "{w} stays behind to hold the gate, says 'I will catch up' and means it slightly too much."],
      ["moral", "{w}, who stops, turns around and goes back for the stranger who has been shouting for help for three blocks."]
    ], [
      B("pair", ["cautious", "You move down the main street in cover, checking every shop. {A} and {B} spend a long time on the first block and find everything worth finding."], ["bold", "You take the main street at a run, because the other option is a corridor. {A} and {B} get a very long way before the first real problem."]),
      B("lead", ["steady", "{lead} steps into the police station lobby, takes in six exits in one look and picks the right one. Nobody asks how."], ["nervy", "{lead} shouts something loud, throws the nearest heavy object and runs. It is, against every instinct, the correct tactic."]),
      B("other", ["analytic", "{other} reads the badge, the map and the cabinet, and unlocks the one door the building actually needed you to open."], ["warm", "{other} keeps the whole group talking in the dark, which matters more than any weapon on the shelf."]),
      B("gap", ["close", "You reach the helicopter together with half the ammunition and all your nerve, finishing each other's sentences on the way up."], ["far", "You reach it by different roads, arguing on the radio the whole way, and meet on the roof with entirely different stories."])
    ]),
    W("shire", "The Shire rewards a second breakfast, a good garden and the stubborn courage of people who would rather not, but will.", [
      ["caretaker", "{w} has already put the kettle on, found three extra chairs and remembered everybody's favourite biscuit."],
      ["bond", "{w}, who knows every neighbour by name, every cousin by branch and every recipe by heart."],
      ["calm", "{w}, who watches the most dramatic news of the month with a cup of tea and a mild frown."],
      ["dream", "{w}, who has a map of everywhere beyond the Brandywine and is, quietly, thinking of going."],
      ["clown", "{w}, who turns a Tuesday afternoon into a party, with a song, a pie and a small and very harmless prank."]
    ], [
      B("pair", ["relaxed", "You stay in the village for the whole summer. {A} and {B} spend the days in the garden, the evenings in the pub and the nights, slowly, becoming local legends."], ["curious", "You set out for a walk and come back, a week later, with four new friends and a map of the next valley. {A} and {B} call it a short holiday."]),
      B("lead", ["steady", "{lead} organises the harvest supper with a calm so total that it feels like a magic trick. Nothing burns. Nobody is late."], ["nervy", "{lead} panics gently about the pie, the chairs and the weather, and then the whole supper is, somehow, a triumph."]),
      B("other", ["warm", "{other} sits with the shy neighbour and the grumpy neighbour, and by the end of the evening they are talking about tomatoes together."], ["funny", "{other} tells the story of the missing sausage so well that the whole room has to sit down."]),
      B("gap", ["close", "You finish the year in the same garden with the same kettle, and a very quiet certainty that this is what it was all for."], ["far", "One of you is content at home, and one of you keeps looking at the road. It is the most gentle disagreement in the history of the world."])
    ]),
    W("rivendell", "Rivendell rewards the patient: a long table, a longer library and the humility to listen to somebody who has been right for a very long time.", [
      ["puzzle", "{w} reads the old map twice, notices the faint line in the margin and quietly redraws the route. {o} nods, relieved."],
      ["mentor", "{w} ends up teaching the youngest member of the council how to read the stars, one patient evening at a time."],
      ["diplomat", "{w} finds the one thing both sides want and says it so softly that the whole table sits down."],
      ["calm", "{w}, who has not raised their voice in three days of debate and has still, somehow, changed everyone's mind."],
      ["study", "{w}, who has read the whole library once and is now reading it, with great pleasure, again."]
    ], [
      B("pair", ["curious", "You arrive for an afternoon and stay for a season. {A} and {B} are, by the first week, on a first-name basis with the librarian and the cook."], ["cautious", "You arrive with a list of questions, and are somewhat disarmed to discover that the answers are all in the next room, politely waiting."]),
      B("lead", ["steady", "{lead} sits through the council's long debate, asks one very short question and watches the whole room quietly rearrange itself."], ["driven", "{lead} stands, summarises the problem in four sentences and says: 'We should go.' It is blunt. It is also, to everyone's surprise, correct."]),
      B("other", ["analytic", "{other} compares three old treaties and finds the single sentence that changes what the fight was about."], ["warm", "{other} finds the weary traveller in the corridor, sits with them for an hour and gives the whole council a calmer afternoon."]),
      B("gap", ["close", "You leave Rivendell at dawn with the same list and a very similar sense of what is going to be difficult about it."], ["far", "You leave by different gates. {A} has the map and {B} has the warning, and it will take a long road to put them together."])
    ]),
    W("gondor", "Gondor rewards the stubborn: a wall, a watch and the habit of holding a line long after it stops being fashionable.", [
      ["leader", "{w} steps up onto the wall without being asked and says four words that make the soldiers stand a little straighter."],
      ["persist", "{w}, who has been on the wall for forty hours and will be for a few more, because someone has to."],
      ["sacrifice", "{w} rides out at dawn, because the plan needs someone to, and because they would rather it was them."],
      ["duty", "{w} polishes the armour, counts the arrows and quietly checks every post, twice, just as they always do."],
      ["calm", "{w}, who watches the enormous dark army arrive and asks, calmly, whether anyone has seen the water bucket."]
    ], [
      B("pair", ["steady", "You hold the first gate together. {A} and {B} take a position, say nothing and hold it, which is, in its own way, a considerable speech."], ["bold", "You ride out of the city rather than wait inside it. {A} and {B} are very brave and a little unwise, and the legend gets better with each telling."]),
      B("lead", ["driven", "{lead} gives the order to hold, and the line holds. It is not the most elegant instruction. It is, however, exactly the right one."], ["cautious", "{lead} walks the whole wall at midnight, checks every watchman and leaves, quietly, a fresh candle at each post."]),
      B("other", ["coop", "{other} brings water, bandages and bad jokes along the wall, and the watch is lighter by exactly one worry."], ["analytic", "{other} reads the map, counts the banners and realises that the army is not where it ought to be, which changes everything."]),
      B("gap", ["close", "You hold the city together, and when the dawn comes, you are standing in the same place, a little battered and quite unmoved."], ["far", "One of you held the gate and one rode out. You will argue, years later, about which was the braver, and you will both be right."])
    ]),
    W("moria", "Moria rewards quiet feet, honest friends and the sense not to say what you think about the very large door.", [
      ["scout", "{w} goes ahead of the group in the dark, feels for the draught and comes back to say, quietly, which stairs to avoid."],
      ["calm", "{w}, who watches the walls begin to shake and says 'Keep walking' in a voice that makes everyone, strangely, keep walking."],
      ["sacrifice", "{w} holds the narrow bridge so the others can reach the far side, and says they will be right behind them."],
      ["scared", "{w}, who is secretly terrified of the dark, the drums and the very high ceiling, and is hiding it behind a practical question about boots."],
      ["trusted", "{w}, whose hand the whole group reaches for when the torch goes out."]
    ], [
      B("pair", ["cautious", "You enter the mines in single file and total silence. {A} and {B} spend the first hour counting steps and the second hour not talking about the noise."], ["bold", "You walk in with torches held high. {A} and {B} learn very quickly why the old dwarves did not, and also what a very big door sounds like."]),
      B("lead", ["steady", "{lead} walks at the front and does not hurry. Every ten steps, they say quietly, 'Still here', and the dark gets slightly smaller."], ["nervy", "{lead} jumps at every echo, and the whole group, by general agreement, takes it as a sign to stay close."]),
      B("other", ["warm", "{other} talks softly in the dark about nothing in particular, and the long corridor feels, briefly, like an ordinary one."], ["analytic", "{other} notices the dwarf-marks on the wall, reads them as a map and finds the way out of the chamber that did not want to be left."]),
      B("gap", ["close", "You step out into the sunlight together, blinking and quiet, with the strong sense that neither of you will ever mention it again."], ["far", "You emerge by different tunnels, both certain that the other is lost, and find you were in the same room all along."])
    ]),
    W("forgotten-realms", "The Forgotten Realms reward the party: a tavern, a quest board and a group of people who have exactly nothing in common and do it anyway.", [
      ["leader", "{w} announces the plan with great confidence. {o} watches the dice, politely, and mentally prepares an alternative."],
      ["rulebreak", "{w} is already negotiating with the dragon, the vault door and the very strict bouncer, in no particular order."],
      ["caretaker", "{w} patches up the party after the fight, remembers everyone's allergies and keeps the camp meal edible."],
      ["charmer", "{w} wins over the innkeeper, the guard and the baron's suspicious cat in one conversation."],
      ["clown", "{w} narrates the whole disaster with such panache that even the cursed treasure seems to be laughing."]
    ], [
      B("pair", ["improviser", "You enter the dungeon with a plan, a rule and a very detailed map. {A} and {B} use none of them and somehow arrive at the right door."], ["planner", "You roll for initiative with a full strategy, three contingencies and an excellent camp rota. {A} and {B} survive the first room by an unreasonable margin."]),
      B("lead", ["bold", "{lead} kicks open the door, announces the quest and trusts, with absolute confidence, that the rest of the party is right behind them."], ["cautious", "{lead} asks the game master four questions about the door, the floor and the suspiciously clean statue before touching anything."]),
      B("other", ["funny", "{other} turns the grim moment of the trap into a story the whole party will tell for years, and then, quietly, disarms it."], ["warm", "{other} checks in on every member of the party between fights, and keeps the whole campaign emotionally afloat."]),
      B("gap", ["close", "You finish the campaign with the whole party alive, a lot of loot and a strong, shared sense that this was a very good table."], ["far", "You each played a different campaign in the same room. {A} had a quest, {B} had a feud, and the game master has stopped asking questions."])
    ]),
    W("persona-tokyo", "Persona's Tokyo rewards the school year: a club, a part-time job and the slow, ordinary work of becoming someone's friend.", [
      ["bond", "{w} learns everyone's name, favourite food and exam stress by the end of the first week, and remembers them all."],
      ["comfort", "{w} notices the one person who has stopped eating lunch, and sits with them until the bell."],
      ["study", "{w} has the notes, the highlighters and a plan for finals, and generously shares all three."],
      ["rumor", "{w} hears everything first, from the club, the café and the rooftop, and tells only the useful parts."],
      ["calm", "{w}, who watches the whole class panic over the surprise quiz and quietly takes out a pen."]
    ], [
      B("pair", ["coop", "You join the same club by accident. {A} and {B} turn a Thursday afternoon into a ritual, and a ritual into an actual friendship."], ["cautious", "You keep to your own corner for the first term. {A} and {B} notice each other's routines long before either says hello."]),
      B("lead", ["steady", "{lead} takes on the class-representative job with a quiet sense of duty, and the whole school gets a slightly more organised year."], ["nervy", "{lead} panics about the festival, the budget and the weather, and runs the best festival in the school's history."]),
      B("other", ["warm", "{other} remembers the one person who needs a friend this week, and arrives with exactly the right snack."], ["funny", "{other} makes every part-time shift an adventure, and the whole café starts to look forward to Mondays."]),
      B("gap", ["close", "You finish the school year with the same group chat, the same bench and a strong sense that nobody is going anywhere."], ["far", "One of you is the quiet planner and one is the loud organiser, and the class spends a year learning how the two fit."])
    ]),
    W("persona-palaces", "The Palaces reward the heist: a plan, a cover story and the courage to confront a very large, very distorted idea of somebody's conscience.", [
      ["plan", "{w} lays out the route, the guard rotations and the very specific exit in a diagram nobody asked for and everyone is grateful for."],
      ["scout", "{w} slips ahead through the vents, finds the treasure and comes back with a small, perfect map of everything dangerous."],
      ["entrance", "{w} makes the dramatic entrance, to music, with a flourish, and is slightly disappointed that the guard does not applaud."],
      ["caught", "{w}. A very polite alarm, a sudden spotlight and a very large, very confused guard.", "Who gets spotted first?"],
      ["manip", "{w}, who nods through the whole speech and finds, three minutes later, that they have agreed to something."]
    ], [
      B("pair", ["planner", "You map the Palace over three evenings. {A} and {B} have a route, a cover story and a very long list of ways it could go wrong."], ["bold", "You walk into the Palace on a hunch. {A} and {B} improvise the first hour, the second hour and, somewhat alarmingly, the whole heist."]),
      B("lead", ["driven", "{lead} gives the signal, steps through the door and says the line. Behind them, the team arrives exactly on cue."], ["steady", "{lead} waits, in the shadows, for the guard to turn. They do. Nobody remembers how long it took, only how very quiet it was."]),
      B("other", ["analytic", "{other} reads the layout, notices the guard's gap and quietly rewrites the plan from the inside."], ["warm", "{other} checks that everyone is breathing, everyone is ready and everyone is, at least slightly, having fun."]),
      B("gap", ["close", "You steal the treasure in a single, tidy sequence and are back at the hideout before the alarm has finished ringing."], ["far", "You steal it on two different plans at once, and it works, which none of you will ever be able to explain."])
    ])
  ]);
})(Forge);
