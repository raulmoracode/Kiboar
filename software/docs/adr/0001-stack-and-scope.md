# ADR-0001: Stack and scope for Kiboar Studio v1

- Status: Accepted
- Date: 2026-11-21
- Deciders: Kiboar maintainer
- Related: [BRIEF.md](../../BRIEF.md) · [DEVELOPMENT.md](../../DEVELOPMENT.md) · [ADR-0002](0002-identity-without-eeprom.md)

## Context

Kiboar Studio is the desktop application for keyboards built with Kiboar
components: it detects the board over USB, shows its layout, remaps keys and
flashes the correct firmware when the board is empty or outdated. The reference
experience is Razer Synapse, but the hardware and firmware are open and the
application builds on QMK and the VIA protocol rather than inventing either.

The repository today is a KiCad 10 component library with no boards, no matrix,
no keymap and no firmware, so the first artefact must be the Kiboar board
definition, and the stack has to make it the source of truth for firmware,
editor, visualiser and flasher. Two constraints bound every choice: the app works
offline (the registry ships with it; no account, cloud or telemetry), and no
milestone builds a later milestone's feature.

## Decision

### Desktop shell

Tauri 2 at 100%, no Electron. It keeps the binary small and uses the system
webview. Rust is limited to what the webview cannot reach: USB/HID, files and
signature verification. No business rule lives in Rust that `core` can own.

### Frontend

React 19 + TypeScript 7 + Vite, the stack `docs/` already uses; Tailwind CSS 4 +
Radix UI, where Radix supplies real accessibility for the selector and the
confirmation dialogue; Zustand, because the flow is a finite state machine and
not a web application; react-hook-form + Zod for an editor that validates as the
user types; i18next for the English and Spanish catalogues; 2D layout as SVG
rendered by React, so it stays crisp, accessible and selectable without a canvas
dependency; lucide-react for icons, as in `docs/`.

### Rust, packaging and tests

`nusb` for USB without a system libusb dependency; `hidapi` for HID, run in
`spawn_blocking` as it is synchronous; `sha2` + `minisign-verify` for digests;
`tracing` + `tauri-plugin-log` for local logs. Packages use pnpm workspaces;
`docs/` keeps npm. Tests: Vitest for `core`, Testing Library for components,
Playwright with mocked IPC for whole flows without hardware, `cargo test` for UF2
parsing, signatures and malformed HID responses.

### Contract before interface

`packages/core` is pure TypeScript: no DOM, no Node, no Tauri imports. IPC is
typed, so a signature change breaks compilation instead of runtime. Zod is the
source of truth for `kiboar.board/1`, and `schemas/board.schema.json` is exported
from it so non-TypeScript tools read the same contract.

### Scope of v1

In: the RP2040 reference board (a 60% HHKB on an RP2040 Zero is the
recommended candidate), QMK + VIA protocol, manual first flash, a model selector
filtered by MCU, a mandatory confirmation, the 2D layout and board editor, an
EN/ES UI, and offline operation.

Out: 3D, RGB, macros, wireless/split with ZMK, STM32/ESP32, cloud, telemetry,
DRM. Out of scope means the milestone does not exist yet; it is not scaffolded,
not stubbed and not hidden behind a flag.

### Milestone order

M0 contract → M1 read-only detection → M2 flasher → M3 remap → M4 layout and
editor. Each milestone answers a question that could invalidate the product and
never depends on a later milestone's interface.

## Consequences

### Positive

- One small, auditable shell, with USB and HID in Rust and UI in TypeScript.
- The schema is written once and consumed by the editor, the exporters, the
  firmware build and non-TypeScript tools.
- Playwright with mocked IPC exercises whole flows on CI without hardware.

### Negative / trade-offs

- Tauri inherits webview differences per OS, so layout and focus need a visual
  and keyboard matrix; `tauri-driver` cannot promise native E2E everywhere.
- USB permissions are not free: udev rules on Linux, WinUSB on Windows.
- Copying UF2 to a mounted volume may differ per OS, so native PICOBOOT is a
  documented fallback, not a plan.
- Rust and TypeScript mean two toolchains and two test runners.

## Alternatives considered

- **Electron.** Rejected: it ships a Node runtime and a browser for no benefit.
- **Web-only.** Rejected: WebUSB does not reach HID or mass storage, WebHID is
  Chromium-only, and the first flash depends on both.
- **Cloud-first.** Rejected: the product must work offline; a remote registry
  would make the flasher useless without a network.
- **Writing custom firmware.** Rejected: it costs an ecosystem, not a feature.
  QMK already provides the matrix, the keymap and VIA.
- **ZMK now.** Deferred: ZMK is the wireless and split path, and v1 is wired.
- **SQLite, a router, Redux.** Rejected: settings are JSON, the app has one
  state machine and no routes, and Zustand covers the state.

## Follow-up

- M0 publishes the Zod schema, three board fixtures and the registry format.
- Revisit the stack only if a named `DEVELOPMENT.md` assumption fails: UF2 by
  mounted volume unreliable, VIA outgrowing the scope, QMK licensing blocking.
- New boards, MCUs and exporters enter through their own milestone, not by
  widening v1.
