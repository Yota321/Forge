/* =========================================================================
   FORGE - GLOBAL UI CHROME
   Theme + sound, shared motion utilities, nav/top-bar, toasts, privacy
   modal, the QR generator, and the premium scrollbar. Loaded on every
   page after engine.js and before that page's own script.
   ========================================================================= */

// Generic HTML-escaping for any user-entered string (names, occupations,
// pasted codes, ...) dropped into a template literal. Lives here rather
// than in one page's own file because it's used well beyond onboarding —
// result.js, compatibility.js, compare.js, and home.js all escape a name
// with it too, and every page loads global.js.
function obEsc(str){
  return String(str == null ? "" : str).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

// Shared onboarding option lists -- moved here from quiz.js (v1.4) so
// Profile's Edit Profile section can reuse the exact same options
// without a second, driftable copy; quiz.js still reads these by the
// same names, unchanged, since global.js loads before it on every page.
const OB_AGE_GROUPS = ["Under 18", "18–24", "25–34", "35–44", "45–54", "55+"];
const OB_GENDERS = ["Male", "Female", "Non-binary", "Prefer not to say"];
const OB_REASONS = ["Learn about myself", "Compare with someone", "Personal growth", "Just curious"];

/* =========================================================================
   PERSONAFORGE, MINI QR ENCODER
   A from-scratch QR code generator (no external library, per the
   zero-dependency requirement). Supports byte-mode encoding, error
   correction level L, versions 1 through 5 (up to 108 bytes of data,
   comfortably more than a PersonaForge share URL needs). Implements the
   ISO/IEC 18004 structure: Reed-Solomon error correction over GF(256),
   finder/timing/alignment/dark-module placement, zigzag data placement,
   all 8 mask patterns scored by the standard 4 penalty rules, and BCH
   format-info encoding.
   Renders straight to a <canvas>, nothing here touches the DOM until
   drawQR() is called.
   ========================================================================= */

const QR = (function(){

  /* ---- GF(256) tables, primitive polynomial 0x11D ---------------------- */
  const GF_EXP = new Array(512);
  const GF_LOG = new Array(256);
  (function buildTables(){
    let x = 1;
    for (let i = 0; i < 255; i++){
      GF_EXP[i] = x;
      GF_LOG[x] = i;
      x <<= 1;
      if (x & 0x100) x ^= 0x11D;
    }
    for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255];
  })();
  function gfMul(a, b){
    if (a === 0 || b === 0) return 0;
    return GF_EXP[GF_LOG[a] + GF_LOG[b]];
  }

  /* ---- Reed-Solomon generator polynomial and encoding ------------------- */
  function buildGenerator(ecCount){
    let poly = [1];
    for (let i = 0; i < ecCount; i++){
      const term = [1, GF_EXP[i]];
      const next = new Array(poly.length + 1).fill(0);
      for (let a = 0; a < poly.length; a++){
        for (let b = 0; b < term.length; b++){
          next[a + b] ^= gfMul(poly[a], term[b]);
        }
      }
      poly = next;
    }
    return poly;
  }
  function rsEncode(dataBytes, ecCount){
    const generator = buildGenerator(ecCount);
    const remainder = dataBytes.slice();
    for (let i = 0; i < dataBytes.length; i++) remainder.push(0);
    for (let i = 0; i < dataBytes.length; i++){
      const coef = remainder[i];
      if (coef === 0) continue;
      for (let j = 0; j < generator.length; j++){
        remainder[i + j] ^= gfMul(generator[j], coef);
      }
    }
    return remainder.slice(dataBytes.length, dataBytes.length + ecCount);
  }

  /* ---- Version capacity table, ECC level L, single block ---------------- */
  const VERSIONS = [
    { v:1, size:21, dataCodewords:19, ecCodewords:7 },
    { v:2, size:25, dataCodewords:34, ecCodewords:10, align:18 },
    { v:3, size:29, dataCodewords:55, ecCodewords:15, align:22 },
    { v:4, size:33, dataCodewords:80, ecCodewords:20, align:26 },
    { v:5, size:37, dataCodewords:108, ecCodewords:26, align:30 },
  ];

  function pickVersion(byteLength){
    // 4 bits mode + 8 bits count indicator + 8*len data, needs to fit with
    // room for the terminator inside the version's data codeword capacity.
    for (const ver of VERSIONS){
      const capacityBits = ver.dataCodewords * 8;
      const neededBits = 4 + 8 + byteLength * 8;
      if (neededBits <= capacityBits) return ver;
    }
    return null; // caller should shorten the payload
  }

  /* ---- Bit buffer build (byte mode) -------------------------------------- */
  function buildDataCodewords(text, ver){
    const bytes = Array.from(new TextEncoder().encode(text));
    const bits = [];
    const pushBits = (val, len) => { for (let i = len - 1; i >= 0; i--) bits.push((val >> i) & 1); };
    pushBits(0b0100, 4);           // byte mode indicator
    pushBits(bytes.length, 8);     // character count (versions 1-9)
    bytes.forEach(b => pushBits(b, 8));

    const capacityBits = ver.dataCodewords * 8;
    const termLen = Math.min(4, capacityBits - bits.length);
    for (let i = 0; i < termLen; i++) bits.push(0);
    while (bits.length % 8 !== 0) bits.push(0);

    const codewords = [];
    for (let i = 0; i < bits.length; i += 8){
      let byte = 0;
      for (let j = 0; j < 8; j++) byte = (byte << 1) | bits[i + j];
      codewords.push(byte);
    }
    const padBytes = [0xEC, 0x11];
    let p = 0;
    while (codewords.length < ver.dataCodewords){
      codewords.push(padBytes[p % 2]);
      p++;
    }
    return codewords;
  }

  function bytesToBits(bytes){
    const bits = [];
    bytes.forEach(b => { for (let i = 7; i >= 0; i--) bits.push((b >> i) & 1); });
    return bits;
  }

  /* ---- Matrix construction ------------------------------------------------ */
  function makeEmptyGrid(size){
    return Array.from({ length: size }, () => new Array(size).fill(0));
  }
  function makeReservedGrid(size){
    return Array.from({ length: size }, () => new Array(size).fill(false));
  }

  function placeFinder(matrix, reserved, r0, c0){
    for (let r = -1; r <= 7; r++){
      for (let c = -1; c <= 7; c++){
        const R = r0 + r, C = c0 + c;
        if (R < 0 || C < 0 || R >= matrix.length || C >= matrix.length) continue;
        reserved[R][C] = true;
        const inCore = r >= 0 && r <= 6 && c >= 0 && c <= 6;
        if (!inCore){ matrix[R][C] = 0; continue; }
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        matrix[R][C] = (isBorder || isCenter) ? 1 : 0;
      }
    }
  }
  function placeAlignment(matrix, reserved, r0, c0){
    for (let r = -2; r <= 2; r++){
      for (let c = -2; c <= 2; c++){
        const R = r0 + r, C = c0 + c;
        reserved[R][C] = true;
        const isBorder = r === -2 || r === 2 || c === -2 || c === 2;
        const isCenter = r === 0 && c === 0;
        matrix[R][C] = (isBorder || isCenter) ? 1 : 0;
      }
    }
  }
  function placeTiming(matrix, reserved, size){
    for (let i = 8; i < size - 8; i++){
      if (!reserved[6][i]){ matrix[6][i] = i % 2 === 0 ? 1 : 0; reserved[6][i] = true; }
      if (!reserved[i][6]){ matrix[i][6] = i % 2 === 0 ? 1 : 0; reserved[i][6] = true; }
    }
  }
  function reserveFormatAreas(reserved, size){
    for (let i = 0; i <= 8; i++){ reserved[8][i] = true; reserved[i][8] = true; }
    for (let i = 0; i < 8; i++){ reserved[8][size - 1 - i] = true; reserved[size - 1 - i][8] = true; }
  }

  const MASKS = [
    (r,c) => (r + c) % 2 === 0,
    (r,c) => r % 2 === 0,
    (r,c) => c % 3 === 0,
    (r,c) => (r + c) % 3 === 0,
    (r,c) => (Math.floor(r/2) + Math.floor(c/3)) % 2 === 0,
    (r,c) => ((r*c) % 2) + ((r*c) % 3) === 0,
    (r,c) => (((r*c) % 2) + ((r*c) % 3)) % 2 === 0,
    (r,c) => (((r+c) % 2) + ((r*c) % 3)) % 2 === 0,
  ];

  function placeData(matrix, reserved, size, dataBits){
    let bitIndex = 0;
    let row = size - 1;
    let col = size - 1;
    let dirUp = true;
    while (col > 0){
      if (col === 6) col = 5;
      // eslint-disable-next-line no-constant-condition
      while (true){
        for (let cc = 0; cc < 2; cc++){
          const c = col - cc;
          if (!reserved[row][c]){
            const bit = bitIndex < dataBits.length ? dataBits[bitIndex] : 0;
            matrix[row][c] = bit;
            bitIndex++;
          }
        }
        if (dirUp){
          if (row === 0){ dirUp = false; break; }
          row--;
        } else {
          if (row === size - 1){ dirUp = true; break; }
          row++;
        }
      }
      col -= 2;
    }
  }

  function applyMask(matrix, reserved, size, maskFn){
    const out = makeEmptyGrid(size);
    for (let r = 0; r < size; r++){
      for (let c = 0; c < size; c++){
        out[r][c] = reserved[r][c] ? matrix[r][c] : (matrix[r][c] ^ (maskFn(r,c) ? 1 : 0));
      }
    }
    return out;
  }

  function penalty(matrix, size){
    let score = 0;
    // Rule 1: runs of 5+ same color, rows then columns
    for (let r = 0; r < size; r++){
      let run = 1;
      for (let c = 1; c < size; c++){
        if (matrix[r][c] === matrix[r][c-1]) run++;
        else { if (run >= 5) score += 3 + (run - 5); run = 1; }
      }
      if (run >= 5) score += 3 + (run - 5);
    }
    for (let c = 0; c < size; c++){
      let run = 1;
      for (let r = 1; r < size; r++){
        if (matrix[r][c] === matrix[r-1][c]) run++;
        else { if (run >= 5) score += 3 + (run - 5); run = 1; }
      }
      if (run >= 5) score += 3 + (run - 5);
    }
    // Rule 2: 2x2 blocks
    for (let r = 0; r < size - 1; r++){
      for (let c = 0; c < size - 1; c++){
        const v = matrix[r][c];
        if (v === matrix[r][c+1] && v === matrix[r+1][c] && v === matrix[r+1][c+1]) score += 3;
      }
    }
    // Rule 3: finder-like 1:1:3:1:1 patterns with 4-module light run
    const patternA = [1,0,1,1,1,0,1,0,0,0,0];
    const patternB = [0,0,0,0,1,0,1,1,1,0,1];
    const matchAt = (arr, start, pattern) => {
      for (let i = 0; i < pattern.length; i++) if (arr[start+i] !== pattern[i]) return false;
      return true;
    };
    for (let r = 0; r < size; r++){
      const row = matrix[r];
      for (let c = 0; c <= size - 11; c++){
        if (matchAt(row, c, patternA) || matchAt(row, c, patternB)) score += 40;
      }
    }
    for (let c = 0; c < size; c++){
      const col = matrix.map(row => row[c]);
      for (let r = 0; r <= size - 11; r++){
        if (matchAt(col, r, patternA) || matchAt(col, r, patternB)) score += 40;
      }
    }
    // Rule 4: dark/light balance
    let dark = 0;
    for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (matrix[r][c]) dark++;
    const percent = (dark / (size*size)) * 100;
    const deviation = Math.floor(Math.abs(percent - 50) / 5);
    score += deviation * 10;
    return score;
  }

  /* ---- BCH format info ---------------------------------------------------- */
  function bchFormat(data5){
    let d = data5 << 10;
    const g = 0b10100110111; // generator, degree 10
    for (let i = 14; i >= 10; i--){
      if ((d >> i) & 1) d ^= (g << (i - 10));
    }
    const format = (data5 << 10) | d;
    return format ^ 0b101010000010010;
  }
  function placeFormatInfo(matrix, size, maskId){
    const eccBits = 0b01; // level L
    const data5 = (eccBits << 3) | maskId;
    const format = bchFormat(data5);
    const bit = i => (format >> i) & 1;
    for (let i = 0; i <= 5; i++) matrix[i][8] = bit(i);
    matrix[7][8] = bit(6);
    matrix[8][8] = bit(7);
    matrix[8][7] = bit(8);
    for (let i = 9; i <= 14; i++) matrix[8][14 - i] = bit(i);
    for (let i = 0; i <= 7; i++) matrix[8][size - 1 - i] = bit(i);
    for (let i = 8; i <= 14; i++) matrix[size - 15 + i][8] = bit(i);
    matrix[size - 8][8] = 1; // dark module
  }

  /* ---- Top-level encode: text -> boolean matrix --------------------------- */
  function encode(text){
    const byteLen = new TextEncoder().encode(text).length;
    const ver = pickVersion(byteLen);
    if (!ver) return null;
    const dataCodewords = buildDataCodewords(text, ver);
    const ecCodewords = rsEncode(dataCodewords, ver.ecCodewords);
    const allCodewords = dataCodewords.concat(ecCodewords);
    const dataBits = bytesToBits(allCodewords);

    const size = ver.size;
    const matrix = makeEmptyGrid(size);
    const reserved = makeReservedGrid(size);

    placeFinder(matrix, reserved, 0, 0);
    placeFinder(matrix, reserved, 0, size - 7);
    placeFinder(matrix, reserved, size - 7, 0);
    if (ver.align){
      // The QR spec's alignment coordinate table lists candidate
      // positions (e.g. {6, 18} for version 2); for versions 2-5 (one
      // extra alignment pattern each) the only combination that doesn't
      // land on a finder pattern is (align, align), so that single
      // stored coordinate is used for both row and column here.
      placeAlignment(matrix, reserved, ver.align, ver.align);
    }
    placeTiming(matrix, reserved, size);
    reserveFormatAreas(reserved, size);
    reserved[size - 8][8] = true; // dark module cell

    placeData(matrix, reserved, size, dataBits);

    let best = null, bestScore = Infinity, bestMaskId = 0;
    for (let m = 0; m < MASKS.length; m++){
      const masked = applyMask(matrix, reserved, size, MASKS[m]);
      placeFormatInfo(masked, size, m);
      const score = penalty(masked, size);
      if (score < bestScore){ bestScore = score; best = masked; bestMaskId = m; }
    }
    return { matrix: best, size, version: ver.v, maskId: bestMaskId };
  }

  /* ---- Render to canvas ---------------------------------------------------- */
  function drawToCanvas(canvas, text, options){
    const result = encode(text);
    if (!result) return false;
    const opts = options || {};
    const scale = opts.scale || 8;
    const margin = opts.margin != null ? opts.margin : 4;
    const dark = opts.dark || "#0F1117";
    const light = opts.light || "#F8FAFC";
    const size = result.size;
    const total = size + margin * 2;
    canvas.width = total * scale;
    canvas.height = total * scale;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = light;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = dark;
    for (let r = 0; r < size; r++){
      for (let c = 0; c < size; c++){
        if (result.matrix[r][c]){
          ctx.fillRect((c + margin) * scale, (r + margin) * scale, scale, scale);
        }
      }
    }
    return true;
  }

  return {
    encode, drawToCanvas, pickVersion,
    _internal: { makeEmptyGrid, makeReservedGrid, placeFinder, placeAlignment, placeTiming,
      reserveFormatAreas, VERSIONS, GF_EXP, GF_LOG, gfMul, rsEncode, buildGenerator,
      bchFormat, MASKS },
  };
})();






