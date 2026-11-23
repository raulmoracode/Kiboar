# AGENTS.md

Instructions for AI agents working in this repository. The long form for humans
is `CONTRIBUTING.md`; this file is the short, unambiguous version and the root
contract for the whole repository.

Read in this order: `README.md` → `ARCHITECTURE.md` → this file → `LABELS.md`
→ the product `AGENTS.md` for the area you are changing → `CONTRIBUTING.md` →
`NOTICE` → `CHANGELOG.md`.

## What this repository is

Kiboar is a keyboard brand, not only a CAD library. It designs keyboards, sells
them assembled and publishes the library and the board definitions so anyone
can build, repair and customise their own. Two paths are first-class and every
product must serve both: buying a Kiboar keyboard and building one from the
published design.

- `shop/` is the commercial surface; it never gates the design.
- `web/` is the public front door that brings the brand together.
- `library/` is the official CAD, published for Kiboar's boards and for anyone
  else's.
- `software/` is the tool for both paths: detect, flash, and after 0.1 remap.
- `docs/` explains both paths and the licences.

Do not claim a hardware file, a manufacturing asset or the firmware source is
published unless it is in this repository. Today that is the library and
`software/boards`; the rest of the hardware release is planned, not shipped.

The repository has five products, built and shipped separately.

| Path | Contents |
| --- | --- |
| `library/` | KiCad library: symbols, footprints, 3D models, PCM and Python tools |
| `docs/` | Astro + Fumadocs documentation site, English and Spanish |
| `software/` | Kiboar Studio: Tauri app, TypeScript core and Rust crates |
| `web/` | Public site: Vite + React + Tailwind |
| `shop/` | Shop: Medusa v2 application |
| `keyboards/` | Official keyboard hardware: one directory per board and revision |
| `package.json`, `pnpm-workspace.yaml`, `turbo.json` | Root JavaScript workspace for `docs`, `software`, `web` and `shop` |
| `ARCHITECTURE.md` | Product boundaries, commands, versions and deployment |
| `LABELS.md` | The repository label scheme for issues and pull requests |
| `library/AGENTS.md`, `docs/AGENTS.md`, `software/AGENTS.md`, `web/AGENTS.md`, `shop/AGENTS.md` | Product-specific agent rules |
| `NOTICE` | Third-party origins and licences |

## Product instructions

This file covers the repository: Git, licensing, the JavaScript workspace and
the rules that apply everywhere. The product files add the commands, generated
artifacts, boundaries and label tables for their product.

| Product | File | Covers |
| --- | --- | --- |
| KiCad library | [`library/AGENTS.md`](library/AGENTS.md) | KiCad format, footprints, symbols, provenance, PCM, library tools |
| Documentation | [`docs/AGENTS.md`](docs/AGENTS.md) | Astro/Fumadocs, content, generated pages, EN/ES, Vercel |
| Kiboar Studio | [`software/AGENTS.md`](software/AGENTS.md) | Workspace, TypeScript core, Rust, Tauri, schemas and bindings |
| Web | [`web/AGENTS.md`](web/AGENTS.md) | Vite, React, Tailwind, the public page and its deployment |
| Shop | [`shop/AGENTS.md`](shop/AGENTS.md) | Medusa, the Store API, the admin, PostgreSQL and pnpm hoisting |

Read the product file after this one when you change that product; read more
than one when a change spans products. The product files do not replace the Git
or licensing rules here. If a product file and this one disagree, this one wins
and the product file is corrected.

## Labels and `git-workflow`

This repository does **not** use the generic label catalog that ships with
`git-workflow`. The authoritative scheme is [`LABELS.md`](LABELS.md).

| Label | When |
| --- | --- |
| `product:repo` | Root files, CI, repository process and cross-product docs |
| Exactly one `type:*` from [`LABELS.md`](LABELS.md) | Matches the title prefix |
| `risk:consequential` or `risk:sensitive` | Only for level 2 or 3; never both |

When you use `git-workflow` here:

