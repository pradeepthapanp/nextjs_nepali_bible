"use client";

import { MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Prayer } from "../../types";
import { cn } from "@/utils/cn";
import { PrayerActions } from "./prayer-actions";
import { PrayerCountBadge } from "./prayer-count-badge";
import { PrayerMeta } from "./prayer-meta";
import { PrayerPrayButton } from "./prayer-pray-button";

export interface PrayerCardProps {
  prayer: Prayer;
  /** Owner OR admin/editor (edit/delete this prayer). */
  canManage: boolean;
  /** Admin/editor (publish). */
  canModerate: boolean;
  onOpen: () => void;
  onPublish: () => void;
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}

/**
 * PrayerCard — the prayer list card (the web equivalent of the `PrayersPage`
 * card: title, details, author/anonymous + time, the pray toggle + counts,
 * and the moderation actions). Presentational; the per-prayer `PrayerPrayButton`
 * composes `usePrayerPrays(prayer.id)` itself (one hook call per card). The
 * card is clickable (open detail) — the action buttons stop propagation.
 */
export function PrayerCard({
  prayer,
  canManage,
  canModerate,
  onOpen,
  onPublish,
  onEdit,
  onDelete,
  className,
}: PrayerCardProps) {
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
        "cursor-pointer transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-lg font-bold leading-tight">
            {prayer.title}
          </h3>
          {/* Stop the action clicks/keydowns from opening the detail. */}
          <span
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            <PrayerActions
              prayer={prayer}
              canManage={canManage}
              canModerate={canModerate}
              onPublish={onPublish}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </span>
        </div>
        <p className="mt-2 line-clamp-3 text-[15px] leading-relaxed text-muted-foreground">
          {prayer.details}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <PrayerMeta prayer={prayer} />
          <div className="ml-auto flex items-center gap-2">
            <PrayerPrayButton prayerId={prayer.id} />
            <PrayerCountBadge count={prayer.prayerCount} />
            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
              <MessageCircle className="size-4" aria-hidden />
              {prayer.replyCount}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
