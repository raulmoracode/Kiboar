<p align="center">
    <img src="logo.svg" alt="Kiboar logo" width="240">
</p>

<p align="center">
    <a href="https://www.kicad.org"><img src="https://img.shields.io/badge/KiCad-10.0-1f6feb" alt="KiCad 10.0"></a>
    <a href="NOTICE"><img src="https://img.shields.io/badge/license-MIT%20%2B%20third--party-lightgrey" alt="MIT plus third-party content"></a>
</p>

# Kiboar

Kiboar is a keyboard brand. It designs keyboards, sells them assembled and
publishes the library and the board definitions so anyone can build, repair and
customise their own.

Buying and building are both first-class. The shop is being built to sell the
assembled keyboards: today it lists the catalogue and the storefront, and
checkout is not connected yet. The library and the documentation make the other
path possible; Kiboar Studio flashes and configures a board whichever way you
got it. The web site brings the whole brand together.

| Product | Path | README | What it is |
| --- | --- | --- | --- |
| Shop | `shop/` | [`shop/README.md`](shop/README.md) | The commercial surface of the brand: catalogue and storefront; checkout is not connected yet |
| Web | `web/` | [`web/README.md`](web/README.md) | The public front door: the brand, the keyboards, the docs, Studio and the shop in one place |
| KiCad library | `library/` | [`library/README.md`](library/README.md) | The official library Kiboar designs with, published so you can design and build your own board: 145 symbols and 173 footprints in 26 libraries |
| Kiboar Studio | `software/` | [`software/README.md`](software/README.md) | Manages a Kiboar keyboard: detects, flashes and — after 0.1 — remaps it, bought or self-built |
| Documentation | `docs/` | [`docs/README.md`](docs/README.md) | How to install the library, build a board and what the licences allow; Studio and the shop have their own READMEs |

