#!/usr/bin/env python3
"""Stamp the authorship and the licence into the CAD files.

`NOTICE` is the authority for provenance: it names every third-party origin and
the evidence. This tool is the machine-readable half of it. Models in
``REWRITTEN_MODELS`` are original work whose header named another
machine or project: their whole ``FILE_NAME`` call is replaced, not just the
author field, so no foreign path survives.
Everything NOTICE does not attribute to a third party is original work by the
library author, released under MIT, and says so inside the file:

- STEP models carry it in the ``FILE_NAME`` header, author and organization;
- KiCad symbols carry it in two hidden properties, ``Author`` and ``License``.

The STEP header is an ASCII field, so the author is spelled ``Raul Mora``
there; `LICENSE` and `NOTICE` keep the accented legal name. Every model in the
repository is STEP, so the header covers all of them.

    python3 tools/provenance.py --check    # fail when a stamp is missing or wrong
    python3 tools/provenance.py --write    # stamp every original file
"""

import argparse
import glob
import os
import re
import sys

import normalize_symbols

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS = os.path.join(ROOT, "3dmodels")
SYMBOL_LIBRARY = os.path.join(ROOT, "symbols", "Kiboar.kicad_sym")

AUTHOR = "Raul Mora"
ORGANIZATION = "Kiboar"
LICENCE = "MIT"

#: Models whose header named another machine, project or author, but whose
#: geometry is original work by the library author. `--write` replaces the whole
#: ``FILE_NAME`` call, so no foreign path, author or organization survives.
#: `NOTICE` records what each header used to say, because the file itself cannot
#: prove where the geometry came from.
REWRITTEN_MODELS = {
    "Kiboar_BatteryHolder.3dshapes/1016.step",
    "Kiboar_BatteryHolder.3dshapes/1020.step",
    "Kiboar_BatteryHolder.3dshapes/1024.step",
    "Kiboar_BatteryHolder.3dshapes/1058.step",
    "Kiboar_Button.3dshapes/434123025816.step",
    "Kiboar_Dip.3dshapes/418121270804.stp",
    "Kiboar_Dip.3dshapes/418127270904.stp",
    "Kiboar_Display.3dshapes/Nice_View.step",
    "Kiboar_Display.3dshapes/OLED_128x32.step",
    "Kiboar_MCU.3dshapes/Adafruit_KB2040.step",
    "Kiboar_MCU.3dshapes/Waveshare-ESP32-C6-Zero.step",
    "Kiboar_Placeholder.3dshapes/Capacitor_0402.step",
    "Kiboar_Switch.3dshapes/MSK12C02.step",
    "Kiboar_TRRS.3dshapes/PJ-320A.step",
    "Kiboar_USB-C.3dshapes/216990-0001.stp",
    "Kiboar_USB-C.3dshapes/216990-0002.stp",
    "Kiboar_USB-C.3dshapes/MOLEX_217179-0001.stp",
}

#: Symbols imported as CAD from a third party. The rest are drawn here.
EXTERNAL_SYMBOLS = {
    # SnapEDA imports, CC BY-SA 4.0 with the Design Exception.
    "Button_EVPBB2A9B000",
    "Button_TL3315NF160QG",
    "CBK_L717HDE15PD1CH4F",
    "Ethernet_6339191-5",
    "PinHeader_61000621121",
    "PinHeader_61001021121",
    "PinHeader_61300621021",
    "PinHeader_61300621121",
    "PinHeader_61301021021",
    "PinHeader_61301021121",
    # Component Search Engine (Samacsys) imports.
    "Button_B3U-3000P-B",
    "Button_SKHLLCA010",
    "Encoder_EC12E2440301",
    "Ethernet_43860-0025",
    "Ethernet_6116075-4",
}

PROPERTIES = {"Author": AUTHOR, "License": LICENCE}

FILE_NAME = re.compile(r"FILE_NAME\s*\(")
STEP_STRING = re.compile(r"'((?:[^']|'')*)'")
EXTERNAL_AUTHORS = (
    "jscotto",
    "kicadstepup",
    "ksumcad",
    "richardmaletta",
    "gga",
    "xiaojisheng",
    "ryotagoto",
)


def model_paths():
    for path in sorted(glob.glob(os.path.join(MODELS, "*", "*"))):
        if path.lower().endswith((".step", ".stp")):
            yield os.path.relpath(path, MODELS), path


