/**
 * Shared, framework-agnostic TypeScript types.
 *
 * Feature-specific domain models will live inside each feature module
 * (`features/<feature>/types.ts`) once migration begins; this file holds only
 * cross-cutting helpers used by the foundation and services layer.
 */

/** A value that may be `null` or `undefined`. */
export type Maybe<T> = T | null | undefined;

/** A value that may be `null`. */
export type Nullable<T> = T | null;

/** The normalized shape of an error returned by service-layer functions. */
export interface ServiceError {
  message: string;
  code?: string;
  details?: unknown;
}

// Shared cross-feature contracts: profiles/roles (admin gating) and the upload
// progress model. Feature-specific models stay in each feature module.
export * from "./profile";
export * from "./upload";
