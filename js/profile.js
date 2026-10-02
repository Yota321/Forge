/* =========================================================================
   FORGE - PROFILE (profile.html)
   The local identity hub: name, an optional on-device photo, archetype,
   soul type, retake count/history, export/import, compare shortcuts,
   settings, and app info. Everything here reads/writes getLocalProfile()
   (engine.js) — there's no account behind it, this page just gives that
   local record a real home instead of leaving it invisible in
   localStorage. Loaded by profile.html only, after engine.js + global.js.
   ========================================================================= */

// Downscales whatever image the person picks to a small square JPEG
// before it ever touches localStorage — an unresized phone photo would
// blow well past a reasonable localStorage budget and slow down every
// future JSON.parse of the profile record for no visual benefit at this
// display size.
const PROFILE_AVATAR_SIZE = 128;
function readAvatarFile(file){
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = PROFILE_AVATAR_SIZE;
        canvas.height = PROFILE_AVATAR_SIZE;
        const ctx = canvas.getContext("2d");
        const side = Math.min(img.width, img.height);
        const sx = (img.width - side) / 2, sy = (img.height - side) / 2;
        ctx.drawImage(img, sx, sy, side, side, 0, 0, PROFILE_AVATAR_SIZE, PROFILE_AVATAR_SIZE);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = () => reject(new Error("Couldn't read that image."));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error("Couldn't read that file."));
    reader.readAsDataURL(file);
  });
}
function pickAvatar(){
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.addEventListener("change", async () => {
    const file = input.files && input.files[0];
    if (!file) return;
    try{
      const dataUrl = await readAvatarFile(file);
      updateLocalProfile({ avatarImage: dataUrl });
      click(460);
      renderProfile();
    } catch(e){
      showToast("Couldn't use that photo. Try a different image.");
    }
  });
  input.click();
}
function removeAvatar(){
  updateLocalProfile({ avatarImage: null });
  click(340);
  renderProfile();
}

// Copies the bare PF-code (not a full share link -- that's
// copyShareLink() on the result page, which needs shareURLFor() and
// isn't loaded here). Same clipboard-with-fallback pattern.
function copyProfileShareCode(){
  const profile = getLocalProfile();
  if (!profile || !profile.code) return;
  navigator.clipboard?.writeText(profile.code).then(() => {
    click(700); showToast("Share code copied.");
  }).catch(() => showToast("Couldn't copy automatically — long-press to copy: " + profile.code));
}

/* ---------------- Profile Switcher (v1.5) ----------------------------------
   Multiple saved profiles (engine.js's listProfiles()/switchToProfile()/
   createNewProfile()/renameProfile()/deleteProfileById() -- see the
   architecture note above those). Fifth caller of the shared focus-trap
   modal pattern. Each row reuses profileAvatarMarkup() as-is: a profile
   summary carries the exact same avatarImage/name/soulHex fields a full
   profile does, so it needs no adapter. */
