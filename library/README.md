# Kiboar KiCad library

The KiCad component library for building mechanical keyboards: **145 symbols**
and **173 footprints** in **26 footprint libraries**, with 3D models for all of
them — controller boards, encoders, connectors, displays, LEDs and the small
parts around them. Keyswitch footprints and models are being redesigned and are
not part of this version.

The library is one of the products in the [Kiboar repository](../README.md).
It is distributed as a PCM ZIP and as a clone with library tables, and it is not
an npm package. Agent rules: [`AGENTS.md`](AGENTS.md). Architecture and product
boundaries: [`../ARCHITECTURE.md`](../ARCHITECTURE.md).

## Requirements

**KiCad 10.0 or newer.** The files use the KiCad 10 format and KiCad 8/9 cannot
open them. The Python tools use the standard library only.

## Install

### Plugin and Content Manager

From the repository root:

1. Build the package (or use the ZIP attached to a release):
   ```bash
   python3 library/tools/build_pcm.py
   ```
2. In KiCad: **Tools → Plugin and Content Manager → Install from File…** and
   choose `dist/Kiboar-<version>.zip`.

PCM installs the content under `${KICAD10_3RD_PARTY}` and registers the
libraries in your global tables.

KiCad prefixes installed library nicknames with `PCM_` by default, and the ZIP
is built to match that: the symbols point at `PCM_Kiboar_*` footprints. If you
cleared **Preferences → Packages and Updates → Library nickname prefix**, use
the other variant instead:

```bash
python3 library/tools/build_pcm.py --no-prefix   # dist/Kiboar-<version>-no-prefix.zip
```

The package is not in the official PCM repository yet; the release is tracked in
the issue tracker.

### Clone

```bash
git clone https://github.com/raulmoracode/Kiboar.git
```

1. **Preferences → Configure Paths** — add `KIBOAR_ROOT` pointing at the
   clone's `library/` directory, and `KIBOAR_3DMODELS` pointing at
   `$KIBOAR_ROOT/3dmodels`.
2. **Preferences → Manage Symbol Libraries → Global Libraries** — append
   `library/lib-table-files/sym-lib-table`.
3. **Preferences → Manage Footprint Libraries → Global Libraries** — append
   `library/lib-table-files/fp-lib-table`.

The tables reference `${KIBOAR_ROOT}`, so the variable must exist. For a single
project, copy the two tables into the project directory instead of using the
global ones.

## Libraries

| Library | Footprints | Contents |
| --- | ---: | --- |
| `Kiboar_BatteryHolder` | 10 | Coin-cell and cylindrical battery holders (Keystone) |
| `Kiboar_BatteryJack` | 3 | JST-PH battery connectors |
| `Kiboar_BoardConnector` | 11 | Board and card-edge connectors (TE, Molex, Amphenol) |
| `Kiboar_Buzzer` | 1 | SMD buzzer |
| `Kiboar_Capacitor` | 7 | 0402, 0603, disc and MLCC placeholders |
| `Kiboar_DevBoard` | 24 | Controller boards: RP2040, ESP32, STM32, Pro Micro, Pico and clones |
| `Kiboar_Diode` | 4 | DO-35, SOD-123, SOD-80 and Zener placeholders |
| `Kiboar_DIPSwitch` | 2 | DIP switches (Würth) |
| `Kiboar_Display` | 3 | OLED 128×32, OLED 128×64 and NICE!VIEW displays |
| `Kiboar_Encoder` | 11 | Rotary encoders and encoder/switch combinations (Alps) |
| `Kiboar_Ethernet` | 9 | RJ45 jacks (TE, Molex) |
| `Kiboar_Fuse` | 2 | 0603 and PPTC fuse placeholders |
| `Kiboar_Joystick` | 8 | 5-way tactile and analog thumbsticks |
| `Kiboar_LED` | 9 | Addressable RGB (WS2812, SK6812) and through-hole LEDs |
| `Kiboar_MCU` | 8 | Bare microcontrollers (ATmega, STM32, CH552) |
| `Kiboar_MountingHole` | 5 | Mounting holes and M2 standoffs |
| `Kiboar_Panelization` | 3 | Mouse-bite perforation rows for panelized boards |
| `Kiboar_PinHeader` | 8 | Pin headers (Würth) |
| `Kiboar_Qwiic` | 1 | SparkFun Qwiic (JST-SH) connector |
| `Kiboar_Resistor` | 3 | 0402, 0805 and 1206 placeholders |
| `Kiboar_SlideSwitch` | 7 | Slide and detect switches (Alps, C&K) |
| `Kiboar_SOT23` | 4 | SOT-23 3L, 5, 6 and 8 placeholders |
| `Kiboar_TactileButton` | 21 | Tactile push buttons (Alps, Omron, Panasonic, E-Switch, C&K) |
| `Kiboar_TestPoint` | 1 | Through-hole test point |
| `Kiboar_TRRS` | 4 | TRRS audio jacks |
| `Kiboar_USBC` | 4 | USB-C receptacles |

