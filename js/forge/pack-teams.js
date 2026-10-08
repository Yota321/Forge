/* =========================================================================
   TEAMS PACK (data only). Each team carries its own metadata and scoring:
     group     browsing group (Marvel, DC, Anime, Games, Movies, TV, Books & Myth)
     members   character ids (must exist in the roster)
     needs     the team's ETHOS: facet -> weight on the group's average. A team's final score blends how closely each
               person resembles a member (the character engine) with how well the group's overall character fits this ethos.
     ideal     [min, max] group size the team suits; a group inside it gets a small boost, one far outside a small penalty
   The original 21 teams live in pack-party.js; "teamsMeta" below gives them a group, ethos and size (and adds new
   members to two of them) without editing them. Read merged entries with Forge.packs.merged("teams").
   ========================================================================= */
(function(F){
  "use strict";
  if (!F.packs) return;
  const A = F.packs.add;

  A("teamsMeta", [
    { id: "bat-family", group: "DC", ideal: [3, 6], addMembers: ["tim-drake", "jason-todd", "damian-wayne"], needs: { structure: 0.8, persist: 0.9, analysis: 0.8, warmth: 0.5, trust: 0.4, optimism: -0.3 } },
    { id: "justice-league", group: "DC", ideal: [4, 8], needs: { initiative: 0.8, persist: 0.8, warmth: 0.7, steadiness: 0.7, trust: 0.6, optimism: 0.5 } },
    { id: "teen-titans", group: "DC", ideal: [3, 6], needs: { warmth: 0.8, humor: 0.7, social: 0.7, flex: 0.6, optimism: 0.6, trust: 0.6 } },
    { id: "avengers", group: "Marvel", ideal: [4, 7], needs: { initiative: 0.8, boldness: 0.8, humor: 0.6, compete: 0.5, flex: 0.6, persist: 0.6 } },
    { id: "x-men", group: "Marvel", ideal: [3, 6], needs: { warmth: 0.7, trust: 0.6, optimism: 0.6, persist: 0.7, autonomy: 0.4, initiative: 0.5 } },
    { id: "young-heroes", group: "Marvel", ideal: [3, 5], needs: { optimism: 0.8, humor: 0.7, flex: 0.7, warmth: 0.7, persist: 0.5 } },
    { id: "fellowship", group: "Movies", ideal: [3, 6], needs: { persist: 1, trust: 1, steadiness: 0.8, warmth: 0.7, boldness: 0.4 } },
    { id: "rebel-alliance", group: "Movies", ideal: [4, 7], needs: { optimism: 0.8, boldness: 0.8, trust: 0.7, flex: 0.6, initiative: 0.6, humor: 0.5 } },
    { id: "dumbledores-army", group: "Movies", ideal: [3, 6], needs: { explore: 0.7, trust: 0.8, warmth: 0.7, boldness: 0.7, persist: 0.6 } },
    { id: "straw-hats", group: "Anime", ideal: [4, 8], needs: { optimism: 1, boldness: 0.9, social: 0.8, trust: 0.8, flex: 0.7, structure: -0.7 } },
    { id: "team-avatar", group: "Anime", ideal: [4, 7], needs: { warmth: 0.9, flex: 0.8, humor: 0.7, optimism: 0.8, trust: 0.8 } },
    { id: "survivors", group: "Games", ideal: [3, 5], needs: { steadiness: 1, flex: 0.8, persist: 0.8, boldness: 0.6, trust: 0.6 } },
    { id: "normandy", group: "Games", ideal: [3, 8], addMembers: ["tali-zorah", "wrex"], needs: { initiative: 0.8, trust: 0.9, analysis: 0.6, warmth: 0.6, structure: 0.5 } },
    { id: "geralts-family", group: "Games", ideal: [3, 5], needs: { autonomy: 0.8, humor: 0.7, persist: 0.7, warmth: 0.4, trust: 0.3 } },
    { id: "piltover", group: "Anime", ideal: [3, 6], needs: { invent: 1, compete: 0.5, boldness: 0.6, analysis: 0.6, steadiness: -0.5 } },
    { id: "scouts", group: "Anime", ideal: [4, 8], needs: { persist: 1, boldness: 0.8, structure: 0.7, steadiness: 0.6, trust: 0.4 } },
    { id: "team-seven", group: "Anime", ideal: [3, 4], needs: { persist: 0.9, compete: 0.7, warmth: 0.5, optimism: 0.6, trust: 0.5 } },
    { id: "baker-street", group: "Books & Myth", ideal: [2, 4], needs: { analysis: 1, explore: 0.8, trust: 0.6, persist: 0.6, autonomy: 0.4 } },
    { id: "olympians", group: "Books & Myth", ideal: [4, 7], needs: { compete: 0.8, boldness: 0.8, initiative: 0.7, persist: 0.7, social: 0.4 } },
    { id: "stark-allies", group: "TV", ideal: [3, 5], needs: { persist: 0.9, analysis: 0.6, boldness: 0.6, autonomy: 0.6, trust: 0.2, optimism: -0.4 } },
    { id: "albuquerque", group: "TV", ideal: [3, 3], needs: { compete: 0.7, analysis: 0.6, persist: 0.6, humor: 0.5, trust: -0.2, steadiness: -0.3 } },
  ]);

  const T = (id, group, franchise, name, members, blurb, why, needs, ideal) => ({ id, group, franchise, name, members, blurb, why, needs, ideal });
  A("teams", [
    T("guardians", "Marvel", "Marvel", "The Guardians of the Galaxy", ["star-lord", "gamora", "rocket-raccoon"], "A ragtag crew of misfits who'd never admit they're a family.",
      "Your group has the same lovable chaos: big feelings, sharp tongues and a loyalty nobody says out loud.", { humor: 0.9, flex: 0.8, warmth: 0.6, boldness: 0.7, structure: -0.6, trust: 0.5 }, [3, 6]),
    T("fantastic-four", "Marvel", "Marvel", "The Fantastic Four", ["reed-richards", "sue-storm", "johnny-storm", "ben-grimm"], "A family first and a team second: brainy, steady, hot-headed and gruffly loyal.",
      "Your group has the same family dynamic: someone curious, someone steady, someone showy and someone who carries the weight.", { warmth: 0.9, trust: 0.8, explore: 0.7, humor: 0.6, steadiness: 0.5 }, [3, 5]),
    T("defenders", "Marvel", "Marvel", "The Defenders", ["matt-murdock", "jessica-jones", "luke-cage", "danny-rand"], "Four stubborn street-level people who protect a neighborhood nobody else is watching.",
      "Your group works the way they do: independent, wary and quietly dependable when something real is at stake.", { persist: 0.9, autonomy: 0.7, trust: -0.2, steadiness: 0.5, boldness: 0.6, humor: 0.3 }, [3, 5]),
    T("young-avengers", "Marvel", "Marvel", "The Young Avengers", ["kate-bishop", "america-chavez", "miles-morales", "kamala-khan"], "The next generation: quick, funny, a little reckless and determined to do it their own way.",
      "Your group has the same restless, earnest spark, and the same instinct to take the shot first.", { boldness: 0.8, humor: 0.7, flex: 0.7, optimism: 0.7, compete: 0.5, initiative: 0.6 }, [3, 6]),
    T("spider-family", "Marvel", "Marvel", "The Spider-Verse Family", ["peter-parker", "miles-morales", "gwen-stacy"], "Different Spiders, same heart: quick-witted, guilt-prone and determined to show up.",
      "Your group shares that mix of humor, nerves and doing the right thing anyway.", { humor: 0.8, warmth: 0.8, persist: 0.8, flex: 0.7, steadiness: -0.4, optimism: 0.4 }, [3, 5]),
    T("marvel-masterminds", "Marvel", "Marvel", "Marvel's Masterminds", ["thanos", "victor-von-doom", "erik-lehnsherr", "wilson-fisk"], "The great planners of the dark side: patient, certain and impossible to argue out of a plan.",
      "Your group has the same appetite for control: everyone would have a plan, and nobody would share it.", { initiative: 0.9, compete: 0.8, analysis: 0.7, autonomy: 0.8, trust: -0.8, warmth: -0.4, persist: 0.8 }, [3, 5]),
    T("suicide-squad", "DC", "DC", "Task Force X", ["harley-quinn", "deadshot", "amanda-waller"], "An unlikely, unruly crew run by someone nobody trusts, getting the job done by being just reliable enough.",
      "Your group has the same chaotic-but-effective energy: sharp edges and sharper instincts.", { flex: 0.8, boldness: 0.8, autonomy: 0.7, humor: 0.6, trust: -0.4, compete: 0.6 }, [3, 6]),
    T("lantern-corps", "DC", "DC", "The Green Lantern Corps", ["hal-jordan", "john-stewart", "guy-gardner", "sinestro"], "Willpower and discipline on a cosmic scale, and a lot of very strong personalities.",
      "Your group has the same willpower and the same friction: capable people who all want to lead.", { boldness: 0.9, persist: 0.8, initiative: 0.8, compete: 0.7, structure: 0.5, patience: -0.4 }, [3, 7]),
    T("legion-of-doom", "DC", "DC", "The Legion of Doom", ["lex-luthor", "joker", "sinestro"], "Brilliant rivals who agree on only one thing: someone else is in the way.",
      "Your group has the same talent and the same difficulty agreeing on whose plan it is.", { compete: 1, autonomy: 0.8, analysis: 0.7, boldness: 0.6, trust: -0.8, warmth: -0.5 }, [3, 5]),
    T("akatsuki", "Anime", "Naruto", "Akatsuki", ["itachi-uchiha", "nagato-pain", "kisame-hoshigaki"], "A dark, disciplined organization held together by a shared grievance with the world.",
      "Your group runs on shared conviction: quiet, serious and not especially chatty.", { persist: 0.9, autonomy: 0.8, analysis: 0.6, steadiness: 0.6, social: -0.7, trust: -0.4, optimism: -0.5 }, [3, 6]),
    T("gotei-13", "Anime", "Bleach", "Gotei 13", ["kenpachi-zaraki", "byakuya-kuchiki", "toshiro-hitsugaya"], "A rank of captains, each with their own style and none of them willing to give ground.",
      "Your group has the same pride in what it does and the same strong personalities.", { structure: 0.7, compete: 0.8, persist: 0.8, boldness: 0.7, steadiness: 0.6, autonomy: 0.5 }, [3, 8]),
    T("phantom-troupe", "Anime", "Hunter x Hunter", "The Phantom Troupe", ["chrollo-lucilfer", "hisoka-morow", "feitan"], "A tight, formidable crew bound by loyalty to each other and almost nothing else.",
      "Your group has the same tight, slightly unnerving cohesion: you rarely need to speak to agree.", { analysis: 0.8, autonomy: 0.8, compete: 0.7, boldness: 0.7, trust: -0.2, social: -0.3, steadiness: 0.5 }, [3, 7]),
    T("demon-slayer-corps", "Anime", "Demon Slayer", "The Demon Slayer Corps", ["tanjiro-kamado", "zenitsu-agatsuma", "inosuke-hashibira"], "A mismatched trio of a kind heart, a frightened prodigy and a wild boy who somehow work together.",
      "Your group has the same lovable range: one kind, one nervous and one fearless.", { persist: 0.9, warmth: 0.8, humor: 0.7, boldness: 0.6, flex: 0.5, trust: 0.6 }, [3, 5]),
    T("stars", "Games", "Resident Evil", "S.T.A.R.S.", ["chris-redfield", "jill-valentine", "barry-burton", "rebecca-chambers", "albert-wesker"], "An elite team of specialists with a strong sense of duty, and one person you should probably watch.",
      "Your group has the same professional steadiness, with a healthy dose of someone keeping a secret.", { steadiness: 0.9, structure: 0.7, persist: 0.8, trust: 0.5, flex: 0.6, boldness: 0.5 }, [4, 6]),
    T("phantom-thieves", "Games", "Persona", "The Phantom Thieves", ["ren-amamiya", "ryuji-sakamoto", "ann-takamaki"], "Stylish, determined and a little rebellious, a group of friends changing hearts one palace at a time.",
      "Your group has the same energy: young at heart, loyal and fond of a well-timed entrance.", { flex: 0.9, trust: 0.9, social: 0.7, boldness: 0.7, humor: 0.6, initiative: 0.6 }, [3, 6]),
    T("jedi-order", "Movies", "Star Wars", "The Jedi Order", ["obi-wan-kenobi", "yoda", "qui-gon-jinn", "luke-skywalker"], "Patient, principled guides who prefer to talk, and are very good when they can't.",
      "Your group has the same calm and conviction: more likely to de-escalate than win by force.", { patience: 0.9, steadiness: 0.9, warmth: 0.6, trust: 0.7, analysis: 0.5, autonomy: 0.3, compete: -0.5 }, [3, 7]),
    T("ghostbusters", "Movies", "Ghostbusters", "The Ghostbusters", ["peter-venkman", "ray-stantz", "egon-spengler"], "A very funny trio of scientists in jumpsuits who somehow make the supernatural look like a job.",
      "Your group has the same mix: a smooth talker, an enthusiast and a brain, with the right tools for the job.", { humor: 0.9, explore: 0.8, analysis: 0.7, optimism: 0.6, flex: 0.6, social: 0.5 }, [3, 5]),
    T("office-staff", "TV", "The Office", "The Office Staff", ["michael-scott", "dwight-schrute", "jim-halpert", "pam-beesly"], "A workplace that functions entirely on personality, in-jokes and quiet affection.",
      "Your group has the same dynamic: big personalities, small stakes and an unmistakable closeness.", { social: 0.9, humor: 0.9, warmth: 0.7, structure: -0.3, trust: 0.4, compete: 0.3 }, [4, 10]),
    T("brooklyn-99", "TV", "Brooklyn Nine-Nine", "Brooklyn Nine-Nine", ["jake-peralta", "amy-santiago", "raymond-holt"], "A precinct where excellent police work and absurd behavior live happily together.",
      "Your group has the same heart: capable, silly and deeply loyal to each other.", { humor: 0.9, trust: 0.9, persist: 0.7, warmth: 0.7, initiative: 0.6, compete: 0.5, structure: 0.3 }, [3, 9]),
    T("round-table", "Books & Myth", "Arthurian legend", "The Round Table", ["king-arthur", "merlin", "artoria-pendragon"], "An idealistic court of one just king, one wise advisor and everyone who believes in the dream.",
      "Your group has the same conviction in a shared ideal and a few people who keep it honest.", { trust: 0.8, initiative: 0.7, analysis: 0.6, warmth: 0.6, structure: 0.6, persist: 0.7 }, [3, 8]),
    T("gothic-club", "Books & Myth", "Gothic fiction", "The Gothic Club", ["dracula", "victor-frankenstein", "dorian-gray"], "A candlelit circle of brilliant, haunted people who are all better alone and worse together.",
      "Your group is intense, introspective and fond of a dramatic pause.", { autonomy: 0.8, analysis: 0.7, social: -0.3, optimism: -0.6, steadiness: -0.4, persist: 0.5, trust: -0.5 }, [3, 5]),
  ]);
})(typeof Forge !== "undefined" ? Forge : (globalThis.Forge = globalThis.Forge || {}));
if (typeof module !== "undefined" && module.exports) module.exports = Forge;
