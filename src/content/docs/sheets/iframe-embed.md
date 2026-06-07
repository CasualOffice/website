---
title: 'Iframe embedding'
product: sheets
order: 260
sourceUrl: 'https://github.com/schnsrw/sheets/blob/main/docs/SDK_SIGNING_EMBED.md'
updated: 2026-06-08T00:00:00.000Z
summary: 'Embed Casual Sheets in any host via iframe + postMessage. Same protocol as Casual Editor.'
---

Casual Sheets exposes the same iframe protocol as [Casual Editor](/docs/editor/iframe-embed/). A host that integrates one product can light up the other by swapping the iframe `src` and the field anchors. Every envelope's `app` field is `'sheet'`; every other shape is identical.

This is the right delivery when:

- The host isn't a React app.
- You need a strong security boundary (CSP, frame-ancestors).
- The editor's release lifecycle must be independent.

For React hosts embedding into their own tree, see [the SDK delivery](/docs/sheets/sdk/).

---

## Embed shape

```html
<iframe
  src="https://sheets.example.com/embed?app=sheet&config=<base64url-JSON>"
  allow="clipboard-write; clipboard-read"
></iframe>
```

`config` carries an `EmbedConfig`:

```ts
interface EmbedConfig {
  app: 'sheet'; // discriminator — must match the iframe build
  hostOrigin: string; // required — allowed postMessage origin
  locale?: string;
  theme?: 'light' | 'dark' | 'system';
  hideTitleBar?: boolean;
  hideMenuBar?: boolean;
  readOnly?: boolean;
}
```

## Differences from Casual Editor

- **Field anchor in signing envelopes** — Casual Sheets uses `{ kind: 'sheet', sheet: string, cell: string }` instead of `{ kind: 'doc', paraId: string }`.
- **`app` discriminator** — every envelope carries `app: 'sheet'`. Hosts embedding both products route by this field.
- **Selection events** — `casual.selection.changed.data.sheet` carries `{ sheet, from, to }` instead of `{ paraId, from, to, selectedText }`.

Every other envelope shape — handshake, load.request / response, save.request / response, telemetry, lock, command.\*, signature.\* — is byte-identical to the Casual Editor protocol. See [the full contract](https://github.com/schnsrw/docx/blob/main/docs/internal/13-iframe-protocol.md).

## Signature anchor

When a host issues `casual.signature.request` against an embedded sheet:

```ts
iframe.contentWindow.postMessage(
  {
    type: 'casual.signature.request',
    app: 'sheet',
    id: 'sig-1',
    v: 1,
    data: {
      mode: 'sequential',
      fields: [
        {
          fieldId: 'accountant',
          label: 'Accountant signature',
          required: true,
          anchor: { kind: 'sheet', sheet: 'Q3 P&L', cell: 'B47' },
          methods: ['drawn', 'typed'],
        },
      ],
      banner: 'Signing as Alice for Acme Co.',
    },
  },
  'https://sheets.example.com',
);
```

The signing pane walks the signer through; drawn signatures stamp as floating images over the target cell range, typed signatures land in the cell directly. See [Signatures](/docs/sheets/signatures/).

## Security model

- **Origin validation**. Both sides MUST check `event.origin` against the allowlist. Mismatches silently dropped.
- **Auth token**. Optional `host.hello.data.authToken` — the editor echoes it on every authenticated request; the host validates as it would any other bearer.
- **No editor-side auth**. The host owns auth.
- **Frame ancestors**. Production: `Content-Security-Policy: frame-ancestors <host-origin>`.

## Reference sequence

Identical to [Casual Editor's](/docs/editor/iframe-embed/#reference-flow) — only the `app` field differs.

## Source of truth

The iframe protocol contract lives in the [Casual Editor repo](https://github.com/schnsrw/docx/blob/main/docs/internal/13-iframe-protocol.md) — both products implement it in lockstep. When the contract changes, both repos update.
