import type { FeatureIconName } from "@/components/icons";
import type { AppMessageKey } from "@/types/navigation";

/**
 * Settings sections — the single source of truth for the Settings Center
 * (the left sidebar, the mobile drawer and the `/settings` overview). Every
 * `href` is a real route handled by `SettingsRouteDispatcher`. Labels and
 * descriptions are localized via `labelKey`/`descriptionKey`.
 */
export interface SettingsSection {
  /** URL path segment (after `/settings`), e.g. `profile`. */
  id: string;
  /** The full route, e.g. `/settings/profile`. */
  href: string;
  label: string;
  labelKey?: AppMessageKey;
  icon: FeatureIconName;
  description: string;
  descriptionKey?: AppMessageKey;
}

export const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    id: "profile",
    href: "/settings/profile",
    label: "Profile",
    labelKey: "settings.profile",
    icon: "profile",
    description: "Your name, phone, photo and personal details.",
    descriptionKey: "settings.profileDesc",
  },
  {
    id: "account",
    href: "/settings/account",
    label: "Account",
    labelKey: "settings.account",
    icon: "account",
    description: "Sign-in email, provider and security actions.",
    descriptionKey: "settings.accountDesc",
  },
  {
    id: "appearance",
    href: "/settings/appearance",
    label: "Appearance",
    labelKey: "settings.appearance",
    icon: "appearance",
    description: "App theme (system / light / dark) and reading fonts.",
    descriptionKey: "settings.appearanceDesc",
  },
  {
    id: "reading",
    href: "/settings/reading",
    label: "Reading",
    labelKey: "settings.reading",
    icon: "reading",
    description: "Font and layout preferences for Bible, articles and devotions.",
    descriptionKey: "settings.readingDesc",
  },
  {
    id: "audio",
    href: "/settings/audio",
    label: "Audio",
    labelKey: "settings.audio",
    icon: "audio",
    description: "Default playback speed, repeat mode and shuffle.",
    descriptionKey: "settings.audioDesc",
  },
  {
    id: "notifications",
    href: "/settings/notifications",
    label: "Notifications",
    labelKey: "settings.notifications",
    icon: "notifications",
    description: "Choose what you would like to be notified about.",
    descriptionKey: "settings.notificationsDesc",
  },
  {
    id: "about",
    href: "/settings/about",
    label: "About",
    labelKey: "settings.about",
    icon: "about",
    description: "Application information, website and links.",
    descriptionKey: "settings.aboutDesc",
  },
  {
    id: "privacy",
    href: "/settings/privacy",
    label: "Privacy",
    labelKey: "settings.privacy",
    icon: "privacy",
    description: "How your data is collected and used.",
    descriptionKey: "settings.privacyDesc",
  },
  {
    id: "licenses",
    href: "/settings/licenses",
    label: "Open Source Licenses",
    labelKey: "settings.licenses",
    icon: "licenses",
    description: "Licenses for the open source software we use.",
    descriptionKey: "settings.licensesDesc",
  },
];

/** Resolve the section for a `/settings` pathname (`undefined` = overview). */
export function settingsSectionForPath(
  pathname: string,
): SettingsSection | undefined {
  const rest = pathname.replace(/^\/settings\/?/, "");
  if (!rest) return undefined;
  return SETTINGS_SECTIONS.find((section) => section.id === rest);
}

/** True when the section matches the current pathname (sidebar highlight). */
export function isSettingsSectionActive(
  section: SettingsSection,
  pathname: string,
): boolean {
  return pathname === section.href;
}
