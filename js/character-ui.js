/* =========================================================================
   CHARACTER UI - rendering only. All matching, scoring and wording lives in
   js/forge/characters.js (Forge.characters); this file turns its output into
   HTML. Used by character.html (the explanation page) and by the shared card
   strip on Result, Compare, Party and Profile, so no screen has its own
   character logic.

   Everything dynamic goes through obEsc(). Links are plain <a href>, so
   keyboard, middle-click, back/forward and refresh all behave natively.
   ========================================================================= */

const CX = () => (typeof Forge !== "undefined" && Forge.characters) ? Forge.characters : null;

/* The profile code for an already-decoded profile (Compare/Party only hold decoded objects). */
function cxCodeFor(decoded){
  try{
    if (!decoded) return null;
    if (decoded.code) return decoded.code;
    return encodeCode(decoded.archetype.id, decoded.normDims, decoded.name, decoded.depthTier || "balanced");
  } catch(e){ return null; }
}
function cxUrl(id, code, name){ const c = CX(); return c ? c.url(id, { code, name }) : "character.html"; }

function cxPctClass(pct){ return pct >= 80 ? "cx-high" : pct >= 60 ? "cx-mid" : "cx-low"; }

/* ---------------- one card ---------------- */
function cxCardHTML(card, code, T){
  T = T || (s => s);
  const c = CX();
  const portrait = c.portraitSVG({ id: card.id, name: card.name, portrait: card.portrait }, 56);
  const lab = card.kind === "opposite" ? "Least aligned" : "Match";
  return `
  <a class="cx-card cx-kind-${obEsc(card.kind)}" href="${obEsc(cxUrl(card.id, code))}">
    <span class="cx-card-portrait">${portrait}</span>
    <span class="cx-card-body">
      <span class="cx-card-kind">${obEsc(card.label)}</span>
      <span class="cx-card-name">${obEsc(card.name)}</span>
      <span class="cx-card-uni">${obEsc(card.universe)}</span>
      <span class="cx-card-blurb">${obEsc(T(card.blurb || ""))}</span>
    </span>
    <span class="cx-card-meta">
      <span class="cx-card-pct ${cxPctClass(card.pct)}"><b>${card.pct}%</b><i>${obEsc(lab)}</i></span>
      <span class="tag cx-conf-tag">${obEsc(card.confidence.level)} confidence</span>
      <span class="cx-card-go" aria-hidden="true">${ICONS.arrow}</span>
    </span>
  </a>`;
}

/* The four-card strip: main, runner-up, growth, opposite. `src` is anything
   Forge.characters.profileFrom accepts (a result, a decoded code, normDims). */
function cxStripHTML(src, opts){
  opts = opts || {};
  const c = CX();
  if (!c) return "";
  let out;
  try{ out = c.cards(src); } catch(e){ out = null; }
  if (!out || !out.cards.length) return "";
  const code = opts.code || (src && (src.code || src.profileCode)) || out.profile.code || null;
  return `
  <section class="cx-strip${opts.reveal === false ? "" : " section"}" aria-labelledby="cxStripTitle"${opts.reveal === false ? ' style="margin-top:18px"' : ""}>
    <div class="section-heading">
      <div><p class="eyebrow">${obEsc(opts.eyebrow || "Characters")}</p><h2 id="cxStripTitle">${obEsc(opts.title || "Characters your profile aligns with.")}</h2></div>
      <p>${obEsc(opts.note || "Matched from your measured personality against structured character profiles. Tap any card for the evidence behind it.")}</p>
    </div>
    <div class="cx-grid">${out.cards.map(card => cxCardHTML(card, code)).join("")}</div>
  </section>`;
}

/* Compare: each person's closest character, linking with THAT person's profile. */
function cxCompareHTML(people){
  const c = CX(); if (!c) return "";
  const rows = (people || []).map(p => {
    let top = null;
    try{ const prof = c.profileFrom({ normDims: p.normDims, name: p.name, code: p.code }); const sel = prof.ok ? c.selections(prof) : null; top = sel ? sel.main : null; } catch(e){ top = null; }
    return top ? { person: p, top } : null;
  }).filter(Boolean);
  if (!rows.length) return "";
  return `
  <div class="card glass cx-inline" style="margin-top:12px">
    <h4 aria-level="2">Closest Characters</h4>
    <p class="cx-inline-note">Each person's strongest character alignment. Tap one to see why Forge matched it.</p>
    <div class="cx-inline-grid">
      ${rows.map(r => `
        <a class="cx-inline-row" href="${obEsc(cxUrl(r.top.char.id, r.person.code))}">
          <span class="cx-card-portrait">${c.portraitSVG(r.top.char, 44)}</span>
          <span class="cx-inline-text"><span class="cx-card-kind">${obEsc(r.person.label)}</span><span class="cx-card-name">${obEsc(r.top.char.name)}</span><span class="cx-card-uni">${obEsc(r.top.char.universe)}</span></span>
          <span class="cx-card-pct ${cxPctClass(r.top.pct)}"><b>${r.top.pct}%</b></span>
        </a>`).join("")}
    </div>
  </div>`;
}

/* Growth's "You've matched <name> N times now" memory statement: link the character, leave the rest as written. */
function cxLinkMatchStatement(text){
  const C = CX(), m = /^You've matched (.+?) (\d+ times now.*)$/.exec(String(text));
  if (!C || !m) return text;
  const ch = C.byId(C.slug(m[1]));
  return ch ? `You've matched <a class="cx-link" href="${obEsc(cxUrl(ch.id))}">${obEsc(ch.name)}</a> ${m[2]}` : text;
}

/* ---------------- targeted-retake outcome banner (Result page) ---------------- */
function cxTargetedBanner(r){
  if (!r || r.assessmentKind !== "targeted" || !r.confidence || !r.confidence.targeted) return "";
  const t = r.confidence.targeted;
  return `
  <div class="card glass cx-targeted" role="status">
    <div class="eyebrow accent">TARGETED RETAKE</div>
    <h4 aria-level="2">Confidence ${t.from}% &rarr; ${t.to}%</h4>
    <p>These questions focused on the areas Forge was least certain about, so the traits your characters are matched on are firmer now.</p>
  </div>`;
}

/* =========================================================================
   THE EXPLANATION PAGE  (character.html?c=<id>[&p=<profile code>] | ?w=<world>)
   ========================================================================= */
