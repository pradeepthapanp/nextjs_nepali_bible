"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { useSupabase } from "@/providers/supabase-provider";
import { getCommunityServices } from "../services";
import type { Prayer } from "../types";
import { bumpPrayerCountInCache, restorePrayerPages } from "./use-prayers";
import { prayerKeys } from "./query-keys";

/**
 * Prayer-prays — the "has prayed" membership + toggle (the React Query
 * replacement for `hasPrayedProvider` + the `PrayersNotifier.togglePrayer`
 * flow).
 *
 *   - `useHasPrayed(prayerId)` → `hasPrayedProvider` (family, autoDispose).
 *     The cache key is PER-USER (`prayerKeys.hasPrayed(userId, prayerId)`) so
 *     a different signed-in user never sees another user's stale membership.
 *   - `useTogglePrayer` → the service `togglePrayer` (the data-layer toggle
 *     DECISION — reads `hasPrayed` then calls `pray`/`unPray`). The mutation
 *     is OPTIMISTIC: the membership + the prayer `prayerCount` flip ±1
 *     immediately (Flutter's `togglePrayer` optimistic count), rolled back on
 *     error, and both are invalidated on settle to reconcile with the server.
 */

/** Whether the signed-in user has prayed for the prayer (replaces `hasPrayedProvider`). */
export function useHasPrayed(prayerId: string | undefined) {
  const { session } = useSupabase();
  const userId = session?.user?.id;
  return useQuery({
    queryKey: prayerKeys.hasPrayed(userId ?? "", prayerId ?? ""),
    queryFn: () => getCommunityServices().prays.hasPrayed(prayerId as string),
    enabled: Boolean(prayerId) && Boolean(userId),
  });
}

/** Flip the "has prayed" state (replaces `PrayersNotifier.togglePrayer`).
 * Optimistic: the membership flips + the prayer `prayerCount` moves ±1 in the
 * list + detail caches (Flutter bumps the in-memory copy before awaiting the
 * repo write), rolled back on error, hasPrayed + lists invalidated on settle. */
export function useTogglePrayer() {
  const queryClient = useQueryClient();
  const { session } = useSupabase();
  const userId = session?.user?.id;
  return useMutation({
    mutationFn: ({ prayerId }: { prayerId: string }) =>
      getCommunityServices().prays.togglePrayer(prayerId),
    onMutate: ({ prayerId }) => {
      const key = prayerKeys.hasPrayed(userId ?? "", prayerId);
      const previousHasPrayed = queryClient.getQueryData<boolean>(key) ?? false;
      const previousInfinite = queryClient.getQueryData<
        InfiniteData<Prayer[]>
      >(prayerKeys.infinite());
      const previousPages = previousInfinite?.pages;
      const previousDetail = queryClient.getQueryData<Prayer>(
        prayerKeys.detail(prayerId),
      );
      const delta = previousHasPrayed ? -1 : 1;
      bumpPrayerCountInCache(queryClient, prayerId, delta);
      queryClient.setQueryData<boolean>(key, !previousHasPrayed);
      return { previousHasPrayed, previousPages, previousDetail };
    },
    onError: (_error, { prayerId }, context) => {
      if (!context) return;
      if (context.previousPages) {
        restorePrayerPages(queryClient, context.previousPages);
      }
      if (context.previousDetail) {
        queryClient.setQueryData(
          prayerKeys.detail(prayerId),
          context.previousDetail,
        );
      }
      queryClient.setQueryData(
        prayerKeys.hasPrayed(userId ?? "", prayerId),
        context.previousHasPrayed,
      );
    },
    onSettled: (_data, _error, { prayerId }) => {
      void queryClient.invalidateQueries({
        queryKey: prayerKeys.hasPrayed(userId ?? "", prayerId),
      });
      void queryClient.invalidateQueries({ queryKey: prayerKeys.lists() });
    },
  });
}
