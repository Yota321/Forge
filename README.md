# Forge

A personality platform that runs entirely in your browser. Nothing leaves your device, ever.

No accounts. No cloud. No tracking. No data collection.

You answer questions, Forge figures out how you think, and that's it. Your personality is yours, so it stays with you.

---

## What is this

Most personality tests are MBTI with a new coat of paint. Forge isn't that. It blends a few different psychological frameworks into one adaptive system, so the result feels less like a label and more like a mirror.

Every assessment gives you:

- A primary archetype (one of 30)
- Your full archetype ranking
- A hidden trait radar
- Career matches
- Relationship analysis
- Compatibility reports
- Communication and leadership style
- Growth areas and life balance
- Fantasy and narrative roles
- Match confidence and personality stability
- A personality code
- A shareable profile

Quite a lot, honestly. But it's all computed live from your own answers across 25 measured dimensions, nothing is faked per archetype.

---

## How the quiz works

It's scenario-based, not a boring static survey. And it adapts its length to how clear your profile gets as you go.

1. **Questions 1 to 15:** a fixed baseline. Everyone gets the same 15, in the same order, so every profile starts from the same foundation.
2. **Questions 16 to 35:** 20 adaptive questions, in two batches of 10, picked from what your first 15 answers already show. Answer the baseline the same way as someone else and you get the same set. Answer differently, and you don't.
3. **Confidence check:** after question 35, Forge looks at how clear your profile already is.
4. **Questions 36 to 45 (optional):** asked one at a time, only if it's still unsure, and it stops the moment it isn't.

So a full run is **35 questions minimum, 45 maximum**. All client-side, no server logic, no clock, no random seed. Same answers, same path, same result. Every time.

There are also two fixed-length shortcuts on the onboarding screen: a 15-question **Quick Read** and a 50-question **Deep Dive**. Both skip the confidence check and always ask exactly that many.

---

## Results

The results page is a bento-style dashboard. You get an overview grid of small summary cards (traits, mind map, social style, career fits, values, growth timeline, relationships, and more), and each one opens into a full detail view when you tap it.

Quick Read shows a reduced report: primary archetype, soul type, confidence, top traits, a short summary and basic dimensions. It nudges you to continue into the full assessment instead of starting over. Balanced and Deep Dive both show the complete report, Deep Dive just takes more questions to get there.

You can:

- **Share** your result as a compact `PF5-...` code or a direct link. (`PF5` is the internal code format version. Public copy calls the product "PersonaForge 1", see the versioning note in `js/engine.js`.)
- **Compare** with someone else, one-on-one or as a 3 to 5 person party. You'll get a warning if either profile is a Quick Read.
- **Export** as a Story or Post image, or a scannable QR code.

---

## Compatibility

Put two profiles side by side and Forge shows shared strengths, complementary traits, possible conflicts, and category scores for friendship, romantic, business, gaming and creative. Party mode does the same thing for a group of 3 to 5.

Fun with friends. Slightly dangerous with partners.

---

## Project structure

Plain static HTML, CSS and JS. No build step, no bundler, no framework.

| Path | What it is |
|---|---|
| `index.html` | Landing page |
| `quiz.html` | Onboarding and the adaptive assessment |
| `result.html` | Results dashboard |
| `compare.html` | One-on-one and party compare |
| `legal.html` | Terms of Service and credits |
| `404.html` | Deep-link and clean-URL recovery page |
| `css/global.css` | Shared tokens, resets, nav, buttons, theming |
| `css/pages.css` | Page-specific layout and styling |
| `js/engine.js` | Question bank, archetype data, scoring, adaptive engine, encode/decode |
| `js/global.js` | Theme, sound, nav, toasts, custom scrollbar, clean-URL handling |
| `js/home.js`, `js/quiz.js`, `js/result.js`, `js/compare.js`, `js/legal.js` | Per-page rendering |
| `js/compatibility.js` | Compare rendering shared by `result.js` and `compare.js` |
| `service-worker.js` | Offline caching |
| `manifest.json` | PWA install manifest |
| `assets/` | Images, audio, icons, per-archetype artwork |

---

## Clean URLs

Quiz, Result, Compare and Legal all work at extensionless paths (`/quiz`, `/result`, `/compare`, `/legal`) as well as their real `.html` files.

Internal links still point at the real files, since that's one fast request. Once a page loads, it rewrites its own address bar to the clean version. If someone loads, bookmarks or refreshes a clean path directly, `404.html` spots the route and redirects to the right file. GitHub Pages needs that same trick for shared profile links anyway. `service-worker.js` keeps its own copy of the route map, so all of this works offline too.

---

## Offline and PWA

Forge installs as a Progressive Web App and works fully offline after your first visit. The service worker precaches every page, script, stylesheet and core asset, serves the freshest version when you're online, and falls back to the cached copy when you're not.

Your results, answers and history are never part of that cache. They live in this browser's `localStorage` and `sessionStorage`, on this device, and nowhere else.

---

## Privacy

One rule: your personality belongs to you.

No accounts, no analytics, no ads, no servers, no tracking. Results are generated inside your browser, and they only leave your device if you choose to share a code, link or QR image yourself.

---

## Deployment

Deploy it as-is to GitHub Pages or any static host. No build step, no server config, just a custom 404 page, which most static hosts (GitHub Pages included) already support.

---

## Philosophy

Forge isn't here to put you in a box. It's here to help you understand yourself a bit better, spot patterns in how you think, and compare them with other people in a way that actually means something.

Every result is a snapshot, not a label. People change, and Forge should too.

---

## License

All rights reserved.

Copyright © 2026 Golam Sayan Ahamed.
