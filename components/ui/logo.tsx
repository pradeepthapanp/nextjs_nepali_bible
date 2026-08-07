import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { cn } from "@/utils/cn";

const markClasses = {
  sm: "size-7",
  md: "size-8",
  lg: "size-10",
} as const;

const markPx = {
  sm: 28,
  md: 32,
  lg: 40,
} as const;

const textClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-xl",
} as const;

export interface LogoProps {
  href?: string;
  size?: keyof typeof markClasses;
  /** Whether to show the wordmark next to the mark. */
  showWordmark?: boolean;
  className?: string;
}

/**
 * Brand logo — the real Flutter `app-icon` mark (from `public/logo/`) plus
 * the wordmark from `lib/site.ts`. Used by the header, footer and auth pages
 * so the brand is always rendered identically. Rendered with `next/image`;
 * when `href` is set it links home, otherwise it renders as an inline element.
 */
export function Logo({
  href = "/",
  size = "md",
  showWordmark = true,
  className,
}: LogoProps) {
  const content = (
    <>
      <span
        aria-hidden
        className={cn(
          "inline-grid shrink-0 place-items-center overflow-hidden rounded-full ring-1 ring-border",
          markClasses[size],
        )}
      >
        <Image
          src="/logo/app-icon.png"
          alt=""
          width={markPx[size]}
          height={markPx[size]}
          className="size-full object-cover"
        />
      </span>
      {showWordmark ? (
        <span
          className={cn(
            "font-semibold tracking-tight text-foreground",
            textClasses[size],
          )}
        >
          {siteConfig.name}
        </span>
      ) : null}
    </>
  );

  if (!href) {
    return (
      <span
        className={cn("inline-flex items-center gap-2.5", className)}
        aria-label={siteConfig.name}
      >
        {content}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={`${siteConfig.name} — home`}
      className={cn("inline-flex items-center gap-2.5", className)}
    >
      {content}
    </Link>
  );
}
