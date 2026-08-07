"use client";

import { useProfile } from "../queries";
import { useProtectedRoute } from "./use-protected-route";

/**
 * useAdminRoute — the client-side admin/editor route guard. COMPOSES
 * `useProtectedRoute` (auth from the provider) + `useProfile` (the shared
 * `canManage` role rule) so an admin surface can redirect when the user is not
 * signed in OR not admin/editor.
 *
 * `isReady` is true once the session check AND (when signed in) the profile
 * role have loaded — before that the caller should show a loading state.
 */
export function useAdminRoute() {
  const { isReady, isAuthenticated, user, status } = useProtectedRoute();
  const { profile, canManage, isLoading: profileLoading } = useProfile();

  return {
    isReady: isReady && (!isAuthenticated || !profileLoading),
    isAuthenticated,
    canManage,
    isAdmin: isAuthenticated && canManage,
    user: user ?? null,
    profile: profile ?? null,
    status,
  };
}
