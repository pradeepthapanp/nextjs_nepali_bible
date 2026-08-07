import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { ProfileService } from "@/services/profile-service";
import { SupabaseProfileService } from "@/services/profile-service";
import type { SongService } from "./song-service";
import { SupabaseSongService } from "./song-service";
import type { UploadService } from "@/services/upload-service";
import { SupabaseUploadService } from "@/services/upload-service";

/**
 * Aggregate of every Online Songs data service — the single gateway the query
 * layer talks to (mirrors `MusicServices` / `BibleServices`).
 *
 * `upload` and `profile` are the SHARED services (from `@/services`), reused
 * by every feature; only `song` is Songs-specific. This keeps the dependency
 * graph Shared → Songs (never Songs → another feature).
 */
export interface SongServices {
  song: SongService;
  upload: UploadService;
  profile: ProfileService;
}

/**
 * Builds a fresh service aggregate.
 * - Defaults to the browser Supabase client for React Query usage; pass the
 *   server client for Server Components / route handlers.
 * - All three services share ONE `SupabaseClient` instance.
 */
export function createSongServices(
  client: SupabaseClient = createClient(),
): SongServices {
  return {
    song: new SupabaseSongService(client),
    upload: new SupabaseUploadService(client),
    profile: new SupabaseProfileService(client),
  };
}

// Lazily-cached singleton for client components (React Query hooks).
let services: SongServices | undefined;

/** Returns a memoized service aggregate (safe to call from any hook). */
export function getSongServices(): SongServices {
  if (!services) {
    services = createSongServices();
  }
  return services;
}

/** Barrel for Online Songs data services. */
export * from "./song-service";
