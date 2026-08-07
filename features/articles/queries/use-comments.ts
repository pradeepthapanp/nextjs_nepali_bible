"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { getArticleServices } from "../services";
import type { ArticleComment, ArticleCommentInput } from "../types";
import { articlesKeys } from "./query-keys";

/**
 * Article comments — the React Query replacement for the
 * `ArticleCommentsNotifier` family
 * (`lib/providers/articles/article_comments_provider.dart`).
 *
 *   - `useArticleComments(articleId)` → `ArticleCommentsNotifier.build`
 *     (approved comments, newest first).
 *   - `useCreateComment` → `addComment` — NETWORK-FIRST: Flutter awaits the
 *     insert (which returns the row) then PREPENDS it; the web does the same
 *     (`setQueryData` prepend, no refetch — a new comment is always newest).
 *   - `useUpdateComment` / `useDeleteComment` — OPTIMISTIC (edited in place /
 *     removed), rolled back on error, invalidated on settle.
 *
 * Every mutation carries the `articleId` so it can target the exact
 * `articlesKeys.comments(articleId)` cache — no cross-article invalidation.
 */

/** Approved comments for an article, newest first (replaces `ArticleCommentsNotifier.build`). */
export function useArticleComments(articleId: string | undefined) {
  return useQuery({
    queryKey: articlesKeys.comments(articleId ?? ""),
    queryFn: () =>
      getArticleServices().comment.getArticleComments(articleId as string),
    enabled: Boolean(articleId),
  });
}

/**
 * Add a comment (replaces `addComment`). Network-first: the returned comment
 * row is prepended to the article's comment cache (Flutter prepends without a
 * refetch — a freshly created comment is always the newest in "created_at
 * desc"), so no invalidation is needed.
 */
export function useCreateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      articleId,
      input,
    }: {
      articleId: string;
      input: ArticleCommentInput;
    }) => getArticleServices().comment.insertArticleComment(articleId, input),
    onSuccess: (created, { articleId }) => {
      const key = articlesKeys.comments(articleId);
      const previous = queryClient.getQueryData<ArticleComment[]>(key);
      queryClient.setQueryData<ArticleComment[]>(key, [
        created,
        ...(previous ?? []),
      ]);
    },
  });
}

/**
 * Edit a comment (replaces `updateComment`). Optimistic: the edited content
 * (+ `isEdited: true`) replaces the cached comment immediately, rolled back on
 * error, invalidated on settle.
 */
export function useUpdateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, content }: { articleId: string; commentId: string; content: string }) =>
      getArticleServices().comment.updateArticleComment(commentId, content),
    onMutate: ({ articleId, commentId, content }) => {
      const key = articlesKeys.comments(articleId);
      const previous = queryClient.getQueryData<ArticleComment[]>(key);
      queryClient.setQueryData<ArticleComment[]>(key, (comments) =>
        (comments ?? []).map((comment) =>
          comment.id === commentId
            ? { ...comment, content, isEdited: true }
            : comment,
        ),
      );
      return { previous };
    },
    onError: (_error, { articleId }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(articlesKeys.comments(articleId), context.previous);
      }
    },
    onSettled: (_data, _error, { articleId }) => {
      void queryClient.invalidateQueries({ queryKey: articlesKeys.comments(articleId) });
    },
  });
}

/**
 * Delete a comment (replaces `deleteComment`). Optimistic: removed from the
 * article's comment cache immediately, rolled back on error, invalidated on
 * settle.
 */
export function useDeleteComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId }: { articleId: string; commentId: string }) =>
      getArticleServices().comment.deleteArticleComment(commentId),
    onMutate: ({ articleId, commentId }) => {
      const key = articlesKeys.comments(articleId);
      const previous = queryClient.getQueryData<ArticleComment[]>(key);
      queryClient.setQueryData<ArticleComment[]>(key, (comments) =>
        (comments ?? []).filter((comment) => comment.id !== commentId),
      );
      return { previous };
    },
    onError: (_error, { articleId }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(articlesKeys.comments(articleId), context.previous);
      }
    },
    onSettled: (_data, _error, { articleId }) => {
      void queryClient.invalidateQueries({ queryKey: articlesKeys.comments(articleId) });
    },
  });
}
