# Connect Frame and Media Rail Design

## Objective

Recompose the root Canvas so a desktop visitor never needs to scroll
vertically. Remove Media and Connect from the destination directory, restore
the legacy connection frame as a first-class Canvas surface, and show the four
YouTube playlists in one horizontal rail directly below it.

## Surface names and return navigation

The root route `/` is the **Homepage**. The Writing landing surface at
`/writing/` is the **Writing Cover** and must not be described as another
homepage in code, copy, plans, or reports.

Writing provides a persistent Home control at the bottom-left edge of its
navigation rail. The control uses a recognizable house icon, has bilingual
accessible text, and links to `/`. It remains available on the Writing Cover,
individual posts, and book views so every deep Writing state has a direct route
back to the Homepage. This is platform navigation, not authored content.

## Desktop composition

The root Canvas remains a two-column ground inside exactly `100svh`:

- Left: identity, bilingual statement, and the shared VI/EN control.
- Right: three destination rows only: Writing, Products, and Papers.
- Below the three rows: the Connect frame.
- Directly below Connect: one horizontal Media rail.
- Bottom: the existing runtime status footer.

The desktop root prevents vertical overflow. Spacing and type use viewport-aware
clamps so the complete composition fits supported laptop and desktop heights.
The Media rail may scroll horizontally and must not wrap to a second row.

## Mobile composition

At the existing mobile breakpoint the root returns to normal document flow.
Vertical scrolling is allowed. The Media rail remains one horizontal row with
touch scrolling rather than becoming a vertical list.

## Module ownership

The directory renderer excludes manifests whose surface is owned elsewhere.
Writing, Products, and Papers remain destination rows. Connect and Media remain
independent registry modules but declare dedicated `frame` and `rail` entries.

- `D_Data/platform/connect/` owns bilingual connection labels and external URLs.
- `D_Display/platform/connect/` owns the connection frame markup and styles.
- `P_Process/platform/connect/` validates and mounts the frame.
- Existing Media JSON and validation continue to own the playlist facts.
- `D_Display/platform/media/` changes from disclosure panel to persistent rail.
- The shell provides `connect` and `media` slots; it contains no domain data.

Connect and Media failures remain isolated. A failure in either surface must not
prevent identity or the three destination rows from rendering.

## Connect frame

The frame reuses the connection content from the former Writing homepage:
identity/contact copy plus YouTube and Facebook links. Links use accessible
names, visible focus states, HTTPS, and `noopener noreferrer` when opened in a
new tab. The visual treatment is adapted to the Canvas rather than copying
Writing-specific layout dependencies.

## Media rail

All four playlist cards are always mounted and visible as one logical row.
Each card contains thumbnail, ordinal, bilingual name, and external-link cue.
The rail uses `display:flex`, nonshrinking cards, `overflow-x:auto`, scroll
snapping, and hidden or restrained scrollbar styling without removing keyboard
access. No disclosure control or vertical card grid remains.

## Routes and locale

`/media/` redirects to `/#media`; bootstrap focuses/reveals the rail without
requiring a toggle. `/connect/` redirects to `/#connect`. Both surfaces use the
same global locale subscription as identity and Writing.

## Verification

- Registry tests prove exactly three destination rows and two dedicated
  surfaces are mounted from five manifests.
- Connect contract tests reject unsafe URLs and incomplete bilingual copy.
- Media tests prove four cards mount persistently in one rail.
- Browser acceptance at desktop asserts `scrollHeight <= clientHeight` and
  horizontal Media overflow with no wrapped cards.
- Mobile acceptance allows vertical overflow and retains a one-row touch rail.
- Route, locale, external-link, image-loading, fault isolation, Writing absence,
  build, and live Pages checks remain green.
- Writing browser acceptance proves the bottom-left Home control is visible on
  Cover, post, and book states and returns to `/`.

## Out of scope

- Adding new social networks or changing existing URLs.
- Embedded YouTube playback.
- A standalone Media or Connect page.
- Redesigning Writing, Products, or Papers.
