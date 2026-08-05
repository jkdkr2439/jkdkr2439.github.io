"""Audit canonical Products packages without mutating them."""

from pathlib import Path

from I_Input.products.load import ProductSourceError, load_products


FORBIDDEN = ("c:\\users", "d:\\agent", "token=", "password=", "pipeline-run-log", ".db")


def validate_products(root: Path) -> list[str]:
    try: payload = load_products(root)
    except ProductSourceError as exc: return [str(exc)]
    failures=[]
    for product in payload["products"]:
        package=root/"D_Data/products"/product["source"]
        for relative in (product["demo"], product["case_study"], "case-study/case-study.json"):
            if not (package/relative).is_file(): failures.append(f"{product['id']}: missing {relative}")
        if package.exists():
            for path in package.rglob("*"):
                if path.is_file():
                    raw=path.read_text(encoding="utf-8",errors="replace").lower()
                    if any(token in raw for token in FORBIDDEN): failures.append(f"{product['id']}: private content in {path.name}")
    return failures
