import { cn } from "@/utils/cn";

export interface SkipLinkProps {
  /** The `id` of the main content element to jump to. */
  targetId?: string;
  className?: string;
}

/**
 * Visually-hidden skip link rendered at the top of the app. Lets keyboard and
 * screen-reader users jump straight to the main content, bypassing the header
 * and navigation. Rendered once in the root layout.
 */
export function SkipLink({
  targetId = "main-content",
  className,
}: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className={cn(
        "sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-lg",
        className,
      )}
    >
      Skip to content
    </a>
  );
}
