# Blog DIPOD/IPOD Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the production blog source to the approved six-directory DIPOD/IPOD topology while preserving content, routes, display behavior, and recoverable GitHub Pages publication.

**Architecture:** `main` owns canonical data, adapters, deterministic processes, output contracts, display modules, and GitHub automation. A Python staging adapter maps those owners into an ephemeral conventional Jekyll tree, validation runs before and after the build, and only the verified static artifact is deployed to `gh-pages`.

**Tech Stack:** Python 3.12+ standard library, Ruby/Jekyll through the existing `github-pages` gem, Node.js syntax/runtime checks, GitHub Actions, GitHub Pages.

## Global Constraints

- `main` has exactly `D_Data`, `I_Input`, `P_Process`, `O_Output`, `D_Display`, and `.github` as source directories at root.
- `main` has exactly `AGENTS.md` and `README.md` as source files at root.
- Git metadata is not counted as source topology.
- Generated deployment artifacts live on `gh-pages`; they are not committed to `main`.
- Published URLs, authored content, book membership, reader behavior, and visual presentation must not intentionally change.
- A gate audits and reports; it never silently repairs the artifact it judges.
- Tokens and secrets must never appear in remotes, source files, logs, or workflow files.
- Products are out of scope for this migration.

---

## Target file map

```text
D_Data/
  identity/{site.json,principles.md}
  content/{posts,english,sources}
  media/assets/images
  manifests/{books.json,canvas.json}
  config/{jekyll.yml,dependencies/Gemfile}
  contracts/source-map.json
  knowledge/{specs,plans}
I_Input/
  IPOD.md
  jekyll/{__init__.py,source_map.py,stage.py}
P_Process/
  IPOD.md
  build/build_site.py
  validation/{topology.py,source.py,canvas.py,artifact.py}
  publishing/verify_deployment.py
  tests/{test_topology.py,test_stage.py,test_source.py,test_artifact.py}
  tools/<existing import tools>
O_Output/
  IPOD.md
  contracts/artifact-contract.json
  fixtures/baseline.json
  reports/.gitkeep
D_Display/
  IPOD.md
  pages/{index.html,about.md}
  layouts/*.html
  includes/**
  assets/{css,js,downloads}
.github/workflows/{validate.yml,pages.yml}
AGENTS.md
README.md
```

---

### Task 1: Capture the production baseline and enforce topology as an initially failing contract

**Files:**
- Create: `P_Process/tests/test_topology.py`
- Create: `P_Process/validation/topology.py`
- Create: `O_Output/fixtures/baseline.json`
- Create: `D_Data/contracts/source-map.json`
- Move: `docs/superpowers/specs/*` → `D_Data/knowledge/specs/`
- Move: `docs/superpowers/plans/*` → `D_Data/knowledge/plans/`

**Interfaces:**
- Produces: `validate_root(root: Path) -> list[str]`
- Produces: `D_Data/contracts/source-map.json`, the canonical source-to-staging ownership table.
- Produces: `O_Output/fixtures/baseline.json`, the immutable pre-migration inventory used by later artifact checks.

- [ ] **Step 1: Tag the recoverable production state**

Run:

```powershell
git tag blog-pre-dipod-migration-2026-08-04 10630c8
```

Expected: tag resolves to `10630c8` and no remote mutation occurs.

- [ ] **Step 2: Generate the baseline inventory before moving sources**

Write `O_Output/fixtures/baseline.json` with this schema by scanning the current tree:

```json
{
  "source_commit": "10630c8",
  "posts": [{"path": "_posts/example.md", "sha256": "...", "slug": "example"}],
  "english": [{"path": "_english/example.md", "sha256": "...", "slug": "example"}],
  "media": [{"path": "assets/images/example.png", "sha256": "..."}],
  "routes": ["/", "/about/", "/example/"]
}
```

The generator must sort every list by path or route and hash raw bytes with SHA-256.

- [ ] **Step 3: Write the failing topology test**

```python
from pathlib import Path
from P_Process.validation.topology import validate_root


def test_root_is_the_approved_dipod_surface() -> None:
    failures = validate_root(Path(__file__).resolve().parents[2])
    assert failures == []
```

- [ ] **Step 4: Run it and verify the legacy root fails**

Run:

```powershell
python -m unittest P_Process.tests.test_topology -v
```

Expected: FAIL listing legacy roots such as `_posts`, `_includes`, `assets`, `scripts`, `_config.yml`, and `Gemfile`.

