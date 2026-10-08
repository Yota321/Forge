/* =========================================================================
   WORLD DEPTH 4 (data only): roles, survival lines, edge and trap for thirteen more new worlds. Same shape as pack-story-depth-worlds-2.js.
   Original wording written for Forge.
   ========================================================================= */
(function(F){
  "use strict";
  if (!F.packs) return;
  const W = (id, roles, survive, edge, trap) => ({ id, roles, survive, edge, trap });
  const R = (lead, care, brain, wild) => ({ lead, care, brain, wild });

  F.packs.add("worldDepth", [
    W("old-republic", R(["Party captain", "{n} takes the call from the Council and makes the decision anyway."], ["Ship's host", "{n} runs the galley, the lounge and the very late-night conversation."], ["Ancient-text translator", "{n} finds the mistake in the prophecy and fixes the plan."], ["Roguish pilot", "{n} flies the ship through the one gap nobody noticed."]),
      ["{A} and {B} take the long way, collect a crew, and make a strong case for a better galaxy, and a better kitchen.", "{A} and {B} each follow a different side of the Force, and the ship's table, with great patience, adds a chair for the argument."],
      "diplomacy, curiosity and a loyal crew", "ideology, divided loyalties and trusting a quick answer"),
    W("rapture", R(["Dive leader", "{n} walks down the corridor first and does not look up at the architecture."], ["Radio companion", "{n} keeps the group's morale a notch above sensible."], ["Audio-diary reader", "{n} pieces together the story of a very bad idea."], ["Scavenging explorer", "{n} finds the one useful object in a very strange room."]),
      ["{A} and {B} read every diary, avoid every very shiny bottle and walk back up, damp but unharmed.", "{A} and {B} each pick a favourite ideology, and the corridor, with a groan, begins to flood."],
      "scepticism, a steady head and attention to detail", "curiosity about the shiny thing, believing the speech and splitting up"),
    W("columbia", R(["Fair-goer in charge", "{n} takes the rail, steps onto the sky and leads the chase."], ["Companion of the girl", "{n} stays close, says the kind thing and quietly protects."], ["Pamphlet reader", "{n} spots the seam in the sky and the clause in the flag."], ["Skyline runner", "{n} swings off the balcony and lands on the right one."]),
      ["{A} and {B} take the parade, the church and the chase in stride and leave the floating city a little more honest.", "{A} and {B} pick opposite sides of the very polite war, and spend the descent comparing notes."],
      "improvisation, kindness and quick eyes", "believing the smile, carrying someone else's guilt and ignoring the seam"),
    W("oldest-house", R(["Acting director", "{n} reads the shifting memo and rules on it, with a straight face."], ["Staff wellbeing officer", "{n} brings the coffee that is, for once, the right shape."], ["Floorplan analyst", "{n} maps the changing corridors and finds the one fixed door."], ["Field agent", "{n} goes through the wall that was not there and comes back with a file."]),
      ["{A} and {B} adapt, file the report and are, by lunchtime, on first-name terms with the furniture.", "{A} and {B} each follow a different version of the building, and the coffee machine, politely, takes sides."],
      "adaptability, calm and a sense of humour about it", "rigid expectations, panic and assuming the building is consistent"),
    W("death-stranding", R(["Route planner", "{n} reads the terrain and sets the pace for the whole crossing."], ["Waystation host", "{n} leaves a gift at every stop and a little more warmth on the road."], ["Weather watcher", "{n} reads the clouds, the ground and the next hour."], ["Ridge walker", "{n} climbs the peak that was not on the plan and finds a better way."]),
      ["{A} and {B} carry the load, find the rhythm and deliver the parcel, quietly, into a grateful city.", "{A} and {B} take separate paths at the pass, and both arrive, soaking, to find the parcel has taken a third route."],
      "patience, planning and a willingness to carry for others", "pride, travelling alone and underestimating the weather"),
    W("outer-wilds", R(["Mission pilot", "{n} launches first and asks the questions in flight."], ["Campfire storyteller", "{n} keeps morale up with a marshmallow and a story."], ["Ruin decoder", "{n} reads the alien writing and notes the pattern."], ["Spontaneous scout", "{n} lands on the small, odd planet and finds the secret."]),
      ["{A} and {B} share notes, solve the loop and watch the sun go out with a very happy, very small smile.", "{A} and {B} each chase a different mystery, and discover, at the last minute, that they were the same."],
      "curiosity, systematic thinking and a willingness to try again", "overconfidence, ignoring the clock and forgetting to share notes"),
    W("no-mans-sky", R(["Expedition captain", "{n} picks a heading by the glow on the horizon and trusts the landing gear."], ["Base host", "{n} builds the home, stocks the larder and hangs the little lamp."], ["Survey scientist", "{n} catalogues every plant and gives it a very good name."], ["Free-roaming explorer", "{n} lands on the empty moon and spends a week there, content."]),
      ["{A} and {B} build a cosy base, name every plant and fly, together, into a very large and gentle sky.", "{A} and {B} each settle a different planet and spend a pleasant evening on a call, describing each other's skies."],
      "curiosity, creativity and a love of naming things", "hoarding, drifting and losing the ship"),
    W("revachol", R(["Lead investigator", "{n} opens the interrogation with a joke and ends it with a thesis."], ["Witness whisperer", "{n} listens until the story, quietly, tells itself."], ["Evidence reader", "{n} puts the boot, the shirt and the wall in a very uncomfortable order."], ["Hunch follower", "{n} wanders off to a bar and returns with the case."]),
      ["{A} and {B} close the case, share a quiet drink and agree it was solved well enough.", "{A} and {B} each solve a different case, and the answers, uncomfortably, fit."],
      "wit, curiosity and a good ear for a contradiction", "self-sabotage, a drink at the wrong moment and ignoring the practical"),
    W("hyrule", R(["Hero of the day", "{n} walks up to the big gate and tries the handle."], ["Village friend", "{n} cooks, mends and keeps the whole party well-fed."], ["Puzzle solver", "{n} reads the statue and plays the three notes."], ["Shrine hopper", "{n} climbs, glides and finds the secret behind the wall."]),
      ["{A} and {B} open the shrines in order, find the sword and wander happily into the castle.", "{A} and {B} each solve half the temple and, to their surprise, the halves fit."],
      "curiosity, courage and an eye for the puzzle", "impatience, assuming the obvious door and spreading too thin"),
    W("hallownest", R(["Nail-bearer", "{n} walks into the arena and begins, quietly, to count."], ["Bench companion", "{n} sits with the lonely bug and shares a small, warm light."], ["Map-keeper", "{n} learns every corner by heart."], ["Quiet wanderer", "{n} slips down the cracked tunnel and returns with a secret."]),
      ["{A} and {B} learn the kingdom room by room, and reach the last door, tired and quietly at peace.", "{A} and {B} each take a separate descent and, at the bottom, find the same strange, quiet room."],
      "patience, persistence and a respect for the quiet", "frustration, rushing and ignoring the pattern"),
    W("stardew-valley", R(["Valley organiser", "{n} runs the festival, the stall and the calendar."], ["Neighbour's friend", "{n} knows everyone's favourite gift and remembers each birthday."], ["Planner of the plot", "{n} charts the whole year on a very tidy calendar."], ["Cheerful tinkerer", "{n} builds an unusual contraption and the whole farm, strangely, loves it."]),
      ["{A} and {B} have a gentle, golden year with a good harvest and a table at every festival.", "{A} and {B} each take on three too many projects, and are, at the end of summer, extremely well-rested by choice."],
      "patience, kindness and showing up daily", "over-scheduling, doing it all alone and ignoring the festival"),
    W("lordran", R(["Knight of the bonfire", "{n} faces the great knight with a calm, unhurried patience."], ["Fire keeper", "{n} tends the flame and shares a very small, very welcome kindness."], ["Pattern watcher", "{n} watches the boss twice and writes down every move."], ["Reckless hollow", "{n} charges the gate, learns a lesson and tries again."]),
      ["{A} and {B} light the last bonfire together and sit, side by side, in a warm, exhausted silence.", "{A} and {B} reach the same fire by different roads, and spend the evening comparing scars."],
      "persistence, humour and a refusal to be discouraged", "rage, impatience and refusing to ask for a summon"),
    W("ashina", R(["Master swordsman", "{n} bows, steps in and finishes the duel in a single, startled breath."], ["Castle tea-keeper", "{n} shares a cup with the wounded guard and the war, for an evening, feels smaller."], ["Rhythm reader", "{n} watches the old master's pattern and finds the gap."], ["Rooftop shinobi", "{n} slips across the wall and returns with a plan and a bow."]),
      ["{A} and {B} learn the old master's rhythm, win the duel and stand together on a snowy roof at dawn.", "{A} and {B} each serve a different master for a season, and meet at the last gate, with a bow."],
      "timing, discipline and respect for an opponent", "rage, rushing and refusing to learn the pattern")
  ]);
})(Forge);
