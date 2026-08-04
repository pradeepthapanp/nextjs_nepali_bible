import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "@/lib/supabase/config";

/**
 * Creates a Supabase client for use in **Server Components**, Server Actions
 * and Route Handlers. Cookies are read/written via the `next/headers` store.
 *
 * The `setAll` callback runs in a `try/catch` because it is also invoked from
 * Server Components, where setting cookies is disallowed — that case can be
 * safely ignored when middleware/proxy refreshes the session.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseEnv();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component. Ignore — the middleware/proxy
          // refreshes the session instead.
        }
      },
    },
  });
}
