---
title: "Architecture"
product: sheets
order: 20
sourceUrl: "https://github.com/schnsrw/sheets/blob/main/docs/ARCHITECTURE.md"
updated: 2026-05-22T20:35:52.429Z
summary: "How the Univer grid, collab driver, xlsx workers, charts, and panels fit together."
---
System design for Casual Sheets. For Univer internals see [`RESEARCH.md`](/docs/sheets/research/).

---

## System diagram

```
┌──────────────────────────────── Browser ─────────────────────────────────────┐
│                                                                              │
│  React app (Vite, TypeScript strict)                                         │
│                                                                              │
│  ┌──────────────── Office-style shell (apps/web/src/shell/) ───────────────┐ │
│  │  TitleBar · FileMenu · Properties dialog · Share dialog                │ │
│  │  Ribbon (Home / Insert / Formulas / Data / View / Review)              │ │
│  │  FormulaBar + NameBox · StatusBar (stats + zoom + presence avatars)    │ │
│  │  History panel · LoadingOverlay · SaveToast · BusyPill                 │ │
│  └──────────────────────────────────────────────────────────────────────┘  │
│          │ executeCommand / FUniver API                                      │
│  ┌───────▼───────────────────────────────────────────────────────────────┐  │
│  │  Univer OSS (apps/web/src/univer/)                                    │  │
│  │  ├─ Canvas grid + cell editor + formula engine                        │  │
│  │  ├─ Plugin registry (lazy-loaded: CF, DV, drawing, sort, filter …)   │  │
│  │  └─ ICommandService — mutation bus                                    │  │
│  └────────────────────────────────┬──────────────────────────────────────┘  │
│                                   │ onMutationExecutedForCollab              │
│  ┌────────────────────────────────▼──────────────────────────────────────┐  │
│  │  Collab bridge (apps/web/src/collab/)                                 │  │
│  │  ├─ Outgoing: mutation → Y.Doc update                                 │  │
│  │  ├─ Incoming: Y.Doc update → syncExecuteCommand(…, { fromCollab })   │  │
│  │  ├─ Presence: cursor, selection, live-edit ghost via Awareness        │  │
│  │  └─ CollabDriver: join/leave, snapshot fast-path, divergence detect  │  │
│  └────────────────────────────────┬──────────────────────────────────────┘  │
│                                   │ Y.Doc updates / Awareness               │
│  ┌────────────────────────────────▼──────────────────────────────────────┐  │
│  │  Yjs + y-websocket provider  →  wss://host/yjs?room=<id>&p=<pw>      │  │
│  └──────────────────────────────┬─────────────────────────────────────────┘ │
│                                 │                                            │
│  ┌──────────────────────────────▼─────────────────────────────────────────┐ │
│  │  xlsx / ods / csv / tsv workers (apps/web/src/xlsx/)                  │ │
│  │  ExcelJS + @e965/xlsx run in dedicated Web Workers                    │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────┬───────────────────────────────────────────┘
                                   │ WebSocket  /yjs
                                   │ HTTP       /api/*
                                   ▼
┌──────────────────────────── Node server (apps/server/) ──────────────────────┐
│                                                                              │
│  Fastify (HTTP + static serve)                                               │
│  ├─ GET  /                            web app bundle                         │
│  ├─ GET  /r/:roomId                   same SPA; room context                 │
│  ├─ POST /api/rooms                   create room {password?, seed?}         │
│  ├─ GET  /api/rooms/:id/info          {needsPassword, hasSeed, clients…}     │
│  ├─ POST /api/rooms/:id/seed          multipart xlsx upload                  │
│  ├─ GET  /api/rooms/:id/seed          download seed xlsx                     │
│  ├─ POST /api/rooms/:id/snapshot      gzipped IWorkbookData upload           │
│  ├─ GET  /api/rooms/:id/snapshot      joiner fast-path fetch (immutable)     │
│  ├─ GET  /api/rooms                   diagnostic: live rooms + counts        │
│  └─ GET  /health                      {ok, ts, rooms}                        │
│                                                                              │
│  Hocuspocus (WebSocket /yjs)                                                 │
│  ├─ Room registry Map<roomId, RoomState>                                     │
│  ├─ Password gate: SHA-256 + constant-time compare, close 4401 on fail       │
│  ├─ Op-log compaction on requestIdleCallback (Stage 6)                       │
│  └─ Room GC: password/seed rooms kept; throwaway rooms evicted after TTL     │
│                                                                              │
│  Redis (optional)                                                            │
│  └─ Y.Doc binary updates persisted with 7-day TTL                            │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Source layout

```
apps/web/src/
├── collab/
│   ├── bridge.ts           # Univer ↔ Yjs mutation translation
│   ├── bridge-helpers.ts   # deepRewriteUnitId, mutation utilities
│   ├── CollabDriver.tsx    # join/leave/reconnect state machine
│   ├── presence.ts         # cursor + selection awareness
│   ├── PresenceLayer.tsx   # overlay that renders peer cursors
│   ├── AvatarStack.tsx     # title-bar presence avatars
│   ├── LiveEditGhost.tsx   # live-typing preview for the peer's cell
│   └── HistoryPanel.tsx    # per-room op log with revert support
├── shell/
│   ├── TitleBar.tsx
│   ├── Ribbon.tsx          # Office-style tab/group/button ribbon
│   ├── FormulaBar.tsx      # editable NameBox + formula input
│   ├── StatusBar.tsx       # SUM/AVG/COUNT/MIN/MAX + zoom + presence
│   ├── FileMenu.tsx        # Open / Save / Share / Properties
│   ├── CreateRoomDialog.tsx
│   ├── LoadingOverlay.tsx
│   └── ShareDialog.tsx
├── univer/
│   ├── setup.ts            # plugin registration + lazy loader
│   ├── lazy.ts             # per-feature deferred import chunks
│   └── univerAPI.ts        # typed FUniver wrapper
└── xlsx/
    ├── worker.ts           # Web Worker entry point
    ├── xlsx-import.ts      # ExcelJS → IWorkbookData
    └── xlsx-export.ts      # IWorkbookData → ExcelJS → Blob
