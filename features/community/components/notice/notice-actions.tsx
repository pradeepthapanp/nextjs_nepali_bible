"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Notice } from "../../types";
import { cn } from "@/utils/cn";

export interface NoticeActionsProps {
  notice: Notice;
  /** Owner OR admin/editor (edit/delete this notice). */
  canManage: boolean;
  /** Admin/editor (publish toggle). */
  canModerate: boolean;
  onSetPublished: (isPublished: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}

/**
 * NoticeActions — the notice moderation actions (the web equivalent of the
 * admin publish FilterChip + the owner/admin Edit/Delete popup menu in
 * `NoticesPage`). Presentational: the page composes the behavior-hook
 * permissions/actions and passes them via props.
 */
export function NoticeActions({
  notice,
  canManage,
  canModerate,
  onSetPublished,
  onEdit,
  onDelete,
  className,
}: NoticeActionsProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {canModerate ? (
        <button
          type="button"
          onClick={() => onSetPublished(!notice.isPublished)}
          aria-pressed={notice.isPublished}
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition",
            notice.isPublished
              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
              : "bg-muted text-muted-foreground hover:bg-muted/80",
          )}
        >
          {notice.isPublished ? "Published" : "Publish"}
        </button>
      ) : null}
      {canManage ? (
        <>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={onEdit}
            aria-label="Edit notice"
            title="Edit"
          >
            <Pencil className="size-4" aria-hidden />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={onDelete}
            aria-label="Delete notice"
            title="Delete"
          >
            <Trash2 className="size-4" aria-hidden />
          </Button>
        </>
      ) : null}
    </div>
  );
}
