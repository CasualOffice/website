# casualoffice.org — Redesign Spec (Doc-Hub Flagship)

> **Status:** copy-finished, implementation-ready. Reposition + refresh on the existing
> Astro 5 premium system — NOT a visual reinvention. Keep Manrope/Inter/JetBrains Mono,
> the brand gradient, `.display/.title/.section/.btn/.product/.trust`, scroll-reveal,
> WCAG AA, reduced-motion.
>
> **Honesty rules (non-negotiable, from README/ARCHITECTURE/PLAN/CLAUDE):**
> - State plainly: **server-trusted, NOT zero-knowledge E2E**. Never imply E2E.
> - **Documents only** — the MIME allowlist is authoritative: `.docx .xlsx .pptx .pdf .md .txt .csv .json .yaml`.
> - No invented/fake metrics. Doc-Hub has **no tagged version** (mid-rename from "Casual Drive", Phase 0). Coverage badge is a bar (`≥85%`), not a measured number — do not quote it as a result.
> - Casual PDF is **planning/in development** publicly — never list a version or call it shipped.
> - Casual Docs AI is **pre-release, off by default** — don't claim AI is live.
> - Casual Slides co-editing is **off by default**; its demo lives on `schnsrw.live`, not `casualoffice.org`; fidelity numbers are inconsistent in its own README — cite none.
> - Marketing copy uses **Doc-Hub / `DOCHUB_*`** exclusively (tree may still carry `drive-*`).
> - Host `dochub.casualoffice.org` · Repo `github.com/CasualOffice/dochub` · Image `ghcr.io/casualoffice/dochub:latest`.

---

## 1. Positioning + brand narrative

**New umbrella positioning:** Casual Office is a suite of open-source, self-hosted document tools. **Doc-Hub is the flagship** — the encrypted, tamper-evident document registry that the suite is built around. The editors (Casual Sheets, Docs, PDF, Slides) are the **native editors that live inside Doc-Hub** and also ship standalone; Casual Desktop is the local-only editing lane.

**One-paragraph brand narrative (site-wide north star):**

> Casual Office builds document software you own instead of rent. At its center is **Doc-Hub**: not a place to dump files, but a place to *keep* them — an open-source, self-hosted registry where every document is encrypted at rest, versioned forever in a hash-chained history you can prove, and edited natively in the browser. Around it sit the editors that power that editing — Casual Sheets, Casual Docs, and Casual PDF open right inside the hub — plus Casual Desktop for local-only work. Documents only, on your own server, under Apache-2.0. We're honest about the trade: the server holds keys so it can search and reason over your content, so this defeats a stolen disk or database dump — not a fully compromised server. Small, sharp, and provable, not a Drive clone.

**Voice:** terse, decision-oriented, present-tense, sentence-case. No exclamation marks, no hype. Mirror the existing homepage tone.

---

## 2. Sitemap / IA

| Path | Action | Notes |
|---|---|---|
| `/` (`src/pages/index.astro`) | **Rewrite** | Doc-Hub hero leads; lineup shows all products; registry/compliance narrative; honest is/isn't. Full section spec in §3. |
| `/doc-hub/` (`src/pages/doc-hub/index.astro`) | **ADD** | New flagship product page. Full spec in §4. |
| `/casual-sheets/`, `/casual-docs/`, `/casual-pdf/`, `/casual-slides/`, `/casual-desktop/` | **Keep** | Add a one-line "Also lives inside Doc-Hub →" backlink to `/doc-hub/` in each hero topline (editors + Sheets/Docs/PDF only; Desktop links as the local lane, Slides unchanged). Copy unchanged otherwise. |
| `/about/`, `/contributing/`, `/license/` | **Keep** | Update `/about/` intro paragraph to name Doc-Hub as flagship (implementer discretion, 1–2 sentences; no metric claims). |
| `/docs/`, `/docs/[...slug]`, `/changelog/`, `/notes/`, `/vs/` | **Keep** | No structural change. Doc-Hub docs live on `dochub.casualoffice.org/docs`, linked out (external), not synced here yet. |
| `Nav.astro`, `Footer.astro` | **Rewrite link lists** | Add Doc-Hub (primary). See §5. |
| `Base.astro` | **Edit** | Add `'dochub'` to the `active` union; refresh default `keywords`/`description`. See §8. |
| `ProductCard.astro` | **Edit** | Add `'dochub'` to `slug` union. See §6/§8. |
| `content/config.ts`, collections | **Keep** | Optionally add `dochub` to the `changelog`/`notes`/`vs` product enums (non-blocking; only if Doc-Hub content is authored). |

Redirect (astro.config.mjs): keep `/casual-editor/`→`/casual-docs/`. Optionally add `/casual-drive/`→`/doc-hub/` and `/drive/`→`/doc-hub/` for legacy inbound.

---

## 3. HOMEPAGE — section-by-section spec

`src/pages/index.astro`, wrapped `<Base {title} {description} active="home" jsonLd={jsonLd}>`.

**Frontmatter `title`:**
```
Casual Office — Doc-Hub: the encrypted, self-hosted document registry
```
**Frontmatter `description`:**
```
Doc-Hub is an open-source, self-hosted document hub — an encrypted, tamper-evident registry for the documents your team can't afford to lose or leak. Hash-chained history you can prove, AES-256-GCM encryption at rest, native in-browser editing of .docx/.xlsx/.pdf, and content search. Documents only, on your own server. Apache-2.0, one Docker container. Part of Casual Office with Casual Sheets, Docs, PDF and Desktop.
```

Section order below. Reuse only classes from the site-map palette; the only NEW classes referenced are those defined in §6 (`--dochub*`, `--gradient-dochub`, `.chain*`).

