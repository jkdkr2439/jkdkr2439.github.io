from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[2]


class DisplayOwnershipTest(unittest.TestCase):
    def test_display_sources_have_one_owner(self) -> None:
        self.assertFalse((ROOT / "assets").exists())
        self.assertFalse((ROOT / "_includes").exists())
        self.assertTrue((ROOT / "D_Display/assets/js/app.js").is_file())
        self.assertTrue((ROOT / "D_Display/includes/canvas/shell.html").is_file())
        self.assertTrue((ROOT / "D_Display/pages/index.html").is_file())


if __name__ == "__main__":
    unittest.main()
