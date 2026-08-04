import {
  BookOpen,
  FileText,
  Home,
  HelpCircle,
  Music,
  Settings,
  Users,
} from "lucide-react";
import type {
  FooterLinkGroup,
  NavItem,
} from "@/types/navigation";

/**
 * Navigation content.
 *
 * PLACEHOLDER data: hrefs are `"#"` until the corresponding features are
 * migrated. This module is the single source of nav structure shared by the
 * header, sidebar, bottom navigation and footer — features will replace the
 * entries, not the components.
 */
export const mainNav: NavItem[] = [
  { label: "गृह", href: "/", icon: Home },
  { label: "बाइबल", href: "#", icon: BookOpen },
  { label: "संगीत", href: "#", icon: Music },
  { label: "लेखहरू", href: "#", icon: FileText },
  { label: "समुदाय", href: "#", icon: Users },
  { label: "क्विज", href: "#", icon: HelpCircle },
  { label: "सेटिङ", href: "#", icon: Settings },
];

/** Curated items for the mobile bottom bar (max ~5). */
export const bottomNav: NavItem[] = [
  { label: "गृह", href: "/", icon: Home },
  { label: "बाइबल", href: "#", icon: BookOpen },
  { label: "संगीत", href: "#", icon: Music },
  { label: "समुदाय", href: "#", icon: Users },
  { label: "सेटिङ", href: "#", icon: Settings },
];

export const footerGroups: FooterLinkGroup[] = [
  {
    title: "Explore",
    links: [
      { label: "बाइबल", href: "#" },
      { label: "संगीत", href: "#" },
      { label: "लेखहरू", href: "#" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "सूचनाहरू", href: "#" },
      { label: "छलफल", href: "#" },
      { label: "प्रार्थना", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "क्विज", href: "#" },
      { label: "सेटिङ", href: "#" },
      { label: "मद्दत", href: "#" },
    ],
  },
];

/**
 * Determines whether a nav item matches the current pathname.
 * An explicit `item.active` wins; `"#"` placeholders never match.
 */
export function isNavItemActive(item: NavItem, pathname: string): boolean {
  if (item.active !== undefined) return item.active;
  if (!item.href || item.href === "#") return false;
  if (item.href === "/") return pathname === "/";
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
