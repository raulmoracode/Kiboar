# ADR-0003: Root pnpm workspace and Turborepo

> **Update 2026-11-22:** the KiCad library moved from the repository root into
> `library/`. The workspace decision is unchanged; see `ARCHITECTURE.md` and
> `library/AGENTS.md`. The paragraph below describes the context at the time of
> the decision.
>
> **Update 2026-11-27:** the workspace now also includes `packages/*`, `web`,
> `shop`, `shop/storefront` and `shop/pos`. The decision and the task graph are
> unchanged; see `pnpm-workspace.yaml`.

- Status: Accepted
- Date: 2026-11-21
- Deciders: Kiboar maintainer
- Related: [ADR-0001](0001-stack-and-scope.md) · [ARCHITECTURE.md](../../../ARCHITECTURE.md)

## Context

The repository has three products: the KiCad library at the root, the
documentation site in `docs/` and Kiboar Studio in `software/`. The library is
not a JavaScript package; the other two are. Before this decision, `docs/` used
npm and `software/` had its own pnpm workspace, so the repository had two
lockfiles, two installs and two places to keep React, TypeScript, Tailwind and
Zod in sync.

The library cannot move: `${KIBOAR_ROOT}`, `lib-table-files`, the model paths
and the PCM package all depend on `symbols/`, `footprints/` and `3dmodels/`
being at the root.

## Decision

- One pnpm workspace at the repository root, covering `docs`, `software/app`
  and `software/packages/*`. There is no nested workspace and one lockfile.
- Shared versions live in the `catalog` block of `pnpm-workspace.yaml`; a
  package declares `"catalog:"` instead of repeating a range.
- Turborepo runs `build`, `typecheck`, `test` and `dev` for the JavaScript
  packages, with per-package caching.
- The KiCad library, its Python tools and the PCM stay outside Turborepo and
  keep their own CI workflow and `pnpm library` script.
- The Rust crates keep their own Cargo workspace and CI job; Turborepo does not
  run `cargo`.
- The documentation deploys on Vercel with `docs` as the project Root
  Directory; Vercel installs from the workspace root and publishes
  `docs/dist`. Studio is a desktop application and has no Vercel target.

## Consequences

### Positive

- One install and one lockfile for the two JavaScript products.
- React, TypeScript, Tailwind and Zod cannot drift between docs and Studio.
- One command runs the JavaScript task graph, and Turbo skips work whose inputs
  did not change.
- The library install contract is untouched, so existing clones and the PCM
  package keep working.
- Docs and Studio can share a package later without a new repository.

### Negative / trade-offs

- `docs` moves from npm to pnpm; its build and lockfile change.
- The root lockfile is larger and every JavaScript change touches it.
- Turborepo adds `turbo.json` and a task-cache concept; with two apps the
  caching gain is modest today.
- There are still two toolchains (pnpm/Turbo and Cargo), and the library stays
  outside both.

## Alternatives considered

- **Keep npm for docs and pnpm for Studio.** Rejected: two lockfiles and no
  shared version catalog, which is the problem this decision addresses.
- **Nx.** Rejected: heavier generators and plugins for two JavaScript projects.
- **Moon.** Deferred: it can model Rust and Python in one graph, but adds a
  toolchain and configuration layer that the current task set does not need.
- **Bazel or Pants.** Rejected: disproportionate for three products.
- **Move the library into the workspace.** Rejected: breaks `${KIBOAR_ROOT}`,
  the PCM layout and every existing clone for no functional gain.

## Follow-up

- Add Changesets if the Studio packages start sharing a version or publishing.
- Add a remote Turborepo cache only if CI build time justifies it.
- Keep the library CI path-filtered so a JavaScript change does not run KiCad.