/* =========================================================================
   PERSONAFORGE, APP MODULE
   Renders every screen into #app. No framework, no build step.
   ========================================================================= */

const root = document.getElementById("app");
let soundOn = localStorage.getItem("pf_sound") !== "off";
let currentTheme = localStorage.getItem("pf_theme") === "light" ? "light" : "dark";

/* ---------------- theme (light / dark) ------------------------------------
   Dark is the default since that's the theme that's been built and
   refined so far, but light mode is fully implemented too. Switching is
   instant via a CSS attribute (everything else uses CSS custom
   properties so it repaints on its own), except canvas-drawn pixels
   (radar chart, QR code) which need an explicit redraw since their
   colors are baked in at draw time, not read live from CSS. */
function applyTheme(theme){
  currentTheme = theme;
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("pf_theme", theme);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "light" ? "#FFFFFF" : "#0F1117");
}
let themeScanTransition = null;
function toggleTheme(){
  // A click while the previous scan is still playing would call
  // startViewTransition() again before the first transition has settled.
  // Chromium responds by rejecting the in-flight transition's `ready`
  // promise with InvalidStateError ("Transition was aborted because of
  // invalid state") -- and since nothing held a reference to it, that
  // rejection went unhandled. Ignoring re-entrant clicks until the current
  // scan finishes avoids the overlap instead of just swallowing the error.
  if (themeScanTransition) return;
  const next = currentTheme === "light" ? "dark" : "light";
  const applyAndRefresh = () => {
    applyTheme(next);
    // Result's Sins & Virtues canvas and Compare's two radar canvases are
    // the only pixels in the app with theme-dependent colors baked in at
    // draw time rather than read live from CSS (see redrawResultCanvasesForTheme()
    // in result.js and redrawCompareCanvasesForTheme() in compatibility.js
    // for exactly which canvases and why). Everything else, including the
    // Mind Map radar (SVG, not canvas) and the QR code (theme-independent
    // black/white), repaints on its own via CSS custom properties, so
    // toggling theme there never interrupts what the person is doing
    // (e.g. mid-quiz). Guarded by typeof since only one of these two
    // functions exists on any given page, if either does at all.
    if (typeof redrawResultCanvasesForTheme === "function") redrawResultCanvasesForTheme();
    else if (typeof redrawCompareCanvasesForTheme === "function") redrawCompareCanvasesForTheme();
    updateThemeIcon();
    updateBrandLogo();
  };
  click(300);
  // The bottom-to-top scan is built on the View Transitions API: it
  // snapshots the page before/after the DOM change below and lets us
  // reveal the "after" snapshot with a custom clip-path animation (see
  // the ::view-transition-new(root) keyframes) instead of the browser's
  // default cross-fade. No polyfill or manual DOM cloning needed, but
  // it's Chromium-only today — Safari/Firefox and reduced-motion simply
  // keep the previous instant-ish CSS-transition swap, which is a fine
  // degradation since the scan is a delight-on-top, not a requirement.
  if (reducedMotion() || typeof document.startViewTransition !== "function"){
    document.body.classList.add("theme-transitions");
    applyAndRefresh();
    return;
  }
  themeScanTransition = document.startViewTransition(applyAndRefresh);
  // `ready` can still reject for reasons outside our control (e.g. the tab
  // being hidden mid-scan) even with the re-entrancy guard above, so it
  // needs its own handler rather than being left to reject unheard.
  themeScanTransition.ready.catch(() => {});
  themeScanTransition.finished.finally(() => { themeScanTransition = null; });
}
function updateThemeIcon(){
  const item = document.getElementById("navThemeItem");
  if (item) item.innerHTML = `${currentTheme === "light" ? ICONS.moon : ICONS.sun}<span>${currentTheme === "light" ? "Dark mode" : "Light mode"}</span>`;
}
// Each page's own authored <title> (e.g. index.html's keyword-bearing
// "PersonaForge, Discover. Compare. Evolve.") was being overwritten to a
// bare "Forge" on every no-argument call -- which is what Home calls --
// so search engines and browser tabs/history never saw the real title
// once JS ran. Capturing it once at load restores it for those calls.
const AUTHORED_TITLE = document.title || "Forge";
function setPageTitle(suffix){
  document.title = suffix ? `Forge \u2022 ${suffix}` : AUTHORED_TITLE;
}

function updateBrandLogo(){
  const path = currentTheme === "light" ? "assets/Logo_black.svg" : "assets/Logo_white.svg";
  const navLogo = document.getElementById("navLogo");
  if (navLogo) navLogo.src = path;
  const footerLogo = document.getElementById("lpFooterLogo");
  if (footerLogo) footerLogo.src = path;
}

