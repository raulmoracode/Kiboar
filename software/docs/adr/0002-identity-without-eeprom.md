# ADR-0002: Identity without an EEPROM

- Status: Accepted
- Date: 2026-11-21
- Deciders: Kiboar maintainer
- Related: [ADR-0001](0001-stack-and-scope.md)

## Context

Kiboar Studio has to know which board it is talking to before it writes a single
byte. The boards it targets are assembled by makers and kit builders from a
Kiboar PCB and a bare or off-the-shelf module, so there is no factory step in
which the vendor could store a per-unit identity. Whatever the application reads
must survive a board that has never been programmed.

That leaves a hard question: on a board with no firmware and no stored record,
what can the application actually identify, and what must the user supply?

## Decision

### A blank MCU is identified by its ROM bootloader only

Detection of an unprogrammed board comes from the chip's ROM bootloader, which
identifies the chip family, never the board: RP2040 `2E8A:0003`, STM32 DFU
`0483:DF11`, ESP32-S3 `303A:1001`. Two boards with the same MCU are
indistinguishable at this stage, and the application does not pretend otherwise.

### The first flash is always manual

There is no mechanism by which an application can identify a blank custom board.
The user selects the model, states the hardware revision and confirms the target.
This is a product constraint, not a missing feature to be engineered away.

### After flashing, the firmware is the source of identity

Kiboar firmware reports `board_id`, `hw_rev`, `fw_version`, `protocol_version`
and a serial number over HID. The serial derives from the MCU factory UID, so it
is unique per unit without any extra component. From that point on, detection is
exact and a wrong firmware is visible at runtime.

### No external 24C02 EEPROM

An EEPROM would add a BOM line, two pins, a footprint and an I2C failure mode on
every board. It buys nothing the firmware does not already know, and the ROM
bootloader could not read it anyway, so it would not help the one case that
matters: the blank board before the first flash.

### No secret unlock code

The ROM bootloader accepts any UF2; it has no notion of a code. The application
is MIT, the firmware is built from QMK (GPL-2.0) and published with its source,
and the hardware is open, so a code shipped in the binary or in the repository
protects nothing an attacker could not read. Integrity is handled where it can
actually be enforced: by verifying firmware signatures and digests before
flashing.

### Safety on a blank board

Because there is no stored identity to compare against, the runtime `board_id`
check cannot protect the first flash. The safety net is procedural:

- the model selector is filtered by the detected MCU;
- hardware revision is a separate field, because pins change between revisions;
- a mandatory confirmation names the board, the revision and the firmware,
  including origin and SHA-256;
- recovery is documented and built into the flasher: re-enter the bootloader and
  flash again.

## Consequences

### Positive

- One less component, two fewer pins and one fewer bus on every Kiboar board.
- Identity is exact after the first flash, with a per-unit serial for free from
  the MCU UID.
- Nothing to provision, nothing to burn and nothing to keep in sync at build
  time.
- The design is honest: the interface shows the limit instead of implying a
  guarantee it cannot make.

### Negative / trade-offs

- There is no per-unit calibration storage until a reserved flash sector exists.
- No DRM and no per-board lock: the firmware is open and can be replaced.
- Wrong model selection on a blank board remains a user error, mitigated only by
  the selector filter, the confirmation and recovery.
- Revisions with different pins rely on the user choosing the right revision.

## Alternatives considered

- **External 24C02 EEPROM.** Rejected: cost, pins, footprint and an I2C failure
  mode for data the firmware already holds, and unreadable by a ROM bootloader.
- **Secret unlock code.** Rejected: the bootloader ignores it, the sources are
  public, and it would give a false sense of protection.
- **Printed board code or QR now.** Deferred: useful for kits and support, but
  not needed to flash a first board.
- **Probe firmware now.** Deferred: only worth it once wrong-flash incidents
  justify the extra step and the extra support surface.

## Follow-up

- A public board code or QR may be added to the silkscreen later for kits and
  support. It identifies, never authorises.
- The HID board info report is defined in [protocol.md](../protocol.md) and is
  implemented by firmware in M2.
- A reserved provisioning flash sector, or a small probe firmware, is considered
  only if wrong-flash incidents justify it. Either would get its own ADR.
- The confirmation dialogue and the recovery screen are acceptance criteria of
  M2 and must name the board, the revision and the firmware before writing.
