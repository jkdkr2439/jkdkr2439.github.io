"""Validate canonical Site Canvas identity and module declarations."""

import json
from pathlib import Path


REQUIRED_IDS = ("writing", "products", "papers", "media", "connect")
REQUIRED_FIELDS = {
    "id", "version", "state", "route", "slot", "labels", "purpose",
    "entry", "builder", "health_contract", "dependencies", "capabilities",
}


def validate_platform_registry(root: Path) -> list[str]:
    failures: list[str] = []
    identity = json.loads(
        (root / "D_Data/platform/identity/site.json").read_text(encoding="utf-8")
    )
    registry = json.loads(
        (root / "D_Data/platform/registry/modules.json").read_text(encoding="utf-8")
    )
    if identity.get("eyebrow") != {
        "vi": "Danh · Nghĩa · Hệ",
        "en": "Name · Meaning · Frame",
    }:
        failures.append("platform identity translation mismatch")
    modules = registry.get("modules") or []
    ids = tuple(module.get("id") for module in modules)
    routes = tuple(module.get("route") for module in modules)
    if ids != REQUIRED_IDS:
        failures.append(f"platform module order must be {REQUIRED_IDS!r}")
    if len(set(ids)) != len(ids):
        failures.append("platform module ids must be unique")
    if len(set(routes)) != len(routes):
        failures.append("platform module routes must be unique")
    for module in modules:
        missing = REQUIRED_FIELDS - module.keys()
        if missing:
            failures.append(f"{module.get('id', 'unknown')}: missing {sorted(missing)!r}")
    by_id = {module.get("id"): module for module in modules}
    writing = by_id.get("writing", {})
    if (writing.get("state"), writing.get("route"), writing.get("builder")) != (
        "active", "/writing/", "jekyll",
    ):
        failures.append("writing module contract mismatch")
    media = by_id.get("media", {})
    if media.get("route") != "/media/" or "youtube" not in media.get("capabilities", []):
        failures.append("media must own the YouTube capability at /media/")
    return failures
