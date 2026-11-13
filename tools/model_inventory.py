#!/usr/bin/env python3
"""List the 3D models that no footprint references.

Unused models are kept on purpose: they are source material for footprints
that may be added later. This tool keeps the list in ``3dmodels/README.md``
honest instead of letting it drift.

    python3 tools/model_inventory.py            # print the inventory
    python3 tools/model_inventory.py --write    # update the README section
    python3 tools/model_inventory.py --check    # fail when the section is stale
"""

import argparse
import glob
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
README = os.path.join(ROOT, "3dmodels", "README.md")
MODELS = os.path.join(ROOT, "3dmodels")
START = "<!-- inventory:start -->"
END = "<!-- inventory:end -->"
MODEL = re.compile(r'\(model "([^"]+)"')
MODEL_EXTENSIONS = (".step", ".stp", ".wrl")


def referenced_models():
    """Model paths used by a footprint, lowercased.

    Case is ignored here: whether a path resolves exactly is the lint's job.
    This inventory answers "is any footprint pointing at this model at all?",
    so the `.STEP`/`.step` bug in #20 does not count as an unused file.
    """
    used = set()
    for path in glob.glob(os.path.join(ROOT, "footprints", "*.pretty", "*.kicad_mod")):
        with open(path, encoding="utf-8") as handle:
            for uri in MODEL.findall(handle.read()):
                if uri.startswith("${KIBOAR_3DMODELS}/"):
                    used.add(uri.split("/", 1)[1].lower())
    return used


def inventory():
    used = referenced_models()
    unused = []
    for current, _, files in os.walk(MODELS):
        for name in sorted(files):
            if name.startswith(".") or not name.lower().endswith(MODEL_EXTENSIONS):
                continue
            path = os.path.join(current, name)
            relative = os.path.relpath(path, MODELS).replace(os.sep, "/")
            if relative.lower() not in used:
                unused.append((relative, os.path.getsize(path)))
    return sorted(unused)


def human(size):
    if size >= 1024 * 1024:
        return f"{size / (1024 * 1024):.1f} MB"
    if size >= 1024:
        return f"{size / 1024:.0f} KB"
    return f"{size} B"


def section():
    unused = inventory()
    total = sum(size for _, size in unused)
    lines = [
        START,
        f"**{len(unused)} files, {human(total)}** are not referenced by any footprint.",
        "",
        "| File | Size |",
        "| --- | ---: |",
    ]
    lines.extend(f"| `{path}` | {human(size)} |" for path, size in unused)
    lines.append(END)
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--write", action="store_true", help="update the README section")
    parser.add_argument("--check", action="store_true", help="fail when the README is stale")
    args = parser.parse_args()

    rendered = section()
    if not os.path.exists(README):
        print(f"{os.path.relpath(README, ROOT)} does not exist")
        return 1

    with open(README, encoding="utf-8") as handle:
        text = handle.read()
    if START not in text or END not in text:
        print(f"{os.path.relpath(README, ROOT)} has no inventory markers")
        return 1

    current = text[text.index(START) : text.index(END) + len(END)]
    if args.check:
        if current != rendered:
            print("3dmodels/README.md is stale; run python3 tools/model_inventory.py --write")
            return 1
        print("3dmodels/README.md inventory is current")
        return 0

    if args.write:
        with open(README, "w", encoding="utf-8", newline="") as handle:
            handle.write(text.replace(current, rendered))
        print(f"updated {os.path.relpath(README, ROOT)}")
        return 0

    print(current)
    return 0


if __name__ == "__main__":
    sys.exit(main())
