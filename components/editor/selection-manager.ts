import type Quill from "quill";
import type { EditorSelection } from "./types";

/** Fired when the selection changes (or becomes null when focus leaves). */
export type SelectionChangeHandler = (selection: EditorSelection | null) => void;

/**
 * SelectionManager — the editor's selection API (Flutter's
 * `QuillController.selection` + `onSelectionChanged`). Wraps Quill's selection
 * in the editor-neutral `EditorSelection` shape; Delta is never exposed.
 */
export class SelectionManager {
  constructor(
    private readonly quill: Quill,
    private readonly onSelectionChange?: SelectionChangeHandler,
  ) {
    this.quill.on("selection-change", (range) => {
      this.onSelectionChange?.(
        range ? { index: range.index, length: range.length } : null,
      );
    });
  }

  /** The current selection, or null when the editor isn't focused. */
  getSelection(): EditorSelection | null {
    const range = this.quill.getSelection();
    return range ? { index: range.index, length: range.length } : null;
  }

  /** Move the caret / select a range. */
  setSelection(index: number, length = 0): void {
    this.quill.setSelection(index, length, "silent");
  }

  /** Focus the editor. */
  focus(): void {
    this.quill.focus();
  }
}
