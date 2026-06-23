---
title: 'v0.3.0 — personal mode, WOPI host, and the SDK'
product: sheets
version: '0.3.0'
date: 2026-06-08
summary: 'Minor release rolling up two large feature batches plus the Univer-fork perf revamp. Phase C adds personal mode — per-user file storage, bcrypt + SQLite auth, HMAC session cookies, file CRUD over HTTP, profiles, and an admin surface. Phase D adds a stateless WOPI host so Casual Sheets embeds inside a WOPI-speaking platform. A new @casualoffice/sheets SDK ships the signing + iframe postMessage protocol. The Univer fork moves to a vendored submodule with five perf patches.'
repoUrl: https://github.com/CasualOffice/sheets/releases/tag/v0.3.0
---

The release that turns Casual Sheets from "anonymous rooms only" into
a product you can put named users on — without giving up the
self-host, no-database posture.

## Phase C — personal mode (#49)

- **Per-user file storage** — the server stores files under
  `<root>/users/<userID>/`. Log in on a different machine and your
  workbooks are where you left them.
- **Auth foundation** — bcrypt + SQLite at `<root>/.casual/users.db`,
  HMAC-signed session cookies (30-day TTL), `__Host-`-prefixed under
  `SECURE_COOKIES=true`.
- **File CRUD over HTTP** — `POST/GET/PUT/PATCH/DELETE /files`, plus
  `POST /auth/signup · /login · /logout` and `GET /auth/me`.
- **Profiles + admin** — display name, timezone, locale, avatar; an
  admin surface behind `RequireAdmin` (first signup auto-promotes); a
  `reset-password / list-users / promote / demote` CLI.

## Phase D — WOPI host (#49)

- A stateless **WOPI client** + JWT verifier (with JWKS cache).
  `docID = base64url(wopiSrc)` keeps the gateway stateless; embed
  redirect at `GET /wopi/host`, per-room `RefreshLock` ticker so long
  sessions don't lose the host lock.

## Univer fork (#51)

- The fork now lives at `vendor/univer-revamp/` as a submodule; all
  `@univerjs/*` packages resolve through `pnpm.overrides`. Five perf
  patches cherry-picked on top (most impactful: stop re-walking the
  visible span in `setStylesCache`).

## SDK + misc

- New `packages/sdk` publishing **`@casualoffice/sheets`** (signing +
  iframe postMessage protocol).
- Soft cell-count cap on print export (was OOMing big workbooks);
  **Format Cells…** in the right-click menu; e2e hardening on the
  co-edit + charts specs.
