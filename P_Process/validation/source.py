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
            digest = hashlib.sha256(path.read_bytes()).hexdigest()
            if digest != record["sha256"]:
                failures.append(f"canonical bytes changed: {path.relative_to(root).as_posix()}")
            if section in {"posts", "english"}:
                slug = path.stem
                if section == "posts" and len(slug) > 11 and slug[4] == "-" and slug[7] == "-":
                    slug = slug[11:]
                if slug != record["slug"]:
                    failures.append(f"canonical slug changed: {path.relative_to(root).as_posix()}")
    return failures
