import type { LucideIcon } from "lucide-react";

/**
 * Shared navigation model used by AppHeader, DesktopSidebar,
 * MobileBottomNavigation and related components.
 */
export interface NavItem {
  /** Visible label (localized text is passed in by the caller). */
  label: string;
  /** Destination. `"#"` marks a not-yet-wired placeholder link. */
  href: string;
  /** Optional icon rendered beside the label. */
  icon?: LucideIcon;
  /** Force the active state (overrides pathname matching). */
  active?: boolean;
  /** Render as an action button instead of a link (e.g. "Log out"). */
  action?: () => void;
}

/** A group of navigation items, optionally with a section title. */
export interface NavSection {
  title?: string;
  items: NavItem[];
}

/** A link entry used in footers / link groups. */
export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterLinkGroup {
  title: string;
  links: FooterLink[];
}
