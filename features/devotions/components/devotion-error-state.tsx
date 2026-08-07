"use client";

import { useTranslations } from "next-intl";
import { ErrorState } from "@/components/ui/error-state";

export interface DevotionErrorStateProps {
  error?: unknown;
  onRetry?: () => void;
}

/**
 * DevotionErrorState — the devotion error + retry (the web port of Flutter
 * `_DevotionErrorWidget`). REUSES the shared `ErrorState` (title, description,
 * "Try Again" → `onRetry`).
 */
export function DevotionErrorState({
  error,
  onRetry,
}: DevotionErrorStateProps) {
  const t = useTranslations("devotion");
  return (
    <ErrorState
      title={t("couldntLoad")}
      description={
        error instanceof Error ? error.message : t("loadErrorDesc")
      }
      onRetry={onRetry}
    />
  );
}
