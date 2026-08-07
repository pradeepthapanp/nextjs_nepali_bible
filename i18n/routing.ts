import { defineRouting } from "next-intl/routing";

/**
 * i18n routing — the single source of truth for the supported locales.
 *
 * `localePrefix: "never"` keeps the URL clean (no `/en`/`/ne` segment): the
 * active locale is read from the `NEXT_LOCALE` cookie (set by the middleware
 * on first visit and by the `LanguageSwitcher` when the user changes it), so
 * every existing route (`/bible`, `/settings`, …) keeps working unchanged and
 * browser refresh / SSR read the persisted choice. English is the default
 * (the existing UI strings are English; Nepali is a full translation).
 */
export const routing = defineRouting({
  locales: ["en", "ne"],
  defaultLocale: "en",
  localePrefix: "never",
  localeDetection: true,
});
