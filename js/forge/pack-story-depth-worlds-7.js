/* =========================================================================
   WORLD DEPTH 7 (data only): roles, survival lines, edge and trap for the last fourteen new worlds. Same shape as pack-story-depth-worlds-2.js.
   Original wording written for Forge.
   ========================================================================= */
(function(F){
  "use strict";
  if (!F.packs) return;
  const W = (id, roles, survive, edge, trap) => ({ id, roles, survive, edge, trap });
  const R = (lead, care, brain, wild) => ({ lead, care, brain, wild });

  F.packs.add("worldDepth", [
    W("good-place", R(["Neighbourhood speaker", "{n} makes a sincere, improvised speech to the whole street."], ["Casserole bringer", "{n} brings a dish to the grumpy neighbour and the street, a little, improves."], ["Philosophy chart-maker", "{n} lays out the moral point in four tidy bullet points."], ["Frozen-yogurt rebel", "{n} breaks a very small rule for a very good reason."]),
      ["{A} and {B} finish the day on the same porch with the same large yogurt and the quiet sense that this might be working.", "{A} and {B} each choose a different way to be good, and the neighbourhood, to its own surprise, needs both."],
      "kindness, humour and a willingness to keep trying", "over-thinking every choice, hiding the old self and keeping score"),
    W("winden", R(["Cave explorer", "{n} faces the strange door with a slow breath and opens it."], ["Grief sitter", "{n} sits with the grieving friend and holds a whole generation."], ["Family-tree mapper", "{n} draws the tree on the wall and finds the loop."], ["Time-wanderer", "{n} steps through and comes back different."]),
      ["{A} and {B} reach the answer in the same dim cave with a small, awful, necessary understanding.", "{A} and {B} follow different strands of the story and meet, in the middle, with a careful, sad nod."],
      "patience, rigour and shared grief", "secrets, going alone and believing it can be undone"),
    W("alexandria", R(["Gate commander", "{n} gives the order at the gate in a quiet voice."], ["Community host", "{n} runs the long dinner and reminds everyone why."], ["Supply analyst", "{n} finds the shortage and saves the winter."], ["Perimeter walker", "{n} walks the wall at dawn and returns with three useful details."]),
      ["{A} and {B} hold the wall through the long night and share a quiet cup at dawn.", "{A} and {B} take different sides of the wall and meet at dusk with the same exhausted nod."],
      "persistence, trust and a shared reason for the wall", "fear, suspicion and forgetting what the wall is for"),
    W("albuquerque", R(["Lead chemist", "{n} sets the plan, the formula and the price."], ["Partner's listener", "{n} hears the whole exhausted story over a very late meal."], ["Numbers reader", "{n} finds the entry that does not add up."], ["Risk-taking partner", "{n} agrees to the arrangement and regrets it by morning."]),
      ["{A} and {B} finish the job together, tired and quiet, with a small, uncomfortable certainty.", "{A} and {B} run different halves of the operation, and it works, which neither finds as comforting as it should."],
      "precision, patience and a talent for planning", "pride, small compromises that add up and mistaking a skill for a justification"),
    W("earth-invincible", R(["Front-line hero", "{n} dives into the fight and takes the first hit."], ["Bystander's friend", "{n} sits with the shaken witness and offers a blanket."], ["Pattern watcher", "{n} finds the flaw and ends the fight with one clean move."], ["Reckless flier", "{n} arrives late, loudly and just in time."]),
      ["{A} and {B} finish the patrol on the rooftop, bruised, grateful and quietly pleased.", "{A} and {B} take different threats across the same city and meet in the aftermath with the same weary smile."],
      "resilience, kindness and a willingness to clean up", "overconfidence, hiding hurt and the habit of going it alone"),
    W("wakanda", R(["Council chair", "{n} presides over the council and the very long silence."], ["Visitor's host", "{n} turns a delegation into a friendship."], ["Workshop designer", "{n} builds an elegant, quiet solution from a single material."], ["Border scout", "{n} watches the edge and returns with a quiet, useful report."]),
      ["{A} and {B} finish the project together, with the same quiet pride and the same small, startled laugh.", "{A} and {B} each lead a different half of the project, and the nation finds it needs both."],
      "invention, discipline and loyalty to a tradition", "secrecy, pride and mistaking isolation for safety"),
    W("xavier-school", R(["Head teacher", "{n} runs the lesson with a calm that is, in its way, a kind of power."], ["Dormitory counsellor", "{n} sits with the frightened student and makes it smaller."], ["Control instructor", "{n} teaches the power in careful, patient steps."], ["Curfew-breaking mentor", "{n} sneaks out with a grin and returns with a story."]),
      ["{A} and {B} finish the term and watch the students walk out, a little braver and a little more themselves.", "{A} and {B} teach very different classes, and the school finds it needs both."],
      "patience, empathy and a belief in people", "overprotection, idealism and ignoring the student who is quiet"),
    W("metropolis", R(["Editor-in-chief", "{n} faces the crisis with a calm, kind voice."], ["Newsroom friend", "{n} sits with the nervous witness and offers a coffee."], ["Fact checker", "{n} finds the discrepancy and breaks the story."], ["Rooftop observer", "{n} watches the skyline and returns with three sensible ideas."]),
      ["{A} and {B} finish the day on the same rooftop with the same coffee in a quiet contentment.", "{A} and {B} chase different stories and find, at the print deadline, that it is the same one."],
      "optimism, honesty and care for the ordinary", "naivety, doing it alone and believing everyone can be talked round"),
    W("themyscira", R(["Captain of the guard", "{n} gives the order in a calm voice and the guard moves as one."], ["Host of the shore", "{n} welcomes the stranger with a bed and a courteous bow."], ["Keeper of the old law", "{n} finds the forgotten clause and changes the council's mind."], ["Arena challenger", "{n} meets a friend in the arena with an enormous, delighted bow."]),
      ["{A} and {B} finish the season side by side, tired and proud, with the same quiet nod.", "{A} and {B} train in different traditions and meet in the arena with an enormous, delighted bow."],
      "discipline, courtesy and a quiet strength", "pride, rigidity and distrust of outsiders"),
    W("oa", R(["Sector commander", "{n} gives the order and leads with a bright, determined face."], ["Rookie mentor", "{n} gives the shaken rookie a small, steady courage."], ["Rulebook reader", "{n} finds the clause that applies."], ["Reckless ringbearer", "{n} dives into the fear-creature with a very bright idea."]),
      ["{A} and {B} finish the patrol together and share a quiet, bright moment, looking at the stars.", "{A} and {B} take different sectors and meet, at the last light, with an easy, tired nod."],
      "willpower, discipline and fearlessness", "stubbornness, rigid rules and mistaking confidence for judgement"),
    W("holy-grail-war", R(["Master of the war", "{n} gives the order and the summoned hero answers."], ["Shared-meal host", "{n} turns a war into a dinner for one evening."], ["Legend reader", "{n} studies the enemy's story and finds the weakness."], ["Reckless duellist", "{n} summons on a hunch and ends up in the middle of the first fight."]),
      ["{A} and {B} finish the war together in a very old church with the same small, honest question.", "{A} and {B} want different wishes, and the war waits, politely, to see which of them speaks first."],
      "strategy, nerve and an eye for the long game", "secrets, one-sided wishes and treating allies as temporary"),
    W("dokkaebi-scenarios", R(["Scenario reader", "{n} reads the next stage and says what is going to happen."], ["Companion of the frightened", "{n} sits with the stranger after the scenario and makes them a friend."], ["System analyst", "{n} finds the gap in the rules."], ["Loophole user", "{n} finds the one exploit and uses it with a delighted grin."]),
      ["{A} and {B} finish the last scenario together, tired and quiet, with the same slow, startled understanding.", "{A} and {B} play different parts of the same story and the author gives them both an ending."],
      "knowledge, adaptation and a talent for the loophole", "overconfidence in the script, hiding costs and going it alone"),
    W("republic-city", R(["Arena speaker", "{n} takes the microphone and rallies the crowd."], ["Noodle-stand confidant", "{n} sits with the shaken witness and the district relaxes."], ["Machine tinkerer", "{n} builds a clever noisy device and the city starts to hum."], ["Rooftop runner", "{n} runs across the rooftops and finds the hideout."]),
      ["{A} and {B} finish the day on the same tram, tired and cheerful, with the same noodle.", "{A} and {B} solve different parts of the case and meet at the arena with the same grin."],
      "initiative, improvisation and a love of the crowd", "showing off, ignoring the old ways and trusting a quick fix"),
    W("diagon-alley", R(["Shopping-day leader", "{n} walks into the strangest shop and asks for the most unusual thing."], ["Bench companion", "{n} shares the last, lumpy ice cream with a nervous newcomer."], ["Book finder", "{n} reads every spine and finds the one that has been waiting."], ["Hat tryer", "{n} tries on every hat on the street, and the street joins in."]),
      ["{A} and {B} finish the afternoon on the same bench with the same ice cream and a very large bag.", "{A} and {B} explore different sides of the street and meet at dusk with two bags, one owl and a very good story."],
      "curiosity, humour and an appetite for the strange", "overspending, wandering into the wrong alley and trusting a shop label")
  ]);
})(Forge);