```

---

## Key data flows

### Open file (client-side)
1. User drops `.xlsx` / `.ods` / `.csv` or uses File → Open.
2. File handed to the xlsx Web Worker via `postMessage`.
3. Worker parses with ExcelJS (or `@e965/xlsx` for ODS) → `IWorkbookData` JSON.
4. Main thread snapshot-installs the workbook into Univer without storing a duplicate copy in React state (snapshot-as-ref).
5. Lazy plugins (CF, DV, drawing…) are eager-loaded if the snapshot contains their data.

### Save / export (client-side)
1. Shell calls `univerAPI.getWorkbookData()` → serialises to `IWorkbookData`.
2. Passed to the xlsx worker → ExcelJS writes → `Blob` returned.
3. Shell triggers a browser download.

### Co-editing — outgoing mutation
```
User types in cell A1
  → Univer fires sheet.mutation.set-range-values
  → ICommandService.onMutationExecutedForCollab
  → bridge.ts: encode into Y.Doc update (coalesced per microtask via doc.transact)
  → y-websocket sends to server
  → server broadcasts to all peers in the room
```

### Co-editing — incoming mutation
```
Server → y-websocket delivers Y.Doc update
  → bridge.ts: decode mutation(s) from update
  → rewriteUnitId + deepRewriteUnitId to match the local unit
  → cs.syncExecuteCommand(id, params, { fromCollab: true })
  → Univer applies; fromCollab flag prevents re-broadcast (echo-loop prevention)
