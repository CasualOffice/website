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
    product: z.enum(['sheets', 'editor', 'slides', 'desktop']),
    version: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    repoUrl: z.string().url().optional(),
  }),
});

// Notes collection — engineering posts. Each post targets a specific
// long-tail dev search query in its title. Front matter doubles as the
// SEO surface (description = meta description; tags = body keywords).
const notes = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    /** One-paragraph meta description. <meta name="description"> AND
     *  OpenGraph; this is the search-result preview line. 140–160 chars. */
    description: z.string(),
    date: z.coerce.date(),
    /** Free-form tags surfaced at the bottom of each post + used as
     *  body keywords for search. 3–6 per post. */
    tags: z.array(z.string()).default([]),
    /** Which product the post relates to (if any). Drives accent +
     *  cross-link back to the product page. */
    product: z.enum(['sheets', 'editor', 'slides', 'shared']).optional(),
    /** Hidden from the public list when true (still reachable by URL). */
    draft: z.boolean().default(false),
  }),
});

// Comparison collection — one entry per "Casual X vs Y" search target.
// Title IS the query someone would type; URL slug is `<our>-vs-<other>`.
// Goal: appearing in the long tail of "open source alternative to X" /
// "X self hosted alternative".
const vs = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    ourProduct: z.enum(['sheets', 'editor', 'slides']),
    other: z.string(),
    /** When the comparison was last verified against the competitor's
     *  current feature set — surfaces in the footer as honest dating. */
    verified: z.coerce.date(),
  }),
});

export const collections = { docs, changelog, notes, vs };
