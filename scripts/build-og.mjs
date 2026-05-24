#!/usr/bin/env node
/**
 * Build the four social preview images at `public/og*.png`:
 *
 *   - og.png          — Casual Office umbrella (home + about + license + …)
 *   - og-sheets.png   — Casual Sheets product page
 *   - og-editor.png   — Casual Editor product page
 *   - og-desktop.png  — Casual Desktop product page
 *
 * Each variant is 1200 × 630, the size every major social platform crops to.
 *
 * The site is pure static HTML; this script requires `@playwright/test`,
 * which the site has no node_modules for. Run from a sibling repo that
 * has Playwright installed (typically `../sheet/`). From `../sheet/`:
 *
 *   node ../site/scripts/build-og.mjs
 *
 * Re-run whenever the messaging changes. The PNGs are committed so the
 * GitHub Pages deploy doesn't need a build step for them.
 */
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const OUT_DIR = resolve(SITE_ROOT, 'public');
mkdirSync(OUT_DIR, { recursive: true });

// ── Templates ──────────────────────────────────────────────────────────────

function shellCss() {
  return /* css */ `
    :root {
      --bg: #fafaf7;
      --fg: #0f172a;
      --muted: #475569;
    }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    body {
      width: 1200px;
      height: 630px;
      background: var(--bg);
      color: var(--fg);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 64px 72px;
    }
    .aurora { position: absolute; inset: -10%; filter: blur(20px); pointer-events: none; }
    .topline { display: flex; align-items: center; gap: 14px; position: relative; z-index: 1; }
    .brand-mark {
      width: 56px; height: 56px;
      border-radius: 14px;
      display: inline-flex; align-items: center; justify-content: center;
      color: #fff;
      box-shadow: 0 8px 24px rgba(15, 23, 42, 0.20);
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .brand-mark svg { width: 32px; height: 32px; }
    .brand { font-size: 22px; font-weight: 700; letter-spacing: -0.01em; }
    .domain { font-size: 16px; color: var(--muted); margin-left: auto; font-weight: 500; }

    .main { position: relative; z-index: 1; max-width: 1020px; }
    h1 {
      font-size: 80px; font-weight: 800; line-height: 1.02; margin: 0 0 18px;
      letter-spacing: -0.025em;
      color: var(--fg);
    }
    h1 .accent { color: var(--accent-color, #0f172a); }
    p.tagline {
      font-size: 26px; line-height: 1.36; margin: 0 0 28px; color: var(--muted);
      max-width: 980px;
      font-weight: 500;
    }

    .pills { display: flex; gap: 10px; flex-wrap: wrap; }
    .pill {
      padding: 10px 16px;
      border-radius: 999px;
      background: rgba(255,255,255,0.72);
      border: 1px solid rgba(15, 23, 42, 0.12);
      font-weight: 600;
      font-size: 15px;
      backdrop-filter: blur(6px);
    }

    .products {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
      margin-top: 6px;
    }
    .product {
      padding: 14px 16px;
      border-radius: 12px;
      background: rgba(255,255,255,0.78);
      border: 1px solid rgba(15, 23, 42, 0.06);
      backdrop-filter: blur(8px);
    }
    .product__dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 8px; vertical-align: middle; }
    .product__name { font-weight: 700; font-size: 18px; }
    .product__sub { font-size: 13px; color: var(--muted); margin-top: 2px; }

    .foot {
      position: relative; z-index: 1;
      display: flex; align-items: center; justify-content: space-between;
      color: var(--muted); font-size: 16px;
      font-weight: 500;
    }
    .foot .badges { display: flex; gap: 14px; }
    .foot .badge {
      padding: 6px 12px;
      background: rgba(15, 23, 42, 0.06);
      border-radius: 8px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
      color: var(--fg);
    }
  `;
}

// ─── Umbrella card ────────────────────────────────────────────────────────
function umbrellaHtml() {
  return /* html */ `
<!doctype html>
<html lang="en"><head><meta charset="utf-8" /><style>
  ${shellCss()}
  .aurora {
    background:
      radial-gradient(900px circle at 8% 8%, rgba(33, 115, 70, 0.28), transparent 60%),
      radial-gradient(800px circle at 50% 50%, rgba(37, 99, 235, 0.22), transparent 60%),
      radial-gradient(800px circle at 95% 92%, rgba(124, 58, 237, 0.22), transparent 60%);
  }
  .brand-mark { background: conic-gradient(from 135deg, #217346, #2563eb, #7c3aed, #217346); font-size: 22px; }
  h1 { --accent-color: #217346; }
  h1 .accent2 { color: #7c3aed; }
  .product__dot--sheet { background: #217346; }
  .product__dot--editor { background: #2563eb; }
  .product__dot--desktop { background: #7c3aed; }
</style></head><body>
  <div class="aurora"></div>
  <div class="topline">
    <span class="brand-mark" aria-hidden="true">cs</span>
    <span class="brand">Casual Office</span>
    <span class="domain">schnsrw.live</span>
  </div>
  <div class="main">
    <h1>Office, for the <span class="accent">open</span> <span class="accent2">web</span>.</h1>
    <p class="tagline">Real-time, file-centric, self-hostable. Sheets, Editor, and a desktop binary that ships when both web cores hit 90% fidelity.</p>
    <div class="products">
      <div class="product">
        <div><span class="product__dot product__dot--sheet"></span><span class="product__name">Casual Sheets</span></div>
        <div class="product__sub">.xlsx · pivots · charts · co-edit</div>
      </div>
      <div class="product">
        <div><span class="product__dot product__dot--editor"></span><span class="product__name">Casual Editor</span></div>
        <div class="product__sub">.docx · ProseMirror · Go gateway</div>
      </div>
      <div class="product">
        <div><span class="product__dot product__dot--desktop"></span><span class="product__name">Casual Desktop</span></div>
        <div class="product__sub">Tauri · offline · in progress</div>
      </div>
    </div>
  </div>
  <div class="foot">
    <span>by Sachin Sarwa · open source · Apache-2.0 / MIT</span>
    <span class="badges"><span class="badge">github.com/schnsrw</span></span>
  </div>
</body></html>`;
}

