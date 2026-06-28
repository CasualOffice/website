---
title: 'v0.0.3 — first hotfix'
product: desktop
version: '0.0.3'
date: 2026-06-28
summary: 'A hotfix on the first public binary, from real-world use: open OpenDocument Text (.odt), stop pipe-separated (.psv) files saving as xlsx, make dark mode follow the launcher across both editors, route Print to a PDF on desktop, and use styled in-app dialogs instead of native ones.'
repoUrl: https://github.com/CasualOffice/desktop/releases/tag/v0.0.3
---

The first round of fixes after the public binary went out — most of these came
straight from a few minutes of real use. Installs in place over v0.0.2 via the
signed auto-update.

## Fixed

- **Opens `.odt`** — OpenDocument Text files now open (converted to the editor's
  DOCX model on load) instead of failing the zip check. Registered for
  double-click, the Open dialog, and drag-to-open.
- **`.psv` no longer corrupts on save** — saving a pipe-separated file used to
  write `.xlsx` bytes over it. It now saves real pipe-separated text, and `.psv`
  is wired through double-click / Open / recents like the other formats.
- **Dark mode follows the launcher** — both editors now match the launcher's
  light / dark / system choice. Previously the `system` setting could leave an
  editor pane (e.g. version history) light while the rest of the app was dark.
- **Print → PDF on desktop** — Ctrl+P / Print exports a PDF (printed reliably
  from your OS viewer) instead of the webview's unreliable print path that
  captured the editor chrome.
- **Styled dialogs** — confirm / prompt (sign out, delete, name a version) use
  in-app themed dialogs instead of the OS's native ones.
- **External links** open in your real browser; PDF export works on Linux; the
  spreadsheet parser no longer crashes on certain commented `.xlsx` files; and
  the document window no longer flashes a small box on cold start.

## Notes

Still update signing, not OS code-signing — installers remain "unsigned" in the
OS sense. Auto-update stays opt-out under Settings.
