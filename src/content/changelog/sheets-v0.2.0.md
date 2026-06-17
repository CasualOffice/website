---
title: 'v0.2.0 — production-readiness'
product: sheets
version: '0.2.0'
date: 2026-05-26
summary: 'Six engineering streams that turn v0.1''s "real persistence + self-host story" into a workload you can put real users on. Co-edit divergence becomes recoverable (transient-vs-permanent classifier, retry with backoff, click-to-expand dead-letter). The gateway gets per-IP throttling + a hard room cap with LRU eviction. First measured baseline (~1900 req/s, p99 < 3 ms) + a capacity model with five deployment tiers (Solo $5/mo → Sharded linear). Toast surface across the app. Typed Univer facade — 27 caller-side as-any sites eliminated.'
repoUrl: https://github.com/CasualOffice/sheets/releases/tag/v0.2.0
---

The "production-readiness" release. v0.1.0 earned the
**self-host** story; v0.2.0 earns the **production-workload**
story. Six engineering streams, plus the toast / a11y / mobile
polish that landed in the same window.

If you're already on `:0.1`, this is a safe `:0.2` upgrade. The
new env vars (`MAX_ROOMS`, `RATE_LIMIT_*`) have production-safe
defaults — nothing breaks if you leave them unset.

## What ships

### Co-edit reliability — replay retry + dead-letter

Pre-v0.2, the bridge's replay loop caught every error with a
single `console.warn` + counter and forgot about it. A flaky
network blip during a lazy-plugin chunk-load looked identical to
a malformed mutation — both silently dropped, both incremented
the divergence count permanently, both unrecoverable.

v0.2 ships:

- **Classifier** at `apps/web/src/collab/replay-retry.ts` —
  `ChunkLoadError`, "Loading chunk N failed", "Failed to fetch
  dynamically imported module", "NetworkError when attempting to
  fetch" → **transient**. Everything else → **permanent**.
- **Backoff** for transient failures: 300 ms, 900 ms, 2 700 ms
  (three attempts, ~4 s total). Permanent failures bail
  immediately — retrying a malformed mutation just re-throws.
- **Dead-letter ring buffer** (cap 20) of records `{ id, params,
  lastError, attempts, firstFailedAt, lastFailedAt,
  classification }`. Exposed on the bridge handle via
  `getReplayDeadLetter()` + `subscribeReplayDeadLetter()`.
- **Click-to-expand failure detail** in the `CollabIndicator` pill.
  Last 5 entries with mutation id, classification chip (amber
  for transient, red for permanent), truncated error, and age.
  Closes on outside-click or Escape. Auto-clears when the buffer
  empties (e.g. after a refresh).

### Backend hardening — rate limit + room cap

Three new env vars, production-safe defaults, opt-out for load
tests:

- `RATE_LIMIT_ENABLED` (default `true`) — master switch for
  `@fastify/rate-limit`.
- `RATE_LIMIT_PER_MIN` (default `60`) — applies to `POST
  /api/rooms`. Returns standard `429` + `retry-after` on
  overflow.
- `UPLOAD_RATE_LIMIT_PER_MIN` (default `12`) — applies to
  `POST /api/rooms/:id/seed` + `/snapshot`. Tighter bucket
  because uploads take bytes into memory before persisting.

Read endpoints (GET /snapshot) deliberately stay unrestricted —
returning peers shouldn't be throttled for re-joining.

Plus a hard cap on concurrent rooms per process:

- `MAX_ROOMS` (default `256`). When `create()` would exceed the
  cap, LRU-evicts the oldest **evictable** room (no password /
  no seed / no snapshot). If every slot is non-evictable,
  returns `503 capacity_full` + `retry-after: 60`. Two-pass
  eviction: prefer idle-but-evictable, fall back to
  live-but-evictable by `createdAt` — prevents a "spam open
  rooms" pattern from permanently locking out new users.

### Measurement — load harness + baseline numbers + capacity model

We previously had no real numbers for "how many users does this
box handle." Now we do:

- **HTTP load harness** at `apps/server/scripts/loadtest.ts`
  (~190 lines, no new deps — uses Node's built-in `fetch` +
  `perf_hooks`). Configurable VUs / duration / target. Run with
  `pnpm --filter @sheet/server load`.
- **Baseline numbers** in `docs/LOAD_TEST.md`: ~1 900 req/s
  sustained across all four write endpoints, p99 < 3 ms with
  rate-limit disabled. Rate-limit verification run confirms the
  bucket clamps a single IP exactly at the configured 60/min +
  12/min envelopes.
- **Capacity model + 5 deployment tiers** in
  `docs/CAPACITY_MODEL.md`. Per-doc RAM / CPU / network / Redis
  cost derived from the baseline + Yjs / Hocuspocus fan-out
  math. Tiers: Solo ($5/mo) → Small ($15-25/mo, recommended for
  v0.2) → Mid ($40-80/mo) → Big single-process ($150-300/mo) →
  Sharded (linear). Single-process soft ceiling: ~500 active
  docs with 3 users/doc co-edit; ~5 000-8 000 single-user-per-
  doc.

