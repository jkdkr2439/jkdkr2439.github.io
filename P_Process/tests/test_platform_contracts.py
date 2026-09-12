import unittest
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]


class PlatformContractTest(unittest.TestCase):
    def test_canonical_platform_registry_is_ready_for_composition(self) -> None:
        from P_Process.validation.platform import validate_platform_registry

        self.assertEqual([], validate_platform_registry(ROOT))

    def test_platform_brand_and_author_have_separate_visual_roles(self) -> None:
        identity = json.loads(
            (ROOT / "D_Data/platform/identity/site.json").read_text(encoding="utf-8")
        )
        shell = (ROOT / "D_Display/platform/shell.mjs").read_text(encoding="utf-8")
        self.assertEqual("Danh Nghĩa Hệ", identity["name"])
        self.assertEqual("Kevin T.N", identity["credit"])
        self.assertIn("identity-credit", shell)


if __name__ == "__main__":
    unittest.main()
