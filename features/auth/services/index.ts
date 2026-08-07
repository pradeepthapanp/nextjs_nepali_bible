import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { ProfileService } from "@/services/profile-service";
import { SupabaseProfileService } from "@/services/profile-service";
import type { UploadService } from "@/services/upload-service";
import { SupabaseUploadService } from "@/services/upload-service";
import type { AuthService } from "./auth-service";
import { SupabaseAuthService } from "./auth-service";

/**
 * Aggregate of every Authentication data service — the single gateway the
 * auth layer talks to.
 *
 * `auth` is the feature-local `AuthService`; `profile` and `upload` are the
 * SHARED services (`@/services`) — the auth feature REUSES them, never
 * duplicates them. All three share ONE `SupabaseClient` instance (the
 * `@supabase/ssr` browser client by default).
 */
export interface AuthServices {
  auth: AuthService;
  profile: ProfileService;
  upload: UploadService;
}

/**
 * Builds a fresh service aggregate.
 * - Defaults to the browser Supabase client (`@supabase/ssr`) for client
 *   usage; pass the server client (`@/lib/supabase/server`) for Server
 *   Components / route handlers / middleware guards.
 * - The shared `SupabaseUploadService` is created once here and injected into
 *   `SupabaseAuthService` (used by `uploadAvatar`), and exposed on the
 *   aggregate.
 */
export function createAuthServices(
  client: SupabaseClient = createClient(),
): AuthServices {
  const upload = new SupabaseUploadService(client);
  const profile = new SupabaseProfileService(client);
  return {
    auth: new SupabaseAuthService(client, upload),
    profile,
    upload,
  };
}

// Lazily-cached singleton for client components.
let services: AuthServices | undefined;

/** Returns a memoized service aggregate (safe to call from any hook). */
export function getAuthServices(): AuthServices {
  if (!services) {
    services = createAuthServices();
  }
  return services;
}

/** Barrel for Authentication data services. */
export * from "./auth-service";
