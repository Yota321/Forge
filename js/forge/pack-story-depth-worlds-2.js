/* =========================================================================
   WORLD DEPTH 2 (data only): the roles, survival lines, edge and trap for the first thirteen new worlds, same shape as
   pack-story-depth-worlds.js:  W(id, R(lead, care, brain, wild), [strong survive, thin survive], edge, trap).
   Each role is [title, sentence starting with {n}]. Original wording written for Forge.
   ========================================================================= */
(function(F){
  "use strict";
  if (!F.packs) return;
  const W = (id, roles, survive, edge, trap) => ({ id, roles, survive, edge, trap });
  const R = (lead, care, brain, wild) => ({ lead, care, brain, wild });

  F.packs.add("worldDepth", [
    W("tamriel", R(["Guild champion", "{n} takes the big quest, signs the right ledger and somehow always ends up with a title."], ["Innkeeper's friend", "{n} is on first-name terms with every cook, bard and stable-hand in the province."], ["Scholar of the ruins", "{n} reads the old inscriptions and knows which cave has what."], ["Wandering thief", "{n} slips away at dawn and returns with a sack, a rumour and an unexplained pet."]),
      ["{A} and {B} chase every marker on the map, collect a ridiculous amount of loot and return, eventually, to a very full house.", "{A} and {B} follow every distraction and arrive, at last, back where they started, with a wagon of cheese and no main quest."],
      "curiosity and the willingness to be distracted", "wandering off, overloading the pack and taking the quest nobody asked for"),
    W("runeterra", R(["Champion", "{n} takes the banner, picks the fight and does not wait for permission."], ["City warden", "{n} holds the district together when the champions have gone."], ["Strategist-advisor", "{n} knows every treaty, grudge and trade route by heart."], ["Rogue contender", "{n} answers to no banner and keeps getting hired by all of them."]),
      ["{A} and {B} rise to the top of rival factions, learn to respect each other and manage to win without destroying the city.", "{A} and {B} pick opposite sides of an old feud, and by the third season it is difficult to remember which of them started it."],
      "ambition, loyalty to a banner and a talent for rivalry", "pride, grudges and refusing to back down first"),
    W("lands-between", R(["Tarnished champion", "{n} walks into the arena first, learns the pattern and is, eventually, standing."], ["Bonfire keeper", "{n} tends the flame and the party, and gives the others a place to come back to."], ["Lore-reader", "{n} pieces together the broken story from fragments and the odd dream."], ["Wandering knight", "{n} goes where the road does not, and is often right about the shortcut."]),
      ["{A} and {B} take it slowly, learn every boss in order and reach the great tree with a satisfying number of attempts behind them.", "{A} and {B} rush the second castle and meet, repeatedly, the same very large knight, until one of them has the patience to try a different approach."],
      "patience, persistence and respect for how big the world is", "rushing, overconfidence and ignoring the thing that looks too good to be true"),
    W("yharnam", R(["Veteran hunter", "{n} walks first, with a steady pace and a slow, grim kind of competence."], ["Safe-room keeper", "{n} tends the lamp, mends the gear and gently ensures nobody forgets to eat."], ["Note-taker", "{n} records every clue, every sound and every very specific door."], ["Reckless hunter", "{n} goes into the dark and returns with something unsettling, and an excellent description of it."]),
      ["{A} and {B} count every vial, stay together and walk out into the morning looking a little older and a lot more patient.", "{A} and {B} split up at the cathedral, and spend the rest of the night, separately, regretting it."],
      "calm hands, honest fear and the discipline to retreat", "curiosity at the wrong door, hoarding and going alone"),
    W("silent-hill", R(["Leading visitor", "{n} walks in front and does not stop for the fog."], ["Comforting presence", "{n} keeps talking in a low, steady voice, and everyone feels a little less alone."], ["Sceptical observer", "{n} refuses to be impressed, and thus sees most of what is actually there."], ["Wanderer in the fog", "{n} walks into the strange room because somebody has to."]),
      ["{A} and {B} stay close, say what they see and leave the town in the same car, quiet and unusually honest.", "{A} and {B} lose each other in the fog, and each is quite convinced the other was the one who left."],
      "steady nerves, honesty and company", "denial, going alone and refusing to say what you see"),
    W("raccoon-city", R(["Point person", "{n} takes the front, counts the exits and calls the retreat before it is needed."], ["Field medic", "{n} carries the first-aid kit, notices the limp and does not leave anyone on the street."], ["Mapper-decoder", "{n} reads the signs, the schedules and the old manuals, and finds the way out."], ["Street runner", "{n} sprints to the next corner, finds the car and comes back for the rest."]),
      ["{A} and {B} count the ammunition together, share the map and reach the edge of the city with the story intact.", "{A} and {B} take separate streets at the worst junction and spend the night shouting through a locked gate."],
      "calm hands, shared supplies and the nerve to go back for someone", "panic, hoarding and wandering off alone"),
    W("shire", R(["Village organiser", "{n} runs the supper, the cart and the cousin list with quiet, cheerful authority."], ["Keeper of the kettle", "{n} puts the tea on before anyone asks and remembers every birthday."], ["Garden planner", "{n} knows exactly when to sow, when to wait and what the weather will do."], ["Cheerful troublemaker", "{n} borrows a pie, starts a song and gets away with all of it."]),
      ["{A} and {B} spend a long, golden summer in the garden, win a ribbon at the fair and never once mention the road.", "{A} and {B} talk about leaving, then do not, and then wonder, years later, what the road would have been like."],
      "warmth, patience and small, steady kindnesses", "comfort that turns into inertia, and ignoring a distant problem until it arrives"),
    W("rivendell", R(["Council speaker", "{n} lays out the argument and gets the room to listen."], ["Host of the house", "{n} makes the guest feel safe and the long meeting feel short."], ["Lore-keeper", "{n} knows the old map, the old song and the old warning."], ["Wandering envoy", "{n} brings news from the road and goes back out into it."]),
      ["{A} and {B} bring the council a clear answer, a quiet plan and a reasonable number of cups of tea.", "{A} and {B} spend three days debating a single clause and, to their astonishment, find it was the most important one."],
      "patience, scholarship and the humility to listen", "over-deliberating and waiting for certainty that never comes"),
    W("gondor", R(["Captain of the wall", "{n} takes the post, holds the line and says very little."], ["Healer of the houses", "{n} tends the wounded, steadies the frightened and refuses to rest."], ["Master of the archives", "{n} knows the old battles and the right moment to remember them."], ["Rider of the dawn", "{n} rides out when the plan calls for someone to be brave."]),
      ["{A} and {B} hold the line, trust each other and see the sunrise from the same wall.", "{A} and {B} each take a different gate, and hold both, but only just."],
      "endurance, duty and refusing to give way", "pride, despair and doing it all alone"),
    W("moria", R(["Guide through the dark", "{n} knows the road and walks it without hurrying."], ["Companion at the back", "{n} watches the rear, steadies the stragglers and keeps count."], ["Reader of the runes", "{n} reads the dwarf-marks and the old warnings."], ["Quiet scout", "{n} feels for the draught and finds the stairs that are not there."]),
      ["{A} and {B} walk through the dark in silence, trust each other's pace and step out into daylight, blinking.", "{A} and {B} take a wrong turning in the great hall, and discover, loudly, why nobody goes there."],
      "quiet feet, trust and a steady head", "noise, temptation and splitting the group"),
    W("forgotten-realms", R(["Party leader", "{n} announces the plan, takes the front and asks the dice for a little mercy."], ["Camp healer", "{n} patches up the party, cooks the meal and keeps the spirits up."], ["Spellcaster-scholar", "{n} reads the rune, finds the loophole and explains too much."], ["Roguish wildcard", "{n} picks the lock, steals the key and finds the better door."]),
      ["{A} and {B} complete the quest, share the loot and have, by general agreement, a very good table.", "{A} and {B} each play a different game at the same table, and the game master quietly takes up cartography."],
      "flexibility, humour and a willingness to roll with the result", "arguing over the plan, splitting the party and hoarding the best loot"),
    W("persona-tokyo", R(["Class representative", "{n} takes on the festival, the schedule and the group chat."], ["Club confidant", "{n} remembers everyone's worries and has a snack for each."], ["Study-group captain", "{n} brings the notes, the highlighters and a calm voice at exam time."], ["Rooftop wanderer", "{n} turns up with a good idea and a bad excuse."]),
      ["{A} and {B} pass the year with good friends, solid grades and a standing table at the café.", "{A} and {B} each take on too many clubs, and discover, at the festival, that neither of them has slept."],
      "friendship, routine and a willingness to be present", "over-scheduling, avoiding awkward conversations and hiding what is wrong"),
    W("persona-palaces", R(["Thief leader", "{n} gives the signal, takes the door and leads the escape."], ["Support at the hideout", "{n} keeps the crew fed, calm and ready for the next run."], ["Navigator-planner", "{n} reads the layout, the guard rota and the exit, and relays them in a calm voice."], ["Infiltrator", "{n} slips in through the vent and comes back with the one clue nobody planned for."]),
      ["{A} and {B} pull off a tidy, stylish heist and are back at the hideout before the alarm has finished ringing.", "{A} and {B} each follow a different plan, set off the same alarm and have a very clear conversation on the roof."],
      "boldness, trust and a flexible plan", "ego, secrecy and ignoring the quiet voice on the comms")
  ]);
})(Forge);