/* ---------------- tiny sound (optional, WebAudio, no assets) ---------- */
let audioCtx = null;
function click(freq = 440, dur = 0.045){
  if (!soundOn) return;
  try{
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
    o.frequency.value = freq; o.type = "sine";
    g.gain.setValueAtTime(0.05, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
    o.connect(g); g.connect(audioCtx.destination);
    o.start(); o.stop(audioCtx.currentTime + dur);
  } catch(e){ /* audio unsupported, fail silently */ }
}

/* ---------------- background music -------------------------------------
   BG.mp3 lives in the assets folder, loaded via
   the <audio id="bgMusic"> element outside #app so it keeps playing
   across every screen re-render instead of restarting. The same speaker
   icon that mutes the tiny click sounds controls this too. Browsers
   block audio autoplay until a real user gesture, so playback is
   attempted on the first interaction anywhere on the page, once. */
const bgMusic = document.getElementById("bgMusic");
if (bgMusic){
  bgMusic.volume = 0.35;
  bgMusic.addEventListener("error", () => {
    // assets/BG.mp3 missing or failed to load: fail silently, never break the app
  });
  const startMusicOnce = () => {
    if (!soundOn){ document.removeEventListener("pointerdown", startMusicOnce); return; }
    bgMusic.play().then(() => {
      document.removeEventListener("pointerdown", startMusicOnce);
    }).catch(() => {
      // Autoplay genuinely blocked even after a real gesture (happens on
      // some mobile browsers with stricter policies). Show a visible,
      // dismissible prompt instead of failing silently with no way for
      // the person to know why there's no sound.
      showAudioPrompt();
    });
  };
  document.addEventListener("pointerdown", startMusicOnce);
}
function showAudioPrompt(){
  if (document.getElementById("audioPrompt")) return;
  const el = document.createElement("button");
  el.id = "audioPrompt";
  el.className = "audio-prompt";
  el.textContent = "Tap anywhere to enable audio";
  el.onclick = retryAudioPrompt;
  document.body.appendChild(el);
  document.addEventListener("pointerdown", retryAudioPrompt);
}
function retryAudioPrompt(){
  if (!bgMusic || !soundOn) return;
  bgMusic.play().then(() => {
    const el = document.getElementById("audioPrompt");
    if (el) el.remove();
    document.removeEventListener("pointerdown", retryAudioPrompt);
  }).catch(() => {});
}

/* ---------------- decorative venetian blind bars ----------------------*/
/* ---------------- micro-interactions -------------------------------------*/
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function animateCountUp(el, target, duration){
  if (reducedMotion() || !el){ if (el) el.textContent = target + (el.dataset.suffix || ""); return; }
  const start = performance.now();
  const suffix = el.dataset.suffix || "";
  function tick(now){
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(target * eased) + suffix;
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
function initCountUps(container){
  (container || document).querySelectorAll(".count-up[data-target]").forEach(el => {
    const target = parseFloat(el.dataset.target);
    if (Number.isNaN(target)) return;
    animateCountUp(el, target, 900 + Math.random() * 300);
  });
}

function setupProgressiveReveal(container){
  if (reducedMotion()){
    (container || document).querySelectorAll(".section").forEach(s => s.classList.add("revealed"));
    return;
  }
  const sections = (container || document).querySelectorAll(".section");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add("revealed");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
  sections.forEach(s => observer.observe(s));
}

function fireConfetti(){
  if (reducedMotion()) return;
  const colors = ["#A78BFA", "#7DD3FC", "#6EE7B7", "#FDBA74", "#FACC15"];
  const layer = document.createElement("div");
  layer.className = "confetti-layer";
  document.body.appendChild(layer);
  const count = 46;
  for (let i = 0; i < count; i++){
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = (45 + Math.random() * 10) + "%";
    piece.style.background = colors[i % colors.length];
    piece.style.setProperty("--dx", (Math.random() * 2 - 1) * 220 + "px");
    piece.style.setProperty("--rot", (Math.random() * 720 - 360) + "deg");
    piece.style.animationDelay = (Math.random() * 0.15) + "s";
    piece.style.animationDuration = (1.1 + Math.random() * 0.6) + "s";
    layer.appendChild(piece);
  }
  setTimeout(() => layer.remove(), 2200);
}

/* ---------------- per-archetype accent theming ---------------------------
   Buttons, graphs, gradients and glows subtly shift to match the current
   person's own archetype colors on the result page, and reset to the
   default lavender/sky brand colors everywhere else. */
function setAccentColors(c1, c2){
  document.documentElement.style.setProperty("--user-accent-1", c1 || "#A78BFA");
  document.documentElement.style.setProperty("--user-accent-2", c2 || "#7DD3FC");
}

function spawnAmbience(){
  const layer = document.getElementById("embers");
  if (!layer || layer.dataset.done) return;
  layer.dataset.done = "1";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;
  const orbColors = [
    "radial-gradient(circle, #A78BFA, transparent 70%)",
    "radial-gradient(circle, #7DD3FC, transparent 70%)",
    "radial-gradient(circle, #6EE7B7, transparent 70%)",
    "radial-gradient(circle, #FDBA74, transparent 70%)",
  ];
  const positions = [
    { left:"-10%", top:"-8%" },
    { left:"65%", top:"5%" },
    { left:"10%", top:"55%" },
    { left:"70%", top:"60%" },
  ];
  positions.forEach((pos, i) => {
    const orb = document.createElement("div");
    orb.className = "blind-bar";
    orb.style.left = pos.left;
    orb.style.top = pos.top;
    orb.style.background = orbColors[i % orbColors.length];
    orb.style.animationDuration = (16 + i * 3) + "s";
    orb.style.animationDelay = (i * 1.4) + "s";
    layer.appendChild(orb);
  });
}

function pickLines(n, sourcePool){
  const pool = [...(sourcePool || CALC_LINES)];
  const out = [];
  for (let i = 0; i < n && pool.length; i++){
    const idx = Math.floor(Math.random() * pool.length);
    out.push(pool.splice(idx, 1)[0]);
  }
  return out;
}

/* ---------------- shared chrome ---------------------------------------*/
/* ---------------- icon set -------------------------------------------
   One consistent hand-authored line-icon family (1.6px stroke, rounded
   caps/joins, 20x20 grid), replacing the emoji glyphs. No external icon
   library, since this environment has no live network access to fetch
   one, but the visual language stays cohesive across every use. */
const ICONS = {
  home: `<svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5 10 3l7 6.5"/><path d="M5 8.5V17h10V8.5"/><path d="M8 17v-5h4v5"/></svg>`,
  sun: `<svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"><circle cx="10" cy="10" r="3.4"/><path d="M10 2.5v2M10 15.5v2M17.5 10h-2M4.5 10h-2M15.3 4.7l-1.4 1.4M6.1 13.9l-1.4 1.4M15.3 15.3l-1.4-1.4M6.1 6.1 4.7 4.7"/></svg>`,
  moon: `<svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 12.2A6.8 6.8 0 1 1 7.8 3.5a6 6 0 0 0 8.7 8.7Z"/></svg>`,
  soundOn: `<svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7.5h3l4-3.2v11.4l-4-3.2H3z"/><path d="M13 7.3a4 4 0 0 1 0 5.4M15.3 5a7.2 7.2 0 0 1 0 10"/></svg>`,
  soundOff: `<svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7.5h3l4-3.2v11.4l-4-3.2H3z"/><path d="M13 7.5l4 5M17 7.5l-4 5"/></svg>`,
  menu: `<svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"><path d="M3 6h14M3 10h14M3 14h14"/></svg>`,
  close: `<svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"><path d="M5 5l10 10M15 5 5 15"/></svg>`,
  lock: `<svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="9" width="11" height="8" rx="2.4"/><path d="M6.5 9V6.5a3.5 3.5 0 0 1 7 0V9"/></svg>`,
  wifi: `<svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7.5a10 10 0 0 1 14 0M5.6 10.6a6.2 6.2 0 0 1 8.8 0M8.4 13.6a2.4 2.4 0 0 1 3.2 0"/><circle cx="10" cy="16.2" r="1" fill="currentColor" stroke="none"/></svg>`,
  layers: `<svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3.5 17 8l-7 4.5L3 8z"/><path d="m4.6 10.8-1.6 1 7 4.5 7-4.5-1.6-1"/></svg>`,
  people: `<svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.2" cy="7" r="2.6"/><path d="M2.5 16c.5-3 2.3-4.6 4.7-4.6s4.2 1.6 4.7 4.6"/><circle cx="14.4" cy="7.4" r="2.1"/><path d="M13 11.6c2 .1 3.5 1.6 3.9 4"/></svg>`,
  trendUp: `<svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M3 14l4.5-5 3.5 3L17 5"/><path d="M12.5 5H17v4.5"/></svg>`,
  spark: `<svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2.5c.6 3 1.9 4.9 4.9 5.5-3 .6-4.3 1.9-4.9 4.9-.6-3-1.9-4.3-4.9-4.9 3-.6 4.3-2.5 4.9-5.5Z"/><path d="M15.5 13.5c.3 1.4.9 2.2 2.2 2.5-1.3.3-1.9.9-2.2 2.2-.3-1.3-.9-1.9-2.2-2.2 1.3-.3 1.9-1.1 2.2-2.5Z"/></svg>`,
  restart: `<svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M16 10a6 6 0 1 1-1.9-4.4"/><path d="M16 3.5v3.6h-3.6"/></svg>`,
  book: `<svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M4 3.5h8.5A2.5 2.5 0 0 1 15 6v10.5H6.5A2.5 2.5 0 0 1 4 14z"/><path d="M4 14a2.5 2.5 0 0 1 2.5-2.5H15"/></svg>`,
  party: `<svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="7" r="2.3"/><circle cx="14" cy="7" r="2.3"/><circle cx="10" cy="14" r="2.3"/><path d="M8 8.4l1 3.3M12 8.4l-1 3.3M8.3 7h3.4"/></svg>`,
  arrow: `<svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M5 15 15 5M7 5h8v8"/></svg>`
};

// Once a local profile exists (the moment a first result exists — see
// ensureLocalProfile() in engine.js), the top bar's "Sign Up" pill becomes
// a "Profile" pill instead: there's no account to sign up for, and there
// already IS a local identity to open. Both the pill and its nav-menu
// twin key off the exact same getLocalProfile() check, so they never
// disagree with each other.
function navProfilePillLabel(profile){
  if (!profile) return "Get Started";
  const first = (profile.name || "").trim().split(/\s+/)[0];
  return first ? first : "Profile";
}
function topBar(showBack){
  const profile = getLocalProfile();
  const pillHref = profile ? "profile.html" : null;
  const pillOnclick = profile ? "click(380);navigate('profile')" : "showGetStartedModal()";
  const pillLabel = profile ? navProfilePillLabel(profile) : "Get Started";
  // profile.soulHex is only ever written at quiz-completion time (see
  // ensureLocalProfile in engine.js) and never refreshed just from a page
  // rendering its nav bar, so it goes stale the moment the engine's soul
  // scoring changes -- recomputing fresh from the profile's own code keeps
  // this dot in sync with what Profile/Growth/Result all show for the
  // same person. Falls back to the stored value if decoding fails.
  const decodedForNav0 = profile && profile.code ? decodeCode(profile.code) : null;
  const decodedForNav = decodedForNav0 && !decodedForNav0.obsolete ? decodedForNav0 : null;
  const freshSoulHex = decodedForNav ? computeSoulType(decodedForNav.normDims).hex : (profile && profile.soulHex);
  return `
  <div class="top-bar">
    <div class="nav-zone nav-left">
      <button class="nav-pill" onclick="goHome()" aria-label="Go to home">
        <span class="nav-pill-icon">${ICONS.home}</span><span class="nav-pill-label">Home</span>
      </button>
    </div>
    <div class="nav-zone nav-center">
      <img id="navLogo" class="nav-logo" alt="Forge" src="${currentTheme === "light" ? "assets/Logo_black.svg" : "assets/Logo_white.svg"}"
        onerror="this.style.display='none'; document.getElementById('navLogoFallback').style.display='inline';" />
      <span id="navLogoFallback" class="nav-logo-fallback" style="display:none">Forge<span class="brand-dot">.</span></span>
    </div>
    <div class="nav-zone nav-right">
      <button class="btn btn-primary btn-sm nav-signup${profile ? " nav-profile-pill" : ""}" onclick="${pillOnclick}">${profile ? `<span class="nav-profile-dot" style="background:${isSafeHexColor(freshSoulHex) ? freshSoulHex : "currentColor"}" aria-hidden="true"></span>` : ""}${obEsc(pillLabel)}<span class="pill-arrow">&rarr;</span></button>
      <button class="icon-btn" id="navMenuBtn" onclick="toggleNavMenu()" aria-haspopup="true" aria-expanded="false" aria-label="Open menu">${ICONS.menu}</button>
    </div>
    <div class="nav-menu-backdrop" id="navMenuBackdrop" hidden></div>
    <div class="nav-menu" id="navMenu" hidden>
     <div class="nav-menu-inner">
      <button class="nav-menu-item nav-menu-signup" onclick="closeNavMenu();${pillOnclick}"><span>${obEsc(pillLabel)} &rarr;</span></button>
      <div class="nm-label">Explore</div>
      <div class="nm-grid">
        <button class="nav-menu-item nm-tile nm-mint" onclick="closeNavMenu();click(380);navigate('growth')"><span class="nm-top"><span class="nm-ico">${ICONS.trendUp}</span><span class="nm-num">01</span></span><span class="nm-name">Growth</span></button>
        <button class="nav-menu-item nm-tile nm-violet" onclick="closeNavMenu();click(380);navigate('improve')"><span class="nm-top"><span class="nm-ico">${ICONS.spark}</span><span class="nm-num">02</span></span><span class="nm-name">Improve</span></button>
        <button class="nav-menu-item nm-tile nm-gold" onclick="closeNavMenu();click(380);navigate('journal')"><span class="nm-top"><span class="nm-ico">${ICONS.book}</span><span class="nm-num">03</span></span><span class="nm-name">Journal</span></button>
        <button class="nav-menu-item nm-tile nm-cream" onclick="closeNavMenu();click(380);navigate('frameworks')"><span class="nm-top"><span class="nm-ico">${ICONS.layers}</span><span class="nm-num">04</span></span><span class="nm-name">Frameworks</span></button>
      </div>
      <div class="nm-label">Together</div>
      <div class="nm-stack">
        <button class="nav-menu-item nm-wide nm-indigo" onclick="closeNavMenu();click(380);navigate('compare')"><span class="nm-ico">${ICONS.people}</span><span class="nm-name">Compare Results</span><span class="nm-go">${ICONS.arrow}</span></button>
        <button class="nav-menu-item nm-wide nm-peach" onclick="closeNavMenu();click(380);navigate('party')"><span class="nm-ico">${ICONS.party}</span><span class="nm-name">Party Compare</span><span class="nm-go">${ICONS.arrow}</span></button>
      </div>
      <div class="nm-settings">
        <button class="nav-menu-item nm-chip" id="navThemeItem" onclick="toggleTheme()">${currentTheme === "light" ? ICONS.moon : ICONS.sun}<span>${currentTheme === "light" ? "Dark mode" : "Light mode"}</span></button>
        <button class="nav-menu-item nm-chip" id="navSoundItem" onclick="toggleSound()">${soundOn ? ICONS.soundOn : ICONS.soundOff}<span>Sound ${soundOn ? "on" : "off"}</span></button>
      </div>
      <div class="nm-legal">
        <a class="nav-menu-item" href="legal.html"><span>Terms</span></a>
        <button class="nav-menu-item" onclick="closeNavMenu();showPrivacyModal()"><span>Privacy</span></button>
      </div>
      <div class="nav-menu-sep"></div>
      <div class="nav-menu-code">
        <label for="quickCode">Have someone's code?</label>
        <input type="text" id="quickCode" placeholder="Name-PF4-...">
        <div class="nav-menu-code-row">
          <button class="btn btn-ghost btn-sm" onclick="viewProfileFromCode()">View</button>
          <button class="btn btn-ghost btn-sm" onclick="quickCompareGo()">Compare</button>
        </div>
      </div>
     </div>
    </div>
  </div>`;
}
let navMenuOpen = false;
function toggleNavMenu(){
  navMenuOpen ? closeNavMenu() : openNavMenu();
}
function openNavMenu(){
  const menu = document.getElementById("navMenu");
  const btn = document.getElementById("navMenuBtn");
  const backdrop = document.getElementById("navMenuBackdrop");
  if (!menu || !btn) return;
  rememberFocusTrigger();
  navMenuOpen = true;
  menu.hidden = false;
  if (backdrop) backdrop.hidden = false;
  requestAnimationFrame(() => { menu.classList.add("open"); if (backdrop) backdrop.classList.add("open"); });
  btn.setAttribute("aria-expanded", "true");
  btn.innerHTML = ICONS.close;
  document.addEventListener("pointerdown", onNavMenuOutsideClick, true);
  document.addEventListener("keydown", onNavMenuKey);
}
function closeNavMenu(){
  const menu = document.getElementById("navMenu");
  const btn = document.getElementById("navMenuBtn");
  const backdrop = document.getElementById("navMenuBackdrop");
  navMenuOpen = false;
  document.removeEventListener("pointerdown", onNavMenuOutsideClick, true);
  document.removeEventListener("keydown", onNavMenuKey);
  if (backdrop) backdrop.classList.remove("open");
  setTimeout(() => { if (!navMenuOpen && backdrop) backdrop.hidden = true; }, 400);
  if (!menu || !btn) return;
  menu.classList.remove("open");
  btn.setAttribute("aria-expanded", "false");
  btn.innerHTML = ICONS.menu;
  // Matches .nav-menu's longest close transition (grid-template-rows,
  // 550ms) so `hidden` lands right as the collapse finishes rather than
  // cutting it off mid-shrink.
  setTimeout(() => { if (!navMenuOpen && menu) menu.hidden = true; }, 550);
}
function onNavMenuOutsideClick(e){
  const menu = document.getElementById("navMenu");
  const btn = document.getElementById("navMenuBtn");
  if (!menu || (menu.contains(e.target) || (btn && btn.contains(e.target)))) return;
  closeNavMenu();
}

/* ---------------- Shared focus-trap utility for modal/dialog overlays ---
   Every aria-modal dialog in the app (the nav menu, Get Started, Privacy,
   Danger Confirm, the Result Detail panel) needs the same three things:
   Tab/Shift+Tab boundaries that don't leak into page content the overlay
   is visually covering, Escape to close, and focus returning to whatever
   triggered the dialog once it's gone. Originally only the nav menu had
   the Tab boundary (a real bug found in an earlier pass: Tab walked
   straight past the last menu item into content still covered by the
   menu/backdrop), and nothing anywhere restored focus on close. Rather
   than fix each dialog's hand-rolled copy separately, this is the one
   shared implementation every one of them calls into. Each dialog keeps
   its own open()/close() and Escape wiring (they differ in timing —
   some remove() the overlay after a transition, some just toggle a
   class) since that isn't duplicated logic, just the Tab-cycling math
   and the focus-remember/restore pair are. */
function getFocusable(container){
  if (!container) return [];
  return [...container.querySelectorAll('button, a[href], input, textarea, select, [tabindex]:not([tabindex="-1"])')]
    .filter(el => el.offsetParent !== null && !el.disabled);
}
function cycleFocusTrap(e, container){
  const focusable = getFocusable(container);
  if (!focusable.length) return;
  const first = focusable[0], last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first){
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last){
    e.preventDefault();
    first.focus();
  }
}
// One shared "where to return focus" slot rather than one per dialog:
// every dialog in the app is strictly modal (each open() bails if its
// own overlay already exists, and nothing here ever opens a second
// dialog over a first), so at most one trigger is ever pending at a
// time. document.contains() guards the one real edge case found in this
// codebase: renderResult() can rebuild the whole result page (e.g.
// toggleCareers()) while the Result Detail panel is still open, which
// destroys and recreates the tile button that originally triggered it —
// focusing a now-detached node is a silent no-op, so this just skips
// the restore instead of doing nothing anyway.
let focusTrapReturnEl = null;
function rememberFocusTrigger(){ focusTrapReturnEl = document.activeElement; }
function restoreFocusTrigger(){
  const el = focusTrapReturnEl;
  focusTrapReturnEl = null;
  if (el && document.contains(el) && typeof el.focus === "function") el.focus();
}
function onNavMenuKey(e){
  if (e.key === "Escape"){
    closeNavMenu();
    restoreFocusTrigger();
    return;
  }
  if (e.key !== "Tab") return;
  cycleFocusTrap(e, document.getElementById("navMenu"));
}

/* ---------------- nav-menu "have someone's code?" quick lookup -----------
   The nav-menu's quick-code box appears in topBar() on every page, so its
   two handlers need to work everywhere. "Compare" already only needs
   sessionStorage + navigate(), both page-agnostic. "View" wants to render
   the result screen directly, which for now only exists on index.html; on
   any other page it hands off via the same one-shot sessionStorage flag
   share.js's openSharedProfile() uses. */
function quickCompareGo(){
  const val = document.getElementById("quickCode").value.trim();
  if (!val) return;
  sessionStorage.setItem("pf_prefill_b", val);
  click(420);
  navigate("compare");
}
function viewProfileFromCode(){
  const val = document.getElementById("quickCode").value.trim();
  if (!val) return;
  const decoded = decodeCode(val);
  if (!decoded){ showToast("That code doesn't look right. Check for typos and try again."); return; }
  if (decoded.obsolete){ showToast(OBSOLETE_CODE_MESSAGE); return; }
  click(500);
  if (typeof PF_PAGE !== "undefined" && PF_PAGE === "result"){
    lastResult = buildResultFromDecoded(decoded, val);
    careersExpanded = false;
    funStatsOpen = false;
    renderResult();
  } else {
    sessionStorage.setItem("pf_view_shared_code", val);
    location.href = "result.html";
  }
}

/* ---------------- Profile export / import (.pf) -------------------------
   ".pf" here is a plain JSON file, not to be confused with the "PF1"/
   "PF2" version tag inside a share code — it's just this device's saved
   profile (the current code, plus the local history log) wrapped so it
   can move to another browser/device. Entirely local: no account, no
   server, nothing leaves the device except the file itself when the
   user explicitly downloads or picks one. */
// Export format version 2: adds a full, human-inspectable snapshot
// (archetype, soul, virtues, tendencies, mind map, fun stats, confidence,
// quiz mode) on top of what v1 exported. The `code` field alone is still
// the actual restore mechanism (see importProfile() below) since it fully
// determines everything else deterministically — the extra fields exist
// so the file is complete and portable on its own, not because import
// strictly needs them.
const PF_EXPORT_FORMAT = "forge-profile";
const PF_EXPORT_VERSION = 2;
function exportProfile(){
  const code = localStorage.getItem("pf_last_code");
  if (!code){
    click(300);
    showToast("No saved profile on this device yet. Take the quiz first.");
    return;
  }
  click(460);
  let history = [];
  try{ history = JSON.parse(localStorage.getItem("pf_history") || "[]"); } catch(e){ /* ignore malformed history, export the code anyway */ }
  const decoded = decodeCode(code);
  const safeName = (decoded && decoded.name ? decoded.name : "Forge-Profile").replace(/[^a-z0-9_-]+/gi, "_") || "Forge-Profile";

  const payload = { format: PF_EXPORT_FORMAT, version: PF_EXPORT_VERSION, exportedAt: Date.now(), code, history };
  // Local-only data added alongside the core profile since this session's
  // expansion (journal, saved groups) — same reasoning as everything
  // else here: the .pf file stays a complete, portable snapshot, and
  // these use the same stable-id records (see engine.js) that a future
  // optional-sync layer would need anyway.
  try{ payload.journal = getJournalEntries(); } catch(e){ /* ignore */ }
  try{ payload.groups = getSavedGroups(); } catch(e){ /* ignore */ }
  try{ payload.suggestionFeedback = getSuggestionFeedback(); } catch(e){ /* ignore */ }
  try{ payload.settings = { theme: currentTheme, sound: soundOn ? "on" : "off" }; } catch(e){ /* ignore */ }
  try{ const p = getLocalProfile(); if (p) payload.localProfile = p; } catch(e){ /* ignore */ }
  // On the result page with the matching code still current, lastResult
  // already carries real confidence (from the actual answer session);
  // everywhere else, rebuild the same shape from the code alone with no
  // session to draw on — computeAssessmentConfidence() already degrades
  // gracefully to a session-less estimate in that case.
  try{
    const hasLiveResult = typeof lastResult !== "undefined" && lastResult && lastResult.code === code;
    let extras;
    if (hasLiveResult){
      extras = lastResult;
    } else if (decoded){
      const match = matchArchetype(decoded.normDims);
      extras = { name: decoded.name, meta: {}, normDims: decoded.normDims, archetype: match.primary, ...applyStoredConfidence(buildProfileExtras(decoded.normDims, match.primary, match.ranked, null), code) };
    }
    if (extras){
      payload.name = extras.name;
      payload.quizMode = extras.meta && extras.meta.pace;
      payload.confidence = extras.confidence;
      payload.archetype = { id: extras.archetype.id, name: extras.archetype.name, icon: extras.archetype.icon };
      payload.soul = extras.soul;
      payload.virtues = extras.sinVirtue;
      payload.tendencies = DIMENSIONS.map(d => ({ dim: d, label: DIM_LABELS[d], value: extras.normDims[d] })).sort((a,b) => Math.abs(b.value) - Math.abs(a.value)).slice(0, 6);
      payload.mindMap = extras.normDims;
      payload.funStats = extras.funStats;
      payload.growthTimeline = history;
    }
  } catch(e){ /* the rich snapshot is a nice-to-have; code + history above already export the restorable core */ }

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${safeName}.pf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showToast("Profile exported as a .pf file.");
}

function importProfile(){
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".pf,application/json";
  input.addEventListener("change", () => {
    const file = input.files && input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      // Never throw past this point: a bad .pf file (corrupted JSON, an
      // unrelated JSON file, a future format we don't understand yet, a
      // hand-edited file with fields missing or wrong types) should always
      // end in a friendly toast, never a broken page.
      let payload;
      try{ payload = JSON.parse(reader.result); }
      catch(e){ showToast("That .pf file couldn't be read. It may be corrupted or isn't actually a .pf file."); return; }

      if (!payload || typeof payload !== "object"){
        showToast("That .pf file doesn't contain a valid Forge profile.");
        return;
      }
      // format/version are both optional and lenient on purpose: a hand-
      // edited or older (v1, unversioned) export still restores fine off
      // `code` alone, so only warn about a newer/unrecognized version
      // rather than refusing it outright — everything else in the file
      // besides code/history is informational, not load-critical.
      if (payload.format && payload.format !== PF_EXPORT_FORMAT){
        showToast("That file isn't a Forge profile export.");
        return;
      }
      if (typeof payload.version === "number" && payload.version > PF_EXPORT_VERSION){
        showToast("That .pf file was exported from a newer version of Forge. The core profile should still import, but some fields may be skipped.");
      }

      const code = typeof payload.code === "string" ? payload.code : null;
      const decoded = code && decodeCode(code);
      if (!decoded){ showToast("That .pf file doesn't contain a valid Forge profile code."); return; }
      if (decoded.obsolete){ showToast(OBSOLETE_CODE_MESSAGE); return; }

      // v1.5 Profile Manager: import used to overwrite whatever profile
      // was active -- a real risk once multiple profiles exist (importing
      // a friend's .pf while your own profile happened to be active would
      // have silently destroyed it). createNewProfile() is the exact
      // primitive switchToProfile()/the Profile Switcher already use --
      // it snapshots the outgoing active profile's data away intact and
      // clears the canonical keys, so everything below populates a
      // genuinely fresh profile. No data loss, nothing overwritten.
      // freshProfileId is threaded through to the payload.localProfile
      // write below: found live in testing that without this, the
      // source file's OWN preserved profileId (sanitizeImportedLocalProfile
      // keeps it, for the older single-profile "reimport my own backup"
      // case) would create a SECOND, orphaned index entry distinct from
      // the one just created here, rather than describing the same
      // profile -- two rows in the switcher for one import.
      let freshProfileId = null;
      if (typeof createNewProfile === "function") freshProfileId = createNewProfile(decoded.name || "")?.profileId || null;

      try{ localStorage.setItem("pf_last_code", code); }
      catch(e){ showToast("Couldn't save that profile on this device (storage may be full or blocked)."); return; }

      if (Array.isArray(payload.history)){
        try{ localStorage.setItem("pf_history", JSON.stringify(payload.history)); }
        catch(e){ /* history is a nice-to-have; the code itself already restored */ }
      } else if (Array.isArray(payload.growthTimeline)){
        try{ localStorage.setItem("pf_history", JSON.stringify(payload.growthTimeline)); }
        catch(e){ /* same, non-fatal */ }
      }
      // Journal/groups/local-profile are all optional, all non-fatal if
      // malformed or absent — an older (pre-journal) .pf file, or one
      // with a corrupted extra field, should still import the core
      // profile above cleanly.
      if (Array.isArray(payload.journal)){
        try{ localStorage.setItem(JOURNAL_KEY, JSON.stringify(sanitizeImportedJournal(payload.journal))); } catch(e){ /* ignore */ }
      }
      if (Array.isArray(payload.groups)){
        try{ localStorage.setItem(GROUPS_KEY, JSON.stringify(sanitizeImportedGroups(payload.groups))); } catch(e){ /* ignore */ }
      }
      if (Array.isArray(payload.suggestionFeedback)){
        try{ localStorage.setItem(SUGGESTION_FEEDBACK_KEY, JSON.stringify(sanitizeImportedSuggestionFeedback(payload.suggestionFeedback))); } catch(e){ /* ignore */ }
      }
      if (payload.localProfile && typeof payload.localProfile === "object"){
        const safeProfile = sanitizeImportedLocalProfile(payload.localProfile);
        if (safeProfile){
          // Always the profile slot createNewProfile() just made, never
          // whatever id the source file happened to carry -- see the
          // comment above freshProfileId for why.
          if (freshProfileId) safeProfile.profileId = freshProfileId;
          // The imported code is the source of truth. A hand-edited/partial
          // localProfile without one would otherwise leave this profile
          // reading "not assessed yet" next to a perfectly valid pf_last_code.
          if (!safeProfile.code) safeProfile.code = code;
          try{ saveLocalProfile(safeProfile); } catch(e){ /* ignore */ }
        }
      }
      if (payload.settings && typeof payload.settings === "object"){
        if (payload.settings.theme === "light" || payload.settings.theme === "dark"){
          try{ localStorage.setItem("pf_theme", payload.settings.theme); } catch(e){ /* ignore */ }
        }
        if (payload.settings.sound === "on" || payload.settings.sound === "off"){
          try{ localStorage.setItem("pf_sound", payload.settings.sound); } catch(e){ /* ignore */ }
        }
      }
      click(560);
      showToast(`Imported ${decoded.name ? decoded.name + "'s" : "the"} profile as a new saved profile. Reloading…`);
      setTimeout(() => location.reload(), 900);
    };
    reader.onerror = () => showToast("That .pf file couldn't be read from disk. Try again.");
    reader.readAsText(file);
  });
  input.click();
}

/* ---------------- Toast + inert "coming soon" affordances --------------
   A couple of surfaces in the redesigned marketing shell (Sign Up, the
   optional-account panel) are intentionally not backed by any real
   account system yet, matching Forge's no-backend, no-accounts model.
   Rather than a dead click, they surface an honest, on-brand toast
   instead of the browser's native alert(). */
let toastTimer = null;
function showToast(message){
  let el = document.getElementById("toast");
  if (!el){
    el = document.createElement("div");
    el.id = "toast";
    el.className = "toast";
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.remove("show");
  void el.offsetWidth;
  el.classList.add("show");
  clearTimeout(toastTimer);
  // A fixed 3.2s was too short for the longer messages (the obsolete-code
  // explanation is ~290 characters) -- text people can't finish reading
  // is a WCAG 2.2.1 timing problem, not just a polish one. Scales with
  // length, capped so it never lingers.
  const hold = Math.min(9000, Math.max(3200, 1800 + message.length * 45));
  toastTimer = setTimeout(() => el.classList.remove("show"), hold);
}
// One-shot message carried across a redirect (e.g. result.html bouncing
// an unreadable share link back to Home) -- without this the person just
// lands on the homepage with no idea their link was rejected.
function showPendingFlash(){
  let msg = null;
  try { msg = sessionStorage.getItem("pf_flash"); sessionStorage.removeItem("pf_flash"); } catch(e){ /* storage blocked */ }
  if (msg) showToast(msg);
  else if (window.PF_STORAGE_VOLATILE) showToast("Your browser is blocking site storage, so Forge can't save anything between visits. Everything still works while this tab stays open.");
}
window.addEventListener("load", () => setTimeout(showPendingFlash, 350));
function showComingSoon(feature){
  click(420);
  showToast(`${feature} aren't built yet. Forge stays fully on-device for now. Star the repo to hear when that changes.`);
}
// Replaces the old "Sign Up" -> generic toast with a real choice: a
// Local Profile (creates one immediately, on-device, no login) or a
// Cloud Profile (visible so people know it's coming, but genuinely
// inactive — clicking it still just explains it isn't built yet).
function showGetStartedModal(){
  click(460);
  if (document.getElementById("getStartedModal")) return;
  const overlay = document.createElement("div");
  overlay.id = "getStartedModal";
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <div class="modal-card glass" role="dialog" aria-modal="true" aria-labelledby="getStartedModalTitle">
      <button class="icon-btn modal-close" onclick="closeGetStartedModal()" aria-label="Close">${ICONS.close}</button>
      <div class="eyebrow accent">GET STARTED</div>
      <h3 id="getStartedModalTitle">How do you want to keep this?</h3>
      <p>Either way, nothing about the quiz or your result changes. This just decides where your profile lives.</p>
      <div class="get-started-choices">
        <button type="button" class="get-started-choice" onclick="createLocalProfileFromModal()">
          <span class="get-started-choice-title">Local Profile</span>
          <span class="get-started-choice-desc">On this device, right now. Works offline, exports as a .pf file, no login.</span>
        </button>
        <button type="button" class="get-started-choice get-started-choice-disabled" onclick="showComingSoon('Cloud profiles')">
          <span class="get-started-choice-title">Cloud Profile <span class="lp-soon-badge">Coming soon &#x1F6A7;</span></span>
          <span class="get-started-choice-desc">Sync across your own devices. Not built yet, this is just showing you it's planned.</span>
        </button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  rememberFocusTrigger();
  requestAnimationFrame(() => { overlay.classList.add("open"); getFocusable(overlay)[0]?.focus(); });
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeGetStartedModal(); });
  document.addEventListener("keydown", onGetStartedModalKey);
}
function onGetStartedModalKey(e){
  if (e.key === "Escape"){ closeGetStartedModal(); return; }
  if (e.key !== "Tab") return;
  cycleFocusTrap(e, document.getElementById("getStartedModal"));
}
function closeGetStartedModal(){
  const overlay = document.getElementById("getStartedModal");
  if (!overlay) return;
  overlay.classList.remove("open");
  document.removeEventListener("keydown", onGetStartedModalKey);
  restoreFocusTrigger();
  setTimeout(() => overlay.remove(), 220);
}
// A Local Profile can exist before any quiz result does — it's just a
// name/avatar shell at that point (see profile.js's "not assessed yet"
// state); ensureLocalProfile() (engine.js) fills in archetype/soul the
// moment a first result actually completes, same record either way.
function createLocalProfileFromModal(){
  updateLocalProfile({});
  click(520);
  closeGetStartedModal();
  navigate("profile");
}
function showPrivacyModal(){
  click(460);
  if (document.getElementById("privacyModal")) return;
  const overlay = document.createElement("div");
  overlay.id = "privacyModal";
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <div class="modal-card glass" role="dialog" aria-modal="true" aria-labelledby="privacyModalTitle">
      <button class="icon-btn modal-close" onclick="closePrivacyModal()" aria-label="Close">${ICONS.close}</button>
      <div class="eyebrow accent">PRIVACY</div>
      <h3 id="privacyModalTitle">Everything stays on your device</h3>
      <p>Forge never uploads your personality anywhere. Answers, results, and history are stored only in this browser's local storage. Nothing is sent to a server, because Forge doesn't have one.</p>
      <p>A profile only ever leaves your device if you choose to share its code or link yourself.</p>
      <button class="btn btn-primary" onclick="closePrivacyModal()">Got it</button>
    </div>`;
  document.body.appendChild(overlay);
  rememberFocusTrigger();
  requestAnimationFrame(() => { overlay.classList.add("open"); getFocusable(overlay)[0]?.focus(); });
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closePrivacyModal(); });
  document.addEventListener("keydown", onPrivacyModalKey);
}
function onPrivacyModalKey(e){
  if (e.key === "Escape"){ closePrivacyModal(); return; }
  if (e.key !== "Tab") return;
  cycleFocusTrap(e, document.getElementById("privacyModal"));
}
function closePrivacyModal(){
  const overlay = document.getElementById("privacyModal");
  if (!overlay) return;
  overlay.classList.remove("open");
  restoreFocusTrigger();
  document.removeEventListener("keydown", onPrivacyModalKey);
  setTimeout(() => overlay.remove(), 220);
}
function goHome(){
  if (typeof session !== "undefined" && session && !session.isComplete()){
    saveQuizProgress();
  }
  click(340);
  navigate("landing");
}

/* ---------------- clean URLs --------------------------------------------
   quiz.html/result.html/compare.html/legal.html are also reachable at
   extensionless paths ("/quiz", "/result", "/compare", "/legal"). The
   REAL file each page loads from is unchanged (every internal link and
   location.href still points at the .html file directly — no extra
   network round trip on ordinary in-app navigation); this just rewrites
   the visible address bar to the clean form right after that real file
   has loaded, via history.replaceState (no reload, no flash). Called
   once near the top of each of those four pages' own boot <script>.
   A direct load, bookmark, or refresh of the clean path itself (where
   the browser asks the server for "/quiz", not "quiz.html") is handled
   separately by 404.html, which recognizes the same route name and
   redirects to the real file — this function then cleans the address
   bar again once that lands, so the end state is identical either way. */
function useCleanURL(routeName){
  if (!window.history || !history.replaceState) return;
  try{
    const url = new URL(location.href);
    if (!/\.html$/i.test(url.pathname)) return; // already clean, nothing to do
    url.pathname = url.pathname.replace(/[^/]*\.html$/i, routeName);
    history.replaceState(history.state, "", url.toString());
  } catch(e){ /* not fatal — worst case the .html form stays visible */ }
}

/* ---------------- routing ---------------------------------------------
   "party" is just a view within compare.html now (like the compare page's
   own two internal modes), not a separate page — so both "compare" and
   "party" render in place when already on compare.html, and become a real
   navigation (with ?party=1 to land straight on the group view) otherwise.
   Same in-place-vs-navigate pattern for "landing" on index.html. Every
   page sets its own PF_PAGE constant in its boot script so this can tell
   where it's actually running (every render* function exists on every
   page now that they're all bundled in pages.js, so a plain
   typeof-function check can no longer tell pages apart).

   These location.href assignments (and every other internal href/
   location.href in the app) intentionally still target the real .html
   files rather than the clean paths ("/compare", not "compare.html") —
   that's what lets a real navigation happen with zero extra round trip.
   The clean address bar comes from useCleanURL() (above), which each
   destination page calls on load; a direct load of a clean path instead
   of a click is handled by 404.html. See useCleanURL()'s own comment for
   the full picture. */
function navigate(view){
  window.scrollTo(0, 0);
  const onPage = typeof PF_PAGE !== "undefined" ? PF_PAGE : null;
  // Only a view that renders IN PLACE needs a fresh history entry (Back/Forward re-render it from the URL). A real page change
  // used to push a duplicate entry for the page being left, which cost an extra Back press to get past it.
  if ((view === "landing" && onPage === "index") || ((view === "compare" || view === "party") && onPage === "compare")) clearShareableURL();
  if (view === "landing"){
    if (onPage === "index") renderLanding();
    else location.href = "index.html";
  }
  else if (view === "compare"){
    if (onPage === "compare"){ setCompareModeURL(false); renderCompare(); }
    else location.href = "compare.html";
  }
  else if (view === "party"){
    if (onPage === "compare"){ setCompareModeURL(true); renderParty(); }
    else location.href = "compare.html?party=1";
  }
  else if (view === "growth") location.href = "growth.html";
  else if (view === "improve") location.href = "improve.html";
  else if (view === "profile") location.href = "profile.html";
  else if (view === "journal") location.href = "journal.html";
  else if (view === "frameworks") location.href = "frameworks.html";
}

// Keeps compare.html's own address bar in sync with which mode (regular
// or party) is on screen when switched in place — without this, the URL
// stayed wherever it was before the switch, so a refresh or a shared
// link silently dropped a party-compare visitor back into regular
// compare. Uses replaceState (not pushState): clearShareableURL() just
// above already pushed a fresh history entry for this navigate() call,
// so this folds the mode into that same entry instead of adding a
// second one — one user click should still be one "Back" press to undo.
// compare.html's own popstate listener re-renders from the URL on the
// way back, which is what actually makes Back/Forward restore the mode.
function setCompareModeURL(isParty){
  if (!window.history || !history.replaceState) return;
  try{
    const url = new URL(location.href);
    if (isParty) url.searchParams.set("party", "1");
    else url.searchParams.delete("party");
    history.replaceState(history.state, "", url.toString());
  } catch(e){ /* not fatal — worst case the URL just doesn't reflect the mode */ }
}

function goToNameScreen(){
  location.href = "quiz.html";
}

// v1.4: for a profile that's already answered onboarding once. Pre-fills
// name/ageGroup/gender/occupation/country/pace from the local profile and
// hands them to quiz.html via one sessionStorage flag (same one-shot
// pattern as pf_fresh_result/pf_resumable_quick_session) -- its own boot()
// script reads pf_retake_prefill and calls startQuiz() directly, so
// onboarding steps 1-4 never render at all. Falls back to the normal
// onboarding entry if there's no profile yet (first-time users always
// get the full flow, per "onboarding only appears on first launch").
function retakeAssessment(){
  const profile = getLocalProfile();
  // profile.code only exists once a result has actually completed (see
  // ensureLocalProfile()) -- a bare profile shell from "Get Started" with
  // no assessment yet still counts as "first launch" for onboarding
  // purposes, so it gets the full flow same as no profile at all.
  if (!profile || !profile.code){ goToNameScreen(); return; }
  click(520);
  const paceFromDepth = { short:"quick", balanced:"balanced", deep:"deep" };
  const pace = paceFromDepth[profile.lastResultDepth] || "balanced";
  const meta = {
    ageGroup: profile.ageGroup || "",
    gender: profile.gender || "",
    occupation: profile.occupation || "",
    country: profile.country || "",
    pace,
    resultDepth: profile.lastResultDepth || "balanced",
  };
  sessionStorage.setItem("pf_retake_prefill", JSON.stringify({ name: profile.name || "", meta }));
  location.href = "quiz.html";
}

// Shared "go look at my own last result" action, for any page besides
// index.html that wants a link straight into result.html — result.html's
// own boot script only shows a result when handed one of a few specific
// session/URL signals (see result.html's boot()), so a bare
// location.href="result.html" from elsewhere would otherwise silently
// bounce to the landing page instead.
function viewMyLastResult(){
  const code = localStorage.getItem("pf_last_code");
  const decoded = code && decodeCode(code);
  if (!decoded){ showToast("No saved result found on this device yet."); return; }
  if (decoded.obsolete){ showToast(OBSOLETE_CODE_MESSAGE); return; }
  sessionStorage.setItem("pf_view_shared_code", code);
  location.href = "result.html";
}

/* A brief full-screen "calculating" beat between quiz questions and (in a
   shorter form) between upgrade-quiz questions on the result page — shared
   since both are otherwise-identical mid-flow pauses. */
function showCalcOverlay(count, done){
  document.onkeydown = null;
  const overlay = document.createElement("div");
  overlay.className = "calc-overlay";
  const line = pickLines(1)[0] || "Processing";
  overlay.innerHTML = `<div class="calc-bars"><span></span><span></span><span></span><span></span></div><div class="calc-line">${line}...</div>`;
  document.body.appendChild(overlay);
  setTimeout(() => {
    overlay.remove();
    done();
  }, 480);
}

function toggleSound(){
  soundOn = !soundOn;
  localStorage.setItem("pf_sound", soundOn ? "on" : "off");
  click(soundOn ? 660 : 220);
  const item = document.getElementById("navSoundItem");
  if (item) item.innerHTML = `${soundOn ? ICONS.soundOn : ICONS.soundOff}<span>Sound ${soundOn ? "on" : "off"}</span>`;
  if (bgMusic){
    if (soundOn){
      bgMusic.play().then(() => {
        const el = document.getElementById("audioPrompt");
        if (el) el.remove();
      }).catch(() => {});
    }
    else bgMusic.pause();
  }
}

/* MOTION INTENSITY. The same --motion token the CSS hover lifts use (css/global.css): 1 is the original
   strength, .2 the current one, 0 off. Read live so the narrow-viewport / touch / reduced-motion
   overrides in CSS apply to the pointer-driven JS effects too. */
function readMotionScale(){
  try{
    const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--motion"));
    return isFinite(v) ? Math.max(0, Math.min(1, v)) : 0.2;
  } catch(e){ return 0.2; }
}
let MOTION = readMotionScale();
window.addEventListener("resize", () => { MOTION = readMotionScale(); });

/* Anything a person clicks, types into or drags. A card must hold still while the pointer is over one, so the
   target never drifts as the mouse arrives. `host` is the card itself: a card that is a button is not
   "a control inside the card", so it keeps its (now very small) tilt. */
const INTERACTIVE_SEL = "a[href], button, input, select, textarea, label, summary, option, [role='button'], [role='link'], [role='slider'], [role='tab'], [role='menuitem'], [role='checkbox'], [role='radio'], [role='switch'], [role='combobox'], [role='textbox'], [contenteditable]:not([contenteditable='false']), [onclick], [draggable='true'], .btn, .icon-btn";
function overControl(target, host){
  const t = target && target.nodeType === 3 ? target.parentElement : target;
  const c = t && t.closest ? t.closest(INTERACTIVE_SEL) : null;
  return !!c && c !== host && (!host || host.contains(c));
}

const MAGNET_MAX_PX = 8;
function initMagneticButtons(container){
  if (reducedMotion() || !window.matchMedia("(hover: hover)").matches) return;
  (container || document).querySelectorAll(".btn-primary").forEach(btn => {
    let raf = null;
    btn.addEventListener("pointermove", (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const rect = btn.getBoundingClientRect();
        const x = Math.max(-MAGNET_MAX_PX, Math.min(MAGNET_MAX_PX, (e.clientX - rect.left - rect.width / 2) * 0.25)) * MOTION;
        const y = Math.max(-MAGNET_MAX_PX, Math.min(MAGNET_MAX_PX, (e.clientY - rect.top - rect.height / 2) * 0.35)) * MOTION;
        btn.style.setProperty("--magnet-x", x.toFixed(1) + "px");
        btn.style.setProperty("--magnet-y", y.toFixed(1) + "px");
      });
    });
    btn.addEventListener("pointerleave", () => {
      btn.style.setProperty("--magnet-x", "0px");
      btn.style.setProperty("--magnet-y", "0px");
    });
  });
}

// Low-amplitude pointer tilt for the result page's bento grid (see
// .bento-card:hover in pages.css, which composites --tilt-x/--tilt-y
// into its existing translateY hover lift via perspective()+rotate()).
// Same reduced-motion/hover-capability gate and rAF-throttled-pointermove
// shape as initMagneticButtons() above, on purpose -- this is the same
// kind of small, physical, interaction-only motion, just applied to
// cards instead of buttons. 7deg total swing (+/-3.5deg) is deliberately
// small: enough to read as "this card has depth" at a glance, never
// enough to feel like a gimmick or fight the card's own hover lift.
const CARD_TILT_MAX_DEG = 3.5;
function initCardTilt(container){
  if (reducedMotion() || !window.matchMedia("(hover: hover)").matches) return;
  (container || document).querySelectorAll(".bento-card").forEach(card => {
    let raf = null;
    card.addEventListener("pointermove", (e) => {
      if (raf || overControl(e.target, card)) return;      // hold still while over a control inside the card
      raf = requestAnimationFrame(() => {
        raf = null;
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.setProperty("--tilt-x", (-py * CARD_TILT_MAX_DEG * 2 * MOTION).toFixed(2) + "deg");
        card.style.setProperty("--tilt-y", (px * CARD_TILT_MAX_DEG * 2 * MOTION).toFixed(2) + "deg");
      });
    });
    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
    });
  });
}

// Subtle background-position parallax for the result hero's full-bleed
// archetype photo (.ingot-visual, inside .ingot-split -- see pages.css).
// Tracks pointer position across the whole hero card, not just the
// photo half, so the shift already feels underway by the time the
// cursor reaches the image instead of only starting there. Same gate
// and rAF-throttle shape as initCardTilt()/initMagneticButtons() above;
// 10px max keeps it read as "this photo has depth", not a scroll-jack
// or anything that could read as jarring on a still image.
const HERO_PARALLAX_MAX_PX = 10;
function initHeroParallax(container){
  if (reducedMotion() || !window.matchMedia("(hover: hover)").matches) return;
  const split = (container || document).querySelector(".ingot-split");
  if (!split || !split.querySelector(".ingot-visual")) return;
  let raf = null;
  split.addEventListener("pointermove", (e) => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = null;
      const rect = split.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      split.style.setProperty("--parallax-x", (-px * HERO_PARALLAX_MAX_PX * 2 * MOTION).toFixed(1) + "px");
      split.style.setProperty("--parallax-y", (-py * HERO_PARALLAX_MAX_PX * 2 * MOTION).toFixed(1) + "px");
    });
  });
  split.addEventListener("pointerleave", () => {
    split.style.setProperty("--parallax-x", "0px");
    split.style.setProperty("--parallax-y", "0px");
  });
}

/* A small critically-damped-ish spring (Hooke's law + velocity damping),
   used for the quiz answer row instead of CSS transitions — multi-
   property motion (position + rotation + scale + opacity all arriving
   together) settles with one coherent physical feel this way, rather
   than three CSS properties each easing on their own separate curve.
   Reduced motion skips straight to the resting values, no animation. */
function qzApplyTransform(el, v){
  el.style.transform = `translate(${v.x || 0}px, ${v.y || 0}px) rotate(${v.rot || 0}deg) scale(${v.scale != null ? v.scale : 1})`;
  if (v.opacity != null) el.style.opacity = v.opacity;
}
function qzSpring(el, from, to, opts){
  if (reducedMotion()){ qzApplyTransform(el, to); return; }
  opts = opts || {};
  const stiffness = opts.stiffness || 210, damping = opts.damping || 22;
  const keys = Object.keys(to);
  const pos = {}, vel = {};
  keys.forEach(k => { pos[k] = from[k] != null ? from[k] : to[k]; vel[k] = 0; });
  qzApplyTransform(el, pos);
  (function tick(){
    let settled = true;
    keys.forEach(k => {
      const dx = to[k] - pos[k];
      vel[k] += (stiffness * dx - damping * vel[k]) / 60;
      pos[k] += vel[k] / 60;
      if (Math.abs(dx) > 0.001 || Math.abs(vel[k]) > 0.001) settled = false;
    });
    qzApplyTransform(el, settled ? to : pos);
    if (!settled) requestAnimationFrame(tick);
  })();
}

/* click ripple for every .btn, via delegation since buttons are
   re-created on every render rather than persisting in the DOM */
document.addEventListener("pointerdown", (e) => {
  const btn = e.target.closest(".btn");
  if (!btn || reducedMotion()) return;
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const ripple = document.createElement("span");
  ripple.className = "ripple";
  ripple.style.width = ripple.style.height = size + "px";
  ripple.style.left = (e.clientX - rect.left - size/2) + "px";
  ripple.style.top = (e.clientY - rect.top - size/2) + "px";
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 650);
});

/* =========================================================================
   PREMIUM SCROLLBAR — a thin overlay track + capsule thumb standing in for
   the native scrollbar (hidden via CSS above). Real scrolling is never
   touched: wheel, trackpad, keyboard, and screen readers all keep working
   exactly as the browser already handles them. This only draws a visual
   position indicator and an optional drag handle on top of it.

   Generalized into createScrollbarController() so the exact same math,
   easing, and drag/hover/hide behavior can drive more than one scrollable
   surface with zero duplicated logic — initScrollbar() below wires it up
   for the page itself, and result.js's result-detail modal reuses this
   same factory (bound to the modal's own scroll container instead of the
   window) rather than reimplementing a second scrollbar system.

   Two positions are tracked deliberately: state.targetY (where the thumb
   belongs *right now*, from the real scroll fraction) and state.y (where
   it's actually drawn). Every animation frame nudges y a fraction of the
   way toward targetY (a lerp) rather than snapping straight to it — that
   fractional catch-up is the "slight, elegant delay" the thumb should
   have, and it costs nothing but one line of math (no easing library, no
   spring state to tune). Dragging bypasses the lerp entirely and sets y
   directly, matching the pointer 1:1 — a delayed thumb while the pointer
   is actively moving it reads as laggy/disconnected, not calm.

   The rAF loop only runs while something is actually changing (scrolling,
   dragging, or still catching up from a lerp) and stops itself once
   settled, rather than ticking forever in the background. */
const SB_HIDE_MS = 1100;   // fade out this long after the last scroll (spec: ~1-1.2s)
const SB_MIN_THUMB = 28;   // never let the thumb get too small to grab
const SB_LERP = 0.22;      // how much of the remaining distance to close per frame

// config: { rail, track, thumb, getScrollTop(), getScrollHeight(), getViewportHeight(), scrollTo(px, smooth), scrollEventTarget }
// getScrollTop/getScrollHeight/getViewportHeight/scrollTo abstract away
// *what* is scrolling (window vs. a specific element) so every other piece
// of behavior below — measuring, lerping, dragging, hover/hide timing —
// stays identical regardless of which surface a given instance controls.
function createScrollbarController(config){
  const { rail, track, thumb, getScrollTop, getScrollHeight, getViewportHeight, scrollTo, scrollEventTarget } = config;
  const state = {
    y: 0, targetY: 0,          // thumb's top offset within the track, in px
    thumbH: 24, travel: 1,      // thumb height and the track's usable travel (trackH - thumbH)
    dragging: false, dragOffset: 0,
    hovering: false,
    hideTimer: null,
    looping: false,
    reduce: false,
  };

  function measure(){
    const trackH = track.clientHeight;
    const docH = getScrollHeight();
    const viewH = getViewportHeight();
    const ratio = viewH / Math.max(docH, 1);
    state.thumbH = Math.max(SB_MIN_THUMB, Math.min(trackH, trackH * ratio));
    state.travel = Math.max(1, trackH - state.thumbH);
    thumb.style.height = state.thumbH + "px";
  }
  function maxScroll(){
    return Math.max(1, getScrollHeight() - getViewportHeight());
  }
  function syncTarget(){
    const frac = Math.min(1, Math.max(0, getScrollTop() / maxScroll()));
    state.targetY = frac * state.travel;
  }
  function show(){
    rail.classList.add("active");
    if (state.hideTimer){ clearTimeout(state.hideTimer); state.hideTimer = null; }
  }
  function scheduleHide(){
    if (state.hideTimer) clearTimeout(state.hideTimer);
    state.hideTimer = setTimeout(() => {
      state.hideTimer = null;
      if (!state.hovering && !state.dragging) rail.classList.remove("active");
    }, SB_HIDE_MS);
  }
  function ensureLoop(){
    if (state.looping) return;
    state.looping = true;
    requestAnimationFrame(tick);
  }
  function tick(){
    if (state.dragging || state.reduce){
      state.y = state.targetY; // direct 1:1 while dragging; instant snap under reduced motion
    } else {
      state.y += (state.targetY - state.y) * SB_LERP;
      if (Math.abs(state.targetY - state.y) < 0.15) state.y = state.targetY;
    }
    thumb.style.transform = `translateY(${state.y}px)`;
    const settled = state.y === state.targetY;
    if (!settled || state.dragging){
      requestAnimationFrame(tick);
    } else {
      state.looping = false;
    }
  }
  function onScroll(){
    syncTarget();
    show();
    ensureLoop();
    scheduleHide();
  }
  function clientYToScroll(clientY){
    const rect = track.getBoundingClientRect();
    const thumbTop = clientY + state.dragOffset; // desired thumb top edge, viewport coords
    const frac = Math.min(1, Math.max(0, (thumbTop - rect.top) / state.travel));
    return frac * maxScroll();
  }
  function pointerDownThumb(e){
    e.preventDefault();
    state.dragging = true;
    rail.classList.add("dragging");
    // Offset between the pointer and the thumb's own top edge, so the thumb
    // doesn't jump to re-center under the cursor the instant the drag starts.
    const rect = thumb.getBoundingClientRect();
    state.dragOffset = rect.top - e.clientY;
    thumb.setPointerCapture(e.pointerId);
    show();
    ensureLoop();
  }
  function pointerMove(e){
    if (!state.dragging) return;
    scrollTo(clientYToScroll(e.clientY), false);
    syncTarget();
  }
  function pointerUp(e){
    if (!state.dragging) return;
    state.dragging = false;
    rail.classList.remove("dragging");
    try { thumb.releasePointerCapture(e.pointerId); } catch(err){}
    scheduleHide();
  }
  function pointerDownTrack(e){
    const rect = track.getBoundingClientRect();
    const clickFrac = Math.min(1, Math.max(0, (e.clientY - rect.top - state.thumbH / 2) / state.travel));
    scrollTo(clickFrac * maxScroll(), !state.reduce);
  }

  // Re-measures and re-syncs against whatever the scroll surface's
  // current size/position actually is — called on init, and by any
  // caller whose content just changed size (a window resize for the page
  // instance, a freshly-poured detail card for the modal instance).
  function refresh(){
    measure();
    syncTarget();
    ensureLoop();
  }

  state.reduce = reducedMotion();
  measure();
  syncTarget();
  state.y = state.targetY;
  thumb.style.transform = `translateY(${state.y}px)`;

  scrollEventTarget.addEventListener("scroll", onScroll, { passive: true });
  thumb.addEventListener("pointerdown", pointerDownThumb);
  thumb.addEventListener("pointermove", pointerMove);
  thumb.addEventListener("pointerup", pointerUp);
  thumb.addEventListener("pointercancel", pointerUp);
  track.addEventListener("pointerdown", pointerDownTrack);

  const onEnter = () => { state.hovering = true; show(); };
  const onLeave = () => { state.hovering = false; scheduleHide(); };
  thumb.addEventListener("mouseenter", () => { rail.classList.add("hover"); onEnter(); });
  thumb.addEventListener("mouseleave", () => { rail.classList.remove("hover"); onLeave(); });
  track.addEventListener("mouseenter", onEnter);
  track.addEventListener("mouseleave", onLeave);

  window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", (e) => { state.reduce = e.matches; });

  return { refresh };
}

let pageScrollbar = null;
function initScrollbar(){
  const rail = document.getElementById("sbRail");
  if (!rail) return;
  const track = document.getElementById("sbTrack");
  const thumb = document.getElementById("sbThumb");

  pageScrollbar = createScrollbarController({
    rail, track, thumb,
    getScrollTop: () => window.scrollY,
    getScrollHeight: () => document.documentElement.scrollHeight,
    getViewportHeight: () => window.innerHeight,
    scrollTo: (top, smooth) => window.scrollTo({ top, behavior: smooth ? "smooth" : "auto" }),
    scrollEventTarget: window,
  });

  window.addEventListener("resize", () => pageScrollbar.refresh());

  // #app's innerHTML is replaced wholesale on every screen navigation,
  // which routinely changes the document's total scrollable height (a
  // short landing page vs. a long results page) — re-measure so the
  // thumb's size/travel stay correct without waiting for a resize.
  const app = document.getElementById("app");
  if (app){
    new MutationObserver(() => pageScrollbar.refresh()).observe(app, { childList: true, subtree: true });
  }
}
initScrollbar();

/* attachCustomScrollbar(scrollEl, host)
   Gives any scrolling element the site's own scrollbar (the same rail/track/thumb markup, classes,
   colours and behaviour as the page scrollbar and the result-detail panel), driven by the same
   createScrollbarController(). `scrollEl` is the element that actually scrolls (its native bar is
   hidden by CSS); `host` is a positioned, overflow-hidden ancestor that stays put while scrollEl
   scrolls, so the overlay doesn't scroll away with the content. Returns the controller. */
function attachCustomScrollbar(scrollEl, host){
  if (!scrollEl || !host) return null;
  const rail = document.createElement("div");
  rail.className = "scrollbar-rail detail-scrollbar-rail";
  rail.setAttribute("aria-hidden", "true");
  rail.innerHTML = '<div class="scrollbar-track"></div><div class="scrollbar-thumb"></div>';
  host.appendChild(rail);
  const ctrl = createScrollbarController({
    rail,
    track: rail.querySelector(".scrollbar-track"),
    thumb: rail.querySelector(".scrollbar-thumb"),
    getScrollTop: () => scrollEl.scrollTop,
    getScrollHeight: () => scrollEl.scrollHeight,
    getViewportHeight: () => scrollEl.clientHeight,
    scrollTo: (top, smooth) => scrollEl.scrollTo({ top, behavior: smooth ? "smooth" : "auto" }),
    scrollEventTarget: scrollEl,
  });
  if (window.ResizeObserver){
    const ro = new ResizeObserver(() => ctrl.refresh());
    ro.observe(scrollEl);
    Array.prototype.forEach.call(scrollEl.children, c => ro.observe(c));
  }
  window.addEventListener("resize", () => ctrl.refresh());
  return ctrl;
}

/* ---------------- service worker registration -----------------------------
   Every page loads global.js, so this runs once per page load regardless
   of which page is entered first — the browser dedupes repeat
   registrations of the same script/scope on its own, so navigating
   between pages never re-installs anything. A relative path (not
   "/service-worker.js") so the registered scope is wherever the app
   actually lives (a GitHub Pages project subpath, a custom domain root,
   or this project's own local-dev root) rather than assuming the site
   is deployed at its host's domain root.
   Without this call actually registering the worker, everything else in
   service-worker.js — precaching, offline fallback, the clean-URL
   mapping, 404.html's own scope-detection lookup — never runs in any
   browser; the file existing on disk isn't enough on its own. Registered
   after "load" so it never competes with the current page's own
   resources for bandwidth, and wrapped in a feature check + silent
   catch so an unsupported context (e.g. this file opened directly via
   file://, which has no service worker support at all) never breaks the
   page — the app works fully online either way, just without the
   offline/installable behavior.

   Update detection: the browser already re-fetches service-worker.js on
   its own and silently installs a new worker in the background whenever
   its bytes change (that part needs no code at all) — the only thing
   this adds is noticing when that new worker has finished installing and
   is sitting in the "waiting" state (see service-worker.js's "UPDATE
   FLOW" comment for why it waits instead of taking over immediately),
   and surfacing that as a small toast rather than leaving it invisible
   until the next full reload. */
if ("serviceWorker" in navigator){
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js?v=v1.0.2").then((reg) => {
      // A worker can already be sitting in "waiting" the moment this page
      // loads (installed by a tab that was open earlier) — catch that
      // case immediately instead of only reacting to a fresh install.
      if (reg.waiting && navigator.serviceWorker.controller) showUpdateToast(reg.waiting);

      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener("statechange", () => {
          // "installed" + an existing controller means a real update is
          // ready — the same state during the very first install has no
          // controller yet and nothing meaningful to refresh from.
          if (newWorker.state === "installed" && navigator.serviceWorker.controller){
            showUpdateToast(newWorker);
          }
        });
      });
    }).catch(() => {
      // Registration failed (unsupported context) — nothing to recover,
      // the app itself doesn't depend on this succeeding.
    });

    // Reload once the new worker actually takes control (not the instant
    // "Refresh" is clicked) so the page never runs half-controlled by the
    // old worker. The flag guards against a duplicate reload if this ever
    // fires more than once.
    let pfSwRefreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (pfSwRefreshing) return;
      pfSwRefreshing = true;
      location.reload();
    });
  });
}

// Small, self-contained "update available" toast. Styled inline rather
// than via the app's stylesheets since this is PWA-update plumbing, not
// app UI — it has no dependency on (and no effect on) the site's own
// CSS. Bottom-right, dismisses itself by reloading once Refresh is
// clicked; calling this twice (two updates found in one session) is a
// no-op the second time since the first toast is still on screen.
function showUpdateToast(waitingWorker){
  if (document.getElementById("pf-update-toast")) return;
  const toast = document.createElement("div");
  toast.id = "pf-update-toast";
  toast.setAttribute("role", "status");
  toast.style.cssText = [
    "position:fixed", "right:20px", "bottom:20px", "z-index:2147483647",
    "display:flex", "align-items:center", "gap:14px",
    "background:#1a1a1f", "color:#f5f5f7", "border:1px solid rgba(255,255,255,.14)",
    "border-radius:12px", "padding:12px 16px", "box-shadow:0 8px 28px rgba(0,0,0,.4)",
    "font:14px/1.4 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
    "max-width:min(90vw,340px)",
  ].join(";");
  toast.innerHTML =
    '<span>✨ A new version of Forge is available.</span>' +
    '<button type="button" style="flex-shrink:0;background:#7c5cff;color:#fff;border:none;' +
    'border-radius:8px;padding:7px 14px;font:inherit;font-weight:600;cursor:pointer;">Refresh</button>';
  toast.querySelector("button").addEventListener("click", () => {
    waitingWorker.postMessage("SKIP_WAITING");
  });
  document.body.appendChild(toast);
}


/* =============================================================================
   BENTO TONE ASSIGNMENT
   Gives every bento card one of seven flat Forge tones so that no two cards
   that touch (edge-to-edge, or corner-to-corner within the grid gap) ever
   share a colour family or a near-identical hue. It reads the real rendered
   geometry, so it holds at every breakpoint (desktop 12-col grids, tablet
   2-up, mobile single column) and for cards that are rendered later by
   page scripts. Pure greedy graph colouring: neighbours' tones (and tones
   similar to them) are forbidden, then the least-used remaining tone wins
   so colour spreads evenly across the page. CSS owns what each tone looks
   like (see [data-tone] rules in css/pages.css); this only picks which.
   ============================================================================= */
(function forgeBentoTones(){
  const SEL = ".bento-card, .card.glass, .lp-feature, .lp-cta-panel, .cmp-style-row"; // .qz-card is excluded on purpose: its tones are fixed in the quiz markup
  const TONES = ["indigo", "mint", "cream", "peach", "violet", "gold"];
  const FAMILY = { indigo:"blue", violet:"purple", cream:"neutral", mint:"green", peach:"orange", gold:"yellow", sky:"cyan" };
  // Families that read as "the same colour" to the eye even though they differ.
  const SIMILAR = [["blue","purple"], ["blue","cyan"], ["orange","yellow"]];
  const clash = (a, b) => {
    const fa = FAMILY[a], fb = FAMILY[b];
    return fa === fb || SIMILAR.some(([x, y]) => (x === fa && y === fb) || (x === fb && y === fa));
  };
  const NEAR = 44; // px: wider than any grid gap in the app, narrower than a card
  function touches(a, b){
    const gapX = Math.max(a.left - b.right, b.left - a.right);
    const gapY = Math.max(a.top - b.bottom, b.top - a.bottom);
    return gapX < NEAR && gapY < NEAR;
  }
  // Seeded PRNG so a given layout always resolves to the same colours (no flicker between recalculations).
  function rng(seed){ return function(){ seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function assign(){
    const all = Array.from(document.querySelectorAll(SEL)).filter(el => {
      if (el.parentElement && el.parentElement.closest(SEL)) return false; // nested panels inherit
      if (el.closest("[hidden], .hidden")) return false;
      const r = el.getBoundingClientRect();
      return r.width > 8 && r.height > 8;
    });
    // Measure where each card actually sits in the layout, not where an entrance animation has it right now
    // (quiz answers spring in from off-screen offsets): clear own transforms for the read, then restore.
    const saved = all.map(el => el.style.transform);
    all.forEach(el => { el.style.transform = "none"; });
    const rects = all.map(el => {
      const r = el.getBoundingClientRect();
      return { left: r.left + scrollX, right: r.right + scrollX, top: r.top + scrollY, bottom: r.bottom + scrollY };
    });
    all.forEach((el, i) => { el.style.transform = saved[i]; });
    // Neighbour graph: edge neighbours (share a side) are weighted heavily, corner neighbours lightly.
    const nb = all.map(() => []);
    for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++){
      const A = rects[i], B = rects[j];
      const gapX = Math.max(A.left - B.right, B.left - A.right);
      const gapY = Math.max(A.top - B.bottom, B.top - A.bottom);
      if (gapX >= NEAR || gapY >= NEAR) continue;
      const overlapX = Math.min(A.right, B.right) - Math.max(A.left, B.left);
      const overlapY = Math.min(A.bottom, B.bottom) - Math.max(A.top, B.top);
      const w = (overlapX > 8 || overlapY > 8) ? 4 : 1;
      nb[i].push([j, w]); nb[j].push([i, w]);
    }
    const cost = (ti, tj, w) => (ti === tj ? 10 * w : clash(ti, tj) ? 3 * w : 0);
    let best = null, bestCost = Infinity;
    for (let attempt = 0; attempt < 80 && bestCost > 0; attempt++){
      const rand = rng(attempt * 7919 + 13);
      const used = Object.fromEntries(TONES.map(t => [t, 0]));
      const chosen = new Array(all.length);
      let total = 0;
      for (let i = 0; i < all.length; i++){
        const scored = TONES.map(t => {
          let c = 0;
          nb[i].forEach(([j, w]) => { if (j < i) c += cost(t, chosen[j], w); });
          return { t, c, k: used[t] + rand() * 1.5 };
        });
        scored.sort((x, y) => x.c - y.c || x.k - y.k);
        chosen[i] = scored[0].t; used[scored[0].t]++; total += scored[0].c;
      }
      if (total < bestCost){ bestCost = total; best = chosen; }
    }
    all.forEach((el, i) => { if (el.dataset.tone !== best[i]) el.dataset.tone = best[i]; });
  }
  let t = null;
  let t2 = null;
  const schedule = () => { clearTimeout(t); clearTimeout(t2); t = setTimeout(assign, 90); t2 = setTimeout(assign, 650); };
  const start = () => {
    assign();
    window.addEventListener("resize", schedule);
    window.addEventListener("load", schedule);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);
    // Cards inserted by a page script get their final colour in the same task, before the browser can
    // paint them: MutationObserver callbacks run as a microtask, ahead of the next frame. (Anything else
    // that mutates the DOM, e.g. count-up text, only schedules a debounced re-check.)
    const hasCard = n => n.nodeType === 1 && ((n.matches && n.matches(SEL)) || (n.querySelector && n.querySelector(SEL)));
    new MutationObserver(muts => {
      if (muts.some(m => Array.prototype.some.call(m.addedNodes, hasCard))) assign();
      else schedule();
    }).observe(document.body, { childList: true, subtree: true });
    // Layout reflows (breakpoint changes, fonts, late content) change the body size even when no resize event is seen.
    if (window.ResizeObserver) new ResizeObserver(schedule).observe(document.body);
    new MutationObserver(schedule).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    [400, 1200, 2600].forEach(ms => setTimeout(assign, ms));
  };
  // global.js loads at the end of <body>, so body already exists: start observing immediately. Waiting for
  // DOMContentLoaded would miss cards that a page's own inline boot script renders before that event.
  if (document.body) { start(); document.addEventListener("DOMContentLoaded", assign); }
  else document.addEventListener("DOMContentLoaded", start);
})();

/* Gentle pointer parallax on the home bento's decorative shapes. */
(function forgeParallax(){
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || !matchMedia("(hover: hover)").matches) return;
  const canvas = document.querySelector(".lp-bento-canvas");
  if (!canvas) return;
  canvas.addEventListener("pointermove", e => {
    const r = canvas.getBoundingClientRect();
    canvas.style.setProperty("--px", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
    canvas.style.setProperty("--py", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
  });
  canvas.addEventListener("pointerleave", () => { canvas.style.setProperty("--px", 0); canvas.style.setProperty("--py", 0); });
})();


/* Archetype ambience: tint the page's ambient light with the visitor's own
   soul colour so the whole product subtly takes on their result. Falls back
   to the default indigo when there is no result yet. */
(function forgeAmbient(){
  function apply(){
    try{
      const profile = typeof getLocalProfile === "function" ? getLocalProfile() : null;
      const decoded = profile && profile.code && typeof decodeCode === "function" ? decodeCode(profile.code) : null;
      if (!decoded || decoded.obsolete) return;
      const hex = computeSoulType(decoded.normDims).hex;
      if (/^#[0-9a-f]{6}$/i.test(hex)){
        const root = document.documentElement;
        root.style.setProperty("--ambient", hex);
        const n = parseInt(hex.slice(1), 16), r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
        const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
        let h = 0;
        if (d){ h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h = (h * 60 + 360) % 360; }
        const warm = h < 70 || h > 300;               // warm souls: livelier light, cool souls: slower, deeper
        root.style.setProperty("--ambient-dur", (warm ? 7 : 13) + "s");
        root.style.setProperty("--ax", (10 + (h / 360) * 40).toFixed(0) + "%");
      }
    } catch(e){ /* decorative only */ }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply); else apply();
})();

/* Card tilt: pointer position inside a card nudges it a few degrees. */
(function forgeTilt(){
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || !matchMedia("(hover: hover)").matches) return;
  const SEL = ".bento-card, .card.glass, .lp-feature, .lp-cta-panel";
  document.addEventListener("pointermove", e => {
    const el = e.target.closest && e.target.closest(SEL);
    if (!el) return;
    if (overControl(e.target, el)) return;      // over a button / link / input / select / slider inside the card: freeze, don't chase the cursor
    const r = el.getBoundingClientRect();
    el.style.setProperty("--tx", (((e.clientX - r.left) / r.width - .5) * 2).toFixed(2));
    el.style.setProperty("--ty", (((e.clientY - r.top) / r.height - .5) * 2).toFixed(2));
  }, { passive: true });
  document.addEventListener("pointerout", e => {
    const el = e.target.closest && e.target.closest(SEL);
    if (el && !el.contains(e.relatedTarget)) { el.style.removeProperty("--tx"); el.style.removeProperty("--ty"); }
  });
})();


/* Result hero parallax: the framed image drifts against pointer and scroll,
   so foreground type and background image sit on different planes. Off for
   touch and reduced motion. */
(function forgeHeroParallax(){
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || !matchMedia("(hover: hover)").matches) return;
  function bind(){
    const hero = document.querySelector(".result-hero .ingot");
    if (!hero || hero.dataset.parallax) return;
    hero.dataset.parallax = "1";
    hero.addEventListener("pointermove", e => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty("--hx", (((e.clientX - r.left) / r.width - .5) * 2).toFixed(2));
      hero.style.setProperty("--hy", (((e.clientY - r.top) / r.height - .5) * 2).toFixed(2));
    }, { passive: true });
    hero.addEventListener("pointerleave", () => { hero.style.setProperty("--hx", 0); hero.style.setProperty("--hy", 0); });
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (ticking) return; ticking = true;
      requestAnimationFrame(() => {
        const r = hero.getBoundingClientRect();
        hero.style.setProperty("--hs", Math.max(-40, Math.min(40, -r.top * 0.08)).toFixed(1));
        ticking = false;
      });
    }, { passive: true });
  }
  bind();
  new MutationObserver(bind).observe(document.body, { childList: true, subtree: true });
})();

/* Auto ink: any element tagged [data-auto-ink] (or an avatar fallback) picks
   black or white text from its own background luminance, so text over a
   per-user colour is always readable. */
(function forgeAutoInk(){
  const SEL = "[data-auto-ink], .profile-avatar-fallback";
  const lin = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); };
  function apply(){
    document.querySelectorAll(SEL).forEach(el => {
      const m = getComputedStyle(el).backgroundColor.match(/[\d.]+/g);
      if (!m) return;
      const L = .2126 * lin(+m[0]) + .7152 * lin(+m[1]) + .0722 * lin(+m[2]);
      const dark = "#0B0E1F", light = "#FFFFFF";
      const cDark = (L + .05) / (lin(11) * .2126 + lin(14) * .7152 + lin(31) * .0722 + .05);
      const cLight = 1.05 / (L + .05);
      el.style.color = cDark >= cLight ? dark : light;
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply); else apply();
  new MutationObserver(apply).observe(document.body || document.documentElement, { childList: true, subtree: true });
})();