def symbol_names(text):
    return [match.group(1) for match in normalize_symbols.SYMBOL_HEAD.finditer(text)]


def split_arguments(text, open_index):
    """Return the (start, end) span of every top-level argument of a call."""
    spans = []
    depth = 0
    start = open_index + 1
    quoted = False
    for index in range(open_index, len(text)):
        char = text[index]
        if quoted:
            if char == "'":
                quoted = False
            continue
        if char == "'":
            quoted = True
        elif char in "([":
            depth += 1
        elif char in ")]":
            depth -= 1
            if depth == 0:
                spans.append((start, index))
                return spans
        elif char == "," and depth == 1:
            spans.append((start, index))
            start = index + 1
    raise ValueError("unterminated argument list")


def step_header(text):
    """Return (name, author, organization) from the ``FILE_NAME`` entity."""
    values = file_name_values(text)
    return values[0], values[2], values[3]


def file_name_values(text):
    """Return the seven string values of the ``FILE_NAME`` entity.

    The values are read with the comments stripped, because the Autodesk
    exports label every argument with a ``/* name */`` style comment.
    """
    _, spans = file_name_spans(text)
    return [step_string(text[start:end]) for start, end in spans]


def file_name_spans(text):
    """Return the ``FILE_NAME`` match and the spans of its arguments."""
    match = FILE_NAME.search(text)
    if not match:
        raise ValueError("no FILE_NAME entity")
    spans = split_arguments(text, match.end() - 1)
    if len(spans) < 7:
        raise ValueError("FILE_NAME has fewer than seven arguments")
    return match, spans


def step_string(argument):
    """Return the first quoted value of an argument, with ``''`` unescaped."""
    match = STEP_STRING.search(argument)
    return match.group(1).replace("''", "'") if match else ""


def quote(value):
    return "'" + value.replace("'", "''") + "'"


def rewritten_file_name(values, name):
    """Return the canonical ``FILE_NAME`` call of a claimed model.

    Only the file name, the author and the organization change. The timestamp,
    the preprocessor and the originating system stay: they describe the
    software that wrote the file, not the person who drew the geometry.
    """
    values = list(values[:7])
    values[0] = name
    values[2] = AUTHOR
    values[3] = ORGANIZATION
    fields = [
        quote(values[0]),
        quote(values[1]),
        f"({quote(values[2])})",
        f"({quote(values[3])})",
        quote(values[4]),
        quote(values[5]),
        quote(values[6]),
    ]
    return "FILE_NAME(" + ", ".join(fields) + ")"


def trim(text, span):
    """Drop the whitespace around an argument so a rewrite keeps the layout."""
    start, end = span
    inner = text[start:end]
    return start + (len(inner) - len(inner.lstrip())), end - (len(inner) - len(inner.rstrip()))


def stamp_model(path, relative):
    with open(path, "rb") as handle:
        text = handle.read().decode("latin-1")
    match, spans = file_name_spans(text)
    values = [step_string(text[start:end]) for start, end in spans]

    if relative in REWRITTEN_MODELS:
        replaced = (
            text[: match.start()]
            + rewritten_file_name(values, os.path.basename(path))
            + text[spans[-1][1] + 1 :]
        )
        if replaced == text:
            return False
    else:
        author, organization = values[2], values[3]
        if (author, organization) == (AUTHOR, ORGANIZATION):
            return False
        if author and author != AUTHOR and looks_external(author, organization):
            raise SystemExit(
                f"{os.path.relpath(path, ROOT)}: header names {author!r}; "
                "record the origin in NOTICE before stamping it"
            )
        author_span, organization_span = trim(text, spans[2]), trim(text, spans[3])
        replaced = (
            text[: author_span[0]]
            + f"('{AUTHOR}')"
            + text[author_span[1] : organization_span[0]]
            + f"('{ORGANIZATION}')"
            + text[organization_span[1] :]
        )
        if replaced == text:
            return False

    with open(path, "wb") as handle:
        handle.write(replaced.encode("latin-1"))
    return True


def looks_external(author, organization):
    haystack = f"{author} {organization}".lower()
    return any(name in haystack for name in EXTERNAL_AUTHORS)


