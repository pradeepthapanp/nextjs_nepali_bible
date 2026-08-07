import type { SupabaseClient } from "@supabase/supabase-js";
import { unwrap } from "@/services/helpers";
import type { PlaylistSong, Song } from "../types";
import { mapSong } from "./song-service";

/**
 * Playlist↔song membership service — a direct port of the SupabaseRepository
 * `playlist_songs` methods (`fetchPlaylistSongs`, `addSongToPlaylist`,
 * `removeSongFromPlaylist`, `songExistsInPlaylist`, `updatePositions`,
 * `upsertPlaylistSongs`) from
 * `lib/providers/supabase/supabase_repository_provider.dart`.
 *
 * `SupabasePlaylistSongService` uses the existing `playlist_songs` table (no
 * schema changes). Row mapping notes (mirroring Flutter):
 * - `fetchPlaylistSongs` reads `playlist_songs` ordered by `position`, then
 *   resolves the songs with `in("id", …)` and re-orders them to the playlist
 *   order (the Flutter `songMap` reconstruction).
 * - `addSongToPlaylist` computes the next `position` from the current max.
 * - `updatePositions` writes each row's new `position` (playlist reorder).
 */
export interface PlaylistSongService {
  /** The songs of a playlist, in playlist order (replaces `fetchPlaylistSongs`). */
  fetchPlaylistSongs(playlistId: string): Promise<Song[]>;

  /** Append a song to a playlist (replaces `addSongToPlaylist`). */
  addSongToPlaylist(input: {
    playlistId: string;
    songId: string;
  }): Promise<void>;

  /** Remove a song from a playlist (replaces `removeSongFromPlaylist`). */
  removeSongFromPlaylist(input: {
    playlistId: string;
    songId: string;
  }): Promise<void>;

  /** Whether a song is already in a playlist (replaces `songExistsInPlaylist`). */
  songExistsInPlaylist(input: {
    playlistId: string;
    songId: string;
  }): Promise<boolean>;

  /** Rewrite the position of every membership row (replaces `updatePositions`). */
  updatePositions(playlistId: string, songs: PlaylistSong[]): Promise<void>;

  /** Local-sync upsert of many membership rows (replaces `upsertPlaylistSongs`). */
  upsertPlaylistSongs(songs: PlaylistSong[]): Promise<void>;
}

/** A `playlist_songs` row as returned by Supabase (snake_case columns). */
interface PlaylistSongRow {
  playlist_id: string;
  song_id: string;
  position: number;
  synced: boolean;
  deleted: boolean;
  added_at: string | null;
}

/** Maps a `playlist_songs` row to the domain `PlaylistSong`
 * (mirrors `PlaylistSong.fromMap`). */
function mapPlaylistSong(row: PlaylistSongRow): PlaylistSong {
  return {
    playlistId: row.playlist_id,
    songId: row.song_id,
    position: row.position,
    synced: row.synced,
    deleted: row.deleted,
    addedAt: row.added_at ?? undefined,
  };
}

export class SupabasePlaylistSongService implements PlaylistSongService {
  constructor(private readonly client: SupabaseClient) {}

  async fetchPlaylistSongs(playlistId: string): Promise<Song[]> {
    const membershipResponse = await this.client
      .from("playlist_songs")
      .select()
      .eq("playlist_id", playlistId)
      .order("position");
    const membership = unwrap(membershipResponse).map(mapPlaylistSong);
    if (membership.length === 0) return [];

    const songIds = membership.map((row) => row.songId);
    const songsResponse = await this.client
      .from("songs")
      .select()
      .in("id", songIds);
    const songs = unwrap(songsResponse).map(mapSong);

    // Preserve the playlist order (the Flutter `songMap` reconstruction).
    const songMap = new Map(songs.map((song) => [song.id, song]));
    return membership
      .map((row) => songMap.get(row.songId))
      .filter((song): song is Song => song !== undefined);
  }

  async addSongToPlaylist(input: {
    playlistId: string;
    songId: string;
  }): Promise<void> {
    const { playlistId, songId } = input;
    const lastResponse = await this.client
      .from("playlist_songs")
      .select("position")
      .eq("playlist_id", playlistId)
      .order("position", { ascending: false })
      .limit(1);
    const last = unwrap(lastResponse) as { position: number }[];
    const nextPosition = last.length === 0 ? 0 : last[0].position + 1;

    const response = await this.client
      .from("playlist_songs")
      .insert({ playlist_id: playlistId, song_id: songId, position: nextPosition });
    unwrap(response);
  }

  async removeSongFromPlaylist(input: {
    playlistId: string;
    songId: string;
  }): Promise<void> {
    const { playlistId, songId } = input;
    const response = await this.client
      .from("playlist_songs")
      .delete()
      .eq("playlist_id", playlistId)
      .eq("song_id", songId);
    unwrap(response);
  }

  async songExistsInPlaylist(input: {
    playlistId: string;
    songId: string;
  }): Promise<boolean> {
    const { playlistId, songId } = input;
    const response = await this.client
      .from("playlist_songs")
      .select("song_id")
      .eq("playlist_id", playlistId)
      .eq("song_id", songId)
      .maybeSingle();
    const row = unwrap(response) as { song_id: string } | null;
    return row !== null;
  }

  async updatePositions(
    playlistId: string,
    songs: PlaylistSong[],
  ): Promise<void> {
    await Promise.all(
      songs.map((song, index) =>
        this.client
          .from("playlist_songs")
          .update({ position: index })
          .eq("playlist_id", playlistId)
          .eq("song_id", song.songId)
          .then((response) => {
            unwrap(response);
          }),
      ),
    );
  }

  async upsertPlaylistSongs(songs: PlaylistSong[]): Promise<void> {
    if (songs.length === 0) return;
    const response = await this.client
      .from("playlist_songs")
      .upsert(
        songs.map((song) => ({
          playlist_id: song.playlistId,
          song_id: song.songId,
          position: song.position,
          added_at: song.addedAt ?? null,
        })),
        { onConflict: "playlist_id,song_id" },
      );
    unwrap(response);
  }
}
