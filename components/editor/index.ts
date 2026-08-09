/**
 * The Shared WYSIWYG Editor Platform (Quill) — reusable editor internals.
 *
 * SINGLE CONVERSION BOUNDARY: `QuillAdapter` (through `HtmlConverter`, which it
 * exclusively owns) is the ONLY place HTML ⇄ Delta happens. Delta NEVER leaks
 * out of this folder — the public surface is HTML, selection, formatting
 * commands, undo/redo and the insert operations. Components outside the editor
 * only deal with `content: string` (HTML).
 *
 * Consumers:
 *   - `HtmlEditor` (`html-editor.tsx`) — the generic React wrapper over the
 *     platform (HTML in / HTML out, optional autosave via `onAutoSave`).
 *     Articles and Notes both use THIS — there is exactly ONE Quill editor
 *     implementation.
 *   - `EditorToolbar` — the Quill toolbar container.
 *   - `QuillAdapter` + managers — the platform internals (used by `HtmlEditor`).
 *
 *   html-editor.tsx        HtmlEditor — generic React wrapper (value/onChange/
 *                          upload/onAutoSave/imageUploadFolder)
 *   editor-toolbar.tsx     EditorToolbar — Quill toolbar container
 *   quill-adapter.ts       QuillAdapter — the single editor adapter (owns Quill,
 *                          the HTML boundary + composes the managers below)
 *   html-converter.ts      HtmlConverter — internal HTML ⇄ Delta primitives
 *                          (used ONLY by QuillAdapter)
 *   selection-manager.ts   SelectionManager — get/set selection + change events
 *   editor-history.ts      EditorHistory — undo / redo
 *   editor-commands.ts     EditorCommands — format + insert commands
 *   image-embed-handler.ts ImageEmbedHandler — inline image upload/insert
 *                          (SHARED UploadService; folder is caller-supplied)
 *   clipboard-handler.ts   ClipboardHandler — pasted-image handling
 *   auto-save-manager.ts   AutoSaveManager — debounced HTML autosave
 *   divider-blot.ts        the custom `divider` embed (`<hr>`)
 *   types.ts               EditorSelection / list / heading / align types
 */

export { QuillAdapter } from "./quill-adapter";
export type { QuillAdapterOptions } from "./quill-adapter";
export { HtmlConverter } from "./html-converter";
export { SelectionManager } from "./selection-manager";
export { EditorHistory } from "./editor-history";
export { EditorCommands } from "./editor-commands";
export { ImageEmbedHandler } from "./image-embed-handler";
export { ClipboardHandler } from "./clipboard-handler";
export { AutoSaveManager } from "./auto-save-manager";
export { ensureDividerBlot } from "./divider-blot";
export { HtmlEditor } from "./html-editor";
export type { HtmlEditorProps } from "./html-editor";
export { EditorToolbar } from "./editor-toolbar";
export type { EditorToolbarProps } from "./editor-toolbar";
export type {
  EditorSelection,
  EditorListType,
  EditorHeadingLevel,
  EditorAlign,
} from "./types";
