# Contributing

Kiboar is a KiCad 10 library. Contributions arrive as a pull request against
`main`, one logical change per branch, with an issue that says what and why.

## Requirements

- KiCad 10.0 or newer, for `kicad-cli`.
- Python 3.9 or newer. The scripts use only the standard library.

## Adding a footprint

1. Put the file in the library that matches its family, for example
   `footprints/Kiboar_Switch.pretty/`.
2. Name it after the manufacturer part number. Avoid `\\ / : * ? " < > |` and
   trailing dots or spaces.
3. Give it a courtyard on its own side and an `(attr ...)` that matches the
   pads. `python3 tools/gen_courtyard.py` derives a rectangle for a footprint
   that has none; a hand-drawn courtyard is better when the part has a keepout
   (a connector opening, switch travel).
4. Point the model at `${KIBOAR_3DMODELS}/Kiboar_<family>.3dshapes/<name>.step`
   and use the exact case of the file on disk.
5. Record where the CAD data came from in `NOTICE` if it is not original work.

## Adding a symbol

1. Add it to `symbols/Kiboar.kicad_sym` with a name without whitespace.
2. Use the family reference prefix: `SW` for switches, buttons, encoders, DIP
   switches and joysticks; `U` for MCU and modules; `J` for connectors; `D` for
   LEDs; `BT` for battery holders; `DS` for displays. No `?`.
3. Fill `Manufacturer` and `MPN` when they are known, plus `ki_keywords` and a
   `ki_fp_filters` entry that matches the linked footprint.
4. Link a footprint that exists in this repository, by its exact nickname.
5. `python3 tools/normalize_symbols.py --check` must report nothing.

## Checks before a pull request

```bash
python3 tools/lint.py
python3 tools/gen_courtyard.py --check
python3 tools/normalize_symbols.py --check
```

The CI also runs KiCad's own upgrade check: it copies `symbols/` and
`footprints/`, runs `kicad-cli sym upgrade` and `kicad-cli fp upgrade`, and
fails if any byte changes. To run it locally:

```bash
work=$(mktemp -d)
cp -R footprints "$work/"
cp symbols/Kiboar.kicad_sym "$work/symbols.kicad_sym"
kicad-cli sym upgrade "$work/symbols.kicad_sym"
for library in "$work"/footprints/*.pretty; do kicad-cli fp upgrade "$library"; done
diff -r footprints "$work/footprints"
cmp symbols/Kiboar.kicad_sym "$work/symbols.kicad_sym"
```

## Licensing of contributions

Only contribute work you can license compatibly with this repository.

- Original work is MIT, and a contribution is accepted under MIT.
- Content derived from another project keeps that project's licence. Say which
  in the pull request and add it to `NOTICE` with the evidence.
- Do not add non-commercial (CC BY-NC) content. The library already carries a
  non-commercial subset from ScottoKeebs; adding more makes the licensing
  problem worse, not better.

## Commits and pull requests

- Conventional Commits (`fix:`, `feat:`, `docs:`, `chore:`, `ci:`, `release:`
  …), English.
- Reference the issue with `Closes #N` in the pull request body.
- The PR template asks for the testing evidence. A statement that the lint
  passes is not evidence; paste the command and its result.