- [ ] **Step 5: Implement the read-only topology validator**

```python
from pathlib import Path

ALLOWED_DIRS = {"D_Data", "I_Input", "P_Process", "O_Output", "D_Display", ".github"}
ALLOWED_FILES = {"AGENTS.md", "README.md"}
IGNORED = {".git"}


def validate_root(root: Path) -> list[str]:
    failures: list[str] = []
    for child in root.iterdir():
        if child.name in IGNORED:
            continue
        allowed = child.name in (ALLOWED_DIRS if child.is_dir() else ALLOWED_FILES)
        if not allowed:
            failures.append(f"unexpected root entry: {child.name}")
    for name in sorted(ALLOWED_DIRS | ALLOWED_FILES):
        if not (root / name).exists():
            failures.append(f"missing root entry: {name}")
    return failures
```

- [ ] **Step 6: Create the explicit source map**

`D_Data/contracts/source-map.json` must contain these ownership mappings:

```json
{
  "version": 1,
  "directories": {
    "D_Data/content/posts": "_posts",
    "D_Data/content/english": "_english",
    "D_Data/content/sources": "_sources",
    "D_Data/manifests": "_data",
    "D_Data/media/assets/images": "assets/images",
    "D_Display/layouts": "_layouts",
    "D_Display/includes": "_includes",
    "D_Display/assets": "assets"
  },
  "files": {
    "D_Data/config/jekyll.yml": "_config.yml",
    "D_Data/config/dependencies/Gemfile": "Gemfile",
    "D_Display/pages/index.html": "index.html",
    "D_Display/pages/about.md": "about.md"
  }
}
```

- [ ] **Step 7: Commit the baseline and contracts**

```powershell
git add D_Data P_Process O_Output
git commit -m "test: capture pre-migration blog contracts"
```

---

### Task 2: Build the deterministic Jekyll staging adapter

**Files:**
- Create: `I_Input/IPOD.md`
- Create: `I_Input/__init__.py`
- Create: `I_Input/jekyll/__init__.py`
- Create: `I_Input/jekyll/source_map.py`
- Create: `I_Input/jekyll/stage.py`
- Create: `P_Process/tests/test_stage.py`

**Interfaces:**
- Produces: `load_source_map(root: Path) -> SourceMap`
- Produces: `load_source_map_file(contract: Path, root: Path) -> SourceMap`
- Produces: `stage_site(root: Path, destination: Path) -> StageReport`
- `StageReport` contains sorted `copied_files: tuple[str, ...]` and `collisions: tuple[str, ...]`.

- [ ] **Step 1: Write failing tests for a clean mapping and a collision**

```python
def test_stage_maps_owned_sources_to_jekyll_paths(self) -> None:
    with tempfile.TemporaryDirectory() as raw:
        stage = Path(raw) / "stage"
        report = stage_site(ROOT, stage)
        self.assertEqual((), report.collisions)
        self.assertTrue((stage / "_config.yml").is_file())
        self.assertTrue((stage / "_data/books.json").is_file())
        self.assertTrue((stage / "_posts").is_dir())
        self.assertTrue((stage / "assets/js/app.js").is_file())


def test_source_map_fails_closed_on_two_sources_for_one_target(self) -> None:
    with tempfile.TemporaryDirectory() as raw:
        root = Path(raw)
        (root / "a.html").write_text("a", encoding="utf-8")
        (root / "b.html").write_text("b", encoding="utf-8")
        contract = root / "source-map.json"
        contract.write_text(
            json.dumps({
                "version": 1,
                "directories": {},
                "files": {"a.html": "index.html", "b.html": "index.html"},
            }),
            encoding="utf-8",
        )
        with self.assertRaisesRegex(SourceMapError, "duplicate destination: index.html"):
            load_source_map_file(contract, root)
```

- [ ] **Step 2: Verify the tests fail because the adapter does not exist**

Run: `python -m unittest P_Process.tests.test_stage -v`

Expected: FAIL importing `I_Input.jekyll.stage`.

- [ ] **Step 3: Implement typed source-map loading**

Use frozen dataclasses:

```python
@dataclass(frozen=True)
class SourceMap:
    directories: tuple[tuple[Path, Path], ...]
    files: tuple[tuple[Path, Path], ...]
```

Reject absolute paths, `..` segments, duplicate source keys, duplicate destination keys, missing sources, and destinations escaping the stage root.

- [ ] **Step 4: Implement staging without mutating sources**

