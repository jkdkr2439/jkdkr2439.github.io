import json
import os
from pathlib import Path
import tempfile
import unittest

from P_Process.build.build_site import build_site


ROOT = Path(__file__).resolve().parents[2]


class ArtifactContractTest(unittest.TestCase):
    def test_homepage_requires_the_live_platform_marker(self) -> None:
        from P_Process.validation.artifact import validate_artifact

        with tempfile.TemporaryDirectory() as raw:
            site = Path(raw)
            (site / "index.html").write_text(
                '<meta http-equiv="Content-Security-Policy">',
                encoding="utf-8",
            )
            self.assertIn(
                "homepage is missing platform-root",
                validate_artifact(site, {"routes": ["/"]}),
            )

    def test_real_artifact_satisfies_baseline_routes_and_security(self) -> None:
        from P_Process.validation.artifact import validate_artifact

        os.environ.setdefault("BUNDLE_PATH", r"C:\tmp\blog-jekyll-bundle")
        baseline = json.loads(
            (ROOT / "O_Output/fixtures/baseline.json").read_text(encoding="utf-8")
        )
        with tempfile.TemporaryDirectory() as raw:
            site = Path(raw) / "site"
            build_site(ROOT, site)
            self.assertEqual([], validate_artifact(site, baseline))


if __name__ == "__main__":
    unittest.main()
