# Site Canvas and Writing Module Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the minimal Canvas the public root, mount the existing blog as an independently built Writing module at `/writing/`, and expose Products, Papers, Media, and Connect as registry-owned placeholders.

**Architecture:** The repository remains DIPOD at the root. A small platform kernel reads identity and module manifests, while the build compositor creates one static artifact from the Canvas shell and a Jekyll-built Writing module. Canvas and Writing communicate only through versioned route, locale, build, and health contracts.

**Tech Stack:** Python 3.12 build/validation, Jekyll through Bundler 2.5.23, browser-native ES modules, HTML/CSS, JSON, Node.js contract tests, GitHub Pages.

## Global Constraints

- Work only on `feature/dipod-blog-migration`; do not modify `main` or publish remotely during local integration.
- Preserve the root contract: `.github`, `D_Data`, `D_Display`, `I_Input`, `O_Output`, `P_Process`, `AGENTS.md`, and `README.md` only.
- Keep the existing authored post, English, and media bytes unchanged.
- Canvas owns global identity, locale, module registry, lifecycle, routing compatibility, and fault reporting.
- Writing owns its content reader, sidebar, Jekyll layouts, and writing-specific assets.
- Use module id `media`, route `/media/`, labels `Media` in both languages; YouTube is the first Media capability, not the module identity.
- English identity uses `Name · Meaning · Frame`; explanatory copy may expand Frame to “frame of reference”.
- A failed module build must prevent publication but must not modify the last verified destination.
- No internal local path, stack trace, secret, or unpublished knowledge substrate may enter the public artifact.

---

### Task 1: Freeze Integration and Compatibility Contracts

**Files:**
- Create: `D_Data/contracts/platform-module.schema.json`
- Create: `D_Data/contracts/artifact-layout.json`
- Create: `D_Data/platform/identity/site.json`
- Create: `D_Data/platform/registry/modules.json`
- Create: `P_Process/tests/test_platform_contracts.py`
- Modify: `O_Output/contracts/artifact-contract.json`

**Interfaces:**
- Produces `validate_platform_registry(root: Path) -> list[str]`.
- Registry modules are `writing`, `products`, `papers`, `media`, and `connect`.
- Writing manifest declares `route=/writing/`, `state=active`, `builder=jekyll`, and `health_contract=writing-artifact-v1`.

- [ ] Write failing tests for five unique module ids/routes, Media naming, bilingual identity, one active Writing module, and artifact ownership.
- [ ] Run `python -B -m unittest P_Process.tests.test_platform_contracts -v` and confirm missing-contract failures.
- [ ] Add the identity, registry, schemas, and artifact layout contract.
- [ ] Re-run the contract test and require a clean pass.

### Task 2: Import the Canvas Kernel into Canonical DIPOD Owners

**Files:**
- Create: `I_Input/platform/load_registry.mjs`
- Create: `P_Process/platform/contracts.mjs`
- Create: `P_Process/platform/events.mjs`
- Create: `P_Process/platform/locale.mjs`
- Create: `P_Process/platform/runtime.mjs`
- Create: `D_Display/platform/index.html`
- Create: `D_Display/platform/shell.mjs`
- Create: `D_Display/platform/destination.mjs`
- Create: `D_Display/platform/site.css`
- Create: `P_Process/tests/platform/contracts.test.mjs`
- Create: `P_Process/tests/platform/runtime.test.mjs`
- Create: `P_Process/tests/platform/locale.test.mjs`

**Interfaces:**
- `createLocaleService(initial, supported)` is the only global VI/EN state.
- `createRuntime({loadRegistry, loadModule, shell, identity, locale, clock})` returns an IPOD runtime report.
- Every module receives bounded context `{manifest, identity, locale, slot, emit, navigate}`.

- [ ] Port tests from `homepage-canvas-001` first and watch them fail against missing blog-owned modules.
- [ ] Port the minimal kernel without trial paths or trial evidence.
- [ ] Ensure one EN action updates identity and every mounted module through the shared locale service.
- [ ] Ensure Times New Roman precedes generic serif for Vietnamese text and no external font is requested.
- [ ] Run all platform Node tests and require zero failures.

### Task 3: Make Writing Location-Aware

**Files:**
- Create: `D_Data/config/writing.yml`
- Modify: `D_Data/contracts/source-map.json`
- Modify: `D_Display/pages/index.html`
- Modify: `D_Display/includes/sidebar.html`
- Modify: `D_Display/includes/canvas/anchor-zone.html`
- Modify: `D_Display/assets/js/app.js`
- Modify: `D_Display/assets/js/canvas/orchestrator.js`
- Create: `P_Process/tests/test_writing_mount.py`
- Modify: `P_Process/tests/browser/test_canvas_store.js`

**Interfaces:**
- Writing mount path is supplied by build configuration as `/writing`.
- Writing query routes are `/writing/?post=<encoded-route>` and `/writing/?book=<book-id>`.
- Writing code may not derive its mount path by hard-coded string replacement after build.

