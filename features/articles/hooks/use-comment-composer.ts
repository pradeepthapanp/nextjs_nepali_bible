"use client";

import { useCallback } from "react";
import { useSupabase } from "@/providers/supabase-provider";
import { useCreateComment, useDeleteComment, useUpdateComment } from "../queries";
import { useCommentComposerStore } from "../store";

/**
 * useCommentComposer — the article comment input behavior (the web equivalent
 * of `_ArticleCommentsSectionState` + `ArticleCommentsNotifier` usage in
 * `lib/articles/widgets/article_comment_section.dart`).
 *
 * Composes:
 * - `useCommentComposerStore` (Zustand) — the draft text + `isAnonymous`
 *   toggle + `isSending` flag (transient UI, NOT persisted);
 * - `useCreateComment` / `useUpdateComment` / `useDeleteComment` (React Query
 *   mutations) — the comment CRUD (`comments(articleId)` cache);
 * - the shared `useSupabase` provider — the signed-in user's name for
 *   `authorName` (Flutter's `user.fullName ?? 'User'`).
 *
 * `submit` posts the draft (creating the comment), clears the composer on
 * success and resets the sending flag; the underlying mutation stays
 * network-first (row prepended to the cache). The comment list itself lives in
 * React Query — this hook only orchestrates the composer.
 */
export function useCommentComposer(articleId: string) {
  const { session } = useSupabase();
  const draft = useCommentComposerStore((state) => state.draft);
  const isAnonymous = useCommentComposerStore((state) => state.isAnonymous);
  const isSending = useCommentComposerStore((state) => state.isSending);
  const setDraft = useCommentComposerStore((state) => state.setDraft);
  const setAnonymous = useCommentComposerStore((state) => state.setAnonymous);
  const setSending = useCommentComposerStore((state) => state.setSending);
  const clear = useCommentComposerStore((state) => state.clear);

  const createComment = useCreateComment();
  const updateComment = useUpdateComment();
  const deleteComment = useDeleteComment();

  /** The commenter's display name (Flutter's `user.fullName ?? 'User'`). */
  const authorName =
    (session?.user?.user_metadata?.full_name as string | undefined) ?? "User";

  /** Post the current draft (create comment) and reset the composer on success. */
  const submit = useCallback(async () => {
    const text = draft.trim();
    if (!text) return;
    setSending(true);
    try {
      await createComment.mutateAsync({
        articleId,
        input: { content: text, isAnonymous, authorName },
      });
      clear();
    } finally {
      setSending(false);
    }
  }, [articleId, draft, isAnonymous, authorName, createComment, setSending, clear]);

  /** Edit an existing comment (optimistic in-place update). */
  const update = useCallback(
    (commentId: string, content: string) => {
      updateComment.mutate({ articleId, commentId, content });
    },
    [articleId, updateComment],
  );

  /** Delete a comment (optimistic removal). */
  const remove = useCallback(
    (commentId: string) => {
      deleteComment.mutate({ articleId, commentId });
    },
    [articleId, deleteComment],
  );

  return {
    draft,
    isAnonymous,
    isSending,
    setDraft,
    setAnonymous,
    submit,
    update,
    remove,
    clear,
    isSignedIn: Boolean(session),
  };
}
