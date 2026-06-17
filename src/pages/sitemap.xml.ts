import type { APIRoute } from 'astro';

/**
 * `/sitemap.xml` — sitemap-index alias.
 *
 * @astrojs/sitemap emits `sitemap-index.xml` + `sitemap-0.xml` and
 * names neither of them `sitemap.xml`. Some external systems (older
 * crawlers, third-party indexers, tools that don't read robots.txt)
 * hardcode `/sitemap.xml` as the discovery URL. This endpoint emits a
 * minimal sitemap-index that points search engines at the real index.
 *
 * Both `/sitemap.xml` and `/sitemap-index.xml` are listed in
 * `public/robots.txt` so crawlers find the canonical one immediately.
 */
export const GET: APIRoute = () => {
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://casualoffice.org/sitemap-index.xml</loc>
  </sitemap>
</sitemapindex>
`;
  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