function cxParams(){
  let p;
  try{ p = new URLSearchParams(location.search); } catch(e){ p = new URLSearchParams(""); }
  const cap = (v, n) => (typeof v === "string" ? v.slice(0, n) : "");
  return { c: cap(p.get("c"), 80), w: cap(p.get("w"), 80), p: cap(p.get("p"), 140), n: cap(p.get("n"), 20) };
}
/* Back goes to wherever this page was opened from (js/nav.js restores that page exactly), then to the browser's history, and only then Home. */
function cxBack(){
  if (typeof Nav !== "undefined") Nav.back("index.html");
  else if (history.length > 1) history.back();
  else location.href = "index.html";
}
function cxOwnCode(){ try{ return localStorage.getItem("pf_last_code") || ""; } catch(e){ return ""; } }
function cxSameProfile(code){
  if (!code) return true;
  const own = cxOwnCode(); if (!own) return false;
  const strip = s => String(s).trim().toUpperCase().replace(/^[A-Z0-9_]*-(?=PF\d)/, "");
  return strip(code) === strip(own);
}

function cxShell(inner, title){
  setAccentColors();
  setPageTitle(title || "Character");
  root.innerHTML = `
    <div class="container cx-page">
      ${topBar(true)}
      <div class="cx-crumbs"><button type="button" class="btn btn-ghost btn-sm" onclick="cxBack()">&larr; Back</button></div>
      ${inner}
    </div>`;
  setupProgressiveReveal(root);
  const h = document.getElementById("cxTitle");
  if (h){ h.setAttribute("tabindex", "-1"); try{ h.focus({ preventScroll: true }); } catch(e){ /* ignore */ } }
}

const CX_MSGS = {
  "no-profile": ["No profile on this device yet", "Take the assessment and Forge can show exactly why it matches you with each character. You can still read about this character below."],
  "bad-code": ["That profile code couldn't be read", "It may be mistyped, cut off or from a much older version of PersonaForge. Check it and try again."],
  "not-found": ["We couldn't find that character", "The link may be out of date. Here are some characters Forge can explain:"],
  "world-missing": ["We couldn't find that world", "The link may be out of date."],
};
function cxEmptyState(kind, extra){
  const [t, d] = CX_MSGS[kind] || ["Something went wrong", "Please go back and try again."];
  return `<section class="card glass cx-empty" role="alert"><div class="eyebrow accent">CHARACTER</div><h1 id="cxTitle" aria-level="1">${obEsc(t)}</h1><p>${obEsc(d)}</p>${extra || ""}</section>`;
}

/* ---------------------------------------------------------------------------
   Personality visuals. The page never shows scores: every comparison is a row of
   segments plus a plain-language verdict. (The engine still computes everything.)
   --------------------------------------------------------------------------- */
const CX_SEGS = 10;
const cxLevelOf = v => Math.max(0, Math.min(CX_SEGS, Math.round((Number(v) + 10) / 2)));     // -10..10 -> 0..10 lit segments
const cxBandWord = v => v >= 6 ? "very high" : v >= 2.5 ? "high" : v > -2.5 ? "middling" : v > -6 ? "low" : "very low";
function cxSegs(level, kind, label, n){
  n = n || CX_SEGS;
  let cells = "";
  for (let i = 0; i < n; i++) cells += `<i${i < level ? ' class="on"' : ""}></i>`;
  return `<span class="cx-segs cx-segs-${kind}" role="img" aria-label="${obEsc(label)}">${cells}</span>`;
}
/* agreement (-1..1, the engine's own closeness measure) -> a verdict word + a tone. Never shown as a number. */
function cxVerdictOf(a){
  return a >= 0.8 ? { word: "Very similar", tone: "strong" } : a >= 0.55 ? { word: "Mostly aligned", tone: "good" }
    : a >= 0.3 ? { word: "Moderately aligned", tone: "mid" } : a >= 0 ? { word: "Somewhat different", tone: "apart" }
    : { word: "One of your biggest differences", tone: "far" };
}
function cxTraitRow(r, who, short, sentence, verdict){
  const v = verdict || cxVerdictOf(r.agreement);
  return `
  <li class="cx-tc cx-tc-${v.tone}">
    <div class="cx-tc-head"><h3 aria-level="3">${obEsc(r.label)}</h3><span class="cx-verdict cx-verdict-${v.tone}">${obEsc(v.word)}</span></div>
    <div class="cx-tc-bars">
      <div class="cx-tc-line"><span class="cx-tc-who">${obEsc(who)}</span>${cxSegs(cxLevelOf(r.you), "you", `${who}: ${cxBandWord(r.you)} ${r.label}`)}</div>
      <div class="cx-tc-line"><span class="cx-tc-who">${obEsc(short)}</span>${cxSegs(cxLevelOf(r.them), "them", `${short}: ${cxBandWord(r.them)} ${r.label}`)}</div>
    </div>
    ${sentence ? `<p class="cx-tc-note">${obEsc(sentence)}</p>` : ""}
  </li>`;
}
function cxShareSentence(r, i, short, you){
  const L = cxCap(r.label), l = r.label.toLowerCase();
  if (i === 0) return `${L} is one of the strongest reasons ${short} fits ${you}.`;
  const a = r.agreement;
  if (a >= 0.8) return `${you === "you" ? "You both" : "Both"} sit in almost the same place on ${l}.`;
  if (a >= 0.55) return `${L} is a real point of connection.`;
  return `There is some common ground on ${l}.`;
}

