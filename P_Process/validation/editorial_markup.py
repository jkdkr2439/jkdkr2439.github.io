"""Reject Markdown control characters stranded inside authored HTML blocks."""

from __future__ import annotations

from pathlib import Path
import re


RAW_HEADING = re.compile(r"<p(?:\s[^>]*)?>\s*#{1,6}\s+", re.IGNORECASE)
RAW_EMPHASIS = re.compile(
    r"<p(?:\s[^>]*)?>[^<]*(?:\*\*[^*\n]+\*\*|(?<!\*)\*[^*\n]+\*(?!\*))[^<]*</p>",
    re.IGNORECASE,
)


def validate_editorial_markup(root: Path) -> list[str]:
    failures: list[str] = []
    for relative_root in ("D_Data/content/posts", "D_Data/content/english"):
        for path in sorted((root / relative_root).glob("*.md")):
            text = path.read_text(encoding="utf-8")
            for label, pattern in (
                ("raw Markdown heading inside HTML paragraph", RAW_HEADING),
                ("raw Markdown emphasis inside HTML paragraph", RAW_EMPHASIS),
            ):
                match = pattern.search(text)
                if match:
                    line = text.count("\n", 0, match.start()) + 1
                    failures.append(
                        f"{label}: {path.relative_to(root).as_posix()}:{line}"
                    )
    return failures
