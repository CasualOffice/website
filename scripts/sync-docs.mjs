#!/usr/bin/env node
/**
 * Pull curated markdown from the sibling repos into
 * `src/content/docs/{product}/{slug}.md`, adding the frontmatter the
 * docs content collection expects.
 *
 *   npm run sync-docs
 *
 * Re-run whenever the upstream docs change. The output is committed so
 * GitHub Pages doesn't need to clone the sibling repos at build time.
 *
 * Path rewrites:
 *  - relative `./docs/ARCHITECTURE.md` → /docs/{product}/architecture/
 *  - relative `../foo.ts` (code refs) → GitHub blob URL on the source repo
 *  - first H1 stripped — title comes from frontmatter and the layout
 *    renders it as the page header.
 */
import { mkdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const SERVICES_ROOT = resolve(SITE_ROOT, '..');
const SHEET_ROOT = resolve(SERVICES_ROOT, 'sheet');
const DOC_ROOT = resolve(SERVICES_ROOT, 'document');

/** @type {Array<{from: string, product: 'sheets'|'editor'|'shared', slug: string, title: string, summary?: string, order: number, repo: 'sheets'|'docx', sourcePath: string}>} */
const docs = [
  // ─── Casual Sheets ────────────────────────────────────────────────
  {
    from: resolve(SHEET_ROOT, 'PLAN.md'),
    product: 'sheets',
    slug: 'plan',
    title: 'Plan',
    summary: 'Phased roadmap, scope, and what is in/out for Casual Sheets.',
    order: 10,
    repo: 'sheets',
    sourcePath: 'PLAN.md',
  },
  {
    from: resolve(SHEET_ROOT, 'docs/ARCHITECTURE.md'),
    product: 'sheets',
    slug: 'architecture',
    title: 'Architecture',
    summary: 'How the Univer grid, collab driver, xlsx workers, charts, and panels fit together.',
    order: 20,
    repo: 'sheets',
    sourcePath: 'docs/ARCHITECTURE.md',
  },
  {
    from: resolve(SHEET_ROOT, 'docs/RESEARCH.md'),
    product: 'sheets',
    slug: 'research',
    title: 'Research — Univer technical brief',
    summary: 'Source-level notes on how Univer behaves, with file paths.',
    order: 30,
    repo: 'sheets',
    sourcePath: 'docs/RESEARCH.md',
  },
  {
    from: resolve(SHEET_ROOT, 'docs/CO-EDITING.md'),
    product: 'sheets',
    slug: 'co-editing',
    title: 'Co-editing',
    summary: 'Hocuspocus + Yjs bridge: mutations, presence, room lifecycle.',
    order: 40,
    repo: 'sheets',
    sourcePath: 'docs/CO-EDITING.md',
  },
  {
    from: resolve(SHEET_ROOT, 'docs/LARGE_FILE_PIPELINE.md'),
    product: 'sheets',
    slug: 'large-file-pipeline',
    title: 'Large-file pipeline',
    summary: 'Streaming xlsx open, worker offload, snapshot-ref staging.',
    order: 50,
    repo: 'sheets',
    sourcePath: 'docs/LARGE_FILE_PIPELINE.md',
  },
  {
    from: resolve(SHEET_ROOT, 'docs/UNIVER_FORK_PERF.md'),
    product: 'sheets',
    slug: 'univer-fork-perf',
    title: 'Univer fork — perf plan',
    summary: 'Fork-side perf punch list with status per item.',
    order: 60,
    repo: 'sheets',
    sourcePath: 'docs/UNIVER_FORK_PERF.md',
  },
  {
    from: resolve(SHEET_ROOT, 'docs/xlsx-lossiness.md'),
    product: 'sheets',
    slug: 'xlsx-lossiness',
    title: 'xlsx round-trip audit',
    summary: 'Per-probe lossiness report. Currently 46 of 46 pristine.',
    order: 70,
    repo: 'sheets',
    sourcePath: 'docs/xlsx-lossiness.md',
  },
  {
    from: resolve(SHEET_ROOT, 'docs/ods-lossiness.md'),
    product: 'sheets',
    slug: 'ods-lossiness',
    title: 'ODS round-trip audit',
    summary: '.ods round-trip results vs the same probe set.',
    order: 80,
    repo: 'sheets',
    sourcePath: 'docs/ods-lossiness.md',
  },
  {
    from: resolve(SHEET_ROOT, 'docs/DOCKERHUB.md'),
    product: 'sheets',
    slug: 'docker',
    title: 'Docker image',
    summary: 'Self-hosted bundle: web + Hocuspocus + Fastify on one port.',
    order: 90,
    repo: 'sheets',
    sourcePath: 'docs/DOCKERHUB.md',
  },
  {
    from: resolve(SHEET_ROOT, 'docs/ENV.md'),
    product: 'sheets',
    slug: 'env',
    title: 'Environment variables',
    summary: 'Every runtime + build-time knob, with defaults + accepted values.',
    order: 100,
    repo: 'sheets',
    sourcePath: 'docs/ENV.md',
  },

  // ── Casual Sheets · self-hosting ───────────────────────────────────
  {
    from: resolve(SHEET_ROOT, 'docs/self-hosting/overview.md'),
    product: 'sheets',
    slug: 'self-hosting',
    title: 'Self-hosting',
    summary: 'Single image, three deployment shapes, full configuration model.',
    order: 200,
    repo: 'sheets',
    sourcePath: 'docs/self-hosting/overview.md',
  },
  {
    from: resolve(SHEET_ROOT, 'docs/self-hosting/reverse-proxy.md'),
    product: 'sheets',
    slug: 'self-hosting-reverse-proxy',
    title: 'Self-hosting — reverse proxy',
    summary: 'nginx, Caddy, Traefik. WebSocket upgrade + body-size + sub-path mount recipes.',
    order: 210,
    repo: 'sheets',
    sourcePath: 'docs/self-hosting/reverse-proxy.md',
  },
  {
    from: resolve(SHEET_ROOT, 'docs/self-hosting/tls.md'),
    product: 'sheets',
    slug: 'self-hosting-tls',
    title: 'Self-hosting — TLS + custom domain',
    summary: 'Let\'s Encrypt with each proxy, DNS pointers, CASUAL_PUBLIC_ORIGIN.',
    order: 220,
    repo: 'sheets',
    sourcePath: 'docs/self-hosting/tls.md',
  },
  {
    from: resolve(SHEET_ROOT, 'docs/self-hosting/cors.md'),
    product: 'sheets',
    slug: 'self-hosting-cors',
    title: 'Self-hosting — CORS',
    summary: 'When you need it, when you don\'t, the most common mistake.',
    order: 230,
    repo: 'sheets',
    sourcePath: 'docs/self-hosting/cors.md',
  },
  {
    from: resolve(SHEET_ROOT, 'docs/self-hosting/scaling.md'),
    product: 'sheets',
    slug: 'self-hosting-scaling',
    title: 'Self-hosting — scaling',
    summary: 'Single-process limits, Redis path, horizontal scale-out caveats (v0.2 lane).',
    order: 240,
    repo: 'sheets',
    sourcePath: 'docs/self-hosting/scaling.md',
  },
  {
    from: resolve(SHEET_ROOT, 'docs/self-hosting/backups.md'),
    product: 'sheets',
    slug: 'self-hosting-backups',
    title: 'Self-hosting — backups',
    summary: 'Per-backend backup + restore recipes. Run the restore drill once.',
    order: 250,
    repo: 'sheets',
    sourcePath: 'docs/self-hosting/backups.md',
  },

  // ── Casual Sheets · customization ──────────────────────────────────
  {
    from: resolve(SHEET_ROOT, 'docs/customization/overview.md'),
    product: 'sheets',
    slug: 'customization',
    title: 'Customization',
    summary: 'Admin panel walkthrough, secret handling, token issuance, webhook verification.',
    order: 300,
    repo: 'sheets',
    sourcePath: 'docs/customization/overview.md',
  },
  {
    from: resolve(SHEET_ROOT, 'docs/customization/auth.md'),
    product: 'sheets',
    slug: 'customization-auth',
    title: 'Customization — auth (JWT, roles, permissions)',
    summary: 'Claim model, role permission matrix, token issuance, error responses, migration.',
    order: 310,
    repo: 'sheets',
    sourcePath: 'docs/customization/auth.md',
  },
  {
    from: resolve(SHEET_ROOT, 'docs/customization/webhooks.md'),
    product: 'sheets',
    slug: 'customization-webhooks',
    title: 'Customization — webhooks',
    summary: 'Event catalogue, payload + headers, signature verification (Node / Python / Go).',
    order: 320,
    repo: 'sheets',
    sourcePath: 'docs/customization/webhooks.md',
  },

  // ─── Casual Editor ────────────────────────────────────────────────
  {
    from: resolve(DOC_ROOT, 'docs/ARCHITECTURE.md'),
    product: 'editor',
    slug: 'architecture',
    title: 'Architecture',
    summary: 'ProseMirror + OOXML-preserving model on top, stateless Go gateway underneath.',
    order: 10,
    repo: 'docx',
    sourcePath: 'docs/ARCHITECTURE.md',
  },
  {
    from: resolve(DOC_ROOT, 'docs/CO-EDITING.md'),
    product: 'editor',
    slug: 'co-editing',
    title: 'Co-editing',
    summary: 'y-prosemirror + Yjs over our own y-websocket implementation in ~120 LOC.',
    order: 20,
    repo: 'docx',
    sourcePath: 'docs/CO-EDITING.md',
  },
  {
    from: resolve(DOC_ROOT, 'docs/ROUNDTRIP.md'),
    product: 'editor',
    slug: 'roundtrip',
    title: 'Round-trip fidelity',
    summary: 'Per-tag fidelity audit + three-way harness vs LibreOffice and OnlyOffice.',
    order: 30,
    repo: 'docx',
    sourcePath: 'docs/ROUNDTRIP.md',
  },
  {
    from: resolve(DOC_ROOT, 'docs/DEPLOYMENT.md'),
    product: 'editor',
    slug: 'deployment',
    title: 'Deployment',
    summary: 'Docker bundle, embedded SPA, host integrations.',
    order: 40,
    repo: 'docx',
    sourcePath: 'docs/DEPLOYMENT.md',
  },
];

const REPO_URLS = {
  sheets: 'https://github.com/CasualOffice/sheets',
  docx: 'https://github.com/CasualOffice/docs',
};

function transform(source, doc) {
  let body = source;

  // Strip first H1 — the page layout renders the title from frontmatter
  // as the page header, so a duplicate H1 in the body would render twice.
  body = body.replace(/^#\s+.+\n+/, '');

  // Rewrite relative doc links inside the same repo to the corresponding
  // site doc route. Cross-product doc-to-doc links land on GitHub.
  body = body.replace(
    /\]\(\.\/([A-Za-z0-9_-]+)\.md\)/g,
    (_m, name) => `](/docs/${doc.product}/${name.toLowerCase()}/)`,
  );
  body = body.replace(
    /\]\(\.\/docs\/([A-Za-z0-9_-]+)\.md\)/g,
    (_m, name) => `](/docs/${doc.product}/${name.toLowerCase()}/)`,
  );

  // Code references that look like `path/to/file.ts:LINE` are kept as-is
  // (they're documentation citations; the file is in the source repo,
  // not the site). We don't try to link them — the line numbers would
  // drift faster than we'd want to maintain.

  // Add a small "Edit on GitHub" pointer at the very bottom — the
  // canonical source is the upstream file.
  const sourceUrl = `${REPO_URLS[doc.repo]}/blob/main/${doc.sourcePath}`;
  body =
    body.trimEnd() +
    `\n\n---\n\n_Synced from [\`${doc.sourcePath}\` in schnsrw/${doc.repo}](${sourceUrl}). To update: edit upstream and re-run \`npm run sync-docs\`._\n`;

  return { body, sourceUrl };
}

