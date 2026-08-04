# Blog agent entrypoint

This repository is a DIPOD data-to-view compiler. Before changing anything:

1. Read `D_Data/identity/site.json` and `D_Data/identity/principles.md`.
2. Read `D_Data/contracts/source-map.json`.
3. Locate the owning domain and read its `IPOD.md`.
4. Modify only the canonical owner; never patch generated HTML.
5. Run `python -B -m P_Process.validation.run_all` and the owning tests.
6. Publish only a verified generated artifact.

The public root is a platform, not the Writing implementation. Global identity,
locale, registry, lifecycle, and legacy routing belong to the Site Canvas.
Posts, books, sidebar behavior, and the reader belong to Writing at `/writing/`.
Never fix a Writing problem by adding module-specific branches to the platform.

For every new article, translation, chapter, or article image, follow
`D_Data/knowledge/runbooks/PUBLISH_ARTICLE.md` before editing canonical Data.

## Ownership

- Canonical content, media, manifests, config, identity, and knowledge: `D_Data/`
- Boundary translation and Jekyll staging: `I_Input/`
- Validation, tests, tools, build, and publishing: `P_Process/`
- Output contracts, fixtures, reports, and evidence: `O_Output/`
- Layouts, includes, CSS, JavaScript, and pages: `D_Display/`
- Shared browser runtime kernel: `P_Process/platform/`
- Minimal root shell and registry projection: `D_Display/platform/`
- GitHub validation and Pages deployment: `.github/`

## Non-negotiable rules

- Book membership and order come only from `D_Data/manifests/books.json`.
- Canvas placement comes only from `D_Data/manifests/canvas.json`.
- A gate audits and reports; it does not silently repair its input.
- Authored content bytes do not change during architecture or presentation work.
- Tokens never enter remotes, files, logs, fixtures, or workflows.
- When ownership is unclear, return to identity and contracts instead of guessing.
