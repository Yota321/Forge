/* =========================================================================
   COMPARE STORY (compare.html): the two-person report, written as ONE article.

   Rendering only. Every sentence comes from Forge.story (js/forge/story.js), which composes the lens score, the original
   compatibility reads, the character engine, the world/team rankings and the story packs into thirteen chapters with a single
   de-duplication pass. There is no second report and nothing hidden behind one: each piece of the earlier report (shared strengths, what each brings, who leans into what, the overlay radars, styles, friction, advice, fun facts,
   confidence) lives inside the chapter it belongs to.

   State the Navigation layer (js/nav.js) saves and restores: the picked lens, the relationship chip, the situations page, open
   <details>, scroll. Names in compareState are already HTML-safe (escaped once at the source).
   ========================================================================= */

const SX_CHAPTERS = [
  ["overall", "Overall", "01"], ["why", "Why", "02"], ["balance", "Balance", "03"], ["struggle", "Struggles", "04"], ["communication", "Talking", "05"],
  ["decision", "Deciding", "06"], ["conflict", "Conflict", "07"], ["characters", "Characters", "08"], ["worlds", "Worlds", "09"], ["teams", "Teams", "10"],
  ["stories", "Stories", "11"], ["situations", "Situations", "12"], ["ending", "Ending", "13"]
];
let activeLensId = null, activeRelations = [], storyRound = 0, storyArt = null, storyUI = null;
function lensEngine(){ return (typeof Forge !== "undefined" && Forge.experience && Forge.packs && Forge.story) ? Forge.experience : null; }

/* ---------------- small pieces ---------------- */
const sxP = arr => (arr || []).filter(Boolean).map(t => `<p>${t}</p>`).join("");
/* a sentence that starts with someone's name: bold the name in place, leave the grammar alone */
const sxBoldLead = (text, name) => (name && String(text).indexOf(name) === 0) ? `<b class="sx-win">${name}</b>${String(text).slice(name.length)}` : String(text);
const sxList = arr => (arr && arr.length) ? `<ul class="sx-bullets">${arr.map(t => `<li>${t}</li>`).join("")}</ul>` : "";
const sxTags = arr => (arr && arr.length) ? `<div class="tag-list sx-tags">${arr.map(t => `<span class="tag">${t}</span>`).join("")}</div>` : "";
function sxMoreList(more){ return (more && more.items && more.items.length) ? `<details class="sx-more"><summary>${more.title}</summary>${sxP(more.items)}</details>` : ""; }
function sxEcho(text){ return text ? `<aside class="sx-echo sx-wide"><span class="sx-echo-icon" aria-hidden="true">🎭</span><p>${text}</p></aside>` : ""; }

/* The boxes. Every block of the article lives in one: a "card glass" (the app's own coloured bento card; js/global.js picks its tone so that
   neighbours differ), a "panel" (the plain dark/light card, for charts that need a known background), or a tile (a small box inside a card).
   Cards never nest inside cards, because the tone assigner colours only the outer one and the inner tiles borrow its shades. */
const sxCard = (inner, cls, head) => inner ? `<div class="card glass sx-card ${cls || ""}">${head ? `<h3 class="sx-card-title" aria-level="3">${head}</h3>` : ""}${inner}</div>` : "";
const sxPanel = (inner, cls, head) => inner ? `<div class="card sx-panel sx-card ${cls || ""}">${head ? `<h3 class="sx-card-title" aria-level="3">${head}</h3>` : ""}${inner}</div>` : "";
const sxTile = (label, text, cls) => text ? `<div class="sx-tile ${cls || ""}">${label ? `<span class="sx-who">${label}</span>` : ""}<p>${text}</p></div>` : "";
const sxTiles = (rows, cls) => rows.filter(r => r && r[1]).length ? `<div class="sx-tiles ${cls || ""}">${rows.filter(r => r && r[1]).map(r => sxTile(r[0], r[1], r[2])).join("")}</div>` : "";

function sxQA(list){
  if (!list || !list.length) return "";
  return sxCard(sxTiles(list.map(x => [x.q, x.text])), "sx-wide sx-qa-card");
}
function sxTwo(label, a, b, ui, same){
  if (!a && !b) return "";
  if (same) return sxCard(`<div class="sx-tiles"><div class="sx-tile sx-tile-wide"><span class="sx-who">Both of you</span><p>${a}</p></div></div>`, "sx-two", label);
  return sxCard(`<div class="sx-tiles sx-tiles-2"><div class="sx-tile"><span class="sx-who">${ui.A}</span><p>${a || ""}</p></div><div class="sx-tile"><span class="sx-who">${ui.B}</span><p>${b || ""}</p></div></div>`, "sx-two", label);
}
/* one section of the lens pack, told in prose with its meter (category), its answer (who / pick / duo) or its list */
function sxSection(s){
  if (s.type === "category") return `<div class="sx-meter"><h3 class="sx-card-title" aria-level="3">${s.title}</h3>${cxSegs(s.level, "vibe", `${s.title}: ${s.word}`, 5)}<span class="lens-word">${s.word}</span></div><p>${s.text}</p>`;
  if (s.type === "who") return `<h3 class="sx-card-title" aria-level="3">${s.title}</h3><p class="sx-answer">${s.close ? "A tie" : s.winner}</p><p>${s.text}</p>`;
  if (s.type === "duo" || s.type === "pick") return `<h3 class="sx-card-title" aria-level="3">${s.title}</h3><p class="sx-answer"><span aria-hidden="true">${s.emoji || ""}</span> ${s.name}</p><p>${s.text}</p>`;
  if (s.type === "list") return (s.items && s.items.length) ? `<h3 class="sx-card-title" aria-level="3">${s.title}</h3>${s.intro ? `<p>${s.intro}</p>` : ""}${sxList(s.items)}` : (s.empty ? `<h3 class="sx-card-title" aria-level="3">${s.title}</h3><p>${s.empty}</p>` : "");
  return "";
}
const sxSections = arr => (arr || []).map(s => { const h = sxSection(s); return h ? sxCard(h, "sx-sec" + (s.type === "list" ? " sx-wide" : "")) : ""; }).join("");
/* the lines a chapter opens with, and its closing line, as cards */
const sxLines = (lines, head) => (lines && lines.length) ? sxCard(sxList(lines), "sx-wide sx-lines", head) : "";
const sxCloser = text => text ? sxCard(`<p class="sx-closer">${text}</p>`, "sx-wide sx-closer-card") : "";
const sxProse = (paras, head, cls) => { const h = sxP(paras); return h ? sxCard(h, cls || "sx-wide", head) : ""; };
const sxMoreCard = more => { const h = sxMoreList(more); return h ? sxCard(h, "sx-wide sx-more-card") : ""; };

