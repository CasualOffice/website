---
title: 'v0.0.3 — Phase 2 co-edit shipped'
product: sheets
version: '0.0.3'
date: 2026-05-17
summary: 'Hocuspocus server + Yjs bridge, room lifecycle, share URL, password-protected rooms, view-only role, Redis persistence option, joiner fast-path, op-log compaction, and the single-port self-hosted Docker image.'
repoUrl: https://github.com/CasualOffice/sheets/releases/tag/v0.0.3
---

The real-time release — phase 2 of the roadmap.

- **Hocuspocus** server + Yjs bridge plugin.
- **Room lifecycle** — create on upload, GC after TTL.
- **Share URL** — anyone joins. Password-protected rooms with SHA-256
  client gate.
- **View-only role** enforced at the Univer engine layer.
- **Redis persistence** (optional, 7-day TTL).
- **Joiner fast-path** — gzip-streamed snapshot, skips xlsx parse.
- **Op-log compaction** (Stage 6) for long-lived rooms.
- **Self-hosted Docker image** — web + Hocuspocus + Fastify in one
  container, single port.
