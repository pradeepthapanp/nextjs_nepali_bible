/**
 * A song collection / playlist — a direct port of the Flutter `Playlist`
 * model (`lib/models/playlist.dart`, Supabase `playlists` table).
 *
 * Column mapping: id, user_id → userId, name, description,
 * is_public → isPublic, is_system → isSystem, synced, deleted,
 * created_at → createdAt, updated_at → updatedAt.
 *
 * - `isSystem` playlists (e.g. the "Favorites" playlist) are created by the
 *   app and cannot be deleted or renamed.
 * - `synced`/`deleted` are local-offline-sync flags from Flutter; on the web
 *   (always online) they default to `true`/`false` and are retained for
 *   parity with the row schema.
 */
export interface Playlist {
  id: string;
  userId?: string;
  name: string;
  description?: string;
  isPublic: boolean;
  /** System playlists (e.g. Favorites) — non-deletable, non-renamable. */
  isSystem: boolean;
  synced: boolean;
  deleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}
