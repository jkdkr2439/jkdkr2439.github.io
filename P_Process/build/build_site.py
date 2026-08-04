"""Stable CLI facade for the composed Site Canvas artifact."""

from dataclasses import dataclass
import argparse
from pathlib import Path

from P_Process.build.compose_site import compose_site


@dataclass(frozen=True)
class BuildReport:
    ok: bool
    staged_files: int
    destination: Path


def build_site(root: Path, destination: Path) -> BuildReport:
    report = compose_site(root, destination)
    return BuildReport(report.ok, report.files, report.destination)


def main() -> None:
    parser = argparse.ArgumentParser(description="Build the verified Site Canvas artifact")
    parser.add_argument("--destination", type=Path, required=True)
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[2]
    report = build_site(root, args.destination)
    print(f"BUILD: PASS ({report.staged_files} artifact files -> {report.destination})")


if __name__ == "__main__":
    main()
