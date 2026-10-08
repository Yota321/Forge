/* =========================================================================
   FORGE - COMPARE (compare.html)
   The compare.html page itself (two-code pairwise compare) and party
   compare (3-5 people) — party is a mode within this same page, not a
   separate HTML file (see HANDOFF notes). Depends on compatibility.js
   for showCompatibilityLoading/bandColor — load that
   first. Loaded by compare.html only, after engine.js + global.js +
   compatibility.js.
   ========================================================================= */

function renderCompare(){
  setAccentColors();
  setPageTitle("Compare");
  // pf_prefill_a (set by compareThisResult() on the result page) wins
  // over pf_last_code so "Compare" on a *shared* result you're viewing
  // fills Person A with that result, not whatever you last took yourself.
  const myCode = sessionStorage.getItem("pf_prefill_a") || localStorage.getItem("pf_last_code") || "";
  sessionStorage.removeItem("pf_prefill_a");
  const prefillB = sessionStorage.getItem("pf_prefill_b") || "";
  sessionStorage.removeItem("pf_prefill_b");
  const autoCompare = sessionStorage.getItem("pf_auto_compare") === "1";
  sessionStorage.removeItem("pf_auto_compare");
  root.innerHTML = `
    <div class="container">
      ${topBar(true)}
      <div class="eyebrow accent">COMPARE</div>
      <h2 aria-level="1" style="margin:10px 0 6px">Two Codes, One Read</h2>
      <p class="tagline" style="text-align:left;color:var(--text-muted)">Paste two Forge codes to see how the two of you actually line up. Everything decodes locally, right here in the browser.</p>
      <div class="compare-inputs" style="margin-top:20px">
        <div><label for="codeA">Person A code</label><textarea id="codeA" placeholder="Name-PF4-...">${myCode}</textarea></div>
        <div><label for="codeB">Person B code</label><textarea id="codeB" placeholder="Name-PF4-...">${prefillB}</textarea></div>
      </div>
      <div class="cta-row" style="justify-content:flex-start;margin-top:18px">
        <button class="btn btn-primary" onclick="runCompare()">Compare</button>
        <button class="btn btn-ghost" onclick="navigate('party')">Compare a group instead</button>
      </div>
      <div id="compareOut"></div>
    </div>
  `;
  if (autoCompare && myCode && prefillB) runCompare();
}

/* The state both runCompare() and a navigation restore (nav.js) build from two decoded profiles. Names are escaped once, here. */
function makeCompareState(a, b){
  return { profileA: a, archA: a.archetype, nameA: obEsc(a.name), profileB: b, archB: b.archetype, nameB: obEsc(b.name), target: "compareOut" };
}
function runCompare(){
  const a = freshenDecoded(decodeCode(document.getElementById("codeA").value));
  const b = freshenDecoded(decodeCode(document.getElementById("codeB").value));
  const out = document.getElementById("compareOut");
  if (!a || !b){
    out.innerHTML = `<p class="center-note" style="text-align:left">One or both codes look off. Double check for typos and try again.</p>`;
    return;
  }
  if (a.obsolete || b.obsolete){
    out.innerHTML = `<p class="center-note" style="text-align:left">${obEsc(OBSOLETE_CODE_MESSAGE)}</p>`;
    return;
  }
  // Escaped once here, at the source, matching runPartyCompare()'s
  // pattern — the story engine and everything it hands nameA/nameB
  // to (computeDeepCompatibility's explanations/funFacts/who-comparisons)
  // trust these as pre-sanitized rather than re-escaping downstream.
  compareState = makeCompareState(a, b);
  // Two profiles: ask HOW to compare first (Friendship / Romance / Everyday). Same engine, three ways to tell it.
  if (typeof showCompareLensModal === "function" && typeof lensEngine === "function" && lensEngine()){ showCompareLensModal(); return; }
  click(420);
  showCompatibilityLoading(out, () => mountCompareFallback(out));
}


/* =========================================================================
   FORGE - PARTY COMPARE (3-5 people)
   Depends on compare.js for showCompatibilityLoading (must load after it).
   ========================================================================= */

let partyState = null;

