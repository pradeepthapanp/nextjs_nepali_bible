import type { FeatureIconName } from "@/components/icons";
import type { MessageKeys, Messages, NestedKeyOf } from "use-intl";

/**
 * A valid translation key (from the typed `messages/en.json` catalog).
 * Used by the nav/footer data so renderers can call `t(key)` with a
 * type-checked literal.
 */
export type AppMessageKey = MessageKeys<Messages, NestedKeyOf<Messages>>;

/**
 * Shared navigation model used by SiteNav / AppHeader and the home
 * quick-access cards. Feature icons come from the shared `FeatureIcons`
 * registry (`@/components/icons`) — never raw icon imports.
 */
export interface NavItem {
  /** English label — kept as a stable key/fallback (localization via `labelKey`). */
  label: string;
  /** Localized label key (namespace included, e.g. `"nav.bible"`). */
  labelKey?: AppMessageKey;
  /** Destination. Every entry is a real application route. */
  href: string;
  /** Feature icon key (shared registry) rendered beside the label. */
  icon?: FeatureIconName;
  /** Short one-line description for the home quick-access cards. */
  description?: string;
  /** Localized description key (e.g. `"nav.bibleDesc"`), when shown. */
  descriptionKey?: AppMessageKey;
  /** Force the active state (overrides pathname matching). */
  active?: boolean;
  /** Render as an action button instead of a link (e.g. "Log out"). */
  action?: () => void;
}

/** A group of navigation items, optionally with a section title. */
export interface NavSection {
  title?: string;
  titleKey?: AppMessageKey;
  items: NavItem[];
}

/** A link entry used in footers / link groups. */
export interface FooterLink {
  label: string;
  /** Localized label key (e.g. `"footer.about"`). */
  labelKey?: AppMessageKey;
  href: string;
}

export interface FooterLinkGroup {
  title: string;
  /** Localized group-title key (e.g. `"footer.explore"`). */
  titleKey?: AppMessageKey;
  links: FooterLink[];
}
