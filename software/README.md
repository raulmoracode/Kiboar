# Kiboar Studio

Desktop application for the keyboards built with Kiboar components: detect the
board over USB, flash the right firmware, remap keys and visualise the layout.

**Status: M2 — flasher (MVP).** Detection, board catalog, UF2 inspection, typed confirmation and copy with progress and cancellation are implemented. Hardware verification and the macOS DMG are pending. Kiboar firmware identity, remap, layout and the board editor are post-MVP.

Studio is one of the three products in the [Kiboar repository](../README.md).
The KiCad library lives in [`../library/`](../library/README.md) and the
documentation site in [`../docs/`](../docs/README.md).

## Roadmap

| Stage | What it is | Status |
| --- | --- | --- |
| **0.1 MVP** | Safe flasher on macOS: detect, choose board, inspect UF2, confirm, write, cancel | Implemented; hardware test and DMG pending |
| **0.2 Identity** | Minimal firmware, PID, post-flash re-enumeration, official signature | Not started |
| **0.3 Layout** | Read-only 2D layout and local `board.json` import | Not started |
| **1.0 Remap** | VIA integration first; own implementation only if needed | Not started |
| **1.x Editor** | Board editor, exporters and firmware pipeline | Not started |

The MVP is deliberately not a configurator. See
[`DEVELOPMENT.md`](DEVELOPMENT.md#mvp-scope-01) for what is out of 0.1.

## Documents

| File | Contents |
| --- | --- |
| [`BRIEF.md`](BRIEF.md) | What the application is, the problems it solves, scope, user journeys, identity model and success criteria |
| [`DEVELOPMENT.md`](DEVELOPMENT.md) | Risk-first milestone order, stack, repository layout, testing, CI, licensing constraints and working agreements |
| [`docs/adr/`](docs/adr/) | Architecture decision records: stack and scope, identity without an EEPROM |
| [`docs/protocol.md`](docs/protocol.md) | The HID board info report the firmware must implement |
| [`AGENTS.md`](AGENTS.md) | Agent rules for Studio: workspace, commands, boundaries and checks |

## Development

The pnpm workspace root is the repository root; this directory no longer has
its own `pnpm-workspace.yaml`. From the repository root:

```bash
pnpm install
pnpm test
pnpm typecheck
pnpm build
pnpm test:rust
pnpm check:rust                  # needs the frontend build above
pnpm --filter @kiboar/studio tauri dev
```

For Studio only, use `pnpm turbo run build --filter=@kiboar/studio` and
`pnpm turbo run typecheck test --filter=@kiboar/core --filter=@kiboar/studio`.

`pnpm schema:export` regenerates `schemas/*.json` from the Zod source. CI fails
when a committed schema or TypeScript binding is stale.

## Reading order

1. `BRIEF.md` — why the application exists and what it does.
2. `DEVELOPMENT.md` — how it is built and in which order.

The application lives in this directory. The KiCad library lives in
[`../library/`](../library/) and keeps its rules in
[`../library/AGENTS.md`](../library/AGENTS.md); the repository rules are in
[`../AGENTS.md`](../AGENTS.md) and [`../CONTRIBUTING.md`](../CONTRIBUTING.md),
and nothing here changes them.
