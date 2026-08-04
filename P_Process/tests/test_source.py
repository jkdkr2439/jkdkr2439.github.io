import json
import hashlib
from pathlib import Path
import tempfile
import unittest


ROOT = Path(__file__).resolve().parents[2]


class CanonicalSourceTest(unittest.TestCase):
    def test_canonical_text_hash_ignores_git_line_ending_checkout_policy(self) -> None:
        from P_Process.validation.source import validate_sources

        with tempfile.TemporaryDirectory() as raw:
            root = Path(raw)
            source = root / "D_Data/content/posts/2026-01-01-same-text.md"
            source.parent.mkdir(parents=True)
            source.write_bytes(b"same\r\ntext\r\n")
            baseline = {"posts": [{
                "path": "_posts/2026-01-01-same-text.md",
                "slug": "same-text",
                "sha256": hashlib.sha256(b"same\ntext\n").hexdigest(),
            }]}
            self.assertEqual([], validate_sources(root, baseline))

    def test_canonical_content_matches_pre_migration_baseline(self) -> None:
        from P_Process.validation.source import validate_sources

        baseline = json.loads(
            (ROOT / "O_Output/fixtures/baseline.json").read_text(encoding="utf-8")
        )
        self.assertEqual([], validate_sources(ROOT, baseline))


if __name__ == "__main__":
    unittest.main()
