#!/usr/bin/env python3
"""Normalize the symbol library's metadata.

The library was assembled from several sources (SnapEDA, Mouser, hand-drawn
symbols), so the same fact is stored under different names and the same device
family uses different reference prefixes. This script applies one rule set:

- symbol names and values carry no whitespace;
- one reference prefix per family, with no ``?``;
- manufacturer and part number live in ``Manufacturer`` and ``MPN``;
- custom properties with no value are removed;
- a missing footprint filter points at the linked footprint, a missing keyword
  set names the family.

It does not touch descriptions, datasheets or part-specific keywords: those
need a source per part, and guessing them would be worse than an empty field.

    python3 tools/normalize_symbols.py --check
    python3 tools/normalize_symbols.py symbols/Kiboar.kicad_sym
"""

import argparse
import os
import re
import sys

# One prefix per family: switches are SW (never S), connectors J, LEDs D.
PREFIX = {
    "BatteryHolder": "BT",
    "BatteryJack": "J",
    "Button": "SW",
    "CBK": "J",
    "Dip": "SW",
    "Display": "DS",
    "Encoder": "SW",
    "Ethernet": "J",
    "JOYSTICK": "SW",
    "LED": "D",
    "MCU": "U",
    "OtherConnector": "J",
    "PIM452": "U",
    "PIMORONI": "U",
    "PinHeader": "J",
    "SWITCH": "SW",
    "TRRS": "J",
    "USB-C": "J",
    "USBC": "J",
}

KEYWORDS = {
    "BatteryHolder": "battery holder",
    "BatteryJack": "battery connector jack",
    "Button": "button switch",
    "CBK": "connector",
    "Dip": "dip switch",
    "Display": "display oled lcd",
    "Encoder": "rotary encoder switch",
    "Ethernet": "ethernet connector jack",
    "JOYSTICK": "joystick switch",
    "LED": "led",
    "MCU": "microcontroller module board",
    "OtherConnector": "connector",
    "PIM452": "microcontroller module board",
    "PIMORONI": "microcontroller module board",
    "PinHeader": "pin header connector",
    "Placeholder": "placeholder",
    "SWITCH": "switch",
    "TRRS": "trrs audio jack connector",
    "USB-C": "usb type-c connector",
    "USBC": "usb type-c connector",
}

MANUFACTURER_SOURCES = ("Manufacturer", "MF", "MANUFACTURER", "Manufacturer_Name")
MPN_SOURCES = ("MPN", "MP", "Manufacturer_Part_Number", "Manufacturer Part")
SUPERSEDED = ("MF", "MANUFACTURER", "Manufacturer_Name", "Manufacturer_Part_Number", "Manufacturer Part", "MP")
ALWAYS_KEPT = ("Reference", "Value", "Footprint", "Datasheet", "Description")

RENAME = {"PlaceHolder_MLLC": "Placeholder_MLLC"}

SYMBOL_HEAD = re.compile(r'(?m)^\t\(symbol "([^"]+)"\n')
PROPERTY_HEAD = re.compile(r'(?m)^\t\t\(property "([^"]+)" "((?:[^"\\]|\\.)*)"\n')
PROPERTY_END = "\n\t\t)\n"

PROPERTY_TEMPLATE = (
    '\t\t(property "{name}" "{value}"\n'
    "\t\t\t(at 0 0 0)\n"
    "\t\t\t(show_name no)\n"
    "\t\t\t(do_not_autoplace no)\n"
    "\t\t\t(hide yes)\n"
    "\t\t\t(effects\n"
    "\t\t\t\t(font\n"
    "\t\t\t\t\t(size 1.27 1.27)\n"
    "\t\t\t\t)\n"
    "\t\t\t)\n"
    "\t\t)\n"
)


ESCAPES = {"n": "\n", "r": "\r", "t": "\t", '"': '"', "\\": "\\"}


def quote(value):
    return (
        value.replace("\\", "\\\\")
        .replace('"', '\\"')
        .replace("\n", "\\n")
        .replace("\r", "\\r")
        .replace("\t", "\\t")
    )


def unquote(value):
    return re.sub(r"\\(.)", lambda match: ESCAPES.get(match.group(1), match.group(1)), value)


def family(name):
    return name.split("_", 1)[0]


def new_name(name):
    rename = RENAME.get(name)
    if rename:
        return rename
    return re.sub(r"\s+", "_", name)


def reference_prefix(name, current):
    token = family(name)
    if token in ("PlaceHolder", "Placeholder"):
        if name in ("Placeholder_Keyswitch", "Placeholder_Switch"):
            return "SW"
        stripped = current.rstrip("?")
        return stripped or "U"
    if token not in PREFIX:
        raise SystemExit(f"no reference prefix rule for {name!r}")
    return PREFIX[token]


def property_blocks(block):
    """Yield (name, value, start, end) for every property in a symbol block."""
    for match in PROPERTY_HEAD.finditer(block):
        end = block.find(PROPERTY_END, match.end())
        if end < 0:
            raise ValueError(f"unterminated property {match.group(1)!r}")
        end += len(PROPERTY_END)
        yield match.group(1), unquote(match.group(2)), match.start(), end


