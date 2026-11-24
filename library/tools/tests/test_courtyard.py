import math
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import gen_courtyard as courtyard  # noqa: E402
import kicad_sexpr as sexpr  # noqa: E402


class RotationTests(unittest.TestCase):
    def test_rotate_ninety_degrees(self):
        x, y = courtyard.rotate(1, 0, 90)
        self.assertAlmostEqual(x, 0)
        self.assertAlmostEqual(y, 1)

    def test_rotated_box_swaps_width_and_height(self):
        box = courtyard.rotated_box(0, 0, 2, 4, 90)
        self.assertAlmostEqual(box.xmin, -2)
        self.assertAlmostEqual(box.xmax, 2)
        self.assertAlmostEqual(box.ymin, -1)
        self.assertAlmostEqual(box.ymax, 1)

    def test_arc_sampling_starts_and_ends_on_the_arc(self):
        points = courtyard.arc_points((1, 0), (0, 1), (-1, 0), steps=8)
        self.assertAlmostEqual(points[0][0], 1, places=6)
        self.assertAlmostEqual(points[0][1], 0, places=6)
        self.assertAlmostEqual(points[-1][0], -1, places=6)
        self.assertAlmostEqual(points[-1][1], 0, places=6)
        self.assertTrue(all(abs(math.hypot(x, y) - 1) < 1e-6 for x, y in points))


class PadAndFootprintTests(unittest.TestCase):
    def test_pad_box_uses_rotation(self):
        pad = sexpr.parse('(pad "1" smd rect (at 1 2 90) (size 2 4) (layers "F.Cu"))')
        box = courtyard.pad_box(pad)
        self.assertAlmostEqual(box.xmin, -1)
        self.assertAlmostEqual(box.xmax, 3)
        self.assertAlmostEqual(box.ymin, 1)
        self.assertAlmostEqual(box.ymax, 3)

    def test_courtyard_grows_and_snaps(self):
        footprint = sexpr.parse(
            """(footprint "Test"
                (layer "F.Cu")
                (fp_rect (start -1 -1) (end 1 1) (layer "F.Fab"))
                (pad "1" smd rect (at 0 0) (size 0.5 0.5))
            )"""
        )
        box = courtyard.courtyard_box(footprint, clearance=0.25, step=0.05)
        self.assertAlmostEqual(box.xmin, -1.25)
        self.assertAlmostEqual(box.xmax, 1.25)
        self.assertAlmostEqual(box.ymin, -1.25)
        self.assertAlmostEqual(box.ymax, 1.25)

    def test_has_courtyard_detects_both_sides(self):
        plain = sexpr.parse('(footprint "Test" (layer "F.Cu") (pad "1" smd rect))')
        self.assertFalse(courtyard.has_courtyard(plain))

        drawn = sexpr.parse(
            '(footprint "Test" (layer "B.Cu") (fp_rect (layer "B.CrtYd") (start 0 0) (end 1 1)))'
        )
        self.assertTrue(courtyard.has_courtyard(drawn))


if __name__ == "__main__":
    unittest.main()
