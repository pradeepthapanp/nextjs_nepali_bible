"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { FeatureIcon } from "@/components/icons";
import { cn } from "@/utils/cn";
import {
  isSettingsSectionActive,
  SETTINGS_SECTIONS,
} from "../constants";

export interface SettingsSidebarProps {
  /** Called after a link is clicked (the mobile drawer closes itself). */
  onNavigate?: () => void;
  className?: string;
}

/**
 * SettingsSidebar — the section navigation (desktop permanent sidebar AND the
 * mobile slide-over drawer content). Highlighting is derived from the current
 * pathname (`aria-current="page"` + accent), so browser back/forward and the
 * active section always agree.
 */
export function SettingsSidebar({
  onNavigate,
  className,
}: SettingsSidebarProps) {
  const pathname = usePathname();
  const t = useTranslations();

  const label = (section: (typeof SETTINGS_SECTIONS)[number]) =>
    section.labelKey ? t(section.labelKey) : section.label;

  return (
    <nav
      aria-label="Settings sections"
      className={cn("flex flex-col gap-1", className)}
    >
      {SETTINGS_SECTIONS.map((section) => {
        const active = isSettingsSectionActive(section, pathname);
        return (
          <Link
            key={section.href}
            href={section.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
            )}
          >
            <FeatureIcon name={section.icon} aria-hidden />
            {label(section)}
          </Link>
        );
      })}
    </nav>
  );
}