function renderCharacterPage(){
  const C = CX();
  const q = cxParams();
  if (!C){ cxShell(cxEmptyState("not-found"), "Character"); return; }

  // ---- which profile are we explaining? (someone else's code, or this device's own)
  let profile = null, viewingOther = false, profileError = null;
  if (q.p){
    profile = C.profileFrom({ code: q.p });
    if (!profile.ok){ profileError = "bad-code"; profile = null; }
    else viewingOther = !cxSameProfile(q.p);
  } else {
    profile = C.localProfile();
  }
  if (profileError){ cxShell(cxEmptyState(profileError, `<div class="cta-row"><a class="btn btn-primary" href="index.html">Go Home</a></div>`), "Character"); return; }

  // ---- world variant
  if (q.w){ renderWorldPage(q, profile, viewingOther); return; }

  // ---- character
  const ch = C.byId(q.c);
  if (!ch){
    const sample = C.roster().slice(0, 8).map(x => `<a class="tag cx-link-tag" href="${obEsc(C.url(x.id, { code: q.p }))}">${obEsc(x.name)}</a>`).join(" ");
    cxShell(cxEmptyState("not-found", `<div class="tag-list" style="margin-top:12px">${sample}</div><div class="cta-row" style="margin-top:14px"><a class="btn btn-ghost" href="result.html">Back to results</a></div>`), "Character");
    return;
  }
  const pub = C.publicChar(ch);
  const portrait = C.portraitSVG(ch, 112);
  const heroLeft = `
      <div class="cx-portrait">${portrait}</div>
      <div class="cx-hero-text">
        <div class="eyebrow accent">${obEsc(ch.medium.toUpperCase())} &middot; ${obEsc(ch.universe)}</div>
        <h1 id="cxTitle" aria-level="1" class="cx-name">${obEsc(ch.name)}</h1>
        <p class="cx-role">${obEsc(ch.role)}</p>
        <p class="cx-energy">${obEsc(ch.energy)}</p>
        <div class="tag-list cx-tags">
          ${pub.values.map(v => `<span class="tag">${obEsc(v.label)}</span>`).join("")}
          ${pub.motivations.map(v => `<span class="tag cx-tag-motive">Driven by ${obEsc(v.label.toLowerCase())}</span>`).join("")}
        </div>
      </div>`;

  if (!profile){
    cxShell(`
      <section class="card glass cx-hero cx-hero-noprofile">${heroLeft}</section>
      <section class="card glass cx-empty"><h2>See why Forge would (or wouldn't) match you</h2>
        <p>${obEsc(CX_MSGS["no-profile"][1])}</p>
        <div class="cta-row"><a class="btn btn-primary" href="quiz.html">Start the assessment &rarr;</a></div></section>
      ${cxTraitsCard(pub)}
      ${cxNotesCard(ch.id, ch.short)}`, ch.name);
    return;
  }

  const ex = C.explain(profile, ch.id, { plan: !viewingOther });
  if (!ex.ok){ cxShell(cxEmptyState("bad-code"), "Character"); return; }

  const whoLine = viewingOther
    ? `<div class="card glass cx-other" role="note"><p>Showing how this character relates to <strong>${obEsc(profile.identity.name || "this profile")}</strong>'s profile${q.n ? "" : ""}.</p></div>` : "";
  const subject = viewingOther ? (profile.identity.name || "") : null;
  const T = t => viewingOther ? C.speakAbout(t, subject) : t;
  const you = viewingOther ? obEsc(profile.identity.name || "This profile") : "Your";
  const youLower = viewingOther ? obEsc(profile.identity.name || "this profile") : "your";
  const cardsData = (() => { try{ return C.cards(profile); } catch(e){ return null; } })();
  const code = q.p || profile.profileCode || "";

  const sims = ex.similarities.map(s => s.available ? `
    <li class="cx-sim-row cx-v-${s.verdict.split(" ")[0].toLowerCase()}">
      <div class="cx-sim-head"><h3 aria-level="3">${obEsc(s.label)}</h3><span class="tag">${obEsc(s.verdict)}</span></div>
      <div class="cx-sim-styles"><span><i>${viewingOther ? obEsc(profile.identity.name || "Them") : "You"}</i> ${obEsc(s.yours.label)}</span><span><i>${obEsc(ch.short)}</i> ${obEsc(s.theirs.label)}</span></div>
      <p>${obEsc(T(s.text))}</p>
    </li>` : `
    <li class="cx-sim-row"><div class="cx-sim-head"><h3 aria-level="3">${obEsc(s.label)}</h3></div><p class="cx-sim-ev">Forge doesn't have structured data for this area for ${obEsc(ch.short)}.</p></li>`).join("");

  const conf = ex.confidence;
  const whoName = viewingOther ? (profile.identity.name || "this profile") : null;
  const alignedN = ex.trace.rows.filter(r => r.agreement >= 0.55).length, share = alignedN / (ex.trace.rows.length || 1);
  const whyLead = `You and ${ch.short} line up on ${share >= 0.75 ? "most" : share >= 0.5 ? "a good share" : "some"} of what defines ${ch.short}.`;

  const related = cardsData ? `
    <section class="cx-related section" aria-labelledby="cxRelTitle"><h2 id="cxRelTitle">${viewingOther ? "Their" : "Your"} other characters</h2>
      <div class="cx-grid">${cardsData.cards.map(cd => cxCardHTML(cd, code, T)).join("")}</div></section>` : "";
  // optional deeper sections: each is independent, so one failing never blanks the page
  const whyNot = cxSafe(() => cxWhyNotHTML(C.whyNot(profile, ch.id), ch, code, T));
  const cluster = cxSafe(() => cxClusterHTML(C.cluster(profile, ch.id), ch, code, T));
  const worlds = cxSafe(() => cxWorldsHTML(C.relatedWorlds(ch.id, profile), ch, code));
  const journey = viewingOther ? "" : cxSafe(() => cxJourneyHTML({ charId: ch.id }));
  const futures = viewingOther ? "" : cxSafe(() => cxFuturesHTML(C.futures(profile)));

  cxShell(`
    ${whoLine}
    <section class="card glass cx-hero section revealed">
      ${heroLeft}
      <div class="cx-match" aria-label="Overall match ${ex.matchPct} percent, ${obEsc(conf.level)} confidence">
        <div class="cx-match-pct ${cxPctClass(ex.matchPct)}"><b>${ex.matchPct}%</b><span>Overall match</span></div>
        <span class="tag cx-conf-tag">${obEsc(conf.level)} confidence</span>
        <p class="cx-rank">${ex.rank === 1 ? "Your closest character" : "Your #" + ex.rank + " character"}</p>
      </div>
    </section>

    <section class="card glass cx-why section" aria-labelledby="cxWhyTitle">
      <div class="eyebrow accent">WHY FORGE MATCHED THIS CHARACTER</div>
      <h2 id="cxWhyTitle">${obEsc(T(ex.headline))}</h2>
      <p class="cx-why-lead">${obEsc(T(whyLead))}</p>
      <ul class="cx-reasons">${ex.why.slice(1).map(t => `<li><span class="cx-reason-mark" aria-hidden="true">${CX_CHECK}</span><span>${obEsc(T(t))}</span></li>`).join("")}</ul>
    </section>

    ${cxSharedHTML(ex, ch, whoName)}

    <section class="card glass cx-sims section" aria-labelledby="cxSimTitle">
      <h2 id="cxSimTitle">How you each operate</h2>
      <p class="cx-note">${you === "Your" ? "Your answers" : youLower + "'s answers"} compared with ${obEsc(ch.short)}'s way of operating, area by area, using the same scale for both.</p>
      <ul class="cx-sim-list">${sims}</ul>
    </section>

    ${cxDifferHTML(ex, ch, whoName, T)}

    ${whyNot}
    ${cluster}
    ${cxConfidenceHTML(ex, ch, viewingOther, profile)}
    ${journey}
    ${futures}
    ${related}
    ${worlds}
    ${cxTraitsCard(pub)}
    ${cxNotesCard(ch.id, ch.short)}
    <p class="cx-disclaimer">Forge compares personality patterns with structured, curated character profiles. A match means a measured similarity in how someone tends to think and act, not that anyone is that character.</p>
  `, ch.name);
}

