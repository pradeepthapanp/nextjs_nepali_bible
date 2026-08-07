"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { settingsSectionForPath } from "../constants";
import { SettingsLayout } from "./settings-layout";
import { SettingsOverview } from "./settings-overview";
import { ProfileSection } from "./profile-section";
import { AccountSection } from "./account-section";
import { AppearanceSection } from "./appearance-section";
import { ReadingSection } from "./reading-section";
import { AudioSection } from "./audio-section";
import { NotificationsSection } from "./notifications-section";
import { AboutSection } from "./about-section";
import { PrivacySection } from "./privacy-section";
import { LicensesSection } from "./licenses-section";

/**
 * SettingsRouteDispatcher — the single dispatcher for every `/settings` route
 * (the web-first Settings Center). Reads the pathname via `usePathname`,
 * resolves the section from `SETTINGS_SECTIONS` (single source of truth) and
 * renders the matching section inside the shared `SettingsLayout`. `/settings`
 * (no segment) renders the overview. Real routes → browser back/forward work.
 */
export function SettingsRouteDispatcher() {
  const pathname = usePathname();
  const t = useTranslations();
  const section = settingsSectionForPath(pathname);

  let title = t("settings.settings");
  let body: React.ReactNode;

  if (!section) {
    body = <SettingsOverview />;
  } else {
    title = section.labelKey ? t(section.labelKey) : section.label;
    switch (section.id) {
      case "profile":
        body = <ProfileSection />;
        break;
      case "account":
        body = <AccountSection />;
        break;
      case "appearance":
        body = <AppearanceSection />;
        break;
      case "reading":
        body = <ReadingSection />;
        break;
      case "audio":
        body = <AudioSection />;
        break;
      case "notifications":
        body = <NotificationsSection />;
        break;
      case "about":
        body = <AboutSection />;
        break;
      case "privacy":
        body = <PrivacySection />;
        break;
      case "licenses":
        body = <LicensesSection />;
        break;
    }
  }

  return <SettingsLayout title={title}>{body}</SettingsLayout>;
}
