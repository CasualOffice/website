---
title: 'Casual Slides vs Google Slides — open-source self-hosted alternative'
description: 'Honest comparison between Casual Slides (open-source, Apache-2.0, .pptx round-trip with 93/99 fidelity probes passing, pre-v0.1.0) and Google Slides (SaaS, free for personal, $6+/user for Workspace). Where each is the right answer today — and why Casual Slides is the right bet for some users despite being earlier-stage.'
ourProduct: slides
other: 'Google Slides'
verified: 2026-05-28
---

If you searched **"open source Google Slides alternative"** or
**"self-host alternative to Google Slides"**, you should know up
front: this comparison is **honest about Casual Slides being
earlier-stage** than Casual Sheets or Casual Docs. v0.0.0 with
no tagged release, no Docker image, naive WebSocket co-edit. But
the pieces that ARE there are unusually deep — 93 of 99 `.pptx`
fidelity probes passing after wave 12.

For most users today, Google Slides is the more pragmatic choice.
The Casual Slides slot is for the small group of users who match
its current trade-offs: self-host required, `.pptx` round-trip
matters, and "Phase-2 spike collab is fine for now" is acceptable.

## At a glance

| | **Casual Slides** | **Google Slides** |
|---|---|---|
| License | Apache-2.0 — fully open source | Proprietary SaaS |
| Hosting | Self-host (no Docker image yet — runs from `pnpm dev`) | Google-hosted only |
| Price | Free; your hosting | Free for `@gmail.com`; Workspace $6+/user/mo |
| Google account | Not needed | **Required** |
| Native file format | `.pptx` | Proprietary; export to `.pptx` |
| Round-trip fidelity | **93 of 99 probes ✅** (wave 12) | Google → .pptx loses transitions, animations, embedded media |
| Real-time co-edit | **Phase-2 spike only** — naive WebSocket broadcast, single-active-editor sufficient | Yes, mature OT-based |
| Office-style ribbon | Yes — Home / Insert / Design / Transitions / Animations / Slide Show / View / Review | Different UX (single toolbar, file-menu-driven) |
| Layout templates | 6 (title / title+content / two-content / comparison / blank / section-header) | 14+ |
| Theme picker | Yes (theme color + font scheme) | Yes |
| Background picker | Solid + gradient fills | Same + image backgrounds |
| Slide Show mode | F5, keyboard navigation | F5, presenter view with timer + notes |
| Speaker notes | Notes panel | Same + presenter view |
| Animations | OOXML attrs round-trip; rendering still in waves | Built-in |
| Transitions | OOXML attrs round-trip; rendering still in waves | Built-in |
| PDF export | Wave 8+ planned | Yes |
| Mobile | Desktop-only today | Native iOS + Android |
| Backend | 104-line raw `ws` server (Phase-2 spike) | Google's stack |
| Maturity | v0.0.0 · pre-tag · active development | 15+ years |
| Build on top | Apache-2.0 + Univer OSS — clean React component | Closed |

## Where Casual Slides is the right answer today

Read this list as "if all of these apply, Casual Slides is worth a
serious look right now":

- **You need to keep `.pptx` files on your servers.** Sales decks
  with non-public pricing, board decks, IP-sensitive technical
  diagrams — anything you wouldn't upload to Google Drive.
- **You need `.pptx` round-trip integrity.** Google Slides
  converts to its proprietary format and re-exports with
  documented losses (animations, transitions, embedded video,
  custom XML, specific master-slide inheritance). Casual Slides
  is 93/99 ✅ on per-tag round-trip — the file you save is
  byte-equivalent for the OOXML surface we cover.
- **You're building on top of a presentation editor.** The editor
  is a React component on top of Univer OSS (Apache-2.0). You can
  embed it without negotiating a commercial license, no AGPL
  obligations.
- **You're OK with single-active-editor co-edit today.** The
  v0.0.x collab is a 104-line `ws` broadcast server — sufficient
  for the typical "I'm presenting, my co-presenter is making
  occasional tweaks" pattern, not safe for concurrent editing
  on the same slide.

## Where Google Slides is the right answer today

For most users, this is the right answer. Be honest about why:

- **You want a Docker image you can `docker pull`.** Casual Slides
  doesn't have one yet (lands with v0.1.0, same release as the
  Yjs/Hocuspocus migration).
- **You need real co-edit.** Multiple users editing concurrently
  in the same deck — Casual Slides isn't safe for this today
  (single-active-editor sufficient is the explicit design point).
- **You depend on the Google ecosystem.** Google Drive, Forms,
  Slides API, Gemini integration, Workspace permissions — all
  SaaS-only.
- **You need native mobile.** Google's iOS + Android apps work
  offline; Casual Slides is desktop-only today (mobile back-port
  is on the v0.1.0 roadmap).
- **You want presenter view + timer + speaker notes during a
  live presentation.** Google Slides has the full presenter
  toolkit; Casual Slides has Slide Show mode but not the full
  presenter view yet.
