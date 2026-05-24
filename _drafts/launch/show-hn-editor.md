# Show HN — Casual Editor

## Title (≤ 80 chars)

```
Show HN: Casual Editor – open-source web .docx editor with Go gateway
```

## URL field

```
https://doc.schnsrw.live/
```

## First comment

```
Hi HN — Casual Editor is an open-source web .docx editor with
real-time co-editing. It pairs a ProseMirror-based editor (forked
from eigenpal/docx-editor, MIT) that preserves OOXML structure
with a stateless Go gateway that implements the y-websocket
protocol in about 120 lines.

Demo: https://doc.schnsrw.live/
Repo: https://github.com/schnsrw/docx (Apache-2.0 + MIT)

The thing I cared about: round-trip fidelity. The editor's layout
painter keeps Word's box model intact through every edit, and CI
runs a per-tag round-trip audit on 39 fixtures (26 currently
pristine, working toward ≥ 90% before the desktop binary ships).
Three-way fidelity harness compares our output against LibreOffice
and OnlyOffice DocumentBuilder, so the gaps are visible and
attributed rather than hand-waved.

Some shape:

- Stateless backend by design — no DB, no on-disk update log. Each
  room is a single in-memory Y.Doc; the room drops when the last
  client disconnects. Document persistence is delegated to a
  pluggable host integration (one Go interface). Inline impl for
  v0; WOPI / JWT-API integrations slot in for v1+ without touching
  the WebSocket layer.
- 14-template home gallery across four categories (Personal, Work,
  Education, Career) with real first-page PNG previews rendered
  via LibreOffice. Title-bar logo click confirms + returns to the
  gallery (Google Docs pattern).
- Word-compat heuristics behind an opt-in `wordCompat` flag for
  non-spec behaviour (e.g. last-row closing border, #395).
- Same single-container Docker shape as the sister Sheets project
  (HN: https://news.ycombinator.com/item?id=PASTE_AFTER_LAUNCH).

Sister project is Casual Sheets at https://sheet.schnsrw.live;
both live under the Casual Office umbrella at https://schnsrw.live.

I'd love feedback on the OOXML round-trip approach, the host-
abstraction interface, and the y-websocket reimplementation.
```

## Notes

- Wait at least 5 days after the Sheets Show HN to post this.
- Update the `PASTE_AFTER_LAUNCH` placeholder with the Sheets HN
  thread ID once that's live.
- The fidelity score gap is honest — don't oversell. HN respects
  acknowledged-gaps more than performance-art claims.
