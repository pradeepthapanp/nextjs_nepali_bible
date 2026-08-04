"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { bottomNav, isNavItemActive } from "@/lib/navigation";
import type { NavItem } from "@/types/navigation";
import { cn } from "@/utils/cn";

export interface MobileBottomNavigationProps {
  items?: NavItem[];
  className?: string;
}

/**
 * MobileBottomNavigation — fixed bottom tab bar (mobile only, hidden on `lg`).
 * The thumb-friendly pattern for the app's primary destinations on small
 * screens. Accessible: `<nav>` landmark, `aria-current="page"` on the active
 * tab, and safe-area inset padding for notched devices.
 */
export function MobileBottomNavigation({
  items = bottomNav,
  className,
}: MobileBottomNavigationProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t bg-background/90 backdrop-blur lg:hidden",
        className,
      )}
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {items.map((item) => {
          const active = isNavItemActive(item, pathname);
          return (
            <li key={item.href + item.label} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 px-2 py-2.5 text-[11px] font-medium transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.icon ? (
                  <item.icon className="size-5" aria-hidden />
                ) : null}
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
