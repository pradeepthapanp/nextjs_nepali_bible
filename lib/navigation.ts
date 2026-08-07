import type { FooterLinkGroup, NavItem } from "@/types/navigation";
import { siteConfig } from "@/lib/site";

/**
 * Navigation content — the single source of truth for the global top
 * navigation (`SiteNav`/`AppHeader`), the home quick-access cards and the
 * footer. Every `href` is a real application route; features add their entry
 * here instead of hardcoding nav in their own components.
 */
export const mainNav: NavItem[] = [
  { label: "Home", labelKey: "nav.home", href: "/", icon: "home", descriptionKey: "nav.homeDesc" },
  {
    label: "Bible",
    labelKey: "nav.bible",
    href: "/bible",
    icon: "bible",
    descriptionKey: "nav.bibleDesc",
  },
  {
    label: "Music",
    labelKey: "nav.music",
    href: "/music",
    icon: "music",
    descriptionKey: "nav.musicDesc",
  },
  {
    label: "Playlists",
    labelKey: "nav.playlists",
    href: "/playlists",
    icon: "playlists",
    descriptionKey: "nav.playlistsDesc",
  },
  {
    label: "Articles",
    labelKey: "nav.articles",
    href: "/articles",
    icon: "articles",
    descriptionKey: "nav.articlesDesc",
  },
  {
    label: "Devotions",
    labelKey: "nav.devotions",
    href: "/devotion",
    icon: "devotions",
    descriptionKey: "nav.devotionsDesc",
  },
  {
    label: "Maps",
    labelKey: "nav.maps",
    href: "/maps",
    icon: "maps",
    descriptionKey: "nav.mapsDesc",
  },
  {
    label: "Prayers",
    labelKey: "nav.prayers",
    href: "/prayers",
    icon: "prayers",
    descriptionKey: "nav.prayersDesc",
  },
  {
    label: "Notices",
    labelKey: "nav.notices",
    href: "/notices",
    icon: "notices",
    descriptionKey: "nav.noticesDesc",
  },
  {
    label: "Quiz",
    labelKey: "nav.quiz",
    href: "/quiz",
    icon: "quiz",
    descriptionKey: "nav.quizDesc",
  },
];

/**
 * Quick-access cards for the home page — every feature except Home itself.
 * Derived from `mainNav` so the header and the home cards can never drift.
 */
export const homeQuickAccess: NavItem[] = mainNav.filter(
  (item) => item.href !== "/",
);

export const footerGroups: FooterLinkGroup[] = [
  {
    title: "Explore",
    titleKey: "footer.explore",
    links: [
      { label: "Bible", labelKey: "nav.bible", href: "/bible" },
      { label: "Music", labelKey: "nav.music", href: "/music" },
      { label: "Playlists", labelKey: "nav.playlists", href: "/playlists" },
      { label: "Articles", labelKey: "nav.articles", href: "/articles" },
      { label: "Devotions", labelKey: "nav.devotions", href: "/devotion" },
      { label: "Maps", labelKey: "nav.maps", href: "/maps" },
      { label: "Quiz", labelKey: "nav.quiz", href: "/quiz" },
    ],
  },
  {
    title: "Community",
    titleKey: "footer.community",
    links: [
      { label: "Prayer Requests", labelKey: "footer.prayerRequests", href: "/prayers" },
      { label: "Notices", labelKey: "nav.notices", href: "/notices" },
      { label: "Songs", labelKey: "footer.songs", href: "/songs" },
    ],
  },
  {
    title: "Site",
    titleKey: "footer.site",
    links: [
      // About / Privacy / Contact land on the home page until dedicated
      // pages exist (they are intentionally real, never `"#"`).
      { label: "About", labelKey: "footer.about", href: "/" },
      { label: "Privacy", labelKey: "footer.privacy", href: "/" },
      { label: "Contact", labelKey: "footer.contact", href: "/" },
      { label: "GitHub", labelKey: "footer.github", href: siteConfig.links.github },
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
