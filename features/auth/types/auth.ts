import type { Session, User } from "@supabase/supabase-js";
import type { Profile } from "@/types/profile";

/**
 * Auth domain types. The auth feature deliberately REUSES the existing shared
 * `Profile` (`@/types/profile`, the `profiles` table) and the Supabase
 * `Session` / `User` types — it does NOT re-declare them. Only the derived
 * auth-domain shapes (state, deep link, provider id) are new.
 */

/**
 * UserProfile — the signed-in user's profile. A TYPE ALIAS over the shared
 * `Profile` (single source of truth — `profiles` table via the shared
 * `ProfileService`). No duplicate Profile model exists anywhere.
 */
export type UserProfile = Profile;

/** AuthUser — the authenticated Supabase user (`session.user`). An alias. */
export type AuthUser = User;

/**
 * AuthSession — the authenticated session. An alias over the Supabase
 * `Session` that the existing `SupabaseProvider` (`useSupabase().session`)
 * owns via `getSession()` + `onAuthStateChange`. This is the ONE auth source.
 */
export type AuthSession = Session;

/** The sign-in methods the feature supports (Flutter: email/password + Google). */
export type AuthProviderId = "email" | "google";

/** The auth state machine (derived from the provider session, never stored). */
export type AuthStatus = "loading" | "signedOut" | "signedIn";

/**
 * AuthState — the derived domain auth state. COMPOSED from `useSupabase()`
 * (`status`/`session`/`user` from the provider's `isLoaded` + `session`) and
 * `useCurrentProfile` (`profile`). NOT a Zustand store — the session is owned
 * by the provider (one auth source) and the profile by React Query.
 */
export interface AuthState {
  status: AuthStatus;
  session: AuthSession | null;
  user: AuthUser | null;
  /** The signed-in user's profile (React Query), or null. */
  profile: UserProfile | null;
}

/**
 * AuthDeepLink — the typed navigation target for the Authentication section
 * (the counterpart to `MapDeepLink` / `ArticleRouteLink`).
 *
 *   signIn         → /sign-in
 *   signUp         → /sign-up
 *   forgotPassword → /forgot-password
 *   resetPassword  → /reset-password      (Supabase password-recovery link)
 *   profile        → /profile             (signed-in, protected)
 *   callback       → /auth/callback       (OAuth + password-recovery redirect)
 */
export type AuthDeepLink =
  | { kind: "signIn" }
  | { kind: "signUp" }
  | { kind: "forgotPassword" }
  | { kind: "resetPassword" }
  | { kind: "profile" }
  | { kind: "callback" };

/**
 * SignupStatus — the result of the `get_signup_status` RPC (faithful port of
 * Flutter's `getSignupStatus`): 'new' | 'unverified' | 'verified'. Drives
 * whether the flow signs up, resends the OTP or goes straight to sign-in.
 */
export type SignupStatus = "new" | "unverified" | "verified";
