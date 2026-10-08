/* =========================================================================
   FORGE - COMPATIBILITY (shared helpers for compare.html)
   The loading beat before a result, the band colours, the two overlay radar charts and the
   state the Compare page shares (compareState). The two-person REPORT itself is no longer here:
   it is one article built by Forge.story and rendered by js/compare-story.js.
   ========================================================================= */

let compareState = null;

/* ---------------- COMPATIBILITY LOADING TRANSITION ------------------------
   A brief "calculating" beat before a compare result appears, matching the
   forging screen's rhythm so checking compatibility feels like its own
   real moment rather than an instant lookup. */
function showCompatibilityLoading(out, done){
  const lines = pickLines(4, COMPATIBILITY_CALC_LINES);
  out.innerHTML = `
    <div class="section revealed">
      <div class="card glass compat-loading">
        <div class="calc-bars"><span></span><span></span><span></span><span></span></div>
        <p id="compat-loading-line">${lines[0]}...</p>
      </div>
    </div>`;
  let i = 0;
  const interval = setInterval(() => {
    i++;
    const el = document.getElementById("compat-loading-line");
    if (el && lines[i]) el.textContent = lines[i] + "...";
  }, 380);
  setTimeout(() => {
    clearInterval(interval);
    done();
  }, 1650);
}


function bandColor(band){
  const map = {
    "Extremely Incompatible": "#FB7185",
    "Difficult": "#FDBA74",
    "Mixed": "#FACC15",
    "Good": "#7DD3FC",
    "Excellent": "#6EE7B7",
    "Exceptional": "#A78BFA",
  };
  return map[band] || "#A7B0C2";
}

