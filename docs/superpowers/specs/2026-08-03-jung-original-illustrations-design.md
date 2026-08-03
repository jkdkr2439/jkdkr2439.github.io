# Jung Original Illustrations Design

## Goal

Restore all eleven illustrations carried by Project Gutenberg ebook 65903 to the bilingual blog edition of *Psychology of the Unconscious*, preserving source order and balanced Vietnamese-English presentation.

## Source and provenance

- The canonical image source is Project Gutenberg's illustrated HTML edition at `https://www.gutenberg.org/files/65903/65903-h/65903-h.htm`.
- The complete image inventory contains eleven files: the frontispiece, title-page image, and nine illustrations embedded in the body.
- Files are copied into the repository under `assets/images/tam-ly-hoc-vo-thuc/`; the reader must not depend on external hotlinks.
- Images remain unaltered apart from browser scaling. No generated or decorative substitutes are introduced.

## Placement and bilingual layout

- Each image is restored at the textual location represented by its `[Illustration]` marker in the Gutenberg plain-text source.
- The landing page contains the frontispiece and title-page image.
- Each body illustration appears in the chapter owning its source marker.
- Every illustration occupies one normal parallel reader row. The Vietnamese cell and English cell each display the same source image at the same width and aspect ratio.
- The Vietnamese cell carries a faithful Vietnamese caption; the English cell preserves the original English caption. An image without a printed caption receives only a concise functional label needed for accessibility.
- Clicking either copy opens the original-size local asset in a new browser tab.

## Presentation

- Images use `max-width: 100%`, `height: auto`, and `object-fit: contain`; they are never cropped.
- Both cells share identical figure spacing, border treatment, caption typography, and maximum display height so later text resumes on an even baseline.
- On narrow screens the existing parallel-row collapse is retained; each language cell remains self-contained.

## Data flow and ownership

- Gutenberg HTML and the plain-text source establish inventory, captions, and source order.
- Local image assets are publication inputs owned by `assets/images/tam-ly-hoc-vo-thuc/`.
- Book content owns placement through the existing post files. No second image registry or reader router is added.
- A focused validation test checks the eleven expected local files, their eleven paired figure rows, and the absence of Gutenberg image hotlinks.

## Failure handling and verification

- Download failure, a non-image response, a missing asset, duplicate placement, or an unmatched illustration marker stops publication.
- Repository gates must pass: `python scripts/validate_site.py`, `node --check assets/js/app.js`, and `git diff --check`.
- GitHub Pages must build successfully.
- Live verification must confirm eleven paired figure rows, twenty-two rendered image elements, valid local URLs, balanced dimensions, and working full-size links.

## Scope boundary

This change restores the original 1916 image program only. It does not add new artwork, redesign the book reader, alter the translation, or modernize the historical illustrations.
