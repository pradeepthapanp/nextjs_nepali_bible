"use client";

import { MessageSquareOff } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import type { ArticleComment } from "../../types";
import { CommentItem } from "./comment-item";
import { cn } from "@/utils/cn";

export interface CommentListProps {
  comments: ArticleComment[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  /** The signed-in user id — used to flag the user's own comments. */
  currentUserId?: string;
  onUpdate?: (commentId: string, content: string) => void;
  onDelete?: (commentId: string) => void;
  className?: string;
}

/**
 * CommentList — the article comments list (the web replacement of Flutter's
 * `_buildCommentsList`): loading / error / empty states + the `CommentItem`s.
 * Presentational — data + handlers come via props (the page composes
 * `useArticleComments`).
 */
export function CommentList({
  comments,
  isLoading,
  isError,
  onRetry,
  currentUserId,
  onUpdate,
  onDelete,
  className,
}: CommentListProps) {
  if (isLoading) return <LoadingState label="Loading comments…" />;
  if (isError) {
    return (
      <ErrorState
        title="Failed to load comments"
        description="Something went wrong while loading the comments."
        onRetry={onRetry}
      />
    );
  }
  if (comments.length === 0) {
    return (
      <EmptyState
        icon={MessageSquareOff}
        title="No comments yet"
        description="Be the first to comment on this article."
      />
    );
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          isMine={Boolean(currentUserId && comment.userId === currentUserId)}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