### 3.1 HERO — Doc-Hub leads
Classes: `section.hero.hero--tight` → `.container.hero__inner.reveal`. Wrap the whole hero inner with the Doc-Hub theme so buttons/dots read indigo:
`<div class="container hero__inner reveal" style="--product-accent: var(--dochub); --product-accent-soft: var(--dochub-soft);">`

- `.badge` (with `.eyebrow__dot`): `Casual Office · Doc-Hub · Apache-2.0`
- `h1.display.display--xl`:
  ```
  Documents you can trust.
  <em class="display__grad">History you can prove.</em>
  ```
- `p.lede.lede--tight`:
  ```
  Doc-Hub is an open-source, self-hosted document hub — an encrypted, tamper-evident registry for the documents your team can't afford to lose or leak. Every save appends a hash-chained version you can verify; every file is encrypted at rest; and you edit .docx, .xlsx and .pdf natively, right in the browser. Documents only, on your own server.
  ```
- `.row.row--centered`:
  - `a.btn.btn--primary.btn--lg` → href `https://dochub.casualoffice.org/demo`, `rel="noopener" target="_blank"` — label `Try the live demo →`
  - `a.btn.btn--ghost.btn--lg` → href `#docker` — label `Self-host in 30 seconds`
- `.trust` (4 items, first is `.trust__item--live`):
  ```
  <span class="trust__item trust__item--live"><span class="trust__dot"></span> Hash-chained, tamper-evident history</span>
  <span class="trust__item">Encrypted at rest · AES-256-GCM</span>
  <span class="trust__item">Self-host · one Docker container</span>
  <span class="trust__item">Apache-2.0</span>
  ```
  > No test-count or version pill here — Doc-Hub has no tagged release. Keep pills capability-based.

### 3.2 LIVE DEMO — Doc-Hub primary, editors as tabs
Reuse the existing `section.demo#demo` / `.demo__head` / `.demo__tabs` / `.frame` / `.frame__panel` machinery **verbatim in structure**; only change tab set, accents, addresses, and iframe `data-src`. Three tabs: Doc-Hub (default/active), Casual Sheets, Casual Docs.

- Tab 1 `data-demo="dochub"`, dot `background: var(--dochub)`, label `Doc-Hub`, pill `registry`. Frame accent `var(--dochub)`. Address `dochub.casualoffice.org`. `iframe data-src="https://dochub.casualoffice.org/demo"`, load-button copy `Load the live Doc-Hub demo` / sub `Opens the real registry — a few MB of app`. Pop-out `Open Doc-Hub full-screen ↗` → `https://dochub.casualoffice.org/demo`.
- Tab 2 `data-demo="sheets"`, dot `var(--sheets)`, label `Casual Sheets`, pill `.xlsx`, address `sheet.casualoffice.org`, `data-src="https://sheet.casualoffice.org/?embed=1"`.
- Tab 3 `data-demo="editor"`, dot `var(--editor)`, label `Casual Docs`, pill `.docx`, address `docs.casualoffice.org`, `data-src="https://docs.casualoffice.org/?embed=1"`.
- Update the inline tab-switcher JS `panels` map + `FRAME_ACCENTS` to include `dochub: 'var(--dochub)'` and the `dochub` panel id.
- `.demo__hint`:
  ```
  The real registry, not a screenshot. Upload a document, edit it in place, and watch the version chain grow — every save is a new, hash-chained version.
  ```

### 3.3 STATS BAR — capability facts (no fake numbers)
Classes: `section.section.section--stats` → `.container` → `.statline.reveal` with 4 `.stat`. Replace version-based stats with capability facts (all defensible from README):
```
.stat 1 → label "AT REST"      · value "AES-256"   · hint "GCM envelope · per-workspace keys"
.stat 2 → label "HISTORY"      · value "append-only" · hint "hash-chained · tamper-evident"
.stat 3 → label "FORMATS"      · value "9 types"   · hint ".docx .xlsx .pdf .md .txt .csv .json .yaml"
.stat 4 → label "LICENSE"      · value "Apache-2.0" · hint "self-host · one container"
```
> `.pptx` is on the ingest allowlist too (10 tokens), but the hint lists the 9 shown in the README lead; keep as written or say "documents only". Do not add a coverage percentage.

### 3.4 REGISTRY NARRATIVE — the 6 pillars (condensed)
Classes: `section.section` (`aria-labelledby="pillars-h"`) → `.section__head.reveal` (`.eyebrow` + `.title` + `.section__hint`) → `.feature-grid` of 6 `article.feature.reveal` (emoji `.feature__icon`; alternate `data-reveal-delay="1"` on cards 2/4/6).

`.eyebrow`: `why a hub, not a folder`
`.title` (`id="pillars-h"`): `Six things a folder can't do.`
`.section__hint`: `/pillars`

Cards (icon · title · body — verbatim):
1. 🔗 **History you can't rewrite** — Every save appends a new, hash-chained version. Old versions are never overwritten and never hard-deleted — only tombstoned under retention. Alter any past byte and verification fails. A registry, not a folder.
2. 🔐 **Encryption you control** — Every document is encrypted at rest with AES-256-GCM envelope encryption — per-workspace keys wrapped by a master key you supply — and TLS in transit. A stolen disk or database dump is just ciphertext.
3. ✍️ **Edit natively, in place** — Click a `.docx` and it opens in embedded Casual Docs; a `.xlsx` in Casual Sheet; a `.pdf` in Casual PDF — inside the hub, with real-time co-editing. Every save lands as a new version.
4. 🔎 **Search inside documents** — Full-text search reads the *content* of every document, not just filenames, via the `core` extraction engine and a Tantivy index. An optional AI layer adds semantic search, summaries and cross-document Q&A.
5. 📜 **A record you can prove** — Append-only, hash-chained audit log; retention policies; legal hold; document signing and provenance (Ed25519); exportable, offline-verifiable audit and retention reports. Built in, not an add-on.
6. 🗄️ **Owned, accountable, durable** — Team projects with Owner/Admin/Member roles, magic-link invites and atomic ownership transfer — plus a private, DigiLocker-style personal locker. One Rust binary in one Docker container.

