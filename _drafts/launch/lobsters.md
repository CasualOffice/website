# lobste.rs

## Submitting

URL submission, not text post:

```
URL:   https://sheet.schnsrw.live/   (or https://github.com/schnsrw/sheets for the repo)
Title: Casual Sheets — open-source Excel-flavored web spreadsheet
Tags:  show, javascript, web
```

(Lobsters tag list is finite. `show` is the equivalent of HN's
"Show HN". `javascript` + `web` describes the tech. If a more
specific tag fits — `golang` for Editor — use it instead.)

## First comment

Post immediately after submission. Lobsters threads are short and the
audience is more focused than HN — keep the framing technical and
narrow:

```
Author here. Casual Sheets is an open-source Excel-flavored web
spreadsheet with a focus on file-centric workflow: open a .xlsx
in the browser, edit it like the web, save it back. .xlsx round-
trip audit is 46/46 probes pristine; .xlsm files round-trip byte-
equal via a JSZip-based vbaProject.bin passthrough.

Built on Univer OSS (Apache-2.0) for the grid + formula engine,
with a custom Office shell + Yjs co-edit layer in this repo.
Stateless backend: no DB, no on-disk update log; Redis is optional
and only for cross-restart room continuity.

Demo: https://sheet.schnsrw.live/
Repo: https://github.com/schnsrw/sheets

Architecture notes: https://schnsrw.live/docs/sheets/architecture/
Research notes: https://schnsrw.live/docs/sheets/research/

Sister project is Casual Editor (real-time .docx) at
https://doc.schnsrw.live; both live under Casual Office at
https://schnsrw.live.
```

## Notes

- Lobsters is invite-only. Make sure you have an account before
  launch day.
- Don't submit until the HN post has had at least 24h to breathe.
  Lobsters readers often follow HN; double-submission in 6h reads as
  spammy.
- The `show` tag implies "I made this". Don't use it for someone
  else's repo.
