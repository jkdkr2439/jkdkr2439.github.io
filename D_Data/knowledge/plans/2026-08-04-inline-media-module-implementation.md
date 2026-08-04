# Inline Media Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the four YouTube playlists from Writing into an accessible bilingual Media disclosure below the homepage directory.

**Architecture:** Media is a recursive DIPOD slice: JSON owns facts, a small process adapter validates and transforms them, and a display adapter owns DOM/CSS. The Canvas shell provides a dedicated slot and the destination adapter triggers Media without knowing playlist details.

**Tech Stack:** Native ES modules, DOM APIs, JSON, CSS, Python 3.12 composition gates, Node 22 tests, Jekyll/Ruby 3.2 for Writing.

## Global Constraints

- Writing must no longer render the listening list.
- Media data, process, display, and assets have independent ownership.
- The existing global VI/EN locale drives the open panel.
- The four playlist URLs, order, and channel URL remain unchanged.
- YouTube links open in a new tab with `noopener noreferrer`.
- `/media/` remains reserved; this release renders Media inline.
- A Media error must not break the homepage or another module.
- `prefers-reduced-motion` remains authoritative.

---

### Task 1: Media data contract

**Files:**
- Create: `D_Data/platform/media/playlists.json`
- Create: `P_Process/platform/media/contracts.mjs`
- Create: `P_Process/tests/platform/media-contracts.test.mjs`
- Modify: `D_Data/platform/registry/modules.json`
- Modify: `P_Process/validation/platform.py`

**Interfaces:**
- Produces: `validateMedia(value) -> {ok:boolean, value?:MediaViewModel, code?:string}`.
- `MediaViewModel` contains `heading`, `description`, `channel`, and four immutable playlist records with `id`, `url`, `thumbnail`, and bilingual `name`.

- [ ] Write tests that accept the canonical four records and reject duplicate ids, non-YouTube HTTPS URLs, missing bilingual copy, and unsafe thumbnail paths.
- [ ] Run `node --test P_Process/tests/platform/media-contracts.test.mjs`; verify failure because `contracts.mjs` does not exist.
- [ ] Add the JSON and minimal validator; change Media registry state to `active`, entry to `media`, builder to `canvas`, and health contract to `media-inline-v1`.
- [ ] Run the focused Node test and `python -B -m P_Process.validation.run_all`; verify pass.
- [ ] Commit `feat: add media data contract`.

### Task 2: Media process and display adapter

**Files:**
- Create: `I_Input/platform/load_media.mjs`
- Create: `P_Process/platform/media/controller.mjs`
- Create: `D_Display/platform/media/panel.mjs`
- Create: `P_Process/tests/platform/media-controller.test.mjs`

**Interfaces:**
- Produces: `createMediaController({load, view, locale, emit})` with `toggle()`, `open()`, `close()`, and `isOpen()`.
- Display view exposes `render(model, locale)`, `setExpanded(boolean)`, and `showFailure(code)`.

- [ ] Write a controller test proving first toggle loads once, later toggles reuse data, locale changes rerender, and rejected data is contained as `MEDIA_DATA_INVALID`.
- [ ] Run the focused test; verify failure because the controller module does not exist.
- [ ] Implement the fetch loader, controller, and DOM panel with immutable validated input.
- [ ] Run focused and full platform Node tests; verify pass.
- [ ] Commit `feat: add inline media controller`.

### Task 3: Canvas disclosure integration

**Files:**
- Modify: `D_Display/platform/shell.mjs`
- Modify: `D_Display/platform/destination.mjs`
- Modify: `P_Process/platform/bootstrap.mjs`
- Modify: `D_Display/platform/site.css`
- Create: `P_Process/tests/platform/media-destination.test.mjs`

**Interfaces:**
- Shell adds `slot('media')` below `nav.destinations`.
- Destination mount accepts optional `activate(manifest, link)` and exposes Media as a button-like disclosure with `aria-expanded` and `aria-controls`.

- [ ] Write a destination test proving Media activation toggles the dedicated panel without navigation and updates ARIA state.
- [ ] Run it; verify failure because the current destination adapter treats Media as a planned anchor.
- [ ] Add the Media slot, bootstrap wiring, accessible disclosure behavior, two-column desktop/one-column mobile styles, focus state, and reduced-motion behavior.
- [ ] Run all Node tests and syntax checks; verify pass.
- [ ] Commit `feat: mount media below canvas directory`.

### Task 4: Move Writing-owned content and assets

**Files:**
- Modify: `D_Display/includes/reader.html`
- Modify: `D_Display/assets/css/site.css`
- Move: `D_Display/assets/images/youtube-playlists/*.jpg` to `D_Display/platform/media/assets/`
- Modify: `P_Process/build/compose_site.py`
- Modify: `P_Process/tests/test_build_site.py`

**Interfaces:**
- The composed Canvas artifact resolves Media thumbnails from its own asset directory.
- The Writing artifact contains no `.listening-room` or `.playlist-link` markup.

- [ ] Write build assertions for four Media thumbnails, no Writing listening list, and the presence of the inline Media mount.
- [ ] Run the focused Python test; verify failure while assets and markup retain Writing ownership.
- [ ] Move assets, delete obsolete Writing markup/CSS, and update the compositor mapping.
- [ ] Run Python tests and build to `C:\tmp\blog-canvas-writing-preview`; verify pass.
- [ ] Commit `refactor: move youtube list into media module`.

### Task 5: CI repair, acceptance, and deployment

**Files:**
- Modify only if logs confirm the cause: `.github/workflows/validate.yml`, `.github/workflows/pages.yml`, or `D_Data/config/dependencies/Gemfile.lock`.

**Interfaces:**
- Both `Validate` and `Deploy Pages` must complete successfully for the pushed `main` SHA.

- [ ] Reproduce the `ruby/setup-ruby` failure from public job metadata and inspect dependency files before changing workflow configuration.
- [ ] Add the smallest CI regression check or dependency correction that makes setup deterministic; do not bypass validation.
- [ ] Run 32+ Python tests, all platform Node tests, Canvas Store, syntax checks, `diff --check`, and a 142+ file build.
- [ ] Browser-test Media open/close, VI/EN propagation, four external links, mobile layout, Writing absence, legacy redirect, and console cleanliness.
- [ ] Push `HEAD:main`, wait for both workflows, then fetch `https://jkdkr2439.github.io/` and assert the new identity statement and Media payload are live.
- [ ] Commit CI correction separately if required and record final SHA and workflow URLs.
