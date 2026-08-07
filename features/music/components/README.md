# Music UI components (implemented)

Reusable presentational components for the Music feature. **No pages, no
routes and no data fetching live here** — this folder is the web counterpart of
`features/bible/components/`: every component receives already-parsed data /
nodes and delegates interaction via callbacks.

Conventions (same as the Bible module):

- **No parsing, no fetching** — lyric components receive an already-parsed
  `LyricsRenderTree` (from `features/music/parsers`); list components receive
  `Song`/`Artist`/`Playlist` objects from hooks.
- **Delegation via callbacks** — `onOpen`, `onAddToPlaylist`, `onToggle`,
  `onSort`, `onSubmit`, … Components hold no data.
- **Reuse over duplication** — components reuse the shared design system
  (`@/components/ui/*`: `Button`, `Card`, `Avatar`, `EmptyState`,
  `ErrorState`, `LoadingState`, `ConfirmDialog`, `SearchInput`, `Input`,
  `Label`, `Spinner`) and the feature behavior hooks (`useSongSettings`,
  `useFavoriteSongs`, `usePlaylistActions`, …). Chord transpose, clipboard,
  search and parser logic is never re-implemented inside a component.
- **Accessible** — real `<button>`s, `aria-label`/`aria-pressed`/`role`,
  keyboard focusable, responsive Tailwind layouts.

## Folder layout

| Folder | Contents |
| --- | --- |
| `context/` | `LyricsRenderContext` + `LyricsRenderProvider` + `renderInlineChildren` (mirrors the Bible `VerseRenderProvider` pattern) |
| `registry/` | `createLyricsRendererRegistry({showChords, onChordTap})` — maps parsed lyric nodes to elements; a default registry is installed at barrel import |
| `song/` | `SongMeta`, `FavoriteButton`, `SongListItem`, `SongCard`, `SongGridItem` |
| `category/` | `CategoryChip`, `CategorySelector` |
| `artist/` | `ArtistCard`, `ArtistList`, `ArtistSelector` |
| `lyrics/` | `LyricsView`, `LyricsLine`, `ChordText`, `ChordLine`, `ChordBadge`, `TransposeIndicator` |
| `reader/` | `SongReader`, `SongHeader`, `SongToolbar`, `ReaderNavigation`, `ReaderProgress`, `ReaderFooter` |
| `playlist/` | `PlaylistCard`, `PlaylistList`, `PlaylistSelector`, `AddToPlaylistDialog` |
| `search/` | `SearchBar`, `SearchFilters`, `SearchResultCard`, `SearchResults` |
| `dialogs/` | `DialogPanel`, `SongOptionsDialog`, `PlaylistDialog`, `DeletePlaylistDialog` |

## Key contracts

- **`SongReader({ tree, showChords?, onChordTap?, className? })`** — takes an
  already-parsed `LyricsRenderTree`; builds a renderer registry via
  `createLyricsRendererRegistry` and wraps the output in `LyricsRenderProvider`.
  It **never parses lyrics**.
- **`ChordLine({ segments, onChordTap?, className? })`** — takes
  `ChordSegment[]` and renders each as `ChordText` (or a plain span). It
  **never transposes chords**.
- **`TransposeIndicator({ transpose, className? })`** — display-only:
  renders `formatTranspose(transpose)` (`+2`, `0`, `-3`, …).
- **`SongToolbar`** — uses the existing `useSongSettings()` behavior hook for
  language NP/EN, show-chords, transpose ± and font size.
- **`PlaylistDialog`** — create/edit form (`mode` prop), local form state,
  `onSubmit({name, description?})`.
- **`DeletePlaylistDialog`** — reuses the shared `ConfirmDialog`
  (`variant="destructive"`).
- **`SongOptionsDialog`** — menu of provided action callbacks (copy/share/
  add-to-playlist/favorite); the parent composes clipboard via
  `songToClipboardText` + the shared `@/utils/clipboard` helper and favorites
  via `useFavoriteSongs`.
