import type { Playlist } from "./playlist";
import type { Song } from "./song";

/**
 * A playlist↔song membership row — a direct port of the Flutter
 * `PlaylistSong` model (`lib/models/playlist_song.dart`, Supabase
 * `playlist_songs` table).
 *
 * Column mapping: playlist_id → playlistId, song_id → songId, position,
 * synced, deleted, added_at → addedAt.
 */
export interface PlaylistSong {
  playlistId: string;
  songId: string;
  /** 0-based ordering within the playlist; drives `updatePositions`. */
  position: number;
  synced: boolean;
  deleted: boolean;
  addedAt?: string;
}

/**
 * A playlist with its songs already resolved and ordered — the web
 * equivalent of the commented-out Flutter `PlaylistWithSongs`
 * (`lib/models/playlist_with_songs.dart`). Needed because web deep links
 * carry only a `playlistId` and the songs must be resolved from the server
 * (Flutter passed the whole `Playlist` object via `go_router` `extra`).
 */
export interface PlaylistWithSongs {
  playlist: Playlist;
  songs: Song[];
}
