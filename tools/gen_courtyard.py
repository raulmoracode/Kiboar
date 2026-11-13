#!/usr/bin/env python3
"""Give every footprint a courtyard.

KiCad only runs its courtyard DRC for footprints that have a courtyard, so a
library without them has no check at all for overlapping parts. The rule used
here is the usual one: the bounding box of the physical part -- the Fab layer
outline plus every pad -- grown by the courtyard clearance and snapped outward
to the 0.05 mm grid.

Footprints that already have a courtyard are left alone. A hand-drawn courtyard
encodes real keepouts (connector openings, switch travel) that a rectangle
cannot, so a derived box would be a downgrade. Footprints without pads -- plate
cutouts and keycap outlines -- are mechanical drawings rather than placed parts
and are skipped; see ``process_file``.

    python3 tools/gen_courtyard.py --check           # report, exit 1 if missing
    python3 tools/gen_courtyard.py footprints        # rewrite in place
"""

import argparse
import glob
import math
import os
import sys
import uuid

import kicad_sexpr as sexpr

CLEARANCE = 0.25
GRID = 0.05

GRAPHIC_HEADS = ("fp_line", "fp_rect", "fp_circle", "fp_arc", "fp_poly")
FAB_LAYERS = ("F.Fab", "B.Fab")


class Box:
    def __init__(self):
        self.xmin = self.ymin = math.inf
        self.xmax = self.ymax = -math.inf

    def add(self, x, y):
        self.xmin = min(self.xmin, x)
        self.xmax = max(self.xmax, x)
        self.ymin = min(self.ymin, y)
        self.ymax = max(self.ymax, y)

    def add_box(self, other):
        if other.empty:
            return
        self.add(other.xmin, other.ymin)
        self.add(other.xmax, other.ymax)

    @property
    def empty(self):
        return self.xmin > self.xmax

    def grow(self, amount):
        grown = Box()
        grown.xmin = self.xmin - amount
        grown.ymin = self.ymin - amount
        grown.xmax = self.xmax + amount
        grown.ymax = self.ymax + amount
        return grown

    def snapped_out(self, step):
        snapped = Box()
        snapped.xmin = round(math.floor(self.xmin / step + 1e-9) * step, 6)
        snapped.ymin = round(math.floor(self.ymin / step + 1e-9) * step, 6)
        snapped.xmax = round(math.ceil(self.xmax / step - 1e-9) * step, 6)
        snapped.ymax = round(math.ceil(self.ymax / step - 1e-9) * step, 6)
        return snapped


def numbers(node, name):
    """Arguments of `(name ...)` as floats, or None when absent."""
    found = sexpr.child(node, name)
    if found is None:
        return None
    try:
        return [float(value) for value in found[1:]]
    except ValueError:
        return None


def layer_of(node):
    for value in node[1:]:
        if isinstance(value, list) and value and value[0] == "layer" and len(value) > 1:
            return sexpr.unquote(value[1])
    return None


def rotate(x, y, degrees):
    if not degrees:
        return x, y
    radians = math.radians(degrees)
    cos, sin = math.cos(radians), math.sin(radians)
    return x * cos - y * sin, x * sin + y * cos


def rotated_box(x, y, width, height, degrees):
    box = Box()
    for corner_x, corner_y in (
        (-width / 2, -height / 2),
        (width / 2, -height / 2),
        (width / 2, height / 2),
        (-width / 2, height / 2),
    ):
        dx, dy = rotate(corner_x, corner_y, degrees)
        box.add(x + dx, y + dy)
    return box


def arc_points(start, mid, end, steps=48):
    """Sample the arc that runs from start to end through mid."""
    ax, ay = start
    bx, by = mid
    cx, cy = end
    determinant = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by))
    if abs(determinant) < 1e-12:
        return [start, mid, end]
    ax2 = ax * ax + ay * ay
    bx2 = bx * bx + by * by
    cx2 = cx * cx + cy * cy
    center_x = (ax2 * (by - cy) + bx2 * (cy - ay) + cx2 * (ay - by)) / determinant
    center_y = (ax2 * (cx - bx) + bx2 * (ax - cx) + cx2 * (bx - ax)) / determinant
    radius = math.hypot(ax - center_x, ay - center_y)

    def angle(px, py):
        return math.atan2(py - center_y, px - center_x)

    start_angle = angle(ax, ay)
    end_angle = angle(cx, cy)
    mid_angle = angle(bx, by)
    full = 2 * math.pi
    counter_clockwise = (end_angle - start_angle) % full
    mid_offset = (mid_angle - start_angle) % full
    sweep = counter_clockwise if mid_offset <= counter_clockwise else counter_clockwise - full

    points = [start]
    for step in range(1, steps):
        theta = start_angle + sweep * step / steps
        points.append((center_x + radius * math.cos(theta), center_y + radius * math.sin(theta)))
    points.append(end)
    return points


