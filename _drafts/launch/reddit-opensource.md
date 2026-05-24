# r/opensource

## Title

```
Built an open-source web Office suite (Sheets + Editor) — Apache-2.0, file-centric, self-hostable
```

## Body

```
Three open-source projects under the "Casual Office" umbrella:

- **Casual Sheets** — Excel-flavored web spreadsheet · Apache-2.0
  https://github.com/schnsrw/sheets · https://sheet.schnsrw.live
- **Casual Editor** — Word-flavored web .docx editor · Apache-2.0 + MIT
  https://github.com/schnsrw/docx · https://doc.schnsrw.live
- **Casual Desktop** — Tauri binaries that reuse both web cores · in progress

**The thesis** is small and counter-positioned to the megasuite era:

- Native Office formats are the source of truth. Each editor round-
  trips the actual binary, with a published per-tag fidelity audit
  (Sheets: 46/46 probes pristine; Editor: 26/39 fixtures pristine,
  shooting for ≥ 90% before the desktop ships).
- Stateless backends. No DB in the real-time service. The host owns
  persistence — WOPI in v1+, inline (in-process) for v0 share-links.
- OSS dependencies, no Pro pinning. Sheets is on Univer OSS; if a
  feature is missing in OSS we build it on OSS or defer it. Never
  reach for the commercial layer.
- Solo work, but open by intention. PRs and issues are welcome on
  each repo.

**Tech stack**:

- Sheets: TypeScript · React · Vite · Univer OSS · Yjs · Hocuspocus
  · ExcelJS · ECharts · Docker · Playwright (357 e2e tests).
- Editor: TypeScript · React · Bun · Vite · ProseMirror · Yjs ·
  y-prosemirror · Go 1.24 · y-websocket protocol implemented from
  scratch in ~120 LOC.
- Site (https://schnsrw.live): Astro 5, static output, with docs +
  changelog content collections pulled from each repo's docs/.

**Why post here** — I've been working on this in the open for a few
months and the projects are at a state where the architecture
decisions are stable enough to discuss. If you're into:

- OOXML round-trip plumbing (the .xlsm passthrough work is in a
  small isolated module; same shape will land for complex pivots)
- Yjs / y-websocket alternatives or the host-integration abstraction
  in the Go gateway
- Self-hosting Office-shaped tools without an account system

— I'd love feedback. Also welcoming awesome-list maintainers who'd
slot Casual Office into their categorisations.
```

## Notes

- r/opensource leans more "what's the licensing + what's the
  philosophy" than r/selfhosted's "what does it take to run". Lead
  with thesis + license.
- Don't post within 48 hours of the r/selfhosted submission. Reddit
  cross-sub algorithms suppress near-duplicates.
