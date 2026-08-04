"""Verify that migration preserves canonical authored and media bytes."""

import hashlib
from pathlib import Path, PurePosixPath


LEGACY_PREFIXES = {
    "_posts": PurePosixPath("D_Data/content/posts"),
    "_english": PurePosixPath("D_Data/content/english"),
    "assets/images": PurePosixPath("D_Data/media/assets/images"),
}


def _canonical_path(root: Path, legacy_path: str) -> Path:
    legacy = PurePosixPath(legacy_path)
    for prefix, destination in LEGACY_PREFIXES.items():
        prefix_path = PurePosixPath(prefix)
        try:
            remainder = legacy.relative_to(prefix_path)
        except ValueError:
            continue
        return root.joinpath(*destination.parts, *remainder.parts)
    raise ValueError(f"baseline path has no canonical owner: {legacy_path}")


def _content_digests(data: bytes, *, text: bool) -> set[str]:
    candidates = {data}
    if text:
        lf = data.replace(b"\r\n", b"\n").replace(b"\r", b"\n")
        candidates.update({lf, lf.replace(b"\n", b"\r\n")})
    return {hashlib.sha256(candidate).hexdigest() for candidate in candidates}


def validate_sources(root: Path, baseline: dict) -> list[str]:
    """Report missing or byte-changed canonical sources without repairing them."""

    failures: list[str] = []
    for section in ("posts", "english", "media"):
        for record in baseline.get(section, []):
            legacy_path = record["path"]
            try:
                path = _canonical_path(root, legacy_path)
            except ValueError as error:
                failures.append(str(error))
                continue
            if not path.is_file():
                failures.append(f"missing canonical source: {path.relative_to(root).as_posix()}")
                continue
            digests = _content_digests(path.read_bytes(), text=section in {"posts", "english"})
            if record["sha256"] not in digests:
                failures.append(f"canonical bytes changed: {path.relative_to(root).as_posix()}")
            if section in {"posts", "english"}:
                slug = path.stem
                if section == "posts" and len(slug) > 11 and slug[4] == "-" and slug[7] == "-":
                    slug = slug[11:]
                if slug != record["slug"]:
                    failures.append(f"canonical slug changed: {path.relative_to(root).as_posix()}")
    return failures
