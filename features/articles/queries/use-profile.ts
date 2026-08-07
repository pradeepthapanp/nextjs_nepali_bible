"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/providers/supabase-provider";
import { canManage } from "@/types/profile";
import { getArticleServices } from "../services";
import { articlesKeys } from "./query-keys";

/**
 * useCurrentProfile — the current user's profile (the web equivalent of the
 * Flutter `currentUserProvider` + `fetchProfileById`). Drives the Articles
 * admin gating: `canManage` is true for `admin` / `editor` roles (Flutter
 * `_ArticlesPageState.canManage`). Uses the SHARED `ProfileService`
 * (exposed on the `ArticleServices` aggregate) and the shared `canManage`
 * role rule (`@/types/profile`) — no feature-to-feature import.
 */
export function useCurrentProfile() {
  const { session, supabase } = useSupabase();
  const userId = session?.user?.id;

  const query = useQuery({
    queryKey: articlesKeys.profile(userId ?? ""),
    queryFn: () =>
      getArticleServices().profile.getProfileById(userId as string),
    enabled: Boolean(userId && supabase),
  });

  return {
    ...query,
    profile: query.data ?? null,
    canManage: canManage(query.data?.role),
  };
}
