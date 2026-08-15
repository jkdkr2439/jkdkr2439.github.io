"""Read-only validation for the optional companion capability."""

from __future__ import annotations

import json
from pathlib import Path


REQUIRED_STATES = {"idle", "reading", "scrolling", "chapter-end"}


def validate_companion(root: Path) -> list[str]:
    failures: list[str] = []
    source = root / "D_Data/manifests/companions.json"
    contract = root / "O_Output/contracts/companion-v1.json"
    try:
        registry = json.loads(source.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return ["companion registry is unavailable or invalid"]

    companions = registry.get("companions")
    if registry.get("version") != 1 or not isinstance(companions, list):
        failures.append("companion registry must use the v1 list contract")
        companions = []
    ids = [item.get("id") for item in companions if isinstance(item, dict)]
    if len(ids) != len(set(ids)) or any(not value for value in ids):
        failures.append("companion ids must be non-empty and unique")
    if registry.get("active") not in ids:
        failures.append("active companion must resolve to a declared companion")
    for item in companions:
        if not isinstance(item, dict) or set(item.get("states", [])) != REQUIRED_STATES:
            failures.append("every companion must declare the bounded reader states")
    budget = registry.get("max_asset_bytes")
    if not isinstance(budget, int) or budget <= 0 or budget > 51200:
        failures.append("companion asset budget must be between 1 and 51200 bytes")
    if not contract.is_file():
        failures.append("companion output contract is missing")
    return failures