/* Strengths, weak spots, growth, tags and home world: hand-written notes from pack-character-notes.js (card omitted when absent). */
function cxNotesCard(id, short){
  const P = (typeof Forge !== "undefined") ? Forge.packs : null;
  const n = P && P.notes ? P.notes(id) : null;
  if (!n) return "";
  const world = n.world && P.merged ? P.merged("universes").find(u => u.id === n.world) : null;
  const li = (mark, t) => `<li><span class="cx-mark" aria-hidden="true">${mark}</span><span>${obEsc(t)}</span></li>`;
  return `
  <section class="card glass cx-notes section" aria-labelledby="cxNotesTitle">
    <h2 id="cxNotesTitle">${obEsc(short)}: strengths, weak spots and growth</h2>
    <div class="cx-notes-grid">
      <div><h3 aria-level="3">Strengths</h3><ul class="cx-mark-list">${n.strengths.map(t => li("✓", t)).join("")}</ul></div>
      <div><h3 aria-level="3">Weak spots</h3><ul class="cx-mark-list">${n.weaknesses.map(t => li("!", t)).join("")}</ul></div>
      <div><h3 aria-level="3">Room to grow</h3><p class="cx-growth">${obEsc(n.growth)}</p></div>
    </div>
    <div class="tag-list cx-note-tags">${n.tags.map(t => `<span class="tag">${obEsc(t.replace(/-/g, " "))}</span>`).join("")}${world ? `<span class="tag cx-tag-motive">${(Forge.emblems && Forge.emblems.svg("worlds", world.id, { size: 16 })) ? `<span class="fx-mini" aria-hidden="true">${Forge.emblems.svg("worlds", world.id, { size: 16 })}</span>` : ""}At home in ${obEsc(world.name)}</span>` : ""}</div>
  </section>`;
}

function cxTraitsCard(pub){
  return `
  <section class="card glass cx-traits section" aria-labelledby="cxTraitsTitle">
    <h2 id="cxTraitsTitle">What defines ${obEsc(pub.short)}</h2>
    <div class="cx-trait-list">${pub.traits.slice(0, 9).map(t => `<div class="cx-trait"><span>${obEsc(t.label)}</span>${cxSegs(cxLevelOf(t.value), "them", `${pub.short}: ${cxBandWord(t.value)} ${t.label}`)}<em>${obEsc(cxBandWord(t.value))}</em></div>`).join("")}</div>
    <p class="cx-note">Curated from public knowledge of the work. Forge's own original read, not text from the source.</p>
  </section>`;
}

/* =========================================================================
   DEEPER SECTIONS. Each renderer only formats what Forge.characters returns;
   cxSafe keeps one failing optional section from taking the page down.
   ========================================================================= */