1. Read [`LABELS.md`](LABELS.md).
2. Read the **Labels** table in the `AGENTS.md` of every product the change
   touches.
3. Apply exactly one `type:*`, one `product:*` per touched product, and a
   `risk:*` label only for level 2 or 3.
4. Do not apply `area:*` to new work and do not create a label outside the
   scheme.

The skill's catalog is generic by design; this repository's product scheme is
the local authority. `git-merge` accepts a repository-specific scheme, and this
is it.

## Repository rules

### Licensing

- `NOTICE` is authoritative. The library is **mixed-licence**: original work is
  MIT; ten SnapEDA symbols and five Component Search Engine symbols are
  CC BY-SA 4.0 with the Design Exception. The documentation and Studio are MIT.
- Do not relicense third-party files, do not remove or weaken `NOTICE`, and do
  not add new non-commercial or NoDerivatives content.
- New CAD data needs its origin and licence recorded in `NOTICE`, or must be
  original work. The library file has the detailed rules.

### JavaScript workspace

- The workspace root is the repository root. Do not add another
  `pnpm-workspace.yaml` under `docs/`, `software/`, `web/` or `shop/`.
- `docs`, `software/app`, `software/packages/*`, `packages/*`, `web` and
  `shop` are the workspace packages. The KiCad library is not an npm package and
  must not be added to the workspace.
- Shared code that two products need lives in `packages/*`
  (`@kiboar/design`, `@kiboar/tsconfig`, `@kiboar/vite-config`). Share tokens,
  CSS, compiler and build configuration; do not share a product's screens or
  its data layer. A package with one consumer stays in that product.
- Shared versions live in the `catalog` block of `pnpm-workspace.yaml`. Use
  `"catalog:"` for React, TypeScript, Tailwind, Vite, Zod and their types instead of
  writing a new range. Medusa's own packages keep the version its template
  pins; do not move them into the catalog.
- Turborepo runs `build`, `typecheck`, `test` and `dev` for the JavaScript
  packages. Rust and the library stay outside Turbo.
- The root `.npmrc` hoists four package patterns because Medusa requires them
  at the top level of `node_modules`. Do not remove those entries.
- Vercel deploys `docs` only. Studio is a desktop application. `web` is a static
  app with no host configured yet, and `shop` is a Medusa service.

### Generated files

Generated artifacts belong to their product and are never hand-edited:

- library pages and previews → [`docs/AGENTS.md`](docs/AGENTS.md)
- 3D model inventory → [`library/AGENTS.md`](library/AGENTS.md)
- JSON Schema and TypeScript bindings → [`software/AGENTS.md`](software/AGENTS.md)

## Commands

`pnpm install` installs the JavaScript workspace once. `pnpm check` runs the
library checks, Biome, rustfmt and clippy, the JavaScript typecheck/test/build
and the Rust tests. The product files name the checks that are specific to that
product and the cases where the full `pnpm check` is not the right entry point.

## Git

- Any committed change follows **`git-workflow`**: issue → branch → pull
  request. Never commit to `main`.
- Branch name: `<prefix>/<issue>-<slug>`, for example
  `fix/5-footprint-courtyards`. Release branches keep the version:
  `release/21-1.0.0`.
- Commits: Conventional Commits with the same prefix as the branch, in English.
- Pull requests: English body with summary, testing evidence and risk;
  `Closes #N` for the issue it actually closes.
- **Do not apply the `ai-assisted` label.** The repository does not use it.
- Merging is a separate action: it needs an explicit request naming the PR and
  goes through `git-merge`. Never merge, delete a branch, force-push or change
  repository settings on your own.
- One logical change per branch. No drive-by fixes or formatting sweeps.

## Before you report

- Run the checks above and paste the real output. A claim without a command is
  not evidence.
- Read the actual diff (`git diff`, `git log main..HEAD`), not your memory of it.
- If a check could not run, say so; do not describe it as passing.
- Never claim a merge, a release or an issue closure without reading the state
  back from `gh`.
