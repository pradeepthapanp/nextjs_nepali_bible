"use client";

import { useCallback } from "react";
import {
  useCreateNotice,
  useDeleteNotice,
  useUpdateNotice,
  useUploadNoticeImage,
} from "../queries";
import type { Notice, NoticeInput, NoticeUpdate } from "../types";
import { canManageNotice, canModerate } from "../utils";
import { useCurrentProfile } from "./use-current-profile";

/**
 * useNoticeActions — the notice create/update/delete + image-upload actions
 * (the web equivalent of `AddNewNoticePage._save` + the upload flow).
 *
 * COMPOSES the React Query mutations (`useCreateNotice`/`useUpdateNotice`/
 * `useDeleteNotice`/`useUploadNoticeImage`) — NO mutation logic and NO upload
 * logic are duplicated (the image upload delegates to the SHARED
 * `UploadService` through `NoticeService`, exposing progress via the mutation
 * variables) — plus the pure permission helpers (owner OR admin/editor,
 * reusing the shared `canManage`). The editor PAGE composes this and
 * navigates via `useCommunityNavigation` after create/update.
 */
export function useNoticeActions() {
  const { userId, role } = useCurrentProfile();
  const createMutation = useCreateNotice();
  const updateMutation = useUpdateNotice();
  const deleteMutation = useDeleteNotice();
  const uploadMutation = useUploadNoticeImage();

  const createNotice = useCallback(
    async (input: NoticeInput) => createMutation.mutateAsync(input),
    [createMutation],
  );
  const updateNotice = useCallback(
    async (input: NoticeUpdate) => updateMutation.mutateAsync(input),
    [updateMutation],
  );
  const deleteNotice = useCallback(
    (notice: Notice) => deleteMutation.mutate(notice),
    [deleteMutation],
  );
  /** Upload the notice image via the SHARED `UploadService` (returns the media URL). */
  const uploadNoticeImage = useCallback(
    (
      blob: Blob,
      fileName: string,
      onProgress?: (progress: number) => void,
    ) => uploadMutation.mutateAsync({ blob, fileName, onProgress }),
    [uploadMutation],
  );

  /** Edit/delete permission for a specific notice (owner OR admin/editor). */
  const canManageNoticeFor = useCallback(
    (notice: Notice) => canManageNotice(notice, userId ?? undefined, role),
    [userId, role],
  );

  return {
    createNotice,
    updateNotice,
    deleteNotice,
    uploadNoticeImage,
    canManageNotice: canManageNoticeFor,
    canModerate: canModerate(role),
    isUploading: uploadMutation.isPending,
    isPending:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending ||
      uploadMutation.isPending,
    error:
      createMutation.error ??
      updateMutation.error ??
      deleteMutation.error ??
      uploadMutation.error,
  };
}