function sxChapter(key, num, ch, inner, cls){
  return `<section class="sx-chapter section ${cls || ""}" id="sx-${key}" aria-labelledby="sx-${key}-h">
    <header class="sx-ch-head"><span class="sx-num" aria-hidden="true">${num}</span><div><p class="eyebrow accent">${ch.eyebrow}</p><h2 id="sx-${key}-h" aria-level="2">${ch.title}</h2>${ch.lead ? `<p class="sx-lead">${ch.lead}</p>` : ""}</div></header>
    <div class="sx-body">${(ch.bridge && key !== "ending") ? `<p class="sx-bridge sx-wide">${ch.bridge}</p>` : ""}${inner}</div>
  </section>`;
}

/* ---------------- chapters ---------------- */
function sxOverall(ch, ui){
  const rel = (ch.relations && ch.relations.length) ? sxCard(lensRelationsHTML(ch.relations), "sx-wide sx-rel-card") : "";
  return `${ch.meaning ? sxCard(`<p class="sx-pull">${ch.meaning}</p>`, "sx-wide sx-pull-card") : ""}
    ${sxCard(ch.lifts.length ? sxList(ch.lifts) : "<p>Nothing dramatic. This pairing gets along by being different.</p>", "sx-lifts", "<span aria-hidden=\"true\">⬆</span> What lifts it")}
    ${sxCard(ch.holds.length ? sxList(ch.holds) : "<p>Nothing in particular. Keep doing what you're doing.</p>", "sx-holds", "<span aria-hidden=\"true\">⚠</span> What holds it back")}${rel}`;
}
function sxWhy(ch, ui){
  return `${sxProse(ch.paras, "Why it works")}${sxMoreCard(ch.more)}${ch.shared.length ? sxCard(sxTags(ch.shared), "sx-shared-card", "Strengths you share") : ""}${sxSections(ch.sections)}${sxQA(ch.qa)}`;
}
function sxBalance(ch, ui){
  const brings = ch.brings ? sxCard(`<div class="sx-tiles sx-tiles-2"><div class="sx-tile"><span class="sx-who">${ui.A}</span>${sxTags(ch.brings.a.traits.length ? ch.brings.a.traits : ["An even spread"])}</div><div class="sx-tile"><span class="sx-who">${ui.B}</span>${sxTags(ch.brings.b.traits.length ? ch.brings.b.traits : ["An even spread"])}</div></div>`, "sx-brings", "What each of you brings") : "";
  const who = (ch.who && ch.who.length) ? sxCard(`<details class="sx-more"><summary>Trait by trait: who leans into what</summary><div class="sx-tape">${ch.who.map(w => `<div class="mini-bar-row"><span>${w.label}</span><span>${w.winner}</span></div>`).join("")}</div></details>`, "sx-wide sx-more-card") : "";
  const idn = ch.identity ? sxCard(`<div class="sx-tiles sx-tiles-2"><div class="sx-tile"><span class="sx-who">${ui.A}</span><p><span aria-hidden="true">${ch.identity.archetype.a.icon}</span> <b>${ch.identity.archetype.a.name}</b><br>${ch.identity.soul.a.name} soul · ${ch.identity.soul.a.trait}</p></div><div class="sx-tile"><span class="sx-who">${ui.B}</span><p><span aria-hidden="true">${ch.identity.archetype.b.icon}</span> <b>${ch.identity.archetype.b.name}</b><br>${ch.identity.soul.b.name} soul · ${ch.identity.soul.b.trait}</p></div></div>`, "sx-identity", "Who each of you is") + (ch.identity.meaning ? sxTwo("What each soul colour means", ch.identity.meaning.a, ch.identity.meaning.b, ui, ch.identity.meaning.same) : "") : "";
  const f = ch.full;
  const pairTags = (label, p) => (p && p.a && p.b) ? `<h4 class="sx-sub2" aria-level="4">${label}</h4><div class="sx-tiles sx-tiles-2"><div class="sx-tile"><span class="sx-who">${ui.A}</span>${sxTags(p.a)}</div><div class="sx-tile"><span class="sx-who">${ui.B}</span>${sxTags(p.b)}</div></div>` : "";
  const full = f ? sxCard(`<details class="sx-more"><summary>Each of you in full</summary>${pairTags("Top virtues", f.virtues)}${pairTags("Top tendencies", f.tendencies)}${pairTags("Strengths", f.strengths)}${pairTags("Weaknesses", f.weaknesses)}${f.stress ? pairTags("Under stress", { a: [f.stress.a], b: [f.stress.b] }) : ""}${f.funStats && f.funStats.length ? `<h4 class="sx-sub2" aria-level="4">Fun stats</h4>${f.funStats.map(x => `<div class="mini-bar-row"><span>${x.label}</span><span>${ui.A}: ${x.a}% · ${ui.B}: ${x.b}%</span></div>`).join("")}` : ""}</details>`, "sx-wide sx-more-card") : "";
  const shapes = `<div class="card sx-panel sx-card sx-wide sx-shapes-card"><h3 class="sx-card-title" aria-level="3">Your shapes, side by side</h3><figure class="sx-shapes"><div class="sx-shape"><canvas id="cmpRadarMind" width="360" height="360" role="img" aria-label="Overlaid radar chart of both people's dimensions"></canvas><figcaption>How your minds overlap</figcaption></div><div class="sx-shape"><canvas id="cmpRadarEmotion" width="360" height="360" role="img" aria-label="Overlaid radar chart of both people's emotional dimensions"></canvas><figcaption>How your feelings overlap</figcaption></div></figure></div>`;
  return `${sxLines(ch.lines, "How you balance")}${sxProse(ch.complement, "How you complement each other")}${sxMoreCard(ch.more)}${sxSections(ch.sections)}${idn}${brings}${ch.leadership ? sxTwo("Leadership style", ch.leadership.a, ch.leadership.b, ui, ch.leadership.same) : ""}${sxQA(ch.qa)}${shapes}${who}${full}${sxEcho(ch.echo)}${sxCloser(ch.closer)}`;
}
function sxStruggle(ch, ui){
  const where = (!ch.sections.some(s => s.type === "list") && ch.friction.length) ? sxCard(sxTags(ch.friction), "sx-shared-card", "Where it tends to show up") : "";
  return `${sxLines(ch.lines, "Where it grinds")}${sxProse(ch.notes, "Worth noticing")}${sxProse(ch.frictions, "Where you differ")}${sxMoreCard(ch.more)}${sxSections(ch.sections)}${where}${sxEcho(ch.echo)}${sxCloser(ch.closer)}`;
}
function sxCommunication(ch, ui){
  return `${sxLines(ch.lines, "How you talk")}${sxSections(ch.sections)}${ch.styles ? sxTwo("How each of you communicates", ch.styles.a, ch.styles.b, ui, ch.styles.same) : ""}${ch.relStyle ? sxTwo(ch.relLabel || "How each of you shows up", ch.relStyle.a, ch.relStyle.b, ui, ch.relStyle.same) : ""}${sxEcho(ch.echo)}${sxCloser(ch.closer)}`;
}
function sxDecision(ch, ui){
  return `${sxLines(ch.lines, "How you decide")}${sxSections(ch.sections)}${ch.styles ? sxTwo("How each of you decides", ch.styles.a, ch.styles.b, ui, ch.styles.same) : ""}${ch.thinking ? sxTwo("How each of you thinks", ch.thinking.a, ch.thinking.b, ui, ch.thinking.same) : ""}${ch.learning ? sxTwo("How each of you learns", ch.learning.a, ch.learning.b, ui, ch.learning.same) : ""}${sxEcho(ch.echo)}${sxCloser(ch.closer)}`;
}
function sxConflict(ch, ui){
  return `${sxLines(ch.lines, "When you disagree")}${sxSections(ch.sections)}${sxQA(ch.qa)}${sxProse(ch.areas, "Where friction starts")}${sxMoreCard(ch.more)}${sxEcho(ch.echo)}${sxCloser(ch.closer)}`;
}

