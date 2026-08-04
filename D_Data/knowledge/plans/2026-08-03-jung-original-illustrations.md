# Jung Original Illustrations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore all eleven Project Gutenberg illustrations to the bilingual Jung reader with identical images in the Vietnamese and English cells.

**Architecture:** Copy the canonical Gutenberg JPEGs into one book-owned asset directory, then place semantic paired figures directly in the posts that own the corresponding source markers. Extend the existing stylesheet only for figure presentation and add a focused source-level regression test; do not add a new registry or reader behavior.

**Tech Stack:** Jekyll/Liquid, HTML, CSS, Python `unittest`, GitHub Pages.

## Global Constraints

- Use all eleven files from Project Gutenberg ebook 65903.
- Store assets under `assets/images/tam-ly-hoc-vo-thuc/`; never hotlink.
- Render the same uncropped image in both language cells with bilingual captions.
- Preserve source order and textual placement.
- Do not alter translated prose or reader routing.

---

### Task 1: Lock the illustration contract

**Files:**
- Create: `scripts/test_jung_illustrations.py`

**Interfaces:**
- Consumes: the eleven canonical image filenames and Jung post sources.
- Produces: regression checks for asset inventory, paired placement, local URLs, and figure count.

- [ ] Write a failing `unittest` asserting all eleven asset files exist, every asset is referenced in a `jung-figure` row containing two image elements, and no `gutenberg.org` image URL appears in Jung posts.
- [ ] Run `python -m unittest scripts.test_jung_illustrations -v` and confirm failure because assets and markup are absent.
- [ ] Keep the test source-controlled with `git add -f` because repository ignore rules omit general Python files.

### Task 2: Acquire and validate canonical assets

**Files:**
- Create: `assets/images/tam-ly-hoc-vo-thuc/i_frontispiece.jpg`
- Create: `assets/images/tam-ly-hoc-vo-thuc/title.jpg`
- Create: `assets/images/tam-ly-hoc-vo-thuc/i_229.jpg`
- Create: `assets/images/tam-ly-hoc-vo-thuc/i_238.jpg`
- Create: `assets/images/tam-ly-hoc-vo-thuc/i_269fp.jpg`
- Create: `assets/images/tam-ly-hoc-vo-thuc/i_278fp.jpg`
- Create: `assets/images/tam-ly-hoc-vo-thuc/i_294fp.jpg`
- Create: `assets/images/tam-ly-hoc-vo-thuc/i_380fp.jpg`
- Create: `assets/images/tam-ly-hoc-vo-thuc/i_383fp.jpg`
- Create: `assets/images/tam-ly-hoc-vo-thuc/i_410fp.jpg`
- Create: `assets/images/tam-ly-hoc-vo-thuc/i_481.jpg`

**Interfaces:**
- Consumes: `https://www.gutenberg.org/files/65903/65903-h/images/<filename>`.
- Produces: eleven non-empty JPEG files whose MIME signature begins with `FF D8 FF`.

- [ ] Download each exact filename into the book asset directory.
- [ ] Verify file count is eleven and every file has a JPEG signature and non-zero dimensions.

### Task 3: Restore paired figures at source positions

**Files:**
- Modify: `_posts/2026-08-03-tam-ly-hoc-vo-thuc.md`
- Modify: matching `_posts/2026-08-03-jung-*.md` chapter files determined by the eleven source markers.

**Interfaces:**
- Consumes: source marker order from `jung_65903_source.txt` and local assets from Task 2.
- Produces: exactly eleven `<div class="parallel-row jung-figure">` blocks, each with two linked copies of one image and VI/EN captions.

- [ ] Map every Gutenberg figure to the paragraph boundary represented by its plain-text marker.
- [ ] Insert the frontispiece and title image in the landing page, and each of the remaining nine in its owning chapter.
- [ ] Use local `/assets/images/tam-ly-hoc-vo-thuc/<filename>` links, descriptive `alt` text in each language, `loading="lazy"` except for the frontispiece, and `target="_blank" rel="noopener"` on full-size links.
- [ ] Run `python -m unittest scripts.test_jung_illustrations -v` and confirm all contract checks pass.

### Task 4: Style and publish

**Files:**
- Modify: `assets/css/site.css`

**Interfaces:**
- Consumes: `.parallel-row.jung-figure`, `figure`, image links, and `figcaption` markup.
- Produces: balanced uncropped desktop figures and readable stacked mobile figures.

- [ ] Add scoped styles for equal cell padding, centered images, `max-width: 100%`, `height: auto`, restrained borders, and matching caption typography.
- [ ] Run `python -m unittest scripts.test_jung_illustrations -v`, `python scripts/validate_site.py`, `node --check assets/js/app.js`, and `git diff --check`.
- [ ] Commit implementation, push `main`, and require a successful GitHub Pages deployment.
- [ ] Verify live DOM contains eleven figure rows and twenty-two local image elements with successful image loads.
