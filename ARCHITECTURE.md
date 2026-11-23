# Architecture

Kiboar is a keyboard brand. It designs keyboards, sells them assembled and
publishes the library and the board definitions so anyone can build, repair and
customise their own. The repository holds the five products that make both paths
work; they are built and shipped separately and share a repository and a review
flow, not a runtime.

## Products

| Product | Path | Built with | What it is |
| --- | --- | --- | --- |
| Shop | `shop/` | Medusa 2, Node, PostgreSQL | Sells assembled Kiboar keyboards; the commercial surface |
| Web | `web/` | Vite 8, React 19, Tailwind 4 | The public front door that brings the brand together |
| KiCad library | `library/symbols/`, `library/footprints/`, `library/3dmodels/`, `library/lib-table-files/`, `library/pcm/`, `library/tools/` | KiCad 10, Python standard library | The official library, published so anyone can design and build a board |
| Kiboar Studio | `software/` | Tauri 2, React, TypeScript, Rust | Manages a Kiboar board: detects, flashes and (after 0.1) remaps it, bought or self-built |
| Documentation | `docs/` | Astro 7, Fumadocs, React | How to install the library, build a board, flash it and what the licences allow |

## Boundaries

- **Buying and building are both first-class.** `shop/` is the commercial
  surface, not the source of truth. The library, the docs and Studio must work
  for a board that was never bought.
- **The published design is not gated by the shop.** No product may require an
  order, an account or a running shop to install the library, flash a board or
  read the docs.
- **Published today:** the library, the board definitions in `software/boards`
  and the source of the five products. The rest of the hardware release is
  planned; do not present it as already available.
- **The official hardware lives in `keyboards/`.** One directory per board and
  revision, with its own README, licence, KiCad project and firmware notes. The
  board definitions Studio reads stay in `software/boards/`; moving them is a
  separate change. The directory is the published home and starts empty: do not
  claim a keyboard file exists until it is there.
- **The library lives in `library/`.** For a clone install, `KIBOAR_ROOT`
  points at `<clone>/library`; the library tables, the model paths and the PCM
  builder all use that root. The PCM ZIP keeps `symbols/`, `footprints/` and
  `3dmodels/` at its internal root, so PCM consumers are unaffected.
- **`docs` and `software` are the JavaScript workspace.** The root
  `pnpm-workspace.yaml` includes `docs`, `software/app`, `software/packages/*`,
  `web` and `shop`. There is one lockfile at the root.
- **The library is not an npm package.** It is a KiCad asset collection with
  Python tooling. Turborepo does not run its checks; the library has its own CI
  workflow and its own `pnpm library` script at the root.
- **Studio does not import the library at runtime.** It consumes its own board
  definitions (`software/boards`), registry and schema. The connection to the
  library is conceptual: boards are built with Kiboar components.
- **Rust is outside Turborepo.** `software/Cargo.toml` is a Cargo workspace for
  the Tauri shell and the pure crates. `cargo` runs in its own CI job.
- **The docs site is static.** It has no server, no database and no runtime
  dependency on the library; its generated pages come from
  `library/tools/gen_docs.py` and are committed.
- **`web` and `shop` are separate products.** `web` is a static Vite app with
  no server; `shop` is a Medusa service that needs PostgreSQL at runtime. They
  share the workspace and the catalog versions, not code: the storefront talks
  to the Store API over HTTP. The root `.npmrc` carries the hoisting Medusa
  needs on pnpm.
- **The shop build does not need a database.** `medusa build` compiles the
  server and the admin in CI; only `dev`, `start` and `db:migrate` need
  PostgreSQL.

## Agent instructions

The repository's agent files and label policy:

- [`AGENTS.md`](AGENTS.md) — the repository; its Git, licensing and
  repository-wide rules apply everywhere.
- [`library/AGENTS.md`](library/AGENTS.md) — the KiCad library.
- [`docs/AGENTS.md`](docs/AGENTS.md) — the documentation site.
- [`software/AGENTS.md`](software/AGENTS.md) — Kiboar Studio.
- [`web/AGENTS.md`](web/AGENTS.md) — the public site.
- [`shop/AGENTS.md`](shop/AGENTS.md) — the Medusa application.
- [`LABELS.md`](LABELS.md) — the repository label scheme.

Read the root file first, then `LABELS.md` and the product file for the area
being changed. A product file adds commands and boundaries; it does not replace
the root rules.

## Workspace

