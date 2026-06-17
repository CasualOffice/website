---
title: 'When deepRewriteUnitId isn''t deep enough: a Yjs CRDT bridge bug'
description: 'A cross-peer drawing sync bug in a Yjs + Hocuspocus collaborative spreadsheet. The fix wasn''t where we expected. A story about positional arrays, json1 op paths, and why "the skipped test header explains the bug" is a comforting lie.'
date: 2026-05-27
product: sheets
tags:
  - yjs
  - hocuspocus
  - crdt
  - collaborative-editing
  - bug-fix
  - json1
---

A drawing — an image, a chart — inserted by peer A did not appear on
peer B. Both users connected to the same Yjs document, both subscribed
to the same op log. The bridge that propagates Univer mutations
between peers was supposed to handle it. It didn't.

The skipped end-to-end test had a comment explaining what was wrong.
The comment was wrong. Here's what was actually happening, and what
the real fix looked like.

## The setup

[Casual Sheets](/casual-sheets/) is an open-source web spreadsheet
built on Univer OSS + a Yjs/Hocuspocus collaboration backend. The
collaboration bridge subscribes to Univer's
`ICommandService.onMutationExecutedForCollab` hook. Every local
mutation gets appended to a Yjs `Y.Array<OpRecord>` op log; every
remote append gets replayed locally with `{ fromCollab: true }` to
short-circuit the echo.

The op records look roughly like this:

```ts
type OpRecord = {
  c: string;     // sender clientId
  t: number;     // timestamp
  id: string;    // mutation id, e.g. 'sheet.mutation.set-range-values'
  p: unknown;    // mutation params — whatever Univer's command service emitted
};
```

Most mutation params are objects with `unitId` and `subUnitId` at the
top level. Each browser creates its workbook with a fresh random
`unitId`, so raw replay would target the **sender's** unit which
doesn't exist locally. The bridge rewrites every `unitId` field to
the local active workbook's id before dispatching:

```ts
export function deepRewriteUnitId(value: unknown, localUnitId: string): unknown {
  if (Array.isArray(value)) {
    // recurse into elements
  }
  if (value && typeof value === 'object' &&
      Object.getPrototypeOf(value) === Object.prototype) {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value)) {
      if (key === 'unitId' && typeof value[key] === 'string') {
        out[key] = localUnitId;  // SWAP
      } else {
        out[key] = deepRewriteUnitId(value[key], localUnitId);
      }
    }
    return out;
  }
  return value;
}
```

Recursive object walk, swap any string under the **key** `unitId` to
the local id. This worked perfectly for `set-range-values`,
`insert-sheet`, `set-style`, every conditional formatting mutation,
filter mutations, table mutations. ~30 mutation types, all flowing
between peers correctly.

Except drawings.

## The symptom

An image inserted on peer A went into peer A's local
`SheetDrawingService`, the mutation got captured, the op log got
the entry. Peer B's bridge saw the entry, ran `deepRewriteUnitId`,
dispatched the mutation through Univer's command service — and the
command handler threw a bare `Error` with no message. The replay-
retry classifier (we added this earlier as a transient-vs-permanent
gate) marked it permanent, put it in the dead-letter ring buffer, and
the drawing silently failed to propagate.

The end-to-end test for cross-peer drawings had been skipped for
weeks with this comment:

> SKIPPED — replay throws on the joiner with a json1 apply error
> from `SheetDrawingService.applyJson1` because the joiner's drawing
> service has no entry for the unit when the bridge replays the
> `sheet.mutation.set-drawing-apply` op. The op was generated against
> the owner's empty state and assumes the unit path exists; on a peer
> that has never run an Insert/SetSheetDrawing locally, the path is
> missing and json1 throws. Fix is a bridge-side pre-replay hook that
> calls `sheetDrawingService.registerDrawingData(unitId, {})` (and
> the matching drawingManagerService init) the first time we see a
> drawing mutation for a unit.

The hypothesis was clear: the joiner's drawing service has no slot
for this `unitId`, so we need to pre-register an empty one. Implement
the pre-register, unskip the test, ship.

That's what I did first. The test still failed. Same `Error`. Same
classifier verdict.

## Reading the actual code

Time to stop trusting the comment and read the failing path.
`SetDrawingApplyMutation.handler` from `@univerjs/sheets-drawing`:

```js
handler: (accessor, params) => {
  const drawingManagerService = accessor.get(IDrawingManagerService);
  const sheetDrawingService = accessor.get(ISheetDrawingService);
  const { op, unitId, subUnitId, type, objects } = params;
  drawingManagerService.applyJson1(unitId, subUnitId, op);
  sheetDrawingService.applyJson1(unitId, subUnitId, op);
  // ...
}
```

And `applyJson1` from `@univerjs/drawing`'s `UnitDrawingService`:

```js
applyJson1(unitId, subUnitId, jsonOp) {
  this._establishDrawingMap(unitId, subUnitId);   // ← already pre-inits!
  this._oldDrawingManagerData = { ...this.drawingManagerData };
  this.drawingManagerData = ot_json1.type.apply(this.drawingManagerData, jsonOp);
}
```

`_establishDrawingMap` already creates `drawingManagerData[unitId]
[subUnitId] = { data: {}, order: [] }` if the path doesn't exist.
My `registerDrawingData` pre-call was redundant. The skip-header's
diagnosis was wrong.

So what was the json1 op actually doing?

A json1 op for "insert a drawing" looks roughly like this:

```js
[unitId, subUnitId, 'data', drawingId, { i: drawingPayload }]
```

It's a **positional array**: path-segments... then a single trailing
**component object** describing the operation (insert, remove, edit).
The first segment of the path is the `unitId`.

