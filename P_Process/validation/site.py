"""Fail closed when content metadata and explicit book manifests diverge."""

from __future__ import annotations

import re
import json
from pathlib import Path

from P_Process.validation.canvas import validate_canvas


ROOT = Path(__file__).resolve().parents[2]
POSTS = ROOT / "D_Data" / "content" / "posts"
BOOKS = ROOT / "D_Data" / "manifests" / "books.json"


def front_matter(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")
    match = re.match(r"^---\s*\n(.*?)\n---\s*\n", text, re.DOTALL)
    if not match:
        raise ValueError(f"missing YAML front matter: {path.name}")
    result: dict[str, object] = {}
    for line in match.group(1).splitlines():
        if not line or line[0].isspace() or ":" not in line:
            continue
        key, raw = line.split(":", 1)
        value = raw.strip().strip('"').strip("'")
        if value == "true":
            result[key] = True
        elif value == "false":
            result[key] = False
        elif value.isdigit():
            result[key] = int(value)
        else:
            result[key] = value
    return result


def validate_site() -> list[str]:
    failures: list[str] = validate_canvas()
    shell = (ROOT / "D_Display" / "pages" / "index.html").read_text(encoding="utf-8")
    for required in (
        "<!DOCTYPE html>",
        "{% include canvas/shell.html %}",
        "/assets/css/site.css",
        "/assets/css/canvas.css",
        "/assets/js/post-registry.js",
        "/assets/js/canvas/registry.js",
        "/assets/js/canvas/orchestrator.js",
        "/assets/js/app.js",
        "{% assign build_version = site.time | date: '%s' %}",
    ):
        if required not in shell:
            failures.append(f"index shell is missing {required}")
    if len(shell.encode("utf-8")) > 4096:
        failures.append("index shell exceeds 4 KiB; move logic or markup to its owner module")
    for versioned_asset in (
        "/assets/css/site.css' | relative_url }}?v={{ build_version }}",
        "/assets/css/canvas.css' | relative_url }}?v={{ build_version }}",
        "/assets/js/post-registry.js' | relative_url }}?v={{ build_version }}",
        "/assets/js/canvas/registry.js' | relative_url }}?v={{ build_version }}",
        "/assets/js/canvas/orchestrator.js' | relative_url }}?v={{ build_version }}",
        "/assets/js/app.js' | relative_url }}?v={{ build_version }}",
    ):
        if versioned_asset not in shell:
            failures.append(f"index shell asset is not build-versioned: {versioned_asset}")
    posts: dict[str, tuple[Path, dict]] = {}
    for path in POSTS.glob("*.md"):
        meta = front_matter(path)
        slug = re.sub(r"^\d{4}-\d{2}-\d{2}-", "", path.stem)
        if slug in posts:
            failures.append(f"duplicate post slug: {slug}")
        posts[slug] = (path, meta)

    books = json.loads(BOOKS.read_text(encoding="utf-8"))
    claimed: dict[str, str] = {}
    for book_id, book in books.items():
        category_values = (
            book.get("translation_category_key"),
            book.get("translation_category_vi"),
            book.get("translation_category_en"),
        )
        if any(category_values) and not all(category_values):
            failures.append(f"{book_id}: translation category requires key, VI label and EN label")
        members = [book.get("landing"), *(book.get("chapters") or [])]
        if not members[0]:
            failures.append(f"{book_id}: missing landing slug")
        if len(members) != len(set(members)):
            failures.append(f"{book_id}: duplicate member in manifest")
        for position, slug in enumerate(members):
            if slug not in posts:
                failures.append(f"{book_id}: unknown slug {slug}")
                continue
            if slug in claimed:
                failures.append(f"{slug}: belongs to both {claimed[slug]} and {book_id}")
            claimed[slug] = book_id
            meta = posts[slug][1]
            if position == 0 and meta.get("book_landing") is not True:
                failures.append(f"{book_id}: landing {slug} lacks book_landing: true")
            if position > 0 and meta.get("chapter_number") != position:
                failures.append(
                    f"{book_id}: {slug} is manifest chapter {position} "
                    f"but front matter says {meta.get('chapter_number')!r}"
                )

    return failures


def main() -> None:
    failures = validate_site()
    if failures:
        print("SITE INVARIANTS: FAIL")
        for failure in failures:
            print(f"- {failure}")
        raise SystemExit(1)
    print("SITE INVARIANTS: PASS")


if __name__ == "__main__":
    main()
