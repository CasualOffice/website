---
title: 'v0.2.1 — drawing-sync fix + measured WS ceiling'
product: sheets
version: '0.2.1'
date: 2026-05-26
summary: 'Patch release closing the last two known production-readiness gaps. (1) A drawing (image or chart) inserted by peer A did not appear on peer B; root cause was the bridge''s deepRewriteUnitId only swapping unitIds at object keys, missing the unitId embedded at position [0] of the json1 op path (positional array). New rewriteJson1OpPathUnitId helper fixes it. (2) WS-side load harness lands with measured numbers: 1500 concurrent WS clients × 30 s, sustained 350 updates/s aggregate, p99 broadcast latency 3.2 ms, zero dropped records. The capacity model''s "~500 active docs latency knee" prediction was ~10× too conservative; real binding constraint at that size is RAM, not broadcast CPU.'
repoUrl: https://github.com/CasualOffice/sheets/releases/tag/v0.2.1
---

A small patch on top of [v0.2.0](/changelog/sheets-v020/) that
closes the last two open items from the production-readiness
audit. With these landed, **v0.2.x is production-grade for
1-user-per-doc workloads and "almost" for 2–5-user co-edit** —
the remaining co-edit caveat being multi-region latency, which
the server can't control.

## Fixed — drawing-sync regression

A drawing (image / chart) inserted by peer A did not appear on
peer B. The skipped e2e at `tests/e2e/coedit-drawings.spec.ts`
had a wrong-hypothesis header comment about
`registerDrawingData` being missing; the real bug was elsewhere.

**Root cause:** the bridge's `deepRewriteUnitId` only swaps
unitIds at object **keys**. The
`sheet.mutation.set-drawing-apply` mutation carries its unitId
at **position [0] of a json1 op path** — a positional array,
not an object. After `deepRewriteUnitId` on the joiner:

```ts
{ unitId: 'joiner-wb',                   // ← swapped
  subUnitId: 'sheet-1',
  op: ['owner-wb',                       // ← NOT swapped
       'sheet-1', 'data', 'drawing-7',
       { i: /* drawing payload */ }] }
```

The handler calls `applyJson1(joiner-wb, sheet-1, op)` which
calls `_establishDrawingMap` to create the correct local slot
— but then `json1.type.apply(localData, op)` walks path
`[owner-wb, sheet-1, data, drawing-7]` which doesn't exist
locally and throws a bare `Error` with no message. The
replay-retry classifier (shipped in v0.2.0) lands it as
PERMANENT, the dead-letter records it, the drawing silently
fails to propagate.

**Fix:** new `rewriteJson1OpPathUnitId` helper walks the op
(single JSONOp OR JSONOpList — detected by "first element is
array") and substitutes position [0] when it matches the
sender's unitId. Wired into `rewriteUnitId` for the drawing
mutation id only.

The previously-skipped e2e is now unskipped and passing against
the prod Docker stack.

## Added — WS-side load harness + ceiling

The HTTP harness in v0.2.0 measured the upload + control plane.
This release adds the WS harness for the actual co-edit path.

`apps/server/scripts/wsloadtest.ts` drives
`@hocuspocus/provider` clients from Node — same handshake +
sync protocol as real browsers. Each room gets N clients
(default 3); one writer pushes beacon records carrying a
sender-side `performance.now()` timestamp; readers `observe()`
the log and compute receive — sentAt. Sequence numbers detect
drops.

```bash
pnpm --filter @sheet/server wsload
# Custom:
LOAD_ROOMS=500 LOAD_CLIENTS_PER_ROOM=3 LOAD_DURATION_S=30 \
  pnpm --filter @sheet/server wsload
```

### Measured ceiling (`docs/LOAD_TEST.md`)

**500 rooms × 3 clients × 30 s — 1500 concurrent WS clients:**

```
metric                   count errors  p50(ms)  p95(ms)  p99(ms)
---------------------- ------- ------ -------- -------- --------
WS connect + sync         1500      0      2.0      6.4     16.3
Broadcast latency        10500      0      0.3      1.4      3.2

totals: 350.0 updates/s aggregate, 0 dropped records
```

### Capacity model corrections

The v0.2.0 model claimed `~500 active docs single-process
latency knee: p99 broadcast climbs above 50 ms past this point`.
**Wrong by ~10×.** Real p99 at 500 rooms × 3 clients = 3.2 ms,
not 50 ms.

`docs/CAPACITY_MODEL.md` updated:
- Removed the false "latency knee" claim.
- Reordered the bottleneck list — file descriptors hit FIRST
  (Linux default 1024; raise with `ulimit -n 65535`), then RAM,
  then Redis, then CPU pegging (which wasn't approached even
  at 1500 concurrent WS).

The `~500 active docs / 1500 concurrent users` ceiling on a
single $48/mo DigitalOcean GP box **still holds** but is
RAM-bound (~185 MB just for active state + baselines), not
broadcast-bound.

## Test coverage

139 → 145 (+6 unit tests covering `rewriteJson1OpPathUnitId`:
single JSONOp, JSONOpList, no-op at [0], identity old===new,
non-array input, single-element list edge case).

## Try it

```bash
docker pull casualoffice/sheets:0.2
docker run -p 3000:3000 casualoffice/sheets:0.2
```

Full upstream notes:
[github.com/CasualOffice/sheets/releases/tag/v0.2.1](https://github.com/CasualOffice/sheets/releases/tag/v0.2.1).
