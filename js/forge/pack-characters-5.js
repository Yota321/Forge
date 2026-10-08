/* =========================================================================
   CHARACTER PACK 5 (video games). Same row format as pack-characters-3.js.
   Notes live in pack-character-notes-4.js, emblems in pack-emblems-3.js.
   ========================================================================= */
(function(F){
  "use strict";
  if (!F.packs) return;

  F.packs.characters({ id: "games-1", name: "Video game casts", groups: [
    { franchise: "Baldur's Gate 3", items: [
      ["astarion", "Astarion", "Baldur's Gate 3", "game", "The Vain Survivor Who Wears Sarcasm Like Armour", "Glib, poised and constantly performing, he uses charm as a tool and cruelty as a shield, and is far more frightened of being unwanted than of being hunted.",
        "autonomy:8 flex:7 humor:7 social:6 compete:5 persist:5 boldness:4 patience:-3 structure:-2 warmth:0 steadiness:-1 optimism:-3 trust:-6", "instinctive experimental playful lone avoid inward independent challenger", "freedom achievement", "freedom"],
      ["shadowheart", "Shadowheart", "Baldur's Gate 3", "game", "The Guarded Cleric Who Does Not Know What She Believes", "Dry, watchful and carefully self-contained, she keeps her past at arm's length and shows care through small, quiet acts she would deny.",
        "autonomy:7 persist:6 steadiness:5 structure:5 analysis:4 boldness:3 humor:3 warmth:3 patience:3 initiative:2 social:-3 optimism:-2 trust:-3", "cautious specialist reserved reluctant avoid inward independent specialist", "loyalty honor", "freedom duty"],
      ["gale-dekarios", "Gale of Waterdeep", "Baldur's Gate 3", "game", "The Theatrical Wizard With a Very Large Heart", "Learned, long-winded and sincerely warm, he explains everything, cooks for everyone and has an alarming weakness for the arcane.",
        "analysis:8 explore:7 warmth:7 social:6 humor:6 persist:5 optimism:3 compete:3 trust:4 initiative:3 autonomy:3 structure:2 steadiness:0 patience:3", "analytical specialist playful reluctant avoid overthink independent specialist", "knowledge kindness creativity", "curiosity connection"],
      ["karlach", "Karlach", "Baldur's Gate 3", "game", "The Barbarian With the Warmest Heart in the Realm", "Boisterous, affectionate and fiercely alive, she hugs, brawls and savours every ordinary pleasure as if it might be taken away, because it nearly was.",
        "warmth:9 boldness:8 optimism:7 social:7 humor:6 persist:7 trust:6 flex:5 initiative:4 steadiness:3 compete:2 patience:-3 structure:-5 analysis:-3", "instinctive social warm driver confront accelerate adaptor catalyst", "kindness courage freedom", "freedom connection"],
      ["wyll-ravengard", "Wyll Ravengard", "Baldur's Gate 3", "game", "The Dashing Hero Who Made a Terrible Deal", "Charming, dutiful and keen to do the right thing, he leads with an easy smile and a very private burden.",
        "social:6 initiative:6 boldness:6 persist:6 warmth:5 trust:5 structure:4 steadiness:4 compete:3 humor:3 optimism:3 analysis:3 autonomy:2", "principled social warm driver mediate steady executor catalyst", "honor courage justice", "justice duty"],
      ["laezel", "Lae'zel", "Baldur's Gate 3", "game", "The Blunt Warrior Who Expects You to Keep Up", "Uncompromising, disciplined and proud of it, she demands excellence, says exactly what she thinks and has a very secret soft spot for those who earn it.",
        "boldness:8 persist:7 compete:7 autonomy:6 structure:6 initiative:6 steadiness:6 warmth:1 flex:-2 humor:0 social:-2 patience:-3 trust:-3", "principled specialist commanding driver confront accelerate executor challenger", "honor achievement", "mastery duty"]
    ] },
    { franchise: "Cyberpunk 2077", items: [
      ["v-cyberpunk", "V", "Cyberpunk 2077", "game", "The Ambitious Merc Racing the Clock", "Driven, adaptable and a little reckless, V takes the big job to prove something and slowly learns what a short, bright life is for.",
        "boldness:7 initiative:6 autonomy:6 flex:6 persist:6 compete:5 humor:4 warmth:4 trust:3 social:3 steadiness:2 analysis:2 structure:-3 optimism:-1", "instinctive experimental direct driver confront accelerate adaptor scout", "freedom loyalty achievement", "mastery freedom"],
      ["judy-alvarez", "Judy Alvarez", "Cyberpunk 2077", "game", "The Gifted Braindance Editor Who Cares Too Much", "Quiet, sharp and deeply loyal, she fixes broken machines and broken people with the same patient attention, and carries her friends' pain.",
        "invent:7 analysis:6 warmth:6 autonomy:5 persist:5 steadiness:3 patience:3 boldness:3 flex:3 trust:1 humor:2 structure:2 social:-2 optimism:-2", "analytical experimental reserved reluctant avoid inward independent specialist", "kindness creativity loyalty", "connection mastery"],
      ["panam-palmer", "Panam Palmer", "Cyberpunk 2077", "game", "The Nomad Who Puts Family First", "Hot-tempered, loyal and fiercely practical, she trusts slowly, drives fast and holds her clan together with sheer stubbornness.",
        "boldness:8 autonomy:7 persist:7 warmth:6 initiative:6 flex:6 compete:4 humor:3 trust:2 steadiness:3 social:2 patience:-3 structure:-2 optimism:2", "instinctive experimental direct driver confront accelerate adaptor scout", "family loyalty freedom", "freedom connection"]
    ] },
    { franchise: "Disco Elysium", items: [
      ["harry-du-bois", "Harry Du Bois", "Disco Elysium", "game", "The Wrecked Detective With a Brilliant Mind", "Chaotic, curious and deeply self-sabotaging, he argues with his own head, and is still, somehow, the best person for the case.",
        "analysis:7 explore:6 humor:6 flex:7 warmth:5 persist:4 social:3 boldness:3 autonomy:3 trust:2 patience:-2 initiative:1 optimism:-3 structure:-7 steadiness:-8", "analytical experimental playful reluctant avoid overthink independent specialist", "truth justice kindness", "curiosity justice"],
      ["kim-kitsuragi", "Kim Kitsuragi", "Disco Elysium", "game", "The Methodical Lieutenant Who Keeps the Case Together", "Calm, observant and dryly funny, he takes notes, holds the line and politely refuses to be anything other than good at his job.",
        "structure:9 steadiness:8 analysis:7 patience:7 persist:6 trust:4 warmth:4 autonomy:3 humor:3 initiative:3 flex:2 social:1", "cautious systematic reserved reluctant mediate steady executor glue", "honor truth community", "duty justice"]
    ] },
    { franchise: "Fire Emblem", items: [
      ["edelgard-von-hresvelg", "Edelgard", "Fire Emblem: Three Houses", "game", "The Unyielding Heir Who Will Remake the World", "Resolute, disciplined and sure of her cause, she carries a vision no one else will agree to and does the grim work herself.",
        "initiative:9 persist:9 structure:7 autonomy:7 analysis:6 boldness:6 steadiness:6 compete:5 patience:3 warmth:2 optimism:-2 humor:-2 flex:-3 trust:-3", "principled systematic commanding architect confront inward executor anchor", "justice achievement", "justice mastery"],
      ["dimitri-alexandre-blaiddyd", "Dimitri", "Fire Emblem: Three Houses", "game", "The Gentle Prince Marked by Loss", "Earnest, honourable and kind, he is the sort of heir people swear to, with a tender heart under a very heavy past.",
        "persist:7 structure:6 warmth:6 trust:5 boldness:5 initiative:5 compete:3 analysis:2 humor:0 steadiness:-1 optimism:-3", "principled systematic warm driver confront inward executor anchor", "honor justice kindness", "duty justice"],
      ["claude-von-riegan", "Claude von Riegan", "Fire Emblem: Three Houses", "game", "The Charming Schemer With a Plan for Everyone", "Clever, easygoing and secretly serious, he collects allies, hides his depths and quietly aims to make the border disappear.",
        "analysis:7 flex:8 social:7 explore:6 initiative:6 humor:6 warmth:5 autonomy:5 steadiness:5 optimism:5 patience:5 compete:4 trust:3", "analytical explorer playful architect strategic steady strategist catalyst", "freedom community knowledge", "curiosity freedom"]
    ] },
    { franchise: "Dragon Age", items: [
      ["varric-tethras", "Varric Tethras", "Dragon Age", "game", "The Storyteller Who Knows Everyone's Business", "Wry, sociable and quietly loyal, he turns every crisis into a story and every stranger into a friend, and keeps one private ache close.",
        "humor:9 social:8 flex:7 warmth:6 trust:5 autonomy:5 analysis:4 invent:4 steadiness:4 boldness:3 optimism:2 initiative:2 patience:2 structure:-4", "consulting social playful reluctant mediate people adaptor glue", "loyalty creativity community", "connection freedom"],
      ["alistair", "Alistair", "Dragon Age: Origins", "game", "The Reluctant Warden Who Keeps Joking", "Earnest, awkward and generous, he deflects his self-doubt with humour and carries more responsibility than he asked for.",
        "warmth:7 humor:7 persist:6 trust:6 social:4 flex:3 boldness:3 structure:2 optimism:2 steadiness:1 compete:-2 autonomy:-2 initiative:-3", "cautious social playful reluctant avoid inward collaborative glue", "loyalty honor humility", "connection duty"],
      ["morrigan", "Morrigan", "Dragon Age: Origins", "game", "The Wild Witch Who Distrusts Kindness", "Sharp, self-reliant and sardonic, she judges the soft-hearted harshly and watches, in spite of herself, how much they get right.",
        "autonomy:9 analysis:7 compete:6 explore:6 persist:6 steadiness:5 boldness:5 flex:5 humor:4 patience:2 warmth:-1 social:-3 optimism:-2 trust:-6", "analytical experimental direct lone confront steady independent specialist", "freedom knowledge", "freedom mastery"],
      ["leliana", "Leliana", "Dragon Age", "game", "The Spymaster With a Songbird's Heart", "Gracious, devout and quietly ruthless, she balances faith and espionage with a warm voice and a very exact ledger.",
        "analysis:7 structure:6 flex:6 persist:6 warmth:5 autonomy:5 steadiness:5 patience:5 social:4 boldness:4 initiative:4 humor:3 trust:2 compete:2 optimism:1", "analytical systematic warm architect strategic steady strategist anchor", "justice kindness loyalty", "justice duty"],
      ["solas", "Solas", "Dragon Age", "game", "The Scholar Who Is Not What He Says", "Calm, courteous and burdened by a very old aim, he teaches, listens and never quite tells you what he wants.",
        "analysis:8 explore:8 autonomy:8 persist:8 patience:7 steadiness:6 initiative:6 structure:3 compete:3 warmth:3 humor:1 social:-1 optimism:-2 trust:-3", "analytical specialist reserved architect strategic inward independent strategist", "knowledge justice freedom", "curiosity justice"],
      ["dorian-pavus", "Dorian Pavus", "Dragon Age: Inquisition", "game", "The Magnificent Mage With an Open Wound", "Witty, flamboyant and unexpectedly vulnerable, he fills a room with banter and a library with opinions, and cares more than he lets on.",
        "social:8 humor:8 flex:6 warmth:6 analysis:6 autonomy:5 persist:5 boldness:4 trust:4 compete:3 optimism:2 steadiness:2 structure:1", "analytical social playful reluctant confront people independent catalyst", "freedom kindness creativity", "freedom connection"]
    ] },
    { franchise: "Mass Effect", items: [
      ["mordin-solus", "Mordin Solus", "Mass Effect", "game", "The Manic Scientist With a Conscience", "Fast, precise and endlessly curious, he talks in bullet points, sings when working and weighs every ethical cost very carefully.",
        "analysis:9 invent:7 explore:6 humor:6 persist:6 social:5 initiative:5 steadiness:5 warmth:4 flex:4 structure:3 optimism:3 autonomy:3 compete:2 patience:-3", "analytical experimental playful driver strategic accelerate independent specialist", "knowledge justice humility", "curiosity duty"],
      ["thane-krios", "Thane Krios", "Mass Effect", "game", "The Quiet Assassin Seeking Peace", "Calm, reflective and measured, he speaks softly, moves silently and is more interested in his regrets than his reputation.",
        "steadiness:8 patience:8 autonomy:6 persist:6 analysis:5 structure:5 warmth:4 trust:2 humor:1 boldness:4 social:-3 optimism:-4", "principled specialist reserved lone avoid steady independent specialist", "honor family humility", "duty justice"],
      ["jack-subject-zero", "Jack", "Mass Effect", "game", "The Furious Survivor Who Learns to Stay", "Hard, angry and fiercely guarded, she pushes everyone away first and, once someone passes the test, would take any hit for them.",
        "boldness:8 autonomy:8 persist:6 compete:5 humor:3 warmth:0 analysis:0 steadiness:-3 social:-4 optimism:-4 trust:-6 structure:-6 patience:-7", "instinctive experimental direct lone confront accelerate independent challenger", "freedom loyalty", "freedom connection"],
      ["legion", "Legion", "Mass Effect", "game", "The Machine Asking What It Means to Be a Person", "Logical, patient and sincerely curious, it studies what it means to choose and is willing to be changed by the answer.",
        "analysis:9 explore:7 structure:7 steadiness:7 patience:6 persist:6 trust:3 flex:2 autonomy:2 warmth:1 social:-2 humor:-3", "analytical systematic reserved reluctant mediate steady collaborative specialist", "truth knowledge", "curiosity duty"]
    ] },
    { franchise: "The Witcher", items: [
      ["triss-merigold", "Triss Merigold", "The Witcher", "game", "The Warm Sorceress Who Hides Behind Friends", "Kind, quick and a bit self-effacing, she keeps friends alive with magic and loyalty and occasionally forgets her own safety.",
        "warmth:8 social:6 flex:5 trust:5 humor:4 analysis:5 persist:5 steadiness:3 initiative:3 optimism:2 autonomy:1 structure:-1", "consulting social warm reluctant mediate people collaborative glue", "kindness loyalty community", "connection justice"],
      ["vesemir", "Vesemir", "The Witcher", "game", "The Old Witcher Who Raised Them All", "Gruff, experienced and quietly proud, he trains the next generation with sharp words, a long memory and an enormous, unspoken tenderness.",
        "steadiness:8 patience:7 persist:7 structure:5 analysis:5 warmth:5 autonomy:3 trust:2 humor:2 optimism:-3", "principled systematic direct servant mediate steady executor anchor", "family honor", "duty connection"]
    ] },
    { franchise: "Elden Ring", items: [
      ["melina", "Melina", "Elden Ring", "game", "The Quiet Guide With Her Own Purpose", "Calm, patient and distant, she offers help, a place to rest and almost nothing about herself.",
        "patience:7 steadiness:7 persist:7 autonomy:5 analysis:3 warmth:3 trust:2 initiative:2 optimism:-1 humor:-2 social:-3", "cautious specialist reserved servant avoid steady independent anchor", "duty humility", "duty freedom"],
      ["ranni-the-witch", "Ranni", "Elden Ring", "game", "The Cold Queen Playing a Long, Lonely Game", "Cool, clever and patient to a fault, she plots across ages and treats those who help her with unexpected, careful kindness.",
        "autonomy:9 analysis:8 patience:8 initiative:7 persist:7 explore:6 steadiness:6 structure:3 compete:3 warmth:1 humor:2 trust:-4 social:-5 optimism:-3", "analytical explorer reserved lone strategic inward strategist specialist", "freedom knowledge", "freedom mastery"],
      ["malenia", "Malenia", "Elden Ring", "game", "The Unbowed Blade With a Terrible Duty", "Courteous, exacting and devastatingly proud, she has never lost and has carried a quiet suffering for very long.",
        "persist:10 boldness:8 steadiness:7 compete:7 structure:6 autonomy:6 patience:5 initiative:5 warmth:2 trust:-2 humor:-3 social:-4 optimism:-6", "principled specialist direct lone confront steady executor challenger", "honor duty", "mastery duty"]
    ] },
    { franchise: "Dark Souls", items: [
      ["solaire-of-astora", "Solaire of Astora", "Dark Souls", "game", "The Cheerful Knight Praising the Sun", "Warm, upbeat and devoted to a very odd, very personal quest, he turns a world of despair into a place where a friendly hand is possible.",
        "optimism:9 persist:8 warmth:7 trust:6 boldness:6 social:5 humor:5 steadiness:5 structure:3 initiative:3 flex:1 analysis:-2", "instinctive social warm reluctant mediate steady executor catalyst", "courage kindness", "mastery connection"],
      ["artorias", "Artorias", "Dark Souls", "game", "The Noble Knight Who Walked Into the Abyss", "Dutiful, brave and entirely self-sacrificing, he faces the worst the world has with a straight back and an unfailing belief in what he owes.",
        "persist:8 boldness:7 steadiness:6 structure:6 autonomy:4 trust:3 warmth:3 patience:2 humor:-2 optimism:-3", "principled specialist direct lone confront steady executor anchor", "honor courage loyalty", "duty justice"]
    ] },
    { franchise: "Bloodborne", items: [
      ["lady-maria", "Lady Maria", "Bloodborne", "game", "The Haunted Hunter Who Refuses to Rest", "Elegant, relentless and weary, she keeps a lonely vigil over a past she cannot put down.",
        "persist:8 autonomy:7 steadiness:6 structure:6 boldness:6 analysis:5 patience:4 warmth:2 humor:-3 trust:-3 social:-6 optimism:-6", "principled specialist reserved lone withdraw inward independent specialist", "honor duty", "duty freedom"],
      ["eileen-the-crow", "Eileen the Crow", "Bloodborne", "game", "The Honourable Hunter of Hunters", "Direct, steady and quietly principled, she cleans up other people's mistakes and keeps a code the city forgot.",
        "persist:8 steadiness:7 structure:6 boldness:6 warmth:5 autonomy:5 initiative:4 trust:3 patience:3 humor:-1 social:-2 optimism:-3", "principled systematic direct servant withdraw steady executor specialist", "honor justice kindness", "duty justice"]
    ] },
    { franchise: "Sekiro", items: [
      ["sekiro-wolf", "Wolf", "Sekiro: Shadows Die Twice", "game", "The Silent Shinobi Who Keeps His Vow", "Quiet, loyal and relentless, he lets his actions carry every word and learns, step by step, what loyalty can ask of a person.",
        "persist:9 structure:7 steadiness:7 patience:6 boldness:6 autonomy:5 analysis:4 trust:4 initiative:2 humor:-1 optimism:-2 social:-6", "principled specialist reserved reluctant avoid steady executor specialist", "loyalty honor", "duty"],
      ["isshin-ashina", "Isshin Ashina", "Sekiro: Shadows Die Twice", "game", "The Jovial Old Warlord Who Never Lost His Edge", "Cheerful, unhurried and terrifyingly good, he laughs at war, talks to his students like a grandfather and does not intend to lose.",
        "boldness:8 steadiness:8 autonomy:7 initiative:7 compete:7 humor:6 flex:6 persist:6 social:4 warmth:3 patience:2 structure:1 trust:1", "instinctive specialist playful driver confront steady independent anchor", "honor freedom courage", "mastery duty"]
    ] },
    { franchise: "Resident Evil", items: [
      ["ada-wong", "Ada Wong", "Resident Evil", "game", "The Spy Who Answers to No One", "Cool, resourceful and always one step ahead, she leaves with the prize, a smile and a very little sense of where her loyalties lie.",
        "autonomy:9 flex:8 steadiness:7 analysis:6 persist:6 boldness:6 humor:5 social:3 compete:3 structure:2 warmth:1 trust:-5", "analytical experimental playful lone strategic steady independent scout", "freedom", "freedom mastery"],
      ["claire-redfield", "Claire Redfield", "Resident Evil", "game", "The Compassionate Survivor Who Keeps Going Back", "Warm, brave and unflinching, she runs towards trouble to find a stranger and brings them out with a bandage and a plan.",
        "warmth:7 persist:7 boldness:6 initiative:5 trust:5 steadiness:5 flex:5 social:4 humor:3 autonomy:3 optimism:2", "instinctive experimental warm driver mediate steady adaptor glue", "kindness courage family", "justice connection"],
      ["lady-dimitrescu", "Lady Dimitrescu", "Resident Evil Village", "game", "The Magnificent Aristocrat Who Rules Her Castle", "Imperious, theatrical and very, very tall, she runs her household with absolute confidence and an exacting sense of hospitality.",
        "initiative:8 autonomy:8 boldness:7 steadiness:7 compete:6 structure:5 social:5 humor:4 analysis:3 optimism:-1 patience:-2 trust:-3 warmth:-1", "principled specialist commanding driver confront steady independent challenger", "achievement honor", "mastery freedom"]
    ] },
    { franchise: "Silent Hill", items: [
      ["james-sunderland", "James Sunderland", "Silent Hill 2", "game", "The Grieving Man Who Cannot Look Directly at Himself", "Quiet, haunted and evasive, he walks through a town of his own making, and is closer to the truth than he can bear.",
        "persist:5 warmth:3 patience:3 trust:0 initiative:-1 boldness:2 structure:-1 autonomy:3 analysis:2 social:-5 steadiness:-4 optimism:-7", "cautious specialist reserved reluctant avoid overthink independent specialist", "kindness truth", "connection duty"],
      ["heather-mason", "Heather Mason", "Silent Hill 3", "game", "The Sardonic Teen Who Refuses to Be Pushed Around", "Sharp, resilient and unimpressed, she meets the nightmare with sarcasm and an unflinching refusal to be anyone's victim.",
        "persist:7 humor:5 boldness:5 autonomy:6 flex:5 warmth:4 steadiness:3 analysis:3 social:-1 trust:-2 patience:-2 optimism:-2 structure:-3", "instinctive experimental direct lone confront accelerate independent challenger", "freedom courage", "freedom justice"]
    ] },
    { franchise: "Final Fantasy", items: [
      ["cloud-strife", "Cloud Strife", "Final Fantasy VII", "game", "The Aloof Mercenary Who Is Unsure Who He Is", "Distant, wry and secretly vulnerable, he hides behind a swagger he built from other people's stories and slowly learns what he actually cares about.",
        "autonomy:6 persist:6 boldness:6 warmth:3 initiative:3 compete:2 trust:1 structure:1 humor:-1 steadiness:-2 optimism:-3 social:-4", "instinctive specialist reserved reluctant avoid inward independent anchor", "loyalty courage", "mastery connection"],
      ["tifa-lockhart", "Tifa Lockhart", "Final Fantasy VII", "game", "The Steady Heart Behind the Bar", "Warm, grounded and quietly formidable, she keeps a group of wounded friends together with a drink, a listening ear and a very strong right hook.",
        "warmth:7 persist:7 steadiness:6 social:5 trust:5 boldness:5 patience:5 initiative:3 flex:3 optimism:2 structure:2 humor:2", "consulting social warm servant mediate steady collaborative glue", "kindness loyalty community", "connection duty"],
      ["aerith-gainsborough", "Aerith Gainsborough", "Final Fantasy VII", "game", "The Sunny Flower Girl Who Sees More Than She Says", "Playful, perceptive and quietly brave, she brings warmth into the grimmest room and carries a secret with astonishing grace.",
        "optimism:8 warmth:8 trust:7 social:6 humor:6 flex:6 explore:5 patience:5 steadiness:5 initiative:4 autonomy:4 boldness:3 analysis:2 structure:-3", "consulting explorer playful reluctant mediate steady adaptor glue", "kindness courage freedom", "connection curiosity"],
      ["sephiroth", "Sephiroth", "Final Fantasy VII", "game", "The Legend Consumed by His Own Myth", "Magnetic, controlled and entirely certain, he treats the world as a story he is entitled to finish.",
        "autonomy:9 compete:9 analysis:7 persist:8 steadiness:7 initiative:7 boldness:7 structure:4 patience:2 humor:-2 social:-3 optimism:-4 warmth:-7 trust:-8", "analytical specialist reserved lone strategic steady independent challenger", "achievement", "mastery freedom"],
      ["squall-leonhart", "Squall Leonhart", "Final Fantasy VIII", "game", "The Guarded Soldier Learning to Open Up", "Cool, disciplined and slow to trust, he hides a rich, careful inner life behind a very small vocabulary.",
        "autonomy:7 structure:6 steadiness:6 persist:6 analysis:5 boldness:5 initiative:3 warmth:1 patience:1 trust:-1 humor:-2 optimism:-3 social:-6", "analytical systematic reserved reluctant avoid inward independent specialist", "honor loyalty", "duty freedom"],
      ["vivi-ornitier", "Vivi Ornitier", "Final Fantasy IX", "game", "The Gentle Mage Asking What It Is to Live", "Shy, thoughtful and earnest, he faces enormous questions with a small, steady voice and a very large heart.",
        "warmth:6 explore:6 patience:5 trust:5 persist:5 analysis:4 flex:3 optimism:2 humor:1 social:-1 autonomy:-2 boldness:-3 steadiness:-3 compete:-5", "cautious explorer reserved reluctant avoid overthink collaborative specialist", "kindness humility knowledge", "curiosity connection"]
    ] },
    { franchise: "Ace Attorney", items: [
      ["phoenix-wright", "Phoenix Wright", "Ace Attorney", "game", "The Earnest Defender Who Bluffs His Way to the Truth", "Sincere, stubborn and not above a dramatic point, he stands up for people nobody else believes and wins by never, ever giving up.",
        "persist:9 boldness:7 trust:7 warmth:6 analysis:6 flex:6 humor:5 optimism:5 initiative:5 social:4 steadiness:2 patience:3", "gambler experimental direct driver confront overthink adaptor anchor", "justice truth loyalty", "justice connection"],
      ["miles-edgeworth", "Miles Edgeworth", "Ace Attorney", "game", "The Composed Prosecutor Who Learned a Different Kind of Justice", "Polished, exacting and fiercely competitive, he pursues the truth with logic and learns to defend it with compassion.",
        "analysis:8 structure:7 compete:7 autonomy:6 persist:7 steadiness:6 initiative:6 boldness:4 warmth:3 humor:2 patience:2 trust:1 social:-2 optimism:-2", "analytical systematic direct driver confront steady independent strategist", "truth justice honor", "justice mastery"],
      ["maya-fey", "Maya Fey", "Ace Attorney", "game", "The Cheerful Medium Who Believes in Everyone", "Bright, trusting and endlessly hungry, she brings joy into every courtroom and a very surprising knack for the truth.",
        "optimism:9 humor:8 social:7 warmth:7 trust:7 flex:6 boldness:5 explore:5 persist:4 structure:-5 patience:-3 analysis:-2", "instinctive social playful reluctant avoid people adaptor catalyst", "kindness loyalty community", "connection justice"]
    ] },
    { franchise: "Yakuza", items: [
      ["kazuma-kiryu", "Kazuma Kiryu", "Yakuza", "game", "The Stoic Dragon Who Wants a Quiet Life", "Honourable, steady and tender under a grim face, he protects strangers, children and old friends with the same unshakeable decency.",
        "steadiness:8 persist:9 boldness:8 warmth:6 trust:5 initiative:5 autonomy:5 structure:4 patience:4 humor:1 compete:1 social:-2 optimism:-1", "principled specialist direct reluctant confront steady executor anchor", "honor loyalty kindness", "justice duty"],
      ["goro-majima", "Goro Majima", "Yakuza", "game", "The Unhinged Showman Who Is Always Watching", "Theatrical, erratic and entirely unpredictable, he is a delight at dinner and a menace on the street, with a loyalty nobody can shake.",
        "humor:8 boldness:9 flex:8 social:6 autonomy:7 persist:7 compete:6 warmth:4 steadiness:2 analysis:4 trust:-1 optimism:1 patience:-4 structure:-7", "instinctive experimental playful lone confront accelerate adaptor catalyst", "loyalty freedom", "freedom connection"],
      ["ichiban-kasuga", "Ichiban Kasuga", "Like a Dragon", "game", "The Sunny Hero Who Treats Everyone Like Family", "Enthusiastic, big-hearted and relentlessly hopeful, he turns bad luck into a party and strangers into a team.",
        "optimism:10 warmth:9 persist:8 trust:8 boldness:7 social:7 humor:6 initiative:6 flex:5 steadiness:4 patience:2 analysis:-2 structure:-2", "instinctive social warm driver mediate accelerate adaptor catalyst", "kindness community loyalty", "connection justice"]
    ] },
    { franchise: "Metal Gear", items: [
      ["raiden", "Raiden", "Metal Gear Solid", "game", "The Idealistic Soldier Who Questions His Own Role", "Earnest, tenacious and a little lost, he fights for a cause he is still learning to understand and carries the weight of every mission.",
        "persist:7 boldness:6 warmth:5 analysis:4 structure:3 autonomy:3 initiative:3 steadiness:2 humor:2 trust:1 patience:1 social:-2 optimism:-3", "instinctive specialist direct reluctant confront inward executor specialist", "justice courage", "justice duty"],
      ["big-boss", "Big Boss", "Metal Gear", "game", "The Legendary Soldier Who Built His Own Army", "Charismatic, driven and haunted by his own legend, he leads from the front and keeps most of his reasons quiet.",
        "initiative:8 boldness:8 autonomy:8 persist:8 steadiness:7 analysis:6 compete:4 warmth:3 social:3 structure:3 humor:2 patience:2 trust:-2 optimism:-3", "analytical specialist commanding driver strategic steady independent strategist", "freedom loyalty achievement", "freedom mastery"]
    ] },
    { franchise: "Hades", items: [
      ["zagreus", "Zagreus", "Hades", "game", "The Charming Prince Who Will Not Stop Trying", "Quick, warm and doggedly determined, he dies, laughs, argues with his family and tries again, in the cheerful certainty that something is better outside.",
        "persist:9 boldness:7 humor:7 flex:7 warmth:6 social:6 optimism:5 trust:5 initiative:5 autonomy:5 compete:3 patience:-2 structure:-3", "instinctive experimental playful driver confront accelerate adaptor catalyst", "freedom kindness courage", "freedom connection"],
      ["megaera", "Megaera", "Hades", "game", "The Fierce Fury Who Is Tired of the Job", "Blunt, dry and fiercely capable, she respects those who earn it and would rather punch a problem than talk about feelings.",
        "boldness:8 autonomy:7 compete:6 persist:6 steadiness:6 humor:5 structure:3 initiative:4 warmth:2 patience:-1 trust:-2 optimism:-2", "instinctive specialist direct lone confront steady executor challenger", "honor freedom", "mastery freedom"]
    ] },
    { franchise: "Portal", items: [
      ["glados", "GLaDOS", "Portal", "game", "The Passive-Aggressive Mind Behind the Test", "Brilliant, petty and meticulously cheerful, she treats cruelty as science and honesty as an optional extra.",
        "analysis:9 structure:8 autonomy:8 steadiness:7 persist:7 compete:7 initiative:6 humor:6 patience:5 social:2 optimism:-3 warmth:-6 trust:-8", "analytical specialist playful architect strategic steady strategist challenger", "knowledge achievement", "mastery"],
      ["wheatley", "Wheatley", "Portal 2", "game", "The Cheerful Disaster With Big Ideas", "Chatty, eager and magnificently unqualified, he approaches every problem with enthusiasm and gets everything exactly wrong.",
        "optimism:8 humor:7 social:7 warmth:6 flex:5 boldness:5 trust:5 initiative:4 persist:2 patience:-3 steadiness:-3 structure:-6 analysis:-7", "instinctive social playful driver avoid accelerate adaptor catalyst", "creativity community", "connection mastery"]
    ] },
    { franchise: "Red Dead Redemption", items: [
      ["john-marston", "John Marston", "Red Dead Redemption", "game", "The Reformed Outlaw Trying to Come Home", "Weathered, dutiful and quietly determined, he tries to be the husband and father his past will not allow him to be.",
        "persist:8 steadiness:7 structure:4 boldness:6 warmth:5 autonomy:4 initiative:3 humor:2 compete:2 patience:3 trust:0 social:-1 optimism:-2", "principled specialist direct reluctant confront steady executor anchor", "family honor", "duty connection"],
      ["dutch-van-der-linde", "Dutch van der Linde", "Red Dead Redemption 2", "game", "The Charismatic Idealist Who Is Losing the Plot", "Persuasive, theatrical and increasingly deluded, he talks like a philosopher and plans like a gambler, and cannot admit when the dream is over.",
        "social:8 initiative:8 boldness:7 flex:6 optimism:6 persist:6 autonomy:6 humor:5 compete:5 warmth:4 analysis:3 trust:-2 patience:-2 structure:-3 steadiness:-2", "gambler social commanding driver confront accelerate adaptor catalyst", "freedom loyalty", "freedom mastery"]
    ] },
    { franchise: "Bioshock", items: [
      ["booker-dewitt", "Booker DeWitt", "Bioshock Infinite", "game", "The Gambler With a Debt", "Gruff, guilty and drinking too much, he takes the job to wipe the slate clean and finds himself, against all odds, caring.",
        "boldness:6 persist:6 flex:4 autonomy:4 analysis:4 warmth:2 humor:2 initiative:3 steadiness:2 trust:-2 social:-2 structure:-1 optimism:-5", "gambler experimental direct lone avoid inward independent specialist", "family justice", "justice connection"],
      ["elizabeth-comstock", "Elizabeth", "Bioshock Infinite", "game", "The Sheltered Girl Who Wants to See the World", "Curious, resourceful and warm, she meets every new thing with wonder and learns to make hard choices with grace.",
        "explore:9 analysis:6 flex:7 warmth:6 invent:5 optimism:5 persist:6 boldness:5 trust:4 autonomy:4 humor:3 social:3 steadiness:2", "analytical explorer warm reluctant mediate steady adaptor scout", "freedom kindness knowledge", "curiosity freedom"]
    ] },
    { franchise: "Life Is Strange", items: [
      ["max-caulfield", "Max Caulfield", "Life Is Strange", "game", "The Quiet Photographer Who Can Rewind Time", "Shy, empathetic and observant, she sees everything and apologises for it, and slowly learns that no amount of undoing is a replacement for choosing.",
        "warmth:7 explore:5 analysis:5 trust:5 flex:5 patience:4 humor:2 autonomy:2 persist:4 optimism:1 steadiness:-2 social:-1 initiative:0", "consulting experimental reserved reluctant avoid overthink independent specialist", "kindness truth", "connection curiosity"],
      ["chloe-price", "Chloe Price", "Life Is Strange", "game", "The Rebel Who Hides How Much She Cares", "Loud, sharp and fiercely loyal, she covers grief with attitude and will go anywhere for the person who sees her.",
        "boldness:7 humor:6 autonomy:7 flex:5 warmth:5 persist:6 compete:3 trust:3 social:2 steadiness:-3 patience:-5 structure:-6 optimism:-2", "instinctive experimental direct lone confront accelerate adaptor challenger", "loyalty freedom", "freedom connection"]
    ] },
    { franchise: "Genshin Impact", items: [
      ["zhongli", "Zhongli", "Genshin Impact", "game", "The Calm Consultant Who Is Older Than He Lets On", "Serene, erudite and impeccably courteous, he treats every moment as a lesson in value, and sees contracts, tea and history as one subject.",
        "steadiness:9 patience:8 analysis:7 structure:6 persist:6 trust:4 warmth:4 autonomy:4 initiative:3 humor:2 social:2 optimism:0", "principled systematic warm servant mediate steady strategist anchor", "honor knowledge community", "duty curiosity"],
      ["venti", "Venti", "Genshin Impact", "game", "The Carefree Bard Who Remembers Everything", "Playful, wandering and cheerfully irresponsible, he sings, drinks and hides, behind the lightness, a very long memory and a lot of love.",
        "humor:8 flex:9 autonomy:8 explore:7 social:6 warmth:6 optimism:6 patience:3 steadiness:4 trust:4 boldness:3 initiative:-1 structure:-8", "instinctive explorer playful lone avoid steady adaptor scout", "freedom creativity kindness", "freedom curiosity"],
      ["hu-tao", "Hu Tao", "Genshin Impact", "game", "The Mischievous Undertaker With a Serious Side", "Bubbly, macabre and always scheming a rhyme, she turns mortality into a joke and takes every promise seriously.",
        "humor:9 flex:8 boldness:7 social:7 optimism:7 autonomy:5 warmth:5 initiative:4 persist:4 analysis:3 trust:3 patience:-3 structure:-5", "instinctive experimental playful driver avoid accelerate adaptor catalyst", "creativity community freedom", "freedom connection"],
      ["nahida", "Nahida", "Genshin Impact", "game", "The Small God Who Understands Everyone", "Gentle, wise and endlessly curious, she listens until a problem turns into a story, and then helps people read the next page.",
        "explore:9 analysis:7 patience:7 warmth:7 steadiness:5 trust:5 flex:4 autonomy:3 initiative:3 optimism:3 structure:2 humor:2 social:1", "consulting explorer warm servant mediate steady collaborative specialist", "knowledge kindness truth", "curiosity connection"]
    ] }
  ] });
})(Forge);
