"use client";

import { useCallback } from "react";
import {
  useCreatePrayerReply,
  useDeletePrayerReply,
  usePrayerRepliesQuery,
  useUpdatePrayerReply,
} from "../queries";
import type { PrayerReply } from "../types";
import { canManageReply } from "../utils";
import { useCurrentProfile } from "./use-current-profile";

/**
 * usePrayerReplies — the replies behavior for a prayer (the web equivalent of
 * `PrayerDetailsSheet`'s reply list + composer + edit/delete).
 *
 * COMPOSES:
 *   - `usePrayerRepliesQuery(prayerId)` (React Query) — the replies list;
 *   - the reply mutations (`useCreatePrayerReply`/`useUpdatePrayerReply`/
 *     `useDeletePrayerReply`) — NO mutation logic duplicated;
 *   - `useCurrentProfile` + the pure `canManageReply` (reply owner OR admin —
 *     faithful to Flutter `_ReplyTile`).
 *
 * This behavior hook OWNS the public `usePrayerReplies` name; the React Query
 * hook was renamed `usePrayerRepliesQuery` (the Articles precedent).
 */
export function usePrayerReplies(prayerId: string | undefined) {
  const {
    data: replies,
    isLoading,
    isError,
    error,
    refetch,
  } = usePrayerRepliesQuery(prayerId);
  const { userId, role } = useCurrentProfile();
  const createMutation = useCreatePrayerReply();
  const updateMutation = useUpdatePrayerReply();
  const deleteMutation = useDeletePrayerReply();

  /** Edit/delete permission for a reply (owner OR admin — faithful). */
  const canManageReplyFor = useCallback(
    (reply: PrayerReply) => canManageReply(reply, userId ?? undefined, role),
    [userId, role],
  );

  const sendReply = useCallback(
    (reply: string) => {
      if (!prayerId) return;
      createMutation.mutate({ prayerId, reply });
    },
    [createMutation, prayerId],
  );
  const editReply = useCallback(
    (replyId: string, reply: string) => {
      if (!prayerId) return;
      updateMutation.mutate({ prayerId, replyId, reply });
    },
    [updateMutation, prayerId],
  );
  const removeReply = useCallback(
    (replyId: string) => {
      if (!prayerId) return;
      deleteMutation.mutate({ prayerId, replyId });
    },
    [deleteMutation, prayerId],
  );

  return {
    replies,
    isLoading,
    isError,
    error,
    refetch: () => void refetch(),
    isSending: createMutation.isPending,
    canManageReply: canManageReplyFor,
    sendReply,
    editReply,
    removeReply,
  };
}
