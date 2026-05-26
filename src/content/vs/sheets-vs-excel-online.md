---
title: 'Casual Sheets vs Excel Online — open-source alternative you can self-host'
description: 'Honest comparison between Casual Sheets (open-source, Apache-2.0, self-host via Docker, no Microsoft account) and Excel Online / Microsoft 365 (SaaS, $6+/user/month, Microsoft account required). Side-by-side on .xlsx fidelity, co-edit, formulas, charts, VBA macros, and where each fits.'
ourProduct: sheets
other: 'Excel Online'
verified: 2026-05-27
---

If you searched **"open source Excel Online alternative"** or
**"self-host alternative to Microsoft 365"**, this page covers
[Casual Sheets](/casual-sheets/) honestly against Excel Online.

The short version: Casual Sheets is the right answer if you want to
keep `.xlsx` workflows on your own infrastructure without a
Microsoft account. Excel Online is the right answer if you're
committed to the Microsoft 365 ecosystem.

## At a glance

| | **Casual Sheets** | **Excel Online (Microsoft 365)** |
|---|---|---|
| License | Apache-2.0 — open source | Proprietary SaaS |
| Hosting | Self-host via Docker | Microsoft-hosted only |
| Price | Free; pay your own hosting (~$5–50/mo) | Microsoft 365 Personal $7/mo · Business Basic $6/user/mo |
| Microsoft account | Not needed | **Required** |
| Native file format | `.xlsx` (round-trips byte-equal with `.xlsm`) | `.xlsx` (native) |
| File compatibility | `.xlsx`, `.ods`, `.csv`, `.tsv` | `.xlsx` + import for many |
| `.xlsm` macros | Round-trip byte-equal (we don't execute VBA) | Web doesn't run VBA either |
| Real-time co-edit | Yes (Yjs + Hocuspocus) | Yes (Microsoft's stack) |
| Formula support | Univer formula engine (~500 functions) | Full Excel function library (~500 + dynamic arrays) |
| Charts | 8 types · trendlines · sparklines | 50+ types · richer customisation |
| Pivot tables | Yes, with drill-down | Yes, mature |
| Power Query / Power Pivot | No | Yes (Microsoft 365) |
| Data location | Your server | Microsoft's servers (US/EU/etc. by tenant) |
| Offline | Yes (single-user mode) | Limited (web only — full offline is desktop Excel) |
| Mobile | Web viewer + light editor | Native iOS + Android apps |
| Maturity | v0.2.1 · 139 unit + 357 e2e tests | 35+ years of Excel lineage |
| Integration | WOPI host (works with Nextcloud / SharePoint clones) | SharePoint, Teams, OneDrive, Power BI |

## Where Casual Sheets wins

- **No Microsoft account required.** Excel Online is locked behind a
  Microsoft account; the free tier is `live.com`/`outlook.com`,
  business use needs a Microsoft 365 tenant. Casual Sheets has zero
  identity requirement — anonymous rooms work, or wire up JWT for
  authenticated access.
- **Data stays on your servers.** Compliance, sovereignty, paranoia —
  whatever the reason, `docker run` puts the whole stack on your
  hardware. Some jurisdictions (Germany BSI, India MeitY, certain
  US government contractors) require data residency that Microsoft
  data centres don't always match.
- **`.xlsm` macros survive the round-trip.** Excel Online silently
  strips VBA on save (it's a web app; it can't execute VBA). Casual
  Sheets captures `xl/vbaProject.bin` and re-emits it byte-equal —
  so the next desktop user opening the file still has working macros.
  Same operational result, but you don't need a desktop Excel
  license to preserve the VBA.
- **Predictable cost.** Microsoft 365 Business Basic for 100 users
  is $7 200/year. Casual Sheets for the same workload runs on a
  $48/mo DigitalOcean droplet — $576/year, total. The 13× difference
  matters for self-funded teams.
- **Apache-2.0.** Fork it, embed it, wrap it. No licensing
  negotiation.

## Where Excel Online wins

- **Full Excel function library.** Microsoft has 35 years of formula
  refinement; some niche functions (LET, LAMBDA, XLOOKUP edge cases,
  dynamic arrays with implicit intersection) aren't fully in Univer's
  engine yet.
- **Power Query / Power Pivot.** If your workflow depends on Get &
  Transform or data models from external sources, Excel Online +
  desktop Excel is the answer. Casual Sheets has CSV import but no
  query refresh.
- **Chart variety + polish.** Excel ships 50+ chart types with
  presentation-grade defaults. Casual Sheets ships 8 covering the
  common cases.
- **Native mobile apps.** Excel for iOS and Android are first-class.
  Casual Sheets has a web viewer + light editor at `≤480 px`; it
  works but isn't a native app.
- **Deep Office ecosystem integration.** SharePoint, Teams, Power
  Automate, Power BI — if your organisation is Microsoft-heavy, the
  network effects are real.
- **35 years of edge-case fidelity.** Exotic chart types, complex
  array formula behaviours, certain print layouts — Microsoft has
  fixed bugs you haven't even hit yet.

## VBA reality check

Neither product **runs** VBA in the browser. Excel Online silently
drops macros on save. Casual Sheets captures and re-emits them
byte-equal, so the next time the file opens in desktop Excel, the
macros still execute. Same "browser can't run VBA" reality; different
preservation behavior.

If macro preservation matters to your team's workflow (file flows
through web edit → email → desktop Excel run), Casual Sheets is
strictly better here.

## Self-host complexity, honestly

You need to be comfortable with:

- Docker (single container; multi-arch amd64 + arm64).
- A reverse proxy (nginx, Caddy, Traefik, or Cloudflare).
- Optional Redis for Y.Doc persistence across restarts.
- Raising `ulimit -n 65535` for WebSocket connections.
- TLS termination + cert renewal.

If your IT team already runs nginx, they can run Casual Sheets.
Excel Online has zero of these — you sign up, you use it.

## Cost — real numbers

For ~100 concurrent users, ~30 active docs (small-team shape):

| Cost surface | Casual Sheets | Excel Online (M365 Business Basic) |
|---|---|---|
| Hosting | $15–25/mo (small VPS + Redis) | $0 (Microsoft-hosted) |
| Per-user licensing | $0 | $6/user/mo = $600/mo for 100 users |
| Setup time | 1 hour | 5 minutes per user |
| Ongoing ops | ~1 hour/month | Zero |
| **Total / year** | **~$300** | **~$7 200** |

For ~10 concurrent users (very small team):

| Cost surface | Casual Sheets | Excel Online |
|---|---|---|
| Hosting | $5–10/mo (tiny VPS) | $0 |
| Per-user licensing | $0 | $60/mo for 10 users |
| **Total / year** | **~$120** | **~$720** |

Both ranges; both could be right for you. The break-even is
roughly 2 users — past that, the per-seat SaaS billing dominates.

## What's not in Casual Sheets

Being honest about gaps vs Excel Online:

- **Dynamic array formulas** (FILTER, SORT, UNIQUE, SEQUENCE) —
  partial support; not all Excel 365 array behaviours.
- **LAMBDA + LET** — not yet.
- **Power Query** — not on the roadmap.
- **Co-authoring presence avatars with cursors on cells** — works,
  but less polished than Excel's "name + colour ring on the active
  cell" treatment.
- **Native iOS/Android apps.**
- **Right-click "Translate" / AI assist** — Univer's command bus
  supports plugins; no resources allocated to build the integrations.

These all land based on contributor interest; the roadmap is
`docs/PRODUCTION_PIPELINE.md` in the [repo](https://github.com/schnsrw/sheets).

## When to choose what

**Pick Casual Sheets if:**
- You want to keep data on your servers.
- You want predictable, low cost.
- You don't want a Microsoft account dependency.
- You're building on top of a spreadsheet.
- VBA macro preservation matters.

**Pick Excel Online if:**
- You're already on Microsoft 365 for everything else.
- You depend on Power Query / Power Pivot / Power BI.
- You need niche Excel-365-specific functions (LAMBDA, etc.).
- You want native mobile apps.
- You don't want any operational responsibility.

## Try Casual Sheets

```bash
docker run -p 3000:3000 schnsrw/casual-sheets:latest
```

Open <http://localhost:3000>, upload an `.xlsx` file from your
Excel workflow, edit it, save it. Open the saved file in desktop
Excel — round-trip should be lossless for the surface we cover
(see the 46-probe audit in `docs/xlsx-lossiness.md`).

Live demo: <https://sheet.schnsrw.live/>.
