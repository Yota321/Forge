/* =========================================================================
   STORY DEPTH (data only). The vocabulary js/forge/story-depth.js uses to grow the Characters, Worlds, Teams and Situations chapters of the
   Compare article into small features, and the sentences that carry the reader from one chapter into the next.
   Registered as story pack "depth" (read with Forge.packs.byId("story", "depth").data).

     outsider    one adjective per facet and direction: how people watching from outside would describe a pair
     duoKind     per lens, per kind of character pair (alike / complementary / contrasting): what kind of duo they become. Tokens {x} {y}
     worldFrames how a world's advantage and challenge are phrased. Tokens {edge} {trap} {label} {Label} {owner} {phrase} {weakline}
     teamLead    leading and following inside a team
     teamVerdict how effective a team would be, by level 1 (a stretch) to 5 (a natural fit)
     bridges     one or two sentences that lead from one chapter into the next. A variant is only used when every token it names is known.
   Original wording written for Forge.
   ========================================================================= */
(function(F){
  "use strict";
  if (!F.packs) return;
  F.packs.add("story", [{ id: "depth", data: {

    outsider: {
      explore:     { hi: "curious", lo: "settled" },
      invent:      { hi: "inventive", lo: "practical" },
      analysis:    { hi: "analytical", lo: "instinctive" },
      structure:   { hi: "organised", lo: "spontaneous" },
      initiative:  { hi: "driven", lo: "easygoing" },
      persist:     { hi: "relentless", lo: "quick to move on" },
      warmth:      { hi: "warm", lo: "reserved" },
      social:      { hi: "sociable", lo: "private" },
      humor:       { hi: "funny", lo: "serious" },
      autonomy:    { hi: "independent", lo: "team-minded" },
      steadiness:  { hi: "unshakeable", lo: "sensitive" },
      flex:        { hi: "adaptable", lo: "particular" },
      boldness:    { hi: "fearless", lo: "careful" },
      trust:       { hi: "trusting", lo: "guarded" },
      compete:     { hi: "competitive", lo: "relaxed about winning" },
      patience:    { hi: "patient", lo: "impatient" },
      optimism:    { hi: "hopeful", lo: "realistic" }
    },
    outsiderFrames: [
      "From the outside, {names} look {a}, {b} and, when it matters, {c}.",
      "Anyone watching the two of you would say {a} and {b}, with a streak of {c}.",
      "People who see the two of you together tend to use the same words: {a}, {b}, and a little {c}.",
      "Seen from across the room, you come across as {a} and {b}, and now and then {c}."
    ],
    outsiderContrast: [
      "Look closer and {h} is the {ha} one, while {l} is the {la} one.",
      "Up close the difference shows: {h} is {ha}, {l} is {la}.",
      "It is only when they look properly that they notice {h} is {ha} and {l} is {la}."
    ],

    duoKind: {
      friendship: {
        alike:         ["{x} and {y} would be the friends who finish each other's plans, and each other's mistakes.", "A pair this alike gets very little wrong together, and very little corrected. It is a friendship that feels like home."],
        complementary: ["{x} and {y} cover for each other. What one forgets, the other remembers, and neither keeps score.", "The friend group would call them the split-the-work pair: different strengths, one shared sense of direction."],
        contrasting:   ["{x} and {y} are the friends people still talk about: opposite in almost every way, and somehow always in the same room.", "A friendship built on arguing well. It would never be dull, and seldom be quiet."]
      },
      romance: {
        alike:         ["{x} and {y} would recognise each other at once, which is a comfort and, occasionally, a trap.", "Two people who would never have to explain themselves, and who would need to take care not to stop growing."],
        complementary: ["{x} and {y} would feel like two halves of a plan: each steadier for the other, and each a little braver.", "Their closeness would come from the places they differ, which is the most durable kind."],
        contrasting:   ["{x} and {y} would be the kind of couple whose friends place bets: an odd match that, when it works, works louder than most.", "A love story with real friction in it, and the chemistry that comes from friction handled well."]
      },
      companionship: {
        alike:         ["{x} and {y} would make the easiest kind of housemates: same pace, same standards, very little negotiation.", "Day to day they would barely notice each other's habits, because those habits are their own."],
        complementary: ["{x} and {y} would be a well-run household: one covers what the other forgets, and the rota mostly takes care of itself.", "Different strengths, same expectations: a pairing that makes ordinary days easier."],
        contrasting:   ["{x} and {y} would keep each other on their toes: opposite routines, same fridge, and a lot to learn.", "An everyday pair that needs a few house rules and then flourishes inside them."]
      }
    },

    worldFrames: {
      advantage: [
        "It rewards {edge}. Your strongest card is {label}: {owner}.",
        "The world pays for {edge}, and {label} is where the two of you shine: {owner}.",
        "{Label} is your advantage here, because it rewards {edge}. {owner}."
      ],
      challenge: [
        "It punishes {trap}. Your weak spot is {label}: {weakline}.",
        "Watch for {trap}: {weakline}.",
        "The risk is {trap}. {Label} is the gap, because {weakline}."
      ]
    },

    teamLead: {
      shared: ["Neither of you needs the title, so the lead would pass to whoever the day suits.", "There would be no fixed captain: the two of you would hand the lead back and forth without a speech.", "The lead would move between you, which suits a team that does not want a boss."],
      lead: ["{lead} would take the lead, because {lead} is the one who moves first when nobody has decided.", "{lead} ends up in front, not by asking but by already walking.", "{lead} would be the one the team looks to when it is time to pick a direction."],
      followKeen: ["{other} follows willingly and keeps one eye on how everyone is feeling.", "{other} backs the plan and keeps the mood level while it is carried out.", "{other} is happy to follow, and is the first to notice when someone else is struggling to keep up."],
      followAsk:  ["{other} follows only as long as the plan makes sense, and says so when it does not.", "{other} will follow a good plan, and will question one that is not, out loud.", "{other} goes along with the lead as long as the reasons are good ones."],
      followEasy: ["{other} backs the plan, fills the gaps and rarely needs to be asked twice.", "{other} takes the supporting part without fuss, and does it well.", "{other} is content to follow, and quietly makes the plan better as it goes."]
    },

    teamVerdict: {
      5: ["On paper this is close to a perfect fit. The team would run itself, and the two of you would barely have to talk about it.", "A very strong match: the two of you would not just fit this team, you would improve it.", "This is the kind of team that sounds like it was written with the two of you in mind."],
      4: ["A strong fit with a little polishing: the roles are clear and the chemistry is there.", "This would work well, and for mostly the right reasons.", "Not flawless, but close: you would be a good addition and a reliable pair."],
      3: ["A workable fit. It holds together as long as the two of you keep the roles clear.", "Decent chemistry, and it would depend on who else was in the room.", "It would function, with the occasional awkward silence and a few clear conversations."],
      2: ["A stretch. It could work, with effort and a bit of luck.", "Possible, with a lot of explaining along the way.", "You would have to want it, but a team can be built around wanting it."],
      1: ["Not a natural fit. It would be entertaining, mostly for the people watching.", "This is the team you would join for the story, not the results.", "A long shot: the sort of team you remember, rather than the sort that wins."]
    },
    teamLevel: { 5: "Natural fit", 4: "Strong fit", 3: "Workable fit", 2: "A stretch", 1: "For the story" },

    bridges: {
      worlds: [
        "{x} and {y} would not look out of place in {w}: it rewards {need}, and {strong} has plenty of it.",
        "Take that pairing out of the story and put the two of you in {w}, and the same instincts turn up. {Need} counts most there, and {strong} brings the most of it.",
        "That kind of pair has a natural home, and for the two of you it is {w}, a world that pays for {need}.",
        "The characters would find their feet in {w}, and so would you."
      ],
      teams: [
        "Step out of {w} and into a crew: {t} is the team closest to how the two of you actually work.",
        "If the two of you had to join a team after {w}, {t} would be the one that fits both of you.",
        "{W} is the setting. For a crew, {t} comes closest to how you really operate.",
        "From a world to a team: {t} comes closest."
      ],
      situations: [
        "A world and a team are the big picture. These are the small, specific days, and you will see the same pattern in each.",
        "As {t}, this is how the two of you handle the situations that actually come up.",
        "Now bring it down to earth. The same two people, put in {n} ordinary and extraordinary situations.",
        "Big settings are easy to imagine. These are the specific days where the pattern shows."
      ],
      ending: [
        "Out of {n} situations you would thrive in {g} and wobble in {r}. That spread is why the number reads {score}%.",
        "{g} of {n} situations go well and {r} are rough, which is what a {score}% pairing looks like in practice.",
        "Put the situations side by side and the score makes sense: {g} that you would enjoy, {r} that would test you, and a {score}% that honestly reflects both."
      ]
    }
  }}]);
})(Forge);
