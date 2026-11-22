# Kiboar Studio — application brief

**Version:** 1.1 · **Status:** active — M1 implemented, M2 in progress · **Date:** 2026-11-22

---

## 1. Summary

Kiboar Studio is a desktop application for the keyboards built with Kiboar
components. It detects the board over USB, shows its layout, remaps keys and
flashes the correct firmware when the board is empty or needs an update.

The reference experience is Razer Synapse, but the hardware and the firmware are
open. Kiboar Studio does not invent firmware or a protocol: it builds on QMK and
the VIA protocol in the first version, and on ZMK for wireless boards later.

At the start of the project the repository was only a KiCad 10 component
library. It had no boards, no matrix, no keymap and no firmware. The
application therefore starts by creating the artefact that does not exist yet:
a **Kiboar board definition**, a single file that describes the model, the MCU,
the matrix and the keys, and from which the firmware, the editor, the visualiser
and the flasher are all derived.

---

## 2. The problems this application must solve

| # | Problem | Consequence today |
| --- | --- | --- |
| P1 | A CAD library is not a board. Kiboar has footprints, not a definition of "the Kiboar 60%". | No application can know which keyboard is connected, which matrix it has or which firmware belongs to it. |
| P2 | Flashing is manual and opaque. The user drags a `.uf2` without the tool knowing what it is or which board it targets. | Wrong firmware on the wrong board can drive the wrong pins and damage the keyboard. |
| P3 | Remapping requires QMK, VIA and keycode knowledge, plus the correct JSON for the board. | Most makers can build the board but cannot change a key without following a guide. |
| P4 | The layout and the matrix live only in KiCad. Once the board is printed, the design is invisible. | The user cannot see what the board is, what each key does or whether the firmware matches the hardware. |
| P5 | CAD, firmware, keymap and documentation drift apart. | The board, the firmware and the guide describe different keyboards. |

The application is successful when a maker can go from a printed PCB to a
working, remapped keyboard without leaving the application, and the application
can explain what it is about to do before it does it.

---

## 3. Users

- **The maker** prints a Kiboar PCB at home, populates it and needs firmware.
- **The kit builder** assembles a board from parts and wants the layout and the
  default keymap to match what was advertised.
- **The maintainer** publishes board definitions and firmware and needs a single
  pipeline that keeps them consistent.

All three share one constraint: they are not expected to know QMK internals.

---

## 4. What it is and what it is not

**It is:**

- a guided flasher: empty board → bootloader → correct firmware;
- a configurator: keymap, layers and encoders;
- a 2D layout visualiser and board-definition editor;
- a registry: which models exist, which firmware belongs to each and whether it
  is verified;
- an offline application: no account, no cloud, no telemetry.

**It is not:**

- a certification programme for third-party "Kiboar compatible" products;
- a firmware written from scratch;
- a KiCad replacement or a PCB editor;
- a cloud profile service;
- a DRM or licensing system for open hardware;
- a 3D product in the first version. 3D is a later, separate decision.

---

## 5. Scope of the first version

### In scope

- `board.json` schema v1 and a validator.
- A registry of board definitions and signed firmware artefacts.
- Detection of an RP2040 board in bootloader mode and of a board running Kiboar
  firmware.
- Model selection filtered by the detected MCU, with hardware revision and
  import of a local `board.json`.
- A mandatory confirmation dialogue before any flash.
- UF2 flashing with verification by re-enumeration and a documented recovery.
- Keymap and layer read/write over the VIA protocol.
- 2D layout rendering from the board definition.
- A board-definition editor with live validation.
- QMK and VIA export for the reference board.
- English and Spanish UI.

### Out of scope

- 3D rendering and STEP models.
- Per-key RGB, effects and lighting.
- Macros and tap-dance.
- Wireless, split and ZMK.
- STM32 and ESP32 flashing.
- Editing KiCad schematics or PCBs.
- Cloud profiles, accounts and telemetry.
- Automatic application updates in the early milestones.

Out-of-scope does not mean rejected. It means the milestone that delivers it
does not exist yet, and the architecture must not pretend it does.

---

## 6. Core concepts

### Board definition

A versioned JSON document, validated against a published schema. It is the
single source of truth for a model:

```jsonc
{
  "schema": "kiboar.board/1",
  "board_id": "kb60-hhkb",
  "name": "Kiboar 60% HHKB",
  "hw_rev": 1,
  "mcu": "rp2040-zero",
  "matrix": { "rows": 5, "cols": 14, "diode": "COL2ROW" },
  "pins": { "rows": ["GP0"], "cols": ["GP8"] },
  "keys": [
    { "matrix": [0, 0], "x": 0, "y": 0, "w": 1, "h": 1, "r": 0, "keycode": "KC_ESC" }
  ],
  "layers": [{ "name": "base" }],
  "encoders": [],
  "display": null,
  "split": false
}
```

Positions are abstract, in millimetres and key units. The editor does not depend
on keyswitch footprints, which are still being redesigned in the library.

### Registry

An index of board definitions and firmware artefacts. Each artefact carries a
SHA-256 digest and a signature. The application ships a registry snapshot and
works offline; it verifies every artefact before flashing.

### Firmware artefact

A per-board, per-revision build produced from the board definition. Versioned
independently from the application and from the board schema.

