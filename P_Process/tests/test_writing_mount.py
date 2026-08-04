import tempfile
import unittest
from pathlib import Path

from I_Input.jekyll.stage import stage_site


ROOT = Path(__file__).resolve().parents[2]


class WritingMountTest(unittest.TestCase):
    def test_stage_contains_an_explicit_writing_mount_profile(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            stage = Path(raw) / "stage"
            stage_site(ROOT, stage)
            profile = (stage / "_config.writing.yml").read_text(encoding="utf-8")
            self.assertIn('baseurl: "/writing"', profile)
            self.assertIn('writing_mount: "/writing/"', profile)

    def test_writing_navigation_is_generated_from_the_jekyll_baseurl(self) -> None:
        sidebar = (ROOT / "D_Display/includes/sidebar.html").read_text(encoding="utf-8")
        shell = (ROOT / "D_Display/includes/canvas/anchor-zone.html").read_text(encoding="utf-8")
        self.assertIn("{{ '/' | relative_url }}?post=", sidebar)
        self.assertIn("{{ '/' | relative_url }}?book=", sidebar)
        self.assertIn("{{ '/' | relative_url }}", shell)

    def test_writing_navigation_has_a_persistent_homepage_control(self) -> None:
        shell = (ROOT / "D_Display/includes/canvas/anchor-zone.html").read_text(encoding="utf-8")
        self.assertIn('class="writing-home-control"', shell)
        self.assertIn('href="/"', shell)
        self.assertIn('data-home-icon', shell)


if __name__ == "__main__":
    unittest.main()
