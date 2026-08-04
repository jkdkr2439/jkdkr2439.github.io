from __future__ import annotations

import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class TranslationLibraryTreeTest(unittest.TestCase):
    def test_jung_book_has_bilingual_psychology_category(self) -> None:
        books = json.loads(
            (ROOT / "D_Data" / "manifests" / "books.json").read_text(encoding="utf-8")
        )
        jung = books["tam-ly-hoc-vo-thuc"]
        self.assertEqual("Tâm lý học", jung["translation_category_vi"])
        self.assertEqual("Psychology", jung["translation_category_en"])

    def test_sidebar_renders_translation_books_from_manifest(self) -> None:
        sidebar = (ROOT / "_includes" / "sidebar.html").read_text(encoding="utf-8")
        self.assertIn("translation_category_vi", sidebar)
        self.assertIn('data-action="show-book"', sidebar)
        self.assertIn("book_pair[1].chapters", sidebar)


if __name__ == "__main__":
    unittest.main()