```

### Joiner fast-path
1. Browser navigates to `/r/:roomId`.
2. `CollabDriver` calls `GET /api/rooms/:id/snapshot` — server returns gzip-streamed `IWorkbookData`.
3. Snapshot is decompressed and installed in Univer directly; the expensive xlsx parse is skipped.
4. Yjs provider connects and applies any ops that arrived after the snapshot was taken.

---

## Collab bridge — Yjs document shape

The Y.Doc mirrors `IWorkbookData`. Mutations translate to Y.Map / Y.Array leaf operations.

```
Y.Doc
├─ Y.Map "meta"         { id, name, sheetOrder[], locale, appVersion }
├─ Y.Map "styles"       { [styleId]: IStyleData }
├─ Y.Map "sheets"
│   └─ Y.Map [sheetId]
│       ├─ Y.Map "meta"       { name, tabColor, hidden, zoom, freeze… }
│       ├─ Y.Map "cells"      { "r:c": ICellData }
│       ├─ Y.Array "merges"
│       ├─ Y.Map "rowData"    { [row]: IRowData }
│       └─ Y.Map "columnData" { [col]: IColumnData }
├─ Y.Map "resources"    { [pluginKey]: plugin-defined payload }
│   ├─ "SHEET_CONDITIONAL_FORMAT_PLUGIN"  → CF rules per sheet
│   ├─ "DATA_VALIDATION_PLUGIN"           → DV rules per sheet
│   ├─ "DRAWING_PLUGIN"                   → drawing descriptors
│   └─ "CASUAL_SHEETS_CHARTS"             → ECharts config per chart
└─ Y.Map "defined-names"   { [name]: IDefinedNameData }
```

Conflict semantics: **last-writer-wins on Y.Map leaves**. Acceptable for spreadsheet cells — same as Excel's "last save wins" on shared workbooks.

---

## Plugin loading strategy

Univer's heavier plugins ship as separate Vite chunks and are loaded lazily:

| Plugin | Load trigger |
| --- | --- |
| Conditional formatting | Snapshot inspection OR user action |
| Data validation | Snapshot inspection OR user action |
| Hyperlinks | Snapshot inspection OR user action |
| Drawings | Snapshot inspection OR user action |
| Sort / filter | First sort or filter action |
| Find & replace | Ctrl+H |
| Thread comments | Snapshot inspection |
| Charts (ECharts) | Snapshot inspection OR Insert → Chart |

---

## Large-file mitigations

See [`LARGE_FILE_PIPELINE.md`](/docs/sheets/large_file_pipeline/) for the full staged plan.

| Problem | Solution |
| --- | --- |
| Main thread block on xlsx parse | ExcelJS runs in a Web Worker |
| React state duplication of workbook | Snapshot-as-ref — `IWorkbookData` lives only in Univer |
| Slow link replay on large paste | Op-log batching via `doc.transact` |
| `CMD+A` stats freeze on large sheets | Selection-stats cell cap |
| Long-lived room memory growth | Stage-6 op-log compaction on `requestIdleCallback` |

---

## Design decisions

| Decision | Rationale |
| --- | --- |
| `ICommandService.onMutationExecutedForCollab` | The hook Univer exposes for exactly this. UI-level interception misses programmatic edits, formula recalc, and undo. |
| Yjs over OT/ShareDB | No central authority needed; awareness protocol included; proven Hocuspocus adapter. |
| Hocuspocus over raw y-websocket | Auth hooks, lifecycle events, built-in persistence adapter slot. |
| ExcelJS for xlsx | Apache-2.0. SheetJS Community has stricter licensing on some export features. |
| `@e965/xlsx` (SheetJS fork) for ODS | ExcelJS doesn't write ODS; SheetJS parses and writes it. |
| ECharts for charts | Mature, Apache-2.0; renders to canvas overlay anchored to cell ranges, no Univer Pro dependency. |
| Worker-side xlsx I/O | Multi-MB files can't parse synchronously on the main thread without freezing the UI. |
| In-memory + Redis only | Project scope. Adding a DB would require a Hocuspocus persistence adapter — the collab layer stays the same. |
| No Univer Pro | All charts, pivots, and xlsx I/O are built on OSS surface. |

---

_Synced from [`docs/ARCHITECTURE.md` in schnsrw/sheets](https://github.com/schnsrw/sheets/blob/main/docs/ARCHITECTURE.md). To update: edit upstream and re-run `npm run sync-docs`._
