---
title: 'Casual Editor vs Google Docs — open-source self-hosted alternative'
description: 'Honest comparison between Casual Editor (open-source, Apache-2.0, self-host via Docker, no Google account) and Google Docs (SaaS, free for personal, $6+/user for Workspace). Side-by-side on .docx fidelity, self-host, co-edit, real-time, mobile, ecosystem, cost. Where each is the right answer.'
ourProduct: editor
other: 'Google Docs'
verified: 2026-05-28
---

If you searched **"open source Google Docs alternative"** or **"self-
host alternative to Google Docs"**, this page is what you need before
you commit. Both render the same surface — a paginated WYSIWYG
document editor with real-time co-editing — but the trade-offs are
different in ways that matter for adoption decisions.

I built [Casual Editor](/casual-editor/), so I have an obvious bias.
The comparison below tries to be honest about where Google Docs is
the better answer.

## At a glance

| | **Casual Editor** | **Google Docs** |
|---|---|---|
| License | Apache-2.0 — fully open source | Proprietary SaaS |
| Hosting | Self-host via Docker (one container) | Google-hosted only |
| Price | Free; pay your own hosting (~$5–50/mo) | Free for `@gmail.com`; Workspace $6+/user/mo |
| Google account | Not needed | **Required** |
| Native file format | `.docx` (OOXML round-trip) | Proprietary Google format; export to `.docx` |
| Round-trip fidelity | **44 of 44 fixtures pristine** (per-tag audit) | Google → .docx loses fonts, complex tables, ContentControls |
| Real-time co-edit | Yes (Yjs CRDT + Go y-websocket gateway) | Yes (Google's stack, OT-based) |
| Backend stack | Go gateway, ~120 LOC y-websocket protocol | Google's proprietary |
| Memory per session | Stateless (in-memory rooms only) | Server-side state |
| Headers / footers | Full support (different first page, section-scoped) | Full support |
| Tables | Borders, shading, merged cells, multi-row headers | Same |
| Comments + tracked changes | Inline markers, sidebar, accept/reject revisions | Same |
| Lists (multi-level) | Native bullets + numbered with proper outline | Same |
| Math equations | Renders, round-trips | LaTeX-style entry, no `.docx` round-trip |
| Fonts | All system fonts; @font-face from doc | Limited to Google Fonts catalog |
| Mobile | Web viewer + light editor at `≤768 px` | Native iOS + Android apps |
| Maturity | M1 backend live · public preview | 20 years, billions of users |
| Auth | Pluggable host integration (inline / WOPI / JWT-API) | Google account + Workspace policies |
| Backup / DR | Your problem (host owns persistence) | Google's problem |
| Add-ons / extensions | None today | Marketplace |

## Where Casual Editor wins

- **You want to keep documents on your servers.** Compliance,
  IP-sensitive contracts, paranoia — whatever the reason,
  `docker run -p 8080:8080 schnsrw/casual-editor:latest` puts the
  whole editor on a $5/mo VPS. No Google account required; no
  document leaves your network.
- **You want true `.docx` round-trip.** Open a Word document, edit
  in the browser, save back as `.docx` — the per-tag audit shows
  44 of 44 fixtures round-trip pristine. **Google Docs converts to
  its own format and re-exports with documented losses** (complex
  tables, ContentControls, footnote numbering, fonts not in Google
  Fonts).
- **You're building on top of a document editor.** Apache-2.0
  means you can fork, embed, or wrap it without negotiating a
  commercial license. The editor is a React component
  (`<DocxEditor>`); the Go gateway is ~120 lines of y-websocket
  protocol. Two clean integration points.
- **You don't want Google's billing math.** Workspace at $6/user/mo
  for 50 people is $3 600/year. The same workload runs on a
  single $15/mo VPS — see the
  [capacity model in the sister repo](https://github.com/CasualOffice/sheets/blob/main/docs/CAPACITY_MODEL.md)
  for the methodology (sheets numbers; editor's WS path is the
  same shape).
- **You want all your system fonts.** Casual Editor uses the
  fonts already installed on the user's system (plus any
  embedded in the doc via `@font-face`). Google Docs is limited
  to the Google Fonts catalog; uploading a custom font requires
  Workspace + Admin permissions and only works in your domain.

## Where Google Docs wins

- **You don't want to operate infrastructure.** Google Docs has
  no server you maintain, no Docker to upgrade, no TLS to renew.
  If "log in and use it" is the bar, the SaaS wins.
- **You need native mobile apps.** Google Docs ships first-class
  iOS + Android apps that work offline. Casual Editor ships a web
  viewer + light editor at `≤768 px` viewport but isn't a native
  app.
- **You depend on the Google ecosystem.** Drive sharing, Forms
  integration, Workspace SSO, Gmail attachments → Doc workflows,
  Smart Chips, Gemini integration — all SaaS-only by design.
- **You need add-ons.** Google has a marketplace of grammar
  checkers, citation managers, e-signature integrations, etc.
  Casual Editor has none today (the extension system in
  `packages/react/` is designed to support it, but no marketplace).
- **Your audience is non-technical.** Google Docs URLs work for
  anyone with a Google account; Casual Editor rooms work for
  anyone with the link but the operator still has to maintain
  the link + the server.
- **You want 20 years of edge-case `.docx` fidelity.** Casual
  Editor's 44/44 pristine fixtures cover the OOXML surface a
  typical business document uses; Microsoft + Google have decades
  of fixes for the exotic cases. If your documents push the
  format hard (legal contracts with deep ContentControls, scientific
  papers with mathML, etc.), Google Docs has more tested surface.

## Round-trip honesty

**The single biggest user-facing differentiator: `.docx` doesn't
survive a Google Docs round-trip cleanly.** When you upload a
`.docx` to Google Docs, edit it, and download as `.docx`, you
typically lose:

- ContentControls (form fields, structured document tags)
- Complex table structures (merged cells with specific border
  combinations)
- Footnote/endnote numbering schemes outside the default
- Fonts not in the Google Fonts catalog (substituted with
  fallbacks)
- Custom XML parts (Word add-in data)
- Some chart types (re-rendered to images on export)
- Specific paragraph spacing edge cases (Word's "line and page
  breaks" advanced settings)

This is documented on Google's own help pages. For most casual
editing it doesn't matter. For document workflows where the file
flows between web edit + desktop Word usage, **Casual Editor's
pristine round-trip preserves the file**.

## Self-host complexity, honestly

You need to be comfortable with:

- Docker (single container; multi-arch amd64 + arm64).
- A reverse proxy (nginx, Caddy, Traefik, or Cloudflare).
- TLS termination + cert renewal (Let's Encrypt via Caddy is one
  line; via nginx + certbot is more).
- Optional: pluggable host integration (inline / WOPI / JWT-API)
  if you want to delegate file storage to an external system.

The Go gateway is stateless — no DB to back up, no on-disk update
log to maintain. Rooms live in memory while a session is active,
which is the right shape for a small-team self-host (the host
integration owns the persisted `.docx` bytes).

If your IT team already runs nginx, they can run Casual Editor.

## Cost — real numbers

For ~50 users editing ~20 active documents (small-team shape):

| Cost surface | Casual Editor | Google Docs (Workspace Business Basic) |
|---|---|---|
| Hosting | $10–20/mo (small VPS) | $0 (Google-hosted) |
| Per-user licensing | $0 | $6/user/mo = $300/mo for 50 users |
| Setup time | 1 hour | 5 minutes per user |
| Ongoing ops | ~1 hour/month | Zero |
| **Total / year** | **~$180** | **~$3 600** |

The break-even is roughly 3 users. Below 3, Google Docs Personal
(free) is the cheapest answer. Above 3, the per-seat Workspace
billing pulls ahead in cost-of-self-host's favour rapidly.

## What's NOT in Casual Editor

Being honest about gaps:

- **AI assist.** No Gemini-style "rewrite this paragraph" or
  "summarise this document." The extension system supports it; no
  resources have been allocated to build the LLM integrations.
- **Voice typing.** Google's voice typing is mature; we have none.
- **Native mobile apps.** Web viewer + light editor works on
  phones, but not a native app.
- **Translation.** Google's right-click "Translate" is one click;
  ours requires a plugin nobody has built.
- **Smart Chips / linked previews.** No equivalent.
- **Real-time stats / reading-level analysis.** No equivalent.
- **Marketplace add-ons.** None.

These all land based on contributor interest — the
[improvement tracker](https://github.com/CasualOffice/docs/blob/main/docs/internal/08-improvement-tracker.md)
in the repo lists what's planned.

## When to choose what

**Pick Casual Editor if:**
- You need self-host or want to keep documents off Google's servers.
- True `.docx` round-trip matters (no silent format loss).
- You don't want Microsoft / Google billing for editor seats.
- You're building on top of a document editor.
- You want predictable, low cost.

**Pick Google Docs if:**
- You want zero operational responsibility.
- You depend on the Google ecosystem (Drive, Forms, Workspace).
- Your audience is non-technical.
- You need native mobile apps.
- You want AI assist + the marketplace add-ons today.
- Your documents push the OOXML format past common use.

## Try Casual Editor

```bash
docker run -p 8080:8080 schnsrw/casual-editor:latest
```

Open <http://localhost:8080>. Upload a `.docx`, edit it, save it.
Open the saved file in desktop Word — round-trip should be lossless
for the surface our audit covers (see
[`docs/internal/03-gap-matrix.md`](https://github.com/CasualOffice/docs/blob/main/docs/internal/03-gap-matrix.md)).

Live demo: <https://docs.casualoffice.org/>.
