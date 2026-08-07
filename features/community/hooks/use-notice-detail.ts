"use client";

import { useCallback } from "react";
import {
  useDeleteNotice,
  useNotice,
  useSetNoticePublished,
} from "../queries";
import type { Notice } from "../types";
import { canManageNotice, canModerate } from "../utils";
import { useCommunityNavigation } from "./use-community-navigation";
import { useCurrentProfile } from "./use-current-profile";

/**
 * useNoticeDetail — the notice DETAIL behavior (the web equivalent of
 * `NoticeDetailSheet` + the notice's owner/admin menu): the notice, publish,
 * edit and delete.
 *
 * COMPOSES:
 *   - `useNotice(id)` (React Query) — the notice (WEB-FIRST detail deep link);
 *   - `useSetNoticePublished` / `useDeleteNotice` (React Query mutations);
 *   - `useCurrentProfile` (SHARED `ProfileService`) + the pure
 *     `canManageNotice`/`canModerate` (owner OR admin/editor);
 *   - `useCommunityNavigation` — `openEditNotice`.
 *
 * No Supabase, no duplicated query/permission logic.
 */
export function useNoticeDetail(id: string | undefined) {
  const {
    data: notice,
    isLoading,
    isError,
    error,
    refetch,
  } = useNotice(id);
  const { userId, role } = useCurrentProfile();
  const { openEditNotice } = useCommunityNavigation();
  const setPublishedMutation = useSetNoticePublished();
  const deleteMutation = useDeleteNotice();

  /** Edit/delete permission for the notice (owner OR admin/editor). */
  const canManageNoticeFor = useCallback(
    (n: Notice) => canManageNotice(n, userId ?? undefined, role),
    [userId, role],
  );

  const setNoticePublished = useCallback(
    (isPublished: boolean) => {
      if (!notice) return;
      setPublishedMutation.mutate({ id: notice.id, isPublished });
    },
    [setPublishedMutation, notice],
  );
  const deleteNotice = useCallback(() => {
    if (!notice) return;
    deleteMutation.mutate(notice);
  }, [deleteMutation, notice]);
  const editNotice = useCallback(() => {
    if (!notice) return;
    openEditNotice(notice.id);
  }, [openEditNotice, notice]);

  return {
    notice: notice ?? null,
    isLoading,
    isError,
    error,
    refetch: () => void refetch(),
    canModerate: canModerate(role),
    canManageNotice: notice ? canManageNoticeFor(notice) : false,
    setNoticePublished,
    deleteNotice,
    editNotice,
  };
}
