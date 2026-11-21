# Device identity protocol

This is the contract between Kiboar firmware and Kiboar Studio for
**identity only**. Keymap access uses the VIA protocol and is defined in M3.

## USB identity

- Vendor id: `0x1209`, allocated at [pid.codes](https://pid.codes) for open
  source hardware projects.
- Product id: assigned when the first firmware ships. Until then the
  application treats every device under the Kiboar vendor id as a candidate and
  decides from the board info report whether it is a Kiboar board.
- Product string: must start with `Kiboar `, for example `Kiboar kb60-hhkb`.
  The vendor id is shared by many open source projects, so the application uses
  this prefix to avoid probing devices that are not Kiboar boards.

A device in bootloader mode is identified by the chip vendor and product ids,
not by this protocol. See `bootloader.rs` for the table.

## Board info feature report

The firmware exposes one HID feature report:

| Property | Value |
| --- | --- |
| Report id | `0x10` |
| Payload length | 32 bytes |
| Report type | Feature |
| Transfer | Request, then read the response |

The HIDAPI buffer includes the report id as its first byte, so the buffer is 33
bytes. The payload below excludes that byte.

### Request payload

| Offset | Size | Value |
| --- | ---: | --- |
| 0 | 1 | Info version, `1` |
| 1 | 31 | Zero |

### Response payload

| Offset | Size | Field | Notes |
| --- | ---: | --- | --- |
| 0 | 1 | Info version | Must be `1` |
| 1 | 16 | Board id | ASCII lowercase slug, NUL padded |
| 17 | 1 | Hardware revision | `1..=99` |
| 18 | 1 | Firmware major | |
| 19 | 1 | Firmware minor | |
| 20 | 1 | Firmware patch | |
| 21 | 4 | Serial | `u32`, little endian, from the MCU UID |
| 25 | 1 | Matrix rows | Non-zero |
| 26 | 1 | Matrix columns | Non-zero |
| 27 | 1 | Layer count | |
| 28 | 1 | Flags | Bit 0: split |
| 29 | 1 | Reserved | Must be `0` |
| 30 | 2 | CRC16-CCITT | Of bytes `0..30`, little endian |

CRC parameters: polynomial `0x1021`, initial value `0xFFFF`, no reflection, no
final XOR. The check value for `123456789` is `0x29B1`.

## Validation rules

The application rejects a report when:

- it is not 32 payload bytes;
- the info version is not `1`;
- the board id is empty, longer than 16 bytes, not a lowercase slug, or has
  non-zero bytes after its NUL padding;
- the matrix has zero rows or columns;
- the reserved byte is not zero;
- the checksum does not match.

A rejected report becomes an `unknown` device with a reason. It never becomes a
partially trusted board.

## Firmware obligations (M2)

- Expose the feature report with the exact layout above.
- Fill `board_id` with the same value as the board definition's `board_id`.
- Derive the serial from the MCU factory UID once and keep it stable.
- Report the hardware revision of the PCB, not the firmware revision.
- Rebuild on the same board definition the application uses, so the matrix and
  layers cannot drift.

## What this report does not do

It does not write anything, carry a keymap, authenticate the board or prove that
the firmware is official. Firmware authenticity is a signature check on the
artefact before flashing, not a property of this report.