/* a character's small profile boxes: role, energy, values, motivation, and its strongest traits as meters */
function sxCharCard(p, who, char, code, reasons){
  const C = Forge.characters, pub = C.publicChar(char), cap = typeof cxCap === "function" ? cxCap : (s => s);
  const traits = pub.traits.slice(0, 4).map(t => `<div class="sx-trait"><span>${obEsc(cap(t.label))}</span>${cxSegs(cxLevelOf(t.value), "them", `${pub.short}: ${cxBandWord(t.value)} ${t.label}`)}</div>`).join("");
  const why = (reasons && reasons.length) ? `<div class="sx-tile sx-tile-wide"><span class="sx-who">Why ${who} matches</span>${sxList(reasons.map(r => obEsc(r.text)))}</div>` : "";
  return `<article class="card glass sx-card sx-char">
    <a class="sx-twin" href="${obEsc(cxUrl(p.id, code))}">
      <span class="cx-card-portrait">${C.portraitSVG(char, 96)}</span>
      <span class="sx-twin-text"><span class="cx-card-kind">${who} reads like</span><span class="cx-card-name">${obEsc(p.name)}</span><span class="cx-card-uni">${obEsc(p.universe)}</span></span>
      <span class="cx-card-pct ${cxPctClass(p.pct)}"><b>${p.pct}%</b></span>
      ${p.why ? `<span class="sx-twin-why">${obEsc(p.why)}</span>` : ""}</a>
    <div class="sx-tiles sx-tiles-2 sx-char-tiles">
      ${sxTile("Role", obEsc(pub.role))}${sxTile("From", obEsc(cap(pub.medium)) + " · " + obEsc(pub.universe))}
      ${sxTile("Values", pub.values.slice(0, 3).map(v => obEsc(v.label)).join(", "))}${sxTile("Driven by", pub.motivations.map(v => obEsc(v.label.toLowerCase())).join(", "))}
      ${sxTile("Energy", obEsc(pub.energy), "sx-tile-wide")}${why}
    </div>
    ${traits ? `<div class="sx-traits" aria-label="${obEsc(pub.short)}'s strongest traits">${traits}</div>` : ""}
  </article>`;
}
function sxCharacters(ch, ui){
  const x = ch.cross, d = ch.duo;
  if (!x) return `<p class="sx-wide">The character engine isn't available here, so this chapter is skipped.</p>`;
  const twins = `<div class="sx-twins sx-wide">${sxCharCard(x.a, ui.A, x.cpA, ui.codeA, d && d.why.a)}${sxCharCard(x.b, ui.B, x.cpB, ui.codeB, d && d.why.b)}</div>`;
  const cross = `<blockquote class="sx-crossover sx-wide"><p class="sx-cross-title">A mini crossover: ${obEsc(x.title)}</p><p>${obEsc(x.paragraph)}</p></blockquote>`;
  const shared = x.sharedSaid ? "" : sxCard(x.shared.length ? `<ul class="sx-checks">${x.shared.map(s => `<li>${obEsc(s.text)}</li>`).join("")}</ul>` : `<p>Very little on paper, which is why the crossover works.</p>`, "sx-shared-chars", "What they share");
  const differ = sxCard(x.differences.length ? sxList(x.differences.map(dd => obEsc(dd.text))) : `<p>No single big gap. They are alike almost everywhere.</p>`, "sx-differ-chars", "Where they differ most");
  const inter = x.interplay.length ? sxCard(`<ul class="sx-interplay">${x.interplay.map(i => `<li><b>${i.label}.</b> ${obEsc(i.text)}</li>`).join("")}</ul>`, "sx-wide", "How they would handle it") : "";
  return `${twins}${cross}${shared}${differ}${inter}${sxDuo(d, ui, x)}`;
}
/* what kind of duo the two characters make, what they do well, where they struggle and where they would clash (why each person matches is on the character cards above) */
function sxDuo(d, ui, x){
  if (!d) return "";
  const C = Forge.characters;
  const faces = x ? `<div class="sx-duo-faces" aria-hidden="true"><span class="cx-card-portrait">${C.portraitSVG(x.cpA, 104)}</span><span class="cx-card-portrait">${C.portraitSVG(x.cpB, 104)}</span></div>` : "";
  const people = (rows, cls) => `<div class="sx-tiles sx-tiles-2">${rows.map(r => r.items.length ? `<div class="sx-tile"><span class="sx-who">${obEsc(r.who)}</span><ul class="sx-bullets ${cls}">${r.items.map(i => `<li>${obEsc(i)}</li>`).join("")}</ul></div>` : "").join("")}</div>`;
  const strengths = d.strengths.some(r => r.items.length) ? sxCard(people(d.strengths, "sx-good"), "sx-duo-strong", "What the two of them do well") : "";
  const weaknesses = d.weaknesses.some(r => r.items.length) ? sxCard(people(d.weaknesses, "sx-weak"), "sx-duo-weak", "Where each of them struggles") : "";
  const clashes = d.clashes.length ? sxCard(sxList(d.clashes.map(obEsc)), "sx-wide sx-duo-clash", "Where they would clash") : "";
  return `<section class="card glass sx-card sx-duo sx-wide">${faces}<div class="sx-duo-text"><p class="sx-kicker">${obEsc(d.label)}</p><h3 class="sx-card-title sx-duo-name" aria-level="3">${obEsc(d.name)}</h3>${d.line ? `<p>${obEsc(d.line)}</p>` : ""}</div></section>${strengths}${weaknesses}${clashes}`;
}

