import unittest
from pathlib import Path

from P_Process.validation.companion import validate_companion


ROOT = Path(__file__).resolve().parents[2]


class CompanionContractTest(unittest.TestCase):
    def test_canonical_companion_registry_is_bounded(self) -> None:
        self.assertEqual([], validate_companion(ROOT))


if __name__ == "__main__":
    unittest.main()
