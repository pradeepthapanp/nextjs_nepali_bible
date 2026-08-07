import type { routing } from "@/i18n/routing";
import en from "../messages/en.json";

/**
 * Typed translations — augments `use-intl`'s `AppConfig` so every
 * `useTranslations()` / `getTranslations()` call is type-checked against the
 * English catalog (all other locales must stay structurally identical).
 */
declare module "use-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof en;
  }
}