- **You want a marketplace of templates + add-ons.** Google has
  it; Casual Slides ships 6 layout templates and that's all
  today.

## What "93 of 99 fidelity probes" means

Casual Slides tracks a structured `.pptx` fidelity matrix at
[`docs/FIDELITY_TRACKER.md`](https://github.com/CasualOffice/slides/blob/main/docs/FIDELITY_TRACKER.md).
Each probe is a specific OOXML PresentationML feature (e.g.,
"`<a:rPr><a:highlight>` text highlight," "`<a:bodyPr rot>`
text-box rotation," "tables as `IPageElement`"). Each gets
labelled `✅` (round-trips), `⚠️` (partial), or `❌` (dropped).

Wave 12 (the latest snapshot) shows **93 ✅, 6 partial**. The
remaining 6 are documented individually — typically exotic gradient
fills, certain animation triggers, and some master-slide
inheritance edge cases. The full matrix lists each one with effort
estimate.

Compare to Google Slides: there's no public matrix. Behaviour is
"good enough" for most files but the exact list of what survives
re-export to `.pptx` is observable only by testing your own deck.
For pipelines where you need the file to flow web edit → desktop
PowerPoint → web again, Casual Slides' explicit matrix is more
useful than a vague "mostly compatible" claim.

## What ships in the editor today

- **Office-style ribbon** with all the standard PowerPoint tabs:
  Home, Insert, Design, Transitions, Animations, Slide Show,
  View, Review.
- **Slide-panel thumbnails** on the left rail with reorder,
  duplicate, hide, delete, new (via right-click context menu).
- **6 layout templates** picked from the toolbar Layout dropdown.
- **Theme picker + background picker** (solid + gradient).
- **Slide Show mode** (F5) with keyboard navigation.
- **Notes panel** for speaker notes.
- **Recent files dialog** backed by IndexedDB.
- **Properties dialog + About dialog**.
- **2 493 LOC `pptx-import.ts`** covering deep OOXML
  PresentationML: slides, layouts, masters, themes, theme colour
  resolution, placeholder inheritance, gradient fills, text outline
  + arrowheads + effects, hyperlinks via custom ranges, tables +
  charts as `IPageElement`, picture backgrounds, hidden slides,
  text wrap, autofit, body rotation, image cropping, connectors,
  RTL, strikethrough/baseline, bullets + indent + line spacing,
  multi-run rich text + paragraph alignment, colour modifiers +
  rotation + flips.

It's a real editor. It just hasn't earned its v0.1.0 yet.

## What's deferred to v0.1.0

- **Yjs + Hocuspocus migration.** Today's 104-line raw `ws`
  server gets replaced with the same Fastify + Hocuspocus stack
  the sheets repo ships at v0.2.x (see the
  [production-readiness pipeline](https://github.com/CasualOffice/sheets/blob/main/docs/PRODUCTION_PIPELINE.md)
  for what that buys: replay retry + dead-letter, per-IP rate
  limit, room cap with LRU eviction).
- **Docker image** (multi-arch amd64 + arm64).
- **WOPI host integration + JWT auth + admin panel** — lifted
  wholesale from the sheets repo.
- **Mobile lane** — viewer + light editor on `≤480 px`.
- **PDF + ODP export.**
- **Presenter view** with current/next slide + speaker timer.
- **Animation + transition rendering** beyond round-trip.

## Cost — when it'd matter

Casual Slides has no Docker image today, so the "self-host cost"
math is theoretical. When v0.1.0 ships with the Docker image,
expect roughly the same shape as the sister projects:

- 50 users on a small team: ~$15/mo VPS vs $300/mo Workspace
  Business Basic. ~20× difference.
- 200 users on a mid team: ~$40/mo vs $1 200/mo. ~30×.

These assume the Yjs migration lands with the same broadcast
characteristics measured for sheets in the
[capacity model](https://github.com/CasualOffice/sheets/blob/main/docs/CAPACITY_MODEL.md).
Until v0.1.0 ships, this is forecast, not measurement.

## When to choose what

**Pick Casual Slides if:**
- You need `.pptx` round-trip integrity.
- You can wait for v0.1.0 for production co-edit (or your shape
  is single-active-editor).
- You want to embed a presentation editor in your own app
  (Apache-2.0).
- You're OK running from source today (no Docker image yet).

**Pick Google Slides if:**
- You want a finished product today.
- You need real concurrent co-edit.
- You depend on the Google ecosystem.
- You need native mobile.
- You want presenter view + animations rendered.

For most users today: **Google Slides.** For the subset where
self-host + `.pptx` integrity matter and the v0.1.0 timeline
works: **Casual Slides is worth following.**

## Try Casual Slides

The live demo is at <https://slide.casualoffice.org/>. Source is at
[github.com/CasualOffice/slides](https://github.com/CasualOffice/slides).

For local development:

```bash
git clone git@github.com:CasualOffice/slides.git
cd slides
pnpm install
pnpm dev:web    # http://127.0.0.1:5373
```

The Docker image lands with v0.1.0. Watch the
[product page](/casual-slides/) for release notifications.
