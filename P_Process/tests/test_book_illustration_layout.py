from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[2]


class BookIllustrationLayoutTest(unittest.TestCase):
    def test_twain_illustrations_use_the_established_book_figure_contract(self) -> None:
        css = (ROOT / "D_Display/assets/css/site.css").read_text(encoding="utf-8")
        self.assertIn(".book-figure .parallel-cell", css)
        self.assertIn(".reader-body .book-figure img", css)
        self.assertIn(".book-figure figcaption", css)
        self.assertIn("max-height: 620px", css)


if __name__ == "__main__":
    unittest.main()