### 3.5 PRODUCT LINEUP — all products, Doc-Hub first
Classes: `section.section` → `.section__head.reveal` → `.products.reveal` grid of `<ProductCard>` (6 cards).

`.eyebrow`: `one hub, four editors, one desktop`
`.title`: `The registry, and everything that edits inside it.`
`.section__hint`: `/products`

Cards (props verbatim; `slug` must be added to the union per §6/§8):

**Card 1 — Doc-Hub (flagship, indigo):**
```
slug="dochub"
name="Doc-Hub"
role="ENCRYPTED, TAMPER-EVIDENT DOCUMENT REGISTRY"
body="The flagship. An encrypted, self-hosted registry where documents are versioned forever in a hash-chained history you can prove, searchable by content, and edited natively in the browser. Documents only. Server-trusted, honestly not zero-knowledge E2E."
features={[
  'Hash-chained, append-only version history',
  'AES-256-GCM at rest · per-workspace keys',
  'Native embedded editing + real-time co-editing',
  'Audit log · retention · legal hold · signing',
]}
status="self-hostable · mid-revamp from Casual Drive"
href="/doc-hub/"
accent="var(--dochub)"
accentSoft="var(--dochub-soft)"
```

**Card 2 — Casual Sheets** (unchanged from current homepage):
```
slug="sheets" name="Casual Sheets" role="EXCEL-FLAVORED WEB SPREADSHEET"
body="Open .xlsx, .ods, .csv, .tsv. Real-time co-editing, pivot tables with drill-down, 8 chart types with trendlines, sparklines, version history, and .xlsm macro passthrough that round-trips byte-equal."
features={['.xlsx · .ods · .csv · .tsv round-trip','Pivot tables · 8 chart types · sparklines','Real-time via Yjs + Hocuspocus','Self-host: memory · local · S3 · Postgres']}
status="v0.3.3 · 398 e2e" href="/casual-sheets/" accent="var(--sheets)" accentSoft="var(--sheets-soft)"
```

**Card 3 — Casual Docs** (unchanged):
```
slug="editor" name="Casual Docs" role="WORD-FLAVORED .DOCX EDITOR"
body="Open .docx in the browser with WYSIWYG fidelity. Fork of eigenpal/docx-editor on top of ProseMirror with an OOXML-preserving model. The stateless Go gateway speaks the y-websocket protocol in roughly 120 lines."
features={['.docx round-trip · 39/39 fixtures pristine','ProseMirror + OOXML model · page color · table fidelity','Yjs + Go y-websocket gateway','Co-edit verified end-to-end (smoke + tests)']}
status="public preview · npm SDK v1.1.7" href="/casual-docs/" accent="var(--editor)" accentSoft="var(--editor-soft)"
```

**Card 4 — Casual PDF** (unchanged; keep "v1 in progress", never "shipped"):
```
slug="pdf" name="Casual PDF" role="HIGH-FIDELITY PDF VIEWER + EDITOR"
body="View, annotate, e-sign, and redact PDFs in the browser with one PDFium engine across web and desktop. Real-time text editing, certified PKCS#7 digital signing, true byte-level redaction, form filling, and page operations."
features={['One PDFium engine — web + desktop, identical fidelity','Annotate · forms · in-place text edit · page ops','E-sign (visible stamp) + PKCS#7 certified signing','True byte-level redaction (rasterize + flatten)']}
status="v1 in progress · live at pdf.casualoffice.org" href="/casual-pdf/" accent="var(--pdf)" accentSoft="var(--pdf-soft)"
```

**Card 5 — Casual Desktop** (unchanged):
```
slug="desktop" name="Casual Desktop" role="TAURI BINARIES · macOS · LINUX · WINDOWS"
body="A native binary for macOS, Linux, and Windows that reuses the Casual Docs and Casual Sheets web cores verbatim. Single-user, offline, with signed in-app auto-update. The local-only editing lane of the suite."
features={['Tauri shell · reuses the web cores','Local-only · no account, no cloud, no telemetry','Edit .docx / .xlsx / .md / .csv on your machine','Signed in-app auto-update']}
status="available · v0.0.6" href="/casual-desktop/" accent="var(--desktop)" accentSoft="var(--desktop-soft)"
```

**Card 6 — Casual Slides** (unchanged; no single fidelity number, note domain honestly):
```
slug="slides" name="Casual Slides" role="POWERPOINT-FLAVORED WEB SLIDES"
body="Open .pptx in the browser with deep OOXML fidelity. Office-style ribbon, slide-panel thumbnails, layout templates, theme pickers, Slide Show mode. Single-editor today; real-time co-editing is a later target."
features={['.pptx round-trip · OOXML fidelity','Office ribbon · layouts · themes · backgrounds','Tables · charts · text outline · effects','Fork-and-patch on Univer Slides OSS']}
status="v0.1.0 · demo on schnsrw.live" href="/casual-slides/" accent="var(--slides)" accentSoft="var(--slides-soft)"
```
> `.products` grid is 3-col → 1-col ≤820px; six cards fill two rows cleanly.

### 3.6 COMPLIANCE / REGISTRY GUARANTEES — caps checklist
Classes: `section.section` (`aria-labelledby="guarantees-h"`) → `.section__head.reveal` (`.badge` + `.title` + `.section__hint`) → `.caps` with 4 `.caps__col.reveal` (each `.caps__head` sets `--product-accent`; give cols 2/3/4 `data-reveal-delay="1|2|3"`).

