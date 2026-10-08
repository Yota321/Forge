<div align="center">

# Forge

**A personality platform that lives entirely in your browser.**

No accounts. No cloud. No tracking. Nothing leaves your device unless you send it yourself.

[Overview](#overview) · [How it works](#how-the-assessment-works) · [Results](#results) · [Structure](#project-structure) · [Run it](#running-locally) · [Privacy](#privacy)

</div>

---

## Overview

Most personality tests copy one framework and call it a day. Forge doesn't. It mixes several psychological frameworks into one adaptive system, so the result feels less like a label and more like a read on how you actually think, talk, decide, solve problems and connect with people.

Every assessment gives you a full profile:

| | |
|---|---|
| **Primary Archetype** | One of 30, plus your full archetype ranking |
| **Hidden Trait Radar** | The stuff that doesn't show up on the surface |
| **Career Matches** | Where your traits actually fit |
| **Relationships and Compatibility** | How you connect, and how you match with others |
| **Communication and Leadership** | How you talk, how you lead |
| **Growth Areas and Life Balance** | Where to push, where to rest |
| **Fantasy and Narrative Roles** | The fun part, honestly |
| **Confidence and Stability** | How sure the result is, and how steady it stays |
| **Personality Code** | A compact code you can share |

---

## How the Assessment Works

It's scenario based, not a boring survey. And it adapts. If your profile gets clear fast, the quiz ends sooner.

**1. Questions 1 to 15.** A fixed baseline. Everyone gets the same 15, in the same order, so every profile starts from the same ground.

**2. Questions 16 to 35.** 20 adaptive questions, in two batches of 10, picked based on what your first 15 answers showed. Same baseline answers means the same adaptive set. Different answers, different path.

**3. Confidence check.** After question 35, Forge looks at how clear your profile already is.

**4. Questions 36 to 45 (optional).** Asked one at a time, only if the profile isn't confident yet. It stops the moment it is.

So a full assessment is **35 questions minimum, 45 maximum.** All client-side, no server logic, no clock, no random seed. Same answers always lead to the same path and the same result.

> The onboarding screen also has two fixed-length shortcuts. A 15-question **Quick Read** and a 50-question **Deep Dive**. Both skip the confidence check and always ask exactly that many questions.

---

## Results

The results page is a bento-style dashboard. You get a grid of short summary cards (traits, mind map, social style, career fits, values, growth timeline, relationships and more), and each one opens into a full detail view when you tap it.

Nothing is hardcoded per archetype except the archetype's own reference data. Every number and every chart is computed live from your 25 measured dimensions.

**Quick Read** gives a smaller report: primary archetype, soul type, confidence, top traits, a short summary and basic dimensions. It also nudges you to continue into the full assessment instead of starting over. **Balanced** and **Deep Dive** both give the complete report. Deep Dive just takes more questions to get there.

What you can do with a result:

- **Share it** as a compact `PF5-...` code or a direct link. (`PF5` is the internal code format version. Public copy says "PersonaForge 1", see the versioning note in `js/engine.js`.)
- **Compare it** with someone else, one on one or as a party of 3 to 5. A warning shows up if either profile is a Quick Read.
- **Export it** as a Story image, a Post image, or a scannable QR code.

---

## Compatibility

Put two Forge profiles side by side and see shared strengths, complementary traits, possible conflicts, and a category by category breakdown: friendship, romantic, business, gaming, creative.

Party mode stretches this to a group of 3 to 5. Good for finding out who in your friend group is the problem. (Kidding. Mostly.)

---

## Project Structure

Plain static HTML, CSS and JS. No build step, no bundler, no framework.

| Path | What it does |
|---|---|
| `index.html` | Landing page |
| `quiz.html` | Onboarding and the adaptive assessment |
| `result.html` | Results dashboard |
| `compare.html` | One on one and party compare |
| `legal.html` | Terms of Service and credits |
| `404.html` | Deep link and clean URL recovery (more below) |
| `css/global.css` | Shared tokens, resets, nav, buttons, theming |
| `css/pages.css` | Page specific layout and styling |
| `js/engine.js` | Question bank, archetype data, scoring, adaptive engine, encode and decode |
| `js/global.js` | Theme, sound, nav, toasts, custom scrollbar, clean URL handling |
| `js/home.js`, `js/quiz.js`, `js/result.js`, `js/compare.js`, `js/legal.js` | Per page rendering |
| `js/compatibility.js` | Compare rendering shared by `result.js` and `compare.js` |
| `service-worker.js` | Offline caching |
| `manifest.json` | PWA install manifest |
| `assets/` | Images, audio, icons, per archetype artwork |

---

## Clean URLs

Quiz, Result, Compare and Legal all work at extensionless paths too: `/quiz`, `/result`, `/compare`, `/legal`.

Internal links still point at the real `.html` files, because that's one request and it's fast. Once a page loads, it rewrites its own address bar to the clean version. If someone loads or refreshes a clean path directly, `404.html` spots the route and redirects to the right file. Same trick GitHub Pages already needs for shared profile links. `service-worker.js` keeps its own copy of the route map, so all of this works offline as well.

---

## Offline and PWA

Forge installs as a Progressive Web App and works fully offline after your first visit. The service worker precaches every page, script, stylesheet and core asset. It serves the freshest version when you're online, and falls back to the cached one when you're not.

Your results, answers and history are never part of that cache. They stay in this browser's `localStorage` and `sessionStorage`, on this device, and that's it.

---

## Privacy

Your personality belongs to you. Simple as that.

- No accounts
- No analytics
- No ads
- No servers
- No tracking

Results are generated inside your browser. They only leave your device if you choose to share a code, link or QR image yourself.

---

## Running Locally

Nothing to install, it's just static files. Serve the project root with any static server and open it:

```bash
python -m http.server 8420
```

For clean URLs to also work on a direct load or refresh locally (not just through in-app navigation), your server needs to return `404.html` with a 404 status for unmatched paths, the way GitHub Pages does. `.claude/launch.json` has a small Python server that already does this.

---

## Deployment

Deploy it as is to GitHub Pages or any static host. No build step, no server config, just a custom 404 page, which most static hosts (GitHub Pages included) support out of the box.

---

## Philosophy

Forge isn't here to put you in a box. It's here to help you see your own patterns, how you think, how you act, and how that lines up with the people around you.

Every result is a snapshot. People change, and Forge changes with them.

---

## License

All rights reserved.

Copyright © 2026 Golam Sayan Ahamed.
