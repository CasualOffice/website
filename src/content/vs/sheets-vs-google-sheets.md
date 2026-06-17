---
title: 'Casual Sheets vs Google Sheets — open-source self-hosted alternative'
description: 'Honest comparison between Casual Sheets (open-source, Apache-2.0, self-host via Docker) and Google Sheets (SaaS, free for personal, $6+/user for Workspace). Side-by-side on price, self-host, .xlsx round-trip, co-edit, formulas, charts, pivots, and maturity. No marketing — what each does well and where it falls short.'
ourProduct: sheets
other: 'Google Sheets'
verified: 2026-05-27
---

If you landed here searching for an **open-source alternative to Google
Sheets** that you can **self-host**, this page is what you actually
need before you commit. Both tools render the same surface — grid,
formulas, charts, co-edit — but the trade-offs are different in ways
that matter for real adoption decisions.

I built [Casual Sheets](/casual-sheets/), so I have an obvious bias.
The comparison below tries to be honest about where Google Sheets is
the better answer.

## At a glance

| | **Casual Sheets** | **Google Sheets** |
|---|---|---|
| License | Apache-2.0 — fully open source | Proprietary SaaS |
| Hosting | Self-host via Docker (one container) | Google-hosted only |
| Price | Free; pay your own hosting (~$5–50/mo) | Free for `@gmail.com`; Workspace $6+/user/mo |
| Data location | Your server | Google's servers |
| Offline | Yes (single-user mode works without server) | Yes (Chrome extension) |
| Native file format | `.xlsx` (round-trips byte-equal with `.xlsm` macros) | Proprietary Google format; export to `.xlsx` |
| Real-time co-edit | Yes (Yjs + Hocuspocus) | Yes (Google's CRDT) |
| Co-edit ceiling per process | ~500 active docs / 1500 concurrent WS (measured, p99 broadcast 3.2 ms) | Effectively unlimited |
| Pivot tables | Yes, with drill-down (Ctrl+Shift+D) | Yes |
| Charts | 8 types · trendlines · sparklines | 30+ types · more polish |
| VBA macros | Round-trip byte-equal on `.xlsm` (we don't execute them) | Apps Script (different language entirely) |
| Maturity | v0.2.1 · 139 unit + 357 e2e tests | 20 years, billions of users |
| Auth | JWT-secured roles · admin panel · WOPI host | Google account + Workspace policies |
| Backup / DR | Your problem (Redis AOF, file storage) | Google's problem |
| Mobile | Viewer + light editor on `≤480 px` | Native iOS + Android apps |

## Where Casual Sheets is a better fit

- **You need to keep the data on your servers.** Compliance, IP
  sensitivity, paranoia — whatever the reason, `docker run -p 3000:3000
  casualoffice/sheets:latest` puts the whole thing on a $5/mo VPS.
  No Google account required; no data leaves your network.
- **You're tired of Workspace billing.** Workspace at $6/user/month
  for 50 people is $3 600/year. The same workload runs on a single $48
  DigitalOcean droplet (8 GB / 4 vCPU). See the
  [capacity model](https://github.com/CasualOffice/sheets/blob/main/docs/CAPACITY_MODEL.md).
- **You want `.xlsm` macro files to survive the round-trip.** Google
  Sheets converts `.xlsm` to its proprietary format and silently drops
  the VBA. Casual Sheets captures `xl/vbaProject.bin` and re-emits it
  byte-equal on save. You won't execute VBA in the browser, but the
  macros survive for the next desktop user.
- **You want the surface to look like Excel, not a web app.** Ribbon,
  formula bar, file-centric workflow. Pivot drill-down via
  Ctrl+Shift+D matches Excel's "Show Details."
- **You're building on top of a spreadsheet.** Apache-2.0 means you
  can fork, embed, or wrap it without negotiating a commercial
  license. Univer OSS underneath is also Apache-2.0; no AGPL
  surprises.

## Where Google Sheets is a better fit

- **You don't want to operate infrastructure.** Google Sheets has
  no server you maintain, no Docker to upgrade, no AOF to back up,
  no nginx to tune. If "log in and use it" is the bar, the SaaS wins.
- **You need mobile-first.** Google's iOS + Android apps are first-
  class; Casual Sheets ships a web viewer that works on mobile but
  isn't a native app.
- **You want every chart type that exists.** Google Sheets ships
  ~30 chart types with rich customisation; Casual Sheets ships 8
  (line, column, bar, pie, donut, scatter, area, combo) plus
  sparklines. Covers 90% of real-world business decks but not the
  exotic ones.
- **You depend on Google ecosystem features.** AppSheet integration,
  Google Forms backing, Apps Script automation, Workspace SSO,
  shared-drive permissions — all SaaS-only by design.
- **Your audience is non-technical.** Google Sheets URLs work for
  anyone with a Google account. Casual Sheets rooms work for anyone
  with the link, but the operator still has to maintain the link.

## Self-host complexity, honestly

You need to be comfortable with these to run Casual Sheets in
production:

- Docker (one container; multi-arch amd64 + arm64).
- A reverse proxy (nginx, Caddy, Traefik, or Cloudflare — examples
  in [docs](/docs/sheets/self-hosting-reverse-proxy/)).
- Optional Redis for Y.Doc persistence across restarts.
- Raising the file-descriptor limit (`ulimit -n 65535`) — Linux
  default 1024 caps WebSocket connections at exactly that number
  with no useful error message.
- TLS termination + cert renewal.

Plenty of solo developers and small teams run this comfortably. If
your IT team can run nginx, they can run Casual Sheets.

## Cost honestly, with numbers

For ~100 concurrent users, ~30 active docs (the typical small-team
shape):

| Cost surface | Casual Sheets | Google Sheets |
|---|---|---|
| Hosting | $15–25/mo (DigitalOcean small VPS + Redis) | $0 personal; $300+/mo for 50 Workspace seats |
| Setup time | 1 hour (Docker compose + a reverse proxy) | 5 minutes (sign up) |
| Ongoing ops | ~1 hour/month for backups + updates | Zero |
| Per-user cost | ~$0.20/user/month | $6/user/month (Workspace) |

If you're a solo developer or a small team that already operates a
VPS, Casual Sheets is the cheaper-by-30x option. If you're a 200-
person company that doesn't want to think about it, Workspace is the
cheaper-in-total-cost-of-ownership option.

## What's NOT in Casual Sheets yet

Being honest: this is v0.2.1, ~6 months old. Gaps vs Google Sheets:

- **AI features.** No Gemini-style "explain this formula" or natural-
  language data analysis. Univer's command bus supports it; no
  resources allocated to build it.
- **Forms integration.** No equivalent to Google Forms feeding into
  a sheet.
- **Conditional formatting variety.** We support the common cases
  (data bars, colour scales, icon sets, custom formulas); Google
  has more presets.
- **Add-ons marketplace.** Google has thousands of third-party
  add-ons; we have a programmable command bus and an extension
  story but no marketplace.
- **Smart fill, smart cleanup, named ranges with refactor.** Some
  of these are partially shipped (Flash Fill works), some are not
  on the roadmap.

These all land or don't based on contributor interest. The roadmap
is `docs/PRODUCTION_PIPELINE.md` in the [repo](https://github.com/CasualOffice/sheets).

## When to choose what

- **Casual Sheets**, if: you need to self-host, you want `.xlsm` to
  survive, you want to avoid per-user SaaS billing, you're building
  on top of a spreadsheet, or you just like having the source.
- **Google Sheets**, if: you want zero infrastructure, you depend
  on the Workspace ecosystem, your audience is non-technical, or
  you need mobile-native apps.

Both can be the right answer.

## Try Casual Sheets

```bash
docker run -p 3000:3000 casualoffice/sheets:latest
```

Then open <http://localhost:3000>. The full self-hosting guide
covers reverse proxy, TLS, JWT auth, and the admin panel:
[/docs/sheets/self-hosting/](/docs/sheets/self-hosting/).

Live demo: <https://sheet.casualoffice.org/>.
