from __future__ import annotations

import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
POSTS = ROOT / "D_Data" / "content" / "posts"


class JungEditorialConsistencyTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.paths = [
            POSTS / "2026-08-03-tam-ly-hoc-vo-thuc.md",
            *sorted(POSTS.glob("2026-08-03-jung-*.md")),
        ]
        cls.text = "\n".join(path.read_text(encoding="utf-8") for path in cls.paths)

    def test_sacrifice_chapter_label_is_consistent(self) -> None:
        chapter = (POSTS / "2026-08-03-jung-phan-ii-chuong-viii.md").read_text(
            encoding="utf-8"
        )
        self.assertIn('title: "Phần II · Chương VIII — Hiến tế"', chapter)
        self.assertIn("<p>HIẾN TẾ</p>", chapter)
        landing = (POSTS / "2026-08-03-tam-ly-hoc-vo-thuc.md").read_text(
            encoding="utf-8"
        )
        self.assertIn("<h3>VIII. HIẾN TẾ — trang 428</h3>", landing)

    def test_all_parallel_rows_remain_bilingual(self) -> None:
        rows = re.findall(
            r'<section class="parallel-row[^>]*>(.*?)</section>',
            self.text,
            flags=re.DOTALL,
        )
        self.assertEqual(2655, len(rows))
        for index, row in enumerate(rows, start=1):
            self.assertEqual(1, row.count("parallel-vi"), index)
            self.assertEqual(1, row.count("parallel-en"), index)

    def test_no_illustration_placeholders_remain(self) -> None:
        self.assertNotRegex(self.text, r"\[(?:Minh họa|Illustration)")


if __name__ == "__main__":
    unittest.main()
