---
title: 'Iframe embedding'
product: editor
order: 70
sourceUrl: 'https://github.com/CasualOffice/docs/blob/main/docs/internal/13-iframe-protocol.md'
updated: 2026-06-08T00:00:00.000Z
summary: 'Embed the editor in any host via iframe + postMessage. No React dependency on the host side.'
---

Casual Docs exposes a `/embed` route that mounts a stripped-down editor configured from URL parameters. The host page talks to the iframe via `postMessage` envelopes — no React, no SDK install, no shared runtime. A 50-line shim in any language works.

This is the right delivery when:

- The host isn't a React app (or you can't take a React dependency).
- You need a strong security boundary (CSP, frame-ancestors, etc.).
- The editor's update lifecycle must be independent of the host's deploy.

For React hosts that control their own tree, [the SDK](/docs/editor/sdk/) is the better choice. Both deliveries speak the same envelope shapes.

---

## Embed shape

```html
<iframe
  src="https://editor.example.com/embed?app=docs&config=<base64url-JSON>"
  allow="clipboard-write; clipboard-read"
></iframe>
```

The `config` query param is a base64url-encoded JSON `EmbedConfig`:

```ts
interface EmbedConfig {
  app: 'docs' | 'sheet'; // discriminator — must match the iframe build
  hostOrigin: string; // required — origin allowed to send postMessages
  locale?: string;
  theme?: 'light' | 'dark' | 'system';
  hideTitleBar?: boolean;
  hideMenuBar?: boolean;
  readOnly?: boolean;
}
```

`hostOrigin` is the security backstop — the editor refuses any inbound message whose `event.origin` doesn't match. Set it; never default to `*`.

## The envelope

Every postMessage on the wire matches one shape:

```ts
interface CasualEnvelope<T = unknown> {
  type: string; // always starts with 'casual.'
  app: 'docs' | 'sheet'; // routing aid for hosts embedding both
  id?: string; // for request/response correlation
  v: 1; // protocol version
  data: T; // per-type payload
}
```

Both directions use the same envelope. Editor → host posts to `window.parent`. Host → editor posts to `iframe.contentWindow`.

## Handshake

Right after the iframe loads, both sides send `casual.hello`:

```ts
// Editor → Host
{ type: 'casual.hello', app: 'docs', v: 1,
  data: { capabilities: ['load', 'save', 'selection', 'lock'],
          version: '1.2.3', commit: 'abc123' } }

// Host → Editor
{ type: 'casual.hello', app: 'docs', v: 1,
  data: { capabilities: ['saveDocument'],
          authToken: 'opaque-bearer' } }
```

After both `hello`s land the editor emits `casual.ready` and the host can issue requests.

## Selected envelope types

| Direction       | Type                              | Purpose                                       |
| --------------- | --------------------------------- | --------------------------------------------- |
| Editor → Host   | `casual.load.request`             | Editor needs document bytes                   |
| Host → Editor   | `casual.load.response`            | Host supplies bytes + etag                    |
| Editor → Host   | `casual.save.request`             | Editor pushes new revision                    |
| Host → Editor   | `casual.save.response`            | Host returns new etag (or 409 conflict)       |
| Editor → Host   | `casual.selection.changed`        | Selection moved; throttled ~10 Hz             |
| Editor → Host   | `casual.telemetry.event`          | Save / parse / slow-frame events              |
| Host → Editor   | `casual.command.setReadOnly`      | Toggle read-only mode                         |
| Host → Editor   | `casual.command.save`             | Host's "Save" button — editor responds with `save.request` |
| Both            | `casual.signature.*`              | Signature pipeline — see [Signatures](/docs/editor/signatures/) |

The full protocol shape lives in [the source contract](https://github.com/CasualOffice/docs/blob/main/docs/internal/13-iframe-protocol.md).

## Reference flow

```
Host                                          Editor
─────                                         ──────
mount iframe ───────────────────────────────► boot SPA, parse EmbedConfig
                                              ◄────── casual.hello (capabilities, version)
casual.hello (authToken) ──────────────────►
                                              ◄────── casual.ready
                                              ◄────── casual.load.request (docId)
casual.load.response (bytes, etag) ────────► render document
…user edits…
                                              ◄────── casual.selection.changed × N
host renders side panel from selection
…user clicks the host's Save button…
casual.command.save ───────────────────────►
                                              ◄────── casual.save.request (bytes, baseEtag)
host persists, returns new etag
casual.save.response (ok, etag) ───────────► clear dirty flag
```

## Binary payloads

`ArrayBuffer` fields ride the postMessage transfer list:

```ts
iframe.contentWindow.postMessage(envelope, hostOrigin, [bytes]);
```

The sender's copy becomes detached; the receiver owns the buffer. No allocation, no copy. Hosts that can't use transfer lists fall back to structured-clone — the editor accepts both.

## Security model

- **Origin validation**. Both sides MUST check `event.origin` against the configured allowlist. Mismatches are silently dropped.
- **Auth token**. `host.hello.data.authToken`, when present, is echoed by the editor on every authenticated request. The host validates as it would any other bearer. The editor never inspects it.
- **No editor-side auth**. The editor doesn't authenticate the host. The host owns auth; the editor is a faithful pane.
- **Frame ancestors**. Production deploys should set `Content-Security-Policy: frame-ancestors <host-origin>` to refuse embedding from unknown origins.

## What this protocol is NOT

- A replacement for [WOPI](/docs/editor/co-editing/). WOPI handles bytes for SharePoint-style hosts; iframe handles UX events on top. They compose.
- A cross-iframe collab transport. Multiple iframes sharing edits is the WS gateway's job, not the iframe protocol's. Iframe is single-pane.
- A privilege boundary inside the host's domain. The iframe boundary is cross-origin; same-origin embedding bypasses every check.

## Sheet parity

Every envelope's `app` field is `docs` or `sheet`. Casual Sheets ships the same `/embed` route + same envelope shapes — a host that integrates one product can light up the other by swapping the iframe `src` and the field anchors. See the [Casual Sheets iframe-embedding guide](/docs/sheets/iframe-embed/).