/* Engine sentences occasionally carry a parenthetical figure, e.g. "(81% to 92%)"; the page keeps the words only. */
const cxNoNumbers = t => String(t == null ? "" : t).replace(/\s*\(\d+(?:\.\d+)?%?\s*(?:to|->|→|against|vs\.?)\s*\d+(?:\.\d+)?%?\)/g, "").replace(/\s{2,}/g, " ");
function cxSafe(fn){ try{ return fn() || ""; } catch(e){ return ""; } }
const cxCap = s => { s = String(s == null ? "" : s); return s.charAt(0).toUpperCase() + s.slice(1); };
const CX_CHECK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`;
function cxDate(ts){ try{ return ts ? new Date(ts).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "Undated"; } catch(e){ return "Undated"; } }
function cxSection(id, eyebrow, title, inner, opts){
  opts = opts || {};
  return `<section class="card glass ${opts.cls || ""} section" aria-labelledby="${id}">${eyebrow ? `<div class="eyebrow accent">${obEsc(eyebrow)}</div>` : ""}<h2 id="${id}">${obEsc(title)}</h2>${inner}</section>`;
}

/* ---- what you share: the traits that line up, as side-by-side levels ---- */
function cxSharedHTML(ex, ch, who){
  const subject = who || "you";
  const rows = ex.trace.rows.filter(r => r.agreement >= 0.55).sort((a, b) => b.points - a.points).slice(0, 4);
  const label = who ? cxCap(who) : "You";
  return `
  <section class="card glass cx-evidence section" aria-labelledby="cxEvTitle">
    <h2 id="cxEvTitle">What ${who ? obEsc(who) + " shares" : "you share"} with ${obEsc(ch.short)}</h2>
    <p class="cx-note">The traits where ${who ? obEsc(who) : "you"} and ${obEsc(ch.short)} sit closest. Longer bar, stronger trait.</p>
    ${rows.length ? `<ul class="cx-tc-list">${rows.map((r, i) => cxTraitRow(r, label, ch.short, cxShareSentence(r, i, ch.short, subject))).join("")}</ul>`
      : `<p class="cx-note">No single trait lines up closely. The match comes from a broad, gentle overlap instead.</p>`}
  </section>`;
}

/* ---- biggest differences ---- */
function cxDifferHTML(ex, ch, who, T){
  const label = who ? cxCap(who) : "You";
  const byFacet = {}; ex.differences.forEach(d => { byFacet[d.facet] = d; });
  const rows = ex.trace.rows.filter(r => r.agreement < 0.3).sort((a, b) => a.agreement - b.agreement).slice(0, 3);
  const body = rows.length
    ? `<ul class="cx-tc-list">${rows.map((r, i) => cxTraitRow(r, label, ch.short,
        byFacet[r.facet] ? T(byFacet[r.facet].text) : `${cxCap(r.label)} is where ${who ? obEsc(who) : "you"} and ${ch.short} part ways.`,
        i === 0 && r.agreement < 0.3 ? { word: "One of your biggest differences", tone: "far" } : null)).join("")}</ul>`
    : `<p>${obEsc(ex.differencesNote || `${who ? who : "You"} and ${ch.short} don't differ sharply on any defining trait.`)}</p>`;
  return `
  <section class="card glass cx-diffs section" aria-labelledby="cxDiffTitle">
    <h2 id="cxDiffTitle">${who ? "Where " + obEsc(who) + " differs" : "Where you differ"}</h2>
    ${body}
  </section>`;
}

/* ---- confidence: what Forge is sure / unsure about, wired to the targeted retake ---- */
const cxSureLevel = c => c >= 80 ? 5 : c >= 65 ? 4 : c >= 50 ? 3 : c >= 35 ? 2 : 1;
const cxSureWord = c => c >= 80 ? "very sure" : c >= 65 ? "fairly sure" : c >= 50 ? "somewhat sure" : "not very sure";
function cxConfidenceHTML(ex, ch, viewingOther, profile){
  const conf = ex.confidence;
  const sure = [];
  conf.byFacet.filter(f => f.confidence >= 70).slice(0, 4).forEach(f => sure.push({ label: f.label, confidence: f.confidence }));
  conf.byArea.filter(a => a.confidence >= 75).slice().sort((a, b) => b.confidence - a.confidence).slice(0, 2).forEach(a => { if (!sure.some(s => s.label === a.name)) sure.push({ label: a.name, confidence: a.confidence }); });
  sure.sort((a, b) => b.confidence - a.confidence);
  const unsure = [];
  conf.uncertain.forEach(u => unsure.push({ label: cxCap(u.label), confidence: u.confidence }));
  conf.byFacet.filter(f => f.confidence < 60).slice().reverse().slice(0, 3).forEach(f => { if (!unsure.some(u => u.label.toLowerCase() === f.label.toLowerCase())) unsure.push({ label: f.label, confidence: f.confidence }); });
  const item = (mark, s) => `<li><span class="cx-mark" aria-hidden="true">${mark}</span><span class="cx-sure-text">${obEsc(s.label)}</span>${cxSegs(cxSureLevel(s.confidence), "sure", `${s.label}: ${cxSureWord(s.confidence)}`, 5)}</li>`;
  const meter = (title, pct) => `<div class="cx-meter"><span>${obEsc(title)}</span>${cxSegs(cxSureLevel(pct), "sure", `${title}: ${cxSureWord(pct)}`, 5)}</div>`;
  const improve = conf.retake.recommended && !viewingOther
    ? `<div class="cx-retake"><h3 class="cx-sub" aria-level="3">Make this match firmer</h3>
        <p>${unsure.length ? "A short round of targeted questions would sharpen the areas above." : "A short, targeted retake could still sharpen a few areas."} It only revisits what Forge is least sure about.</p>
        <div class="cta-row"><a class="btn btn-primary" href="${obEsc(conf.retake.url)}">Answer targeted questions &rarr;</a></div></div>`
    : (conf.retake.recommended && viewingOther ? `<p class="cx-note">A longer or more recent assessment from ${obEsc(profile.identity.name || "this person")} would make this match firmer.</p>` : "");
  return `
  <section class="card glass cx-conf section" aria-labelledby="cxConfTitle">
    <h2 id="cxConfTitle">How sure is Forge?</h2>
    <p>${obEsc(conf.summary)}</p>
    <div class="cx-conf-grid">
      <div><h3 aria-level="3">Forge is confident about</h3>${sure.length ? `<ul class="cx-mark-list">${sure.map(s => item("✓", s)).join("")}</ul>` : `<p class="cx-note">Nothing yet: Forge's read is still thin across the board.</p>`}</div>
      <div><h3 aria-level="3">Less certain about</h3>${unsure.length ? `<ul class="cx-mark-list">${unsure.slice(0, 5).map(s => item("?", s)).join("")}</ul>` : `<p class="cx-note">No area stands out as uncertain.</p>`}</div>
    </div>
    <div class="cx-meters">
      ${meter("How clear your answers were", conf.parts.evidence)}${meter("How clearly this match leads", conf.parts.decisiveness)}${meter(`How much of ${ch.short} Forge could compare`, conf.parts.coverage)}${meter(`How well Forge knows ${ch.short}`, conf.parts.dataQuality)}
    </div>
    ${conf.repaired ? `<p class="cx-note">Some measurements were missing from this profile and were filled in neutrally, which lowers confidence.</p>` : ""}
    ${improve}
  </section>`;
}

/* ---- why not ---- */
function cxWhyNotHTML(w, ch, code, T){
  if (!w || !w.ok || !w.alternatives.length) return "";
  const lc = x => String(x).toLowerCase();
  const list = arr => { const a = arr.map(lc); return a.length > 1 ? a.slice(0, -1).join(", ") + " and " + a[a.length - 1] : a[0] || ""; };
  const story = a => {
    const parts = [`${a.name} is another strong fit${a.shared.length ? `, mainly through ${list(a.shared.slice(0, 2).map(s => s.label))}` : ""}.`];
    if (a.favoursX.length) parts.push(`${ch.short} edges ahead on ${list(a.favoursX.slice(0, 2).map(f => f.label))}.`);
    if (a.favoursY.length) parts.push(`${a.short} is closer on ${list(a.favoursY.slice(0, 2).map(f => f.label))}.`);
    return parts.join(" ");
  };
  const alt = a => `
    <article class="cx-alt">
      <div class="cx-alt-head"><a class="cx-alt-name" href="${obEsc(cxUrl(a.id, code))}">${obEsc(a.name)}</a><span class="cx-alt-meta">${obEsc(a.universe)}</span></div>
      <p class="cx-alt-summary">${obEsc(story(a))}</p>
      ${a.shared.length ? `<div class="cx-alt-block"><h3 aria-level="3">What you share</h3><ul class="cx-mark-list">${a.shared.map(s => `<li><span class="cx-mark" aria-hidden="true">✓</span><span>${obEsc(cxCap(s.line))}</span></li>`).join("")}</ul></div>` : ""}
      ${a.differ.length ? `<div class="cx-alt-block"><h3 aria-level="3">How they differ</h3><ul class="cx-plain">${a.differ.map(d => `<li>${obEsc(d.text)}</li>`).join("")}</ul></div>` : ""}
      ${a.youLean.length ? `<div class="cx-alt-block"><h3 aria-level="3">Where you pull apart from ${obEsc(a.short)}</h3><ul class="cx-plain">${a.youLean.map(d => `<li>${obEsc(T(d.text))}</li>`).join("")}</ul></div>` : ""}
    </article>`;
  return cxSection("cxWhyNotTitle", "WHY NOT…", `Why not ${w.alternatives.map(a => a.short).join(", ").replace(/, ([^,]*)$/, " or $1")}?`,
    `<p class="cx-note">Other characters that came close, and why ${obEsc(ch.short)} still fits better.</p><div class="cx-alt-grid">${w.alternatives.map(alt).join("")}</div>`, { cls: "cx-whynot" });
}

/* ---- cluster ---- */
function cxClusterHTML(cl, ch, code, T){
  T = T || (s => s);
  if (!cl || !cl.ok || !cl.members.length) return "";
  const C = CX();
  const row = (id, name, uni, sim, up, isAnchor) => `
    <a class="cx-inline-row${isAnchor ? " cx-anchor" : ""}" href="${obEsc(cxUrl(id, code))}" ${isAnchor ? 'aria-current="page"' : ""}>
      <span class="cx-card-portrait">${C.portraitSVG(C.byId(id), 44)}</span>
      <span class="cx-inline-text"><span class="cx-card-name">${obEsc(name)}</span><span class="cx-card-uni">${obEsc(uni)}${isAnchor ? " &middot; this page" : ` &middot; ${sim >= 75 ? "very close in spirit" : sim >= 55 ? "similar traits" : "some overlap"}`}</span></span>
      <span class="cx-card-pct ${cxPctClass(up == null ? 0 : up)}"><b>${up == null ? "" : up + "%"}</b>${up == null ? "" : `<i>${obEsc(T("your match"))}</i>`}</span>
    </a>`;
  return cxSection("cxClusterTitle", "CLOSEST CHARACTERS", `${ch.short} doesn't stand alone.`,
    `<div class="cx-inline-grid">${row(cl.anchor.id, cl.anchor.name, cl.anchor.universe, 100, cl.anchor.pct, true)}${cl.members.map(m => row(m.id, m.name, m.universe, m.similarity, m.userPct, false)).join("")}</div>
     <p class="cx-cluster-text">${obEsc(cxNoNumbers(T(cl.connects.text)))}</p>
     ${cl.whyStrongest.available ? `<p class="cx-cluster-text">${obEsc(cxNoNumbers(T(cl.whyStrongest.text)))}</p>` : ""}
`, { cls: "cx-cluster" });
}

