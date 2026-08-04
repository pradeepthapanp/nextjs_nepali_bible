/**
 * Verse Rendering Engine — public API.
 *
 *   Verse → parseVerse → VerseRenderTree → RendererRegistry → React (future)
 *
 * Export surface:
 *   - `types`       : the render-tree node model + options/plugin types
 *   - `core/*`      : tokenizer, tag registry, node helpers (unit-testable)
 *   - `engine`      : parseRichText / buildBlocks pipeline
 *   - `plugins`     : extensibility point for future features
 *   - `verse-parser`: parseVerse (port of NepParse / EngParse)
 *   - `title-parser`/`commentary-parser`/`cross-reference-parser`
 *   - `renderer/*`  : UI-agnostic renderer interfaces
 */

export * from "./types";
export * from "./core/entities";
export * from "./core/tokenizer";
export * from "./core/tag-registry";
export * from "./core/nodes";
export * from "./engine";
export * from "./plugins";
export * from "./verse-parser";
export * from "./nepali-verse-parser";
export * from "./english-verse-parser";
export * from "./title-parser";
export * from "./commentary-parser";
export * from "./cross-reference-parser";
export * from "./parse-chapter";
export * from "./renderer/types";
