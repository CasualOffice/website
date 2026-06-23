# Casual Office — Design System & Guidelines

The visual language for **casualoffice.org**. Direction: **premium open-source
product** — confident, modern, gradient-and-glow, but restrained enough to read
as serious and production-grade. Reference points: Linear / Vercel / Stripe, with
warmer brand color and a stronger gradient signature.

Everything here lives in `src/styles/global.css` (`:root` tokens + a base layer +
the **PREMIUM LAYER (v4)** at the bottom). Pages compose these tokens and utility
classes; they should rarely invent new colors, shadows, or easings.

---

## 1. Principles

1. **Serious, not flashy.** Motion and gradient are accents on a clean, readable
   base — never the whole show. White space does most of the work.
2. **Honest.** Numbers (test counts, fidelity, versions) are real and sourced from
   the product repos. No stock photos, no fake dashboards — the homepage embeds the
   actual live demos.
3. **One brand, three products.** The umbrella brand gradient (orange → magenta →
   violet) unifies; per-product accents (Sheets emerald, Docs violet, Slides teal,
   Desktop orange) identify.
4. **Accessible by default.** Color contrast, focus rings, reduced-motion, and
   keyboard paths are part of "done," not a later pass. Target **WCAG 2.1 AA**.

---

## 2. Color tokens

| Token | Value | Use |
|---|---|---|
| `--bg` | `#ffffff` | Page base |
| `--surface` / `--surface-2` / `--surface-3` | stone-50 → 200 | Elevation tints |
| `--border` / `--border-strong` | stone-200 / 300 | Hairlines, visible borders |
| `--text` / `--text-soft` / `--text-muted` / `--text-dim` | near-black → stone-400 | Headings → body → labels → placeholders |
| `--accent` / `--accent-strong` | orange-600 / 700 | Umbrella accent, links |
| `--sheets` `--editor` `--slides` `--desktop` | emerald / violet / teal / orange | Per-product accents |

**Gradients & glows (premium layer):**

- `--gradient-brand` — `110deg, #ea580c → #e11d8f → #7c3aed`. The signature. Used on
  primary buttons, `.display em` / `.display__grad` headline text, card top-accents,
  badges, the footer CTA.
- `--gradient-sheets|editor|slides|desktop` — per-product gradient pairs.
- `--glow-brand`, `--glow-accent`, `--shadow-glow` — colored shadows for depth.

> Per-product surfaces set `--product-accent` (and `--product-accent-soft`) on a
> wrapper; buttons, cards, and dots read from it, so one variable re-themes a section.

---

## 3. Typography

- **Manrope** — display headlines (`.display`, `.title`). Weights 700–800.
- **Inter** — all UI/body text. Weights 400–700. `font-feature-settings: 'cv11','ss03'`.
- **JetBrains Mono** — code, `kbd`, version chips, status pills, eyebrows, trust items.

Scale (fluid, `clamp()`):

| Class | Size | Role |
|---|---|---|
| `.display--xl` | 40 → 72px | Homepage hero H1 |
| `.display` | 44 → 80px | Product hero H1 |
| `.display--small` | 36 → 56px | Closing CTA |
| `.title` | 28 → 44px | Section H2 |
| `.heading` | 18px | Card/sub headings |
| `.lede` | 17–19px | Intro paragraphs |
| `.eyebrow` / `.badge` | 11–12px mono, uppercase | Section kickers |

Headline emphasis: wrap the key phrase in `<em>` or `.display__grad` to get the
animated brand-gradient text.

---

## 4. Spacing & layout

- `.container` — max 1160px, fluid gutters `clamp(20px, 5vw, 32px)`.
- `.container--narrow` — max 780px for prose / closing CTA.
- `.section` — `56px 0` vertical rhythm; consecutive sections get a hairline divider.
- Radii: `--radius` 10 · `--radius-lg` 16 · `--radius-xl` 24.
- Shadows: `--shadow-sm|md|lg` (neutral) and `--glow-*` (colored, for hover/CTA).

---

## 5. Components