Use `tempfile.TemporaryDirectory`, `Path.resolve`, `shutil.copy2`, and `shutil.copytree`. Build into a sibling temporary directory and rename it to the requested destination only after all copies succeed. Do not delete or rewrite any canonical source.

- [ ] **Step 5: Run adapter tests**

Run: `python -m unittest P_Process.tests.test_stage -v`

Expected: PASS.

- [ ] **Step 6: Commit the adapter**

```powershell
git add I_Input P_Process/tests/test_stage.py
git commit -m "feat: add deterministic Jekyll staging adapter"
```

---

### Task 3: Move canonical data into `D_Data` without changing bytes

**Files:**
- Move: `_posts/` → `D_Data/content/posts/`
- Move: `_english/` → `D_Data/content/english/`
- Move: `_sources/` → `D_Data/content/sources/`
- Move: `_data/books.json` → `D_Data/manifests/books.json`
- Move: `_data/canvas.json` → `D_Data/manifests/canvas.json`
- Move: `assets/images/` → `D_Data/media/assets/images/`
- Move: `_config.yml` → `D_Data/config/jekyll.yml`
- Move: `Gemfile` → `D_Data/config/dependencies/Gemfile`
- Create: `D_Data/identity/site.json`
- Create: `D_Data/identity/principles.md`
- Create: `P_Process/tests/test_source.py`
- Create: `P_Process/validation/source.py`

**Interfaces:**
- Produces: `validate_sources(root: Path, baseline: dict) -> list[str]`
- Consumes: `O_Output/fixtures/baseline.json` and canonical sources under `D_Data`.

- [ ] **Step 1: Write a failing checksum and slug preservation test**

```python
def test_canonical_content_matches_pre_migration_baseline() -> None:
    failures = validate_sources(ROOT, load_baseline(ROOT))
    assert failures == []
```

- [ ] **Step 2: Move files with `git mv` according to the target map**

Do not re-encode or normalize content. Preserve all binary media bytes.

- [ ] **Step 3: Add the identity anchor**

`site.json` contains only stable facts:

```json
{
  "name": "Danh Nghĩa Hệ",
  "canonical_url": "https://jkdkr2439.github.io",
  "purpose": "Publish authored Vietnamese writing, translations, books, and visual essays through an explicit data-to-view system.",
  "languages": ["vi", "en"]
}
```

`principles.md` states manifest authority, content immutability during presentation work, recursive IPOD, fail-closed gates, and return-to-identity recovery.

- [ ] **Step 4: Implement source validation**

For each baseline entry, map its legacy prefix to the new canonical prefix, compare SHA-256 bytes, preserve slug derivation, verify manifest membership, and report every mismatch without modifying data.

- [ ] **Step 5: Run source and staging tests**

```powershell
python -m unittest P_Process.tests.test_source P_Process.tests.test_stage -v
```

Expected: PASS with unchanged checksums and slugs.

- [ ] **Step 6: Commit canonical data ownership**

```powershell
git add -A
git commit -m "refactor: move canonical blog data into D_Data"
```

---

### Task 4: Move display ownership and preserve browser contracts

**Files:**
- Move: `_layouts/` → `D_Display/layouts/`
- Move: `_includes/` → `D_Display/includes/`
- Move: `assets/css/` → `D_Display/assets/css/`
- Move: `assets/js/` → `D_Display/assets/js/`
- Move: `assets/style.css` → `D_Display/assets/style.css`
- Move: `assets/downloads/` → `D_Display/assets/downloads/` if present
- Move: `index.html` → `D_Display/pages/index.html`
- Move: `about.md` → `D_Display/pages/about.md`
- Create: `D_Display/IPOD.md`
- Move and update: `scripts/test_canvas_store.js` → `P_Process/tests/browser/test_canvas_store.js`
- Move and update: Canvas/sidebar runtime tests → `P_Process/tests/display/`

**Interfaces:**
- Staged display paths remain exactly `_layouts`, `_includes`, `assets`, `index.html`, and `about.md`.
- Browser globals `DNHCanvas` and existing router functions remain unchanged.

- [ ] **Step 1: Write an artifact-free display ownership test**

```python
def test_display_sources_have_one_owner() -> None:
    assert not (ROOT / "assets").exists()
    assert not (ROOT / "_includes").exists()
    assert (ROOT / "D_Display/assets/js/app.js").is_file()
    assert (ROOT / "D_Display/includes/canvas/shell.html").is_file()
```

- [ ] **Step 2: Move display sources using `git mv`**