### Device states

| State | What the application sees | What it can do |
| --- | --- | --- |
| Bootloader | Chip family: RP2040 `2E8A:0003`, STM32 `0483:DF11`, ESP32-S3 `303A:1001` | Flash a selected firmware |
| Kiboar firmware | `board_id`, hardware revision, firmware version, protocol, matrix | Read and edit the keymap |
| Unknown | A HID device that is not Kiboar | Ignore it, or show diagnostics |

---

## 7. User journeys

### 7.1 First time — a freshly printed board

1. The user connects the board in bootloader mode (BOOTSEL on the Pico and
   RP2040 Zero; the method is documented for each board).
2. The application detects the MCU family.
3. A **model selector** opens, filtered by the detected MCU:
   - search focused on open, keyboard navigation;
   - the last used board first;
   - hardware revision as a separate field, because pins change between
     revisions;
   - "my board is not listed" imports a local `board.json`.
4. A **confirmation dialogue** shows the target before anything is written:

   ```text
   ┌─ Confirm flash ──────────────────────────────────┐
   │ Board:    Kiboar 60% HHKB · rev 1                │
   │ MCU:      RP2040 (2 MB)                          │
   │ Firmware: kiboar-kb60-hhkb 1.2.0                 │
   │ Type:     Official · signature verified          │
   │ SHA-256:  9f3c…a1d2                              │
   │                                                  │
   │ [ Cancel ]                    [ Flash ]          │
   └──────────────────────────────────────────────────┘
   ```

5. The application verifies the artefact, flashes it and checks that the board
   re-enumerates.
6. If the firmware reports a different `board_id` than expected, the application
   warns and offers recovery.

**Custom firmware.** Allowed, but labelled **"Unofficial · unverified"**, with
its hash and size. The warning is concrete: the firmware does not declare
compatibility with this board and a wrong pin mapping can damage it. The user
must type the board name to confirm. The application states that it may stop
recognising the keyboard afterwards.

### 7.2 Daily use

1. The user connects the keyboard.
2. The application recognises it, shows the 2D layout and the current keymap.
3. The user remaps keys or layers and saves.
4. The change persists in the keyboard and survives a reconnect.

### 7.3 Recovery

1. A corrupt or wrong firmware leaves the board in bootloader or unknown state.
2. The application shows the real state, suggests the last board used and offers
   to flash again.
3. It never flashes without confirmation of model and revision.

---

## 8. Identity without an EEPROM

There is no external EEPROM and no unlock code.

- A blank MCU is detected by its ROM bootloader, which identifies the chip
  family, not the board.
- The first flash is therefore always manual. There is no way around it, and the
  application does not pretend otherwise.
- After flashing, the firmware is the source of identity: it reports `board_id`,
  revision, version and serial over HID. The serial comes from the MCU factory
  UID.
- On a blank board there is no stored identity to compare against, so the
  runtime check cannot catch a wrong model selection. **The selector filter,
  the confirmation dialogue and the documented recovery are the safety net.**
- A public board code or QR on the silkscreen can be added later for kits and
  support. It would identify, never authorise.

---

## 9. Product principles

1. **Safety before convenience.** No write without naming the target.
2. **Solve the contract before the interface.** A beautiful screen over an
   undefined board is a demo, not a product.
3. **Works offline.** The registry ships with the application.
4. **Open and honest.** Open hardware, MIT application, GPL firmware obligations
   met, no DRM.
5. **Keyboard-first and accessible.** The selector and the confirmation are
   usable without a mouse.
6. **One source of truth.** The board definition drives the editor, the layout
   and the exports.
7. **No dead options.** A control that cannot work yet is not shown.

---

## 10. Success criteria

The first version is done when all of these are true:

- A blank RP2040 Zero is flashed from the application and re-enumerates as a
  Kiboar device.
- Selecting the wrong model is hard to do and recoverable: the selector is
  filtered by MCU, the confirmation names the target and recovery is documented.
- A key remap survives unplugging and reconnecting the keyboard.
- A board definition created in the editor passes the schema, exports QMK and
  VIA files, and the generated firmware builds and flashes.
- The application works with no network connection.
- The application runs on macOS and Linux. Windows follows.

---

## 11. Later, not now

- 3D visualisation.
- Per-key RGB and lighting effects.
- Macros, tap-dance and combos.
- Split and wireless boards with ZMK.
- STM32 and ESP32-S3 flashing.
- Native PICOBOOT flashing instead of copying to a mounted volume.
- Application auto-update.
- Board code or QR on the silkscreen.
- More boards, more MCUs, more exporters.

---

## 12. Open product decisions

1. Reference board for the first flash: a 60% HHKB with an RP2040 Zero
   (recommended).
2. Operating-system order: macOS and Linux first, Windows after (recommended).
3. Whether Kiboar publishes official reference boards or only the format and
   community boards.
4. Whether macros and RGB are delivered through VIA, Vial or a Kiboar extension.

---

## 13. What this brief deliberately does not cover

The implementation order, the stack, the repository layout, the testing
strategy, the CI and the licensing constraints are in
[`DEVELOPMENT.md`](DEVELOPMENT.md). This document answers *what* and *why*;
that one answers *how* and *in which order*.