def graphic_box(node, transform=None):
    """Bounding box of one graphic primitive, optionally moved by `transform`."""
    box = Box()
    points = []

    start = numbers(node, "start")
    end = numbers(node, "end")
    mid = numbers(node, "mid")
    center = numbers(node, "center")

    if node[0] in ("fp_line", "fp_rect") and start and end:
        points = [(start[0], start[1]), (end[0], end[1])]
    elif node[0] == "fp_circle" and center and end:
        radius = math.hypot(end[0] - center[0], end[1] - center[1])
        points = [
            (center[0] - radius, center[1] - radius),
            (center[0] + radius, center[1] + radius),
        ]
    elif node[0] == "fp_arc" and start and mid and end:
        points = arc_points((start[0], start[1]), (mid[0], mid[1]), (end[0], end[1]))
    elif node[0] == "fp_poly":
        points = poly_points(node)
    elif node[0] == "gr_circle" and center and end:
        radius = math.hypot(end[0] - center[0], end[1] - center[1])
        points = [
            (center[0] - radius, center[1] - radius),
            (center[0] + radius, center[1] + radius),
        ]
    elif node[0] == "gr_arc" and start and mid and end:
        points = arc_points((start[0], start[1]), (mid[0], mid[1]), (end[0], end[1]))

    for x, y in points:
        if transform:
            x, y = transform(x, y)
        box.add(x, y)
    return box


def poly_points(node):
    pts = sexpr.child(node, "pts")
    if pts is None:
        return []
    points = []
    for entry in pts[1:]:
        if isinstance(entry, list) and entry and entry[0] == "xy" and len(entry) >= 3:
            points.append((float(entry[1]), float(entry[2])))
    return points


def fab_box(footprint):
    box = Box()
    for node in footprint[1:]:
        if not isinstance(node, list) or not node:
            continue
        if node[0] in GRAPHIC_HEADS and layer_of(node) in FAB_LAYERS:
            box.add_box(graphic_box(node))
    return box


def pad_box(pad):
    at = numbers(pad, "at") or [0.0, 0.0]
    x, y = at[0], at[1]
    angle = at[2] if len(at) > 2 else 0.0

    box = Box()
    size = numbers(pad, "size")
    if size:
        box.add_box(rotated_box(x, y, size[0], size[1], angle))

    drill = sexpr.child(pad, "drill")
    if drill is not None:
        values = []
        for value in drill[1:]:
            try:
                values.append(float(value))
            except (TypeError, ValueError):
                continue
        if len(values) == 1:
            values *= 2
        if len(values) >= 2:
            box.add_box(rotated_box(x, y, values[0], values[1], angle))

    primitives = sexpr.child(pad, "primitives")
    if primitives is not None:
        def transform(px, py, _x=x, _y=y, _angle=angle):
            dx, dy = rotate(px, py, _angle)
            return _x + dx, _y + dy

        for node in primitives[1:]:
            if isinstance(node, list) and node:
                box.add_box(graphic_box(node, transform))
    return box


SILK_LAYERS = ("F.SilkS", "B.SilkS", "Edge.Cuts")


def outline_box(footprint, fab):
    """The part's physical outline: the Fab drawing, or a fallback.

    A third of the library has pads drawn against a Silkscreen or Edge.Cuts
    outline and no Fab geometry at all. Deriving those from pads alone would
    reserve far less than the part's real footprint -- a 5-way joystick whose
    pads span 3.45 mm sits in an 18.5 mm body -- so the silkscreen and board
    edge are the next best evidence of the part's extent.
    """
    if not fab.empty:
        return fab
    fallback = Box()
    for node in footprint[1:]:
        if isinstance(node, list) and node and node[0] in GRAPHIC_HEADS:
            if layer_of(node) in SILK_LAYERS:
                fallback.add_box(graphic_box(node))
    return fallback


def footprint_boxes(footprint):
    pads = Box()
    for node in footprint[1:]:
        if isinstance(node, list) and node and node[0] == "pad":
            pads.add_box(pad_box(node))
    return fab_box(footprint), pads


def courtyard_box(footprint, clearance=CLEARANCE, step=GRID):
    fab, pads = footprint_boxes(footprint)
    body = Box()
    body.add_box(outline_box(footprint, fab))
    body.add_box(pads)
    if body.empty:
        raise ValueError("footprint has neither an outline nor pads")
    return body.grow(clearance).snapped_out(step)


def courtyard_text(box, layer="F.CrtYd"):
    return (
        "\t(fp_rect\n"
        f"\t\t(start {box.xmin:g} {box.ymin:g})\n"
        f"\t\t(end {box.xmax:g} {box.ymax:g})\n"
        "\t\t(stroke\n"
        "\t\t\t(width 0.05)\n"
        "\t\t\t(type default)\n"
        "\t\t)\n"
        "\t\t(fill no)\n"
        f'\t\t(layer "{layer}")\n'
        f'\t\t(uuid "{uuid.uuid4()}")\n'
        "\t)\n"
    )


