import json
import tempfile
import unittest
from pathlib import Path

from I_Input.products.load import ProductSourceError, load_products


ROOT = Path(__file__).resolve().parents[2]


class ProductsSourceTest(unittest.TestCase):
    def test_loads_two_public_safe_products_with_stable_routes(self):
        payload = load_products(ROOT)
        self.assertEqual(["signal-newsroom", "digital-goods-store"], [p["id"] for p in payload["products"]])
        self.assertEqual(["/products/signal/", "/products/digital-store/"], [p["route"] for p in payload["products"]])

    def test_rejects_private_or_traversing_source(self):
        with tempfile.TemporaryDirectory() as raw:
            root = Path(raw)
            path = root / "D_Data/products"
            path.mkdir(parents=True)
            (path / "manifest.json").write_text(json.dumps({"version": 1, "products": [{"id":"bad", "route":"/products/bad/", "source":"../C:\\Users\\Admin"}]}), encoding="utf-8")
            with self.assertRaises(ProductSourceError):
                load_products(root)


if __name__ == "__main__":
    unittest.main()
