"use client";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { getCommunityServices } from "../services";
import type { Prayer, PrayerInput } from "../types";
import {
  bumpPrayerCountInCache,
  mutatePrayerPages,
  restorePrayerPages,
} from "./use-prayers";
import { prayerKeys } from "./query-keys";

/**
 * Prayer mutations — the React Query replacement for the `PrayersNotifier`
 * create/update/delete/publish flows
 * (`lib/providers/community/prayers_provider.dart`).
 *
 * Strategy (faithful to Flutter + the architecture README):
 *   - `createPrayer` / `updatePrayer` are NETWORK-FIRST: Flutter awaits the
 *     repo (which returns the server row) before touching its list, so the web
 *     writes the returned row into the cache (`setQueryData`) then reconciles.
 *   - `deletePrayer` is OPTIMISTIC: removed from the cache immediately,
 *     rolled back on error (Flutter `removePrayer`).
 *   - `publishPrayer` is OPTIMISTIC (`published: true` — Flutter `publishPrayer`).
 *   - `incrementPrayerCount` is OPTIMISTIC +1 (WEB-FIRST count bump — mirrors
 *     the Articles `incrementViewCount` optimistic pattern).
 *
 * Targeted invalidation: `prayerKeys.lists()` is a PREFIX of
 * `prayerKeys.infinite()`, so invalidating `lists()` refreshes both the finite
 * `usePrayers` and the infinite `useInfinitePrayers` with one call.
 */

/** Create a prayer (replaces `PrayersNotifier.createPrayer`). Network-first:
 * the server row is prepended to the list + written to the detail cache on
 * success (Flutter prepends the created row), then lists are invalidated to
 * reconcile the offset pagination. */
export function useCreatePrayer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PrayerInput) =>
      getCommunityServices().prayer.createPrayer(input),
    onSuccess: (created) => {
      mutatePrayerPages(queryClient, (pages) =>
        pages.length > 0
          ? [[created, ...pages[0]], ...pages.slice(1)]
          : [[created]],
      );
      queryClient.setQueryData(prayerKeys.detail(created.id), created);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: prayerKeys.lists() });
    },
  });
}

/** Update a prayer (replaces `PrayersNotifier.updatePrayer`). Network-first:
 * the server row replaces the cached one on success (Flutter maps it in place),
 * then lists/detail are invalidated. */
export function useUpdatePrayer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: PrayerInput }) =>
      getCommunityServices().prayer.updatePrayer(id, input),
    onSuccess: (updated, { id }) => {
      mutatePrayerPages(queryClient, (pages) =>
        pages.map((page) =>
          page.map((entry) => (entry.id === updated.id ? updated : entry)),
        ),
      );
      queryClient.setQueryData(prayerKeys.detail(id), updated);
    },
    onSettled: (_data, _error, { id }) => {
      void queryClient.invalidateQueries({ queryKey: prayerKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: prayerKeys.detail(id) });
    },
  });
}

/** Delete a prayer (replaces `PrayersNotifier.removePrayer`). Optimistic:
 * removed from the list immediately + detail cache dropped, rolled back on
 * error, lists invalidated on settle. */
export function useDeletePrayer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => getCommunityServices().prayer.deletePrayer(id),
    onMutate: (id) => {
      const previous = mutatePrayerPages(queryClient, (pages) =>
        pages.map((page) => page.filter((entry) => entry.id !== id)),
      );
      queryClient.removeQueries({ queryKey: prayerKeys.detail(id) });
      return { previous };
    },
    onError: (_error, _id, context) => {
      if (context?.previous) restorePrayerPages(queryClient, context.previous);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: prayerKeys.lists() });
    },
  });
}

/** Publish a prayer (replaces `PrayersNotifier.publishPrayer`). Optimistic
 * `published: true` (Flutter sets it before awaiting the repo write), rolled
 * back on error, lists invalidated on settle. */
export function usePublishPrayer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => getCommunityServices().prayer.publishPrayer(id),
    onMutate: (id) => {
      const previous = mutatePrayerPages(queryClient, (pages) =>
        pages.map((page) =>
          page.map((entry) =>
            entry.id === id ? { ...entry, published: true } : entry,
          ),
        ),
      );
      const detail = queryClient.getQueryData<Prayer>(prayerKeys.detail(id));
      if (detail) {
        queryClient.setQueryData(prayerKeys.detail(id), {
          ...detail,
          published: true,
        });
      }
      return { previous, detail };
    },
    onError: (_error, id, context) => {
      if (context?.previous) restorePrayerPages(queryClient, context.previous);
      if (context?.detail) {
        queryClient.setQueryData(prayerKeys.detail(id), context.detail);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: prayerKeys.lists() });
    },
  });
}

/** Bump the prayer count by one (WEB-FIRST — the explicit count bump for the
 * web toggle flow when no DB trigger maintains `prayer_count`). Optimistic +1
 * in the list + detail caches (mirrors the Articles `incrementViewCount`),
 * reconciled on error. */
export function useIncrementPrayerCount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      getCommunityServices().prayer.incrementPrayerCount(id),
    onMutate: (id) => {
      bumpPrayerCountInCache(queryClient, id, 1);
    },
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: prayerKeys.lists() });
    },
  });
}
