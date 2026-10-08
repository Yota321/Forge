/* =========================================================================
   FORGE CORE - shared profile model, score scales, facets, randomness.
   Loaded after engine.js. No DOM access: pure computation + tiny helpers, so
   every engine built on top of it is testable in Node (see tests/).

   SCORE CONVENTIONS (the only ones used by Forge engines)
   -------------------------------------------------------
   RAW      -10..+10   engine.js normDims. The ONLY stored representation.
   PCT       0..100    toPct(raw). Display + percent-style outputs.
   UNIT      0..1      toUnit(raw). Weighted blends / probabilities.
   BIPOLAR  -1..+1     toBipolar(raw). Signed similarity / difference maths.
   Every function that takes or returns a number says which scale in its name
   or doc comment. Conversions go through the helpers below, never inline.

   FACETS
   ------
   The 25 raw dimensions overlap (kindness/empathy, discipline/planning...).
   Engines that reason about people (compare, party, ask, manual, worlds) use
   FACETS instead: 16 weighted, signed blends of dimensions, each dimension
   contributing to as few facets as the meaning allows. A facet is a RAW-scale
   value, so "creativity 7" and "facet.explore 7" mean the same kind of thing.
   This is what stops one dimension being counted three times in a result.
   ========================================================================= */
var Forge = (typeof globalThis !== "undefined" ? globalThis : window).Forge = (typeof globalThis !== "undefined" ? globalThis : window).Forge || {};

