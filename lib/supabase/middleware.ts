import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv, isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * Refreshes the Supabase auth session on every matching request.
 *
 * This is the core of the Supabase SSR pattern and is invoked from the project
 * root `middleware.ts` (in Next.js 16 this convention is being renamed to
 * `proxy.ts`). It creates a request-scoped Supabase client, lets
 * `supabase.auth.getUser()` refresh the session cookies, and returns the
 * response that carries any updated cookies back to the browser.
 *
 * IMPORTANT: Do not add logic between `createServerClient` and
 * `supabase.auth.getUser()` — a common source of hard-to-debug logout bugs.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // Without credentials the session cannot be refreshed. Pass requests through
  // unchanged so the app stays usable in dev before env vars are configured.
  if (!isSupabaseConfigured) {
    return supabaseResponse;
  }

  const { url, anonKey } = getSupabaseEnv();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.
  await supabase.auth.getUser();

  // -------------------------------------------------------------------------
  // TODO(features/auth): add route guards here during feature migration, e.g.
  //
  // if (!user && request.nextUrl.pathname.startsWith("/account")) {
  //   return NextResponse.redirect(new URL("/signin", request.url));
  // }
  // -------------------------------------------------------------------------

  return supabaseResponse;
}
