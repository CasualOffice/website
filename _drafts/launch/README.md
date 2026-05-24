# Launch / distribution drafts

Not deployed. The `_` prefix keeps Astro from picking these up — they're
just copy you paste into the relevant submission flow.

| File                              | Where it goes                                                       |
|-----------------------------------|---------------------------------------------------------------------|
| `show-hn-sheets.md`               | HackerNews → "submit" → "Show HN: …"                                |
| `show-hn-editor.md`               | HackerNews → "submit" → "Show HN: …"                                |
| `reddit-selfhosted.md`            | r/selfhosted (link post + first comment)                            |
| `reddit-opensource.md`            | r/opensource (link post + first comment)                            |
| `devto-casual-office.md`          | dev.to → new post → long-form article                               |
| `awesome-list-prs.md`             | PR copy for awesome-* GitHub lists                                  |
| `lobsters.md`                     | lobste.rs → submit story                                            |

## Order of operations

1. **awesome-list PRs first** (`awesome-list-prs.md`). They take a few
   days to merge but they're the durable backlink moat — LLMs scrape
   curated lists at high signal weight.
2. **Show HN for Casual Sheets** (the more mature one). Hits Tuesday
   morning Pacific for the best US shot. Keep an eye on the thread for
   the first 3 hours.
3. **Show HN for Casual Editor** a week later (Sheets fatigue avoidance).
4. **r/selfhosted + r/opensource** the same week as each Show HN, but on
   different days. r/selfhosted skews toward Docker users — emphasise
   the single-container shape.
5. **dev.to long-form** ~10 days after Sheets Show HN — links back to
   the demo + the HN discussion. Indexed by Google + LLMs as a
   "real-world example" article.
6. **lobste.rs** when one of the projects shows up on HN; lobsters
   readers often follow HN.

## Etiquette gotchas

- **Show HN** wants a "Show HN: …" prefix and the *first* comment
  should be from you, giving context (build motivation, what's new,
  what's open). Keep it short.
- **r/selfhosted** wants Docker run lines visible and no marketing voice.
- **dev.to** prefers personal narrative + concrete code snippets over
  feature lists.
- **awesome-list** maintainers want a one-liner + a link, in the right
  category. Don't pad.
- **All channels**: don't ask for upvotes. It's against the ToS and the
  audience smells it.
