/* PersonaForge service worker.
   Bump CACHE_VERSION when cached files or shell behavior changes.
   Profile data stays in localStorage; this worker only handles network responses. */

   const CACHE_VERSION = "v7.9.6";

   const SHELL_CACHE = `personaforge-shell-${CACHE_VERSION}`;
   const STATIC_CACHE = `personaforge-static-${CACHE_VERSION}`;
   const FONT_CACHE = `personaforge-fonts-${CACHE_VERSION}`;
   const CURRENT_CACHES = [SHELL_CACHE, STATIC_CACHE, FONT_CACHE];
   
   const SCOPE = self.registration.scope;
   const toURL = (path) => new URL(path, SCOPE).toString();
   
   // Every page is precached, not just index.html: navigations are stored
   // per-page (see shellKey/networkFirstShell below), so a page that was
   // never visited online still has to exist in the shell cache for
   // offline navigation to find it.
   const PAGES = ["index.html","quiz.html","result.html","compare.html","profile.html","growth.html","improve.html","journal.html","frameworks.html","legal.html","404.html"];
   const APP_SHELL = [toURL("manifest.json")];

   // Same-origin code. cacheFirst() would pick these up at runtime anyway,
   // but only after the first online visit to each page -- precaching is
   // what makes a first-ever *offline* reload of, say, Growth work.
   const CODE_ASSETS = ["css/global.css","css/pages.css","js/engine.js","js/global.js","js/home.js","js/quiz.js","js/result.js","js/compare.js","js/compatibility.js","js/profile.js","js/growth.js","js/improve.js","js/journal.js","js/frameworks.js","js/legal.js"];
   
   const STATIC_ASSETS = [
     "assets/BG.mp3",
     "assets/Logo_black.svg",
     "assets/Logo_white.svg",
     "assets/Icon_black.svg",
     "assets/Icon_white.svg",
     "assets/Icon_black_192.png",
     "assets/Icon_black_512.png",
     "assets/Icon_white_192.png",
     "assets/Icon_white_512.png",
     "assets/Open_Graph.png",
     ...CODE_ASSETS,
   ].map(toURL);
   
   const STATIC_EXTENSIONS =
     /\.(?:css|js|mjs|png|jpe?g|webp|gif|svg|ico|mp3|wav|ogg|woff2?|ttf|otf|json)$/i;
   
   const FONT_HOSTS = new Set([
     "fonts.googleapis.com",
     "fonts.gstatic.com",
     "api.fontshare.com",
     "cdn.fontshare.com", // the actual .woff2 files; api.fontshare.com only serves the CSS that points at them
   ]);
   
   // Install: cache the shell and static assets.
   self.addEventListener("install", (event) => {
     event.waitUntil(
       (async () => {
         const shellCache = await caches.open(SHELL_CACHE);
         await shellCache.addAll(APP_SHELL);
         await Promise.all(PAGES.map(async (page) => {
           try {
             const url = toURL(page);
             const res = await fetch(url, { cache: "reload" });
             if (res && res.ok && res.status === 200) await shellCache.put(shellKey(url), res);
           } catch {
             // A page missing at install time just falls back to being cached on first visit.
           }
         }));
   
         const staticCache = await caches.open(STATIC_CACHE);
         await Promise.all(
           STATIC_ASSETS.map(async (url) => {
             try {
               const res = await fetch(url, { cache: "reload" });
               if (res && res.ok && res.status === 200 && !res.headers.get("Content-Range")) {
                 await staticCache.put(url, res.clone());
               }
             } catch {
               // Ignore install-time misses; runtime fetch can still cache them later.
             }
           })
         );
   
         await self.skipWaiting();
       })()
     );
   });
   
   // Activate: remove old caches and take control immediately.
   self.addEventListener("activate", (event) => {
     event.waitUntil(
       (async () => {
         const names = await caches.keys();
         await Promise.all(
           names
             .filter((name) => name.startsWith("personaforge-") && !CURRENT_CACHES.includes(name))
             .map((name) => caches.delete(name))
         );
         await self.clients.claim();
       })()
     );
   });
   
   // Optional: let the page force an update to activate.
   self.addEventListener("message", (event) => {
     if (event.data === "SKIP_WAITING") {
       self.skipWaiting();
     }
   });
   
   // Fetch: navigations are network-first, static assets are cache-first.
   self.addEventListener("fetch", (event) => {
     const { request } = event;
   
     if (request.method !== "GET") return;
   
     const url = new URL(request.url);
     const isSameOrigin = url.origin === self.location.origin;
   
     // Explicit bypass for anything that must not be intercepted.
     if (url.searchParams.has("no-cache")) return;
   
     if (request.mode === "navigate" || request.destination === "document") {
       event.respondWith(networkFirstShell(request));
       return;
     }
   
     if (!isSameOrigin) {
       if (FONT_HOSTS.has(url.hostname)) {
         event.respondWith(staleWhileRevalidate(request, FONT_CACHE));
       }
       return;
     }
   
     if (STATIC_EXTENSIONS.test(url.pathname)) {
       event.respondWith(cacheFirst(request, STATIC_CACHE));
       return;
     }
   });
   
   // One cache key per *page* (origin + path, no query string, always with
   // an explicit .html), so /result?code=X, /result and /result.html all
   // resolve to the same stored document. The old version stored every
   // navigation response under index.html, which meant that offline,
   // opening ANY url returned whichever page had been visited last
   // (e.g. reloading Growth offline served the Result page).
   function shellKey(href) {
     const u = new URL(href);
     let p = u.pathname;
     if (p.endsWith("/")) p += "index.html";
     else if (!/\.[a-z0-9]+$/i.test(p)) p += ".html";
     return u.origin + p;
   }

   async function networkFirstShell(request) {
     const shellCache = await caches.open(SHELL_CACHE);
     const key = shellKey(request.url);

     try {
       const fresh = await fetch(request);
       if (fresh && fresh.ok && fresh.status === 200) {
         await shellCache.put(key, fresh.clone());
       }
       return fresh;
     } catch {
       const cached =
         (await shellCache.match(key)) ||
         (await shellCache.match(shellKey(toURL("index.html"))));
       if (cached) return cached;
       return Response.error();
     }
   }

   async function cacheFirst(request, cacheName) {
     const cache = await caches.open(cacheName);
     const cached = await cache.match(request);
     if (cached) return cached;
   
     try {
       if (request.headers.get("range")) {
         return fetch(request);
       }

       // A miss here means this exact CACHE_VERSION has never stored this
       // URL yet -- the one moment this genuinely needs a real network
       // fetch, not whatever the browser's own (separate, SW-invisible)
       // HTTP cache happens to be holding from a previous visit. Without
       // `cache: "reload"`, a plain fetch() can silently hand back a
       // stale pre-deploy response, which then gets stored as if it were
       // this version's real content -- permanently baking the staleness
       // into the new cache bucket. install()'s STATIC_ASSETS fetch
       // already does this; this is the same fix for the runtime path.
       const fresh = await fetch(new Request(request, { cache: "reload" }));
       if (fresh && fresh.ok && fresh.status === 200 && !fresh.headers.get("Content-Range")) {
         await cache.put(request, fresh.clone());
       }
       return fresh;
     } catch {
       return Response.error();
     }
   }
   
   async function staleWhileRevalidate(request, cacheName) {
     const cache = await caches.open(cacheName);
     const cached = await cache.match(request);
   
     const networkFetch = fetch(request)
       .then((fresh) => {
         if (fresh && fresh.ok && fresh.status === 200) {
           cache.put(request, fresh.clone());
         }
         return fresh;
       })
       .catch(() => null);
   
     return cached || (await networkFetch) || Response.error();
   }