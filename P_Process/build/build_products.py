"""Build the isolated public Products artifact from canonical owners."""

from dataclasses import dataclass
import json
from pathlib import Path
import shutil

from I_Input.products.load import load_products


@dataclass(frozen=True)
class ProductsBuildReport:
    ok: bool
    files: int


def build_products(root: Path, destination: Path) -> ProductsBuildReport:
    root, destination = root.resolve(), destination.resolve()
    payload = load_products(root)
    if destination.exists(): shutil.rmtree(destination)
    destination.mkdir(parents=True)
    for name in ("index.html", "products.css", "products.mjs"):
        shutil.copy2(root / "D_Display/products" / name, destination / name)
    public = {"version": payload["version"], "products": []}
    for product in payload["products"]:
        source = root / "D_Data/products" / product["source"]
        target = destination / product["source"]
        shutil.copytree(source, target)
        entry = {key: value for key, value in product.items() if key != "source"}
        public["products"].append(entry)
    (destination / "manifest.json").write_text(json.dumps(public, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
    return ProductsBuildReport(True, sum(1 for path in destination.rglob("*") if path.is_file()))
