---
title: 'v1.2.0 — the installable editor SDK'
product: editor
version: '1.2.0'
date: 2026-07-08
summary: 'Casual Docs ships as one installable npm package — @casualoffice/docs — with a unified, cross-editor contract: documentMode, an on/off event emitter, an imperative handle (getContent/setContent/executeCommand/undo/redo/focus), a features flag-map, editorExtensions, declarative collab and ai props, and iframe + cspNonce style isolation. The same contract ships in @casualoffice/sheets, so a host wires both editors the same way.'
repoUrl: https://github.com/CasualOffice/docs
---

`@casualoffice/docs` is now the single, installable SDK for embedding
the editor. The surface is the **unified cross-editor contract** — the
same shapes `@casualoffice/sheets` exposes — so a host that learns one
editor already knows the other.

```bash
npm i @casualoffice/docs
```

## What ships

### One package, one contract

- **`documentMode`** — `'editing' | 'suggesting' | 'viewing'`, set
  declaratively or via `setDocumentMode()` at runtime. Supersedes the
  older `mode` / `readOnly` props (which still work as aliases).
- **Events, two ways** — every canonical event is both an `on*` config
  prop (`onChange`, `onSelectionChange`, `onSave`, `onError`,
  `onDirtyChange`, `onDocumentModeChange`, `onReady`) **and** an
  `.on(name, handler)` / `.off(name, handler)` emitter on the handle.
  Same event, same payload.
- **Imperative handle** — `getContent` / `setContent`, `import` /
  `export`, `getSelection`, `executeCommand`, `undo` / `redo`, `focus`,
  `setDocumentMode` / `getDocumentMode`. These are the canonical,
  cross-editor method names; the previous names (`save`, `getDocument`,
  `importDocx`, …) remain as deprecated aliases.
- **`features`** — a flat `Record<string, boolean>` flag-map that hides
  a control **and** vetoes its command. Ids come from the published
  `DOCX_FEATURE_IDS` catalog; unknown ids are ignored so the catalog can
  grow without a breaking change. The old `show*` props are deprecated
  shortcuts into this map.
- **`editorExtensions`** — the named, SuperDoc-style way to add or
  replace ProseMirror behavior without forking; `externalPlugins`
  remains as the low-level raw-plugin escape hatch.

### Collaboration and AI by config

- **Collab** — `<CasualEditor>` turns on real-time co-editing when you
  pass `backendUrl` (a Hocuspocus + Yjs gateway). Omit it and the editor
  runs single-user with no WebSocket or Yjs runtime.
- **AI** — the `ai` prop unlocks the DocOps assistant with an
  auto-selected transport (desktop-native under Tauri, a collab proxy,
  or direct), and an `onAction` callback that fires after each document
  write.

### Style isolation

- **`<CasualEditorIframe>`** mounts the editor in a same-origin iframe
  so no styles, tokens, or fonts leak either way. **`cspNonce`** threads
  a nonce onto every injected `<style>` / `<link>` for strict-CSP hosts.

## Where to start

The full integration guide — mount styles, modes, load/save, events,
the imperative handle, feature flags, extensions, collab, AI, and
theming with `--ce-*` tokens — is at
[/docs/editor/sdk/](/docs/editor/sdk/).
