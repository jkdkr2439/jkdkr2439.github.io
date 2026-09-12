from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[2]


class SeoTopologyTests(unittest.TestCase):
    def test_canonical_seo_topology_passes(self) -> None:
        from P_Process.validation.seo import validate_seo

        self.assertEqual([], validate_seo(ROOT))

    def test_platform_builder_publishes_discovery_files(self) -> None:
        source = (ROOT / "P_Process/build/build_platform.py").read_text(encoding="utf-8")
        self.assertIn('(\"robots.txt\", \"sitemap.xml\", \"favicon.svg\")', source)


if __name__ == "__main__":
    unittest.main()
