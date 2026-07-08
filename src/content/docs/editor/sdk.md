---
title: 'SDK'
product: editor
order: 60
sourceUrl: 'https://github.com/CasualOffice/docs/blob/main/docs/sdk-usage.md'
updated: 2026-07-08T00:00:00.000Z
summary: 'Embed Casual Docs into a React (or framework-agnostic) host via @casualoffice/docs — the unified, cross-editor SDK contract.'
---

Casual Docs ships as one installable npm package, `@casualoffice/docs`. It
exposes the **unified SDK contract** — the same shapes as
[`@casualoffice/sheets`](/docs/sheets/sdk/), so a host that learns one editor
already knows the other: `documentMode`, an `on/off` event emitter,
`getContent`/`setContent`, a `features` flag-map, `editorExtensions`,
collaboration by config, an `ai` prop, and iframe style isolation.

---

## Install and mount

```bash
npm i @casualoffice/docs
```

Import the stylesheet once — it is not auto-injected:

```ts
import '@casualoffice/docs/styles.css';
```

There are two React mount styles plus one framework-agnostic imperative mount.

### `<CasualEditor>` — batteries-included wrapper

The wrapper bundles the editor + a `FileSource` (bytes I/O) + optional collab +
optional autosave. Point it at a document id and hand it a storage adapter:

```tsx
import { CasualEditor, BrowserFileSource } from '@casualoffice/docs';
import '@casualoffice/docs/styles.css';

const fileSource = new BrowserFileSource();

export function App() {
  return <CasualEditor fileSource={fileSource} docId="my-doc.docx" autosave />;
}
```

### `<DocxEditor>` — the raw editing surface

When you own loading/saving yourself, mount `DocxEditor` directly and feed it
bytes via `documentBuffer` (an `ArrayBuffer`, `Uint8Array`, `Blob`, or `File`):

```tsx
import { useRef } from 'react';
import { DocxEditor, type DocxEditorRef } from '@casualoffice/docs';
import '@casualoffice/docs/styles.css';

export function App({ bytes }: { bytes: ArrayBuffer }) {
  const ref = useRef<DocxEditorRef>(null);
  return <DocxEditor ref={ref} documentBuffer={bytes} onReady={(api) => api.focus()} />;
}
```

### `renderAsync` — imperative mount (no React in your code)

`renderAsync(input, container, options)` mounts the editor into a DOM node and
resolves to a handle once the document has parsed:

```ts
import { renderAsync } from '@casualoffice/docs';
import '@casualoffice/docs/styles.css';

const handle = await renderAsync(docxBlob, document.getElementById('editor')!, {
  documentMode: 'editing',
});

const blob = await handle.save(); // Blob | null
handle.destroy();
```

---

## Modes

The interaction mode is `documentMode` — one of three values:

```ts
type EditorMode = 'editing' | 'suggesting' | 'viewing';
```

- `'editing'` — direct edits (default).
- `'suggesting'` — edits captured as tracked changes.
- `'viewing'` — read-only.

Set it declaratively (`<DocxEditor documentBuffer={bytes} documentMode="suggesting" />`)
or at runtime through the ref (`ref.current?.setDocumentMode('viewing')`). Mode
changes fire `onDocumentModeChange(mode)`. `documentMode` supersedes the older
`mode` / `readOnly` props — when both are supplied, `documentMode` wins.

---

## Loading and saving

`export()` / `import()` / `getContent()` / `setContent()` are the canonical
cross-editor names:

```ts
const bytes = await ref.current?.export();   // ArrayBuffer | null
const doc   = ref.current?.getContent();     // parsed Document | null
ref.current?.setContent(doc);                // load a parsed Document
await ref.current?.import(otherBytes);       // load DOCX bytes
```

With `<CasualEditor>` the wrapper calls `fileSource.open(docId)` on mount and —
with `autosave` — `fileSource.save(docId, bytes)` on a tick
(`autosaveInterval`, default 30000 ms). `ref.current?.flushSave()` forces a save
immediately. The SDK ships `BrowserFileSource`, `PersonalFileSource`, and
`WopiFileSource`, or you supply your own.

---

## Events

Every canonical event is available **two ways**: as an `on*` config prop, and
via the `.on(name, handler)` / `.off(name, handler)` emitter on the handle. The
prop name maps to the emitter name mechanically — drop `on`, lower-camel the
rest (`onSelectionChange` ⇄ `'selectionChange'`).

```tsx
<DocxEditor
  documentBuffer={bytes}
  onReady={(api) => {/* fired once, after mount + initial load */}}
  onChange={(doc) => {/* after every committed edit */}}
  onSelectionChange={(sel) => {/* cursor / selection moved */}}
  onSave={(bytes) => {/* after a successful save */}}
  onError={(err) => {/* editor surfaced an error */}}
  onDirtyChange={(dirty) => {/* dirty ⇄ clean transitions */}}
  onDocumentModeChange={(mode) => {/* mode switched */}}
/>
```

```ts
const off = ref.current!.on('change', (doc) => console.log('edited', doc));
off(); // disposer removes the listener
```

| Emitter name         | `on*` prop             | Payload                  |
| -------------------- | ---------------------- | ------------------------ |
| `ready`              | `onReady`              | `DocxEditorRef`          |
| `change`             | `onChange`             | `Document`               |
| `selectionChange`    | `onSelectionChange`    | `SelectionState \| null` |
| `save`               | `onSave`               | `ArrayBuffer`            |
| `error`              | `onError`              | `Error`                  |
| `dirtyChange`        | `onDirtyChange`        | `boolean`                |
| `documentModeChange` | `onDocumentModeChange` | `EditorMode`             |

---