`.badge`: `What Doc-Hub guarantees`
`.title` (`id="guarantees-h"`): `Built for records that have to hold up.`
`.section__hint`: `/guarantees`

Columns (head `--product-accent` · label · tag · list items):
- **Col 1** `--product-accent: var(--dochub)` · `History` · tag `chain` · items: `Every save = a new version` · `SHA-256 hash chain, verifiable` · `Restore-as-new — nothing destroyed` · `Diff any two versions` · `Export the provenance chain`
- **Col 2** `--product-accent: var(--dochub)` · `Encryption` · tag `at rest` · items: `AES-256-GCM envelope encryption` · `Per-workspace data keys` · `Master KEK or external KMS` · `Encrypted BYO-bucket credentials` · `Boot refuses to start without a key`
- **Col 3** `--product-accent: var(--editor)` · `Compliance` · tag `audit` · items: `Append-only, hash-chained audit log` · `Retention policies · legal hold` · `Document signing + provenance (Ed25519)` · `Exportable audit & retention reports` · `Two-origin, isolated share links`
- **Col 4** `--product-accent: var(--sheets)` · `Search + AI` · tag `content` · items: `Full-text search inside documents` · `core extraction + Tantivy index` · `Optional AI: semantic search & Q&A` · `PII / entity detection` · `Local-model option for air-gapped installs`

### 3.7 WHAT IT IS / WHAT IT ISN'T — honest block
Classes: `section.section` (`aria-labelledby="honest-h"`) → `.section__head.reveal` (`.eyebrow` + `.title` + `.section__hint`) → `.caps` grid with **2** `.caps__col.reveal`, then a `.callout` under the grid for the E2E honesty line.

`.eyebrow`: `no overclaiming`
`.title` (`id="honest-h"`): `What Doc-Hub is — and what it isn't.`
`.section__hint`: `/honest`

- **Col 1 — What it is** (`.caps__head` `--product-accent: var(--dochub)`, label `What it is`, tag `scope`):
  - A focused document registry — encrypted, versioned, provable
  - Documents only: `.docx .xlsx .pptx .pdf .md .txt .csv .json .yaml`
  - Native in-browser editing with real-time co-editing
  - Self-hosted: SQLite on a `$5` VPS, or Postgres + S3/MinIO/R2/B2 at scale
  - Owned, accountable, durable — on your own server
- **Col 2 — What it isn't** (`.caps__head` `--product-accent: var(--pdf)`, label `What it isn't`, tag `honest`):
  > For the "isn't" column, keep the `.caps__list` checkmark styling — each line is an honest boundary, still true statements.
  - Not general cloud storage — no Drive/Dropbox clone
  - Not zero-knowledge E2E — the server holds keys by design
  - Not a media library, sync client, mailbox or calendar
  - No video, no archives, no arbitrary binaries
  - Not a managed SaaS — you run it yourself
- `.callout` (below the grid):
  ```
  Honest about the trade-off: the server holds keys so it can index and reason over your document content. That means encryption defeats a stolen disk or a database dump — not a fully compromised, trusted server. We state this plainly rather than market "end-to-end."
  ```

### 3.8 SELF-HOST QUICKSTART — the real docker run
Classes: `section.section#docker` → `.section__head.reveal` (`.eyebrow` `self-host` + `.title` + `.section__hint` `docker`) → `pre.code-block` (emit via `set:html={dockerRun}`) → `.row` of 3 `.btn--ghost` doc links.

`.title`: `From zero to a running hub in one command.`

Frontmatter constant `dockerRun` (raw HTML string, emitted with `set:html` so `${VAR}` and `<>` are literal — mirror the existing `composeYml` pattern, HTML-escaped):
```js
const dockerRun = `<code>docker run -d --name hub \\
  -p 8080:8080 \\
  -v $HOME/dochub-data:/data \\
  -e DOCHUB_BIND=0.0.0.0:8080 \\
  -e DOCHUB_APP_ORIGIN=https://hub.your-server \\
  -e DOCHUB_USERCONTENT_ORIGIN=https://usercontent-dochub.your-server \\
  -e DOCHUB_STORAGE_BACKEND=fs \\
  -e DOCHUB_FS_ROOT=/data \\
  -e DOCHUB_MASTER_KEY=&lt;32-byte base64 KEK&gt; \\
  ghcr.io/casualoffice/dochub:latest</code>`;
```
Caption line under the block (plain `<p class="modes__note">`):
```
Boot refuses to start without DOCHUB_MASTER_KEY (or a configured KMS), and in production if the app and user-content origins are equal. Encryption is not optional.
```
`.row` buttons:
- `a.btn.btn--ghost` → `https://dochub.casualoffice.org/docs/install` (`rel="noopener" target="_blank"`) — `Install guide →`
- `a.btn.btn--ghost` → `https://dochub.casualoffice.org/docs/configuration` (`rel="noopener" target="_blank"`) — `Env-var reference`
- `a.btn.btn--ghost` → `/doc-hub/` — `Doc-Hub product page`

### 3.9 FAQ — honest, Doc-Hub forward
Classes: `section.section` → `.section__head.reveal` (`.eyebrow` `questions` + `.title` `Common questions.` + `.section__hint` `/faq`) → `.faq.reveal` → `faqs.map` → `details.faq__item` / `summary.faq__q` / `div.faq__a`. Same FAQPage JSON-LD push (§7). Replace `faqs` with:

