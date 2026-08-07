import { type NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Request-level middleware.
 *
 * Composes two concerns on every matching request:
 *  1. Localization — with `localePrefix: "never"` URLs are locale-free, so the
 *     locale is resolved from the persisted `NEXT_LOCALE` cookie (falling back
 *     to the default), forwarded to server components via the
 *     `X-NEXT-INTL-LOCALE` request header (what `next-intl`'s middleware would
 *     set), and persisted in the cookie on first visit.
 *  2. Supabase — refreshes the auth session (see `lib/supabase/middleware.ts`).
 *
 * NOTE: In Next.js 16 this convention is deprecated and being renamed to
 * `proxy.ts` (with a `proxy` export). `middleware.ts` still works, but if you
 * prefer the new naming you can rename this file to `proxy.ts` and rename the
 * `middleware` export to `proxy` — the logic is identical.
 */
const LOCALE_HEADER = "X-NEXT-INTL-LOCALE";

export async function middleware(request: NextRequest) {
  // 1. Resolve the locale: persisted cookie → default.
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  const locale = (routing.locales as readonly string[]).includes(cookieLocale ?? "")
    ? (cookieLocale as string)
    : routing.defaultLocale;

  // 2. Forward the locale to server components (next-intl reads this header).
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(LOCALE_HEADER, locale);

  // 3. Supabase session refresh (carries the auth cookies).
  const response = await updateSession(request);

  // 4. Persist the locale cookie so refresh/SSR keep the choice.
  if (!request.cookies.get("NEXT_LOCALE")) {
    response.cookies.set("NEXT_LOCALE", locale, {
      path: "/",
      sameSite: "lax",
      maxAge: 31536000,
    });
  }

  // 5. Return a response that forwards BOTH the locale header (for server
  //    components) and the auth/locale cookies set above.
  const finalResponse = NextResponse.next({
    request: { headers: requestHeaders },
  });
  for (const cookie of response.cookies.getAll()) {
    finalResponse.cookies.set(cookie);
  }
  return finalResponse;
}

export const config = {
  // Run on all requests except static assets, image optimization and API
  // routes so session refreshing never blocks those.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
