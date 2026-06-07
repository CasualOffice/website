---
title: 'Signatures'
product: editor
order: 80
sourceUrl: 'https://github.com/schnsrw/docx/blob/main/docs/internal/13-iframe-protocol.md#document-signatures'
updated: 2026-06-08T00:00:00.000Z
summary: 'Walk a signer through anchored fields; host owns identity and crypto. Same flow via SDK callbacks or iframe envelopes.'
---

Casual Editor ships a document-signature pipeline that drives signing flows — employment agreements, sales contracts, multi-party approvals. The editor handles the UX (walking the signer through anchored fields, capturing drawn / typed / uploaded signatures). The host owns identity, crypto, audit, and final stamping.

The same shapes work whether you deliver via the SDK or the iframe protocol — pick the delivery based on your host, not the feature.

---

## What the editor handles

- Renders a floating right-anchored signing pane.
- Walks the signer through the configured fields (`sequential` or `concurrent` mode).
- Three capture surfaces: draw on a canvas (PNG), type a name (UTF-8 in a script font), upload an image (PNG/JPEG/SVG).
- Emits a progress event when each field is signed; a completion event when every required field is done.
- Honours cancellation from either side.

## What the host owns

- The signer identity — the editor accepts whatever the host attests to via the auth token.
- The signature material — a PNG of a drawn signature, a typed string, an X.509 detached signature produced by a CA, whatever your flow needs. The editor receives bytes + mime and stamps them; it doesn't verify anything.
- The audit trail — the protocol surfaces per-field events; you decide what to persist.
- Final stamping into the `.docx` — for v1, the editor returns the unmodified document and a `fields` map of signed payloads. Your backend stamps the bytes (using `ring` / `rustls` / OpenSSL — whatever you already trust).

This split keeps the editor cert-free (no X.509, no PKI lib in the bundle) and lets you plug in any signing backend — DocuSign, Adobe Sign, a custom HSM.

## Field shape

```ts
interface SignatureField {
  fieldId: string;
  label: string; // 'Employee signature', 'Witness', etc.
  required: boolean;
  anchor:
    | { kind: 'doc'; paraId: string; search?: string }
    | { kind: 'sheet'; sheet: string; cell: string };
  methods: Array<'drawn' | 'typed' | 'uploaded'>;
  signer?: { name?: string; email?: string };
}
```

The `anchor` discriminator is the only product-specific piece. Casual Editor uses paragraph anchors; Casual Sheets uses cell anchors. Everything else — banner, mode, complete event, cancel — is uniform.

## SDK integration

Pass a `signing` prop to `<CasualEditor>`. The wrapper renders the signing pane next to the editor and routes events to your callbacks.

```tsx
<CasualEditor
  fileSource={fs}
  docId={docId}
  signing={{
    mode: 'sequential',
    fields: [
      {
        fieldId: 'emp',
        label: 'Employee',
        required: true,
        anchor: { kind: 'doc', paraId: 'A1B2C3' },
        methods: ['drawn', 'typed'],
      },
      {
        fieldId: 'mgr',
        label: 'Manager',
        required: true,
        anchor: { kind: 'doc', paraId: 'D4E5F6' },
        methods: ['drawn'],
      },
    ],
    banner: 'Signing as Alice for Acme Co.',
    onFieldSigned: async ({ fieldId, method, bytes, mime, signedAt }) => {
      await myBackend.audit.signatureField({ fieldId, method, signedAt });
    },
    onComplete: async ({ bytes, fields }) => {
      const stamped = await myBackend.stampSignatures(bytes, fields);
      await fs.save(docId, stamped);
      onSigningDone();
    },
    onCancel: ({ reason }) => onSigningAborted(reason),
  }}
/>
```

Standalone usage outside `<CasualEditor>` is also supported — `<SigningProvider>` + `<SigningPane>` + the three capture surfaces are exported individually for hosts that compose their own editor shell.

## Iframe integration

For non-React hosts, the same shapes flow over postMessage. The host sends `casual.signature.request` to open a signing session; the editor responds with `casual.signature.request.ack`, then emits `casual.signature.field.signed` per field and `casual.signature.complete` at the end. Either side can send `casual.signature.cancel`.

```ts
// Host opens a signing session
iframe.contentWindow.postMessage(
  {
    type: 'casual.signature.request',
    app: 'docs',
    id: 'sig-1',
    v: 1,
    data: {
      fields: [
        /* ... */
      ],
      mode: 'sequential',
      banner: 'Signing as Alice for Acme Co.',
    },
  },
  'https://editor.example.com',
);

// Listener receives per-field events
window.addEventListener('message', (e) => {
  if (e.origin !== 'https://editor.example.com') return;
  if (e.data?.type === 'casual.signature.field.signed') {
    handleFieldSigned(e.data.data);
  }
  if (e.data?.type === 'casual.signature.complete') {
    handleComplete(e.data.data);
  }
});
```

Full envelope shapes in [the iframe protocol contract](https://github.com/schnsrw/docx/blob/main/docs/internal/13-iframe-protocol.md#document-signatures).

## Sequence — three-signer sequential flow

```
Host                                          Editor
────                                          ──────
casual.signature.request(fields × 3,         render dimmed chrome, show field 1
mode='sequential', banner)              ───►  banner: "Signing as Alice"
                                              ◄────── casual.signature.request.ack
…Alice draws her signature…
                                              ◄────── casual.signature.field.signed
host writes audit row                         show field 2
casual.command.setBanner ───────────────────► banner: "Signing as Bob"
…Bob types his name…
                                              ◄────── casual.signature.field.signed
…Carol uploads a PNG…
                                              ◄────── casual.signature.field.signed
                                              ◄────── casual.signature.complete
host stamps bytes, archives
```

## Capability advertisement

The editor lists its signature support in the `casual.hello` handshake:

- `signature.drawn`
- `signature.typed`
- `signature.uploaded`
- `signature.sequential` / `signature.concurrent`

A host that asks for a method the editor doesn't advertise gets `signature.request.ack` with `ok: false, code: 'unsupported'`. No surprises.

## What's deferred

- **Editor-side stamping**. v1 returns the unstamped bytes + signature payloads; your backend does the final composition. v2 lands editor-side stamping (image insertion at the anchor) so single-page hosts can finalize client-side.
- **Cryptographic signatures**. The protocol carries opaque bytes — for traditional drawn/typed/uploaded signatures, an image is fine. For PKI-grade signing (X.509 detached signatures, CAdES), the host produces the signature material from its CA and passes it via the `bytes` field; the editor just stamps it.

## Sheet parity

Casual Sheets uses the same signing pipeline with cell anchors instead of paragraph anchors. See the [Casual Sheets signatures guide](/docs/sheets/signatures/).
