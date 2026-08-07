import type { SupabaseClient } from "@supabase/supabase-js";
import { unwrap } from "@/services/helpers";
import type { Artist } from "../types";

/**
 * Artist service — a direct port of the SupabaseRepository artist methods
 * (`getAllArtists`, `getArtistById`, `updateArtist`) from
 * `lib/providers/supabase/supabase_repository_provider.dart`.
 *
 * `SupabaseArtistService` uses the existing `artists` table (no schema
 * changes). Row mapping notes (mirroring Flutter):
 * - `getAllArtists` selects all `artists` rows ordered by `name`; the client
 *   sort (`ArtistSort`) is applied locally by `useArtistSorting` — the same
 *   as `ArtistsNotifier.sortArtists`.
 * - `updateArtist` is admin-only (backing `update_artist_page.dart`).
 */
export interface ArtistService {
  /** Every artist, ordered by name (replaces `getAllArtists`). */
  getAllArtists(): Promise<Artist[]>;

  /** A single artist by id, or null (replaces `getArtistById`). */
  getArtistById(id: string): Promise<Artist | null>;

  /** Admin only: persist an artist edit (replaces `updateArtist`). */
  updateArtist(artist: Artist): Promise<void>;
}

/** An `artists` row as returned by Supabase (snake_case columns). */
interface ArtistRow {
  id: string;
  name: string;
  description: string | null;
  photo_url: string | null;
  last_updated: string;
}

/** Maps an `artists` row to the domain `Artist` (mirrors `Artist.fromJson`). */
function mapArtist(row: ArtistRow): Artist {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    photoUrl: row.photo_url ?? undefined,
    lastUpdated: row.last_updated,
  };
}

/** The write payload of `updateArtist` (mirrors `Artist.toJson`). */
function artistToJson(artist: Artist) {
  return {
    id: artist.id,
    name: artist.name,
    description: artist.description ?? null,
    photo_url: artist.photoUrl ?? null,
    last_updated: artist.lastUpdated,
  };
}

export class SupabaseArtistService implements ArtistService {
  constructor(private readonly client: SupabaseClient) {}

  async getAllArtists(): Promise<Artist[]> {
    const response = await this.client.from("artists").select().order("name");
    return unwrap(response).map(mapArtist);
  }

  async getArtistById(id: string): Promise<Artist | null> {
    const response = await this.client
      .from("artists")
      .select()
      .eq("id", id)
      .maybeSingle();
    const row = unwrap(response) as ArtistRow | null;
    return row ? mapArtist(row) : null;
  }

  async updateArtist(artist: Artist): Promise<void> {
    const response = await this.client
      .from("artists")
      .update(artistToJson(artist))
      .eq("id", artist.id);
    unwrap(response);
  }
}
