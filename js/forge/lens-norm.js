/* =========================================================================
   LENS NORMS (data only, generated). Do not edit by hand: node .claude/tools/calibrate-lens.js --write
   How each lens aspect and signal usually comes out across 19900 pairs of varied people: [mean, sd]. lens-compat.js reads every
   value against these so a score means "compared with a typical pair". lens: [mean, sd] of each lens's weighted average.
   ========================================================================= */
(function(F){
  "use strict";
  if (!F.lensCompat) return;
  F.lensCompat.NORM = {"items":{"friendship":{"interests":[0.7468,0.0496],"adventure":[0.7184,0.056],"humour":[0.7069,0.0617],"trust":[0.6569,0.0864],"communication":[0.6757,0.0894],"support":[0.7071,0.059],"recovery":[0.5723,0.0683],"solving":[0.6921,0.056],"travel":[0.7635,0.0952],"gaming":[0.6726,0.0828],"study":[0.7002,0.0628],"teams":[0.6916,0.0389]},"romance":{"closeness":[0.7719,0.0868],"affection":[0.7327,0.0781],"longterm":[0.6527,0.0639],"conflict":[0.5816,0.0768],"security":[0.5575,0.0691],"vulnerability":[0.6655,0.0941],"living":[0.7571,0.0861],"future":[0.7391,0.06],"communication":[0.6855,0.0738],"support":[0.7099,0.0612]},"companionship":{"teamwork":[0.6838,0.0389],"work":[0.7152,0.0651],"reliability":[0.6403,0.0634],"practical":[0.7196,0.0706],"boundaries":[0.8275,0.0787],"family":[0.614,0.0696],"roommates":[0.7427,0.0753],"coworkers":[0.6578,0.066],"classmates":[0.7257,0.069],"decide":[0.7327,0.0902],"learning":[0.7474,0.0701],"leadership":[0.6418,0.0689],"daily":[0.7354,0.1016],"fun":[0.7068,0.075],"sibling":[0.5816,0.0768]}},"signals":{"enjoy":[0.6982,0.0718],"calm":[0.6049,0.1123],"room":[0.9591,0.0387],"steady":[0.6068,0.0695],"complement":[0.7405,0.0365],"healthy":[0.5967,0.0617],"understand":[0.7576,0.0588]},"lens":{"friendship":[0.003,0.5585],"romance":[0.002,0.6426],"companionship":[0.0026,0.5481]}};
})(typeof Forge !== "undefined" ? Forge : (globalThis.Forge = globalThis.Forge || {}));
if (typeof module !== "undefined" && module.exports) module.exports = Forge;
