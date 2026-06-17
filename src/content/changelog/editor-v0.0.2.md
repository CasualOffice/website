---
title: 'v0.0.2 — public preview'
product: editor
version: '0.0.2'
date: 2026-05-23
summary: 'Casual Editor opens the public preview. Home gallery with 14 real .docx templates, stateless Go gateway implementing the y-websocket protocol in ~120 LOC, three-way fidelity harness vs LibreOffice and OnlyOffice, 26 of 39 fixtures round-trip pristine.'
repoUrl: https://github.com/CasualOffice/docs/releases/tag/v0.0.2
---

The first tagged public preview.

## What ships

- **Editor fork** of `eigenpal/docx-editor` (MIT) with the AGPL
  `agent-use` package and dependents removed. ProseMirror schema +
  OOXML-preserving layout painter. Round-trips audited per-tag —
  **26 of 39** fixtures pristine, with a published gap matrix; the
  remaining drops are clustered in the VML envelope.
- **Home page** — template gallery with 14 real `.docx` templates
  across four categories (Personal / Work / Education / Career) and
  real first-page PNG previews rendered via LibreOffice. Title-bar
  logo click confirms + returns to the gallery (Google Docs pattern).
- **Backend M1** — Go gateway in `backend/`. POST `/api/docs` upload,
  GET `/api/docs/{id}/download` snapshot, GET `/doc/{id}` WebSocket.
  Inline host for the v0 share-link flow. WS broker fans frames
  between room members. Tests cover broadcast, room manager, upload,
  and static SPA path.
- **Word-compat heuristics** — issue #395 last-row closing border
  wired behind an opt-in `wordCompat` flag (off by default), with 5
  unit tests.
- **Three-way fidelity harness** vs LibreOffice and OnlyOffice
  DocumentBuilder gates CI.
- **Live deploys** — single-user demo at
  [docs.casualoffice.org](https://docs.casualoffice.org/). Co-edit ships with
  the Docker image once tagged.

## What's next

- **JWT host integration** — design pending; comes after the inline
  path proves the gateway shape.
- **Y.Doc → .docx serializer worker** — currently the gateway re-
  serves the original upload on drain; M2 replaces that with a Bun
  worker pool that turns live CRDT state into a fresh `.docx`.
- **Tauri desktop binary** — early scaffolding only; first binary
  ships once fidelity crosses 90%.
