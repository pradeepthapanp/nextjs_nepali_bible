"use client";

import { ThumbsUp } from "lucide-react";
import { cn } from "@/utils/cn";

export interface PrayerCountBadgeProps {
  count: number;
  className?: string;
}

/** PrayerCountBadge — the "praying" count stat (presentational). */
export function PrayerCountBadge({ count, className }: PrayerCountBadgeProps) {
  return (
    <span
      className={cn("inline-flex items-center gap-1 text-sm text-muted-foreground", className)}
    >
      <ThumbsUp className="size-4 text-primary" aria-hidden />
      {count}
    </span>
  );
}
