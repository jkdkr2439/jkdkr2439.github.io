"""Single fail-closed source gate for humans, agents, and CI."""

from __future__ import annotations

import json
from pathlib import Path

from P_Process.validation.canvas import validate_canvas
from P_Process.validation.article_media import validate_article_media
from P_Process.validation.platform import validate_platform_registry
from P_Process.validation.site import validate_site
from P_Process.validation.source import validate_sources
from P_Process.validation.topology import validate_root


ROOT = Path(__file__).resolve().parents[2]


def collect_failures(root: Path = ROOT) -> list[str]:
    baseline = json.loads(
        (root / "O_Output/fixtures/baseline.json").read_text(encoding="utf-8")
    )
    gates = (
        ("topology", validate_root(root)),
        ("platform", validate_platform_registry(root)),
        ("source", validate_sources(root, baseline)),
        ("article-media", validate_article_media(root)),
        ("canvas", validate_canvas()),
        ("site", validate_site()),
    )
    return [f"{gate}: {failure}" for gate, failures in gates for failure in failures]


def main() -> None:
    failures = collect_failures()
    if failures:
        print("SOURCE GATES: FAIL")
        for failure in failures:
            print(f"- {failure}")
        raise SystemExit(1)
    print("SOURCE GATES: PASS")


if __name__ == "__main__":
    main()
