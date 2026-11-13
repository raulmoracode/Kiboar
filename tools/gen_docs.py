#!/usr/bin/env python3
"""Generate the component pages of the documentation site.

Every footprint is listed in the page of its library, with pads, mount type,
courtyard and 3D model, and every symbol is listed with its reference,
manufacturer, MPN, datasheet and linked footprint. Nothing in the library is
left out of the docs.

    python3 tools/gen_docs.py            # write the pages
    python3 tools/gen_docs.py --check    # fail when a page is stale
"""

import argparse
import glob
import html
import os
import re
import sys
from urllib.parse import quote

import kicad_sexpr as sexpr

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS = os.path.join(ROOT, "docs", "content", "docs")

LIBRARY_TEXT = {
    "Kiboar_BatteryHolder": (
        "Coin-cell and cylindrical battery holders.",
        "Portapilas de botón y cilíndricas.",
    ),
    "Kiboar_BatteryJack": (
        "JST PH battery connectors.",
        "Conectores de batería JST PH.",
    ),
    "Kiboar_Button": (
        "Tactile push buttons from Alps, Omron, Panasonic, E-Switch and C&K.",
        "Pulsadores táctiles de Alps, Omron, Panasonic, E-Switch y C&K.",
    ),
    "Kiboar_Buzzer": ("SMD buzzers.", "Zumbadores SMD."),
    "Kiboar_CAD": (
        "Keycap and plate outlines for CAD renders.",
        "Contornos de keycaps y placas para renders CAD.",
    ),
    "Kiboar_CBK": (
        "Board and card-edge connectors.",
        "Conectores de placa y de tarjeta.",
    ),
    "Kiboar_Cutout": (
        "PCB and plate cutouts for switches, sockets and stabilizers.",
        "Recortes de PCB y placa para switches, zócalos y estabilizadores.",
    ),
    "Kiboar_Dip": ("DIP switches.", "Interruptores DIP."),
    "Kiboar_Display": (
        "OLED and e-paper display modules.",
        "Módulos de pantalla OLED y e-paper.",
    ),
    "Kiboar_Encoder": (
        "Rotary encoders and encoder/switch combinations.",
        "Encoders rotativos y combinaciones encoder/interruptor.",
    ),
    "Kiboar_Ethernet": ("RJ45 jacks.", "Conectores RJ45."),
    "Kiboar_Joystick": (
        "5-way tactile and analog thumbsticks.",
        "Joysticks táctiles de 5 vías y analógicos.",
    ),
    "Kiboar_Led": (
        "Addressable RGB and through-hole LEDs.",
        "LEDs RGB direccionables y de inserción.",
    ),
    "Kiboar_MCU": (
        "RP2040, ESP32, STM32, Pro Micro and Pico controller boards.",
        "Placas controladoras RP2040, ESP32, STM32, Pro Micro y Pico.",
    ),
    "Kiboar_MechSwitch": (
        "Cherry MX and Kailh Choc switch positions with sockets, stabilizers and LEDs.",
        "Posiciones de switch Cherry MX y Kailh Choc con zócalos, estabilizadores y LEDs.",
    ),
    "Kiboar_Miscellaneous": (
        "Test points, USB hubs and board bites.",
        "Puntos de prueba, hubs USB y board bites.",
    ),
    "Kiboar_MountingHole": (
        "Mounting holes and M2 standoffs.",
        "Taladros de montaje y separadores M2.",
    ),
    "Kiboar_OtherConnectors": ("Other connectors.", "Otros conectores."),
    "Kiboar_PinHeader": ("Pin headers.", "Tiras de pines."),
    "Kiboar_Placeholder": (
        "Generic R, C, L, LED, diode, fuse, crystal and SOT-23 placeholders.",
        "Placeholders genéricos de R, C, L, LED, diodo, fusible, cristal y SOT-23.",
    ),
    "Kiboar_Switch": (
        "Slide and toggle switches.",
        "Interruptores deslizantes y de palanca.",
    ),
    "Kiboar_TRRS": ("TRRS audio jacks.", "Jacks de audio TRRS."),
    "Kiboar_USB-C": ("USB-C receptacles.", "Receptáculos USB-C."),
}


def cell(value):
    """Plain text safe inside an MDX table cell."""
    text = re.sub(r"<[^>]+>", " ", value or "")
    text = html.unescape(text)
    text = text.replace("|", "\\|").replace("<", "&lt;").replace(">", "&gt;")
    text = text.replace("{", "&#123;").replace("}", "&#125;")
    return " ".join(text.split())


def property_value(block, name):
    for prop in sexpr.children(block, "property"):
        if len(prop) > 2 and sexpr.unquote(prop[1]) == name:
            return sexpr.unquote(prop[2])
    return ""


