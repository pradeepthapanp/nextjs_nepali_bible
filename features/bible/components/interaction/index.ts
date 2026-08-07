/**
 * Verse Interaction System — barrel.
 *
 * Also re-exported from `features/bible/components/index.ts` (the old
 * presentational `VerseSelectionOverlay` it previously clashed with was
 * removed during reader integration). Importing this barrel registers the
 * built-in plugin actions (Copy, Copy-reference, Share) at module load.
 */

export * from "./actions";
export * from "./highlight-palette";
export * from "./verse-selection-toolbar";
export * from "./verse-selection-overlay";
export * from "./verse-context-menu";
export * from "./verse-interaction-host";
