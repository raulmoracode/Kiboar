# Contributing

Kiboar is a keyboard brand: it designs and sells keyboards and publishes the
library and the board definitions. This repository holds the official KiCad
library, Kiboar Studio, the public site and the shop. This file covers the
repository-wide process and the KiCad library in `library/`; each product's
`AGENTS.md` adds its own checks.

Contributions arrive as a pull request against `main`, one logical change per
branch, with an issue that says what and why.

The products share a pnpm workspace at the root, with shared packages under
`packages/`, and are described in [`ARCHITECTURE.md`](ARCHITECTURE.md). Their agent instructions are
[`library/AGENTS.md`](library/AGENTS.md), [`docs/AGENTS.md`](docs/AGENTS.md),
[`software/AGENTS.md`](software/AGENTS.md), [`web/AGENTS.md`](web/AGENTS.md) and
[`shop/AGENTS.md`](shop/AGENTS.md).

## Requirements

- KiCad 10.0 or newer, for `kicad-cli`.
- Python 3.9 or newer. The scripts use only the standard library, except
  `build_pcm.py --schema`, which needs the `jsonschema` package.

## Adding a footprint

1. Put the file in the library that matches its family, for example
   `library/footprints/Kiboar_SlideSwitch.pretty/`.
2. Name it after the manufacturer part number. Avoid `\\ / : * ? " < > |` and
   trailing dots or spaces.
3. Give it a courtyard on its own side and an `(attr ...)` that matches the
   pads. `python3 library/tools/gen_courtyard.py` derives a rectangle for a
   footprint that has none; a hand-drawn courtyard is better when the part has a
   keepout (a connector opening, switch travel).
4. Point the model at `${KIBOAR_3DMODELS}/Kiboar_<family>.3dshapes/<name>.step`
   and use the exact case of the file on disk.
5. Record where the CAD data came from in `NOTICE` if it is not original work.

## Adding a symbol

1. Add it to `library/symbols/Kiboar.kicad_sym` with a name without whitespace.
2. Use the family reference prefix: `SW` for switches, buttons, encoders, DIP
   switches and joysticks; `U` for MCU and modules; `J` for connectors; `D` for
   LEDs; `BT` for battery holders; `DS` for displays. No `?`.
3. Fill `Manufacturer` and `MPN` when they are known, plus `ki_keywords` and a
   `ki_fp_filters` entry that matches the linked footprint.
4. Link a footprint that exists in this repository, by its exact nickname.
5. `python3 library/tools/normalize_symbols.py --check` must report nothing.

## Checks before a pull request

```bash
python3 library/tools/lint.py
python3 library/tools/gen_courtyard.py --check
python3 library/tools/normalize_symbols.py --check
```

The CI also runs KiCad's own upgrade check: it copies `library/symbols/` and
`library/footprints/`, runs `kicad-cli sym upgrade` and `kicad-cli fp upgrade`,
and fails if any byte changes. To run it locally:

```bash
work=$(mktemp -d)
cp -R library/footprints "$work/"
cp library/symbols/Kiboar.kicad_sym "$work/symbols.kicad_sym"
kicad-cli sym upgrade "$work/symbols.kicad_sym"
for library in "$work"/footprints/*.pretty; do kicad-cli fp upgrade "$library"; done
diff -r library/footprints "$work/footprints"
cmp library/symbols/Kiboar.kicad_sym "$work/symbols.kicad_sym"
```

## Licensing of contributions

Only contribute work you can license compatibly with this repository.

- Original work is MIT, and a contribution is accepted under MIT.
- Content derived from another project keeps that project's licence. Say which
  in the pull request and add it to `NOTICE` with the evidence.
- Do not add non-commercial (CC BY-NC) or NoDerivatives content. The third-party
  3D bodies were removed for exactly that reason; adding one back undoes it.

## Commits and pull requests

- Conventional Commits (`fix:`, `feat:`, `docs:`, `chore:`, `ci:`, `release:`
  …), English.
- Reference the issue with `Closes #N` in the pull request body.
- Labels follow [`LABELS.md`](LABELS.md) and the product `AGENTS.md` table; the
  PR template points to the checks for each product touched.
- The PR template asks for the testing evidence. A statement that the lint
  passes is not evidence; paste the command and its result.

## Dependencies

A new or bumped dependency must be at least 24 hours old. The workspace sets
`minimumReleaseAge: 1440` in `pnpm-workspace.yaml`, so `pnpm install` refuses a
lockfile entry that is younger than that. When a security fix genuinely needs a
same-day version, add it to `minimumReleaseAgeExclude` for that one package,
explain why in the pull request and remove the exception afterwards. Never set
`trustLockfile: true` to bypass the check.