/* the emblem for a world, team or organization (assets/<kind>/icons, drawn inline by Forge.emblems); "" when there is none */
function sxEmblem(kind, id, size){
  return (typeof Forge !== "undefined" && Forge.emblems) ? Forge.emblems.tile(kind, id, { size: size || 56 }) : "";
}
function sxEmblemMini(kind, id){
  const s = (typeof Forge !== "undefined" && Forge.emblems) ? Forge.emblems.svg(kind, id, { size: 16 }) : "";
  return s ? `<span class="fx-mini" aria-hidden="true">${s}</span>` : "";
}
const sxCallout = (cls, head, text) => text ? `<div class="sx-callout sx-callout-${cls}"><span class="sx-who">${head}</span><p>${obEsc(text)}</p></div>` : "";
function sxWorldDepth(d){
  if (!d) return { side: "", foot: "" };
  const roles = d.roles.length ? `<h4 class="sx-mini" aria-level="4">The part each of you would play</h4><div class="sx-tiles">${d.roles.map(r => `<div class="sx-tile"><span class="sx-who">${obEsc(r.who)} · ${obEsc(r.title)}</span><p>${obEsc(r.text)}</p></div>`).join("")}</div>${d.gap ? `<p class="sx-fine">${obEsc(d.gap)}</p>` : ""}` : "";
  return { side: roles, foot: `<div class="sx-callouts">${sxCallout("surv", d.strong ? "How you survive" : "How it could go wrong", d.survive)}${sxCallout("adv", "Your biggest advantage", d.advantage)}${sxCallout("chal", "Your biggest challenge", d.challenge)}</div>` };
}
function sxWorld(w, ui){
  const C = Forge.characters, dp = sxWorldDepth(w.depth);
  const feel = (w.feel && w.feel.length) ? `<div class="pe-feel sx-feel" aria-label="How this place feels">${w.feel.map(f => `<div class="pe-feel-row"><span>${f.key.charAt(0).toUpperCase() + f.key.slice(1)}</span>${cxSegs(f.level, "vibe", `${f.key}: ${f.word}`, 5)}</div>`).join("")}</div>` : "";
  const qs = w.qs.length ? `<h4 class="sx-mini" aria-level="4">Who would do what</h4><div class="sx-tiles sx-tiles-q">${w.qs.map(q => sxTile(q.q, q.tie ? q.text : sxBoldLead(q.text, q.winner))).join("")}</div>` : "";
  return `<article class="card glass sx-card sx-world sx-wide" id="sx-w-${w.id}">
    <header class="sx-head">${sxEmblem("worlds", w.id, 96)}<div class="sx-head-text"><p class="sx-kicker">${w.scope === "universe" ? "UNIVERSE" : "WORLD"} · ${obEsc(w.franchise)}</p><h3 class="sx-world-title" aria-level="3">${obEsc(w.title)}</h3></div></header>
    <div class="sx-split">
      <div class="sx-split-main"><p class="sx-world-intro">${w.intro}</p><p class="sx-story-text">${w.story.join(" ")}</p>${sxEcho(w.echo)}</div>
      <div class="sx-split-side">${dp.side}</div>
    </div>
    ${dp.foot}${qs}
    ${feel ? `<h4 class="sx-mini" aria-level="4">How it feels</h4>${feel}` : ""}
    <details class="sx-more"><summary>About ${obEsc(w.name)}</summary>${w.blurb ? `<p>${w.blurb}</p>` : ""}<p>${w.why}</p>${sxTags((w.dominant || []).map(obEsc))}</details>
    <p class="sx-links"><a class="cx-link" href="${obEsc(C.worldUrl(w.id, { code: ui.codeA }))}">Open this world for ${ui.A}</a> <span aria-hidden="true">·</span> <a class="cx-link" href="${obEsc(C.worldUrl(w.id, { code: ui.codeB }))}">for ${ui.B}</a></p>
  </article>`;
}
function sxWorlds(ch, ui){
  if (!ch.cards.length) return `<p class="sx-wide">No world stood out for this pair.</p>`;
  const C = Forge.characters;
  const also = ch.also.length ? sxCard(`<div class="tag-list">${ch.also.map(a => `<a class="tag cx-link-tag" href="${obEsc(C.worldUrl(a.id, { code: ui.codeA }))}">${sxEmblemMini("worlds", a.id)}${obEsc(a.name)}</a>`).join("")}</div>`, "sx-wide sx-also", "Also at home in") : "";
  return `${ch.cards.map(w => sxWorld(w, ui)).join("")}${also}`;
}
function sxTeamDepth(d){
  if (!d) return "";
  const fit = d.effective ? `<div class="sx-fit"><span class="sx-chip sx-chip-fit${d.effective.level}">${obEsc(d.effective.label)}</span>${d.effective.text ? `<p>${obEsc(d.effective.text)}</p>` : ""}${d.effective.note ? `<p class="sx-fine">${obEsc(d.effective.note)}</p>` : ""}</div>` : "";
  const who = sxTiles([["Who leads", obEsc(d.leads)], ["Who follows", obEsc(d.follows)]].concat(d.parts.map(p => [obEsc(p.who) + " · " + obEsc(p.label), obEsc(p.text)])));
  return `<div class="sx-depth"><h4 class="sx-mini" aria-level="4">Who does what, for the two of you</h4>${who}<div class="sx-callouts">${sxCallout("chal", "Where friction appears", d.friction)}${sxCallout("out", "How outsiders would describe you", [d.outsiders, d.contrast].filter(Boolean).join(" "))}</div><h4 class="sx-mini" aria-level="4">How effective would it be?</h4>${fit}</div>`;
}
/* what a team is like from the inside (authored per team): who leads, who holds it together, how they work, what makes it function, where it breaks */
function sxAbout(rows){
  return (rows && rows.length) ? `<h4 class="sx-mini" aria-level="4">About this team</h4>${sxTiles(rows.map(r => [obEsc(r.label), obEsc(r.text)]), "sx-about")}` : "";
}
/* organizations and factions the pair would suit: the culture, who thrives, and the part each of them would hold */
function sxOrg(o){
  const inside = [["How it feels inside", o.culture], ["How it is led", o.leadership], ["How people talk", o.communication], ["How disagreements go", o.conflict]].filter(r => r[1]);
  const parts = (o.parts && o.parts.length) ? `<h4 class="sx-mini" aria-level="4">The part each of you would hold</h4><div class="sx-tiles sx-tiles-2">${o.parts.map(p => `<div class="sx-tile"><span class="sx-who">${p.who}</span><p><b>${obEsc(p.title)}</b></p></div>`).join("")}</div>${o.note ? `<p class="sx-fine">${obEsc(o.note)}</p>` : ""}` : "";
  return `<article class="card glass sx-card sx-team sx-org" id="sx-o-${o.id}"><header class="sx-head">${sxEmblem("organizations", o.id, 96)}<div class="sx-head-text"><p class="sx-kicker">ORGANIZATION${o.franchise ? " · " + obEsc(o.franchise) : ""}</p><h3 class="sx-world-title" aria-level="3">${obEsc(o.name)}</h3></div></header>
    ${o.blurb ? `<p class="sx-world-intro">${obEsc(o.blurb)}</p>` : ""}
    <div class="sx-callouts">${sxCallout("adv", "What it rewards", o.rewards)}${sxCallout("chal", "Who struggles there", o.struggles)}</div>
    ${parts}
    ${inside.length ? `<h4 class="sx-mini" aria-level="4">Inside the organization</h4>${sxTiles(inside.map(r => [r[0], obEsc(r[1])]), "sx-about")}` : ""}</article>`;
}
function sxOrgs(list){
  return (list && list.length) ? `<h3 class="sx-band sx-wide" aria-level="3">Organizations where you would find your place</h3>${list.map(sxOrg).join("")}` : "";
}
function sxTeams(ch, ui){
  const C = Forge.characters;
  const roles = sxCard(sxTiles(ch.roles.map(r => [r.label, r.shared ? r.text : sxBoldLead(r.text, r.who)])), "sx-wide sx-roles", "Wherever you land, here is how the roles split");
  const member = p => { const c = C.byId(p.id); return `<a class="sx-member" href="${obEsc(cxUrl(p.id, p.person === ui.A ? ui.codeA : ui.codeB))}"><span class="cx-card-portrait">${c ? C.portraitSVG(c, 56) : ""}</span><span class="sx-member-text"><span class="sx-who">${p.person}</span><b>${obEsc(p.character)}</b><em>${obEsc(p.role)}</em></span></a>`; };
  const cards = ch.cards.map(t => `<article class="card glass sx-card sx-team sx-wide" id="sx-t-${t.id}"><header class="sx-head">${sxEmblem("teams", t.id, 96)}<div class="sx-head-text"><p class="sx-kicker">${obEsc(t.group || "TEAM")}${t.franchise && t.franchise !== t.group ? " · " + obEsc(t.franchise) : ""}</p><h3 class="sx-world-title" aria-level="3">${obEsc(t.name)}</h3></div></header>
      <div class="sx-split">
        <div class="sx-split-main"><p class="sx-world-intro">${t.blurb}</p>${t.why ? `<p class="sx-story-text">${t.why}</p>` : ""}<h4 class="sx-mini" aria-level="4">Where each of you would sit</h4><div class="sx-members">${t.pairing.map(member).join("")}</div></div>
        <div class="sx-split-side">${sxAbout(t.about)}</div>
      </div>${sxTeamDepth(t.depth)}</article>`).join("");
  return `${cards || "<p class=\"sx-wide\">No team stood out for this pair.</p>"}${sxOrgs(ch.orgs)}${roles}`;
}
function sxStories(ch){ return ch.items.map(s => sxCard(`<p class="sx-story-text">${s.story.join(" ")}</p>`, "sx-story", `<span aria-hidden="true">${s.icon}</span> ${s.title}`)).join(""); }
function sxSitCard(s){
  return `<article class="card sx-sit sx-sit-${s.band}" data-sit="${s.id}"><div class="sx-sit-top"><span class="sx-sit-icon" aria-hidden="true">${s.icon}</span><span class="sx-chip sx-chip-${s.band}">${s.label}</span></div><h3 class="sx-sit-title" aria-level="3">${s.title}</h3>${s.world ? `<p class="scn-world">${s.world}</p>` : ""}<p>${s.text}</p>${s.plays ? `<details class="sx-more sx-play"><summary>How each of you would play it</summary><p>${obEsc(s.plays)}</p></details>` : ""}</article>`;
}
function sxSituationsGrid(ch){
  const c = ch.counts || {};
  const tally = c.g != null ? `<div class="sx-tally sx-wide" aria-label="How the situations split"><span class="sx-tally-chip sx-tally-g"><b>${c.g}</b> you'd thrive</span><span class="sx-tally-chip sx-tally-m"><b>${c.m}</b> you'd manage</span><span class="sx-tally-chip sx-tally-r"><b>${c.r}</b> you'd struggle (hilariously)</span></div>` : "";
  return `${tally}<div class="sx-sit-grid sx-wide" id="sxSitGrid">${ch.items.map(sxSitCard).join("")}</div>
    <div class="sx-sit-foot sx-wide"><span id="sxSitCount" aria-live="polite">Page ${ch.round + 1} of ${ch.rounds} · ${ch.total} situations</span>${ch.rounds > 1 ? `<button type="button" class="btn btn-ghost btn-sm" onclick="sxMoreSituations()">Show me different situations</button>` : ""}</div>`;
}
function sxSituations(ch, ui){
  const practice = (ch.practice && ch.practice.length) ? `<h3 class="sx-band sx-wide" aria-level="3">And in the everyday</h3>${sxSections(ch.practice)}` : "";
  const acts = (ch.activities && ch.activities.length) ? sxCard(sxTiles(ch.activities.map(a => [a.label, a.text])), "sx-wide", "Your perfect plans") : "";
  const work = ch.workStyle ? sxTwo("How each of you works", ch.workStyle.a, ch.workStyle.b, ui, ch.workStyle.same) : "";
  return `${sxEcho(ch.echo)}${sxSituationsGrid(ch)}${practice}${acts}${work}`;
}
/* The ending is the narrator closing the book: a few pages of advice and facts that came with the report, then one personal last page written from this pair's own
   report (Forge.story.depth.finale). No statistics, no second score, no buttons after it. */
