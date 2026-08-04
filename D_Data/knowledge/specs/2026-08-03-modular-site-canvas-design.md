# Modular Site Canvas Design

## Goal

Replace the monolithic expanding sidebar with an AI-maintainable site canvas composed of independently owned zones and modules. The first visible result is a stable domain anchor rail, a contextual navigation panel, and the existing content stage.

## Architectural model

The blog keeps its existing system-level DIPOD data flow and applies recursive IPOD contracts inside every UI module.

### System DIPOD

1. **Data:** posts, translations, assets, `_data/books.json`, and `_data/canvas.json`.
2. **Input:** Jekyll registry data, URL state, trusted reader actions, interface language, and viewport.
3. **Process:** the existing router selects content while the canvas store and orchestrator select modules and zones.
4. **Output:** anchor rail, contextual navigation, and content stage.
5. **Data:** reconstructable URL state, persisted presentation preferences, and validation reports. Authored content is never mutated at runtime.

### Module IPOD

Every module declares:

- **Input:** accepted state fields and registry resources.
- **Process:** its bounded transformation and rendering behavior.
- **Output:** its owned DOM and declared canvas events.
- **Dependencies:** allowed registry, store, zone, and viewport contracts.

Modules must not query, mutate, or style another module's internals.

## Canvas zones

The desktop canvas has three explicit zones:

1. `anchor`: a stable 176-pixel domain rail containing top-level cognitive domains.
2. `context`: a 272-pixel panel containing only the navigation tree for the active domain.
3. `stage`: the remaining width containing the existing homepage, article reader, continuous book reader, and about view.

The context zone can be collapsed. The anchor zone remains visible on desktop. Below the mobile breakpoint, both navigation zones become one accessible drawer while the stage occupies the viewport.

## Initial modules

### Knowledge Domains

- Owns only top-level domains such as Basic Epistemology, Power, Criticism, Machine Intelligence, Existential, Epistemology, Self Narrative, Literary Mischief, and Translation.
- Emits `canvas.select-domain` with a manifest-owned domain key.
- Never renders posts, books, or chapters.

### Context Tree

- Receives the active domain key.
- Renders only that domain's posts, subcategories, books, and chapters.
- Reuses existing `show-home`, `show-post`, `show-book`, and `show-about` actions.
- Emits `canvas.toggle-context` only for its own panel state.

### Content Stage

- Hosts the existing `_includes/reader.html` without changing post or book rendering in the first migration.
- Owns no navigation data.
- Continues to use the current post registry and reader router.

## Data authority

`_data/canvas.json` is the sole authority for zone definitions, module registration, domain order, bilingual domain labels, and the mapping from a domain key to its context source.

`_data/books.json` remains the sole authority for book membership and chapter order. Canvas data may reference a book key but must never reproduce a book's chapter list.

Posts and existing metadata remain the authority for authored content and non-book post classification.

## Runtime contracts

The initial state shape is:

```js
{
  domain: "translation",
  contextCollapsed: false,
  language: "vi"
}
```

The domain is serialized as the optional `domain` query parameter alongside the existing `post` or `book` route. Opening a post or book derives and activates its owning domain when no valid domain is supplied. The context-collapse preference may use local storage because it affects presentation only.

Allowed canvas events are:

- `canvas.select-domain(domainKey)`
- `canvas.toggle-context()`
- `canvas.sync-route(route)`
- `canvas.set-language(language)`

The existing content actions remain the only route-changing actions.

## Physical ownership

```text
_data/canvas.json
_includes/canvas/shell.html
_includes/canvas/anchor-zone.html
_includes/canvas/context-zone.html
_includes/canvas/stage-zone.html
assets/css/canvas.css
assets/css/modules/anchor-rail.css
assets/css/modules/context-tree.css
assets/js/canvas/registry.js
assets/js/canvas/store.js
assets/js/canvas/contracts.js
assets/js/canvas/orchestrator.js
assets/js/modules/anchor-rail.js
assets/js/modules/context-tree.js
scripts/validate_canvas.py
```

`index.html` remains a thin composition shell. Existing `assets/js/app.js` remains the content router during this phase and may call only the canvas public API; canvas modules may call existing route actions only through declared data actions.

## AI editing boundary

- A layout change edits canvas shell or canvas CSS, not content modules.
- A domain-order or domain-label change edits `_data/canvas.json`.
- A context-tree presentation change edits only the Context Tree module.
- A content-route change edits `app.js`, not canvas layout.
- A book-membership change edits `_data/books.json`, never canvas data.
- Every module file begins with its IPOD contract and allowed dependencies.

This reduces the context an agent must load: the architecture contract, the relevant manifest entry, and one module boundary.

## Migration and compatibility

- The current sidebar markup is decomposed, not duplicated.
- Existing links and `data-action` values remain valid.
- Existing `?post=` and `?book=` URLs continue to work.
- The home, about, post, and continuous-book views must remain visually and behaviorally equivalent inside the stage.
- No authored post, translation, book manifest, or post registry schema changes in this phase.

## Verification

- Contract tests validate canvas schema, unique zone and module ownership, declared dependencies, and valid domain context sources.
- DOM tests validate that every context item belongs to exactly one domain and that only the active domain panel is visible.
- Router regression tests validate existing route actions and URL reconstruction.
- Responsive checks cover wide desktop, compact desktop, tablet, and mobile drawer behavior.
- Repository gates and GitHub Pages build must pass before deployment.

## Rollback

The immutable pre-canvas clone is `C:\Users\Admin\Desktop\jkdkr2439.github.io-backup-before-canvas` at commit `2e7e16e`. The migration is also committed in bounded steps so individual layers can be reverted without restoring the whole backup.
