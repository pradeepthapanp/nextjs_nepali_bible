"use client";

import { formatTranspose } from "@features/music/utils";
import { cn } from "@/utils/cn";

export interface TransposeIndicatorProps {
  /** The transpose amount to display (display-only). */
  transpose: number;
  className?: string;
}

/**
 * TransposeIndicator — displays the current transpose amount only (e.g.
 * "0", "+2", "-1"), reusing the pure `formatTranspose` helper. It never
 * mutates the transpose — it only reflects the value it is given.
 */
export function TransposeIndicator({
  transpose,
  className,
}: TransposeIndicatorProps) {
  return (
    <span
      aria-label={`Transpose ${formatTranspose(transpose)}`}
      className={cn(
        "min-w-7 text-center text-sm font-semibold tabular-nums",
        transpose !== 0 && "text-primary",
        className,
      )}
    >
      {formatTranspose(transpose)}
    </span>
  );
}
