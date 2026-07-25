# Casual Office — Design System & Guidelines

The visual language for **casualoffice.org**. Direction: a **dark-first,
open-source dev-tool** landing site — the energy of Supabase / Tauri / Zed /
Turso, on a premium graphite base. **Dark is the default "stage"** (glowing mesh
gradient over a faint grid); light is a fully-supported peer. One warm accent
(orange) is the umbrella signal and glows on the primary CTA, star badge, and
one gradient headline phrase — otherwise "color is an event." Per-product neon
hues (Sheets emerald, Docs violet, Slides teal, PDF rose, RAS indigo, Desktop
orange) stay sandboxed to chips, dots, markers, and card-hover glow.

Everything lives in `src/styles/global.css` — one coherent system named
**"Studio" (v6)**: `:root` / `:root.dark` tokens, base + components, then a
**DEV-TOOL LAYER** (glowing badges, copyable terminal blocks, gradient-glow
borders, cursor-spotlight cards, neon CTA glow). It replaced the earlier
gradient-heavy "premium v4" and "neobrutal paper v5" layers wholesale. Pages
compose these tokens and utility classes and should rarely invent new ones.

**Dark is the default.** `Base.astro` sets `.dark` on `<html>` pre-paint unless
the visitor has explicitly saved `light`. Design and check both themes.

---

## 1. Principles

1. **Whitespace first.** Hairline borders, soft diffuse shadows, big type, and
   air. Motion and the ambient hero glow are quiet accents on a clean base.
2. **Near-black is the primary; the accent is a highlight.** Primary buttons are
   near-black pills. Orange is reserved for links, small dots, focus rings, and
   the one gradient headline phrase.
3. **Honest.** Numbers (test counts, fidelity, versions) are real and sourced
   from the product repos. No stock photos, no fake dashboards — the homepage
   embeds the actual live demos.
4. **One brand, many products.** The umbrella is monochrome + orange; each
   product carries its own accent only in its chip/dot/markers.
5. **Accessible by default.** Contrast, focus rings, reduced-motion, and keyboard
   paths are part of "done." Target **WCAG 2.1 AA**.

---

## 2. Color tokens

Surfaces are clean neutral grays (the Apple `#f5f5f7` family); text is a cool
near-black ramp (`#1d1d1f` → `#86868b`); borders are light cool hairlines.

| Token | Light | Use |
|---|---|---|
| `--bg` / `--card` | `#ffffff` | Page + card base |
| `--surface` / `--surface-2` / `--surface-3` | `#f5f5f7` → `#e8e8ed` | Section washes, wells, code tint |
| `--border` / `--border-strong` | `#e6e6eb` / `#d2d2d7` | Hairlines / visible dividers |
| `--text` … `--text-dim` | `#1d1d1f` → `#86868b` | Headings → body → labels → tertiary |
| `--accent` / `--accent-strong` / `--accent-soft` | `#ea580c` / `#c2410c` / `#fff1e8` | Umbrella accent, links, tint fills |
| `--sheets` `--editor` `--slides` `--pdf` `--ras` `--desktop` | emerald / violet / teal / rose / indigo / orange | Per-product accents (+ `-soft` tint) |

**Dark ("Graphite Night")** is a first-class peer toggled by `.dark` on `<html>`
(pre-paint bootstrap in `Base.astro`, defaulted from `prefers-color-scheme`):
near-black neutral canvas `#0b0b0c`, borders lift off black, accents brighten.

The `--gradient-brand` (`135deg, orange → rose → violet`) is the **one** signature
gradient, used only on the emphasized headline phrase (`.display em` /
`.display__grad`) and a couple of opt-in glows. Everything else is flat.

Per-product surfaces set `--product-accent` (+ `--product-accent-soft`) on a
wrapper; buttons, cards, dots, and markers read from it, so one variable
re-themes a section.

---

## 3. Typography

**System / SF stack.** Display + UI use the native Apple stack, so text renders
in **SF Pro Display / SF Pro Text** on Apple devices and **Inter / system-ui**
elsewhere. No render-blocking web font above the fold.

- `--font-display` — `-apple-system, 'SF Pro Display', 'Inter', system-ui, …`
  (headlines). Weights 600–700, tight tracking.
- `--font-sans` — `-apple-system, 'SF Pro Text', 'Inter', system-ui, …` (all UI
  / body). Weights 400–550.
- `--font-mono` — **IBM Plex Mono** (self-hosted): code, `kbd`, version chips,
  status pills, eyebrows, `/section` hints.

Scale (fluid, `clamp()`), all with tight negative tracking:

| Class | Size | Role |
|---|---|---|
| `.display--xl` | 44 → 82px | Homepage hero H1 |
| `.display` | 40 → 76px | Product hero H1 |
| `.display--small` | 32 → 54px | Closing CTA |
| `.title` | 28 → 46px | Section H2 |
| `.heading` | 19px | Card / sub headings |
| `.lede` | 18 → 21px, `--text-muted` | Intro paragraphs |
| `.eyebrow` / `.badge` | 12px mono | Section kickers / pills |

Wrap the key headline phrase in `<em>` or `.display__grad` for the single brand
gradient. Keep it to **one** phrase per headline.

---

## 4. Spacing, radius, depth

- `.container` — max 1120px, fluid gutters `clamp(20px, 5vw, 32px)`;
  `.container--narrow` 760px for prose / closing CTA.
- `.section` — `72px 0` rhythm (`--tight` 48px); consecutive sections get a
  hairline divider. Section heads reserve ~40px below.
- Radii: `--radius-sm` 8 · `--radius` 12 · `--radius-lg` 18 · `--radius-xl` 28 ·
  `--radius-pill` 980 (buttons, chips, tabs are pills).
