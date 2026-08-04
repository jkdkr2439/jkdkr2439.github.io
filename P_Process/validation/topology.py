"""Validate the small root surface promised by the blog architecture."""

from pathlib import Path


ALLOWED_DIRS = {
    ".github",
    "D_Data",
    "D_Display",
    "I_Input",
    "O_Output",
    "P_Process",
}
ALLOWED_FILES = {"AGENTS.md", "README.md"}
IGNORED = {".git"}


def validate_root(root: Path) -> list[str]:
    """Return every root ownership violation without mutating the tree."""

    failures: list[str] = []
    for child in sorted(root.iterdir(), key=lambda item: item.name):
        if child.name in IGNORED:
            continue
        allowed = child.name in (ALLOWED_DIRS if child.is_dir() else ALLOWED_FILES)
        if not allowed:
            failures.append(f"unexpected root entry: {child.name}")
    for name in sorted(ALLOWED_DIRS | ALLOWED_FILES):
        if not (root / name).exists():
            failures.append(f"missing root entry: {name}")
    return failures
