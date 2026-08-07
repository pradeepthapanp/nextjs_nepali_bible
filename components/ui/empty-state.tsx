import { Inbox } from "lucide-react";
import { cn } from "@/utils/cn";

export interface EmptyStateProps {
  /**
   * Icon rendered in the circular badge (defaults to an inbox). Accepts any
   * component callable with `className`/`aria-hidden` — Lucide icons or the
   * shared `FeatureIcon` wrappers.
   */
  icon?: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Optional action(s) rendered below the description (e.g. a Button). */
  action?: React.ReactNode;
  className?: string;
}

/**
 * EmptyState — consistent "no results / nothing here yet" message used by
 * every feature (empty lists, no search matches, empty profiles). Accepts an
 * icon, copy, and an optional action so features can guide users forward.
 */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-muted/30 px-6 py-12 text-center",
        className,
      )}
    >
      <span className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-6" aria-hidden />
      </span>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description ? (
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
