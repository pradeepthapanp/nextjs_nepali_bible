"use client";

import { useCallback } from "react";
import {
  useHasPrayed,
  usePrayerCount,
  useTogglePrayer,
} from "../queries";

/**
 * usePrayerPrays — the "has prayed" behavior for a prayer (the web equivalent
 * of `HasPrayedWidget` + `PrayersNotifier.togglePrayer`).
 *
 * COMPOSES:
 *   - `useHasPrayed(prayerId)` (React Query) — the per-user membership;
 *   - `usePrayerCount(prayerId)` (React Query) — the total `prayer_count`;
 *   - `useTogglePrayer` (React Query) — the toggle mutation (the data-layer
 *     toggle DECISION lives in the shared service; this hook only triggers it).
 *
 * Each `PrayerCard` / the detail page calls this once per prayer (it is a
 * per-prayer hook — never called in a loop).
 */
export function usePrayerPrays(prayerId: string | undefined) {
  const hasPrayedQuery = useHasPrayed(prayerId);
  const countQuery = usePrayerCount(prayerId);
  const toggleMutation = useTogglePrayer();

  const toggle = useCallback(() => {
    if (!prayerId) return;
    toggleMutation.mutate({ prayerId });
  }, [toggleMutation, prayerId]);

  return {
    hasPrayed: hasPrayedQuery.data ?? false,
    hasPrayedLoading: hasPrayedQuery.isLoading,
    prayerCount: countQuery.data ?? 0,
    countLoading: countQuery.isLoading,
    isToggling: toggleMutation.isPending,
    toggle,
  };
}
