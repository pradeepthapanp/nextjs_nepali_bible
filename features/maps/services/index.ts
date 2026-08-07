import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { MapService } from "./map-service";
import { SupabaseMapService } from "./map-service";

/**
 * Aggregate of every Maps data service — the single gateway the query layer
 * talks to (mirrors `ArticleServices` / `MusicServices` / `SongServices`).
 *
 * Maps needs ONLY the map service (read-only public content — no upload or
 * profile services), so the aggregate is a single member. It shares ONE
 * `SupabaseClient` instance.
 */
export interface MapServices {
  map: MapService;
}

/**
 * Builds a fresh service aggregate.
 * - Defaults to the browser Supabase client for React Query usage; pass the
 *   server client for Server Components / route handlers.
 */
export function createMapServices(
  client: SupabaseClient = createClient(),
): MapServices {
  return {
    map: new SupabaseMapService(client),
  };
}

// Lazily-cached singleton for client components (React Query hooks).
let services: MapServices | undefined;

/** Returns a memoized service aggregate (safe to call from any hook). */
export function getMapServices(): MapServices {
  if (!services) {
    services = createMapServices();
  }
  return services;
}

/** Barrel for Maps data services. */
export * from "./map-service";