def footprint_rows(path):
    with open(path, encoding="utf-8") as handle:
        tree = sexpr.parse(handle.read())
    kinds = [node[2] for node in tree[1:] if isinstance(node, list) and node and node[0] == "pad"]
    counts = {
        "THT": kinds.count("thru_hole"),
        "SMD": kinds.count("smd"),
        "NPTH": kinds.count("np_thru_hole"),
    }
    pads = ", ".join(f"{value} {label}" for label, value in counts.items() if value) or "—"
    attribute = sexpr.child(tree, "attr")
    attr = " ".join(str(token) for token in attribute[1:]) if attribute else "—"
    courtyard = "no"
    for kind in ("fp_rect", "fp_line", "fp_poly", "fp_circle"):
        for node in sexpr.children(tree, kind):
            layer = sexpr.child(node, "layer")
            if layer and sexpr.unquote(layer[1]) in ("F.CrtYd", "B.CrtYd"):
                courtyard = "yes"
    models = [sexpr.unquote(node[1]) for node in sexpr.children(tree, "model") if len(node) > 1]
    model = ", ".join(uri.rsplit("/", 1)[-1] for uri in models) or "—"
    descr = sexpr.atom(tree, "descr")
    description = sexpr.unquote(descr) if descr else ""
    return {
        "name": os.path.basename(path)[: -len(".kicad_mod")],
        "pads": pads,
        "attr": attr,
        "courtyard": courtyard,
        "model": model,
        "models": models,
        "description": description,
    }


# Libraries rendered as component cards instead of a table. Start with the
# small ones; a 1071-row library would need pagination before it can use cards.
CARD_LIBRARIES = {"Kiboar_USB-C"}


def library_cards(library, footprints, spanish):
    lines = [
        "---",
        f'title: "{library}"',
        "---",
        "",
        '<div class="not-prose my-6 flex flex-col gap-6">',
    ]
    for row in footprints:
        name = row["name"]
        lines += [
            '  <article class="rounded-xl border bg-fd-card p-4">',
            f'    <h2 class="text-lg font-semibold">{cell(name)}</h2>',
            '    <div class="mt-4 grid gap-4 sm:grid-cols-2">',
            f'      <img loading="lazy" src="/footprints/{library}/{quote(name)}.svg" alt="{cell(name)} footprint" class="w-full rounded-lg border bg-white p-2" />',
        ]
        if row["models"]:
            for uri in row["models"]:
                rel = uri.split("/", 1)[1]
                raw = f"https://raw.githubusercontent.com/raulmoracode/Kiboar/main/3dmodels/{quote(rel)}"
                lines.append(f'      <kiboar-model compact url="{raw}"></kiboar-model>')
        else:
            lines.append(
                '      <div class="flex h-56 items-center justify-center rounded-lg border text-sm text-fd-muted-foreground">No 3D model</div>'
            )
        headers = (
            ("Pads", "Attr", "Courtyard", "Modelo 3D", "Descripción")
            if spanish
            else ("Pads", "Attr", "Courtyard", "3D model", "Description")
        )
        values = (
            cell(row["pads"]),
            f'<code>{cell(row["attr"])}</code>',
            row["courtyard"],
            f'<code>{cell(row["model"])}</code>',
            cell(row["description"]) or "—",
        )
        lines += [
            "    </div>",
            '    <table class="mt-4 w-full border-collapse text-left text-sm">',
            "      <thead><tr>",
        ]
        for header in headers:
            lines.append(f'        <th class="border-b px-2 py-1 font-medium text-fd-muted-foreground">{header}</th>')
        lines += ["      </tr></thead>", "      <tbody><tr>"]
        for value in values:
            lines.append(f'        <td class="border-b px-2 py-1">{value}</td>')
        lines += ["      </tr></tbody>", "    </table>", "  </article>"]
    lines += ["</div>", ""]
    return "\n".join(lines)


def library_page(library, footprints, spanish):
    if library in CARD_LIBRARIES:
        return library_cards(library, footprints, spanish)
    en_text, es_text = LIBRARY_TEXT.get(library, ("", ""))
    title = library.replace("Kiboar_", "Kiboar ")
    text = es_text if spanish else en_text
    lines = [
        "---",
        f'title: "{library}"',
        f'description: "{text}"',
        "---",
        "",
        text,
        "",
        f"**{len(footprints)} footprints.**",
        "",
        "| Footprint | Pads | Attr | Courtyard | 3D model | Description |",
        "| --- | --- | --- | --- | --- | --- |",
    ]
    for row in footprints:
        lines.append(
            f"| `{cell(row['name'])}` | {cell(row['pads'])} | `{cell(row['attr'])}` | {row['courtyard']} | "
            f"`{cell(row['model'])}` | {cell(row['description'])} |"
        )
    return "\n".join(lines) + "\n"


