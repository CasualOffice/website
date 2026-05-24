---
title: 'v0.0.6 — Excel-parity wave'
product: sheets
version: '0.0.6'
date: 2026-05-23
summary: 'Phase 5 closes the Excel parity gap: Pivots P1 + drill-down, Sparklines, Goal Seek, Name Manager, Flash Fill, dark theme, Recent Files landing, Paste Special, server-side view-only enforcement, and 357 e2e tests.'
repoUrl: https://github.com/schnsrw/sheets/releases/tag/v0.0.6
---

The Excel-parity wave — phase 5 of the roadmap closes. v0.0.6 is the
release I'd reach for first when comparing to Microsoft Excel for the
web.

## Analysis tools

- **Name Manager** (`Ctrl+F3`) — full named-range dialog with comment
  + hidden + workbook/sheet scope, wired to Univer's defined-name
  service.
- **Flash Fill** (`Ctrl+E`) — column-aware fill that finds the pattern
  from a couple of examples.
- **Goal Seek** — iterative solver dialog with a convergence guard for
  flat curves; lands on the right answer for the standard textbook
  problems.

## Pivot tables P1

- Filter fields, **Refresh PivotTables** menu, output-extent tracking
  on the model so co-edit + autosave see the right cells.
- **Drill-down to contributing source rows** (`Ctrl+Shift+D`) — follows
  the full composite key path through multi-row layouts.

## Charts + sparklines

- **Trendlines**, **date-axis detection**, per-series colour overrides.
- **Sparklines**: line / column / win-loss as in-cell mini-charts, with
  workbook-resource persistence so they round-trip through xlsx.

## UI + UX

- **Show Formulas** (`Ctrl+\``) — non-destructive DOM overlay paints
  the formula source on every formula cell.
- **Print Area** (A1 field in Page Setup + File-menu Set / Clear).
- **Recent Files** landing — IndexedDB-backed, last 10, surfaces on a
  blank Untitled.
- **Paste Special** (`Ctrl+Alt+V`) — 6 Univer-native paste modes wired
  through the standard mutation path.
- **Dark mode** toggle (title-bar sun/moon), bridged into Univer's
  ThemeService so the canvas chrome flips too.
- **Local version history** — snapshot store + preview + restore in
  single-user mode.
- **Status-bar customisation** — right-click checklist (Average /
  Count / Sum / Min / Max / Numerical Count).
- **Multi-range presence** — peer cursors render every range in a
  Ctrl-click selection.
- **NamePill** — in-room name edit affordance.
- **Quick wins**: `Ctrl+Alt+L` re-apply filter, `Ctrl+[ / Ctrl+]`
  precedent / dependent navigation.

## Collab + safety

- **Server-side view-only enforcement** — Hocuspocus `onAuthenticate`
  flips `connection.readOnly` so view-role joiners can't bypass the
  client gate.

## Shell

- **Merged title bar** (Google-Docs-style logo + filename + menus +
  actions).
- **Right-edge panel rail** — Tables / Charts / Outline / Comments /
  History.
- **Brand mark** aligned with the sister doc editor.
- **Inline SVG icons** — ~155 components covering every name the app
  uses; sharp at every size, no font-load delay.

## Quality

- **357 Playwright e2e tests** across the prod-bundle + dev-server
  suites.
- Lossiness audit closed at **33 / 33** at release time (now 46 / 46
  with VBA passthrough on `main`).
