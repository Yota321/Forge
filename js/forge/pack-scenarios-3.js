/* =========================================================================
   SITUATIONS (data only): sixteen more "what would happen if the two of you ..." scenarios, in the same format as pack-scenarios-2.js.
   These cover the stretches of life the Compare page's Situations chapter was missing: a murder mystery, raising a child, business
   partners, travelling, a desert island, ruling a kingdom, weddings, moving abroad and a few everyday crises.
   lens ["all"] = told for every lens. needs = facet weights the pair must cover; lead = who takes point; great / good / rough = authored
   outcomes ({lead} {other} {A} {B}). Keep every line friendly, PG and free of numbers.
   ========================================================================= */
(function(F){
  "use strict";
  if (!F.packs) return;
  const ALL = ["all"];
  const S = (id, title, icon, world, needs, lead, great, good, rough) => ({ id, lens: ALL, title, icon, world, needs, lead, great, good, rough });

  F.packs.add("scenarios", [
    S("murder-mystery", "Solving a murder mystery", "🔍", "", { analysis: 1.2, explore: 0.8, patience: 0.8, persist: 0.7, trust: 0.4 }, { analysis: 1, initiative: 0.6 },
      "{lead} lines up the timeline and {other} notices that the butler is holding the wrong hand. By the end of the evening the whole drawing room is staring at the right person.",
      "You solve it, eventually, after accusing the gardener, the vicar and a very surprised cat. The real culprit confesses out of sheer exhaustion.",
      "{lead} has a theory. {other} has a different theory. You both reveal them in the drawing room at the same moment, and the suspect, politely, agrees with neither."),
    S("raising-a-child", "Raising a child together", "🍼", "", { patience: 1.2, steadiness: 1, warmth: 1, structure: 0.7, flex: 0.8 }, { patience: 1, warmth: 1 },
      "{lead} does the story voices and {other} knows where the other sock is. Bedtime is a three-act performance, and, somehow, it ends on time.",
      "It is chaos with a lot of love in it. You cover for each other at all the right moments and nobody can say who is in charge, least of all the child.",
      "{lead} wants a routine. {other} wants to see how the day goes. The child has decided on a third plan and it involves a saucepan."),
    S("business-partners", "Being business partners", "💼", "", { structure: 1, initiative: 0.9, trust: 0.9, analysis: 0.7, persist: 0.7 }, { initiative: 1, structure: 0.8 },
      "{lead} pitches, {other} reads the contract line by line, and the first client says it is the clearest proposal they have ever seen. The invoices go out on time.",
      "The business works, in a slightly unplanned way. One of you does the numbers, the other does the talking, and you agree to swap if either gets bored.",
      "{lead} makes a promise to a client. {other} finds out from the client. A very honest conversation about decision rights follows, over very strong coffee."),
    S("backpacking", "Backpacking across a country", "🎒", "", { flex: 1.2, explore: 1, steadiness: 0.8, patience: 0.8, humor: 0.5 }, { explore: 1, flex: 1 },
      "{lead} finds the village not in the guidebook and {other} finds the train that is not on the timetable. You arrive with two new friends and a very good story about a goat.",
      "The trip is a series of small wrong turns that turn into the best bits. You return sunburnt, a little lost and entirely in agreement.",
      "{lead} wants to wander. {other} has already booked everything. You meet at the station, where the only seat left is next to the chickens."),
    S("desert-island", "Stranded on a desert island", "🏝️", "", { flex: 1.1, persist: 1, patience: 0.9, steadiness: 0.9, invent: 0.8 }, { steadiness: 1, initiative: 0.8 },
      "{lead} builds the shelter, {other} works out the water, and by the third day there is a signal fire, a coconut rota and a surprisingly comfortable hammock.",
      "You are rescued after a fortnight, tanned and with a half-written system of island laws. Neither of you wants to talk about the crab.",
      "{lead} wants to wait for rescue. {other} wants to build a raft. The raft is built. The raft, to be fair, floats. Briefly."),
    S("ruling-a-kingdom", "Ruling a small kingdom for a week", "👑", "", { initiative: 1, analysis: 0.9, trust: 0.8, warmth: 0.7, steadiness: 0.7 }, { initiative: 1, boldness: 0.6 },
      "{lead} makes the proclamations and {other} reads the petitions. By Friday there is a new bridge, a modest festival and not a single riot.",
      "The kingdom survives the week, roughly intact. You each issue one proclamation you regret and one you are quietly proud of.",
      "{lead} abolishes Tuesdays. {other} reinstates them. The people, confused, hold a festival to celebrate whichever of you is still in charge."),
    S("marathon-training", "Training for a marathon together", "🏃", "", { persist: 1.2, patience: 1, structure: 0.9, steadiness: 0.8, optimism: 0.6 }, { persist: 1, structure: 0.8 },
      "{lead} sets the alarm and {other} sets the pace. By the long run in week ten you are talking about anything except your legs, and by race day you cross the line holding hands.",
      "You finish, not gracefully, but together, with a medal and a new respect for people who run on purpose. The celebratory breakfast is, honestly, the best bit.",
      "{lead} wants to push. {other} wants a rest day. You meet in the middle, at the cafe, with a very large pastry and a revised training plan."),
    S("moving-abroad", "Moving to a new country", "✈️", "", { flex: 1.1, explore: 0.9, steadiness: 0.9, patience: 0.8, optimism: 0.6 }, { explore: 1, flex: 0.8 },
      "{lead} befriends the whole street and {other} masters the bus timetable. Within a month you have a local café, a favourite bench and a working phrase for apologising.",
      "It is hard and slightly lonely at first, then suddenly fine. You hold on to each other for the first season and look up in the second to find it is home.",
      "{lead} wants to throw themselves in. {other} wants to read the instructions first. The bureaucracy, evenly, defeats you both for a fortnight."),
    S("writing-a-book", "Writing a book together", "📚", "", { invent: 1, persist: 0.9, patience: 0.8, analysis: 0.7, autonomy: 0.4 }, { invent: 1, structure: 0.6 },
      "{lead} writes the first chapter at midnight and {other} fixes it by breakfast. By the end of the year there is a manuscript, and, astonishingly, a plot.",
      "You finish it, on a stubborn deadline, with a few chapters rewritten and one character quietly deleted. It is better than either of you expected.",
      "{lead} loves the long, strange middle. {other} wants an ending. The book has three of them and a character who is, by some accounts, in the wrong century."),
    S("airport-delay", "An airport delay that keeps getting longer", "🛄", "", { patience: 1.2, humor: 0.9, steadiness: 0.9, flex: 0.8, warmth: 0.5 }, { patience: 1, humor: 0.7 },
      "{lead} finds the quiet corner and {other} finds the free snacks. By hour six you have invented a game, made a friend and been upgraded to the lounge by sheer charm.",
      "You get through it with a deck of cards and a very long conversation. When the announcement finally comes, you are almost sorry.",
      "{lead} refreshes the flight board. {other} refreshes it again. Four hours later, you are both quite sure the board is doing it on purpose."),
    S("heist-plan-b", "A heist where plan A fails", "🗝️", "", { flex: 1.2, analysis: 0.9, boldness: 0.9, trust: 0.9, steadiness: 0.8 }, { boldness: 1, flex: 1 },
      "The alarm goes off exactly where you said it would. {lead} calls the switch and {other} is already on plan B. You leave through the front door, in uniform, with a polite nod to the guard.",
      "Plan B is mostly improvised and slightly embarrassing, but it works. The only casualty is a very expensive pot plant.",
      "{lead} says 'stick to plan A'. {other} says 'there is no plan A'. There is, in fact, a plan C, which is a taxi, and which neither of you booked."),
    S("caring-for-someone", "Looking after someone who is unwell", "🫖", "", { warmth: 1.2, patience: 1.1, steadiness: 0.9, structure: 0.6, trust: 0.6 }, { warmth: 1, patience: 1 },
      "{lead} sits at the bedside with soup and a very gentle voice. {other} keeps the whole household running behind the scenes. By the weekend they are better, and you are both a little pleased with yourselves.",
      "It is tiring and tender in equal measure. You take turns in the night, and nobody keeps the count.",
      "{lead} fusses. {other} lectures. The patient, with great dignity, asks to be left alone with the television."),
    S("neighbour-dispute", "A dispute with the neighbours", "🏘️", "", { patience: 1, warmth: 0.9, trust: 0.8, steadiness: 0.8, analysis: 0.6 }, { warmth: 1, steadiness: 0.8 },
      "{lead} knocks on the door with a plant. {other} has already written a calm, fair list of the issues. By the end of the week you are invited to the barbecue.",
      "The argument fades into a polite wave. Nothing is solved, exactly, but everybody is quietly agreed to stop.",
      "{lead} goes round to talk. {other} writes a letter. The neighbour receives both at once and, understandably, does not know which of you to answer."),
    S("garden-makeover", "Redoing the garden over a weekend", "🌱", "", { flex: 0.9, patience: 0.9, structure: 0.8, invent: 0.8, persist: 0.7 }, { structure: 1, invent: 0.7 },
      "{lead} draws the plan and {other} finds the right plants at the right price. By Sunday evening there is a path, a bench and a surprising number of tomatoes.",
      "It gets done, a little crooked in places. The path bends where the hose was, and everyone agrees that this is on purpose.",
      "{lead} wants straight lines. {other} wants a meadow. The garden settles it by growing something neither of you planted."),
    S("volunteering-event", "Running a community event", "🎪", "", { structure: 1, social: 0.9, warmth: 0.8, initiative: 0.8, flex: 0.7 }, { initiative: 1, social: 0.8 },
      "{lead} charms the volunteers and {other} keeps the schedule. The doors open on time, the queue is cheerful and the tombola is a triumph.",
      "It is a little messy and a lot of fun. Somebody forgets the extension lead, somebody else finds one, and by evening, it has worked.",
      "{lead} invites everyone. {other} counts the chairs. The numbers do not agree, and the vicar kindly volunteers to sit on the floor."),
    S("startup-pitch", "Pitching an idea to a room of strangers", "🎤", "", { boldness: 1, social: 0.9, analysis: 0.8, persist: 0.7, steadiness: 0.7 }, { boldness: 1, social: 1 },
      "{lead} owns the room and {other} owns the questions. The pitch lands, the numbers survive scrutiny and somebody, from the back, asks how soon you can start.",
      "You get through it, a little shaky at the start and rather good by the end. Nobody invests, but two people ask for your card.",
      "{lead} improvises. {other} reads the notes. The slides, for reasons neither of you can explain, are in a different order from either of those.")
  ]);
})(Forge);
