"use client";

import { EyeOff, MessageCircle, ThumbsUp } from "lucide-react";
import type { Prayer } from "../../types";
import { cn } from "@/utils/cn";
import { PrayerMeta } from "./prayer-meta";

export interface PrayerHeaderProps {
  prayer: Prayer;
  className?: string;
}

/**
 * PrayerHeader — the prayer DETAIL header (the web equivalent of the
 * `_PrayerHeader` in `PrayerDetailsSheet`: title, details, the praying/reply
 * stats + the anonymous badge). Presentational.
 */
export function PrayerHeader({ prayer, className }: PrayerHeaderProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <h2 className="text-2xl font-bold leading-tight">{prayer.title}</h2>
      <p className="whitespace-pre-line text-[15px] leading-relaxed">
        {prayer.details}
      </p>
      <PrayerMeta prayer={prayer} />
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <ThumbsUp className="size-4 text-primary" aria-hidden />
          {prayer.prayerCount} Praying
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MessageCircle className="size-4" aria-hidden />
          {prayer.replyCount} Replies
        </span>
        {prayer.isAnonymous ? (
          <span className="inline-flex items-center gap-1.5">
            <EyeOff className="size-4" aria-hidden />
            Anonymous
          </span>
        ) : null}
      </div>
    </div>
  );
}
