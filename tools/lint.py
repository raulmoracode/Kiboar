#!/usr/bin/env python3
"""Lint the Kiboar library.

Checks the rules the library is supposed to satisfy, so a pull request cannot
silently undo them:

- every placed-part footprint has a courtyard on its own side;
- every footprint's ``(attr ...)`` matches its pads;
- symbol metadata is normalized (names, references, manufacturer fields);
- every symbol footprint link resolves, case included;
- every 3D model path is a known variable and resolves, case included;
- library directories follow the ``Kiboar_*`` naming and do not collide by case.

    python3 tools/lint.py
"""

import argparse
import glob
import os
import re
import sys

import gen_courtyard
import kicad_sexpr as sexpr
import normalize_symbols

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_VARIABLES = ("${KIBOAR_3DMODELS}/", "${KICAD10_3DMODEL_DIR}/")
LIBRARY_NAME = re.compile(r"Kiboar_[A-Za-z0-9_.-]+")
FORBIDDEN_IN_NAME = re.compile(r'[\\/:*?"<>|]')


def exact_path(base, relative):
    """Join the path only if every segment matches the case on disk.

    A plain ``os.path.exists`` passes on macOS and Windows where the filesystem
    ignores case, and then fails on the Linux machine that builds the release.
    """
    current = base
    for part in relative.split("/"):
        if part in ("", ".", ".."):
            return None
        try:
            names = os.listdir(current)
        except OSError:
            return None
        if part not in names:
            return None
        current = os.path.join(current, part)
    return current


def check_libraries(problems):
    for kind, pattern in (("footprints", "*.pretty"), ("3dmodels", "*.3dshapes")):
        seen = {}
        for path in sorted(glob.glob(os.path.join(ROOT, kind, pattern))):
            name = os.path.basename(path)
            if not LIBRARY_NAME.fullmatch(name):
                problems.append(f"{kind}/{name}: library names must match Kiboar_<name>")
            if not any(os.scandir(path)):
                problems.append(f"{kind}/{name}: library is empty")
            lower = name.lower()
            if lower in seen:
                problems.append(f"{kind}/{name}: differs only by case from {seen[lower]}")
            seen[lower] = name


def check_footprints(problems):
    for path in sorted(glob.glob(os.path.join(ROOT, "footprints", "*.pretty", "*.kicad_mod"))):
        relative = os.path.relpath(path, ROOT)
        if not os.access(path, os.R_OK):  # pragma: no cover - defensive
            problems.append(f"{relative}: unreadable")
            continue

        status = gen_courtyard.process_file(path, dry_run=True)
        if status in ("generated", "moved"):
            problems.append(f"{relative}: needs a courtyard ({status})")

        with open(path, encoding="utf-8") as handle:
            footprint = sexpr.parse(handle.read())

        name = os.path.basename(path)[: -len(".kicad_mod")]
        if FORBIDDEN_IN_NAME.search(name):
            problems.append(f"{relative}: footprint name contains a forbidden character")

        pads = [
            node[2] for node in footprint[1:] if isinstance(node, list) and node and node[0] == "pad"
        ]
        expected = "through_hole" if "thru_hole" in pads else ("smd" if "smd" in pads else None)
        attribute = sexpr.child(footprint, "attr")
        if attribute is None:
            problems.append(f"{relative}: no (attr ...)")
        elif expected:
            tokens = [str(token) for token in attribute[1:]]
            if tokens[:1] != [expected]:
                problems.append(
                    f"{relative}: attr {' '.join(tokens) or '(empty)'} contradicts the pads (expected {expected})"
                )

        for node in sexpr.children(footprint, "model"):
            uri = sexpr.unquote(node[1]) if len(node) > 1 else ""
            if uri.startswith("${KIBOAR_3DMODELS}/"):
                if not exact_path(os.path.join(ROOT, "3dmodels"), uri.split("/", 1)[1]):
                    problems.append(f"{relative}: model {uri} does not resolve")
            elif uri.startswith("${KICAD10_3DMODEL_DIR}/"):
                continue
            else:
                problems.append(f"{relative}: model {uri} uses an unknown path variable")


def check_symbols(problems):
    path = os.path.join(ROOT, "symbols", "Kiboar.kicad_sym")
    with open(path, encoding="utf-8") as handle:
        text = handle.read()

    _, changes = normalize_symbols.normalize(text)
    for change in changes[:25]:
        problems.append(f"symbols: {change}")
    if len(changes) > 25:
        problems.append(f"symbols: {len(changes) - 25} more metadata changes")

    library = sexpr.parse(text)
    for symbol in library[1:]:
        if not (isinstance(symbol, list) and symbol and symbol[0] == "symbol"):
            continue
        name = sexpr.unquote(symbol[1])
        for prop in sexpr.children(symbol, "property"):
            if len(prop) < 3 or sexpr.unquote(prop[1]) != "Footprint":
                continue
            value = sexpr.unquote(prop[2])
            if not value:
                continue
            if ":" not in value:
                problems.append(f"symbols/{name}: footprint {value!r} has no library nickname")
                continue
            nickname, footprint = value.split(":", 1)
            if not exact_path(
                os.path.join(ROOT, "footprints"), f"{nickname}.pretty/{footprint}.kicad_mod"
            ):
                problems.append(f"symbols/{name}: footprint {value!r} does not resolve")


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--limit", type=int, default=200, help="stop printing after this many problems")
    args = parser.parse_args()

    problems = []
    check_libraries(problems)
    check_footprints(problems)
    check_symbols(problems)

    for problem in problems[: args.limit]:
        print(problem)
    if len(problems) > args.limit:
        print(f"... and {len(problems) - args.limit} more")
    print(f"{len(problems)} problems")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
