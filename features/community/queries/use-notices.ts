"use client";

import {
  useInfiniteQuery,
  useQuery,
  type InfiniteData,
  type QueryClient,
} from "@tanstack/react-query";
import { NOTICE_PAGE_SIZE } from "../constants";
import { getCommunityServices } from "../services";
import type { Notice } from "../types";
import { noticeKeys } from "./query-keys";

/**
 * Notice queries — the React Query replacement for the Flutter `NoticesNotifier`
 * (`build` + `loadMore`, page size `NOTICE_PAGE_SIZE`, `hasMore` on a full
 * page) plus WEB-FIRST `useNotice(id)` (the `/notices/{id}` deep link —
 * Flutter pushed the object via a bottom sheet, so no fetch existed).
 *
 * All server state lives in the React Query cache (no Zustand). Every query
 * goes through the shared `CommunityServices` — never Supabase directly.
 */

/**
 * Paginated notice library, newest first (replaces `NoticesNotifier.build` +
 * `loadMore`). `getNextPageParam` continues only while a full page came back;
 * `placeholderData` keeps the previous pages while loading the next.
 */
export function useInfiniteNotices() {
  return useInfiniteQuery({
    queryKey: noticeKeys.infinite(),
    queryFn: ({ pageParam }) =>
      getCommunityServices().notice.getNotices({
        limit: NOTICE_PAGE_SIZE,
        offset: pageParam as number,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === NOTICE_PAGE_SIZE
        ? allPages.reduce((sum, page) => sum + page.length, 0)
        : undefined,
    placeholderData: (previous) => previous,
  });
}

/** Flattened pages of the infinite notice library list. */
export function flattenNoticePages(
  data: { pages: Notice[][] } | undefined,
): Notice[] {
  return data?.pages.flatMap((page) => page) ?? [];
}

/**
 * First-page list (finite) — a convenience single-shot that mirrors the first
 * page of `NoticesNotifier.build`. Uses `noticeKeys.lists()`, which is a
 * PREFIX of `noticeKeys.infinite()`: invalidating `lists()` refreshes both
 * this and the infinite list with one call, so the two never drift.
 */
export function useNotices() {
  return useQuery({
    queryKey: noticeKeys.lists(),
    queryFn: () =>
      getCommunityServices().notice.getNotices({
        limit: NOTICE_PAGE_SIZE,
        offset: 0,
      }),
  });
}

/**
 * A single notice by id (WEB-FIRST — the `/notices/{id}` deep link). Enabled
 * once an id is known; returns `Notice | null`.
 */
export function useNotice(id: string | undefined) {
  return useQuery({
    queryKey: noticeKeys.detail(id ?? ""),
    queryFn: () => getCommunityServices().notice.getNotice(id as string),
    enabled: Boolean(id),
  });
}

// ---------------------------------------------------------------------------
// Cache helpers (shared by every notice mutation — mirrors `mutateArticlePages`).
// ---------------------------------------------------------------------------

/** Rewrites the infinite notice-list pages; returns the previous pages for rollback. */
export function mutateNoticePages(
  queryClient: QueryClient,
  mutate: (pages: Notice[][]) => Notice[][],
): Notice[][] | undefined {
  const current = queryClient.getQueryData<InfiniteData<Notice[]>>(
    noticeKeys.infinite(),
  );
  if (!current) return undefined;
  const previous = current.pages;
  queryClient.setQueryData<InfiniteData<Notice[]>>(
    noticeKeys.infinite(),
    (data) => ({
      pages: data ? mutate(data.pages) : [],
      pageParams: data?.pageParams ?? [],
    }),
  );
  return previous;
}

/** Restores the infinite notice-list pages after an optimistic-rollback error. */
export function restoreNoticePages(
  queryClient: QueryClient,
  pages: Notice[][],
): void {
  queryClient.setQueryData<InfiniteData<Notice[]>>(
    noticeKeys.infinite(),
    (data) => ({
      pages,
      pageParams: data?.pageParams ?? [],
    }),
  );
}
