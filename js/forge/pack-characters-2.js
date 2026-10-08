/* =========================================================================
   CHARACTER PACK 2 (expansion). Hand-authored; same row format as pack-characters.js:
   [id, name, source, medium, role, energy, traits, "decision learning communication leadership conflict stress work group", values, motivations]
   traits = only the facets that DEFINE the character (-10..10). Original, curated reads of core personality (comic
   versions for Marvel and DC), written for Forge. Strengths, weak spots, growth notes, tags and worlds live in
   pack-character-notes.js; emblems in pack-emblems.js.
   ========================================================================= */
(function(F){
  "use strict";
  if (!F.packs) return;

  F.packs.characters({ id: "expansion-marvel-dc", name: "Marvel and DC expansion", groups: [
    { franchise: "Marvel", items: [
      ["star-lord", "Star-Lord", "Guardians of the Galaxy (Marvel Comics)", "comic", "The Charming Misfit Who Holds the Crew Together", "Cracks jokes to cover big feelings, and somehow ends up the person an unlikely crew follows.",
        "humor:8 social:7 flex:7 optimism:6 initiative:6 warmth:6 boldness:6 trust:4 structure:-6 patience:-4 analysis:-2 steadiness:-2", "instinctive social playful driver avoid people adaptor catalyst", "loyalty family freedom", "connection freedom"],
      ["gamora", "Gamora", "Guardians of the Galaxy (Marvel Comics)", "comic", "The Deadliest Woman in the Galaxy, Trying to Be More", "Disciplined, guarded and very good at what she does, with a long road toward trusting people again.",
        "persist:8 autonomy:7 boldness:7 steadiness:6 structure:5 analysis:5 compete:4 warmth:3 humor:1 social:-3 trust:-4", "analytical specialist direct lone strategic steady independent scout", "honor freedom loyalty", "freedom duty"],
      ["rocket-raccoon", "Rocket", "Guardians of the Galaxy (Marvel Comics)", "comic", "The Gruff Inventor With a Soft Spot", "Builds anything, insults everyone, and hides how much he cares behind a very prickly front.",
        "invent:9 autonomy:7 analysis:6 boldness:6 humor:6 compete:5 warmth:3 social:-1 trust:-3 steadiness:-3 patience:-5", "analytical experimental direct lone confront accelerate independent challenger", "loyalty creativity family", "mastery connection"],
      ["sue-storm", "Sue Storm", "Fantastic Four (Marvel Comics)", "comic", "The Quiet Center of the Family", "Calm, perceptive and far stronger than her reputation, she keeps a family of big personalities together.",
        "warmth:8 steadiness:8 patience:7 trust:6 persist:6 initiative:5 analysis:4 structure:4 humor:2 compete:-3", "consulting social warm servant mediate steady collaborative glue", "family kindness community", "connection duty"],
      ["johnny-storm", "Johnny Storm", "Fantastic Four (Marvel Comics)", "comic", "The Hothead Who Means Well", "Cocky, quick and always up for a dare, with a big heart under the showboating.",
        "boldness:8 humor:8 social:8 flex:6 compete:6 optimism:6 initiative:5 warmth:4 patience:-6 structure:-6 analysis:-3 steadiness:-2", "instinctive experimental playful driver confront accelerate adaptor catalyst", "family courage freedom", "freedom connection"],
      ["ben-grimm", "Ben Grimm", "Fantastic Four (Marvel Comics)", "comic", "The Gentle Giant With a Rough Exterior", "Blunt, loyal and quietly sensitive about it, the one who will always stand in front of the family.",
        "persist:8 warmth:7 steadiness:6 trust:6 humor:5 boldness:5 patience:3 structure:3 initiative:3 compete:2 optimism:-2", "principled social direct reluctant mediate steady executor anchor", "loyalty family courage", "duty connection"],
      ["jessica-jones", "Jessica Jones", "Defenders (Marvel Comics)", "comic", "The Cynic Who Can't Walk Away", "Sarcastic, wary and relentlessly decent, she insists she's no hero and keeps doing the work anyway.",
        "autonomy:8 persist:8 analysis:6 boldness:5 humor:5 compete:2 warmth:3 steadiness:-4 social:-5 optimism:-5 trust:-6", "analytical specialist direct lone confront inward independent challenger", "justice honor", "justice freedom"],
      ["luke-cage", "Luke Cage", "Defenders (Marvel Comics)", "comic", "The Neighborhood Guardian", "Steady, principled and proud of where he's from, he'd rather protect a block than win a war.",
        "steadiness:8 persist:7 warmth:6 trust:5 structure:5 boldness:5 initiative:5 patience:5 autonomy:3 humor:2 compete:-2", "principled social direct reluctant mediate steady executor anchor", "community justice honor", "duty justice"],
      ["danny-rand", "Danny Rand", "Defenders (Marvel Comics)", "comic", "The Idealist Out of His Depth", "Earnest, driven and a little naive, still learning how to carry a legacy he was handed too young.",
        "persist:7 optimism:6 initiative:6 boldness:6 warmth:5 compete:5 trust:4 structure:3 autonomy:3 steadiness:-3 patience:-3 analysis:-2", "instinctive specialist direct driver confront accelerate adaptor challenger", "honor justice humility", "mastery duty"],
      ["kate-bishop", "Kate Bishop", "Young Avengers (Marvel Comics)", "comic", "The Overachiever Who Learned to Improvise", "Confident, quick-witted and willing to take the shot first, she's the junior member who rarely acts like one.",
        "boldness:7 initiative:7 humor:6 compete:6 flex:6 persist:5 social:5 autonomy:4 warmth:4 analysis:3 structure:-3 patience:-3", "instinctive experimental playful driver confront accelerate adaptor catalyst", "achievement loyalty courage", "mastery justice"],
      ["america-chavez", "America Chavez", "Young Avengers (Marvel Comics)", "comic", "The Fierce Newcomer With Open Arms", "Direct, powerful and fiercely loyal, she says what she means and keeps her people close.",
        "boldness:8 autonomy:7 persist:7 initiative:6 warmth:5 compete:5 trust:3 humor:3 steadiness:-1 structure:-3 patience:-5", "instinctive experimental direct driver confront accelerate independent challenger", "loyalty freedom family", "freedom connection"],
      ["thanos", "Thanos", "Marvel Comics (cosmic)", "comic", "The Patient Believer in One Terrible Idea", "Methodical, composed and certain, he treats a monstrous goal as an obligation rather than a desire.",
        "persist:10 initiative:8 analysis:7 structure:7 steadiness:7 autonomy:7 compete:6 patience:5 warmth:-3 humor:-5 optimism:-3 trust:-5", "principled specialist commanding architect strategic steady strategist strategist", "achievement honor", "mastery justice"],
      ["wilson-fisk", "Wilson Fisk", "Marvel Comics (Kingpin)", "comic", "The Man Who Wants to Fix a City His Way", "Imposing, polite and quietly volatile, someone who truly believes ruthlessness is a kind of care.",
        "compete:8 initiative:8 structure:7 persist:7 autonomy:7 analysis:6 boldness:5 patience:2 steadiness:2 warmth:-3 humor:-4 trust:-6", "analytical specialist commanding architect strategic steady strategist strategist", "family achievement", "mastery connection"],
      ["gwen-stacy", "Gwen Stacy", "Spider-Man (Marvel Comics)", "comic", "The Sharp Mind With a Drummer's Heart", "Fast, funny and independent, she carries a lot of loss without letting it slow her down.",
        "flex:7 autonomy:7 humor:6 analysis:6 boldness:6 persist:6 warmth:5 invent:4 optimism:3 social:2 steadiness:-1 structure:-2", "analytical experimental playful lone confront accelerate adaptor scout", "loyalty creativity", "freedom connection"],
    ] },
    { franchise: "DC", items: [
      ["tim-drake", "Tim Drake", "Robin (DC Comics)", "comic", "The Detective Who Worked It Out", "Observant, thorough and quietly driven, he figured out the secret before anyone told him.",
        "analysis:9 persist:8 structure:7 explore:6 autonomy:5 initiative:5 steadiness:3 warmth:3 humor:2 trust:1 social:-3", "analytical systematic direct architect strategic overthink strategist specialist", "knowledge loyalty", "curiosity duty"],
      ["jason-todd", "Jason Todd", "Red Hood (DC Comics)", "comic", "The Angry Heart", "Brash, wounded and fiercely protective, with strong opinions about how justice ought to work.",
        "boldness:8 persist:7 autonomy:7 compete:6 initiative:6 warmth:4 humor:3 trust:-3 structure:-3 steadiness:-6 patience:-6", "instinctive experimental direct lone confront accelerate independent challenger", "justice family", "justice freedom"],
      ["damian-wayne", "Damian Wayne", "Robin (DC Comics)", "comic", "The Prodigy Learning Humility", "Gifted, blunt and shockingly sure of himself, discovering that being good isn't the same as being right.",
        "compete:8 initiative:7 boldness:7 autonomy:7 persist:7 analysis:6 structure:6 warmth:2 steadiness:-1 trust:-2 humor:-1 social:-4 patience:-5", "analytical specialist commanding driver confront accelerate independent challenger", "honor achievement", "mastery duty"],
      ["harley-quinn", "Harley Quinn", "Batman (DC Comics)", "comic", "The Chaos With a Soft Center", "Wild, funny and surprisingly perceptive, she loves hard and carries more empathy than she lets on.",
        "humor:9 social:8 flex:8 boldness:8 warmth:6 optimism:5 invent:5 analysis:4 autonomy:4 trust:2 structure:-7 steadiness:-5 patience:-5", "instinctive social playful driver avoid people adaptor catalyst", "loyalty freedom kindness", "connection freedom"],
      ["deadshot", "Deadshot", "Suicide Squad (DC Comics)", "comic", "The Professional Who Won't Be Moved", "Precise, unsentimental and fiercely focused, with one soft spot he keeps locked away.",
        "persist:8 steadiness:7 analysis:6 structure:6 autonomy:7 compete:6 boldness:5 warmth:2 humor:2 social:-4 trust:-5 optimism:-4", "analytical specialist reserved lone strategic steady independent specialist", "family achievement", "mastery connection"],
      ["amanda-waller", "Amanda Waller", "Suicide Squad (DC Comics)", "comic", "The Handler Who Never Blinks", "Strategic, blunt and impossible to intimidate, she believes the end justifies a very hard bargain.",
        "initiative:9 structure:8 persist:8 analysis:7 steadiness:7 compete:6 autonomy:6 boldness:5 warmth:-4 humor:-3 optimism:-3 trust:-7", "analytical systematic commanding architect strategic steady strategist strategist", "achievement honor", "duty mastery"],
      ["john-stewart", "John Stewart", "Green Lantern Corps (DC Comics)", "comic", "The Architect Who Carries the Responsibility", "Thoughtful, disciplined and deeply conscientious, a builder who feels every decision he makes.",
        "structure:8 steadiness:7 persist:7 analysis:6 initiative:6 warmth:5 boldness:5 invent:5 patience:5 trust:4 humor:2", "principled systematic direct architect mediate steady executor anchor", "justice honor humility", "duty justice"],
      ["guy-gardner", "Guy Gardner", "Green Lantern Corps (DC Comics)", "comic", "The Loudest Voice in the Room", "Brash, competitive and weirdly loyal, he leads with his chin and learns slowly.",
        "compete:9 boldness:8 initiative:7 social:6 persist:6 humor:5 autonomy:5 warmth:3 steadiness:-3 structure:-3 analysis:-4 patience:-7", "instinctive experimental commanding driver confront accelerate adaptor challenger", "honor courage", "mastery freedom"],
      ["sinestro", "Sinestro", "Green Lantern Corps (DC Comics)", "comic", "The Disciplinarian Who Crossed the Line", "Principled, controlling and certain that order is kindness, which is exactly how it goes wrong.",
        "structure:9 initiative:8 persist:8 compete:7 analysis:6 autonomy:6 steadiness:5 warmth:-3 humor:-5 optimism:-3 patience:-2 trust:-6", "principled systematic commanding architect strategic steady strategist strategist", "honor justice", "duty justice"],
      ["jay-garrick", "Jay Garrick", "Justice Society (DC Comics)", "comic", "The Original Speedster", "Warm, steady and unhurried despite the speed, a mentor who makes experience sound like encouragement.",
        "warmth:7 steadiness:7 patience:6 optimism:6 trust:6 persist:6 humor:5 analysis:5 social:4 initiative:4 structure:4 compete:-3", "consulting social warm reluctant mediate steady collaborative glue", "community kindness humility", "duty connection"],
    ] },
  ] });

  F.packs.characters({ id: "expansion-anime", name: "Anime and manga expansion", groups: [
    { franchise: "Naruto", items: [
      ["itachi-uchiha", "Itachi Uchiha", "Naruto", "anime", "The Silent Protector", "Calm, brilliant and carrying a terrible secret, he chose duty over being understood.",
        "analysis:9 steadiness:8 persist:8 autonomy:8 structure:6 warmth:6 patience:6 compete:2 trust:-2 humor:-4 social:-6 optimism:-5", "analytical specialist reserved lone strategic inward strategist specialist", "family honor humility", "duty connection"],
      ["nagato-pain", "Nagato (Pain)", "Naruto", "anime", "The Idealist Turned Zealot", "Gentle at heart and hardened by loss, he came to believe the world could only be changed through pain.",
        "persist:8 analysis:6 initiative:6 autonomy:6 structure:5 warmth:3 steadiness:2 patience:2 humor:-4 social:-5 optimism:-5 trust:-5", "principled specialist reserved lone strategic inward strategist specialist", "justice family", "justice duty"],
      ["kisame-hoshigaki", "Kisame Hoshigaki", "Naruto", "anime", "The Blunt Predator With a Sense of Humor", "Loud, loyal to a fault and enjoying the fight more than he'd admit.",
        "boldness:8 persist:7 compete:7 steadiness:5 humor:5 social:4 trust:3 analysis:3 structure:2 warmth:2 patience:-3", "instinctive experimental direct reluctant confront steady executor challenger", "loyalty honor", "mastery duty"],
    ] },
    { franchise: "Bleach", items: [
      ["ichigo-kurosaki", "Ichigo Kurosaki", "Bleach", "anime", "The Protector Who Acts Before Thinking", "Stubborn, loyal and quick to throw himself in, driven by a need to guard the people near him.",
        "persist:8 boldness:7 warmth:6 initiative:6 autonomy:5 compete:4 trust:4 humor:2 steadiness:-1 patience:-4 structure:-3 analysis:-1", "instinctive experimental direct driver confront accelerate adaptor catalyst", "family courage loyalty", "connection justice"],
      ["kenpachi-zaraki", "Kenpachi Zaraki", "Bleach", "anime", "The Joyful Fighter", "Cheerfully blunt, instinctive and bored by anything easy, with a code of honor that surprises people.",
        "boldness:9 compete:9 persist:7 autonomy:7 optimism:5 humor:5 flex:5 steadiness:4 warmth:2 structure:-6 analysis:-6 patience:-5", "instinctive experimental direct lone confront accelerate independent challenger", "honor freedom courage", "mastery freedom"],
      ["byakuya-kuchiki", "Byakuya Kuchiki", "Bleach", "anime", "The Aristocrat Who Learned to Bend", "Formal, controlled and deeply principled, with feelings kept firmly behind the manners.",
        "structure:9 steadiness:8 persist:6 analysis:6 autonomy:6 patience:5 compete:4 warmth:3 social:-5 humor:-4 flex:-4 trust:-1", "principled systematic reserved architect withdraw steady executor anchor", "honor justice", "duty justice"],
      ["toshiro-hitsugaya", "Toshiro Hitsugaya", "Bleach", "anime", "The Prodigy Captain", "Young, serious and very good at holding a line, with a temper that shows when he feels underestimated.",
        "structure:8 analysis:7 persist:7 steadiness:6 initiative:6 compete:5 autonomy:5 warmth:3 trust:1 patience:-1 humor:-3 social:-3", "analytical systematic direct architect strategic steady executor strategist", "honor loyalty", "duty mastery"],
    ] },
    { franchise: "Hunter x Hunter", items: [
      ["gon-freecss", "Gon Freecss", "Hunter x Hunter", "anime", "The Straightforward Explorer", "Fearless, curious and almost startlingly sincere, with a single-mindedness that is both gift and risk.",
        "persist:9 explore:8 optimism:8 boldness:8 trust:7 warmth:6 initiative:6 flex:6 autonomy:5 analysis:-2 structure:-3 patience:-3 steadiness:-1", "instinctive explorer direct driver confront accelerate adaptor scout", "loyalty courage freedom", "curiosity connection"],
      ["killua-zoldyck", "Killua Zoldyck", "Hunter x Hunter", "anime", "The Sharp Friend Who Learned to Trust", "Quick, wary and fiercely loyal, he is discovering that closeness isn't a weakness.",
        "flex:8 analysis:7 autonomy:6 boldness:6 persist:6 humor:5 compete:5 warmth:5 steadiness:2 trust:2 social:-1 structure:-1", "analytical experimental playful reluctant strategic steady adaptor strategist", "loyalty freedom", "freedom connection"],
      ["chrollo-lucilfer", "Chrollo Lucilfer", "Hunter x Hunter", "anime", "The Calm Mastermind", "Charismatic, patient and composed, a leader who keeps a crew bound together by purpose.",
        "analysis:9 steadiness:8 initiative:8 structure:7 explore:7 persist:7 patience:6 autonomy:6 compete:5 social:3 warmth:2 humor:-1 trust:-3", "analytical explorer commanding architect strategic steady strategist strategist", "knowledge freedom loyalty", "curiosity mastery"],
      ["hisoka-morow", "Hisoka Morow", "Hunter x Hunter", "anime", "The Charming Menace", "Theatrical, unpredictable and obsessed with potential, he treats every encounter as a game.",
        "boldness:9 compete:9 flex:8 autonomy:8 humor:7 social:6 analysis:6 invent:4 steadiness:2 structure:-6 trust:-6 warmth:-5 patience:-3", "gambler experimental playful lone strategic accelerate independent scout", "freedom", "mastery freedom"],
      ["feitan", "Feitan Portor", "Hunter x Hunter", "anime", "The Impatient Specialist", "Short-tempered, efficient and loyal to the crew, with little patience for anyone's feelings.",
        "compete:7 persist:7 boldness:7 autonomy:6 analysis:4 structure:4 steadiness:3 humor:-3 warmth:-4 social:-6 trust:-3 patience:-8", "instinctive specialist direct lone confront accelerate independent specialist", "loyalty achievement", "mastery duty"],
    ] },
    { franchise: "Demon Slayer", items: [
      ["tanjiro-kamado", "Tanjiro Kamado", "Demon Slayer", "anime", "The Compassionate Swordsman", "Kind, determined and never too proud to ask for help, he fights hard and still feels for his opponent.",
        "persist:9 warmth:9 optimism:7 trust:7 patience:6 initiative:6 steadiness:5 boldness:5 structure:4 humor:2 compete:-2", "principled systematic warm reluctant mediate steady executor anchor", "family kindness courage", "connection duty"],
      ["zenitsu-agatsuma", "Zenitsu Agatsuma", "Demon Slayer", "anime", "The Terrified Prodigy", "Loud, anxious and secretly formidable, he gets braver the moment someone else needs him.",
        "humor:7 warmth:6 social:6 persist:6 trust:6 flex:3 optimism:2 boldness:1 autonomy:-3 analysis:-2 structure:-1 steadiness:-8", "instinctive social playful reluctant avoid overthink adaptor glue", "loyalty kindness courage", "connection duty"],
      ["inosuke-hashibira", "Inosuke Hashibira", "Demon Slayer", "anime", "The Wild One", "Fearless, loud and competitive, charging at every challenge as if it's a personal invitation.",
        "boldness:9 compete:9 persist:7 initiative:7 autonomy:7 flex:6 humor:6 social:3 trust:3 warmth:1 patience:-8 structure:-8 analysis:-6", "gambler experimental commanding driver confront accelerate adaptor challenger", "freedom courage", "mastery freedom"],
    ] },
    { franchise: "Jujutsu Kaisen", items: [
      ["satoru-gojo", "Satoru Gojo", "Jujutsu Kaisen", "anime", "The Overwhelming Teacher With a Light Touch", "Playful, supremely confident and surprisingly attentive to his students, covering a lot with a joke.",
        "humor:8 boldness:8 autonomy:8 flex:7 social:6 initiative:6 analysis:5 optimism:5 warmth:4 compete:4 steadiness:3 patience:2 trust:-1 structure:-4", "instinctive experimental playful driver confront steady independent catalyst", "freedom community", "freedom connection"],
    ] },
    { franchise: "Chainsaw Man", items: [
      ["denji", "Denji", "Chainsaw Man", "anime", "The Guy Who Just Wants a Normal Life", "Simple wants, an enormous appetite for fun and a heart that gets easily touched, with a lot of damage underneath.",
        "persist:7 humor:6 boldness:6 flex:6 optimism:5 warmth:5 social:4 trust:4 structure:-8 analysis:-8 patience:-5 steadiness:-5", "instinctive experimental playful reluctant avoid accelerate adaptor catalyst", "family freedom", "connection freedom"],
    ] },
    { franchise: "Frieren", items: [
      ["frieren", "Frieren", "Frieren: Beyond Journey's End", "anime", "The Long Memory", "Unhurried, dry and quietly curious, she's learning late what the short time spent with friends meant.",
        "explore:9 patience:9 analysis:7 autonomy:7 steadiness:7 persist:7 structure:3 warmth:3 humor:3 optimism:2 initiative:-1 compete:-3 social:-5", "analytical specialist reserved reluctant withdraw steady independent scout", "knowledge humility", "curiosity connection"],
    ] },
    { franchise: "Vinland Saga", items: [
      ["thorfinn", "Thorfinn", "Vinland Saga", "anime", "The Warrior Who Became a Builder", "Driven, haunted and slowly unlearning violence, he trades a life of revenge for one of purpose.",
        "persist:9 autonomy:7 compete:6 boldness:6 patience:4 structure:4 analysis:3 warmth:3 steadiness:-1 trust:-1 optimism:-2 humor:-3 social:-4", "principled specialist reserved lone confront inward independent specialist", "honor humility freedom", "mastery justice"],
    ] },
    { franchise: "Fullmetal Alchemist", items: [
      ["roy-mustang", "Roy Mustang", "Fullmetal Alchemist", "anime", "The Charming Pragmatist With a Plan", "Smooth, strategic and a bit too fond of the long game, committed to changing things from the top.",
        "initiative:8 analysis:7 persist:7 structure:6 compete:6 social:5 warmth:5 humor:4 steadiness:4 autonomy:3 trust:3 optimism:2", "analytical systematic commanding architect strategic steady strategist strategist", "justice community achievement", "justice duty"],
    ] },
  ] });

  F.packs.characters({ id: "expansion-games", name: "Games expansion", groups: [
    { franchise: "Resident Evil", items: [
      ["barry-burton", "Barry Burton", "Resident Evil", "game", "The Dependable Veteran", "Gruff, warm and quick with a dad joke, he'd rather carry the heavy thing than watch a friend do it.",
        "warmth:7 persist:7 steadiness:6 trust:6 humor:5 boldness:5 patience:3 structure:3 initiative:3 compete:-2 analysis:-1", "principled social direct reluctant mediate steady collaborative anchor", "family loyalty", "connection duty"],
      ["rebecca-chambers", "Rebecca Chambers", "Resident Evil", "game", "The Bright Rookie", "Curious, sincere and steadier than she looks, she learns quickly and keeps people calm.",
        "analysis:7 explore:6 warmth:6 steadiness:5 persist:5 trust:5 optimism:4 flex:4 structure:3 initiative:2 boldness:2 humor:2", "analytical explorer warm reluctant mediate steady strategist specialist", "knowledge kindness", "curiosity duty"],
    ] },
    { franchise: "Mass Effect", items: [
      ["tali-zorah", "Tali'Zorah", "Mass Effect", "game", "The Careful Engineer Far From Home", "Warm, earnest and quietly brave, she balances duty to her people with a growing circle of friends.",
        "invent:7 analysis:7 warmth:6 persist:6 structure:5 trust:5 steadiness:4 optimism:3 humor:3 initiative:2 boldness:2 social:1", "analytical experimental warm reluctant mediate steady collaborative specialist", "community family", "duty curiosity"],
      ["wrex", "Urdnot Wrex", "Mass Effect", "game", "The Veteran Who Plays the Long Game", "Gruff, patient and darkly funny, with a sense of history that makes his bluntness feel like wisdom.",
        "steadiness:8 persist:8 boldness:7 initiative:6 autonomy:6 compete:5 humor:5 analysis:5 structure:4 patience:4 warmth:3 trust:2", "principled specialist direct driver confront steady strategist anchor", "honor community", "duty justice"],
    ] },
    { franchise: "Persona", items: [
      ["ren-amamiya", "Ren Amamiya", "Persona 5", "game", "The Quiet Leader of a Secret Crew", "Calm, adaptable and effortlessly connected to everyone, he leads by listening and picking his moment.",
        "flex:8 steadiness:7 social:6 analysis:6 trust:6 initiative:6 boldness:6 persist:6 humor:5 warmth:5 structure:3", "consulting social warm driver strategic steady adaptor glue", "justice loyalty freedom", "justice connection"],
      ["ryuji-sakamoto", "Ryuji Sakamoto", "Persona 5", "game", "The Loud, Loyal Friend", "Impulsive, funny and fiercely loyal, he's the first to say out loud what everyone else is thinking.",
        "humor:7 social:7 boldness:6 warmth:6 trust:6 optimism:5 persist:5 compete:4 steadiness:-2 structure:-5 analysis:-4 patience:-5", "instinctive experimental playful reluctant confront accelerate adaptor catalyst", "loyalty freedom", "connection justice"],
      ["ann-takamaki", "Ann Takamaki", "Persona 5", "game", "The Warm Spark", "Kind, direct and braver than she thinks, she cares loudly and stands up for people who can't.",
        "warmth:8 boldness:6 trust:6 social:6 persist:5 optimism:5 humor:4 initiative:4 flex:4 steadiness:2 compete:2 structure:-2", "consulting social warm reluctant confront people collaborative glue", "kindness justice loyalty", "connection justice"],
    ] },
    { franchise: "Metal Gear", items: [
      ["solid-snake", "Solid Snake", "Metal Gear", "game", "The Reluctant Soldier", "Dry, solitary and weary, with a sense of duty he won't admit he'd like to put down.",
        "persist:8 steadiness:7 flex:7 autonomy:8 analysis:6 boldness:6 initiative:5 humor:3 warmth:3 trust:-3 optimism:-3 social:-5", "analytical experimental reserved lone strategic steady independent scout", "honor freedom", "duty freedom"],
    ] },
    { franchise: "Red Dead Redemption", items: [
      ["arthur-morgan", "Arthur Morgan", "Red Dead Redemption", "game", "The Outlaw Who Chose a Conscience", "Gruff, loyal and reflective, a man of rough edges who finds out late that he can be better.",
        "persist:8 boldness:6 warmth:5 steadiness:5 autonomy:6 initiative:5 humor:4 trust:3 social:2 structure:2 patience:2 analysis:2 optimism:-3", "principled experimental direct reluctant confront steady adaptor anchor", "loyalty honor humility", "duty freedom"],
    ] },
    { franchise: "Half-Life", items: [
      ["alyx-vance", "Alyx Vance", "Half-Life", "game", "The Resourceful Hacker With Heart", "Quick-witted, practical and unfailingly warm, she keeps a resistance running with equal parts competence and humor.",
        "flex:8 invent:7 analysis:6 warmth:6 humor:6 boldness:6 persist:6 initiative:5 trust:5 optimism:5 steadiness:4 autonomy:3", "analytical experimental playful driver mediate steady adaptor catalyst", "loyalty freedom creativity", "curiosity connection"],
    ] },
    { franchise: "Portal", items: [
      ["chell", "Chell", "Portal", "game", "The Silent Test Subject Who Refuses to Quit", "Wordless, relentless and endlessly resourceful, she solves the puzzle and then walks out the door.",
        "persist:9 autonomy:8 analysis:7 flex:7 steadiness:7 explore:6 boldness:5 patience:4 compete:3 humor:1 trust:-1 social:-6", "analytical experimental reserved lone strategic steady independent scout", "freedom", "freedom curiosity"],
    ] },
    { franchise: "Cyberpunk 2077", items: [
      ["johnny-silverhand", "Johnny Silverhand", "Cyberpunk 2077", "game", "The Loud Rebel and His Regrets", "Cynical, defiant and nostalgic, he'd burn it all down and still want to be proven right.",
        "boldness:9 autonomy:9 compete:6 initiative:6 humor:6 persist:6 social:4 invent:4 trust:-5 warmth:-1 optimism:-4 steadiness:-5 structure:-7 patience:-8", "instinctive experimental commanding lone confront accelerate independent challenger", "freedom creativity", "freedom justice"],
    ] },
    { franchise: "God of War", items: [
      ["atreus", "Atreus", "God of War", "game", "The Curious Kid Learning What It Means to Be an Heir", "Eager, thoughtful and sensitive to his father's silence, he reads people better than he's given credit for.",
        "explore:8 warmth:7 analysis:6 flex:6 optimism:5 persist:5 trust:5 initiative:3 humor:3 steadiness:1 boldness:2 patience:-1", "consulting explorer warm reluctant mediate overthink adaptor scout", "knowledge family kindness", "curiosity connection"],
    ] },
  ] });

  F.packs.characters({ id: "expansion-screen", name: "Film and television expansion", groups: [
    { franchise: "Pirates of the Caribbean", items: [
      ["jack-sparrow", "Jack Sparrow", "Pirates of the Caribbean", "movie", "The Charming Chaos With a Plan (Sort Of)", "Slippery, theatrical and constantly improvising, he seems to stumble into success by cultivating luck.",
        "flex:9 humor:9 boldness:8 autonomy:8 social:6 invent:5 initiative:5 analysis:4 compete:3 structure:-9 trust:-3 patience:-2 steadiness:-1", "gambler experimental playful lone strategic accelerate adaptor catalyst", "freedom", "freedom mastery"],
    ] },
    { franchise: "Star Wars", items: [
      ["qui-gon-jinn", "Qui-Gon Jinn", "Star Wars", "movie", "The Maverick Mentor", "Calm, independent and willing to follow his own conscience even when the order frowns on it.",
        "steadiness:8 patience:7 autonomy:7 warmth:6 flex:6 trust:6 persist:6 explore:5 initiative:5 humor:1 structure:-2 compete:-3", "principled explorer warm reluctant mediate steady independent anchor", "kindness freedom courage", "justice freedom"],
    ] },
    { franchise: "Ghostbusters", items: [
      ["peter-venkman", "Peter Venkman", "Ghostbusters", "movie", "The Smooth Talker Who Gets It Done", "Sarcastic, charismatic and allergic to formality, he's lazier than he looks and sharper than anyone assumes.",
        "humor:9 social:8 flex:7 boldness:5 initiative:5 autonomy:5 analysis:4 compete:4 steadiness:3 warmth:3 trust:1 structure:-6 patience:-3", "instinctive social playful driver avoid people adaptor catalyst", "freedom community", "freedom connection"],
      ["ray-stantz", "Ray Stantz", "Ghostbusters", "movie", "The Enthusiastic Believer", "Wide-eyed, warm and thrilled by every strange thing, he's the heart of the team and the reason it started.",
        "optimism:9 explore:8 warmth:8 trust:8 invent:6 humor:5 social:5 analysis:4 persist:4 structure:-2 steadiness:-1 compete:-4", "consulting explorer warm servant avoid people collaborative glue", "knowledge kindness", "curiosity connection"],
      ["egon-spengler", "Egon Spengler", "Ghostbusters", "movie", "The Brilliant, Literal Mind", "Deadpan, precise and fascinated by everything, he explains the apocalypse with perfect calm.",
        "analysis:10 explore:7 invent:7 structure:6 steadiness:6 persist:6 patience:5 autonomy:4 humor:3 warmth:2 boldness:1 social:-5", "analytical specialist reserved architect strategic steady strategist specialist", "knowledge", "curiosity mastery"],
    ] },
    { franchise: "The Office", items: [
      ["dwight-schrute", "Dwight Schrute", "The Office", "show", "The Intense Rule-Follower", "Serious, ambitious and unfailingly loyal to a code only he fully understands, unintentionally hilarious and surprisingly capable.",
        "compete:9 structure:8 persist:8 initiative:7 boldness:5 autonomy:5 optimism:3 analysis:3 social:1 warmth:1 trust:1 humor:-1 patience:-3 flex:-4", "principled systematic commanding driver confront accelerate executor challenger", "loyalty honor achievement", "mastery duty"],
      ["jim-halpert", "Jim Halpert", "The Office", "show", "The Easygoing Prankster With Hidden Ambition", "Dry, warm and quietly observant, he treats life as a joke he's in on, until something matters.",
        "humor:9 social:6 warmth:6 flex:6 optimism:5 trust:5 analysis:4 persist:3 steadiness:3 patience:3 compete:2 initiative:2 structure:-3", "instinctive social playful reluctant avoid steady adaptor glue", "loyalty kindness", "connection freedom"],
      ["pam-beesly", "Pam Beesly", "The Office", "show", "The Quiet Creative Who Grew Louder", "Warm, observant and gradually braver about what she wants, a quietly stubborn artist at the heart of the office.",
        "warmth:8 invent:6 trust:6 patience:6 persist:6 humor:5 optimism:5 steadiness:4 social:3 autonomy:3 initiative:2 boldness:2 compete:-4", "consulting experimental warm reluctant avoid steady collaborative glue", "kindness creativity community", "connection curiosity"],
    ] },
    { franchise: "Brooklyn Nine-Nine", items: [
      ["jake-peralta", "Jake Peralta", "Brooklyn Nine-Nine", "show", "The Immature Genius", "Goofy, driven and always performing, with a sharp instinct under the jokes and a deep need to be good at his job.",
        "humor:9 boldness:7 social:7 persist:7 initiative:7 compete:7 flex:6 warmth:6 optimism:6 analysis:5 trust:5 structure:-5 patience:-4", "instinctive experimental playful driver confront accelerate adaptor catalyst", "loyalty justice achievement", "mastery connection"],
      ["amy-santiago", "Amy Santiago", "Brooklyn Nine-Nine", "show", "The Overprepared Overachiever", "Organized, competitive and sincere to the bone, she makes binders and means every word.",
        "structure:10 persist:8 compete:8 initiative:6 analysis:6 warmth:6 trust:5 humor:3 social:3 steadiness:2 boldness:2 patience:-1 flex:-3", "principled systematic direct driver confront overthink executor strategist", "achievement loyalty justice", "mastery duty"],
      ["raymond-holt", "Raymond Holt", "Brooklyn Nine-Nine", "show", "The Deadpan Authority", "Formal, precise and almost never smiling, a leader whose dry wit is the best-kept secret in the room.",
        "steadiness:9 structure:8 analysis:7 persist:7 initiative:6 patience:6 trust:5 humor:4 autonomy:4 warmth:3 boldness:2 compete:2 social:-3 flex:-3", "principled systematic reserved architect strategic steady executor anchor", "honor justice loyalty", "duty mastery"],
    ] },
    { franchise: "House M.D.", items: [
      ["gregory-house", "Gregory House", "House M.D.", "show", "The Brilliant Misanthrope", "Sharp, sarcastic and addicted to the puzzle, he insults people while quietly caring about the answer.",
        "analysis:10 autonomy:9 compete:8 persist:8 humor:7 boldness:6 flex:5 invent:5 warmth:-3 social:-3 steadiness:-3 structure:-4 patience:-6 optimism:-6 trust:-7", "analytical specialist direct lone confront inward independent challenger", "truth knowledge", "curiosity mastery"],
    ] },
    { franchise: "Doctor Who", items: [
      ["the-doctor", "The Doctor", "Doctor Who", "show", "The Curious Traveler Who Runs Toward Trouble", "Chatty, brilliant and endlessly curious, a traveler who talks their way through danger and cares too much to stay away.",
        "explore:10 optimism:8 analysis:8 flex:8 humor:7 invent:7 boldness:7 autonomy:7 initiative:6 warmth:6 social:5 trust:5 structure:-5 patience:-3 steadiness:-1", "instinctive explorer playful lone mediate accelerate adaptor scout", "knowledge kindness freedom", "curiosity justice"],
    ] },
    { franchise: "Friends", items: [
      ["chandler-bing", "Chandler Bing", "Friends", "show", "The Anxious Joker", "Quick with a quip, loyal to a fault and often using humor to dodge what he actually feels.",
        "humor:9 social:6 warmth:6 trust:5 flex:4 persist:3 optimism:2 structure:1 analysis:2 initiative:-1 boldness:-3 steadiness:-4", "consulting social playful reluctant avoid people collaborative glue", "loyalty kindness", "connection"],
      ["monica-geller", "Monica Geller", "Friends", "show", "The Intensely Organized Host", "Competitive, warm and ruthlessly tidy, she feeds everyone, plans everything and wins at games on principle.",
        "structure:9 compete:9 persist:8 warmth:7 initiative:7 social:5 trust:4 humor:4 analysis:3 optimism:3 flex:-2 patience:-2 steadiness:-1", "principled systematic direct driver confront accelerate executor glue", "family loyalty achievement", "mastery connection"],
    ] },
  ] });

  F.packs.characters({ id: "expansion-literature", name: "Literature expansion", groups: [
    { franchise: "Les Misérables", items: [
      ["jean-valjean", "Jean Valjean", "Les Misérables", "book", "The Man Who Chose to Be Better", "Heavy with a hard past, he answers kindness with a lifetime of quiet service.",
        "persist:9 warmth:8 steadiness:7 patience:6 trust:5 structure:5 initiative:4 autonomy:3 optimism:1 humor:-1 social:-2 compete:-4", "principled specialist warm reluctant mediate steady executor anchor", "kindness justice humility", "duty connection"],
    ] },
    { franchise: "The Count of Monte Cristo", items: [
      ["edmond-dantes", "Edmond Dantès", "The Count of Monte Cristo", "book", "The Patient Architect of a Revenge", "Charming, brilliant and patient, a man reshaped by betrayal into someone who plans for years.",
        "analysis:9 persist:9 structure:8 patience:8 autonomy:8 initiative:7 steadiness:6 compete:6 flex:5 humor:3 social:3 warmth:-1 optimism:-3 trust:-5", "analytical systematic commanding architect strategic steady strategist strategist", "justice honor", "justice mastery"],
    ] },
    { franchise: "Pride and Prejudice", items: [
      ["mr-darcy", "Mr. Darcy", "Pride and Prejudice", "book", "The Proud Heart That Learned to Listen", "Reserved, principled and awkward with strangers, he changes slowly and for good once he's proved wrong.",
        "structure:7 steadiness:7 persist:6 autonomy:6 analysis:5 warmth:5 trust:3 initiative:3 compete:3 patience:2 humor:1 flex:-3 social:-6", "principled specialist reserved reluctant withdraw steady executor anchor", "honor humility loyalty", "duty connection"],
    ] },
    { franchise: "Dracula", items: [
      ["dracula", "Count Dracula", "Dracula", "book", "The Charming Predator of Centuries", "Courteous, patient and wholly self-possessed, he's seductive precisely because he never hurries.",
        "autonomy:9 patience:9 persist:8 analysis:7 initiative:7 compete:7 structure:6 boldness:6 steadiness:7 social:4 flex:3 humor:1 optimism:-4 trust:-7 warmth:-8", "analytical specialist commanding lone strategic steady independent strategist", "achievement freedom", "mastery freedom"],
    ] },
    { franchise: "Frankenstein", items: [
      ["victor-frankenstein", "Victor Frankenstein", "Frankenstein", "book", "The Genius Who Can't Face the Consequences", "Brilliant, obsessive and unable to take responsibility, he ruins himself by running from what he's made.",
        "invent:9 explore:8 analysis:7 persist:7 autonomy:7 compete:5 structure:3 warmth:-1 trust:-3 optimism:-3 patience:-4 steadiness:-6 social:-6", "analytical specialist reserved lone avoid overthink independent specialist", "knowledge achievement", "curiosity mastery"],
    ] },
    { franchise: "The Picture of Dorian Gray", items: [
      ["dorian-gray", "Dorian Gray", "The Picture of Dorian Gray", "book", "The Beautiful Self-Deception", "Charming, impressionable and increasingly hollow, a man who stays young while everything else falls apart.",
        "social:7 flex:6 autonomy:6 humor:5 boldness:5 explore:5 compete:3 optimism:-1 persist:-3 warmth:-3 trust:-3 steadiness:-5 patience:-5 structure:-6", "instinctive social playful lone avoid inward adaptor catalyst", "freedom creativity", "freedom"],
    ] },
  ] });

  F.packs.characters({ id: "expansion-myth", name: "Mythology expansion", groups: [
    { franchise: "Norse Mythology", items: [
      ["odin", "Odin", "Norse mythology", "myth", "The Wanderer Who Pays for Wisdom", "Restless, calculating and willing to sacrifice anything for knowledge, he rules by foresight and secrecy.",
        "explore:9 analysis:8 initiative:8 autonomy:8 persist:8 boldness:6 steadiness:5 structure:5 compete:5 humor:1 warmth:1 optimism:-3 trust:-4", "analytical explorer commanding lone strategic steady strategist scout", "knowledge honor", "curiosity duty"],
      ["loki-norse", "Loki (Loki Laufeyson)", "Norse mythology", "myth", "The Trickster Who Can't Stay Out of Trouble", "Clever, mercurial and impossible to pin down, he lives for the loophole and the punchline.",
        "flex:9 humor:8 invent:8 analysis:6 boldness:6 social:5 autonomy:7 compete:5 persist:3 warmth:-1 steadiness:-3 patience:-5 trust:-5 structure:-7", "gambler experimental playful lone strategic accelerate adaptor catalyst", "freedom creativity", "freedom mastery"],
    ] },
    { franchise: "Egyptian Mythology", items: [
      ["anubis", "Anubis", "Egyptian mythology", "myth", "The Quiet Judge of Every Heart", "Composed, impartial and solemn, he weighs everyone fairly and takes the task seriously.",
        "steadiness:9 patience:8 structure:8 persist:7 analysis:6 autonomy:5 warmth:3 trust:2 initiative:2 optimism:-1 compete:-2 humor:-3 social:-4", "principled systematic reserved reluctant mediate steady executor anchor", "justice truth humility", "duty justice"],
    ] },
    { franchise: "Arthurian Legends", items: [
      ["king-arthur", "King Arthur", "Arthurian legend", "myth", "The Ideal King Trying to Keep the Dream Together", "Earnest, fair and burdened by his own ideals, he leads by trusting the best in people, even when it hurts him.",
        "initiative:8 warmth:7 trust:7 persist:7 steadiness:6 structure:6 boldness:6 patience:5 optimism:5 analysis:3 autonomy:2 compete:2", "principled systematic warm architect mediate steady strategist anchor", "honor justice community", "duty justice"],
      ["merlin", "Merlin", "Arthurian legend", "myth", "The Long-Sighted Advisor", "Wry, strange and always a few moves ahead, he gives guidance the way a riddle gives answers.",
        "analysis:9 explore:8 invent:7 autonomy:7 flex:6 patience:6 humor:5 steadiness:5 persist:5 warmth:4 initiative:3 optimism:2 structure:1 social:-2", "analytical explorer playful reluctant strategic steady independent strategist", "knowledge humility", "curiosity duty"],
    ] },
    { franchise: "Hindu Mythology", items: [
      ["arjuna", "Arjuna", "Hindu epics", "myth", "The Archer Who Needed a Reason", "Disciplined, gifted and at his most human when he hesitates, he asks the hardest question at the worst possible moment.",
        "persist:8 structure:7 analysis:6 compete:6 steadiness:5 warmth:5 patience:5 trust:5 boldness:5 initiative:5 autonomy:3 humor:1 optimism:1", "principled systematic direct reluctant mediate overthink executor specialist", "honor courage humility", "duty mastery"],
      ["hanuman", "Hanuman", "Hindu epics", "myth", "The Devoted Powerhouse", "Strong, humble and tireless in service, he leaps first and credits everyone else afterward.",
        "persist:10 boldness:8 warmth:7 trust:7 initiative:6 steadiness:6 optimism:6 flex:5 humor:4 structure:3 autonomy:2 compete:-3", "instinctive experimental warm servant avoid steady executor anchor", "loyalty humility courage", "duty connection"],
    ] },
  ] });
})(typeof Forge !== "undefined" ? Forge : (globalThis.Forge = globalThis.Forge || {}));
if (typeof module !== "undefined" && module.exports) module.exports = Forge;
