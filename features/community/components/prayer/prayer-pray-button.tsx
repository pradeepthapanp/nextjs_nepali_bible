"use client";

import { ThumbsUp } from "lucide-react";
import { usePrayerPrays } from "../../hooks";
import { cn } from "@/utils/cn";

export interface PrayerPrayButtonProps {
  prayerId: string;
  className?: string;
}

/**
 * PrayerPrayButton — the "I prayed" thumbs-up toggle (the web equivalent of
 * `HasPrayedWidget`). COMPOSES the existing `usePrayerPrays(prayerId)`
 * behavior hook (hasPrayed + toggle) — no Supabase, no duplicated logic. Each
 * card/detail instance calls the per-prayer hook once.
 */
export function PrayerPrayButton({ prayerId, className }: PrayerPrayButtonProps) {
  const { hasPrayed, isToggling, toggle } = usePrayerPrays(prayerId);
  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isToggling}
      aria-pressed={hasPrayed}
      aria-label={hasPrayed ? "I'm praying for this" : "I prayed for this"}
      title={hasPrayed ? "Remove your prayer" : "Pray for this request"}
      className={cn(
        "inline-flex items-center justify-center text-primary transition hover:scale-110 disabled:cursor-wait disabled:opacity-60",
        className,
      )}
    >
      <ThumbsUp className={cn("size-4", hasPrayed && "fill-current")} aria-hidden />
    </button>
  );
}
