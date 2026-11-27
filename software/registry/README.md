# Registry

`index.json` is the snapshot Kiboar Studio ships and can update. It declares
the MCUs, the board definitions and the firmware artefacts the application may
offer. The application works offline and validates the definitions it reads;
registry and firmware signature verification are still planned.

## Signatures

Signature verification is not wired into the app yet.

- The released index will be accompanied by `index.json.minisig`; the application
  will carry the public key and refuse an index it cannot verify. There is no
  `.minisig` and no registry public key in the app today.
- Every firmware entry will carry its own `sha256` and `signature`. The
  `kiboar-flash` crate can verify both, but the app currently checks only the
  SHA-256 of the selected UF2.
- No firmware artefact exists yet. The array is intentionally empty, and the
  schema and the tests already cover its shape.

## Paths

Every `definition` and `path` is relative to `software/` and uses POSIX
separators. Absolute paths and `..` segments are rejected by the schema.

## What the registry is not

It is not a package manager and it is not authoritative on the device. The
firmware a board reports over HID is the runtime identity; the registry is the
catalogue the user chooses from before a board has firmware.
