"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { AppContainer } from "@/components/ui/app-container";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { LanguageSwitcher } from "@/components/navigation/language-switcher";
import { ResponsiveDrawer } from "@/components/navigation/responsive-drawer";
import { ThemeToggle } from "@/components/navigation/theme-toggle";
import { isNavItemActive, mainNav } from "@/lib/navigation";
import type { NavItem } from "@/types/navigation";
import { cn } from "@/utils/cn";

export interface AppHeaderProps {
  navItems?: NavItem[];
  /** Replaces the default action cluster (theme + language toggles). */
  actions?: React.ReactNode;
  className?: string;
}

/**
 * AppHeader — sticky top navigation bar.
 * - Desktop: brand, horizontal primary nav, actions (theme/language).
 * - Mobile: hamburger opens a `ResponsiveDrawer` with the same nav + actions.
 * - Accessible: `<header>` landmark, labelled `<nav>`, `aria-expanded` /
 *   `aria-haspopup` on the menu button, `aria-current="page"` on the active
 *   link.
 */
export function AppHeader({
  navItems = mainNav,
  actions,
  className,
}: AppHeaderProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const pathname = usePathname();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur",
        className,
      )}
    >
      <AppContainer>
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-haspopup="dialog"
              aria-expanded={menuOpen}
            >
              <Menu className="size-5" aria-hidden />
            </Button>
            <Logo />
          </div>

          <nav aria-label="Primary" className="hidden items-center lg:flex">
            {navItems.map((item) => {
              const active = isNavItemActive(item, pathname);
              return (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1">
            {actions ?? (
              <>
                <ThemeToggle />
                <LanguageSwitcher />
              </>
            )}
          </div>
        </div>
      </AppContainer>

      <ResponsiveDrawer
        open={menuOpen}
        onOpenChange={setMenuOpen}
        title="Menu"
      >
        <nav aria-label="Mobile" className="flex flex-col gap-1">
          {navItems.map((item) => {
            const active = isNavItemActive(item, pathname);
            return (
              <Link
                key={item.href + item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent text-accent-foreground"
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
        <div className="mt-4 flex items-center gap-2 border-t pt-4">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </ResponsiveDrawer>
    </header>
  );
}
