"use client";

import { useCallback, useMemo } from "react";
import {
  useDeletePrayer,
  useInfinitePrayers,
  usePublishPrayer,
} from "../queries";
import { flattenPrayerPages } from "../queries";
import type { Prayer } from "../types";
import { canManagePrayer, canModerate } from "../utils";
import { useCommunityNavigation } from "./use-community-navigation";
import { useCurrentProfile } from "./use-current-profile";

/**
 * usePrayerLibrary — the prayers LIST behavior (the web equivalent of
 * `_PrayersPageState` + `PrayersNotifier` consumption).
 *
 * COMPOSES:
 *   - `useInfinitePrayers` (React Query) — the paginated list + `flattenPrayerPages`;
 *   - `useCurrentProfile` (SHARED `ProfileService`) — owner id + role;
 *   - `usePublishPrayer` / `useDeletePrayer` (React Query mutations);
 *   - `useCommunityNavigation` — `openEditPrayer` (edit);
 *   - the pure permission helpers (`canManagePrayer`/`canModerate`, which reuse
 *     the shared `canManage` role rule).
 *
 * The per-card "has prayed" membership is NOT here: it is per-prayer server
 * state, so each `PrayerCard` composes `useHasPrayed(prayer.id)` itself (hooks
 * cannot be called in a loop). The toggle mutation is exposed via
 * `usePrayerPrays`/`usePrayerDetail` (the prays behavior). No Supabase, no
 * duplicated query/permission logic.
 */
export function usePrayerLibrary() {
  const infinite = useInfinitePrayers();
  const prayers = useMemo(() => flattenPrayerPages(infinite.data), [
    infinite.data,
  ]);
  const { userId, role, isAuthenticated } = useCurrentProfile();
  const { openEditPrayer } = useCommunityNavigation();
  const deleteMutation = useDeletePrayer();
  const publishMutation = usePublishPrayer();

  /** Edit/delete permission for a specific prayer (owner OR admin/editor). */
  const canManagePrayerFor = useCallback(
    (prayer: Prayer) => canManagePrayer(prayer, userId ?? undefined, role),
    [userId, role],
  );

  const deletePrayer = useCallback(
    (prayer: Prayer) => deleteMutation.mutate(prayer.id),
    [deleteMutation],
  );
  const publishPrayer = useCallback(
    (prayerId: string) => publishMutation.mutate(prayerId),
    [publishMutation],
  );
  const editPrayer = useCallback(
    (prayer: Prayer) => openEditPrayer(prayer.id),
    [openEditPrayer],
  );

  return {
    // List + pagination + refresh.
    prayers,
    isLoading: infinite.isLoading,
    isError: infinite.isError,
    error: infinite.error,
    refetch: () => void infinite.refetch(),
    hasMore: infinite.hasNextPage,
    loadMore: () => void infinite.fetchNextPage(),
    isLoadingMore: infinite.isFetchingNextPage,
    // Permissions + actions.
    isAuthenticated,
    canModerate: canModerate(role),
    canManagePrayer: canManagePrayerFor,
    deletePrayer,
    publishPrayer,
    editPrayer,
  };
}
