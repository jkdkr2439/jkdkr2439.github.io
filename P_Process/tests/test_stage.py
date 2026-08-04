import json
from pathlib import Path
import tempfile
import unittest


ROOT = Path(__file__).resolve().parents[2]


class JekyllStageTest(unittest.TestCase):
    def _fixture(self, root: Path) -> None:
        (root / "D_Data/content/posts").mkdir(parents=True)
        (root / "D_Data/manifests").mkdir(parents=True)
        (root / "D_Display/assets/js").mkdir(parents=True)
        (root / "D_Display/pages").mkdir(parents=True)
        (root / "D_Data/content/posts/a.md").write_text("post", encoding="utf-8")
        (root / "D_Data/manifests/books.json").write_text("{}", encoding="utf-8")
        (root / "D_Display/assets/js/app.js").write_text("void 0;", encoding="utf-8")
        (root / "D_Display/pages/index.html").write_text("index", encoding="utf-8")
        (root / "source-map.json").write_text(
            json.dumps(
                {
                    "version": 1,
                    "directories": {
                        "D_Data/content/posts": "_posts",
                        "D_Data/manifests": "_data",
                        "D_Display/assets": "assets",
                    },
                    "files": {"D_Display/pages/index.html": "index.html"},
                }
            ),
            encoding="utf-8",
        )

    def test_stage_maps_owned_sources_to_jekyll_paths(self) -> None:
        from I_Input.jekyll.stage import stage_site

        with tempfile.TemporaryDirectory() as raw:
            root = Path(raw)
            self._fixture(root)
            stage = root / "stage"

            report = stage_site(root, stage, root / "source-map.json")

            self.assertEqual((), report.collisions)
            self.assertTrue((stage / "_posts/a.md").is_file())
            self.assertTrue((stage / "_data/books.json").is_file())
            self.assertTrue((stage / "assets/js/app.js").is_file())
            self.assertTrue((stage / "index.html").is_file())

    def test_source_map_rejects_duplicate_destination(self) -> None:
        from I_Input.jekyll.source_map import SourceMapError, load_source_map_file

        with tempfile.TemporaryDirectory() as raw:
            root = Path(raw)
            (root / "a.html").write_text("a", encoding="utf-8")
            (root / "b.html").write_text("b", encoding="utf-8")
            contract = root / "source-map.json"
            contract.write_text(
                json.dumps(
                    {
                        "version": 1,
                        "directories": {},
                        "files": {"a.html": "index.html", "b.html": "index.html"},
                    }
                ),
                encoding="utf-8",
            )

            with self.assertRaisesRegex(SourceMapError, "duplicate destination: index.html"):
                load_source_map_file(contract, root)

    def test_repository_contract_stages_the_current_blog(self) -> None:
        from I_Input.jekyll.stage import stage_site

        with tempfile.TemporaryDirectory() as raw:
            stage = Path(raw) / "stage"
            report = stage_site(ROOT, stage)
            self.assertEqual((), report.collisions)
            self.assertTrue((stage / "_posts/2026-06-20-khoang-cach.md").is_file())
            self.assertTrue((stage / "assets/js/app.js").is_file())
            self.assertTrue((stage / "assets/images/tam-ly-hoc-vo-thuc/title.jpg").is_file())


if __name__ == "__main__":
    unittest.main()
