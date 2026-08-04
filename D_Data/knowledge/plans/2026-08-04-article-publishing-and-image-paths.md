# Article Publishing and Writing Image Paths Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make article ingestion repeatable for agents and compile canonical image references into the `/writing/` mount without production 404s.

**Architecture:** Canonical posts keep mount-independent `/assets/...` references. A focused Input adapter rewrites only staged Markdown/HTML local asset URLs; Process gates validate canonical image ownership and the compiled artifact. An agent-facing preparation CLI orchestrates validation and sandbox build, then writes an IPOD report without committing or deploying.

**Tech Stack:** Python 3 standard library, Jekyll 4.3.4 through Bundler 2.5.23, `unittest`, Markdown/YAML front matter, static GitHub Pages artifacts.

## Global Constraints

- Canonical article and media bytes must not be changed by staging or presentation work.
- Book membership and order remain owned only by `D_Data/manifests/books.json`.
- Canonical local image URLs remain `/assets/images/<slug>/...`; `/writing/` is added only in staged or generated output.
- Gates report failures and never silently repair canonical Data.
- `publish_article` must not commit, push, deploy, download, delete, rename, or rewrite canonical content.
- Every new failure reports the owning phase, article, and offending path.

---

## File structure

- `I_Input/jekyll/media_paths.py`: pure staged-text URL translation.
- `I_Input/jekyll/stage.py`: invoke translation only for staged `_posts/*.md` and `_english/*.md` files.
- `P_Process/validation/article_media.py`: extract and validate canonical local image references.
- `P_Process/validation/run_all.py`: register the article-media gate.
- `P_Process/tools/publish_article.py`: validate one article, build in a temporary sandbox, and emit an IPOD report.
- `D_Data/knowledge/runbooks/PUBLISH_ARTICLE.md`: agent operating procedure.
- `D_Data/knowledge/templates/article-vi.md`: ordinary Vietnamese article template.
- `D_Data/knowledge/templates/article-en.md`: optional English counterpart template.
- `P_Process/tests/test_media_paths.py`: translation unit tests.
- `P_Process/tests/test_article_media.py`: canonical reference gate tests.
- `P_Process/tests/test_publish_article.py`: preparation CLI orchestration tests.
- `P_Process/tests/test_build.py`: composed artifact regression for Writing-mounted images.

---

### Task 1: Staged Writing media-path adapter

**Files:**
- Create: `I_Input/jekyll/media_paths.py`
- Modify: `I_Input/jekyll/stage.py`
- Create: `P_Process/tests/test_media_paths.py`
- Modify: `P_Process/tests/test_stage.py`

**Interfaces:**
- Produces: `rewrite_writing_asset_urls(text: str, mount: str = "/writing") -> str`.
- Consumes: staged UTF-8 Markdown under `_posts/` and `_english/`.
- Guarantee: replaces local `src`, `href`, and Markdown destinations beginning `/assets/`; leaves source files and all other URLs unchanged.

- [ ] **Step 1: Write failing pure-function tests**

```python
from I_Input.jekyll.media_paths import rewrite_writing_asset_urls

def test_rewrites_only_root_local_assets():
    source = '''![hero](/assets/images/a/hero.png)
<img src="/assets/images/a/hero.png">
<a href="/assets/images/a/full.png">full</a>
![external](https://example.com/x.png)
<img src="/writing/assets/images/kept.png">
'''
    rendered = rewrite_writing_asset_urls(source)
    assert rendered.count("/writing/assets/") == 4
    assert "https://example.com/x.png" in rendered
    assert "/writing/writing/" not in rendered
    assert rewrite_writing_asset_urls(rendered) == rendered
```

- [ ] **Step 2: Run the unit test and observe RED**

Run: `python -B -m unittest P_Process.tests.test_media_paths -v`

Expected: import failure because `I_Input.jekyll.media_paths` does not exist.

- [ ] **Step 3: Implement the bounded translator**

Create a compiled regular expression that matches only `(/assets/...)` Markdown destinations and quoted HTML `src="/assets/..."`, `src='/assets/...'`, `href="/assets/..."`, and `href='/assets/...'`. Normalize the mount with `mount.rstrip('/')`, replace with `f"{mount}/assets/"`, and return the original string when no match exists.

- [ ] **Step 4: Add a staging regression test**

Extend the stage fixture with `_posts/a.md` containing `/assets/images/a.png`. Assert the canonical file still contains `/assets/images/a.png` after `stage_site`, while `stage/_posts/a.md` contains `/writing/assets/images/a.png`.

- [ ] **Step 5: Apply translation at the staging boundary**

After source-map copying and before atomic replacement, iterate only over `temporary/_posts/**/*.md` and `temporary/_english/**/*.md`. Read/write UTF-8 and call `rewrite_writing_asset_urls`. Do not scan assets, layouts, JavaScript, or canonical paths.

- [ ] **Step 6: Run focused tests and commit**

Run: `python -B -m unittest P_Process.tests.test_media_paths P_Process.tests.test_stage -v`

Expected: PASS.

Commit: `fix: mount staged article images under writing`

