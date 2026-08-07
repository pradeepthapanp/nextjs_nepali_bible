"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { timeAgo } from "@/utils/time-ago";
import type { PrayerReply } from "../../types";
import { cn } from "@/utils/cn";

export interface PrayerReplyItemProps {
  reply: PrayerReply;
  /** Reply owner OR admin (edit/delete). */
  canManage: boolean;
  onEdit: (replyId: string, text: string) => void;
  onDelete: (replyId: string) => void;
  className?: string;
}

/**
 * PrayerReplyItem — a single prayer reply (the web equivalent of `_ReplyTile`
 * in `PrayerDetailsSheet`: avatar, author, time, text + the owner/admin
 * edit/delete). PRESENTATIONAL: it owns a small inline edit state (the
 * `_EditReplyDialog` equivalent); the page wires `onEdit`/`onDelete` to the
 * behavior-hook reply actions.
 */
export function PrayerReplyItem({
  reply,
  canManage,
  onEdit,
  onDelete,
  className,
}: PrayerReplyItemProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(reply.reply);

  const save = () => {
    const text = draft.trim();
    if (!text) return;
    if (text !== reply.reply) onEdit(reply.id, text);
    setEditing(false);
  };

  return (
    <div className={cn("flex gap-2", className)}>
      <Avatar name={reply.authorName ?? "A"} size="sm" />
      <div className="min-w-0 flex-1 rounded-lg bg-muted/40 px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-sm font-semibold text-primary">
              {reply.authorName ?? "Anonymous"}
            </span>
            <span className="text-xs text-muted-foreground">
              {timeAgo(reply.createdAt)}
            </span>
          </div>
          {canManage ? (
            <div className="flex items-center gap-0.5">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => {
                  setDraft(reply.reply);
                  setEditing(true);
                }}
                aria-label="Edit reply"
                title="Edit"
              >
                <Pencil className="size-3.5" aria-hidden />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => onDelete(reply.id)}
                aria-label="Delete reply"
                title="Delete"
              >
                <Trash2 className="size-3.5" aria-hidden />
              </Button>
            </div>
          ) : null}
        </div>
        {editing ? (
          <div className="mt-1.5 space-y-2">
            <Input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              aria-label="Edit reply"
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button type="button" size="sm" onClick={save} disabled={!draft.trim()}>
                Save
              </Button>
            </div>
          </div>
        ) : (
          <p className="mt-0.5 whitespace-pre-line text-sm leading-relaxed">{reply.reply}</p>
        )}
      </div>
    </div>
  );
}
