/**
 * Shared service-layer helpers (top-level `services/` = cross-feature code).
 *
 * These are generic helpers used by the feature service modules
 * (the `features/<feature>/services/` folders). They contain no feature
 * knowledge and no React — plain async/data helpers, safe for both server
 * and client.
 */

/**
 * Unwraps a Supabase query response: throws on `error`, otherwise returns the
 * `data` payload. Every service method uses this instead of repeating the
 * `if (error) throw error` pattern.
 *
 * This was extracted from `features/bible/services/helpers.ts` so both the
 * Bible and Music features share one implementation (features must not
 * import from `@features/*`).
 */
export function unwrap<T>(result: { data: T | null; error: unknown }): T {
  if (result.error) throw result.error;
  return result.data as T;
}
