from pathlib import Path
import tempfile
import unittest


class TopologyContractTest(unittest.TestCase):
    def test_repository_root_satisfies_the_contract(self) -> None:
        from P_Process.validation.topology import validate_root

        root = Path(__file__).resolve().parents[2]
        self.assertEqual([], validate_root(root))

    def test_root_is_the_approved_dipod_surface(self) -> None:
        from P_Process.validation.topology import validate_root

        with tempfile.TemporaryDirectory() as raw:
            root = Path(raw)
            for name in (
                "D_Data",
                "I_Input",
                "P_Process",
                "O_Output",
                "D_Display",
                ".github",
            ):
                (root / name).mkdir()
            for name in ("AGENTS.md", "README.md"):
                (root / name).write_text("entry", encoding="utf-8")

            self.assertEqual([], validate_root(root))

    def test_root_rejects_an_unowned_entry(self) -> None:
        from P_Process.validation.topology import validate_root

        with tempfile.TemporaryDirectory() as raw:
            root = Path(raw)
            for name in (
                "D_Data",
                "I_Input",
                "P_Process",
                "O_Output",
                "D_Display",
                ".github",
            ):
                (root / name).mkdir()
            for name in ("AGENTS.md", "README.md"):
                (root / name).write_text("entry", encoding="utf-8")
            (root / "scripts").mkdir()

            self.assertEqual(
                ["unexpected root entry: scripts"],
                validate_root(root),
            )


if __name__ == "__main__":
    unittest.main()
