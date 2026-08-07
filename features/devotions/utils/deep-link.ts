/**
 * Devotion deep-link helpers — the ONLY place the devotion URL is built and
 * parsed (the counterparts to `buildAuthUrl`/`parseAuthPath`). Pure +
 * framework-free so they are directly unit-testable.
 *
 * Flutter exposes exactly one route: `/devotion` (public). The web keeps the
 * single route — no catch-all needed. `buildDevotionUrl`/`parseDevotionPath`
 * exist for consistency with the other features (the route dispatcher +
 * `useDevotionNavigation` compose them).
 */

import type { DevotionDeepLink } from "../types";

/** Builds the URL for a devotion deep link (always `/devotion`). */
export function buildDevotionUrl(_link: DevotionDeepLink): string {
  return "/devotion";
}

/** Parses a pathname into a devotion deep link, or null off-section. */
export function parseDevotionPath(pathname: string): DevotionDeepLink | null {
  if (pathname === "/devotion") return { kind: "devotion" };
  return null;
}
