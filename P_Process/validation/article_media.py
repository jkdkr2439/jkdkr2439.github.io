"""Validate image ownership for canonical authored articles."""

from __future__ import annotations

from pathlib import Path, PurePosixPath
import re


_MARKDOWN_IMAGE = re.compile(r"!\[[^\]]*\]\((?P<url>[^\s)]+)")
_HTML_IMAGE = re.compile(r"<img\b[^>]*?\bsrc\s*=\s*[\"'](?P<url>[^\"']+)[\"']", re.I)


def extract_local_image_paths(text: str) -> tuple[str, ...]:
    references = {
        match.group("url")
        for pattern in (_MARKDOWN_IMAGE, _HTML_IMAGE)
        for match in pattern.finditer(text)
        if match.group("url").startswith("/")
    }
    return tuple(sorted(references))


def _has_exact_case(path: Path, media_root: Path) -> bool:
    current = media_root
    for part in path.relative_to(media_root).parts:
        if not current.is_dir():
            return False
        names = {child.name for child in current.iterdir()}
        if part not in names:
            return False
        current /= part
    return True


def validate_article_media(root: Path) -> list[str]:
    root = root.resolve()
    media_root = root / "D_Data/media/assets/images"
    failures: list[str] = []
    content_roots = (root / "D_Data/content/posts", root / "D_Data/content/english")
    for content_root in content_roots:
        if not content_root.is_dir():
            continue
        for article in sorted(content_root.rglob("*.md")):
            owner = article.relative_to(root).as_posix()
            for reference in extract_local_image_paths(article.read_text(encoding="utf-8")):
                if reference.startswith("/writing/assets/images/"):
                    failures.append(f"mounted article image path: {owner} -> {reference}")
                    continue
                if not reference.startswith("/assets/images/"):
                    continue
                suffix = PurePosixPath(reference.removeprefix("/assets/images/"))
                if not suffix.parts or ".." in suffix.parts or "." in suffix.parts:
                    failures.append(f"unsafe article image path: {owner} -> {reference}")
                    continue
                target = media_root.joinpath(*suffix.parts)
                if target.is_file() and not _has_exact_case(target, media_root):
                    failures.append(f"article image case mismatch: {owner} -> {reference}")
                elif not target.is_file():
                    casefold_match = any(
                        candidate.relative_to(media_root).as_posix().casefold()
                        == suffix.as_posix().casefold()
                        for candidate in media_root.rglob("*")
                        if candidate.is_file()
                    ) if media_root.is_dir() else False
                    label = "article image case mismatch" if casefold_match else "missing article image"
                    failures.append(f"{label}: {owner} -> {reference}")
    return failures
