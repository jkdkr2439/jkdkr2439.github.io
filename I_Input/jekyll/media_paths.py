"""Translate canonical local assets for the independently mounted Writing app."""

from __future__ import annotations

import re


_LOCAL_ASSET = re.compile(
    r"(?P<prefix>\]\(|(?:src|href)\s*=\s*[\"'])/assets/",
    flags=re.IGNORECASE,
)


def rewrite_writing_asset_urls(text: str, mount: str = "/writing") -> str:
    """Mount canonical ``/assets/`` URLs without touching other URL classes."""

    normalized_mount = mount.rstrip("/")
    if not normalized_mount.startswith("/") or normalized_mount == "":
        raise ValueError("mount must be a non-root absolute path")
    return _LOCAL_ASSET.sub(
        lambda match: f"{match.group('prefix')}{normalized_mount}/assets/",
        text,
    )
