import type { AuthDeepLink } from "../types";

/**
 * Authentication deep-link helpers — the ONLY place the auth URLs are built
 * and parsed (the counterpart to `buildMapUrl`/`parseMapPath`).
 *
 *   /sign-in            signIn
 *   /sign-up            signUp
 *   /forgot-password    forgotPassword
 *   /reset-password     resetPassword
 *   /profile            profile
 *   /auth/callback      callback (Supabase OAuth + password-recovery redirect)
 *
 * Pure + framework-free so they are directly unit-testable.
 */
export function buildAuthUrl(link: AuthDeepLink): string {
  switch (link.kind) {
    case "signIn":
      return "/sign-in";
    case "signUp":
      return "/sign-up";
    case "forgotPassword":
      return "/forgot-password";
    case "resetPassword":
      return "/reset-password";
    case "profile":
      return "/profile";
    case "callback":
      return "/auth/callback";
  }
}

/**
 * Parses an auth pathname into a typed deep link, or null off the auth
 * section. `/auth/...` shapes (the OAuth/recovery callback + any future
 * callback variants) all resolve to the callback link.
 */
export function parseAuthPath(pathname: string): AuthDeepLink | null {
  if (pathname === "/sign-in") return { kind: "signIn" };
  if (pathname === "/sign-up") return { kind: "signUp" };
  if (pathname === "/forgot-password") return { kind: "forgotPassword" };
  if (pathname === "/reset-password") return { kind: "resetPassword" };
  if (pathname === "/profile") return { kind: "profile" };
  if (pathname.startsWith("/auth/")) return { kind: "callback" };
  return null;
}