- **Buttons** — `.btn` + `.btn--primary` (brand gradient + glow, lifts on hover),
  `.btn--accent` (per-product gradient), `.btn--ghost` (glass). `.btn--lg` for heroes.
- **Cards** — `.product`, `.feature`, `.why__card`, `.community__card`, `.caps__col`.
  Hover = `-6px` lift + colored glow + accent border. Top-accent bar uses the brand
  gradient.
- **Badge / chip** — `.badge` (gradient-soft pill, section kicker) · `.chip` (mono
  fact pill).
- **Trust strip** — `.trust` + `.trust__item` (glassy credibility pills). The live
  dot is `.trust__dot`. Use in heros to surface license / self-host / test signals.
- **Capability matrix** — `.caps` / `.caps__col` (per-product checklist columns).
- **Footer** — structured: brand + pitch + OSS signals on the left, three nav
  columns, a bottom legal/credit bar.

---

## 6. Page & hero templates

**Hero (homepage + product pages):**

```
section.hero[.hero--tight | .subpage]
  .container.hero__inner.reveal
    span.badge            ← kicker ("Open source · self-host · Apache-2.0")
    h1.display[--xl]      ← headline; key phrase in <em>/.display__grad
    p.lede                ← 2–3 sentences, keyword-rich, honest
    .row.row--centered    ← btn--primary + btn--ghost
    .trust                ← 3–4 credibility pills
```

**Section:**

```
section.section
  .container
    .section__head.reveal → (.badge or .eyebrow) + h2.title + .section__hint
    <grid of cards, each .reveal with optional data-reveal-delay="1|2|3">
```

Per-product pages set `style="--product-accent: var(--<product>)"` on the hero +
sections so the accent cascades.

---

## 7. Motion

- Tokens: `--ease-out`, `--ease-spring`, `--dur-1|2|3` (140 / 280 / 620ms).
- **Scroll-reveal:** add `.reveal` (and optional `data-reveal-delay`) to any block.
  An IntersectionObserver in `Base.astro` adds `.is-visible` on entry. Elements above
  the fold reveal immediately.
- **Ambient:** the `.aurora` mesh drifts; `.display em` gradient pans; the live dot
  pulses. Hovers lift + glow.
- **All motion is opt-out:** `@media (prefers-reduced-motion: reduce)` neutralises
  animations and reveals (content shows statically).

---

## 8. Accessibility (target WCAG 2.1 AA)

- Skip link (`.skip-link`) → `#main` landmark first in `<body>`.
- Visible focus: 2px accent outline via `:focus-visible` on all interactive elements.
- Mobile nav: real `<button>` with `aria-expanded` / `aria-controls`; Escape /
  outside-click / link-tap close; body scroll-lock while open.
- Decorative SVG/markers `aria-hidden`; meaningful icons have text labels.
- Honor `prefers-reduced-motion`. Don't encode meaning in color alone.
- Maintain ≥ 4.5:1 text contrast (≥ 3:1 for large text). The stone text ramp on
  white clears this; check any colored-on-colored combination before shipping.

---

## 9. SEO / AEO / GEO conventions

- **Titles** lead with the product + the high-intent phrase: *"Open-Source
  Self-Hosted Google Docs Alternative."*
- **`keywords` meta** per page via the `Base` `keywords` prop (search-intent phrases:
  "open source google docs alternative", "self-hosted collaborative editor", …).
- **Structured data** (`jsonLd` prop): `WebSite` + `Person` + `ItemList` of
  `SoftwareApplication`s on home, plus `FAQPage` (answer-engine friendly). Product
  pages carry their own `SoftwareApplication`.
- **Answer-shaped content:** an honest FAQ, a "Who it's for" section, and a "What we
  support" matrix give LLMs and search engines extractable, factual blocks.
- **`/vs/` comparison pages** target "alternative to X" long-tail queries; link to
  them from product pages and the footer.
- `public/robots.txt` opts in major AI crawlers by name; `public/llms.txt` carries a
  long-form, current project description. Keep both in sync with releases.

---

_When in doubt: reach for an existing token or utility class before adding a new one.
If a new pattern is genuinely needed, add it to the premium layer and document it here._
