import unittest
from unittest.mock import patch


class RunAllTest(unittest.TestCase):
    @patch("P_Process.validation.run_all.validate_site", return_value=[])
    @patch("P_Process.validation.run_all.validate_canvas", return_value=[])
    @patch("P_Process.validation.run_all.validate_sources", return_value=[])
    @patch("P_Process.validation.run_all.validate_root", return_value=[])
    def test_collect_failures_runs_every_source_gate(self, root, sources, canvas, site) -> None:
        from P_Process.validation.run_all import collect_failures

        self.assertEqual([], collect_failures())
        root.assert_called_once()
        sources.assert_called_once()
        canvas.assert_called_once()
        site.assert_called_once()

    @patch("P_Process.validation.run_all.validate_site", return_value=["site failed"])
    @patch("P_Process.validation.run_all.validate_canvas", return_value=[])
    @patch("P_Process.validation.run_all.validate_sources", return_value=["source failed"])
    @patch("P_Process.validation.run_all.validate_root", return_value=[])
    def test_collect_failures_preserves_gate_context(self, *_mocks) -> None:
        from P_Process.validation.run_all import collect_failures

        self.assertEqual(
            ["source: source failed", "site: site failed"],
            collect_failures(),
        )


if __name__ == "__main__":
    unittest.main()
