---
title: 'Casual Sheets vs OnlyOffice — which open-source office suite to self-host'
description: 'Honest technical comparison between Casual Sheets (Apache-2.0, Yjs + Hocuspocus, .xlsx round-trip, ~10 MB image) and OnlyOffice Document Server (AGPL, single-binary, .docx + .xlsx + .pptx). Architecture, license, deployment shape, fidelity, co-edit, and which one fits which workload.'
ourProduct: sheets
other: 'OnlyOffice'
verified: 2026-05-27
---

OnlyOffice Document Server is the obvious comparison if you've
shortlisted "open-source self-hosted office suite" and you want to
serve real spreadsheets. It's been around since 2009, ships an
all-in-one binary for Linux + Windows + Docker, and renders `.docx`
+ `.xlsx` + `.pptx` with high fidelity.

[Casual Sheets](/casual-sheets/) is the newcomer (v0.2.1, ~6 months
old). This comparison is honest about where OnlyOffice wins.

## At a glance

| | **Casual Sheets** | **OnlyOffice Document Server** |
|---|---|---|
| License | Apache-2.0 (truly permissive) | **AGPL-3.0** + commercial offering |
| File formats | `.xlsx`, `.ods`, `.csv`, `.tsv` | `.docx`, `.xlsx`, `.pptx`, `.odt`, `.ods`, `.odp`, others |
| Scope | Spreadsheets only (sister projects for docs + slides) | Full suite — docs + sheets + slides + forms |
| Docker image size | ~50 MB compressed (single-arch) | ~1.5 GB (multi-arch, bundles everything) |
| RAM at idle | ~100 MB | ~1.5 GB |
| Backend stack | Fastify + Hocuspocus (Node) | C++ DocService + Node + RabbitMQ |
| Sync engine | Yjs CRDT | OT (Operational Transform) |
| Co-edit ceiling | ~500 active docs / 1500 WS per process (measured) | Higher per process, but heavier per-doc |
| Auth | Built-in JWT + admin panel | JWT (token in URL) + integration hooks |
| Integration model | Direct UI + WOPI host | WOPI/JWT integration — designed to embed into Nextcloud/Seafile/etc. |
| Standalone use | Yes — first-class | Designed to be embedded; standalone UI is utilitarian |
| Maturity | v0.2.1 · 6 months | v8+ · 15+ years |
| Mobile | Web viewer + light editor | Native iOS + Android apps + web |

## License — the elephant in the room

OnlyOffice is **AGPL-3.0** for the open-source edition. If you embed
it in a product you ship to anyone (including SaaS users) you have
to release your full application's source under AGPL. That's a
non-starter for most commercial use; OnlyOffice sells a commercial
license to escape it.

**Casual Sheets is Apache-2.0.** Embed it, fork it, wrap it, ship it
to customers — no copyleft, no commercial license to buy. This is
the single biggest reason to pick Casual Sheets if you're building
on top.

If you're self-hosting only for your own use (employees, a closed
team) and never plan to redistribute, the AGPL doesn't affect you.

## Architecture — different design centers

OnlyOffice is built to be **embedded into a host**. It assumes your
authentication, your file storage, your URL structure. WOPI is the
primary integration surface; the standalone UI is functional but
clearly a secondary concern.

Casual Sheets is built to be **used directly OR embedded**. The
standalone UI is a first-class web app (Office-style ribbon, home
gallery, recent files); the WOPI host integration is there too if
you want to plug it into Nextcloud or another host, but it's not
the only path.

If your shape is "I want to give my users a great spreadsheet right
now," Casual Sheets makes that one-line easy. If your shape is "I
have a document-management system and I want a spreadsheet renderer
inside it," OnlyOffice's WOPI-first design fits better.

## .xlsx fidelity, measured

| File feature | Casual Sheets | OnlyOffice |
|---|---|---|
| Cell values + formats | ✅ | ✅ |
| Formulas | ✅ (Univer formula engine) | ✅ |
| Number formats | ✅ | ✅ |
| Pivot tables | ✅ (re-emit + drill-down) | ✅ |
| Conditional formatting | ✅ common cases | ✅ more presets |
| Charts | ✅ 8 types via ECharts | ✅ more types, native rendering |
| Data validation | ✅ | ✅ |
| Sparklines | ✅ | ✅ |
| `.xlsm` VBA passthrough | ✅ **byte-equal** — captures `xl/vbaProject.bin` and re-emits | ✅ Pro edition |
| Pivot cache passthrough | ✅ 54 / 54 audit pristine | ✅ |
| Page setup / print | ✅ | ✅ |
| Defined names | ✅ | ✅ |

Casual Sheets has a 54-probe round-trip audit checked into the
repo. OnlyOffice has a decade of bug fixes on harder edge cases
(complex array formulas, esoteric chart types). For mainstream
business spreadsheets both round-trip without surprise. For your
most exotic `.xlsx` files, OnlyOffice has more tested surface.

## Resource footprint

OnlyOffice Document Server ships a kitchen-sink stack: C++ document
processor, Node UI server, RabbitMQ for job queuing, Redis, Postgres.
~1.5 GB Docker image, ~1.5 GB RAM at idle, multiple processes per
host.

Casual Sheets is a Fastify + Hocuspocus binary plus the built web
SPA. ~50 MB image, ~100 MB RAM at idle, single Node process.
Single-doc memory is ~370 KB; you can fit thousands of active docs
on an 8 GB box.

If you're sizing for "tiny VPS that just works," the Casual Sheets
footprint is roughly 30× smaller. If you have hardware to spare and
want the integrated suite, OnlyOffice's larger footprint isn't an
issue.

## When to choose what

**Pick OnlyOffice if:**
- You need `.docx` + `.xlsx` + `.pptx` in a single binary today.
- You're embedding into a document-management system (Nextcloud,
  Seafile, ownCloud) that already has WOPI integration.
- You need native mobile apps.
- The AGPL doesn't affect your distribution model (internal use,
  or you have an AGPL-compatible product, or you're buying the
  commercial license).
- You want the most-tested edge-case `.xlsx` fidelity.

**Pick Casual Sheets if:**
- License matters — Apache-2.0 lets you embed, fork, or ship without
  copyleft obligations.
- You only need spreadsheets right now (Casual Docs and Casual
  Slides are sister projects on their own roadmap).
- You want a small footprint — a $5/mo VPS comfortably handles a
  small team.
- You're building on top of a spreadsheet and need clean
  extensibility.
- You want the source to be readable in a weekend (~10k LOC web +
  ~3k LOC backend, vs OnlyOffice's hundreds of thousands).

Both are real choices. The AGPL question usually decides for you.

## What about the other two products?

[Casual Docs](/casual-docs/) (`.docx`) and [Casual Slides](/casual-slides/)
(`.pptx`) are sister projects in the same suite. Editor is at M1
backend live with the WOPI host integration; Slides is at v0.0.0
pre-tag (fidelity-mature, infra-immature). Neither matches
OnlyOffice's maturity on those formats yet.

If you need the full office suite **today**, OnlyOffice is the
right answer for `.docx` + `.pptx` while Casual Sheets handles
`.xlsx`. As Casual Docs and Casual Slides reach v0.2.x parity,
the suite story closes.

## Try Casual Sheets

```bash
docker run -p 3000:3000 casualoffice/sheets:latest
```

Compare image size, RAM use, and startup time directly against an
OnlyOffice Document Server container — the differences are
substantial.
