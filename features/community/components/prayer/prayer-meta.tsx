"use client";

import { EyeOff } from "lucide-react";
import { timeAgo } from "@/utils/time-ago";
import type { Prayer } from "../../types";
import { cn } from "@/utils/cn";

export interface PrayerMetaProps {
  prayer: Prayer;
  className?: string;
}

/** PrayerMeta — the prayer author (or Anonymous) + relative time (presentational). */
export function PrayerMeta({ prayer, className }: PrayerMetaProps) {
  const author = prayer.isAnonymous ? "Anonymous" : prayer.authorName ?? "Unknown";
  return (
    <div className={cn("flex flex-wrap items-center gap-x-2 gap-y-1 text-xs", className)}>
      <span className="font-semibold text-primary">{author}</span>
      {prayer.isAnonymous ? (
        <EyeOff className="size-3 text-muted-foreground" aria-hidden />
      ) : null}
      <span className="text-muted-foreground">· {timeAgo(prayer.updatedAt)}</span>
    </div>
  );
}
