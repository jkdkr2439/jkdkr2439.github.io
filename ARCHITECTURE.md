# Danh Nghĩa Hệ — DIPOD architecture

The production blog is treated as a data-to-view compiler, not as one editable page.

## Ownership

- `_posts/`, `_english/`, `_sources/`: authored source data.
- `_data/books.json`: the sole authority for book membership and order.
- `_includes/`: display composition only; no reader state.
- `assets/css/`: presentation only.
- `assets/js/post-registry.js`: build-time Jekyll data adapter.
- `assets/js/app.js`: browser controller and rendering process.
- `scripts/validate_site.py`: pre-build invariant gate.
- `index.html`: a thin composition shell.

## DIPOD flow

1. **Data:** posts, translations, assets and explicit manifests.
2. **Input:** Jekyll converts front matter and manifests into a bounded registry.
3. **Process:** router and readers select known registry entries without inferring membership from tags.
4. **Output:** homepage, article reader, continuous book reader and sidebar.
5. **Data:** URL state and build validation reports. Runtime content is not mutated.

Display is isolated in includes and CSS.

## Non-negotiable invariants

1. A book contains exactly its manifest landing page and ordered manifest chapters.
2. Tags and `book_edition` never grant book membership.
3. Every manifest slug resolves to exactly one Vietnamese post.
4. A slug cannot belong to two books.
5. Chapter order is unique and contiguous within a book.
6. Every route accepted by the reader already exists in the generated registry.
7. The existing production repository remains untouched until this repository passes validation and visual comparison.

## AI editing boundary

An agent changing book membership edits `_data/books.json` and the relevant post together, then runs the validator. An agent changing appearance does not edit registry or routing code. An agent changing routing does not edit authored content.
