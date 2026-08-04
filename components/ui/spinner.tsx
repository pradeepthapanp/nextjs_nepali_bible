import { cn } from "@/utils/cn";

/**
 * A simple CSS spinner.
 *
 * Pure presentational component (no hooks) so it works in both Server and
 * Client components. Used by `app/loading.tsx` and `app/error.tsx`.
 */
export function Spinner({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        "size-6 animate-spin rounded-full border-2 border-current border-t-transparent text-muted-foreground",
        className,
      )}
    />
  );
}
