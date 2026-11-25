# ADR-0005: Firmware licensing

- Status: Accepted
- Date: 2026-11-24
- Deciders: Kiboar maintainer
- Related: [ADR-0001](0001-stack-and-scope.md) · [ADR-0004](0004-safety-principles-and-contracts.md) · [`NOTICE`](../../../NOTICE)

## Context

Kiboar Studio is MIT, but the firmware it flashes builds on QMK (GPL-2.0) and
speaks the VIA protocol. The application must stay MIT without weakening either
obligation.

## Decision

- **The application is MIT.**
- **QMK is GPL-2.0.** Firmware built on QMK is published from its own pipeline
  with the corresponding source available. The application downloads signed
  binaries and links to the source; it does not copy QMK code into `core`.
- **VIA is implemented independently.** No VIA or QMK source is vendored into the
  MIT application.
- **Keycodes come from the public USB HID usage tables**, with the origin
  documented. Any vendored data is licence-checked and attributed; if in doubt,
  it is not vendored.
- **QMK is not a submodule.** Vendoring it would change the scope and the licence
  of the repository.
- `NOTICE` changes only when third-party assets are added.

## Consequences

A firmware feature that would require QMK code inside the application is not a
Studio change: it belongs to the firmware pipeline and its own repository or
release artefact.
