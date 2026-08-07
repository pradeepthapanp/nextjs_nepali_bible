/**
 * An artist (song composer/singer) — a direct port of the Flutter `Artist`
 * model (`lib/models/artist.dart`, Supabase `artists` table).
 *
 * Column mapping: id, name, description, photo_url → photoUrl,
 * last_updated → lastUpdated.
 *
 * The web equivalent of `Artist.empty()` is the `UNKNOWN_ARTIST` constant in
 * `features/music/constants/defaults.ts`.
 */
export interface Artist {
  id: string;
  name: string;
  description?: string;
  photoUrl?: string;
  /** ISO timestamp; used by the admin sort (Last Added) and update checks. */
  lastUpdated: string;
}

/**
 * Artist list ordering — a direct port of the Flutter `ArtistSort` enum
 * (`lib/helpers/enums.dart`). `nameAsc` is the default.
 */
export type ArtistSort =
  | "nameAsc"
  | "nameDesc"
  | "lastUpdatedAsc"
  | "lastUpdatedDesc";