function buildFrontmatter(doc, sourceUrl, mtimeMs) {
  const lines = [
    '---',
    `title: ${JSON.stringify(doc.title)}`,
    `product: ${doc.product}`,
    `order: ${doc.order}`,
    `sourceUrl: ${JSON.stringify(sourceUrl)}`,
    `updated: ${new Date(mtimeMs).toISOString()}`,
  ];
  if (doc.summary) lines.push(`summary: ${JSON.stringify(doc.summary)}`);
  lines.push('---', '');
  return lines.join('\n');
}

let written = 0;
for (const doc of docs) {
  let raw;
  let mtimeMs;
  try {
    raw = readFileSync(doc.from, 'utf8');
    mtimeMs = statSync(doc.from).mtimeMs;
  } catch (err) {
    console.warn(`  ! skip ${doc.product}/${doc.slug} — source missing: ${doc.from}`);
    continue;
  }
  const { body, sourceUrl } = transform(raw, doc);
  const fm = buildFrontmatter(doc, sourceUrl, mtimeMs);
  const outPath = resolve(SITE_ROOT, 'src/content/docs', doc.product, `${doc.slug}.md`);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, fm + body);
  console.info(`  ✓ ${doc.product}/${doc.slug}.md  (${(body.length / 1024).toFixed(1)} KB)`);
  written++;
}

console.info(`Done. ${written}/${docs.length} entries synced.`);
