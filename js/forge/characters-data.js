/* =========================================================================
   FORGE CHARACTER DATA - structured, curated personality attributes.

   NOT free text. Every entry is a set of numbers and enumerated keys that the
   character engine (characters.js) reads:
     traits   facet -> RAW -10..+10, ONLY for the facets that define the
              character (unlisted facets are "not defining", never zero)
     styles   one key per behavioural area (taxonomies live in characters.js)
     values / motivations   enumerated keys
   sourceType is "curated": written for Forge from public knowledge of the
   works, original observations only, no text copied from any source.

   The 25 characters already in engine.js's MEDIA_CHARACTERS keep their
   role/energy lines from there (joined by name); the entries in EXTRA add
   their own. Both are joined to the attributes below by id (slug of name).
   ========================================================================= */
(function(F){
  "use strict";
  const t = s => { const o = {}; s.split(/\s+/).forEach(p => { const i = p.indexOf(":"); if (i > 0) o[p.slice(0, i)] = Number(p.slice(i + 1)); }); return o; };
  const L = s => s.split(/\s+/).filter(Boolean);
  // [traits, {decision, learning, communication, leadership, conflict, stress, work, group}, values, motivations]
  const D = {};
  const add = (id, traits, st, values, motivations) => { D[id] = { traits: t(traits), styles: st, values: L(values), motivations: L(motivations) }; };
  const S = (decision, learning, communication, leadership, conflict, stress, work, group) => ({ decision, learning, communication, leadership, conflict, stress, work, group });

  add("l", "analysis:9 autonomy:8 explore:6 invent:4 social:-7 warmth:-4 trust:-6 steadiness:5 structure:3 compete:6",
    S("analytical", "specialist", "reserved", "lone", "strategic", "steady", "independent", "specialist"), "truth justice", "mastery justice");
  add("hermione-granger", "structure:8 persist:8 analysis:7 explore:6 warmth:5 initiative:5 trust:4 compete:4 patience:3 social:2",
    S("analytical", "systematic", "direct", "architect", "confront", "overthink", "executor", "strategist"), "knowledge loyalty justice", "duty mastery");
  add("tony-stark", "invent:9 boldness:7 humor:7 initiative:7 autonomy:6 flex:6 compete:6 social:5 analysis:5 patience:-4 steadiness:-2 trust:-2",
    S("gambler", "experimental", "playful", "driver", "confront", "accelerate", "independent", "catalyst"), "creativity achievement", "mastery duty");
  add("geralt-of-rivia", "steadiness:6 persist:6 autonomy:7 social:-5 boldness:4 patience:4 flex:4 analysis:3 humor:3 trust:-2 initiative:2",
    S("principled", "experimental", "reserved", "reluctant", "withdraw", "steady", "independent", "anchor"), "honor loyalty family", "duty freedom");
  add("michael-scott", "social:9 humor:8 optimism:7 warmth:5 initiative:4 trust:4 boldness:3 flex:3 autonomy:-4 structure:-5 analysis:-6 patience:-2 steadiness:-3",
    S("instinctive", "social", "playful", "driver", "avoid", "people", "collaborative", "catalyst"), "community family", "connection");
  add("katniss-everdeen", "persist:8 autonomy:6 flex:5 boldness:5 initiative:5 steadiness:4 warmth:4 social:-3 optimism:-3 trust:-2 analysis:2",
    S("instinctive", "experimental", "reserved", "reluctant", "withdraw", "steady", "adaptor", "anchor"), "family freedom", "connection freedom");
  add("light-yagami", "analysis:8 structure:7 compete:7 persist:6 autonomy:6 initiative:6 boldness:5 steadiness:3 warmth:-6 trust:-7 humor:-2",
    S("analytical", "systematic", "commanding", "architect", "strategic", "overthink", "strategist", "strategist"), "justice achievement", "justice mastery");
  add("frodo-baggins", "persist:9 patience:5 warmth:5 trust:4 steadiness:3 structure:2 initiative:-2 boldness:-2 optimism:1",
    S("principled", "social", "warm", "reluctant", "avoid", "inward", "executor", "anchor"), "loyalty humility courage", "duty");
  add("sherlock-holmes", "analysis:9 explore:8 autonomy:8 persist:6 invent:5 compete:5 boldness:4 steadiness:3 social:-5 warmth:-4 trust:-3 patience:-2",
    S("analytical", "specialist", "direct", "lone", "strategic", "inward", "independent", "specialist"), "truth knowledge", "curiosity mastery");
  add("aang", "optimism:8 flex:8 warmth:7 humor:6 trust:6 explore:6 social:5 patience:3 persist:3 compete:-5 structure:-4",
    S("consulting", "experimental", "warm", "servant", "mediate", "people", "adaptor", "glue"), "kindness community freedom", "connection justice");
  add("tyrion-lannister", "analysis:7 humor:7 social:5 flex:5 autonomy:3 steadiness:3 warmth:3 compete:2 patience:2 optimism:-3",
    S("analytical", "explorer", "playful", "architect", "strategic", "overthink", "strategist", "strategist"), "knowledge loyalty", "mastery connection");
  add("naruto-uzumaki", "persist:9 optimism:8 social:7 initiative:7 warmth:6 trust:6 boldness:6 humor:5 compete:4 flex:4 analysis:-3 structure:-4",
    S("instinctive", "experimental", "playful", "driver", "confront", "accelerate", "collaborative", "catalyst"), "loyalty community courage", "connection mastery");
  add("elizabeth-bennet", "autonomy:6 humor:6 analysis:4 social:4 warmth:4 boldness:4 steadiness:3 initiative:3 compete:2 patience:2 trust:-1",
    S("principled", "social", "playful", "lone", "confront", "steady", "independent", "challenger"), "honor family truth", "freedom connection");
  add("rick-sanchez", "analysis:9 invent:8 autonomy:8 boldness:8 explore:7 humor:6 flex:5 compete:5 warmth:-5 trust:-6 patience:-7 optimism:-7 structure:-6",
    S("gambler", "explorer", "direct", "lone", "confront", "inward", "independent", "challenger"), "knowledge freedom", "curiosity freedom");
  add("mikasa-ackerman", "persist:9 steadiness:6 structure:5 warmth:5 boldness:5 initiative:4 social:-4 trust:3 humor:-3",
    S("principled", "specialist", "reserved", "servant", "confront", "steady", "executor", "anchor"), "loyalty family", "connection duty");
  add("deadpool", "humor:9 boldness:8 flex:8 social:6 initiative:5 autonomy:5 optimism:3 compete:3 steadiness:-2 patience:-5 analysis:-4 structure:-7",
    S("gambler", "experimental", "playful", "lone", "confront", "accelerate", "adaptor", "catalyst"), "freedom loyalty", "freedom connection");
  add("aragorn", "persist:7 steadiness:6 initiative:6 warmth:5 patience:5 structure:5 boldness:4 trust:4 social:3 autonomy:2",
    S("principled", "experimental", "commanding", "reluctant", "mediate", "steady", "executor", "anchor"), "honor loyalty courage", "duty");
  add("velma-dinkley", "analysis:8 explore:7 structure:5 persist:5 steadiness:4 initiative:2 warmth:2 trust:2 boldness:-1",
    S("analytical", "systematic", "direct", "architect", "strategic", "overthink", "strategist", "specialist"), "truth knowledge", "curiosity");
  add("kratos", "persist:8 structure:6 boldness:6 steadiness:4 initiative:4 autonomy:4 compete:4 warmth:3 social:-5 humor:-5 optimism:-4",
    S("principled", "specialist", "reserved", "reluctant", "confront", "inward", "executor", "anchor"), "family honor humility", "duty connection");
  add("amelie-poulain", "warmth:8 invent:7 explore:6 optimism:6 autonomy:4 patience:4 flex:4 humor:3 initiative:3 trust:3 social:-3",
    S("instinctive", "explorer", "warm", "servant", "avoid", "inward", "independent", "glue"), "kindness creativity", "connection curiosity");
  add("walter-white", "compete:8 analysis:7 persist:7 autonomy:7 boldness:6 initiative:6 structure:5 flex:3 steadiness:2 warmth:-4 trust:-5 optimism:-5",
    S("analytical", "specialist", "commanding", "driver", "strategic", "accelerate", "strategist", "strategist"), "achievement family", "mastery freedom");
  add("luna-lovegood", "explore:8 flex:7 optimism:6 steadiness:6 autonomy:6 invent:6 warmth:5 trust:5 humor:3 structure:-6 compete:-6 analysis:-3",
    S("instinctive", "explorer", "warm", "servant", "mediate", "steady", "adaptor", "scout"), "truth kindness loyalty", "curiosity connection");
  add("levi-ackerman", "structure:8 persist:7 steadiness:6 boldness:6 compete:5 initiative:5 autonomy:4 analysis:3 social:-5 humor:-5 patience:-2",
    S("principled", "specialist", "direct", "driver", "confront", "steady", "executor", "anchor"), "loyalty honor", "duty mastery");
  add("furiosa", "persist:8 steadiness:5 initiative:6 autonomy:6 boldness:6 warmth:4 flex:4 structure:3 patience:3 social:-3 humor:-3",
    S("instinctive", "experimental", "reserved", "driver", "confront", "steady", "adaptor", "anchor"), "freedom community justice", "freedom justice");
  add("ted-lasso", "optimism:9 warmth:8 humor:7 trust:7 social:7 patience:6 steadiness:4 flex:5 initiative:3 compete:-2 analysis:-2 autonomy:-2",
    S("consulting", "social", "warm", "servant", "mediate", "people", "collaborative", "glue"), "kindness community humility", "connection");

  // ---- extras (not in engine.js's MEDIA_CHARACTERS) ----
  const EXTRA = [];
  const ex = (id, name, source, sourceType, role, energy, traits, st, values, motivations) => { EXTRA.push({ id, name, source, sourceType, role, energy }); add(id, traits, st, values, motivations); };
  ex("hamlet", "Hamlet", "Hamlet", "play", "The One Who Can't Stop Thinking", "Sees every angle of the problem clearly, which is exactly what keeps the problem from being solved.",
    "analysis:9 optimism:-8 steadiness:-7 initiative:-6 autonomy:5 explore:4 humor:4 trust:-4 boldness:-3 social:-3",
    S("cautious", "specialist", "reserved", "lone", "withdraw", "overthink", "independent", "challenger"), "truth honor justice", "justice duty");
  ex("alice", "Alice", "Alice in Wonderland", "book", "The One Who Keeps Asking Why", "Treats an upside-down world as something to investigate rather than something to fear.",
    "explore:9 flex:7 optimism:5 boldness:4 trust:4 social:3 invent:3 steadiness:2 structure:-4",
    S("instinctive", "explorer", "direct", "lone", "confront", "steady", "adaptor", "scout"), "truth freedom", "curiosity");
  ex("pinocchio", "Pinocchio", "Pinocchio", "book", "The One Still Working It Out", "Learns everything the hard way, then meaningfully means it the next time.",
    "trust:7 explore:6 optimism:6 social:5 warmth:5 initiative:4 flex:3 humor:3 structure:-6 analysis:-5 patience:-5 steadiness:-2",
    S("instinctive", "experimental", "playful", "reluctant", "avoid", "people", "adaptor", "scout"), "kindness freedom", "curiosity connection");
  ex("odysseus", "Odysseus", "The Odyssey", "myth", "The One Who Finds a Way Home", "Out-thinks, out-waits and out-improvises almost everything the journey throws up.",
    "persist:9 flex:8 analysis:7 invent:6 initiative:6 structure:5 patience:5 boldness:5 steadiness:4 autonomy:4 compete:4 trust:-2",
    S("analytical", "experimental", "commanding", "driver", "strategic", "steady", "strategist", "strategist"), "family courage honor", "connection mastery");
  ex("spock", "Spock", "Star Trek", "show", "The Logic in the Room", "Keeps an even keel because the alternative is feeling everything at once.",
    "analysis:9 steadiness:8 structure:7 patience:6 persist:5 social:-4 humor:-4 trust:3 autonomy:2",
    S("analytical", "systematic", "reserved", "architect", "mediate", "steady", "executor", "specialist"), "truth loyalty", "curiosity duty");
  ex("samwise-gamgee", "Samwise Gamgee", "The Lord of the Rings", "book", "The One Who Carries the Carrier", "Never the hero of the story and, mostly, entirely the reason it finishes.",
    "persist:9 warmth:8 trust:8 patience:6 steadiness:4 optimism:4 structure:3 humor:2 initiative:1 compete:-5 autonomy:-6",
    S("consulting", "social", "warm", "servant", "avoid", "steady", "collaborative", "glue"), "loyalty kindness humility", "connection duty");
  ex("zuko", "Zuko", "Avatar: The Last Airbender", "show", "The One Unlearning It All", "Spends a long time chasing the wrong goal with real commitment, then changes course with the same commitment.",
    "persist:7 compete:6 initiative:5 boldness:5 autonomy:5 structure:3 steadiness:-4 patience:-3 optimism:-3 trust:-2 social:-2",
    S("instinctive", "specialist", "direct", "reluctant", "confront", "accelerate", "executor", "challenger"), "honor family", "mastery duty");
  ex("spike-spiegel", "Spike Spiegel", "Cowboy Bebop", "anime", "The One Who Won't Be Pinned Down", "Cool on the surface, carrying more of the past than he ever lets on.",
    "flex:8 autonomy:8 humor:6 boldness:6 steadiness:4 patience:2 structure:-7 optimism:-2 trust:-1",
    S("instinctive", "experimental", "reserved", "lone", "withdraw", "inward", "adaptor", "scout"), "freedom loyalty", "freedom");
  ex("edward-elric", "Edward Elric", "Fullmetal Alchemist", "anime", "The One Who Won't Accept 'Impossible'", "Throws brilliance and stubbornness at a problem until one of them gives.",
    "persist:8 analysis:7 invent:7 initiative:6 boldness:5 warmth:5 compete:4 autonomy:4 structure:3 social:3 humor:3 patience:-5 steadiness:-2",
    S("gambler", "experimental", "direct", "driver", "confront", "accelerate", "strategist", "catalyst"), "family truth justice", "mastery connection");
  ex("monkey-d-luffy", "Monkey D. Luffy", "One Piece", "anime", "The One Who Makes It Fun to Follow", "Decides what he wants, announces it, and somehow gathers exactly the right people.",
    "optimism:9 boldness:9 social:8 initiative:8 trust:8 persist:8 flex:7 humor:7 warmth:6 autonomy:6 patience:-4 structure:-8 analysis:-8",
    S("instinctive", "experimental", "playful", "driver", "confront", "accelerate", "adaptor", "catalyst"), "freedom loyalty", "freedom connection");
  ex("atticus-finch", "Atticus Finch", "To Kill a Mockingbird", "book", "The Steady Conscience", "Does the right thing quietly and then keeps doing it when it costs him.",
    "steadiness:8 patience:7 warmth:6 analysis:6 structure:6 persist:6 trust:5 optimism:3 autonomy:3 humor:2 initiative:2 compete:-4",
    S("principled", "systematic", "warm", "reluctant", "mediate", "steady", "executor", "anchor"), "justice humility family", "justice duty");
  ex("don-quixote", "Don Quixote", "Don Quixote", "book", "The One Who Believes Anyway", "Charges at the world as it should be, undeterred by the world as it is.",
    "optimism:9 boldness:8 invent:7 initiative:7 persist:7 explore:6 trust:6 warmth:5 autonomy:4 flex:3 humor:3 analysis:-7 structure:-4 steadiness:-2",
    S("gambler", "explorer", "warm", "driver", "confront", "accelerate", "adaptor", "catalyst"), "honor courage justice", "justice freedom");

  F.CHARACTER_DATA = D;
  F.CHARACTER_EXTRA = EXTRA;
})(typeof Forge !== "undefined" ? Forge : (globalThis.Forge = globalThis.Forge || {}));
if (typeof module !== "undefined" && module.exports) module.exports = Forge;
