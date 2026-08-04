import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/supabase/config";

let browserClient: SupabaseClient | null = null;

/**
 * Creates (and memoizes) the Supabase client used in **Client Components**.
 *
 * `createBrowserClient` from `@supabase/ssr` already caches a single instance
 * per URL/key pair at module scope; the local `browserClient` guard makes the
 * memoization explicit and cheap to call from anywhere in the client tree.
 *
 * The return type is explicitly `SupabaseClient` (with default generics) so
 * that auth methods stay fully typed instead of collapsing to `any`.
 */
export function createClient(): SupabaseClient {
  if (!browserClient) {
    const { url, anonKey } = getSupabaseEnv();
    browserClient = createBrowserClient(url, anonKey);
  }
  return browserClient;
}
