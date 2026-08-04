"""Build the public Site Canvas from explicit canonical owners."""

from dataclasses import dataclass
from html import escape
import json
from pathlib import Path
import shutil


@dataclass(frozen=True)
class PlatformBuildReport:
    ok: bool
    files: int


def build_platform(root: Path, destination: Path) -> PlatformBuildReport:
    root, destination = root.resolve(), destination.resolve()
    if destination.exists():
        shutil.rmtree(destination)
    destination.mkdir(parents=True)
    shutil.copy2(root / "D_Display/platform/index.html", destination / "index.html")
    mappings = (
        ("D_Data/platform", "canvas/D_Data/platform"),
        ("I_Input/platform", "canvas/I_Input/platform"),
        ("P_Process/platform", "canvas/P_Process/platform"),
        ("D_Display/platform", "canvas/D_Display/platform"),
    )
    for source, target in mappings:
        shutil.copytree(root / source, destination / target)

    registry = json.loads(
        (root / "D_Data/platform/registry/modules.json").read_text(encoding="utf-8")
    )
    for module in registry["modules"]:
        if module["state"] != "planned":
            continue
        page = destination / module["route"].strip("/") / "index.html"
        page.parent.mkdir(parents=True)
        page.write_text(
            "<!doctype html><html lang=\"vi\"><meta charset=\"utf-8\">"
            "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">"
            "<meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'self'; style-src 'self'; object-src 'none'; base-uri 'none'\">"
            f"<title>{escape(module['labels']['vi'])}</title><main><p>Danh · Nghĩa · Hệ</p>"
            f"<h1>{escape(module['labels']['vi'])}</h1><p>{escape(module['purpose']['vi'])}</p>"
            "<p>Đang dựng · Building</p><a href=\"/\">← Canvas</a></main></html>\n",
            encoding="utf-8",
        )
    files = sum(1 for path in destination.rglob("*") if path.is_file())
    return PlatformBuildReport(True, files)
