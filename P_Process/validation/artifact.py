"""Validate public routes, local references, and security invariants."""

from html.parser import HTMLParser
from pathlib import Path, PurePosixPath
from urllib.parse import unquote, urlsplit


class _References(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.values: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        for name, value in attrs:
            if name in {"href", "src"} and value:
                self.values.append(value)


def _route_file(site: Path, route: str, mount: str = "") -> Path:
    base = site / mount if mount else site
    if route == "/":
        return base / "index.html"
    return base.joinpath(*PurePosixPath(route.strip("/")).parts, "index.html")


def _local_target(site: Path, page: Path, reference: str) -> Path | None:
    parsed = urlsplit(reference)
    if parsed.scheme or parsed.netloc or not parsed.path or parsed.path.startswith("data:"):
        return None
    path = unquote(parsed.path)
    if path.startswith("/"):
        target = site.joinpath(*PurePosixPath(path.lstrip("/")).parts)
    else:
        target = page.parent.joinpath(*PurePosixPath(path).parts)
    if path.endswith("/"):
        target /= "index.html"
    return target.resolve()


def validate_artifact(site: Path, baseline: dict) -> list[str]:
    """Return all observable artifact violations without changing output."""

    site = site.resolve()
    failures: list[str] = []
    for route in baseline.get("routes", []):
        if not _route_file(site, route, "writing").is_file():
            failures.append(f"missing Writing baseline route: {route}")
    for route in ("/", "/writing/", "/products/", "/papers/", "/media/", "/connect/"):
        if not _route_file(site, route).is_file():
            failures.append(f"missing platform route: {route}")

    index = site / "index.html"
    index_text = index.read_text(encoding="utf-8") if index.is_file() else ""
    if "Content-Security-Policy" not in index_text:
        failures.append("homepage is missing Content-Security-Policy")
    if "platform-root" not in index_text:
        failures.append("homepage is missing platform-root")

    for page in sorted(site.rglob("*.html")):
        text = page.read_text(encoding="utf-8")
        for prefix in ("ghp_", "github_pat_"):
            if prefix in text:
                failures.append(f"secret prefix {prefix} found in {page.relative_to(site).as_posix()}")
        parser = _References()
        parser.feed(text)
        for reference in parser.values:
            target = _local_target(site, page, reference)
            if target is None:
                continue
            if site != target and site not in target.parents:
                failures.append(
                    f"local reference escapes artifact: {page.relative_to(site).as_posix()} -> {reference}"
                )
            elif not target.exists():
                failures.append(
                    f"broken local reference: {page.relative_to(site).as_posix()} -> {reference}"
                )
    return failures
