"""Load and validate canonical public Products data."""

import json
from pathlib import Path, PurePosixPath


class ProductSourceError(ValueError):
    pass


REQUIRED = {"id", "name", "family", "summary", "route", "source", "case_study", "demo", "status", "proof"}
FORBIDDEN = ("c:\\users", "d:\\agent", ".db", "token=", "password=", "pipeline-run-log")


def _relative(value: str) -> bool:
    path = PurePosixPath(value.replace("\\", "/"))
    return bool(value) and not path.is_absolute() and ".." not in path.parts


def load_products(root: Path) -> dict:
    path = root / "D_Data/products/manifest.json"
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ProductSourceError(f"invalid products manifest: {exc}") from exc
    products = payload.get("products") or []
    if payload.get("version") != 1 or not products:
        raise ProductSourceError("products manifest must use version 1 and contain products")
    ids, routes = set(), set()
    for product in products:
        missing = REQUIRED - product.keys()
        if missing:
            raise ProductSourceError(f"product missing fields: {sorted(missing)}")
        if product["id"] in ids or product["route"] in routes:
            raise ProductSourceError("product ids and routes must be unique")
        ids.add(product["id"]); routes.add(product["route"])
        if not product["route"].startswith("/products/") or not product["route"].endswith("/"):
            raise ProductSourceError("product route must be below /products/")
        for key in ("source", "case_study", "demo"):
            if not _relative(product[key]):
                raise ProductSourceError(f"unsafe product {key}")
        raw = json.dumps(product, ensure_ascii=False).lower()
        if any(token in raw for token in FORBIDDEN):
            raise ProductSourceError("private product metadata")
    return payload
