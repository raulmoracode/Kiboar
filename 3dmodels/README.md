# 3D models

Each `Kiboar_<family>.3dshapes` directory holds the STEP models that the
footprints reference through:

```text
${KIBOAR_3DMODELS}/Kiboar_<family>.3dshapes/<name>.step
```

The variable is configured in **Preferences → Configure Paths** (see the main
README). The PCM package rewrites these paths to the installed
`${KICAD10_3RD_PARTY}` location, so the same footprints work both ways.

File names are matched case-sensitively by KiCad on Linux. `tools/lint.py`
checks that every referenced path resolves with the exact case.

## Models not used by any footprint

Some models are kept as source material for footprints that may be added later,
or because the part exists in the library without a 3D body yet. They are not
deleted: removing them would only move the data to git history.

When a footprint is added for one of these, point its `(model ...)` at the file
and it leaves this list. If a maintainer decides a part will not be supported,
remove the file in a dedicated change with its own issue.

<!-- inventory:start -->
**20 files, 34.2 MB** are not referenced by any footprint.

| File | Size |
| --- | ---: |
| `Kiboar_Components.3dshapes/Battery_Holder_2032.step` | 158 KB |
| `Kiboar_Components.3dshapes/Button_MJTP1243.step` | 90 KB |
| `Kiboar_Components.3dshapes/Button_MJTP1250.step` | 90 KB |
| `Kiboar_Components.3dshapes/LED_0805.step` | 76 KB |
| `Kiboar_Components.3dshapes/LED_1206.step` | 75 KB |
| `Kiboar_Components.3dshapes/Resistor_0805.step` | 76 KB |
| `Kiboar_Components.3dshapes/TRRS_PJ-320B.step` | 3.4 MB |
| `Kiboar_MCU.3dshapes/Elite-C.STEP` | 122 KB |
| `Kiboar_MCU.3dshapes/Liatris.step` | 2.0 MB |
| `Kiboar_MCU.3dshapes/RP2040_Zero_Flipped_Socketed.step` | 9.6 MB |
| `Kiboar_MechSwitch.3dshapes/Kimora_Hotswap.3dshapes/Choc_V1.step` | 1.1 MB |
| `Kiboar_MechSwitch.3dshapes/Kimora_Hotswap.3dshapes/Hotswap_MX.step` | 2.5 MB |
| `Kiboar_MechSwitch.3dshapes/Kimora_Hotswap.3dshapes/PG151101S11.step` | 498 KB |
| `Kiboar_MechSwitch.3dshapes/Kimora_MX.3dshapes/MX_Plate.step` | 2.6 MB |
| `Kiboar_Stabilizer.3dshapes/Stabilizer_MX_2.00u.step` | 2.0 MB |
| `Kiboar_Stabilizer.3dshapes/Stabilizer_MX_3.00u.step` | 2.0 MB |
| `Kiboar_Stabilizer.3dshapes/Stabilizer_MX_6.00u.step` | 2.0 MB |
| `Kiboar_Stabilizer.3dshapes/Stabilizer_MX_6.25u.step` | 2.0 MB |
| `Kiboar_Stabilizer.3dshapes/Stabilizer_MX_7.00u.step` | 2.0 MB |
| `Kiboar_Stabilizer.3dshapes/Stabilizer_MX_8.00u.step` | 2.0 MB |
<!-- inventory:end -->

## Regenerating this list

```bash
python3 tools/model_inventory.py --write   # rewrite the section above
python3 tools/model_inventory.py --check   # fail when it is stale
```

The check ignores case, so a `.STEP`/`.step` mismatch shows up as a lint error,
not as an unused model.
