"use client";

import { Loader2, LogOut } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/navigation/app-header";
import { FeatureIcon } from "@/components/icons";
import { LanguageSwitcher } from "@/components/navigation/language-switcher";
import { ThemeToggle } from "@/components/navigation/theme-toggle";
import { Button } from "@/components/ui/button";
import { useAuth, useAuthActions } from "@features/auth";
import { mainNav } from "@/lib/navigation";

/**
 * LocaleSwitcher — the language toggle wired to the localization system.
 * Reads the active locale from `useLocale()` and, on change, persists the
 * `NEXT_LOCALE` cookie (the same cookie the middleware and `next-intl` read
 * for SSR) and refreshes the server components so the UI re-renders in the
 * chosen language. No duplicated translation logic — the switcher just
 * reports the value; persistence + SSR live in the i18n layer.
 */
function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();

  const handleChange = (value: string) => {
    if (value === locale) return;
    document.cookie = `NEXT_LOCALE=${encodeURIComponent(value)}; path=/; SameSite=Lax; max-age=31536000`;
    router.refresh();
  };

  return <LanguageSwitcher value={locale} onValueChange={handleChange} />;
}

/**
 * AuthNavActions — the signed-in / signed-out action cluster shown in the
 * top navigation (and mirrored in the mobile drawer by `AppHeader`).
 * - Signed out: Sign In + Sign Up links.
 * - Signed in: Profile link + Sign Out button (loading state while pending).
 * Renders nothing until the session has loaded to avoid a flash.
 */
function AuthNavActions() {
  const { isLoaded, isAuthenticated } = useAuth();
  const { signOut, isPending } = useAuthActions();
  const t = useTranslations("nav");

  if (!isLoaded) return null;

  if (!isAuthenticated) {
    return (
      <>
        <Button href="/sign-in" variant="ghost" size="sm">
          {t("signIn")}
        </Button>
        <Button href="/sign-up" size="sm">
          {t("signUp")}
        </Button>
      </>
    );
  }

  return (
    <>
      <Button href="/profile" variant="ghost" size="sm">
        <FeatureIcon name="profile" className="text-sm" aria-hidden />
        {t("profile")}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={signOut}
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <LogOut className="size-4" aria-hidden />
        )}
        {t("signOut")}
      </Button>
    </>
  );
}

/**
 * SiteNav — the global top navigation for the whole app. Composes the
 * reusable `AppHeader` (sticky bar, desktop horizontal nav, mobile
 * slide-over drawer, active-page highlight) with the auth-aware action
 * cluster, theme toggle and the localized language switcher. Mounted once in
 * the root layout so every page — including the home page — shares one nav.
 */
export function SiteNav() {
  const t = useTranslations("nav");

  return (
    <AppHeader
      navItems={mainNav}
      actions={
        <>
          <ThemeToggle />
          <LocaleSwitcher />
          <Button
            href="/settings"
            variant="ghost"
            size="icon"
            aria-label={t("settings")}
            title={t("settings")}
          >
            <FeatureIcon name="settings" aria-hidden />
          </Button>
          <AuthNavActions />
        </>
      }
    />
  );
}
