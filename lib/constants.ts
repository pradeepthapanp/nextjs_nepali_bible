/**
 * Application-wide runtime constants.
 *
 * Kept separate from `lib/site.ts` (which holds branding/SEO values) to avoid
 * mixing concerns. Values here are technical constants shared across modules,
 * e.g. breakpoints consumed by `hooks/use-media-query.ts` and the query client
 * configuration consumed by `lib/query-client.ts`.
 */

/** Tailwind breakpoints in pixels — the single source of truth for JS. */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

/** Default stale time (ms) for TanStack Query server-state. */
export const DEFAULT_QUERY_STALE_TIME = 60_000;

/** Default number of retries for failed TanStack Query fetches. */
export const DEFAULT_QUERY_RETRY_COUNT = 1;

/**
 * App version — mirrors the `version` in `package.json` (kept in sync
 * manually so the Settings → About page reuses the package metadata without
 * bundling the whole manifest into the client).
 */
export const APP_VERSION = "0.1.0";
