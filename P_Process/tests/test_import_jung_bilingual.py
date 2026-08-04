from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from P_Process.tools.import_jung_bilingual import (
    SECTIONS,
    align_blocks,
    front_matter,
    render_block,
    render_parallel_rows,
)


class JungImporterTest(unittest.TestCase):
    def test_alignment_preserves_every_block(self) -> None:
        vi = ["Một.", "Hai dài hơn.", "Ba."]
        en = ["One.", "A longer second paragraph.", "Three."]
        pairs = align_blocks(vi, en)
        self.assertEqual(vi, [item for pair, _ in pairs for item in pair])
        self.assertEqual(en, [item for _, pair in pairs for item in pair])

    def test_render_places_vietnamese_before_english(self) -> None:
        rendered = render_parallel_rows([(["Tiếng Việt"], ["English"], "chunk-001")])
        self.assertLess(rendered.index("parallel-vi"), rendered.index("parallel-en"))
        self.assertIn('data-language-order="vi-en"', rendered)

    def test_landing_credit_and_route_metadata(self) -> None:
        rendered = front_matter(SECTIONS[0], None)
        self.assertIn('credit_name: "Kevin T.N"', rendered)
        self.assertIn("parallel_layout: true", rendered)
        self.assertIn("book_landing: true", rendered)

    def test_blocks_are_rendered_to_html_without_nested_markdown(self) -> None:
        self.assertEqual(render_block("## Tiêu đề"), "<h2>Tiêu đề</h2>")
        rendered = render_parallel_rows([(["Một *ý*."], ["An *idea*."], "chunk-001")])
        self.assertIn("<em>ý</em>", rendered)
        self.assertNotIn('markdown="1"', rendered)


if __name__ == "__main__":
    unittest.main()
