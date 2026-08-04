"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/error-state";

/**
 * Global route error boundary (Client Component).
 *
 * In Next.js 16 the recovery callback is named `retry` (previously `reset`).
 * It re-renders the failed segment, which recovers from transient errors.
 */
export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    // TODO: report to an error monitoring service once configured.
    console.error(error);
  }, [error]);

  return (
    <ErrorState
      variant="page"
      error={error}
      onRetry={retry}
      description="Something went wrong while loading this page. Please try again."
    />
  );
}
