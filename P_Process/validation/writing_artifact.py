"""Validate compiled image URLs owned by the Writing artifact."""

from __future__ import annotations

from pathlib import Path, PurePosixPath
import re


_URL_ATTRIBUTE = re.compile(r"\b(?:src|href)\s*=\s*[\"'](?P<url>[^\"']+)[\"']", re.I)


def validate_writing_images(destination: Path) -> list[str]:
    destination = destination.resolve()
    writing = destination / "writing"
    failures: list[str] = []
    if not writing.is_dir():
        return ["writing artifact directory is missing"]
    for page in sorted(writing.rglob("*.html")):
        owner = page.relative_to(destination).as_posix()
        urls = {match.group("url").split("?", 1)[0] for match in _URL_ATTRIBUTE.finditer(page.read_text(encoding="utf-8"))}
        for url in sorted(urls):
            if url.startswith("/assets/images/"):
                failures.append(f"unmounted writing image: {owner} -> {url}")
                continue
            if not url.startswith("/writing/assets/images/"):
                continue
            relative = PurePosixPath(url.removeprefix("/"))
            if ".." in relative.parts or not destination.joinpath(*relative.parts).is_file():
                failures.append(f"missing writing image: {owner} -> {url}")
    return failures
