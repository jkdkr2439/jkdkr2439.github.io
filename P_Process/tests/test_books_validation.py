import unittest
from pathlib import Path

from P_Process.validation.books import validate_books


ROOT = Path(__file__).resolve().parents[2]


class BooksValidationTest(unittest.TestCase):
    def test_canonical_book_rail_is_complete(self) -> None:
        self.assertEqual([], validate_books(ROOT))


if __name__ == "__main__":
    unittest.main()
