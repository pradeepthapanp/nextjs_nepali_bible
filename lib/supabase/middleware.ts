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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // -------------------------------------------------------------------------
  // Authentication route guards.
  //
  // The client-side `AuthGate`/`AdminGate` keep protected surfaces honest
  // during client navigation; these server-side guards handle full page loads
  // and direct deep links.
  // -------------------------------------------------------------------------

  const pathname = request.nextUrl.pathname;

  // 1. Protected (signed-in) surfaces: /profile, /admin and the Settings
  //    account/profile sections require a session.
  const isProtected =
    pathname === "/profile" ||
    pathname.startsWith("/admin") ||
    pathname === "/settings/profile" ||
    pathname === "/settings/account";
  if (isProtected && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/sign-in";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 2. Admin surfaces additionally require the admin/editor role (checked via
  // the profiles table through the server client). Non-admins land on /profile.
  if (user && pathname.startsWith("/admin")) {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      const role = data?.role;
      if (role !== "admin" && role !== "editor") {
        return NextResponse.redirect(new URL("/profile", request.url));
      }
    } catch {
      // Role check unavailable (e.g. no profile row / network) — let the
      // client AdminGate decide rather than blocking the request.
    }
  }

  // 3. Already signed in: skip the auth entry pages (the Flutter AuthStatePage
  // renders the signed-in surface instead of the sign-in form).
  if (user && (pathname === "/sign-in" || pathname === "/sign-up")) {
    return NextResponse.redirect(new URL("/profile", request.url));
  }
  // -------------------------------------------------------------------------

  return supabaseResponse;
}
