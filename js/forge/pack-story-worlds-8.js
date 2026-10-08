/* =========================================================================
   WORLD SCRIPTS 8 (data only): scripts for the last fourteen of the new worlds. Same shape as pack-story-worlds-3.js. Original wording written for Forge.
   ========================================================================= */
(function(F){
  "use strict";
  if (!F.packs) return;
  const W = (id, intro, qs, beats) => ({ id, intro, qs, beats });
  const B = (about, ...o) => ({ about, o });

  F.packs.add("worldScripts", [
    W("good-place", "The Neighborhood rewards the self-improver: a pastel suburb, a very large frozen yogurt and the slow, comic work of becoming a slightly better person.", [
      ["moral", "{w} stops mid-sentence, thinks about the ethics of the question and asks whether the muffin is, strictly, theirs."],
      ["clown", "{w} turns the town-hall meeting into a stand-up set, and the neighbours, to a person, give it a sincere three stars."],
      ["skeptic", "{w} says, flatly, that the whole town feels staged and the frozen yogurt is, frankly, suspicious."],
      ["comfort", "{w} sits with the neighbour who has lost the score on their door and, with a mild joke, helps them find it."],
      ["scared", "{w}, who is quietly panicking about the points system and is, with a deep breath, making a list."]
    ], [
      B("pair", ["funny", "You arrive in the neighbourhood with a suitcase and a very good lie. {A} and {B} spend the first week in a frozen-yogurt shop and the second week, quietly, being nicer."], ["analytic", "You read the rules of the afterlife twice. {A} and {B} find three loopholes and one very small, very genuine reason to stay."]),
      B("lead", ["bold", "{lead} makes a speech to the whole street, mostly improvised and mostly sincere, and the street, quite moved, claps."], ["nervy", "{lead} agonises over every choice for three hours, and, at last, picks the one that is quietly right."]),
      B("other", ["warm", "{other} brings a casserole to the grumpy neighbour, and the whole street, in a very small way, is improved."], ["analytic", "{other} lays out the moral philosophy of the situation in four tidy points and an elegant chart."]),
      B("gap", ["close", "You finish the day on the same porch with the same very large yogurt and a quiet, shared sense that this might be working."], ["far", "You each take a different approach to being good, and the neighbourhood, to its own surprise, needs both."])
    ]),
    W("winden", "Winden rewards the careful: a small town, a cave and a family tree that insists on being a loop.", [
      ["puzzle", "{w} draws the family tree on the wall, adds the date on the cave and, quietly, realises it is a circle."],
      ["persist", "{w}, who has followed the same thread through three decades and is still, tenderly, tugging it."],
      ["secret", "{w} keeps the secret, and the other secret, and the third secret nobody suspected, with a very straight face.", "Who is hiding the most?"],
      ["sacrifice", "{w} steps into the cave, again, so that the loop, with luck, can end."],
      ["calm", "{w} watches the lights flicker, the clock stop and the tunnel breathe, and, with a long sigh, picks up the notebook."]
    ], [
      B("pair", ["analytic", "You gather the evidence in a notebook and a very long afternoon. {A} and {B} find the first impossible date and the second."], ["cautious", "You walk to the cave in daylight, together. {A} and {B} are quiet, prepared and, by the entrance, quite sure it is looking back."]),
      B("lead", ["steady", "{lead} faces the strange door with a slow, even breath and, with a very small push, opens it."], ["driven", "{lead} makes the decision, steps through and does not look back, which, in this town, is a statement."]),
      B("other", ["analytic", "{other} lines up the photographs, the dates and the family names and, with a shaking hand, finds the one that does not belong."], ["warm", "{other} sits with the grieving friend and, with a very small silence, holds a whole generation."]),
      B("gap", ["close", "You reach the answer together, in the same dim cave, with the same small, awful, necessary understanding."], ["far", "You each follow a different strand of the same story and meet in the middle with a very careful, very sad nod."])
    ]),
    W("alexandria", "Alexandria rewards the steady: a wall, a council and a very large effort to remember what the wall is for.", [
      ["leader", "{w} gives the order at the gate in a quiet voice, and the whole watch, as one, shifts."],
      ["persist", "{w}, who has been on the wall for forty hours and, with a mug of lukewarm coffee, is happy to be on it for forty more."],
      ["moral", "{w} stops the group at the gate, asks who is out there and, annoyingly, changes the plan."],
      ["comfort", "{w} sits with the exhausted guard at the end of the shift and shares the last, slightly stale, cookie."],
      ["scout", "{w} goes out at dawn, walks the whole perimeter and returns with three useful details and a very small bird."]
    ], [
      B("pair", ["steady", "You take the first watch together. {A} and {B} say very little, see a great deal and are, by dawn, an excellent team."], ["cautious", "You walk the whole wall, twice, listening. {A} and {B} learn its weak points, its quiet spots and a very odd squeak."]),
      B("lead", ["steady", "{lead} holds the gate with a calm that makes the whole watch, for an hour, feel safer."], ["driven", "{lead} gives the order, takes the first position and, with a quiet word, holds the line."]),
      B("other", ["warm", "{other} hosts the long community dinner and, with a very small speech, reminds everyone why."], ["analytic", "{other} reads the supply list, finds the shortage and, with a quiet word to the council, saves the winter."]),
      B("gap", ["close", "You hold the wall together through the long night and, at dawn, share a very small, quiet cup."], ["far", "You each take a different side of the wall, and meet, at dusk, with the same exhausted nod."])
    ]),
    W("albuquerque", "Albuquerque rewards the careful chemist: a sunlit city, a very good lab and the very small steps by which a reasonable plan becomes a bad one.", [
      ["plan", "{w} lays out the whole operation on a legal pad, with a diagram, a budget and a very tidy flow chart."],
      ["skeptic", "{w} says, flatly, that the plan is bad, the partner is worse and the cost, honestly, is not a number."],
      ["schemer", "{w} has already worked out which partner will talk, which will run and which is quietly keeping a notebook."],
      ["persist", "{w}, who has been working on the same formula for three weeks and is, at last, a decimal away."],
      ["moral", "{w} puts down the beaker, looks at the result and asks what, exactly, they are making this for."]
    ], [
      B("pair", ["analytic", "You set up the lab in a very small space. {A} and {B} are precise, careful and quite surprised at how well it goes."], ["guarded", "You agree to the arrangement with a handshake and a very long list of rules. {A} and {B} follow all of them, for a week."]),
      B("lead", ["steady", "{lead} walks into the meeting in a sensible shirt, says very little and, with a flat voice, ends the argument."], ["driven", "{lead} makes the decision, signs the paper and, with a very small smile, does not look back."]),
      B("other", ["analytic", "{other} reads the numbers and finds the single entry that does not add up, and the whole plan quietly changes."], ["warm", "{other} sits with the exhausted partner and, over a very late meal, hears the whole story."]),
      B("gap", ["close", "You finish the job together, tired and quiet, with the same small, uncomfortable certainty."], ["far", "You each run a different half of the operation, and it works, which neither of you finds as comforting as it should."])
    ]),
    W("earth-invincible", "Invincible's Earth rewards the hero who stays for the cleanup: a very large fight, a very large mess and the unfashionable belief that someone should help sweep.", [
      ["protect", "{w} flies in front of the falling bus, catches it and then, politely, apologises to the driver."],
      ["moral", "{w} stops mid-punch, looks at the damage and asks if there was another way."],
      ["hero", "{w} ends up saving the day with a very large, very unplanned and very late arrival."],
      ["persist", "{w}, who has been beaten, thrown and flattened and is, with a very small groan, getting back up."],
      ["comfort", "{w} sits with the shaken bystander after the fight and gives them a blanket and a very quiet moment."]
    ], [
      B("pair", ["bold", "You answer the first alarm with a flourish. {A} and {B} are, by the end of the evening, in a very large fight with a very small team."], ["steady", "You take the patrol one street at a time. {A} and {B} learn the city, the schedule and the surprisingly good bakery."]),
      B("lead", ["driven", "{lead} dives into the fight, takes the first hit and, with a roar, turns the whole battle."], ["steady", "{lead} faces the enormous villain with a calm voice and a very honest question."]),
      B("other", ["warm", "{other} stays with the hurt bystander and, in a small way, remembers why they do this."], ["analytic", "{other} watches the enemy's pattern, finds the flaw and, with a single clean move, ends the fight."]),
      B("gap", ["close", "You finish the patrol together and sit on the rooftop, bruised, grateful and quietly pleased."], ["far", "You each take a different threat in the same city, and meet, in the aftermath, with the same weary smile."])
    ]),
    W("wakanda", "Wakanda rewards the builder: a hidden nation, a very advanced workshop and a deep sense of duty to a very old, very beautiful tradition.", [
      ["engineer", "{w} builds a very elegant, very quiet solution from a single, unexpected material."],
      ["leader", "{w} takes the council, the decision and the very long silence that follows it."],
      ["puzzle", "{w} studies the old pattern, the new design and the odd, shining seam, and finds the point where they join."],
      ["duty", "{w} carries out the ceremony, signs the treaty and, with a smile, checks the water supply twice."],
      ["protect", "{w} steps in front of the stranger at the gate, with a very polite smile and a very long spear."]
    ], [
      B("pair", ["inventive", "You visit the workshop for an afternoon. {A} and {B} are, by dusk, in the middle of a prototype, a very good lunch and a very polite argument."], ["steady", "You study the traditions for a season. {A} and {B} are, by spring, quiet, respectful and quite surprised at how much there is."]),
      B("lead", ["steady", "{lead} presides over the council with a calm that makes the whole room, quietly, listen."], ["driven", "{lead} makes the call, stands behind it and, with a very small bow, sends the team."]),
      B("other", ["inventive", "{other} builds a tiny, brilliant device that, to everyone's astonishment, solves the problem."], ["warm", "{other} hosts the visiting delegation, and the evening, for the first time, becomes a friendship."]),
      B("gap", ["close", "You finish the project together, with the same quiet pride and the same very small, startled laugh."], ["far", "You each lead a different half of the project, and the nation, with admirable patience, finds it needs both."])
    ]),
    W("xavier-school", "Xavier's School rewards the teacher: a big house, a very odd class and a firm belief that people can learn to be better, even with a lot of explosions.", [
      ["mentor", "{w} ends up teaching the youngest student how to control their power, one patient, slightly scorched afternoon at a time."],
      ["comfort", "{w} sits with the student who is afraid of what they can do and, with a very quiet word, makes it smaller."],
      ["diplomat", "{w} talks the two rival students into the same room, the same drink and, eventually, the same side."],
      ["calm", "{w} watches the whole classroom explode, shrug and re-form and says, 'Right, from the top.'"],
      ["rulebreak", "{w} sneaks out of the dorm after curfew, with a grin, and returns with a very good story."]
    ], [
      B("pair", ["warm", "You arrive as new teachers. {A} and {B} spend the first week learning every name and the second week, quietly, learning every story."], ["steady", "You take the first class slowly. {A} and {B} are patient, gentle and, remarkably, only slightly singed."]),
      B("lead", ["steady", "{lead} teaches the lesson with a calm that is, in its way, a kind of power, and the whole room, for an hour, is still."], ["driven", "{lead} runs the drill, calls the plan and, with a whistle, makes the mess into a team."]),
      B("other", ["warm", "{other} sits with the anxious student and, with a very small gesture, helps them find the control."], ["funny", "{other} turns the training session into a game, and the whole class, in spite of itself, learns."]),
      B("gap", ["close", "You finish the term together and watch the students walk out, a little braver, and a little more themselves."], ["far", "You each teach a very different class, and the school, with a very patient smile, finds it needs both."])
    ]),
    W("metropolis", "Metropolis rewards the hopeful: a bright city, a busy newsroom and a very reassuring person in a very high place.", [
      ["protect", "{w} flies in front of the falling crane, catches it and, with a very small apology, sets it down."],
      ["moral", "{w} stops at the crossing, looks at the very difficult story and decides to print the true one."],
      ["comfort", "{w} sits with the nervous witness in the lobby and, with a very small coffee, makes it easier."],
      ["persist", "{w}, who has been chasing the same lead for three weeks and is, with a grin, a quote away."],
      ["scout", "{w} goes up on the rooftop, studies the skyline and returns with three sensible ideas and a very good view."]
    ], [
      B("pair", ["hopeful", "You start the morning at the newsroom. {A} and {B} are, by noon, in a chase, an interview and a very big story."], ["steady", "You take the city one block at a time. {A} and {B} learn the people, the rooftops and the best coffee."]),
      B("lead", ["steady", "{lead} faces the crisis with a calm, kind voice, and the whole city, for a moment, believes it will be fine."], ["driven", "{lead} dives into the emergency, catches the thing and, with a smile, sets it down gently."]),
      B("other", ["warm", "{other} gets the story, the quote and the very honest apology, and the front page is, for once, kind."], ["analytic", "{other} reads the report, finds the discrepancy and, with a quiet note, breaks the story."]),
      B("gap", ["close", "You finish the day on the same rooftop with the same coffee and the same view, in a quiet, shared contentment."], ["far", "You each take a different story and, at the print deadline, are delighted to find it is the same one."])
    ]),
    W("themyscira", "Themyscira rewards the disciplined: a hidden island, a very old tradition and a long, patient training in how to be both gentle and unbeatable.", [
      ["trainer", "{w} is up at dawn, training with a quiet, ferocious, cheerful discipline that wakes the whole island."],
      ["duty", "{w} polishes the shield, rewrites the roster and, with a bow, checks the harbour twice."],
      ["leader", "{w} gives the order in a calm voice, and the whole guard, as one, moves."],
      ["diplomat", "{w} welcomes the stranger to the shore, hears the whole story and, with a small, courteous bow, gives them a bed."],
      ["protect", "{w} steps between the stranger and the arrow without a word and says it was only a practice."]
    ], [
      B("pair", ["steady", "You train on the island for a season. {A} and {B} are quiet, strong and, quite suddenly, very good."], ["warm", "You arrive as guests. {A} and {B} are, by the end of the week, friends, students and, quite politely, rivals."]),
      B("lead", ["steady", "{lead} faces the arena with a calm that makes the whole crowd, for a long moment, hold its breath."], ["driven", "{lead} gives the order and takes the first swing, and the whole guard, with a roar, follows."]),
      B("other", ["warm", "{other} shares a meal with the stranger, and the island, for the first time in centuries, has a friend."], ["analytic", "{other} reads the old text, finds the forgotten law and, with a quiet word, changes the council's mind."]),
      B("gap", ["close", "You finish the season side by side, tired and proud, with the same quiet nod."], ["far", "You each train in a different tradition and meet, in the arena, with an enormous, delighted bow."])
    ]),
    W("oa", "Oa rewards the willpower: a green planet, a very big rulebook and a corps of beings who may be the most stubborn in the galaxy.", [
      ["persist", "{w}, who has been on patrol for six days and is, with a quiet, glowing smile, considering a seventh."],
      ["leader", "{w} gives the order, takes the point and, with a green flash, leads the whole sector."],
      ["calm", "{w} watches the enormous fear-creature loom and, with a deep breath, summons the very correct amount of will."],
      ["duty", "{w} files the report, checks the rule and, with a quiet word, notes the clause that applies."],
      ["protect", "{w} steps in front of the shuttle, makes a very large green shield and, politely, asks it to move along."]
    ], [
      B("pair", ["steady", "You report to the sector. {A} and {B} are disciplined, quiet and quite surprised by how long the patrol is."], ["bold", "You take the first mission at a run. {A} and {B} are loud, bright and, remarkably, on time."]),
      B("lead", ["driven", "{lead} gives the order and charges, with a very bright, very green and very determined face."], ["steady", "{lead} faces the huge, dark thing with a calm, level voice and, with a single bright thought, answers it."]),
      B("other", ["analytic", "{other} reads the rulebook, finds the clause that applies and quietly saves the day."], ["warm", "{other} sits with the shaken rookie after the patrol and, with a small, steady voice, gives them courage."]),
      B("gap", ["close", "You finish the patrol together and share a quiet, bright moment on the ring, looking at the stars."], ["far", "You each take a different sector and meet, at the last light, with an easy, tired nod."])
    ]),
    W("holy-grail-war", "The Holy Grail War rewards the strategist: a secret tournament, a summoned hero and a very polite agreement not to ask what anyone wants.", [
      ["schemer", "{w} has already worked out which master has which servant, which wish and which weakness, and is quietly drinking tea."],
      ["persist", "{w}, who has fought the same opponent three times and is, with a very small, stubborn smile, about to win."],
      ["sacrifice", "{w} steps in front of the blow so {o} can finish the incantation, and says it was a matter of tactics."],
      ["leader", "{w} gives the order to the summoned hero in a voice so calm that the hero, to its own surprise, obeys."],
      ["moral", "{w} puts down the sword, looks at the cost and asks what, exactly, the wish is for."]
    ], [
      B("pair", ["planner", "You prepare the first night with a circle, a map and a long list. {A} and {B} are, by dusk, in an alliance, a chase and a very polite argument."], ["bold", "You summon the hero on a hunch. {A} and {B} are, by midnight, in the middle of the first fight."]),
      B("lead", ["driven", "{lead} gives the order and the hero, with a bright flash, answers it. The street, briefly, is theirs."], ["steady", "{lead} waits, with a calm face, until the opponent reveals the flaw. Then, with a single word, ends it."]),
      B("other", ["analytic", "{other} reads the enemy's legend, finds the one detail and, with a quiet word, rewrites the plan."], ["warm", "{other} shares a meal with the wounded servant, and the war, for an evening, is a dinner."]),
      B("gap", ["close", "You finish the war together, in the quiet of a very old church, with the same small, honest question."], ["far", "You each want a different wish, and the war, with a long, polite silence, waits to see which of you says it first."])
    ]),
    W("dokkaebi-scenarios", "The Scenarios reward the reader: a world that has become a story, a set of very strict rules and a very long list of things that happen on schedule.", [
      ["puzzle", "{w} reads the next scenario, notes the clause and, with a very small smile, says what is going to happen."],
      ["schemer", "{w} has already worked out which constellation is watching, which is lying and which has been waiting."],
      ["persist", "{w}, who has been through the same scenario eleven times and is, with a tired nod, going in for the twelfth."],
      ["rulebreak", "{w} finds the one loophole in the system and, with a slow, delighted grin, uses it."],
      ["sacrifice", "{w} takes the penalty so {o} can reach the next stage, and says the maths worked out."]
    ], [
      B("pair", ["analytic", "You read the first scenario together. {A} and {B} are quiet, careful and, by the end, quite sure the author has a sense of humour."], ["improviser", "You break the first rule by accident. {A} and {B} are, by the third scenario, doing it on purpose."]),
      B("lead", ["steady", "{lead} faces the first boss with a calm, informed voice and a very small, very certain nod."], ["driven", "{lead} makes the call, takes the lead and, with a very quiet laugh, rewrites the plot."]),
      B("other", ["analytic", "{other} reads the list of constellations, the sponsors and the odd, unlikely rule, and finds the gap in the system."], ["warm", "{other} sits with the frightened stranger after the scenario and, with a very small gesture, makes them a companion."]),
      B("gap", ["close", "You finish the last scenario together, tired and quiet, with the same slow, startled understanding."], ["far", "You each play a different part of the same story, and the author, with a wry shrug, gives you both an ending."])
    ]),
    W("republic-city", "Republic City rewards the fixer: a crowded, modern city, a very enthusiastic sport and an old kind of magic that has learned to wear a suit.", [
      ["leader", "{w} gets up on the podium, takes the microphone and, with a grin, rallies the whole arena."],
      ["engineer", "{w} builds a very clever, very noisy machine from scrap, and the city, startled, starts to hum."],
      ["diplomat", "{w} brokers the peace between two very large, very loud families and a very small taxi."],
      ["scout", "{w} runs across the rooftops, finds the hideout and returns with a map and a very good noodle."],
      ["daredevil", "{w} leaps off the tram, grabs the thief and lands, with a flourish, in a very large puddle."]
    ], [
      B("pair", ["improviser", "You arrive in the city with a bag and a plan. {A} and {B} are, by dusk, in a chase, a tournament and a very good noodle shop."], ["planner", "You study the city for a week. {A} and {B} learn the districts, the families and the very fast tram."]),
      B("lead", ["driven", "{lead} takes the stage, announces the plan and, with a grin, makes the whole arena, to a person, cheer."], ["steady", "{lead} faces the crowd with a calm voice and a very small, very effective speech."]),
      B("other", ["inventive", "{other} builds an unlikely device from a bicycle and a very large umbrella, and the whole city, quite delighted, uses it."], ["warm", "{other} sits with the shaken witness at the noodle stand, and the whole district, quietly, relaxes."]),
      B("gap", ["close", "You finish the day on the same tram, tired and cheerful, with the same very good noodle."], ["far", "You each solve a different part of the case and meet, at the arena, with the same grin."])
    ]),
    W("diagon-alley", "Diagon Alley rewards the explorer: a crooked street, a very good wand shop and the happy, endless discovery that the world is much bigger, and much sillier, than you thought.", [
      ["scout", "{w} wanders into the narrow lane, finds the little shop and returns, delighted, with an enormous book and a very small owl."],
      ["bond", "{w} befriends the shopkeeper, the cat and the very serious apprentice in a single afternoon."],
      ["clown", "{w} tries on every hat in the shop, one by one, and the whole street, helplessly, joins in."],
      ["puzzle", "{w} reads the odd label on the old, sticky jar and, with a click, realises it is a very good joke."],
      ["comfort", "{w} sits with the nervous new student on the bench and shares the last, slightly lumpy, ice cream."]
    ], [
      B("pair", ["curious", "You arrive for a single errand. {A} and {B} are, by dusk, in a bookshop, a broomshop and a very amiable argument with a parrot."], ["relaxed", "You spend the afternoon on a bench with ice cream. {A} and {B} watch the whole, happy street go by."]),
      B("lead", ["bold", "{lead} walks into the strangest shop on the street and asks for the most unusual thing on the shelf. The shopkeeper, delighted, finds it."], ["steady", "{lead} browses the whole street in slow, steady silence and, at the end, chooses exactly the right wand."]),
      B("other", ["funny", "{other} makes a very good joke about the very serious price tag, and the shopkeeper, startled, gives a discount."], ["analytic", "{other} reads the spine of every old book and, with a small cheer, finds the one that has been waiting."]),
      B("gap", ["close", "You finish the afternoon on the same bench with the same ice cream and a very large bag, in a contented quiet."], ["far", "You each explore a different side of the street and meet, at dusk, with two bags, one owl and a very good story."])
    ])
  ]);
})(Forge);
