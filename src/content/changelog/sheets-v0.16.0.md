---
title: 'v0.16.0 — the installable spreadsheet SDK'
product: sheets
version: '0.16.0'
date: 2026-07-08
summary: 'Casual Sheets ships as one installable npm package — @casualoffice/sheets — embedding a full spreadsheet editor with the unified, cross-editor contract: documentMode, an on/off event emitter, an imperative handle (getContent/setContent/executeCommand/undo/redo/focus), a features flag-map, chrome extensions, declarative collab and ai props, and iframe + cspNonce style isolation. The same contract ships in @casualoffice/docs, so a host wires both editors the same way.'
repoUrl: https://github.com/CasualOffice/sheets
---

`@casualoffice/sheets` is now a public, installable npm package that
embeds a full spreadsheet editor (Univer Sheets under the hood) into a
host app. It exposes the **unified cross-editor contract** — the same
shapes `@casualoffice/docs` exposes — so a host that learns one editor
already knows the other. The host owns storage; the SDK stays
storage-unaware and hands you content snapshots to persist.

```bash
npm i @casualoffice/sheets
```

## What ships

### One package, one contract

- **`documentMode`** — `'editing' | 'viewing'`, reactive, set
  declaratively or via `setDocumentMode()`. Supersedes the older
  `readOnly` boolean.
- **Events, two ways** — every canonical event is both an `on*` prop
  (`onReady`, `onChange`, `onSelectionChange`, `onSave`, `onError`,
  `onDirtyChange`) **and** an `.on(name, handler)` /
  `.off(name, handler)` emitter on the handle.
- **Imperative API (`CasualSheetsAPI`)** — `getContent` / `setContent`,
  `import` / `export` (`.xlsx`), `getSelection`, `focus`,
  `executeCommand` / `executeCommands`, `setDocumentMode` /
  `getDocumentMode`, plus a raw `univer` facade escape hatch.
  `getSnapshot` / `loadSnapshot` remain as deprecated aliases.
- **`features`** — a `Record<string, boolean>` flag-map that hides a
  chrome control **and** blocks its command; applies when built-in
  chrome is shown (`chrome="minimal"` or `chrome="full"`).
- **`extensions`** — append custom toolbar items, menu entries, dialogs,
  and side panels on top of the built-in Office shell.

### Collaboration and AI by config

- **Collab** — pass a declarative `collab` prop and the SDK wires
  Yjs / Hocuspocus itself once the editor is ready, detaching on
  unmount. Omit it for a single-user editor. The host still owns
  persistence; collab is the realtime transport only.
- **AI** — pass an `ai` prop to mount a task-pane surface beside the
  grid; `createSheetsAiTransport()` selects the transport for the
  environment (desktop-native, collab-proxied, or direct).

### Style isolation

- **`CasualSheetsIframe`** renders the editor in an iframe and talks to
  it over the `embed` postMessage protocol, with **`cspNonce`** support
  for strict-CSP hosts.

## Where to start

The full integration guide — mounting, document mode, load/save,
events, the imperative API, chrome and features, extensions, collab,
AI, and appearance — is at [/docs/sheets/sdk/](/docs/sheets/sdk/).
