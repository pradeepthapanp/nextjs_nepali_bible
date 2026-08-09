/**
 * Re-export of the shared Quill `EditorToolbar` (`@/components/editor`) — the
 * editor platform was promoted out of the Articles feature so Notes can reuse
 * the SAME toolbar + editor. This shim keeps existing Articles importers
 * (`./editor` barrel) working unchanged.
 */
export {
  EditorToolbar,
  type EditorToolbarProps,
} from "@/components/editor";
