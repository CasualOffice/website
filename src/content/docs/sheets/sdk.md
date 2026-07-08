---
title: 'SDK'
product: sheets
order: 250
sourceUrl: 'https://github.com/CasualOffice/sheets/blob/main/docs/sdk-usage.md'
updated: 2026-07-08T00:00:00.000Z
summary: 'Embed Casual Sheets into a React host via @casualoffice/sheets — the unified, cross-editor SDK contract.'
---

Casual Sheets ships as one installable npm package, `@casualoffice/sheets`. It
embeds a full spreadsheet editor (Univer Sheets under the hood) into a host app
and exposes the **unified SDK contract** — the same shapes as
[`@casualoffice/docs`](/docs/editor/sdk/), so a host that learns one editor
already knows the other. The host owns storage; the SDK stays storage-unaware
and hands you content snapshots to persist.

---

## Install and mount

```bash
npm i @casualoffice/sheets
```

Import the plugin CSS once at app boot:

```ts
import '@casualoffice/sheets/styles';
```

`<CasualSheets>` mounts a single workbook from an `IWorkbookData` snapshot and
hands you the imperative API through `onReady`:

```tsx
import { CasualSheets, type CasualSheetsAPI } from '@casualoffice/sheets';
import '@casualoffice/sheets/styles';

function Editor({ initialData }) {
  return (
    <CasualSheets
      initialData={initialData}
      onReady={(api: CasualSheetsAPI) => {/* stash the handle */}}
      onChange={(snapshot) => persist(snapshot)}
      style={{ width: '100%', height: '100%' }}
    />
  );
}
```

`initialData` is read **once** on mount. To swap workbooks, change the React
`key` to remount, or call `api.setContent(data)`. For hosts that prefer process
isolation, `CasualSheetsIframe` renders the editor in an iframe and talks to it
over the `embed` postMessage protocol.

---

## Document mode

`documentMode` is the shared interaction mode. Sheets supports two values:

```ts
type DocumentMode = 'editing' | 'viewing';
```

- `'editing'` (default) — fully editable.
- `'viewing'` — read-only.

It is reactive — flipping the prop re-applies via `api.setDocumentMode`. The
deprecated `readOnly` boolean maps to `'viewing'` only when `documentMode` is
unset; `documentMode` always wins.

---

## Load & save

The host owns persistence. Read and replace content via the handle:

| Method             | Purpose                                                    |
| ------------------ | --------------------------------------------------------- |
| `getContent()`     | Current workbook as `IWorkbookData` (or `null` pre-mount). |
| `setContent(data)` | Replace the workbook with a new snapshot; clears dirty.    |
| `import(input)`    | Parse an `.xlsx` `ArrayBuffer`/`Uint8Array`/`Blob` and load. |
| `export()`         | Serialize the workbook to an `.xlsx` `Blob`.               |

`import`/`export` are the canonical cross-editor aliases of the format-specific
`importXlsx`/`exportXlsx`. `getSnapshot`/`loadSnapshot` are deprecated aliases of
`getContent`/`setContent`. The SDK also fires `onSave` on `Ctrl/Cmd+S` and
`onExit` once with the final snapshot on unmount.

---

## Events

Every canonical event is available **two ways**: as an `on*` prop on
`<CasualSheets>` **and** via `api.on(name, handler)` / `api.off(name, handler)`
on the handle. `api.on` returns an unsubscribe function; `'ready'` is sticky.

| Event / prop                            | Payload                         |
| --------------------------------------- | ------------------------------- |
| `ready` / `onReady`                     | `(api: CasualSheetsAPI)`        |
| `change` / `onChange`                   | `(snapshot: IWorkbookData)`     |
| `selectionChange` / `onSelectionChange` | `(selection: RangeRef \| null)` |
| `save` / `onSave`                       | `(snapshot: IWorkbookData)`     |
| `error` / `onError`                     | `(error: Error)`                |
| `dirtyChange` / `onDirtyChange`         | `(dirty: boolean)`              |

`onChange` is debounced (default 400 ms; tune with `onChangeDebounceMs`) and
captures programmatic edits too. `dirtyChange` flips `true` on the first edit
since the last load/save and `false` on save / `setContent` / `import`.

