---
title: 'v0.1.1 — patch stability'
product: sheets
version: '0.1.1'
date: 2026-05-25
summary: 'Patch release: Excel-style typed input (currency · percent · negative-in-parens · non-USD symbols) parses as numbers; formula engine triggers initial recalc on workbook mount + swap; mobile lane regressions cleaned up (desktop toolbar hides at ≤480 px, autosave banner no longer clipped); e2e stability fixes that unblock long CI runs.'
repoUrl: https://github.com/schnsrw/sheets/releases/tag/v0.1.1
---

A small patch release on top of [v0.1.0](/changelog/sheets-v0.1.0/).
No new env vars, no breaking changes — safe to `:0.1` rolling-tag
in if you're already on v0.1.0.

## Fixed

### Excel-style typed input now parses as numbers

The formula bar + cell-edit input now coerce these to numbers
instead of plain strings:

- `$1,234` · `€99` · `£10.50` — currency symbol + thousands separators
- `15%` · `0.5%` — percent
- `(500)` — negative-in-parens (accounting convention)
- `1,234.56` — plain thousands separators

This matters because anything that lands as a string fails SUM
and friends silently. Pre-fix, pasting a column of "1,234"-style
numbers from elsewhere left them all as text.

### Formula engine — initial recalc on mount

A freshly-loaded workbook now triggers a recalc immediately so
computed cells show their evaluated values without needing a
follow-up edit. Same fix applied on workbook swap (e.g. after a
collab snapshot replaces local state).

### Mobile lane polish

- Desktop toolbar correctly hides at ≤ 480 px viewport (regressed
  from v0.0.6 during the post-v0.1.0 mobile pass).
- Autosave restore banner was being clipped by the `.app` grid
  overflow — turned out to be the root cause of intermittent
  1h+ e2e timeouts because the banner stayed in the DOM but
  couldn't be clicked.

### E2E stability

`waitForUniver` now dismisses the home screen on
`loading-overlay-step` so long-running CI runs don't stall
waiting for an overlay the harness had already covered.

## Try it

```bash
docker run -p 3000:3000 schnsrw/casual-sheets:0.1
```

Full upstream notes:
[github.com/schnsrw/sheets/releases/tag/v0.1.1](https://github.com/schnsrw/sheets/releases/tag/v0.1.1).
