from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]


class SidebarSectionTests(unittest.TestCase):
    def test_fictional_addresses_section_is_rendered(self) -> None:
        sidebar = (
            ROOT / "D_Display" / "includes" / "sidebar.html"
        ).read_text(encoding="utf-8")

        self.assertIn("Diễn văn|Fictional Addresses", sidebar)


if __name__ == "__main__":
    unittest.main()
