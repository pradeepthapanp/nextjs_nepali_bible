import type { SupabaseClient } from "@supabase/supabase-js";
import { unwrap } from "@/services/helpers";
import type { Playlist } from "../types";

/**
 * Playlist (song collection) service — a direct port of the SupabaseRepository
 * playlist methods (`fetchPlaylists`, `createPlaylist`, `updatePlaylist`,
 * `deletePlaylist`, `clearPlaylist`, `createFavoritesPlaylist`,
 * `getFavoritesPlaylist`, `upsertPlaylist`) from
 * `lib/providers/supabase/supabase_repository_provider.dart`.
 *
 * `SupabasePlaylistService` uses the existing `playlists` table (no schema
 * changes). All methods are user-scoped (the current session's `user_id`);
 * unauthenticated callers get an empty list / null / a "User not signed in"
 * error — the web equivalent of Flutter's `currentUser?.id == null`
 * short-circuits and `currentUser!.id` null-checks.
 */
export interface PlaylistService {
  /** The current user's playlists (replaces `fetchPlaylists`). */
  fetchPlaylists(): Promise<Playlist[]>;

  /** Create a playlist (replaces `createPlaylist`). */
  createPlaylist(input: {
    name: string;
    description?: string;
  }): Promise<Playlist>;

  /** Update a playlist's name/description (replaces `updatePlaylist`). */
  updatePlaylist(playlist: Playlist): Promise<void>;

  /** Delete a playlist (replaces `deletePlaylist`). */
  deletePlaylist(playlistId: string): Promise<void>;

  /** Remove every song from a playlist (replaces `clearPlaylist`). */
  clearPlaylist(playlistId: string): Promise<void>;

  /** Create the system "Favorites" playlist (replaces `createFavoritesPlaylist`). */
  createFavoritesPlaylist(): Promise<string>;

  /** The system "Favorites" playlist, or null (replaces `getFavoritesPlaylist`). */
  getFavoritesPlaylist(): Promise<Playlist | null>;

  /** Local-sync upsert (replaces `upsertPlaylist`; web is always online). */
  upsertPlaylist(playlist: Playlist): Promise<void>;
}

/** A `playlists` row as returned by Supabase (snake_case columns). */
interface PlaylistRow {
  id: string;
  user_id: string | null;
  name: string;
  description: string | null;
  is_public: boolean;
  is_system: boolean;
  synced: boolean;
  deleted: boolean;
  created_at: string | null;
  updated_at: string | null;
}

/**
 * Maps a `playlists` row to the domain `Playlist` (mirrors
 * `Playlist.fromMap`). Flutter's `_parseBool` handles the int 0/1 encoding of
 * the local SQLite store; the web reads booleans straight from Supabase, so
 * the row booleans are used directly.
 */
function mapPlaylist(row: PlaylistRow): Playlist {
  return {
    id: row.id,
    userId: row.user_id ?? undefined,
    name: row.name,
    description: row.description ?? undefined,
    isPublic: row.is_public,
    isSystem: row.is_system,
    synced: row.synced,
    deleted: row.deleted,
    createdAt: row.created_at ?? undefined,
    updatedAt: row.updated_at ?? undefined,
  };
}

export class SupabasePlaylistService implements PlaylistService {
  constructor(private readonly client: SupabaseClient) {}

  /** The signed-in user id, or null (the web equivalent of `currentUser`). */
  private async currentUserId(): Promise<string | null> {
    const { data } = await this.client.auth.getSession();
    return data.session?.user.id ?? null;
  }

  /** The signed-in user id, throwing when signed out (like `currentUser!`). */
  private async requireUserId(): Promise<string> {
    const userId = await this.currentUserId();
    if (!userId) throw new Error("User not signed in");
    return userId;
  }

  async fetchPlaylists(): Promise<Playlist[]> {
    const userId = await this.currentUserId();
    if (!userId) return [];
    const response = await this.client
      .from("playlists")
      .select()
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    return unwrap(response).map(mapPlaylist);
  }

  async createPlaylist(input: {
    name: string;
    description?: string;
  }): Promise<Playlist> {
    const userId = await this.requireUserId();
    const response = await this.client
      .from("playlists")
      .insert({
        user_id: userId,
        name: input.name,
        description: input.description ?? null,
      })
      .select()
      .single();
    return mapPlaylist(unwrap(response));
  }

  async updatePlaylist(playlist: Playlist): Promise<void> {
    const response = await this.client
      .from("playlists")
      .update({
        name: playlist.name,
        description: playlist.description ?? null,
      })
      .eq("id", playlist.id);
    unwrap(response);
  }

  async deletePlaylist(playlistId: string): Promise<void> {
    const response = await this.client
      .from("playlists")
      .delete()
      .eq("id", playlistId);
    unwrap(response);
  }

  async clearPlaylist(playlistId: string): Promise<void> {
    const response = await this.client
      .from("playlist_songs")
      .delete()
      .eq("playlist_id", playlistId);
    unwrap(response);
  }

  async createFavoritesPlaylist(): Promise<string> {
    const userId = await this.requireUserId();
    const response = await this.client
      .from("playlists")
      .insert({
        user_id: userId,
        name: "Favorites",
        description: "Your favorite songs",
        is_system: true,
      })
      .select("id")
      .single();
    const row = unwrap(response) as { id: string };
    return row.id;
  }

  async getFavoritesPlaylist(): Promise<Playlist | null> {
    const userId = await this.currentUserId();
    if (!userId) return null;
    const response = await this.client
      .from("playlists")
      .select()
      .eq("user_id", userId)
      .eq("is_system", true)
      .maybeSingle();
    const row = unwrap(response) as PlaylistRow | null;
    return row ? mapPlaylist(row) : null;
  }

  async upsertPlaylist(playlist: Playlist): Promise<void> {
    const userId = await this.requireUserId();
    const response = await this.client
      .from("playlists")
      .upsert(
        {
          id: playlist.id,
          user_id: userId,
          name: playlist.name,
          description: playlist.description ?? null,
          is_public: playlist.isPublic,
          is_system: playlist.isSystem,
          created_at: playlist.createdAt ?? null,
          updated_at: playlist.updatedAt ?? null,
        },
        { onConflict: "id" },
      );
    unwrap(response);
  }
}
