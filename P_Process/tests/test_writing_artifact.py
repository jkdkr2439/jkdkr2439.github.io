from pathlib import Path
import tempfile
import unittest


class WritingArtifactImageTest(unittest.TestCase):
    def _artifact(self, raw: str, source: str) -> Path:
        destination = Path(raw)
        page = destination / "writing/article/index.html"
        page.parent.mkdir(parents=True)
        page.write_text(source, encoding="utf-8")
        return destination

    def test_accepts_existing_writing_mounted_image(self) -> None:
        from P_Process.validation.writing_artifact import validate_writing_images

        with tempfile.TemporaryDirectory() as raw:
            destination = self._artifact(
                raw, '<img src="/writing/assets/images/a/hero.png">'
            )
            image = destination / "writing/assets/images/a/hero.png"
            image.parent.mkdir(parents=True)
            image.write_bytes(b"image")
            self.assertEqual([], validate_writing_images(destination))

    def test_rejects_root_image_reference_and_missing_mounted_target(self) -> None:
        from P_Process.validation.writing_artifact import validate_writing_images

        with tempfile.TemporaryDirectory() as raw:
            destination = self._artifact(
                raw,
                '<img src="/assets/images/a/root.png">'
                '<a href="/writing/assets/images/a/missing.png"><img src="x"></a>',
            )
            failures = validate_writing_images(destination)
            self.assertTrue(any("unmounted writing image" in item for item in failures))
            self.assertTrue(any("missing writing image" in item for item in failures))


if __name__ == "__main__":
    unittest.main()