## Usage

1. Place the symbols in the schematic (for example `SWITCH_EG1215AA` or one of
   the `Placeholder_*` symbols).
2. Assign the matching `Kiboar_*` footprint. Keyswitch footprints are being
   redesigned and are not included yet: use your own until they land.
3. Every footprint carries a courtyard, so **Tools → Design Rules Checker**
   reports parts that overlap before you send the board out.
4. The 3D viewer works once `KIBOAR_3DMODELS` resolves: with a clone it is the
   path you configured, with PCM the package rewrites the model paths itself.

## Checks

From the repository root:

```bash
pnpm library
```

That runs the library lint, the courtyard check, the symbol normaliser, the
model inventory and the provenance check. The full gate is `pnpm check`.

## Contributing

Issues and pull requests are welcome. When reporting a defect, include the KiCad
version, the library and item name, and what you expected to see. When
requesting a component, include the manufacturer part number and a datasheet
link. The issue forms ask for both.

The contribution rules and the exact commands are in [`AGENTS.md`](AGENTS.md),
and the repository-wide Git and licensing rules are in
[`../AGENTS.md`](../AGENTS.md) and [`../CONTRIBUTING.md`](../CONTRIBUTING.md).
The other products live in [`../docs/`](../docs/README.md) and
[`../software/`](../software/README.md).

## Licensing

Kiboar is a **mixed-licence collection**, and only because of its symbols:

- every 3D model and every footprint is **MIT**, and the symbols drawn here are
  **MIT** too (see [`../LICENSE`](../LICENSE));
- fifteen imported symbols keep the licence of their source, listed in
  [`../NOTICE`](../NOTICE) with the evidence.

The split is not a guess. 129 models and 130 of the 145 symbols are original
work, and say so in the file: the STEP `FILE_NAME` header names the author and
`Kiboar`, and the symbols carry hidden `Author` and `License` properties.
`tools/lint.py` fails when a stamp is missing. The other 15 symbols are the
third-party imports listed in `NOTICE`.

One thing matters before you use the library commercially: ten symbols are
SnapEDA imports and five are Component Search Engine imports, both under
**CC BY-SA 4.0** with the Design Exception, so they need attribution when the
files themselves are redistributed. No model or footprint carries a
non-commercial or NoDerivatives licence.

## Credits

- [SnapEDA / SnapMagic](https://www.snapeda.com) — CC BY-SA 4.0 with Design Exception 1.0
- [marbastlib](https://github.com/ebastler/marbastlib), [keyswitches.pretty](https://github.com/daprice/keyswitches.pretty)
  and [kicad-libraries](https://github.com/sszczep/kicad-libraries) — reference material
- [KiCad](https://www.kicad.org) — the tool and its libraries
