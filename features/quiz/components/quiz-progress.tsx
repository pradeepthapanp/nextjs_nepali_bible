"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/utils/cn";

export interface QuizProgressProps {
  /** The current question number (1-based). */
  current: number;
  total: number;
  correct: number;
  wrong: number;
  className?: string;
}

/**
 * QuizProgress — the play progress surface (the web port of Flutter
 * `QuizPage`: the `LinearProgressIndicator` + the Correct / Wrong `Chip`s).
 * Presentational — the play page computes the live counts from its answers.
 */
export function QuizProgress({
  current,
  total,
  correct,
  wrong,
  className,
}: QuizProgressProps) {
  const percent = total > 0 ? (current / total) * 100 : 0;
  return (
    <div className={cn("space-y-3", className)}>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="font-medium">
          Question {current}/{total}
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-0.5 text-xs font-semibold text-green-700 dark:text-green-300">
          <CheckCircle2 className="size-3.5" aria-hidden />
          Correct: {correct}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-0.5 text-xs font-semibold text-red-700 dark:text-red-300">
          <XCircle className="size-3.5" aria-hidden />
          Wrong: {wrong}
        </span>
      </div>
    </div>
  );
}
