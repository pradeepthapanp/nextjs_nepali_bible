import { cn } from "@/utils/cn";

/**
 * A lightweight skeleton block used for loading placeholders.
 *
 * Pure presentational component (no hooks) so it works in both Server and
 * Client components. Used by `app/loading.tsx`.
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}
