# Gen Z Essay Word and Blog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a polished illustrated Word edition and publish the complete Vietnamese/English essay pair on the blog under `Nhận thức luận`.

**Architecture:** The Pete Writer Markdown finals remain the content authority. A deterministic python-docx builder creates the Word artifact from the Vietnamese source and shared image assets; the blog receives independent Jekyll source files and copied web assets following the existing post/English pairing contract.

**Tech Stack:** Python 3, python-docx, Jekyll/GitHub Pages, Markdown, existing site validator.

## Global Constraints

- Preserve the full article; do not abbreviate either language.
- Use the existing author credit `Kevin T.N a.k.a Lucis The Lord`.
- Tag the Vietnamese post `Nhận thức luận` and its English metadata `Epistemology`.
- Use the three sourced, non-generated illustrations and retain licensing metadata outside the visible essay body.
- Do not modify routing, book manifests, CSS, or JavaScript.
- Run `python scripts/validate_site.py`, `node --check assets/js/app.js`, and `git diff --check` before commit.

---

### Task 1: Create the Word edition

**Files:**
- Create: `C:/Users/Admin/Desktop/Pete_writer/Projects/outputs/gen-z-mechanism-essay/build_word.py`
- Create: `C:/Users/Admin/Desktop/Pete_writer/Projects/outputs/gen-z-mechanism-essay/Sau-ban-cao-trang-Gen-Z.docx`
- Create for QA only: `C:/Users/Admin/Desktop/Pete_writer/Projects/outputs/gen-z-mechanism-essay/word-render/`

- [ ] Build an A4 narrative essay with explicit typography, margins, title page, running furniture, captions, page numbers, and three illustrations.
- [ ] Render the DOCX to page PNGs with the packaged renderer.
- [ ] Inspect every rendered page for clipping, overlap, bad breaks, and missing glyphs; adjust and re-render if necessary.
- [ ] Run structural heading/image audits and confirm no placeholder text exists.

### Task 2: Add the bilingual blog article

**Files:**
- Create: `_posts/2026-08-04-sau-ban-cao-trang-gen-z.md`
- Create: `_english/sau-ban-cao-trang-gen-z.md`
- Create: `assets/images/sau-ban-cao-trang-gen-z/01-runway.jpg`
- Create: `assets/images/sau-ban-cao-trang-gen-z/02-tokyo-crosswalk.jpg`
- Create: `assets/images/sau-ban-cao-trang-gen-z/03-luddite-1812.jpg`

- [ ] Add exact front matter matching the site's Vietnamese/English pairing pattern.
- [ ] Insert the three illustrations at the same conceptual turns in both languages with localized alt text and captions.
- [ ] Preserve the entire English and Vietnamese bodies and visible author attribution from the approved finals.
- [ ] Run the repository validation gate and a local Jekyll build.
- [ ] Inspect generated article metadata and image references.

### Task 3: Publish

**Files:**
- Modify only the files listed in Task 2 plus this plan.

- [ ] Review the scoped diff and ensure the pre-existing `scripts/__pycache__/` remains untouched.
- [ ] Commit the blog article and assets with an intentional message.
- [ ] Push the current branch to its configured remote.
- [ ] Verify the remote branch contains the new commit.
