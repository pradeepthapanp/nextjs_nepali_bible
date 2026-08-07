# Music Feature

Architecture-only module for the local hymn/song lyrics feature. **No UI and
no Flutter code has been migrated yet** — this folder defines the contracts
(types, services, queries, stores, hooks, parsers, utils, constants) that the
future Music UI and the Flutter migration will be built on, using the Bible
module (`features/bible/`) as the architectural reference.

**Scope:** song list, song details (reader), categories, artists, favorites,
search, Nepali + Roman lyrics, chords, chord transpose, song collections
(playlists), deep links, copy/share, reading settings.

**Out of scope:** online Songs / streaming audio, albums, queue, mini player,
full player, downloads. (`audioUrl` is retained on the `Song` type because it
is part of the row, but no playback feature is architected here.)

## Folder responsibilities

| Folder | Responsibility | Example |
| --- | --- | --- |
| `components/` | Music-specific UI (NOT implemented — see its README). | SongRow, SongReader, PlaylistCard |
| `hooks/` | Feature behavior composed from stores + queries (what the Flutter "providers"/notifiers did). | `useSongReader`, `usePlaylistActions` |
| `services/` | Data access layer — the future replacement for `SupabaseRepository`'s Music methods. | `SongService.getSongs`, `PlaylistService.fetchPlaylists` |
| `queries/` | TanStack Query hooks + cache keys. Server state lives here, not in stores. | `useSongs`, `usePlaylistSongs` |
| `store/` | Zustand store contracts for ephemeral client UI state (reader context, search flags, settings, category, sort). | `SongSettingsStore`, `SongReaderStore` |
| `types/` | Domain models mapped from the Flutter models (`lib/models/*.dart`). | `Song`, `Artist`, `Playlist`, `MusicDeepLink` |
| `utils/` | Pure, framework-free helpers (no React, no Supabase). | `transposeChord`, `buildMusicUrl`, `capitalizeWords` |
| `parsers/` | Lyrics/chord parsers that turn raw lyric text into a render tree (mirrors Flutter `lib/music/widgets/chord_parser.dart`). | `parseChordLine`, `parseLyrics` |
| `constants/` | Static domain facts (categories, page size, chord scales, defaults, search tuning). | `SONG_CATEGORIES`, `SONG_PAGE_SIZE`, `CHORD_SHARP_SCALE` |

## Data flow (single direction, mirrors Bible)

```
components (future) → hooks → queries → services → Supabase
                          │         │
                          └── store (UI state only)  └── types / parsers / utils / constants
```

- **Server state** (songs, artists, playlists, playlist songs, search
  results) is owned by React Query (`queries/`), keyed in
  `queries/query-keys.ts` (`musicKeys`).
- **Client UI state** (selected category, search flags, reader context,
  reader settings, artist sort) is owned by Zustand (`store/`).
- **Services** are the only layer that touches Supabase; they will replace
  the `SupabaseRepository` Music methods one-for-one during the data-layer
  phase.
- **Parsers / utils / constants** are pure and framework-free, directly
  unit-testable and shared between server and client.

## Capability → module map

| Capability | Where it lives |
| --- | --- |
| Song list (+ infinite scroll) | `SongService.getSongs` (services), `useInfiniteSongs` (queries), `musicKeys.songsByCategory` |
| Categories (filter chips) | `SongCategory` (types), `SONG_CATEGORIES` (constants), `song-category-store` |
| Song details / reader | `SongReaderArgs` + `SongReaderStore` (types/store), `useSongReader`/`useSongNavigation`/`useLyrics`/`useTranspose` (hooks), `SongReader`/`ChordLine` (components, future) |
| Nepali / Roman lyrics | `LyricsLanguage` (types), `lyrics-engine.parseLyrics` (parsers), `useSongSettings` (hooks) |
| Chords (inline + chord chart) | `ChordSegment`/`LyricsLineNode` (types), `parseChordLine` (parsers), `ChordChartSheet` (components, future) |
| Chord transpose | `constants/chords.ts` (scales/bounds), `utils/chord-transposer.ts`, `SongSettingsStore.transpose` |
| Artists (list + detail + sort) | `Artist` (types), `ArtistService` (services), `useArtists`/`useArtist`/`useArtistSongs`, `artist-sort-store` + `useArtistSorting` |
| Favorites | system `Playlist` (`isSystem`), `useFavorites`/`useFavoriteSongs` (queries), `useToggleFavorite` (hooks) |
| Song search | `SongService.searchSongs` (services), `useSearchSongs`/`useInfiniteSongSearch` (queries), `song-search-store` + `useSongSearch` (hooks), `constants/search.ts` |
| Song collections (playlists) | `Playlist`/`PlaylistSong`/`PlaylistWithSongs` (types), `PlaylistService`/`PlaylistSongService` (services), `usePlaylists`/`usePlaylistSongs` (+ mutations), `usePlaylistActions` |
| Deep links | `MusicDeepLink` (types), `utils/deep-link.ts`, `useMusicDeepLink`/`useSongNavigation` (hooks) |
| Copy/share | `utils/song-text.ts` (plain-text extraction); reuses the shared copy/share infra (see below) |
| Reading settings | `SongReaderSettings` (types), `song-settings-store` + `useSongSettings` |

