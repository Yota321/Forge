/* =========================================================================
   WORLD SCRIPTS 7 (data only): scripts for thirteen more of the new worlds. Same shape as pack-story-worlds-3.js. Original wording written for Forge.
   ========================================================================= */
(function(F){
  "use strict";
  if (!F.packs) return;
  const W = (id, intro, qs, beats) => ({ id, intro, qs, beats });
  const B = (about, ...o) => ({ about, o });

  F.packs.add("worldScripts", [
    W("ostania", "Ostania rewards the cover story: a quiet street, a very good school and three people who each have a secret and are, all things considered, being quite nice about it.", [
      ["plan", "{w} has a cover, a back-up cover and a back-up for the back-up, and has memorised all three before the neighbours wake up."],
      ["secret", "{w} keeps the secret so well that even {o} has, by now, stopped asking, which is, of course, the point.", "Who keeps the secret best?"],
      ["scout", "{w} walks the street at dawn, notes the new van and the slightly wrong lamp and says nothing at all."],
      ["clown", "{w} turns the school interview into a comedy of errors and, quite accidentally, wins the room."],
      ["comfort", "{w} gently notices that the child is not quite herself, and, with a quiet pancake, fixes it."]
    ], [
      B("pair", ["planner", "You prepare the family dinner like an operation. {A} and {B} have a script, a menu and a very good line about the weather."], ["improviser", "You walk into the neighbour's tea party with no cover at all. {A} and {B} improvise a perfectly believable family and, mostly, a very good pie."]),
      B("lead", ["steady", "{lead} meets the inspector with a calm, polite smile. The questions, one by one, politely bounce."], ["nervy", "{lead} spills the tea, forgets the cover and ends up, with great sincerity, giving the perfect alibi."]),
      B("other", ["warm", "{other} notices the quiet child on the stairs and, with a very small, honest conversation, changes the evening."], ["analytic", "{other} reads the newspaper, the neighbour's gossip and the odd delivery, and works out the real agenda."]),
      B("gap", ["close", "You finish the mission as a perfectly ordinary pair and, with a small, startled smile, realise it was not entirely a cover."], ["far", "You each play your part on opposite sides of the same dinner, and the evening, to your surprise, is a success."])
    ]),
    W("shimokitazawa", "Shimokitazawa's live houses reward the quietly brave: a small stage, a borrowed amp and a crowd of eleven who are, honestly, the whole point.", [
      ["scared", "{w} is secretly terrified of the stage, the lights and the very polite first row, and is holding the guitar, nonetheless, very tightly."],
      ["engineer", "{w} rewires the amp, the cable and the very weary mixing desk and, with a click, saves the night."],
      ["dream", "{w}, who has a setlist, a plan and a very small, very real dream of a bigger stage."],
      ["comfort", "{w} sits with the shaking bassist after the set and says nothing, which, for once, is exactly the right thing."],
      ["persist", "{w}, who has practiced the same riff nine hundred times and is about to play it, flawlessly, in front of eleven people."]
    ], [
      B("pair", ["cautious", "You book a tiny gig and rehearse for weeks. {A} and {B} are nervous, ready and, at the soundcheck, quite sure the room has shrunk."], ["bold", "You take the first slot with a half-written song. {A} and {B} play it with total conviction, and the crowd, impressed, is kind."]),
      B("lead", ["driven", "{lead} counts the band in, takes the first chord and, with a very loud breath, begins."], ["steady", "{lead} waits for the room to settle, tunes, smiles, and begins at exactly the right moment."]),
      B("other", ["inventive", "{other} writes a bridge for the second song, on a napkin, in the middle of the soundcheck, and it is, startlingly, the best part."], ["warm", "{other} introduces every member of the band to every member of the crowd, and the whole room, quite suddenly, is a family."]),
      B("gap", ["close", "You finish the set together, hearts racing, and share a very small cup of tea at the back of the room."], ["far", "You each play a different style in the same song, and the crowd, to everyone's surprise, hears it as a single, odd, wonderful thing."])
    ]),
    W("rear-palace", "The Rear Palace rewards the observant: a very large court, a very small poison and the sensible suspicion that the tea has opinions.", [
      ["puzzle", "{w} tastes the tea, notes the colour and, with a polite cough, declares it, definitively, not what it was labelled."],
      ["skeptic", "{w} says, flatly, that the illness is not a curse, the curse is not a curse and the very dramatic cough is a rash."],
      ["diplomat", "{w} talks two feuding consorts into the same garden, the same tea and, eventually, the same side."],
      ["schemer", "{w} has already worked out which courtier hired which doctor, and why, and is quietly eating a pastry."],
      ["calm", "{w} watches the whole court panic over the rumour and, with a small shrug, goes back to the herbs."]
    ], [
      B("pair", ["analytic", "You are sent to look into a small illness. {A} and {B} find a rash, a pot of face-powder and a very large secret, before lunch."], ["cautious", "You walk the court slowly, listening. {A} and {B} learn who sits, who stands and who is, quite clearly, being polite about a headache."]),
      B("lead", ["steady", "{lead} presides over the inquiry with a calm voice and a very slow hand, and the whole room, to a courtier, relaxes."], ["driven", "{lead} gives the order, names the culprit and, to everyone's surprise, is right."]),
      B("other", ["analytic", "{other} reads the physician's notes, the tea leaves and the very odd stain and finds the single, quiet clue."], ["warm", "{other} sits with the frightened maid and, with a small kindness, hears the whole story."]),
      B("gap", ["close", "You solve the case together, share a quiet pot of tea and agree that the real poison was gossip."], ["far", "You each solve a different half of the mystery, and the court, delighted, has a very good week."])
    ]),
    W("leiden", "Leiden rewards the listener: a port city, a very good typewriter and the patient art of finding the right word for something that is, mostly, unsaid.", [
      ["comfort", "{w} sits with the client, listens to the whole story and, at the end, finds the one sentence that fits."],
      ["study", "{w} practises the letter four times, in four hands, until it sounds exactly like a sigh."],
      ["calm", "{w} watches the client weep, the clock tick and the tea cool and simply, steadily, waits."],
      ["diplomat", "{w} writes the apology letter that two old friends, for twenty years, had been unable to send."],
      ["moral", "{w} puts down the pen, looks at the draft and asks whether the sentence is true, or just kind."]
    ], [
      B("pair", ["warm", "You open the office with a typewriter and a kettle. {A} and {B} spend the first week listening, and the second week, quietly, writing."], ["steady", "You take the first commission slowly. {A} and {B} learn every word, every pause and every very careful comma."]),
      B("lead", ["steady", "{lead} sits down at the typewriter, takes a long, quiet breath and, with a single clean line, begins."], ["nervy", "{lead} starts the letter four times and crumples three drafts, and the fourth, to their own surprise, is perfect."]),
      B("other", ["warm", "{other} listens to the client's whole life in an hour, and the letter, after that, almost writes itself."], ["analytic", "{other} finds the missing word, the one that has been waiting in the draft for years."]),
      B("gap", ["close", "You deliver the letter together, in the same hand and the same quiet, and the reply, a week later, is only a single word."], ["far", "You each write a different version of the same letter, and the client, after a long evening, chooses a third."])
    ]),
    W("dungeon", "The Dungeon rewards the gourmet: a very deep hole, a very well-stocked pantry and the sensible conviction that anything that can be killed can be cooked.", [
      ["fix", "{w} turns a very large, very surprised slug into a stew, a spice and a very good dinner."],
      ["scout", "{w} maps the next floor, notes the nearest hearth and, with a nod, finds the safe room."],
      ["caretaker", "{w} makes sure every member of the party has a full bowl, a clean blanket and a very serious lecture about hygiene."],
      ["puzzle", "{w} reads the strange symbol on the wall, the old recipe on the pot and works out which of the two is a warning."],
      ["daredevil", "{w}, who is already tasting the strange mushroom and is, quite calmly, taking notes."]
    ], [
      B("pair", ["curious", "You descend the first stairs for a short look. {A} and {B} return, three floors later, with a map, a menu and a very curious recipe."], ["planner", "You prepare a menu for each floor. {A} and {B} are, by the third, delighted to find that the plan holds."]),
      B("lead", ["bold", "{lead} walks into the next chamber with a ladle held like a sword. The monster, confused, becomes lunch."], ["steady", "{lead} counts the supplies, checks the map and calls a halt for dinner at exactly the right moment."]),
      B("other", ["inventive", "{other} builds a clever, improbable cooking rig from two shields and a spare helmet, and the whole party is, briefly, a restaurant."], ["warm", "{other} notices that the youngest member of the party is tired and, with a very small gesture, saves the evening."]),
      B("gap", ["close", "You finish the dungeon dinner together, full, content and quietly looking forward to the next floor."], ["far", "You each cook a different dish from the same monster, and the party, delighted, declines to choose."])
    ]),
    W("morioh", "Morioh rewards the dramatic: a quiet town, a very odd power and a fight that is decided less by strength than by who has the better idea.", [
      ["schemer", "{w} has already worked out the opponent's power, weakness and favourite snack, and is calmly waiting."],
      ["entrance", "{w} arrives at the fight in a very dramatic pose, to a very small, very startled crowd."],
      ["daredevil", "{w} jumps off the bridge, grabs the very shiny thing and lands, to everyone's astonishment, on the correct side."],
      ["puzzle", "{w} studies the strange rule, the odd shadow and the bad pun and, with a click, understands."],
      ["clown", "{w} turns the whole fight into a very bad pun, and the villain, in spite of himself, laughs."]
    ], [
      B("pair", ["improviser", "You meet the strange stranger at the bus stop. {A} and {B} are, by dusk, in a duel, a chase and a very elaborate pose."], ["planner", "You study the strange power for three days. {A} and {B} have a plan, a counter and a very polite bow."]),
      B("lead", ["bold", "{lead} steps forward, strikes a pose and announces the plan. The enemy, off-balance, looks briefly impressed."], ["steady", "{lead} waits, with arms folded, until the enemy's power reveals its flaw, and then, with a calm word, ends it."]),
      B("other", ["analytic", "{other} notices the very small detail in the very large fight that makes the whole power fail."], ["funny", "{other} makes a joke at exactly the right moment, and the enemy, startled, drops their guard."]),
      B("gap", ["close", "You win the duel on the same beat, strike the same pose and share a very small, very dramatic nod."], ["far", "You each fight a different opponent and, to everyone's surprise, defeat them with the same, very odd move."])
    ]),
    W("no-mans-land", "No Man's Land rewards the stubborn optimist: a hot desert, a lot of doughnuts and the very unfashionable belief that most people are, basically, all right.", [
      ["protect", "{w} steps in front of the gunman, smiles and offers him a doughnut."],
      ["persist", "{w}, who has been walking through the desert for three days and is, at this point, mostly composed of dust and hope."],
      ["moral", "{w} refuses to take the shot, again, and gives a speech so earnest that the whole saloon sighs."],
      ["comfort", "{w} sits with the weary kid on the wagon and shares the last, slightly squashed, doughnut."],
      ["clown", "{w} turns the wild-west showdown into a slapstick, and the whole town, relieved, laughs."]
    ], [
      B("pair", ["hopeful", "You wander into the first town with a smile and a big bag. {A} and {B} are, by noon, in a showdown, a chase and a very kind conversation."], ["steady", "You walk the long desert road together. {A} and {B} share the water, the shade and the very small, quiet pleasure of a shared silence."]),
      B("lead", ["steady", "{lead} faces the gunmen with an open hand and a calm voice. They, baffled, lower their weapons."], ["nervy", "{lead} trips, flails and accidentally disarms the whole gang. It was, to be generous, a plan."]),
      B("other", ["warm", "{other} patches up the injured outlaw, and the whole town, very quietly, changes its mind about him."], ["analytic", "{other} reads the posters, the maps and the rumours and works out where the gang will be at dusk."]),
      B("gap", ["close", "You leave the town together, dusty and quietly pleased, with the sunset in front of you."], ["far", "You each handle a different half of the standoff, and it works, in the strangest and kindest way."])
    ]),
    W("britannia", "Britannia rewards the strategist: a very large empire, a very well-made mask and a game of chess that, in the end, is played with people.", [
      ["plan", "{w} lays out the whole campaign on a chessboard, a bread roll and three forks, and everyone, slowly, understands."],
      ["schemer", "{w} has already worked out which general will blink, which noble will bluff and which one is secretly on their side."],
      ["leader", "{w} gives the order in a quiet voice, and the whole resistance, as one, moves."],
      ["sacrifice", "{w} steps into the line of fire so the plan, and the person who matters most, can proceed."],
      ["moral", "{w} stops the operation at the last moment and asks if the cost is, in fact, worth the win."]
    ], [
      B("pair", ["planner", "You plan the first operation for a month. {A} and {B} have a chessboard, a mask and a quite thorough disagreement."], ["bold", "You launch the first strike on a hunch and an excellent entrance. {A} and {B} are, by the end of the night, quite sure it was a plan."]),
      B("lead", ["driven", "{lead} announces the plan in a quiet, level voice, and the whole room, to a person, believes it."], ["steady", "{lead} waits for the perfect moment, then plays the piece. The board, in a single move, changes."]),
      B("other", ["analytic", "{other} reads the opposing general's habits and finds the single move that makes the whole position fall."], ["warm", "{other} holds the shaken team together with a quiet word and a very good cup of tea."]),
      B("gap", ["close", "You win the campaign together and, in the quiet of the evening, say nothing and mean everything."], ["far", "You each play a different side of the same plan, and the opponents, confused, cannot decide whom to fear."])
    ]),
    W("naoetsu", "Naoetsu High rewards the talker: a quiet school, a small supernatural problem and a very long conversation on a bench that, somehow, solves it.", [
      ["puzzle", "{w} turns the strange story over in conversation until, with a click, it becomes an ordinary, solvable thing."],
      ["comfort", "{w} sits with the haunted classmate on the bench and, with a small joke, makes the whole thing lighter."],
      ["clown", "{w} responds to the strange spirit's riddle with a worse one, and the spirit, to its own surprise, laughs."],
      ["calm", "{w} watches the oddity appear, the room change and the classmates panic, and sips, quietly, a very small drink."],
      ["moral", "{w} says, flatly, that the cure is not the same as the kindness, and then does both."]
    ], [
      B("pair", ["curious", "You hear a very odd rumour at the school gate. {A} and {B} are, by lunchtime, deep in a very polite conversation with a very old ghost."], ["relaxed", "You spend the afternoon on the bench. {A} and {B} drink tea, talk about nothing and, by dusk, have solved an oddity."]),
      B("lead", ["steady", "{lead} speaks to the spirit in a low, patient voice, and the haunting, with a faint sigh, ends."], ["funny", "{lead} gives the spirit a pun so awful that it, helplessly, concedes."]),
      B("other", ["analytic", "{other} lays out the rumour, the date and the odd detail, and finds, in the middle, a very small sadness."], ["warm", "{other} stays with the haunted girl after school, and says exactly nothing, which is exactly right."]),
      B("gap", ["close", "You walk home together at dusk, quiet and a little lighter, with the same small smile."], ["far", "You each talk to a different side of the oddity and, by the end of the week, it has quietly dissolved."])
    ]),
    W("dragon-world", "The Dragon Ball world rewards the trainer: a tournament, a wish and a very large, very cheerful fight with someone who will, by dinner, become a friend.", [
      ["trainer", "{w} is up before dawn, doing push-ups with a very heavy rock and a very contented expression."],
      ["persist", "{w}, who has been knocked down fifteen times, and is, with a cheerful grin, standing up for the sixteenth."],
      ["daredevil", "{w} leaps into the enormous fight, laughing, and has, quite clearly, no plan."],
      ["caretaker", "{w} makes sure everyone eats, naps and has a clean towel, and then, quietly, joins the fight."],
      ["engineer", "{w} builds a very clever machine from scrap, and the whole team, startled, is airborne."]
    ], [
      B("pair", ["bold", "You enter the tournament with a mild grin. {A} and {B} are, by the semi-final, the loudest and most delighted pair in the arena."], ["steady", "You train in a quiet valley for a season. {A} and {B} are, by spring, strong, quiet and entirely unflappable."]),
      B("lead", ["driven", "{lead} announces the match, strikes a pose and, with a laugh, throws the first punch. The crowd, as one, cheers."], ["steady", "{lead} faces the enormous opponent with a calm, close-eyed smile, and the whole arena, for a moment, holds its breath."]),
      B("other", ["warm", "{other} shares a very large meal with the defeated rival, and the rival, by the end, is a friend."], ["inventive", "{other} builds a scouter, a ship and a very strange sandwich, and all three, to everyone's surprise, are useful."]),
      B("gap", ["close", "You finish the tournament on the same podium, laughing and covered in dust, with the same very large appetite."], ["far", "You each train a different way, and, in the final, are delighted to discover that it was the same fight."])
    ]),
    W("hawkins", "Hawkins rewards the loyal: a small town, a strange basement and a group of friends who are, by the end of every summer, much braver than the adults.", [
      ["bond", "{w} brings the whole group together for a very serious meeting in a very small basement."],
      ["puzzle", "{w} cracks the strange radio signal with a pencil, a walkie-talkie and an excellent guess."],
      ["protect", "{w} steps in front of the strange creature with a baseball bat and a very serious frown."],
      ["scared", "{w} is secretly terrified, and holding the whole party together with a nervous joke."],
      ["trusted", "{w}, whose word, in the whole, odd, long summer, nobody has doubted."]
    ], [
      B("pair", ["coop", "You gather in the basement with a map and some snacks. {A} and {B} spend the afternoon making a plan, and the evening, bravely, executing it."], ["cautious", "You study the odd lights for a week. {A} and {B} learn the schedule, the route and the very good hiding place."]),
      B("lead", ["steady", "{lead} faces the thing in the dark with a flashlight and a calm voice, and the whole group, quietly, steps forward."], ["nervy", "{lead} screams, drops the flashlight and, with great enthusiasm, finds the light switch."]),
      B("other", ["analytic", "{other} reads the notes, the tapes and the odd radio chatter and works out the whole thing from a single, small clue."], ["warm", "{other} sits with the frightened kid and, with a very small walkie-talkie, restores the whole night."]),
      B("gap", ["close", "You finish the summer on the same bikes, in the same quiet, with the same, startled pride."], ["far", "You each investigate a different side of the mystery, and, in the final scene, meet on the same road."])
    ]),
    W("vought", "Vought Tower rewards the cynic: a very bright brand, a very dark secret and the stubborn conviction that somebody has to read the contract.", [
      ["skeptic", "{w} reads the press release, raises an eyebrow and asks who really wrote it."],
      ["schemer", "{w} has already worked out which executive is lying, which hero is faking and which publicist is, secretly, on their side."],
      ["persist", "{w}, who has been gathering the same evidence for three years and is, finally, one folder from the truth."],
      ["tempted", "{w}, who has just been offered a very large cheque, a very nice office and a very small, very large compromise."],
      ["protect", "{w} steps between the reporter and the very large, very smiling hero, with a very small notebook."]
    ], [
      B("pair", ["guarded", "You enter the tower with a fake badge and a very long list. {A} and {B} are careful, quiet and, by noon, quite sure the walls have ears."], ["bold", "You walk in the front door and ask for a meeting. {A} and {B} are, briefly, shockingly, granted one."]),
      B("lead", ["driven", "{lead} walks into the board meeting and puts the folder on the table. The room, with a very small sound, goes quiet."], ["steady", "{lead} sits in the lobby for three hours, waiting, and when the door opens, says exactly four words."]),
      B("other", ["analytic", "{other} reads the contract, the memo and the very odd footnote and finds the one sentence that matters."], ["warm", "{other} sits with the frightened whistleblower and, with a very quiet word, gives them the nerve."]),
      B("gap", ["close", "You expose the scandal together and watch, from a very small café, the news roll in."], ["far", "You each leak a different half of the story, and the headline, delightfully, needs both."])
    ]),
    W("greendale", "Greendale rewards the committed: a community college, a study room and a very serious paintball tournament that is, in every possible way, a metaphor.", [
      ["clown", "{w} turns the study group into a sitcom, the sitcom into a heist and the heist into a very fine pizza."],
      ["plan", "{w} lays out the semester on a whiteboard, an index card and a very smug flow chart."],
      ["entrance", "{w} arrives at the first day of class in a costume that has nothing to do with the class and everything to do with the plan."],
      ["skeptic", "{w} says, flatly, that the school's policy is not a policy, the dean is not a dean and the pigeon is not a pigeon."],
      ["bond", "{w} befriends the whole table within a week and, by the final, a very strange, very devoted study group."]
    ], [
      B("pair", ["funny", "You join the study group for one class. {A} and {B} spend the semester in a western, a space opera and a very long argument about a sandwich."], ["planner", "You make a study schedule. {A} and {B} follow it for four days and then, joyfully, abandon it for a heist."]),
      B("lead", ["driven", "{lead} gives the pitch, takes the floor and, with a very slow grin, turns a very bad idea into a quite good one."], ["steady", "{lead} waits for the study group to finish arguing, says one sentence and, to the group's irritation, is right."]),
      B("other", ["warm", "{other} calls the exhausted friend, brings a sandwich and, with a very small speech, saves the exam."], ["funny", "{other} narrates the whole disaster so well that the dean, helplessly, passes the whole group."]),
      B("gap", ["close", "You graduate together, in a ridiculous hat, with a very strange, very real friendship."], ["far", "You each take a different route through the same semester and, at graduation, are very pleased to meet at the same table."])
    ])
  ]);
})(Forge);
