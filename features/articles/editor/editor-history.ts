import type Quill from "quill";

/**
 * EditorHistory — undo/redo for the editor (Flutter's
 * `QuillController.undo` / `.redo`, backed by Quill's History module).
 * Delta is never exposed.
 */
export class EditorHistory {
  constructor(private readonly quill: Quill) {}

  undo(): void {
    this.quill.history.undo();
  }

  redo(): void {
    this.quill.history.redo();
  }

  clear(): void {
    this.quill.history.clear();
  }

  /** Whether an undo step exists (Quill's `history.stack` — not on the types). */
  canUndo(): boolean {
    const stack = (
      this.quill.history as unknown as { stack?: { undo?: unknown[] } }
    ).stack;
    return (stack?.undo?.length ?? 0) > 0;
  }

  /** Whether a redo step exists. */
  canRedo(): boolean {
    const stack = (
      this.quill.history as unknown as { stack?: { redo?: unknown[] } }
    ).stack;
    return (stack?.redo?.length ?? 0) > 0;
  }
}
