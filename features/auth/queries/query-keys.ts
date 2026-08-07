/**
 * React Query cache keys for Authentication. This file is the cache-key
 * hierarchy CONTRACT only — the query/mutation HOOKS land in a later phase
 * (see `README.md`).
 *
 *   - `profile(userId)`    — the signed-in user's profile (`getProfileById`,
 *                            enabled on a session; the auth feature's
 *                            canonical `useCurrentProfile`).
 *   - `signupStatus(email)` — `getSignupStatus` (the `get_signup_status` RPC)
 *                            used by the sign-in/sign-up flow to choose
 *                            verify vs. login.
 *
 * The SESSION itself is NOT a query key — it lives in the existing
 * `SupabaseProvider` (`useSupabase().session`), the single auth source.
 */
export const authKeys = {
  all: () => ["auth"] as const,
  profile: (userId: string) => ["auth", "profile", userId] as const,
  signupStatus: (email: string) => ["auth", "signup-status", email] as const,
};
