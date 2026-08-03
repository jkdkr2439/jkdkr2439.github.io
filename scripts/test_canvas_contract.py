from __future__ import annotations

import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class CanvasContractTest(unittest.TestCase):
    def test_manifest_declares_unique_zones_modules_and_domains(self) -> None:
        manifest = json.loads((ROOT / "_data" / "canvas.json").read_text(encoding="utf-8"))
        self.assertEqual(["anchor", "context", "stage"], [zone["key"] for zone in manifest["zones"]])
        module_keys = [module["key"] for module in manifest["modules"]]
        self.assertEqual(len(module_keys), len(set(module_keys)))
        self.assertEqual(
            {"knowledge-domains", "context-tree", "content-stage"}, set(module_keys)
        )
        domain_keys = [domain["key"] for domain in manifest["domains"]]
        self.assertEqual(len(domain_keys), len(set(domain_keys)))
        self.assertEqual("basic-epistemology", manifest["default_domain"])
        for domain in manifest["domains"]:
            self.assertTrue(domain["label_vi"])
            self.assertTrue(domain["label_en"])
            self.assertIn(domain["source"]["type"], {"tag", "collection", "translation"})

    def test_shell_owns_one_element_per_zone(self) -> None:
        shell = (ROOT / "_includes" / "canvas" / "shell.html").read_text(encoding="utf-8")
        self.assertEqual(1, shell.count("canvas/anchor-zone.html"))
        self.assertEqual(1, shell.count("canvas/context-zone.html"))
        self.assertEqual(1, shell.count("canvas/stage-zone.html"))
        index = (ROOT / "index.html").read_text(encoding="utf-8")
        self.assertEqual(1, index.count("canvas/shell.html"))
        self.assertNotIn("include sidebar.html", index)
        self.assertNotIn("include reader.html", index)


if __name__ == "__main__":
    unittest.main()
