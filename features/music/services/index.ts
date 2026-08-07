import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { ArtistService } from "./artist-service";
import { SupabaseArtistService } from "./artist-service";
import type { PlaylistService } from "./playlist-service";
import { SupabasePlaylistService } from "./playlist-service";
import type { PlaylistSongService } from "./playlist-song-service";
import { SupabasePlaylistSongService } from "./playlist-song-service";
import type { SongService } from "./song-service";
import { SupabaseSongService } from "./song-service";

/**
 * Aggregate of every Music data service — the single gateway the query layer
 * (and, later, Server Components) talk to. Mirrors the Bible module's
 * `BibleServices` aggregate (`features/bible/services/index.ts`): one way to
 * obtain services and one place to swap implementations.
 */
export interface MusicServices {
  song: SongService;
  artist: ArtistService;
  playlist: PlaylistService;
  playlistSong: PlaylistSongService;
}

/**
 * Builds a fresh service aggregate.
 * - Defaults to the browser Supabase client (`@/lib/supabase/client`, an
 *   `@supabase/ssr` client) for React Query usage; pass the server client
 *   (`@/lib/supabase/server`) for Server Components / route handlers.
 * - All four services share ONE `SupabaseClient` instance — no duplicated
 *   clients.
 */
export function createMusicServices(
  client: SupabaseClient = createClient(),
): MusicServices {
  return {
    song: new SupabaseSongService(client),
    artist: new SupabaseArtistService(client),
    playlist: new SupabasePlaylistService(client),
    playlistSong: new SupabasePlaylistSongService(client),
  };
}

// Lazily-cached singleton for client components (React Query hooks).
let services: MusicServices | undefined;

/** Returns a memoized service aggregate (safe to call from any hook). */
export function getMusicServices(): MusicServices {
  if (!services) {
    services = createMusicServices();
  }
  return services;
}

/** Barrel for Music data services. */
export * from "./song-service";
export * from "./artist-service";
export * from "./playlist-service";
export * from "./playlist-song-service";
