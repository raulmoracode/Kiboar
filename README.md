<p align="center">
    <img src="logo.svg" alt="Kiboar logo" width="240">
</p>

<p align="center">
    <a href="https://www.kicad.org"><img src="https://img.shields.io/badge/KiCad-10.0-1f6feb" alt="KiCad 10.0"></a>
    <a href="NOTICE"><img src="https://img.shields.io/badge/license-MIT%20%2B%20third--party-lightgrey" alt="MIT plus third-party content"></a>
</p>

# Kiboar

Kiboar is one repository with three products for building mechanical keyboards:
the **KiCad component library**, the **documentation site** and **Kiboar Studio**.
They are built and shipped separately and share a repository, a review flow and
a CI pipeline.

| Product | Path | README | What it is |
| --- | --- | --- | --- |
| KiCad library | `library/` | [`library/README.md`](library/README.md) | 145 symbols and 173 footprints in 26 footprint libraries, with 3D models, PCM packaging and the library tools |
| Documentation | `docs/` | [`docs/README.md`](docs/README.md) | The Astro + Fumadocs site, English and Spanish |
| Kiboar Studio | `software/` | [`software/README.md`](software/README.md) | The Tauri desktop application: detect, flash, remap and visualise a board |

📖 **Documentation:** <https://kiboar.raulmoracode.com/docs> — English and Spanish.

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

## Repository

- [`ARCHITECTURE.md`](ARCHITECTURE.md) — product boundaries, the workspace,
  commands, versions and deployment.
- [`AGENTS.md`](AGENTS.md) — the repository rules. Each product adds its own:
  [`library/AGENTS.md`](library/AGENTS.md),
  [`docs/AGENTS.md`](docs/AGENTS.md) and
  [`software/AGENTS.md`](software/AGENTS.md).
- [`LABELS.md`](LABELS.md) — the label scheme for issues and pull requests.
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — how to contribute and what a pull
  request must include.
- [`CHANGELOG.md`](CHANGELOG.md) — changes to the KiCad library and the PCM
  package. The docs site and Studio have independent versions; see
  `ARCHITECTURE.md`.
- [`NOTICE`](NOTICE) — third-party origins and licences.

`docs` and `software` share one pnpm workspace, one lockfile and a Turborepo
task graph at the root. The KiCad library has its own CI workflow and its own
Python tooling; it is not an npm package. `pnpm check` runs the library checks,
the JavaScript typecheck, tests and build, and the Rust tests.

## Requirements

| Product | Needs |
| --- | --- |
| KiCad library | KiCad 10.0 or newer, Python 3 |
| Documentation | Node 22.23.4 or newer, pnpm 12 |
| Kiboar Studio | Node 22.23.4 or newer, pnpm 12, a Rust toolchain and the Tauri system dependencies |

The KiCad files use the KiCad 10 format; KiCad 8 and 9 cannot open them.

## Licensing

Kiboar is a **mixed-licence collection**, because of fifteen imported symbols in
the library: original work is MIT, and those fifteen keep the licence of their
source. The full split, the attribution requirements and the evidence are in
[`NOTICE`](NOTICE) and [`library/README.md`](library/README.md#licensing). The
documentation site and Studio are MIT.

## Credits

Third-party origins and credits are listed in [`NOTICE`](NOTICE) and
[`library/README.md`](library/README.md#credits).
