"use client";

import { UserRound } from "lucide-react";
import { timeAgo } from "@/utils/time-ago";
import type { Notice } from "../../types";
import { cn } from "@/utils/cn";

export interface NoticeMetaProps {
  notice: Notice;
  /**
   * The author/publisher label. Notices have no `authorName` column and the
   * per-author profile fetch was deferred (no new hook per the phase scope),
   * so a neutral label is shown — the SHARED `ProfileService` is available if
   * a future public-profile hook is added.
   */
  publisherLabel?: string;
  className?: string;
}

/** NoticeMeta — the notice publisher label + relative time (presentational). */
export function NoticeMeta({
  notice,
  publisherLabel = "Community Notice",
  className,
}: NoticeMetaProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2 text-xs text-muted-foreground", className)}>
      <span className="inline-flex size-6 items-center justify-center rounded-full bg-muted">
        <UserRound className="size-3.5" aria-hidden />
      </span>
      <span className="font-medium text-foreground">{publisherLabel}</span>
      <span>· {timeAgo(notice.createdAt)}</span>
    </div>
  );
}
