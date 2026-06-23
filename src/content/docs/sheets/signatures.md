---
title: 'Signatures'
product: sheets
order: 270
sourceUrl: 'https://github.com/CasualOffice/sheets/blob/main/docs/SDK_SIGNING_EMBED.md#anchor--the-sheet-specific-bit'
updated: 2026-06-08T00:00:00.000Z
summary: 'Anchored cell signatures via drawn / typed / uploaded surfaces. Same pipeline as Casual Docs; sheet-flavored anchors.'
---

Casual Sheets ships the same document-signature pipeline as [Casual Docs](/docs/editor/signatures/). Drive integrators who built a signing flow against the editor port to sheets by swapping field anchors from `{ kind: 'doc', paraId }` to `{ kind: 'sheet', sheet, cell }`. Everything else — banner, mode, complete event, cancel — is identical.

---

## What the editor handles

- Renders the floating signing pane (right-anchored sidebar).
- Walks the signer through configured fields (`sequential` / `concurrent`).
- Three capture surfaces — draw (PNG), type (UTF-8 in a script font), upload (image file).
- Emits per-field progress events; one completion event when every required field is done.
- Honours cancellation.

## What the host owns

- Signer identity and the auth token.
- Signature material — drawn PNG, typed string, uploaded PNG/JPEG/SVG, or X.509 detached signature from your CA.
- Audit trail — your backend persists the per-field events.
- Final stamping into the `.xlsx` — for v1, the editor returns the unstamped workbook + a `fields` map; your backend (Rust + `umya-spreadsheet` / OpenXML in any language) does the final composition.

This split keeps the editor cert-free and lets you plug in any signing backend.

## Anchor — the sheet-specific bit

A signature field anchors to a cell in a named sheet:

```ts
{
  fieldId: 'accountant',
  label: 'Accountant signature',
  required: true,
  anchor: { kind: 'sheet', sheet: 'Q3 P&L', cell: 'B47' },
  methods: ['drawn', 'typed'],
}
```

How signatures render:

- **Drawn** signatures stamp as floating images over the cell range.
- **Typed** signatures land in the cell directly.
- **Uploaded** signatures stamp as floating images (the user's chosen PNG/JPEG/SVG).

Everything else about the flow — banner, sequential mode, complete event, cancel — is identical to the editor flow.

## SDK integration

```tsx
import { SigningProvider, SigningPane } from '@/signing';

<SigningProvider session={signingSession} documentBytes={currentBytes}>
  <YourSheetMount />
  <SigningPane banner="Signing as Alice for Acme Co." />
</SigningProvider>;
```

Where `signingSession` is a `SigningSessionConfig`:

```ts
{
  mode: 'sequential',
  fields: [
    {
      fieldId: 'employee',
      label: 'Employee',
      required: true,
      anchor: { kind: 'sheet', sheet: 'Payroll', cell: 'C12' },
      methods: ['drawn', 'typed'],
    },
    {
      fieldId: 'manager',
      label: 'Manager',
      required: true,
      anchor: { kind: 'sheet', sheet: 'Payroll', cell: 'C13' },
      methods: ['drawn'],
    },
  ],
  banner: 'Signing as Alice for Acme Co.',
  onFieldSigned: async ({ fieldId, method, bytes, mime, signedAt }) => {
    await myBackend.audit.signatureField({ fieldId, method, signedAt });
  },
  onComplete: async ({ bytes, fields }) => {
    const stamped = await myBackend.stampSignatures(bytes, fields);
    await myFileSource.save(workbookId, stamped);
    onSigningDone();
  },
  onCancel: ({ reason }) => onSigningAborted(reason),
}
```

## Iframe integration

The same envelope shapes flow over postMessage — see [iframe embedding](/docs/sheets/iframe-embed/). The host sends `casual.signature.request`, listens for `casual.signature.field.signed` per field and `casual.signature.complete` at the end.

## Sequence — three-signer concurrent flow

```
Host                                          Editor (sheet)
────                                          ──────────────
casual.signature.request(fields × 3,        render signing pane, all three
mode='concurrent', banner)             ───►  fields highlighted; signer picks
                                              order
…signer A clicks accountant cell B47 → draws…
                                              ◄────── signature.field.signed(accountant)
…signer B clicks reviewer cell B48 → types…
                                              ◄────── signature.field.signed(reviewer)
…signer C clicks witness cell B49 → uploads PNG…
                                              ◄────── signature.field.signed(witness)
                                              ◄────── signature.complete(bytes, fields)
host stamps signatures into .xlsx,
writes audit rows, archives
```

## What's deferred

- **Editor-side cell stamping** — v1 returns the unmodified workbook; your backend composes the final `.xlsx`. v2 lands client-side stamping (image insertion at cell range) so single-page hosts can finalize client-side.
- **Univer-canvas decorations** — currently the signing pane overlays Univer's canvas; it doesn't paint signature affordances directly onto cells. A future pass could add data-validation-style indicators on anchored cells.

## Editor parity

See the [Casual Docs signatures guide](/docs/editor/signatures/) for the same flow with paragraph anchors. The two docs cover the same protocol from different sides.
