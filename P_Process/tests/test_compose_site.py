import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]


class SiteCompositionTest(unittest.TestCase):
    def test_platform_build_publishes_only_explicit_canvas_owners(self) -> None:
        from P_Process.build.build_platform import build_platform

        with tempfile.TemporaryDirectory() as raw:
            destination = Path(raw) / "platform"
            report = build_platform(ROOT, destination)
            self.assertTrue(report.ok)
            self.assertTrue((destination / "index.html").is_file())
            self.assertTrue((destination / "canvas/P_Process/platform/runtime.mjs").is_file())
            self.assertTrue((destination / "media/index.html").is_file())
            self.assertFalse((destination / "D_Data/content").exists())

    def test_compositor_mounts_writing_and_rejects_owner_collisions(self) -> None:
        from P_Process.build.compose_site import CompositionError, compose_site

        def platform(_root: Path, destination: Path):
            destination.mkdir(parents=True)
            (destination / "index.html").write_text("platform", encoding="utf-8")

        def writing(_root: Path, destination: Path):
            destination.mkdir(parents=True)
            (destination / "index.html").write_text("writing", encoding="utf-8")

        with tempfile.TemporaryDirectory() as raw:
            destination = Path(raw) / "site"
            report = compose_site(ROOT, destination, platform_builder=platform, writing_builder=writing)
            self.assertTrue(report.ok)
            self.assertEqual("platform", (destination / "index.html").read_text(encoding="utf-8"))
            self.assertEqual("writing", (destination / "writing/index.html").read_text(encoding="utf-8"))

        def colliding(_root: Path, destination: Path):
            destination.mkdir(parents=True)
            (destination / "writing").mkdir()

        with tempfile.TemporaryDirectory() as raw:
            with self.assertRaises(CompositionError):
                compose_site(ROOT, Path(raw) / "site", platform_builder=colliding, writing_builder=writing)


if __name__ == "__main__":
    unittest.main()
