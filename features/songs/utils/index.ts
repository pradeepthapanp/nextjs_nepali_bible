/**
 * Barrel for the Online Songs feature utilities.
 *
 * `getContentType`/`fileBaseName`/`fileExtension` now live in shared
 * `@/utils/content-type`; `MEDIA_BASE_URL`/`mediaPathFromUrl` in `@/utils/media`.
 * The Audio Platform's `formatTime` (from `@features/audio/utils`) replaces the
 * old Songs-local `formatDuration`. This barrel keeps only the Songs-specific
 * Audio → AudioItem mapping + client search/filter helpers.
 */

export * from "./audio-item";