function hexToRgbaCompat(hex, alpha){
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0,2), 16), g = parseInt(h.substring(2,4), 16), b = parseInt(h.substring(4,6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
// Two-profile overlay radar, used for both "Mind Map" (all 25 dims) and
// "Emotion Radar" (the narrower EMOTION_RADAR_DIMS subset) in Compare 2.0
// — same drawing code, just a different dim list and no growth animation
// (comparing two static shapes, not revealing one).
function drawCompareRadar(canvas, dims, normDimsA, colorA, normDimsB, colorB){
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const n = dims.length;
  const labels = dims.map(d => RADAR_LABELS[d] || d);
  const containerWidth = (canvas.parentElement && canvas.parentElement.clientWidth) || 360;
  const fontSize = Math.max(9, Math.min(12, containerWidth / 30));
  ctx.font = `${fontSize}px Manrope, sans-serif`;
  let maxLabelWidth = 0;
  labels.forEach(l => { maxLabelWidth = Math.max(maxLabelWidth, ctx.measureText(l).width); });
  const available = Math.min(420, containerWidth - 8);
  // At n=25 (the full Mind Map), axes sit only 14.4deg apart, so labels
  // held at a single fixed radius read as overlapping (worst case:
  // adjacent labels merging into one unreadable run, e.g. "Discipline"/
  // "Kindness" at the bottom vertex). Below ~13 axes (e.g. the Emotion
  // Radar's shorter dim list) there's enough angular room that a single
  // radius already reads cleanly, so this only kicks in when the axis
  // count actually needs it -- ported from drawRadar()'s identical fix
  // in result.js, generalized to any n instead of a fixed dim list.
  const needsStagger = n > 12;
  const margin = Math.min(available * 0.32, maxLabelWidth + 16 + (needsStagger ? 12 : 0));
  const size = available;
  canvas.width = size * dpr; canvas.height = size * dpr;
  canvas.style.width = size + "px"; canvas.style.height = size + "px";
  ctx.scale(dpr, dpr);
  const cx = size/2, cy = size/2, R = Math.max(60, size/2 - margin);
  ctx.clearRect(0,0,size,size);
  const isLight = document.documentElement.dataset.theme === "light";
  const gridColor = isLight ? "rgba(15,23,42,0.10)" : "rgba(255,255,255,0.08)";
  const spokeColor = isLight ? "rgba(15,23,42,0.07)" : "rgba(255,255,255,0.06)";
  const labelColor = isLight ? "rgba(15,23,42,0.68)" : "rgba(248,250,252,0.62)";

  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  for (let ring = 1; ring <= 4; ring++){
    ctx.beginPath();
    for (let i = 0; i <= n; i++){
      const angle = (i / n) * Math.PI * 2 - Math.PI/2;
      const r = (R * ring)/4;
      const x = cx + Math.cos(angle) * r, y = cy + Math.sin(angle) * r;
      i === 0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
    }
    ctx.stroke();
  }
  ctx.fillStyle = labelColor;
  ctx.font = `${fontSize}px Manrope, sans-serif`;
  ctx.textBaseline = "middle";
  // Labels are placed one by one at the smallest radius where they do not touch an
  // already-placed label (stepping outward), then kept inside the canvas. This
  // replaces a fixed 3-tier stagger, which still let neighbours collide on the
  // 25-axis Mind Map. Spokes are drawn first so labels sit on top of them.
  const placed = [];
  const lh = fontSize * 1.2;
  const overlaps = (p, q) => p.x0 < q.x1 + 3 && p.x1 > q.x0 - 3 && p.y0 < q.y1 + 1 && p.y1 > q.y0 - 1;
  dims.forEach((d, i) => {
    const angle = (i / n) * Math.PI * 2 - Math.PI/2;
    ctx.strokeStyle = spokeColor;
    ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx + Math.cos(angle) * R, cy + Math.sin(angle) * R); ctx.stroke();
  });
  dims.forEach((d, i) => {
    const angle = (i / n) * Math.PI * 2 - Math.PI/2;
    const cosA = Math.cos(angle), sinA = Math.sin(angle);
    const align = cosA > 0.15 ? "left" : cosA < -0.15 ? "right" : "center";
    const w = ctx.measureText(labels[i]).width;
    let lx = 0, ly = 0, rect = null;
    for (let off = R + 12, step = 0; step < 16; step++, off += 5){
      lx = cx + cosA * off; ly = cy + sinA * off;
      const x0 = align === "left" ? lx : align === "right" ? lx - w : lx - w / 2;
      rect = { x0, x1: x0 + w, y0: ly - lh / 2, y1: ly + lh / 2 };
      if (!placed.some(p => overlaps(p, rect))) break;
    }
    const shift = rect.x0 < 2 ? 2 - rect.x0 : rect.x1 > size - 2 ? size - 2 - rect.x1 : 0;
    lx += shift; rect.x0 += shift; rect.x1 += shift;
    placed.push(rect);
    ctx.textAlign = align;
    ctx.fillText(labels[i], lx, ly);
  });

  const drawPolygon = (normDims, color) => {
    ctx.beginPath();
    dims.forEach((d, i) => {
      const angle = (i / n) * Math.PI * 2 - Math.PI/2;
      const val = Math.max(0, Math.min(1, ((normDims[d]||0) + 10) / 20));
      const r = R * val;
      const x = cx + Math.cos(angle) * r, y = cy + Math.sin(angle) * r;
      i === 0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
    });
    ctx.closePath();
    ctx.fillStyle = hexToRgbaCompat(color, 0.16);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.fill(); ctx.stroke();
  };
  drawPolygon(normDimsA, colorA);
  drawPolygon(normDimsB, colorB);
}

// Draws the two dual-overlay radar canvases the article's Balance chapter contains. They must already be in the DOM,
// because drawCompareRadar() sizes itself off canvas.parentElement.
function drawCompareRadars(){
  const { profileA, archA, profileB, archB } = compareState;
  const duo = computeDuoTitle(archA, archB);
  const mind = document.getElementById("cmpRadarMind");
  const emo = document.getElementById("cmpRadarEmotion");
  if (mind) drawCompareRadar(mind, DIMENSIONS, profileA.normDims, duo.colorA, profileB.normDims, duo.colorB);
  if (emo) drawCompareRadar(emo, EMOTION_RADAR_DIMS, profileA.normDims, duo.colorA, profileB.normDims, duo.colorB);
}
// Called by toggleTheme() (global.js) when it exists on this page. Both
// canvases bake theme-dependent grid/label colors in at draw time (see
// the isLight check inside drawCompareRadar) — redrawing in place is
// enough, no need to rebuild the article around them.
function redrawCompareCanvasesForTheme(){
  if (typeof compareState !== "undefined" && compareState && document.getElementById("cmpRadarMind")) drawCompareRadars();
}
