"use client";

import { cn } from "@/utils/cn";

export interface ProgressLineProps {
  /** 0..1 progress fraction. */
  value: number;
  className?: string;
}

/**
 * ProgressLine — the thin, non-interactive progress line (the web equivalent
 * of the `LinearProgressIndicator` at the top of Flutter's `MiniAudioPlayer`).
 * Accessible via `role="progressbar"`.
 */
export function ProgressLine({ value, className }: ProgressLineProps) {
  const fraction = Math.min(1, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(fraction * 100)}
      className={cn("h-1 w-full overflow-hidden rounded-full bg-muted", className)}
    >
      <div
        className="h-full bg-primary"
        style={{ width: `${fraction * 100}%` }}
      />
    </div>
  );
}
