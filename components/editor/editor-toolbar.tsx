"use client";

import * as React from "react";
import { cn } from "@/utils/cn";

export interface EditorToolbarProps {
  /** Show the advanced formatting controls (Flutter's `_showAdvancedToolbar`). */
  advanced?: boolean;
  className?: string;
}

/**
 * EditorToolbar — the Quill 2 toolbar CONTAINER for the article editor (the
 * web equivalent of Flutter's `QuillSimpleToolbar` config, split into the
 * basic + advanced groups). The container is forwarded to `ArticleEditor`,
 * which passes it to Quill's `toolbar: { container }` so Quill binds the
 * buttons/selects (each carries the standard `ql-*` class / `value`).
 *
 * The format set mirrors `QUILL_TOOLBAR_BASIC` / `QUILL_TOOLBAR_ADVANCED`.
 * Purely presentational — the toolbar has no logic of its own.
 */
export const EditorToolbar = React.forwardRef<HTMLDivElement, EditorToolbarProps>(
  function EditorToolbar({ advanced = false, className }, ref) {
    return (
      <div ref={ref} className={cn("ql-toolbar ql-snow rounded-t-lg border-b", className)}>
        <span className="ql-formats">
          <button type="button" className="ql-bold" aria-label="Bold" />
          <button type="button" className="ql-italic" aria-label="Italic" />
          <button type="button" className="ql-underline" aria-label="Underline" />
          <button type="button" className="ql-list" value="bullet" aria-label="Bullet list" />
        </span>

        {advanced ? (
          <span className="ql-formats">
            <button type="button" className="ql-strike" aria-label="Strikethrough" />
            <button type="button" className="ql-code-block" aria-label="Code block" />
            <select className="ql-header" aria-label="Heading">
              <option value="" />
              <option value="1">H1</option>
              <option value="2">H2</option>
              <option value="3">H3</option>
            </select>
            <button type="button" className="ql-list" value="ordered" aria-label="Numbered list" />
            <button type="button" className="ql-list" value="check" aria-label="Check list" />
            <select className="ql-align" aria-label="Text alignment">
              <option value="" />
              <option value="center" />
              <option value="right" />
              <option value="justify" />
            </select>
            <button type="button" className="ql-indent" value="-1" aria-label="Decrease indent" />
            <button type="button" className="ql-indent" value="+1" aria-label="Increase indent" />
            <button type="button" className="ql-link" aria-label="Insert link" />
            <button type="button" className="ql-blockquote" aria-label="Blockquote" />
            <select className="ql-color" aria-label="Text color" />
            <select className="ql-background" aria-label="Highlight color" />
            <button type="button" className="ql-clean" aria-label="Clear formatting" />
          </span>
        ) : null}

        {/* NOTE: no ql-undo/ql-redo buttons — Quill 2's toolbar module has no
            undo/redo handlers by default, so they'd render inert and log
            "ignoring attaching to nonexistent format". Undo/redo still works
            natively via Ctrl/Cmd+Z / Ctrl/Cmd+Shift+Z (the history module). */}
      </div>
    );
  },
);
