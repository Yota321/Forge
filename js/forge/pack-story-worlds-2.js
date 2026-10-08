/* =========================================================================
   WORLD SCRIPTS, part 2 (data only). More "If the two of you entered ..." scripts, plus two worlds that did not exist yet
   (Camp Half-Blood, Thedas) so every franchise people expect to find is there. Same format as pack-story-worlds.js.
   New worlds follow the pack-worlds.js entry shape (needs = matching logic, attrs = nine feel levels 1 to 5).
   ========================================================================= */
(function(F){
  "use strict";
  if (!F.packs) return;
  const A = F.packs.add;
  const W = (id, intro, qs, beats) => ({ id, intro, qs, beats });
  const B = (about, ...o) => ({ about, o });

  A("universes", [
    { id: "camp-half-blood", name: "Camp Half-Blood", franchise: "Percy Jackson", scope: "world", attrs: [3, 4, 3, 4, 3, 4, 4, 4, 3],
      needs: { humor: 0.7, boldness: 0.8, trust: 0.7, optimism: 0.6, flex: 0.7, persist: 0.6 },
      blurb: "A summer camp for the children of mythology, where every cabin has a rivalry and every quest has a loophole.",
      why: "It rewards {loves}. {leader} would lead the quest and {comic} would narrate it." },
    { id: "thedas", name: "Thedas (Dragon Age)", franchise: "Dragon Age", scope: "world", attrs: [4, 4, 4, 3, 3, 4, 4, 4, 4],
      needs: { initiative: 0.7, trust: 0.8, warmth: 0.6, analysis: 0.6, persist: 0.7, humor: 0.4 },
      blurb: "A world of mages, templars and a very large party of very different people who somehow have to agree.",
      why: "It rewards {loves}. {leader} would hold the party together and {heart} would host the campfire conversations." }
  ]);

  A("worldScripts", [
    W("camp-half-blood", "Camp Half-Blood rewards loyalty, a quick joke and the ability to improvise a plan in the middle of a sword fight.", [
      ["leader", "{w}, mostly because someone has to, and nobody else raised their hand fast enough.", "Who leads the quest?"],
      ["clown", "{w}, whose running commentary through a monster attack is the reason the group stays brave."],
      ["rulebreak", "{w}. The camp rulebook is, they argue, more of a list of suggestions."],
      ["scared", "{w}, quietly, about the prophecy. They are still the first to step through the door."],
      ["bond", "{w}. By the end of the week, three cabins have adopted them, and one has asked for their autograph."]
    ], [
      B("pair", ["funny", "You arrive at camp with luggage, a sarcastic remark and no idea what a hippocampus is. {A} and {B} make friends in the first ten minutes, mostly through bad jokes."], ["serious", "You arrive at camp and immediately ask where the exits are. {A} and {B} are the first ones to read the rules, which turns out to be useful."]),
      B("lead", ["bold", "{lead} accepts the quest in the middle of dinner, with no plan and absolute confidence. The prophecy, to be fair, did say something like that."], ["planner", "{lead} turns the vague prophecy into a three-stage plan with a fallback. The gods are visibly impressed and slightly annoyed."]),
      B("other", ["warm", "{other} talks the frightened new campers through the first night and ends up with an extra cabin of friends."], ["inventive", "{other} makes something out of a bent spoon and a roll of tape that distracts the monster just long enough."]),
      B("gap", ["close", "You finish the quest with a bond that looks like something the oracle would put in a verse, and nobody has the heart to tell you."], ["far", "You finish the quest with a very different idea of what happened, and two entirely different campfire stories. Both are mostly true."])
    ]),

    W("thedas", "Thedas rewards loyalty, difficult conversations at the campfire and the ability to keep a very mismatched party from tearing itself apart.", [
      ["leader", "{w}, by calmly doing the thing nobody else wants to and being believed when they explain why.", "Who holds the party together?"],
      ["diplomat", "{w} turns a hostile noble's tantrum into a favour. It looked like magic. It was just manners."],
      ["moral", "{w} spends the night worrying about the choice they made and still makes the next one."],
      ["comfort", "{w}, and the camp is a good deal warmer for it."],
      ["schemer", "{w}, with a smile, a ledger and a very patient look."]
    ], [
      B("pair", ["trusting", "You walk into the tavern trusting the first stranger who offers a hot meal. {A} and {B} end up with a party before the soup arrives."], ["guarded", "You walk into the tavern and read the room before sitting down. {A} and {B} choose their allies slowly, and keep them."]),
      B("lead", ["steady", "{lead} walks into the argument between two feuding factions and calms it with three quiet sentences. The room slowly remembers how to breathe."], ["driven", "{lead} refuses to leave the fortress until every refugee is through, and stays at the gate long after everyone else has gone."]),
      B("other", ["warm", "{other} sits with the grieving at camp and listens until the dawn, which keeps the whole party from falling apart."], ["funny", "{other} cracks a joke at the funeral that makes everyone laugh and cry in the same breath, which was exactly right."]),
      B("gap", ["close", "You finish the campaign with a party that feels like a family, and two people at the centre who barely had to explain themselves."], ["far", "You finish the campaign with a party that disagrees about almost everything, and two people at the centre who held it together by disagreeing very well."])
    ]),

    W("wasteland", "A wasteland rewards resourcefulness, a good sense of humour about radiation and the patience to dig for the useful thing in the rubble.", [
      ["survive", "{w} keeps every can of food, every bullet and every scrap of rope, and knows exactly where each one is."],
      ["fix", "{w} can turn a broken radio into a working one, and a working one into an excellent door stop."],
      ["scout", "{w} has already gone to look at the vault door and returned with news, a souvenir and a mild rash."],
      ["diplomat", "{w} talks a heavily armed stranger into sharing a meal. Nobody can say how."],
      ["tempted", "{w}. A glowing door, a mysterious switch, and the question of what it does."]
    ], [
      B("pair", ["improviser", "You climb out of the shelter blinking at the sun with no map and a lot of curiosity. {A} and {B} make a base out of a ruined gas station and a very large sign."], ["planner", "You climb out with a rationing plan and a rota for watches. {A} and {B} turn the wasteland into the most organised settlement for miles."]),
      B("lead", ["bold", "{lead} walks straight up to the raider camp with a smile and a deal. It works. It really shouldn't."], ["cautious", "{lead} circles the ruined town twice, notes every exit and chooses the quieter way in. It saves everyone more than once."]),
      B("other", ["inventive", "{other} bolts a few salvaged parts together into something that purifies water and plays music. Both uses prove essential."], ["warm", "{other} shares the last of the food with a stranger, and that stranger turns out to be the most useful ally in the region."]),
      B("gap", ["close", "You build a settlement that runs on shared habits and unspoken trust, and visitors assume you've lived there for years."], ["far", "You build a settlement where each of you runs a different half and the arguments become the town's best entertainment."])
    ]),

    W("pokemon", "The Pokémon world rewards patience, curiosity and a deep, slightly irrational belief in the creature next to you.", [
      ["trainer", "{w} is up at dawn, working through drills with endless cheer and a very sceptical partner.", "Who trains hardest?"],
      ["caretaker", "{w} notices when their partner is tired before anyone else does, and quietly adjusts the whole plan."],
      ["lost", "{w}, with total confidence, in a forest that has no paths."],
      ["bond", "{w}. Wild creatures wander over to them within minutes of making camp."],
      ["dream", "{w}, who has a list of every region to explore and a plan for how to do it all by next spring."]
    ], [
      B("pair", ["curious", "You leave the starting town with a bag, a very small team and a lot of questions. {A} and {B} stop at every strange patch of grass."], ["planner", "You leave the starting town with a route, a notebook and a type chart. {A} and {B} turn the whole adventure into a well-run expedition."]),
      B("lead", ["driven", "{lead} refuses to give up on a rematch with the gym leader and walks back in until the lesson finally lands."], ["warm", "{lead} spends the whole battle looking after their partner's morale rather than the score, and wins by being kind."]),
      B("other", ["analytic", "{other} reads the opponent's pattern in two rounds and quietly changes the strategy. The score flips."], ["funny", "{other} names their team in a way that makes the whole region laugh, and somehow earns more respect than any badge."]),
      B("gap", ["close", "You finish the journey with a team that moves like one creature, and a bond that makes the other trainers go quiet."], ["far", "You finish the journey with two very different teams, and a long, cheerful argument over whose approach was better."])
    ]),

    W("westeros", "Westeros rewards long memories, careful alliances and the instinct to ask who benefits.", [
      ["schemer", "{w}, long before anyone else has noticed there is a game.", "Who plays the game of thrones?"],
      ["skeptic", "{w} is the only one who checks the wine, the invitation and the messenger's sleeves."],
      ["calm", "{w}, and the whole court takes it as a sign of strength."],
      ["tempted", "{w}. The crown looks lighter than it is."],
      ["loot", "{w}, and the treaty has a tiny clause that says so."]
    ], [
      B("pair", ["guarded", "You arrive at court and trust nobody, which, in this place, makes you the only honest people in the room. {A} and {B} start the first week with a list of who owes whom."], ["trusting", "You arrive at court believing in people, which is either very naive or very brave. {A} and {B} make allies in the places others burn bridges."]),
      B("lead", ["planner", "{lead} lays out a plan three seasons deep and delivers it to the council in a single quiet sentence. The room goes cold, and then it goes along."], ["bold", "{lead} walks into the throne room with an accusation and an excellent speech. The court has not seen anyone do that in years."]),
      B("other", ["analytic", "{other} reads the ledger, the rumours and the guest list and calmly points to the one person who is lying. It is always the person you expect, and nobody else noticed."], ["warm", "{other} keeps the common folk fed through the winter, and becomes more powerful than any title in the process."]),
      B("gap", ["close", "You end the long winter as the two people who never betrayed each other, which is almost unheard of here."], ["far", "You end the long winter on opposite sides of a quiet agreement, and trust each other more than anyone else in the realm."])
    ]),

    W("baker-street", "Baker Street rewards observation, an unreasonable amount of curiosity and the ability to say the obvious thing nobody noticed.", [
      ["puzzle", "{w} notices the mud on the boot, the fresh ink on the cuff and the dog that did not bark, and then explains it a little too enthusiastically.", "Who solves the case?"],
      ["scout", "{w} has already walked the street, spoken to the paperboy and returned with the name of the suspect."],
      ["skeptic", "{w} is not convinced, and they are going to ask three more questions."],
      ["calm", "{w}, who sits in the armchair as the fog thickens, utterly unbothered."],
      ["lost", "{w}, in a London that is, to be fair, designed for it."]
    ], [
      B("pair", ["analytic", "A case arrives with a pale visitor and a vague story. {A} and {B} already have three questions before the kettle has boiled."], ["curious", "A case arrives with a pale visitor and a very odd detail. {A} and {B} are out of the door before anyone has finished the story."]),
      B("lead", ["steady", "{lead} sits quietly through the entire confession and then names the guilty party with three sentences of ordinary logic."], ["bold", "{lead} walks into the suspect's house uninvited, with an excellent excuse and a firm belief that the door was open."]),
      B("other", ["warm", "{other} puts the nervous witness at ease, and the missing detail comes out by itself over tea."], ["inventive", "{other} makes the trap out of a teapot, a bit of string and the entire contents of a pocket. It works perfectly."]),
      B("gap", ["close", "You solve the case in step, like a conversation that never needed finishing out loud, and the detective is almost irritated."], ["far", "You solve the case by two very different methods that arrive at the same name. The police inspector sighs."])
    ]),

    W("starship", "A starship rewards composure, curiosity and the willingness to follow the regulations right up to the point where they stop being useful.", [
      ["duty", "{w}, who has read the manual and then helpfully explained which parts of it apply.", "Who follows the regulations?"],
      ["calm", "{w}, which is the whole reason the bridge crew keeps looking at them."],
      ["engineer", "{w} promises the engines will hold for ten more minutes, which is exactly nine minutes more than the engines had planned for."],
      ["diplomat", "{w} finds the one phrase in the alien language that ends a standoff."],
      ["scout", "{w} volunteers for the away team before the question has been finished."]
    ], [
      B("pair", ["analytic", "The ship leaves orbit with a thorough briefing and a very curious crew. {A} and {B} already have a working hypothesis for the anomaly."], ["curious", "The ship leaves orbit with a mystery on the scanners. {A} and {B} are at the viewscreen before the captain has finished speaking."]),
      B("lead", ["steady", "{lead} takes the conn in the middle of the crisis, speaks in the same level voice and the whole ship follows."], ["bold", "{lead} orders the ship straight at the unknown signal, which is either brilliant or a clerical error. It turns out to be brilliant."]),
      B("other", ["inventive", "{other} repairs the shield array with a technique that is not in any manual, and which the manual now includes."], ["warm", "{other} sits with the frightened alien delegate, and the first contact goes beautifully."]),
      B("gap", ["close", "You return from the mission with a log entry written in exactly the same rhythm by both of you, and the captain notices."], ["far", "You return from the mission with two separate reports that contradict each other and, together, describe it perfectly."])
    ]),

    W("gotham", "Gotham rewards patience, preparation and a stubborn refusal to let the city win.", [
      ["plan", "{w} has a plan, a backup, a gadget for both and an expression that says 'I did warn you'.", "Who plans every move?"],
      ["moral", "{w} has made a rule, broken it once and has not forgiven themselves since."],
      ["caught", "{w}. Not because they were careless. Because the villain planned for exactly them."],
      ["scared", "{w}, quietly. The alley is darker than it looks in the daylight."],
      ["calm", "{w}, hanging from a gargoyle in the rain and fully at ease."]
    ], [
      B("pair", ["serious", "You start the first night in the rain, on a rooftop, looking at a city that does not want to be saved. {A} and {B} decide to try anyway."], ["hopeful", "You start the first night with the strange sense that the city might actually be fine. {A} and {B} are the only two people who believe it, and the belief spreads."]),
      B("lead", ["planner", "{lead} has already mapped every guard rotation, every hidden exit and every weakness in the villain's plan. They've also planned for the plan being wrong."], ["bold", "{lead} drops from the rooftop into the middle of the warehouse without a plan, and somehow lands exactly where they needed to be."]),
      B("other", ["analytic", "{other} cracks the cipher left at the crime scene and understands, before anyone else, who it was meant for."], ["warm", "{other} sits with the family at the edge of the crime tape and makes the whole thing feel survivable."]),
      B("gap", ["close", "You finish the night on the same rooftop, in silence, with the strange comfort of two people who understand each other's reasons."], ["far", "You finish the night on two different rooftops, shouting the plan to each other across the street."])
    ]),

    W("doctor-who", "All of time and space rewards curiosity, kindness and the instinct to run towards the strange noise.", [
      ["scout", "{w} has already wandered through the door that definitely says 'do not open', with a friendly wave.", "Who opens the door that says do not open?"],
      ["puzzle", "{w} solves the alien riddle in four minutes, then apologises to the alien for it."],
      ["clown", "{w} has made a joke in front of the most powerful being in the galaxy, and it landed."],
      ["lost", "{w}. The ship promised a quiet century. It was not."],
      ["hero", "{w}, by talking when everybody expected a weapon."]
    ], [
      B("pair", ["curious", "A strange blue box lands in the middle of an ordinary afternoon. {A} and {B} are inside it before anyone has finished saying 'what is that?'"], ["cautious", "A strange blue box lands in the middle of an ordinary afternoon. {A} and {B} circle it twice, read the sign and then, cautiously, step inside."]),
      B("lead", ["bold", "{lead} walks out into a world with three suns and says hello to the first creature they meet. It goes better than expected."], ["analytic", "{lead} reads the strange symbols on the wall and quietly works out the pattern before anyone asks."]),
      B("other", ["warm", "{other} stays with the frightened child in the middle of the alien invasion and tells a story until it stops being scary."], ["funny", "{other} makes the tyrant laugh at the exact moment it matters. The whole invasion loses a little momentum."]),
      B("gap", ["close", "You return home with the sense that you could have been travelling together for years, and a very good reason to go back."], ["far", "You return home with two entirely different memories of the same adventure, and the box is probably right about both of them."])
    ]),

    W("office", "The Scranton branch rewards small talk, deeply committed office rituals and the ability to take a ridiculous situation seriously.", [
      ["prefect", "{w}, by a long way. They've already filed the form that nobody else knew existed.", "Who runs the office?"],
      ["clown", "{w}, who has a bit prepared for every meeting, and for the ones that aren't scheduled yet."],
      ["rumor", "{w}. They knew about the reorganisation before the manager did."],
      ["secret", "{w}, who has been saying 'I can't talk about it' for six weeks and has not.", "Who keeps the surprise party secret?"],
      ["grind", "{w}. There is a spreadsheet, and the spreadsheet is accurate."]
    ], [
      B("pair", ["funny", "You start on Monday and are pulling pranks by Wednesday. {A} and {B} are, by Friday, the reason people stay late."], ["planner", "You start on Monday and by Wednesday you've reorganised the supply cupboard. {A} and {B} are, by Friday, the reason the paperwork gets done."]),
      B("lead", ["bold", "{lead} gives a speech in the conference room that no one asked for and no one forgets."], ["steady", "{lead} handles the angry client call with a level voice and a plate of biscuits, and the account is saved."]),
      B("other", ["warm", "{other} remembers every birthday, every allergy and every cat's name, and the office runs on it."], ["analytic", "{other} finds the error in the quarterly report three minutes before the meeting, and says nothing except 'I fixed it'."]),
      B("gap", ["close", "You end the quarter as the pair everyone assumes has been friends for a decade. Reception has a bet on it."], ["far", "You end the quarter as the pair who disagree about everything, and quietly agree on the things that matter."])
    ]),

    W("island", "A deserted island rewards cooperation, a decent sense of humour and the willingness to build a raft out of whatever the tide brings in.", [
      ["survive", "{w} builds the shelter, finds the water and keeps a quiet count of the days.", "Who survives the longest?"],
      ["fix", "{w} turns driftwood, rope and one stubborn coconut into something close to a boat."],
      ["clown", "{w}, who has named the crab and appointed it mayor."],
      ["loner", "{w}, who has gone to the other side of the island to 'think' and has found a very good view."],
      ["leader", "{w}. The island does not have an official leader, but it does now."]
    ], [
      B("pair", ["relaxed", "You wash up on the beach and your first reaction is a long look at the sunset. {A} and {B} spend the first day on the island being, honestly, quite happy."], ["planner", "You wash up on the beach and begin a list. {A} and {B} have a water plan, a fire plan and a rota before the tide has gone out."]),
      B("lead", ["driven", "{lead} gets up at dawn every single day to climb the hill and look for a ship. The ship does not come, and they keep doing it, and it keeps everyone's spirits up."], ["inventive", "{lead} builds a signal fire, a fishing trap and a little boat that is only mostly sea-worthy."]),
      B("other", ["warm", "{other} turns the island into a home, with a shared meal every evening and a routine that makes the days feel like days."], ["funny", "{other} keeps a diary full of jokes about the island that turns out to be the best morale boost possible."]),
      B("gap", ["close", "You are rescued with a tan, a story and the sense that you could have stayed. You probably will visit."], ["far", "You are rescued having argued every day about the raft, the fire and the crab. You agree that it was the best year of your life."])
    ]),

    W("paradis", "Paradis rewards discipline, trust under pressure and the willingness to make hard choices in the dark.", [
      ["duty", "{w}, whose preparation is quietly the reason anyone survives the first night.", "Who takes the mission most seriously?"],
      ["sacrifice", "{w} holds the gate. They say it's tactical. It's the other thing."],
      ["plan", "{w} sketches the operation on a scrap of paper in four minutes, and the plan holds."],
      ["moral", "{w} carries the cost of every order, and still gives the next one."],
      ["calm", "{w}, who keeps the formation steady while everything behind them collapses."]
    ], [
      B("pair", ["serious", "You take your places on the wall in silence. {A} and {B} understand, before anyone says it, how much depends on tonight."], ["hopeful", "You take your places on the wall with a strange stubborn hope. {A} and {B} are the two who still believe in the morning."]),
      B("lead", ["planner", "{lead} turns a terrifying situation into a clear sequence of tasks and gives each person exactly one. The panic drains out of the room."], ["bold", "{lead} goes first through the gate, and the squad follows, because someone has to, and they have decided that someone is brave."]),
      B("other", ["steady", "{other} holds the line with a steady voice, and the whole formation remembers how to breathe."], ["warm", "{other} stays with the wounded and keeps talking, and nobody is alone when it matters."]),
      B("gap", ["close", "You come back through the gates with the quiet, exhausted understanding of two people who didn't need to explain."], ["far", "You come back through the gates having argued the entire operation, and having been right in different ways."])
    ])
  ]);
})(typeof Forge !== "undefined" ? Forge : (globalThis.Forge = globalThis.Forge || {}));
if (typeof module !== "undefined" && module.exports) module.exports = Forge;
