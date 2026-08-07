/**
 * Barrel for the reusable Bible UI components.
 *
 * Importing this module also initialises the default verse renderer registry
 * (see `registry.tsx`), so every component works standalone as well as
 * composed under a `<VerseRenderProvider>`.
 */

export * from "./context";
export * from "./registry";
export * from "./verse";
export * from "./chapter";
export * from "./reader";
export * from "./chapter-viewer";
export * from "./bible-home";
export * from "./bible-route-dispatcher";
export * from "./audio-bible-page";
export * from "./selection";
export * from "./interaction";