```js
const faqs = [
  { q: 'What is Doc-Hub, in one sentence?',
    a: 'An open-source, self-hosted document hub — an encrypted, tamper-evident registry for the documents your team can\'t afford to lose or leak, with a hash-chained history you can prove and native in-browser editing.' },
  { q: 'Is Doc-Hub end-to-end encrypted?',
    a: 'No, and we say so plainly. Documents are encrypted at rest with AES-256-GCM envelope encryption and in transit with TLS, but the server holds the keys by design so it can index and reason over your content. That defeats a stolen disk or database dump — not a fully compromised, trusted server. It is not zero-knowledge E2E.' },
  { q: 'What does "hash-chained history" actually mean?',
    a: 'Every saved version stores the SHA-256 hash of its ciphertext plus the previous version\'s hash, forming a chain. Old versions are never overwritten or hard-deleted — only tombstoned under retention rules. Re-running the chain verifies it; alter any past byte and verification fails. Restore brings a prior version back as a new version, so nothing is ever destroyed.' },
  { q: 'What file types can I put in it?',
    a: 'Documents only. The ingest allowlist is authoritative: .docx, .xlsx, .pptx, .pdf, .md, .txt, .csv, .json and .yaml, enforced by extension and magic-byte sniff on every upload. No video, no images-as-primary, no archives, no arbitrary binaries. The narrow scope is what lets us encrypt, index and version everything.' },
  { q: 'How do the editors fit in?',
    a: 'They live inside the hub. Click a .docx and it opens in embedded Casual Docs, a .xlsx in Casual Sheet, a .pdf in Casual PDF — with real-time co-editing. Bytes decrypt into the editor and every save appends a new version. The same editors also ship standalone, and Casual Desktop is the local-only lane.' },
  { q: 'Do I need Postgres and S3?',
    a: 'No. Doc-Hub runs as a single Rust binary in one Docker container. SQLite plus the local filesystem is enough for a $5 VPS; Postgres with S3/MinIO/R2/B2 is there when you need to scale. Pick your backend with env vars.' },
  { q: 'What about compliance and audit?',
    a: 'Built in, not an enterprise add-on: an append-only, hash-chained audit log, retention policies, legal hold, document signing and provenance (Ed25519), and exportable, offline-verifiable audit and retention reports.' },
  { q: 'Is there AI, and does it phone home?',
    a: 'AI is optional and pluggable. It adds semantic search, summaries, PII/entity detection and cross-document Q&A. You bring your own provider, and there is a local-model option for air-gapped installs. Nothing is sent anywhere you did not configure.' },
  { q: 'How does Doc-Hub relate to Casual Drive?',
    a: 'Doc-Hub is the revamp of the former "Casual Drive" — from a storage Drive into a focused, encrypted document registry. The rename to dochub-* / DOCHUB_* names is in progress; there is no tagged release yet. It is in-transition, and we label it that way.' },
];
```

### 3.10 ECHO CTA
Classes: `section.section.section--echo` → `.container.container--narrow.reveal`.
- `.badge`: `Our goal`
- `h2.display.display--small`: `Documents you<br/><em class="display__grad">own, not rent.</em>`
- `.lede`:
  ```
  A place to keep the documents that matter — encrypted, versioned forever, and provable — on your own server, under a license that can't be revoked. Built like infrastructure, not a SaaS: focused, self-hosted, and honest about its limits.
  ```
- `.row` buttons:
  - `a.btn.btn--primary` → `https://dochub.casualoffice.org/demo` (`rel="noopener" target="_blank"`) — `Try the live demo →`
  - `a.btn.btn--ghost` → `https://github.com/CasualOffice/dochub` (`rel="noopener" target="_blank"`) — `Doc-Hub on GitHub`
  - `a.btn.btn--ghost` → `#docker` — `Self-host`
- `.row.gap-sm` chips: `Encrypted at rest` · `Versioned forever` · `Tamper-evident` · `Apache-2.0`

---

## 4. DOC-HUB PRODUCT PAGE — `/doc-hub/`

New file `src/pages/doc-hub/index.astro`, wrapped `<Base {title} {description} active="dochub" jsonLd={jsonLd}>`. Set the page theme once on the top wrapper so accents read indigo:
`<div style="--product-accent: var(--dochub); --product-accent-soft: var(--dochub-soft); --group-accent: var(--dochub);">` around the page body (or set per-section as needed).

**`title`:** `Doc-Hub — encrypted, self-hosted document registry · Casual Office`
**`description`:** `Doc-Hub is an open-source, self-hosted document hub: an encrypted, tamper-evident registry with hash-chained version history you can prove, AES-256-GCM encryption at rest, native in-browser editing, content search, and built-in audit, retention and legal hold. Documents only. One Docker container, Apache-2.0.`

### 4.1 HERO
Classes: `section.subpage` → `.container.reveal`.
- `.subpage__topline`: `<span class="dot" style="background: var(--dochub)"></span> Casual Office · Doc-Hub`
- `h1.display`: `A registry, <em class="display__grad">not a folder.</em>`
- `p.lede`:
  ```
  Doc-Hub keeps the documents your team can't afford to lose or leak: encrypted at rest, versioned forever in a hash-chained history you can prove, and edited natively in the browser. Documents only, self-hosted on your own server. Server-trusted — honestly not zero-knowledge E2E.
  ```
- `.trust.trust--start` (left-aligned variant): items
  ```
  <span class="trust__item">Apache-2.0 licensed</span>
  <span class="trust__item">Encrypted at rest</span>
  <span class="trust__item">Single binary, Docker-ready</span>
  ```
- `.row` buttons:
  - `a.btn.btn--accent` (per-product gradient reads `--product-accent`) → `https://dochub.casualoffice.org/demo` (`rel="noopener" target="_blank"`) — `Try the live demo →`
  - `a.btn.btn--ghost` → `#self-host` — `Self-host in 30 seconds`
  - `a.btn.btn--ghost` → `https://github.com/CasualOffice/dochub` (`rel="noopener" target="_blank"`) — `GitHub`

