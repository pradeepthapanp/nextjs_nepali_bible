/**
 * Barrel for the Online Songs feature types.
 *
 * `Profile`/`UserRole` and `UploadState` now live in the SHARED `@/types`
 * (profile.ts / upload.ts) — see `@/types/index.ts`. This barrel keeps only
 * the Songs-specific domain (`Audio`) + the feature constants.
 */

export * from "./audio";
export * from "./constants";
