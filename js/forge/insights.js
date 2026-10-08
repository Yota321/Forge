/* =========================================================================
   FORGE INSIGHTS - the shared "claim with evidence" core.
   Operating Manual, Ask Forge, Growth and Tasks all state things about a
   person. Every statement they make is a RULE here:

       when(profile)  ->  strength 0..1   (how strongly the profile supports it)
       text                              (what Forge says)
       facets                            (which facets back it, shown as evidence)

   A rule can only fire from the person's own facets, so nothing is generic
   and nothing is unsupported. Strength is built from small combinators so a
   single extreme dimension can't carry a rule that needs two things true.
   ========================================================================= */
(function(F){
  "use strict";
  const I = F.insights = {};

  /* ---- combinators over a normalized profile (facets are RAW -10..10) ---- */
  const ramp = (v, lo, hi) => F.clamp((v - lo) / (hi - lo), 0, 1);
  I.H = (k, lo = 1, hi = 6) => p => ramp(p.facets[k], lo, hi);              // facet high
  I.L = (k, lo = 1, hi = 6) => p => ramp(-p.facets[k], lo, hi);             // facet low
  I.M = (k, w = 2.5) => p => ramp(w - Math.abs(p.facets[k]), 0, w);           // facet near the middle
  I.D = (d, lo = 1, hi = 6) => p => ramp(p.dims[d] || 0, lo, hi);           // raw dimension high
  I.DL = (d, lo = 1, hi = 6) => p => ramp(-(p.dims[d] || 0), lo, hi);       // raw dimension low
  I.AND = (...fs) => p => Math.min.apply(null, fs.map(f => f(p)));
  I.OR = (...fs) => p => Math.max.apply(null, fs.map(f => f(p)));
  I.NOT = f => p => 1 - f(p);
  I.ALWAYS = (s = 0.2) => () => s;
  /* Gap: facet a is higher than facet b by at least `gap`. For "analysis outruns initiative". */
  I.GAP = (a, b, gap = 3, hi = 8) => p => ramp(p.facets[a] - p.facets[b], gap, hi);

  /* Evidence for a rule: the facets it names, with value, band and the
     confidence of the dimensions underneath that facet. */
  I.evidenceFor = function(p, facetKeys){
    return facetKeys.filter(k => F.FACETS[k]).map(k => {
      const dims = Object.keys(F.FACETS[k].w);
      const conf = F.mean(dims.map(d => p.confidence.dims[d] ? p.confidence.dims[d].value : 0.5));
      return { facet: k, label: F.facetLabel(k), value: p.facets[k], band: F.band(p.facets[k]), confidence: F.round1(conf * 100) / 100, dims };
    });
  };

  /* Pick the best rules for a set: strongest first, de-duplicated by `group`
     (so two lines about the same idea don't both appear), at most n. */
  I.pick = function(p, rules, n, minStrength){
    minStrength = minStrength == null ? 0.25 : minStrength;
    const scored = rules.map((r, i) => ({ r, i, s: r.when(p) })).filter(x => x.s >= minStrength)
      .sort((a, b) => b.s - a.s || a.i - b.i);
    const out = [], groups = new Set();
    for (const x of scored){
      if (x.r.group && groups.has(x.r.group)) continue;
      if (x.r.group) groups.add(x.r.group);
      const ev = I.evidenceFor(p, x.r.facets || []);
      out.push({ id: x.r.id || null, text: typeof x.r.text === "function" ? x.r.text(p) : x.r.text, strength: F.round1(x.s * 100) / 100,
        evidence: ev, confidence: ev.length ? F.round1(F.mean(ev.map(e => e.confidence)) * 100) / 100 : 0.5 });
      if (out.length >= n) break;
    }
    return out;
  };

  I.rule = (id, group, facets, when, text) => ({ id, group, facets, when, text });
  I.confidenceNote = function(p, evidence){
    const c = evidence.length ? F.mean(evidence.map(e => e.confidence)) : 0.5;
    return { value: F.round1(c * 100) / 100, pct: Math.round(c * 100), level: F.confidenceLevel(Math.round(c * 100)), hedge: F.hedge(c) };
  };
})(Forge);
if (typeof module !== "undefined" && module.exports) module.exports = Forge;