- [ ] Write failing tests proving generated sidebar links, asset references, home behavior, and history updates stay under `/writing/`.
- [ ] Add the Writing build profile and stage it alongside the canonical Jekyll config.
- [ ] Replace root assumptions with the configured mount path at canonical Liquid/JavaScript owners.
- [ ] Run Writing unit/browser contracts and build a temporary Writing artifact.
- [ ] Assert all 78 baseline content routes remain addressable inside the Writing module.

### Task 4: Add Backward-Compatible Root Routing

**Files:**
- Create: `P_Process/platform/compatibility.mjs`
- Create: `P_Process/tests/platform/compatibility.test.mjs`
- Modify: `D_Display/platform/index.html`

**Interfaces:**
- `resolveLegacyLocation(url)` returns either `null` or a same-origin `/writing/` target.
- `/?post=...` maps to `/writing/?post=...`.
- `/?book=...` maps to `/writing/?book=...`.
- Unknown or oversized queries remain on the Canvas and do not enter a redirect loop.

- [ ] Write failing literal URL cases including encoded Unicode, malformed values, oversized queries, and unrelated parameters.
- [ ] Implement same-origin compatibility resolution before normal Canvas boot.
- [ ] Verify one redirect maximum and preserved query bytes.

### Task 5: Build and Compose Independent Artifacts

**Files:**
- Create: `P_Process/build/build_platform.py`
- Create: `P_Process/build/build_writing.py`
- Create: `P_Process/build/compose_site.py`
- Modify: `P_Process/build/build_site.py`
- Create: `P_Process/tests/test_build_platform.py`
- Create: `P_Process/tests/test_build_writing.py`
- Create: `P_Process/tests/test_compose_site.py`

**Interfaces:**
- `build_platform(root, destination) -> PlatformBuildReport` publishes only explicit Canvas owners.
- `build_writing(root, destination) -> WritingBuildReport` runs Jekyll into an isolated `/writing` artifact.
- `compose_site(root, destination) -> CompositionReport` atomically combines platform root and Writing without overlapping owners.

- [ ] Write failing tests for platform output, Writing output, ownership collision, failed child build, and atomic destination replacement.
- [ ] Extract the existing Jekyll invocation into `build_writing` with the Writing config profile.
- [ ] Implement explicit platform copy mappings; do not recursively publish canonical `D_Data` or all of `P_Process`.
- [ ] Implement collision detection and atomic composition.
- [ ] Keep `build_site` as the stable CLI facade calling `compose_site`.
- [ ] Run real composition and require `_site/index.html` plus `_site/writing/index.html`.

### Task 6: Validate the Composed Site and Module Isolation

**Files:**
- Create: `P_Process/validation/platform_artifact.py`
- Create: `P_Process/validation/writing_artifact.py`
- Modify: `P_Process/validation/artifact.py`
- Modify: `P_Process/validation/run_all.py`
- Create: `P_Process/tests/test_composed_artifact.py`
- Create: `O_Output/contracts/writing-artifact-v1.json`

**Interfaces:**
- Platform gate checks five registry projections, shared locale behavior, CSP, local assets, and safe degradation.
- Writing gate checks baseline content routes under `/writing`, local references, reader initialization, and no root-owned asset leakage.
- Composition gate checks owner collisions, legacy redirects, secrets, broken links, and public-path containment.

- [ ] Write a real artifact regression test before altering the current artifact validator.
- [ ] Split platform and Writing validation while preserving one `validate_artifact` facade.
- [ ] Add a fixture where one optional module throws and prove Canvas plus Writing remain reachable.
- [ ] Build and validate the full artifact with zero failures.

### Task 7: Local Browser Acceptance

**Files:**
- Create: `O_Output/reports/site-canvas-writing-integration.md`
- Create: `O_Output/evidence/site-canvas-writing-ipod.json`

**Interfaces:**
- Browser acceptance covers Canvas `/`, Writing `/writing/`, a bilingual article, VI/EN broadcast, Media placeholder, legacy query redirect, and browser logs.

- [ ] Serve the composed artifact on localhost without Jekyll live-server behavior.
- [ ] Verify Canvas and Writing at 360, 768, 1280, and 1440 CSS pixels.
- [ ] Switch EN once and verify Canvas labels plus newly mounted module labels use the shared locale.
- [ ] Open one Vietnamese/English Writing article and verify assets and history remain under `/writing/`.
- [ ] Visit one legacy root post query and verify a single compatibility redirect.
- [ ] Record console errors, broken resources, horizontal overflow, module counts, and IPOD lifecycle evidence.

### Task 8: Update CI Without Publishing Yet

**Files:**
- Modify: `.github/workflows/validate.yml`
- Modify: `.github/workflows/pages.yml`
- Modify: `README.md`
- Modify: `AGENTS.md`

**Interfaces:**
- CI invokes the stable `python -B -m P_Process.build.build_site --destination _site` facade.
- Pages uploads only the verified composed `_site` artifact.
- Agent entrypoint maps platform ownership separately from Writing ownership.

- [ ] Update validation workflow to run Python, platform Node tests, Writing browser contracts, real composition, and composed artifact validation.
- [ ] Update Pages workflow to consume the same verified composition path.
- [ ] Validate both workflow YAML files locally.
- [ ] Run the complete suite and confirm a clean feature worktree.
- [ ] Stop before merge or push and present local merge, pull request, or keep-branch options.
