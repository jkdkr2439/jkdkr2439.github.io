# Inline Media Module Design

## Objective

Move the existing YouTube listening list out of Writing and give it to the
Media module. Media renders as an expandable panel below the homepage module
directory. Writing no longer owns or renders this content.

## Ownership and boundaries

- `D_Data/platform/media/` owns playlist records, bilingual labels, channel
  URL, ordering, and thumbnail references.
- `P_Process/platform/media/` loads and validates Media data, then exposes the
  mount contract used by the platform runtime.
- `D_Display/platform/media/` owns Media markup and presentation.
- The platform shell owns only the slot and open/close interaction. It does not
  contain playlist records or Media-specific rendering rules.
- Media thumbnails are Media assets and are not coupled to the Writing build.

This boundary lets the homepage survive a Media failure and lets Media evolve
without increasing the context needed to understand the shell.

## Interaction

The Media directory row behaves as an accessible disclosure control. Activating
it opens or closes a panel directly below the five homepage destinations. The
panel contains the four existing playlists and a link to the YouTube channel.
Playlist links continue to open YouTube in a new tab with safe external-link
attributes.

The panel uses the shared global locale. Vietnamese and English labels update
immediately when the existing VI/EN switch changes. The `/media/` route remains
reserved for a future full Media page; the current release uses the inline
panel as Media's primary surface.

## Layout

On wide screens the playlist cards form a compact two-column grid. On narrow
screens they collapse to one column. The visual language follows the current
Canvas: restrained borders, serif headings, muted metadata, red interaction
accents, and lightweight hover motion. `prefers-reduced-motion` remains
authoritative.

## Data flow

1. Bootstrap loads the platform registry and Media data independently.
2. The destination adapter identifies the Media capability from the registry.
3. Activating Media asks the Media adapter to mount into its dedicated slot.
4. The adapter validates records before passing an immutable view model to the
   renderer.
5. Locale updates rerender text without refetching data.
6. A Media load or validation failure is contained inside the Media slot and is
   emitted through the existing IPOD event stream.

## Migration

The current playlist markup is removed from `D_Display/includes/reader.html`.
Its four thumbnail files and URLs are preserved, but ownership moves to Media.
No duplicate listening list remains in Writing.

## Verification

- Contract tests reject malformed, duplicate, or unsafe Media records.
- Runtime tests prove Media failure does not prevent other modules mounting.
- Locale tests prove one VI/EN update reaches the open Media panel.
- Build validation proves all thumbnail references resolve in the composed
  artifact and Writing no longer contains the listening list.
- Browser acceptance covers disclosure keyboard state, open/close behavior,
  responsive layout, external links, and clean console output.

## Out of scope

- Embedded YouTube playback.
- YouTube API calls or automatic playlist synchronization.
- A standalone `/media/` page.
- Changing the content or order of the four existing playlists.
