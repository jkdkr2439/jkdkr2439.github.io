import json
from pathlib import Path
import tempfile
import unittest


class PublishArticlePreparationTest(unittest.TestCase):
    def _root(self, raw: str, *, image: bool = True) -> Path:
        root = Path(raw)
        post = root / "D_Data/content/posts/2026-01-01-example.md"
        post.parent.mkdir(parents=True)
        post.write_text(
            "---\nlayout: post\ntitle: Example\ndate: 2026-01-01\ntag: Test\n"
            "excerpt_text: Summary\n---\n![hero](/assets/images/example/hero.png)",
            encoding="utf-8",
        )
        if image:
            target = root / "D_Data/media/assets/images/example/hero.png"
            target.parent.mkdir(parents=True)
            target.write_bytes(b"image")
        return root

    def test_success_builds_in_sandbox_and_writes_ipod_report(self) -> None:
        from P_Process.tools.publish_article import prepare_article

        with tempfile.TemporaryDirectory() as raw:
            root = self._root(raw)
            report_path = root / "O_Output/reports/example.json"
            destinations: list[Path] = []

            def build(_root: Path, destination: Path) -> object:
                destinations.append(destination)
                page = destination / "writing/index.html"
                page.parent.mkdir(parents=True)
                page.write_text("<main>ok</main>", encoding="utf-8")
                return object()

            report = prepare_article(root, "example", report_path, build=build)

            self.assertTrue(report.ok)
            self.assertEqual(1, len(destinations))
            self.assertFalse(destinations[0].exists())
            payload = json.loads(report_path.read_text(encoding="utf-8"))
            self.assertEqual("example", payload["slug"])
            self.assertTrue(payload["ok"])
            self.assertEqual(
                {"input", "process", "output", "data_feedback", "ok", "slug"},
                set(payload),
            )

    def test_validation_failure_stops_before_build_and_reports_error(self) -> None:
        from P_Process.tools.publish_article import prepare_article

        with tempfile.TemporaryDirectory() as raw:
            root = self._root(raw, image=False)
            report_path = root / "O_Output/reports/example.json"
            called = False

            def build(_root: Path, _destination: Path) -> object:
                nonlocal called
                called = True
                return object()

            report = prepare_article(root, "example", report_path, build=build)

            self.assertFalse(report.ok)
            self.assertFalse(called)
            self.assertIn("missing article image", " ".join(report.data_feedback))

    def test_missing_or_duplicate_slug_fails_closed(self) -> None:
        from P_Process.tools.publish_article import prepare_article

        with tempfile.TemporaryDirectory() as raw:
            root = self._root(raw)
            duplicate = root / "D_Data/content/posts/2026-02-02-example.md"
            duplicate.write_text("---\nlayout: post\n---", encoding="utf-8")
            report = prepare_article(root, "example", root / "report.json", build=lambda *_: None)
            self.assertFalse(report.ok)
            self.assertIn("expected exactly one Vietnamese article", " ".join(report.data_feedback))


if __name__ == "__main__":
    unittest.main()
