# AGENTS.md — Kiboar Studio

This file covers Kiboar Studio in `software/`. Read the root
[`AGENTS.md`](../AGENTS.md) first: the Git, licensing and repository-wide rules
there apply here and are not repeated.

## What this product is

Kiboar Studio, the desktop application for Kiboar keyboards, whether bought
assembled or built from the published design. Built with Tauri 2, React 19,
TypeScript 7 and Rust. M1 is merged. M2 is implemented: detection, registry, UF2
inspection, typed confirmation and copy with progress and cancellation.
Hardware verification is pending. The MVP is the flasher; firmware identity,
remap, layout, editor and i18n are post-MVP.

The same build serves the customer and the maker: neither path may require the
other, and nothing in Studio may assume the board was bought.

## Layout

- `app/` — `@kiboar/studio`: the React frontend and the Tauri shell.
  - `app/src-tauri/` — Rust shell: USB/HID enumeration, commands and the
    platform boundary.
- `packages/core/` — `@kiboar/core`: pure TypeScript schema and validation for
  the board and registry definitions. VIA and exporters arrive in later
  milestones.
- `crates/kiboar-device/` — pure Rust types, bootloader table and HID report
  parser. No Tauri, no USB.
- `crates/kiboar-flash/` — pure Rust UF2 parsing, digest and signature
  verification, and artefact copy. No Tauri, no USB, no filesystem paths.
- `boards/`, `registry/`, `schemas/` — the board definitions, the artefacts
  index and the generated JSON Schema. The index has no firmware entries and
  nothing is signed yet.
- `docs/adr/`, `docs/protocol.md` — decisions and the HID identity contract.

## Boundaries

- **The MVP is the flasher.** Do not build remap, layout, board editor,
  exporters, Spanish or signing in 0.1. They are post-MVP stages in the README
  roadmap and [ADR-0004](docs/adr/0004-safety-principles-and-contracts.md).
- **Bundled resources are part of the contract.** `registry/` and `boards/` are
  copied into the app's resource directory. If the catalog is empty in a
  bundled build, check `Contents/Resources` before anything else.
- **The workspace root is the repository root.** There is no nested
  `pnpm-workspace.yaml` under `software/`. Use the root catalog for shared
  versions.
- **The frontend uses the shared design system.** Style with Tailwind
  utilities; the base CSS and tokens come from `@kiboar/design` and the Vite
  setup from `@kiboar/vite-config`, with the Tauri overrides in
  `app/vite.config.ts`. Do not copy the base CSS or the plugins again.
- **`@kiboar/core` is pure TypeScript.** No DOM, no Node, no Tauri imports.
  It is the source of truth for the board and registry schemas.
- **`kiboar-device` is pure Rust.** No Tauri, no `nusb`, no `hidapi`. Platform
  code belongs in `app/src-tauri`.
- **`kiboar-flash` is pure Rust.** No Tauri, no USB and no OS-specific volume
  detection. It validates and copies bytes; the application finds the volume
  and removes a partial file after a failed or cancelled copy.
- **Device input is untrusted.** Validate report lengths, checksums, board ids
  and errors before using them.
- **TypeScript bindings are generated.** `ts-rs` writes
  `app/src/lib/bindings/`; do not edit those files by hand. A test and the CI
  diff fail when they drift.
- **JSON Schema is generated.** `schemas/board.schema.json` and
  `schemas/registry.schema.json` come from `@kiboar/core`; run
  `pnpm schema:export`.
- **M1 is read-only.** Do not add a path that writes to a device without the M2
  verification, confirmation and recovery design.
- **No telemetry, no cloud, no secrets.** Logs are local and support only.
- **Update the ADRs when a decision changes.** A protocol change belongs in
  `docs/protocol.md`; an architectural decision belongs in `docs/adr/`.
- **Vercel is for docs only.** Studio is a desktop app.

## Commands

From the repository root:

```bash
pnpm install
pnpm lint:studio
pnpm lint:rust
pnpm turbo run typecheck test --filter=@kiboar/core --filter=@kiboar/studio
pnpm turbo run build --filter=@kiboar/studio
pnpm test:rust
pnpm check:rust                  # needs the frontend build above
pnpm schema:export
pnpm --filter @kiboar/studio tauri dev
pnpm --filter @kiboar/studio tauri build   # needs macOS for a bundle
```

Rust can also be run from `software/` with `cargo test -p kiboar-device`.

## Before a PR

- `pnpm lint:studio` passes.
- `pnpm lint:rust` passes.
- `pnpm turbo run typecheck test --filter=@kiboar/core --filter=@kiboar/studio`
  passes.
- `pnpm turbo run build --filter=@kiboar/studio` passes.
- `pnpm test:rust` passes.
- `pnpm check:rust` passes after the build.
- `git diff --exit-code -- software/schemas` is clean after
  `pnpm schema:export`.
- `git diff --exit-code -- software/app/src/lib/bindings` is clean after the
  Rust tests.
- Paste the real command output in the pull request, and say what could not be
  tested (hardware, GUI, another OS).

## Labels

| Label | When |
| --- | --- |
| `product:studio` | Every issue or pull request that touches `software/` |
| Exactly one `type:*` from [`../LABELS.md`](../LABELS.md) | Matches the title prefix; usual here: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `build`, `ci`, `release` |
| `risk:consequential` | A schema, protocol, install or integration change |
| `risk:sensitive` | Only if authentication, personal data or deletion is involved; not expected today |

If the change also touches the library, docs or root CI, add that product's
label too. The full policy is [`../LABELS.md`](../LABELS.md). Do not use
`area:*` for new work.

## Git

Follow the root `AGENTS.md`: issue → branch → pull request. Use
`feat/<issue>-<slug>`, `fix/<issue>-<slug>` or `docs/<issue>-<slug>` and a
Conventional Commit with the same prefix. Do not commit `dist/` or `target/`.
The generated bindings are committed, but only after `cargo test` regenerates
them.
