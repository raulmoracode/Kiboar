# Kiboar documentation

The site at <https://kiboar.raulmoracode.com/docs>, built with Astro 7 and
Fumadocs. English is the default locale at `/docs`; Spanish is served at
`/es/docs`.

## Local

```bash
cd docs
npm install
npm run dev        # http://127.0.0.1:4321
npm run build      # static output in docs/dist
```

## Content

- `content/docs/*.mdx` — English pages.
- `content/docs/*.es.mdx` — Spanish pages.
- `content/docs/libraries/` and `content/docs/symbols.mdx` are **generated** by
  `tools/gen_docs.py` from `footprints/` and `symbols/`. Do not edit them by
  hand; change the library and run:

```bash
python3 tools/gen_docs.py          # rewrite the generated pages
python3 tools/gen_docs.py --check  # fail when they are stale
```

The generator lists every footprint of every library and every symbol, so the
docs cannot silently miss a component.

## Deploy

Vercel project settings:

| Setting | Value |
| --- | --- |
| Root Directory | `docs` |
| Framework | Astro |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Domain | `kiboar.raulmoracode.com` |

No `base` path is used: the landing is `/` and the docs are `/docs` and
`/es/docs` by route. `vercel.json` pins the build settings.
