import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import normalize_symbols as normalize  # noqa: E402


class NameTests(unittest.TestCase):
    def test_family_and_new_name(self):
        self.assertEqual(normalize.family("MCU_RP2040"), "MCU")
        self.assertEqual(normalize.new_name("Foo  Bar"), "Foo_Bar")
        self.assertEqual(normalize.new_name("PlaceHolder_MLLC"), "Placeholder_MLLC")

    def test_reference_prefix(self):
        self.assertEqual(normalize.reference_prefix("MCU_RP2040", "U?"), "U")
        self.assertEqual(normalize.reference_prefix("Button_TL3315", "SW?"), "SW")
        self.assertEqual(normalize.reference_prefix("USB-C_Receptacle", "J?"), "J")

    def test_quote_round_trip(self):
        value = 'A "quoted" \\ value'
        self.assertEqual(normalize.unquote(normalize.quote(value)), value)


class PropertyTests(unittest.TestCase):
    def test_property_blocks(self):
        block = '\t\t(property "Reference" "SW?"\n\t\t\t(at 0 0 0)\n\t\t)\n'
        blocks = list(normalize.property_blocks(block))
        self.assertEqual(len(blocks), 1)
        name, value, _, _ = blocks[0]
        self.assertEqual(name, "Reference")
        self.assertEqual(value, "SW?")

    def test_replace_value_keeps_the_block(self):
        block = '\t\t(property "Reference" "SW?"\n\t\t\t(at 0 0 0)\n\t\t)\n'
        blocks = list(normalize.property_blocks(block))
        _, _, start, end = blocks[0]
        rewritten = normalize.replace_value(block, start, end, "SW1")
        self.assertIn('"SW1"', rewritten)
        self.assertIn("(at 0 0 0)", rewritten)


if __name__ == "__main__":
    unittest.main()
