"use client";

import { useState } from "react";
import { Menu, Settings } from "lucide-react";
import { ResponsiveDrawer } from "@/components/navigation/responsive-drawer";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { SettingsSidebar } from "./settings-sidebar";

export interface SettingsLayoutProps {
  /** The active section content. */
  children: React.ReactNode;
  /** The current section label (shown in the header). */
  title?: string;
  className?: string;
}

/**
 * SettingsLayout — the Settings Center shell.
 *
 * Desktop (≥lg): a PERMANENT left sidebar (`SettingsSidebar`, sticky) + the
 * content area on the right; the sidebar stays visible while switching
 * sections (SPA navigation).
 *
 * Mobile (<lg): the sidebar is hidden; a hamburger button in the header opens
 * a `ResponsiveDrawer` slide-over with the same section list. No bottom
 * navigation anywhere. Browser back/forward work because sections are real
 * routes (`/settings/*`) read via `usePathname`.
 */
export function SettingsLayout({
  children,
  title = "Settings",
  className,
}: SettingsLayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className={cn("min-h-dvh bg-background text-foreground", className)}>
      <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-2 px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open settings menu"
            aria-haspopup="dialog"
            aria-expanded={drawerOpen}
          >
            <Menu className="size-5" aria-hidden />
          </Button>
          <h1 className="flex items-center gap-2 text-xl font-bold">
            <Settings className="size-5 text-primary" aria-hidden />
            {title}
          </h1>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="hidden lg:block" aria-label="Settings navigation">
          <div className="sticky top-24">
            <SettingsSidebar />
          </div>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>

      <ResponsiveDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title="Settings"
      >
        <SettingsSidebar onNavigate={() => setDrawerOpen(false)} />
      </ResponsiveDrawer>
    </div>
  );
}
