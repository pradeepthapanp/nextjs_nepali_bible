import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

/**
 * next-intl request configuration — resolves the locale (from the cookie via
 * `requestLocale`, falling back to the default) and loads the matching message
 * catalog. Wired into `next.config.ts` via `createNextIntlPlugin`.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
