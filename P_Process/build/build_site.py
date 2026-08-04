"""Stage and build the canonical blog through the real Jekyll toolchain."""

from dataclasses import dataclass
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile

from I_Input.jekyll.stage import stage_site
from P_Process.validation.source import validate_sources


class BuildError(RuntimeError):
    """A validated source could not produce a Jekyll artifact."""


@dataclass(frozen=True)
class BuildReport:
    ok: bool
    staged_files: int
    destination: Path


def _bundle_command() -> Path:
    discovered = shutil.which("bundle.bat") or shutil.which("bundle")
    if discovered:
        return Path(discovered)
    installed = Path(r"C:\Ruby32-x64\bin\bundle.bat")
    if installed.is_file():
        return installed
    raise BuildError("Bundler is unavailable; install Ruby/Bundler before building")


def build_site(root: Path, destination: Path) -> BuildReport:
    """Build to a temporary directory and expose output only after success."""

    root = root.resolve()
    destination = destination.resolve()
    baseline = json.loads(
        (root / "O_Output/fixtures/baseline.json").read_text(encoding="utf-8")
    )
    failures = validate_sources(root, baseline)
    if failures:
        raise BuildError("source gate failed:\n" + "\n".join(failures))

    destination.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="blog-build-", dir=destination.parent) as raw:
        workspace = Path(raw)
        stage = workspace / "stage"
        artifact = workspace / "site"
        stage_report = stage_site(root, stage)
        bundle = _bundle_command()
        environment = os.environ.copy()
        environment["BUNDLE_GEMFILE"] = str(stage / "Gemfile")
        environment["PATH"] = str(bundle.parent) + os.pathsep + environment.get("PATH", "")
        command = [
            environment.get("COMSPEC", "cmd.exe"),
            "/d",
            "/c",
            str(bundle),
            "_2.5.23_",
            "exec",
            "jekyll",
            "build",
            "--source",
            str(stage),
            "--destination",
            str(artifact),
        ]
        completed = subprocess.run(
            command,
            cwd=root,
            env=environment,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            check=False,
        )
        if completed.returncode != 0:
            detail = (completed.stdout + "\n" + completed.stderr).strip()
            raise BuildError(f"Jekyll exited {completed.returncode}:\n{detail}")
        if not (artifact / "index.html").is_file():
            raise BuildError("Jekyll succeeded without producing index.html")
        if destination.exists():
            shutil.rmtree(destination)
        artifact.replace(destination)
    return BuildReport(
        ok=True,
        staged_files=len(stage_report.copied_files),
        destination=destination,
    )
