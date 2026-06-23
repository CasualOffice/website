---
title: 'SDK'
product: sheets
order: 250
sourceUrl: 'https://github.com/CasualOffice/sheets/blob/main/docs/SDK_SIGNING_EMBED.md'
updated: 2026-06-08T00:00:00.000Z
summary: 'Embed Casual Sheets inside your own React app. Single-pane or co-edit; same surfaces.'
---

Casual Sheets ships React surfaces for hosts that want to embed the spreadsheet inside their own app — Drive, internal portals, anywhere you have a React tree and want a real `.xlsx` editor without sending users off-site.

The surfaces are the same shape as [Casual Docs's SDK](/docs/editor/sdk/) — the same signing pipeline, the same EmbedTransport, the same iframe envelopes. The only product-specific bit is the field anchor: sheets use `{ sheet, cell }`, editor uses `{ paraId }`.

---

## What's published

Sheet doesn't ship as a public npm package today — `@sheet/web` is a workspace-internal name. If you're integrating Casual Sheets into another React app:

- **Public deploy users** — use the [iframe embedding path](/docs/sheets/iframe-embed/). One URL, no install.
- **Self-hosters embedding into a sibling app** — vendor the relevant surfaces (`apps/web/src/signing/`, `apps/web/src/embed/`, `apps/web/src/file-source/`) into your tree, or import from the workspace directly. A first-class npm package is on the roadmap; the wire shapes are already pinned via the [iframe protocol contract](/docs/editor/iframe-embed/).

## Co-edit topology

Casual Sheets's co-edit is handled by a dedicated server (`apps/server`). When you embed the editor into Drive, Drive points at one of two topologies:

- **Single-user mode** — no co-edit server. Drive bundles the editor; bytes round-trip through Drive's HTTP API; no Yjs / Hocuspocus runtime.
- **Co-edit mode** — Drive operator runs `apps/server` as a second container. The editor opens a WS to it. Initial load + final snapshot still flow through Drive; the WS carries the Yjs deltas in between.

This mirrors Casual Docs's topology. Operators get a clear cost equation: skip co-edit → simpler deploy; add it → multi-user editing.

## Other embedded surfaces

- **`SigningProvider` / `SigningPane` / capture components** — see [Signatures](/docs/sheets/signatures/).
- **`EmbedTransport`** — see [Iframe embedding](/docs/sheets/iframe-embed/).
- **`PersonalAuthGate` / `UserMenu` / file-source** — same shapes as Casual Docs; covered in [Architecture](/docs/sheets/architecture/) and [Customization](/docs/sheets/customization/).

## What's NOT in the SDK surface

- Drive's chrome — file picker, breadcrumbs, right panel. Those are host responsibilities.
- Authentication. The personal-auth gate is there for the standalone Casual Sheets deploy; Drive integrators replace it with their own.

## Source of truth

The integration playbook is mirrored in the [sheets repo](https://github.com/CasualOffice/sheets/blob/main/docs/SDK_SIGNING_EMBED.md). When the iframe protocol contract changes in `document/docs/internal/13-iframe-protocol.md`, both products update in lockstep.
