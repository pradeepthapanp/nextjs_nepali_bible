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
 * placeholders. Announced via `role="status"` + `aria-live="polite"`.
 */
export function LoadingState({
  label = "Loading…",
  children,
  className,
}: LoadingStateProps) {
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
      {label ? (
        <p className="text-sm text-muted-foreground">{label}</p>
      ) : null}
      {children}
    </div>
  );
}
