import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Request-level middleware.
 *
 * Runs before routes are rendered and refreshes the Supabase session for every
 * matching request (see `lib/supabase/middleware.ts`). Auth-aware redirects
 * and route guards will be added here during feature migration.
 *
 * NOTE: In Next.js 16 this convention is deprecated and being renamed to
 * `proxy.ts` (with a `proxy` export). `middleware.ts` still works, but if you
 * prefer the new naming you can rename this file to `proxy.ts` and rename the
 * `middleware` export to `proxy` — the logic is identical.
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Run on all requests except static assets, image optimization and API
  // routes so session refreshing never blocks those.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
