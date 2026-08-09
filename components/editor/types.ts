/**
 * Internal types for the Quill Editor Platform.
 *
 * These are the ONLY public-shaped types the editor exposes. Quill `Delta`
 * types are used internally (inside `@/components/editor`) but never
 * appear on the public surface — the adapter exposes HTML, selection and
 * commands only.
 */

/** A collapsed or ranged selection in the document. */
export interface EditorSelection {
  /** Zero-based position in the document. */
  index: number;
  /** Length of the selection (0 = collapsed caret). */
  length: number;
}

/** The list types Quill understands (Flutter's ordered/bullet/check lists). */
export type EditorListType = "ordered" | "bullet" | "check";

/** Heading levels the commands can insert (Flutter's H1–H3). */
export type EditorHeadingLevel = 1 | 2 | 3;

/** Text alignment (Quill's `align` format). */
export type EditorAlign = "left" | "center" | "right" | "justify";
