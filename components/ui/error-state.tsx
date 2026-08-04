"use client";

import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

export interface ErrorStateProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** The original error (used to surface a `digest` for support). */
  error?: Error & { digest?: string };
  /** When provided, renders a "Try again" button that calls it. */
  onRetry?: () => void;
  /** `page` fills the viewport; `inline` fits inside a container. */
  variant?: "page" | "inline";
  className?: string;
}

/**
 * ErrorState — the shared error presentation (icon, copy, optional retry).
 * Announced via `role="alert"`. Used by `app/error.tsx` and by features that
 * fail to load data. Keeping one error component means error UX (including the
 * Nepali copy and the retry affordance) stays consistent app-wide.
 */
export function ErrorState({
  title = "केही गडबड भयो",
  description = "Something went wrong while loading this content.",
  error,
  onRetry,
  variant = "inline",
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        variant === "page"
          ? "flex min-h-dvh flex-col items-center justify-center px-6 py-24 text-center"
          : "flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center",
        className,
      )}
    >
      <span className="grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-6" aria-hidden />
      </span>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      {error?.digest ? (
        <p className="text-xs text-muted-foreground">Error ID: {error.digest}</p>
      ) : null}
      {onRetry ? (
        <Button variant="outline" onClick={onRetry} className="mt-2">
          <RotateCw className="size-4" aria-hidden />
          Try again
        </Button>
      ) : null}
    </div>
  );
}
