# Kiboar Studio

Desktop application for the keyboards built with Kiboar components: detect the
board over USB, flash the right firmware, remap keys and visualise the layout.

**Status: M2 — flasher (MVP).** Detection, board catalog, UF2 inspection, typed confirmation and copy with progress and cancellation are implemented. The macOS `.app`/`.dmg` build works; the release workflow and installation paths exist. Hardware verification is still pending. Kiboar firmware identity, remap, layout and the board editor are post-MVP.

Studio is one of the products in the [Kiboar repository](../README.md).
The KiCad library lives in [`../library/`](../library/README.md) and the
documentation site in [`../docs/`](../docs/README.md).

## Roadmap

| Stage | What it is | Status |
| --- | --- | --- |
| **0.1 MVP** | Safe flasher on macOS: detect, choose board, inspect UF2, confirm, write, cancel | Implemented; DMG build works; release and hardware test pending |
| **0.2 Identity** | Minimal firmware, PID, post-flash re-enumeration, official signature | Not started |
| **0.3 Layout** | Read-only 2D layout and local `board.json` import | Not started |
| **1.0 Remap** | VIA integration first; own implementation only if needed | Not started |
| **1.x Editor** | Board editor, exporters and firmware pipeline | Not started |

The MVP is deliberately not a configurator. See
[`DEVELOPMENT.md`](DEVELOPMENT.md#mvp-scope-01) for what is out of 0.1.

## Install (0.1)

The build is unsigned and not notarized. Homebrew is the recommended path:

```bash
brew tap raulmoracode/kiboar
brew trust --cask raulmoracode/kiboar/kiboar-studio
brew install --cask kiboar-studio
```

There is also an installer script that verifies the published SHA-256, installs
into `~/Applications` and removes the quarantine attribute from that copy:

```bash
curl -fsSL https://raw.githubusercontent.com/raulmoracode/Kiboar/main/software/scripts/install-macos.sh -o /tmp/install-kiboar.sh
less /tmp/install-kiboar.sh
bash /tmp/install-kiboar.sh
```

The manual DMG steps, the Gatekeeper explanation and the uninstall commands are
in [`INSTALL.md`](INSTALL.md).

## Documents

| File | Contents |
| --- | --- |
| [`BRIEF.md`](BRIEF.md) | What the application is, the problems it solves, scope, user journeys, identity model and success criteria |
| [`DEVELOPMENT.md`](DEVELOPMENT.md) | Risk-first milestone order, stack, repository layout, testing, CI, licensing constraints and working agreements |
| [`INSTALL.md`](INSTALL.md) | Installing the unsigned macOS build with Homebrew, the script or the DMG |
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
pnpm --filter @kiboar/studio tauri build   # .app and .dmg for macOS
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
