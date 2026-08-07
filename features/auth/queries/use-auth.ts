"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/providers/supabase-provider";
import { canManage } from "@/types/profile";
import { getAuthServices } from "../services";
import { authKeys } from "./query-keys";
import type { AuthStatus, AuthUser } from "../types";

/**
 * Auth queries — the React Query / provider-derived state for Authentication.
 *
 * The SESSION is NOT cached by React Query: it is derived from the existing
 * `SupabaseProvider` (`useSupabase().session` via `getSession()` +
 * `onAuthStateChange`) — the ONE authentication source. Only the profile is a
 * React Query cache entry (`authKeys.profile`), fetched via the SHARED
 * `ProfileService`.
 */

/**
 * useAuthState — the derived auth state machine (the web equivalent of the
 * Flutter `authStateProvider` consumption in `AuthStatePage`). DERIVES purely
 * from the provider: `status = isLoaded ? (session ? "signedIn" : "signedOut")
 * : "loading"`. No duplicated session state — this is the single source every
 * guard/page reads.
 */
export function useAuthState() {
  const { session, isLoaded } = useSupabase();
  const status: AuthStatus = !isLoaded
    ? "loading"
    : session
      ? "signedIn"
      : "signedOut";
  return {
    status,
    isLoaded,
    session: session ?? null,
    user: (session?.user ?? null) as AuthUser | null,
  };
}

/**
 * useCurrentUser — the signed-in Supabase user (from the provider session).
 * Thin convenience over `useAuthState` for surfaces that only need the user.
 */
export function useCurrentUser() {
  const { user, isLoaded, status } = useAuthState();
  return {
    user,
    isLoaded,
    isAuthenticated: status === "signedIn",
  };
}

/**
 * useProfile — the signed-in user's profile (the web equivalent of the
 * `currentUserProvider` / `profileStream`). Fetches via the SHARED
 * `ProfileService` (`profiles` table) into `authKeys.profile(userId)`, gated
 * on a session. Exposes `profile` + the shared `canManage` role rule.
 */
export function useProfile() {
  const { session, isLoaded } = useSupabase();
  const userId = session?.user?.id;

  const query = useQuery({
    queryKey: authKeys.profile(userId ?? ""),
    queryFn: () =>
      getAuthServices().profile.getProfileById(userId as string),
    enabled: Boolean(userId),
  });

  return {
    ...query,
    profile: query.data ?? null,
    canManage: canManage(query.data?.role),
    isLoaded,
    isAuthenticated: Boolean(session),
  };
}
