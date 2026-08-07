"use client";

import {
  useInfiniteQuery,
  useQuery,
  type InfiniteData,
  type QueryClient,
} from "@tanstack/react-query";
import { PRAYER_PAGE_SIZE } from "../constants";
import { getCommunityServices } from "../services";
import type { Prayer } from "../types";
import { prayerKeys } from "./query-keys";

/**
 * Prayer queries — the React Query replacement for the Flutter prayer
 * providers:
 *   - `useInfinitePrayers` → `PrayersNotifier` (`build` + `loadMore`, page
 *     size `PRAYER_PAGE_SIZE`, `hasMore` on a full page);
 *   - `usePrayers` → the finite first page (mirrors `PrayersNotifier.build`);
 *   - `usePrayer(id)` → WEB-FIRST (the `/prayers/{id}` deep link — Flutter
 *     pushed the object via a bottom sheet, so no fetch existed);
 *   - `usePrayerCount(id)` → WEB-FIRST `prayers.prayer_count` read.
 *
 * All server state lives in the React Query cache (no Zustand). Every query
 * goes through the shared `CommunityServices` — never Supabase directly.
 */

/**
 * Paginated prayer library, newest first (replaces `PrayersNotifier.build` +
 * `loadMore`). `getNextPageParam` continues only while a full page came back;
 * `placeholderData` keeps the previous pages while loading the next.
 */
export function useInfinitePrayers() {
  return useInfiniteQuery({
    queryKey: prayerKeys.infinite(),
    queryFn: ({ pageParam }) =>
      getCommunityServices().prayer.getPrayers({
        limit: PRAYER_PAGE_SIZE,
        offset: pageParam as number,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PRAYER_PAGE_SIZE
        ? allPages.reduce((sum, page) => sum + page.length, 0)
        : undefined,
    placeholderData: (previous) => previous,
  });
}

/** Flattened pages of the infinite prayer library list. */
export function flattenPrayerPages(
  data: { pages: Prayer[][] } | undefined,
): Prayer[] {
  return data?.pages.flatMap((page) => page) ?? [];
}

/**
 * First-page list (finite) — a convenience single-shot that mirrors the first
 * page of `PrayersNotifier.build`. Uses `prayerKeys.lists()`, which is a
 * PREFIX of `prayerKeys.infinite()`: invalidating `lists()` refreshes both
 * this and the infinite list with one call, so the two never drift.
 */
export function usePrayers() {
  return useQuery({
    queryKey: prayerKeys.lists(),
    queryFn: () =>
      getCommunityServices().prayer.getPrayers({
        limit: PRAYER_PAGE_SIZE,
        offset: 0,
      }),
  });
}

/**
 * A single prayer by id (WEB-FIRST — the `/prayers/{id}` deep link). Enabled
 * once an id is known; returns `Prayer | null`.
 */
export function usePrayer(id: string | undefined) {
  return useQuery({
    queryKey: prayerKeys.detail(id ?? ""),
    queryFn: () => getCommunityServices().prayer.getPrayer(id as string),
    enabled: Boolean(id),
  });
}

/** The prayer's total `prayer_count` (WEB-FIRST column read). */
export function usePrayerCount(id: string | undefined) {
  return useQuery({
    queryKey: prayerKeys.count(id ?? ""),
    queryFn: () => getCommunityServices().prays.getPrayerCount(id as string),
    enabled: Boolean(id),
  });
}

// ---------------------------------------------------------------------------
// Cache helpers (shared by every prayer mutation — mirrors `mutateArticlePages`).
// ---------------------------------------------------------------------------

/** Rewrites the infinite prayer-list pages; returns the previous pages for rollback. */
export function mutatePrayerPages(
  queryClient: QueryClient,
  mutate: (pages: Prayer[][]) => Prayer[][],
): Prayer[][] | undefined {
  const current = queryClient.getQueryData<InfiniteData<Prayer[]>>(
    prayerKeys.infinite(),
  );
  if (!current) return undefined;
  const previous = current.pages;
  queryClient.setQueryData<InfiniteData<Prayer[]>>(
    prayerKeys.infinite(),
    (data) => ({
      pages: data ? mutate(data.pages) : [],
      pageParams: data?.pageParams ?? [],
    }),
  );
  return previous;
}

/** Restores the infinite prayer-list pages after an optimistic-rollback error. */
export function restorePrayerPages(
  queryClient: QueryClient,
  pages: Prayer[][],
): void {
  queryClient.setQueryData<InfiniteData<Prayer[]>>(
    prayerKeys.infinite(),
    (data) => ({
      pages,
      pageParams: data?.pageParams ?? [],
    }),
  );
}

/** Bumps a prayer's `prayerCount` in the list pages + detail cache (min 0). */
export function bumpPrayerCountInCache(
  queryClient: QueryClient,
  prayerId: string,
  delta: number,
): void {
  mutatePrayerPages(queryClient, (pages) =>
    pages.map((page) =>
      page.map((entry) =>
        entry.id === prayerId
          ? { ...entry, prayerCount: Math.max(entry.prayerCount + delta, 0) }
          : entry,
      ),
    ),
  );
  const detail = queryClient.getQueryData<Prayer>(prayerKeys.detail(prayerId));
  if (detail) {
    queryClient.setQueryData(prayerKeys.detail(prayerId), {
      ...detail,
      prayerCount: Math.max(detail.prayerCount + delta, 0),
    });
  }
}

/** Bumps a prayer's `replyCount` in the list pages + detail cache (min 0). */
export function bumpReplyCountInCache(
  queryClient: QueryClient,
  prayerId: string,
  delta: number,
): void {
  mutatePrayerPages(queryClient, (pages) =>
    pages.map((page) =>
      page.map((entry) =>
        entry.id === prayerId
          ? { ...entry, replyCount: Math.max(entry.replyCount + delta, 0) }
          : entry,
      ),
    ),
  );
  const detail = queryClient.getQueryData<Prayer>(prayerKeys.detail(prayerId));
  if (detail) {
    queryClient.setQueryData(prayerKeys.detail(prayerId), {
      ...detail,
      replyCount: Math.max(detail.replyCount + delta, 0),
    });
  }
}
