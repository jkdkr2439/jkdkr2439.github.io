# Modular Site Canvas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the blog shell into a DIPOD site canvas with a permanent cognitive-domain rail, a domain-scoped context panel, and the unchanged content stage.

**Architecture:** `_data/canvas.json` declares zones, modules, domain order, labels, and context ownership. Jekyll renders bounded zone includes; a small global canvas API owns domain and collapse state while the existing `app.js` remains the sole post/book router. Each canvas module declares recursive IPOD and communicates only through validated canvas events.

**Tech Stack:** Jekyll/Liquid, vanilla JavaScript, CSS Grid, Python `unittest`, GitHub Pages.

## Global Constraints

- System flow remains Data → Input → Process → Output → Data.
- Every module declares Input, Process, Output, and Dependencies.
- `_data/canvas.json` is the sole authority for zone and module placement.
- `_data/books.json` remains the sole authority for book membership and order.
- Existing `show-home`, `show-post`, `show-book`, and `show-about` route actions remain authoritative.
- Existing `?post=` and `?book=` links remain valid.
- No authored content or post-registry schema changes.
- `index.html` remains a thin shell.
- The local pre-canvas clone at `C:\Users\Admin\Desktop\jkdkr2439.github.io-backup-before-canvas` remains untouched.

---

### Task 1: Declare and validate the canvas contract

**Files:**
- Create: `_data/canvas.json`
- Create: `scripts/validate_canvas.py`
- Create: `scripts/test_canvas_contract.py`
- Modify: `scripts/validate_site.py`
- Modify: `ARCHITECTURE.md`

**Interfaces:**
- Consumes: domain keys, bilingual labels, zone keys, module keys, post tags, collection keys, and book keys.
- Produces: `canvas.json` with `zones`, `modules`, and ordered `domains`; `validate_canvas() -> list[str]`.

- [ ] Write failing tests that require exactly `anchor`, `context`, and `stage` zones; unique module ownership; bilingual labels; valid context-source types; unique domain keys; and valid referenced book keys.
- [ ] Run `python -m unittest scripts.test_canvas_contract -v` and confirm failure because the manifest and validator do not exist.
- [ ] Add the minimal manifest for all current top-level domains and the three initial modules.
- [ ] Implement `validate_canvas.py` as a read-only gate and call it from `validate_site.py` without allowing the gate to mutate data.
- [ ] Document the Canvas → Zone → Module ownership and recursive IPOD rule in `ARCHITECTURE.md`.
- [ ] Run the contract test and site validator until green.

### Task 2: Build the physical canvas shell

**Files:**
- Create: `_includes/canvas/shell.html`
- Create: `_includes/canvas/anchor-zone.html`
- Create: `_includes/canvas/context-zone.html`
- Create: `_includes/canvas/stage-zone.html`
- Modify: `_includes/sidebar.html`
- Modify: `index.html`
- Create: `assets/css/canvas.css`
- Create: `assets/css/modules/anchor-rail.css`
- Create: `assets/css/modules/context-tree.css`
- Modify: `assets/css/site.css`
- Test: `scripts/test_canvas_contract.py`

**Interfaces:**
- Consumes: `site.data.canvas`, the existing sidebar tree, and `_includes/reader.html`.
- Produces: one `.site-canvas` with one owned element for each declared zone.

- [ ] Extend the failing test to require one anchor zone, context zone, and stage zone, plus manifest-driven domain controls and context panels.
- [ ] Render the brand, language controls, and ordered domain buttons in `anchor-zone.html`.
- [ ] Decompose the current sidebar into domain-scoped panels inside `context-zone.html`; do not duplicate post or book links.
- [ ] Place the existing reader include inside `stage-zone.html`.
- [ ] Make `shell.html` the sole composition include used by `index.html`.
- [ ] Add the three-column desktop grid and scoped module styling; remove only obsolete monolithic-sidebar layout rules from `site.css`.
- [ ] Run contract and site tests until the shell is structurally green.

### Task 3: Implement bounded canvas state and events

**Files:**
- Create: `assets/js/canvas/registry.js`
- Create: `assets/js/canvas/contracts.js`
- Create: `assets/js/canvas/store.js`
- Create: `assets/js/canvas/orchestrator.js`
- Create: `assets/js/modules/anchor-rail.js`
- Create: `assets/js/modules/context-tree.js`
- Modify: `index.html`
- Modify: `assets/js/app.js`
- Create: `scripts/test_canvas_runtime.py`

**Interfaces:**
- Consumes: `window.DNHCanvasRegistry`, URL `domain`, trusted `data-canvas-action` controls, and existing route state.
- Produces: `window.DNHCanvas` with `selectDomain(key)`, `toggleContext()`, `syncRoute(route)`, `setLanguage(language)`, and `getState()`.

- [ ] Write failing source-contract tests requiring the public API, the exact event allowlist, manifest-key validation, and no cross-module DOM selectors.
- [ ] Generate the bounded registry from Jekyll data.
- [ ] Implement contracts as pure key/event validators.
- [ ] Implement a single store for `domain`, `contextCollapsed`, and `language`; persist only the collapse preference.
- [ ] Implement the orchestrator so selecting a domain updates active anchor state, exposes exactly one matching context panel, and preserves existing content routes.
- [ ] Implement anchor and context controllers using delegated trusted events inside their owned roots.
- [ ] Load canvas scripts before `app.js`; adapt `app.js` to notify the canvas after home, about, post, and book route changes without moving route logic.
- [ ] Serialize a valid `domain` parameter while preserving `post` or `book`, and derive the owning domain for old URLs lacking it.
- [ ] Run JavaScript syntax checks and runtime source-contract tests until green.

### Task 4: Make responsive behavior a canvas responsibility

**Files:**
- Modify: `assets/css/canvas.css`
- Modify: `assets/css/modules/anchor-rail.css`
- Modify: `assets/css/modules/context-tree.css`
- Modify: `assets/js/canvas/orchestrator.js`
- Test: `scripts/test_canvas_runtime.py`

**Interfaces:**
- Consumes: desktop, compact-desktop, tablet, and mobile viewport states.
- Produces: stable three-zone desktop layout, collapsible context panel, and one accessible mobile navigation drawer.

- [ ] Add test assertions for the collapse control, `aria-expanded`, owned mobile drawer state, and absence of a second mobile router.
- [ ] Keep the anchor rail visible on desktop and compact desktop; collapse only the context zone.
- [ ] Below 768 pixels, combine navigation zones into a drawer while preserving DOM ownership and keyboard access.
- [ ] Ensure the bilingual reader keeps its existing one-column mobile fallback.
- [ ] Verify focus states, overflow ownership, independent context scrolling, and stage scrolling.

### Task 5: Full regression, visual verification, and deployment

**Files:**
- Modify only files required by failures discovered in this task.

**Interfaces:**
- Consumes: the completed canvas and current production content.
- Produces: a deployed GitHub Pages build with reconstructable routes and documented verification evidence.

- [ ] Run all canvas tests, Jung editorial and illustration tests, `python scripts/validate_site.py`, `node --check` for every JavaScript module, and `git diff --check`.
- [ ] Compare home, article, continuous-book, and about views at desktop and mobile widths.
- [ ] Verify anchor selection, context replacement, context collapse, language switching, old `?post=`, old `?book=`, and new `domain` reconstruction.
- [ ] Confirm the original sidebar tree is not duplicated in the DOM and each context item belongs to exactly one domain.
- [ ] Commit bounded implementation changes, push `main`, require a successful GitHub Pages build, and repeat critical checks on the live URL.