Do not edit HTML, CSS, JavaScript, or Liquid markup in the same commit except test path constants.

- [ ] **Step 3: Update tests to address canonical sources**

Replace legacy roots with `D_Display` and manifest paths with `D_Data/manifests`. Keep asserted strings and behavior unchanged.

- [ ] **Step 4: Stage and run browser/static gates**

```powershell
python -m unittest discover -s P_Process/tests -v
node --check D_Display/assets/js/app.js
node P_Process/tests/browser/test_canvas_store.js
```

Expected: PASS.

- [ ] **Step 5: Commit display ownership**

```powershell
git add -A
git commit -m "refactor: isolate blog display sources"
```

---

### Task 5: Move processes, replace root-relative paths, and create the build command

**Files:**
- Move: `scripts/import_*.ps1` → `P_Process/tools/import/`
- Move: `scripts/*.py` → owning `P_Process/validation/`, `P_Process/build/`, or `P_Process/tools/`
- Create: `P_Process/IPOD.md`
- Create: `P_Process/build/build_site.py`
- Create: `P_Process/validation/run_all.py`
- Modify: all moved Python path constants

**Interfaces:**
- Produces CLI: `python -m P_Process.validation.run_all`
- Produces CLI: `python -m P_Process.build.build_site --destination <path>`
- Build command exits nonzero on source, staging, Jekyll, or artifact failure.

- [ ] **Step 1: Write a failing orchestration test**

```python
def test_build_site_produces_verified_artifact(self) -> None:
    with tempfile.TemporaryDirectory() as raw:
        site = Path(raw) / "site"
        report = build_site(ROOT, site)
        self.assertTrue(report.ok)
        self.assertTrue((site / "index.html").is_file())
```

- [ ] **Step 2: Move each process to its owner**

Import scripts go to `P_Process/tools/import`; validators go to `P_Process/validation`; tests go to `P_Process/tests`. Replace `parents[n]` root discovery with one canonical helper in `P_Process/paths.py`:

```python
ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "D_Data"
DISPLAY = ROOT / "D_Display"
OUTPUT = ROOT / "O_Output"
```

- [ ] **Step 3: Implement the build orchestration**

The command must:

1. run topology and source gates;
2. create a temporary stage through `stage_site`;
3. execute `bundle exec jekyll build --source <stage> --destination <temp-output>` with `BUNDLE_GEMFILE=<stage>/Gemfile`;
4. run artifact validation on the temporary output;
5. atomically replace the requested destination;
6. return a structured report and print a concise IPOD phase log.

- [ ] **Step 4: Run all local gates**

```powershell
python -m P_Process.validation.run_all
python -m unittest discover -s P_Process/tests -v
python -m P_Process.build.build_site --destination "$env:TEMP\dnh-site"
```

Expected: all gates PASS and the repository remains clean.

- [ ] **Step 5: Commit process ownership and build command**

```powershell
git add -A
git commit -m "feat: build blog through DIPOD process gates"
```

---

### Task 6: Prove artifact equivalence and complete the six-folder root

**Files:**
- Create: `P_Process/validation/artifact.py`
- Create: `P_Process/tests/test_artifact.py`
- Create: `O_Output/contracts/artifact-contract.json`
- Create: `O_Output/IPOD.md`
- Modify: `AGENTS.md`
- Modify: `README.md`
- Delete after migration: `.gitignore`, `ARCHITECTURE.md`, empty legacy roots

**Interfaces:**
- Produces: `validate_artifact(site: Path, baseline: dict) -> list[str]`
- `AGENTS.md` becomes the machine routing entrypoint; `README.md` becomes the human entrypoint.

- [ ] **Step 1: Write failing artifact tests**

```python
def test_artifact_contains_every_baseline_route(self) -> None:
    with tempfile.TemporaryDirectory() as raw:
        site = Path(raw) / "site"
        build_site(ROOT, site)
        baseline = json.loads(
            (ROOT / "O_Output/fixtures/baseline.json").read_text(encoding="utf-8")
        )
        failures = validate_artifact(site, baseline)
        self.assertEqual([], failures)
```

Also assert CSP presence, required Canvas DOM anchors, local asset resolution, and absence of absolute filesystem paths or token prefixes such as `ghp_` and `github_pat_`.

- [ ] **Step 2: Implement artifact validation**

Map `/` to `index.html`, `/about/` to `about/index.html`, and `/<slug>/` to `<slug>/index.html`. Parse local `href` and `src` values with the standard library HTML parser and require each referenced local artifact to exist.

