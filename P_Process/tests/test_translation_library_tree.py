from __future__ import annotations

import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]


class TranslationLibraryTreeTest(unittest.TestCase):
    def test_jung_book_has_bilingual_psychology_category(self) -> None:
        books = json.loads(
            (ROOT / "D_Data" / "manifests" / "books.json").read_text(encoding="utf-8")
        )
        jung = books["tam-ly-hoc-vo-thuc"]
        self.assertEqual("Tâm lý học", jung["translation_category_vi"])
        self.assertEqual("Psychology", jung["translation_category_en"])

    def test_sidebar_renders_translation_books_from_manifest(self) -> None:
        sidebar = (
            ROOT / "D_Display" / "includes" / "sidebar.html"
        ).read_text(encoding="utf-8")
        self.assertIn("translation_category_vi", sidebar)
        self.assertIn("category_key_raw | strip", sidebar)
        self.assertIn('data-action="show-book"', sidebar)
        self.assertIn("book_pair[1].chapters", sidebar)
        self.assertIn("author_key", sidebar)
        self.assertIn("author_key_raw | strip", sidebar)
        self.assertIn("author_name", sidebar)

    def test_translation_books_declare_their_author_folder(self) -> None:
        books = json.loads(
            (ROOT / "D_Data" / "manifests" / "books.json").read_text(encoding="utf-8")
        )
        self.assertEqual("Mark Twain", books["hoang-tu-va-thang-cung-dinh"]["author_name"])
        self.assertEqual("mark-twain", books["hoang-tu-va-thang-cung-dinh"]["author_key"])


if __name__ == "__main__":
    unittest.main()

