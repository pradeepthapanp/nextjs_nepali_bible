import type { Artist } from "./artist";
import type { SongCategory } from "./category";
import type { Song } from "./song";

/**
 * In-memory navigation args — literal ports of the Flutter go_router `extra`
 * payloads (`lib/models/music_landed_args.dart`, `lib/models/artist_detail_args.dart`).
 *
 * On the web these object-payloads are NOT passed through routes (URLs carry
 * only ids). They are retained as types because:
 * - `SongReaderArgs` is the state shape of the Song Reader store
 *   (`features/music/store/song-reader-store.ts`): a SOURCE context (where
 *   the reader was opened from) plus the open position. The song list is
 *   resolved from the React Query cache for that source — it is never passed
 *   or stored, so server data is not duplicated.
 * - `ArtistDetailArgs` documents what the Artist Detail page needs; it is
 *   assembled from `useArtist` + `useArtistSongs` instead of a route payload.
 */

/** Where the Song Reader was opened from (replaces `MusicLandedArgs.songs`). */
export type SongReaderSource =
  | { type: "song"; songId: string }
  | { type: "category"; category: SongCategory }
  | { type: "search"; query: string }
  | { type: "playlist"; playlistId: string }
  | { type: "artist"; artistId: string };

/** Current Song Reader context (replaces `MusicLandedArgs`). */
export interface SongReaderArgs {
  source: SongReaderSource;
  songPosition: number;
}

/** Artist Detail page data (replaces `ArtistDetailArgs`). */
export interface ArtistDetailArgs {
  artist: Artist;
  songs: Song[];
}
