---
title: 'v0.0.6 — an on-device AI that actually does the work'
product: desktop
version: '0.0.6'
date: 2026-07-05
summary: 'The AI release. Both editors gain a genuinely agentic assistant that plans, edits, and reviews multi-step tasks — running on a local model on your own machine, so your documents never leave it. Plus real Model Context Protocol support to plug in external tools, and a batch of reliability and polish fixes. Installs in place over v0.0.5 via signed auto-update.'
repoUrl: https://github.com/CasualOffice/desktop/releases/tag/v0.0.6
---

Casual Desktop already ran the Casual Docs and Casual Sheets editors natively,
offline. v0.0.6 makes the AI worth using: it's **agentic** — it breaks your goal
into steps, carries them out with real editing tools, and checks its own work —
and it runs on a **local model on your machine**, so nothing is sent to the
cloud unless you explicitly configure it.

## Added

- **Agentic AI in both editors.** Ask the assistant for something multi-step —
  "make the introduction more formal and add a conclusion" — and it plans the
  sub-tasks, executes each with the document/spreadsheet tools, and reviews the
  result. A live plan shows each step as it runs. Toggle between Agent and plain
  Chat in the AI panel.
- **On-device by default.** The agent runs against a local model (llama.cpp) you
  load once. Your document is never sent to a remote provider unless you set one
  up on purpose — and if the local model stops, the app tells you instead of
  silently falling back to the cloud.
- **Real Model Context Protocol (MCP).** Connect external MCP servers from the
  AI panel and their tools join the assistant automatically — the same open
  protocol Claude Desktop and other agents speak.
- **Formatting-preserving edits.** "Ask AI" rewrites keep your headings, bold /
  italic, tables, and lists intact instead of flattening a selection into plain
  text.

## Fixed

- **Your documents stay on your device.** Removed a path where a crashed local
  model could silently forward document text to a cloud API.
- **Reliability under the hood.** The local inference worker no longer aborts on
  oversized prompts (it reports a clear limit), on unusual tokens, or on
  multibyte text (CJK / emoji now render correctly).
- **Spreadsheet data quality.** AI-written numbers are stored as numbers, not
  text — so `SUM` and other formulas keep working.
- **Window opens maximized** on launch instead of a small window with the
  desktop showing around it.
- **AI panel polish.** Clearer errors ("your key was rejected" instead of a bare
  code), a Stop button to cancel a running task, a "thinking" indicator,
  Clear-conversation and Remove-key controls, and assorted accessibility fixes.

## Notes

Still update-signed, not OS-code-signed — see the install notes on the download
page for first-launch steps per OS. Auto-update stays opt-out under Settings.
The local AI model is downloaded once from within the app.
