"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isNavItemActive, mainNav } from "@/lib/navigation";
import type { NavItem } from "@/types/navigation";
import { cn } from "@/utils/cn";

export interface DesktopSidebarProps {
  items?: NavItem[];
  /** Optional content above the nav (e.g. a brand or section label). */
  heading?: React.ReactNode;
  /** Content pinned below the nav (e.g. a user card or sign-out). */
  footer?: React.ReactNode;
  className?: string;
}

/**
 * DesktopSidebar — vertical navigation rail for wide screens. The dashboard
 * layout places it inside a sticky `<aside>` (hidden on mobile). Accessible:
 * labelled `<nav>` and `aria-current="page"` on the active item.
 */
export function DesktopSidebar({
  items = mainNav,
  heading,
  footer,
  className,
}: DesktopSidebarProps) {
  const pathname = usePathname();

  return (
    <div
      className={cn("flex h-full w-full flex-col overflow-y-auto", className)}
    >
      {heading ? (
        <div className="px-4 pb-3 pt-4">{heading}</div>
      ) : null}

      <nav aria-label="Primary" className="flex-1 space-y-1 px-2">
        {items.map((item) => {
          const active = isNavItemActive(item, pathname);
          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
              )}
            >
              {item.icon ? (
                <item.icon className="size-5" aria-hidden />
              ) : null}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {footer ? <div className="border-t p-4">{footer}</div> : null}
    </div>
  );
}
