"use client";

import { useAuthState, useProfile } from "../queries";

/**
 * useAuth — the consolidated authentication surface (the web equivalent of the
 * Flutter `authStateProvider` + `currentUserProvider` composition used across
 * the app). COMPOSES the provider-derived `useAuthState` (ONE auth source) +
 * the `useProfile` query (shared `ProfileService`). No duplicated session
 * state — this is a view over the existing `SupabaseProvider`.
 */
export function useAuth() {
  const { status, session, user, isLoaded } = useAuthState();
  const { profile, canManage, refetch: refetchProfile } = useProfile();

  return {
    // Auth state (derived from the provider).
    status,
    isLoaded,
    isAuthenticated: status === "signedIn",
    session,
    user,
    // Profile (React Query via the shared ProfileService).
    profile,
    canManage,
    refetchProfile: () => void refetchProfile(),
  };
}
