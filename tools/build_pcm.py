#!/usr/bin/env python3
"""Build the KiCad PCM library package.

A PCM library archive has a fixed shape: ``metadata.json`` at the root and
``symbols/``, ``footprints/``, ``3dmodels/`` below it, with no unrelated files.
The repository root also holds the README, the tools and this script, so the
archive is staged instead of zipping the working tree.

    python3 tools/build_pcm.py                 # dist/Kiboar-<version>.zip
    python3 tools/build_pcm.py --check         # validate, write nothing
    python3 tools/build_pcm.py --check --schema  # also validate the JSON schema
"""

import argparse
import glob
import hashlib
import json
import os
import re
import shutil
import sys
import zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
METADATA = os.path.join(ROOT, "pcm", "metadata.json")
CONTENT = ("symbols", "footprints", "3dmodels")
ICON = os.path.join(ROOT, "pcm", "resources", "icon.png")
TABLES = os.path.join(ROOT, "lib-table-files")
FIXED_TIME = (1980, 1, 1, 0, 0, 0)


def load_metadata():
    with open(METADATA, encoding="utf-8") as handle:
        return json.load(handle)


def package_files():
    """Yield (archive name, path on disk) for everything the archive holds."""
    yield "metadata.json", METADATA
    if os.path.exists(ICON):
        yield "resources/icon.png", ICON
    for directory in CONTENT:
        base = os.path.join(ROOT, directory)
        for current, _, files in os.walk(base):
            for name in sorted(files):
                path = os.path.join(current, name)
                yield os.path.relpath(path, ROOT), path


def check(metadata, schema=False):
    problems = []

    required = ("name", "description", "description_full", "identifier", "type", "author", "license", "resources", "versions")
    for field in required:
        if field not in metadata:
            problems.append(f"metadata is missing {field!r}")
    versions = metadata.get("versions", [])
    if not versions:
        problems.append("metadata has no versions")
    for version in versions:
        for field in ("version", "status", "kicad_version"):
            if field not in version:
                problems.append(f"version entry is missing {field!r}")
        if not version.get("kicad_version", "").startswith("10"):
            problems.append(f"version {version.get('version')!r} does not target KiCad 10")

    for directory in CONTENT:
        base = os.path.join(ROOT, directory)
        if not os.path.isdir(base) or not any(os.scandir(base)):
            problems.append(f"{directory}/ is missing or empty")

    footprint_libraries = sorted(
        os.path.basename(path)[: -len(".pretty")]
        for path in glob.glob(os.path.join(ROOT, "footprints", "*.pretty"))
    )
    table_path = os.path.join(TABLES, "fp-lib-table")
    if os.path.exists(table_path):
        with open(table_path, encoding="utf-8") as handle:
            table = handle.read()
        listed = set(re.findall(r'\(name "([^"]+)"\)', table))
        for name in footprint_libraries:
            if name not in listed:
                problems.append(f"fp-lib-table is missing {name}")
        for name in sorted(listed - set(footprint_libraries)):
            problems.append(f"fp-lib-table lists {name}, which has no .pretty directory")
    else:
        problems.append("lib-table-files/fp-lib-table is missing")

    if not os.path.exists(os.path.join(TABLES, "sym-lib-table")):
        problems.append("lib-table-files/sym-lib-table is missing")

    model = re.compile(r'\(model "([^"]+)"')
    seen = 0
    for path in glob.glob(os.path.join(ROOT, "footprints", "*.pretty", "*.kicad_mod")):
        with open(path, encoding="utf-8") as handle:
            text = handle.read()
        for uri in model.findall(text):
            seen += 1
            if not uri.startswith("${KIBOAR_3DMODELS}/"):
                continue
            target = os.path.join(ROOT, "3dmodels", uri.split("/", 1)[1])
            if not os.path.exists(target):
                problems.append(f"{os.path.relpath(path, ROOT)} points at missing {uri}")
    if seen == 0:
        problems.append("no model references found; the footprint parser probably missed")

    if schema:
        try:
            import jsonschema
            import urllib.request
        except ImportError:
            problems.append("--schema needs the jsonschema package")
        else:
            request = urllib.request.Request(
                metadata["$schema"], headers={"User-Agent": "kiboar-pcm/1.0"}
            )
            with urllib.request.urlopen(request, timeout=30) as response:
                definition = json.load(response)
            try:
                jsonschema.validate(metadata, definition)
            except jsonschema.ValidationError as error:
                problems.append(f"schema: {error.message} at {list(error.absolute_path)}")

    return problems


def build(metadata, output):
    files = sorted(package_files())
    total = sum(os.path.getsize(path) for _, path in files)
    os.makedirs(os.path.dirname(output) or ".", exist_ok=True)
    with zipfile.ZipFile(output, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as archive:
        for name, path in files:
            info = zipfile.ZipInfo(name, date_time=FIXED_TIME)
            info.external_attr = 0o644 << 16
            info.compress_type = zipfile.ZIP_DEFLATED
            with open(path, "rb") as source, archive.open(info, "w") as target:
                shutil.copyfileobj(source, target, 1 << 20)
    digest = hashlib.sha256(open(output, "rb").read()).hexdigest()
    return len(files), total, os.path.getsize(output), digest


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--check", action="store_true", help="validate without writing")
    parser.add_argument("--schema", action="store_true", help="also validate against the PCM JSON schema")
    parser.add_argument("--output", help="archive path (default dist/Kiboar-<version>.zip)")
    args = parser.parse_args()

    metadata = load_metadata()
    problems = check(metadata, args.schema)
    if problems:
        for problem in problems:
            print(problem)
        print(f"{len(problems)} problems")
        return 1
    if args.check:
        print(f"package metadata and content are consistent ({len(metadata['versions'])} version)")
        return 0

    version = metadata["versions"][0]["version"]
    output = args.output or os.path.join(ROOT, "dist", f"Kiboar-{version}.zip")
    count, install_size, download_size, digest = build(metadata, output)
    print(f"{count} files -> {output}")
    print(f"install_size  {install_size}")
    print(f"download_size {download_size}")
    print(f"download_sha256 {digest}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
