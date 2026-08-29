# Casual Office — `casualoffice.org`

Marketing + docs site for **Casual Office** — an open-source, file-centric, real-time productivity suite by [Sachin Sarwa](https://github.com/schnsrw). Applications, the embeddable engines underneath them, and the platform they run inside — all Apache-2.0:

| Product | What | Repo | Demo | Status |
|---|---|---|---|---|
| **Casual Sheets** | `.xlsx` web spreadsheet with real-time co-editing | [CasualOffice/sheets](https://github.com/CasualOffice/sheets) | [sheet.casualoffice.org](https://sheet.casualoffice.org/) | v0.3.3 — production-ready for 1-user/doc · personal mode + WOPI · "almost" for co-edit |
| **Casual Docs** | `.docx` web editor with real-time co-editing | [CasualOffice/docs](https://github.com/CasualOffice/docs) | [docs.casualoffice.org](https://docs.casualoffice.org/) | public preview · 39/39 fidelity · npm SDK @casualoffice/docs |
| **Casual Slides** | `.pptx` web slides editor | [CasualOffice/slides](https://github.com/CasualOffice/slides) | — (ships with v0.1.0) | v0.0.0 · pre-tag · 68/87 fidelity ✓ |
| **Casual Desktop** | Tauri binaries wrapping the three web cores | (within product repos) | — | paused · queued |
| **Casual PDF** | High-fidelity PDF viewer + editor | [CasualOffice/pdf](https://github.com/CasualOffice/pdf) | [pdf.casualoffice.org](https://pdf.casualoffice.org/) | v1 in progress · Tier-1 editor live |
| **Casual RAS** | White-label embeddable remote access | [CasualOffice/RASystem](https://github.com/CasualOffice/RASystem) | [ras.casualoffice.org](https://ras.casualoffice.org/) | alpha · v0.0.2-alpha |

### Engines + platform

These are the second generation and the boundary around it. **OpenCalc and OpenDoc are successors to Casual Sheets and Casual Docs, not renames** — both generations exist, and the two application demos above still run the first generation.

| Project | What | Repo | Site / demo | Status |
|---|---|---|---|---|
| **OpenCalc** | Embeddable Rust spreadsheet engine, WASM canvas grid, `.xlsx` round-trip | [CasualOffice/opencalc](https://github.com/CasualOffice/opencalc) | [calc.casualoffice.org](https://calc.casualoffice.org/) · [editor](https://calc.casualoffice.org/editor.html) | alpha · npm SDK `0.0.0` |
| **OpenDoc** | Deterministic Rust `.docx` engine — model, layout, raster, WASM editor | [CasualOffice/opendoc](https://github.com/CasualOffice/opendoc) | [opendoc.casualoffice.org](https://opendoc.casualoffice.org/) · [editor](https://opendoc.casualoffice.org/editor.html?demo=1) | pre-release |
| **Enclave** | Self-hosted enterprise content + governance + search + MCP-AI platform | [CasualOffice/enclave](https://github.com/CasualOffice/enclave) | — | in development · no demo |

Built with **Astro 5** (static output) and deployed to GitHub Pages on every push to `main`. The site is **`casualoffice.org`** via the custom domain in `public/CNAME`.

---

## What's on the site

| Route | What |
|---|---|
| `/` | Umbrella landing page, product cards, the "why bother" + "what's the shape" pitch |
| `/casual-sheets/` | Product page — what it does, screenshots, install snippet |
| `/casual-docs/` | Product page |
| `/casual-slides/` | Product page (honest about early-stage state) |
| `/casual-desktop/` | Tauri lane status — paused, queued behind web v1 |
| `/casual-pdf/` | Product page — viewer/editor features, stack, honest scope |
| `/casual-ras/` | Product page — embeddable remote access, alpha |
| `/opencalc/` | Engine page — embeds the live `calc.casualoffice.org` editor |
| `/opendoc/` | Engine page — embeds the live `opendoc.casualoffice.org` editor |
| `/enclave/` | Platform page — the policy chain, capabilities, honest status |
| `/docs/` | Long-form docs — pulled from sibling repos via `scripts/sync-docs.mjs`. Per-product + shared sections. |
| `/changelog/` | Per-product release notes — Astro content collection (`src/content/changelog/`) |
| `/notes/` | Engineering posts — Yjs CRDT bridges, capacity modelling, `.xlsx` + `.pptx` round-trip lessons. Targets long-tail dev search queries; HN-shaped content. RSS at `/notes/rss.xml`. |
| `/vs/` | Comparison pages — Casual Sheets vs Google Sheets / OnlyOffice / Excel Online · expanding. Honest write-ups with "verified as of" dates. |
| `/about/` | Who's behind this + what the suite is for |
| `/license/` | License-by-repo matrix (all Apache-2.0; the editor fork preserves upstream MIT attribution) |
| `/contributing/` | How to contribute across the four repos |

## Layout

```
.
├── astro.config.mjs            # site URL + @astrojs/sitemap integration
├── package.json
├── tsconfig.json
├── public/                     # rides through to dist/ verbatim
│   ├── CNAME                   # custom-domain hint for GitHub Pages
│   ├── favicon.svg
│   ├── og.png + og-{product}.png  # 1200 × 630 social cards (Playwright-rendered by scripts/build-og.mjs)
│   ├── robots.txt              # AI-crawler allow list (GPTBot · ClaudeBot · OAI-SearchBot · …) + sitemap pointer
│   └── llms.txt                # long-form LLM-friendly description (emerging convention)
├── src/
│   ├── layouts/Base.astro      # shared <head>, nav, footer, JSON-LD slot
│   ├── components/
│   │   ├── Nav.astro          # products behind one disclosure; flattens on mobile
│   │   ├── Footer.astro
│   │   ├── LiveFrame.astro    # one embedded live app in faux browser chrome
│   │   └── ProductCard.astro
│   ├── pages/                  # one file = one route
│   │   ├── index.astro
│   │   ├── casual-sheets/index.astro
│   │   ├── casual-docs/index.astro
│   │   ├── casual-slides/index.astro
│   │   ├── casual-desktop/index.astro
│   │   ├── casual-pdf/index.astro
│   │   ├── casual-ras/index.astro
│   │   ├── opencalc/index.astro
│   │   ├── opendoc/index.astro
│   │   ├── enclave/index.astro
│   │   ├── docs/index.astro + [...slug].astro
│   │   ├── changelog/index.astro + [slug].astro
│   │   ├── notes/index.astro + [slug].astro + rss.xml.ts
│   │   ├── vs/index.astro + [slug].astro
│   │   ├── about/index.astro
│   │   ├── license/index.astro
│   │   └── contributing/index.astro
│   ├── content/                # Astro content collections
│   │   ├── docs/               # pulled from sibling repos by `scripts/sync-docs.mjs`
│   │   ├── changelog/          # one .md per release, named <product>-v<version>.md
│   │   ├── notes/              # engineering posts (long-tail SEO targets)
│   │   └── vs/                 # comparison pages
│   └── styles/global.css       # design tokens + per-product accents (sheets · editor · slides · desktop · pdf · ras · opencalc · opendoc · enclave)
├── scripts/
│   ├── build-og.mjs            # social card generator (Playwright)
│   └── sync-docs.mjs           # pulls docs/ from sibling repos into src/content/docs/
└── .github/workflows/pages.yml # npm install + astro build + deploy
```

## Dev

```sh
npm install
npm run dev        # http://localhost:4321
npm run build      # → dist/
npm run preview    # serve dist/ locally
```

## Deploy

`main` push → `.github/workflows/pages.yml` runs:

1. Checkout
2. `npm install`
3. `npm run build` (Astro emits to `./dist`)
4. Upload `./dist` as a Pages artifact
5. `actions/deploy-pages@v4`

CNAME (`public/CNAME` → ships as `dist/CNAME`) tells Pages to serve on **`casualoffice.org`**. DNS apex points to GitHub's IPs:

```
A    @    185.199.108.153
A    @    185.199.109.153
A    @    185.199.110.153
A    @    185.199.111.153
```

## SEO + LLM-discoverability posture

- **Meta** — every page emits full Open Graph, Twitter card, canonical URL, and JSON-LD (`SoftwareApplication` / `Person` / `WebSite` / `TechArticle` depending on route). Lives in `src/layouts/Base.astro` + per-page `jsonLd` prop.
- **Sitemap** — auto-generated by `@astrojs/sitemap` (see `astro.config.mjs`); the homepage + per-product pages get bumped priority. Sitemap submitted to Google Search Console + the AI crawlers fetch it from `/robots.txt`.
- **robots.txt** — `public/robots.txt` opts in every major AI crawler by name (`GPTBot`, `ChatGPT-User`, `ClaudeBot`, `OAI-SearchBot`, `PerplexityBot`, `Google-Extended`, `Applebot-Extended`, `CCBot`) plus the social-card unfurlers.
- **llms.txt** — `public/llms.txt` carries a long-form LLM-friendly description (emerging convention — see [llmstxt.org](https://llmstxt.org)).
- **OG images** — `public/og.png` + per-product `og-{sheets,editor,slides,desktop}.png` (1200 × 630). Regenerate with `node scripts/build-og.mjs` from a directory that has Playwright installed.
- **RSS** — `/notes/rss.xml` for the engineering posts; feeds tend to be picked up by aggregators which create inbound links.
- **Comparison pages** — `/vs/sheets-vs-{google-sheets,onlyoffice,excel-online}/` target exact-match queries like "open source Google Sheets alternative." This is where most net-new visitors actually arrive.

## Adding content

### A new changelog entry

`src/content/changelog/<product>-v<version>.md` — frontmatter schema is in `src/content/config.ts`. List page + slug page pick it up automatically.

### A new engineering note

`src/content/notes/<slug>.md`. Front matter: `title`, `description`, `date`, `tags`, optional `product`. List page + RSS feed pick it up automatically. Titles should be the exact-match search query someone would type (target the long tail).

### A new comparison

`src/content/vs/<our-product>-vs-<other>.md`. Front matter: `title`, `description`, `ourProduct`, `other`, `verified` (date). The list page + per-slug page render automatically.

## Related

| Project | Repo | Demo |
|---|---|---|
| Casual Sheets | [CasualOffice/sheets](https://github.com/CasualOffice/sheets) | [sheet.casualoffice.org](https://sheet.casualoffice.org/) |
| Casual Docs | [CasualOffice/docs](https://github.com/CasualOffice/docs) | [docs.casualoffice.org](https://docs.casualoffice.org/) |
| Casual Slides | [CasualOffice/slides](https://github.com/CasualOffice/slides) | — |
| OpenCalc | [CasualOffice/opencalc](https://github.com/CasualOffice/opencalc) | [calc.casualoffice.org](https://calc.casualoffice.org/) |
| OpenDoc | [CasualOffice/opendoc](https://github.com/CasualOffice/opendoc) | [opendoc.casualoffice.org](https://opendoc.casualoffice.org/) |
| Enclave | [CasualOffice/enclave](https://github.com/CasualOffice/enclave) | — |

## License

Apache-2.0. See [`LICENSE`](./LICENSE).
