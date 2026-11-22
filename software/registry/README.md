# Registry

`index.json` is the snapshot Kiboar Studio ships and can update. It declares
the MCUs, the board definitions and the firmware artefacts the application may
offer. The application works offline and verifies everything it uses.

## Signatures

- At release, `index.json` is accompanied by `index.json.minisig`. The
  application carries the public key and refuses an index it cannot verify.
- Every firmware entry carries its own `sha256` and `signature`. Both are checked
  before a flash; an artefact that fails either check is never written.
- No firmware artefact exists yet. The array is intentionally empty, and the
  schema and the tests already cover its shape.

## Paths

Every `definition` and `path` is relative to `software/` and uses POSIX
separators. Absolute paths and `..` segments are rejected by the schema.

## What the registry is not

It is not a package manager and it is not authoritative on the device. The
firmware a board reports over HID is the runtime identity; the registry is the
catalogue the user chooses from before a board has firmware.
