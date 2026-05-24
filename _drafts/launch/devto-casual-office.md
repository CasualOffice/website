---
title: "Building Casual Office — an open-source web Office suite, from .xlsx round-trip to real-time co-edit"
published: false
tags: opensource, webdev, javascript, go
canonical_url: https://schnsrw.live/about/
cover_image: https://schnsrw.live/og.png
description: "Why I'm building three open-source web Office tools — a Sheet, a Doc editor, and a Tauri binary — and the design rules they share: file-centric, stateless backend, OSS-only deps."
---

I've been building **Casual Office** in the open — three projects that
together make up a small open-source web Office suite:

- **Casual Sheets** — Excel-flavored web spreadsheet. Apache-2.0.
  [Live demo](https://sheet.schnsrw.live/) · [Repo](https://github.com/schnsrw/sheets)
- **Casual Editor** — Word-flavored web `.docx` editor. Apache-2.0 + MIT.
  [Live demo](https://doc.schnsrw.live/) · [Repo](https://github.com/schnsrw/docx)
- **Casual Desktop** — Tauri binaries that reuse both web cores. In progress.

The umbrella site is at [schnsrw.live](https://schnsrw.live/).

I'm a solo engineer (Sachin Sarwa), and this is what I've been doing
nights/weekends for months. The architecture decisions have settled
enough that I want to write them down — partly so they're searchable,
partly so future contributors have a starting point.

---

## The thesis

The big Office suites — Google Sheets, Office 365, Notion's editor —
are vertical monoliths. Account system + storage + permissions + the
actual editor are bundled inseparably. You can't open a `.xlsx` from
your filesystem in Google Sheets without uploading it to Drive first,
which moves a copy into Google's data plane.

I wanted three small things instead:

1. **Native files are the source of truth.** Open a `.xlsx`, edit it
   like the web, save it back. The browser-side editor reads OOXML
   and writes OOXML — no export-only model.
2. **No accounts, no databases.** Anonymous rooms identified by URL.
   Self-host the Docker image and own everything end-to-end.
3. **OSS dependencies, no upsell.** Sheets is built on
   [Univer OSS](https://github.com/dream-num/univer) (Apache-2.0); if
   a feature is missing in OSS we build it on OSS or defer it. Never
   reach for Univer's commercial Pro layer.

These three constraints turn out to be load-bearing. Every interesting
design decision in the codebase comes back to one of them.

---

## What Casual Sheets has, today

v0.0.6 is shipping. 357 Playwright e2e tests on every push. The
round-trip lossiness audit is **46 / 46 probes pristine** across
styles, formulas, number formats, hyperlinks, defined names, data
validation, page setup, tables, freeze, hidden sheets, and workbook
metadata.

A non-exhaustive feature list:

- `.xlsx` / `.ods` / `.csv` / `.tsv` open + save through Web Workers.
- **`.xlsm` round-trips byte-equal.** I capture `xl/vbaProject.bin`
  before ExcelJS reads the buffer, then re-inject it on save with the
  `[Content_Types].xml` + workbook-rel patches. The macros work
  again the moment the file lands back in Excel. We never execute
  the VBA — that's a strict no.
- **Pivot tables with drill-down** (`Ctrl+Shift+D`) following the full
  composite key through multi-row layouts.
- 8 chart types with trendlines, date-axis detection, per-series
  colour overrides. Sparklines (line / column / win-loss).
- Real-time co-editing via Yjs + Hocuspocus over a single port.
  Anonymous rooms by URL; optional password-protected rooms with
  SHA-256 client gate **and** server `onAuthenticate` enforcement.
- Version history side panel with one-click restore (single-user
  mode). IndexedDB autosave with a restore banner on reload.
- Dark mode bridged into Univer's canvas chrome.
- 11-template home gallery — real `.xlsx` files with hand-tuned
  thumbnail previews.

The thing I'm most proud of structurally is how thin the layer above
Univer is. The collab driver, the xlsx workers, charts, pivots,
sparklines, the home gallery, the autosave loop, the version
history — all of it sits cleanly on Univer's OSS public surface.
No reaching into private internals, no Pro-only features.

---

## The trick with .xlsm

ExcelJS parses xlsx at the worksheet API level — it never touches
`xl/pivotCaches/*`, `xl/pivotTables/*`, or `xl/vbaProject.bin`. On a
naive open-edit-save loop, those parts are silently dropped.

For VBA the fix is small. The macro is one binary at a known path
(`xl/vbaProject.bin`). All we need is to:

1. Open the input `ArrayBuffer` as a zip via JSZip, before handing it
   to ExcelJS.
2. If we see `xl/vbaProject.bin`, base64-encode it and stash on the
   workbook snapshot under a custom sidecar resource
   (`__casual_sheets_xlsx_passthrough__`).
3. On export, after ExcelJS produces its xlsx buffer, re-open as zip,
   write the stashed binary at the original path, patch
   `[Content_Types].xml` to add an `<Override>` for the part, and
   patch `xl/_rels/workbook.xml.rels` to add the `vbaProject`
   relationship (with the next free `rId`).
4. Return the result with `.xlsm` extension + `application/vnd.ms-
   excel.sheet.macroEnabled.12` MIME.

```js
// abridged — full source at
// apps/web/src/xlsx/passthrough-resource.ts in the sheets repo
export async function applyPassthroughToXlsxBuffer(buf, payload) {
  if (!payload?.vba) return buf;
  const zip = await JSZip.loadAsync(buf);
  zip.file('xl/vbaProject.bin', payload.vba.binBase64, { base64: true });

  // Content_Types — add an Override if missing
  // xl/_rels/workbook.xml.rels — append a Relationship with the next
  // free rId
  // (regex-driven patches; full handling in the linked file)

  return zip.generateAsync({ type: 'arraybuffer' });
}
```

Complex pivot cache passthrough needs the same plumbing **plus** rel
renumbering across two rel files and surgery on `xl/workbook.xml` to
add the `<pivotCaches>` element with the remapped IDs. That's
deferred to P6.1 in the roadmap.

---

## Casual Editor in 120 lines of Go

The editor is a ProseMirror fork of `eigenpal/docx-editor` (MIT) with
the AGPL `@eigenpal/docx-editor-agents` package and dependents purged.
The interesting part is the gateway.

A real-time editor needs a sync server. Yjs has an official
`y-websocket` server. I didn't want a Node service alongside the Go
backend, so I reimplemented the protocol — sync step 1/2, update
broadcast, awareness — in Go, sitting in `~120` lines under
`backend/internal/yws/`. The room manager spins up one in-memory
`Y.Doc` per live session and drops it when the last client
disconnects.

State invariant: **the gateway has no DB and no on-disk update log.**
Document persistence is delegated to a `host.Integration` interface
with a concrete inline impl for the v0 share-link flow. WOPI and JWT-
API integrations slot in behind that same interface without touching
the WebSocket layer.

Fidelity gates everything. Three-way harness compares our output
against LibreOffice (via headless `soffice --convert-to`) and
OnlyOffice DocumentBuilder. CI fails when the per-tag audit
regresses. Current score is 26 of 39 fixtures pristine, working
toward ≥ 90% before the Tauri desktop binary ships.

---

## How it all deploys

Each project is one container. Sheets is `schnsrw/casual-sheets`,
Editor is `schnsrw/casual-editor`. Single port; web app + WebSocket
gateway + static file server bundled together.

```bash
docker run -p 3000:3000 schnsrw/casual-sheets:latest
docker run -p 8080:8080 schnsrw/casual-editor:latest
```

The site at [schnsrw.live](https://schnsrw.live) is Astro 5 (static
output, GitHub Pages). Docs are pulled from each repo's `docs/`
folder by a sync script — the markdown lives in two places, but the
source of truth stays in the project repo.

---

## What's next

Casual Sheets is closing the small remaining P6 gaps. Complex pivot
cache passthrough is the one substantial deferred item — it needs
proper OOXML surgery on `xl/workbook.xml` and rel renumbering, which
is rabbit-hole territory the simpler VBA case didn't need.

Casual Editor's gap matrix has the VML envelope as the main cluster
to close. Most fixtures fail on text-box / shape geometry; once that
lands the fidelity score crosses 90% and the first Tauri desktop
binary ships.

---

## Pointers

- [Casual Office umbrella](https://schnsrw.live/) — links to all three
- [Sheets repo](https://github.com/schnsrw/sheets) · [demo](https://sheet.schnsrw.live/)
- [Editor repo](https://github.com/schnsrw/docx) · [demo](https://doc.schnsrw.live/)
- [Docs](https://schnsrw.live/docs/) — architecture + research notes
  pulled from each repo
- [Changelog](https://schnsrw.live/changelog/) — per-product release
  notes

If you're working on something adjacent — OOXML tooling, Yjs adapters,
file-centric editors, alternative office suites — I'd love to compare
notes. Issues + PRs welcome.

---

_Cover image is the [Casual Office social card](https://schnsrw.live/og.png)._
