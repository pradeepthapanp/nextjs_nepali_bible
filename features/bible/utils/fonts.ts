/**
 * Font loading for reading surfaces — SHARED (single source of truth in
 * `@/utils/fonts`). This module re-exports the shared helpers so existing
 * Bible importers (`bible-home`, `search-page`, `use-reader-appearance`) keep
 * working unchanged.
 */
export { loadGoogleFont, readerFontStack } from "@/utils/fonts";
