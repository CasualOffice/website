# Show HN — Casual Sheets

## Title (≤ 80 chars)

```
Show HN: Casual Sheets – open-source web spreadsheet with .xlsx round-trip
```

## URL field

```
https://sheet.schnsrw.live/
```

## First comment (post immediately after submission)

```
Hi HN — I've been building an open-source web spreadsheet that opens
and saves native .xlsx in the browser, with real-time co-editing,
pivot tables, eight chart types, sparklines, and version history.

Demo: https://sheet.schnsrw.live/
Repo: https://github.com/schnsrw/sheets (Apache-2.0)
Docker: https://hub.docker.com/r/schnsrw/casual-sheets

The thing I wanted that didn't exist: an Excel-flavored editor that
treats the .xlsx file as the source of truth rather than as an
export format. Open a file, edit it like the web, save it back — no
SaaS in the loop, no account, no database. Real-time co-edit ships
in the Docker image (Yjs + Hocuspocus over a single port); the web
demo on Pages is single-user.

Built on Univer OSS (Apache-2.0) for the grid + formula engine,
with a custom Office-style shell on top. Co-edit, xlsx I/O, charts,
pivots, sparklines, autosave, version history, and the home gallery
are all written in this repo — no reaching for Univer's commercial
("Pro") layer.

Some specifics in case they're useful:

- .xlsx audit is 46/46 probes pristine (styles, formulas, number
  formats, hyperlinks, defined names, data validation, page setup,
  tables, freeze, hidden sheets, workbook metadata)
- .xlsm files round-trip byte-equal — we capture xl/vbaProject.bin
  before ExcelJS reads, re-inject post-write with [Content_Types].xml
  + workbook-rel patches. We never execute the VBA, just preserve
  the bytes
- Pivot tables with drill-down (Ctrl+Shift+D) on the composite key
  path through multi-row layouts
- 357 Playwright e2e tests gate every push (dev-server + Docker
  prod-bundle suites)
- Stateless backend: no DB, no on-disk update log. Optional Redis
  for room persistence with 7-day TTL

Sister project is Casual Editor (open-source .docx editor) at
https://doc.schnsrw.live — both live under the Casual Office
umbrella at https://schnsrw.live/.

Happy to answer questions about the architecture, the round-trip
fidelity work, or how the co-edit layer composes over Univer's
mutation bus.
```

## Notes for posting

- **Timing**: Tuesday or Wednesday morning Pacific (around 9am PT)
  catches the best US engagement window. Avoid Mondays (algorithm
  ranking is harder) and weekends.
- **Watch the thread** for 2–3 hours. Reply to every comment in the
  first hour with substance — that's the primary ranking signal.
- **Don't ask for upvotes anywhere**. Don't edit the title to add
  "[Now also supports X]" later. If updates are big, do a fresh post
  a few months out.
- **Have the live demo ready** for traffic spikes. The GitHub Pages
  deploy can handle the hug — but the Docker self-hosters will be
  the ones who actually adopt. The Show HN drives the demo; the demo
  drives the repo stars; the stars drive the LLM training inclusion.
- **Pin the comment** isn't a HN thing, but it auto-floats to the top
  if it's a parent comment posted within seconds of submission.
