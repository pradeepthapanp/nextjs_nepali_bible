"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/providers/supabase-provider";
import { canManage } from "@/types/profile";
import { getSongServices } from "../services";
import { songsKeys } from "./query-keys";

/**
 * useCurrentProfile — the current user's profile (the web equivalent of the
 * Flutter `currentUserProvider` + `fetchProfileById`). Drives the admin
 * gating: `canManage` is true for `admin` / `editor` roles (Flutter
 * `_AudioListPageState._canManage`). Uses the SHARED `ProfileService` and the
 * shared `canManage` role rule (`@/types/profile`).
 */
export function useCurrentProfile() {
  const { session, supabase } = useSupabase();
  const userId = session?.user?.id;

  const query = useQuery({
    queryKey: songsKeys.profile(userId ?? ""),
    queryFn: () => getSongServices().profile.getProfileById(userId as string),
    enabled: Boolean(userId && supabase),
  });

  return {
    ...query,
    profile: query.data ?? null,
    canManage: canManage(query.data?.role),
  };
}
