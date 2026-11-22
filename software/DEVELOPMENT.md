# Kiboar Studio — development brief

**Version:** 1.1 · **Status:** M1 merged; M2 (flasher) in progress · **Date:** 2026-11-22

This document is the companion to [`BRIEF.md`](BRIEF.md). It defines the stack,
the order of work and the rules the implementation follows. It is deliberately
front-loaded: the hard, irreversible problems are solved before any interface is
built.

---

## 1. Development strategy

**Risk first, one vertical slice at a time.**

Each milestone answers one question that could invalidate the product, produces
a usable artefact and can be demonstrated. No milestone depends on the
interface of a later one, and no code is written for a feature that is not in
the current milestone.

The order is fixed by dependency, not by enthusiasm:

1. The board definition must exist before anything can read it.
2. Detection must work before writing anything to a device.
3. Flashing must work before remapping can be tested.
4. Remapping must work before a layout editor has a meaning.
5. The layout comes after the data it renders exists.

**Not building yet** is an explicit decision in every milestone. A capability
that is out of scope is not scaffolded, not stubbed and not hidden behind a
flag.

---

## 2. Problems mapped to milestones

| Problem | Milestone | Exit evidence |
| --- | --- | --- |
| P1 — no board artefact | M0 | Schema, three fixtures, registry format, validator tests |
| P2 — manual, opaque flashing | M2 | A blank RP2040 flashed and verified; wrong model blocked; recovery documented |
| P3 — remapping needs QMK knowledge | M3 | One key remapped and persisted across a power cycle |
| P4 — layout invisible after fabrication | M4 | 2D layout rendered from the board definition |
| P5 — CAD, firmware and keymap drift | M0 + M4 | One definition generates the exports and the firmware build |

---

## 3. Milestones

### M0 — Contract

**Question:** can a board be described completely enough that firmware, UI and
flasher are derived from it?

**Deliverables**

- `packages/core/src/schema/` with the Zod schema for `kiboar.board/1` and an
  exported `schemas/board.schema.json`.
- Three definitions in `boards/`: a macropad, a 60% HHKB and a split board.
- `registry/index.json` format: board ids, revisions, firmware versions,
  artefact paths, SHA-256 and signature.
- ADR-0001: stack and scope. ADR-0002: identity without an EEPROM.
- Validation tests: three valid fixtures accepted, at least five invalid ones
  rejected with a readable error.

**Acceptance:** `pnpm test` passes; the JSON Schema is generated from the Zod
source and is usable by non-TypeScript tools; no Tauri, UI or USB code exists.

**Not in M0:** the application shell, any dependency on a device, any firmware.

---

### M1 — Detection, read-only

**Question:** can the application see a board and say what it is?

**Deliverables**

- Tauri 2 shell in `app/` with a minimal screen.
- Rust commands: `list_devices`, `read_board_info`.
- Device state machine: `idle → detecting → bootloader | kiboar | unknown`.
- HID query for `board_id`, hardware revision, firmware version and protocol
  version.
- `docs/protocol.md`: the board info report, its CRC and its validation rules.
- `ts-rs` bindings generated from the Rust types.
- Typed IPC between Rust and the frontend.

**Acceptance:** an RP2040 in bootloader is detected by USB id; a valid Kiboar
board info report, real or simulated, is parsed and its `board_id` displayed
(M2 produces the first firmware, so the simulated report is the gate until
then); unknown devices are ignored; nothing is written to any device.

**Not in M1:** flashing, keymap writes, board selection.

---

### M2 — Flasher

**Question:** can a blank board be flashed safely, and can a wrong choice be
recovered?

**Deliverables**

- Bootloader detection and model selector filtered by the detected MCU.
- Hardware revision selection and local `board.json` import.
- Confirmation dialogue with board, revision, firmware, origin and SHA-256.
- Artefact verification before writing.
- UF2 flashing by copying to the mounted volume, then verification by
  re-enumeration and `read_board_info`.
