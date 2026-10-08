/* =========================================================================
   WORLD DEPTH 5 (data only): roles, survival lines, edge and trap for thirteen more new worlds. Same shape as pack-story-depth-worlds-2.js.
   Original wording written for Forge.
   ========================================================================= */
(function(F){
  "use strict";
  if (!F.packs) return;
  const W = (id, roles, survive, edge, trap) => ({ id, roles, survive, edge, trap });
  const R = (lead, care, brain, wild) => ({ lead, care, brain, wild });

  F.packs.add("worldDepth", [
    W("teyvat", R(["Traveller-in-chief", "{n} opens the next map and says 'Up'."], ["Festival cook", "{n} feeds the party, befriends the baker and makes the quest, briefly, a picnic."], ["Mechanism reader", "{n} plays the correct note on the ancient device."], ["Wind-gliding scout", "{n} finds the hidden chest and the best dessert."]),
      ["{A} and {B} explore the whole region, share every festival and return home with too many recipes and a very good map.", "{A} and {B} follow separate quests across three nations and trade the stories over a very small candle."],
      "curiosity, warmth and a love of a good detour", "wandering without a goal, overpacking and forgetting the main quest"),
    W("fodlan", R(["Class leader", "{n} takes the field, the plan and the awkward silence."], ["Student confidant", "{n} sits with the quiet student in the garden."], ["Battle tactician", "{n} reads the enemy's formation and finds the gap."], ["Schemer-professor", "{n} plans the exam three steps ahead and enjoys it."]),
      ["{A} and {B} teach a good term, win the field exam and watch the class walk into a large, clear future.", "{A} and {B} each teach a different house, and meet, on the last night, with a very similar sort of pride."],
      "teaching, strategy and care for the people under you", "ideology, favouritism and tactics that forget the people"),
    W("midgar", R(["Rebel front-liner", "{n} takes the sword and the first, doubtful step."], ["Heart of the party", "{n} keeps the group together with a laugh."], ["Plan reader", "{n} reads the map and finds the hidden route."], ["Slum scout", "{n} knows every alley and every very odd shortcut."]),
      ["{A} and {B} pull off the mission, ride the train out and share a very small, tired smile.", "{A} and {B} take separate jobs on the same night and meet, by accident, in the same alley."],
      "courage, loyalty and a gift for the unexpected ally", "doubt, guilt and trying to be the hero alone"),
    W("courtroom", R(["Defence attorney", "{n} rises, buttons the jacket and puts the one question that matters."], ["Client's friend", "{n} stays with the nervous defendant between sessions."], ["Evidence reader", "{n} finds the contradiction in a twenty-minute testimony."], ["Bluffing assistant", "{n} improvises a very good reason."]),
      ["{A} and {B} win the case, share a noodle bowl in the hallway and have, quietly, a very good day.", "{A} and {B} each argue half the case, and the judge declares it a delightful, if irregular, draw."],
      "persistence, wit and an eye for a contradiction", "bluffing without a backup, arrogance and ignoring the client"),
    W("kamurocho", R(["Street legend", "{n} walks into the club and the room, to a person, goes quiet."], ["Neighbourhood regular", "{n} knows the noodle chef, the bouncer and the cat."], ["Back-alley informant", "{n} knows who knows, and charges a very fair price."], ["Karaoke champion", "{n} turns a standoff into a duet."]),
      ["{A} and {B} fix the problem, share a very good noodle and are, at midnight, the toast of the street.", "{A} and {B} each fix a different problem on the same street and meet, battered and delighted, at the same stall."],
      "sincerity, loyalty and a talent for improvisation", "pride, taking the punch alone and underestimating the street"),
    W("underworld", R(["Escaping prince", "{n} charges down the staircase shouting a very polite challenge."], ["Family dinner diplomat", "{n} gives every relative a very honest compliment."], ["Pattern watcher", "{n} learns the monsters and the traps and the very good meal at the end."], ["Leaping runner", "{n} grabs the shiny thing and lands, with a flourish, on the wrong side."]),
      ["{A} and {B} reach the surface together, blinking in daylight and laughing, a little startled.", "{A} and {B} find different ways out, and meet, to their delight, at exactly the same spot."],
      "persistence, charm and good humour about death", "overconfidence, running from the family and refusing to learn the pattern"),
    W("arcadia-bay", R(["Reluctant leader", "{n} listens to the long awkward silence and says the true thing."], ["Keeper of the friend", "{n} stays with the grieving friend all weekend."], ["Photo detective", "{n} lays the pictures on the floor and finds the pattern."], ["After-hours rebel", "{n} sneaks into the school with a grin and a reason."]),
      ["{A} and {B} watch the storm together, close and quite sure of one thing.", "{A} and {B} make different choices at the lighthouse, and the town holds its breath."],
      "honesty, empathy and noticing small things", "avoidance, secrets and trying to fix a choice by redoing it"),
    W("occult-tokyo", R(["Haunted-tunnel opener", "{n} shouts a challenge to the whole supernatural world."], ["Lunch-box protector", "{n} steps between the ghost and the friend with a scowl."], ["Curse reader", "{n} reads the symbol and snaps into understanding."], ["Shrieking runner", "{n} screams, runs and trips, and breaks the curse."]),
      ["{A} and {B} leave the tunnel giggling, shaken and with a very good new friend.", "{A} and {B} each take a different side of the haunting, and the ghost, entertained, lets them both stay."],
      "flexibility, humour and a lack of fear", "plunging in without a plan, assuming the ghost is hostile and forgetting a snack"),
    W("fiore", R(["Guild fighter", "{n} charges the enemy with a cheerful shout."], ["Guild host", "{n} tends the wounded and starts the feast."], ["Spell reader", "{n} reads the enemy's spell and finds the counter."], ["Brawl starter", "{n} begins a fight at breakfast and ends it at dinner."]),
      ["{A} and {B} finish the job in the same breath and celebrate at the same large table.", "{A} and {B} take separate jobs in the same town and end in the same, happy brawl."],
      "loyalty, warmth and a willingness to get involved", "property damage, brawling first and ignoring the quest board"),
    W("clover-kingdom", R(["Squad captain", "{n} announces the goal and takes the first swing."], ["Squad cook", "{n} brings a very good stew and a bad joke and lifts the whole squad."], ["Magic reader", "{n} reads the enemy's magic and spots the flaw."], ["Underdog sprinter", "{n} trains at dawn and shouts a promise."]),
      ["{A} and {B} pass the exam together and celebrate with a very loud shout.", "{A} and {B} train in different styles and, at the exam, meet in the middle, pleased and surprised."],
      "effort, optimism and loyalty to the squad", "stubbornness, ignoring the plan and refusing to ask for help"),
    W("kabuki-district", R(["Odd-jobs boss", "{n} faces the strongest opponent with a lazy half-smile."], ["Quiet bill-payer", "{n} pays the tab, calms the crowd and returns the lost cat."], ["Fine-print reader", "{n} finds the clause that changes the whole job."], ["Rent-dodging rogue", "{n} refuses to pay on principle."]),
      ["{A} and {B} finish the day on the same couch with the same large dessert, in a ridiculous silence.", "{A} and {B} take separate jobs on the same street and end in the same fight."],
      "humour, friendship and a talent for last-minute heroism", "laziness, overspending and leaving the real job to the last second"),
    W("tokyo-3", R(["Operations commander", "{n} gives the order in a clipped, calm voice."], ["Breakfast keeper", "{n} makes breakfast for the quiet pilot and waits."], ["Readout analyst", "{n} finds the weak point in the data."], ["Reluctant pilot", "{n} takes the shot with a small hand on the controls."]),
      ["{A} and {B} finish the mission and sit in the same quiet, with the same small, unspoken thanks.", "{A} and {B} handle different parts of the fight and meet, in the aftermath, with a very careful nod."],
      "steadiness, honesty and willingness to share a burden", "silence, secrecy and hiding feelings under procedure"),
    W("seasoning-city", R(["Office boss", "{n} pitches the package with a very smooth smile."], ["Ghost listener", "{n} sits with the sad spirit and listens."], ["Haunting historian", "{n} finds the small sad thing that started it."], ["Quiet powerhouse", "{n} offers the ghost a drink, calmly."]),
      ["{A} and {B} end the haunting, share a snack and are, by dusk, entirely at home.", "{A} and {B} handle different cases on the same street and meet, tired and happy, at the same corner shop."],
      "kindness, calm and a good sense of proportion", "bottling feelings, overselling and avoiding the real conversation")
  ]);
})(Forge);
