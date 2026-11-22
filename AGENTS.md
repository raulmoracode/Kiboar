# AGENTS.md

Instructions for AI agents working in this repository. The long form for humans
is `CONTRIBUTING.md`; this file is the short, unambiguous version and the root
contract for the whole repository.

Read in this order: `README.md` → `ARCHITECTURE.md` → this file → `LABELS.md`
→ the product `AGENTS.md` for the area you are changing → `CONTRIBUTING.md` →
`NOTICE` → `CHANGELOG.md`.

## What this repository is

Kiboar is one repository with three products that are built and shipped
separately.

| Path | Contents |
| --- | --- |
| `library/` | KiCad library: symbols, footprints, 3D models, PCM and Python tools |
| `docs/` | Astro + Fumadocs documentation site, English and Spanish |
| `software/` | Kiboar Studio: Tauri app, TypeScript core and Rust crates |
| `package.json`, `pnpm-workspace.yaml`, `turbo.json` | Root JavaScript workspace for `docs` and `software` |
| `ARCHITECTURE.md` | Product boundaries, commands, versions and deployment |
| `LABELS.md` | The repository label scheme for issues and pull requests |
| `library/AGENTS.md`, `docs/AGENTS.md`, `software/AGENTS.md` | Product-specific agent rules |
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
  `pnpm-workspace.yaml` under `docs/` or `software/`.
- `docs` and `software` are the only workspace packages. The KiCad library is
  not an npm package and must not be added to the workspace.
- Shared versions live in the `catalog` block of `pnpm-workspace.yaml`. Use
  `"catalog:"` for React, TypeScript, Tailwind, Zod and their types instead of
  writing a new range.
- Turborepo runs `build`, `typecheck`, `test` and `dev` for `docs` and
  `software`. Rust and the library stay outside Turbo.
- Vercel deploys `docs` only. Studio is a desktop application.

### Generated files

Generated artifacts belong to their product and are never hand-edited:

- library pages and previews → [`docs/AGENTS.md`](docs/AGENTS.md)
- 3D model inventory → [`library/AGENTS.md`](library/AGENTS.md)
- JSON Schema and TypeScript bindings → [`software/AGENTS.md`](software/AGENTS.md)

## Commands

`pnpm install` installs the JavaScript workspace once. `pnpm check` runs the
library checks, the JavaScript typecheck/test/build and the Rust tests. The
product files name the checks that are specific to that product and the cases
where the full `pnpm check` is not the right entry point.

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
