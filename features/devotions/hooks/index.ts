/**
 * Barrel for the Devotions behavior hooks.
 *
 *   use-devotion-reader-settings.ts  the persisted reader-prefs wrapper
 *   use-devotion-navigation.ts       currentLink / openBibleReference / goBack / openHome
 *   use-devotion-share.ts            share (navigator.share + clipboard fallback)
 */

export * from "./use-devotion-reader-settings";
export * from "./use-devotion-navigation";
export * from "./use-devotion-share";