def symbol_rows():
    with open(os.path.join(ROOT, "symbols", "Kiboar.kicad_sym"), encoding="utf-8") as handle:
        tree = sexpr.parse(handle.read())
    symbols = []
    for block in tree[1:]:
        if not (isinstance(block, list) and block and block[0] == "symbol"):
            continue
        name = sexpr.unquote(block[1])
        symbols.append(
            {
                "name": name,
                "family": name.split("_", 1)[0],
                "reference": property_value(block, "Reference"),
                "manufacturer": property_value(block, "Manufacturer"),
                "mpn": property_value(block, "MPN"),
                "description": property_value(block, "Description"),
                "datasheet": property_value(block, "Datasheet"),
                "footprint": property_value(block, "Footprint"),
            }
        )
    return symbols


def symbols_page(symbols, spanish):
    intro = (
        "Todos los símbolos de la librería, agrupados por familia. El enlace de "
        "datasheet solo aparece cuando la URL existe."
        if spanish
        else "Every symbol in the library, grouped by family. The datasheet link "
        "only appears when the URL exists."
    )
    lines = [
        "---",
        'title: "Symbols"' if not spanish else 'title: "Símbolos"',
        'description: "Todos los símbolos de Kiboar."' if spanish else 'description: "Every Kiboar symbol."',
        "---",
        "",
        intro,
        "",
        f"**{len(symbols)} symbols.**",
    ]
    families = {}
    for symbol in symbols:
        families.setdefault(symbol["family"], []).append(symbol)
    for family in sorted(families):
        lines += ["", f"## {family}", "", "| Symbol | Ref | Manufacturer | MPN | Description | Datasheet | Footprint |", "| --- | --- | --- | --- | --- | --- | --- |"]
        for symbol in sorted(families[family], key=lambda item: item["name"]):
            datasheet = (
                f"[PDF]({symbol['datasheet']})" if symbol["datasheet"] else "—"
            )
            footprint = symbol["footprint"] or "—"
            lines.append(
                f"| `{cell(symbol['name'])}` | `{cell(symbol['reference'])}` | {cell(symbol['manufacturer'])} | "
                f"`{cell(symbol['mpn']) or '—'}` | {cell(symbol['description'])} | {datasheet} | `{cell(footprint)}` |"
            )
    return "\n".join(lines) + "\n"


def meta(title, pages):
    import json

    return json.dumps({"title": title, "pages": pages}, indent=2) + "\n"


def generated_files():
    files = {}
    libraries = sorted(
        os.path.basename(path)[: -len(".pretty")]
        for path in glob.glob(os.path.join(ROOT, "footprints", "*.pretty"))
    )
    symbols = symbol_rows()

    files["symbols.mdx"] = symbols_page(symbols, False)
    files["symbols.es.mdx"] = symbols_page(symbols, True)

    library_pages = []
    for library in libraries:
        footprints = [
            footprint_rows(path)
            for path in sorted(
                glob.glob(os.path.join(ROOT, "footprints", library + ".pretty", "*.kicad_mod"))
            )
        ]
        files[f"libraries/{library}.mdx"] = library_page(library, footprints, False)
        files[f"libraries/{library}.es.mdx"] = library_page(library, footprints, True)
        library_pages.append(library)

    library_counts = {
        library: len(glob.glob(os.path.join(ROOT, "footprints", library + ".pretty", "*.kicad_mod")))
        for library in libraries
    }
    files["libraries/meta.json"] = meta("Libraries", library_pages)
    files["libraries/meta.es.json"] = meta("Librerías", library_pages)
    files["meta.json"] = meta("Documentation", ["index", "install", "usage", "symbols", "libraries", "contributing", "licensing"])
    files["meta.es.json"] = meta("Documentación", ["index", "install", "usage", "symbols", "libraries", "contributing", "licensing"])
    return files


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--check", action="store_true", help="report stale pages, write nothing")
    args = parser.parse_args()

    files = generated_files()
    stale = []
    for name, content in files.items():
        path = os.path.join(DOCS, name)
        current = open(path, encoding="utf-8").read() if os.path.exists(path) else None
        if current != content:
            stale.append(name)
            if not args.check:
                os.makedirs(os.path.dirname(path), exist_ok=True)
                with open(path, "w", encoding="utf-8", newline="") as handle:
                    handle.write(content)

    missing = []
    for path in glob.glob(os.path.join(ROOT, "footprints", "*.pretty", "*.kicad_mod")):
        library = os.path.basename(os.path.dirname(path))[: -len(".pretty")]
        name = os.path.basename(path)[: -len(".kicad_mod")]
        asset = os.path.join(ROOT, "docs", "public", "footprints", library, name + ".svg")
        if not os.path.exists(asset):
            missing.append(f"missing asset: docs/public/footprints/{library}/{name}.svg")

    if args.check:
        for name in stale:
            print(f"stale: {name}")
        for name in missing:
            print(name)
        print(f"{len(stale)} stale pages, {len(missing)} missing previews")
        return 1 if stale or missing else 0
    print(f"wrote {len(files) - len(stale)} pages, {len(stale)} updated")
    return 0


if __name__ == "__main__":
    sys.exit(main())