function sxEnding(ch, ui){
  const growth = ch.growth ? sxTwo("One thing each of you could try", ch.growth.a, ch.growth.b, ui, ch.growth.same) : "";
  const lines = sxCard(sxList(ch.summary), "sx-summary-card", "In a few lines");
  const facts = ch.funFacts.length ? sxCard(ch.funFacts.map(f => `<p class="sx-fact">${f}</p>`).join(""), "sx-facts-card", "Fun facts") : "";
  const fin = ch.final;
  const finale = fin ? `<section class="card glass sx-card sx-wide sx-finale" aria-labelledby="sxFinaleTitle"><p class="sx-kicker">The last page</p><h3 class="sx-finale-title" id="sxFinaleTitle" aria-level="3">${fin.title}</h3><div class="sx-finale-body">${fin.paragraphs.map((p, i) => `<p class="sx-finale-p${i === fin.paragraphs.length - 1 ? " sx-finale-last" : ""}">${p}</p>`).join("")}</div><p class="sx-finale-mark" aria-hidden="true">\u2766</p></section>` : "";
  return `${lines}${facts}${growth}${finale}`;
}
const SX_BODY = { overall: sxOverall, why: sxWhy, balance: sxBalance, struggle: sxStruggle, communication: sxCommunication, decision: sxDecision, conflict: sxConflict, characters: sxCharacters, worlds: sxWorlds, teams: sxTeams, stories: sxStories, situations: sxSituations, ending: sxEnding };

