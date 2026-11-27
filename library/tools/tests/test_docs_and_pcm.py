import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import build_pcm  # noqa: E402
import gen_docs  # noqa: E402
import model_inventory  # noqa: E402


class DocsTests(unittest.TestCase):
    def test_cell_escapes_table_syntax(self):
        self.assertEqual(gen_docs.cell("a|b <i>c</i> {d}"), "a\\|b c &#123;d&#125;")

    def test_plural(self):
        self.assertEqual(gen_docs.plural(1, "board"), "1 board")
        self.assertEqual(gen_docs.plural(2, "board"), "2 boards")

    def test_library_label(self):
        self.assertEqual(gen_docs.library_label("Kiboar_MCU"), "MCU")
        self.assertEqual(gen_docs.library_label("Other"), "Other")


class PcmTests(unittest.TestCase):
    def test_install_path(self):
        root, identifier = build_pcm.install_path({"identifier": "com.kiboar.library"})
        self.assertEqual(root, "${KICAD10_3RD_PARTY}")
        self.assertEqual(identifier, "com_kiboar_library")

    def test_package_files_skips_non_cad_files(self):
        files = [
            archive
            for archive, _ in build_pcm.package_files({"identifier": "com.example"}, "PCM_")
        ]

        self.assertTrue(any(name.endswith(".kicad_sym") for name in files))
        self.assertTrue(any(name.endswith(".kicad_mod") for name in files))
        self.assertTrue(any(name.lower().endswith((".step", ".stp", ".wrl")) for name in files))
        self.assertFalse(any(name.endswith(".md") for name in files))
        self.assertFalse(any(name.endswith(".py") for name in files))

    def test_human_sizes(self):
        self.assertEqual(model_inventory.human(512), "512 B")
        self.assertEqual(model_inventory.human(2048), "2 KB")
        self.assertEqual(model_inventory.human(1024 * 1024), "1.0 MB")


if __name__ == "__main__":
    unittest.main()
