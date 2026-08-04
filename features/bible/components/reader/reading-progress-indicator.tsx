"use client";

import { toNepaliDigits } from "@features/bible/utils";
import { cn } from "@/utils/cn";

export interface ReadingProgressIndicatorProps {
  /** Current chapter (1-based). */
  current: number;
  /** Total chapters in the book. */
  total: number;
  /** Optional accessible label (defaults to "Reading progress"). */
  label?: string;
  className?: string;
}

/**
 * ReadingProgressIndicator — the book's chapter progress bar.
 *
 * Replaces the reading-position persistence UI implied by Flutter's
 * `Setting.bookPosition`/`chapterPosition`. Presentational: it renders a
 * semantic `role="progressbar"` with the chapter position and percentage, so
 * it is announced by assistive tech without any data fetching.
 */
export function ReadingProgressIndicator({
  current,
  total,
  label = "Reading progress",
  className,
}: ReadingProgressIndicatorProps) {
  const clamped = Math.min(Math.max(current, 0), total);
  const percent = total > 0 ? Math.round((clamped / total) * 100) : 0;

  return (
    <div className={cn("w-full", className)}>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={clamped}
        aria-valuetext={`Chapter ${clamped} of ${total}`}
        className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
      >
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-1 text-right text-[11px] text-muted-foreground">
        {toNepaliDigits(clamped)} / {toNepaliDigits(total)}
      </p>
    </div>
  );
}
