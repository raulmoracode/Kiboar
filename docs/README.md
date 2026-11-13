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

## Footprint previews

Each component page shows the footprint as an SVG (F.Cu, F.SilkS, F.CrtYd,
F.Fab) and the STEP model in an interactive viewer. The SVGs are committed
under `public/footprints/`; regenerate them after changing a footprint:

```bash
mkdir -p /tmp/fp
for lib in footprints/*.pretty; do
  name=$(basename "$lib" .pretty)
  kicad-cli fp export svg -o "/tmp/fp/$name" --layers F.Cu,F.SilkS,F.CrtYd,F.Fab --black-and-white "$lib"
done
npx svgo -r -f /tmp/fp -o docs/public/footprints --multipass
python3 tools/gen_docs.py
```

The viewer downloads the STEP from
`raw.githubusercontent.com/raulmoracode/Kiboar/main/3dmodels/…` when it scrolls
into view, so the models are not duplicated into the site. Components without a
model show the footprint and a "No 3D model" box.

The viewer bundles `three` (MIT) and `occt-import-js` (LGPL-2.1). They are
documentation-site dependencies, not part of the KiCad library that ships to
users.

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