The public surfaces are designed to share one domain: `/` is the web site,
`/docs` the documentation and `/shop` the Medusa store. The library is published
as a PCM ZIP and in this repository; Studio is a desktop application. The
routing each one needs is in [`ARCHITECTURE.md`](ARCHITECTURE.md#deployment).
Today the only published artefact is the Studio 0.1.0 release; the web, docs and
shop deployments are not live.

📖 **Documentation (not live yet):** <https://kiboar.raulmoracode.com/docs> — English and Spanish.

## Start here

### KiCad library

KiCad 10.0 or newer. Install the PCM package or clone the repository and point
`KIBOAR_ROOT` at `library/`. The install steps, the library table and the usage
notes are in [`library/README.md`](library/README.md).

### Documentation

The site is a package in the root pnpm workspace. It needs Node 22.23.4 or
newer and pnpm 12; it does not need KiCad.

```bash
pnpm install
pnpm --filter kiboar-docs dev    # http://127.0.0.1:4321
```

Content, generated pages and the Vercel deployment are described in
[`docs/README.md`](docs/README.md).

### Kiboar Studio

The desktop application is also in the root pnpm workspace, with a Cargo
workspace for the Rust side.

```bash
pnpm install
pnpm turbo run typecheck test --filter=@kiboar/core --filter=@kiboar/studio
pnpm test:rust
pnpm --filter @kiboar/studio tauri dev
```

The application layout, documents and current milestone are in
[`software/README.md`](software/README.md).

### Web and shop

`web` is a static Vite app with no database. `shop` holds the Medusa service
and the storefront in `shop/storefront`, a static Vite app that reads the Store
API; the storefront needs Medusa running and a publishable key.

```bash
pnpm install
pnpm dev             # every product + PostgreSQL; prints every URL
pnpm dev:all         # alias for pnpm dev
pnpm dev:web         # web only
pnpm dev:docs        # docs only
pnpm dev:shop        # PostgreSQL + Medusa + storefront + POS
pnpm dev:api         # PostgreSQL + Medusa
pnpm dev:storefront  # PostgreSQL + Medusa + storefront
pnpm dev:pos         # PostgreSQL + Medusa + POS
pnpm dev:studio      # desktop app (Tauri)
pnpm --filter @kiboar/shop build       # no database needed
```

`pnpm dev` (and its alias `pnpm dev:all`) starts every server product and the
PostgreSQL container that `shop/.env` points at, then prints only the URL table.
Service output is written to `.dev-logs/<service>.log`; Docker and Colima stay
quiet unless they fail. The `dev:*` commands start only what a product needs:
`dev:shop` brings up PostgreSQL, Medusa, the storefront and the POS; `dev:api`
stops at Medusa. `Ctrl+C` stops the servers and the container it started. The
command expects the three local env files from the product READMEs; when one is
missing it says which copy command to run.

Open `dev.html` in a browser for a local launcher with every URL. It is a
development file at the repository root, not part of the web build.

The setup, the commands and the scope of each are in
[`web/README.md`](web/README.md) and [`shop/README.md`](shop/README.md).

### Keyboards

The official hardware files for the Kiboar boards will live in `keyboards/`:
one directory per keyboard and revision, with its README, licence, KiCad project
and firmware notes. No board has published its files there yet; the directory
contains its README and starts empty. The board definitions Studio reads stay in
`software/boards/`. See [`keyboards/README.md`](keyboards/README.md).

## Repository

- [`ARCHITECTURE.md`](ARCHITECTURE.md) — product boundaries, the workspace,
  commands, versions and deployment.
- [`AGENTS.md`](AGENTS.md) — the repository rules. Each product adds its own:
  [`library/AGENTS.md`](library/AGENTS.md),
  [`docs/AGENTS.md`](docs/AGENTS.md) and
  [`software/AGENTS.md`](software/AGENTS.md).
- [`LABELS.md`](LABELS.md) — the label scheme for issues and pull requests.
- [`SECURITY.md`](SECURITY.md) — how to report a vulnerability privately.
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — how to contribute and what a pull
  request must include.
- [`packages/`](packages/README.md) — shared workspace packages: design tokens,
  the Vite setup, the TypeScript config and the canonical links.
- [`CHANGELOG.md`](CHANGELOG.md) — changes to the KiCad library and the PCM
  package. The docs site and Studio have independent versions; see
  `ARCHITECTURE.md`.
- [`RELEASING.md`](RELEASING.md) — how a version is cut, tagged and published.
- [`NOTICE`](NOTICE) — third-party origins and licences.

`docs`, `software`, `web` and `shop` share one pnpm workspace, the shared
packages in `packages/`, one lockfile and a Turborepo task graph at the root. The KiCad library has its own CI workflow
and its own Python tooling; it is not an npm package. `pnpm check` runs the
library checks, the JavaScript typecheck, tests and build, and the Rust tests.

## Requirements

| Product | Needs |
| --- | --- |
| KiCad library | KiCad 10.0 or newer, Python 3 |
| Documentation | Node 22.23.4 or newer, pnpm 12 |
| Kiboar Studio | Node 22.23.4 or newer, pnpm 12, a Rust toolchain and the Tauri system dependencies |
| Web | Node 22.23.4 or newer, pnpm 12 |
| Shop | Node 22.23.4 or newer, pnpm 12 and PostgreSQL for `dev` |

The KiCad files use the KiCad 10 format; KiCad 8 and 9 cannot open them.

## Licensing

The KiCad library is a **mixed-licence collection**, because of fifteen imported
symbols: original work is MIT, and those fifteen keep the licence of their
source. The full split, the attribution requirements and the evidence are in
[`NOTICE`](NOTICE) and [`library/README.md`](library/README.md#licensing). The
documentation site, Studio, the web site and the shop are MIT.

## Credits

Third-party origins and credits are listed in [`NOTICE`](NOTICE) and
[`library/README.md`](library/README.md#credits).
