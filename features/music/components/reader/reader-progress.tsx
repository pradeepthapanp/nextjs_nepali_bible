"use client";

import { cn } from "@/utils/cn";

export interface ReaderProgressProps {
  /** 0-based current song index. */
  current: number;
  /** Total number of songs in the reader list. */
  total: number;
  className?: string;
}

/**
 * ReaderProgress — a read-only position bar ("3 / 50") for the Song Reader.
 * Pure display: receives the current position + total via props.
 */
export function ReaderProgress({
  current,
  total,
  className,
}: ReaderProgressProps) {
  const percent =
    total > 0 ? Math.min(100, Math.max(0, ((current + 1) / total) * 100)) : 0;
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={current + 1}
      aria-label="Song position"
      className={cn("flex items-center gap-2", className)}
    >
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-xs tabular-nums text-muted-foreground">
        {current + 1} / {total}
      </span>
    </div>
  );
}
