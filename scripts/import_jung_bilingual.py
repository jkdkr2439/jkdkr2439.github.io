from __future__ import annotations

import argparse
import html
import math
import re
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Section:
    slug: str
    title_vi: str
    title_en: str
    marker: str | None


SECTIONS = [
    Section("tam-ly-hoc-vo-thuc", "TÂM LÝ HỌC VÔ THỨC", "PSYCHOLOGY OF THE UNCONSCIOUS", None),
    Section("jung-phan-i-dan-nhap", "Phần I — Dẫn nhập", "Part I — Introduction", "# PHẦN I"),
    Section("jung-phan-i-chuong-i", "Phần I · Chương I — Về hai loại tư duy", "Part I · Chapter I — Concerning the Two Kinds of Thinking", "# CHƯƠNG I"),
    Section("jung-phan-i-chuong-ii", "Phần I · Chương II — Những huyễn tưởng của Miller", "Part I · Chapter II — The Miller Phantasies", "# CHƯƠNG II"),
    Section("jung-phan-i-chuong-iii", "Phần I · Chương III — Thánh ca Sáng thế", "Part I · Chapter III — The Hymn of Creation", "# CHƯƠNG III"),
    Section("jung-phan-i-chuong-iv", "Phần I · Chương IV — Khúc ca của con ngài", "Part I · Chapter IV — The Song of the Moth", "# CHƯƠNG IV"),
    Section("jung-phan-ii-chuong-i", "Phần II · Chương I — Các phương diện của dục lực", "Part II · Chapter I — The Aspects of the Libido", "# PHẦN II"),
    Section("jung-phan-ii-chuong-ii", "Phần II · Chương II — Khái niệm và lý thuyết phát sinh của dục lực", "Part II · Chapter II — The Conception and the Genetic Theory of Libido", "# CHƯƠNG II"),
    Section("jung-phan-ii-chuong-iii", "Phần II · Chương III — Sự biến đổi của dục lực", "Part II · Chapter III — The Transformation of the Libido", "# CHƯƠNG III"),
    Section("jung-phan-ii-chuong-iv", "Phần II · Chương IV — Nguồn gốc vô thức của người anh hùng", "Part II · Chapter IV — The Unconscious Origin of the Hero", "# CHƯƠNG IV"),
    Section("jung-phan-ii-chuong-v", "Phần II · Chương V — Biểu tượng của người mẹ và tái sinh", "Part II · Chapter V — Symbolism of the Mother and of Rebirth", "CHƯƠNG V"),
    Section("jung-phan-ii-chuong-vi", "Phần II · Chương VI — Cuộc chiến giải thoát khỏi người mẹ", "Part II · Chapter VI — The Battle for Deliverance from the Mother", "CHƯƠNG VI"),
    Section("jung-phan-ii-chuong-vii", "Phần II · Chương VII — Vai trò kép của người mẹ", "Part II · Chapter VII — The Dual Mother Role", "CHƯƠNG VII"),
    Section("jung-phan-ii-chuong-viii", "Phần II · Chương VIII — Hy tế", "Part II · Chapter VIII — The Sacrifice", "CHƯƠNG VIII"),
    Section("jung-chu-thich", "Chú thích", "Notes", "CHÚ THÍCH"),
    Section("jung-chi-muc", "Chỉ mục", "Index", "CHỈ MỤC"),
]


def split_blocks(text: str) -> list[str]:
    blocks = []
    for block in re.split(r"(?:\r?\n){2,}", text.strip()):
        cleaned = "\n".join(line.rstrip() for line in block.strip().splitlines())
        if cleaned:
            blocks.append(cleaned)
    return blocks


def block_kind(block: str) -> str:
    first = block.splitlines()[0].strip()
    if first.startswith("#"):
        return "heading"
    letters = "".join(char for char in first if char.isalpha())
    if letters and len(first) < 110 and letters.upper() == letters:
        return "heading"
    if first.startswith("Chú thích") or re.match(r"^\[\d+\]", first):
        return "note"
    return "body"


def alignment_cost(vi: list[str], en: list[str]) -> float:
    vi_len = sum(len(re.sub(r"\s+", " ", value)) for value in vi)
    en_len = sum(len(re.sub(r"\s+", " ", value)) for value in en)
    ratio_cost = abs(math.log((vi_len + 24) / (en_len + 24)))
    merge_cost = 0.42 * ((len(vi) - 1) + (len(en) - 1))
    kind_cost = 0.0 if block_kind(vi[0]) == block_kind(en[0]) else 1.8
    return ratio_cost + merge_cost + kind_cost


