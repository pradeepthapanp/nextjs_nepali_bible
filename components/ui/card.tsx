import Link from "next/link";
import { cn } from "@/utils/cn";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Renders an internal `<Link>` so the whole card is clickable. */
  href?: string;
  /** Adds hover feedback for interactive cards. */
  interactive?: boolean;
}

/**
 * Card — the standard content surface (article previews, list items, settings
 * panels, etc.). The compound header/title/description/content/footer parts
 * give every feature the same container language. `href` makes the card a
 * single link target; `interactive` adds hover affordance.
 */
export function Card({ className, href, interactive, ...props }: CardProps) {
  const baseClasses = cn(
    "rounded-xl border bg-card text-card-foreground shadow-sm",
    interactive && "transition-all hover:shadow-md",
    className,
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          "block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          baseClasses,
        )}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      />
    );
  }

  return <div className={baseClasses} {...props} />;
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col gap-1.5 p-5", className)} {...props} />
  );
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("font-semibold leading-tight tracking-tight", className)}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props} />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 pt-0", className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center p-5 pt-0", className)} {...props} />;
}