## Flutter page → web module map

| Flutter file | Web home (planned) | Key behavior mapped |
| --- | --- | --- |
| `lib/music/music_display.dart` | `MusicHome` | category chips, debounced search, song list + infinite scroll, playlists popup, drawer |
| `lib/music/music_landed.dart` | `SongReaderPage` | page swiper over a song list; title = `<Category> <number>` (or artist name for `others`); reset transpose on page change |
| `lib/music/music_drawer.dart` | `MusicDrawer` | nav entries: Chords Library, Playlists, Favorites, Artists (Audio Songs is out of scope) |
| `lib/music/artists_page.dart` | `ArtistsPage` + `ArtistDetailPage` | artist list + local search + sort menu; detail header + song list |
| `lib/music/chords_library.dart` | `ChordsLibraryPage` | per-key chord grids, instrument (guitar/ukulele), flat notes, thick strings |
| `lib/music/playlist_view.dart` | `PlaylistsPage` | playlist cards (system badge), create FAB, edit/delete menus |
| `lib/music/playlist_song_page.dart` | `PlaylistSongsPage` | header + reorderable song list, View / Clear All, delete playlist |
| `lib/music/widgets/custom_chords_widget.dart` | `SongReader` | lyrics+chords surface; reads settings + transpose |
| `lib/music/widgets/song_settings_sheet.dart` | `SongSettingsSheet` | language NP/EN, show chords, transpose ±, font size |
| `lib/music/widgets/chord_chart_sheet.dart` | `ChordChartSheet` | guitar chord diagrams (web lib TBD) |
| `lib/music/widgets/playlist_sheet.dart` | `AddToPlaylistSheet` | pick/create playlist, toggle song membership |
| `lib/music/widgets/new_playlist_dialog.dart` | `PlaylistDialog` | create/edit playlist form (name + description) |
| `lib/music/widgets/song_leading_widget.dart` | `SongAvatar` | song-number badge or artist photo for `others` |

Dead / out-of-scope Flutter files: `music_search_display.dart` (fully
commented out — replaced by `AddToPlaylistSheet`), `song_update_page.dart`
and `update_artist_page.dart` (admin-only editing; they back
`SongService.updateSong` / `ArtistService.updateArtist` only).

## Flutter model → web type map

| Flutter model | Web type | Notes |
| --- | --- | --- |
| `models/music.dart` (`Music`) | `types/song.ts` (`Song`) | `Music` renamed to `Song` (domain term; the tables/methods are `songs`/`getSongs`). "Roman lyrics" UI = `translitLyrics`; `romanLyrics` column kept. |
| `models/artist.dart` (`Artist`) | `types/artist.ts` | `Artist.empty()` → `UNKNOWN_ARTIST` constant. |
| `models/playlist.dart` (`Playlist`) | `types/playlist.ts` | `isSystem` = non-deletable (Favorites). |
| `models/playlist_song.dart` (`PlaylistSong`) | `types/playlist-song.ts` | `position` drives reorder. |
| `models/playlist_with_songs.dart` | `types/playlist-song.ts` (`PlaylistWithSongs`) | commented out in Flutter; added for web id-based resolution. |
| `models/music_state.dart` (`MusicState`) | `queries` cache + `store/song-search-store.ts` | `songs`/`hasMore` → React Query; `isSearching`/`searchQuery` → store. |
| `models/music_landed_args.dart` (`MusicLandedArgs`) | `types/navigation.ts` (`SongReaderArgs`) + `SongReaderStore` | web resolves songs from a `songId` deep link instead of a route payload. |
| `models/artist_detail_args.dart` (`ArtistDetailArgs`) | `types/navigation.ts` | web assembles from `useArtist` + `useArtistSongs`. |
| `helpers/enums.dart` (`SongCategory`, `ArtistSort`) | `types/category.ts`, `types/artist.ts` | union types. |
| `providers/music/lyrics_language_provider.dart` (`LyricsLanguage`) | `types/lyrics.ts` | `np`/`en`. |

