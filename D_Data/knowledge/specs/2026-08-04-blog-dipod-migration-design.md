# Blog DIPOD/IPOD Migration Design

**Date:** 2026-08-04

**Status:** Approved for implementation planning

## Purpose

Restructure `jkdkr2439.github.io` as a blog system that an AI coding agent can understand, extend, and debug without loading the whole repository into context. The source branch expresses the system through DIPOD ownership boundaries; recursive IPOD contracts describe each module. The published branch contains generated website artifacts only.

This migration changes source organization and build mechanics. It must not intentionally change published URLs, authored content, book membership, reader behavior, or visual presentation.

## Repository topology

The `main` branch has no more than six source directories and two human/agent entry files at its root. Git metadata is not counted as source topology.

```text
.
|-- D_Data/
|-- I_Input/
|-- P_Process/
|-- O_Output/
|-- D_Display/
|-- .github/
|-- AGENTS.md
`-- README.md
```

Generated deployment artifacts live on `gh-pages`; they are not committed to `main`.

## Root entry files

### `AGENTS.md`

`AGENTS.md` is the mandatory machine entrypoint. It tells an agent to:

1. read the site identity and invariants;
2. locate the owning DIPOD domain;
3. read that domain's local IPOD contract;
4. modify only the owning source;
5. run the domain gate and repository gate;
6. publish only generated artifacts.

It must not duplicate detailed contracts that already have an owner.

### `README.md`

`README.md` is the mandatory human entrypoint. It explains the topology, local commands, publication flow, and recovery path. It links to canonical documents instead of duplicating them.

## DIPOD ownership

### `D_Data`

Canonical stable and evolving data:

```text
D_Data/
|-- identity/
|   |-- site.yaml
|   `-- principles.md
|-- content/
|   |-- posts/
|   |-- english/
|   `-- sources/
|-- media/
|-- manifests/
|   |-- books.json
|   `-- canvas.json
|-- config/
|   |-- jekyll.yml
|   `-- dependencies/
|       `-- Gemfile
|-- contracts/
`-- knowledge/
    |-- specs/
    `-- plans/
```

Content, media, configuration, manifests, schemas, identity anchors, and planning knowledge have one canonical location here. Runtime code must not silently rewrite canonical data.

### `I_Input`

Adapters that translate canonical data into bounded process inputs:

- Jekyll front-matter and collection adapters;
- manifest loaders;
- registry generation;
- schema validation at the system boundary.

Input code may normalize representations but must preserve source meaning and report rejected inputs explicitly.

### `P_Process`

Deterministic transformations and gates:

```text
P_Process/
|-- build/
|-- routing/
|-- readers/
|-- validation/
|-- publishing/
|-- tests/
`-- tools/
```

The process owns staging, compilation, routing decisions, readers, validation, tests, and publication orchestration. A gate audits and reports; it never silently repairs the artifact it judges.

### `O_Output`

Output contracts, schemas, fixtures, reports, and local evidence:

```text
O_Output/
|-- contracts/
|-- fixtures/
|-- reports/
`-- evidence/
```

The deployable site itself is ephemeral on `main` and published to `gh-pages`. Local builds use an OS temporary directory or an explicitly supplied output directory, preventing generated files from polluting source control.

### `D_Display`

Display composition and browser presentation:

```text
D_Display/
|-- layouts/
|-- includes/
|-- styles/
|-- browser/
|-- assets/
`-- modules/
```

Display modules own DOM, CSS, layout, and declared presentation state. They consume registries and events through contracts; they do not reach into another module's internals.

### `.github`

GitHub-only automation. It contains workflows that validate `main`, build in a temporary staging workspace, and publish the verified artifact to `gh-pages`.

## Recursive IPOD contract

Every non-trivial domain and module contains a concise `IPOD.md` when its behavior is not obvious from its public interface. The contract states:

- **Input:** accepted data, state, events, and dependencies;
- **Process:** bounded transformations and forbidden side effects;
- **Output:** artifacts, DOM, events, reports, or state owned by the module;
- **Data feedback:** logs, validation evidence, and learning records written after execution.

IPOD contracts are added at the smallest boundary that materially reduces context. They are not copied into every leaf folder.

## Build and publication flow

```text
D_Data + I_Input + D_Display
            |
            v
