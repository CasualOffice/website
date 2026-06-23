---
title: 'v0.3.1 — personal-mode boot fix + SDK xlsx extraction'
product: sheets
version: '0.3.1'
date: 2026-06-11
summary: 'Patch release. Fixes the Docker image so personal mode (Phase C) actually boots — the named data volume was root-owned and the server, dropping to USER node, could not open users.db, so every signup 502d. Default CASUAL_PERSONAL_MODE reverts to none so the anonymous-room demo flow works out of the box. The xlsx import path is extracted into packages/sdk and published as @casualoffice/sheets/xlsx so hosts can load .xlsx into a Univer snapshot without vendoring the parser.'
repoUrl: https://github.com/CasualOffice/sheets/releases/tag/v0.3.1
---

A small but necessary patch on top of [v0.3.0](/changelog/sheets-v030/).

## Fixed — personal mode wouldn't boot

`CASUAL_PERSONAL_MODE=single` / `multi` crashed the server on first
boot with `SqliteError: unable to open database file`. The named
`casual-data` volume mounted at `/data` is root-owned, but the server
drops to `USER node` before bootstrap — SQLite couldn't open
`users.db` for write, the healthcheck never passed, signups 502'd.
The Dockerfile now provisions `/data` with `node:node` ownership
before dropping privileges.

Default `CASUAL_PERSONAL_MODE` also reverts from `single` back to
`none` — the flip to `single` gated the anonymous-room co-edit suite
and broke the live demo's default flow. Personal mode is now opt-in
via a one-line `.env` entry.

## Added — `@casualoffice/sheets` xlsx extraction (#56)

The xlsx import path moves into `packages/sdk/src/xlsx/` and publishes
as **`@casualoffice/sheets/xlsx`**. A host can load `.xlsx` into a
Univer `IWorkbookData` snapshot via `xlsxToWorkbookData(bytes)`
instead of vendoring the parser. The `apps/web` pipeline is unchanged
— it just imports the shared mappers from the SDK.