## Flutter provider/notifier → web hook/store map

| Flutter provider | Web replacement |
| --- | --- |
| `music_provider.dart` (`MusicNotifier`) | `useInfiniteSongs` + `useSearchSongs` (queries), `song-category-store` + `song-search-store` (UI flags) |
| `artists_provider.dart` (`ArtistsNotifier`) | `useArtists` (queries) + `artist-sort-store` + `useArtistSorting` (hooks) |
| `artist_provider.dart` (`ArtistNotifier`) | `useArtist` (queries) |
| `artist_songs_provider.dart` (`ArtistSongsNotifier`) | `useArtistSongs` (queries) |
| `song_category_provider.dart` (`SongCategoryNotifier`) | `song-category-store` |
| `chord_transpose_provider.dart` (`ChordsTransposeNotifier`) | `SongSettingsStore.transpose` |
| `lyrics_language_provider.dart` (`LyricsLanguageNotifier`) | `SongSettingsStore.lyricsLanguage` |
| `show_chord_provider.dart` (`ChordsNotifier`) | `SongSettingsStore.showChords` |
| `playlist_provider.dart` (`PlaylistNotifier`) | `usePlaylists` + `useCreatePlaylist`/`useUpdatePlaylist`/`useDeletePlaylist`/`useClearPlaylist` |
| `playlist_song_provider.dart` (`PlaylistSongNotifier`) | `usePlaylistSongs` + `usePlaylistSongMutations` |
| `settings_provider.dart` (global `fontSize`) | `SongSettingsStore.fontSize` (independent persisted `music.song-settings`) |
| `supabase_repository_provider.dart` (`SupabaseRepository`) | `MusicServices` aggregate (services) |

## Repository method → service map

| SupabaseRepository method | Service method |
| --- | --- |
| `getSongs` / `getSongsByCategory` / `getSongsByArtist` / `searchSongs` / `updateSong` | `SongService.getSongs` / `getSongsByCategory` / `getSongsByArtist` / `searchSongs` / `updateSong` |
| `getAllArtists` / `getArtistById` / `updateArtist` | `ArtistService.getAllArtists` / `getArtistById` / `updateArtist` |
| `fetchPlaylists` / `createPlaylist` / `updatePlaylist` / `deletePlaylist` / `clearPlaylist` / `createFavoritesPlaylist` / `getFavoritesPlaylist` / `upsertPlaylist` | `PlaylistService.*` |
| `fetchPlaylistSongs` / `addSongToPlaylist` / `removeSongFromPlaylist` / `songExistsInPlaylist` / `updatePositions` / `upsertPlaylistSongs` | `PlaylistSongService.*` |

Web-first additions (no Flutter counterpart, marked in code): `getSongById`
(deep-link resolution), `SONG_SEARCH_MIN_QUERY_LENGTH` (search guard),
`TRANSPOSE_MIN`/`TRANSPOSE_MAX` (clamp), `PlaylistWithSongs`.

## Reusable infrastructure from the Bible module

The Music feature reuses shared infrastructure without importing from
`@features/bible/*` (features must not depend on each other — see
`features/README.md`):

| Shared piece | Reused as |
| --- | --- |
| `@/lib/supabase/client` `createClient` | passed into the `MusicServices` factory (like `createBibleServices`) |
| React Query provider + optimistic-mutation pattern | `useHighlightMutations` → playlist/favorites mutations (cancel → snapshot → rollback → invalidate) |
| Query-key hierarchy pattern | `bibleKeys` → `musicKeys` |
| Zustand `persist` pattern | `useReaderSettings` → `SongSettingsStore` (localStorage `music.song-settings`) |
| Deep-link build/parse pattern | `features/bible/utils/deep-link.ts` → `utils/deep-link.ts` + `MusicDeepLink` |
| Navigation single-entry pattern | `use-bible-navigation.goTo` → `useSongNavigation.*` + `useMusicDeepLink` |
| Parser→render-tree pattern | Verse Rendering Engine → `parsers/lyrics-engine.ts` (`LyricsRenderTree`) |
| `@/services/helpers` `unwrap` | shared helper — moved to the top-level `services/` folder (implemented); the Bible module re-exports it, Music imports it directly — no cross-import |
| Reader settings pattern | `useReaderSettings`/`ReaderToolbar` → `useSongSettings`/`SongSettingsSheet` |

**Copy/share note:** the Flutter Music feature itself has no copy/share UI
(the `ShareCopy` helper is Bible-only). The architecture reserves the surface
via `utils/song-text.ts` (`songToPlainText`) and the shared copy/share
infrastructure; a `copySong`/`shareSong` action (mirroring the Bible
`copy`/`share` verse actions) is added when the reader UI is built.

