import { cn } from "@/utils/cn";

export interface PageTitleProps {
  /** Main heading — defaults to `<h1>`. */
  as?: "h1" | "h2";
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Actions aligned to the heading (buttons, toggles, filters). */
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Standard page heading block (title + optional description + actions).
 * Ensures consistent heading hierarchy (one `<h1>` per page) and responsive
 * stacking across all features.
 */
export function PageTitle({
  as: Tag = "h1",
  title,
  description,
  actions,
  className,
}: PageTitleProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0 space-y-1.5">
        <Tag className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </Tag>
        {description ? (
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
