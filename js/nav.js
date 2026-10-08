/* =========================================================================
   FORGE NAVIGATION CONTEXT  (js/nav.js, loaded after global.js on every app page)

   One system for "where did I come from, and how do I get back exactly as I left it".

   - Opening a detail page (a character, a world, a legal page) from anywhere SAVES the page you are leaving as an entry on a
     short stack in sessionStorage: its address, its scroll position, its open sections / form fields / tabs, and any page-specific
     state (the compare lens, the compared codes, the party members, the opened result card ...) captured by that page's hook.
   - Back (Nav.back) pops the newest entry and returns there; the page is rebuilt from the saved state and scrolled to the same spot.
     If there is no entry it falls back to the browser's own history, and only if that cannot be used does it go Home.
   - The stack is a TEMPORARY journey, not a history log: it is cleared the moment you arrive on any page that is not part of the
     journey (Home, a menu destination, a restart), entries expire after 30 minutes, and the stack is capped.
   - The browser's own Back button gets the same restoration, because the entry on top of the stack is recognised on arrival.

   Pages describe their own extra state by registering a hook:  Nav.hooks.<PF_PAGE> = { capture(), restore(state) }.
   Everything else (scroll, <details>, fields with an id, [role=tab], [aria-expanded]) is handled generically.
   ========================================================================= */
