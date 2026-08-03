from __future__ import annotations

import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / "assets" / "images" / "tam-ly-hoc-vo-thuc"
FILENAMES = (
    "i_frontispiece.jpg",
    "title.jpg",
    "i_229.jpg",
    "i_238.jpg",
    "i_269fp.jpg",
    "i_278fp.jpg",
    "i_294fp.jpg",
    "i_380fp.jpg",
    "i_383fp.jpg",
    "i_410fp.jpg",
    "i_481.jpg",
)


class JungIllustrationsTest(unittest.TestCase):
    def setUp(self) -> None:
        self.posts = "\n".join(
            path.read_text(encoding="utf-8")
            for path in sorted((ROOT / "_posts").glob("2026-08-03-jung-*.md"))
        )
        self.posts += "\n" + (
            ROOT / "_posts" / "2026-08-03-tam-ly-hoc-vo-thuc.md"
        ).read_text(encoding="utf-8")

    def test_all_canonical_jpegs_are_local(self) -> None:
        self.assertEqual(set(FILENAMES), {path.name for path in ASSET_DIR.glob("*.jpg")})
        for filename in FILENAMES:
            payload = (ASSET_DIR / filename).read_bytes()
            self.assertGreater(len(payload), 1000, filename)
            self.assertTrue(payload.startswith(b"\xff\xd8\xff"), filename)

    def test_every_illustration_is_a_paired_local_row(self) -> None:
        rows = re.findall(
            r'<section class="parallel-row jung-figure".*?</section>',
            self.posts,
            flags=re.DOTALL,
        )
        self.assertEqual(11, len(rows))
        for filename in FILENAMES:
            matching = [row for row in rows if f"/{filename}" in row]
            self.assertEqual(1, len(matching), filename)
            self.assertEqual(2, len(re.findall(r"<img\b", matching[0])), filename)
        self.assertNotRegex(self.posts, r'<img[^>]+gutenberg\.org')


if __name__ == "__main__":
    unittest.main()
