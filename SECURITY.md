# Security policy

Kiboar is a public repository. Please report a vulnerability privately; do not
open a public issue with exploit detail.

## Reporting

Use GitHub's private advisory form:

<https://github.com/raulmoracode/Kiboar/security/advisories/new>

Include what the issue affects, the version or commit, the steps to reproduce
and the impact you expect. If the report involves the KiCad library, name the
symbol, footprint or 3D model.

## Scope

- KiCad library files: symbols, footprints, 3D models, PCM package and the
  library tables.
- The Python tools in `library/tools/`.
- The documentation site in `docs/`.
- Kiboar Studio, including the Tauri shell, the Rust crates and the HID
  device parsing.

Out of scope: vulnerabilities in KiCad itself, in third-party firmware, in
QMK, or in a board designed with the library.

## What to expect

This is a single-maintainer project, so there is no formal SLA. Reports are
read and answered on a best-effort basis, and a confirmed issue gets a fix and
a disclosure note. Please give a reasonable window before publishing.

No secrets, personal data or customer data belong in this repository. If you
find any, report it through the same private channel.
