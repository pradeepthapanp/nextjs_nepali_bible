"use client";

import { useCallback, useMemo } from "react";
import {
  useDeleteNotice,
  useInfiniteNotices,
  useSetNoticePublished,
} from "../queries";
import { flattenNoticePages } from "../queries";
import { useNoticeSortStore } from "../store";
import type { Notice } from "../types";
import { canManageNotice, canModerate, isOwnNotice, sortNotices } from "../utils";
import { useCommunityNavigation } from "./use-community-navigation";
import { useCurrentProfile } from "./use-current-profile";

/**
 * useNoticeLibrary — the notices LIST behavior (the web equivalent of
 * `_NoticesPageState` + `_NoticeList`): the public + "My Notices" tabs, the
 * sort, pagination, publish, delete and edit.
 *
 * COMPOSES:
 *   - `useInfiniteNotices` (React Query) + `flattenNoticePages`;
 *   - `useNoticeSortStore` (the sanctioned UI-only sort store) + the pure
 *     `sortNotices` util (Flutter sorted the in-memory list; the React Query
 *     cache is never mutated — the sort is applied over it);
 *   - `isOwnNotice` (the "My Notices" client filter — faithful to Flutter);
 *   - `useSetNoticePublished` / `useDeleteNotice` (React Query mutations);
 *   - `useCurrentProfile` (SHARED `ProfileService`) + the pure
 *     `canManageNotice`/`canModerate` (owner OR admin/editor, reusing the
 *     shared `canManage`);
 *   - `useCommunityNavigation` — `openEditNotice`.
 *
 * No Supabase, no duplicated query/permission logic.
 */
export function useNoticeLibrary() {
  const infinite = useInfiniteNotices();
  const notices = useMemo(() => flattenNoticePages(infinite.data), [
    infinite.data,
  ]);
  const { sort } = useNoticeSortStore();
  const sorted = useMemo(() => sortNotices(notices, sort), [notices, sort]);
  const { userId, role, isAuthenticated } = useCurrentProfile();
  const { openEditNotice } = useCommunityNavigation();
  const setPublishedMutation = useSetNoticePublished();
  const deleteMutation = useDeleteNotice();

  /** The "My Notices" tab (client filter — faithful to Flutter). */
  const myNotices = useMemo(
    () => sorted.filter((notice) => isOwnNotice(notice, userId ?? undefined)),
    [sorted, userId],
  );

  /** Edit/delete permission for a specific notice (owner OR admin/editor). */
  const canManageNoticeFor = useCallback(
    (notice: Notice) => canManageNotice(notice, userId ?? undefined, role),
    [userId, role],
  );

  const setNoticePublished = useCallback(
    (id: string, isPublished: boolean) =>
      setPublishedMutation.mutate({ id, isPublished }),
    [setPublishedMutation],
  );
  const deleteNotice = useCallback(
    (notice: Notice) => deleteMutation.mutate(notice),
    [deleteMutation],
  );
  const editNotice = useCallback(
    (notice: Notice) => openEditNotice(notice.id),
    [openEditNotice],
  );

  return {
    // List + tabs + sort + pagination + refresh.
    notices: sorted,
    publicNotices: sorted,
    myNotices,
    sort,
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
    canManageNotice: canManageNoticeFor,
    setNoticePublished,
    deleteNotice,
    editNotice,
  };
}
