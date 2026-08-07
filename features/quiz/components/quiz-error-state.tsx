"use client";

import { ErrorState } from "@/components/ui/error-state";

export interface QuizErrorStateProps {
  error?: unknown;
  onRetry?: () => void;
}

/**
 * QuizErrorState — the quiz fetch error + retry (the web port of Flutter
 * `_InitializeQuizPage`'s "Failed to load questions" state). REUSES the shared
 * `ErrorState` with `onRetry` → `refetch`.
 */
export function QuizErrorState({ error, onRetry }: QuizErrorStateProps) {
  return (
    <ErrorState
      title="Failed to load questions"
      description={
        error instanceof Error
          ? error.message
          : "Something went wrong while fetching the questions."
      }
      onRetry={onRetry}
    />
  );
}
