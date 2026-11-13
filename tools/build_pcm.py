#!/usr/bin/env python3
"""Build the KiCad PCM library package.

A PCM library archive has a fixed shape: ``metadata.json`` at the root and
``symbols/``, ``footprints/``, ``3dmodels/`` below it, with no unrelated files.
The repository root also holds the README, the tools and this script, so the
archive is staged instead of zipping the working tree.

PCM installs the content under ``${KICAD10_3RD_PARTY}/<type>/<package id>/`` and
prefixes library nicknames with ``PCM_`` by default (Preferences -> Packages
and Updates -> Library nickname prefix). Both break the links stored in the
files, so the archive is built from rewritten copies:

- symbol ``Footprint`` properties get the nickname prefix;
- footprint ``${KIBOAR_3DMODELS}`` paths become the installed 3D model path.

The files in the repository keep the clone-friendly paths. Build the matching
variant for the user's setting:

    python3 tools/build_pcm.py                 # PCM_ prefix (KiCad default)
    python3 tools/build_pcm.py --no-prefix     # prefix cleared in Preferences
    python3 tools/build_pcm.py --check [--schema]
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
MODEL_VAR = "${KIBOAR_3DMODELS}/"
FOOTPRINT_PROPERTY = re.compile(r'(\(property "Footprint" ")([^":]+):')


def load_metadata():
    with open(METADATA, encoding="utf-8") as handle:
        return json.load(handle)


def install_path(metadata):
    """Where PCM puts the package inside the user's third-party folder."""
    identifier = metadata["identifier"].replace(".", "_")
    return "${KICAD10_3RD_PARTY}", identifier


def package_files(metadata, prefix):
    """Yield (archive name, path or bytes) for everything the archive holds.

    Symbols and footprints are rewritten for the installed layout; everything
    else is copied as-is and streamed from disk.
    """
    yield "metadata.json", METADATA
    if os.path.exists(ICON):
        yield "resources/icon.png", ICON

    root, identifier = install_path(metadata)
    model_base = f"{root}/3dmodels/{identifier}/"
    for directory in CONTENT:
        base = os.path.join(ROOT, directory)
        for current, _, files in os.walk(base):
            for name in sorted(files):
                path = os.path.join(current, name)
                archive = os.path.relpath(path, ROOT)
                if path.endswith(".kicad_mod"):
                    with open(path, encoding="utf-8") as handle:
                        text = handle.read()
                    yield archive, text.replace(MODEL_VAR, model_base).encode("utf-8")
                elif path.endswith(".kicad_sym"):
                    with open(path, encoding="utf-8") as handle:
                        text = handle.read()
                    yield archive, FOOTPRINT_PROPERTY.sub(
                        lambda match: match.group(1) + prefix + match.group(2) + ":", text
                    ).encode("utf-8")
                else:
                    yield archive, path


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
            if not uri.startswith(MODEL_VAR):
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


def build(metadata, output, prefix):
    files = sorted(package_files(metadata, prefix))
    total = sum(
        len(data) if isinstance(data, bytes) else os.path.getsize(data)
        for _, data in files
    )
    os.makedirs(os.path.dirname(output) or ".", exist_ok=True)
    with zipfile.ZipFile(output, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as archive:
        for name, data in files:
            info = zipfile.ZipInfo(name, date_time=FIXED_TIME)
            info.external_attr = 0o644 << 16
            info.compress_type = zipfile.ZIP_DEFLATED
            with archive.open(info, "w") as target:
                if isinstance(data, bytes):
                    target.write(data)
                else:
                    with open(data, "rb") as source:
                        shutil.copyfileobj(source, target, 1 << 20)
    digest = hashlib.sha256()
    with open(output, "rb") as handle:
        for chunk in iter(lambda: handle.read(1 << 20), b""):
            digest.update(chunk)
    return len(files), total, os.path.getsize(output), digest.hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--check", action="store_true", help="validate without writing")
    parser.add_argument("--schema", action="store_true", help="also validate against the PCM JSON schema")
    parser.add_argument(
        "--no-prefix",
        action="store_true",
        help="build for a user who cleared the library nickname prefix",
    )
    parser.add_argument("--output", help="archive path (default dist/Kiboar-<version>[-no-prefix].zip)")
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
    prefix = "" if args.no_prefix else "PCM_"
    suffix = "-no-prefix" if args.no_prefix else ""
    output = args.output or os.path.join(ROOT, "dist", f"Kiboar-{version}{suffix}.zip")
    count, install_size, download_size, digest = build(metadata, output, prefix)
    print(f"{count} files -> {output}")
    print(f"symbol footprint prefix {prefix or '(none)'}")
    print(f"install_size  {install_size}")
    print(f"download_size {download_size}")
    print(f"download_sha256 {digest}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
