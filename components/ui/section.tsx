import { useId } from "react";
import { cn } from "@/utils/cn";

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  /** Optional eyebrow / kicker rendered above the title. */
  eyebrow?: string;
  /** Section heading (rendered as `<h2>` and used for `aria-labelledby`). */
  title?: string;
  /** Supporting description under the title. */
  description?: string;
  /** Actions aligned to the heading (buttons, links, filters). */
  actions?: React.ReactNode;
  /** Element to render — defaults to `<section>`. */
  as?: "section" | "div";
}

/**
 * Section with consistent vertical rhythm and an optional header row
 * (eyebrow + title + description + actions). Every feature uses the same
 * spacing and heading structure, and the header is linked to the section via
 * `aria-labelledby` for screen readers.
 */
export function Section({
  id,
  eyebrow,
  title,
  description,
  actions,
  as: Tag = "section",
  className,
  children,
  ...props
}: SectionProps) {
  const titleId = useId();

  const hasHeader = Boolean(eyebrow || title || description || actions);

  return (
    <Tag
      id={id}
      aria-labelledby={title ? titleId : undefined}
      className={cn("space-y-6", className)}
      {...props}
    >
      {hasHeader && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            {eyebrow ? (
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h2
                id={titleId}
                className="text-xl font-semibold tracking-tight sm:text-2xl"
              >
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="max-w-2xl text-sm text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex flex-wrap items-center gap-2">{actions}</div>
          ) : null}
        </div>
      )}
      {children}
    </Tag>
  );
}