- Cancellation, progress events and a recovery screen.
- Unofficial-firmware path with an explicit warning and typed confirmation.

**Acceptance:** a blank RP2040 Zero is flashed from the application and
re-enumerates as Kiboar; an artefact with a bad digest is rejected; interrupting
a flash leaves the board recoverable; no flash starts without confirmation.

**Not in M2:** PICOBOOT, STM32, ESP32-S3, automatic updates.

---

### M3 — Remap

**Question:** can the application change a key and make it stick?

**Deliverables**

- VIA protocol implementation in `packages/core` (report size, commands,
  dynamic keymap, layers).
- `read_keymap` and `write_keymap` commands.
- Keymap screen with layer tabs and key capture.
- QMK firmware with VIA enabled for the reference board, built in CI.
- Fixtures for protocol responses, including malformed ones.

**Acceptance:** one key is remapped, the keyboard is unplugged and reconnected,
and the change is still there; malformed device responses produce a readable
error and no crash.

**Not in M3:** macros, tap-dance, RGB.

---

### M4 — Layout and board editor

**Question:** can a user create a board definition and get working firmware from
it?

**Deliverables**

- 2D SVG layout rendered from the board definition.
- Board editor with live schema validation: matrix, pins, keys, layers.
- Import and export of `board.json`.
- Exporters: QMK `info.json` and VIA definition.
- Firmware build pipeline for the reference board.

**Acceptance:** a board created from scratch passes the schema, exports both
files, the firmware builds in CI and flashes; the rendered layout matches the
definition.

**Not in M4:** 3D, DXF plate export, RGB, split, wireless.

---

### Future backlog

3D visualisation, per-key RGB, macros, split and ZMK, STM32 and ESP32-S3,
native PICOBOOT, application auto-update, board code or QR, additional
exporters. Each one gets its own issue and milestone when the previous one is
stable.

---

## 4. Stack

| Layer | Choice | Reason |
| --- | --- | --- |
| Desktop shell | **Tauri 2** | Small binary, system webview, Rust for USB |
| Frontend | **React 19 + TypeScript 7 + Vite** | Already the stack of `docs/`; strong typing and HMR |
| Styling | **Tailwind CSS 4 + Radix UI** | Tailwind is already used in `docs/`; Radix provides real accessibility |
| State | **Zustand** | The flow is a finite state machine, not a web application |
| Forms | **react-hook-form + Zod** | Board editor with immediate validation |
| Schema | **Zod → JSON Schema** | One source of truth in TypeScript, consumable by non-TS tools |
| IPC types | **`ts-rs`** | TypeScript bindings generated from the Rust types; the CI fails when they drift |
| i18n | **i18next + react-i18next** | English and Spanish catalogues |
| 2D | **SVG rendered by React** | Crisp, accessible, selectable; no canvas dependency |
| Icons | **lucide-react** | Already used in `docs/` |
| USB | **`nusb`** (Rust) | Enumeration and transfers without a system libusb dependency |
| HID | **`hidapi`** (Rust) | Native HID stack on macOS, Windows and Linux |
| Verification | **`sha2` + `minisign-verify`** | Digest and signature checks before flashing |
| Logs | **`tracing` + `tauri-plugin-log`** | Local logs for support, no telemetry |
| Tests | **Vitest + Testing Library + Playwright + `cargo test`** | See section 8 |
| Quality | **Biome + `cargo clippy` + `cargo fmt`** | One standard for both sides |
| Packages | **Root pnpm workspace + Turborepo** | One lockfile for docs and Studio; cached tasks and shared versions through the catalog |

Versions of React, TypeScript, Tailwind and lucide come from the `catalog` block
of the root `pnpm-workspace.yaml`, so the repository upgrades them once.

**Explicitly not used:** Electron, Next.js, Redux, SQLite, CSS-in-JS, 3D
libraries, shell sidecars. Each one adds a cost the current scope does not
justify.

---

## 5. Repository layout

