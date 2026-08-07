import type { SongCategory } from "./category";

/**
 * Deep-link model for sharing / opening Music locations — the web
 * replacement for the Flutter `go_router` routes in `lib/router/app_routes.dart`.
 *
 * Flutter route        → web path (built/parsed by `utils/deep-link.ts`)
 *   /music             → /music                          kind "songs"
 *   /music_landed      → /music/song/{songId}            kind "song"
 *   /chords            → /music/chords                   kind "chords"
 *   /playlists         → /playlists                      kind "playlists"
 *   /playlist_songs    → /playlists/{playlistId}         kind "playlist"
 *   /artists           → /music/artists                  kind "artists"
 *   /artists/artist_details → /music/artist/{artistId}   kind "artist"
 *
 * The song list also supports an optional filter/search surface:
 *   /music?category={category}&q={query}     (kind "songs")
 *   /music/category/{category}               (kind "category" — path form)
 *   /music/search[/?q={query}]               (kind "search" — path form)
 *
 * Unlike Flutter, which passed whole objects through `go_router` `extra`
 * (MusicLandedArgs, ArtistDetailArgs, Playlist), web deep links carry only
 * ids and the reader/playlist pages resolve the objects via React Query.
 */
export type MusicDeepLink =
  | { kind: "songs"; category?: SongCategory; query?: string }
  | { kind: "song"; songId: string }
  | { kind: "category"; category: SongCategory }
  | { kind: "search"; query?: string }
  | { kind: "chords" }
  | { kind: "playlists" }
  | { kind: "playlist"; playlistId: string }
  | { kind: "artists" }
  | { kind: "artist"; artistId: string };
