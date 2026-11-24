import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import provenance  # noqa: E402


class ArgumentTests(unittest.TestCase):
    def test_split_arguments_handles_nesting_and_quotes(self):
        text = "call(a, (b, c), 'd,e')"
        spans = provenance.split_arguments(text, text.index("("))
        values = [text[start:end].strip() for start, end in spans]
        self.assertEqual(values, ["a", "(b, c)", "'d,e'"])

    def test_step_string_and_quote(self):
        self.assertEqual(provenance.step_string("'O''Brien'"), "O'Brien")
        self.assertEqual(provenance.quote("O'Brien"), "'O''Brien'")

    def test_trim_removes_surrounding_space(self):
        text = "  value  "
        start, end = provenance.trim(text, (0, len(text)))
        self.assertEqual(text[start:end], "value")


class HeaderTests(unittest.TestCase):
    TEXT = "FILE_NAME('board.step','2026-01-01',('Someone'),('Else'),'','','');"

    def test_file_name_values(self):
        values = provenance.file_name_values(self.TEXT)
        self.assertEqual(values[0], "board.step")
        self.assertEqual(values[2], "Someone")
        self.assertEqual(values[3], "Else")

    def test_step_header(self):
        self.assertEqual(
            provenance.step_header(self.TEXT),
            ("board.step", "Someone", "Else"),
        )

    def test_rewritten_file_name_claims_author_and_keeps_timestamp(self):
        values = provenance.file_name_values(self.TEXT)
        rewritten = provenance.rewritten_file_name(values, "new.step")
        self.assertIn("new.step", rewritten)
        self.assertIn(provenance.AUTHOR, rewritten)
        self.assertIn(provenance.ORGANIZATION, rewritten)
        self.assertIn("2026-01-01", rewritten)

    def test_external_author_detection(self):
        self.assertFalse(provenance.looks_external(provenance.AUTHOR, provenance.ORGANIZATION))
        self.assertTrue(provenance.looks_external("jscotto", ""))


if __name__ == "__main__":
    unittest.main()