def align_blocks(vi_blocks: list[str], en_blocks: list[str]) -> list[tuple[list[str], list[str]]]:
    n, m = len(vi_blocks), len(en_blocks)
    inf = float("inf")
    score = [[inf] * (m + 1) for _ in range(n + 1)]
    back: list[list[tuple[int, int] | None]] = [[None] * (m + 1) for _ in range(n + 1)]
    score[0][0] = 0.0
    for i in range(n + 1):
        for j in range(m + 1):
            if score[i][j] == inf:
                continue
            for vi_take in range(1, 5):
                for en_take in range(1, 5):
                    if i + vi_take > n or j + en_take > m:
                        continue
                    cost = alignment_cost(vi_blocks[i:i + vi_take], en_blocks[j:j + en_take])
                    candidate = score[i][j] + cost
                    if candidate < score[i + vi_take][j + en_take]:
                        score[i + vi_take][j + en_take] = candidate
                        back[i + vi_take][j + en_take] = (vi_take, en_take)
    if back[n][m] is None:
        raise ValueError(f"Cannot align {n} Vietnamese blocks with {m} English blocks")
    pairs: list[tuple[list[str], list[str]]] = []
    i, j = n, m
    while i or j:
        vi_take, en_take = back[i][j] or (0, 0)
        pairs.append((vi_blocks[i - vi_take:i], en_blocks[j - en_take:j]))
        i -= vi_take
        j -= en_take
    return list(reversed(pairs))


def contains_marker(blocks: list[str], marker: str) -> bool:
    return any(line.strip() == marker for block in blocks for line in block.splitlines())


def partition_sections(rows: list[tuple[list[str], list[str], str]]) -> list[list[tuple[list[str], list[str], str]]]:
    buckets: list[list[tuple[list[str], list[str], str]]] = [[] for _ in SECTIONS]
    current = 0
    next_section = 1
    for row in rows:
        if next_section < len(SECTIONS) and contains_marker(row[0], SECTIONS[next_section].marker or ""):
            current = next_section
            next_section += 1
        buckets[current].append(row)
    if next_section != len(SECTIONS):
        missing = [section.marker for section in SECTIONS[next_section:]]
        raise ValueError(f"Missing section markers: {missing}")
    return buckets


def render_parallel_rows(rows: list[tuple[list[str], list[str], str]]) -> str:
    rendered = ['<div class="parallel-text" data-language-order="vi-en">']
    for vi_blocks, en_blocks, chunk in rows:
        rendered.append(f'  <section class="parallel-row" data-source-chunk="{html.escape(chunk)}">')
        rendered.append('    <div class="parallel-cell parallel-vi" lang="vi" markdown="1">')
        rendered.append("\n\n".join(vi_blocks))
        rendered.append("    </div>")
        rendered.append('    <div class="parallel-cell parallel-en" lang="en" markdown="1">')
        rendered.append("\n\n".join(en_blocks))
        rendered.append("    </div>")
        rendered.append("  </section>")
    rendered.append("</div>")
    return "\n".join(rendered)


def front_matter(section: Section, number: int | None) -> str:
    fields = [
        "---",
        "layout: post",
        f'title: "{section.title_vi}"',
        f'title_en: "{section.title_en}"',
        "date: 2026-08-02",
        'tag: "Dịch thuật"',
        'tag_en: "Translation"',
        'source_author: "C. G. Jung"',
        'credit_name: "Kevin T.N"',
        'book_edition: "Tâm lý học Vô thức"',
        'book_edition_en: "Psychology of the Unconscious"',
        "parallel_layout: true",
        "library_hidden: true",
    ]
    if number is None:
        fields.append("book_landing: true")
    else:
        fields.extend((f"chapter_number: {number}", f'chapter_label: "{number:02d}"'))
    fields.extend(("---", ""))
    return "\n".join(fields)


def import_book(project_root: Path, site_root: Path) -> list[Path]:
    chunk_root = project_root / "chunks"
    rows: list[tuple[list[str], list[str], str]] = []
    for number in range(1, 141):
        chunk = f"chunk-{number:03d}"
        vi_path = chunk_root / "translation-vi" / f"{chunk}.vi.md"
        en_path = chunk_root / "source-en" / f"{chunk}.en.txt"
        vi_blocks = split_blocks(vi_path.read_text(encoding="utf-8-sig"))
        en_blocks = split_blocks(en_path.read_text(encoding="utf-8-sig"))
        rows.extend((vi, en, chunk) for vi, en in align_blocks(vi_blocks, en_blocks))

    buckets = partition_sections(rows)
    created: list[Path] = []
    for index, (section, section_rows) in enumerate(zip(SECTIONS, buckets)):
        number = None if index == 0 else index
        path = site_root / "_posts" / f"2026-08-03-{section.slug}.md"
        edition_note = ""
        if index == 0:
            edition_note = (
                '<aside class="edition-route">'
                '<strong>Tuyến văn bản:</strong> Đức nguyên tác <em>Wandlungen und Symbole der Libido</em> '
                '→ bản Anh ngữ 1916 của Beatrice M. Hinkle → bản Việt ngữ của Kevin T.N. '
                'Đây không phải bản dịch trực tiếp từ tiếng Đức và không phải bản Jung sửa đổi sâu năm 1952.'
                '</aside>\n\n'
            )
        path.write_text(
            front_matter(section, number) + edition_note + render_parallel_rows(section_rows) + "\n",
            encoding="utf-8",
        )
        created.append(path)
    return created


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("project_root", type=Path)
    parser.add_argument("site_root", type=Path)
    args = parser.parse_args()
    created = import_book(args.project_root.resolve(), args.site_root.resolve())
    print(f"Created {len(created)} bilingual Jung posts")


if __name__ == "__main__":
    main()