ANCHORS = ("pad", "zone", "embedded_fonts", "model", "group")


def insertion_offset(text):
    """Offset of the first top-level child that should follow the graphics."""
    offset = 0
    for line in text.splitlines(keepends=True):
        stripped = line[1:] if line.startswith("\t") else line
        if line.startswith("\t") and stripped.startswith("("):
            head = stripped[1:].split(None, 1)[0].rstrip("(\n\t ")
            if head in ANCHORS:
                return offset
        offset += len(line)
    # No pads and no trailer: close the footprint ourselves.
    closing = text.rstrip().rfind(")")
    return closing


def courtyard_layers(footprint):
    layers = set()
    for node in footprint[1:]:
        if isinstance(node, list) and node and node[0] in GRAPHIC_HEADS:
            layer = layer_of(node)
            if layer in ("F.CrtYd", "B.CrtYd"):
                layers.add(layer)
    return layers


def has_courtyard(footprint):
    return bool(courtyard_layers(footprint))


def has_pads(footprint):
    return any(isinstance(node, list) and node and node[0] == "pad" for node in footprint[1:])


def footprint_layer(footprint):
    for value in footprint[1:]:
        if isinstance(value, list) and value and value[0] == "layer" and len(value) > 1:
            return sexpr.unquote(value[1])
    return "F.Cu"


def own_courtyard_layer(footprint):
    return "B.CrtYd" if footprint_layer(footprint) == "B.Cu" else "F.CrtYd"


def process_file(path, clearance=CLEARANCE, step=GRID, dry_run=False):
    """Bring one footprint up to date, or report what it needs when dry_run.

    Returns one of:

    - ``"ok"``: a courtyard on the footprint's own side already exists.
    - ``"generated"``: a courtyard was derived from the Fab layer and pads.
    - ``"moved"``: the only courtyard sat on the opposite side and was moved.
    - ``"mechanical"``: a cutout or CAD drawing with no pads, left alone.

    A footprint with no pads and no courtyard is a mechanical drawing (a plate
    cutout, a keycap outline). A courtyard around it would reserve space around
    a drawing that is not a placed part, and would collide with the part the
    drawing exists to fit, so those are skipped on purpose.
    """
    with open(path, encoding="utf-8") as handle:
        text = handle.read()
    footprint = sexpr.parse(text)

    own = own_courtyard_layer(footprint)
    layers = courtyard_layers(footprint)
    if own in layers:
        return "ok"
    if not has_pads(footprint):
        if not layers:
            return "mechanical"
        # A courtyard exists, just not on this side; treat it like a move.
    if layers:
        if dry_run:
            return "moved"
        opposite = "B.CrtYd" if own == "F.CrtYd" else "F.CrtYd"
        updated = text.replace(f'(layer "{opposite}")', f'(layer "{own}")')
        with open(path, "w", encoding="utf-8", newline="") as handle:
            handle.write(updated)
        return "moved"

    box = courtyard_box(footprint, clearance, step)
    if dry_run:
        return "generated"
    offset = insertion_offset(text)
    updated = text[:offset] + courtyard_text(box, own) + text[offset:]
    with open(path, "w", encoding="utf-8", newline="") as handle:
        handle.write(updated)
    return "generated"


def footprint_files(targets):
    paths = []
    for target in targets:
        if os.path.isdir(target):
            paths.extend(sorted(glob.glob(os.path.join(target, "*.pretty", "*.kicad_mod"))))
            paths.extend(sorted(glob.glob(os.path.join(target, "*.kicad_mod"))))
        else:
            paths.append(target)
    return paths


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("targets", nargs="*", default=["footprints"])
    parser.add_argument("--check", action="store_true", help="report footprints that need a courtyard")
    parser.add_argument("--clearance", type=float, default=CLEARANCE)
    parser.add_argument("--grid", type=float, default=GRID)
    parser.add_argument("--quiet", action="store_true")
    args = parser.parse_args()

    paths = footprint_files(args.targets)
    if not paths:
        parser.error("no footprints found")

    counts = {"ok": 0, "generated": 0, "moved": 0, "mechanical": 0}
    for path in paths:
        status = process_file(path, args.clearance, args.grid, dry_run=args.check)
        counts[status] += 1
        if args.check and status in ("generated", "moved") and not args.quiet:
            print(path)

    if args.check:
        pending = counts["generated"] + counts["moved"]
        print(
            f"{pending} of {len(paths)} footprints need a courtyard "
            f"({counts['ok']} ok, {counts['mechanical']} mechanical drawings)"
        )
        return 1 if pending else 0

    print(
        f"courtyard: {counts['generated']} generated, {counts['moved']} moved, "
        f"{counts['ok']} already present, {counts['mechanical']} mechanical drawings"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
