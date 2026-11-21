# Kiboar Studio

Desktop application for the keyboards built with Kiboar components: detect the
board over USB, flash the right firmware, remap keys and visualise the layout.

**Status: M1 — read-only detection.** The shell lists bootloaders and Kiboar
boards and shows their identity. It does not flash or write. The real firmware
path is verified with a simulated report until M2 produces the first firmware.

## Documents

| File | Contents |
| --- | --- |
| [`BRIEF.md`](BRIEF.md) | What the application is, the problems it solves, scope, user journeys, identity model and success criteria |
| [`DEVELOPMENT.md`](DEVELOPMENT.md) | Risk-first milestone order, stack, repository layout, testing, CI, licensing constraints and working agreements |
| [`docs/adr/`](docs/adr/) | Architecture decision records: stack and scope, identity without an EEPROM |
| [`docs/protocol.md`](docs/protocol.md) | The HID board info report the firmware must implement |

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

The application lives in this directory. The KiCad library at the repository
root keeps its own rules in [`AGENTS.md`](../AGENTS.md) and
[`CONTRIBUTING.md`](../CONTRIBUTING.md), and nothing here changes them.