```text
package.json            root scripts and Turbo
pnpm-workspace.yaml     docs, software/app, software/packages/*, web, shop
pnpm-lock.yaml          one lockfile
turbo.json              build, typecheck, test, dev
.npmrc                  hoisting Medusa needs on pnpm
library/                KiCad assets, tools, PCM and library tables
docs/                   kiboar-docs
software/app/           @kiboar/studio
software/packages/core/ @kiboar/core
software/crates/        Rust, outside Turbo
software/Cargo.toml     Cargo workspace
web/                    @kiboar/web
shop/                   @kiboar/shop
keyboards/              official board files, one directory per board and revision
```

Shared versions live in the `catalog` block of `pnpm-workspace.yaml`. React,
TypeScript, Tailwind, Zod and their types are declared once; a package uses
`"catalog:"` instead of repeating a range. This is how the workspace prevents
version drift; Turborepo is the task runner, not the version manager.

## Commands

| Command | What it does |
| --- | --- |
| `pnpm install` | Install the whole JavaScript workspace once |
| `pnpm build` | Build docs, Studio, web and shop through Turbo |
| `pnpm typecheck` | Typecheck core, docs, Studio and web |
| `pnpm test` | Run the core tests |
| `pnpm dev` | Start the docs, Studio and web dev servers; the shop needs PostgreSQL, so it is excluded and has its own script |
| `pnpm dev:web` | Start the web dev server |
| `pnpm dev:shop` | Start Medusa; needs a `shop/.env` with `DATABASE_URL` and PostgreSQL |
| `pnpm library` | Run every KiCad library check |
| `pnpm test:rust` | Run the Rust unit tests |
| `pnpm check` | Library + JavaScript + Rust checks |

## Versions

| Product | Version | Source of truth |
| --- | --- | --- |
| KiCad library | `1.x` | `library/pcm/metadata.json` and `CHANGELOG.md` |
| Board schema | `kiboar.board/1` | `software/packages/core/src/schema` |
| Registry | `kiboar.registry/1` | `software/registry/index.json` |
| Studio | `0.x` | `software/app/package.json` and `software/app/src-tauri/tauri.conf.json` |
| Web | `0.x` | `web/package.json` |
| Shop | `0.x` | `shop/package.json` and the pinned Medusa version |
| Firmware | `0.x` | Reported by the board over HID; independent of the app |

The products do not share one version number. A library patch does not force a
Studio release, and a Studio change does not force a PCM release. JavaScript
packages that ship together can share a version later through Changesets; they
do not share it with the KiCad library.

## Deployment

One domain, three web surfaces, plus the library and the desktop app:

| Surface | URL | Hosting |
| --- | --- | --- |
| Web | `https://kiboar.raulmoracode.com/` | Static Vite build from `web/dist` |
| Docs | `https://kiboar.raulmoracode.com/docs` and `/es/docs` | Static Astro build from `docs/dist` |
| Shop | `https://kiboar.raulmoracode.com/shop` | Medusa service: Node and PostgreSQL |
| Library | GitHub releases and the repository | PCM ZIP |
| Studio | Desktop | macOS bundle, not a web surface |

- **Library:** `python3 library/tools/build_pcm.py` produces the PCM ZIP;
  releases are attached to a GitHub release.
- **Web:** the root of the brand domain. `pnpm --filter @kiboar/web build`
  produces a static `dist/`; the host serves it at `/`.
- **Documentation:** Vercel, project Root Directory `docs`. Vercel detects the
  pnpm workspace and installs from the repository root. `docs/vercel.json`
  builds with `cd .. && pnpm turbo run build --filter=kiboar-docs` and publishes
  `dist`. It owns the `/docs` prefix; Spanish lives at `/es/docs`.
- **Shop:** a Medusa service with PostgreSQL and the admin dashboard, served
  under `/shop`. It needs a Node runtime and a database, so a static host cannot
  run it: the domain needs a reverse proxy or a rewrite from `/shop` to the
  Medusa host. Medusa serves its API and its admin from the same process, so the
  proxy must rewrite those paths consistently; do not assume the admin works
  under `/shop/app` until that rewrite is tested.
- **Studio:** a desktop application. It is not deployed to Vercel and has no
  web build target.

Routing rules for the domain: `/` belongs to `web`, `/docs/*` to the docs
build and `/shop/*` to Medusa. A single static project cannot own all three;
whichever host owns the domain needs explicit rewrites or a proxy, and the
prefixes must not collide.

## Licensing

The library is a mixed MIT and CC BY-SA collection, documented in `NOTICE`. The
documentation and Studio are MIT. Firmware built on QMK keeps QMK's GPL-2.0 and
is distributed with its source. The boundaries are directory boundaries: a
third-party licence in the library does not change the licence of `software/`,
and the app must not copy library assets into its bundle without attribution.
