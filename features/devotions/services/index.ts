/**
 * Barrel for the Devotions service layer.
 *
 *   devotion-service.ts  DevotionService + mapDevotion + DevotionRow
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { DevotionService } from "./devotion-service";

export { DevotionService, mapDevotion, type DevotionRow } from "./devotion-service";

/** The Devotions service aggregate. */
export interface DevotionServices {
  devotion: DevotionService;
}

/** Builds the Devotions services on ONE shared `@supabase/ssr` browser client. */
export function createDevotionServices(
  client: SupabaseClient = createClient(),
): DevotionServices {
  return { devotion: new DevotionService(client) };
}

let singleton: DevotionServices | undefined;

/** The memoized Devotions services singleton. */
export function getDevotionServices(): DevotionServices {
  if (!singleton) singleton = createDevotionServices();
  return singleton;
}
