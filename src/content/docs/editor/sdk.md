---
title: 'SDK'
product: editor
order: 60
sourceUrl: 'https://github.com/CasualOffice/docs/blob/main/docs/internal/14-sdk-delivery.md'
updated: 2026-06-08T00:00:00.000Z
summary: 'npm install the editor into your React app. Standalone or co-edit; same component.'
---

Casual Editor ships as a React component via `@eigenpal/docx-js-editor`. Drop the SDK into your app's React tree, supply a FileSource adapter against your storage API, and you get the full editor — toolbar, page layout, comments, version history. Co-edit is a single optional prop.

---

## Install

```bash
npm install @eigenpal/docx-js-editor
```

Optional peer dependencies — install only when you enable collab:

```bash
npm install yjs y-websocket y-prosemirror
```

A standalone deploy with no co-edit doesn't pay the bundle weight for these.

---

## Minimum integration

```tsx
import { CasualEditor } from '@eigenpal/docx-js-editor';
import { MyFileSource } from './my-file-source';

const fs = new MyFileSource({ baseUrl: '/api' });

export function DocPage({ docId }: { docId: string }) {
  return <CasualEditor fileSource={fs} docId={docId} />;
}
```

That's it. The editor loads bytes via `fs.open(docId)`, lets the user edit, saves back via `fs.save(docId, bytes)` on explicit Save. No co-edit, no autosave tick.

## Three orthogonal axes

| Axis          | Choice                                  | What it controls                          |
| ------------- | --------------------------------------- | ----------------------------------------- |
| **Delivery**  | SDK (npm) vs Iframe (postMessage)       | How the editor lands in the host          |
| **Transport** | FileSource vs WOPI                      | How bytes move between host and editor    |
| **Collab**    | Standalone vs WS gateway                | Whether co-edit infrastructure runs       |

You pick one of each. The combinations are independent — for example you can do SDK + WOPI (using the editor's WOPI FileSource implementation) or Iframe + FileSource over postMessage.

## Adding co-edit

Set `backendUrl` to point at a Casual gateway. The editor renders with Yjs sync plugins and opens a WS to `${backendUrl}/doc/${docId}` immediately.

```tsx
<CasualEditor
  fileSource={fs}
  docId={docId}
  backendUrl="wss://collab.example.com"
  user={{ name: me.displayName, color: me.avatarColor }}
/>
```

Initial load + final snapshot still flow through `fs.open(docId)` and `fs.save(docId, bytes)`. The WS only carries Yjs updates between connected clients. Drop the `backendUrl` to disable co-edit; everything else keeps working.

## Adding autosave

```tsx
<CasualEditor
  fileSource={fs}
  docId={docId}
  autosave
  autosaveInterval={30000}
  onAutosaveState={(state) => myToastBar.show(state)}
/>
```

The wrapper ticks `fs.save(docId, bytes)` every `autosaveInterval` ms. Status (`'idle' | 'saving' | 'saved' | 'error'`) is reported via `onAutosaveState` so your chrome can render its own indicator, or use the included `<AutosaveStatus>` component.

## Implementing FileSource

Five methods. Your `MyFileSource` calls into your existing HTTP API:

```ts
import type { FileSource } from '@eigenpal/docx-js-editor';

export class MyFileSource implements FileSource {
  readonly kind = 'browser' as const;
  readonly label = 'My Drive';

  async open(id: string) {
    const res = await fetch(`/api/files/${id}/content`, { credentials: 'include' });
    return {
      bytes: await res.arrayBuffer(),
      name: res.headers.get('X-File-Name') ?? id,
    };
  }
  async save(id: string, bytes: ArrayBuffer) {
    const res = await fetch(`/api/files/${id}/content`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/octet-stream' },
      body: bytes,
    });
    return { id, etag: res.headers.get('ETag') ?? '' };
  }
  async list() {
    return [];
  }
  async rename() {}
  async delete() {}
  watchRecent() {
    return () => undefined;
  }
  async rememberLastOpened() {}
  async lastOpened() {
    return null;
  }
}
```

Existing implementations you can use directly:

- **`BrowserFileSource`** — IndexedDB + optional File System Access folder. Drop-in for any pure-browser deploy.
- **`PersonalFileSource`** — talks to a Casual gateway's `/files` REST endpoints for single-tenant personal deploys.
- **`WopiFileSource`** — WOPI client for SharePoint-style hosts.

## Other surfaces in the SDK

- **`PersonalAuthGate` / `UserMenu` / `ProfileSettingsDialog`** — login/signup modal, after-auth menu, profile editor for personal-mode deploys.
- **`useFileSourceAutoSave`** — the autosave hook standalone, for hosts that prefer to compose it themselves.
- **`AutosaveStatus`** — compact "Saved 2 min ago" indicator.
- **`SigningProvider` + `SigningPane`** — see [Signatures](/docs/editor/signatures/).
- **`EmbedTransport`** — see [Iframe embedding](/docs/editor/iframe-embed/).

## What's NOT in the SDK

- Drive's file picker / right panel / breadcrumbs — those are your host's chrome.
- Identity. The SDK ships a personal-auth gate for casual-docs standalone, but Drive integrators replace it with their own.
- Save UI policy. You decide when to call save: explicit button, autosave on tick, beforeunload, all three.

## Version compatibility

`@eigenpal/docx-js-editor` follows semver. The Casual gateway used in co-edit mode speaks the standard y-websocket binary protocol — stable across editor versions; no pin required.

When a major version of the SDK ships, your host pins explicitly. There are no silent breaks.
