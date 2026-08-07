"use client";

import { CheckCircle2, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Prayer } from "../../types";
import { cn } from "@/utils/cn";

export interface PrayerActionsProps {
  prayer: Prayer;
  /** Owner OR admin/editor (edit/delete this prayer). */
  canManage: boolean;
  /** Admin/editor (publish). */
  canModerate: boolean;
  onPublish: () => void;
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}

/**
 * PrayerActions — the prayer moderation actions (the web equivalent of the
 * admin publish button/chip + the owner/admin Edit/Delete popup menu in
 * `PrayersPage`). Presentational: the page composes the behavior-hook
 * permissions/actions and passes them via props (no permission logic here).
 */
export function PrayerActions({
  prayer,
  canManage,
  canModerate,
  onPublish,
  onEdit,
  onDelete,
  className,
}: PrayerActionsProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {canModerate && !prayer.published ? (
        <Button type="button" variant="secondary" size="sm" onClick={onPublish}>
          Publish
        </Button>
      ) : null}
      {canModerate && prayer.published ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-200">
          <CheckCircle2 className="size-3" aria-hidden />
          Published
        </span>
      ) : null}
      {canManage ? (
        <>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={onEdit}
            aria-label="Edit prayer"
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
            aria-label="Delete prayer"
            title="Delete"
          >
            <Trash2 className="size-4" aria-hidden />
          </Button>
        </>
      ) : null}
    </div>
  );
}