### 4.2 THE 6 PILLARS — feature cards
Classes: `section.section` (`aria-labelledby="pillars-h"`) → `.section__head.reveal` → `.feature-grid` of 6 `article.feature.reveal`.
`.eyebrow`: `six pillars` · `.title` (`id="pillars-h"`): `What makes it a hub.` · `.section__hint`: `/pillars`

Use the SAME 6 pillar cards (icon · title · body) as §3.4 (identical copy). This is the canonical, fuller placement; homepage §3.4 mirrors it.

### 4.3 HOW HISTORY WORKS — hash-chain explainer
Classes: `section.section` (`aria-labelledby="chain-h"`) → `.section__head.reveal` (`.eyebrow` `append-only` + `.title` + `.section__hint`) → `.chain.reveal` (NEW component, §6) → a trailing `.modes__note` caption.

`.title` (`id="chain-h"`): `How the history you can't rewrite works.`
`.section__hint`: `/history`

`.chain` markup (uses §6 classes; three nodes = three versions):
```html
<ol class="chain">
  <li class="chain__link">
    <span class="chain__step">v1</span>
    <div class="chain__body">
      <div class="chain__title">First save</div>
      <p class="chain__note">The document is encrypted, stored write-once, and stamped with <code>content_hash = SHA-256(ciphertext)</code>. <code>prev_hash</code> is empty — this is the root.</p>
    </div>
  </li>
  <li class="chain__link">
    <span class="chain__step">v2</span>
    <div class="chain__body">
      <div class="chain__title">Every edit appends</div>
      <p class="chain__note">A save never overwrites. It writes a new version whose <code>prev_hash</code> points at v1's <code>content_hash</code>, extending the chain. Restore brings an old version back — as a new version.</p>
    </div>
  </li>
  <li class="chain__link">
    <span class="chain__step">v3</span>
    <div class="chain__body">
      <div class="chain__title">Verify, end to end</div>
      <p class="chain__note">Re-computing the chain proves it. Change any past byte and a link breaks — surfaced as a tamper alarm, never silently repaired. The audit log is itself append-only and hash-chained.</p>
    </div>
  </li>
</ol>
```
`.modes__note` caption:
```
Nothing is ever hard-deleted. "Delete" sets a tombstone under retention and legal-hold rules; bytes under hold are never removed. That is the product, not a setting.
```

### 4.4 SELF-HOST — install block
Classes: `section.section#self-host` → `.section__head.reveal` (`.eyebrow` `self-host` + `.title` + `.section__hint` `docker`) → `pre.code-block` (`set:html={dockerRun}`, same constant as §3.8) → `.modes__note` (same "Boot refuses to start…" caption as §3.8) → `.row` of `.btn--ghost` links to `https://dochub.casualoffice.org/docs/install` and `https://dochub.casualoffice.org/docs/configuration`.

`.title`: `One binary. One container. One key.`

### 4.5 HONEST LIMITS
Classes: `section.section` (`aria-labelledby="limits-h"`) → `.section__head.reveal` (`.eyebrow` `honest limits` + `.title` + `.section__hint` `/limits`) → `.feature-grid` of 3 `article.feature.reveal` → trailing `.callout`.

`.title` (`id="limits-h"`): `Where Doc-Hub draws the line.`

Feature cards (icon · title · body):
1. 🔓 **Not zero-knowledge E2E** — The server holds keys by design so it can index and reason over document content. Encryption defeats a stolen disk or database dump — not a fully compromised, trusted server. We state this plainly.
2. 📄 **Documents only** — The MIME allowlist is authoritative: `.docx .xlsx .pptx .pdf .md .txt .csv .json .yaml`. No video, no media libraries, no archives, no arbitrary binaries. The narrow scope is the point.
3. 🚫 **Not general cloud storage** — Not a Drive or Dropbox clone, not a sync client, not a mailbox or calendar. A focused document registry — encrypted, versioned, provable.

`.callout`:
```
We're not the best at everything — we're the best at being a small, sharp, self-hosted hub that keeps your documents encrypted, versioned forever, and provable. Not a Drive clone, not a Nextcloud fork.
```

### 4.6 CTA
Classes: `section.section.section--echo` → `.container.container--narrow.reveal`.
- `.badge`: `Doc-Hub`
- `h2.display.display--small`: `Keep the documents you<br/><em class="display__grad">can't afford to lose.</em>`
- `.lede`:
  ```
  Encrypted at rest, versioned forever, provable — on your own server, under Apache-2.0. Try the live registry, or self-host it in a single command.
  ```
- `.row` buttons: `a.btn.btn--accent` → `https://dochub.casualoffice.org/demo` `Try the live demo →` · `a.btn.btn--ghost` → `#self-host` `Self-host` · `a.btn.btn--ghost` → `https://github.com/CasualOffice/dochub` `GitHub`
- `.row.gap-sm` chips: `Hash-chained history` · `AES-256-GCM` · `Audit · retention · legal hold` · `Apache-2.0`

---

## 5. Nav + Footer spec

### 5.1 Nav (`src/components/Nav.astro`)
- Extend `ActiveLink` union (already has `'pdf'`) with `'dochub'`.
- New `links` array (Doc-Hub first, primary):
```ts
const links: { slug: ActiveLink; label: string; href: string }[] = [
  { slug: 'dochub', label: 'Doc-Hub',  href: '/doc-hub/' },
  { slug: 'sheets', label: 'Sheets',   href: '/casual-sheets/' },
  { slug: 'editor', label: 'Docs',     href: '/casual-docs/' },
  { slug: 'pdf',    label: 'PDF',      href: '/casual-pdf/' },
  { slug: 'desktop',label: 'Desktop',  href: '/casual-desktop/' },
  { slug: 'docs',   label: 'Guides',   href: '/docs/' },
  { slug: 'changelog', label: 'Changelog', href: '/changelog/' },
];
```
> Dropped `Notes` from the primary bar to keep it to 7 items with Doc-Hub added (Notes stays in the footer). If the team prefers to keep Notes, it still collapses fine on mobile — implementer's call, but 7 is the tidy target.
- `.nav__star` href stays `https://github.com/CasualOffice` (the org).
- No structural/JS/CSS changes to the nav component.

