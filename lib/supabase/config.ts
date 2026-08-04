/**
 * Supabase configuration.
 *
 * Reads the public Supabase credentials from the environment. Values come from
 * `.env.local` / platform env vars (see `.env.example`).
 *
 * Note: the values are read lazily (module scope) but **do not throw** at import
 * time, so the app can still be built/rendered before credentials are supplied.
 * `getSupabaseEnv()` is the guard used by the client factories; the provider
 * checks `isSupabaseConfigured` before constructing a client in the browser.
 */

export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
} as const;

/** Whether the Supabase credentials have been provided in the environment. */
export const isSupabaseConfigured =
  supabaseConfig.url.length > 0 && supabaseConfig.anonKey.length > 0;

/**
 * Returns the validated Supabase config, throwing a clear error if the required
 * environment variables are missing. Used by server / middleware client
 * factories where credentials are always expected.
 */
export function getSupabaseEnv() {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment (see .env.example).",
    );
  }
  return supabaseConfig;
}
