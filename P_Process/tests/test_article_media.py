from pathlib import Path
import tempfile
import unittest


class ArticleMediaValidationTest(unittest.TestCase):
    def _root(self, raw: str, body: str) -> Path:
        root = Path(raw)
        posts = root / "D_Data/content/posts"
        posts.mkdir(parents=True)
        (posts / "2026-01-01-a.md").write_text(body, encoding="utf-8")
        return root

    def test_extracts_sorted_unique_markdown_and_html_images(self) -> None:
        from P_Process.validation.article_media import extract_local_image_paths

        self.assertEqual(
            ("/assets/images/a/hero.png", "/assets/images/a/second.jpg"),
            extract_local_image_paths(
                "![hero](/assets/images/a/hero.png)\n"
                '<img src="/assets/images/a/second.jpg">\n'
                "![again](/assets/images/a/hero.png)"
            ),
        )

    def test_accepts_present_owned_image(self) -> None:
        from P_Process.validation.article_media import validate_article_media

        with tempfile.TemporaryDirectory() as raw:
            root = self._root(raw, "![hero](/assets/images/a/hero.png)")
            image = root / "D_Data/media/assets/images/a/hero.png"
            image.parent.mkdir(parents=True)
            image.write_bytes(b"image")
            self.assertEqual([], validate_article_media(root))

    def test_reports_missing_image_with_article_and_reference(self) -> None:
        from P_Process.validation.article_media import validate_article_media

        with tempfile.TemporaryDirectory() as raw:
            root = self._root(raw, "![missing](/assets/images/a/missing.png)")
            self.assertEqual(
                ["missing article image: D_Data/content/posts/2026-01-01-a.md -> /assets/images/a/missing.png"],
                validate_article_media(root),
            )

    def test_rejects_mount_leaks_traversal_and_case_mismatch(self) -> None:
        from P_Process.validation.article_media import validate_article_media

        with tempfile.TemporaryDirectory() as raw:
            root = self._root(
                raw,
                "![mounted](/writing/assets/images/a/hero.png)\n"
                "![unsafe](/assets/images/../secret.png)\n"
                "![case](/assets/images/A/HERO.png)",
            )
            image = root / "D_Data/media/assets/images/a/hero.png"
            image.parent.mkdir(parents=True)
            image.write_bytes(b"image")
            failures = validate_article_media(root)
            self.assertTrue(any("mounted article image path" in item for item in failures))
            self.assertTrue(any("unsafe article image path" in item for item in failures))
            self.assertTrue(any("case mismatch" in item for item in failures))


if __name__ == "__main__":
    unittest.main()