### 5.2 Footer (`src/components/Footer.astro`)
- `.foot__tag` → rewrite to Doc-Hub-forward pitch:
  ```
  Open-source, self-hosted document software you own instead of rent. Doc-Hub is the encrypted, tamper-evident registry at its center; Casual Sheets, Docs and PDF are the editors that live inside it.
  ```
- `.foot__signals` pills → `Apache-2.0` · `Encrypted at rest` · `Self-hostable` · `Built in the open`
- **Products** column links (Doc-Hub first, add PDF):
```ts
{ title: 'Products', links: [
  { label: 'Doc-Hub',        href: '/doc-hub/' },
  { label: 'Casual Sheets',  href: '/casual-sheets/' },
  { label: 'Casual Docs',    href: '/casual-docs/' },
  { label: 'Casual PDF',     href: '/casual-pdf/' },
  { label: 'Casual Slides',  href: '/casual-slides/' },
  { label: 'Casual Desktop', href: '/casual-desktop/' },
]},
```
- **Resources** column unchanged: Guides `/docs/`, Changelog `/changelog/`, Engineering notes `/notes/`, Comparisons `/vs/`.
- **Project** column unchanged: About `/about/`, Contributing `/contributing/`, License `/license/`, GitHub `https://github.com/CasualOffice`.
- `.foot__gh` label/href unchanged (`Star the org on GitHub →`, org URL).
- `.foot__bottom` unchanged.

---

## 6. NEW design tokens + classes (foundation implementer adds EXACTLY these)

Append to `src/styles/global.css`. **These are the only additions;** page implementers must reuse everything else from the existing palette.

### 6.1 Tokens — add inside `:root` (next to the other per-product accents)
```css
  /* Doc-Hub — vault indigo. Cool anchor to the warm brand gradient;
     "trust / registry / security" identity. Pulled to the indigo-700
     line to match the sheets/editor/pdf legibility-on-white convention. */
  --dochub: #4338ca;         /* indigo-700 */
  --dochub-light: #818cf8;   /* indigo-400 */
  --dochub-soft: rgba(67, 56, 202, 0.08);
```
And add to the premium/gradient block (next to `--gradient-pdf`):
```css
  --gradient-dochub: linear-gradient(120deg, #4338ca, #7c3aed); /* indigo → violet, ties into the brand gradient's cool end */
```
> Contrast: `#4338ca` on `#ffffff` is ~8.3:1 (AA/AAA for text); white on `#4338ca` is ~8.3:1 — safe for `.btn--accent` fills and `.product__dot`. `--dochub-light` is decorative only (dots/glows), never text on white.

### 6.2 NEW component — `.chain` hash-chain explainer (used on `/doc-hub/` §4.3)
Add near the other page components. On-system: uses existing tokens, radii, fonts, motion, reduced-motion.
```css
/* ── Hash-chain explainer (Doc-Hub /history) ─────────────────────────── */
.chain {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 14px;
  counter-reset: chain;
}
.chain__link {
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 16px;
  align-items: start;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 20px 22px;
  transition: border-color var(--dur-2) var(--ease-out), box-shadow var(--dur-2) var(--ease-out), transform var(--dur-2) var(--ease-out);
}
.chain__link:hover {
  border-color: color-mix(in srgb, var(--dochub) 40%, var(--border-strong));
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}
/* Connecting "link" line between nodes — the visible chain. */
.chain__link:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 41px;              /* centered under .chain__step */
  bottom: -15px;
  width: 2px;
  height: 15px;
  background: color-mix(in srgb, var(--dochub) 55%, transparent);
}
.chain__step {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: var(--dochub-soft);
  color: var(--dochub);
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 13px;
  letter-spacing: -0.01em;
}
.chain__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 16px;
  color: var(--text);
  letter-spacing: -0.01em;
}
.chain__note {
  margin: 6px 0 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-soft);
}
.chain__note code {
  font-family: var(--font-mono);
  font-size: 0.86em;
}
@media (prefers-reduced-motion: reduce) {
  .chain__link { transition: none; }
  .chain__link:hover { transform: none; }
}
```
> That's the full extent of NEW CSS: 3 token lines + 1 gradient line + the `.chain*` block. No other new classes are permitted; everything else reuses `.feature-grid/.caps/.callout/.code-block/.trust/.btn/.product/.section*`.

### 6.3 Component prop change
`src/components/ProductCard.astro` — widen the `slug` union:
```ts
slug: 'dochub' | 'sheets' | 'editor' | 'slides' | 'desktop' | 'pdf';
```
No template change needed; `data-product="dochub"` plus the passed `--product-accent: var(--dochub)` styles the card automatically via the existing `.product` rules.

---

## 7. Structured data (jsonLd) plan

Homepage `jsonLd` graph — keep `Person` as-is; update `WebSite.description`; make Doc-Hub **position 1** in the `ItemList` and renumber the rest; keep the FAQPage push (built from the new `faqs`). Exact shapes:

**WebSite (updated `description`):**
```js
{
  '@type': 'WebSite',
  '@id': 'https://casualoffice.org/#website',
  url: 'https://casualoffice.org/',
  name: 'Casual Office',
  alternateName: 'casualoffice.org',
  description:
    'Open-source, self-hosted document software. Doc-Hub is an encrypted, tamper-evident document registry with hash-chained history; Casual Sheets, Docs and PDF are the editors inside it. Self-hostable, Apache-2.0.',
  publisher: { '@id': 'https://casualoffice.org/#person' },
  inLanguage: 'en',
}
```

