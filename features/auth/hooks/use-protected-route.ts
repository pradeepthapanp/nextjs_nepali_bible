"use client";

import { useAuthState } from "../queries";

/**
 * useProtectedRoute — the client-side protected-route guard state. DERIVES
 * authentication from the existing `SupabaseProvider` via `useAuthState` (it
 * does NOT create another session) and returns the readiness + auth status so
 * a page/`AuthGate` can redirect signed-out users to `/sign-in?next={path}`.
 *
 * The server-side guard lives in the middleware (`updateSession`); this hook
 * is the in-app fallback that keeps protected surfaces honest during client
 * navigation.
 */
export function useProtectedRoute() {
  const { status, isLoaded, user } = useAuthState();
  const isAuthenticated = status === "signedIn";

  return {
    /** True once the initial session check has completed (show loading before). */
    isReady: isLoaded,
    isAuthenticated,
    user: user ?? null,
    status,
  };
}
