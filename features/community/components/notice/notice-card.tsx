"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { Notice } from "../../types";
import { cn } from "@/utils/cn";
import { NoticeActions } from "./notice-actions";
import { NoticeImage } from "./notice-image";
import { NoticeMeta } from "./notice-meta";

export interface NoticeCardProps {
  notice: Notice;
  /** Owner OR admin/editor (edit/delete this notice). */
  canManage: boolean;
  /** Admin/editor (publish toggle). */
  canModerate: boolean;
  onOpen: () => void;
  onSetPublished: (isPublished: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}

/**
 * NoticeCard — the notice list card (the web equivalent of the `_NoticeCard`
 * in `NoticesPage`: 16:9 image, publisher + time, title, description, the
 * publish chip + the owner/admin actions). Presentational; the card is
 * clickable (open detail) — the action buttons stop propagation.
 */
export function NoticeCard({
  notice,
  canManage,
  canModerate,
  onOpen,
  onSetPublished,
  onEdit,
  onDelete,
  className,
}: NoticeCardProps) {
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
      className={cn(
        "cursor-pointer overflow-hidden transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      {notice.imageUrl ? <NoticeImage src={notice.imageUrl} alt={notice.title} /> : null}
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <NoticeMeta notice={notice} />
          <span
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            <NoticeActions
              notice={notice}
              canManage={canManage}
              canModerate={canModerate}
              onSetPublished={onSetPublished}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </span>
        </div>
        <h3 className="mt-2 line-clamp-2 text-lg font-bold leading-tight">
          {notice.title}
        </h3>
        {notice.description ? (
          <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {notice.description}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
