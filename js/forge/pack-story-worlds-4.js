/* =========================================================================
   WORLD SCRIPTS 4 (data only): scripts for thirteen more of the new worlds. Same shape as pack-story-worlds-3.js. Original wording written for Forge.
   ========================================================================= */
(function(F){
  "use strict";
  if (!F.packs) return;
  const W = (id, intro, qs, beats) => ({ id, intro, qs, beats });
  const B = (about, ...o) => ({ about, o });

  F.packs.add("worldScripts", [
    W("arrakis", "Arrakis rewards the patient: a water discipline, a long view and the sense to watch the sand before you walk on it.", [
      ["persist", "{w}, who has been walking since before the second sun and has not complained, partly out of pride and partly out of respect for the water."],
      ["schemer", "{w} has already worked out which house wants the spice, which wants the water and which wants both, and is waiting."],
      ["calm", "{w} hears the sandworm before anyone else, and quietly, entirely calmly, suggests everybody sit very still."],
      ["scout", "{w} goes out at dusk, reads the dunes and returns with a map in the sand and a very exact opinion."],
      ["sacrifice", "{w} gives up their share of the water so {o} can reach the next sietch, and says it is a matter of arithmetic."]
    ], [
      B("pair", ["cautious", "You cross the first desert in short, careful stages. {A} and {B} learn to walk without rhythm, to drink without fuss and to speak mostly in gestures."], ["bold", "You cross the open desert at night, because the day is worse. {A} and {B} are very fast and very thirsty, and mostly right."]),
      B("lead", ["steady", "{lead} sets the pace, tallies the water and refuses to be hurried. The others find, somehow, that the walk is bearable."], ["driven", "{lead} announces the route, the hour and the plan. It is a very good plan, and a very demanding one."]),
      B("other", ["analytic", "{other} watches the dunes and the sky and notices the signs that the storm will arrive an hour earlier than anyone thought."], ["warm", "{other} shares the last of the dates with the shivering guide and, to everyone's surprise, earns a name."]),
      B("gap", ["close", "You reach the sietch together, dry-lipped and quiet, and are welcomed with a ceremony and a very small cup of water."], ["far", "You reach it by different routes, and each tells the council a different, equally persuasive version of what the desert wants."])
    ]),
    W("roshar", "Roshar rewards the oath: a storm on the horizon, a promise in the mouth and the stubbornness to keep both.", [
      ["protect", "{w} steps into the high wind without a word, because someone should, and then spends the evening complaining about the weather."],
      ["persist", "{w}, who has carried the same bridge, the same grief and the same promise for far longer than is reasonable."],
      ["moral", "{w} stops mid-march, looks at the cost and says quietly that a victory is only worth it if everybody gets home."],
      ["duty", "{w} polishes the armour, rewrites the roster and reads the oath again, in case there is a clause."],
      ["comfort", "{w} sits with the bridgeman who has stopped talking, and says nothing, which turns out to be exactly right."]
    ], [
      B("pair", ["steady", "You set out together under the first storm. {A} and {B} learn to walk to each other's rhythm, and then to carry the same load."], ["bold", "You walk straight into the high winds. {A} and {B} are very brave, a little wet and, by evening, quite good at it."]),
      B("lead", ["driven", "{lead} stands up, says the oath out loud and, to the great surprise of all, the storm seems to lean in and listen."], ["nervy", "{lead} says the first words of the oath, forgets the rest and finishes it in the wrong order. It works anyway."]),
      B("other", ["warm", "{other} tends the wounded, remembers every name and writes, at night, a short note for each one."], ["analytic", "{other} sketches the strange shapes on the plateau and works out which are tracks and which are, alarmingly, writing."]),
      B("gap", ["close", "You finish the long march on the same hill, in the same wind, with the same promise, entirely unspoken."], ["far", "You each keep a different oath, and the storms, in their own time, test them both."])
    ]),
    W("scadrial", "Scadrial rewards the crew: a very good plan, a very good heist and a very large number of people who believe in both.", [
      ["plan", "{w} lays out the job on a table of cutlery and bread, and everyone leaves with a role and a slightly smug expression."],
      ["manip", "{w}, who has already agreed to something and is slowly realising it was part of the plan."],
      ["scout", "{w} spends the night on the rooftops, memorises the guard rota and returns with three unnecessary but helpful details."],
      ["schemer", "{w} has a plan inside the plan, a plan inside that one and a polite smile for all of them."],
      ["entrance", "{w} arrives at the noble party in a very good coat, at exactly the wrong time, and lands perfectly."]
    ], [
      B("pair", ["planner", "You spend a month on the job. {A} and {B} have a map, a cover and a very organised argument about the exit."], ["improviser", "You start with a rough plan and an excellent coat. {A} and {B} adjust at every door and are, by midnight, in the vault."]),
      B("lead", ["driven", "{lead} gives the signal, steps out onto the street and, with enormous confidence, redirects the whole city."], ["steady", "{lead} waits, in the shadows, for the guard to blink. They do. The vault door opens, quietly, as if it had been waiting."]),
      B("other", ["analytic", "{other} reads the ledger, finds the number that does not add up and turns it into the key to the whole operation."], ["warm", "{other} calms the youngest member of the crew, and the whole team, for the first time, sleeps."]),
      B("gap", ["close", "You pull off the job in a single, flawless evening, and it is only afterwards that you realise you never needed to talk."], ["far", "You each run your own half of the job, and it works, because the halves were, it turns out, designed to meet."])
    ]),
    W("randland", "Randland rewards the road: a wide world, a long story and a lot of people who would rather be at home but have been called anyway.", [
      ["leader", "{w} takes the front of the group without being asked, and is quietly appalled to discover it suits them."],
      ["persist", "{w}, who has walked for three weeks, slept in two ditches and is still, remarkably, polite."],
      ["diplomat", "{w} talks the innkeeper, the guard and the very suspicious prophet into giving the group a bed."],
      ["trusted", "{w}, who has never been wrong about a road, a person or the weather, and has been teased about it for years."],
      ["scared", "{w} is secretly terrified, and reciting the names of every town on the map as a kind of calming charm."]
    ], [
      B("pair", ["curious", "You leave the village for a short trip and return, a year later, with a sword, two secrets and a new idea of what a map looks like."], ["cautious", "You keep to the safe road, and discover, with some surprise, that the safe road is the strangest one in the country."]),
      B("lead", ["steady", "{lead} faces the first big decision of the journey with a calm that surprises even them. It is a good decision. It is also a very heavy one."], ["nervy", "{lead} makes the call, doubts it, remakes it and ends up, inexplicably, with the best of both."]),
      B("other", ["analytic", "{other} reads the old prophecy twice, finds the mistake in the translation and quietly rearranges the plan."], ["warm", "{other} sits at the fire and talks the whole company back to the world, one story at a time."]),
      B("gap", ["close", "You arrive at the great city together, travel-stained and quiet, with the same slightly stunned look."], ["far", "You arrive at the city by different roads, each convinced the other was the one who took the long way."])
    ]),
    W("ankh-morpork", "Ankh-Morpork rewards the sceptic: a large smelly city, a very clever ruler and a great deal of paperwork about the river.", [
      ["skeptic", "{w} says, flatly, that the plan is nonsense, the permit is forged and the whole thing smells of fish. They are correct on all counts."],
      ["clown", "{w} turns the guild meeting into a performance and the performance into a very good deal."],
      ["schemer", "{w} has already worked out which of the five guilds will blink first and has quietly arranged to be standing next to it."],
      ["fix", "{w} repairs the pump, the contract and the minor diplomatic incident, in that order, before lunch."],
      ["charmer", "{w}, who talks the watchman out of a fine and into a pie."]
    ], [
      B("pair", ["funny", "You arrive in the city with a plan and a pun. {A} and {B} spend a week in the guilds and leave with a business, a rival and a pie."], ["analytic", "You read the city like a ledger. {A} and {B} find the three loopholes that matter and, politely, use them."]),
      B("lead", ["steady", "{lead} takes the meeting with the patrician, says four sensible sentences and is, by the end, mildly alarmed to be agreed with."], ["bold", "{lead} walks straight into the guild hall and says what everyone is thinking. Nothing happens. Then everything does."]),
      B("other", ["analytic", "{other} reads the contract the whole room had signed and finds the footnote that changes who owns the bridge."], ["funny", "{other} narrates the chaos so well that the watch, the guild and the dragon all agree to call it a draw."]),
      B("gap", ["close", "You leave the city with a legitimate business, a few dubious friends and a strong sense of having won, narrowly, a very silly argument."], ["far", "You each work a different angle on the same scheme, and meet at the end, equally pleased with completely different outcomes."])
    ]),
    W("earthsea", "Earthsea rewards the quiet: a small boat, a true name and the sense to know when not to use it.", [
      ["calm", "{w} watches the sea, the sky and the enormous wave, and decides, with great care, to do nothing at all."],
      ["mentor", "{w} ends up teaching {o} the first line of a very old spell, and, in doing so, learns it again."],
      ["puzzle", "{w} turns the strange word over for an hour and then, quite softly, says it correctly."],
      ["scout", "{w} sails ahead to the next island, finds the harbour and returns with a very good story and the right sort of fish."],
      ["tempted", "{w}, who has just been offered a shortcut that is clearly a bad idea and is, not at all, considering it."]
    ], [
      B("pair", ["curious", "You sail from island to island with a small book and a smaller boat. {A} and {B} learn four true names and keep three of them."], ["cautious", "You stay on the first island all winter, learning to say one word properly. {A} and {B} think it a very good use of a season."]),
      B("lead", ["steady", "{lead} sits at the prow and watches the wind, and a very long, quiet voyage unfolds under their hands."], ["nervy", "{lead} says the word wrong, ducks and finds, to everyone's relief, that the sea is forgiving."]),
      B("other", ["analytic", "{other} reads the old charts and realises that the island everyone is avoiding is the only one with fresh water."], ["warm", "{other} shares the last of the bread with the stranger on the beach, and gets a useful, very odd gift."]),
      B("gap", ["close", "You land on the last island together, tired and satisfied, and spend an evening saying almost nothing at all."], ["far", "You sail on separate boats for a season and meet at the far island, each with a different word and an equally good story."])
    ]),
    W("monster-hunter", "The New World rewards the prepared: a well-stocked pack, a very good meal and a respectful distance from anything with that many teeth.", [
      ["plan", "{w} maps the creature's habits, the weather and the best spot for the trap, and then packs the right sandwiches."],
      ["survive", "{w} outlasts the long hunt by pacing, eating well and refusing to chase the thing into the open."],
      ["engineer", "{w} builds a trap from three bits of rope and a very clever idea about balance."],
      ["trainer", "{w}, who has been up since dawn sharpening, stretching and cheerfully reciting the plan."],
      ["caretaker", "{w} makes the best camp meal in the history of the guild, and makes the hunters, quietly, braver."]
    ], [
      B("pair", ["planner", "You study the creature for three days. {A} and {B} have a trap, a route and a very detailed menu."], ["bold", "You walk in with the sharpest weapon and the best breakfast. {A} and {B} are brave, quick and a little bit lucky."]),
      B("lead", ["steady", "{lead} faces the great beast without moving a muscle. Three quiet signals later, the whole team is in position."], ["driven", "{lead} gives the order and charges. The team follows, and the fight is over in a rather impressive minute."]),
      B("other", ["analytic", "{other} notices the creature's limp, the weather and the shifting wind, and the whole plan changes for the better."], ["warm", "{other} cooks the post-hunt feast and listens to every hunter's story, and the guild, as a result, is slightly less lonely."]),
      B("gap", ["close", "You finish the hunt in the same breath, share a meal at dusk and trade the story of it, back and forth, for the whole evening."], ["far", "You each hunt a different way and the beast, surprised, has nowhere to go."])
    ]),
    W("warhammer", "The Imperium rewards faith, discipline and a calm, bureaucratic acceptance of how very large and very hopeless it is.", [
      ["duty", "{w} files the paperwork, lights the candle and recites the litany, in that order, with great sincerity."],
      ["persist", "{w}, who has been fighting for ten thousand hours and plans, politely, to fight for ten thousand more."],
      ["sacrifice", "{w} steps up to the breach with a calm that has less to do with bravery than with arithmetic."],
      ["leader", "{w} gives the order in a voice like a closing door, and the whole company turns."],
      ["skeptic", "{w} asks, very quietly, whether any of this is working, and is promptly reminded that the question is the most dangerous weapon in the room."]
    ], [
      B("pair", ["steady", "You hold the first line together. {A} and {B} are not eloquent, but the line, remarkably, holds."], ["bold", "You charge the enemy with a battle-cry and a very large gun. {A} and {B} are loud, fearless and, briefly, a legend."]),
      B("lead", ["driven", "{lead} gives the command in a single, level word. The company moves like one very large, very grim animal."], ["cautious", "{lead} walks the line twice, checks every prayer and every post, and gives the order only when every candle is lit."]),
      B("other", ["analytic", "{other} calculates the odds, the supply lines and the horrifying number of paperwork steps, and wins the war with a form."], ["warm", "{other} shares the last ration with the wounded trooper and, in doing so, quietly changes how the whole squad sees the war."]),
      B("gap", ["close", "You finish the long campaign on the same ridge, with the same weary look and the same strange, quiet pride."], ["far", "One of you believes in the Emperor and one of you believes in the paperwork, and the campaign, to everyone's surprise, needs both."])
    ]),
    W("destiny", "The Last City rewards the fireteam: a loadout, a ghost and the unreasonable confidence of people who have died before and expect to again.", [
      ["leader", "{w} calls the fireteam, picks the objective and starts the countdown without bothering to ask if anyone is ready."],
      ["daredevil", "{w} jumps off the highest ledge in the sector because it looked like fun, and, by some miracle, lands on the boss."],
      ["clown", "{w} narrates the raid in a running commentary that keeps everyone, strangely, calm."],
      ["trusted", "{w}, whose revive is the one everyone hopes will come first."],
      ["persist", "{w}, who has been farming the same boss for six hours, and is, naturally, still in a good mood."]
    ], [
      B("pair", ["bold", "You drop into the strike with a plan and a prayer. {A} and {B} are loud, quick and, to everyone's surprise, coordinated."], ["planner", "You read the guide, plan the loadout and assign the roles. {A} and {B} clear the dungeon on the first try, to a quiet, smug silence."]),
      B("lead", ["driven", "{lead} calls the first push, the second push and the final push, and the boss, a little bewildered, is gone."], ["steady", "{lead} waits for the right moment, then calls it with such calm that the whole team moves as one."]),
      B("other", ["funny", "{other} makes a joke at the exact moment the team needs one, and the final boss is, somehow, easier."], ["analytic", "{other} reads the boss's pattern, shares it in the chat and gets the team through the enrage in a single try."]),
      B("gap", ["close", "You finish the raid at the same moment, exhausted and delighted, and agree to do it again, immediately."], ["far", "You each bring a different build to the same fight, and, to your own surprise, the two work beautifully."])
    ]),
    W("halo", "The Halo Rings reward discipline: a chain of command, a very good helmet and a very large amount of calm under a very large amount of fire.", [
      ["leader", "{w} gives a short, clear order, takes the point and trusts the squad to catch up, which they do."],
      ["calm", "{w} watches the drop pods fall, the sky burn and the enemy arrive, and asks for a status report."],
      ["survive", "{w} gets through the first wave by luck, skill and a very large amount of cover."],
      ["sacrifice", "{w} stays at the bridge, holds the line and, quietly, covers the extraction."],
      ["trusted", "{w}, whose voice on the radio is the one everyone in the company wants to hear."]
    ], [
      B("pair", ["steady", "You deploy as a pair. {A} and {B} cover each other's angles, call the targets and finish the mission in a very satisfying silence."], ["bold", "You hit the ground running and do not stop. {A} and {B} are loud, fast and, impressively, quite on time."]),
      B("lead", ["driven", "{lead} gives the order, the squad moves, and subtlety is left behind. It is, however, extremely effective."], ["cautious", "{lead} holds the line, waits for the second wave and calls the push at exactly the right second."]),
      B("other", ["analytic", "{other} reads the map, the radar and the enemy's patterns and finds the gap that nobody else could see."], ["warm", "{other} checks on the squad over the comms, tends to the wounded and keeps morale a notch higher than it has any right to be."]),
      B("gap", ["close", "You finish the mission at the same extraction point, dusty and quietly proud, with one eyebrow raised at the sky."], ["far", "You each complete a different half of the mission and meet, unexpectedly, in the middle."])
    ]),
    W("deep-space-station", "A Border Station rewards the diplomat: a very busy corridor, a table with too many sides and a rule that nobody will say the quiet part out loud.", [
      ["diplomat", "{w} finds the one thing both delegations want and puts it, delicately, on the table."],
      ["puzzle", "{w} notices the clause in the treaty that would have given one party the whole station, and quietly strikes it."],
      ["caretaker", "{w} makes sure the visiting delegation gets a very good meal and a very quiet room."],
      ["skeptic", "{w} asks the one awkward question that makes the whole room sit up and read the report again."],
      ["rumor", "{w} hears everything in the corridors and tells only the helpful half."]
    ], [
      B("pair", ["analytic", "You sit down at the table with a stack of notes. {A} and {B} learn the quirks of both delegations and are, by midnight, quite useful."], ["warm", "You open the talks with a shared meal. {A} and {B} turn a stiff first evening into a surprisingly friendly one."]),
      B("lead", ["steady", "{lead} presides over the negotiation with a patience that makes both sides, quite quickly, slightly embarrassed."], ["driven", "{lead} cuts the debate short with a proposal. It is bold, it is fair and it is accepted, narrowly."]),
      B("other", ["analytic", "{other} reads the fine print and finds the one clause that makes the whole deal work."], ["warm", "{other} talks the two angriest delegates into a shared coffee, and the whole station breathes out."]),
      B("gap", ["close", "You sign the treaty together at the end of a very long day, and share, in silence, a very small celebration."], ["far", "You each work a different side of the table, and the treaty, when it is signed, has a fine balance neither of you saw."])
    ]),
    W("clone-wars", "The Clone Wars reward the general: a hard campaign, a loyal squad and a quick decision about when to break a rule.", [
      ["leader", "{w} gives the order, takes the point and leads the charge, with a grin that is only slightly reckless."],
      ["sacrifice", "{w} holds the walkway so the troopers can reach the ship, and says, quietly, that they will be right behind them."],
      ["trusted", "{w}, who the squad would follow into the very worst, and quite possibly will."],
      ["pilot", "{w} flies through the canyon, the blockade and an entirely unplanned dogfight, humming."],
      ["daredevil", "{w} jumps the gap, grabs the cable and lands, with a flourish, on the wrong side of the plan."]
    ], [
      B("pair", ["bold", "You arrive on the front line in a stolen ship. {A} and {B} are loud, cheerful and, remarkably, effective."], ["steady", "You hold the position for three days. {A} and {B} are quiet, loyal and just a little bit tired."]),
      B("lead", ["driven", "{lead} gives the order and the squad moves. It is bold, it is fast and it is, against all the odds, correct."], ["cautious", "{lead} walks the perimeter twice, checks every post and calls the advance only when every trooper has eaten."]),
      B("other", ["coop", "{other} runs the supply lines, the medical tent and the morale, and the campaign is quietly saved."], ["analytic", "{other} reads the enemy's patterns, finds the weak flank and quietly rewrites the battle plan."]),
      B("gap", ["close", "You win the campaign together and share a quiet moment on the ship's roof, looking at the stars."], ["far", "You fight the same war in very different ways, and the campaign, when it ends, has two different heroes."])
    ]),
    W("imperial-era", "The Imperial Era rewards the smuggler: a fast ship, a very good lie and a talent for being exactly where the blockade is not.", [
      ["scout", "{w} finds the gap in the blockade, flies through it and then, to be polite, waves."],
      ["charmer", "{w} talks the checkpoint officer out of an inspection and into a recommendation for a local restaurant."],
      ["daredevil", "{w}, who has just flown the ship through the tiniest possible gap, and is looking slightly more pleased than is wise."],
      ["manip", "{w} agrees to the deal, shakes hands and only later realises it was never the deal."],
      ["protect", "{w} steps in front of the stormtrooper, with a casual look of calm, and says it was an accident."]
    ], [
      B("pair", ["improviser", "You land on the first planet without a plan. {A} and {B} find a contact, a cargo and a very specific problem in under an hour."], ["cautious", "You study the blockade for three days. {A} and {B} find the gap, the schedule and a very good reason to wait."]),
      B("lead", ["bold", "{lead} flies the ship into the asteroid field and out of it, with a casual shrug. It was, strictly, not the plan."], ["steady", "{lead} waits for the right moment, then takes it. The blockade does not notice."]),
      B("other", ["funny", "{other} talks the guards into a sandwich and the sandwich into a security hole, and the door, to everyone's surprise, opens."], ["analytic", "{other} reroutes the ship's power, rewrites the transponder code and, quietly, lands the ship in the wrong place on purpose."]),
      B("gap", ["close", "You deliver the cargo together, split the credits down the middle and agree, without discussing it, to do it again."], ["far", "You each pull a different con on the same planet, and meet, to your mutual delight, at the exact same exit."])
    ])
  ]);
})(Forge);
