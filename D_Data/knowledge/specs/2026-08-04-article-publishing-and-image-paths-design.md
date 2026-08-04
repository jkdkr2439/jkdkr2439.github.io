# Article publishing and Writing image-path design

## Goal

Give an agent one explicit, repeatable path for adding an article and its media
without editing generated output, while fixing the current production failure in
which canonical `/assets/images/...` references resolve against the Site Canvas
instead of the Writing mount at `/writing/`.

## Ownership

- Vietnamese article source: `D_Data/content/posts/`.
- Optional English counterpart: `D_Data/content/english/`.
- Article media: `D_Data/media/assets/images/<article-slug>/`.
- Book membership and order: `D_Data/manifests/books.json` only.
- Publication guidance and templates: `D_Data/knowledge/runbooks/` and
  `D_Data/knowledge/templates/`.
- Source checks, article preparation, build, and publication operations:
  `P_Process/`.
- Canonical-to-Jekyll path translation: `I_Input/`.

Generated Jekyll inputs and deployed HTML are outputs. They are never edited as
the source of a fix.

## Canonical article contract

An ordinary Vietnamese post is a dated Markdown file named
`YYYY-MM-DD-<slug>.md`. Its front matter must contain the fields already required
by the Writing registry. An English counterpart uses `<slug>.md` and declares
the same identity expected by the bilingual reader. Images use repository-local
canonical URLs under `/assets/images/<slug>/...`.

The canonical URL deliberately does not contain `/writing/`. Mount position is
a deployment concern and must not leak into authored Data.

## Compile-time media translation

The Writing build owns one deterministic translation boundary:

1. Read canonical content without changing its bytes.
2. Stage it in an ephemeral Jekyll workspace.
3. Translate root-local media references from `/assets/...` to the configured
   Writing base path, currently `/writing/assets/...`, in staged content only.
4. Leave external URLs, anchors, data URLs, and already-prefixed Writing URLs
   unchanged.
5. Build and validate the artifact.

The translation must cover Markdown image syntax and HTML `src`/`href` media
references used by existing posts. It must be idempotent and bounded to local
asset paths.

## Image integrity gate

A source gate extracts local image references from both Vietnamese and English
content and maps `/assets/images/...` back to
`D_Data/media/assets/images/...`. Publication fails when a referenced file is
missing, escapes the owned media directory, or differs only by an invalid path
case on case-sensitive deployment systems.

An artifact gate verifies that compiled Writing pages reference the Writing
mount and that every sampled or enumerated local image URL exists in the built
artifact. This prevents a green build with production 404s.

## Agent runbook

`D_Data/knowledge/runbooks/PUBLISH_ARTICLE.md` is the single human/agent entry
point. It documents:

1. choose a slug and article class;
2. copy the appropriate template;
3. add Vietnamese content and optional English content;
4. place images under the matching media directory;
5. update the book manifest only when applicable;
6. run the preparation command;
7. inspect the sandbox report and preview;
8. run verification;
9. commit and deploy as a separate, explicit action.

The runbook links to templates instead of duplicating front-matter contracts.

## `publish_article` preparation command

The command is an agent-facing preparation tool, not an automatic production
publisher. It accepts an existing Vietnamese source file or slug, discovers the
optional English counterpart and owned image directory, then:

- validates naming, front matter, bilingual linkage, and image references;
- stages and builds Writing in an ephemeral sandbox;
- runs source and relevant artifact gates;
- emits an IPOD-shaped report under `O_Output/reports/` containing Input,
  Process, Output, and Data-feedback sections;
- exits nonzero without mutating canonical Data when any gate fails.

It does not commit, push, delete, rename, download, or silently repair content.
Those actions require a separate user-authorized workflow.

## Failure behavior

Errors identify the owning layer and exact source reference. Examples include a
missing image, duplicate slug, absent required metadata, orphan English file,
manifest mismatch, unsafe path, failed Jekyll build, or compiled image URL that
does not exist. The last successful deployment remains untouched.

## Tests and acceptance

- A regression test proves a canonical `/assets/images/...` reference compiles
  to `/writing/assets/images/...` while the source file remains byte-identical.
- Tests cover Markdown images, HTML `img src`, linked full-size images, external
  URLs, already-prefixed URLs, and idempotence.
- A missing local image makes the source gate and `publish_article` fail with
  the exact article and path.
- Existing source, Writing, Canvas, artifact, and platform suites remain green.
- A production smoke check returns HTTP 200 for representative article images
  and confirms no article image still requests the root `/assets/images/` path.

## Non-goals

- No CMS or web editor.
- No automatic translation or image generation.
- No automatic Git commit, push, or production deployment.
- No rewrite of canonical article bodies solely to encode the Writing mount.
