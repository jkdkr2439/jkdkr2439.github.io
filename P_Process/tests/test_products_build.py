import tempfile
import unittest
from pathlib import Path

from P_Process.build.build_products import build_products
from P_Process.build.compose_site import CompositionError, compose_site


ROOT = Path(__file__).resolve().parents[2]


class ProductsBuildTest(unittest.TestCase):
    def test_builds_gallery_demos_and_case_studies(self):
        with tempfile.TemporaryDirectory() as raw:
            target = Path(raw) / "products"
            report = build_products(ROOT, target)
            self.assertTrue(report.ok)
            for path in ("index.html", "signal/demo/index.html", "signal/case-study/index.html", "digital-store/demo/index.html", "digital-store/case-study/index.html"):
                self.assertTrue((target / path).is_file(), path)

    def test_compositor_mounts_products_and_writing(self):
        with tempfile.TemporaryDirectory() as raw:
            target = Path(raw) / "site"
            def writing(_root, destination):
                destination.mkdir(parents=True)
                (destination / "index.html").write_text("writing", encoding="utf-8")
            report = compose_site(ROOT, target, writing_builder=writing)
            self.assertTrue(report.ok)
            self.assertTrue((target / "products/index.html").is_file())
            self.assertTrue((target / "writing/index.html").is_file())


if __name__ == "__main__":
    unittest.main()