```text
Kiboar/                     # repository and pnpm workspace root
  package.json · pnpm-workspace.yaml · pnpm-lock.yaml · turbo.json
  docs/                     # kiboar-docs
  software/
    Cargo.toml              # Rust workspace
    tsconfig.base.json
    app/                    # @kiboar/studio: React + Vite frontend
    app/src-tauri/          # Tauri shell: USB/HID enumeration and commands
    crates/kiboar-device/   # Pure types, bootloader table and HID report parser
    packages/core/          # @kiboar/core: schema, matrix, VIA, exporters
    boards/                 # Board definitions
    registry/               # Index and signed firmware metadata
    schemas/                # Exported JSON Schema
    docs/adr/               # Architecture decision records
    docs/protocol.md        # HID board info contract
```

There is no nested pnpm workspace: `docs` and `software` are packages of the
root workspace, and one lockfile covers both.

Two Rust crates, split when the single crate started to hurt: `kiboar-device`
holds the pure device types, the bootloader table and the report parser, so its
tests never compile Tauri; `kiboar-studio` holds the Tauri shell, `nusb`,
`hidapi` and the commands. The split keeps the fast test loop small and keeps
platform code out of the contract.

---

## 6. Architecture rules

1. **`core` is pure.** No DOM, no Node, no Tauri imports. It runs in Vitest and
   could run in a CLI.
2. **IPC is typed.** Commands are generated into TypeScript; a signature change
   breaks compilation instead of runtime.
3. **Device input is untrusted.** Report length, `board_id`, strings and digests
   are validated before use. A malformed response is an error, not a crash.
4. **No blocking on the UI thread.** `hidapi` is synchronous and runs in
   `spawn_blocking`.
5. **Every long operation is cancellable.** A flash or a read exposes a cancel
   command and emits progress events.
6. **Least privilege.** Tauri capabilities cover only the plugins in use. No
   global filesystem access, no open shell.
7. **No hidden writes.** The only write paths are flashing and keymap writes, and
   both require an explicit user action naming the target.
8. **Logs are local.** Structured logs go to a file for support. No telemetry.
9. **Errors are user-facing.** Rust returns typed errors; the UI shows an
   actionable message in the active language.

---

## 7. Data contracts and versioning

- **Board definition:** `kiboar.board/1`. Additive changes stay in v1; a breaking
  change creates v2 plus a migration.
- **Registry:** `kiboar.registry/1`. The application embeds a snapshot and
  verifies the index and each artefact with the embedded public key.
- **Firmware:** versioned independently; it reports `board_id`, `hw_rev`,
  `fw_version` and `protocol_version`.
- **Application:** versioned independently from the three above.
- **Local settings:** JSON in the Tauri app-config directory. No database in the
  first version.

---

## 8. Testing

| Level | Tool | Covers |
| --- | --- | --- |
| Core unit | Vitest | Schema, matrix, VIA protocol, exporters |
| Components | Testing Library | Selector, confirmation, editor |
| UI end-to-end | Playwright against Vite with **mocked IPC** | Complete flows without hardware |
| Rust | `cargo test` | UF2 parsing, signature verification, malformed HID responses |
| Hardware | Manual checklist and a small HIL script | Real flashing on an RP2040 Zero |

`tauri-driver` does not reliably cover macOS, so the project does not promise
native E2E on all three platforms. UI E2E runs with mocked IPC; real flashing is
verified on hardware and recorded in the milestone evidence.

Every bug fixed in the protocol or the flasher gets a regression test at the
lowest level that can express it.

---

## 9. CI and release

- A dedicated workflow filtered on `software/**`, plus the root workspace
  files. The KiCad lint, format-upgrade and docs jobs are separate.
- Fast job: `pnpm turbo run typecheck test` for `@kiboar/core` and
  `@kiboar/studio`, then the schema-staleness check.
- Build job: `pnpm turbo run build --filter=@kiboar/studio`; the Rust job runs
  `cargo test` and `cargo check` against `software/Cargo.toml`.