function showProfileSwitcherModal(){
  click(460);
  if (document.getElementById("profileSwitcherModal")) return;
  const overlay = document.createElement("div");
  overlay.id = "profileSwitcherModal";
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <div class="modal-card glass profile-switcher-modal" role="dialog" aria-modal="true" aria-labelledby="profileSwitcherTitle">
      <button class="icon-btn modal-close" onclick="closeProfileSwitcherModal()" aria-label="Close">${ICONS.close}</button>
      <div class="eyebrow accent">PROFILES</div>
      <h3 id="profileSwitcherTitle">Everyone saved on this device</h3>
      <p style="color:var(--text-muted);font-size:13.5px">Switch between yourself, friends, family, or alternate reads -- entirely on this device, nothing synced.</p>
      <div class="profile-switcher-list" id="profileSwitcherList"></div>
      <div class="cta-row" style="margin-top:14px">
        <button class="btn btn-primary" onclick="promptCreateNewProfile()">+ New Profile</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  rememberFocusTrigger();
  requestAnimationFrame(() => { overlay.classList.add("open"); getFocusable(overlay)[0]?.focus(); });
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeProfileSwitcherModal(); });
  document.addEventListener("keydown", onProfileSwitcherModalKey);
  renderProfileSwitcherList();
}
// Security review fix (v1.5): these used to be inline onclick="fn('${s.id}',
// '${s.name}')" handlers. Two problems, both real: (1) s.id is a
// profileId, and while it's always system-generated locally, an
// imported .pf file's profileId only ever went through a length cap
// (see sanitizeImportedLocalProfile()), never a character allowlist --
// so an imported profile could carry one crafted to break out of the
// single-quoted JS-string context inside the attribute. (2) s.name went
// through obEsc() (safe for HTML content) plus an ad-hoc
// .replace(/'/g,"\\'") for the JS-string context, but a trailing
// backslash in the name defeats that: it escapes the closing quote
// *I* added instead of terminating the string, breaking out of the
// intended JS-string context. Rather than patch the escaping (a
// JSON.stringify-then-obEsc double-encode would technically close this
// specific hole), this avoids the whole class: no data is ever
// interpolated into executable attribute text. IDs live in data-id,
// looked up fresh from listProfiles() (the same allowlisted-shape
// summaries used everywhere else) when a button is actually clicked.
function renderProfileSwitcherList(){
  const list = document.getElementById("profileSwitcherList");
  if (!list) return;
  const profiles = listProfiles();
  const activeId = getActiveProfileId();
  list.innerHTML = profiles.length ? profiles.map(s => `
    <div class="profile-switcher-row ${s.id === activeId ? "active" : ""}" data-id="${obEsc(s.id)}">
      ${profileAvatarMarkup(s)}
      <div class="profile-switcher-row-info">
        <span class="profile-switcher-row-name">${obEsc(s.name) || "Unnamed"}${s.nickname ? ` <span class="profile-nickname">"${obEsc(s.nickname)}"</span>` : ""}</span>
        <span class="profile-switcher-row-meta">${s.code ? `${obEsc(s.lastResultDepth ? { short:"Quick Read", balanced:"Balanced", deep:"Deep Dive" }[s.lastResultDepth] || "" : "")}${s.pfVersion ? ` &bull; ${obEsc(s.pfVersion)}` : ""}` : "Not assessed yet"}</span>
      </div>
      ${s.id === activeId
        ? `<span class="tag profile-switcher-active-tag">Active</span>`
        : `<button class="btn btn-ghost btn-sm" data-action="switch">Switch</button>`}
      <button class="icon-btn profile-switcher-rename" data-action="rename" aria-label="Rename ${obEsc(s.name || "profile")}">${ICONS.edit || "&#9998;"}</button>
      <button class="icon-btn profile-switcher-delete" data-action="delete" aria-label="Delete ${obEsc(s.name || "profile")}">${ICONS.close}</button>
    </div>`).join("") : `<p style="color:var(--text-muted)">No profiles yet.</p>`;
  list.querySelectorAll("[data-action]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.closest("[data-id]")?.dataset.id;
      const summary = profiles.find(s => s.id === id);
      if (!id || !summary) return;
      if (btn.dataset.action === "switch") switchProfileFromModal(id);
      else if (btn.dataset.action === "rename") promptRenameProfile(id, summary.name || "");
      else if (btn.dataset.action === "delete") promptDeleteProfile(id, summary.name || "");
    });
  });
}
function onProfileSwitcherModalKey(e){
  if (e.key === "Escape"){ closeProfileSwitcherModal(); return; }
  if (e.key !== "Tab") return;
  cycleFocusTrap(e, document.getElementById("profileSwitcherModal"));
}
function closeProfileSwitcherModal(){
  const el = document.getElementById("profileSwitcherModal");
  if (el) el.remove();
  document.removeEventListener("keydown", onProfileSwitcherModalKey);
  restoreFocusTrigger();
}
function switchProfileFromModal(id){
  if (!switchToProfile(id)){ showToast("Couldn't switch to that profile."); return; }
  click(520);
  closeProfileSwitcherModal();
  renderProfile();
  showToast("Switched profile.");
}
function promptCreateNewProfile(){
  const name = (prompt("Name for the new profile (you can change this later):", "") || "").trim();
  createNewProfile(name);
  click(520);
  closeProfileSwitcherModal();
  goToNameScreen();
}
function promptRenameProfile(id, currentName){
  const name = prompt("Rename this profile:", currentName);
  if (name === null) return;
  renameProfile(id, name.trim());
  click(420);
  renderProfileSwitcherList();
  if (id === getActiveProfileId()) renderProfile();
}
function promptDeleteProfile(id, name){
  if (listProfiles().length <= 1){ showToast("This is the only profile on this device -- delete it from Privacy & Data instead if you want to start over."); return; }
  // Closed first, not stacked underneath: showDangerConfirm() is its own
  // focus-trapped modal, and this codebase's modal pattern (one keydown
  // listener per open overlay) was never designed for two trapping Tab/
  // Escape at once. Reopening after works fine since the list re-reads
  // live state each time.
  closeProfileSwitcherModal();
  showDangerConfirm(
    `Delete "${name || "this profile"}"?`,
    "Removes this profile and everything saved under it (history, journal, statistics) from this device. This can't be undone.",
    () => { deleteProfileById(id); renderProfile(); showToast("Profile deleted."); }
  );
}

