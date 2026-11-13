# Changelog

All notable changes to Kiboar are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-11-13

First release, targeting **KiCad 10**.

### Added

- 146 symbols and 1332 footprints in 23 footprint libraries, with 3D models for
  most of them.
- Courtyards on every placed-part footprint, derived from the Fab outline and
  the pads plus the 0.25 mm clearance, and a matching `(attr ...)` on every
  footprint. Footprints without a courtyard would otherwise be invisible to
  KiCad's courtyard DRC.
- `tools/gen_courtyard.py`, `tools/normalize_symbols.py` and `tools/lint.py`,
  the rules behind the library state, each with a `--check` mode.
- A PCM library package (`pcm/metadata.json`, `tools/build_pcm.py`) that
  installs from one ZIP and rewrites the library links for the installed
  layout, in both the `PCM_`-prefixed and the unprefixed variants.
- `lib-table-files/` with the symbol and footprint tables for a clone install.
- GitHub Actions: a lint job and a KiCad 10 job that checks the file format and
  renders a sample footprint and symbol to SVG.
- `NOTICE` with the third-party origins, their licences and the affected files.

### Changed

- Symbol names carry no whitespace; references use one prefix per family
  (`SW`, never `S`) and contain no `?`.
- Manufacturer data lives in `Manufacturer` and `MPN`; six competing field names
  and the empty import leftovers are gone.
- Missing `ki_keywords` and `ki_fp_filters` are filled from the symbol family
  and the linked footprint.
- Duplicate 3D models were collapsed to one copy each, and 16 references point
  at the surviving file.

### Fixed

- External 3D model references that required a per-project variable or an
  absolute path (P0 remediation).
- Library casing: `Kiboar_Pinheader.pretty` → `Kiboar_PinHeader.pretty`, and
  `Kiboar_Pinheader.3dshapes` → `Kiboar_PinHeader.3dshapes`.
- A model reference to `SLLB510100.STEP` where the file is `SLLB510100.step`,
  which only resolved on case-insensitive filesystems.

### Known gaps

- 57 symbols have no `Description` and 86 have no `Datasheet`; resolving them
  needs a source per part (tracked separately).
- 32 model files are not referenced by any footprint (tracked separately).
- **Licensing:** the collection is mixed. The switch, hotswap, cutout and
  stabilizer models are MIT / CC BY-SA 4.0, ten symbols are CC BY-SA 4.0
  SnapEDA imports, and the ScottoKeebs models and three footprints are
  **CC BY-NC-SA 4.0**. The MIT licence covers the original work only; see
  [`NOTICE`](NOTICE).

[1.0.0]: https://github.com/raulmoracode/Kiboar/releases/tag/v1.0.0
