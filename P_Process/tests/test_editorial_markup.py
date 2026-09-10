from pathlib import Path
import tempfile
import unittest


class EditorialMarkupTest(unittest.TestCase):
    def test_rejects_markdown_stranded_inside_html_paragraphs(self) -> None:
        from P_Process.validation.editorial_markup import validate_editorial_markup

        with tempfile.TemporaryDirectory() as raw:
            root = Path(raw)
            posts = root / "D_Data/content/posts"
            posts.mkdir(parents=True)
            (posts / "2026-01-01-broken.md").write_text(
                "<p>## Raw heading</p>\n<p>*Raw emphasis*</p>\n",
                encoding="utf-8",
            )
            failures = validate_editorial_markup(root)
            self.assertEqual(2, len(failures))

    def test_accepts_semantic_html(self) -> None:
        from P_Process.validation.editorial_markup import validate_editorial_markup

        with tempfile.TemporaryDirectory() as raw:
            root = Path(raw)
            posts = root / "D_Data/content/posts"
            posts.mkdir(parents=True)
            (posts / "2026-01-01-clean.md").write_text(
                '<h2>Real heading</h2>\n<p class="article-deck">“Quoted deck”</p>\n',
                encoding="utf-8",
            )
            self.assertEqual([], validate_editorial_markup(root))


if __name__ == "__main__":
    unittest.main()
