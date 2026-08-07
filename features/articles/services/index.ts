import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { ProfileService } from "@/services/profile-service";
import { SupabaseProfileService } from "@/services/profile-service";
import type { UploadService } from "@/services/upload-service";
import { SupabaseUploadService } from "@/services/upload-service";
import type { ArticleService } from "./article-service";
import { SupabaseArticleService } from "./article-service";
import type { CommentService } from "./comment-service";
import { SupabaseCommentService } from "./comment-service";

/**
 * Aggregate of every Articles data service — the single gateway the query
 * layer talks to (mirrors `BibleServices` / `MusicServices` / `SongServices`).
 *
 * `article` and `comment` are Articles-specific; `upload` and `profile` are the
 * SHARED services (`@/services`), reused by every feature. This keeps the
 * dependency graph Shared → Articles (never Articles → another feature).
 */
export interface ArticleServices {
  article: ArticleService;
  comment: CommentService;
  upload: UploadService;
  profile: ProfileService;
}

/**
 * Builds a fresh service aggregate.
 * - Defaults to the browser Supabase client for React Query usage; pass the
 *   server client for Server Components / route handlers.
 * - ALL services (the two Articles services AND the two shared services)
 *   share ONE `SupabaseClient` instance.
 * - The shared `SupabaseUploadService` is created once here and injected into
 *   `SupabaseArticleService` (used for featured-image cleanup on delete) and
 *   exposed on the aggregate.
 */
export function createArticleServices(
  client: SupabaseClient = createClient(),
): ArticleServices {
  const upload = new SupabaseUploadService(client);
  const profile = new SupabaseProfileService(client);
  return {
    article: new SupabaseArticleService(client, upload),
    comment: new SupabaseCommentService(client),
    upload,
    profile,
  };
}

// Lazily-cached singleton for client components (React Query hooks).
let services: ArticleServices | undefined;

/** Returns a memoized service aggregate (safe to call from any hook). */
export function getArticleServices(): ArticleServices {
  if (!services) {
    services = createArticleServices();
  }
  return services;
}

/** Barrel for Articles data services. */
export * from "./article-service";
export * from "./comment-service";
