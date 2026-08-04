"""Create an ephemeral Jekyll source tree from explicit DIPOD owners."""

from dataclasses import dataclass
from pathlib import Path
import shutil
import tempfile

from .source_map import load_source_map_file
from .media_paths import rewrite_writing_asset_urls


@dataclass(frozen=True)
class StageReport:
    copied_files: tuple[str, ...]
    collisions: tuple[str, ...] = ()


def stage_site(root: Path, destination: Path, contract: Path | None = None) -> StageReport:
    """Stage mapped sources atomically without modifying canonical inputs."""

    root = root.resolve()
    destination = destination.resolve()
    source_map = load_source_map_file(
        contract or root / "D_Data/contracts/source-map.json",
        root,
    )
    destination.parent.mkdir(parents=True, exist_ok=True)
    copied: list[str] = []
    with tempfile.TemporaryDirectory(prefix="jekyll-stage-", dir=destination.parent) as raw:
        temporary = Path(raw) / "site"
        temporary.mkdir()
        for entry in source_map.directories:
            target = temporary / entry.destination
            shutil.copytree(entry.source, target, dirs_exist_ok=True)
            copied.extend(
                path.relative_to(temporary).as_posix()
                for path in target.rglob("*")
                if path.is_file()
            )
        for entry in source_map.files:
            target = temporary / entry.destination
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(entry.source, target)
            copied.append(target.relative_to(temporary).as_posix())
        for content_directory in ("_posts", "_english"):
            content_root = temporary / content_directory
            if not content_root.is_dir():
                continue
            for path in content_root.rglob("*.md"):
                staged_text = path.read_text(encoding="utf-8")
                mounted_text = rewrite_writing_asset_urls(staged_text)
                if mounted_text != staged_text:
                    path.write_text(mounted_text, encoding="utf-8")
        if destination.exists():
            shutil.rmtree(destination)
        temporary.replace(destination)
    return StageReport(copied_files=tuple(sorted(copied)))
