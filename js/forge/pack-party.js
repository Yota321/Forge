/* =========================================================================
   PARTY PACK (data only). Roles, fictional worlds, teams, stories, dynamics and outcomes for
   Party mode. experience.js scores each entry against the group's facets; this file only holds
   the entries. Add an entry and it takes part immediately; no code changes.

   needs   facet -> weight on the group's AVERAGE (negative = the group should be low in it)
   spread  facet -> weight on how DIFFERENT members are (positive = rewards variety)
   peak    facet -> weight on the STRONGEST member
   tokens  {leader} {peace} {chaos} {solver} {detail} {sacrifice} {push} {carry} {heart} {scout} {skeptic} {strategist}
           {names} {n} {group}; worlds also get {loves}. Teams reference characters by roster id.
   ========================================================================= */
(function(F){
  "use strict";
  if (!F.packs) return;
  const A = F.packs.add;

  A("roles", [
    { id: "leader", icon: "👑", title: "Who is the leader?", name: "The Leader", weights: { initiative: 1.5, boldness: 0.7, social: 0.5, persist: 0.3 },
      line: "{name} is the one people look to when it's time to pick a direction.", cast: "{name} points the way and the others tend to follow." },
    { id: "peace", icon: "🕊️", title: "Who keeps the peace?", name: "The Peacekeeper", weights: { warmth: 1.2, patience: 1.2, steadiness: 0.8, compete: -0.8 },
      line: "{name} notices tension early and quietly takes the heat out of it.", cast: "{name} keeps everyone on speaking terms." },
    { id: "chaos", icon: "🌪️", title: "Who causes the chaos?", name: "The Chaos Agent", weights: { boldness: 1.2, humor: 1, flex: 0.8, structure: -1, patience: -0.6 },
      line: "{name} is the reason there's a story worth telling afterwards.", cast: "{name} says 'what if we just…' and the plan changes." },
    { id: "solver", icon: "🧠", title: "Who solves the problems?", name: "The Problem Solver", weights: { analysis: 1.3, invent: 1, persist: 0.6, flex: 0.3 },
      line: "{name} stares at the impossible thing until it becomes a list of small ones.", cast: "{name} finds the way through when nobody else sees one." },
    { id: "detail", icon: "🔍", title: "Who notices the details?", name: "The Detail Spotter", weights: { analysis: 1, structure: 0.8, explore: 0.6, patience: 0.5, social: -0.3 },
      line: "{name} spotted the thing everyone else walked straight past.", cast: "{name} catches what everyone else missed." },
    { id: "sacrifice", icon: "🛡️", title: "Who would sacrifice themselves?", name: "The Protector", weights: { warmth: 1, persist: 1, trust: 0.7, boldness: 0.5, compete: -0.6 },
      line: "{name} would step in front of the problem so the others don't have to.", cast: "{name} puts the group first, sometimes more than they should." },
    { id: "push", icon: "🚀", title: "Who pushes everyone forward?", name: "The Engine", weights: { persist: 1.2, initiative: 1, optimism: 0.7, compete: 0.4 },
      line: "{name} keeps saying 'we're nearly there' until it becomes true.", cast: "{name} keeps the momentum going when it dips." },
    { id: "carry", icon: "🏋️", title: "Who is secretly carrying the team?", name: "The Quiet Backbone", weights: { steadiness: 1, structure: 1, persist: 1, warmth: 0.5, social: -0.7, initiative: -0.3 },
      line: "{name} does the unglamorous work that holds everything up, and rarely mentions it.", cast: "{name} keeps things running behind the scenes." },
    { id: "heart", icon: "💛", title: "Who is the heart of the group?", name: "The Heart", weights: { warmth: 1, humor: 0.8, optimism: 0.8, social: 0.8 },
      line: "{name} is the reason people actually want to be here.", cast: "{name} keeps the mood up and everyone included." },
    { id: "scout", icon: "🧭", title: "Who goes ahead to scout?", name: "The Scout", weights: { explore: 1.2, boldness: 0.8, flex: 0.8 },
      line: "{name} has already gone to see what's around the corner, and come back with a map.", cast: "{name} goes first into the unknown." },
    { id: "skeptic", icon: "🤨", title: "Who questions the plan?", name: "The Skeptic", weights: { analysis: 0.9, autonomy: 1, trust: -0.9, patience: -0.2 },
      line: "{name} asks the awkward question that saves the whole mission.", cast: "{name} pokes holes in the plan before reality does." },
    { id: "strategist", icon: "♟️", title: "Who makes the plan?", name: "The Strategist", weights: { structure: 1, analysis: 1, initiative: 0.5 },
      line: "{name} already has a plan, a backup plan and a snack.", cast: "{name} thinks four steps ahead." },
  ]);

  A("universes", [
    { id: "marvel", name: "The Marvel Universe", franchise: "Marvel", needs: { initiative: 0.8, boldness: 0.8, humor: 0.6, flex: 0.6, social: 0.4, warmth: 0.4 },
      blurb: "Ordinary people, impossible problems, and a team-up that somehow works.", why: "It rewards {loves}, and with {leader} out front your group would slot into a team-up without much trouble." },
    { id: "dc", name: "The DC Universe", franchise: "DC", needs: { persist: 1, initiative: 0.8, steadiness: 0.7, warmth: 0.7, structure: 0.5, optimism: 0.5 },
      blurb: "A world of icons who keep choosing to do the right thing.", why: "It rewards {loves}, which is where your group is strongest. {carry} would be the one holding it all up." },
    { id: "hogwarts", name: "Hogwarts and the Wizarding World", franchise: "Harry Potter", needs: { explore: 1, trust: 0.8, warmth: 0.8, analysis: 0.6, boldness: 0.6, social: 0.4 },
      blurb: "A castle full of secrets that rewards curiosity, loyalty and the occasional rule bent for a good reason.", why: "It rewards {loves}. {detail} would find the secret passage and {scout} would be first through it." },
    { id: "middle-earth", name: "Middle-earth", franchise: "The Lord of the Rings", needs: { persist: 1, trust: 1, steadiness: 0.9, warmth: 0.7, patience: 0.5, boldness: 0.4 },
      blurb: "A long road, an impossible task and the friends who carry each other through it.", why: "It rewards {loves}, and your group has plenty of both. {carry} would be the reason you got there." },
    { id: "star-wars", name: "A Galaxy Far, Far Away", franchise: "Star Wars", needs: { flex: 0.8, boldness: 0.8, humor: 0.6, trust: 0.6, optimism: 0.5, initiative: 0.5 },
      blurb: "Rebels, smugglers and mystics making it up as they go.", why: "It rewards {loves}. {chaos} would fly the ship and {leader} would give it a name." },
    { id: "westeros", name: "Westeros", franchise: "Game of Thrones", needs: { analysis: 0.8, compete: 1, initiative: 0.8, autonomy: 0.6, structure: 0.5, trust: -0.8 },
      blurb: "A world of alliances, rivalries and long memories, where cleverness beats strength.", why: "It rewards {loves}. {strategist} would be three moves ahead and {skeptic} would be the only one who checks the wine." },
    { id: "resident-evil", name: "Resident Evil", franchise: "Resident Evil", needs: { steadiness: 1, flex: 0.9, boldness: 0.7, structure: 0.6, trust: 0.7, persist: 0.6 },
      blurb: "Dark corridors, scarce resources and the need to trust the person next to you.", why: "It rewards {loves}. {peace} would keep everyone calm and {solver} would find the way through the lab." },
    { id: "mass-effect", name: "The Mass Effect Galaxy", franchise: "Mass Effect", needs: { initiative: 0.8, trust: 0.9, analysis: 0.7, warmth: 0.6, structure: 0.6, explore: 0.6 },
      blurb: "A crew of very different people with one ship, and every decision matters.", why: "It rewards {loves}. {leader} would command, {solver} would run the science and {heart} would host the shore leave." },
    { id: "witcher", name: "The Continent (The Witcher)", franchise: "The Witcher", needs: { autonomy: 0.9, persist: 0.8, flex: 0.7, boldness: 0.6, humor: 0.5 },
      blurb: "A grim, funny, morally gray world that rewards people who can think for themselves.", why: "It rewards {loves}. Your group would take a job, ask a lot of questions and charge more than expected." },
    { id: "piltover", name: "Piltover and Zaun", franchise: "Arcane", needs: { invent: 1, compete: 0.6, boldness: 0.7, analysis: 0.7, autonomy: 0.5, steadiness: -0.5 },
      blurb: "Two cities, one brilliant and one scrappy, and invention that changes everything.", why: "It rewards {loves}. {solver} would build the thing and {chaos} would test it somewhere unwise." },
    { id: "four-nations", name: "The Four Nations (Avatar)", franchise: "Avatar: The Last Airbender", needs: { warmth: 1, flex: 0.8, explore: 0.7, optimism: 0.8, trust: 0.8, patience: 0.5 },
      blurb: "A world that rewards balance, growth and learning from everyone you meet.", why: "It rewards {loves}. {heart} would hold the group together and {scout} would find the next village." },
    { id: "grand-line", name: "The Grand Line (One Piece)", franchise: "One Piece", needs: { optimism: 1, boldness: 1, social: 0.8, trust: 0.8, flex: 0.7, structure: -0.8 },
      blurb: "Big dreams, bigger crews and an ocean that rewards people who simply keep going.", why: "It rewards {loves}. {leader} would declare a dream, and {carry} would quietly get the ship fixed." },
    { id: "hidden-leaf", name: "The Hidden Villages (Naruto)", franchise: "Naruto", needs: { persist: 1, compete: 0.7, warmth: 0.6, optimism: 0.6, initiative: 0.6, trust: 0.6 },
      blurb: "A world where effort, rivalry and friendship become power.", why: "It rewards {loves}. {push} would never stop training and {peace} would remind everyone why they started." },
    { id: "paradis", name: "Paradis (Attack on Titan)", franchise: "Attack on Titan", needs: { persist: 1, analysis: 0.8, boldness: 0.7, structure: 0.8, steadiness: 0.6, trust: 0.4, optimism: -0.6 },
      blurb: "A walled world where survival takes discipline, strategy and trust under pressure.", why: "It rewards {loves}. {strategist} would plan the operation and {sacrifice} would be first through the gate." },
    { id: "baker-street", name: "Baker Street, London", franchise: "Sherlock Holmes", needs: { analysis: 1.2, explore: 0.8, autonomy: 0.6, persist: 0.7, structure: 0.5 },
      blurb: "Fog, curiosity and mysteries that only get solved by people who notice everything.", why: "It rewards {loves}. {detail} would spot the clue and {solver} would explain it a little too enthusiastically." },
    { id: "olympus", name: "Olympus and Ancient Greece", franchise: "Greek Mythology", needs: { compete: 0.8, boldness: 0.8, initiative: 0.7, persist: 0.7, social: 0.5, analysis: 0.5 },
      blurb: "Gods, heroes and epic ambitions, and everybody has strong opinions.", why: "It rewards {loves}. {leader} would lead the quest and {skeptic} would ask which god exactly is angry." },
    { id: "night-city", name: "A Neon Cyberpunk City", franchise: "Cyberpunk", needs: { autonomy: 1, flex: 0.9, boldness: 0.8, invent: 0.7, trust: -0.5, structure: -0.4 },
      blurb: "Bright lights, sharp edges and a city that favors people who can adapt fast.", why: "It rewards {loves}. {scout} would find the back door and {chaos} would make it louder." },
    { id: "tavern", name: "A Fantasy Adventurers' Guild", franchise: "Fantasy", needs: { humor: 0.8, social: 0.8, warmth: 0.7, flex: 0.7, explore: 0.7, boldness: 0.6 },
      blurb: "Quests, taverns and a party of misfits with more heart than sense.", why: "It rewards {loves}. {heart} would run the tavern table and {scout} would take on the dungeon." },
    { id: "island", name: "A Deserted Island", franchise: "Survival", needs: { steadiness: 0.9, flex: 1, structure: 0.8, trust: 0.8, warmth: 0.6, persist: 0.8 },
      blurb: "No signal, no supplies and a lot of coconuts.", why: "It rewards {loves}. {carry} would build the shelter and {peace} would keep morale up." },
    { id: "sitcom", name: "A Sitcom Workplace", franchise: "Sitcom", needs: { social: 0.9, humor: 1, warmth: 0.8, flex: 0.5, structure: -0.4 },
      blurb: "Awkward meetings, strong friendships and absolutely no productivity.", why: "It rewards {loves}. {heart} would be the glue and {chaos} would be the reason for the fire drill." },
    { id: "starship", name: "A Starship Crew (Star Trek)", franchise: "Star Trek", needs: { analysis: 0.9, structure: 0.8, trust: 0.8, explore: 0.9, steadiness: 0.8, warmth: 0.5 },
      blurb: "Exploration, logic and a crew that talks things through, even on red alert.", why: "It rewards {loves}. {solver} would run the science and {leader} would give the speech." },
  ]);

  const T = (id, franchise, name, members, blurb, why) => ({ id, franchise, name, members, blurb, why });
  A("teams", [
    T("bat-family", "DC", "The Bat Family", ["bruce-wayne", "dick-grayson", "barbara-gordon", "alfred-pennyworth", "selina-kyle"], "A very prepared found family: one planner, one acrobat, one brain behind a screen, one butler and one thief with her own agenda.", "Your group has the same shape: someone who plans three moves ahead, someone who keeps the mood up, and someone doing quiet, essential work behind the scenes."),
    T("justice-league", "DC", "The Justice League", ["clark-kent", "diana-prince", "bruce-wayne", "barry-allen", "hal-jordan", "arthur-curry", "victor-stone"], "Each of you brings something the others don't. It isn't always smooth, but it works when it counts.", "Each of you plays a different strength, and together you'd cover the whole board: the steady one, the bold one, the clever one and the heart."),
    T("teen-titans", "DC", "The Teen Titans", ["dick-grayson", "rachel-roth", "koriand-r", "victor-stone"], "A group of misfits who found a home in each other and turned out to be better together than any of them expected.", "Your group is a set of very different people who work because they've stopped trying to be the same."),
    T("avengers", "Marvel", "The Avengers", ["steve-rogers", "tony-stark", "thor-odinson", "bruce-banner", "natasha-romanoff"], "Big personalities, bigger egos and a surprising ability to pull together when it matters.", "You'd bring big personalities and strong opinions, and still pull together when it matters."),
    T("x-men", "Marvel", "The X-Men", ["charles-xavier", "ororo-munroe", "logan", "erik-lehnsherr"], "A team built around a shared dream and a lot of strong, conflicting opinions about how to get there.", "Your group balances idealism, steadiness and a few strong, independent voices, which is exactly how this team works."),
    T("young-heroes", "Marvel", "The Young Heroes of Marvel", ["peter-parker", "miles-morales", "kamala-khan"], "Earnest, funny and a bit overwhelmed, each carrying a big legacy and learning to do it their own way.", "There's a hopeful, quick-witted energy in your group, the kind that keeps trying even when it feels like too much."),
    T("fellowship", "The Lord of the Rings", "The Fellowship", ["gandalf", "aragorn", "frodo-baggins", "samwise-gamgee"], "A small, unlikely group with one impossible job, held together by loyalty.", "Your group has the long-haul loyalty this team is built on: someone steady, someone wise and someone who simply won't leave."),
    T("rebel-alliance", "Star Wars", "The Rebel Alliance", ["luke-skywalker", "leia-organa", "han-solo", "obi-wan-kenobi", "yoda"], "A hopeful farm kid, a sharp leader, a scoundrel and two very old teachers, and somehow it works.", "A mix of hope, nerve and calm leadership is exactly what holds this team together, and your group has the same mix."),
    T("dumbledores-army", "Harry Potter", "Dumbledore's Army", ["harry-potter", "hermione-granger", "ron-weasley", "luna-lovegood", "albus-dumbledore"], "Brave, curious and fiercely loyal, a group that learns by doing and cares more than the rules say they should.", "Your group is curious, loyal and brave in a quiet way, which is what this team is all about."),
    T("straw-hats", "One Piece", "The Straw Hat Crew", ["monkey-d-luffy", "roronoa-zoro", "nami", "sanji", "usopp"], "A captain with a dream, a crew that wouldn't trade each other for anything, and constant, cheerful chaos.", "Your group runs on loyalty, enthusiasm and very different talents, with just enough chaos to keep things fun."),
    T("team-avatar", "Avatar: The Last Airbender", "Team Avatar", ["aang", "katara", "sokka", "toph-beifong", "zuko", "iroh"], "A group of kids and one very wise uncle who grew into a family and changed the world together.", "Warmth, humor and growth hold your group together, much like this team of very different people."),
    T("survivors", "Resident Evil", "The Survivors", ["leon-kennedy", "jill-valentine", "chris-redfield"], "Calm, capable and quietly stubborn, the people you want next to you when the lights go out.", "Your group has the calm, capable, keep-going quality of people who'd get through a bad night together."),
    T("normandy", "Mass Effect", "The Normandy Crew", ["commander-shepard", "garrus-vakarian", "liara-tsoni"], "A tight crew with a lot of trust, a lot of skill and a lot of shore leave stories.", "There's a trust and competence in your group that makes you easy to follow into the unknown."),
    T("geralts-family", "The Witcher", "Geralt's Found Family", ["geralt-of-rivia", "yennefer-of-vengerberg", "ciri", "jaskier"], "A grumpy monster hunter, a powerful sorceress, a wild kid and a bard who won't shut up, and none of them would admit they're family.", "Your group is a little prickly, a little funny and deeply loyal underneath, the way a found family often is."),
    T("piltover", "Arcane", "The Piltover Circle", ["jinx", "vi", "jayce-talis", "viktor", "caitlyn-kiramman"], "Inventors, enforcers and dreamers, brilliant and complicated and pulled in a lot of directions.", "Your group is full of sharp minds and strong feelings, pulling in a few different directions at once."),
    T("scouts", "Attack on Titan", "The Scout Regiment", ["eren-yeager", "armin-arlert", "mikasa-ackerman", "levi-ackerman", "erwin-smith"], "Fierce, disciplined and bound by what they've been through. They work because they have each other's backs.", "Discipline, nerve and a shared weight on your shoulders: your group has the determination this team is known for."),
    T("team-seven", "Naruto", "Team Seven", ["naruto-uzumaki", "sasuke-uchiha", "kakashi-hatake"], "An optimist, a rival and a laid-back mentor, learning to rely on each other the hard way.", "Your group has the same mix of drive, rivalry and quiet care, with someone laid-back keeping it from boiling over."),
    T("baker-street", "Sherlock Holmes", "The Baker Street Irregulars", ["sherlock-holmes", "john-watson", "irene-adler"], "A brilliant mind, a loyal friend and a worthy rival. The best detective agency in town.", "Sharp observation, steady loyalty and a bit of cleverness: your group has the makings of a very good detective agency."),
    T("olympians", "Greek Mythology", "The Olympians", ["athena", "hades", "heracles", "achilles", "prometheus"], "Proud, powerful and absolutely certain they're right. Every meeting is an epic.", "Proud, capable and sure of yourselves, your group has the larger-than-life energy this team runs on."),
    T("stark-allies", "Game of Thrones", "The Stark Allies", ["jon-snow", "arya-stark", "tyrion-lannister", "daenerys-targaryen"], "An honest soldier, a survivor, a sharp mind and a queen. Together they could rule, if they don't argue first.", "Honesty, grit and a sharp mind in the same room: your group has the range this team needs."),
    T("albuquerque", "Breaking Bad", "The Albuquerque Operation", ["walter-white", "jesse-pinkman", "saul-goodman"], "A very serious chemist, a very emotional apprentice and a lawyer with a billboard. Chaos with spreadsheets.", "Ambitious, emotional and very good at talking: your group is a surprisingly effective, slightly chaotic partnership."),
  ]);

  A("stories", [
    { id: "zombies", icon: "🧟", name: "Zombie survivors", needs: { steadiness: 0.9, structure: 0.7, flex: 0.9, boldness: 0.5, trust: 0.7 }, peak: { analysis: 0.4 },
      text: "You'd probably survive a zombie outbreak. {peace} keeps everyone calm, {solver} finds the pharmacy route, and {leader} somehow decides faster than panic spreads." },
    { id: "empire", icon: "🏛️", name: "Accidental revolution", needs: { boldness: 0.9, initiative: 0.8, humor: 0.7, flex: 0.8, structure: -0.7 }, peak: { initiative: 0.3 },
      text: "You'd accidentally overthrow an empire. It starts with {chaos} saying 'how hard can it be?' and ends with {strategist} writing a very reasonable constitution." },
    { id: "detectives", icon: "🕵️", name: "Detective agency", needs: { analysis: 1, explore: 0.8, persist: 0.7, structure: 0.5, autonomy: 0.4 }, peak: { analysis: 0.4 },
      text: "You'd create the greatest detective agency in the city. {detail} spots the clue, {solver} connects it, and {skeptic} insists on a third opinion before anyone says 'it was the butler.'" },
    { id: "band", icon: "🎸", name: "Surprise hit band", needs: { social: 0.8, humor: 0.8, invent: 0.8, optimism: 0.6, flex: 0.5 }, peak: { humor: 0.3 },
      text: "You'd start a band that's weirdly successful. {heart} writes the hook, {chaos} insists on the costumes, and {carry} quietly handles every booking." },
    { id: "garage", icon: "🛠️", name: "Garage invention", needs: { invent: 1, persist: 0.9, optimism: 0.7, analysis: 0.6, flex: 0.4 }, peak: { invent: 0.4 },
      text: "You'd build something in a garage that works far better than anyone expected. {solver} designs it, {push} refuses to let it stall, and {chaos} presses the button first." },
    { id: "hidden-cove", icon: "🏝️", name: "Lost and found", needs: { explore: 1, flex: 0.9, optimism: 0.7, structure: -0.6, boldness: 0.6 }, peak: { explore: 0.4 },
      text: "You'd get gloriously lost, find a hidden cove and refuse to leave. {scout} finds it, {peace} makes it comfortable, and {strategist} quietly packs the snacks you didn't know you needed." },
    { id: "surprise-party", icon: "🎉", name: "Perfectly planned chaos", needs: { structure: 0.8, humor: 0.7, social: 0.7, warmth: 0.6 }, spread: { boldness: 0.3 },
      text: "You'd throw a flawlessly planned surprise party that goes hilariously wrong. {strategist} has a spreadsheet, {chaos} has a confetti cannon, and somehow it's the best party anyone's been to." },
    { id: "project", icon: "📅", name: "Early finish", needs: { structure: 1, persist: 1, steadiness: 0.7, patience: 0.6 }, peak: { structure: 0.3 },
      text: "You'd finish the group project early. {strategist} makes the plan, {carry} does the heavy lifting and {push} keeps reminding everyone about the deadline. It's a little unnerving." },
    { id: "kingdom", icon: "🏰", name: "Tiny kingdom", needs: { initiative: 0.9, compete: 0.7, autonomy: 0.7, structure: 0.6, analysis: 0.4 }, peak: { initiative: 0.5 },
      text: "You'd found a small but surprisingly well-run kingdom. {leader} gets the crown, {strategist} writes the laws, and {skeptic} leads the opposition, which keeps everyone honest." },
    { id: "found-family", icon: "🏡", name: "Found family", needs: { warmth: 1, trust: 0.9, optimism: 0.7, patience: 0.6, social: 0.4 }, peak: { warmth: 0.4 },
      text: "You'd become a found family that outlasts the adventure. {heart} remembers everyone's birthday, {peace} sorts out every argument and {sacrifice} would do anything for the rest of you." },
    { id: "treasure", icon: "🗺️", name: "Treasure hunters", needs: { boldness: 0.9, explore: 0.9, optimism: 0.8, flex: 0.7, humor: 0.5 }, peak: { boldness: 0.3 },
      text: "You'd set sail for a legendary treasure and find something better. {scout} reads the map, {leader} picks a heading and {chaos} accidentally discovers the real prize." },
    { id: "quiet-heroes", icon: "🌃", name: "Unsung heroes", needs: { persist: 0.9, steadiness: 0.8, warmth: 0.7, social: -0.6, humor: -0.1 }, peak: { persist: 0.3 },
      text: "You'd quietly save the city and nobody would know. {carry} does the work, {sacrifice} takes the risk and {peace} makes sure everyone gets home for dinner." },
    { id: "conspiracy", icon: "🧵", name: "Conspiracy unravelers", needs: { analysis: 0.9, explore: 0.9, autonomy: 0.6, compete: 0.4, trust: -0.5 }, peak: { analysis: 0.4 },
      text: "You'd uncover a conspiracy because someone just couldn't leave it alone. {detail} notices the inconsistency and {skeptic} insists on pulling the thread." },
    { id: "viral", icon: "📲", name: "Accidentally famous", needs: { humor: 0.9, social: 0.9, boldness: 0.7, flex: 0.6 }, peak: { humor: 0.4 },
      text: "You'd go viral for the wrong reasons, then the right ones. {chaos} does something unwise on camera and {heart} turns it into something people love." },
    { id: "rescue", icon: "🚒", name: "First on the scene", needs: { steadiness: 0.8, warmth: 0.8, initiative: 0.7, persist: 0.7, boldness: 0.5 }, peak: { warmth: 0.3 },
      text: "You'd be the people who show up when it matters. {leader} gives the first instruction, {peace} keeps everyone calm and {sacrifice} goes in before anyone asks." },
    { id: "heist", icon: "🎩", name: "The perfect plan", needs: { analysis: 0.8, structure: 0.8, flex: 0.8, autonomy: 0.5, trust: 0.4 }, spread: { boldness: 0.3, analysis: 0.2 },
      text: "You'd run the most elaborate, completely harmless prank in history. {strategist} drew the diagram, {scout} cased the building and {chaos} made it a little more dramatic than planned." },
  ]);

  A("storyTypes", [
    { id: "fellowship", icon: "📚", name: "The Fellowship", needs: { trust: 1, persist: 0.9, warmth: 0.8, steadiness: 0.6 }, text: "A group with a long road ahead and a lot of trust, the kind that stays together when it gets hard." },
    { id: "heist-crew", icon: "🎩", name: "The Heist Crew", needs: { analysis: 0.8, flex: 0.9, autonomy: 0.6, structure: 0.6 }, spread: { analysis: 0.2 }, text: "Everyone has a specialty, a plan and a backup. You work best when the odds look slightly impossible." },
    { id: "underdogs", icon: "🏅", name: "The Underdog Team", needs: { persist: 1, optimism: 0.9, humor: 0.5, compete: 0.4 }, text: "Nobody expected you to win, which is exactly why you're dangerous." },
    { id: "found-family", icon: "🏡", name: "The Found Family", needs: { warmth: 1, trust: 0.9, humor: 0.6, optimism: 0.5 }, text: "You came together by accident and stayed because you chose to." },
    { id: "dream-team", icon: "⭐", name: "The Dream Team", needs: { initiative: 0.8, analysis: 0.7, steadiness: 0.7, trust: 0.7 }, spread: { analysis: 0.2 }, text: "Every skill is covered and every personality has a place. On paper, you're unfair." },
    { id: "reluctant", icon: "🚪", name: "The Reluctant Heroes", needs: { steadiness: 0.8, persist: 0.8, autonomy: 0.5, initiative: -0.4 }, text: "None of you asked for this, and all of you will see it through anyway." },
    { id: "creative-collective", icon: "🎨", name: "The Creative Collective", needs: { invent: 1, explore: 0.8, humor: 0.6, flex: 0.6 }, spread: { invent: 0.3 }, text: "A group that works best when the brief is 'surprise us.'" },
    { id: "expedition", icon: "🧭", name: "The Expedition", needs: { explore: 1, boldness: 0.8, flex: 0.7, steadiness: 0.5 }, text: "You'd happily walk toward the edge of the map to see what's there." },
    { id: "rival-alliance", icon: "⚔️", name: "The Rival Alliance", needs: { compete: 1, initiative: 0.7, boldness: 0.6, trust: -0.2 }, text: "You'd argue about everything and still beat everyone else. Friendly competition is your love language." },
    { id: "quiet-network", icon: "🌙", name: "The Quiet Network", needs: { autonomy: 0.8, analysis: 0.6, social: -0.8, steadiness: 0.5 }, text: "Fewer words, more done. You communicate in nods and shared spreadsheets." },
  ]);

  A("dynamics", [
    { id: "machine", name: "A Well-Oiled Machine", icon: "⚙️", needs: { structure: 1, steadiness: 0.8, trust: 0.6, persist: 0.6 }, text: "You tend to know who's doing what and why. Things run smoothly, almost suspiciously." },
    { id: "chaos", name: "Beautiful Chaos", icon: "🎢", needs: { boldness: 0.8, flex: 0.9, humor: 0.8, structure: -1 }, text: "Plans exist, and then you meet reality. It's loud, chaotic and a great time." },
    { id: "benevolent", name: "A Benevolent Dictatorship", icon: "👑", needs: { warmth: 0.4 }, peak: { initiative: 1 }, spread: { initiative: 0.8 }, text: "One person tends to steer and the rest happily let them. As long as they steer well, it works." },
    { id: "council", name: "A Council of Equals", icon: "🪑", needs: { warmth: 0.8, trust: 0.8, patience: 0.6, initiative: 0.2 }, spread: { initiative: -0.6 }, text: "Everyone gets a voice and decisions take a little longer, but they tend to be good ones." },
    { id: "ideas", name: "An Idea Storm", icon: "⚡", needs: { invent: 1, explore: 0.9, flex: 0.6 }, spread: { invent: 0.4 }, text: "There are more ideas than hours in the day. The skill is picking which ones to build." },
    { id: "steady", name: "Slow and Steady", icon: "🐢", needs: { patience: 1, persist: 0.9, steadiness: 0.8, initiative: -0.3 }, text: "Nobody's in a rush and everything gets finished. You're the group that wins by simply not stopping." },
    { id: "friendly", name: "Friendly Competition", icon: "🥊", needs: { compete: 1, humor: 0.7, social: 0.6, boldness: 0.4 }, text: "Everything becomes a contest and everyone pushes everyone else. It's loud, funny and productive." },
    { id: "family", name: "A Found Family", icon: "🏡", needs: { warmth: 1, trust: 0.9, optimism: 0.7, social: 0.4 }, text: "You look out for each other and you'd all show up on a bad day. That glue matters more than any plan." },
  ]);

  A("outcomes", [
    { id: "red-button", icon: "🔴", needs: { boldness: 0.8, humor: 0.6, structure: -0.6 }, peak: { boldness: 0.8 }, text: "{chaos} presses the big red button 'just to see what it does.' It does a lot." },
    { id: "meeting", icon: "🗓️", needs: { analysis: 0.7, patience: 0.4, social: 0.5 }, spread: { initiative: 0.5 }, text: "A ten-minute decision turns into a two-hour debate, and then {leader} just picks the first option anyway." },
    { id: "snacks", icon: "🍿", needs: { warmth: 0.8, humor: 0.6, structure: 0.3 }, text: "The mission is delayed because {heart} insisted everyone eat first. It was, honestly, the right call." },
    { id: "map", icon: "🗺️", needs: { explore: 0.8, structure: -0.8, flex: 0.6 }, text: "{scout} confidently leads the group to the wrong place. It turns out to be the right place." },
    { id: "plan-b", icon: "📋", needs: { structure: 1, analysis: 0.8, patience: 0.4 }, text: "{strategist} reveals a Plan B, C and D. Plan E is a coffee break. It's the only one that's used." },
    { id: "quiet", icon: "🤫", needs: { social: -0.9, autonomy: 0.6, analysis: 0.5 }, text: "Three hours pass without a word, and somehow the whole group decides the same thing at the same time." },
    { id: "argument", icon: "🗯️", needs: { compete: 0.9, boldness: 0.6, patience: -0.5 }, text: "{skeptic} and {leader} argue for an hour about the plan, then agree completely about what to do next." },
    { id: "gift", icon: "🎁", needs: { warmth: 0.9, trust: 0.7, optimism: 0.5 }, text: "{sacrifice} quietly gives away the last snack and then pretends not to be hungry. Everyone notices." },
    { id: "invent", icon: "🔧", needs: { invent: 1, persist: 0.6, humor: 0.4 }, text: "{solver} builds a very clever machine. {chaos} immediately finds a new and unintended use for it." },
    { id: "late", icon: "⏰", needs: { structure: -0.9, flex: 0.7, humor: 0.5 }, text: "Everyone shows up at different times with a different story, and the meeting starts when the snacks arrive." },
    { id: "legend", icon: "📜", needs: { humor: 0.8, social: 0.8, boldness: 0.6 }, text: "The story of what happened gets better every time you tell it. By next year it will involve a dragon." },
    { id: "fine", icon: "🙂", needs: { steadiness: 0.5 }, text: "Something goes completely wrong, {peace} says 'it's fine,' and for once, it genuinely is." },
  ]);

  A("config", [
    { id: "survival", weights: { steadiness: 1.2, flex: 1, structure: 0.8, persist: 1, trust: 0.9, analysis: 0.6, boldness: 0.5, warmth: 0.5 }, covered: ["leader", "peace", "solver", "carry"],
      words: ["Dicey", "Shaky", "Decent", "Strong", "Formidable"],
      text: {
        1: "You'd have a rough time, but you'd have a story to tell. If anyone can improvise, it's {chaos}.",
        2: "You'd get through some of it. The group needs a plan, and {strategist} should probably start making one.",
        3: "You'd do fine. {leader} makes the calls, {solver} finds a way, and with a bit of luck you'd all make it out.",
        4: "You'd be in good shape. {peace} keeps everyone steady and {carry} keeps things running, and you'd make a very capable team.",
        5: "You'd be the last ones standing. Calm, capable and well covered, you'd make the whole thing look easy.",
      } },
    { id: "facetLines", lines: {
      explore: { strength: "Curiosity is your superpower. {top} leads the way, and your group is always finding something new.", clash: "{high} wants to see what's over the horizon and {low} would rather finish what's in front of them." },
      invent: { strength: "You're a group that makes things. {top} has ideas the rest of you gladly build on.", clash: "{high} wants to try something brand new and {low} prefers the tried-and-true." },
      analysis: { strength: "You think things through. {top} asks the right questions before anyone leaps.", clash: "{high} wants to analyze and {low} wants to act, which can be a very good tension if you listen to both." },
      structure: { strength: "You're organized, which is a rare thing in a group. {top} keeps the plan on track.", clash: "{high} wants a plan and {low} wants to see where things go. Neither is wrong." },
      initiative: { strength: "You get things started. {top} is never short of momentum and the rest follow.", clash: "{high} wants to steer and {low} would happily follow, which works until two people reach for the wheel." },
      persist: { strength: "You don't give up. {top} sets a standard of staying power the rest of you rise to.", clash: "{high} keeps going when it gets hard and {low} wants to ask whether it's still worth it. Both are fair." },
      warmth: { strength: "You genuinely care about each other. {top} makes sure nobody gets left behind.", clash: "{high} leads with feelings and {low} leads with facts. Learning each other's language is the whole trick." },
      social: { strength: "You're good company. {top} lights up a room and the rest of you enjoy the glow.", clash: "{high} wants a crowd and {low} wants quiet. Plan for both and everyone's happy." },
      humor: { strength: "You laugh a lot, and it gets you through tough moments. {top} usually starts it.", clash: "{high} jokes through everything and {low} wants to be taken seriously. Check in about timing." },
      autonomy: { strength: "You're comfortable thinking for yourselves. {top} isn't afraid to take a different route.", clash: "{high} wants independence and {low} wants to stay close. Agree on when to split and when to stick together." },
      steadiness: { strength: "You're calm when it counts. {top} is the one who keeps everyone steady.", clash: "{high} stays level while {low} feels it all deeply. Each has something the other needs." },
      flex: { strength: "You adapt fast. {top} turns surprises into opportunities.", clash: "{high} rolls with the changes and {low} would rather stick to the plan. The group needs both." },
      boldness: { strength: "You're brave. {top} will take the first leap and the others find it easier to follow.", clash: "{high} wants to take the risk and {low} wants to think about the downside. Between you, you'll get it right." },
      trust: { strength: "You trust each other, and that makes everything else easier. {top} sets the tone.", clash: "{high} trusts easily and {low} wants proof first. A little patience on both sides goes a long way." },
      compete: { strength: "You push each other. {top} loves to win and drags the group up with them.", clash: "{high} is playing to win and {low} is playing to enjoy it. Agree on what the game is." },
      patience: { strength: "You're patient with each other. {top} gives people time to get there.", clash: "{high} is happy to wait and {low} wants it done now. Name a deadline and you're fine." },
      optimism: { strength: "You expect things to work out, and that makes them more likely to. {top} is the sunshine.", clash: "{high} sees the bright side and {low} sees the risks. Between you, you see the whole picture." },
    } },
  ]);
})(typeof Forge !== "undefined" ? Forge : (globalThis.Forge = globalThis.Forge || {}));
if (typeof module !== "undefined" && module.exports) module.exports = Forge;
