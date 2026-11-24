import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import kicad_sexpr as sexpr  # noqa: E402


class ParseTests(unittest.TestCase):
    def test_parses_nested_nodes(self):
        tree = sexpr.parse(
            '(footprint "Board" (layer "F.Cu") (pad "1" smd rect (at 1 2) (size 3 4)))'
        )
        self.assertEqual(tree[0], "footprint")
        self.assertEqual(str(tree[1]), '"Board"')
        self.assertEqual(sexpr.unquote(sexpr.atom(tree, "layer")), "F.Cu")

        pad = sexpr.child(tree, "pad")
        self.assertIsNotNone(pad)
        self.assertEqual(sexpr.unquote(pad[1]), "1")
        self.assertEqual(sexpr.numbers(pad, "size") if hasattr(sexpr, "numbers") else None, None)
        self.assertEqual(str(sexpr.child(pad, "size")[1]), "3")

    def test_keeps_quoted_and_bare_atoms_distinct(self):
        tree = sexpr.parse('(property "Value" bare)')
        self.assertTrue(sexpr.is_symbol(tree[1]))
        self.assertFalse(sexpr.is_symbol(tree[2]))
        self.assertEqual(sexpr.unquote(tree[1]), "Value")
        self.assertEqual(sexpr.unquote(tree[2]), "bare")

    def test_rejects_incomplete_input(self):
        with self.assertRaises(ValueError):
            sexpr.parse("(footprint")

    def test_children_filters_by_head(self):
        tree = sexpr.parse('(symbol (property "A" "1") (property "B" "2") (pin "1"))')
        values = [sexpr.unquote(node[2]) for node in sexpr.children(tree, "property")]
        self.assertEqual(values, ["1", "2"])


if __name__ == "__main__":
    unittest.main()
