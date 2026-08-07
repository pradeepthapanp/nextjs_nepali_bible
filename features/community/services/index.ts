import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { ProfileService } from "@/services/profile-service";
import { SupabaseProfileService } from "@/services/profile-service";
import type { UploadService } from "@/services/upload-service";
import { SupabaseUploadService } from "@/services/upload-service";
import type { NoticeService } from "./notice-service";
import { SupabaseNoticeService } from "./notice-service";
import type { PrayerPraysService } from "./prayer-prays-service";
import { SupabasePrayerPraysService } from "./prayer-prays-service";
import type { PrayerReplyService } from "./prayer-reply-service";
import { SupabasePrayerReplyService } from "./prayer-reply-service";
import type { PrayerService } from "./prayer-service";
import { SupabasePrayerService } from "./prayer-service";

/**
 * Aggregate of every Community data service — the single gateway the query
 * layer talks to (mirrors `ArticleServices` / `MusicServices` / `SongServices`).
 *
 * `prayer`, `prays`, `reply` and `notice` are Community-specific; `profile`
 * and `upload` are the SHARED services (`@/services`), reused by every
 * feature. This keeps the dependency graph Shared → Community (never Community
 * → another feature).
 */
export interface CommunityServices {
  prayer: PrayerService;
  prays: PrayerPraysService;
  reply: PrayerReplyService;
  notice: NoticeService;
  profile: ProfileService;
  upload: UploadService;
}

/**
 * Builds a fresh service aggregate.
 * - Defaults to the browser Supabase client for React Query usage; pass the
 *   server client for Server Components / route handlers.
 * - ALL services (the four Community services AND the two shared services)
 *   share ONE `SupabaseClient` instance.
 * - The shared `SupabaseUploadService` is created once here and injected into
 *   `SupabaseNoticeService` (notice image upload/delete) and exposed on the
 *   aggregate; the shared `SupabaseProfileService` (author profiles) is
 *   exposed on the aggregate. NO duplicated upload/profile logic.
 */
export function createCommunityServices(
  client: SupabaseClient = createClient(),
): CommunityServices {
  const upload = new SupabaseUploadService(client);
  const profile = new SupabaseProfileService(client);
  return {
    prayer: new SupabasePrayerService(client),
    prays: new SupabasePrayerPraysService(client),
    reply: new SupabasePrayerReplyService(client),
    notice: new SupabaseNoticeService(client, upload),
    profile,
    upload,
  };
}

// Lazily-cached singleton for client components (React Query hooks).
let services: CommunityServices | undefined;

/** Returns a memoized service aggregate (safe to call from any hook). */
export function getCommunityServices(): CommunityServices {
  if (!services) {
    services = createCommunityServices();
  }
  return services;
}

/** Barrel for Community data services. */
export * from "./prayer-service";
export * from "./prayer-prays-service";
export * from "./prayer-reply-service";
export * from "./notice-service";
