import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]


class PlatformContractTest(unittest.TestCase):
    def test_canonical_platform_registry_is_ready_for_composition(self) -> None:
        from P_Process.validation.platform import validate_platform_registry

        self.assertEqual([], validate_platform_registry(ROOT))


if __name__ == "__main__":
    unittest.main()
