import os
from pathlib import Path
import tempfile
import unittest


ROOT = Path(__file__).resolve().parents[2]


class BlogBuildTest(unittest.TestCase):
    def test_build_site_produces_a_real_jekyll_artifact(self) -> None:
        from P_Process.build.build_site import build_site

        os.environ.setdefault("BUNDLE_PATH", r"C:\tmp\blog-jekyll-bundle")
        with tempfile.TemporaryDirectory() as raw:
            destination = Path(raw) / "site"
            report = build_site(ROOT, destination)
            self.assertTrue(report.ok)
            self.assertGreater(report.staged_files, 100)
            self.assertTrue((destination / "index.html").is_file())
            self.assertTrue((destination / "writing/index.html").is_file())
            self.assertTrue((destination / "writing/khoang-cach/index.html").is_file())
            self.assertIn('/#media', (destination / "media/index.html").read_text(encoding="utf-8"))
            for index in range(1, 5):
                self.assertTrue((destination / f"canvas/D_Data/media/assets/images/youtube-playlists/playlist-{index:02}.jpg").is_file())
            writing_home = (destination / "writing/index.html").read_text(encoding="utf-8")
            self.assertNotIn("home-listening-room", writing_home)
            self.assertNotIn("playlist-link", writing_home)


if __name__ == "__main__":
    unittest.main()