## Routes (deep links, planned in the page phase)

Flutter `app_routes.dart` → proposed web paths (`parseMusicUrl`/`buildMusicUrl`):

| Flutter route | Web path | Deep-link kind |
| --- | --- | --- |
| `/music` | `/music` (and `/music?category=…&q=…`) | `songs` |
| `/music_landed` | `/music/song/{songId}` | `song` |
| `/chords` | `/music/chords` | `chords` |
| `/playlists` | `/music/playlists` | `playlists` |
| `/playlist_songs` | `/music/playlist/{playlistId}` | `playlist` |
| `/artists` | `/music/artists` | `artists` |
| `/artists/artist_details` | `/music/artist/{artistId}` | `artist` |

## No duplicate responsibility

- **One owner per concern**: songs in `song-service`; artists in
  `artist-service`; playlists in `playlist-service`; playlist membership in
  `playlist-song-service`; search reuses `SongService.searchSongs` (kept on
  the song service to match the repository 1:1 — the Bible module split
  search into its own service because Bible search was more complex).
- **Query cache owns server data; stores own UI state only** — songs/artists/
  playlists are cached by React Query, never duplicated in a store.
- **Types are single definitions** re-exported through `types/index.ts`;
  utils/parsers operate on those types and contain no data (data lives in
  `constants/`).

## Implementation status

**Done:**
1. **Data layer** — `SupabaseSongService`, `SupabaseArtistService`,
   `SupabasePlaylistService`, `SupabasePlaylistSongService`, the
   `MusicServices` factory + `getMusicServices`; `unwrap` moved to the shared
   `@/services/helpers` (single source of truth shared with the Bible module).
2. **Pure layer** — `utils/*`, `parsers/*`, `constants/*` fully implemented:
   chord transposer (`transposeChord`/`transposeLyricLine`/`transposeSong`),
   chord line parser, lyrics engine (`parseLyrics`/`splitLyricBlocks`),
   deep-link builder/parser, song text + clipboard formatters, reading
   utilities, category helpers, artist sorting, search normalization /
   tokenization / matching. All pure, framework-free, unit-tested via a
   smoke harness (76 assertions pass).
3. **Query layer** — `queries/*` fully implemented on the `musicKeys`
   hierarchy: `useSongs`/`useInfiniteSongs`/`useSong`,
   `useArtists`/`useArtist`/`useArtistSongs`, `useSearchSongs`/
   `useInfiniteSongSearch`, `usePlaylists`/`usePlaylist`/`usePlaylistSongs`,
   playlist mutations (`useCreatePlaylist`/`useUpdatePlaylist`/
   `useDeletePlaylist`/`useClearPlaylist`), `usePlaylistSongMutations`
   (add/remove/reorder/clear — optimistic like Flutter's fire-and-forget),
   `useFavorites`/`useFavoriteSongs`/`useToggleFavorite`. Cache-key
   hierarchy validated by a smoke harness (20 assertions pass); no direct
   Supabase access (all via services); no duplicate keys/query logic.
4. **Store layer** — `store/*` fully implemented (UI state only): 
   `useSongCategoryStore`, `useSongSearchStore`, `useSongReaderStore`
   (source-based — the song list stays in React Query, never duplicated),
   `useSongSettingsStore` (PERSISTED under `music.song-settings`),
   `useArtistSortStore`, `usePlaylistSelectionStore` (NEW),
   `useReaderNavigationStore` (NEW, pending deep-link context). Only
   reader settings persist (survive restarts); all other state is transient
   UI. Verified by a smoke harness (29 assertions pass, incl. persistence);
   no store holds `Song[]`/`Artist[]`/`Playlist[]` arrays.
5. **Hooks layer** — `hooks/*` fully implemented (behavior, no UI):
   `useSongReader`, `useSongNavigation`, `useSongSearch`, `useSongSettings`,
   `useSongSelection`, `useCategoryFilter`, `useArtistFilter`, `useArtistSorting`,
   `usePlaylistActions`, `useFavoriteSongs` (+ `useIsFavorite`), `useTranspose`,
   `useLyrics`, `useMusicDeepLink`. Each composes stores + queries + pure
   utils only — no direct Supabase, no duplicated parse/transpose/search/
   navigation logic. The four list/song query hooks gained an optional
   `enabled` param (default true) so the reader resolves exactly its source.
   Verified: lint+build pass; reader hooks smoke-tested (15 assertions);
   `pushRecentSearch` pure helper added for recent searches.

**Remaining (future phases):**
6. **Components + pages** — build the components, then the pages and routes.
