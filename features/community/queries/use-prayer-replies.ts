"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { getCommunityServices } from "../services";
import type { PrayerReply, PrayerReplyInput, PrayerReplyUpdate } from "../types";
import { bumpReplyCountInCache } from "./use-prayers";
import { prayerKeys } from "./query-keys";

/**
 * Prayer replies — the React Query replacement for the
 * `PrayerRepliesNotifier` family
 * (`lib/providers/community/prayer_replies_provider.dart`).
 *
 *   - `usePrayerRepliesQuery(prayerId)` → `PrayerRepliesNotifier.build`
 *     (replies, newest first). Named `…Query` so the BEHAVIOR hook owns the
 *     public `usePrayerReplies` name (the Articles `useRelatedArticles` →
 *     `useRelatedArticlesQuery` rename precedent — the feature barrel exports
 *     both the queries and the hooks).
 *   - `useCreatePrayerReply` → `createReply` — NETWORK-FIRST: Flutter awaits
 *     the insert (which returns the row) then PREPENDS it AND calls
 *     `incrementReplyCount` on the prayer; the web does the same (insert +
 *     count bump in the mutationFn, then `setQueryData` prepend + a local
 *     `replyCount` bump — a fresh reply is always newest, so no refetch).
 *   - `useUpdatePrayerReply` / `useDeletePrayerReply` — OPTIMISTIC (edited in
 *     place / removed; delete also `decrementReplyCount` like Flutter), rolled
 *     back on error, invalidated on settle.
 *
 * Every mutation targets the exact `prayerKeys.replies(prayerId)` cache —
 * no cross-prayer invalidation.
 */

/** The replies of a prayer, newest first (replaces `PrayerRepliesNotifier.build`). */
export function usePrayerRepliesQuery(prayerId: string | undefined) {
  return useQuery({
    queryKey: prayerKeys.replies(prayerId ?? ""),
    queryFn: () =>
      getCommunityServices().reply.getReplies(prayerId as string),
    enabled: Boolean(prayerId),
  });
}

/** Add a reply (replaces `createReply` + the follow-up `incrementReplyCount`).
 * Network-first: the mutation inserts the reply row AND bumps the prayer's
 * server `reply_count`, then prepends the reply + a local `replyCount` bump
 * (Flutter prepends without a refetch — a fresh reply is always newest). */
export function useCreatePrayerReply() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: PrayerReplyInput) => {
      const created = await getCommunityServices().reply.createReply(input);
      // Flutter's `createReply` also calls `incrementReplyCount` on the prayer.
      await getCommunityServices().prayer.incrementReplyCount(input.prayerId);
      return created;
    },
    onSuccess: (created, input) => {
      const key = prayerKeys.replies(input.prayerId);
      const previous = queryClient.getQueryData<PrayerReply[]>(key);
      queryClient.setQueryData<PrayerReply[]>(key, [
        created,
        ...(previous ?? []),
      ]);
      bumpReplyCountInCache(queryClient, input.prayerId, 1);
      // Refresh the shared actual-reply-count map (list cards derive from it).
      void queryClient.invalidateQueries({ queryKey: prayerKeys.replyCounts() });
    },
  });
}

/** Edit a reply (replaces `editReply`). Optimistic: the new text replaces the
 * cached reply immediately, rolled back on error, invalidated on settle. */
export function useUpdatePrayerReply() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      replyId,
      reply,
    }: PrayerReplyUpdate & { prayerId: string }) =>
      getCommunityServices().reply.updateReply({ replyId, reply }),
    onMutate: ({ prayerId, replyId, reply }) => {
      const key = prayerKeys.replies(prayerId);
      const previous = queryClient.getQueryData<PrayerReply[]>(key);
      queryClient.setQueryData<PrayerReply[]>(key, (replies) =>
        (replies ?? []).map((item) =>
          item.id === replyId ? { ...item, reply } : item,
        ),
      );
      return { previous };
    },
    onError: (_error, { prayerId }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(prayerKeys.replies(prayerId), context.previous);
      }
    },
    onSettled: (_data, _error, { prayerId }) => {
      void queryClient.invalidateQueries({
        queryKey: prayerKeys.replies(prayerId),
      });
    },
  });
}

/** Delete a reply (replaces `deleteReply` + the follow-up `decrementReplyCount`).
 * Optimistic: removed immediately + a local `replyCount` bump, rolled back on
 * error, invalidated on settle. */
export function useDeletePrayerReply() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      prayerId,
      replyId,
    }: {
      prayerId: string;
      replyId: string;
    }) => {
      await getCommunityServices().reply.deleteReply(replyId);
      // Flutter's `deleteReply` also calls `decrementReplyCount` on the prayer.
      await getCommunityServices().prayer.decrementReplyCount(prayerId);
    },
    onMutate: ({ prayerId, replyId }) => {
      const key = prayerKeys.replies(prayerId);
      const previous = queryClient.getQueryData<PrayerReply[]>(key);
      queryClient.setQueryData<PrayerReply[]>(key, (replies) =>
        (replies ?? []).filter((item) => item.id !== replyId),
      );
      bumpReplyCountInCache(queryClient, prayerId, -1);
      return { previous };
    },
    onError: (_error, { prayerId }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(prayerKeys.replies(prayerId), context.previous);
      }
      // The replyCount bump was optimistic — reconcile on error.
      void queryClient.invalidateQueries({ queryKey: prayerKeys.lists() });
    },
    onSettled: (_data, _error, { prayerId }) => {
      void queryClient.invalidateQueries({
        queryKey: prayerKeys.replies(prayerId),
      });
      // Refresh the shared actual-reply-count map (list cards derive from it).
      void queryClient.invalidateQueries({ queryKey: prayerKeys.replyCounts() });
    },
  });
}
