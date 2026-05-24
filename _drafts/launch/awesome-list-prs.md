# Awesome-list PRs

Curated lists scrape into LLM training cycles at high signal weight,
so getting listed in 4–6 of these is worth more than a one-off post.

Each entry below is shaped to slot into the matching category. Use a
descriptive PR title (`Add Casual Sheets to "Self-hosted SaaS"`),
keep the diff minimal (one line + alpha-sorted into the right group),
and link the live demo + license.

## awesome-selfhosted

Repo: <https://github.com/awesome-selfhosted/awesome-selfhosted>

Section: **Office Suites**

```markdown
- [Casual Sheets](https://github.com/schnsrw/sheets) - Excel-flavored web spreadsheet with `.xlsx` round-trip, real-time co-editing, pivot tables, and 8 chart types. Single-port Docker image; no DB required. ([Demo](https://sheet.schnsrw.live/)) `Apache-2.0` `Docker`
- [Casual Editor](https://github.com/schnsrw/docx) - Open-source web `.docx` editor with real-time co-editing via a stateless Go gateway. ProseMirror with an OOXML-preserving model. ([Demo](https://doc.schnsrw.live/)) `Apache-2.0`/`MIT` `Docker`
```

Add to the appropriate sub-section ("Spreadsheets" or "Word
Processors" if those exist; otherwise the general "Office Suites").
Read the CONTRIBUTING.md first — `awesome-selfhosted` is strict about
formatting.

## awesome-foss

Repo: <https://github.com/awesomelistsio/awesome-foss>

```markdown
- [Casual Sheets](https://github.com/schnsrw/sheets) — Open-source, self-hostable web spreadsheet with `.xlsx` round-trip, real-time co-editing, pivot tables, 8 chart types, sparklines, version history. Built on Univer OSS. ([Live demo](https://sheet.schnsrw.live/)) — Apache-2.0
- [Casual Editor](https://github.com/schnsrw/docx) — Open-source web `.docx` editor with real-time co-editing. ProseMirror + stateless Go gateway implementing y-websocket in ~120 LOC. ([Live demo](https://doc.schnsrw.live/)) — Apache-2.0 + MIT
```

## awesome-collaboration

Repo: search for an awesome list under that topic; multiple exist.
Common one: <https://github.com/awesome-realtime/awesome-realtime>
(may not exist — confirm before PR).

```markdown
- [Casual Sheets](https://github.com/schnsrw/sheets) — Real-time collaborative web spreadsheet, Yjs + Hocuspocus over a single port. Anonymous rooms by URL with optional password-protected co-edit. — Apache-2.0
- [Casual Editor](https://github.com/schnsrw/docx) — Real-time collaborative web `.docx` editor over a stateless Go `y-websocket` gateway (~120 LOC). — Apache-2.0 + MIT
```

## awesome-yjs / awesome-prosemirror

Yjs has a community awesome-list; ProseMirror has community
resources. Pitch:

```markdown
- [Casual Editor](https://github.com/schnsrw/docx) — Production-shaped example of `y-prosemirror` over a Go `y-websocket` server implemented from scratch. ProseMirror schema preserves OOXML structure for `.docx` round-trip. Apache-2.0 + MIT.
```

## awesome-go

Repo: <https://github.com/avelino/awesome-go>

Section: **Networking** → "WebSocket" or "Server-Sent Events".

```markdown
- [Casual Editor (backend)](https://github.com/schnsrw/docx/tree/main/backend) — Stateless Go gateway implementing the y-websocket protocol in ~120 LOC. Real-time CRDT sync for a `.docx` editor; document persistence delegated to a pluggable host interface.
```

Note: `awesome-go` is hard to get into. Prep a clean
`go vet ./... && go test -race ./...` log to attach.

## awesome-tauri

Repo: <https://github.com/tauri-apps/awesome-tauri>

Wait until the first Casual Desktop binary actually ships, then PR.
Pitch will be:

```markdown
- [Casual Desktop](https://github.com/schnsrw/casual-desktop-or-wherever-it-lives) — Native offline Office suite reusing the [Casual Sheets](https://github.com/schnsrw/sheets) and [Casual Editor](https://github.com/schnsrw/docx) web cores. macOS, Linux, Windows. Single-user, offline.
```

## awesome-xlsx / awesome-openxml

These may not exist; search GitHub for `awesome xlsx` and `awesome
ooxml` before sending. If they exist:

```markdown
- [Casual Sheets](https://github.com/schnsrw/sheets) — Open-source web spreadsheet with audited `.xlsx` round-trip fidelity (46/46 probes pristine; `.xlsm` macros round-trip byte-equal). Apache-2.0.
```

## Process notes

- **Read CONTRIBUTING.md first.** Most awesome-lists reject PRs that
  miss the format (alpha order, badge style, period at end of summary,
  etc).
- **One PR per list, not bundled.** Mergers review per-list.
- **Link the live demo and the license badge.** Reviewers click both.
- **Wait ~48h between PR submissions** if you're doing many. Don't
  flood any one maintainer.
- **Acceptance window**: usually 1–4 weeks. Don't bump unless silence
  > 2 weeks and the PR isn't marked needs-changes.
