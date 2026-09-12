"""Validate the public SEO topology without rewriting canonical sources."""

from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]


def _post_inventory(root: Path) -> tuple[set[str], set[str]]:
    slugs: set[str] = set()
    tags: set[str] = set()
    for path in (root / "D_Data/content/posts").glob("*.md"):
        slugs.add(re.sub(r"^\d{4}-\d{2}-\d{2}-", "", path.stem))
        match = re.search(r"(?m)^tag:\s*[\"']?(.+?)[\"']?\s*$", path.read_text(encoding="utf-8"))
        if match:
            tags.add(match.group(1))
    return slugs, tags


def validate_seo(root: Path = ROOT) -> list[str]:
    failures: list[str] = []
    manifest_path = root / "D_Data/manifests/seo_topics.json"
    try:
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        return [f"invalid SEO topic manifest: {error}"]

    topics = manifest.get("topics", [])
    expected = {"danh-nghia-he", "giai-cau-truc", "nhan-thuc-luan"}
    keys = [topic.get("key") for topic in topics]
    if set(keys) != expected or len(keys) != len(set(keys)):
        failures.append("SEO topics must contain three unique canonical keys")

    post_slugs, post_tags = _post_inventory(root)
    for topic in topics:
        key = topic.get("key", "<missing>")
        for field in ("name", "name_en", "url", "definition", "tags", "posts"):
            if field not in topic:
                failures.append(f"{key}: missing {field}")
        unknown_posts = sorted(set(topic.get("posts", [])) - post_slugs)
        unknown_tags = sorted(set(topic.get("tags", [])) - post_tags)
        for slug in unknown_posts:
            failures.append(f"{key}: unknown post slug {slug}")
        for tag in unknown_tags:
            failures.append(f"{key}: unknown tag {tag}")
        page = root / "D_Data/content/topics" / f"{key}.md"
        if not page.is_file():
            failures.append(f"{key}: missing canonical topic page")
        elif f"topic_key: {key}" not in page.read_text(encoding="utf-8"):
            failures.append(f"{key}: topic page has wrong topic_key")

    source_map = (root / "D_Data/contracts/source-map.json").read_text(encoding="utf-8")
    if '"D_Data/content/topics": "chu-de"' not in source_map:
        failures.append("topic pages are not owned by the source map")

    config = (root / "D_Data/config/jekyll.yml").read_text(encoding="utf-8")
    if "jekyll-sitemap" not in config:
        failures.append("Jekyll sitemap plugin is not enabled")

    default_layout = (root / "D_Display/layouts/default.html").read_text(encoding="utf-8")
    for marker in ('rel="canonical"', 'property="og:title"', 'application/ld+json'):
        if marker not in default_layout:
            failures.append(f"default layout lacks {marker}")

    post_layout = (root / "D_Display/layouts/post.html").read_text(encoding="utf-8")
    if "window.location.replace" in post_layout:
        failures.append("post layout still redirects canonical article URLs")
    if "article-topic-links" not in post_layout:
        failures.append("post layout lacks topic-cluster links")

    sidebar = (root / "D_Display/includes/sidebar.html").read_text(encoding="utf-8")
    if "?post={{" in sidebar:
        failures.append("sidebar exposes query URLs instead of canonical post URLs")

    platform = (root / "D_Display/platform/index.html").read_text(encoding="utf-8")
    for phrase in ("Danh Nghĩa Hệ", "/writing/chu-de/danh-nghia-he/", "/writing/chu-de/giai-cau-truc/", "/writing/chu-de/nhan-thuc-luan/"):
        if phrase not in platform:
            failures.append(f"platform entry lacks semantic discovery marker {phrase}")

    for public_file in ("robots.txt", "sitemap.xml", "favicon.svg"):
        if not (root / "D_Data/platform/seo" / public_file).is_file():
            failures.append(f"missing public {public_file}")
    return failures


def main() -> None:
    failures = validate_seo()
    if failures:
        print("SEO GATE: FAIL")
        for failure in failures:
            print(f"- {failure}")
        raise SystemExit(1)
    print("SEO GATE: PASS")


if __name__ == "__main__":
    main()
