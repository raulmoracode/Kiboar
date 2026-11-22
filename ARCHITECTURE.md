# Architecture

Kiboar is one repository with three products that are built and shipped
separately: the KiCad library, the documentation site and Kiboar Studio. They
share a repository and a review flow, not a runtime.

## Products

| Product | Path | Built with | Shipped as |
| --- | --- | --- | --- |
| KiCad library | `symbols/`, `footprints/`, `3dmodels/`, `lib-table-files/`, `pcm/`, `tools/` | KiCad 10, Python standard library | PCM ZIP and a clone with library tables |
| Documentation | `docs/` | Astro 7, Fumadocs, React | Static site on Vercel at `/docs` and `/es/docs` |
| Kiboar Studio | `software/` | Tauri 2, React, TypeScript, Rust | Desktop application |

## Boundaries

- **The library stays at the repository root.** `${KIBOAR_ROOT}`,
  `lib-table-files`, the model paths and the PCM package all depend on
  `symbols/`, `footprints/` and `3dmodels/` being at the root. Moving them is a
  breaking change for every existing clone, not a cleanup.
- **`docs` and `software` are the JavaScript workspace.** The root
  `pnpm-workspace.yaml` includes `docs`, `software/app` and
  `software/packages/*`. There is one lockfile at the root.
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
  `tools/gen_docs.py` and are committed.

## Workspace

```text
package.json            root scripts and Turbo
pnpm-workspace.yaml     docs, software/app, software/packages/*
pnpm-lock.yaml          one lockfile
turbo.json              build, typecheck, test, dev
docs/                   kiboar-docs
software/app/           @kiboar/studio
software/packages/core/ @kiboar/core
software/crates/        Rust, outside Turbo
software/Cargo.toml     Cargo workspace
```

Shared versions live in the `catalog` block of `pnpm-workspace.yaml`. React,
TypeScript, Tailwind, Zod and their types are declared once; a package uses
`"catalog:"` instead of repeating a range. This is how the workspace prevents
version drift; Turborepo is the task runner, not the version manager.

## Commands

| Command | What it does |
| --- | --- |
| `pnpm install` | Install the whole JavaScript workspace once |
| `pnpm build` | Build docs and Studio through Turbo |
| `pnpm typecheck` | Typecheck core, docs and Studio |
| `pnpm test` | Run the core tests |
| `pnpm dev` | Start the docs and Studio dev servers in parallel |
| `pnpm library` | Run every KiCad library check |
| `pnpm test:rust` | Run the Rust unit tests |
| `pnpm check` | Library + JavaScript + Rust checks |

## Versions

| Product | Version | Source of truth |
| --- | --- | --- |
| KiCad library | `1.x` | `pcm/metadata.json` and `CHANGELOG.md` |
| Board schema | `kiboar.board/1` | `software/packages/core/src/schema` |
| Registry | `kiboar.registry/1` | `software/registry/index.json` |
| Studio | `0.x` | `software/app/package.json` and `software/app/src-tauri/tauri.conf.json` |
| Firmware | `0.x` | Reported by the board over HID; independent of the app |

The products do not share one version number. A library patch does not force a
Studio release, and a Studio change does not force a PCM release. JavaScript
packages that ship together can share a version later through Changesets; they
do not share it with the KiCad library.

## Deployment

- **Library:** `python3 tools/build_pcm.py` produces the PCM ZIP; releases are
  attached to a GitHub release.
- **Documentation:** Vercel, project Root Directory `docs`. Vercel detects the
  pnpm workspace and installs from the repository root. `docs/vercel.json`
  builds with `cd .. && pnpm turbo run build --filter=kiboar-docs` and publishes
  `dist`. The site is served at `kiboar.raulmoracode.com/docs`; Spanish lives
  at `/es/docs`.
- **Studio:** a desktop application. It is not deployed to Vercel and has no
  web build target.

## Licensing

The library is a mixed MIT and CC BY-SA collection, documented in `NOTICE`. The
documentation and Studio are MIT. Firmware built on QMK keeps QMK's GPL-2.0 and
is distributed with its source. The boundaries are directory boundaries: a
third-party licence in the library does not change the licence of `software/`,
and the app must not copy library assets into its bundle without attribution.