(function(){
  "use strict";
  const KEY = "pf_nav_stack", RKEY = "pf_nav_restore", TTL = 30 * 60 * 1000, MAX = 12;
  const DETAIL_PAGES = ["character", "legal"];                  // pages you drill INTO; leaving to one of these keeps the journey alive
  const Nav = window.Nav = { hooks: {} };

  const seg = p => { const s = String(p || "").split("/").filter(Boolean).pop() || "index"; return s.replace(/\.html$/i, "") || "index"; };
  const page = () => ((typeof PF_PAGE !== "undefined" && PF_PAGE) || seg(location.pathname));   // PF_PAGE is declared after this script runs, so fall back to the file name
  /* A page's identity: its file plus its query, canonicalised (same parameters in any order or encoding, e.g. "%20" vs "+"). */
  const keyOf = (path, search) => {
    let q = "";
    try{ q = [...new URLSearchParams(search || "").entries()].map(([k, v]) => encodeURIComponent(k) + "=" + encodeURIComponent(v)).sort().join("&"); } catch(e){ q = search || ""; }
    return seg(path) + (q ? "?" + q : "");
  };
  const hereKey = () => keyOf(location.pathname, location.search);
  const hrefOf = (path, search) => seg(path) + ".html" + (search || "");
  const fresh = e => e && typeof e.t === "number" && Date.now() - e.t < TTL;
  const read = () => { try{ const s = JSON.parse(sessionStorage.getItem(KEY) || "[]"); return Array.isArray(s) ? s.filter(fresh) : []; } catch(e){ return []; } };
  const write = s => { try{ if (s.length) sessionStorage.setItem(KEY, JSON.stringify(s.slice(-MAX))); else sessionStorage.removeItem(KEY); } catch(e){ /* storage blocked: Back falls through to browser history */ } };
  const sameOrigin = u => { try{ return new URL(u, location.href).origin === location.origin; } catch(e){ return false; } };

  /* ------------------------------------------------------------ generic state */
  function genericCapture(){
    const g = { details: [], fields: {}, tabs: -1, expanded: [] };
    try{
      document.querySelectorAll("details").forEach(d => g.details.push(d.open ? 1 : 0));
      document.querySelectorAll("input[id], textarea[id], select[id]").forEach(el => {
        if (/^(password|file|hidden)$/i.test(el.type || "")) return;
        g.fields[el.id] = (el.type === "checkbox" || el.type === "radio") ? !!el.checked : String(el.value || "").slice(0, 4000);
      });
      const tabs = [...document.querySelectorAll('[role="tab"]')]; g.tabs = tabs.findIndex(t => t.getAttribute("aria-selected") === "true");
      document.querySelectorAll('[aria-expanded="true"]').forEach((el, i) => { if (!el.closest(".top-bar, .modal-overlay, .nav-menu")) g.expanded.push(domIndex(el)); });
    } catch(e){ /* best effort */ }
    return g;
  }
  const expandables = () => [...document.querySelectorAll("[aria-expanded]")].filter(el => !el.closest(".top-bar, .modal-overlay, .nav-menu"));
  const domIndex = el => expandables().indexOf(el);
  function genericRestore(g){
    if (!g) return;
    try{
      const ds = [...document.querySelectorAll("details")];
      if (ds.length === (g.details || []).length) ds.forEach((d, i) => { d.open = !!g.details[i]; });
      Object.keys(g.fields || {}).forEach(id => {
        const el = document.getElementById(id); if (!el) return;
        if (el.type === "checkbox" || el.type === "radio") el.checked = !!g.fields[id]; else if (String(el.value) !== g.fields[id]) el.value = g.fields[id];
        el.dispatchEvent(new Event("input", { bubbles: true })); if (el.tagName === "SELECT") el.dispatchEvent(new Event("change", { bubbles: true }));
      });
      if (g.tabs >= 0){ const t = [...document.querySelectorAll('[role="tab"]')][g.tabs]; if (t && t.getAttribute("aria-selected") !== "true") t.click(); }
      const ex = expandables(); (g.expanded || []).forEach(i => { const el = ex[i]; if (el && el.getAttribute("aria-expanded") !== "true") el.click(); });
    } catch(e){ /* best effort */ }
  }

  /* ------------------------------------------------------------ stack */
  function snapshot(){
    let st = {};
    try{ const h = Nav.hooks[page()]; if (h && h.capture) st = h.capture() || {}; } catch(e){ st = {}; }
    return { k: hereKey(), href: hrefOf(location.pathname, location.search), page: page(), st, g: genericCapture(), y: Math.round(window.scrollY || 0), t: Date.now() };
  }
  /* Remember the page being left. Called automatically for links to detail pages; call it yourself before any script-driven jump. */
  Nav.push = function(to){
    const s = read(), snap = snapshot(), top = s[s.length - 1];
    try{ sessionStorage.removeItem("pf_nav_fwd"); } catch(e){}              // a new forward step discards the old forward history, like a browser
    if (to) snap.to = to;                                                  // where this entry led, so browser Forward can rebuild it
    if (top && top.k === snap.k) s[s.length - 1] = snap; else s.push(snap);
    write(s);
  };
  Nav.clear = function(){ write([]); try{ sessionStorage.removeItem(RKEY); } catch(e){} };
  /* Open a URL and remember where you were (for script-driven jumps to a detail page). */
  Nav.go = function(url){ if (isDetailUrl(url)) Nav.push(toKey(url)); location.href = url; };
  function toKey(u){ try{ const x = new URL(u, location.href); return keyOf(x.pathname, x.search); } catch(e){ return ""; } }
  const FKEY = "pf_nav_fwd";
  const setFwd = e => { try{ if (e && e.to) sessionStorage.setItem(FKEY, JSON.stringify({ to: e.to, entry: e, t: Date.now() })); else sessionStorage.removeItem(FKEY); } catch(x){} };
  const takeFwd = () => { try{ const f = JSON.parse(sessionStorage.getItem(FKEY) || "null"); sessionStorage.removeItem(FKEY); return f && Date.now() - f.t < TTL ? f : null; } catch(e){ return null; } };

  function isDetailUrl(u){
    try{ const url = new URL(u, location.href); return url.origin === location.origin && DETAIL_PAGES.indexOf(seg(url.pathname)) !== -1; } catch(e){ return false; }
  }

  /* Back: saved journey first, then the browser's own history, and only then Home. */
  Nav.back = function(fallback){
    const s = read(), top = s[s.length - 1];
    let sameRef = false;
    try{ const r = document.referrer; sameRef = !!r && sameOrigin(r); } catch(e){ sameRef = false; }
    if (top){
      s.pop(); write(s); setFwd(top);
      try{ sessionStorage.setItem(RKEY, JSON.stringify({ k: top.k, t: Date.now(), entry: top })); } catch(e){}
      // when the page just before this one in the browser's history IS the saved one, step back through it (so Forward works too)
      let prevIsTop = false;
      try{ if (sameRef){ const ru = new URL(document.referrer); prevIsTop = keyOf(ru.pathname, ru.search) === top.k; } } catch(e){ prevIsTop = false; }
      if (prevIsTop && history.length > 1){ history.back(); return; }
      location.href = top.href; return;
    }
    if (sameRef && history.length > 1){ history.back(); return; }
    location.href = fallback || "index.html";
  };

  /* ------------------------------------------------------------ links */
  document.addEventListener("click", function(e){
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
    if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
    let u; try{ u = new URL(a.href); } catch(x){ return; }
    if (u.pathname === location.pathname && u.search === location.search) return;          // an in-page anchor is not a navigation
    if (isDetailUrl(u.href)) Nav.push(toKey(u.href));                                       // includes character -> character/world
  }, true);

  /* ------------------------------------------------------------ arrival */
  function scrollWhenReady(y){
    if (!(y > 0)) return;
    let tries = 0;
    const tick = () => {
      window.scrollTo({ top: y, left: 0, behavior: "instant" });          // never the page's smooth-scroll: the position must land exactly
      tries++;
      if (Math.abs((window.scrollY || 0) - y) > 4 && tries < 14) setTimeout(tick, 120);
    };
    tick();
  }
  function applyRestore(entry){
    const run = () => {
      try{ const h = Nav.hooks[page()]; if (h && h.restore) h.restore(entry.st || {}, entry); } catch(e){ /* page state is best effort */ }
      genericRestore(entry.g);
      scrollWhenReady(entry.y);
      try{ document.documentElement.dataset.navRestored = "1"; } catch(e){}
    };
    if (document.readyState === "complete") setTimeout(run, 30); else window.addEventListener("load", () => setTimeout(run, 30), { once: true });
  }
  (function arrive(){
    const s = read();
    let flag = null;
    try{ flag = JSON.parse(sessionStorage.getItem(RKEY) || "null"); sessionStorage.removeItem(RKEY); } catch(e){ flag = null; }
    let navType = "";
    try{ const n = performance.getEntriesByType("navigation")[0]; navType = n ? n.type : ""; } catch(e){}
    let viaHop = false;                                                  // 404.html hop (clean URL): hides the back_forward type
    try{ const v = parseInt(sessionStorage.getItem("pf_via404") || "0", 10); viaHop = v > 0 && Date.now() - v < 8000; sessionStorage.removeItem("pf_via404"); } catch(e){ viaHop = false; }
    const top = s[s.length - 1];
    if (top && top.k === hereKey() && (navType === "back_forward" || viaHop || (flag && flag.k === top.k))){
      s.pop(); write(s); setFwd(top);                                    // we are returning to where the journey started
      try{ if ("scrollRestoration" in history) history.scrollRestoration = "manual"; } catch(e){}
      applyRestore(top);
      return;
    }
    if (flag && flag.entry && flag.k === hereKey()){                     // Nav.back() used location.href: the entry was already popped
      try{ if ("scrollRestoration" in history) history.scrollRestoration = "manual"; } catch(e){}
      applyRestore(flag.entry);
      return;
    }
    const fwd = takeFwd();
    if (fwd && fwd.to === hereKey()){   // browser Forward into the page we had left (a new link click clears this first): rebuild its way back
      s.push(fwd.entry); write(s); return;
    }
    if (DETAIL_PAGES.indexOf(seg(location.pathname)) === -1) write([]);   // left the journey: do not keep stale entries
  })();

  /* bfcache: a page restored whole already has its state. Nothing to rebuild. */
  window.addEventListener("pageshow", function(e){
    if (!e.persisted) return;
    const s = read(), top = s[s.length - 1];
    if (top && top.k === hereKey()){ s.pop(); write(s); }                 // browser Back into a whole-page restore: the entry is spent
    try{ document.documentElement.dataset.navRestored = "1"; } catch(x){}
  });

  /* ------------------------------------------------------------ page hooks */
  Nav.hooks.compare = {
    capture: function(){
      const st = {};
      const party = !!document.getElementById("partyCode0");
      st.party = party;
      if (party){
        st.codes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => { const el = document.getElementById("partyCode" + i); return el ? el.value : ""; });
        st.rendered = !!document.querySelector("#partyOut .pe-result");
      } else {
        const a = document.getElementById("codeA"), b = document.getElementById("codeB");
        st.a = a ? a.value : ""; st.b = b ? b.value : "";
        st.lens = (document.querySelector(".lens-result") && typeof activeLensId !== "undefined") ? activeLensId : null;
        const rel = document.querySelector(".rel-chip[aria-pressed=\"true\"]"); st.rel = rel ? rel.dataset.rel : null;
        st.round = (st.lens && typeof storyRound !== "undefined") ? storyRound : 0;       // which page of situations is showing
        st.ch = (st.lens && typeof sxActive !== "undefined") ? sxActive : null;            // the chapter being read
        st.sit = (st.lens && typeof sxActiveScenario !== "undefined") ? sxActiveScenario : null;   // the scenario last opened
      }
      return st;
    },
    restore: function(st){
      if (!st) return;
      if (st.party){
        (st.codes || []).forEach((c, i) => { const el = document.getElementById("partyCode" + i); if (el) el.value = c; });
        if ((st.codes || []).slice(3).some(Boolean)){ const ex = document.getElementById("extraPartySlots"); if (ex) ex.classList.remove("hidden"); const bt = document.getElementById("partyToggleBtn"); if (bt) bt.textContent = "− Hide extra slots"; }
        if (st.rendered && typeof restorePartyResult === "function") restorePartyResult();
      } else {
        const a = document.getElementById("codeA"), b = document.getElementById("codeB");
        if (a && st.a != null) a.value = st.a; if (b && st.b != null) b.value = st.b;
        if (st.lens && typeof restoreCompareResult === "function") restoreCompareResult(st.lens, st.rel, st.round, st.ch, st.sit);
      }
    }
  };
  Nav.hooks.result = {
    capture: function(){
      return { careers: typeof careersExpanded !== "undefined" ? !!careersExpanded : false, sin: typeof sinVirtueMode !== "undefined" ? sinVirtueMode : "sin", detail: typeof resultDetailOpenId !== "undefined" ? resultDetailOpenId : null };
    },
    restore: function(st){
      if (!st) return;
      try{ if (st.careers && typeof careersExpanded !== "undefined" && !careersExpanded && typeof toggleCareers === "function") toggleCareers(); } catch(e){}
      try{ if (st.detail && typeof openResultDetail === "function") openResultDetail(st.detail); } catch(e){}
    }
  };
  Nav.hooks.journal = {
    capture: function(){ const b = [...document.querySelectorAll(".journal-mood-btn")], i = b.findIndex(x => x.classList.contains("selected")); return { mood: i }; },
    restore: function(st){ const b = [...document.querySelectorAll(".journal-mood-btn")]; if (st && st.mood >= 0 && b[st.mood] && !b[st.mood].classList.contains("selected")) b[st.mood].click(); }
  };
})();
