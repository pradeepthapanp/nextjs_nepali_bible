"use client";

import { EyeOff } from "lucide-react";
import type { Prayer } from "../../types";
import { cn } from "@/utils/cn";
import { PrayerMeta } from "./prayer-meta";

export interface PrayerHeaderProps {
  prayer: Prayer;
  className?: string;
}

/**
 * PrayerHeader — the prayer DETAIL header: title, details, author meta and
 * the anonymous badge. The praying/reply COUNTS and the interactive pray
 * toggle are rendered once, below, by `PrayerDetailPage` — NOT duplicated
 * here. (The Flutter `_PrayerHeader`'s passive "N Praying / N Replies"
 * stats row is intentionally dropped on the web so the counts are not shown
 * twice.) Presentational.
 */
export function PrayerHeader({ prayer, className }: PrayerHeaderProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <h2 className="text-2xl font-bold leading-tight">{prayer.title}</h2>
      <p className="whitespace-pre-line text-[15px] leading-relaxed">
        {prayer.details}
      </p>
      <PrayerMeta prayer={prayer} />
      {prayer.isAnonymous ? (
        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <EyeOff className="size-4" aria-hidden />
          Anonymous
        </span>
      ) : null}
    </div>
  );
}
