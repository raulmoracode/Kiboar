#!/usr/bin/env python3
"""Generate the component pages of the documentation site.

Every footprint is listed in the page of its library, with pads, mount type,
courtyard and 3D model. Nothing in the library is left out of the docs.

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
        "Rotary encoders and potentiometers.",
        "Encoders rotativos y potenciómetros.",
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
        "M1 and M2 mounting holes.",
        "Taladros de montaje M1 y M2.",
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


HOME_START = "{/* generated:start */}"
HOME_END = "{/* generated:end */}"

def plural(count, noun):
    return f"{count} {noun}" if count == 1 else f"{count} {noun}s"


PREVIEW_OVERRIDES = {
    "Kiboar_MechSwitch": "1_CherryMX_1.00u",
    "Kiboar_CAD": "CAD_MX_1.00u",
    "Kiboar_Cutout": "Cutout_MX_1.00u",
}


def library_preview(library):
    """Preview that shows the most geometry without dragging a huge SVG along."""
    preferred = PREVIEW_OVERRIDES.get(library)
    if preferred:
        path = os.path.join(ROOT, "docs", "public", "footprints", library, preferred + ".svg")
        if os.path.exists(path):
            return f"/footprints/{library}/{quote(preferred)}.svg"

    assets = [
        path
        for path in glob.glob(os.path.join(ROOT, "docs", "public", "footprints", library, "*.svg"))
        if os.path.getsize(path) <= 30_000
    ]
    if not assets:
        return None
    best = max(assets, key=os.path.getsize)
    name = os.path.basename(best)[: -len(".svg")]
    return f"/footprints/{library}/{quote(name)}.svg"


FAMILY_GROUPS = (
    (
        ("Switches and buttons", "Interruptores y botones"),
        ("Kiboar_SlideSwitch", "Kiboar_DIPSwitch", "Kiboar_TactileButton"),
    ),
    (
        ("Electronics", "Electrónica"),
        (
            "Kiboar_MCU",
            "Kiboar_DevBoard",
            "Kiboar_Display",
            "Kiboar_LED",
            "Kiboar_Buzzer",
            "Kiboar_Resistor",
            "Kiboar_Capacitor",
            "Kiboar_Diode",
            "Kiboar_Fuse",
            "Kiboar_SOT23",
        ),
    ),
    (
        ("Connectors and power", "Conectores y energía"),
        (
            "Kiboar_USBC",
            "Kiboar_TRRS",
            "Kiboar_BatteryHolder",
            "Kiboar_BatteryJack",
            "Kiboar_Ethernet",
            "Kiboar_BoardConnector",
            "Kiboar_PinHeader",
            "Kiboar_Qwiic",
        ),
    ),
    (
        ("Board and controls", "Placa y controles"),
        (
            "Kiboar_Encoder",
            "Kiboar_Joystick",
            "Kiboar_MountingHole",
            "Kiboar_TestPoint",
            "Kiboar_Panelization",
        ),
    ),
)


# Families rendered as a collapsible sidebar folder. A folder is a real
# directory, so its pages move below it and their URL follows.
FAMILY_FOLDERS = {
    "Switches and buttons": "switches-and-buttons",
    "Electronics": "electronics",
    "Connectors and power": "connectors-and-power",
    "Board and controls": "board-and-controls",
}

LIBRARY_FOLDERS = {
    library: folder
    for (english, _), members in FAMILY_GROUPS
    if (folder := FAMILY_FOLDERS.get(english))
    for library in members
}


def library_route(library):
    """Path of a library page below ``libraries``, folder included."""
    folder = LIBRARY_FOLDERS.get(library)
    return f"libraries/{folder}/{library}" if folder else f"libraries/{library}"


def folder_titles(folder):
    for (english, translated), _ in FAMILY_GROUPS:
        if FAMILY_FOLDERS.get(english) == folder:
            return english, translated
    raise KeyError(folder)


def library_label(library):
    """Page and sidebar name: the family part of the library, without Kiboar_."""
    return library[len("Kiboar_") :] if library.startswith("Kiboar_") else library


def family_card(library, count, prefix):
    label = library_label(library)
    count_text = plural(count, "footprint")
    preview = library_preview(library)
    icon = ""
    if preview:
        icon = (
            ' icon={<span className="flex h-20 w-28 items-center justify-center">'
            f'<img loading="lazy" src="{preview}" alt="" className="max-h-full max-w-full object-contain dark:invert" />'
            "</span>}"
        )
    return (
        f'  <Card title="{label}" description="{count_text}"'
        f' href="{prefix}/docs/{library_route(library)}"{icon} />'
    )


def family_groups(library_counts):
    """The libraries split by what they are for, leftovers under More."""
    placed = set()
    groups = []
    for labels, members in FAMILY_GROUPS:
        present = [library for library in members if library in library_counts]
        placed.update(present)
        if present:
            groups.append((labels, present))

    leftover = sorted(set(library_counts) - placed)
    if leftover:
        groups.append((("More", "Más"), leftover))
    return groups


def home_block(library_counts, spanish):
    """The footprint libraries, grouped by what they are for."""
    lines = []
    prefix = "/es" if spanish else ""
    for (english, translated), members in family_groups(library_counts):
        heading = translated if spanish else english
        lines += [
            "",
            f"## {heading}",
            "",
            '<div class="not-prose grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">',
        ]
        for library in members:
            lines.append(family_card(library, library_counts[library], prefix))
        lines.append("</div>")

    return "\n".join(lines)


def home_page(name, library_counts, spanish):
    """Rewrite the generated block of a home page, keeping the prose around it."""
    path = os.path.join(DOCS, name)
    text = open(path, encoding="utf-8").read()
    head, rest = text.split(HOME_START, 1)
    _, tail = rest.split(HOME_END, 1)
    block = home_block(library_counts, spanish)
    return head + HOME_START + "\n" + block + "\n" + HOME_END + tail


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


def library_cards(library, footprints, spanish):
    en_text, es_text = LIBRARY_TEXT.get(library, ("", ""))
    text = es_text if spanish else en_text
    lines = [
        "---",
        f'title: "{library_label(library)}"',
    ]
    if text:
        lines.append(f'description: "{text}"')
    lines += [
        "---",
        "",
    ]
    for row in footprints:
        name = row["name"]
        lines += [
            f"## {cell(name)}",
            "",
            '<article class="not-prose my-4 rounded-xl border bg-fd-card p-4">',
            '  <div class="grid gap-4 sm:grid-cols-2">',
            f'    <img loading="lazy" src="/footprints/{library}/{quote(name)}.svg" alt="{cell(name)} footprint" class="w-full rounded-lg border bg-white p-2" />',
        ]
        if row["models"]:
            lines.append('    <div class="grid content-start gap-4">')
            for uri in row["models"]:
                rel = uri.split("/", 1)[1]
                raw = f"https://raw.githubusercontent.com/raulmoracode/Kiboar/main/3dmodels/{quote(rel)}"
                lines.append(f'      <kiboar-model compact url="{raw}"></kiboar-model>')
            lines.append("    </div>")
        else:
            lines.append(
                '    <div class="flex h-56 items-center justify-center rounded-lg border text-sm text-fd-muted-foreground">No 3D model</div>'
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
            "  </div>",
            '  <div class="mt-4 overflow-x-auto">',
            '    <table class="w-full min-w-[36rem] border-collapse text-left text-sm">',
            "      <thead><tr>",
        ]
        for header in headers:
            lines.append(f'        <th class="border-b px-2 py-1 font-medium text-fd-muted-foreground">{header}</th>')
        lines += ["      </tr></thead>", "      <tbody><tr>"]
        for value in values:
            lines.append(f'        <td class="border-b px-2 py-1">{value}</td>')
        lines += ["      </tr></tbody>", "    </table>", "  </div>", "</article>", ""]
    return "\n".join(lines)


def meta(title, pages):
    import json

    return json.dumps({"title": title, "pages": pages}, indent=2) + "\n"


def library_meta(library_counts, spanish):
    """The Libraries folder: a collapsible folder per family, or a separator."""
    pages = []
    for (english, translated), members in family_groups(library_counts):
        folder = FAMILY_FOLDERS.get(english)
        if folder:
            pages.append(folder)
        else:
            pages.append(f"---{translated if spanish else english}---")
            pages.extend(members)
    return meta("Librerías" if spanish else "Libraries", pages)


def generated_files():
    files = {}
    libraries = sorted(
        os.path.basename(path)[: -len(".pretty")]
        for path in glob.glob(os.path.join(ROOT, "footprints", "*.pretty"))
    )
    for library in libraries:
        footprints = [
            footprint_rows(path)
            for path in sorted(
                glob.glob(os.path.join(ROOT, "footprints", library + ".pretty", "*.kicad_mod"))
            )
        ]
        route = library_route(library)
        files[f"{route}.mdx"] = library_cards(library, footprints, False)
        files[f"{route}.es.mdx"] = library_cards(library, footprints, True)

    library_counts = {
        library: len(glob.glob(os.path.join(ROOT, "footprints", library + ".pretty", "*.kicad_mod")))
        for library in libraries
    }
    files["index.mdx"] = home_page("index.mdx", library_counts, False)
    files["index.es.mdx"] = home_page("index.es.mdx", library_counts, True)
    files["libraries/meta.json"] = library_meta(library_counts, False)
    files["libraries/meta.es.json"] = library_meta(library_counts, True)
    for folder in FAMILY_FOLDERS.values():
        english, translated = folder_titles(folder)
        members = [library for library in libraries if LIBRARY_FOLDERS.get(library) == folder]
        files[f"libraries/{folder}/meta.json"] = meta(english, members)
        files[f"libraries/{folder}/meta.es.json"] = meta(translated, members)
    # Fumadocs renders "---Name---" as a titled separator. It labels a group of
    # pages that cannot share a folder, because Home is the root index at /docs.
    files["meta.json"] = meta(
        "Documentation",
        [
            "---Getting started---",
            "index",
            "install",
            "libraries",
            "---Project---",
            "contributing",
            "licensing",
        ],
    )
    files["meta.es.json"] = meta(
        "Documentación",
        [
            "---Primeros pasos---",
            "index",
            "install",
            "libraries",
            "---Proyecto---",
            "contributing",
            "licensing",
        ],
    )
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