**ItemList — new position 1 (Doc-Hub), existing entries shift to 2–5:**
```js
{
  '@type': 'ListItem',
  position: 1,
  item: {
    '@type': 'SoftwareApplication',
    '@id': 'https://dochub.casualoffice.org/#app',
    name: 'Doc-Hub',
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'DocumentManagementSystem',
    operatingSystem: 'Web Browser, Docker, Linux',
    url: 'https://dochub.casualoffice.org/',
    codeRepository: 'https://github.com/CasualOffice/dochub',
    license: 'https://www.apache.org/licenses/LICENSE-2.0',
    description:
      'Open-source, self-hosted document hub — an encrypted, tamper-evident registry with hash-chained version history, AES-256-GCM encryption at rest, native in-browser editing, content search, and built-in audit, retention and legal hold. Documents only.',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    author: { '@id': 'https://casualoffice.org/#person' },
  },
}
```
Then: Casual Sheets → `position: 2`, Casual Docs → `position: 3`, Casual Desktop → `position: 4`, Casual PDF → `position: 5` (identical `item` objects to the current file; only `position` changes). Update the `ItemList` `name` to `'Casual Office — Doc-Hub and editors'` (optional).

**Doc-Hub product page `/doc-hub/`** gets its OWN minimal graph (Person by `@id` reference + the same Doc-Hub `SoftwareApplication`, promoted to top-level, plus the FAQ if the page renders one). Reuse the position-1 `item` object above as the standalone `SoftwareApplication` node (drop the `ListItem` wrapper).

**FAQPage** push stays exactly as in the current `index.astro` (maps over the new `faqs` array):
```js
jsonLd['@graph'].push({
  '@type': 'FAQPage',
  '@id': 'https://casualoffice.org/#faq',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question', name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
});
```

Keep `Person` unchanged (id `https://casualoffice.org/#person`, name Sachin Sarwa, sameAs GitHub + Docker Hub).

---

## 8. Per-file WORK LIST

| File | Change |
|---|---|
| `src/styles/global.css` | **Add only:** `--dochub`, `--dochub-light`, `--dochub-soft` in `:root`; `--gradient-dochub` in the premium/gradient block; the `.chain*` component block (§6.2). Nothing else. |
| `src/components/ProductCard.astro` | Widen `slug` union to include `'dochub'` (§6.3). No template change. |
| `src/components/Nav.astro` | Add `'dochub'` to `ActiveLink`; replace `links` array with the §5.1 list (Doc-Hub first; Notes dropped from bar). |
| `src/components/Footer.astro` | Rewrite `.foot__tag`; update `.foot__signals`; add Doc-Hub + Casual PDF to the Products column (§5.2). Other columns unchanged. |
| `src/layouts/Base.astro` | Add `'dochub'` to the `active` union type. Update the default `description` + `keywords` to lead with "document hub / encrypted document registry / hash-chained / self-hosted / Doc-Hub" while keeping the editor keywords. (og default `/og.png` unchanged; add `/og-dochub.png` later — optional.) |
| `src/pages/index.astro` | **Rewrite** per §3: new `title`/`description`; new `jsonLd` (§7); replace `composeYml` usage with a new `dockerRun` constant (§3.8); new `faqs` (§3.9); rebuild all sections (hero, demo tabs incl. Doc-Hub + JS `panels`/`FRAME_ACCENTS` update, stats, pillars feature-grid, 6-card lineup incl. Doc-Hub, guarantees caps, is/isn't caps + callout, self-host, faq, echo). Keep existing inline `<style>` block (all classes still used); no new page-local CSS needed. |
| `src/pages/doc-hub/index.astro` | **CREATE** per §4: hero (`.subpage`), 6 pillar `.feature` cards, `.chain` hash-chain explainer, `.code-block` install (`dockerRun`), 3 honest-limit `.feature` cards + `.callout`, `.section--echo` CTA. `active="dochub"`, own jsonLd (§7). Reuse `dockerRun` string (duplicate the constant or factor into a shared module — implementer's call). |
| `src/pages/casual-sheets/index.astro`, `casual-docs/index.astro`, `casual-pdf/index.astro` | **Light edit:** add one `.subpage__topline`-adjacent line or a small `.callout`/link: `Also lives inside Doc-Hub → /doc-hub/`. No other copy change. |
| `src/pages/about/index.astro` | **Light edit:** 1–2 sentences naming Doc-Hub as the flagship/registry at the center of the suite. No metrics. |
| `astro.config.mjs` | **Optional:** add redirects `/casual-drive/`→`/doc-hub/`, `/drive/`→`/doc-hub/`. Sitemap: `/doc-hub/` inherits default priority; optionally bump to `0.9`/weekly alongside sheets/docs. |
| `public/robots.txt` / sitemaps | No change needed (sitemap integration auto-includes `/doc-hub/`). |
| `public/llms.txt` | **Optional but recommended:** update to lead with Doc-Hub, fix product list to the real lineup, use `dochub.casualoffice.org`. Out of critical path. |
| `public/og-dochub.png` | **Optional:** generate via `scripts/build-og.mjs` for `/doc-hub/` og:image; until then `/og.png` is fine. |
| `src/content/config.ts` | **Optional:** add `'dochub'` to `changelog`/`notes`/`vs` product enums only if Doc-Hub content is authored. |

**Do-not-touch / guardrails:** Do not invent CSS beyond §6. Do not add a Doc-Hub version badge or coverage number anywhere. Keep every honesty caveat from the header. Reuse `.trust`, `.btn`, `.product`, `.caps`, `.feature`, `.callout`, `.code-block`, `.section*`, `.display*`, `.badge`, `.eyebrow` exactly as they exist.
