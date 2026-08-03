"""Static contract tests for the browser-side Site Canvas runtime."""

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def main() -> None:
    failures: list[str] = []
    orchestrator = read("assets/js/canvas/orchestrator.js")
    contracts = read("assets/js/canvas/contracts.js")
    registry = read("assets/js/canvas/registry.js")
    app = read("assets/js/app.js")

    for public_method in (
        "selectDomain",
        "toggleContext",
        "syncRoute",
        "setLanguage",
        "getState",
    ):
        if public_method not in orchestrator:
            failures.append(f"orchestrator missing public method {public_method}")

    for event_key in (
        "canvas.select-domain",
        "canvas.toggle-context",
        "canvas.sync-route",
        "canvas.set-language",
    ):
        if event_key not in contracts:
            failures.append(f"contracts missing allowlisted event {event_key}")

    if "site.data.canvas.domains" not in registry:
        failures.append("registry does not derive domains from _data/canvas.json")
    if "site.data.books" in registry:
        failures.append("canvas registry must not redefine book membership")

    for integration in (
        "DNHCanvas?.setLanguage",
        "DNHCanvas?.syncRoute({type: 'book'",
        "DNHCanvas?.syncRoute({type: 'post'",
    ):
        if integration not in app:
            failures.append(f"app router missing canvas integration {integration}")

    if failures:
        print("CANVAS RUNTIME: FAIL")
        for failure in failures:
            print(f"- {failure}")
        raise SystemExit(1)
    print("CANVAS RUNTIME: PASS")


if __name__ == "__main__":
    main()