### UX — unified toast surface

A new `apps/web/src/shell/toast/` module ships `info` / `success`
/ `error` toasts with optional action buttons. Wired into:

- **File > Save / Export** — success + error per format
- **Autosave > Restore** — success + error
- **Insert Chart** — `Added Chart 3`
- **Sheet tab actions** — rename (`Renamed to X`), duplicate,
  hide (`Hid X` with one-click `Show` action), delete
  (`Deleted X` with 8 s `Undo` action that calls Univer's
  command-stack undo to recover the sheet + data)
- **Print Area** set/clear — with `Undo` action that restores
  the previous range
- **Paste Special** apply — names the variant
  (`Pasted: Formats` / `Column widths` / etc.)
- **Flash Fill** — outcome-aware: success carries the cell
  count; each of the three failure modes gets a specific
  explanation rather than silently no-op'ing
- **Save Version** — success with `Open history` action; error
  catch
- **Insert Sparkline** — success names the type + anchor

Plus peer count + queued-mutation count in the `CollabIndicator`
("Live · 2", "Reconnecting · 3"), humanised open-file errors in
the loading overlay (8 classifier branches), Insert-Chart range
error elevated to a `role="alert"` banner above the input, and
`role="group"` + `aria-label` on each ribbon group for screen
reader navigation.

### Type-safety refactor (rolling)

A new `apps/web/src/univer-facade.ts` (~210 lines) centralises
the `as any` casts at the FUniver-boundary into one auditable
module. Surface: `sheetId`, `isHidden`, `maxRows`, `maxColumns`,
`rangeAt`, `rangeBox`, `rangeFromA1`, `activateRange`,
`dataRangeOrActive`, `setActiveSheet`, `findSheetById`,
`saveWorkbook`, `activeSheet`, `activeRange`, `injector`,
`viteEnv`, `viteEnvNumber`, `windowStringGlobal`.

5 highest-traffic files converted (`tab-actions`,
`sheet-actions`, `flash-fill`, `MenuBar`, `CollabDriver`) —
**27 caller-side as-any sites eliminated**, 23 centralised in
the facade. Remaining ~21 files are mechanical follow-up under
the v0.2.x patch series.

### Mobile + a11y fixes

- Side-panel back-out pill is now unmistakable on touch
  (40 × 40 px "← Back" — was hard to discover at 24 × 24).
- Toolbar overflow chevrons pinned to viewport edges so they
  don't get hidden behind the device notch.
- Insert Chart range error gets `role="alert"` + `aria-live`
  + `aria-invalid` on the input.

## Test coverage

Total: **139 / 139 unit tests pass** (was 116 at start of
cycle). New suites:

- 17 `replay-retry` tests — classifier branches + retry
  scheduler + ring-buffer eviction + schedule pin
- 6 `RoomRegistry` cap + LRU tests
- 10 toast + humanised-error tests

E2E unchanged: co-edit, sheet-tab-menu, paste-special, mobile
all green.

## What's NOT in v0.2.0 (deferred)

- **WS-side load harness.** Current harness covers HTTP only;
  the Yjs sync path needs a separate provider-based harness.
  Tracked for v0.2.x.
- **OIDC + SAML enforcement.** Still UI-only in the admin panel;
  the schema persists so v0.3 ships enforcement without breaking
  on-disk configs.
- **Multiple admin accounts.** Single `CASUAL_ADMIN_USERNAME` +
  `CASUAL_ADMIN_PASSWORD` for v0.2.

## Try it

```bash
docker run -p 3000:3000 schnsrw/casual-sheets:0.2
# → open http://localhost:3000
```

Production-ish docker-compose with the new caps in effect:

```yaml
services:
  app:
    image: schnsrw/casual-sheets:0.2
    ports: ['3000:3000']
    ulimits:
      nofile: { soft: 65535, hard: 65535 }  # raise from default 1024 — see capacity model
    environment:
      REDIS_URL: redis://redis:6379
      CASUAL_STORAGE: local
      CASUAL_LOCAL_PATH: /data/workbooks
      CASUAL_ADMIN_USERNAME: admin
      CASUAL_ADMIN_PASSWORD: ${ADMIN_PASSWORD}
      CASUAL_JWT_SECRET: ${JWT_SECRET}
      MAX_ROOMS: '512'              # v0.2 new — default 256
      RATE_LIMIT_PER_MIN: '60'      # v0.2 new — default 60
    volumes:
      - data:/data
    depends_on:
      redis: { condition: service_healthy }
  redis:
    image: redis:7.4-alpine
    command: ['redis-server', '--appendonly', 'yes']
volumes:
  data:
```

Sizing guidance (per-doc RAM, CPU, deployment tier picks) lives
in `docs/CAPACITY_MODEL.md` in the repo, including a worked
example for the $48/mo DigitalOcean General Purpose droplet
spec (4 vCPU / 8 GB / 180 SSD).

Full upstream notes + binary download:
[github.com/CasualOffice/sheets/releases/tag/v0.2.0](https://github.com/CasualOffice/sheets/releases/tag/v0.2.0).
