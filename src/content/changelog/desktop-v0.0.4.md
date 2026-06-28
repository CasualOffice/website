---
title: 'v0.0.4 — rename on disk, theme that sticks'
product: desktop
version: '0.0.4'
date: 2026-06-28
summary: 'A second round of fixes from real use: rename now renames the file on disk, the in-editor light/dark choice survives a restart, the document-open error banner is gone, and the "number stored as text" toast reads properly. Installs in place over v0.0.3 via signed auto-update.'
repoUrl: https://github.com/CasualOffice/desktop/releases/tag/v0.0.4
---

The second hotfix wave, again straight from day-to-day use. Installs in place over
v0.0.3 through the signed auto-update.

## Fixed

- **Rename renames the file on disk** — renaming a document or spreadsheet now
  renames the actual file (same folder, extension preserved) and re-binds the
  window, so the next save writes the renamed file instead of the old path.
  Previously the rename was in-memory only and silently lost on save.
- **Your theme choice sticks** — switching an editor to light (or dark) now
  survives a restart. The launcher still sets the default and a change in
  launcher Settings still applies everywhere, but a per-window toggle is no
  longer reverted on the next open.
- **No more error banner on open** — opening a document no longer flashed a
  "command not allowed" error (a window-permission gap in the cold-start reveal).
- **Cleaner spreadsheet toasts** — the "number stored as text" notice (and its
  title) showed raw translation keys instead of text. Fixed.

## Notes

Still update-signed, not OS-code-signed — see the install notes on the download
page for the first-launch steps on each OS. Auto-update stays opt-out under
Settings.