(function(F){
  "use strict";

  F.MODEL_VERSION = 1;          // shape of the normalized profile below
  F.PACKAGE_VERSION = 1;        // .forge archive schema (see package.js)

  /* ---------------- scales ---------------- */
  const num = (v, fallback = 0) => (typeof v === "number" && isFinite(v)) ? v : fallback;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, num(v, lo)));
  F.num = num;
  F.clamp = clamp;
  F.clampRaw = v => clamp(Math.round(num(v, 0)), -10, 10);
  F.clampPct = v => clamp(Math.round(num(v, 0)), 0, 100);
  F.clamp01 = v => clamp(num(v, 0), 0, 1);
  F.toPct = raw => clamp((num(raw, 0) + 10) * 5, 0, 100);
  F.toUnit = raw => clamp((num(raw, 0) + 10) / 20, 0, 1);
  F.toBipolar = raw => clamp(num(raw, 0) / 10, -1, 1);
  F.fromUnit = u => clamp(num(u, 0.5) * 20 - 10, -10, 10);
  F.round1 = v => Math.round(num(v, 0) * 10) / 10;
  F.mean = arr => arr.length ? arr.reduce((s, v) => s + num(v, 0), 0) / arr.length : 0;
  F.sum = arr => arr.reduce((s, v) => s + num(v, 0), 0);
  F.variance = arr => { if (arr.length < 2) return 0; const m = F.mean(arr); return F.mean(arr.map(v => (v - m) * (v - m))); };
  F.stdev = arr => Math.sqrt(F.variance(arr));
  F.unique = arr => Array.from(new Set(arr));

  /* ---------------- randomness: three explicit kinds ----------------
     seeded(seed)  deterministic PRNG, for reproducible outputs (tests, "same
                   inputs = same task").
     trueRandom()  genuinely random; used ONLY where the product promises
                   randomness (Wild Card world). Never takes personality data.
     Algorithmic scoring uses neither. */
  F.hashString = function(str){
    let h = 2166136261 >>> 0;
    const s = String(str);
    for (let i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h >>> 0;
  };
  F.seeded = function(seed){
    let a = (typeof seed === "number" ? seed : F.hashString(seed)) >>> 0;
    const next = function(){
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    next.pick = arr => arr.length ? arr[Math.floor(next() * arr.length)] : undefined;
    next.shuffle = arr => { const o = arr.slice(); for (let i = o.length - 1; i > 0; i--){ const j = Math.floor(next() * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; } return o; };
    return next;
  };
  F.trueRandom = function(){
    try{
      if (typeof crypto !== "undefined" && crypto.getRandomValues){
        const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] / 4294967296;
      }
    } catch(e){ /* fall through */ }
    return Math.random();
  };
  F.trueRandomInt = n => Math.floor(F.trueRandom() * n);
  F.trueRandomPick = arr => arr.length ? arr[F.trueRandomInt(arr.length)] : undefined;

  /* ---------------- safe text / ids ---------------- */
  F.esc = function(str){
    return String(str == null ? "" : str).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  };
  F.id = function(prefix){
    const r = (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID().replace(/-/g, "").slice(0, 16)
      : (Date.now().toString(36) + Math.random().toString(36).slice(2, 10));
    return (prefix ? prefix + "_" : "") + r;
  };
  F.isSafeId = id => typeof id === "string" && /^[A-Za-z0-9_-]{1,64}$/.test(id);
  F.safeJSON = function(raw, fallback){
    try{ const v = JSON.parse(raw); return v === undefined ? fallback : v; } catch(e){ return fallback; }
  };
  F.capText = (s, n) => typeof s === "string" ? s.slice(0, n) : "";
  F.listJoin = function(items){
    const a = items.filter(Boolean);
    if (a.length <= 1) return a.join("");
    if (a.length === 2) return a[0] + " and " + a[1];
    return a.slice(0, -1).join(", ") + ", and " + a[a.length - 1];
  };
  F.sentenceCase = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

  /* ---------------- dimension access ---------------- */
  const dimList = () => (typeof DIMENSIONS !== "undefined" ? DIMENSIONS : []);
  const dimLabel = d => (typeof DIM_LABELS !== "undefined" && DIM_LABELS[d]) || d;
  F.dimLabel = dimLabel;
  F.getDimension = function(profile, dim){
    const p = profile && (profile.dims ? profile : null);
    return p ? num(p.dims[dim], 0) : 0;
  };

  /* ---------------- FACETS: signed blends of dimensions ----------------
     weights are signed; the blend is a weighted mean so a facet stays on the
     RAW scale. Each facet is documented with what it means for behaviour. */
  F.FACETS = {
    explore:    { label: "Exploration",        w: { curiosity: 2, openMindedness: 1.5, creativity: 1, risk: 0.5 } },
    invent:     { label: "Invention",          w: { creativity: 2, curiosity: 0.5, humor: 0.5 } },
    analysis:   { label: "Analysis",           w: { logic: 2, selfAwareness: 0.5, patience: 0.5 } },
    structure:  { label: "Structure",          w: { planning: 2, discipline: 1.5, responsibility: 1 } },
    initiative: { label: "Initiative",         w: { drive: 1.5, confidence: 1, leadership: 1, risk: 0.5 } },
    persist:    { label: "Staying power",      w: { persistence: 2, resilience: 1, discipline: 0.5 } },
    warmth:     { label: "Warmth",             w: { empathy: 2, kindness: 1.5, trust: 0.5 } },
    social:     { label: "Social appetite",    w: { socialEnergy: 2, humor: 0.5, optimism: 0.5 } },
    humor:      { label: "Humor",              w: { humor: 2, optimism: 0.5, socialEnergy: 0.5 } },
    autonomy:   { label: "Autonomy",           w: { independence: 2, confidence: 0.5, selfAwareness: 0.5 } },
    steadiness: { label: "Emotional steadiness", w: { emotionalStability: 2, patience: 1, resilience: 1 } },
    flex:       { label: "Flexibility",        w: { adaptability: 2, openMindedness: 1, risk: 0.5 } },
    boldness:   { label: "Boldness",           w: { risk: 2, confidence: 1, competitiveness: 0.5 } },
    trust:      { label: "Trust",              w: { trust: 2, kindness: 0.5, optimism: 0.5 } },
    compete:    { label: "Competitive drive",  w: { competitiveness: 2, drive: 1 } },
    patience:   { label: "Patience",           w: { patience: 2, emotionalStability: 0.5 } },
    optimism:   { label: "Optimism",           w: { optimism: 2, resilience: 0.5, humor: 0.5 } },
  };
  F.FACET_KEYS = Object.keys(F.FACETS);

  F.facetValue = function(dims, key){
    const f = F.FACETS[key];
    if (!f) return 0;
    let s = 0, wsum = 0;
    for (const d in f.w){ s += num(dims && dims[d], 0) * f.w[d]; wsum += f.w[d]; }
    return wsum ? clamp(s / wsum, -10, 10) : 0;
  };
  F.computeFacets = function(dims){
    const out = {};
    F.FACET_KEYS.forEach(k => { out[k] = F.round1(F.facetValue(dims, k)); });
    return out;
  };
  F.facetLabel = k => (F.FACETS[k] && F.FACETS[k].label) || k;

  /* ---------------- confidence ---------------- */
  const DEPTH_BASE = { short: 0.45, balanced: 0.65, deep: 0.8 };
  F.confidenceLevel = function(pct){
    if (pct == null) return "unknown";
    if (pct >= 80) return "high";
    if (pct >= 60) return "moderate";
    if (pct >= 40) return "low";
    return "very low";
  };

  /* Per-dimension confidence, UNIT scale (0..1), with its provenance:
       "session"   measured from this assessment's own answers (best)
       "timeline"  stored with the snapshot when it was taken
       "estimated" no answer history exists (shared/old code): inferred from
                   depth, extremity and stability across snapshots, and capped
                   so an estimate can never look as sure as a measurement. */
  F.estimateDimConfidence = function(dims, opts){
    opts = opts || {};
    const stored = opts.stored;                       // {dim: 0..1} from a timeline snapshot
    const history = opts.history || [];               // earlier snapshots' dims (oldest->newest)
    const base = DEPTH_BASE[opts.depth] != null ? DEPTH_BASE[opts.depth] : 0.55;
    const ageDays = opts.ageDays != null ? opts.ageDays : 0;
    const out = {};
    dimList().forEach(d => {
      const v = num(dims[d], 0);
      if (stored && typeof stored[d] === "number"){
        out[d] = { value: F.clamp01(stored[d]), source: "timeline" };
        return;
      }
      const magnitude = 0.75 + 0.25 * Math.min(1, Math.abs(v) / 8);        // extreme answers are usually consistent ones
      let c = base * magnitude;
      if (history.length >= 2){
        const series = history.map(h => num(h[d], 0)).concat([v]);
        const sd = F.stdev(series);
        c *= sd <= 1 ? 1.12 : sd >= 4 ? 0.8 : 1;                           // stable across snapshots -> more sure
      }
      if (ageDays > 120) c *= 0.88;                                         // old reads fade
      out[d] = { value: F.clamp01(Math.min(c, 0.85)), source: "estimated" };
    });
    return out;
  };

  /* ---------------- normalize / validate / migrate ---------------- */
  /* Accepts any of: decoded code, computed result, timeline entry, imported
     profile record. Returns the one internal shape every engine consumes.
     Never throws: bad input yields {ok:false,...} with a safe empty profile. */
  F.emptyProfile = function(){
    const dims = {};
    dimList().forEach(d => dims[d] = 0);
    return { modelVersion: F.MODEL_VERSION, ok: false, errors: ["empty"], warnings: [], identity: { id: null, name: "", nickname: "" },
      profileCode: null, profileVersion: null, assessmentVersion: null, timestamp: null, depth: null,
      dims, facets: F.computeFacets(dims), archetype: null, runnerUp: null, confidence: { overall: null, level: "unknown", dims: {} },
      uncertainty: { dims: [], areas: [] }, currentState: null, timeline: [], journalRefs: [], growthHistory: [], comparisonHistory: [] };
  };

  F.validateProfile = function(p){
    const errors = [], warnings = [];
    if (!p || typeof p !== "object"){ return { ok: false, errors: ["not an object"], warnings }; }
    const dims = p.dims || p.normDims;
    if (!dims || typeof dims !== "object") errors.push("missing dimensions");
    else dimList().forEach(d => {
      if (!(d in dims)) warnings.push("missing " + d);
      else if (typeof dims[d] !== "number" || !isFinite(dims[d])) errors.push("bad value for " + d);
      else if (dims[d] < -10 || dims[d] > 10) warnings.push("out of range " + d);
    });
    return { ok: errors.length === 0, errors, warnings };
  };

  F.migrateProfile = function(input){
    // The profile CODE is the durable record: an obsolete (<PF4) code has no
    // safe migration, per engine.js policy, and is surfaced as such.
    if (input && typeof input.code === "string" && !input.normDims && !input.dims){
      const d = typeof decodeCode === "function" ? decodeCode(input.code) : null;
      if (d && d.obsolete) return { obsolete: true, version: d.version };
      if (d) return Object.assign({}, input, { normDims: d.normDims, name: input.name || d.name, depthTier: d.depthTier, version: d.version });
    }
    return input;
  };

  F.normalizeProfile = function(input, opts){
    opts = opts || {};
    const out = F.emptyProfile();
    if (!input || typeof input !== "object"){ return out; }
    let src = input;
    const migrated = F.migrateProfile(src);
    if (migrated && migrated.obsolete){ out.errors = ["obsolete code"]; out.obsolete = true; return out; }
    src = migrated || src;

    const rawDims = src.normDims || src.dims || (src.mindMap) || null;
    const check = F.validateProfile({ dims: rawDims });
    if (!check.ok){ out.errors = check.errors; return out; }
    const dims = {};
    dimList().forEach(d => { dims[d] = F.clampRaw(rawDims[d]); });
    out.warnings = check.warnings.slice();

    const code = typeof src.code === "string" ? src.code : (typeof src.profileCode === "string" ? src.profileCode : null);
    const decoded = code && typeof decodeCode === "function" ? decodeCode(code) : null;
    out.ok = true; out.errors = [];
    out.dims = dims;
    out.facets = F.computeFacets(dims);
    out.profileCode = code;
    out.profileVersion = decoded && decoded.version ? "PF" + decoded.version : (src.pfVersion || (src.version ? "PF" + src.version : null));
    out.assessmentVersion = src.assessmentVersion || out.profileVersion;
    out.timestamp = typeof src.timestamp === "number" ? src.timestamp : (opts.timestamp || null);
    out.depth = src.depth || src.depthTier || (src.meta && src.meta.resultDepth) || (decoded && decoded.depthTier) || null;
    const name = (src.name || (decoded && decoded.name) || (src.identity && src.identity.name) || "");
    out.identity = { id: src.profileId || (src.identity && src.identity.id) || null, name: F.capText(String(name), 40), nickname: F.capText(String(src.nickname || ""), 20) };

    // archetype: recomputed from dims (single source of truth, same as engine's freshenDecoded)
    try{
      if (typeof matchArchetype === "function"){
        const m = matchArchetype(dims);
        out.archetype = { id: m.primary.id, name: m.primary.name };
        out.runnerUp = m.runnerUp ? { id: m.runnerUp.id, name: m.runnerUp.name } : null;
        out.ranking = m.ranked.slice(0, 3).map(r => ({ id: r.archetype.id, name: r.archetype.name, score: F.round1(r.score) }));
      }
    } catch(e){ out.warnings.push("archetype unavailable"); }

    const overall = typeof src.confidencePct === "number" ? src.confidencePct
      : (src.confidence && typeof src.confidence.confidencePct === "number" ? src.confidence.confidencePct : null);
    const ageDays = out.timestamp ? Math.max(0, (Date.now() - out.timestamp) / 86400000) : 0;
    const dimConf = F.estimateDimConfidence(dims, { stored: src.dimConfidence, history: opts.historyDims || [], depth: out.depth, ageDays });
    out.confidence = { overall: overall == null ? null : F.clampPct(overall), level: F.confidenceLevel(overall), dims: dimConf };

    // uncertainty: dims we are least sure of AND that carry weight (|value| matters less when unsure)
    const sorted = dimList().map(d => ({ dim: d, conf: dimConf[d].value, value: dims[d], source: dimConf[d].source }))
      .sort((a, b) => a.conf - b.conf);
    out.uncertainty.dims = sorted.slice(0, 6);
    out.uncertainty.areas = F.uncertainAreas(out);
    out.derived = typeof computeMeasuredTraits === "function" ? computeMeasuredTraits(dims) : {};
    return out;
  };

  F.cloneProfile = function(p){
    return p ? JSON.parse(JSON.stringify(p)) : p;
  };

  F.getDerivedTrait = function(p, key){ return p && p.derived ? p.derived[key] : undefined; };
  F.getConfidence = function(p, key){
    if (!p || !p.confidence) return null;
    if (!key) return p.confidence.overall;
    const d = p.confidence.dims && p.confidence.dims[key];
    return d ? d.value : null;
  };
  F.getCurrentState = function(p){ return p ? p.currentState || null : null; };
  F.getHistoricalSnapshots = function(p){ return p && Array.isArray(p.timeline) ? p.timeline : []; };

  /* Uncertain AREAS (behaviour-level, not dimension-level): an area is a
     question the product wants to answer ("how do you decide?"). It is
     uncertain when the dimensions it depends on have low confidence or
     conflicting facets. Used by "What Forge is still unsure about". */
  F.AREAS = {
    decisions:   { label: "how you make decisions",        dims: ["logic", "confidence", "planning", "risk", "empathy"] },
    stress:      { label: "how you handle pressure",       dims: ["emotionalStability", "resilience", "patience", "optimism"] },
    social:      { label: "how you behave in groups",      dims: ["socialEnergy", "leadership", "empathy", "independence"] },
    motivation:  { label: "what actually drives you",      dims: ["drive", "persistence", "competitiveness", "curiosity"] },
    conflict:    { label: "how you handle disagreement",   dims: ["trust", "empathy", "patience", "confidence", "competitiveness"] },
    learning:    { label: "how you learn",                 dims: ["curiosity", "discipline", "openMindedness", "planning"] },
    change:      { label: "how you respond to change",     dims: ["adaptability", "risk", "openMindedness", "planning"] },
  };
  F.uncertainAreas = function(p){
    const dc = p.confidence && p.confidence.dims || {};
    const out = [];
    Object.keys(F.AREAS).forEach(k => {
      const a = F.AREAS[k];
      const confs = a.dims.map(d => dc[d] ? dc[d].value : 0.5);
      const avg = F.mean(confs);
      const weakest = a.dims.map((d, i) => ({ dim: d, conf: confs[i] })).sort((x, y) => x.conf - y.conf).slice(0, 2).map(x => x.dim);
      // internal tension: strongly opposed dimensions inside one area
      const vals = a.dims.map(d => num(p.dims[d], 0));
      const spread = Math.max.apply(null, vals) - Math.min.apply(null, vals);
      const tension = spread >= 12 ? 0.12 : spread >= 9 ? 0.06 : 0;
      out.push({ area: k, label: a.label, confidence: F.round1(avg * 100), uncertainty: F.clamp01(1 - avg + tension), weakestDims: weakest, dims: a.dims.slice() });
    });
    return out.sort((x, y) => y.uncertainty - x.uncertainty);
  };

  /* ---------------- tiny shared helpers for engines ---------------- */
  // Weighted mean of facet values with explicit weights, normalized so weights
  // never need to sum to 1 by the caller. Returns RAW scale.
  F.blend = function(facets, weights){
    let s = 0, w = 0;
    for (const k in weights){ s += num(facets[k], 0) * weights[k]; w += Math.abs(weights[k]); }
    return w ? clamp(s / w, -10, 10) : 0;
  };
  // Describe a RAW value in words, used so prose never invents precision.
  F.band = function(raw){
    const v = num(raw, 0);
    if (v >= 7) return "very high"; if (v >= 4) return "high"; if (v >= 1.5) return "somewhat high";
    if (v > -1.5) return "moderate"; if (v > -4) return "somewhat low"; if (v > -7) return "low"; return "very low";
  };
  F.hedge = function(conf01){ return conf01 >= 0.7 ? "tends to" : conf01 >= 0.45 ? "often" : "may"; };
  F.today = () => Date.now();
  F.daysBetween = (a, b) => Math.round(Math.abs(num(b, 0) - num(a, 0)) / 86400000);
})(Forge);

if (typeof module !== "undefined" && module.exports) module.exports = Forge;
