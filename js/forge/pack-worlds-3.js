/* =========================================================================
   WORLDS PACK 3 (data only): four more places, added with the characters who live there. Same shape as pack-worlds-2.js.
   ========================================================================= */
(function(F){
  "use strict";
  if (!F.packs) return;
  const U = (id, name, franchise, scope, attrs, needs, blurb, why) => ({ id, name, franchise, scope, attrs, needs, blurb, why });

  F.packs.add("universes", [
    U("holy-grail-war", "The Holy Grail War (Fate)", "Fate", "world", [5, 2, 5, 2, 4, 4, 3, 3, 4], { persist: 1, initiative: 0.8, autonomy: 0.7, analysis: 0.7, boldness: 0.7, compete: 0.6, trust: -0.4 }, "A secret tournament of summoned heroes and the magicians who command them, where every alliance has an expiry date and a wish.", "It rewards {loves}. {strategist} would plan around every Servant and {push} would refuse to stay behind."),
    U("dokkaebi-scenarios", "The Scenarios (Omniscient Reader's Viewpoint)", "Omniscient Reader's Viewpoint", "world", [5, 3, 5, 2, 4, 5, 3, 3, 5], { analysis: 1, flex: 0.9, persist: 0.8, trust: 0.5, boldness: 0.6, autonomy: 0.4, optimism: -0.3 }, "A world that turns into a story with rules, stages and an audience, where knowing the plot is only the beginning.", "It rewards {loves}. {solver} would read the next stage before it opens and {wildcard} would break it anyway."),
    U("republic-city", "Republic City (The Legend of Korra)", "Avatar: The Last Airbender", "world", [3, 4, 3, 4, 4, 4, 4, 3, 2], { initiative: 0.8, flex: 0.8, boldness: 0.7, trust: 0.6, humor: 0.5, warmth: 0.5 }, "A modern, crowded city of benders and engineers, where a sporting arena is as important as a council chamber.", "It rewards {loves}. {leader} would speak to the crowd and {inventor} would build what the crowd needed."),
    U("diagon-alley", "Diagon Alley and Beyond (Harry Potter)", "Harry Potter", "world", [2, 4, 2, 4, 4, 4, 2, 4, 1], { explore: 0.9, humor: 0.6, warmth: 0.6, flex: 0.7, trust: 0.5, optimism: 0.6 }, "A crooked shopping street of wands, owls and sweets, and a wizarding world full of everyday magic and its terrible bureaucracy.", "It rewards {loves}. {scout} would find the shop nobody told you about and {comic} would try on the hat.")
  ]);
})(Forge);
