/**
 * ReaderSettingsPanel — RE-EXPORTS the SHARED reader settings panel
 * (`@components/reader`) so the Articles feature keeps its documented
 * `features/articles/components/reader/ReaderSettingsPanel` import path
 * unchanged (the promotion pattern). The shared panel consumes the
 * reader-settings CONTEXT, so it works identically for Articles and Devotions.
 */
export { ReaderSettingsPanel } from "@/components/reader";
