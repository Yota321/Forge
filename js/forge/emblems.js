/* =========================================================================
   FORGE EMBLEMS: one small drawing for every character, team, world and organization.

   The artwork is data: stroke-only paths on a 48x48 grid, one per id, registered by the emblem packs
     pack-emblems.js / pack-emblems-3.js   characters   (F.packs.emblems)
     pack-emblems-sets.js                  teams, worlds, organizations   (F.packs.emblemSets.<kind>)
   and mirrored as assets/<kind>/icons/<id>.svg (the .svg files are the source of truth; a test asserts the two forms agree).
   This module only draws them, inline, so there is no request and nothing for the service worker or a mask to get wrong.

     Forge.emblems.svg(kind, id, { size, label })   markup, or "" when there is no emblem for that id
     Forge.emblems.tile(kind, id, { size, label })  the same emblem on a rounded tile, as the character portraits are drawn
     Forge.emblems.has(kind, id)                    true when one exists
     Forge.emblems.path(kind, id)                   the raw path data
     Forge.emblems.url(kind, id)                    the .svg asset path (for an <img>)
     Forge.emblems.kinds                            ["characters","teams","worlds","organizations"]

   Drawn in currentColor, so it follows the text colour in light and dark themes. With a label it is announced as an image; without
   one it is decorative (aria-hidden), for places where the name is already printed next to it.
   ========================================================================= */
(function(F){
  "use strict";
  const has = (o, k) => !!o && Object.prototype.hasOwnProperty.call(o, k);
  const esc = s => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const KINDS = ["characters", "teams", "worlds", "organizations"];
  const SAFE_ID = /^[a-z0-9][a-z0-9-]*$/;

  function path(kind, id){
    const P = F.packs; if (!P || !SAFE_ID.test(String(id))) return "";
    if (kind === "characters"){
      const C = F.characters;
      if (C && C.emblemPath) return C.emblemPath(id) || "";
      return has(P.emblems, id) ? P.emblems[id] : "";
    }
    const set = P.emblemSets && P.emblemSets[kind];
    return has(set, id) ? set[id] : "";
  }
  /* the user's supplied artwork for an emblem, drawn exactly as supplied (a filled glyph); null for every other emblem */
  function art(kind, id){
    const C = F.characters; return kind === "characters" && C && C.emblemArt && SAFE_ID.test(String(id)) ? C.emblemArt(id) : null;
  }
  function svg(kind, id, opts){
    const d = path(kind, id); if (!d) return "";
    opts = opts || {};
    const size = Math.max(12, Math.min(160, +opts.size || 28));
    const label = opts.label ? ` role="img" aria-label="${esc(opts.label)}"` : ` aria-hidden="true" focusable="false"`;
    const a = art(kind, id);
    if (a) return `<svg class="fx-emblem fx-emblem-${esc(kind)}" xmlns="http://www.w3.org/2000/svg" viewBox="${a.vb}" width="${size}" height="${size}" fill="currentColor" stroke="none"${label}>${opts.label ? `<title>${esc(opts.label)}</title>` : ""}${a.body}</svg>`;
    return `<svg class="fx-emblem fx-emblem-${esc(kind)}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"${label}>${opts.label ? `<title>${esc(opts.label)}</title>` : ""}<path d="${d}"/></svg>`;
  }
  /* the same rounded tile the character portraits use (css .cx-emblem), so every kind of emblem reads as one family */
  function tile(kind, id, opts){
    const d = path(kind, id); if (!d) return "";
    opts = opts || {};
    const size = Math.max(24, Math.min(200, +opts.size || 56));
    const label = opts.label ? ` role="img" aria-label="${esc(opts.label)}"` : ` aria-hidden="true"`;
    const a = art(kind, id);
    if (a) return `<span class="cx-emblem fx-tile fx-tile-${esc(kind)}"${label} style="--sz:${size}px"><svg class="cx-emblem-svg" viewBox="${a.vb}" fill="currentColor" stroke="none" aria-hidden="true" focusable="false">${a.body}</svg></span>`;
    return `<span class="cx-emblem fx-tile fx-tile-${esc(kind)}"${label} style="--sz:${size}px"><svg class="cx-emblem-svg" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="${d}"/></svg></span>`;
  }
  F.emblems = {
    kinds: KINDS, path, svg, tile,
    has: (kind, id) => !!path(kind, id),
    url: (kind, id) => (KINDS.indexOf(kind) >= 0 && SAFE_ID.test(String(id)) && path(kind, id)) ? "assets/" + kind + "/icons/" + id + ".svg" : null
  };
})(typeof Forge !== "undefined" ? Forge : (globalThis.Forge = globalThis.Forge || {}));
if (typeof module !== "undefined" && module.exports) module.exports = Forge;
