"""Read-only invariant gate for the Site Canvas manifest."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CANVAS = ROOT / "D_Data" / "manifests" / "canvas.json"
BOOKS = ROOT / "D_Data" / "manifests" / "books.json"
REQUIRED_ZONES = ("anchor", "context", "stage")
SOURCE_TYPES = {"tag", "collection", "translation"}


def validate_canvas() -> list[str]:
    failures: list[str] = []
    manifest = json.loads(CANVAS.read_text(encoding="utf-8"))
    books = json.loads(BOOKS.read_text(encoding="utf-8"))

    zones = manifest.get("zones") or []
    zone_keys = [zone.get("key") for zone in zones]
    if tuple(zone_keys) != REQUIRED_ZONES:
        failures.append(f"canvas zones must be ordered as {REQUIRED_ZONES!r}")
    if len(zone_keys) != len(set(zone_keys)):
        failures.append("canvas zone keys must be unique")

    modules = manifest.get("modules") or []
    module_keys = [module.get("key") for module in modules]
    if len(module_keys) != len(set(module_keys)):
        failures.append("canvas module keys must be unique")
    for module in modules:
        if module.get("zone") not in zone_keys:
            failures.append(f"canvas module {module.get('key')}: unknown zone")
        for field in ("input", "process", "output", "dependencies"):
            if not module.get(field):
                failures.append(f"canvas module {module.get('key')}: missing IPOD field {field}")

    domains = manifest.get("domains") or []
    domain_keys = [domain.get("key") for domain in domains]
    if len(domain_keys) != len(set(domain_keys)):
        failures.append("canvas domain keys must be unique")
    if manifest.get("default_domain") not in domain_keys:
        failures.append("canvas default_domain must name a declared domain")
    for domain in domains:
        key = domain.get("key")
        if not domain.get("label_vi") or not domain.get("label_en"):
            failures.append(f"canvas domain {key}: bilingual labels are required")
        source = domain.get("source") or {}
        if source.get("type") not in SOURCE_TYPES or not source.get("value"):
            failures.append(f"canvas domain {key}: invalid context source")
        for book_key in domain.get("books") or []:
            if book_key not in books:
                failures.append(f"canvas domain {key}: unknown book {book_key}")
    return failures


if __name__ == "__main__":
    errors = validate_canvas()
    if errors:
        print("CANVAS INVARIANTS: FAIL")
        for error in errors:
            print(f"- {error}")
        raise SystemExit(1)
    print("CANVAS INVARIANTS: PASS")