---

### Task 2: Canonical article-image integrity gate

**Files:**
- Create: `P_Process/validation/article_media.py`
- Create: `P_Process/tests/test_article_media.py`
- Modify: `P_Process/validation/run_all.py`

**Interfaces:**
- Produces: `extract_local_image_paths(text: str) -> tuple[str, ...]`.
- Produces: `validate_article_media(root: Path) -> list[str]`.
- Consumes: canonical post and English Markdown plus `D_Data/media/assets/images`.

- [ ] **Step 1: Write failing extractor and validator tests**

Use a temporary repository with one post containing Markdown and HTML image references. Assert extraction returns sorted unique `/assets/images/...` paths. Assert a present file yields `[]`; a missing file yields exactly `missing article image: D_Data/content/posts/2026-01-01-a.md -> /assets/images/a/missing.png`; assert `../`, backslashes, `/writing/assets/`, and case-mismatched paths fail explicitly.

- [ ] **Step 2: Run tests and observe RED**

Run: `python -B -m unittest P_Process.tests.test_article_media -v`

Expected: import failure because the validator does not exist.

- [ ] **Step 3: Implement extraction and fail-closed mapping**

Extract Markdown image destinations and HTML `img src` values. Ignore `http:`, `https:`, and `data:`. Accept only `/assets/images/`; resolve its suffix beneath `D_Data/media/assets/images`, reject traversal, require `is_file()`, and compare every path component against directory enumeration to catch case errors on Windows.

- [ ] **Step 4: Register the gate**

Import `validate_article_media` in `P_Process/validation/run_all.py` and add `("article-media", validate_article_media(root))` between source and Canvas gates.

- [ ] **Step 5: Run focused and full source gates, then commit**

Run:

```text
python -B -m unittest P_Process.tests.test_article_media P_Process.tests.test_run_all -v
python -B -m P_Process.validation.run_all
```

Expected: PASS and `SOURCE GATES: PASS`.

Commit: `feat: validate canonical article images`

---

### Task 3: Compiled artifact regression

**Files:**
- Modify: `P_Process/tests/test_build.py`
- Create: `P_Process/validation/writing_artifact.py`
- Create: `P_Process/tests/test_writing_artifact.py`

**Interfaces:**
- Produces: `validate_writing_images(destination: Path) -> list[str]`.
- Consumes: completed composed site artifact containing `writing/`.

- [ ] **Step 1: Write the failing artifact tests**

Create a fixture artifact with `writing/article/index.html` referencing `/writing/assets/images/a/hero.png`. Assert success when `writing/assets/images/a/hero.png` exists. Assert exact failure for a missing target and for any HTML image reference beginning `/assets/images/`.

- [ ] **Step 2: Run the test and observe RED**

Run: `python -B -m unittest P_Process.tests.test_writing_artifact -v`

Expected: import failure because `writing_artifact.py` does not exist.

- [ ] **Step 3: Implement artifact validation**

Enumerate `destination/writing/**/*.html`, extract local `img src` and image-link `href` values, reject root `/assets/images/`, map `/writing/assets/images/...` to the artifact root, and report missing files with the owning HTML path.

- [ ] **Step 4: Strengthen the composed build test**

After `build_site`, call `validate_writing_images(destination)` and assert `[]`. Also read a generated post registry payload or post page containing `doi-song-de-danh-hero.png` and assert `/writing/assets/images/doi-song-de-danh/doi-song-de-danh-hero.png` is present while the unmounted form is absent.

- [ ] **Step 5: Run build regressions and commit**

Run: `python -B -m unittest P_Process.tests.test_writing_artifact P_Process.tests.test_build -v`

Expected: PASS.

Commit: `test: gate writing artifact image paths`

---

### Task 4: Agent runbook and templates

**Files:**
- Create: `D_Data/knowledge/runbooks/PUBLISH_ARTICLE.md`
- Create: `D_Data/knowledge/templates/article-vi.md`
- Create: `D_Data/knowledge/templates/article-en.md`
- Modify: `AGENTS.md`
- Create: `P_Process/tests/test_article_runbook.py`

**Interfaces:**
- Produces: a single discoverable agent entrypoint linked from `AGENTS.md`.
- Consumes: existing post, English, media, and book-manifest contracts.

- [ ] **Step 1: Write the failing documentation contract test**

Assert the runbook and two templates exist; `AGENTS.md` links the runbook; the runbook names the three canonical ownership paths, `books.json`, `publish_article`, source gates, build preview, and separate deploy authorization; templates contain literal replacement tokens such as `<slug>` and valid delimiter pairs.

- [ ] **Step 2: Run the test and observe RED**

Run: `python -B -m unittest P_Process.tests.test_article_runbook -v`

Expected: FAIL because the runbook and templates do not exist.

- [ ] **Step 3: Write templates and runbook**

The VI template contains `layout`, `title`, `title_en`, `date`, `tag`, `tag_en`, `excerpt_text`, and `credit_name`. The EN template contains `slug_key`, `source_note`, and `translation_gate`. The runbook documents ordinary post, bilingual post, and book chapter branches; canonical image syntax; sandbox validation; preview; commit; explicit push/deploy; rollback behavior.

