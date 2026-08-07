/**
 * ReaderToolbar — RE-EXPORTS the SHARED reader toolbar (`@components/reader`)
 * so the Articles feature keeps its documented
 * `features/articles/components/reader/ReaderToolbar` import path unchanged
 * (the promotion pattern). The shared toolbar consumes the reader-settings
 * CONTEXT, so it works identically for Articles and Devotions.
 */
export { ReaderToolbar } from "@/components/reader";
