# 3D models

Each `Kiboar_<family>.3dshapes` directory holds the STEP models that the
footprints reference through:

```text
${KIBOAR_3DMODELS}/Kiboar_<family>.3dshapes/<name>.step
```

The variable is configured in **Preferences → Configure Paths** (see the main
README). The PCM package rewrites these paths to the installed
`${KICAD10_3RD_PARTY}` location, so the same footprints work both ways.

File names are matched case-sensitively by KiCad on Linux. `library/tools/lint.py`
checks that every referenced path resolves with the exact case.

One directory breaks the one-to-one rule on purpose: `Kiboar_Icsocket.3dshapes`
has no `.pretty` of its own. Its two models are IC sockets used by the
`ATMEGA328P-PU` and `ATMEGA32A-PU` footprints in `Kiboar_MCU.pretty`, and the
library ships no IC-socket footprint library. It is recorded here so a future
cleanup does not delete it as orphaned.

## Models not used by any footprint

Some models are kept as source material for footprints that may be added later,
or because the part exists in the library without a 3D body yet. They are not
deleted: removing them would only move the data to git history.

When a footprint is added for one of these, point its `(model ...)` at the file
and it leaves this list. If a maintainer decides a part will not be supported,
remove the file in a dedicated change with its own issue.

<!-- inventory:start -->
**3 files, 5.5 MB** are not referenced by any footprint.

| File | Size |
| --- | ---: |
| `Kiboar_DevBoard.3dshapes/Elite-C.STEP` | 122 KB |
| `Kiboar_DevBoard.3dshapes/Liatris.step` | 2.0 MB |
| `Kiboar_TRRS.3dshapes/TRRS_PJ-320B.step` | 3.4 MB |
<!-- inventory:end -->

## Regenerating this list

```bash
python3 library/tools/model_inventory.py --write   # rewrite the section above
python3 library/tools/model_inventory.py --check   # fail when it is stale
```

The check ignores case, so a `.STEP`/`.step` mismatch shows up as a lint error,
not as an unused model.
