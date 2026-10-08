/* =========================================================================
   COMPARE + PARTY EXPERIENCE (compare.html). Rendering only: every verdict comes from Forge.experience
   (js/forge/experience.js) reading the packs, which in turn reads the existing personality and compatibility results.
   Load after compare.js and compare-story.js.

   - showCompareLensModal(): "How do you want to compare these profiles?" (Friendship / Romance / Everyday)
   - the two-person article itself lives in js/compare-story.js (one continuous read, no second report)
   - renderPartyExperience(): the Party page (3 to 10 people), also one continuous read: what used to be "the full group
     report" is folded into the chapters below, so nothing is hidden behind a second report.
   Names in compareState / partyState are already HTML-safe (escaped once at the source).
   ========================================================================= */

/* ---------------- the picker ---------------- */
function showCompareLensModal(){
  const E = lensEngine();
  if (!E){ const o = document.getElementById("compareOut"); if (o) mountCompareFallback(o); return; }
  if (document.getElementById("lensModal")) return;
  click(460);
  const overlay = document.createElement("div");
  overlay.id = "lensModal";
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <div class="modal-card glass lens-modal" role="dialog" aria-modal="true" aria-labelledby="lensModalTitle">
      <button class="icon-btn modal-close" onclick="closeCompareLensModal()" aria-label="Close">${ICONS.close}</button>
      <div class="eyebrow accent">COMPARE</div>
      <h3 id="lensModalTitle">How do you want to compare these profiles?</h3>
      <p>Same two people, seen as friends, as partners, or in everyday life.</p>
      <div class="lens-choices">
        ${E.lenses().map(l => `
        <button type="button" class="lens-choice lens-choice-${l.id}" onclick="pickCompareLens('${l.id}')">
          <span class="lens-choice-icon" aria-hidden="true">${l.icon}</span>
          <span class="lens-choice-title">${obEsc(l.name)}</span>
          <span class="lens-choice-desc">${obEsc(l.blurb)}</span>
        </button>`).join("")}
      </div>
    </div>`;
  document.body.appendChild(overlay);
  rememberFocusTrigger();
  requestAnimationFrame(() => { overlay.classList.add("open"); const f = getFocusable(overlay); (f[1] || f[0])?.focus(); });
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeCompareLensModal(); });
  document.addEventListener("keydown", onCompareLensModalKey);
}
function onCompareLensModalKey(e){
  if (e.key === "Escape"){ closeCompareLensModal(); return; }
  if (e.key === "Tab") cycleFocusTrap(e, document.getElementById("lensModal"));
}
function closeCompareLensModal(){
  const overlay = document.getElementById("lensModal");
  if (!overlay) return;
  overlay.classList.remove("open");
  document.removeEventListener("keydown", onCompareLensModalKey);
  restoreFocusTrigger();
  setTimeout(() => overlay.remove(), 220);
}
function pickCompareLens(id){
  closeCompareLensModal();
  const out = document.getElementById("compareOut");
  if (!out || !compareState) return;
  click(420);
  showCompatibilityLoading(out, () => mountLensResult(out, id, { fresh: true }));
}

/* ---------------- party ---------------- */
let lastPartyResult = null, lastPartyGroup = null;
function partyRanker(p){
  const C = Forge.characters;
  const prof = C.profileFrom({ normDims: p.normDims, name: p.name });
  return prof.ok ? C.rank(prof) : [];
}
function partyRoleCardHTML(c){
  return `<div class="pe-role"><span class="pe-role-icon" aria-hidden="true">${c.icon}</span><div><p class="pe-role-q">${c.title}</p><p class="pe-role-a">${c.winner}</p><p class="pe-role-line">${c.line}</p></div></div>`;
}
function partyFeelHTML(feel){
  if (!feel || !feel.length) return "";
  return `<div class="pe-feel" aria-label="How this place feels">${feel.map(f => `<div class="pe-feel-row"><span>${f.key.charAt(0).toUpperCase() + f.key.slice(1)}</span>${cxSegs(f.level, "vibe", `${f.key}: ${f.word}`, 5)}</div>`).join("")}</div>`;
}
function partyWorldCard(label, w){
  if (!w) return "";
  const C = Forge.characters;
  return `<article class="card glass pe-card pe-card-world"><div class="eyebrow accent">${label}</div><p class="pe-big">${sxEmblemMini("worlds", w.id)}${w.name}</p><p>${w.blurb}</p><p>${w.why}</p>
    ${w.dominant.length ? `<div class="tag-list">${w.dominant.map(t => `<span class="tag">${t}</span>`).join("")}</div>` : ""}
    ${partyFeelHTML(w.feel)}
    ${w.runnersUp.length ? `<p class="pe-also">Also a good fit: ${w.runnersUp.join(", ")}</p>` : ""}
    <p class="sx-links"><a class="cx-link" href="${obEsc(C.worldUrl(w.id, {}))}">Open this world</a></p></article>`;
}
function partyPickCard(label, p){
  if (!p) return "";
  return `<article class="card glass pe-card"><div class="eyebrow accent">${label}</div><p class="pe-big">${p.icon ? `<span aria-hidden="true">${p.icon}</span> ` : ""}${p.name}</p><p>${p.text}</p></article>`;
}
function partyListCard(label, items){
  if (!items || !items.length) return "";
  return `<article class="card glass pe-card"><div class="eyebrow accent">${label}</div><ul class="pe-list">${items.map(x => `<li><b>${x.facet}.</b> ${x.text}</li>`).join("")}</ul></article>`;
}
const GROUP_FRIEND_LINE = {
  "Exceptional": "This group is built for friendship. Almost everyone would click with almost everyone.",
  "Excellent": "A group that would genuinely enjoy each other, with very few awkward corners.",
  "Good": "Most of you would get along well, with a couple of pairings that take a little more effort.",
  "Mixed": "A real mix: some great friendships in here and some that need a bridge.",
  "Difficult": "Plenty of personality, but several pairings would need patience to become friends.",
  "Extremely Incompatible": "A group of strong, very different people. Friendships here would be earned, not automatic."
};
function partyGroupHeroHTML(fr, n){
  if (!fr) return "";
  const pairs = fr.best.map(p => `<li><span class="pe-pair-names">${p.a} <span aria-hidden="true">↔</span><span class="sr-only"> and </span> ${p.b}</span><b class="pe-pair-score">${p.score}%</b>${p.why ? `<span class="pe-pair-why">${p.why}</span>` : ""}</li>`).join("");
  const w = fr.weakest;
  const weak = w ? `<div class="pe-weak"><p class="pe-pair-names pe-weak-names">${w.a} <span aria-hidden="true">↔</span><span class="sr-only"> and </span> ${w.b} <b class="pe-pair-score">${w.score}%</b></p><p>${w.gripe || `${w.a} and ${w.b} simply have the least in common here.`}</p><p class="pe-weak-tip">Give them a shared task and a reason to talk, and the gap usually closes.</p></div>` : "";
  return `
      <div class="card glass pe-hero pe-friend">
        <div class="eyebrow accent">👥 OVERALL GROUP COMPATIBILITY</div>
        <div class="lens-score" role="img" aria-label="Group friendship compatibility: ${fr.score} percent, ${fr.band}"><span class="lens-score-num">${fr.score}</span><span class="lens-score-pct">%</span></div>
        <div class="lens-score-word">Friendship Compatibility <span aria-hidden="true">·</span> ${fr.band}</div>
        <p class="pe-lead">${GROUP_FRIEND_LINE[fr.band] || ""} Based on how every pair among the ${n} of you would get on as friends.</p>
        <div class="pe-friend-grid">
          <section class="pe-friend-col" aria-label="Best friends"><h3 class="pe-sub" aria-level="3">Best Friends</h3><ol class="pe-pairs">${pairs}</ol></section>
          <section class="pe-friend-col" aria-label="Weakest pair"><h3 class="pe-sub" aria-level="3">Weakest Pair</h3>${weak}</section>
        </div>
      </div>`;
}
const PARTY_CHAPTERS = [["group", "Your group", "01"], ["who", "Who is who", "02"], ["fit", "Where you'd fit", "03"], ["strain", "Strengths and friction", "04"], ["numbers", "The numbers", "05"], ["end", "Keep it", "06"]];
function partyMeter(label, val, note){ return `<div class="mini-bar-row"><span>${label}${note ? ` <span class="sx-fine">(${note})</span>` : ""}</span><span class="count-up" data-target="${val}" data-suffix="%">0%</span></div>`; }
function renderPartyExperience(){
  const E = lensEngine();
  if (!E || !partyState) return "";
  const { decoded, names } = partyState;
  const r = E.party(decoded.map((d, i) => ({ normDims: d.normDims, name: names[i] })), { ranker: partyRanker });
  if (!r) return "";
  lastPartyResult = r;
  // the original group read (identity, metrics, shared strengths ...) is part of THIS page now, in the chapters below
  const g = computeGroupCompatibility(decoded, names);
  lastPartyGroup = g;
  const m = g.metrics;
  const C = Forge.characters;
  const arch = decoded.map(d => d.archetype);
  const heroTeam = r.team ? `
      <div class="card glass pe-hero">
        <div class="eyebrow accent">🏆 YOUR TOP FICTIONAL TEAM</div>
        <div class="pe-hero-emblem">${sxEmblem("teams", r.team.id, 72)}</div>
        <h3 class="pe-title" aria-level="3">${r.team.name}</h3>
        <div class="tag-list" style="justify-content:center">${r.team.franchise ? `<span class="tag">${r.team.franchise}</span>` : ""}${r.team.group ? `<span class="tag">${r.team.group}</span>` : ""}</div>
        <p class="pe-lead">${r.team.blurb}</p>
        ${r.team.why ? `<p class="pe-why">${r.team.why}</p>` : ""}
        <ul class="pe-matches">${r.team.matches.map(mm => `<li><b>${mm.person}</b><span aria-hidden="true">→</span><span>${mm.character} <em>${mm.role}</em></span></li>`).join("")}</ul>
        ${r.team.runnersUp.length ? `<p class="pe-also">Close calls: ${r.team.runnersUp.map(t => t.name).join(", ")}</p>` : ""}
      </div>` : "";
  const more = (r.stories || []).slice(1).map(s => `<li><span aria-hidden="true">${s.icon}</span> ${s.text}</li>`).join("");
  const rpg = r.cast.filter(c => c.rpg).map(c => `<li><b>${c.name}</b><span aria-hidden="true">→</span><span>${c.rpg} <em>${c.role}</em></span></li>`).join("");
  const nar = g.narrative ? `<p class="pe-also">If this were the party in a story: <b>${g.narrative.survivesLongest}</b> survives longest, and <b>${g.narrative.stepsUpFirst}</b> steps up first when it actually matters.</p>` : "";

  /* 01 the group */
  const ch1 = sxChapter("group", "01", { eyebrow: "YOUR GROUP", title: `${r.n} people, one story.`, lead: g.identity ? `${g.identity}.` : "" },
    `<div class="extras-row" style="margin:0 0 12px">${decoded.map((d, i) => `<span class="tag">${d.archetype.icon} ${names[i]}</span>`).join("")}</div>
     ${partyGroupHeroHTML(r.friendship, r.n)}${heroTeam}
     <div class="card glass pe-story"><div class="eyebrow accent">🎬 THE STORY OF YOUR GROUP</div><p class="pe-quote">${r.story.text}</p>${more ? `<ul class="pe-more">${more}</ul>` : ""}${nar}</div>`);

  /* 02 who is who */
  const ch2 = sxChapter("who", "02", { eyebrow: "WHO IS WHO", title: "Everyone's part in it.", lead: "" },
    `<div class="card glass pe-cast-card"><div class="eyebrow accent">🎭 EVERYONE'S ROLE</div>
        <div class="pe-cast">${r.cast.map((c, i) => `<div class="pe-cast-item"><span class="pe-role-icon" aria-hidden="true">${c.icon}</span><p class="pe-cast-name">${c.name}</p><p class="pe-cast-role">${c.role}${c.rpg ? ` · ${c.rpg}` : ""}</p><p class="pe-cast-arch"><span aria-hidden="true">${arch[i] ? arch[i].icon : ""}</span> ${arch[i] ? arch[i].name : ""}</p><p class="pe-role-line">${c.text}</p></div>`).join("")}</div></div>
     <div class="card glass" style="margin-top:14px"><div class="eyebrow accent">WHO IS&hellip;?</div><div class="pe-roles">${r.roleCards.map(partyRoleCardHTML).join("")}</div></div>
     ${cxCompareHTML(decoded.map((d, i) => ({ label: d.name || `Person ${i + 1}`, normDims: d.normDims, name: d.name, code: cxCodeFor(d) })))}`);

  /* 03 where you'd fit */
  const ch3 = sxChapter("fit", "03", { eyebrow: "WHERE YOU'D FIT", title: "Worlds, scenarios and the way you'd run a party.", lead: "" },
    `<div class="pe-grid">
        <article class="card glass pe-card"><div class="eyebrow accent">🛡 YOUR SURVIVAL CHANCES</div><p class="pe-big">${r.survival.word}</p>${cxSegs(r.survival.level, "vibe", "Survival chances: " + r.survival.word, 5)}<p>${r.survival.text}</p></article>
        ${partyWorldCard("🌍 YOUR TOP WORLD", r.world)}
        ${partyWorldCard("🪐 YOUR TOP UNIVERSE", r.universe)}
        ${partyPickCard("🗺 YOUR TOP ADVENTURE", r.adventure)}
        ${partyPickCard("🧟 YOUR TOP SURVIVAL SCENARIO", r.survivalScenario)}
        ${partyPickCard("📺 YOUR TOP SITCOM", r.sitcom)}
        <article class="card glass pe-card"><div class="eyebrow accent">🎲 YOUR TOP RPG PARTY</div><p class="pe-big"><span aria-hidden="true">${r.rpgParty.icon}</span> ${r.rpgParty.name}</p><p>${r.rpgParty.text}</p>${rpg ? `<ul class="pe-matches pe-rpg">${rpg}</ul>` : ""}</article>
        ${partyPickCard("👑 YOUR LEADERSHIP STRUCTURE", r.leadership)}
        <article class="card glass pe-card"><div class="eyebrow accent">📚 YOUR STORY ARCHETYPE</div><p class="pe-big">${r.archetype.name}</p><p>${r.archetype.text}</p></article>
        <article class="card glass pe-card"><div class="eyebrow accent">⚔ YOUR GROUP DYNAMIC</div><p class="pe-big"><span aria-hidden="true">${r.dynamic.icon}</span> ${r.dynamic.name}</p><p>${r.dynamic.text}</p></article>
        <article class="card glass pe-card pe-card-wide"><div class="eyebrow accent">😂 FUNNIEST LIKELY OUTCOME</div><p class="pe-quote pe-quote-sm">${r.funny.text}</p></article>
      </div>`);

  /* 04 strengths and friction (the experience reads plus the original tag lists, merged and de-duplicated) */
  const tagCard = (label, items, empty) => `<article class="card glass pe-card"><div class="eyebrow accent">${label}</div><div class="tag-list">${items && items.length ? items.map(s => `<span class="tag">${s}</span>`).join("") : `<span class="tag">${empty}</span>`}</div></article>`;
  const ch4 = sxChapter("strain", "04", { eyebrow: "STRENGTHS AND FRICTION", title: "What carries the group, and what tests it.", lead: "" },
    `${r.chemistry && r.chemistry.lines.length ? `<article class="card glass pe-card pe-card-wide"><div class="eyebrow accent">⚗ GROUP CHEMISTRY</div>${r.chemistry.lines.map(l => `<p>${l}</p>`).join("")}</article>` : ""}
     <div class="pe-grid" style="margin-top:14px">
        ${partyListCard("🌟 YOUR GREATEST STRENGTHS", r.strengths)}
        ${partyListCard("🧱 WHERE YOU'RE THINNEST", r.weaknesses)}
        ${partyListCard("⚠ LIKELY CONFLICTS", r.conflicts)}
        ${tagCard("🤝 WHAT THE WHOLE GROUP SHARES", g.groupSharedStrengths, "No single trait everyone is strong in, and that's fine")}
        ${tagCard("🧭 WHERE THE GROUP DIFFERS MOST", g.groupFriction, "No standout differences")}
        ${tagCard("🕳 SHARED BLIND SPOTS", g.sharedBlindSpots, "No trait everyone is weak on")}
        ${tagCard("🧩 PERSONALITY TYPES NOT IN THE ROOM", g.missingArchetypes, "Every type is covered")}
      </div>`);

  /* 05 the numbers */
  const sortedPairs = r.friendship ? r.friendship.pairs.slice().sort((a, b) => b.score - a.score) : [];
  const ch5 = sxChapter("numbers", "05", { eyebrow: "THE NUMBERS", title: "The measurements behind the story.", lead: "" },
    `<div class="card glass"><h3 class="pe-sub" aria-level="3">How you work as a unit</h3>
        ${partyMeter("Overall team chemistry", g.overallScore)}
        ${partyMeter("Creativity Index", m.creativityIndex)}${partyMeter("Leadership Balance", m.leadershipBalance)}${partyMeter("Empathy Balance", m.empathyBalance)}${partyMeter("Conflict Risk", m.conflictRisk)}${partyMeter("Innovation Score", m.innovationScore)}${partyMeter("Team Stability", m.teamStability)}${partyMeter("Decision Speed", m.decisionSpeed)}${partyMeter("Social Energy", m.socialEnergy)}${partyMeter("Planning vs Action", m.planningPct, `${m.planningPct}% planning / ${m.actionPct}% action`)}${partyMeter("Risk Tolerance", m.riskTolerance)}${partyMeter("Communication Health", m.communicationHealth)}${partyMeter("Group Diversity", m.groupDiversity)}${partyMeter("Growth Potential", m.growthPotential)}${partyMeter("Average Confidence", m.avgConfidence, "estimated from answer strength, not a saved score")}</div>
     <div class="pe-grid" style="margin-top:14px">
        <article class="card glass pe-card"><div class="eyebrow accent">DOMINANT ARCHETYPE</div><p>${g.dominantArchetype ? `${g.dominantArchetype.archetype.icon} ${g.dominantArchetype.archetype.name} (${g.dominantArchetype.count} of ${g.n})` : "No single type repeats, everyone reads differently"}</p></article>
        <article class="card glass pe-card"><div class="eyebrow accent">DOMINANT SOUL</div><p>${g.dominantSoul ? `${g.dominantSoul.soul.name} • ${g.dominantSoul.soul.trait} (${g.dominantSoul.count} of ${g.n})` : "No single soul type repeats"}</p></article>
        <article class="card glass pe-card"><div class="eyebrow accent">WHO BRINGS WHAT</div>${g.roles.map(x => `<div class="mini-bar-row"><span>${x.name}</span><span>${x.direction} ${x.standoutTrait} than the group average</span></div>`).join("")}</article>
        ${sortedPairs.length ? `<article class="card glass pe-card"><div class="eyebrow accent">EVERY PAIRING, AS FRIENDS</div>${sortedPairs.map(p => `<div class="mini-bar-row"><span>${p.a} + ${p.b}</span><span>${p.score}%</span></div>`).join("")}</article>` : ""}
      </div>
     ${g.report && g.report.length ? `<div class="card glass" style="margin-top:14px"><h3 class="pe-sub" aria-level="3">What the numbers say</h3>${g.report.map(l => `<p>${l}</p>`).join("")}<p class="sx-fine">Lean on your strongest pair to help smooth over the toughest one, and use the shared strengths as the group's default mode when plans need to come together fast.</p></div>` : ""}`);

  /* 06 keep it */
  const ch6 = sxChapter("end", "06", { eyebrow: "KEEP IT", title: "Take this party with you.", lead: "" },
    `<div class="cta-row" style="justify-content:flex-start;gap:8px"><button class="btn btn-primary btn-sm" onclick="sharePartyResult()">Copy a shareable summary</button><button class="btn btn-ghost btn-sm" onclick="promptSaveGroup()">Save this group</button></div>
     <div id="saveGroupPanel" class="hidden" style="margin-top:12px"><p>Name it once, and next time you don't have to re-paste every code.</p>
        <input type="text" id="saveGroupName" aria-label="Group name" class="ns-input ns-input-sm" maxlength="40" placeholder="e.g. Book Club" />
        <div class="cta-row" style="margin-top:8px"><button class="btn btn-primary btn-sm" onclick="confirmSaveGroup()">Confirm</button></div></div>`);

  const chapters = [ch1, ch2, ch3, ch4, ch5, ch6].join("");
  const nav = `<nav class="sx-index" aria-label="In this party"><ol>${PARTY_CHAPTERS.map(([k, label, n]) => `<li><button type="button" class="sx-pill" onclick="sxGo('sx-${k}')"><span class="sx-pill-n" aria-hidden="true">${n}</span>${label}</button></li>`).join("")}</ol></nav>`;
  return `
    <div class="section revealed pe-result sx">
      ${quickReadCompareWarningHtml(decoded.map(d => d.depthTier))}
      <header class="sx-hero sx-hero-party"><p class="eyebrow accent">YOUR PARTY OF ${r.n}</p><p class="sx-hero-names">${names.join(" <span aria-hidden=\"true\">·</span> ")}</p></header>
      ${nav}
      <article class="sx-article">${chapters}</article>
    </div>`;
}
function sharePartyResult(){
  const E = lensEngine();
  if (!E || !lastPartyResult) return;
  const text = E.summary(lastPartyResult, "Our PersonaForge party");
  const done = () => { if (typeof showToast === "function") showToast("Summary copied. Paste it anywhere."); };
  try{
    if (navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(text).then(done, () => window.prompt("Copy this summary:", text)); return; }
  } catch(e){ /* fall through */ }
  window.prompt("Copy this summary:", text);
}
function restorePartyResult(){
  const out = document.getElementById("partyOut");
  if (!out) return;
  const raw = [0,1,2,3,4,5,6,7,8,9].map(i => (document.getElementById("partyCode" + i)?.value || "").trim()).filter(Boolean);
  if (raw.length < 3 || raw.length > 10) return;
  const decoded = raw.map(c => freshenDecoded(decodeCode(c)));
  if (decoded.some(d => !d || d.obsolete)) return;
  partyState = makePartyState(decoded, raw);
  const page = (typeof renderPartyExperience === "function") ? renderPartyExperience() : "";
  out.innerHTML = page || "";
  initCountUps(out);
}
