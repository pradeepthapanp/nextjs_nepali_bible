"use client";

import { useTranslations } from "next-intl";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/utils/cn";

export interface LoadingStateProps {
  /** Accessible label announced by screen readers. */
  label?: string;
  /** Optional extra content (e.g. a skeleton layout). */
  children?: React.ReactNode;
  className?: string;
}

/**
 * LoadingState — a spinner with an accessible live region. Used by features
 * that load async content; pair with the composed skeletons for richer
 * placeholders. Announced via `role="status"` + `aria-live="polite"`. The
 * default label is localized via `next-intl`.
 */
export function LoadingState({
  label,
  children,
  className,
}: LoadingStateProps) {
  const t = useTranslations("common");
  const resolvedLabel = label ?? t("loading");

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-16 text-center",
        className,
      )}
    >
      <Spinner className="size-7 text-primary" />
      {resolvedLabel ? (
        <p className="text-sm text-muted-foreground">{resolvedLabel}</p>
      ) : null}
      {children}
    </div>
  );
}
