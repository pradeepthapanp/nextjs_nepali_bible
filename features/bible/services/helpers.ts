/**
 * Shared service-layer helpers.
 */

/**
 * Unwraps a Supabase query response: throws on `error`, otherwise returns the
 * `data` payload. Every service method uses this instead of repeating the
 * `if (error) throw error` pattern.
 */
export function unwrap<T>(result: { data: T | null; error: unknown }): T {
  if (result.error) throw result.error;
  return result.data as T;
}

/**
 * Marker for capabilities that have **no backing table** in the current schema
 * (e.g. bookmarks, dictionaries). These are intentionally not implemented —
 * inventing tables/SQL is out of scope; the table must be added first.
 */
export function requiresTable(method: string, table: string): never {
  throw new Error(
    `[bible] ${method} is not available yet: no "${table}" table exists in the current schema. Add the table before implementing this method.`,
  );
}
