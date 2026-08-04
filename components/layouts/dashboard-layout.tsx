import { AppFooter } from "@/components/navigation/app-footer";
import { AppHeader } from "@/components/navigation/app-header";
import { DesktopSidebar } from "@/components/navigation/desktop-sidebar";
import { MobileBottomNavigation } from "@/components/navigation/mobile-bottom-navigation";
import { PageContainer } from "@/components/ui/page-container";
import type { NavItem } from "@/types/navigation";
import { cn } from "@/utils/cn";

export interface DashboardLayoutProps {
  children: React.ReactNode;
  /** Nav items for the header (defaults to the shared main nav). */
  navItems?: NavItem[];
  /** Nav items for the desktop sidebar (defaults to the shared main nav). */
  sidebarItems?: NavItem[];
  /** Replaces the header's default action cluster. */
  headerActions?: React.ReactNode;
  /** Set to `false` to hide the global footer. */
  footer?: boolean;
  className?: string;
}

/**
 * DashboardLayout — the main authenticated app shell.
 * - Desktop (`lg+`): sticky left sidebar + header + content.
 * - Mobile: header with drawer menu + fixed bottom navigation.
 * Both navigation surfaces read the same nav data, so the layout stays
 * consistent across features. The content area is the `<main>` landmark.
 */
export function DashboardLayout({
  children,
  navItems,
  sidebarItems,
  headerActions,
  footer = true,
  className,
}: DashboardLayoutProps) {
  return (
    <div className={cn("flex min-h-dvh flex-col", className)}>
      <div className="flex flex-1">
        <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 border-r bg-card/50 lg:block">
          <DesktopSidebar items={sidebarItems} className="px-2 py-4" />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader navItems={navItems} actions={headerActions} />

          <main id="main-content" className="flex-1">
            {/* pb clears the fixed bottom navigation on mobile. */}
            <PageContainer className="pb-24 lg:pb-12">
              {children}
            </PageContainer>
          </main>

          {footer ? <AppFooter /> : null}
        </div>
      </div>

      <MobileBottomNavigation />
    </div>
  );
}