/* ---- possible futures ---- */
function cxFuturesHTML(f){
  if (!f || !f.ok) return "";
  const t = f.trend;
  const trendBody = !t.available
    ? `<p class="cx-note">${obEsc(t.reason)}</p>`
    : t.steady ? `<p>${obEsc(t.text)}</p><p class="cx-note">Based on ${t.basis.assessments} assessments over ${t.basis.spanDays} days.</p>`
    : `<p>${obEsc(t.text)}</p>
       <div class="tag-list">${t.moves.map(m => `<span class="tag">${obEsc(m.label)} ${m.per90 > 0 ? "↑ rising" : "↓ easing"}</span>`).join("")}</div>
       <p class="cx-note">Based on ${t.basis.assessments} assessments over ${t.basis.spanDays} days. ${obEsc(t.assumption)}</p>`;
  const lean = f.leanings.map(l => `
    <article class="cx-alt">
      <h4 aria-level="3" class="cx-lean-title">${obEsc(l.label)}</h4>
      <p>${obEsc(cxNoNumbers(l.text))}</p>
      ${l.assumed.length ? `<div class="tag-list">${l.assumed.map(a => `<span class="tag">a little more ${obEsc(a.label.toLowerCase())}</span>`).join("")}</div>` : ""}
      ${l.experiments.length ? `<p class="cx-note">You're currently trying: ${obEsc(l.experiments.join(", "))}.</p>` : ""}
    </article>`).join("");
  return cxSection("cxFutureTitle", "POSSIBILITIES, NOT PREDICTIONS", "Where your matches might go.",
    `<h3 class="cx-sub" aria-level="3">If your current trends continue&hellip;</h3>${trendBody}
     <h3 class="cx-sub" aria-level="3">If you leaned more into&hellip;</h3><div class="cx-alt-grid">${lean}</div>
     <p class="cx-note">${obEsc(f.disclaimer)}</p>`, { cls: "cx-futures" });
}

/* ---- related worlds ---- */
function cxWorldsHTML(rw, ch, code){
  if (!rw || !rw.ok) return "";
  const C = CX();
  const world = w => `
    <a class="cx-inline-row" href="${obEsc(C.worldUrl(w.name, { code }))}">
      <span class="cx-world-dot" aria-hidden="true">${(Forge.emblems && Forge.emblems.svg("worlds", w.id, { size: 26 })) || "◈"}</span>
      <span class="cx-inline-text"><span class="cx-card-name">${obEsc(w.name)}</span><span class="cx-card-uni">${obEsc(w.source)}</span><span class="cx-card-blurb">${obEsc(w.text)}</span></span>
      <span class="cx-card-go" aria-hidden="true">${ICONS.arrow}</span>
    </a>`;
  const same = rw.sameUniverse.length ? `<div class="cx-alt-block"><h3 class="cx-sub" aria-level="3">More from ${obEsc(ch.universe)}</h3><div class="tag-list">${rw.sameUniverse.map(x => `<a class="tag cx-link-tag" href="${obEsc(cxUrl(x.id, code))}">${obEsc(x.name)}</a>`).join("")}</div>${rw.ownWorlds.length ? `<div class="cx-inline-grid">${rw.ownWorlds.map(world).join("")}</div>` : ""}</div>` : (rw.ownWorlds.length ? `<div class="cx-inline-grid">${rw.ownWorlds.map(world).join("")}</div>` : "");
  const other = rw.worlds.length ? `<div class="cx-alt-block"><h3 class="cx-sub" aria-level="3">Other worlds that fit similar patterns</h3><div class="cx-inline-grid">${rw.worlds.map(world).join("")}</div></div>` : "";
  if (!same && !other) return "";
  return cxSection("cxWorldsTitle", "WORLDS", `Where ${ch.short}'s patterns fit.`, same + other, { cls: "cx-worlds" });
}

/* =========================================================================
   CHARACTER JOURNEY (character page + Growth page). One renderer, one engine.
   ========================================================================= */
const CX_KIND = { targeted: "Targeted retake", short: "Quick read" };
function cxStepHTML(step){
  if (!step) return "";
  return `<details class="cx-step"><summary>What changed?</summary>
    <p>${obEsc(step.headline)}</p><p>${obEsc(step.detail)}</p>
    ${step.changes.length ? `<div class="tag-list">${step.changes.map(c => `<span class="tag">${obEsc(c.label)} ${c.delta > 0 ? "↑ grew" : "↓ eased"}</span>`).join("")}</div>` : ""}
    ${step.caveats.length ? `<ul class="cx-plain cx-caveats">${step.caveats.map(c => `<li>${obEsc(c)}</li>`).join("")}</ul>` : ""}
  </details>`;
}
function cxCompareResultHTML(snaps, to, mode, from){
  const C = CX();
  const t = C.journeyCompare(snaps, to, mode, from);
  if (!t.ok) return `<p class="cx-note">${obEsc(t.reason === "no earlier assessment to compare with" ? "There is no earlier assessment to compare with yet." : "That comparison isn't available.")}</p>`;
  return `
    <div class="cx-cmp ${t.moved ? "cx-cmp-moved" : ""}">
      <div class="cx-cmp-pair">
        <div><span class="cx-card-kind">${obEsc(cxDate(t.from.ts))}</span><a class="cx-card-name" href="${obEsc(cxUrl(t.from.main.id))}">${obEsc(t.from.main.name)}</a><span class="cx-card-uni">${t.from.main.pct}%</span></div>
        <span class="cx-cmp-arrow" aria-hidden="true">→</span>
        <div><span class="cx-card-kind">${obEsc(cxDate(t.to.ts))}</span><a class="cx-card-name" href="${obEsc(cxUrl(t.to.main.id))}">${obEsc(t.to.main.name)}</a><span class="cx-card-uni">${t.to.main.pct}%</span></div>
      </div>
      <p class="cx-cmp-headline">${obEsc(t.headline)}</p>
      <p>${obEsc(t.detail)}</p>
      ${t.changes.length ? `<div class="tag-list" aria-label="Traits that changed">${t.changes.map(c => `<span class="tag">${obEsc(c.label)} ${c.delta > 0 ? "↑ grew" : "↓ eased"}</span>`).join("")}</div>` : ""}
      ${t.crossing.length > 1 ? `<p class="cx-note">${t.crossing.map(x => `${obEsc(x.name)}: ${x.after > x.before ? "moved closer" : x.after < x.before ? "drifted away" : "held steady"}`).join(" &middot; ")}</p>` : ""}
      <ul class="cx-plain cx-caveats">${t.caveats.map(c => `<li>${obEsc(c)}</li>`).join("")}</ul>
    </div>`;
}
let cxJrSnaps = null;
function cxJourneyUpdate(changed){
  const C = CX(); if (!C || !cxJrSnaps) return;
  const toEl = document.getElementById("cxJrTo"), modeEl = document.getElementById("cxJrMode"), fromEl = document.getElementById("cxJrFrom"), out = document.getElementById("cxJrResult");
  if (!toEl || !modeEl || !fromEl || !out) return;
  const to = parseInt(toEl.value, 10), mode = modeEl.value;
  if (changed === "to" || changed === "mode"){
    const keep = fromEl.value;
    fromEl.innerHTML = cxJrSnaps.filter(s => s.index < to).map(s => `<option value="${s.index}">${obEsc(cxDate(s.timestamp))}</option>`).join("");
    if (keep && fromEl.querySelector(`option[value="${keep}"]`)) fromEl.value = keep;
  }
  fromEl.hidden = mode !== "selected";
  const fromLabel = document.getElementById("cxJrFromLabel"); if (fromLabel) fromLabel.hidden = mode !== "selected";
  out.innerHTML = cxCompareResultHTML(cxJrSnaps, to, mode, parseInt(fromEl.value, 10));
}
function cxJourneyHTML(opts){
  opts = opts || {};
  const C = CX(); if (!C || !C.journey) return "";
  const j = C.journey(); if (!j.ok) return "";
  cxJrSnaps = j.snaps;
  const rev = j.entries.slice().reverse();
  const li = e => `<li class="cx-jr-item${e.step && e.step.moved ? " cx-jr-moved" : ""}">
      <div class="cx-jr-row"><span class="cx-jr-date">${obEsc(cxDate(e.ts))}${CX_KIND[e.kind] ? ` <span class="tag">${obEsc(CX_KIND[e.kind])}</span>` : ""}</span>
        <a class="cx-jr-char" href="${obEsc(cxUrl(e.main.id))}">${obEsc(e.main.name)}</a><span class="cx-jr-pct">${e.main.pct}%</span>
        ${e.step && e.step.moved ? `<span class="tag">Closest character changed</span>` : ""}${e.close ? `<span class="tag">Close call</span>` : ""}</div>
      ${cxStepHTML(e.step)}
    </li>`;
  const visible = rev.slice(0, 8), older = rev.slice(8);
  const hist = opts.charId ? C.characterHistory(opts.charId, j.snaps) : null;
  const ch = opts.charId ? C.byId(opts.charId) : null;
  const histHTML = hist && hist.length > 1 && ch ? `
    <h3 class="cx-sub" aria-level="3">Your match with ${obEsc(ch.short)} over time</h3>
    <div class="cx-hist">${hist.slice(-12).map(h => `<div class="cx-hist-row"><span>${obEsc(cxDate(h.ts))}</span><span class="cx-ev-bar" aria-hidden="true"><span class="cx-pos" style="width:${Math.max(3, h.pct || 0)}%"></span></span><b>${h.pct == null ? "–" : h.pct + "%"}</b><span class="cx-ev-detail">#${h.rank}</span></div>`).join("")}</div>` : "";
  const controls = j.entries.length > 1 ? `
    <div class="cx-jr-controls" role="group" aria-label="Compare assessments">
      <label for="cxJrTo">Compare</label>
      <select id="cxJrTo" onchange="cxJourneyUpdate('to')">${rev.slice(0, rev.length - 1).map(e => `<option value="${e.index}">${obEsc(cxDate(e.ts))} (${obEsc(e.main.name)})</option>`).join("")}</select>
      <label for="cxJrMode">with</label>
      <select id="cxJrMode" onchange="cxJourneyUpdate('mode')"><option value="previous">the previous assessment</option><option value="first">my first assessment</option><option value="selected">a selected assessment</option></select>
      <label for="cxJrFrom" id="cxJrFromLabel" hidden>from</label>
      <select id="cxJrFrom" onchange="cxJourneyUpdate('from')" hidden></select>
    </div>
    <div id="cxJrResult" aria-live="polite">${cxCompareResultHTML(j.snaps, rev[0].index, "previous")}</div>` : `<p class="cx-note">Take the assessment again later and Forge will show how your closest character moves, and why.</p>`;
  const inner = `
    <p class="cx-note">One row per assessment. ${j.count < 2 ? "This is your first assessment, so there is no history to compare yet." : j.switches ? `Your closest character has changed ${j.switches} time${j.switches === 1 ? "" : "s"}.` : "Your closest character has stayed the same so far."} Each match is read again from what you answered that day, with today's character data.</p>
    ${controls}
    <h3 class="cx-sub" aria-level="3">Every assessment</h3>
    <ol class="cx-jr-list">${visible.map(li).join("")}</ol>
    ${older.length ? `<details class="cx-older"><summary>Show ${older.length} earlier assessment${older.length === 1 ? "" : "s"}</summary><ol class="cx-jr-list">${older.map(li).join("")}</ol></details>` : ""}
    ${histHTML}`;
  return `<section class="card glass cx-journey${opts.reveal === false ? "" : " section"}" aria-labelledby="cxJrTitle"${opts.reveal === false ? ' style="margin-top:14px"' : ""}><div class="eyebrow accent">CHARACTER TIMELINE</div><h2 id="cxJrTitle">${obEsc(opts.title || "How your closest character has changed.")}</h2>${inner}</section>`;
}

/* ---------------- world variant (same engine, honest scale) ---------------- */
function renderWorldPage(q, profile, viewingOther){
  const C = CX();
  if (!profile){
    cxShell(cxEmptyState("no-profile", `<div class="cta-row"><a class="btn btn-primary" href="quiz.html">Start the assessment &rarr;</a></div>`), "World");
    return;
  }
  const wv = C.worldView(profile, q.w);
  if (!wv.ok){ cxShell(cxEmptyState("world-missing", `<div class="cta-row"><a class="btn btn-ghost" href="result.html">Back to results</a></div>`), "World"); return; }
  const code = q.p || profile.profileCode || "";
  const maxAbs = Math.max(0.01, ...wv.contributions.map(c => Math.abs(c.points)));
  cxShell(`
    <section class="card glass cx-hero section revealed">
      ${wv.world.id && Forge.emblems && Forge.emblems.has("worlds", wv.world.id) ? `<div class="cx-portrait">${Forge.emblems.tile("worlds", wv.world.id, { size: 112, label: wv.world.name + " emblem" })}</div>` : ""}
      <div class="cx-hero-text">
        <div class="eyebrow accent">WORLD &middot; ${obEsc(wv.world.source)}</div>
        <h1 id="cxTitle" aria-level="1" class="cx-name">${obEsc(wv.world.name)}</h1>
        <p class="cx-role">${obEsc(wv.world.role)}</p>
        <p class="cx-energy">${obEsc(wv.world.energy)}</p>
      </div>
      <div class="cx-match"><div class="cx-match-pct cx-fit ${wv.score >= 2 ? "cx-high" : wv.score >= 1 ? "cx-mid" : "cx-low"}"><b>${wv.score >= 2 ? "Strong fit" : wv.score >= 1 ? "Good fit" : wv.score >= 0 ? "Some fit" : "A looser fit"}</b><span>How well this world suits you</span></div></div>
    </section>
    <section class="card glass cx-why section"><div class="eyebrow accent">WHY FORGE FOUND A SIMILARITY</div><h2>${obEsc(wv.summary)}</h2></section>
    <section class="card glass cx-evidence section"><h2>Why it fits</h2>
      <p class="cx-note">The traits that shape how well this world suits you. A longer bar means a stronger pull.</p>
      <ul class="cx-tc-list">${wv.contributions.map(c => `<li class="cx-tc cx-tc-${c.points >= 0 ? "good" : "apart"}">
        <div class="cx-tc-head"><h3 aria-level="3">${obEsc(cxCap(c.label))}</h3><span class="cx-verdict cx-verdict-${c.points >= 0 ? "good" : "apart"}">${c.points >= 0 ? "Pulls you in" : "Pulls the other way"}</span></div>
        <div class="cx-tc-bars"><div class="cx-tc-line"><span class="cx-tc-who">You</span>${cxSegs(cxLevelOf(c.you), "you", `You: ${cxBandWord(c.you)} ${c.label}`)}</div>
        <div class="cx-tc-line"><span class="cx-tc-who">Pull</span>${cxSegs(Math.max(1, Math.round(Math.abs(c.points) / maxAbs * CX_SEGS)), c.points >= 0 ? "them" : "away", `${c.points >= 0 ? "Pulls you in" : "Pulls the other way"}: ${c.label}`)}</div></div>
      </li>`).join("")}</ul></section>
    ${wv.characters.length ? `<section class="card glass cx-universe section"><h2>Characters from this world</h2><div class="cx-inline-grid">${wv.characters.map(x => `<a class="cx-inline-row" href="${obEsc(C.url(x.id, { code }))}"><span class="cx-card-portrait">${C.portraitSVG(C.byId(x.id), 44)}</span><span class="cx-inline-text"><span class="cx-card-name">${obEsc(x.name)}</span><span class="cx-card-uni">${obEsc(x.role)}</span></span><span class="cx-card-pct ${cxPctClass(x.pct)}"><b>${x.pct}%</b></span></a>`).join("")}</div></section>` : ""}
    <p class="cx-disclaimer">A world's fit describes how well its environment suits the way you tend to operate. It isn't a prediction or a verdict.</p>
  `, wv.world.name);
}
