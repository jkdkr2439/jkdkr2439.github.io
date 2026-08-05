# Products Showcase Publication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish SIGNAL Newsroom and Common Form Digital Goods as a first-class `/products/` Site Canvas module and deploy the verified composed site through GitHub Pages.

**Architecture:** Canonical public product packages live under `D_Data/products`; a bounded Input loader validates them, a Process builder combines them with `D_Display/products`, and the atomic compositor mounts the artifact at `/products/` beside `/writing/`. The platform registry declares routing and remains the only global module registry.

**Tech Stack:** Python 3.12, unittest, static HTML/CSS/ES modules, JSON contracts, existing GitHub Pages workflow.

## Global Constraints

- Preserve DIPOD/IPOD ownership; never patch generated HTML.
- Publish no SQLite database, machine path, secret, token, raw Agent memory, or raw pipeline journal.
- Keep Writing independent at `/writing/`.
- Build locally and deterministically without API, LLM, embedding, or GPU.
- Browser tooling failure remains pending rather than fabricated as passed.

---

### Task 0: Canonical Products contract and loader

**Files:**
- Create: `D_Data/contracts/products.schema.json`
- Create: `D_Data/products/manifest.json`
- Create: `I_Input/products/__init__.py`
- Create: `I_Input/products/load.py`
- Create: `P_Process/tests/test_products_source.py`

**Interfaces:** `load_products(root: Path) -> dict` validates two unique products, relative public routes, required demo/case-study paths, and forbidden private strings.

- [ ] Write a failing source test asserting exactly `signal-newsroom` and `digital-goods-store`, stable `/products/...` routes, and rejection of traversal/private paths.
- [ ] Run `python -B -m unittest P_Process.tests.test_products_source -v`; expect missing loader failure.
- [ ] Add the schema, manifest, and minimal loader with explicit allow-list validation.
- [ ] Rerun the test; expect PASS.
- [ ] Commit `feat(products): add canonical showcase contract`.

### Task 1: Public-safe product packages

**Files:**
- Create: `D_Data/products/signal/**`
- Create: `D_Data/products/digital-store/**`
- Create: `P_Process/tests/test_products_packages.py`

**Interfaces:** every manifest `source` resolves to an allow-listed package containing `demo/index.html`, `case-study/index.html`, local CSS/JS/assets, and `case-study.json`.

- [ ] Write a failing package test for semantic pages, one `h1`, implemented/target architecture, local assets, and forbidden path/secret patterns.
- [ ] Run the test; expect missing packages failure.
- [ ] Export only the verified public artifacts from the Fullstack Agent product outputs and normalize links for `/products/` mounting.
- [ ] Rerun the test; expect PASS.
- [ ] Commit `feat(products): add two verified showcase packages`.

### Task 2: Isolated Products builder and compositor mount

**Files:**
- Create: `D_Display/products/index.html`
- Create: `D_Display/products/products.css`
- Create: `D_Display/products/products.mjs`
- Create: `P_Process/build/build_products.py`
- Modify: `P_Process/build/compose_site.py`
- Create: `P_Process/tests/test_products_build.py`

**Interfaces:** `build_products(root: Path, destination: Path) -> ProductsBuildReport`; `compose_site(..., products_builder=build_products)` mounts `/products/` and rejects owner collision.

- [ ] Write failing deterministic build/composition tests for gallery, both packages, `/writing/` preservation, and collision rejection.
- [ ] Run the tests; expect missing builder failure.
- [ ] Implement allow-listed build, gallery shell, and atomic compositor mount.
- [ ] Rerun owning and composition tests; expect PASS.
- [ ] Commit `feat(products): build isolated showcase destination`.

### Task 3: Activate registry and enforce publication gates

**Files:**
- Modify: `D_Data/platform/registry/modules.json`
- Modify: `P_Process/validation/platform.py`
- Create: `P_Process/validation/products.py`
- Modify: `P_Process/validation/run_all.py`
- Modify: `P_Process/tests/test_platform_contracts.py`
- Create: `P_Process/tests/test_products_validation.py`

**Interfaces:** Products registry state is `active`, builder is `products`, health contract is `products-artifact-v1`; `validate_products(root: Path) -> list[str]` joins the global gate.

- [ ] Write failing registry and validation tests for active ownership, route uniqueness, package completeness, and no private strings.
- [ ] Run owning tests; expect planned/placeholder and missing validator failures.
- [ ] Activate registry and add the read-only audit gate to `run_all`.
- [ ] Rerun owning tests and `python -B -m P_Process.validation.run_all`; expect PASS.
- [ ] Commit `feat(products): activate products publication gates`.

### Task 4: Acceptance, merge, push, and Pages verification

**Files:**
- Update: `D_Data/knowledge/plans/2026-08-05-products-showcase-publication.md`
- Create: `O_Output/evidence/products-showcase-publication.json`

**Interfaces:** accepted artifact contains `/products/index.html`, both demos/case studies, `/writing/index.html`, and public-safe resources.

- [ ] Run full Python, Node, validation, syntax, and browser-contract suites.
- [ ] Build with `python -B -m P_Process.build.build_site --destination C:\tmp\dnh-products-site` and inspect routes/resources.
- [ ] Record only observed evidence; run `git diff --check` and verify clean scoped status.
- [ ] Commit `test(products): accept showcase publication`.
- [ ] Merge feature branch into local `main`, rerun full gates, push `main`, then monitor `Validate` and `Deploy Pages` to success or report the exact blocker.
