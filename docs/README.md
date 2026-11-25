# Kiboar documentation

Documentation for Kiboar: the official KiCad library and how to use it, Kiboar
Studio and the licences. It covers both paths, buying an assembled keyboard or
building your own.

The site at <https://kiboar.raulmoracode.com/docs>, built with Astro 7 and
Fumadocs. English is the default locale at `/docs`; Spanish is served at
`/es/docs`.

The site is one of the products in the [Kiboar repository](../README.md).
The KiCad library lives in [`../library/`](../library/README.md), Kiboar Studio
in [`../software/`](../software/README.md), the public site in
[`../web/`](../web/README.md) and the shop in [`../shop/`](../shop/README.md).

Agent instructions: [`AGENTS.md`](AGENTS.md).

## Deployment

The build is intended for `https://kiboar.raulmoracode.com/docs` and `/es/docs`.
`docs/vercel.json` builds from the `docs` Root Directory and publishes
`docs/dist`; the project is configured but not deployed yet. The build owns the
`/docs` prefix: the domain root is `web` and `/shop` is the Medusa store. See
[`../ARCHITECTURE.md`](../ARCHITECTURE.md#deployment).

## Local

From the repository root:

```bash
pnpm install
pnpm --filter kiboar-docs dev    # http://127.0.0.1:4321
pnpm --filter kiboar-docs build  # static output in docs/dist
pnpm --filter kiboar-docs typecheck
```

## Content

- `content/docs/*.mdx` — English pages.
- `content/docs/*.es.mdx` — Spanish pages.
- `content/docs/libraries/` is **generated** by `library/tools/gen_docs.py` from
  `library/footprints/`. Do not edit it by hand; change the library and run:

```bash
python3 library/tools/gen_docs.py          # rewrite the generated pages
python3 library/tools/gen_docs.py --check  # fail when they are stale
```

The generator lists every footprint of every library, so the docs cannot
silently miss a component. The site index and the `libraries/` sidebar are
generated too.

## Layout and components

The site uses the Fumadocs Spacious layout (`fumadocs-ui/layouts/spacious`):
sidebar, page panel and table of contents, with the page scrolling inside the
panel. Its styles are imported separately in `src/styles/global.css`
(`fumadocs-ui/css/generated/spacious.css`) and the page parts must come from
`fumadocs-ui/layouts/spacious/page`; mixing them with `layouts/docs/page` breaks
the page chrome. The page column is 760 px; the home and library pages pass
`full` to widen it to 1200 px so the catalog grid and the component cards keep
their width.

The table of contents is enabled on every docs page (`tableOfContent` in
`src/components/docs.tsx`), including the `full` ones. Since the TOC is built
from Markdown headings, the pages that had none carry a `##` heading: the home
page uses one heading per library family (`## Switches and keycaps`,
`## Electronics`, …), every generated library page uses one heading per
component and Contributing uses `## Workflow` / `## Flujo de trabajo`. The home
headings keep the compact label style through the `kiboar-home` class and the
library headings use the `kiboar-library` class, both applied to the page
article from the route.

The header actions are `ActionsWithShop` in `src/components/docs.tsx`: it wraps
Spacious' `HeaderActions` and adds two links: `/shop` (cart icon plus "Shop" from
`lg`, icon only below) and the GitHub repository (mark only, with an
`aria-label`). The shop link points outside the docs build, so `/shop` must
exist on the deployed host; the repository URL comes from `gitConfig` in
`src/lib/shared.ts`.

MDX components come from `src/components/mdx.tsx`: the Fumadocs defaults plus
`Steps`/`Step`; callouts are part of the defaults. The home grid keeps a small
responsive grid around Fumadocs `Card`s because `Cards` is itself a container
and its cards span the full row below 1024 px (`@max-lg:col-span-full`).

The two home pages (`content/docs/index.mdx` and `index.es.mdx`) are hand-written
except for the block between the `{/* generated:start */}` and
`{/* generated:end */}` markers: the family groups are generated, so they
follow the library.

## Footprint previews

Each component card shows the footprint as an SVG (F.Cu, F.SilkS, F.CrtYd,
F.Fab) and the STEP model in an interactive viewer. The SVGs are committed
under `public/footprints/`; regenerate them after changing a footprint:

```bash
mkdir -p /tmp/fp
for lib in library/footprints/*.pretty; do
  name=$(basename "$lib" .pretty)
  kicad-cli fp export svg -o "/tmp/fp/$name" --layers F.Cu,F.SilkS,F.CrtYd,F.Fab --black-and-white "$lib"
done
npx svgo -r -f /tmp/fp -o docs/public/footprints --multipass
python3 library/tools/gen_docs.py
```

The viewer downloads the STEP from
`raw.githubusercontent.com/raulmoracode/Kiboar/main/library/3dmodels/…` when it scrolls
into view, so the models are not duplicated into the site. Components without a
model show the footprint and a "No 3D model" box.

The viewer renders inside a shadow root (`src/scripts/model-viewer.ts`). Writing
the loading message or the canvas into the light DOM changes the HTML React
hydrates and breaks the docs island, which left the "On this page" list frozen.

The viewer bundles `three` (MIT) and `occt-import-js` (LGPL-2.1). They are
documentation-site dependencies, not part of the KiCad library that ships to
users.

## Deploy

The docs are one package in the root pnpm workspace. Vercel must use `docs` as
the **Root Directory**; it detects `pnpm-workspace.yaml` and installs from the
repository root, so the lockfile is shared with Studio.

| Setting | Value |
| --- | --- |
| Root Directory | `docs` |
| Framework | Astro |
| Install | automatic from the workspace root |
| Build Command | `cd .. && pnpm turbo run build --filter=kiboar-docs` |
| Output Directory | `dist` |
| Domain | `kiboar.raulmoracode.com/docs` |

`docs/vercel.json` pins the build command and the output directory. No `base`
path is used: the docs are `/docs` and `/es/docs` by route, and there is no page
at `/`. Studio is a desktop application and is not deployed to Vercel.
