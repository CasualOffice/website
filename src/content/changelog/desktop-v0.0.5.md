---
title: 'v0.0.5 — files stay on disk'
product: desktop
version: '0.0.5'
date: 2026-06-28
summary: 'A storage-hygiene release: on the desktop app your documents are no longer mirrored into browser storage. The file on disk and its on-disk recovery sidecar are the only source of truth — matching the local-only, files-stay-on-disk model. Installs in place over v0.0.4 via signed auto-update.'
repoUrl: https://github.com/CasualOffice/desktop/releases/tag/v0.0.5
---

A small but principled release. The web editors keep a crash-recovery copy of
your work in the browser's IndexedDB — sensible on the web, where there's no
disk to fall back to. On the desktop app there *is* a disk: every save writes the
real file, and a recovery sidecar sits next to it. So the browser-storage copy
was pure redundancy — and a contradiction of the app's promise that your files
stay on disk.

## Changed

- **No browser-storage copy of your files on desktop.** Both editors stop
  writing the workbook/document into IndexedDB (autosave + the recent-files
  cache) when running under the desktop shell. The on-disk file and its on-disk
  recovery sidecar are the source of truth; recents are owned by the launcher.
  Crash-recovery is unchanged — it just lives next to your file, not in the
  browser. (Web builds are unaffected.)

## Notes

Still update-signed, not OS-code-signed — see the install notes on the download
page for first-launch steps per OS. Auto-update stays opt-out under Settings.
