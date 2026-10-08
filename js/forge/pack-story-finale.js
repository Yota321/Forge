/* =========================================================================
   THE LAST PAGE (data only): the narrator's closing of a Compare article. js/forge/story-depth.js (S.depth.finale) assembles two to four
   paragraphs from the pair's own report: the score in words, the strongest and weakest area, how they talk and how they disagree, their
   fictional twins, the world and team they met, and the theme that kept returning. Nothing here is a fixed ending: every line is a frame with
   slots, and which frames are used depends on the pair.
   Slots: {A} {B} names, {x} {y} the characters they resemble, {Score} / {score} the score in words, {strong} / {weak} the strongest and weakest
   area, {theme} the trait that runs through the pair, {Talk} / {talk} how they talk, {Fight} / {fight} how they disagree, {world} {team} the
   world and team they met, {cast} who plays which part in that world. A frame is skipped when a slot it needs is empty.
   Original wording written for Forge.
   ========================================================================= */
(function(F){
  "use strict";
  if (!F.packs) return;
  F.packs.add("story", [
    { id: "finale", data: {
      title: "If this were a story…",
      /* the opening paragraph: the score, what carries the pair, where it asks for effort */
      openers: {
        veryHigh: [
          "If {A} and {B} existed inside the same universe, people would assume they had known each other forever. The first page put them at {score}, and the number was not exaggerating: {strong} is where they already move as one, and {weak} is the only place that asks for any effort.",
          "Some pairings read like a sentence that was already half written. {A} and {B} sit at {score}, what carries them is {strong}, and {weak} is the single margin note in an otherwise easy book.",
          "There is a version of this story where nothing needs explaining, and {A} and {B} are closer to it than most. {Score} was the number on the first page, {strong} is the reason, and {weak} is where they will have to be a little more deliberate.",
          "Their strengths overlap just enough to build trust, and their differences stop it from going stale. {Score} was the number at the top; {strong} explains it, and {weak} keeps it honest."
        ],
        high: [
          "This is a story that mostly works. {Score} was the number on the first page, and the chapters behind it explain why: {strong} holds {A} and {B} up, while {weak} is where they will have to meet each other halfway.",
          "{A} and {B} do not need luck, only attention. At {score}, the pairing leans on {strong} and quietly asks for more care around {weak}.",
          "Good pairings are rarely the loudest ones. {Score} on the first page, {strong} doing the lifting, {weak} asking to be noticed: {A} and {B} have most of what a long story needs.",
          "They will not always agree, but they usually end up walking in the same direction. {Score} was the headline; {strong} is the story, and {weak} is the subplot worth watching."
        ],
        medium: [
          "This pairing is not effortless, and it never pretended to be. {Score} was honest about that: {strong} gives {A} and {B} somewhere solid to stand, and {weak} is where they will have to learn to translate.",
          "It asks for translation more often than intuition. {A} and {B} landed at {score}; {strong} is the shared ground, and {weak} is the long conversation still to come.",
          "Not every story is told in the same language by both narrators. {A} and {B} sit at {score}, with {strong} on the good pages and {weak} on the ones that need rereading.",
          "The first page said {score}, which is neither a promise nor a warning. What matters is {strong}, which works, and {weak}, which will only work if {A} and {B} choose to work on it."
        ],
        low: [
          "Some people challenge each other more than they comfort each other. {Score} was the number, and {A} and {B} will feel it most around {weak}, though {strong} is the quiet reason this was ever worth reading.",
          "This pairing may never feel naturally easy. At {score}, {weak} is where it grinds and {strong} is the thread that keeps it from being a story about nothing.",
          "The first page said {score}, and it was not being unkind. {A} and {B} pull against each other around {weak}; what holds is {strong}, which is more than most hard pairings can say.",
          "Easy is not the same as meaningful. {Score} tells you the road is uphill, {strong} tells you why {A} and {B} might climb it anyway, and {weak} is where they will need the most patience."
        ]
      },
      /* the second paragraph: how they talk and how they disagree ({Talk} and {Fight} are full clauses built from the two people's own traits) */
      middles: [
        "Remember the Talking chapter: {talk}. And when they disagree, {fight}.",
        "Their conversations tell most of it: {talk}. Their arguments tell the rest: {fight}.",
        "On an ordinary day, {talk}. On a bad one, {fight}.",
        "It shows in how they speak, since {talk}, and in how they clash, since {fight}.",
        "{Talk}, which is why the Talking chapter reads the way it does. In a disagreement, {fight}."
      ],
      /* the middle paragraph when only one half is known */
      talkOnly: [
        "Remember the Talking chapter: {talk}.",
        "It starts with how they speak, since {talk}."
      ],
      fightOnly: [
        "The Conflict chapter said it plainly: {fight}.",
        "It shows most when they clash, since {fight}."
      ],
      /* the third paragraph: the characters, the world and the team */
      casts: [
        "Drop them into {world} and they sort themselves out at once: {cast}. On {team} the same pair finds its places again, and {x} and {y}, who they resemble, would watch it happen with a knowing look.",
        "The Characters chapter gave them {x} and {y}, and the Worlds chapter gave them {world}, where {cast}. None of it was chosen at random: {theme} runs through every one of those pages.",
        "In {world}, {cast}. On {team}, the roles shift but the pair does not, and {x} and {y} would recognise the arrangement from the other side of the page.",
        "If a story were written about them, {world} would be the setting, and there {cast}; {x} and {y} would be the characters readers compared them to."
      ],
      castsNoWorld: [
        "The Characters chapter gave them {x} and {y}, and {team} gave them somewhere to stand. Different stories, the same two people, and {theme} showing up in every one of them.",
        "{x} and {y}, the characters they most resemble, would have found a place for {A} and {B} on {team} without being asked."
      ],
      castsNoTeam: [
        "The Characters chapter gave them {x} and {y}, and the Worlds chapter gave them {world}, where {cast}. Different pages, the same pair, and {theme} in every one of them."
      ],
      castsBare: [
        "Their fictional twins, {x} and {y}, would find all of this familiar, and would say so."
      ],
      /* the last paragraph: the thread that kept returning, then the last sentence */
      reflections: [
        "If one word kept returning, it was {theme}.",
        "Read the chapters again and {theme} is the thread that does not break.",
        "{Theme} is the quiet subject of almost every page.",
        "Whatever else changes between the first chapter and the last, {theme} stays."
      ],
      endings: {
        veryHigh: [
          "Their best stories are still the ones they have not lived yet.",
          "Nobody would call it luck, because both of them keep choosing it.",
          "Somewhere past the last page, {A} and {B} are already starting the next chapter.",
          "It is the kind of story people read twice, once for the plot and once for the two of them.",
          "The book closes, but not on them: that part carries on without a narrator."
        ],
        high: [
          "It is a good story, and the good news is that {A} and {B} are still the ones writing it.",
          "They will get things wrong, and then they will get the next chapter right, which is how most good books are made.",
          "This is the kind of pairing that does not need a dramatic ending, only a few more ordinary Tuesdays.",
          "The last page is blank on purpose, and both of them are holding a pen.",
          "Close the book here and it is already a story worth telling; leave it open and it gets better."
        ],
        medium: [
          "Slow down enough to understand why the other acts as they do, and this turns out to be a much stronger story than the first page suggested.",
          "Nothing here is decided. The pages that matter have not been written yet, and {A} and {B} hold the pen.",
          "It is the sort of story that rewards the reader who stays for the second half.",
          "The best chapter is usually the one after the argument, and this pair has plenty of those still to come.",
          "Neither of them is the villain, which makes the rest of the book a question of patience."
        ],
        low: [
          "Sometimes the people who teach us the most are the ones who make us see the world differently, and that is not a small thing to be to someone.",
          "Not every story needs to be easy to be worth the telling.",
          "If this one has a lesson, it is that being hard to understand is not the same as being impossible to know.",
          "Some books are not comfortable and are still the ones we remember; this might be one of them.",
          "It may never be the easiest story either of them tells, but it could be the one that changes how they tell the rest."
        ]
      }
    } }
  ]);
})(typeof Forge !== "undefined" ? Forge : (globalThis.Forge = globalThis.Forge || {}));
if (typeof module !== "undefined" && module.exports) module.exports = Forge;