- Shadows are **soft, diffuse, multi-layer** (`--shadow-sm|md|lg|xl`) — never
  hard offsets. Cards rest on `--shadow-sm`, lift to `--shadow-md/lg` on hover.

---

## 5. Components

- **Buttons** — pill `.btn`. `.btn--primary` (near-black fill, lifts + softens on
  hover), `.btn--ghost` (glassy hairline), `.btn--accent` (per-product fill).
  `.btn--lg` / `--sm` for scale.
- **Cards** — `.product`, `.feature`, `.why__card`, `.community__card`,
  `.caps__col`, `.faq__item`. White, hairline border, `--shadow-sm`; hover =
  `translateY(-3/-4px)` + `--shadow-md/lg` + a touch of accent in the border.
  No colored top bars on the umbrella (product pages may opt in).
- **Badge / chip** — `.badge` (neutral pill kicker) · `.chip` (mono fact pill,
  soft shadow).
- **Trust strip** — `.trust` + `.trust__item` (glassy credibility pills, blurred
  background). The live dot is `.trust__dot` (pulsing emerald).
- **Capability matrix** — `.caps__col` per product; list items use a masked
  check glyph tinted by `--product-accent`.
- **Footer** — brand + pitch + OSS signal pills on the left, three nav columns,
  a bottom legal/credit bar. Near-black GitHub pill.

**Dev-tool layer** (the OSS-project energy):
- **`.dev-badges` / `.dev-badge`** — glassy badge row for the hero (GitHub-star
  pill `--star`, live dot, license, test count).
- **`.term`** — a terminal window (mac dots + title bar) wrapping a `$` command
  and a **copy button** (`[data-copy]` / `[data-copy-src]`, wired in the page
  script). Use for install / `docker run` one-liners.
- **`.glowframe`** — gradient-glow border wrapper (masked ring) for the demo
  window and hero visuals; adds an ambient glow in dark.
- **`.spot`** — cursor-following radial spotlight, tinted by `--product-accent`.
  The homepage script auto-applies it to all card types (`--mx` / `--my`).
- **Backdrop** — `.aurora` is the mesh-gradient glow + grid texture behind the
  fold (bold in dark, subtle in light), masked to fade out.

---

## 6. Page & hero templates

**Hero (homepage + product pages):**

```
section.hero[.hero--tight | .subpage]
  .container.hero__inner.reveal
    span.badge / .subpage__topline   ← kicker
    h1.display[--xl]                  ← headline; ONE phrase in <em>/.display__grad
    p.lede                            ← 2–3 sentences, keyword-rich, honest
    .row.row--centered                ← btn--primary + btn--ghost
    .trust                            ← 3–4 credibility pills
```

**Section:**

```
section.section
  .container
    .section__head.reveal → (.badge or .eyebrow) + h2.title + .section__hint (/route)
    <grid of cards, each .reveal with optional data-reveal-delay="1|2|3">
```

Per-product pages set `style="--product-accent: var(--<product>)"` on the hero +
sections so the accent cascades into buttons, dots, markers, and card hovers.

---

## 7. Motion

- Tokens: `--ease`, `--ease-out`, `--ease-spring`, `--dur-1|2|3` (140/240/560ms).
- **Scroll-reveal:** add `.reveal` (+ optional `data-reveal-delay`) to any block;
  an IntersectionObserver in `Base.astro` adds `.is-visible` (fade + 16px rise).
- **Ambient:** a whisper-soft warm mesh (`.aurora`) sits behind the fold, masked
  to fade out; the live dot pulses; cards and buttons lift on hover.
- **All motion is opt-out:** `@media (prefers-reduced-motion: reduce)`
  neutralizes animations and shows revealed content statically.

---

## 8. Accessibility (target WCAG 2.1 AA)

- Skip link (`.skip-link`) → `#main` landmark first in `<body>`.
- Visible focus: 2px accent outline via `:focus-visible` on all interactive
  elements.
- Mobile nav: real `<button>` with `aria-expanded` / `aria-controls`; Escape /
  outside-click / link-tap close; body scroll-lock while open.
- Decorative SVG/markers `aria-hidden`; meaningful icons carry text labels.
- Honor `prefers-reduced-motion`. Don't encode meaning in color alone.
- Maintain ≥ 4.5:1 text contrast (≥ 3:1 large). The cool text ramp on white/near
  black clears this; verify any colored-on-colored combination before shipping.

---

## 9. SEO / AEO / GEO conventions

- **Titles** lead with product + high-intent phrase: *"Open-Source Self-Hosted
  Google Docs Alternative."*
- **`keywords` meta** per page via the `Base` `keywords` prop.
- **Structured data** (`jsonLd` prop): `WebSite` + `Person` + `ItemList` of
  `SoftwareApplication`s on home, plus `FAQPage` (answer-engine friendly).
  Product pages carry their own `SoftwareApplication`.
- **Answer-shaped content:** an honest FAQ, a "Who it's for" section, and a
  "What we support" matrix give LLMs and search engines extractable blocks.
- **`/vs/` comparison pages** target "alternative to X" long-tail queries.
- `public/robots.txt` opts in major AI crawlers by name; `public/llms.txt`
  carries a long-form project description. Keep both in sync with releases.

> The redesign is presentational: it changes tokens, classes, and component
> styling only. Semantic headings, landmarks, JSON-LD, and meta tags are
> preserved — do not regress them when restyling.

---

_When in doubt: reach for an existing token or utility class before adding a new
one. If a new pattern is genuinely needed, add it to `global.css` and document
it here. Keep the frame monochrome; let color be the exception._
