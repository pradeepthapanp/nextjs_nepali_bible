/**
 * Shared service-layer helpers.
 *
 * `unwrap` now lives in the shared services layer (`@/services/helpers`) and
 * is re-exported here so the existing feature imports stay unchanged — there
 * is a single implementation, shared by the Bible and Music features.
 * `requiresTable` is Bible-specific diagnostics and stays local.
 */
export { unwrap } from "@/services/helpers";

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
