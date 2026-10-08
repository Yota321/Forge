/* =========================================================================
   WORLD DEPTH 6 (data only): roles, survival lines, edge and trap for thirteen more new worlds. Same shape as pack-story-depth-worlds-2.js.
   Original wording written for Forge.
   ========================================================================= */
(function(F){
  "use strict";
  if (!F.packs) return;
  const W = (id, roles, survive, edge, trap) => ({ id, roles, survive, edge, trap });
  const R = (lead, care, brain, wild) => ({ lead, care, brain, wild });

  F.packs.add("worldDepth", [
    W("ostania", R(["Family head of the cover", "{n} runs the household like an operation and the operation like a household."], ["The one who notices the child", "{n} sees what is wrong and quietly fixes it with a pancake."], ["Cover-story architect", "{n} has a cover, a back-up and a back-up for the back-up."], ["Improviser at the door", "{n} bluffs the inspector with a perfectly believable pie."]),
      ["{A} and {B} keep a perfect cover, share a quiet dinner and realise it is no longer entirely a cover.", "{A} and {B} each follow a different script at the same tea party, and the neighbour, charmed, takes both."],
      "flexibility, discretion and care beneath the cover", "secrets that become habits, ignoring the person behind the role and over-planning"),
    W("shimokitazawa", R(["Band leader", "{n} counts the band in and takes the first chord."], ["Crowd host", "{n} introduces every member of the band to every member of the crowd."], ["Sound engineer", "{n} rewires the amp and saves the night."], ["Songwriter", "{n} writes a bridge on a napkin at the soundcheck."]),
      ["{A} and {B} play the set, hearts racing, and share a small cup of tea at the back of the room.", "{A} and {B} play in different styles in the same song, and the crowd hears it as one odd, wonderful thing."],
      "persistence, creativity and trust in the band", "stage fright, perfectionism and forgetting to rest"),
    W("rear-palace", R(["Court physician", "{n} presides over the inquiry with a very slow hand."], ["Palace confidante", "{n} sits with the frightened maid and hears the whole story."], ["Poison detective", "{n} tastes the tea and declares it, firmly, not what it was labelled."], ["Garden wanderer", "{n} knows every courtyard and every very small rumour."]),
      ["{A} and {B} solve the case over a pot of tea and agree that the real poison was gossip.", "{A} and {B} solve different halves of the mystery, and the court, delighted, has a very good week."],
      "observation, patience and a good nose for the odd", "curiosity about the wrong cup, pride and trusting a courtier"),
    W("leiden", R(["Head of the postal house", "{n} takes the client, the commission and the long, quiet breath."], ["Client's listener", "{n} listens to a whole life in an hour."], ["Word-finder", "{n} finds the one sentence that fits."], ["Travelling correspondent", "{n} carries the letter to the far port and hears the reply."]),
      ["{A} and {B} deliver the letter together, and the reply, a week later, is only a single word.", "{A} and {B} write different versions of the same letter, and the client, after a long evening, chooses a third."],
      "listening, patience and a feeling for words", "perfectionism, over-writing and hiding behind politeness"),
    W("dungeon", R(["Party leader", "{n} leads the way through the next chamber, ladle first and plan second."], ["Party cook", "{n} makes sure everyone has a full bowl and a clean blanket."], ["Monster ecologist", "{n} knows which creature is edible and which is, politely, not."], ["Floor scout", "{n} maps the next level and finds the safe room."]),
      ["{A} and {B} finish the dungeon dinner together, full, content and looking forward to the next floor.", "{A} and {B} cook different dishes from the same monster, and the party, delighted, declines to choose."],
      "curiosity, improvisation and appetite", "reckless tasting, ignoring the map and forgetting why you came"),
    W("morioh", R(["Duelist", "{n} takes the front line, holds a dramatic pose and calls the plan out loud."], ["Quiet protector", "{n} steps in front of the stranger with a faint, serious look."], ["Power analyst", "{n} works out the enemy's rule and the weak point."], ["Pun-making rogue", "{n} makes a joke at the right moment and the enemy drops their guard."]),
      ["{A} and {B} win the duel on the same beat, strike the same pose and share a small, dramatic nod.", "{A} and {B} fight different opponents and defeat them with the same, very odd move."],
      "inventiveness, nerve and a talent for the dramatic", "showing off, underestimating an odd power and arguing about the pose"),
    W("no-mans-land", R(["Wandering peacemaker", "{n} walks toward the gunmen with empty hands and an unhurried voice."], ["Doughnut sharer", "{n} sits with the weary kid and shares the last, squashed one."], ["Poster reader", "{n} works out where the gang will be at dusk."], ["Lucky bystander", "{n} stumbles into the middle of the gang and, by sheer accident, ends the standoff."]),
      ["{A} and {B} leave the town together, dusty and pleased, with the sunset in front of them.", "{A} and {B} handle different halves of the standoff, and it works, in the strangest and kindest way."],
      "optimism, patience and a talent for disarming people", "carrying every burden alone, naivety and refusing to fight at all costs"),
    W("britannia", R(["Masked leader", "{n} announces the plan in a quiet, level voice."], ["Comrade of the cause", "{n} holds the shaken team together with a quiet word."], ["Chess-board strategist", "{n} reads the general's habits and finds the one move."], ["Rebel pilot", "{n} dives into the fight and does not look down."]),
      ["{A} and {B} win the campaign together and, in the quiet of the evening, say nothing and mean everything.", "{A} and {B} play opposite sides of the same plan, and the opponents cannot decide whom to fear."],
      "planning, nerve and the courage to take responsibility", "secrecy, treating allies as pieces and hiding the cost"),
    W("naoetsu", R(["Bench conversationalist", "{n} speaks to the spirit in a low, patient voice."], ["Haunted-friend sitter", "{n} stays with the haunted classmate after school."], ["Rumour reader", "{n} lays out the rumour and finds the small sadness in the middle."], ["Pun-wielding visitor", "{n} gives the spirit a pun so awful it concedes."]),
      ["{A} and {B} walk home at dusk, quiet and a little lighter, with the same small smile.", "{A} and {B} talk to different sides of the oddity, and it quietly dissolves."],
      "talk, patience and a gentle sort of curiosity", "overthinking, wordplay as an escape and avoiding the real feeling"),
    W("dragon-world", R(["Tournament fighter", "{n} strikes a pose and throws the first punch."], ["Meal-maker", "{n} makes sure everyone eats, naps and has a clean towel."], ["Inventor of scouters", "{n} builds the gadget that saves the day."], ["Training maniac", "{n} does push-ups with a very heavy rock and a very contented face."]),
      ["{A} and {B} finish the tournament on the same podium, laughing and covered in dust.", "{A} and {B} train in different ways, and in the final are delighted to discover it was the same fight."],
      "perseverance, optimism and a love of a good opponent", "overconfidence, ignoring the people at home and fighting before thinking"),
    W("hawkins", R(["Basement meeting chair", "{n} brings the group together for a very serious meeting."], ["Friend with a walkie-talkie", "{n} sits with the frightened kid and restores the whole night."], ["Signal cracker", "{n} works out the radio signal from a single small clue."], ["Bike-riding scout", "{n} cycles down the dark road and finds the answer."]),
      ["{A} and {B} finish the summer on the same bikes, in the same quiet, with the same startled pride.", "{A} and {B} investigate different sides of the mystery, and meet on the same road."],
      "loyalty, curiosity and nerve with a flashlight", "secrets from the adults, splitting up and underestimating the thing in the dark"),
    W("vought", R(["Whistleblower in chief", "{n} puts the folder on the board room table."], ["Source's confidant", "{n} gives the frightened whistleblower the nerve."], ["Contract reader", "{n} finds the one sentence that matters."], ["Undercover visitor", "{n} walks in with a fake badge and a long list."]),
      ["{A} and {B} expose the scandal together and watch the news roll in from a very small café.", "{A} and {B} leak different halves of the story, and the headline, delightfully, needs both."],
      "scepticism, persistence and a talent for the right document", "cynicism, going alone and trusting a very nice office"),
    W("greendale", R(["Study-group pitchman", "{n} takes the floor and turns a bad idea into a good one."], ["Sandwich bringer", "{n} calls the exhausted friend and saves the exam."], ["Whiteboard planner", "{n} lays out the semester on a very smug flow chart."], ["Costume enthusiast", "{n} arrives in a costume and, quite accidentally, solves the problem."]),
      ["{A} and {B} graduate together, in a ridiculous hat, with a strange, real friendship.", "{A} and {B} take different routes through the same semester and meet at the same table at graduation."],
      "humour, loyalty and a willingness to commit to the bit", "cynicism, avoiding sincerity and making everything a bit")
  ]);
})(Forge);
