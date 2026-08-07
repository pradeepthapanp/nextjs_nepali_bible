"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ArticleComment } from "../../types";
import { timeAgo } from "../../utils/time-ago";
import { cn } from "@/utils/cn";

export interface CommentItemProps {
  comment: ArticleComment;
  /** Whether the current user authored this comment (shows edit/delete). */
  isMine?: boolean;
  onUpdate?: (commentId: string, content: string) => void;
  onDelete?: (commentId: string) => void;
  className?: string;
}

/**
 * CommentItem — one article comment (the web replacement of Flutter's
 * `_CommentTile`): avatar, author name (anonymized when `isAnonymous`),
 * relative time, edited marker, content and (for the author) edit/delete.
 * Presentational — mutations come via callbacks.
 */
export function CommentItem({
  comment,
  isMine,
  onUpdate,
  onDelete,
  className,
}: CommentItemProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.content);
  const authorName = comment.isAnonymous
    ? "Anonymous"
    : (comment.authorName ?? "User");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onUpdate?.(comment.id, text);
    setEditing(false);
  };

  return (
    <div className={cn("flex gap-3", className)}>
      <Avatar name={authorName} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
          <span className="font-medium text-foreground">{authorName}</span>
          <span className="text-muted-foreground">{timeAgo(comment.createdAt)}</span>
          {comment.isEdited ? (
            <span className="text-muted-foreground">(edited)</span>
          ) : null}
        </div>

        {editing ? (
          <form onSubmit={handleSubmit} className="mt-1 flex items-center gap-2">
            <Input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              aria-label="Edit comment"
            />
            <Button type="submit" size="sm" disabled={!draft.trim()}>
              Save
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setDraft(comment.content);
                setEditing(false);
              }}
            >
              Cancel
            </Button>
          </form>
        ) : (
          <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
            {comment.content}
          </p>
        )}

        {isMine && !editing ? (
          <div className="mt-1 flex gap-1">
            {onUpdate ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setDraft(comment.content);
                  setEditing(true);
                }}
              >
                <Pencil /> Edit
              </Button>
            ) : null}
            {onDelete ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-destructive"
                onClick={() => onDelete?.(comment.id)}
              >
                <Trash2 /> Delete
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
