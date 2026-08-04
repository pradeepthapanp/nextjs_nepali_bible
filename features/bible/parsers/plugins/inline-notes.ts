import type { TagContext, VerseParserPlugin } from "../types";

/**
 * Inline-notes plugin (FUTURE).
 *
 * The basic inline note is already handled by the default `<n>` handler
 * (→ `note` node). This plugin is the extension point for richer note
 * annotations (e.g. `<note-ref id="…">` linking a note popover), added when
 * note markup exists in the dataset.
 */
export const inlineNotesPlugin: VerseParserPlugin = {
  name: "inline-notes",
  register(registry) {
    registry.register("note-ref", ({ children }: TagContext) => [
      { type: "inline-note", children },
    ]);
  },
};