- [ ] **Step 3: Rewrite the entry documents**

`AGENTS.md` links to:

- `D_Data/identity/site.json`
- `D_Data/identity/principles.md`
- `D_Data/contracts/source-map.json`
- each domain `IPOD.md`
- `python -m P_Process.validation.run_all`

`README.md` documents clone, dependency install, validate, build, and publication commands.

- [ ] **Step 4: Remove final legacy root entries**

Move the useful content from `ARCHITECTURE.md` into `D_Data/knowledge/specs` and the entry documents. Remove `.gitignore` only after build commands use temporary output and no ignored generated files are needed. Verify there are no empty legacy directories.

- [ ] **Step 5: Run the topology and equivalence gates**

```powershell
python -m P_Process.validation.run_all
python -m unittest discover -s P_Process/tests -v
git diff --check
git status --short
```

Expected: six root directories, two root files, all tests PASS, and no generated site in `main`.

- [ ] **Step 6: Commit the completed source topology**

```powershell
git add -A
git commit -m "refactor: complete six-folder DIPOD blog topology"
```

---

### Task 7: Add validation CI and guarded `gh-pages` publication

**Files:**
- Create: `.github/workflows/validate.yml`
- Create: `.github/workflows/pages.yml`
- Create: `P_Process/publishing/verify_deployment.py`
- Create: `P_Process/tests/test_workflows.py`

**Interfaces:**
- Pull requests and pushes run validation without write permissions.
- `main` publishes only the artifact created by a passing build job.

- [ ] **Step 1: Write workflow contract tests**

Assert that validation has `contents: read`, publication uses `pages: write` and `id-token: write`, jobs depend on validation/build, deployment environment is `github-pages`, and no secret/token literal appears in workflow text.

- [ ] **Step 2: Add read-only validation workflow**

The workflow checks out the repository, installs Ruby from the version supported by `github-pages`, caches Bundler using `D_Data/config/dependencies/Gemfile`, installs Python/Node as needed, runs `python -m P_Process.validation.run_all`, unit tests, and Node checks.

- [ ] **Step 3: Add Pages artifact workflow**

Use official `actions/configure-pages`, `actions/upload-pages-artifact`, and `actions/deploy-pages`. Build to a temporary `_site` directory inside the runner workspace only; upload that artifact; set deployment concurrency to avoid overlapping production writes.

- [ ] **Step 4: Test workflow contracts locally**

Run:

```powershell
python -m unittest P_Process.tests.test_workflows -v
python -m P_Process.validation.run_all
```

Expected: PASS.

- [ ] **Step 5: Commit automation**

```powershell
git add .github P_Process
git commit -m "ci: validate and publish verified blog artifacts"
```

---

### Task 8: Verify from a fresh clone and prepare the production handoff

**Files:**
- Create: `O_Output/reports/migration-verification.md`
- Modify only if evidence requires it: files owned by the failing gate

**Interfaces:**
- Produces a human-readable evidence report containing commit, commands, exit codes, route counts, content counts, media counts, and rollback tag.

- [ ] **Step 1: Clone the feature state into a new temporary directory**

Use `New-Item` to create a task-specific temporary directory, clone from the local repository, and check out the migration commit. Do not reuse the working copy for this verification.

- [ ] **Step 2: Run clean-room validation and build**

```powershell
python -m P_Process.validation.run_all
python -m unittest discover -s P_Process/tests -v
bundle install --gemfile D_Data/config/dependencies/Gemfile
python -m P_Process.build.build_site --destination .verification-site
```

Expected: PASS with route/content/media counts matching the baseline.

- [ ] **Step 3: Perform visual smoke checks**

Serve the verified artifact locally and check homepage, one ordinary article, one bilingual article, one book landing, one book chapter, About, mobile layout, domain selection, language switch, and browser console errors.

- [ ] **Step 4: Write the verification report**

Record exact evidence and the rollback command:

```powershell
git switch --detach blog-pre-dipod-migration-2026-08-04
```

Do not claim deployment success before GitHub Pages reports a successful deployment and the public URL passes smoke checks.

- [ ] **Step 5: Commit evidence**

```powershell
git add O_Output/reports/migration-verification.md
git commit -m "test: record DIPOD migration verification"
```

- [ ] **Step 6: Stop before remote publication if authorization is absent**

Pushing, changing Pages source, and deploying are external mutations. Perform them only under the user's explicit publication instruction; otherwise hand off the verified local branch and report the exact remaining actions.
