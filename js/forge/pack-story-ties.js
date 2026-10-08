/* =========================================================================
   WORLD TIES, reserve (data only). A world question is a "dead heat" when the two people score alike. The original eight tie lines (pack-story-worlds.js,
   id "tie") are used first and never twice in one article; when two people are alike, a single article can hold more than eight dead heats, so these
   are used next, in the same order of choice. Same tokens as the originals: {A} and {B}. Original wording written for Forge.
   ========================================================================= */
(function(F){
  "use strict";
  if (!F.packs) return;
  F.packs.add("story", [
    { id: "tieMore", data: [
      "Dead level, and {A} and {B} both know it.",
      "If there were a prize here, {A} and {B} would be sharing it and arguing over the engraving.",
      "No contest. {A} and {B} would simply arrive at the same answer by different roads.",
      "This one is a draw, and a friendly one: {A} and {B} would call it even and move on.",
      "Ask {A} and ask {B}, and you would get two confident answers that happen to match.",
      "There is no gap worth mentioning between {A} and {B} on this one.",
      "Neither wins it. {A} and {B} would just nod at each other across the table.",
      "On this one {A} and {B} are so close that a coin toss would be the most honest judge.",
      "A photo finish, with {A} and {B} still comparing notes at the line.",
      "{A} and {B} meet exactly in the middle here, and neither is surprised.",
      "Call it a tie: each of you would do it well, and each would assume the other was better.",
      "It would not matter which of you went first, and {A} and {B} both suspect as much.",
      "A shared strength, in other words, and one that {A} and {B} would never think to mention.",
      "Even on points, and even on style: {A} and {B} would call it a team effort.",
      "There is not a hair between you here, which suits {A} and {B} perfectly well.",
      "If anyone asked who would handle it better, {A} and {B} would say the other one, and mean it."
    ] }
  ]);
})(typeof Forge !== "undefined" ? Forge : (globalThis.Forge = globalThis.Forge || {}));
if (typeof module !== "undefined" && module.exports) module.exports = Forge;
