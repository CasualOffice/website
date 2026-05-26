import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const all = await getCollection('notes', ({ data }) => !data.draft);
  all.sort((a, b) => +b.data.date - +a.data.date);
  return rss({
    title: 'Casual Office — Engineering notes',
    description:
      'Technical posts from building open-source web spreadsheets, .docx editors, and slide decks. Yjs CRDT bridges, Hocuspocus, capacity modelling, .xlsx + .pptx round-trip, and the production-readiness work behind each release.',
    site: context.site ?? 'https://schnsrw.live/',
    items: all.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.date,
      link: `/notes/${entry.slug}/`,
      categories: entry.data.tags,
    })),
    customData: '<language>en-us</language>',
  });
}
