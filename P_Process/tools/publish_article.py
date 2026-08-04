"""Prepare one canonical article in a sandbox and emit an IPOD report."""

from __future__ import annotations

import argparse
from dataclasses import asdict, dataclass
import json
from pathlib import Path
import re
import tempfile
from typing import Callable

from P_Process.build.build_site import build_site
from P_Process.validation.article_media import validate_article_media
from P_Process.validation.writing_artifact import validate_writing_images


@dataclass(frozen=True)
class ArticlePreparationReport:
    input: dict[str, object]
    process: tuple[str, ...]
    output: dict[str, object]
    data_feedback: tuple[str, ...]
    ok: bool
    slug: str


def _write_report(path: Path, report: ArticlePreparationReport) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(
        json.dumps(asdict(report), ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    temporary.replace(path)


def _required_front_matter_failures(article: Path) -> list[str]:
    text = article.read_text(encoding="utf-8")
    match = re.match(r"\A---\s*\n(?P<meta>.*?)\n---\s*\n", text, re.S)
    if not match:
        return [f"invalid front matter: {article.as_posix()}"]
    metadata = match.group("meta")
    required = ("layout", "title", "date", "tag", "excerpt_text")
    return [
        f"missing front matter field {field}: {article.as_posix()}"
        for field in required
        if not re.search(rf"(?m)^{re.escape(field)}\s*:\s*\S", metadata)
    ]


def prepare_article(
    root: Path,
    slug: str,
    report_path: Path,
    build: Callable[[Path, Path], object] = build_site,
) -> ArticlePreparationReport:
    root = root.resolve()
    report_path = report_path.resolve()
    matches = sorted((root / "D_Data/content/posts").glob(f"????-??-??-{slug}.md"))
    english = root / f"D_Data/content/english/{slug}.md"
    media = root / f"D_Data/media/assets/images/{slug}"
    input_data: dict[str, object] = {
        "vietnamese": [path.relative_to(root).as_posix() for path in matches],
        "english": english.relative_to(root).as_posix() if english.is_file() else None,
        "media": media.relative_to(root).as_posix() if media.is_dir() else None,
    }
    process: list[str] = ["discover canonical owners"]
    failures: list[str] = []
    if len(matches) != 1:
        failures.append(f"expected exactly one Vietnamese article for slug {slug}; found {len(matches)}")
    else:
        failures.extend(_required_front_matter_failures(matches[0]))
    failures.extend(validate_article_media(root))
    output: dict[str, object] = {"artifact": None, "report": str(report_path)}
    if not failures:
        process.append("validate canonical article and media")
        with tempfile.TemporaryDirectory(prefix="article-prepare-") as raw:
            artifact = Path(raw) / "site"
            build(root, artifact)
            failures.extend(validate_writing_images(artifact))
            process.append("build and validate ephemeral artifact")
            output["artifact"] = "ephemeral verified artifact" if not failures else None
    report = ArticlePreparationReport(
        input=input_data,
        process=tuple(process),
        output=output,
        data_feedback=tuple(failures or ("article preparation passed",)),
        ok=not failures,
        slug=slug,
    )
    _write_report(report_path, report)
    return report


def main() -> None:
    parser = argparse.ArgumentParser(description="Validate and sandbox-build one article")
    parser.add_argument("--slug", required=True)
    parser.add_argument("--report", type=Path)
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[2]
    report_path = args.report or root / f"O_Output/reports/article-{args.slug}.json"
    report = prepare_article(root, args.slug, report_path)
    print(f"ARTICLE PREPARE: {'PASS' if report.ok else 'FAIL'} ({report_path})")
    if not report.ok:
        for failure in report.data_feedback:
            print(f"- {failure}")
        raise SystemExit(1)


if __name__ == "__main__":
    main()