```ts
const off = api.on('selectionChange', (sel) => updateStatusBar(sel));
off();
```

---

## Imperative API (`CasualSheetsAPI`)

The handle from `onReady` is the stable, semver-covered integration surface.

| Method                                | Purpose                                                    |
| ------------------------------------- | ---------------------------------------------------------- |
| `getContent()`                        | Current `IWorkbookData` snapshot, or `null`.               |
| `setContent(data)`                    | Replace the workbook; clears the dirty flag.               |
| `import(input)` / `importXlsx(input)` | Load an `.xlsx` (`ArrayBuffer` / `Uint8Array` / `Blob`).   |
| `export()` / `exportXlsx()`           | Serialize the workbook to an `.xlsx` `Blob`.               |
| `getSelection()`                      | Active selection as a `RangeRef`, or `null`.               |
| `focus()`                             | Move keyboard focus to the active workbook.                |
| `on(name, handler)` / `off(...)`      | Subscribe / unsubscribe to an event.                       |
| `executeCommand(id, params?)`         | Dispatch a Univer command; resolves to its boolean result. |
| `executeCommands(steps)`              | Replay a sequence of recorded command/mutation steps.      |
| `setDocumentMode(mode)` / `getDocumentMode()` | Switch / read `'editing'` vs `'viewing'`.          |
| `univer`                              | Raw FUniver facade — escape hatch, **not** covered by semver. |

`getSnapshot` / `loadSnapshot` remain as deprecated aliases.

```ts
await api.executeCommand('sheet.command.set-range-values', { value: 42 });
const range = api.getSelection(); // { unitId, sheetId, range }
```

---

## Chrome & features

By default the SDK renders a **bare grid** (`chrome="none"`) so the host brings
its own shell. Pass `chrome="minimal"` or `chrome="full"` to get the built-in
Office shell (menu bar, formatting toolbar, formula bar, sheet tab strip, status
bar).

```tsx
<CasualSheets initialData={data} chrome="full" features={{ merge: false }} />
```

`features?: Record<string, boolean>` toggles individual chrome controls. `false`
hides the control **and** blocks its command; omitted keys default to enabled.
Only applies when chrome is shown.

`extensions?: ChromeExtensions` lets a host append custom toolbar items, menu
entries, dialogs, and side panels on top of the built-in chrome. Every extension
is handed the live `CasualSheetsAPI`.

---

## Collaboration by config

Pass a `collab` prop to join a real-time room; the SDK wires Yjs/Hocuspocus
itself once the editor is ready and detaches on unmount. Omit it for a
single-user editor.

```tsx
<CasualSheets
  initialData={data}
  collab={{
    server: 'wss://your-host/yjs',
    room: 'workbook-42',
    token: authToken,             // optional; defaults to 'anon'
    role: 'write',                // 'view' | 'write'; default 'write'
    onStatus: (s) => setStatus(s), // 'connecting' | 'live' | 'offline'
  }}
/>
```

Yjs/Hocuspocus is the realtime transport only — the authoritative document is
still saved by the host via the save/exit contract; collab does not turn the SDK
into a store.

---

## The AI assistant

Pass an `ai` prop to mount a task-pane surface beside the grid. The SDK owns the
prop contract and layout slot; the host supplies the panel body via `ai.render`.

```tsx
import { CasualSheets, createSheetsAiTransport } from '@casualoffice/sheets';

<CasualSheets
  initialData={data}
  ai={{
    enabled: true,
    transport: createSheetsAiTransport(), // desktop-native → collab → browser-direct
    render: (ctx) => <YourAiPanel {...ctx} />,
    onAction: (action) => trackAiAction(action),
  }}
/>;
```

`enabled` is reactive. `createSheetsAiTransport()` picks the transport for the
environment: desktop-native inside the desktop shell, collab-proxied when a
collab WS URL is available, else browser-direct (bring-your-own key).

---

## Appearance

`appearance?: 'light' | 'dark'` is reactive — flipping it re-themes the live
editor. The imperative equivalent is `api.setTheme('light' | 'dark')`.