- **`AddToPlaylistDialog`** — pick a playlist / create one via callbacks.

## Component → Flutter widget map

| Component | Replaces (Flutter) | Consumes |
| --- | --- | --- |
| `SongListItem` / `SongCard` / `SongGridItem` | the song `ListTile` / cards in `music_display.dart` + `song_leading_widget.dart` (number badge, or artist photo for `others` songs) | `Song`, artist `photoUrl`, `onOpen`, `onAddToPlaylist`, favorite state |
| `CategoryChip` / `CategorySelector` | the horizontal `SongCategory` chips in `music_display.dart` | `SongCategory` + selection callback |
| `SearchBar` | the debounced search `TextField` in `music_display.dart` | value + `onValueChange` (debounce lives in `useSongSearch`) |
| `SearchFilters` / `SearchResults` / `SearchResultCard` | the filtered results list in `music_display.dart` | categories/selection; songs + loading/error/empty states |
| `SongHeader` | the title + Key/Beat chips in `custom_chords_widget.dart` | `LyricsRenderTree` header |
| `ChordLine` | the chord/lyric pair `Wrap` in `custom_chords_widget.dart` | `ChordSegment[]` |
| `SongReader` | `custom_chords_widget.dart` — lyrics+chords surface (tap a chord → chord chart sheet) | `LyricsRenderTree`, `onChordTap` |
| `SongToolbar` | `song_settings_sheet.dart` — language NP/EN, show chords, transpose ±, font size | `useSongSettings` |
| `TransposeIndicator` | the transpose `Text` in `song_settings_sheet.dart` | a transpose value |
| `ChordBadge` | the Key/Beat chips in `custom_chords_widget.dart` | a label + value |
| `ArtistCard` / `ArtistList` / `ArtistSelector` | `ArtistListItem` in `artists_page.dart` (photo, name, song count) | `Artist`, songCount, `onOpen` |
| `PlaylistCard` / `PlaylistList` / `PlaylistSelector` | the playlist tiles in `playlist_view.dart` (system badge, song count, edit/delete) | `Playlist`, songCount, callbacks |
| `AddToPlaylistDialog` | `playlist_sheet.dart` — pick a playlist / create one | playlists + `onToggleSong` |
| `PlaylistDialog` | `new_playlist_dialog.dart` — create/edit playlist form | `onSubmit({name, description})` |
| `DeletePlaylistDialog` | the delete confirmation in `playlist_view.dart` | `playlist`, `onConfirm` |
| `SongOptionsDialog` | a long-press/options menu on a song | `Song` + action callbacks |

`EmptyState` / `ErrorState` / `LoadingState` used across the music feature are
the shared `@/components/ui/*` primitives (not duplicated here).

## Pages (NOT built here — later phases)

| Page | Replaces (Flutter) | Composition |
| --- | --- | --- |
| `MusicHome` | `music_display.dart` | `CategorySelector` + `SearchBar` + song list + playlists |
| `SongReaderPage` | `music_landed.dart` | page swiper of `SongReader` + `SongToolbar` |
| `ArtistsPage` | `artists_page.dart` | `ArtistList` + search + sort menu |
| `ArtistDetailPage` | artist detail in `artists_page.dart` | `ArtistCard` header + `SongListItem` list |
| `PlaylistsPage` | `playlist_view.dart` | `PlaylistList` + `PlaylistDialog`/`DeletePlaylistDialog` |
| `PlaylistSongsPage` | `playlist_song_page.dart` | playlist song rows + `AddToPlaylistDialog` |
| `ChordsLibraryPage` | `chords_library.dart` | `ChordBadge` grids + instrument/flat/string toggles |
| `MusicDrawer` | `music_drawer.dart` | navigation entries (Chords, Playlists, Favorites, Artists) |

Out of scope (do NOT build): `music_search_display.dart` (dead/commented
code — replaced by `AddToPlaylistDialog`), `song_update_page.dart` and
`update_artist_page.dart` (admin-only song/artist editing).
