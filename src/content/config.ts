import { defineCollection, z } from 'astro:content';

// Docs collection — populated by `npm run sync-docs` from the sibling
// repos (`../sheet/`, `../document/`). Each entry is a markdown file
// with a stable slug derived from its source path.
//
// `product` is one of:
//   - sheets   — Casual Sheets (../sheet)
//   - editor   — Casual Editor (../document)
//   - shared   — concepts that span both
//
// `order` controls sidebar ordering within a product. Lower = earlier.
// `sourceUrl` is the canonical GitHub URL of the file the entry was
// pulled from — surfaced as an "Edit on GitHub" link in the page UI
// so the docs stay a thin curated view over the upstream sources.
const docs = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    product: z.enum(['sheets', 'editor', 'shared']),
    order: z.number().default(99),
    summary: z.string().optional(),
    sourceUrl: z.string().url().optional(),
    updated: z.coerce.date().optional(),
  }),
});

// Changelog collection — per-product release entries. One file per
// release, named `<product>-v<version>.md`.
const changelog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    product: z.enum(['sheets', 'editor', 'desktop']),
    version: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    repoUrl: z.string().url().optional(),
  }),
});

export const collections = { docs, changelog };
