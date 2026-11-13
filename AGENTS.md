# AGENTS.md

Instructions for AI agents working in this repository. The long form for humans
is `CONTRIBUTING.md`; this file is the short, unambiguous version.

Read in this order: `README.md` → `AGENTS.md` → `CONTRIBUTING.md` → `NOTICE` →
`CHANGELOG.md`.

## What this repository is

Kiboar is a component library for mechanical keyboards in **KiCad 10**: 146
symbols, 1332 footprints in 23 `.pretty` libraries, and 3D models for most of
them. It ships as a PCM package and as a clone with library tables.

| Path | Contents |
| --- | --- |
| `symbols/Kiboar.kicad_sym` | The single symbol library |
| `footprints/Kiboar_*.pretty/` | One library per component family |
| `3dmodels/Kiboar_*.3dshapes/` | STEP models, referenced by `${KIBOAR_3DMODELS}` |
| `tools/` | Python stdlib scripts; each has a `--check` mode |
| `pcm/`, `lib-table-files/` | PCM metadata and manual-install tables |
| `docs/` | Astro + Fumadocs site, English and Spanish |
| `NOTICE` | Third-party origins and licences |

## Hard rules

### KiCad format

- The files are **KiCad 10 format**. Do not "downgrade" them to open in KiCad
  8/9. The byte check below is the authority:

```bash
work=$(mktemp -d)
cp -R footprints "$work/"
cp symbols/Kiboar.kicad_sym "$work/symbols.kicad_sym"
kicad-cli sym upgrade "$work/symbols.kicad_sym"
for library in "$work"/footprints/*.pretty; do kicad-cli fp upgrade "$library"; done
diff -r footprints "$work/footprints"
cmp symbols/Kiboar.kicad_sym "$work/symbols.kicad_sym"
```

If any byte changes, the source was not current: commit the upgraded files.

### Footprints

- Every placed-part footprint needs a courtyard on its own side
  (`F.CrtYd`/`B.CrtYd`). `python3 tools/gen_courtyard.py` derives one from the
  Fab outline and pads plus 0.25 mm, snapped to 0.05 mm. Leave hand-drawn
  courtyards alone.
- `(attr ...)` must match the pads: `through_hole` if any pad is `thru_hole`,
  otherwise `smd`. Footprints with only `np_thru_hole` pads keep their own
  choice.
- Model paths must use `${KIBOAR_3DMODELS}/Kiboar_<family>.3dshapes/<name>.step`.
  Never use an absolute path, `${KIPRJMOD}` or an undefined variable.
- Model file names are case-sensitive. `SLLB510100.step` and `.STEP` are not
  the same file on Linux.

### Symbols

- Names and values contain no whitespace.
- One reference prefix per family and no `?`: `SW` for switches, buttons,
  encoders, DIP and joysticks; `U` for MCU/modules; `J` for connectors; `D` for
  LEDs; `BT` for battery holders; `DS` for displays.
- Manufacturer data lives in `Manufacturer` and `MPN` only. Do not add `MF`,
  `MP`, `MANUFACTURER`, `Manufacturer_Name` or similar.
- Keep `ki_keywords` and a `ki_fp_filters` entry that matches the linked
  footprint.
- The `Footprint` property must resolve to an existing `.kicad_mod`, exact case.

### Licensing

- `NOTICE` is authoritative. The collection is **mixed-licence**: original work
  is MIT; kiswitch models are MIT / CC BY-SA; ten SnapEDA symbols are CC BY-SA;
  the ScottoKeebs models and three footprints are **CC BY-NC-SA**.
- Do not relicense third-party files, do not remove or weaken `NOTICE`, and do
  not add new non-commercial content.
- New CAD data needs its origin and licence recorded in `NOTICE`, or must be
  original work.

### Generated files

- `docs/content/docs/libraries/` is generated from the library by
  `tools/gen_docs.py`. Do not hand-edit those pages; change the library or the
  generator and re-run it.
- `3dmodels/README.md` contains a generated inventory between markers. Run
  `python3 tools/model_inventory.py --write` after adding or referencing models.

## Commands before you propose a change

```bash
python3 tools/lint.py                    # every rule in one place
python3 tools/gen_courtyard.py --check   # courtyards
python3 tools/normalize_symbols.py --check
python3 tools/model_inventory.py --check
```

For a PCM or docs change, also:

```bash
python3 tools/build_pcm.py --check --schema
cd docs && npm ci && npm run build
```

## Git

- Any committed change follows **`git-workflow`**: issue → branch → pull
  request. Never commit to `main`.
- Branch name: `<prefix>/<issue>-<slug>`, for example
  `fix/5-footprint-courtyards`. Release branches keep the version:
  `release/21-1.0.0`.
- Commits: Conventional Commits with the same prefix as the branch, in English.
- Pull requests: English body with summary, testing evidence and risk;
  `Closes #N` for the issue it actually closes.
- **Do not apply the `ai-assisted` label.** The repository does not use it.
- Merging is a separate action: it needs an explicit request naming the PR and
  goes through `git-merge`. Never merge, delete a branch, force-push or change
  repository settings on your own.
- One logical change per branch. No drive-by fixes or formatting sweeps.

## Before you report

- Run the checks above and paste the real output. A claim without a command is
  not evidence.
- Read the actual diff (`git diff`, `git log main..HEAD`), not your memory of it.
- If a check could not run, say so; do not describe it as passing.
- Never claim a merge, a release or an issue closure without reading the state
  back from `gh`.
