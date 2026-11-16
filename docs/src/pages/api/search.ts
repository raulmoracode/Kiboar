import type { APIRoute } from 'astro';
import { createFromSource } from 'fumadocs-core/search/server';
import { source } from '@/lib/source';

// Component pages are reached from their library table; indexing 2700 of them
// would make the static search payload tens of megabytes.
const searchable = new Proxy(source, {
  get(target, property, receiver) {
    if (property === 'getPages') {
      return () => target.getPages().filter((page) => !page.url.includes('/components/'));
    }
    return Reflect.get(target, property, receiver);
  },
});

const server = createFromSource(searchable, {
  language: 'english',
});

export const GET: APIRoute = () => server.staticGET();
