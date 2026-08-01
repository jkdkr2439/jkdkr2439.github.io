# Repository operating rules

Read `ARCHITECTURE.md` before changing runtime code, navigation, or content metadata.

## Required gate

Run this before every commit:

```powershell
python scripts/validate_site.py
node --check assets/js/app.js
git diff --check
```

## Ownership boundaries

- Book membership and order: edit only `_data/books.json`, then edit matching post metadata and run the gate.
- Authored text: `_posts/`, `_english/`, `_sources/`.
- Presentation: `_includes/` and `assets/css/`.
- Browser behavior: `assets/js/app.js`.
- Jekyll-to-browser data adapter: `assets/js/post-registry.js`.
- `index.html` must remain a thin shell. Do not move CSS, post data, reader logic, or large markup back into it.

## Forbidden shortcuts

- Do not infer book membership from `tag`, `book_edition`, dates, filenames, or adjacent posts.
- Do not add a second router or a second registry.
- Do not patch generated HTML. Change its owning source module.
- Do not mix presentation changes with content migration unless the task explicitly requires both.
- Do not weaken or bypass `scripts/validate_site.py` to make a change pass.

## Production safety

`jkdkr2439.github.io` is the current production repository. This repository is the parallel replacement. Never mutate, redirect, or archive production as a side effect of work here.
