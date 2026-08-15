"""Read-only gate for the Site Canvas book rail."""

from __future__ import annotations

import json
from pathlib import Path


EXPECTED_PRICES = [200000, 350000, 350000, 350000, 500000, 1000000]


def validate_books(root: Path) -> list[str]:
    failures: list[str] = []
    catalog_path = root / "D_Data/platform/books/catalog.json"
    try:
        catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return ["book catalog is unavailable or invalid"]
    books = catalog.get("books")
    if catalog.get("version") != 1 or not isinstance(books, list) or len(books) != 6:
        return ["book catalog must contain exactly six v1 entries"]
    ids = [book.get("id") for book in books if isinstance(book, dict)]
    if len(ids) != 6 or len(ids) != len(set(ids)) or any(not value for value in ids):
        failures.append("book ids must be non-empty and unique")
    if [book.get("price") for book in books] != EXPECTED_PRICES:
        failures.append("book prices do not match the approved price list")
    for book in books:
        for field in ("title", "summary", "price_label"):
            value = book.get(field) or {}
            if not value.get("vi") or not value.get("en"):
                failures.append(f"{book.get('id', 'unknown')}: {field} must be bilingual")
        cover = book.get("cover", "")
        if not cover.startswith("D_Data/media/assets/images/books/") or ".." in cover:
            failures.append(f"{book.get('id', 'unknown')}: invalid cover path")
        elif not (root / cover).is_file():
            failures.append(f"{book.get('id', 'unknown')}: cover is missing")
    return failures