P_Process/build creates a temporary Jekyll staging tree
            |
            v
P_Process/validation checks sources and staged ownership
            |
            v
Jekyll builds a static artifact
            |
            v
P_Process/validation compares output invariants
            |
            v
GitHub Actions publishes the artifact to gh-pages
            |
            v
O_Output receives reports and evidence, not canonical content
```

The staging adapter maps DIPOD sources to Jekyll's required conventional paths such as `_posts`, `_layouts`, `_includes`, `_data`, `assets`, `_config.yml`, and `Gemfile`. Jekyll conventions therefore remain an implementation detail rather than the source topology.

## Compatibility invariants

Migration is accepted only when all of these remain true:

1. Every previously valid public route still resolves.
2. Vietnamese and English article slugs remain unchanged.
3. Book membership and chapter order remain manifest-controlled.
4. The existing router remains the sole content-route authority.
5. The Canvas registry remains the sole display-placement authority.
6. No generated HTML is patched directly.
7. Canonical authored content and media checksums remain unchanged unless a separately approved content task changes them.
8. The generated site passes current validators and new topology contracts.
9. A failed build cannot mutate `main` or replace the last successful deployment.

## Migration strategy

Use a parallel, reversible migration inside one feature branch:

1. inventory current source ownership and capture a route/content baseline;
2. add topology and mapping contracts before moving files;
3. build a staging adapter that reproduces the current Jekyll tree;
4. move one ownership domain at a time while keeping tests green;
5. compare old and new generated artifacts by route, content identity, asset references, and structural invariants;
6. add GitHub Actions validation and `gh-pages` publication only after local equivalence passes;
7. change GitHub Pages source only after a successful deployment candidate exists.

No product module is added during this migration. Products become a later domain extension after the new topology is proven.

## Error handling and recovery

- Missing or invalid canonical data fails before Jekyll runs.
- Staging collisions fail with both owning source paths in the report.
- Unknown routes fail registry validation.
- Broken asset references fail artifact validation.
- Deployment runs only from a verified commit and uses GitHub's deployment concurrency guard.
- The current production commit remains recoverable by Git tag and the previous Pages deployment remains live until replacement succeeds.
- When an agent cannot determine ownership, it returns to `D_Data/identity`, then repository contracts, rather than guessing.

## Test strategy

The migration adds five gates:

1. **Topology gate:** root folder/file limits and ownership rules.
2. **Source gate:** manifests, front matter, slugs, and asset references.
3. **Staging gate:** exact mapping from DIPOD sources to Jekyll inputs.
4. **Artifact gate:** route inventory, registry integrity, content identity, and required DOM structure.
5. **Deployment gate:** clean build from a fresh checkout and publication only from the verified artifact.

Existing validators remain active until their behavior is covered by the new owning modules. Tests are moved with their owning process rather than deleted or weakened.

## Security constraints

- Repository tokens are never embedded in remotes, source files, logs, or workflows.
- Workflows use the narrow GitHub-provided token permissions required for Pages deployment.
- Authored HTML and metadata cross an explicit input boundary before rendering.
- External links and asset paths are validated before publication.
- Secrets are not available to pull-request builds from untrusted forks.

## Completion criteria

The migration is complete when:

- `main` has exactly the approved six source directories and two entry files;
- a fresh clone can validate and build using documented commands;
- the artifact equivalence gates pass against the pre-migration baseline;
- GitHub Pages serves the verified `gh-pages` artifact;
- agent instructions can locate every canonical source and owner without scanning the whole repository;
- the old root topology is absent and no compatibility shim remains without an explicit expiry contract.