/* ---------------- Edit Profile (v1.4) -------------------------------------
   Every onboarding-collected or identity field, editable after the fact,
   in one place -- same .modal-overlay/.modal-card chrome and focus-trap
   utilities (trapFocus helpers in global.js) as showDangerConfirm() and
   showPrivacyModal() already use, so this is the fourth caller of that
   shared pattern, not a new one. Writes straight through updateLocalProfile()
   (already existed, already handles persistence) -- no new storage path. */
function showEditProfileModal(){
  const profile = getLocalProfile();
  if (!profile) return;
  click(460);
  if (document.getElementById("editProfileModal")) return;
  const overlay = document.createElement("div");
  overlay.id = "editProfileModal";
  overlay.className = "modal-overlay";
  const genderOptions = ["", ...OB_GENDERS].map(g => `<option value="${obEsc(g)}" ${profile.gender===g?"selected":""}>${g||"Prefer not to say"}</option>`).join("");
  const ageOptions = ["", ...OB_AGE_GROUPS].map(a => `<option value="${obEsc(a)}" ${profile.ageGroup===a?"selected":""}>${a||"Not set"}</option>`).join("");
  overlay.innerHTML = `
    <div class="modal-card glass edit-profile-modal" role="dialog" aria-modal="true" aria-labelledby="editProfileTitle">
      <button class="icon-btn modal-close" onclick="closeEditProfileModal()" aria-label="Close">${ICONS.close}</button>
      <div class="eyebrow accent">EDIT PROFILE</div>
      <h3 id="editProfileTitle">Everything about you, in one place</h3>
      <p style="color:var(--text-muted);font-size:13.5px">Updates instantly. None of this affects your archetype or soul type -- retake the assessment for that.</p>
      <div class="edit-profile-grid">
        <div><label class="ns-label" for="editName">Name</label><input type="text" id="editName" class="ns-input ns-input-sm" maxlength="20" value="${obEsc(profile.name)}" placeholder="Add a name" /></div>
        <div><label class="ns-label" for="editNickname">Nickname</label><input type="text" id="editNickname" class="ns-input ns-input-sm" maxlength="20" value="${obEsc(profile.nickname)}" placeholder="What friends call you" /></div>
        <div><label class="ns-label" for="editPronouns">Pronouns</label><input type="text" id="editPronouns" class="ns-input ns-input-sm" maxlength="20" value="${obEsc(profile.pronouns)}" placeholder="e.g. she/her" /></div>
        <div><label class="ns-label" for="editBirthday">Birthday</label><input type="date" id="editBirthday" class="ns-input ns-input-sm" value="${obEsc(profile.birthday || "")}" /></div>
        <div><label class="ns-label" for="editAgeGroup">Age group</label><select id="editAgeGroup" class="ns-input ns-input-sm">${ageOptions}</select></div>
        <div><label class="ns-label" for="editGender">Gender</label><select id="editGender" class="ns-input ns-input-sm">${genderOptions}</select></div>
        <div><label class="ns-label" for="editLocation">Location</label><input type="text" id="editLocation" class="ns-input ns-input-sm" maxlength="30" value="${obEsc(profile.location)}" placeholder="City or country" /></div>
        <div><label class="ns-label" for="editOccupation">Occupation</label><input type="text" id="editOccupation" class="ns-input ns-input-sm" maxlength="30" value="${obEsc(profile.occupation)}" placeholder="What you do" /></div>
        <div><label class="ns-label" for="editFavoriteColor">Favorite color</label><input type="color" id="editFavoriteColor" class="ns-input ns-input-sm ns-input-color" value="${isSafeHexColor(profile.favoriteColor) ? profile.favoriteColor : "#7C3AED"}" /></div>
      </div>
      <div style="margin-top:12px"><label class="ns-label" for="editBio">Bio</label><textarea id="editBio" class="ns-input" maxlength="200" rows="3" placeholder="A couple sentences about you">${obEsc(profile.bio)}</textarea></div>
      <div class="cta-row" style="margin-top:14px">
        <button class="btn btn-ghost" onclick="closeEditProfileModal()">Cancel</button>
        <button class="btn btn-primary" onclick="saveEditProfileModal()">Save Changes</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  rememberFocusTrigger();
  requestAnimationFrame(() => { overlay.classList.add("open"); getFocusable(overlay)[0]?.focus(); });
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeEditProfileModal(); });
  document.addEventListener("keydown", onEditProfileModalKey);
}
function onEditProfileModalKey(e){
  if (e.key === "Escape"){ closeEditProfileModal(); return; }
  if (e.key !== "Tab") return;
  cycleFocusTrap(e, document.getElementById("editProfileModal"));
}
function closeEditProfileModal(){
  const el = document.getElementById("editProfileModal");
  if (el) el.remove();
  document.removeEventListener("keydown", onEditProfileModalKey);
  restoreFocusTrigger();
}
function saveEditProfileModal(){
  const val = (id) => document.getElementById(id)?.value || "";
  const name = val("editName").trim();
  updateLocalProfile({
    name, nameIsCustom: name.length > 0,
    nickname: val("editNickname").trim(),
    pronouns: val("editPronouns").trim(),
    birthday: val("editBirthday") || null,
    ageGroup: val("editAgeGroup"),
    gender: val("editGender"),
    location: val("editLocation").trim(),
    occupation: val("editOccupation").trim(),
    favoriteColor: isSafeHexColor(val("editFavoriteColor")) ? val("editFavoriteColor") : null,
    bio: val("editBio").trim().slice(0, 200),
  });
  closeEditProfileModal();
  click(460);
  showToast("Profile updated.");
  renderProfile();
}

function profileAvatarMarkup(profile, freshSoulHex){
  // Defense in depth: importProfile() already validates avatarImage/
  // soulHex before ever writing them to localStorage (see
  // sanitizeImportedLocalProfile() in engine.js), but this only ever
  // renders a value it has re-checked itself, in case that field got
  // into localStorage some other way.
  if (profile.avatarImage && isSafeAvatarDataUrl(profile.avatarImage)){
    return `<img src="${profile.avatarImage}" alt="" class="profile-avatar-img" width="${PROFILE_AVATAR_SIZE}" height="${PROFILE_AVATAR_SIZE}" />`;
  }
  const initial = (profile.name || "?").trim().charAt(0).toUpperCase() || "?";
  // profile.soulHex is only written at quiz-completion time and never
  // refreshed on its own -- callers that have already recomputed the
  // current soul pass its hex in here instead, so this stays in sync
  // with what the rest of the page shows for the same person.
  const hex = freshSoulHex || profile.soulHex;
  const bg = isSafeHexColor(hex) ? hex : "var(--accent)";
  return `<div class="profile-avatar-fallback" style="background:${bg}">${obEsc(initial)}</div>`;
}

function renderProfile(){
  setAccentColors();
  setPageTitle("Profile");
  const profile = getLocalProfile();

  if (!profile){
    root.innerHTML = `
      <div class="container">
        ${topBar(true)}
        <div class="eyebrow accent">PROFILE</div>
        <h2 aria-level="1" style="margin:10px 0 6px">No Local Profile Yet</h2>
        <p class="tagline" style="text-align:left;color:var(--text-muted)">Tap "Get Started" up top to create one, or just take the assessment, either one sets a profile up automatically, right here on this device. No account, no signup form.</p>
        <div class="cta-row" style="justify-content:flex-start;margin-top:18px">
          <button class="btn btn-primary" onclick="click(520);goToNameScreen()">Start Assessment &rarr;</button>
          <button class="btn btn-ghost" onclick="showGetStartedModal()">Create Profile</button>
        </div>
      </div>`;
    return;
  }

  const history = getActiveTimeline();
  const legacyHistory = getFullTimeline().filter(h => h.legacy);
  const retakeCount = history.length;
  const decoded0 = profile.code ? decodeCode(profile.code) : null;
  const decoded = decoded0 && !decoded0.obsolete ? decoded0 : null;
  const hasResult = !!decoded;
  // decoded.archetype and profile.soul are both stale the moment the
  // engine's scoring changes: decoded.archetype is whatever archIdx was
  // baked into the code at encode time, and profile.soul is only ever
  // written by ensureLocalProfile() on an actual quiz completion, never
  // refreshed just from viewing this page. Recomputing both fresh from
  // decoded.normDims means Profile can't drift from Growth/Home, which
  // already do the same (buildResultFromLatestTimeline).
  const archetype = decoded ? matchArchetype(decoded.normDims).primary : null;
  if (archetype) setAccentColors(archetype.colors[0], archetype.colors[1]);
  const soul = decoded ? computeSoulType(decoded.normDims) : null;
  const tagline = decoded ? computeIdentityTagline(decoded.normDims) : null;
  const progress = computeProgress(decoded ? decoded.normDims : null);
  const journalStreak = computeJournalStreak();
  const depthLabel = { short:"Quick Read", balanced:"Balanced", deep:"Deep Dive" }[profile.lastResultDepth] || null;
  const heroGlow = (soul && soul.hex) || profile.favoriteColor || "var(--accent)";

  root.innerHTML = `
    <div class="container">
      ${topBar(true)}
      <div class="eyebrow accent">YOUR PROFILE</div>
      <h2 aria-level="1" style="margin:10px 0 6px">Your Local Space in Forge</h2>
      <p class="tagline" style="text-align:left;color:var(--text-muted)">Everything here lives only on this device. There's no account behind it, and nothing here is sent anywhere.</p>

      <div class="card glass profile-hero profile-hero-v2" style="margin-top:18px;--hero-glow:${heroGlow}">
        <div class="profile-hero-row">
          <div class="profile-avatar-wrap profile-avatar-wrap-lg">
            ${profileAvatarMarkup(profile, soul ? soul.hex : null)}
          </div>
          <div class="profile-hero-info">
            <h3 aria-level="2">${obEsc(profile.name) || "Unnamed"}${profile.nickname ? ` <span class="profile-nickname">"${obEsc(profile.nickname)}"</span>` : ""}</h3>
            ${tagline ? `<p class="profile-tagline">${obEsc(tagline)}</p>` : ""}
            <p style="color:var(--text-muted);margin-top:2px">${hasResult ? `${archetype.icon} ${archetype.name} &bull; ${obEsc(soul ? soul.name : "")} Soul` : "Not assessed yet"}</p>
            ${hasResult ? `
            <div class="profile-badge-row">
              ${depthLabel ? `<span class="tag">${depthLabel}</span>` : ""}
              <span class="tag">${obEsc(profile.pfVersion || "")}</span>
              ${profile.updatedAt ? `<span class="tag">${new Date(profile.updatedAt).toLocaleDateString()}</span>` : ""}
            </div>` : ""}
          </div>
        </div>
        ${hasResult ? `
        <div class="profile-hero-stats">
          <div class="profile-stat"><span class="profile-stat-val count-up" data-target="${profile.confidencePct || 0}" data-suffix="%">0%</span><span class="profile-stat-label">Confidence</span></div>
          <div class="profile-stat"><span class="profile-stat-val count-up" data-target="${journalStreak.current}">0</span><span class="profile-stat-label">Day Streak</span></div>
          <div class="profile-stat"><span class="profile-stat-val count-up" data-target="${progress.level}">0</span><span class="profile-stat-label">Level</span></div>
        </div>` : ""}
        <div class="cta-row" style="margin-top:14px;flex-wrap:wrap">
          <button class="btn btn-ghost btn-sm" onclick="pickAvatar()">${profile.avatarImage ? "Change photo" : "Add photo"}</button>
          ${profile.avatarImage ? `<button class="btn btn-ghost btn-sm" onclick="removeAvatar()">Remove photo</button>` : ""}
          <button class="btn btn-ghost btn-sm" onclick="showEditProfileModal()">Edit Profile</button>
          <button class="btn btn-ghost btn-sm" onclick="showProfileSwitcherModal()">Profiles${listProfiles().length > 1 ? ` (${listProfiles().length})` : ""}</button>
          ${hasResult ? `<button class="btn btn-primary btn-sm" onclick="retakeAssessment()">Retake Assessment &rarr;</button>` : ""}
        </div>
      </div>

      ${!hasResult ? `
      <div class="card glass improve-checkin" style="margin-top:14px">
        <h4 aria-level="2">No Result on This Profile Yet</h4>
        <p>The rest of this page fills in the moment you take the assessment, archetype, soul type, growth history, all of it.</p>
        <div class="cta-row" style="margin-top:8px"><button class="btn btn-primary btn-sm" onclick="click(520);goToNameScreen()">Start Assessment &rarr;</button></div>
      </div>` : ""}

      <div class="card glass" style="margin-top:14px">
        <div class="progress-head">
          <div>
            <div class="eyebrow accent">LEVEL ${progress.level}</div>
            <h4 aria-level="2" style="margin-top:2px">${progress.title}</h4>
          </div>
          <div class="progress-xp">${progress.xp} XP</div>
        </div>
        <div class="stat-bar-track" style="margin-top:10px"><div class="stat-bar-fill" style="width:${progress.progressToNext}%"></div></div>
        <p style="margin-top:6px;font-size:12px;color:var(--text-dim)">${progress.nextLevelXp ? `${progress.nextLevelXp - progress.xp} XP to Level ${progress.level + 1}` : "Highest level reached"}</p>
        <p style="margin-top:8px;font-size:12.5px;color:var(--text-muted)">From ${progress.retakeCount} retake${progress.retakeCount===1?"":"s"}, ${progress.journalCount} journal entr${progress.journalCount===1?"y":"ies"}, and ${progress.achievementCount} unlocked trait${progress.achievementCount===1?"":"s"}.</p>
      </div>

      <div class="grid-2" style="margin-top:12px">
        <div class="card glass"><h4 aria-level="2">Retakes</h4><div class="ingot-name count-up" style="font-size:32px" data-target="${retakeCount}" data-suffix="">0</div><p style="color:var(--text-muted)">Total assessments on this device</p></div>
        <div class="card glass"><h4 aria-level="2">Match Confidence</h4><div class="ingot-name count-up" style="font-size:32px" data-target="${profile.confidencePct || 0}" data-suffix="%">0%</div><p style="color:var(--text-muted)">Most recent read</p></div>
      </div>
      <div class="grid-2" style="margin-top:12px">
        <div class="card glass"><h4 aria-level="2">Journal Streak</h4><div class="ingot-name count-up" style="font-size:32px" data-target="${journalStreak.current}" data-suffix="">0</div><p style="color:var(--text-muted)">Longest: ${journalStreak.longest} day${journalStreak.longest===1?"":"s"}</p></div>
        <div class="card glass"><h4 aria-level="2">Journal</h4><p style="margin-top:4px">${journalStreak.totalEntries} entr${journalStreak.totalEntries===1?"y":"ies"} logged.</p><div class="cta-row" style="margin-top:8px"><button class="btn btn-ghost btn-sm" onclick="click(380);navigate('journal')">Open Journal</button></div></div>
      </div>

      <div class="card glass" style="margin-top:12px">
        <h4 aria-level="2">Recent History</h4>
        ${history.length ? history.slice().reverse().slice(0, 5).map(h => `
          <div class="mini-bar-row"><span>${new Date(h.timestamp).toLocaleDateString()}</span><span>${h.archetype || ""}${h.soul ? ` &bull; ${h.soul}` : ""}</span></div>`).join("")
          : `<p>No history yet.</p>`}
        <div class="careers-toggle"><button onclick="click(380);navigate('growth')">See full Growth page</button></div>
      </div>

      <div class="grid-2" style="margin-top:12px">
        <div class="card glass"><h4 aria-level="2">Compare</h4><p>See how you and someone else line up.</p><div class="cta-row" style="margin-top:8px"><button class="btn btn-ghost btn-sm" onclick="click(380);navigate('compare')">Compare Two</button><button class="btn btn-ghost btn-sm" onclick="click(380);navigate('party')">Party Compare</button></div></div>
        <div class="card glass"><h4 aria-level="2">Improve</h4><p>Suggestions built around your actual result.</p><div class="cta-row" style="margin-top:8px"><button class="btn btn-ghost btn-sm" onclick="click(380);navigate('improve')">Open Improve</button></div></div>
      </div>
      <div class="grid-2" style="margin-top:12px">
        <div class="card glass"><h4 aria-level="2">Frameworks</h4><p>MBTI, Big Five, DISC, and Enneagram, unpacked in full.</p><div class="cta-row" style="margin-top:8px"><button class="btn btn-ghost btn-sm" onclick="click(380);navigate('frameworks')">Open Frameworks</button></div></div>
        <div class="card glass"><h4 aria-level="2">Groups</h4><p>Saved party rosters for people you compare often.</p><div class="cta-row" style="margin-top:8px"><button class="btn btn-ghost btn-sm" onclick="click(380);navigate('party')">Manage Groups</button></div></div>
      </div>

      <div class="card glass" style="margin-top:12px">
        <h4 aria-level="2">Privacy &amp; Data</h4>
        <p style="color:var(--text-muted)">Everything below acts only on this device. ${legacyHistory.length ? `${legacyHistory.length} legacy result${legacyHistory.length===1?"":"s"} archived from an earlier PersonaForge.` : "No legacy results on this device."}</p>
        <div class="cta-row" style="margin-top:8px;flex-wrap:wrap">
          <button class="btn btn-ghost btn-sm" onclick="confirmResetOnboarding()">Reset Onboarding</button>
        </div>
        <div class="cta-row" style="margin-top:8px;flex-wrap:wrap">
          <button class="btn btn-ghost btn-sm danger" onclick="confirmDeletePF4History()">Delete PF4 Assessment History</button>
          <button class="btn btn-ghost btn-sm danger" onclick="confirmDeleteLegacyResults()">Delete Archived Legacy Results</button>
        </div>
        <div class="cta-row" style="margin-top:8px;flex-wrap:wrap">
          <button class="btn btn-ghost btn-sm danger" onclick="confirmDeleteLocalProfile()">Delete Local Profile</button>
          <button class="btn btn-primary btn-sm danger" onclick="confirmDeleteEverything()">Delete Everything</button>
        </div>
      </div>

      <div class="card glass profile-files-card" style="margin-top:12px">
        <div class="eyebrow accent">SAVE FILES</div>
        <h4 aria-level="2" style="margin-top:2px">Profiles are save files</h4>
        <p style="color:var(--text-muted)">Create a new profile, switch between saved ones, or move a profile in and out as a .pf file. Everything stays on this device; nothing touches a server.</p>
        <div class="profile-files-grid">
          <button class="btn btn-primary btn-sm" onclick="promptCreateNewProfile()">+ New Profile</button>
          <button class="btn btn-ghost btn-sm" onclick="showProfileSwitcherModal()">Switch Profile</button>
          <button class="btn btn-ghost btn-sm" onclick="exportProfile()">Export Persona (.pf)</button>
          <button class="btn btn-ghost btn-sm" onclick="importProfile()">Import Persona (.pf)</button>
          ${hasResult ? `<button class="btn btn-ghost btn-sm" onclick="copyProfileShareCode()">Copy Share Code</button>` : `<button class="btn btn-ghost btn-sm" disabled title="Take the assessment first">Copy Share Code</button>`}
          ${hasResult ? `<button class="btn btn-ghost btn-sm" onclick="viewMyLastResult()">Generate QR</button>` : `<button class="btn btn-ghost btn-sm" disabled title="Take the assessment first">Generate QR</button>`}
        </div>
      </div>

      <div class="card glass" style="margin-top:12px">
        <h4 aria-level="2">Settings</h4>
        <div class="mini-bar-row"><span>Theme</span><button class="btn btn-ghost btn-sm" onclick="toggleTheme();renderProfile()">${currentTheme === "light" ? "Switch to dark" : "Switch to light"}</button></div>
        <div class="mini-bar-row"><span>Sound</span><button class="btn btn-ghost btn-sm" onclick="toggleSound();renderProfile()">${soundOn ? "Turn off" : "Turn on"}</button></div>
      </div>

      <div class="card glass" style="margin-top:12px;text-align:center">
        <h4 aria-level="2">About Forge</h4>
        <p style="color:var(--text-muted)">Local-first, no account, no server. Your data never leaves this device unless you export it yourself.</p>
        <div class="cta-row" style="justify-content:center;margin-top:8px">
          <a class="btn btn-ghost btn-sm" href="legal.html">Terms &amp; Credits</a>
          <button class="btn btn-ghost btn-sm" onclick="showPrivacyModal()">Privacy</button>
        </div>
      </div>
    </div>
  `;
  initCountUps(root);
}

/* =========================================================================
   PRIVACY & DATA (Profile page)
   Every action below is local-only (no account, nothing to sync), but
   several are destructive and irreversible, so each one confirms first
   through one shared modal rather than a bare browser confirm() dialog —
   same .modal-overlay/.modal-card chrome showPrivacyModal() already uses,
   just with a destructive-styled confirm button instead of "Got it".
   ========================================================================= */
function showDangerConfirm(title, message, onConfirm){
  click(460);
  if (document.getElementById("dangerModal")) return;
  const overlay = document.createElement("div");
  overlay.id = "dangerModal";
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <div class="modal-card glass" role="dialog" aria-modal="true" aria-labelledby="dangerModalTitle">
      <button class="icon-btn modal-close" onclick="closeDangerConfirm()" aria-label="Close">${ICONS.close}</button>
      <div class="eyebrow accent">ARE YOU SURE?</div>
      <h3 id="dangerModalTitle">${obEsc(title)}</h3>
      <p>${obEsc(message)}</p>
      <div class="cta-row" style="margin-top:6px">
        <button class="btn btn-ghost" onclick="closeDangerConfirm()">Cancel</button>
        <button class="btn btn-primary danger" id="dangerModalConfirmBtn">Yes, do it</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  rememberFocusTrigger();
  requestAnimationFrame(() => { overlay.classList.add("open"); getFocusable(overlay)[0]?.focus(); });
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeDangerConfirm(); });
  document.addEventListener("keydown", onDangerModalKey);
  document.getElementById("dangerModalConfirmBtn").onclick = () => { closeDangerConfirm(); onConfirm(); };
}
function onDangerModalKey(e){
  if (e.key === "Escape"){ closeDangerConfirm(); return; }
  if (e.key !== "Tab") return;
  cycleFocusTrap(e, document.getElementById("dangerModal"));
}
function closeDangerConfirm(){
  const el = document.getElementById("dangerModal");
  if (el) el.remove();
  document.removeEventListener("keydown", onDangerModalKey);
  restoreFocusTrigger();
}

function confirmDeletePF4History(){
  showDangerConfirm(
    "Delete PF4 assessment history?",
    "Removes every PF4 result on this device (history, growth, and comparisons). Your local profile and any archived legacy results are kept. This can't be undone.",
    deletePF4History
  );
}
function deletePF4History(){
  try{
    const history = getFullTimeline();
    const legacyOnly = history.filter(h => h.legacy);
    localStorage.setItem("pf_history", JSON.stringify(legacyOnly));
    const p = getLocalProfile();
    if (p){ updateLocalProfile({ code: null, archetypeId: null, archetypeName: null, archetypeIcon: null, soul: null, soulHex: null, confidencePct: null, assessmentHistory: [], statistics: { totalAssessments: 0, firstAssessmentAt: null, lastAssessmentAt: null } }); }
    localStorage.removeItem("pf_last_code");
  } catch(e){ /* ignore */ }
  showToast("PF4 assessment history deleted.");
  renderProfile();
}

function confirmDeleteLegacyResults(){
  showDangerConfirm(
    "Delete archived legacy results?",
    "Permanently removes results from an earlier PersonaForge that were kept as Legacy. Your current PF4 history is not affected. This can't be undone.",
    deleteLegacyResults
  );
}
function deleteLegacyResults(){
  try{
    const active = getActiveTimeline();
    localStorage.setItem("pf_history", JSON.stringify(active));
  } catch(e){ /* ignore */ }
  showToast("Archived legacy results deleted.");
  renderProfile();
}

function confirmDeleteLocalProfile(){
  showDangerConfirm(
    "Delete local profile?",
    "Removes your name, avatar, and profile settings from this device. Your assessment history is kept, and a new anonymous profile will be created automatically next time it's needed. This can't be undone.",
    deleteLocalProfileOnly
  );
}
function deleteLocalProfileOnly(){
  try{ localStorage.removeItem(PF_PROFILE_KEY); } catch(e){ /* ignore */ }
  showToast("Local profile deleted.");
  navigate("home");
}

function confirmDeleteEverything(){
  showDangerConfirm(
    "Delete everything?",
    "Permanently deletes your profile, all PF4 and legacy history, preferences, journal, saved groups, and any in-progress assessment. PersonaForge will restart as if it were just installed. This can't be undone.",
    deleteEverything
  );
}
function deleteEverything(){
  try{
    ["pf_local_profile","pf_history","pf_last_code","pf_quiz_progress","pf_onboarding_progress",
     "pf_journal_entries","pf_groups","pf_suggestion_feedback","pf_improve_checkin",
     "pf_theme","pf_sound"].forEach(k => localStorage.removeItem(k));
    sessionStorage.clear();
  } catch(e){ /* ignore */ }
  location.href = "index.html";
}

function confirmResetOnboarding(){
  showDangerConfirm(
    "Reset onboarding?",
    "Clears any in-progress name/about-you/depth setup so the next assessment starts fresh from step one. Your existing profile and history are not affected.",
    resetOnboardingOnly
  );
}
function resetOnboardingOnly(){
  try{ clearOnboardingProgress(); clearQuizProgress(); } catch(e){ /* ignore */ }
  showToast("Onboarding reset. Your next assessment starts fresh.");
}
