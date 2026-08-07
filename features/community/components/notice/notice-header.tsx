"use client";

import { CalendarClock, CheckCircle2 } from "lucide-react";
import { timeAgo } from "@/utils/time-ago";
import type { Notice } from "../../types";
import { cn } from "@/utils/cn";
import { NoticeMeta } from "./notice-meta";

export interface NoticeHeaderProps {
  notice: Notice;
  className?: string;
}

/**
 * NoticeHeader — the notice DETAIL header (the web equivalent of the
 * `NoticeDetailSheet` title + author row: title, publisher + time, and the
 * published / expires info). Presentational.
 */
export function NoticeHeader({ notice, className }: NoticeHeaderProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <h2 className="text-2xl font-bold leading-tight">{notice.title}</h2>
      <NoticeMeta notice={notice} />
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <CheckCircle2 className="size-4 text-green-600" aria-hidden />
          {notice.isPublished ? "Published" : "Draft"}
        </span>
        {notice.expiresAt ? (
          <span className="inline-flex items-center gap-1.5">
            <CalendarClock className="size-4" aria-hidden />
            Expires {timeAgo(notice.expiresAt)}
          </span>
        ) : null}
      </div>
    </div>
  );
}
