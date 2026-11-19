<p align="center">
    <img src="logo.svg" alt="Kiboar logo" width="240">
</p>

<p align="center">
    <a href="https://www.kicad.org"><img src="https://img.shields.io/badge/KiCad-10.0-1f6feb" alt="KiCad 10.0"></a>
    <a href="NOTICE"><img src="https://img.shields.io/badge/license-MIT%20%2B%20third--party-lightgrey" alt="MIT plus third-party content"></a>
</p>

# Kiboar

Kiboar is a component library for building mechanical keyboards with **KiCad
10**: 146 symbols, 1329 footprints in 23 footprint libraries, and 3D models for
most of them — switches, keycap and plate outlines, controller boards, encoders,
connectors, displays, LEDs and the small parts around them.

📖 **Documentation:** <https://kiboar.raulmoracode.com/docs> — English and Spanish.

## Requirements

**KiCad 10.0 or newer.** The files use the KiCad 10 format and KiCad 8/9 cannot
open them.

## Install

### Plugin and Content Manager

1. Build the package (or use the ZIP attached to a release):
   ```bash
   python3 tools/build_pcm.py
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
python3 tools/build_pcm.py --no-prefix   # dist/Kiboar-<version>-no-prefix.zip
```

The package is not in the official PCM repository yet; the release is tracked in
the issue tracker.

### Clone

```bash
git clone https://github.com/raulmoracode/Kiboar.git
```

1. **Preferences → Configure Paths** — add `KIBOAR_ROOT` pointing at the clone,
   and `KIBOAR_3DMODELS` pointing at `$KIBOAR_ROOT/3dmodels`.
2. **Preferences → Manage Symbol Libraries → Global Libraries** — append
   `lib-table-files/sym-lib-table`.
3. **Preferences → Manage Footprint Libraries → Global Libraries** — append
   `lib-table-files/fp-lib-table`.

The tables reference `${KIBOAR_ROOT}`, so the variable must exist. For a single
project, copy the two tables into the project directory instead of using the
global ones.

## Libraries

| Library | Footprints | Contents |
| --- | ---: | --- |
| `Kiboar_BatteryHolder` | 10 | Coin-cell and cylindrical battery holders (Keystone) |
| `Kiboar_BatteryJack` | 3 | JST-PH battery connectors |
| `Kiboar_Button` | 21 | Tactile push buttons (Alps, Omron, Panasonic, E-Switch, C&K) |
| `Kiboar_Buzzer` | 1 | SMD buzzer |
| `Kiboar_CAD` | 16 | Keycap and plate outlines for CAD renders, MX and Choc |
| `Kiboar_CBK` | 11 | Board and card-edge connectors (TE, Molex, Amphenol) |
| `Kiboar_Cutout` | 67 | PCB and plate cutouts for switches, sockets and stabilizers |
| `Kiboar_Dip` | 2 | DIP switches (Würth) |
| `Kiboar_Display` | 3 | OLED 128×32, OLED 128×64 and NICE!VIEW displays |
| `Kiboar_Encoder` | 12 | Rotary encoders and encoder/switch combinations (Alps) |
| `Kiboar_Ethernet` | 9 | RJ45 jacks (TE, Molex) |
| `Kiboar_Joystick` | 8 | 5-way tactile and analog thumbsticks |
| `Kiboar_Led` | 9 | Addressable RGB (WS2812, SK6812) and through-hole LEDs |
| `Kiboar_MCU` | 32 | Controller boards: RP2040, ESP32, STM32, Pro Micro, Pico and clones |
| `Kiboar_MechSwitch` | 1071 | Cherry MX and Kailh Choc switch positions with sockets, stabilizers and LEDs |
| `Kiboar_Miscellaneous` | 6 | Test points, USB hubs and board bites |
| `Kiboar_MountingHole` | 7 | Mounting holes and M2 standoffs |
| `Kiboar_OtherConnectors` | 1 | SparkFun PRT-14417 |
| `Kiboar_PinHeader` | 8 | Pin headers (Würth) |
| `Kiboar_Placeholder` | 20 | Generic R, C, L, LED, diode, fuse, crystal and SOT-23 placeholders |
| `Kiboar_Switch` | 7 | Slide and toggle switches (Alps, C&K) |
| `Kiboar_TRRS` | 4 | TRRS audio jacks |
| `Kiboar_USB-C` | 4 | USB-C receptacles |

## Usage

1. Place the symbols in the schematic (for example `SWITCH_EG1215AA` or one of
   the `Placeholder_*` symbols for the matrix).
2. Assign the matching `Kiboar_*` footprint. For a hotswap board use a
   `Kiboar_MechSwitch` footprint; for a soldered board use `Kiboar_Switch`.
3. Every footprint carries a courtyard, so **Tools → Design Rules Checker**
   reports parts that overlap before you send the board out.
4. The 3D viewer works once `KIBOAR_3DMODELS` resolves: with a clone it is the
   path you configured, with PCM the package rewrites the model paths itself.

## Contributing

Issues and pull requests are welcome. When reporting a defect, include the KiCad
version, the library and item name, and what you expected to see. When
requesting a component, include the manufacturer part number and a datasheet
link. The issue forms ask for both.

## Licensing

Kiboar is a **mixed-licence collection**, and only because of its symbols:

- every 3D model and every footprint is **MIT**, and the symbols drawn here are
  **MIT** too (see [`LICENSE`](LICENSE));
- fifteen imported symbols keep the licence of their source, listed in
  [`NOTICE`](NOTICE) with the evidence.

The split is not a guess. 133 models and 131 of the 146 symbols are original
work, and say so in the file: the STEP `FILE_NAME` header names the author and
`Kiboar`, and the symbols carry hidden `Author` and `License` properties.
`tools/lint.py` fails when a stamp is missing. A further 11 models come from the
Keyswitch KiCad Library under its MIT option and carry no stamp, because they
are not this author's work. The other 15 symbols are the third-party imports
listed in `NOTICE`.

One thing matters before you use the library commercially: ten symbols are
SnapEDA imports and five are Component Search Engine imports, both under
**CC BY-SA 4.0** with the Design Exception, so they need attribution when the
files themselves are redistributed. No model or footprint carries a
non-commercial or NoDerivatives licence.

The switch, hotswap, cutout and stabilizer models come from the Keyswitch KiCad
Library, which is dual-licensed **MIT / CC BY-SA 4.0**. This repository uses
them under the MIT option; [`LICENSE-kiswitch`](LICENSE-kiswitch) carries the
copyright and permission notice.

## Credits

- [Keyswitch KiCad Library](https://github.com/kiswitch/keyswitch-kicad-library)
  (perigoso, obra, rrotter, Lotier) — used under the MIT option
- [SnapEDA / SnapMagic](https://www.snapeda.com) — CC BY-SA 4.0 with Design Exception 1.0
- [marbastlib](https://github.com/ebastler/marbastlib), [keyswitches.pretty](https://github.com/daprice/keyswitches.pretty)
  and [kicad-libraries](https://github.com/sszczep/kicad-libraries) — reference material
- [KiCad](https://www.kicad.org) — the tool and its libraries
