/* =========================================================================
   FORGE PACKS - the registry that keeps the experience layer data-driven.

   Everything that can grow is a PACK: a plain data file that registers entries here.
   Adding 100 characters, 20 universes, more scenarios or party templates means adding a
   file (and one <script> line), never touching engine code.

     Forge.packs.add(kind, entries)      kinds: universes, teams, stories, roles, outcomes,
                                               lenses, scenarios, ... (any string; the engine
                                               reads the kinds it knows)
     Forge.packs.get(kind)               every entry registered so far (copy)
     Forge.packs.characters(pack)        register a character pack (see below)
     Forge.packs.franchise(characterId)  the franchise a character belongs to
     Forge.packs.franchises()            { franchise: [character ids] } for the live roster

   A character pack is { id, name, groups: [{ franchise, items: [row, ...] }] } where a row is
     [id, name, source, medium, role, energy, traits, styles, values, motivations]
   styles = the eight area keys in this order: decision learning communication leadership
            conflict stress work group   (taxonomies live in characters.js)
   Rows land in Forge.CHARACTER_DATA / CHARACTER_EXTRA, the same structures characters-data.js
   fills, so the one character engine ranks, explains and matches them exactly like the originals.
   Load packs after characters-data.js and before characters.js.
   ========================================================================= */
(function(F){
  "use strict";
  const P = F.packs = F.packs || { kinds: {}, franchiseOf: {}, packs: [] };

  P.add = function(kind, entries){
    const list = P.kinds[kind] = P.kinds[kind] || [];
    const seen = new Set(list.map(e => e && e.id));
    (Array.isArray(entries) ? entries : [entries]).forEach(e => {
      if (!e || typeof e !== "object" || typeof e.id !== "string" || seen.has(e.id)) return;   // first registration wins
      seen.add(e.id); list.push(e);
    });
    return list.length;
  };
  P.get = kind => (P.kinds[kind] || []).slice();
  P.byId = (kind, id) => (P.kinds[kind] || []).find(e => e.id === id) || null;
  /* Entries of a kind with their "<kind>Meta" overlay applied by id (so shipped data stays untouched). "addMembers" appends. */
  P.merged = function(kind){
    const by = {}; P.get(kind + "Meta").forEach(m => { by[m.id] = m; });
    return P.get(kind).map(e => {
      const m = by[e.id]; if (!m) return e;
      const o = Object.assign({}, e, m);
      if (m.addMembers){ const have = e.members || []; o.members = have.concat(m.addMembers.filter(x => have.indexOf(x) < 0)); delete o.addMembers; }
      return o;
    });
  };

  const traits = s => { const o = {}; String(s).split(/\s+/).forEach(p => { const i = p.indexOf(":"); if (i > 0 && isFinite(Number(p.slice(i + 1)))) o[p.slice(0, i)] = Number(p.slice(i + 1)); }); return o; };
  const words = s => String(s || "").split(/\s+/).filter(Boolean);
  const AREA_ORDER = ["decision", "learning", "communication", "leadership", "conflict", "stress", "work", "group"];

  P.characters = function(pack){
    if (!pack || !Array.isArray(pack.groups)) return 0;
    F.CHARACTER_DATA = F.CHARACTER_DATA || {};
    F.CHARACTER_EXTRA = F.CHARACTER_EXTRA || [];
    let added = 0;
    pack.groups.forEach(g => (g.items || []).forEach(row => {
      const [id, name, source, medium, role, energy, tr, st, values, motivations] = row;
      if (!id || F.CHARACTER_DATA[id] || P.franchiseOf[id]) return;                           // never override an existing character
      const styleKeys = words(st), styles = {};
      AREA_ORDER.forEach((a, i) => { if (styleKeys[i]) styles[a] = styleKeys[i]; });
      F.CHARACTER_DATA[id] = { traits: traits(tr), styles, values: words(values), motivations: words(motivations) };
      F.CHARACTER_EXTRA.push({ id, name, source, sourceType: medium, role, energy });
      P.franchiseOf[id] = g.franchise || source;
      added++;
    }));
    P.packs.push({ id: pack.id, name: pack.name, added });
    return added;
  };

  /* Franchise of any roster character; the original 37 fall back to their own universe. */
  P.franchise = function(id){
    if (P.franchiseOf[id]) return P.franchiseOf[id];
    const C = F.characters, c = C && C.byId ? C.byId(id) : null;
    return c ? c.universe : null;
  };
  P.franchises = function(){
    const C = F.characters, out = {};
    (C ? C.roster() : []).forEach(c => { const f = P.franchise(c.id) || c.universe; (out[f] = out[f] || []).push(c.id); });
    return out;
  };
})(typeof Forge !== "undefined" ? Forge : (globalThis.Forge = globalThis.Forge || {}));
if (typeof module !== "undefined" && module.exports) module.exports = Forge;