// ─── Per-product cards ────────────────────────────────────────────────────
//
// Each takes the umbrella shell and swaps:
//  - the brand-mark gradient (single product accent)
//  - the title gradient
//  - the aurora colour
//  - title copy + tagline + pills + badges + domain

function productHtml({ name, domain, mark, accent, accentSoft, taglineHtml, pills, badges, brandSvg }) {
  return /* html */ `
<!doctype html>
<html lang="en"><head><meta charset="utf-8" /><style>
  ${shellCss()}
  .aurora {
    background:
      radial-gradient(1000px circle at 10% 10%, ${accent}33, transparent 55%),
      radial-gradient(900px circle at 95% 90%, ${accent}22, transparent 60%);
  }
  .brand-mark { background: linear-gradient(135deg, ${accent}, ${accentSoft}); }
  h1 { --accent-color: ${accent}; }
  .pill { border-color: ${accent}44; color: ${accent}; }
</style></head><body>
  <div class="aurora"></div>
  <div class="topline">
    <span class="brand-mark" aria-hidden="true">${brandSvg ?? mark}</span>
    <span class="brand">${name}</span>
    <span class="domain">${domain}</span>
  </div>
  <div class="main">
    <h1>${taglineHtml}</h1>
    <p class="tagline" style="max-width: 900px;"></p>
    <div class="pills">
      ${pills.map((p) => `<span class="pill">${p}</span>`).join('')}
    </div>
  </div>
  <div class="foot">
    <span>by Sachin Sarwa · open source · Apache-2.0</span>
    <span class="badges">${badges.map((b) => `<span class="badge">${b}</span>`).join('')}</span>
  </div>
</body></html>`;
}

const variants = [
  { name: 'og.png', html: umbrellaHtml() },
  {
    name: 'og-sheets.png',
    html: productHtml({
      name: 'Casual Sheets',
      domain: 'sheet.schnsrw.live',
      mark: 'cs',
      accent: '#217346',
      accentSoft: '#2faf6b',
      brandSvg:
        '<svg viewBox="0 0 24 24" fill="none"><path d="M3 3h18v18H3z" stroke="white" stroke-width="2" fill="none"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18" stroke="white" stroke-width="1.5"/></svg>',
      taglineHtml: 'Excel-flavored web<br/><span class="accent">spreadsheet.</span>',
      pills: ['.xlsx round-trip', 'Real-time co-edit', 'Pivot tables', 'Charts & sparklines', 'Docker', 'Apache-2.0'],
      badges: ['357 e2e ✓', 'v0.0.6'],
    }),
  },
  {
    name: 'og-editor.png',
    html: productHtml({
      name: 'Casual Editor',
      domain: 'doc.schnsrw.live',
      mark: 'ce',
      accent: '#2563eb',
      accentSoft: '#6366f1',
      brandSvg:
        '<svg viewBox="0 0 24 24" fill="none"><path d="M5 3h11l4 4v14H5z" stroke="white" stroke-width="2" fill="none"/><path d="M9 9h7M9 13h7M9 17h5" stroke="white" stroke-width="1.6" stroke-linecap="round"/></svg>',
      taglineHtml: 'Word-flavored web<br/><span class="accent">document editor.</span>',
      pills: ['.docx round-trip', 'Real-time co-edit', 'ProseMirror', 'Go gateway', 'Stateless backend', 'Apache-2.0 / MIT'],
      badges: ['26 / 39 pristine', '3-way fidelity'],
    }),
  },
  {
    name: 'og-desktop.png',
    html: productHtml({
      name: 'Casual Desktop',
      domain: 'schnsrw.live/casual-desktop',
      mark: 'cd',
      accent: '#7c3aed',
      accentSoft: '#a78bfa',
      brandSvg:
        '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="13" rx="2" stroke="white" stroke-width="2" fill="none"/><path d="M9 21h6M12 17v4" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>',
      taglineHtml: 'The same editors,<br/><span class="accent">off the network.</span>',
      pills: ['Tauri', 'Offline', 'macOS · Linux · Windows', 'Single-user', 'Same web cores', 'Apache-2.0'],
      badges: ['scaffolding', 'ships at ≥ 90%'],
    }),
  },
];

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();

for (const { name, html } of variants) {
  await page.setContent(html, { waitUntil: 'networkidle' });
  const png = await page.screenshot({ type: 'png', omitBackground: false });
  const outPath = resolve(OUT_DIR, name);
  writeFileSync(outPath, png);
  console.info(`✓ ${outPath} (${(png.byteLength / 1024).toFixed(1)} KB)`);
}

await browser.close();
