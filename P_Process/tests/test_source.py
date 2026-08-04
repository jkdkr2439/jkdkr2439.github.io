import json
from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[2]


class CanonicalSourceTest(unittest.TestCase):
    def test_canonical_content_matches_pre_migration_baseline(self) -> None:
        from P_Process.validation.source import validate_sources

        baseline = json.loads(
            (ROOT / "O_Output/fixtures/baseline.json").read_text(encoding="utf-8")
        )
        self.assertEqual([], validate_sources(ROOT, baseline))


if __name__ == "__main__":
    unittest.main()
