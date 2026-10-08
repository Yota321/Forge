/* =========================================================================
   CHARACTER PACK 6 (TV, novels and the big franchises). Same row format as pack-characters-3.js.
   Notes live in pack-character-notes-5.js, emblems in pack-emblems-3.js.
   ========================================================================= */
(function(F){
  "use strict";
  if (!F.packs) return;

  F.packs.characters({ id: "west-1", name: "TV, novels and franchises", groups: [
    { franchise: "Breaking Bad", items: [
      ["hank-schrader", "Hank Schrader", "Breaking Bad", "show", "The Loud Cop Who Does Not Quit", "Boisterous, confident and relentlessly dogged, he fills every room with jokes and every case with stubborn attention, and is tougher than his act.",
        "persist:8 boldness:7 humor:7 compete:6 social:6 initiative:6 warmth:5 steadiness:4 analysis:4 trust:3 autonomy:3 structure:2 optimism:2 patience:-2", "instinctive experimental playful driver confront steady executor challenger", "justice family loyalty", "justice duty"],
      ["gus-fring", "Gus Fring", "Breaking Bad", "show", "The Courteous Operator Who Plans Years Ahead", "Meticulous, patient and terrifyingly polite, he runs a perfect public life and a perfect private one, and never lets either show the cracks.",
        "structure:9 patience:9 steadiness:9 analysis:8 autonomy:8 persist:8 initiative:7 compete:5 boldness:5 flex:3 social:2 humor:-4 warmth:-1 optimism:-2 trust:-6", "principled systematic reserved architect strategic steady strategist anchor", "achievement honor", "mastery justice"],
      ["mike-ehrmantraut", "Mike Ehrmantraut", "Breaking Bad", "show", "The Quiet Fixer With a Code", "Laconic, careful and entirely practical, he has no illusions about the work and a very tender spot for his family.",
        "steadiness:8 persist:7 structure:6 analysis:6 autonomy:7 patience:5 boldness:5 warmth:3 humor:3 initiative:3 trust:-3 social:-4 optimism:-5", "principled specialist reserved lone avoid steady independent specialist", "family honor", "duty justice"]
    ] },
    { franchise: "Better Call Saul", items: [
      ["kim-wexler", "Kim Wexler", "Better Call Saul", "show", "The Sharp Lawyer Who Needs a Little Trouble", "Brilliant, driven and quietly restless, she is the most capable person in the room and the one most drawn to a clever, dangerous idea.",
        "analysis:7 persist:8 autonomy:6 initiative:6 structure:5 warmth:5 compete:4 humor:4 boldness:4 flex:4 steadiness:3 trust:3 patience:3 social:1", "analytical systematic direct driver mediate inward independent challenger", "justice loyalty", "justice mastery"]
    ] },
    { franchise: "Arcane", items: [
      ["ekko", "Ekko", "Arcane", "show", "The Hopeful Inventor of the Undercity", "Quick, warm and fiercely creative, he builds the thing that gets everyone out and remains loyal to a place that has given him little.",
        "invent:8 optimism:7 persist:7 flex:7 warmth:6 boldness:6 social:5 trust:5 initiative:5 analysis:5 humor:4 steadiness:3 structure:-2", "instinctive experimental warm driver mediate accelerate adaptor catalyst", "loyalty creativity community", "freedom connection"],
      ["silco", "Silco", "Arcane", "show", "The Patient Visionary Who Loves Like a Fortress", "Elegant, measured and absolutely committed, he plays a very long game for a city that never loved him and for the one child he did.",
        "persist:9 initiative:8 autonomy:8 analysis:7 patience:7 steadiness:6 structure:5 boldness:5 compete:4 social:3 warmth:3 humor:2 optimism:-3 trust:-5", "analytical specialist direct architect strategic steady strategist anchor", "family freedom achievement", "freedom justice"],
      ["mel-medarda", "Mel Medarda", "Arcane", "show", "The Diplomat Who Knows What Everything Costs", "Poised, strategic and genuinely curious, she navigates a council with grace and discovers that principles are expensive.",
        "social:7 analysis:7 initiative:6 patience:6 flex:6 steadiness:6 structure:5 warmth:5 compete:4 autonomy:4 humor:3 boldness:3 trust:1 optimism:1", "consulting systematic warm architect strategic steady strategist glue", "justice knowledge community", "justice curiosity"]
    ] },
    { franchise: "Invincible", items: [
      ["mark-grayson", "Mark Grayson", "Invincible", "show", "The Earnest Hero Learning What Heroics Cost", "Optimistic, stubborn and slowly less naive, he keeps showing up for everyone, even as the work asks for more than he knew.",
        "warmth:7 persist:7 optimism:6 boldness:6 trust:5 initiative:4 humor:3 flex:3 compete:2 structure:1 autonomy:1 steadiness:1 patience:-1", "instinctive experimental direct driver mediate inward adaptor anchor", "kindness justice courage", "justice connection"],
      ["omni-man", "Omni-Man", "Invincible", "show", "The Perfect Father With a Very Different Plan", "Disciplined, patient and genuinely loving, he holds a long-term view of what the world should become and everything else is a problem to be managed.",
        "persist:9 steadiness:8 structure:7 initiative:7 autonomy:7 boldness:7 compete:5 patience:5 analysis:4 warmth:3 social:3 humor:2 optimism:-3 trust:-4", "principled systematic commanding architect strategic steady executor anchor", "family achievement honor", "duty mastery"]
    ] },
    { franchise: "The Boys", items: [
      ["billy-butcher", "Billy Butcher", "The Boys", "show", "The Furious Schemer With a Single Purpose", "Charming, cunning and consumed by a grudge, he gathers people to a cause and spends them as if they were free.",
        "persist:10 boldness:8 autonomy:8 compete:7 initiative:7 analysis:5 flex:4 humor:4 warmth:1 steadiness:-1 structure:0 patience:-6 optimism:-6 trust:-6", "analytical experimental direct lone confront accelerate independent strategist", "justice family", "justice freedom"],
      ["homelander", "Homelander", "The Boys", "show", "The Smiling Symbol Terrified of Being Ordinary", "Magnetic, narcissistic and fragile, he performs perfection for a crowd that cannot love him back and cannot be refused.",
        "compete:10 autonomy:8 boldness:8 initiative:7 social:6 persist:5 humor:2 optimism:-3 steadiness:-6 warmth:-6 patience:-8 trust:-9", "instinctive specialist commanding driver confront accelerate independent challenger", "achievement freedom", "mastery freedom"],
      ["starlight", "Starlight", "The Boys", "show", "The Idealist Who Stood Up", "Sincere, brave and stubborn, she believes in being good, finds out what that costs, and chooses it again.",
        "persist:8 optimism:6 warmth:6 boldness:6 trust:4 initiative:5 social:5 steadiness:3 flex:4 compete:2 structure:2 autonomy:3 humor:2", "consulting experimental warm driver mediate inward adaptor glue", "justice kindness courage", "justice connection"]
    ] },
    { franchise: "Stranger Things", items: [
      ["eleven", "Eleven", "Stranger Things", "show", "The Quiet Girl With Enormous Power", "Intense, guarded and fiercely loyal, she learns the world in fragments and protects the friends who taught her what a friend is.",
        "persist:7 boldness:6 warmth:6 explore:5 trust:4 autonomy:3 patience:2 optimism:2 initiative:2 humor:2 analysis:1 steadiness:2 social:-3", "instinctive experimental reserved reluctant avoid inward adaptor anchor", "loyalty courage freedom", "freedom connection"],
      ["jim-hopper", "Jim Hopper", "Stranger Things", "show", "The Gruff Chief With a Soft Spot", "Weathered, dry and quietly protective, he complains about everything and is first through the door when it matters.",
        "persist:7 warmth:6 boldness:6 steadiness:5 humor:5 autonomy:5 initiative:5 compete:2 structure:1 trust:1 social:1 patience:-2 optimism:-3", "instinctive specialist direct driver confront inward executor anchor", "family justice honor", "duty justice"]
    ] },
    { franchise: "Brooklyn Nine-Nine", items: [
      ["rosa-diaz", "Rosa Diaz", "Brooklyn Nine-Nine", "show", "The Stone-Faced Detective With a Secret Heart", "Intense, private and ferociously competent, she says little, trusts few and, once she does, becomes the most dependable person in the building.",
        "autonomy:8 steadiness:7 boldness:7 persist:7 compete:5 initiative:4 structure:3 analysis:3 humor:3 warmth:2 trust:1 patience:-1 optimism:-1 social:-3", "instinctive specialist reserved lone confront steady independent anchor", "loyalty honor freedom", "justice freedom"],
      ["terry-jeffords", "Terry Jeffords", "Brooklyn Nine-Nine", "show", "The Gentle Giant Who Runs the Squad", "Warm, disciplined and quietly hilarious, he leads with empathy, loves yoghurt and will do anything for his family and his team.",
        "warmth:8 steadiness:7 structure:6 humor:6 persist:6 trust:6 patience:6 initiative:5 social:4 boldness:3 optimism:3 analysis:3 compete:2", "consulting systematic warm servant mediate steady collaborative anchor", "family community kindness", "duty connection"]
    ] },
    { franchise: "Community", items: [
      ["jeff-winger", "Jeff Winger", "Community", "show", "The Charming Cynic Who Needs a Study Group", "Smooth, competitive and allergic to sincerity, he talks his way out of everything and slowly cannot talk his way out of caring.",
        "social:7 compete:7 analysis:6 humor:6 flex:6 initiative:5 autonomy:5 steadiness:3 boldness:3 warmth:3 boldness:3 persist:3 trust:-1 optimism:-2 patience:-2 structure:-1", "analytical social playful driver avoid inward independent catalyst", "achievement community", "mastery connection"],
      ["abed-nadir", "Abed Nadir", "Community", "show", "The Observer Who Narrates the Show", "Literal, perceptive and cheerfully unconcerned with convention, he understands people through stories and is the most emotionally honest person in the room.",
        "analysis:8 explore:6 autonomy:7 steadiness:7 humor:5 persist:5 patience:5 trust:4 warmth:3 structure:3 flex:3 optimism:3 initiative:1 compete:-2 social:-3", "analytical explorer direct reluctant avoid steady independent specialist", "truth creativity loyalty", "curiosity connection"],
      ["annie-edison", "Annie Edison", "Community", "show", "The Overachiever Who Keeps the Group Together", "Eager, organised and fiercely competitive about being good, she organises the party, the case and the feelings, and means it.",
        "structure:8 persist:8 compete:6 warmth:6 initiative:6 optimism:5 analysis:5 trust:4 social:4 boldness:2 flex:1 patience:-1 steadiness:-1", "analytical systematic direct driver confront overthink executor glue", "achievement kindness honor", "mastery connection"]
    ] },
    { franchise: "Doctor Who", items: [
      ["donna-noble", "Donna Noble", "Doctor Who", "show", "The Loud Temp Who Became the Most Important Woman in the Universe", "Brash, funny and big-hearted, she tells the Doctor the truth, tells the universe where to go and reveals a depth no one expected.",
        "humor:8 boldness:7 warmth:7 social:7 persist:6 trust:5 flex:5 initiative:5 analysis:4 steadiness:3 compete:2 optimism:3 autonomy:3 patience:-2 structure:-2", "instinctive social direct driver confront accelerate adaptor catalyst", "kindness courage community", "connection justice"]
    ] },
    { franchise: "The Good Place", items: [
      ["eleanor-shellstrop", "Eleanor Shellstrop", "The Good Place", "show", "The Self-Interested Rebel Who Tries to Be Better", "Quick, sarcastic and slowly sincere, she bluffs her way through everything and gradually discovers she genuinely wants to be good.",
        "humor:7 flex:7 boldness:6 autonomy:6 persist:5 initiative:5 warmth:4 social:4 compete:3 analysis:3 trust:2 steadiness:1 patience:-3 structure:-5 optimism:-1", "instinctive experimental playful driver avoid accelerate adaptor catalyst", "freedom kindness community", "freedom connection"],
      ["chidi-anagonye", "Chidi Anagonye", "The Good Place", "show", "The Anxious Ethicist Who Cannot Pick a Muffin", "Learned, kind and paralysed by every option, he reads the whole moral library and learns that good enough is a decision.",
        "analysis:8 structure:7 warmth:6 explore:6 patience:5 trust:5 persist:4 humor:2 boldness:-4 autonomy:-2 compete:-3 initiative:-2 optimism:-2 steadiness:-8", "cautious systematic warm reluctant avoid overthink collaborative specialist", "truth kindness knowledge", "curiosity duty"]
    ] },
    { franchise: "House M.D.", items: [
      ["james-wilson", "James Wilson", "House M.D.", "show", "The Kind Oncologist Who Takes in Strays", "Warm, conscientious and a little too giving, he is the friend who stays, picks up the bill and rarely says what he needs.",
        "warmth:8 trust:6 patience:6 steadiness:5 structure:4 persist:5 social:5 flex:4 humor:3 analysis:4 optimism:0 autonomy:-1 compete:-4 initiative:1", "consulting systematic warm servant mediate people collaborative glue", "kindness loyalty", "connection duty"]
    ] },
    { franchise: "Dark", items: [
      ["jonas-kahnwald", "Jonas Kahnwald", "Dark", "show", "The Haunted Boy Who Tries to End It", "Solemn, determined and exhausted by cause and effect, he follows every thread through time in the hope of one clean ending.",
        "persist:8 analysis:6 explore:6 warmth:5 autonomy:5 boldness:5 initiative:5 steadiness:1 trust:2 patience:3 humor:-2 social:-3 optimism:-6", "analytical explorer reserved driver avoid inward independent specialist", "family truth", "justice connection"]
    ] },
    { franchise: "The Walking Dead", items: [
      ["rick-grimes", "Rick Grimes", "The Walking Dead", "show", "The Leader Who Carried Everyone's Weight", "Tough, committed and visibly fraying, he does whatever the group needs and wonders, quietly, who he becomes in the process.",
        "persist:9 initiative:8 boldness:7 structure:4 warmth:5 steadiness:3 autonomy:4 compete:3 trust:2 patience:-1 humor:0 optimism:-4", "principled experimental direct driver confront inward executor anchor", "family justice loyalty", "duty justice"],
      ["daryl-dixon", "Daryl Dixon", "The Walking Dead", "show", "The Silent Tracker Who Loves Fiercely", "Quiet, wary and fiercely loyal, he hides his heart behind a crossbow and shows it in what he does for the people he will not name as family.",
        "persist:8 autonomy:8 boldness:6 explore:6 steadiness:5 warmth:5 patience:3 initiative:3 trust:2 structure:1 humor:1 optimism:-3 social:-6", "instinctive specialist reserved lone avoid steady independent scout", "loyalty freedom", "freedom connection"]
    ] },
    { franchise: "Percy Jackson", items: [
      ["percy-jackson", "Percy Jackson", "Percy Jackson", "book", "The Smart-Mouthed Hero Who Will Not Leave a Friend", "Funny, loyal and fiercely stubborn about the people he loves, he treats every quest as a favour to a friend.",
        "humor:8 warmth:7 boldness:7 persist:7 flex:6 trust:6 social:5 initiative:5 optimism:4 steadiness:3 compete:3 analysis:-1 patience:-1 structure:-5", "instinctive experimental playful driver mediate accelerate adaptor catalyst", "loyalty courage kindness", "connection justice"],
      ["annabeth-chase", "Annabeth Chase", "Percy Jackson", "book", "The Strategist Who Wants to Build Something Lasting", "Sharp, driven and a little proud, she plans six steps ahead, tests every idea and cares fiercely for the people on the team.",
        "analysis:9 structure:7 initiative:7 persist:8 invent:5 compete:6 boldness:5 warmth:5 trust:3 social:3 steadiness:4 autonomy:4 humor:2 patience:2", "analytical systematic direct driver confront steady strategist strategist", "knowledge loyalty achievement", "mastery connection"],
      ["nico-di-angelo", "Nico di Angelo", "Percy Jackson", "book", "The Brooding Outsider Learning to Be Seen", "Solemn, solitary and secretly very tender, he feels more than he says and works through being different by choosing, step by step, to stay.",
        "autonomy:7 persist:6 boldness:5 warmth:3 flex:3 explore:3 patience:2 humor:1 steadiness:2 trust:-3 social:-6 optimism:-5", "cautious experimental reserved lone avoid inward independent specialist", "loyalty courage", "freedom connection"]
    ] },
    { franchise: "Mistborn", items: [
      ["vin", "Vin", "Mistborn", "book", "The Street Thief Who Learns Trust", "Wary, quick and extraordinarily capable, she survives by suspecting everyone, and slowly finds out how much a crew can be worth.",
        "boldness:7 flex:7 autonomy:7 persist:6 analysis:5 warmth:4 initiative:3 steadiness:2 patience:2 trust:-2 social:-2 optimism:-2 structure:0", "instinctive experimental reserved reluctant avoid inward independent scout", "freedom loyalty", "freedom connection"],
      ["kelsier", "Kelsier", "Mistborn", "book", "The Charismatic Crew Boss Who Leads With a Grin", "Boastful, brilliant and magnetic, he treats a revolution as a heist with feelings and makes everyone in the room believe in the impossible.",
        "initiative:9 boldness:9 social:8 humor:7 optimism:7 flex:7 persist:8 warmth:6 analysis:6 trust:4 compete:3 structure:-1 patience:-3 steadiness:2", "analytical experimental playful driver strategic accelerate adaptor catalyst", "freedom family courage", "freedom justice"]
    ] },
    { franchise: "The Stormlight Archive", items: [
      ["kaladin-stormblessed", "Kaladin", "The Stormlight Archive", "book", "The Protector Weighed Down by Those He Lost", "Disciplined, compassionate and prone to dark days, he leads by taking the hardest position, and has to learn that protecting people is not the same as owning their pain.",
        "persist:9 warmth:6 initiative:7 boldness:7 structure:5 analysis:4 trust:2 patience:2 autonomy:3 compete:2 social:-1 steadiness:-3 optimism:-5", "principled systematic direct driver confront inward executor anchor", "honor kindness courage", "duty justice"],
      ["shallan-davar", "Shallan Davar", "The Stormlight Archive", "book", "The Artist Who Hides Behind Her Characters", "Witty, imaginative and deeply wounded, she copes with a gallery of personas and a very sharp eye, and wants, most of all, to be forgiven.",
        "invent:7 explore:7 humor:7 flex:8 analysis:6 social:5 warmth:5 autonomy:4 boldness:3 trust:2 optimism:0 structure:-3 steadiness:-5", "analytical experimental playful reluctant avoid overthink independent specialist", "truth creativity kindness", "curiosity freedom"]
    ] },
    { franchise: "The Wheel of Time", items: [
      ["rand-althor", "Rand al'Thor", "The Wheel of Time", "book", "The Reluctant Leader Who Carries Too Much", "Earnest, stubborn and hardening, he tries to keep everyone safe and slowly learns that doing it all himself is a weakness of its own.",
        "initiative:7 persist:8 boldness:6 autonomy:6 structure:3 warmth:4 analysis:3 steadiness:2 humor:1 compete:2 patience:2 trust:-2 optimism:-3", "principled experimental direct driver confront inward executor anchor", "duty courage honor", "duty justice"],
      ["moiraine-damodred", "Moiraine", "The Wheel of Time", "book", "The Patient Guide Who Plays Several Games at Once", "Poised, calculating and quietly devoted, she steers the story from the shadows and bears the cost of every secret she keeps.",
        "analysis:8 patience:9 steadiness:8 autonomy:7 initiative:7 persist:8 structure:6 flex:5 social:3 warmth:3 humor:1 optimism:1 trust:-3", "analytical systematic reserved architect strategic steady strategist strategist", "duty knowledge", "duty justice"]
    ] },
    { franchise: "Dune", items: [
      ["paul-atreides", "Paul Atreides", "Dune", "book", "The Gifted Heir Who Cannot Look Away", "Brilliant, burdened and increasingly isolated, he sees the paths ahead and is unable to unsee the one he fears.",
        "analysis:8 initiative:7 persist:7 patience:6 autonomy:6 steadiness:5 boldness:5 structure:4 warmth:4 trust:1 social:1 humor:0 optimism:-4", "analytical specialist direct architect strategic inward strategist anchor", "duty honor family", "duty justice"],
      ["lady-jessica", "Lady Jessica", "Dune", "book", "The Deliberate Mother in a Sea of Plans", "Poised, disciplined and protective, she balances loyalty to her order, her duke and her son with an exacting sense of the long game.",
        "analysis:7 patience:8 steadiness:7 structure:6 warmth:6 autonomy:6 persist:7 initiative:5 social:4 boldness:4 flex:4 trust:2 humor:2 optimism:0", "principled systematic reserved servant strategic steady strategist anchor", "family loyalty duty", "duty connection"]
    ] },
    { franchise: "Discworld", items: [
      ["sam-vimes", "Sam Vimes", "Discworld", "book", "The Cynical Copper Who Believes in Law", "Gruff, grumpy and quietly decent, he distrusts power, loves his city and follows an unshakeable sense of what is fair.",
        "persist:8 analysis:6 steadiness:5 autonomy:5 warmth:5 humor:5 boldness:5 initiative:4 structure:2 compete:2 patience:1 trust:-1 optimism:-4", "principled experimental direct driver confront steady executor anchor", "justice honor community", "justice duty"],
      ["granny-weatherwax", "Granny Weatherwax", "Discworld", "book", "The Formidable Witch Who Chooses Not To", "Proud, shrewd and almost impossibly stubborn, she holds enormous power in reserve and is frightening mostly for how kind she is when no one is looking.",
        "autonomy:9 steadiness:9 persist:9 analysis:7 compete:6 initiative:6 patience:5 flex:3 warmth:3 humor:2 social:-1 trust:-2 optimism:-2", "principled specialist direct lone confront steady independent anchor", "humility justice honor", "duty justice"],
      ["havelock-vetinari", "Havelock Vetinari", "Discworld", "book", "The Urbane Tyrant Who Runs the City by Being Reasonable", "Calm, dry and quietly omniscient, he governs through clerks, clocks and well-timed inconvenience, and is much more principled than he lets on.",
        "analysis:10 patience:9 autonomy:9 steadiness:9 structure:7 initiative:8 persist:8 flex:6 humor:5 social:5 compete:4 boldness:4 optimism:-1 warmth:0 trust:-6", "analytical systematic reserved architect strategic steady strategist anchor", "knowledge justice", "mastery justice"]
    ] },
    { franchise: "Earthsea", items: [
      ["ged-sparrowhawk", "Ged", "Earthsea", "book", "The Proud Mage Who Learned the Weight of a Name", "Gifted, headstrong and slowly humbled, he becomes a quiet teacher whose greatest magic is knowing what to leave alone.",
        "explore:7 analysis:6 persist:7 steadiness:6 patience:6 autonomy:7 warmth:4 boldness:5 compete:3 trust:2 humor:2 social:-2 optimism:-1", "analytical explorer reserved lone avoid steady independent specialist", "humility knowledge", "curiosity duty"]
    ] },
    { franchise: "Omniscient Reader's Viewpoint", items: [
      ["kim-dokja", "Kim Dokja", "Omniscient Reader's Viewpoint", "book", "The Reader Who Knows How the Story Ends", "Lonely, wry and endlessly resourceful, he plays the only story he knows to rewrite an ending, and learns he is no longer alone in it.",
        "analysis:9 flex:8 persist:7 autonomy:5 patience:5 humor:5 explore:5 boldness:5 steadiness:4 warmth:4 initiative:5 structure:2 social:-2 trust:-1 optimism:-2", "analytical experimental playful reluctant strategic inward independent strategist", "knowledge loyalty", "curiosity connection"],
      ["yoo-joonghyuk", "Yoo Joonghyuk", "Omniscient Reader's Viewpoint", "book", "The Regressor Who Has Seen Every Ending", "Cold, relentless and exhausted by repetition, he trusts no one, solves everything by force and gradually cannot help noticing what he has been missing.",
        "persist:10 steadiness:8 autonomy:9 compete:7 analysis:7 structure:6 boldness:7 initiative:6 patience:5 warmth:-1 social:-6 trust:-5 humor:-4 optimism:-6", "analytical systematic reserved lone strategic inward independent strategist", "achievement freedom", "mastery freedom"],
      ["han-sooyoung", "Han Sooyoung", "Omniscient Reader's Viewpoint", "book", "The Sharp-Tongued Writer Who Changes the Plot", "Quick, caustic and brilliantly inventive, she reads a situation faster than anyone and hides her loyalty behind complaints.",
        "analysis:8 invent:7 humor:7 flex:8 autonomy:7 compete:5 boldness:5 persist:6 social:2 warmth:3 steadiness:3 initiative:5 trust:0 structure:-3 optimism:-1", "analytical experimental playful lone strategic accelerate independent challenger", "creativity loyalty freedom", "mastery freedom"]
    ] },
    { franchise: "Marvel", items: [
      ["wanda-maximoff", "Wanda Maximoff", "Avengers (Marvel Comics)", "comic", "The Grieving Powerhouse With Too Much Love", "Intense, vulnerable and formidably powerful, she feels everything at full volume and has to learn what to do when the world does not give her what she lost.",
        "warmth:7 persist:7 boldness:6 autonomy:5 initiative:4 trust:2 flex:3 humor:1 compete:0 structure:-2 social:-1 optimism:-5 steadiness:-5", "instinctive experimental warm lone avoid inward independent anchor", "family kindness freedom", "connection freedom"],
      ["frank-castle", "Frank Castle", "Marvel Comics (The Punisher)", "comic", "The Relentless Soldier With One Rule", "Disciplined, grim and unflinching, he has narrowed his life to a single purpose, and the people who most need him are the ones he keeps at a distance.",
        "persist:10 boldness:8 autonomy:8 structure:6 steadiness:6 analysis:5 initiative:5 patience:2 compete:3 warmth:-1 humor:-3 trust:-5 social:-5 optimism:-8", "principled specialist reserved lone confront inward independent specialist", "justice family honor", "justice duty"]
    ] },
    { franchise: "DC", items: [
      ["john-constantine", "John Constantine", "Hellblazer (DC Comics)", "comic", "The Cynical Con Man of the Occult", "Sardonic, resourceful and chronically unlucky, he out-bluffs things that should eat him and has a conscience he pretends not to carry.",
        "humor:8 flex:8 autonomy:8 analysis:7 social:4 boldness:5 compete:3 warmth:2 persist:6 steadiness:3 initiative:4 trust:-6 optimism:-6 structure:-5", "analytical experimental playful lone strategic accelerate independent scout", "freedom justice", "freedom justice"],
      ["supergirl", "Supergirl (Kara Zor-El)", "Supergirl (DC Comics)", "comic", "The Hopeful Outsider Who Chose Earth", "Warm, quick to act and openly emotional, she keeps her feet in two worlds and her heart wide open, and she learns that being brave is mostly deciding to stay.",
        "warmth:8 optimism:8 boldness:7 persist:7 initiative:6 social:6 trust:5 humor:4 explore:4 flex:3 compete:2 steadiness:2 patience:-2 structure:-2", "instinctive social warm driver confront accelerate collaborative catalyst", "kindness justice freedom", "connection justice"],
      ["superwoman", "Superwoman", "Superwoman (DC Comics)", "comic", "The Ruthless Queen of a Darker Earth", "Commanding, ambitious and unapologetically hard, the Crime Syndicate's Superwoman treats power as a birthright and tenderness as a risk she cannot afford.",
        "compete:8 initiative:8 boldness:8 persist:7 autonomy:6 steadiness:5 analysis:5 structure:3 social:2 humor:-2 patience:-4 optimism:-1 warmth:-5 trust:-6", "instinctive systematic commanding driver confront accelerate independent challenger", "achievement loyalty", "mastery"],
      ["power-girl", "Power Girl (Kara Zor-L)", "Power Girl (DC Comics)", "comic", "The Blunt Powerhouse Who Says It Out Loud", "Brash, funny and impossible to intimidate, she says what she thinks, runs her own company and her own life, and hides a lonely, loyal streak behind the swagger.",
        "boldness:9 initiative:8 persist:7 compete:7 autonomy:7 humor:6 social:5 steadiness:5 warmth:4 optimism:3 analysis:3 trust:2 patience:-6 structure:-3", "instinctive experimental playful driver confront accelerate independent challenger", "freedom achievement loyalty", "freedom mastery"]
    ] },
    { franchise: "Star Wars", items: [
      ["ahsoka-tano", "Ahsoka Tano", "Star Wars", "anime", "The Independent Student Who Left to Find Her Own Way", "Composed, loyal and quietly fearless, she stepped away from every order that no longer fit and became the kind of guide she wished she had.",
        "steadiness:6 persist:7 warmth:6 boldness:6 autonomy:6 initiative:5 trust:4 flex:5 patience:5 humor:3 analysis:4 compete:2 social:1", "principled experimental direct reluctant mediate steady independent anchor", "justice loyalty freedom", "justice freedom"],
      ["kylo-ren", "Kylo Ren", "Star Wars", "film", "The Volatile Heir Pulled in Two Directions", "Intense, impulsive and tormented by his own legacy, he lashes out at everything he is afraid of being.",
        "compete:7 persist:6 initiative:6 boldness:7 autonomy:6 structure:3 analysis:2 warmth:1 humor:-3 social:-3 trust:-5 patience:-6 optimism:-6 steadiness:-7", "instinctive specialist commanding driver confront accelerate independent challenger", "family achievement", "mastery freedom"]
    ] },
    { franchise: "Avatar: The Last Airbender", items: [
      ["azula", "Azula", "Avatar: The Last Airbender", "show", "The Perfectionist Who Cannot Afford to Lose", "Brilliant, exacting and relentlessly ambitious, she bends fear into obedience and has never learned what to do when the world refuses.",
        "compete:10 initiative:8 analysis:7 structure:6 boldness:8 autonomy:7 persist:7 social:5 humor:2 steadiness:-1 patience:-3 warmth:-5 trust:-7 optimism:-2", "analytical specialist commanding architect strategic accelerate strategist challenger", "achievement honor", "mastery"]
    ] },
    { franchise: "Harry Potter", items: [
      ["draco-malfoy", "Draco Malfoy", "Harry Potter", "book", "The Proud Heir Who Cannot Quite Believe It", "Haughty, anxious and more sensitive than he shows, he performs the role he was born into and starts, painfully, to doubt it.",
        "compete:7 social:4 autonomy:3 analysis:3 structure:2 persist:3 initiative:2 boldness:2 humor:2 warmth:1 patience:-2 trust:-3 optimism:-3 steadiness:-3", "cautious social direct reluctant confront overthink independent challenger", "family achievement", "mastery duty"]
    ] },
    { franchise: "The Lord of the Rings", items: [
      ["legolas", "Legolas", "The Lord of the Rings", "book", "The Graceful Scout Who Befriends a Dwarf", "Serene, sharp-eyed and cheerfully competitive, he moves through every landscape as though it were an old friend.",
        "steadiness:8 boldness:6 explore:6 persist:6 patience:6 warmth:5 trust:5 autonomy:5 social:3 optimism:3 humor:2 structure:2 compete:1", "principled explorer warm reluctant mediate steady independent scout", "loyalty freedom kindness", "freedom connection"],
      ["gollum", "Gollum", "The Lord of the Rings", "book", "The Obsessed Wretch Who Is Not Quite Gone", "Cringing, cunning and divided against himself, he holds on to a single craving and a dim, desperate memory of being someone else.",
        "flex:7 autonomy:6 persist:7 compete:6 analysis:3 humor:2 boldness:2 patience:-3 warmth:-4 social:-6 optimism:-7 steadiness:-8 trust:-9", "instinctive experimental reserved lone avoid inward adaptor challenger", "freedom", "freedom mastery"]
    ] },
    { franchise: "That Time I Got Reincarnated as a Slime", items: [
      ["rimuru-tempest", "Rimuru Tempest", "That Time I Got Reincarnated as a Slime", "anime", "The Gentle Slime Who Built a Nation", "Easygoing, curious and quietly overpowered, he turns every outsider into a citizen and every problem into a project, while a very old mind sits calmly behind a very soft smile.",
        "warmth:7 flex:7 optimism:6 trust:6 analysis:5 initiative:5 explore:5 steadiness:5 social:5 humor:4 patience:4 invent:4 boldness:3 persist:3 autonomy:2", "consulting experimental warm servant mediate steady adaptor anchor", "kindness community creativity", "connection curiosity"]
    ] }
  ] });
})(Forge);