function lensRelationsHTML(rels){
  if (!rels || !rels.length) return "";
  activeRelations = rels;
  return `<article class="sx-relations">
    <h3 class="sx-sub" aria-level="3">How do you know each other?</h3>
    <div class="rel-chips" role="group" aria-label="Relationship type">${rels.map(r => `<button type="button" class="rel-chip" aria-pressed="false" data-rel="${r.id}" onclick="selectRelation('${r.id}')"><span aria-hidden="true">${r.icon}</span> ${r.name}</button>`).join("")}</div>
    <div id="relOut" class="rel-out" aria-live="polite"><p class="rel-hint">Pick one to see how this pairing plays out in that setting.</p></div>
  </article>`;
}
function selectRelation(id){
  const r = activeRelations.find(x => x.id === id), out = document.getElementById("relOut");
  if (!r || !out) return;
  document.querySelectorAll(".rel-chip").forEach(b => b.setAttribute("aria-pressed", b.dataset.rel === id ? "true" : "false"));
  out.innerHTML = `<p class="sx-answer"><span aria-hidden="true">${r.icon}</span> ${r.name}</p><p>${r.text}</p>${r.tip ? `<p class="rel-tip"><b>Tip:</b> ${r.tip}</p>` : ""}`;
}

/* ---------------- the page ---------------- */
function sxBuildUI(){
  const { profileA, archA, profileB, archB, nameA, nameB } = compareState;
  return { A: nameA || "Person A", B: nameB || "Person B", archA, archB, profileA, profileB, codeA: cxCodeFor(profileA), codeB: cxCodeFor(profileB), duo: computeDuoTitle(archA, archB) };
}
/* the chapter rail: two balanced rows (the first takes the extra one when the count is odd), every tab the same shape, so no tab is left alone */
function sxRail(present, numbered){
  const half = Math.ceil(present.length / 2), rows = [present.slice(0, half), present.slice(half)].filter(r => r.length);
  const tab = ([k, label]) => `<li><button type="button" class="sx-pill" data-ch="${k}" onclick="sxGo('sx-${k}')"><span class="sx-pill-n" aria-hidden="true">${numbered[k]}</span><span class="sx-pill-t">${label}</span></button></li>`;
  return `<nav class="sx-index sx-rail" aria-label="In this article" style="--n:${half}"><div class="sx-rail-scroll">${rows.map(r => `<ol class="sx-rail-row">${r.map(tab).join("")}</ol>`).join("")}</div></nav>`;
}
/* the whole comparison at a glance: one box per part of the article, each a way in to its chapter */
function sxSummary(art, ui){
  const c = art.chapters, C = Forge.characters, x = c.characters.cross, w = c.worlds.cards[0], t = c.teams.cards[0], o = (c.teams.orgs || [])[0], s = c.situations;
  const box = (key, kicker, icon, big, small, cls) => `<button type="button" class="card glass sx-sum ${cls || ""}" onclick="sxGo('sx-${key}')"><span class="sx-sum-kicker">${kicker}</span><span class="sx-sum-main">${icon || ""}<span class="sx-sum-big">${big}</span></span>${small ? `<span class="sx-sum-small">${small}</span>` : ""}</button>`;
  const boxes = [];
  if (x) boxes.push(box("characters", "Fictional twins", `<span class="sx-sum-pair"><span class="cx-card-portrait">${C.portraitSVG(x.cpA, 72)}</span><span class="cx-card-portrait">${C.portraitSVG(x.cpB, 72)}</span></span>`, obEsc(x.a.name) + " × " + obEsc(x.b.name), obEsc(x.title), "sx-sum-twins"));
  if (w) boxes.push(box("worlds", "Your world", sxEmblem("worlds", w.id, 56), obEsc(w.name), obEsc(w.franchise)));
  if (t) boxes.push(box("teams", "Your team", sxEmblem("teams", t.id, 56), obEsc(t.name), obEsc(t.group || t.franchise || "")));
  if (o) boxes.push(box("teams", "Your organization", sxEmblem("organizations", o.id, 56), obEsc(o.name), obEsc(o.franchise || "")));
  if (s && s.counts) boxes.push(box("situations", "Situations", "", s.total + " to try", s.counts.g + " you'd thrive at · " + s.counts.r + " you'd struggle with"));
  const notes = [];
  if (c.overall.lifts[0]) notes.push(box("overall", "What lifts it", "", "", c.overall.lifts[0], "sx-sum-text"));
  if (c.overall.holds[0]) notes.push(box("overall", "Watch out for", "", "", c.overall.holds[0], "sx-sum-text"));
  return (boxes.length || notes.length) ? `<div class="sx-summary-wrap" role="group" aria-label="Your comparison at a glance">${boxes.length ? `<div class="sx-summary">${boxes.join("")}</div>` : ""}${notes.length ? `<div class="sx-summary sx-summary-notes">${notes.join("")}</div>` : ""}</div>` : "";
}
function renderStoryHTML(art, ui, lensId){
  const E = Forge.experience;
  const present = SX_CHAPTERS.filter(([k]) => {
    const c = art.chapters[k];
    if (k === "worlds") return c.cards.length;
    if (k === "teams") return c.cards.length;
    if (k === "stories") return c.items.length;
    if (k === "characters") return !!c.cross;
    return true;
  });
  const numbered = {}; present.forEach(([k], i) => { numbered[k] = String(i + 1).padStart(2, "0"); });
  const lenses = E.lenses();
  const hero = `
    <header class="card glass sx-hero sx-hero-card section revealed">
      <p class="eyebrow accent">${art.lens.eyebrow}</p>
      <p class="sx-hero-names">${ui.A} <span aria-hidden="true">×</span> ${ui.B}</p>
      <div class="lens-score" role="img" aria-label="${obEsc(art.lens.name)} compatibility: ${art.hero.score} percent, ${art.hero.band}"><span class="lens-score-num count-up" data-target="${art.hero.score}" data-suffix="">0</span><span class="lens-score-pct">%</span></div>
      <p class="lens-score-word">${obEsc(art.lens.name)} compatibility <span aria-hidden="true">·</span> ${art.hero.band}</p>
      <h2 class="sx-headline" aria-level="2">${art.hero.headline}</h2>
      <p class="lens-vibe"><span aria-hidden="true">${ui.duo.iconA}</span> ${ui.archA.name} <span aria-hidden="true">×</span> <span aria-hidden="true">${ui.duo.iconB}</span> ${ui.archB.name} <span aria-hidden="true">·</span> <b>${ui.duo.title}</b></p>
      <div class="lens-tabs sx-readas" role="group" aria-label="Read this pair as">${lenses.map(l => `<button type="button" class="lens-tab" aria-pressed="${l.id === lensId}" onclick="switchCompareLens('${l.id}')"><span class="lens-tab-name"><span aria-hidden="true">${l.icon}</span> ${obEsc(l.name)}</span></button>`).join("")}</div>
    </header>
    ${sxSummary(art, ui)}
    ${sxRail(present, numbered)}`;
  const chapters = present.map(([k]) => sxChapter(k, numbered[k], art.chapters[k], SX_BODY[k](art.chapters[k], ui), "sx-ch-" + k)).join("");
  return `<div class="lens-result story sx lens-${lensId}">${quickReadCompareWarningHtml([ui.profileA.depthTier, ui.profileB.depthTier])}${hero}<article class="sx-article sx-bento">${chapters}</article></div>`;
}
function sxArticle(lensId){
  const { profileA, archA, profileB, archB, nameA, nameB } = compareState;
  const deep = computeDeepCompatibility(profileA, profileB, nameA, nameB);
  const layers = computeCompareLayers(profileA, archA, profileB, archB, nameA, nameB);
  const ui = sxBuildUI();
  const A = { normDims: profileA.normDims, name: nameA, code: ui.codeA }, B = { normDims: profileB.normDims, name: nameB, code: ui.codeB };
  const art = Forge.story.pair(lensId, A, B, { deep, layers, bandOf: compatibilityBand, round: storyRound, ranker: partyRanker });
  return { art, ui, deep, layers, A, B };
}
function mountLensResult(out, lensId, opts){
  const E = lensEngine();
  if (!E || !compareState){ mountCompareFallback(out); return; }
  opts = opts || {};
  if (lensId !== activeLensId || opts.fresh){ storyRound = opts.round || 0; sxActiveScenario = null; }
  if (opts.round != null) storyRound = opts.round;
  activeLensId = lensId;
  const built = sxArticle(lensId);
  if (!built.art){ mountCompareFallback(out); return; }
  storyArt = built.art; storyUI = built.ui;
  out.innerHTML = renderStoryHTML(built.art, built.ui, lensId);
  if (typeof initCountUps === "function") initCountUps(out);
  drawCompareRadars();
  if (typeof setupProgressiveReveal === "function") setupProgressiveReveal(out);
  if (opts.sit) sxActiveScenario = opts.sit;
  sxTrack(out, opts.ch || null);
}
/* ---------------- where the reader is: the selected chapter and the active scenario (both survive Compare -> Character -> World -> Back) ---------------- */
let sxActive = null, sxActiveScenario = null, sxScrollFn = null;
function sxSetActive(key){
  sxActive = key || null;
  document.querySelectorAll(".sx-pill").forEach(p => { const on = !!key && p.dataset.ch === key; p.classList.toggle("is-active", on); if (on) p.setAttribute("aria-current", "location"); else p.removeAttribute("aria-current"); });
}
function sxMarkScenario(id, open){
  sxActiveScenario = id || null;
  document.querySelectorAll(".sx-sit").forEach(c => c.classList.toggle("is-active", !!id && c.dataset.sit === id));
  if (id && open){ const c = document.querySelector('.sx-sit[data-sit="' + id + '"] .sx-play'); if (c) c.open = true; }
}
function sxTrack(out, presetChapter){
  if (sxScrollFn){ window.removeEventListener("scroll", sxScrollFn); sxScrollFn = null; }
  const chapters = [...out.querySelectorAll(".sx-chapter")];
  if (!chapters.length) return;
  let queued = false;
  const update = () => { queued = false; let cur = null; const line = window.innerHeight * 0.35; chapters.forEach(c => { if (c.getBoundingClientRect().top <= line) cur = c; }); sxSetActive(cur ? cur.id.replace(/^sx-/, "") : null); };
  sxScrollFn = () => { if (!queued){ queued = true; requestAnimationFrame(update); } };
  window.addEventListener("scroll", sxScrollFn, { passive: true });
  if (presetChapter) sxSetActive(presetChapter); else update();
  // opening a scenario's play-through makes it the active one
  if (!out.dataset.sxToggle){
    out.dataset.sxToggle = "1";
    out.addEventListener("toggle", e => { const d = e.target; if (d && d.classList && d.classList.contains("sx-play") && d.open){ const card = d.closest(".sx-sit"); if (card) sxMarkScenario(card.dataset.sit, false); } }, true);
  }
  if (sxActiveScenario) sxMarkScenario(sxActiveScenario, true);
}
/* a minimal, honest fallback if the story packs didn't load: never the old report, just a clear message and a retry */
function mountCompareFallback(out){
  out.innerHTML = `<div class="section revealed"><div class="card glass"><h4 aria-level="2">The comparison couldn't be built</h4><p>Some of Forge's story data didn't load. Refresh the page and try again.</p><div class="cta-row"><button class="btn btn-primary btn-sm" onclick="location.reload()">Refresh</button></div></div></div>`;
}
function switchCompareLens(id){
  const out = document.getElementById("compareOut");
  if (!out) return;
  click(420);
  mountLensResult(out, id, { fresh: true });
  const hero = out.querySelector(".sx-hero");
  (hero || out).scrollIntoView({ block: "start" });
}
function sxGo(id){
  const el = document.getElementById(id); if (!el) return;
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
  const h = el.querySelector("h2"); if (h){ h.setAttribute("tabindex", "-1"); try{ h.focus({ preventScroll: true }); } catch(e){ /* ignore */ } }
}
function sxMoreSituations(){
  if (!storyArt || !storyUI) return;
  sxActiveScenario = null;
  click(380);
  const cur = storyArt.chapters.situations;
  const next = Forge.story.nextSituations(activeLensId, { normDims: storyUI.profileA.normDims, name: storyUI.A }, { normDims: storyUI.profileB.normDims, name: storyUI.B }, cur.round + 1, storyArt.chapters.worlds.cards.map(w => w.id));
  storyRound = next.round;
  cur.items = next.items; cur.round = next.round; cur.rounds = next.rounds; cur.total = next.total;
  const grid = document.getElementById("sxSitGrid"), cnt = document.getElementById("sxSitCount");
  if (grid) grid.innerHTML = cur.items.map(sxSitCard).join("");
  if (cnt) cnt.textContent = `Page ${cur.round + 1} of ${cur.rounds} · ${cur.total} situations`;
  if (grid){ grid.classList.remove("sx-sit-in"); void grid.offsetWidth; grid.classList.add("sx-sit-in"); }
}

/* Rebuild a finished result without the picker or the loading screen (used when navigation returns to Compare, see nav.js). */
function restoreCompareResult(lensId, relId, round, chapter, scenario){
  const out = document.getElementById("compareOut"), A = document.getElementById("codeA"), B = document.getElementById("codeB");
  if (!out || !A || !B) return;
  const a = freshenDecoded(decodeCode(A.value)), b = freshenDecoded(decodeCode(B.value));
  if (!a || !b || a.obsolete || b.obsolete) return;
  compareState = makeCompareState(a, b);
  mountLensResult(out, lensId, { round: round || 0, ch: chapter || null, sit: scenario || null });
  if (relId) selectRelation(relId);
}