def stamp_symbols(text):
    """Return the library text with the author properties in every own symbol."""
    heads = list(normalize_symbols.SYMBOL_HEAD.finditer(text))
    if not heads:
        raise ValueError("no symbols found")
    out = []
    cursor = 0
    changed = []
    for index, match in enumerate(heads):
        out.append(text[cursor : match.start()])
        end = heads[index + 1].start() if index + 1 < len(heads) else len(text)
        block = text[match.start() : end]
        if match.group(1) not in EXTERNAL_SYMBOLS:
            block, edited = stamp_symbol(match.group(1), block)
            if edited:
                changed.append(match.group(1))
        out.append(block)
        cursor = end
    out.append(text[cursor:])
    return "".join(out), changed


def stamp_symbol(name, block):
    properties = list(normalize_symbols.property_blocks(block))
    if not properties:
        raise ValueError(f"{name!r} has no properties")
    by_name = {prop[0]: prop for prop in properties}
    edits = []
    missing = []
    for key, value in PROPERTIES.items():
        if key in by_name:
            _, current, start, end = by_name[key]
            if current != value:
                edits.append((start, end, normalize_symbols.replace_value(block, start, end, value)))
        else:
            missing.append(key)
    if missing:
        text = "".join(
            normalize_symbols.PROPERTY_TEMPLATE.format(
                name=key, value=normalize_symbols.quote(PROPERTIES[key])
            )
            for key in missing
        )
        anchor = properties[-1][3]
        edits.append((anchor, anchor, text))
    for start, end, replacement in sorted(edits, key=lambda edit: edit[0], reverse=True):
        block = block[:start] + replacement + block[end:]
    return block, bool(edits)


def check():
    problems = []
    for relative, path in model_paths():
        with open(path, "rb") as handle:
            text = handle.read(4000).decode("latin-1")
        try:
            name, author, organization = step_header(text)
        except ValueError as error:
            problems.append(f"3dmodels/{relative}: {error}")
            continue
        if (author, organization) != (AUTHOR, ORGANIZATION):
            problems.append(
                f"3dmodels/{relative}: author is {author!r} / {organization!r}, "
                f"expected {AUTHOR!r} / {ORGANIZATION!r}"
            )
        if relative in REWRITTEN_MODELS and name != os.path.basename(path):
            problems.append(
                f"3dmodels/{relative}: file name is {name!r}, "
                f"expected {os.path.basename(path)!r}"
            )
    for relative in REWRITTEN_MODELS:
        if not os.path.isfile(os.path.join(MODELS, relative)):
            problems.append(f"3dmodels/{relative}: listed as rewritten but missing")

    with open(SYMBOL_LIBRARY, encoding="utf-8") as handle:
        library = handle.read()
    for match in normalize_symbols.SYMBOL_HEAD.finditer(library):
        name = match.group(1)
        end = library.find("\n\t(symbol ", match.end())
        block = library[match.start() : end if end > 0 else len(library)]
        properties = {prop[0]: prop[1] for prop in normalize_symbols.property_blocks(block)}
        if name in EXTERNAL_SYMBOLS:
            if "Author" in properties:
                problems.append(f"symbols/{name}: imported symbol carries the author stamp")
            continue
        for key, value in PROPERTIES.items():
            if properties.get(key) != value:
                problems.append(f"symbols/{name}: {key} is {properties.get(key)!r}, expected {value!r}")
    for name in EXTERNAL_SYMBOLS:
        if name not in symbol_names(library):
            problems.append(f"symbols/{name}: listed as imported but missing")
    return problems


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--write", action="store_true", help="stamp the original files")
    parser.add_argument("--check", action="store_true", help="report missing or wrong stamps")
    args = parser.parse_args()
    if not (args.write or args.check):
        parser.error("choose --write or --check")

    if args.check:
        problems = check()
        for problem in problems:
            print(problem)
        print(f"{len(problems)} problems")
        return 1 if problems else 0

    stamped = 0
    for relative, path in model_paths():
        if stamp_model(path, relative):
            stamped += 1
    with open(SYMBOL_LIBRARY, encoding="utf-8") as handle:
        library = handle.read()
    library, changed = stamp_symbols(library)
    if changed:
        with open(SYMBOL_LIBRARY, "w", encoding="utf-8") as handle:
            handle.write(library)
    print(f"stamped {stamped} models and {len(changed)} symbols")
    return 0


if __name__ == "__main__":
    sys.exit(main())
