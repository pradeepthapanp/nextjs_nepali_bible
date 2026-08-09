import type Quill from "quill";
import type {
  EditorAlign,
  EditorHeadingLevel,
  EditorListType,
} from "./types";

/**
 * EditorCommands — the formatting + insertion commands (the web equivalent of
 * the Flutter `QuillController.formatSelection` / `insertEmbed` calls behind
 * `QuillSimpleToolbar`'s actions). All operations go through Quill at the
 * current selection (or the end of the document when there is none). Delta is
 * never exposed.
 */
export class EditorCommands {
  constructor(private readonly quill: Quill) {}

  /** The insertion point: the current caret, or the end of the document. */
  private get index(): number {
    return this.quill.getSelection()?.index ?? this.quill.getLength() - 1;
  }

  // ---- formatting (Flutter formatSelection) ----
  format(name: string, value: string | boolean): void {
    this.quill.format(name, value);
  }

  formatText(
    index: number,
    length: number,
    name: string,
    value: string | boolean,
  ): void {
    this.quill.formatText(index, length, name, value);
  }

  toggleBold(): void {
    this.quill.format("bold", !this.quill.getFormat().bold);
  }
  toggleItalic(): void {
    this.quill.format("italic", !this.quill.getFormat().italic);
  }
  toggleUnderline(): void {
    this.quill.format("underline", !this.quill.getFormat().underline);
  }
  toggleStrike(): void {
    this.quill.format("strike", !this.quill.getFormat().strike);
  }
  toggleCodeBlock(): void {
    this.quill.format("code-block", !this.quill.getFormat()["code-block"]);
  }
  toggleBlockquote(): void {
    this.quill.format("blockquote", !this.quill.getFormat().blockquote);
  }
  setHeading(level: EditorHeadingLevel | null): void {
    this.quill.format("header", level);
  }
  setList(type: EditorListType): void {
    this.quill.format("list", type);
  }
  setAlign(align: EditorAlign): void {
    this.quill.format("align", align);
  }
  clearFormatting(): void {
    const selection = this.quill.getSelection();
    if (selection) {
      this.quill.removeFormat(selection.index, selection.length);
    }
  }

  // ---- inserts (Flutter insertEmbed / insertText) ----
  insertText(text: string): void {
    this.quill.insertText(this.index, text, "user");
  }

  insertLink(url: string, text?: string): void {
    const label = text && text.length > 0 ? text : url;
    this.quill.insertText(this.index, label, { link: url }, "user");
    this.quill.setSelection(this.index + label.length, 0, "silent");
  }

  insertImage(url: string): void {
    this.quill.insertEmbed(this.index, "image", url, "user");
    this.quill.setSelection(this.index + 1, 0, "silent");
  }

  insertDivider(): void {
    this.quill.insertEmbed(this.index, "divider", true, "user");
    this.quill.setSelection(this.index + 1, 0, "silent");
  }

  insertHeading(level: EditorHeadingLevel): void {
    this.setHeading(level);
  }
  insertQuote(): void {
    this.toggleBlockquote();
  }
  insertCodeBlock(): void {
    this.toggleCodeBlock();
  }
  insertList(type: EditorListType): void {
    this.setList(type);
  }
}