/* ---------------- PARTY COMPARE (3-5 people) ------------------------------*/
function renderParty(){
  setAccentColors();
  setPageTitle("Party Compare");
  root.innerHTML = `
    <div class="container">
      ${topBar(true)}
      <div class="eyebrow accent">PARTY COMPARE</div>
      <h2 aria-level="1" style="margin:10px 0 6px">The Whole Group</h2>
      <p class="tagline" style="text-align:left;color:var(--text-muted)">Gather your people. Paste 3 to 10 Forge codes and find out who you'd be together: your team, your world, your story.</p>
      <div class="compare-inputs party-inputs" style="margin-top:20px">
        <div><label for="partyCode0">Person 1</label><textarea id="partyCode0" placeholder="Name-PF4-...">${localStorage.getItem("pf_last_code") || ""}</textarea></div>
        <div><label for="partyCode1">Person 2</label><textarea id="partyCode1" placeholder="Name-PF4-..."></textarea></div>
        <div><label for="partyCode2">Person 3</label><textarea id="partyCode2" placeholder="Name-PF4-..."></textarea></div>
      </div>
      <button class="btn btn-ghost" style="margin-top:12px" onclick="toggleMorePartySlots()" id="partyToggleBtn">+ Add up to 7 more people</button>
      <div id="extraPartySlots" class="hidden compare-inputs party-extra-inputs" style="margin-top:12px">
        ${[3,4,5,6,7,8,9].map(i => `<div><label for="partyCode${i}">Person ${i + 1}</label><textarea id="partyCode${i}" placeholder="Name-PF4-..."></textarea></div>`).join("")}
      </div>
      <div class="cta-row" style="justify-content:flex-start;margin-top:18px">
        <button class="btn btn-primary" onclick="runPartyCompare()">Compare Group</button>
        <button class="btn btn-ghost" onclick="navigate('compare')">Back to two-person compare</button>
      </div>
      ${renderSavedGroupsList()}
      <div id="partyOut"></div>
    </div>
  `;
}
// A saved group is just a named, remembered set of pasted codes — so
// "load" fills the exact same textareas a person would've pasted into
// by hand, then runs the exact same compare, rather than being a
// separate code path.
function renderSavedGroupsList(){
  // Defense in depth: importProfile() already drops any saved group
  // whose id doesn't match isSafeId() before it's ever written to
  // localStorage (see sanitizeImportedGroups() in engine.js) — g.id
  // ends up in an inline onclick below, so this re-checks it here too
  // rather than trusting whatever's already in storage.
  const groups = getSavedGroups().filter(g => isSafeId(g.id));
  if (!groups.length) return "";
  return `
    <div class="card glass" style="margin-top:20px">
      <h4 aria-level="2">My Groups</h4>
      ${groups.map(g => `
        <div class="mini-bar-row">
          <span>${obEsc(g.name)} <span style="color:var(--text-dim)">(${g.codes.length})</span></span>
          <span><button class="btn btn-ghost btn-sm" onclick="loadSavedGroup('${g.id}')">Load</button> <button class="icon-btn" style="width:28px;height:28px;vertical-align:middle" onclick="removeSavedGroup('${g.id}')" aria-label="Delete group">${ICONS.close}</button></span>
        </div>`).join("")}
    </div>`;
}
function loadSavedGroup(id){
  const group = getSavedGroups().find(g => g.id === id);
  if (!group) return;
  if (group.codes.length > 3){
    const extra = document.getElementById("extraPartySlots");
    const btn = document.getElementById("partyToggleBtn");
    if (extra && extra.classList.contains("hidden")){ extra.classList.remove("hidden"); if (btn) btn.textContent = "− Hide extra slots"; }
  }
  ["partyCode0","partyCode1","partyCode2","partyCode3","partyCode4"].forEach((id2, i) => {
    const el = document.getElementById(id2);
    if (el) el.value = group.codes[i] || "";
  });
  click(420);
  runPartyCompare();
}
function removeSavedGroup(id){
  deleteSavedGroup(id);
  click(340);
  renderParty();
}
function promptSaveGroup(){
  const el = document.getElementById("saveGroupPanel");
  if (el) el.classList.remove("hidden");
  click(360);
}
function confirmSaveGroup(){
  const nameField = document.getElementById("saveGroupName");
  const name = (nameField.value || "").trim() || "Unnamed Group";
  saveGroup(name, partyState.raw);
  click(500);
  showToast(`Saved "${name}".`);
  const el = document.getElementById("saveGroupPanel");
  if (el) el.classList.add("hidden");
}
function toggleMorePartySlots(){
  const el = document.getElementById("extraPartySlots");
  const btn = document.getElementById("partyToggleBtn");
  const showing = !el.classList.contains("hidden");
  el.classList.toggle("hidden");
  btn.textContent = showing ? "+ Add up to 7 more people" : "\u2212 Hide extra slots";
  click(360);
}
function makePartyState(decoded, raw){
  return { decoded, raw, names: decoded.map((d,i) => obEsc(d.name) || `Person ${i+1}`) };
}
function runPartyCompare(){
  const ids = [0,1,2,3,4,5,6,7,8,9].map(i => "partyCode" + i);
  const raw = ids.map(id => (document.getElementById(id)?.value || "").trim()).filter(Boolean);
  const out = document.getElementById("partyOut");
  if (raw.length < 3){
    out.innerHTML = `<p class="center-note" style="text-align:left">Add at least 3 codes to compare a group. For two people, use regular Compare instead.</p>`;
    return;
  }
  if (raw.length > 10){
    out.innerHTML = `<p class="center-note" style="text-align:left">Party Compare supports up to 10 people at once.</p>`;
    return;
  }
  const decoded = raw.map(c => freshenDecoded(decodeCode(c)));
  if (decoded.some(d => !d)){
    out.innerHTML = `<p class="center-note" style="text-align:left">One or more codes look off. Double check each one for typos and try again.</p>`;
    return;
  }
  if (decoded.some(d => d.obsolete)){
    out.innerHTML = `<p class="center-note" style="text-align:left">${obEsc(OBSOLETE_CODE_MESSAGE)}</p>`;
    return;
  }
  // Escaped once here, at the source: every name below (decoded from
  // pasted party codes) flows straight into rendered HTML in
  // renderPartyExperience() via computeGroupCompatibility()'s bestPair/
  // toughestPair/roles/pairwise fields, none of which re-escape it.
  partyState = makePartyState(decoded, raw);
  click(420);
  showCompatibilityLoading(out, () => {
    const eventPage = (typeof renderPartyExperience === "function") ? renderPartyExperience() : "";
    out.innerHTML = eventPage || `<p class="center-note" style="text-align:left">The party page couldn't be built. Refresh and try again.</p>`;
    initCountUps(out);
  });
}
