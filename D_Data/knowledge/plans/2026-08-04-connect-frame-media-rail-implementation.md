# Connect Frame and Media Rail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fit the desktop Homepage inside one viewport with three destinations, a persistent Connect frame, a one-row Media rail, and a persistent Home control throughout Writing.

**Architecture:** Registry entries route to one of three display adapters: destination, Connect frame, or Media rail. Each dedicated surface owns its data/process/display slice; the shell only exposes slots. Writing owns a platform navigation Home control outside authored content.

**Tech Stack:** Native ES modules and DOM, JSON contracts, CSS grid/flex/scroll snap, Jekyll includes, Python/Node contract tests, GitHub Pages Actions.

## Global Constraints

- Desktop Homepage has no vertical scroll; mobile may scroll vertically.
- Directory shows Writing, Products, and Papers only.
- Connect and Media remain independent modules and fault boundaries.
- Media is always mounted as one nonwrapping horizontal row.
- `/` is Homepage; `/writing/` is Writing Cover.
- Writing Home control remains available on Cover, post, and book states.

---

### Task 1: Dedicated surface registry and runtime

**Files:**
- Modify: `D_Data/platform/registry/modules.json`
- Modify: `D_Display/platform/shell.mjs`
- Modify: `P_Process/platform/bootstrap.mjs`
- Modify: `P_Process/tests/platform/contracts.test.mjs`
- Modify: `P_Process/tests/platform/runtime.test.mjs`

**Interfaces:**
- Connect uses `entry:"connect"`, `slot:"connect"`, and `health_contract:"connect-frame-v1"`.
- Media uses `entry:"media"`, `slot:"media"`, and `health_contract:"media-rail-v1"`.
- Shell produces `slot('destinations')`, `slot('connect')`, and `slot('media')`.

- [ ] Add failing tests proving only three manifests mount into destinations and Connect/Media use dedicated slots.
- [ ] Run focused Node tests and verify RED against current destination slots.
- [ ] Update registry, shell, and bootstrap dispatch without changing module order.
- [ ] Run focused and full platform tests; verify GREEN.
- [ ] Commit `refactor: route canvas modules to dedicated surfaces`.

### Task 2: Connect frame

**Files:**
- Create: `D_Data/platform/connect/links.json`
- Create: `P_Process/platform/connect/contracts.mjs`
- Create: `I_Input/platform/load_connect.mjs`
- Create: `D_Display/platform/connect/frame.mjs`
- Create: `D_Display/platform/connect/connect.css`
- Create: `P_Process/tests/platform/connect-contracts.test.mjs`
- Modify: `D_Display/platform/index.html`
- Modify: `P_Process/platform/bootstrap.mjs`
- Modify: `D_Display/includes/reader.html`

**Interfaces:**
- `validateConnect(value)` returns frozen bilingual heading/copy and three HTTPS external links.
- `mountConnect({slot,locale,load,emit})` contains load/validation failures inside Connect.

- [ ] Write contract tests for canonical YouTube/Substack/Facebook data and unsafe URL/copy rejection.
- [ ] Verify RED because the Connect contract does not exist.
- [ ] Implement data, validator, loader, accessible frame, CSS, and bootstrap adapter; remove the social card from Writing Cover.
- [ ] Verify contract, locale, and source/build gates GREEN.
- [ ] Commit `feat: restore connect frame on homepage`.

### Task 3: Persistent horizontal Media rail and desktop fit

**Files:**
- Modify: `D_Display/platform/media/panel.mjs`
- Modify: `D_Display/platform/media/media.css`
- Modify: `P_Process/platform/media/controller.mjs`
- Modify: `P_Process/tests/platform/media-controller.test.mjs`
- Modify: `P_Process/tests/platform/media-destination.test.mjs`
- Modify: `D_Display/platform/site.css`
- Modify: `P_Process/platform/bootstrap.mjs`

**Interfaces:**
- Media controller exposes `mount()` and renders once; no disclosure state.
- `.media-playlists` is a nonwrapping flex rail with horizontal overflow and scroll snapping.

- [ ] Replace disclosure tests with failing persistent-mount and one-row rail behavior tests.
- [ ] Verify RED because current Media is hidden and toggle-driven.
- [ ] Remove disclosure code, mount Media at boot, implement compact rail and `100svh` desktop composition; retain mobile vertical flow.
- [ ] Verify Node tests and build GREEN.
- [ ] Commit `feat: show media as horizontal homepage rail`.

### Task 4: Writing Cover Home control

**Files:**
- Modify: `D_Display/includes/canvas/anchor-zone.html`
- Modify: `D_Display/assets/css/modules/anchor-rail.css`
- Modify: `P_Process/tests/test_writing_mount.py`

**Interfaces:**
- `.writing-home-control` is a real link to the site root with house SVG and bilingual accessible label.

- [ ] Add a failing Writing artifact test for the persistent root link and house icon.
- [ ] Verify RED because the anchor footer contains only About.
- [ ] Add the control to the anchor footer and pin it to the bottom-left without coupling it to reader state.
- [ ] Verify Writing build/artifact tests GREEN.
- [ ] Commit `feat: add homepage return to writing cover`.

### Task 5: Acceptance and deployment

**Files:**
- Modify: `P_Process/tests/test_build.py` only if new artifact ownership needs an assertion.

- [ ] Run all source gates, 35+ Python tests, all Node tests, Canvas Store, syntax checks, and a 179+ artifact build.
- [ ] Browser-test desktop at representative laptop viewport: three rows, Connect visible, Media one row, horizontal overflow, and `scrollHeight <= clientHeight`.
- [ ] Browser-test mobile: vertical flow allowed, Media still one horizontal row.
- [ ] Browser-test Writing Cover/post/book Home control and root navigation.
- [ ] Push `HEAD:main`, wait for canonical Validate and Deploy Pages success, then verify the public Homepage and Writing Cover.
