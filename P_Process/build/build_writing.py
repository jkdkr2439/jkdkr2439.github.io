"""Build the Jekyll reader as an independently mounted Writing artifact."""

from dataclasses import dataclass
import os
from pathlib import Path
import shutil
import subprocess
import tempfile

from I_Input.jekyll.stage import stage_site


class WritingBuildError(RuntimeError):
    pass


@dataclass(frozen=True)
class WritingBuildReport:
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
    raise WritingBuildError("Bundler is unavailable")


def build_writing(root: Path, destination: Path) -> WritingBuildReport:
    root, destination = root.resolve(), destination.resolve()
    destination.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="writing-build-", dir=destination.parent) as raw:
        workspace = Path(raw)
        stage, artifact = workspace / "stage", workspace / "artifact"
        staged = stage_site(root, stage)
        bundle = _bundle_command()
        environment = os.environ.copy()
        environment["BUNDLE_GEMFILE"] = str(stage / "Gemfile")
        environment["PATH"] = str(bundle.parent) + os.pathsep + environment.get("PATH", "")
        command = [
            environment.get("COMSPEC", "cmd.exe"), "/d", "/c", str(bundle),
            "_2.5.23_", "exec", "jekyll", "build",
            "--source", str(stage), "--destination", str(artifact),
            "--config", f"{stage / '_config.yml'},{stage / '_config.writing.yml'}",
        ]
        completed = subprocess.run(
            command, cwd=root, env=environment, capture_output=True, text=True,
            encoding="utf-8", errors="replace", check=False,
        )
        if completed.returncode:
            detail = (completed.stdout + "\n" + completed.stderr).strip()
            raise WritingBuildError(f"Jekyll exited {completed.returncode}:\n{detail}")
        if not (artifact / "index.html").is_file():
            raise WritingBuildError("Writing build lacks index.html")
        if destination.exists():
            shutil.rmtree(destination)
        artifact.replace(destination)
    return WritingBuildReport(True, len(staged.copied_files), destination)
