"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getCommunityServices } from "../services";
import type { Notice, NoticeInput, NoticeUpdate } from "../types";
import { mutateNoticePages, restoreNoticePages } from "./use-notices";
import { noticeKeys } from "./query-keys";

/**
 * Notice mutations — the React Query replacement for the `NoticesNotifier`
 * create/update/delete/publish + image-upload flows
 * (`lib/providers/community/notices_provider.dart`).
 *
 * Strategy (faithful to Flutter + the architecture README):
 *   - `createNotice` / `updateNotice` / `deleteNotice` are NETWORK-FIRST:
 *     Flutter awaits the repo before touching its list, so the web writes the
 *     server row into the cache on success then reconciles (the notice-image
 *     file cleanup on delete happens inside the shared `NoticeService` — not
 *     duplicated here).
 *   - `setNoticePublished` is OPTIMISTIC (`isPublished` flips immediately —
 *     Flutter `setPublished`), rolled back on error.
 *   - `uploadNoticeImage` is an imperative helper mutation that returns the
 *     media URL (the SHARED `UploadService` via `NoticeService` owns the
 *     upload); it has no cache side effects — the editor hook feeds the URL
 *     into `createNotice`/`updateNotice`.
 *
 * Targeted invalidation: `noticeKeys.lists()` is a PREFIX of
 * `noticeKeys.infinite()`, so invalidating `lists()` refreshes both the finite
 * `useNotices` and the infinite `useInfiniteNotices` with one call.
 */

/** Create a notice (replaces `NoticesNotifier.createNotice`). Network-first:
 * the server row is prepended to the list + written to the detail cache on
 * success (Flutter prepends the created row), then lists are invalidated to
 * reconcile the offset pagination. */
export function useCreateNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NoticeInput) =>
      getCommunityServices().notice.createNotice(input),
    onSuccess: (created) => {
      mutateNoticePages(queryClient, (pages) =>
        pages.length > 0
          ? [[created, ...pages[0]], ...pages.slice(1)]
          : [[created]],
      );
      queryClient.setQueryData(noticeKeys.detail(created.id), created);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: noticeKeys.lists() });
    },
  });
}

/** Update a notice (replaces `NoticesNotifier.updateNotice`). Network-first:
 * the server row replaces the cached one on success (Flutter maps it in
 * place), then lists/detail are invalidated. */
export function useUpdateNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NoticeUpdate) =>
      getCommunityServices().notice.updateNotice(input),
    onSuccess: (updated) => {
      mutateNoticePages(queryClient, (pages) =>
        pages.map((page) =>
          page.map((entry) => (entry.id === updated.id ? updated : entry)),
        ),
      );
      queryClient.setQueryData(noticeKeys.detail(updated.id), updated);
    },
    onSettled: (_data, _error, input) => {
      void queryClient.invalidateQueries({ queryKey: noticeKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: noticeKeys.detail(input.id) });
    },
  });
}

/** Delete a notice (replaces `NoticesNotifier.deleteNotice`). Network-first:
 * the service deletes the row (+ best-effort image file cleanup), then the
 * notice is removed from the cache + detail dropped + lists invalidated. */
export function useDeleteNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notice: Notice) =>
      getCommunityServices().notice.deleteNotice(notice),
    onSuccess: (_, notice) => {
      mutateNoticePages(queryClient, (pages) =>
        pages.map((page) => page.filter((entry) => entry.id !== notice.id)),
      );
      queryClient.removeQueries({ queryKey: noticeKeys.detail(notice.id) });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: noticeKeys.lists() });
    },
  });
}

/** Publish / unpublish a notice (replaces `NoticesNotifier.setPublished`).
 * Optimistic `isPublished` flip (Flutter's FilterChip toggles it immediately),
 * rolled back on error, lists invalidated on settle. */
export function useSetNoticePublished() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      getCommunityServices().notice.setNoticePublished(id, isPublished),
    onMutate: ({ id, isPublished }) => {
      const previous = mutateNoticePages(queryClient, (pages) =>
        pages.map((page) =>
          page.map((entry) =>
            entry.id === id ? { ...entry, isPublished } : entry,
          ),
        ),
      );
      const detail = queryClient.getQueryData<Notice>(noticeKeys.detail(id));
      if (detail) {
        queryClient.setQueryData(noticeKeys.detail(id), {
          ...detail,
          isPublished,
        });
      }
      return { previous, detail };
    },
    onError: (_error, { id }, context) => {
      if (context?.previous) restoreNoticePages(queryClient, context.previous);
      if (context?.detail) {
        queryClient.setQueryData(noticeKeys.detail(id), context.detail);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: noticeKeys.lists() });
    },
  });
}

/** Upload the notice image (replaces the page's `uploadImage` flow). An
 * imperative helper mutation that returns the media URL; the SHARED
 * `UploadService` (via `NoticeService`) owns the `get-upload-url`/PUT flow and
 * progress. No cache side effects — the editor hook feeds the URL into
 * `createNotice`/`updateNotice`. */
export function useUploadNoticeImage() {
  return useMutation({
    mutationFn: ({
      blob,
      fileName,
      onProgress,
    }: {
      blob: Blob;
      fileName: string;
      onProgress?: (progress: number) => void;
    }) =>
      getCommunityServices().notice.uploadNoticeImage(
        blob,
        fileName,
        onProgress,
      ),
  });
}