def replace_value(block, start, end, value):
    """Rewrite the quoted value on a property's first line."""
    head_end = block.index("\n", start) + 1
    head = block[start:head_end]
    rewritten = re.sub(
        r'^(\t\t\(property "[^"]+" ")(?:[^"\\]|\\.)*(")',
        lambda match: match.group(1) + quote(value) + match.group(2),
        head,
        count=1,
    )
    return rewritten + block[head_end:end]


def normalize_block(name, block):
    """Return the normalized block and the list of changes made."""
    changes = []
    renamed = new_name(name)

    edits = []
    if renamed != name:
        edits.append((0, len(f'\t(symbol "{name}"'), f'\t(symbol "{renamed}"'))
        for match in re.finditer(r'(?m)^(\t\t\(symbol ")' + re.escape(name) + r'(_[^"]*")', block):
            edits.append((match.start(), match.end(), match.group(1) + renamed + match.group(2)))
        changes.append(f"renamed {name!r} -> {renamed!r}")

    properties = list(property_blocks(block))
    by_name = {prop[0]: prop for prop in properties}

    def canonical(sources):
        for source in sources:
            value = by_name.get(source, (None, ""))[1].strip()
            if value:
                return value
        return ""

    manufacturer = canonical(MANUFACTURER_SOURCES)
    mpn = canonical(MPN_SOURCES)

    description = by_name.get("Description", (None, ""))[1]
    if not description.strip():
        alternative = by_name.get("Description_1", (None, ""))[1]
        collapsed = " ".join(alternative.split())
        if collapsed:
            description = collapsed
            changes.append("description from Description_1")

    keywords = by_name.get("ki_keywords", (None, ""))[1].strip()
    if not keywords:
        keywords = KEYWORDS.get(family(renamed), "")
        if keywords:
            changes.append("keywords added")

    filters = by_name.get("ki_fp_filters", (None, ""))[1].strip()
    footprint = by_name.get("Footprint", (None, ""))[1].strip()
    if not filters and footprint:
        footprint_name = footprint.split(":", 1)[-1]
        if not re.search(r"\s", footprint_name):
            filters = footprint_name
            changes.append("footprint filter added")

    desired = {}
    if manufacturer:
        desired["Manufacturer"] = manufacturer
    if mpn:
        desired["MPN"] = mpn
    if keywords:
        desired["ki_keywords"] = keywords
    if filters:
        desired["ki_fp_filters"] = filters
    if description.strip():
        desired["Description"] = description

    for prop_name, value, start, end in properties:
        if prop_name in ("Reference",):
            prefix = reference_prefix(renamed, value)
            if prefix != value:
                edits.append((start, end, replace_value(block, start, end, prefix)))
                changes.append(f"reference {value!r} -> {prefix!r}")
            continue

        if prop_name == "Value":
            if value == name and renamed != name:
                edits.append((start, end, replace_value(block, start, end, renamed)))
                changes.append("value renamed")
            continue

        if prop_name == "Description":
            if description != value:
                edits.append((start, end, replace_value(block, start, end, description)))
            continue

        if prop_name in ("ki_keywords", "ki_fp_filters"):
            continue

        if prop_name in SUPERSEDED or prop_name == "Description_1":
            edits.append((start, end, ""))
            changes.append(f"dropped {prop_name!r}")
            continue

        if prop_name not in ALWAYS_KEPT and value.strip().lower() in ("", "none"):
            edits.append((start, end, ""))

    existing = {prop[0] for prop in properties}
    missing = [name for name in desired if name not in existing]
    if missing:
        anchor = None
        for candidate in ("Description", "Datasheet", "Footprint", "Value"):
            if candidate in by_name:
                anchor = by_name[candidate]
                break
        if anchor is None:
            raise ValueError(f"{name!r} has no property anchor")
        text = "".join(
            PROPERTY_TEMPLATE.format(name=field, value=quote(desired[field])) for field in missing
        )
        edits.append((anchor[3], anchor[3], text))
        changes.append("added " + ", ".join(missing))

    for start, end, replacement in sorted(edits, key=lambda edit: edit[0], reverse=True):
        block = block[:start] + replacement + block[end:]
    return block, [f"{renamed}: {change}" for change in changes]


def normalize(text):
    """Normalize a whole library and return (text, changes, leftover check)."""
    heads = list(SYMBOL_HEAD.finditer(text))
    if not heads:
        raise ValueError("no symbols found")
    out = []
    changes = []
    cursor = 0
    for index, match in enumerate(heads):
        out.append(text[cursor:match.start()])
        end = heads[index + 1].start() if index + 1 < len(heads) else len(text)
        block, block_changes = normalize_block(match.group(1), text[match.start():end])
        out.append(block)
        changes.extend(block_changes)
        cursor = end
    out.append(text[cursor:])
    return "".join(out), changes


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("path", nargs="?", default=os.path.join("symbols", "Kiboar.kicad_sym"))
    parser.add_argument("--check", action="store_true", help="report what is not normalized")
    parser.add_argument("--quiet", action="store_true")
    args = parser.parse_args()

    with open(args.path, encoding="utf-8") as handle:
        text = handle.read()

    updated, changes = normalize(text)
    if args.check:
        if not args.quiet:
            for change in changes:
                print(change)
        print(f"{len(changes)} metadata changes pending in {args.path}")
        return 1 if changes else 0

    with open(args.path, "w", encoding="utf-8", newline="") as handle:
        handle.write(updated)
    if not args.quiet:
        for change in changes:
            print(change)
    print(f"{len(changes)} changes written to {args.path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