## The imperative handle (`DocxEditorRef`)

`ref.current` (and the `onReady(api)` argument) expose the handle. The canonical
cross-editor methods:

| Method                                        | What it does                                             |
| --------------------------------------------- | -------------------------------------------------------- |
| `getContent()`                                | Current parsed `Document`, or `null`.                    |
| `setContent(doc)`                             | Load a pre-parsed `Document`.                            |
| `import(input)`                               | Load DOCX bytes (`ArrayBuffer`/`Uint8Array`/`Blob`/`File`). |
| `export(opts?)`                               | Serialize to `.docx` bytes (`ArrayBuffer \| null`).      |
| `getSelection()`                              | Current cursor / selection info, or `null`.              |
| `executeCommand(id, params?)`                 | Run a registered command by id; resolves `boolean`.      |
| `undo()` / `redo()`                           | Undo / redo the last edit; returns `boolean`.            |
| `focus()`                                     | Focus the editing surface.                               |
| `setDocumentMode(mode)` / `getDocumentMode()` | Read / switch the mode at runtime.                       |
| `on(name, handler)` / `off(name, handler)`    | Subscribe / unsubscribe to canonical events.             |

The handle also carries document-agent helpers (`addComment`, `proposeChange`,
`findInDocument`, `applyFormatting`, `insertReportFromData`, …). Older method
names (`getDocument`, `importDocx`, `exportDocx`, `save`) remain as deprecated
aliases.

---

## Hiding features

Pass a `features` map — a flat `Record<string, boolean>` of control-id →
enabled. `false` hides that control **and** vetoes its command; an omitted key
defaults to enabled. Ids come from the published `DOCX_FEATURE_IDS` catalog
(unknown ids are ignored, so the catalog can grow without a breaking change):

```tsx
<DocxEditor documentBuffer={bytes} features={{ statusBar: false, ruler: false, bold: false }} />
```

The coarse `show*` props are deprecated shortcuts into this map; when both target
the same region, `features` wins.

---

## Extending the editor

`editorExtensions` is the SuperDoc-style, named way to add or replace
ProseMirror behavior without forking. Each `EditorExtension` has a stable `name`
and contributes raw plugins; extensions sharing a `name` collapse to the last
declaration (`replace: true` swaps the whole accumulated list):

```tsx
import { DocxEditor, type EditorExtension } from '@casualoffice/docs';
import { Plugin } from 'prosemirror-state';

const myExt: EditorExtension = {
  name: 'my-behavior',
  plugins: [new Plugin({ /* … */ })],
};

<DocxEditor documentBuffer={bytes} editorExtensions={[myExt]} />;
```

`externalPlugins` takes a raw `Plugin[]` and composes with `editorExtensions` —
keep it for raw plugin arrays and collab wiring.

---

## Collaboration by config

`<CasualEditor>` turns on real-time co-editing when you pass `backendUrl` — the
`ws://` / `wss://` base URL of a Casual (Hocuspocus + Yjs) gateway. The `docId`
doubles as the room id; a `user` identity is required in collab mode for
presence:

```tsx
<CasualEditor
  fileSource={fileSource}
  docId="room-42"
  backendUrl="wss://collab.example.com/yjs"
  user={{ name: 'Ada', color: '#7c3aed' }}
/>
```

Omit `backendUrl` and the editor runs **single-user** — no WebSocket, no Yjs
runtime. Initial load and final snapshot still flow through the `FileSource`; the
socket only carries Y updates between connected clients.

---

## The AI assistant

The built-in DocOps assistant is the supported SDK surface. Unlock it with the
`ai` prop:

```tsx
<DocxEditor
  documentBuffer={bytes}
  ai={{
    enabled: true,
    // transport is optional — auto-selected when omitted
    onAction: (action) => console.log(action.type, action.args, action.result),
  }}
/>
```

- `ai.enabled` — unlocks the assistant panel.
- `ai.transport` — a `DocOpsTransport` routing LLM calls. When omitted it is
  auto-selected (desktop transport under Tauri, direct otherwise); a
  `CollabTransport` proxies through the collab server.
- `ai.onAction(action)` — fired after each successful **write** tool run.

The `ai` prop is forwarded verbatim from `<CasualEditor>` to `<DocxEditor>`.

---

## Style isolation

For **guaranteed** style isolation (and strict-CSP compliance) use
`<CasualEditorIframe>`, which mounts the editor inside a same-origin iframe so no
styles, tokens, or fonts leak either way:

```tsx
import { CasualEditorIframe } from '@casualoffice/docs';

<CasualEditorIframe
  fileSource={fileSource}
  docId="my-doc.docx"
  embedBasePath="/embed/docs"
  cspNonce={nonce}
/>;
```

For strict-CSP hosts serving `style-src 'nonce-<value>'`, pass **`cspNonce`** —
the same value used in the host's CSP header. It is threaded through the iframe
URL and stamped as the `nonce` attribute on every `<style>` /
`<link rel="stylesheet">` in the iframe document.

### Theming with `--ce-*` tokens

The public theming surface is the `--ce-*` CSS custom-property set — set them on
a host wrapper to recolor the editor (`--ce-bg`, `--ce-page-paper`, `--ce-chrome`,
`--ce-surface`, `--ce-text`, `--ce-text-muted`, `--ce-primary`, `--ce-accent`,
`--ce-border`, `--ce-link`). Internal `--doc-*` variables are an implementation
detail.

---

## Version compatibility

`@casualoffice/docs` follows semver. The Casual gateway used in co-edit mode
speaks the standard y-websocket binary protocol — stable across editor versions;
no pin required. When a major version ships, your host pins explicitly. There are
no silent breaks.
