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
            self.assertTrue((destination / "media/index.html").is_file())


if __name__ == "__main__":
    unittest.main()
