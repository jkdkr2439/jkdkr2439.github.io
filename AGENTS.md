# Blog agent entrypoint

This repository is a DIPOD data-to-view compiler. Before changing anything:

1. Read `D_Data/identity/site.json` and `D_Data/identity/principles.md`.
2. Read `D_Data/contracts/source-map.json`.
3. Locate the owning domain and read its `IPOD.md`.
4. Modify only the canonical owner; never patch generated HTML.
5. Run `python -B -m P_Process.validation.run_all` and the owning tests.
6. Publish only a verified generated artifact.

## Ownership

- Canonical content, media, manifests, config, identity, and knowledge: `D_Data/`
- Boundary translation and Jekyll staging: `I_Input/`
- Validation, tests, tools, build, and publishing: `P_Process/`
- Output contracts, fixtures, reports, and evidence: `O_Output/`
- Layouts, includes, CSS, JavaScript, and pages: `D_Display/`
- GitHub validation and Pages deployment: `.github/`

## Non-negotiable rules

- Book membership and order come only from `D_Data/manifests/books.json`.
- Canvas placement comes only from `D_Data/manifests/canvas.json`.
- A gate audits and reports; it does not silently repair its input.
- Authored content bytes do not change during architecture or presentation work.
- Tokens never enter remotes, files, logs, fixtures, or workflows.
- When ownership is unclear, return to identity and contracts instead of guessing.
