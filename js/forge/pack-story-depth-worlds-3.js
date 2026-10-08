/* =========================================================================
   WORLD DEPTH 3 (data only): roles, survival lines, edge and trap for thirteen more new worlds. Same shape as pack-story-depth-worlds-2.js.
   Original wording written for Forge.
   ========================================================================= */
(function(F){
  "use strict";
  if (!F.packs) return;
  const W = (id, roles, survive, edge, trap) => ({ id, roles, survive, edge, trap });
  const R = (lead, care, brain, wild) => ({ lead, care, brain, wild });

  F.packs.add("worldDepth", [
    W("arrakis", R(["Naib of the sietch", "{n} sets the water discipline, the pace and the course across the open sand."], ["Keeper of the cistern", "{n} counts every drop and shares them, fairly."], ["Reader of the dunes", "{n} knows the weather in the sand and the habits of the worm."], ["Desert runner", "{n} crosses the open dunes at night and returns with news."]),
      ["{A} and {B} walk without rhythm, share every drop and reach the sietch, thirsty and quite unstoppable.", "{A} and {B} argue over the route at midday, and spend the afternoon being, silently, sorry."],
      "patience, discipline and an honest respect for the desert", "impatience, wasted water and trusting a map over the sand"),
    W("roshar", R(["Oathbound captain", "{n} steps into the wind first and says the words, one by one."], ["Bridgeman's friend", "{n} tends the wounded and remembers every name."], ["Scholar of the storms", "{n} sketches the strange shapes and reads the sky."], ["Free-flying scout", "{n} takes the dangerous plateau and comes back with a map."]),
      ["{A} and {B} keep their oaths, carry each other's burdens and walk out of the high storm both a little changed.", "{A} and {B} each swear a different oath, and the storm, patiently, tests them against each other."],
      "perseverance, honour and a willingness to protect", "grief that hardens, carrying too much alone and mistaking pain for duty"),
    W("scadrial", R(["Crew boss", "{n} lays out the job, gives the signal and carries the nerve for everyone."], ["Crew confidant", "{n} reads every member's mood and keeps the team a team."], ["Planner of the job", "{n} knows the building, the guard rota and the very specific exit."], ["Rooftop thief", "{n} goes where nobody else can and brings back what nobody planned for."]),
      ["{A} and {B} pull off an elegant, perfectly timed job and are back at the hideout before the alarm has finished.", "{A} and {B} each rewrite the plan on the way in, and the job, entertainingly, works anyway."],
      "planning, trust in the crew and an eye for the loophole", "over-complicated plans, secrets within the crew and trusting a noble's smile"),
    W("randland", R(["Road leader", "{n} takes the front, picks the path and never quite admits to being tired."], ["Fireside companion", "{n} tells the story, tends the fire and brings the group back to the world."], ["Keeper of the prophecy", "{n} reads the old words and notices the translation error."], ["Wandering rogue", "{n} talks the innkeeper into a bed and the guard into a map."]),
      ["{A} and {B} cross the whole country, argue all the way and arrive at the great city together and quietly changed.", "{A} and {B} take different roads at a fork and meet, a month later, each certain the other was lost."],
      "endurance, fellowship and a stubborn kind of hope", "pride, secrets and walking alone when the road is long"),
    W("ankh-morpork", R(["Guild master", "{n} chairs the meeting, takes the contract and runs the room."], ["Neighbourhood fixer", "{n} knows every shop, every street and every very small favour."], ["Cynical clerk", "{n} reads every contract and finds the loophole."], ["Quick-witted rogue", "{n} talks anyone into anything, usually with a pie."]),
      ["{A} and {B} run a very successful, slightly dubious business, and are quite popular with the watch.", "{A} and {B} each run a scheme in the same alley, and meet, surprised, in the middle."],
      "wit, scepticism and a good sense of the loophole", "greed, a clever scheme that outsmarts itself and trusting a promise from a guild"),
    W("earthsea", R(["Captain of the small boat", "{n} sits at the prow, watches the wind and steers the voyage."], ["Keeper of the island home", "{n} tends the garden, the hearth and the stranger at the door."], ["Reader of names", "{n} knows the true word for the wave."], ["Wandering sailor", "{n} sails to the next island on a hunch and returns with a very good story."]),
      ["{A} and {B} sail from island to island, learn four true names and keep the peace, mostly by saying nothing.", "{A} and {B} each say the wrong word at the wrong time, and the sea, with some humour, forgives."],
      "patience, humility and restraint", "pride, shortcuts and using a name you do not understand"),
    W("monster-hunter", R(["Hunt leader", "{n} reads the beast, calls the plan and takes the first position."], ["Camp cook", "{n} feeds the team and tends the scorched and bruised."], ["Field researcher", "{n} studies the creature's habits and finds the weakness."], ["Trap-maker", "{n} builds the clever thing from three bits of rope."]),
      ["{A} and {B} study the creature, set the trap and finish the hunt in time for a very good dinner.", "{A} and {B} chase the beast into the open without a plan, and spend the night, ruefully, patching each other up."],
      "preparation, teamwork and respect for the creature", "overconfidence, impatience and chasing a beast into its own ground"),
    W("warhammer", R(["Company commander", "{n} gives the order in a single, level word and the company moves."], ["Battlefield chaplain", "{n} keeps faith with the troops, and keeps the troops, a little, with faith."], ["Tactical cogitator", "{n} calculates the odds and files the form."], ["Zealous trooper", "{n} charges the line, shouting a very long prayer."]),
      ["{A} and {B} hold the line through the long campaign, grim, quiet and, strangely, proud.", "{A} and {B} each follow a different doctrine and, in the middle of the war, have a very polite, very serious argument."],
      "faith, discipline and the grim humour of the long war", "despair, hardened hearts and following an order blindly"),
    W("destiny", R(["Fireteam captain", "{n} calls the play, takes the lead and keeps the countdown honest."], ["Revive buddy", "{n} is the one who always comes back for you."], ["Loadout theorycrafter", "{n} knows the build, the buff and the boss."], ["Jump-first guardian", "{n} drops off the highest ledge and lands, somehow, on the objective."]),
      ["{A} and {B} clear the raid in a single, tidy evening, and are quite insufferable about it.", "{A} and {B} each queue for a different activity, and meet, via a very long chat, on the same planet."],
      "teamwork, humour and shared practice", "greed for loot, going solo and blaming the lag"),
    W("halo", R(["Squad leader", "{n} gives short orders and takes the point."], ["Combat medic", "{n} tends the wounded and keeps morale a notch above sensible."], ["Recon analyst", "{n} reads the radar and finds the gap in the line."], ["Assault trooper", "{n} drops in first and is already in the middle of it."]),
      ["{A} and {B} cover each other's angles, call the targets and finish the mission quiet and a little proud.", "{A} and {B} each deviate from the plan and, a bit later, have a short conversation on the radio."],
      "discipline, trust in your squad and a calm voice", "going off-plan, ignoring the radio and wasting the cover"),
    W("deep-space-station", R(["Station commander", "{n} chairs the talks and steers the room, politely."], ["Host of the promenade", "{n} welcomes every guest and makes the bar the most useful place on the station."], ["Treaty analyst", "{n} reads the clause that the rest of the room is skipping."], ["Roving envoy", "{n} wanders the corridors and hears everything first."]),
      ["{A} and {B} broker a quiet peace and finish the day with a very small, very warm celebration.", "{A} and {B} each negotiate a different side and arrive at the signing, surprised, with perfectly compatible terms."],
      "diplomacy, patience and attention to detail", "stubbornness, secrets and over-reading one clause"),
    W("clone-wars", R(["General", "{n} takes the point, gives the order and leads the charge."], ["Squad's friend", "{n} runs the supply lines, the medical tent and the morale."], ["Battle strategist", "{n} reads the map, finds the flank and changes the plan."], ["Ace pilot", "{n} flies through the blockade and humming."]),
      ["{A} and {B} win the campaign, lose very few and share a quiet moment on the ship's roof.", "{A} and {B} each take a different approach on the same planet, and the war, in the end, has two heroes."],
      "loyalty, initiative and quick thinking", "pride, over-reach and breaking rules for the wrong reason"),
    W("imperial-era", R(["Ship captain", "{n} flies the ship and makes the deal, with confidence."], ["Crew mechanic", "{n} keeps the old ship alive with duct tape and affection."], ["Slicer", "{n} cracks the code and reroutes the power."], ["Fast talker", "{n} charms the checkpoint and wins the day."]),
      ["{A} and {B} deliver the cargo, split the credits and are on the next planet before the checkpoint has noticed.", "{A} and {B} each run a different con on the same checkpoint and, quite by accident, run into each other at the exit."],
      "nerve, charm and a very quick getaway", "overconfidence, owing the wrong person and trusting a handshake")
  ]);
})(Forge);
