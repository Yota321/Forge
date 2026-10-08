/* =========================================================================
   VENTURES (data only). Longer "If the two of you ..." stories for the pair article's Stories chapter
   (js/forge/story.js). Same beat format as the world scripts: four beats, each option tied to a personality leaning
   (presets live in pack-story-worlds.js), picked from the two people's own facets.
     needs   facet weights on the pair's blend: how naturally this venture suits them (used to choose which three to show)
   Tokens: {A} {B} {lead} {other}.
   ========================================================================= */
(function(F){
  "use strict";
  if (!F.packs) return;
  const V = (id, title, icon, needs, beats) => ({ id, title, icon, needs, beats });
  const B = (about, ...o) => ({ about, o });

  F.packs.add("ventures", [
    V("detective-agency", "opened a detective agency", "🕵️", { analysis: 1, explore: 0.8, persist: 0.7, autonomy: 0.4 }, [
      B("pair", ["analytic", "The sign goes up above a tiny office with a leaky radiator. {A} and {B} take the first case, a missing umbrella, with the seriousness of a murder."], ["curious", "The sign goes up above a tiny office and the phone rings before the paint is dry. {A} and {B} are on the first case, a missing ferret, before anybody finishes the sentence."]),
      B("lead", ["steady", "{lead} sits at the desk, listens to the whole story and asks exactly one question. It's always the right one."], ["bold", "{lead} follows the suspect through the market, over a wall and into a bakery. It is not procedure. It works."]),
      B("other", ["analytic", "{other} keeps the files, the timeline and the map with pins, and notices the date that doesn't fit."], ["warm", "{other} makes tea for every client and gets the real story out of them before the second biscuit."]),
      B("gap", ["close", "By the end of the first year the agency is known for solving cases in a single quiet conversation, and the two of you never explain how."], ["far", "By the end of the first year the agency has two very different reputations: the careful one and the unpredictable one. Clients ask for both."])
    ]),

    V("cafe", "ran a café together", "☕", { warmth: 1, structure: 0.7, social: 0.7, patience: 0.6, humor: 0.4 }, [
      B("pair", ["warm", "The café opens with eleven chairs and a menu that changes by mood. {A} and {B} know the regulars' orders by the end of the first week."], ["planner", "The café opens on schedule, with a rota, a stock list and a spotless counter. {A} and {B} look like they've run it for ten years."]),
      B("lead", ["social", "{lead} greets every customer by name, remembers the dog's birthday and somehow talks someone into trying the weird special."], ["steady", "{lead} handles the Saturday rush calmly, one order at a time, with the grace of someone who simply does not panic."]),
      B("other", ["inventive", "{other} invents a drink that becomes the reason people queue round the corner, and refuses to say what is in it."], ["analytic", "{other} fixes the stock, the margins and the supplier problem quietly, so the café can be as relaxed as it looks."]),
      B("gap", ["close", "By spring the café feels like an extension of the two of you: warm, a little organised and impossible to leave."], ["far", "By spring the café has two personalities, a calm corner and a loud one, and customers have strong opinions about which is better."])
    ]),

    V("startup", "started a company", "🚀", { initiative: 1, invent: 0.8, boldness: 0.7, persist: 0.7, optimism: 0.5 }, [
      B("pair", ["bold", "The company starts in a spare room with a whiteboard and a big idea. {A} and {B} have a pitch deck before they have a name."], ["planner", "The company starts with a business plan, a budget and a name that has been checked three times. {A} and {B} are the founders investors actually trust."]),
      B("lead", ["driven", "{lead} makes the call, sends the email and chases the meeting. The company moves because they refuse to let it stall."], ["analytic", "{lead} builds the model, finds the flaw and fixes it before the investor ever sees it."]),
      B("other", ["inventive", "{other} ships the strange feature that becomes the reason anyone has heard of you."], ["warm", "{other} keeps the first five employees from burning out, and ends up as the reason they stay."]),
      B("gap", ["close", "By the end of year one you are the founders who finish each other's pitches, and the investors can't tell who wrote what."], ["far", "By the end of year one you are the founders who argue in the boardroom and agree in the corridor, which, strangely, is why it works."])
    ]),

    V("game-studio", "opened a game studio", "🎮", { invent: 1.2, persist: 0.7, humor: 0.5, analysis: 0.5, explore: 0.5 }, [
      B("pair", ["inventive", "The studio opens with three desks and a game idea that fits on a napkin. {A} and {B} have a playable prototype by the end of the month."], ["planner", "The studio opens with a design document, a milestone chart and a schedule that mostly holds. {A} and {B} are the rare studio that actually ships."]),
      B("lead", ["bold", "{lead} decides, on a Tuesday, that the whole game needs a new central mechanic. It turns out to be the best idea in it."], ["steady", "{lead} holds the team together through crunch with calm, snacks and a clear list of what really matters."]),
      B("other", ["inventive", "{other} puts one tiny secret into the game that becomes the thing players talk about for years."], ["analytic", "{other} balances the economy, the difficulty curve and the bugs, and quietly makes the game feel fair."]),
      B("gap", ["close", "By launch you finish each other's design notes, and the reviews describe the game as 'cohesive', which is the nicest word there is."], ["far", "By launch the game has two very distinct halves, one polished and one wild, and players argue about which they prefer."])
    ]),

    V("kingdom", "ruled a kingdom together", "👑", { initiative: 0.9, structure: 0.7, warmth: 0.6, steadiness: 0.6, analysis: 0.5 }, [
      B("pair", ["planner", "You inherit the throne, a leaking roof and an ancient treasury ledger. {A} and {B} take to governing by organising the paperwork, which, in a kingdom, is revolutionary."], ["warm", "You inherit the throne and the first thing you do is open the gates to a festival. {A} and {B} are beloved before the first tax is raised."]),
      B("lead", ["bold", "{lead} makes a decree before breakfast, and the court spends a week figuring out how to make it work. It does."], ["steady", "{lead} listens to every petitioner for hours and delivers a judgement that makes both sides feel heard."]),
      B("other", ["analytic", "{other} reads the treaty, the border maps and the harvest figures, and quietly prevents a war with a single paragraph."], ["funny", "{other} diffuses a diplomatic crisis at a banquet with a toast so good the ambassadors forget what they were angry about."]),
      B("gap", ["close", "You rule together like two halves of one decision, and the kingdom enjoys an unusually quiet century."], ["far", "You rule from opposite ends of the throne room, and the kingdom learns to appreciate a government where everything is argued twice."])
    ]),

    V("tv-show", "hosted a TV show together", "📺", { social: 1, humor: 1, boldness: 0.6, flex: 0.6, warmth: 0.4 }, [
      B("pair", ["funny", "The show launches in a studio the size of a garage. {A} and {B} have the audience laughing within the first minute, mostly at each other."], ["planner", "The show launches with a script, a run-sheet and a very well-lit set. {A} and {B} are the most professionally prepared hosts on television."]),
      B("lead", ["social", "{lead} greets the guest as if they were an old friend and has them telling their best story before the first ad break."], ["bold", "{lead} goes off-script in the middle of a live segment, and the whole crew holds its breath. It's the clip everyone shares."]),
      B("other", ["warm", "{other} puts nervous guests at ease with one look, so the interviews feel like conversations."], ["analytic", "{other} has researched every guest to a degree that is slightly unnerving, and asks the one question nobody expected."]),
      B("gap", ["close", "By season two you have a rhythm, a catchphrase nobody wrote down and a loyal audience that tunes in for the way you two talk."], ["far", "By season two you have a show built on friendly disagreement, and the audience votes on who won each week."])
    ]),

    V("pirate-crew", "sailed a pirate ship together", "🏴‍☠️", { boldness: 1, humor: 0.7, flex: 0.8, optimism: 0.7, social: 0.5 }, [
      B("pair", ["bold", "You leave port with a secondhand ship and a half-finished map. {A} and {B} name the ship before anyone has checked if it floats."], ["planner", "You leave port with provisions, a chart and a watch rota. {A} and {B} are, by some distance, the best-run pirate crew on the sea."]),
      B("lead", ["improviser", "{lead} steers into the storm because the other way is boring. The crew screams, and then cheers."], ["steady", "{lead} holds the wheel through the squall and quietly hums. By the time it passes the crew is calm too."]),
      B("other", ["funny", "{other} keeps the crew fed, entertained and just on the legal side of mutiny with a steady supply of absurd songs."], ["inventive", "{other} patches the sail, the hull and the rigging with whatever is to hand, and the ship sails better than it ever did."]),
      B("gap", ["close", "You find the treasure in step, and discover that what you really wanted was the next horizon. You both knew it all along."], ["far", "You find the treasure by arguing about the map the whole way, which, it turns out, was the shortest route."])
    ]),

    V("heist", "planned a heist", "💎", { structure: 0.9, analysis: 0.9, trust: 0.5, steadiness: 0.6, boldness: 0.5 }, [
      B("pair", ["planner", "The plan goes up on the wall: a floor plan, a timeline and a list of people nobody will meet. {A} and {B} have thought of everything, including the thing that goes wrong."], ["improviser", "The plan, such as it is, goes up on a napkin. {A} and {B} are betting everything on adapting in the moment, and it's a surprisingly good bet."]),
      B("lead", ["steady", "{lead} walks into the lobby as if they've worked there for years. Nobody even glances up."], ["bold", "{lead} walks into the lobby with a smile and a very large plant. It works. It should not have worked."]),
      B("other", ["analytic", "{other} watches the cameras, the guards and the clock and quietly calls the exact second to move."], ["inventive", "{other} bypasses the vault door with something that is mostly a coat hanger and a lot of knowledge."]),
      B("gap", ["close", "The job goes without a hitch, and in the getaway car neither of you says a word. You don't need to."], ["far", "The job goes completely differently to the plan, and you both blame each other, and you both get away. It's the perfect result."])
    ])
  ]);
})(typeof Forge !== "undefined" ? Forge : (globalThis.Forge = globalThis.Forge || {}));
if (typeof module !== "undefined" && module.exports) module.exports = Forge;