- [ ] **Step 4: Link the runbook from `AGENTS.md` and commit**

Run: `python -B -m unittest P_Process.tests.test_article_runbook -v`

Expected: PASS.

Commit: `docs: add agent article publishing runbook`

---

### Task 5: `publish_article` sandbox preparation CLI

**Files:**
- Create: `P_Process/tools/publish_article.py`
- Create: `P_Process/tests/test_publish_article.py`
- Modify: `D_Data/knowledge/runbooks/PUBLISH_ARTICLE.md`

**Interfaces:**
- Produces: `prepare_article(root: Path, slug: str, report_path: Path, build: Callable = build_site) -> ArticlePreparationReport`.
- Produces CLI: `python -B -m P_Process.tools.publish_article --slug <slug> [--report <path>]`.
- Consumes: `validate_article_media(root)`, existing site/source gates, and `build_site(root, sandbox_destination)`.

- [ ] **Step 1: Write failing orchestration tests**

Build a temporary canonical fixture and inject a fake build callable. Assert an existing dated VI post is discovered by slug, optional EN/media are reported, validation failures stop before build, success invokes build once inside a temporary directory, and the JSON report contains keys `input`, `process`, `output`, `data_feedback`, `ok`, and `slug`.

- [ ] **Step 2: Run tests and observe RED**

Run: `python -B -m unittest P_Process.tests.test_publish_article -v`

Expected: import failure because `publish_article.py` does not exist.

- [ ] **Step 3: Implement fail-closed preparation**

Use `argparse`, immutable dataclasses, `tempfile.TemporaryDirectory`, and dependency injection for the build callable. Resolve exactly one `D_Data/content/posts/YYYY-MM-DD-<slug>.md`; discover but do not require the English counterpart and media directory; call article validation before build; write the report atomically through a sibling temporary file and `Path.replace`.

- [ ] **Step 4: Add CLI usage to the runbook**

Document:

```text
python -B -m P_Process.tools.publish_article --slug <slug>
python -B -m P_Process.validation.run_all
python -B -m P_Process.build.build_site --destination O_Output/artifacts/site-preview
```

State explicitly that commit and `git push origin HEAD:main` remain separate user-authorized actions.

- [ ] **Step 5: Run focused tests and commit**

Run: `python -B -m unittest P_Process.tests.test_publish_article P_Process.tests.test_article_runbook -v`

Expected: PASS.

Commit: `feat: add article preparation sandbox command`

---

### Task 6: Full verification and production repair

**Files:**
- Modify only if a verification defect is proven by a failing test.
- Evidence: `O_Output/reports/article-image-path-verification.json`

**Interfaces:**
- Consumes: all preceding gates and the composed artifact.
- Produces: verified commit ready for the existing GitHub Pages workflow.

- [ ] **Step 1: Run all local gates**

Run:

```text
python -B -m P_Process.validation.run_all
python -B -m unittest discover -s P_Process/tests -p "test_*.py" -v
node --test P_Process/tests/platform/*.test.mjs
git diff --check
```

Expected: all commands exit 0.

- [ ] **Step 2: Build and inspect the composed artifact**

Run:

```text
python -B -m P_Process.build.build_site --destination O_Output/artifacts/site-preview
python -B -m P_Process.tools.publish_article --slug doi-song-de-danh --report O_Output/reports/article-image-path-verification.json
```

Expected: build passes; report has `"ok": true`; representative files exist under `writing/assets/images/` and compiled content uses `/writing/assets/images/`.

- [ ] **Step 3: Commit verification evidence if repository policy tracks it**

If `O_Output/reports/` is ignored, retain it locally and do not force-add it. Otherwise commit only the deterministic report with `test: record article image verification`.

- [ ] **Step 4: Push only after explicit user authorization**

Push the verified HEAD to `main`, wait for canonical `Validate` and `Deploy Pages` workflows, and ignore the known legacy Pages pipeline when the two canonical workflows succeed.

- [ ] **Step 5: Verify production**

HTTP-check representative URLs, including:

```text
https://jkdkr2439.github.io/writing/assets/images/doi-song-de-danh/doi-song-de-danh-hero.png
https://jkdkr2439.github.io/writing/assets/images/tam-ly-hoc-vo-thuc/i_frontispiece.jpg
```

Expected: HTTP 200 with image content types. Open one ordinary illustrated post and the Jung landing page; assert rendered `img.src` values begin `/writing/assets/images/`, images have nonzero natural dimensions, and the browser console has no image 404s.

---

## Plan self-review

- Spec coverage: ownership, mount-independent Data, staged translation, source gate, artifact gate, runbook, templates, sandbox command, IPOD reporting, and production smoke checks each have an owning task.
- Placeholder scan: angle-bracket tokens occur only as intentional runbook/template command variables; no implementation placeholder remains.
- Type consistency: `rewrite_writing_asset_urls`, `validate_article_media`, `validate_writing_images`, and `prepare_article` retain the same signatures wherever consumed.