After `deepRewriteUnitId` on the joiner, here's what the mutation
params looked like:

```js
{
  unitId: 'joiner-wb-xyz',      // ← swapped (object key)
  subUnitId: 'sheet-1',
  op: ['owner-wb-abc',           // ← NOT swapped (positional!)
       'sheet-1', 'data', 'drawing-7',
       { i: { /* drawing payload */ } }]
}
```

The handler called `applyJson1('joiner-wb-xyz', 'sheet-1', op)`.
`_establishDrawingMap` created the slot at the correct local path.
Then `ot_json1.type.apply(localData, op)` walked the op's path —
which started with `'owner-wb-abc'` — and tried to insert at a path
that did not exist on this peer. The json1 library threw, with no
message, just the call stack pointing into its own `type.apply`.

`deepRewriteUnitId` only swaps the **key** named `unitId`. The
positional path in a json1 op carries the unitId as a bare string
at array index `[0]`, with no key context. It was completely
invisible to the rewriter.

## The fix

A new helper that walks the json1 op shape and substitutes the
leading unitId where it matches the sender's:

```ts
export function rewriteJson1OpPathUnitId(
  op: unknown,
  oldUnitId: string,
  newUnitId: string,
): unknown {
  if (oldUnitId === newUnitId) return op;
  if (!Array.isArray(op)) return op;

  // Detect single JSONOp vs JSONOpList. An op-list's first element is
  // itself an array (the first op); a single op's first element is a
  // path segment (string/number).
  const looksLikeOpList = op.length > 0 && Array.isArray(op[0]);
  if (looksLikeOpList) {
    let changed = false;
    const next = op.map((entry) => {
      const r = rewriteJson1OpPathUnitId(entry, oldUnitId, newUnitId);
      if (r !== entry) changed = true;
      return r;
    });
    return changed ? next : op;
  }

  // Single op — element [0] is the leading path segment.
  if (op[0] === oldUnitId) {
    const next = [...op];
    next[0] = newUnitId;
    return next;
  }
  return op;
}
```

Wired into the bridge for drawing mutations only:

```ts
function rewriteUnitId(api, params, mutationId) {
  const wb = api.getActiveWorkbook();
  if (!wb) return params;
  const localUnitId = wb.getId();

  // Capture the sender's unitId BEFORE deepRewriteUnitId swaps it —
  // we need it to also patch the json1 op path below.
  let senderUnitId: string | undefined;
  if (mutationId === 'sheet.mutation.set-drawing-apply' &&
      params && typeof params === 'object') {
    const u = (params as any).unitId;
    if (typeof u === 'string') senderUnitId = u;
  }

  const rewritten = deepRewriteUnitId(params, localUnitId) as any;
  if (!senderUnitId || senderUnitId === localUnitId) return rewritten;

  const fixedOp = rewriteJson1OpPathUnitId(rewritten.op, senderUnitId, localUnitId);
  if (fixedOp !== rewritten.op) {
    return { ...rewritten, op: fixedOp };
  }
  return rewritten;
}
```

Then six unit tests for the helper (single op, op-list, no-op when
the leading element doesn't match, identity when old===new, non-array
input, single-element list edge case), and re-running the previously-
skipped e2e test against the production Docker stack.

It passed.

## Why the skipped-test comment was wrong

The original author saw the json1 error coming from
`SheetDrawingService.applyJson1` and reasoned about it like this:
"json1 is failing because the path doesn't exist; the path doesn't
exist because the service has no entry for this unit; therefore
register an empty entry." That's a reasonable chain of inference if
you don't read the json1 op itself.

The actual chain was: "json1 is failing because the **op's** path
references a unitId that doesn't exist on this peer; the unitId in
the op is the sender's id; therefore rewrite the path." The
service-level pre-init didn't help because `applyJson1` already
auto-inits the slot before calling json1 — but it auto-inits the
LOCAL path, not the path the op references.

The lesson isn't "comments lie." The lesson is that **debugging a
CRDT bridge requires reading the underlying op shape**, not just
the mutation params. The Univer team's mutation params look clean
and object-shaped, but `op` is a black-box payload that wraps a
different shape entirely (positional json1 ops).

## What I'd do differently

Two things, in retrospect:

1. **Stop trusting hypotheses from before a debugger touched the
   bug.** The skipped-test header was written before anyone stepped
   through the failing path with the actual op printed. The
   hypothesis fit the obvious-from-outside observation but not the
   ground truth. A line of `console.log(JSON.stringify(params))` on
   the joiner would have shown the unitId mismatch in 30 seconds.

2. **Test the rewriter against op shapes, not just object shapes.**
   The `deepRewriteUnitId` unit tests covered nested objects,
   nested arrays of objects, primitives. They did not cover an
   array whose first element was a unitId. A property-based test
   that included "an array starting with a unitId" would have
   caught this when the drawings plugin first started using
   json1 ops.

## Code

The fix is in
[Casual Sheets v0.2.1](/changelog/sheets-v021/) and the helper is at
[`apps/web/src/collab/bridge-helpers.ts`](https://github.com/CasualOffice/sheets/blob/main/apps/web/src/collab/bridge-helpers.ts)
in the repo. Six unit tests + the unskipped end-to-end test pin the
behaviour.

If you're building a Yjs/CRDT bridge around Univer, json1, or any
library that mixes object-shaped payloads with positional-array
payloads, this is the bug to remember.

---

*[Casual Sheets](/casual-sheets/) is an open-source self-hosted
spreadsheet — `docker run -p 3000:3000 schnsrw/casual-sheets:latest`
to try. Apache-2.0.*
