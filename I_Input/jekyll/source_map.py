"""Load and validate the explicit source-to-Jekyll ownership map."""

from dataclasses import dataclass
import json
from pathlib import Path, PurePosixPath


class SourceMapError(ValueError):
    """The staging contract is ambiguous or escapes its repository boundary."""


@dataclass(frozen=True)
class MappingEntry:
    source: Path
    destination: Path


@dataclass(frozen=True)
class SourceMap:
    directories: tuple[MappingEntry, ...]
    files: tuple[MappingEntry, ...]


def _relative_path(raw: str, field: str) -> Path:
    value = PurePosixPath(raw)
    if value.is_absolute() or ".." in value.parts or not value.parts:
        raise SourceMapError(f"invalid {field} path: {raw}")
    return Path(*value.parts)


def load_source_map_file(contract: Path, root: Path) -> SourceMap:
    """Return a validated map whose sources are rooted inside ``root``."""

    payload = json.loads(contract.read_text(encoding="utf-8"))
    if payload.get("version") != 1:
        raise SourceMapError("source map version must be 1")

    root = root.resolve()
    destinations: set[str] = set()

    def entries(section: str, expected_directory: bool) -> tuple[MappingEntry, ...]:
        result: list[MappingEntry] = []
        values = payload.get(section)
        if not isinstance(values, dict):
            raise SourceMapError(f"{section} must be an object")
        for raw_source, raw_destination in sorted(values.items()):
            if not isinstance(raw_source, str) or not isinstance(raw_destination, str):
                raise SourceMapError(f"{section} paths must be strings")
            source_relative = _relative_path(raw_source, "source")
            destination = _relative_path(raw_destination, "destination")
            destination_key = destination.as_posix()
            if destination_key in destinations:
                raise SourceMapError(f"duplicate destination: {destination_key}")
            destinations.add(destination_key)
            source = (root / source_relative).resolve()
            if root not in source.parents:
                raise SourceMapError(f"source escapes root: {raw_source}")
            if expected_directory and not source.is_dir():
                raise SourceMapError(f"missing source directory: {raw_source}")
            if not expected_directory and not source.is_file():
                raise SourceMapError(f"missing source file: {raw_source}")
            result.append(MappingEntry(source=source, destination=destination))
        return tuple(result)

    return SourceMap(
        directories=entries("directories", expected_directory=True),
        files=entries("files", expected_directory=False),
    )


def load_source_map(root: Path) -> SourceMap:
    return load_source_map_file(root / "D_Data/contracts/source-map.json", root)
