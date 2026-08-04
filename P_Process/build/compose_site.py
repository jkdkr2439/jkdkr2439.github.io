"""Atomically compose independently owned platform and Writing artifacts."""

from dataclasses import dataclass
from pathlib import Path
import shutil
import tempfile
from typing import Callable

from .build_platform import build_platform


class CompositionError(RuntimeError):
    pass


@dataclass(frozen=True)
class CompositionReport:
    ok: bool
    files: int
    destination: Path


def _default_writing_builder(root: Path, destination: Path):
    from .build_writing import build_writing
    return build_writing(root, destination)


def compose_site(
    root: Path,
    destination: Path,
    *,
    platform_builder: Callable = build_platform,
    writing_builder: Callable = _default_writing_builder,
) -> CompositionReport:
    root, destination = root.resolve(), destination.resolve()
    destination.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="site-compose-", dir=destination.parent) as raw:
        workspace = Path(raw)
        artifact = workspace / "site"
        platform_builder(root, artifact)
        writing_mount = artifact / "writing"
        if writing_mount.exists():
            raise CompositionError("platform artifact collides with Writing owner at /writing/")
        writing_builder(root, writing_mount)
        if not (artifact / "index.html").is_file():
            raise CompositionError("platform artifact lacks index.html")
        if not (writing_mount / "index.html").is_file():
            raise CompositionError("Writing artifact lacks index.html")
        if destination.exists():
            shutil.rmtree(destination)
        artifact.replace(destination)
    return CompositionReport(
        True,
        sum(1 for path in destination.rglob("*") if path.is_file()),
        destination,
    )
