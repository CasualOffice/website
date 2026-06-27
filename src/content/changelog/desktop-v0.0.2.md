---
title: 'v0.0.2 — first public binary'
product: desktop
version: '0.0.2'
date: 2026-06-28
summary: 'Casual Desktop ships its first downloadable binary for macOS, Linux, and Windows. A Tauri shell wrapping the Casual Docs and Casual Sheets web cores verbatim — single-user, offline, native file dialogs. Signed in-app auto-update from GitHub Releases.'
repoUrl: https://github.com/CasualOffice/desktop/releases/tag/v0.0.2
---

The first public binary. One Tauri shell, both editors, off the network.

## What ships

- **macOS, Linux, Windows binaries** — `.dmg` (universal: Apple Silicon +
  Intel), `.deb` + `.AppImage`, and `.msi` + NSIS `-setup.exe`. One window per
  open document, same model as native Office apps.
- **The web cores verbatim** — Casual Docs (ProseMirror + OOXML layout painter)
  and Casual Sheets (Univer-based) load as the same bundles the web ships, with
  a thin desktop bridge for native file I/O. No second code path.
- **Single-user, offline** — open a file, edit it, save back to the same path.
  No server, no port, no account, no telemetry. Files stay on disk.
- **Native everything** — OS open / save dialogs, file associations (double-click
  a `.docx`/`.xlsx` to open it), and drag-a-file-onto-the-window to open it.
  "This window or a new window?" on open, with a remembered default.
- **Signed in-app auto-update** — the app checks GitHub Releases on launch and
  installs newer signed builds in place (AppImage / `.app` / NSIS). Updates are
  verified against an embedded minisign public key; a `.deb`/`.msi` install
  isn't offered an update it can't apply.

## Notes

This is update signing, not OS code-signing — the installers are "unsigned" in
the OS sense (on macOS, right-click → Open on first launch). Auto-update is
opt-out under Settings.
