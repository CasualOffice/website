---
title: 'v0.0.5 — feature breadth + co-edit fidelity'
product: sheets
version: '0.0.5'
date: 2026-05-23
summary: 'Phase 4 closes: Charts P1–P5b shipped, Pivot Tables P0, conditional formatting and data validation co-edit synced, drawings synced, autosave with restore banner, ODS fidelity, and 30+ Excel keyboard shortcuts.'
repoUrl: https://github.com/CasualOffice/sheets/releases/tag/v0.0.5
---

The feature-breadth release — phase 4 of the roadmap closes. After
v0.0.5, the editor handles the majority of what a typical Excel
workflow needs: charts, pivots, conditional formatting, validation,
drawings — all with co-edit synced.

## Charts

- **8 chart types**: line, column, bar, pie, donut, scatter, area,
  combo. ECharts overlay anchored to cell ranges.
- **Insert dialog**, **drag/resize**, **format dialog** for every type.
- **Collab sync** — charts ride the standard mutation path.
- **PNG embed** — exports to xlsx with rendered images for foreign-
  reader compatibility.

## Pivot tables P0

- Group-by + aggregate from the Insert menu.
- Output materialised into cells; co-edit syncs the materialisation.

## Co-edit synced

- **Conditional formatting**, **data validation**, **drawings** —
  all flow through the Univer mutation bus with `SYNCED_MUTATIONS`
  additions for the missing prefixes.
- **Workbook/worksheet metadata** — tab colours, zoom, freeze, sheet
  visibility — all synced cross-peer.

## Autosave + restore

- IndexedDB autosave loop running while the workbook is dirty.
- **Restore banner** on reload — meaningful-cells gate so the banner
  only shows when there's real content to recover.

## ODS

- Styles, dimensions, freeze, hyperlinks, comments, defined names —
  all round-trip through the ods pipeline.

## Keyboard

- **30+ additional Excel keyboard shortcuts** beyond the v0.0.3 set:
  cell + range navigation, format toggles, paste variants, fill
  handle, defined-name jumps.