- Docs deploy on Vercel from `docs/`; Studio is desktop and has no Vercel
  target.
- Release job on tag: signed artefacts and notarised macOS build.
- Three independent versions: application, firmware, registry.
- Two independent signatures: the application update (Tauri) and the firmware
  artefacts (`minisign`). The firmware public key is embedded in the application.

---

## 10. Licensing constraints

- **The application is MIT.**
- **QMK is GPL-2.0.** Firmware built on QMK is published from its own pipeline
  with the corresponding source available. The application downloads signed
  binaries and links to the source; it does not copy QMK code into `core`.
- **VIA:** the protocol is implemented independently. No VIA or QMK source is
  vendored into the MIT application.
- **Keycodes:** generated from the public USB HID usage tables, with the origin
  documented. Any vendored data is licence-checked and attributed; if in doubt,
  it is not vendored.
- **`NOTICE`** changes only if third-party assets are added.

This is also why QMK is not a submodule of this repository: it would change the
scope and the licence of the library.

---

## 11. Risk register

| Risk | Trigger | Mitigation |
| --- | --- | --- |
| No board definitions are adopted | M0 produces files nobody uses | Ship three real fixtures and use one in the flasher demo |
| Wrong model selected on a blank board | User flashes the wrong revision | MCU-filtered selector, separate revision, confirmation, documented recovery, HIL test |
| UF2 volume detection differs per OS | M2 fails on Windows or Linux | Test matrix from M2; PICOBOOT native is the fallback |
| QMK build matrix grows out of control | More boards than can be built | One reference board in M2-M4; add boards only with CI |
| GPL compliance is discovered late | Firmware distribution starts | Separate firmware pipeline and source offer from the first release |
| Tauri webview differences | Layout or focus breaks on one OS | Visual and keyboard test matrix |
| USB permissions | Linux needs udev rules; Windows needs WinUSB for some modes | Document and test per OS; no assumption of a driver-free path |
| Scope creep | 3D, RGB or macros appear in an early milestone | Explicit "not in this milestone" lists and a milestone gate |
| Keyswitches are absent (#46) | Editor depends on switch footprints | Abstract positions only; no KiCad export dependency |
| Signing and notarisation delay release | First public build | Plan certificates before the first public release |

---

## 12. Working agreements

- One logical change per branch: issue → branch → pull request. No direct
  commits to `main`.
- Conventional Commits in English, with the same prefix as the branch.
- Every architectural decision that is hard to reverse gets an ADR in
  `software/docs/adr/`.
- The pnpm workspace root is the repository root. Do not add a nested
  workspace; shared versions go in the `catalog` block of
  `pnpm-workspace.yaml`.
- Vercel deploys `docs` only. Studio is a desktop application.
- The briefs are living documents: when a milestone changes scope, the brief
  changes in the same pull request.
- No drive-by changes to the KiCad library, the docs site or the CI of the
  library.
- A milestone closes only with its acceptance evidence and a recorded demo.

---

## 13. Definition of done per milestone

- Every acceptance criterion in the milestone is met.
- The relevant tests exist and were run; the output is in the pull request.
- The affected brief or ADR is updated.
- The risk register reflects anything new.
- Nothing from a later milestone was built to "save time".

---

## 14. Assumptions that would change this plan

- **UF2 by mounted volume is unreliable on a target OS** → promote native
  PICOBOOT into M2.
- **QMK/VIA licensing blocks distribution** → move the firmware to a permissive
  stack (ZMK, or a separate project) or distribute source only and revisit.
- **Board definitions are not adopted by makers** → the application becomes a
  generic QMK tool, and the reference-board strategy is reconsidered.
- **VIA changes its protocol or stops fitting the scope** → pin the supported
  protocol version and evaluate ZMK Studio for the wireless path.
- **Users already live in VIA** → prioritise flashing and layout over remapping,
  which VIA already does well.

These are the assumptions to test first. If one fails, the plan changes before
more code is written.
