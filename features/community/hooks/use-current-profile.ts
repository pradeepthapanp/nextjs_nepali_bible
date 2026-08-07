"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/providers/supabase-provider";
import { communityKeys } from "../queries";
import { getCommunityServices } from "../services";
import type { UserRole } from "@/types/profile";

/**
 * useCurrentProfile — the signed-in user's profile via the SHARED
 * `ProfileService` (the web equivalent of the `currentUserProvider`/
 * `profileStream`), cached under the community-wide `communityKeys.profile`.
 * The community's role/permission helpers derive `role` from this (the same
 * shared service every feature uses — no duplicate ProfileService).
 *
 * Composition: `useSupabase()` (the one auth source → session user id) + a
 * `useQuery` over `getCommunityServices().profile.getProfileById` (shared
 * service), gated on a session. This is a SUPPORTING hook — it is NOT part of
 * the React Query layer (which omitted the profile query from its requested
 * scope) but belongs here so the behavior hooks can compose ProfileService.
 */
export function useCurrentProfile() {
  const { session, isLoaded } = useSupabase();
  const userId = session?.user?.id;

  const query = useQuery({
    queryKey: communityKeys.profile(userId ?? ""),
    queryFn: () =>
      getCommunityServices().profile.getProfileById(userId as string),
    enabled: Boolean(userId),
  });

  return {
    ...query,
    profile: query.data ?? null,
    userId: userId ?? null,
    role: query.data?.role as UserRole | undefined,
    isAuthenticated: Boolean(userId),
    isLoaded,
  };
}
