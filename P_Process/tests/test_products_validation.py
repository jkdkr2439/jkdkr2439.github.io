import json
import unittest
from pathlib import Path

from P_Process.validation.products import validate_products


ROOT = Path(__file__).resolve().parents[2]


class ProductsValidationTest(unittest.TestCase):
    def test_products_are_active_and_public_safe(self):
        registry = json.loads((ROOT / "D_Data/platform/registry/modules.json").read_text(encoding="utf-8"))
        products = next(x for x in registry["modules"] if x["id"] == "products")
        self.assertEqual(("active", "products", "products-artifact-v1"), (products["state"], products["builder"], products["health_contract"]))
        self.assertEqual([], validate_products(ROOT))


if __name__ == "__main__":
    unittest.main()
