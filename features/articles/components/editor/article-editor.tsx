"use client";

import { useEffect, useRef } from "react";
import { QuillAdapter } from "../../editor";
import { getArticleServices } from "../../services";
import { useArticleEditorStore } from "../../store";
import { EditorToolbar } from "./editor-toolbar";
import { cn } from "@/utils/cn";

export interface ArticleEditorProps {
  /** The article's HTML content (the canonical stored format). */
  value: string;
  /** Emitted HTML whenever the editor content changes — NEVER Delta. */
  onChange: (html: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  /** Minimum editor height in px. */
  minHeight?: number;
  /** Show the advanced toolbar controls (Flutter `_showAdvancedToolbar`). */
  advanced?: boolean;
  className?: string;
}

/**
 * ArticleEditor — the React wrapper over the Quill Editor Platform
 * (`features/articles/editor`). It owns NO Quill/conversion logic itself: it
 * creates a `QuillAdapter` (the single HTML ⇄ Delta boundary) on mount, wires
 * `onChange(html)`, `value`, `readOnly`, the shared `UploadService` (for image
 * embeds) and the debounced autosave → `useArticleEditorStore.update({ content })`
 * (reusing `useArticleEditor`'s persisted draft store).
 *
 * HTML IN / HTML OUT — no Delta ever leaves the component.
 */
export function ArticleEditor({
  value,
  onChange,
  readOnly = false,
  placeholder = "Write your article…",
  minHeight,
  advanced = false,
  className,
}: ArticleEditorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const adapterRef = useRef<QuillAdapter | null>(null);
  const onChangeRef = useRef(onChange);
  const lastHtmlRef = useRef(value);

  // react-hooks/refs: sync refs inside effects (declared before the readers).
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Initialize the editor platform once (on mount).
  useEffect(() => {
    const container = containerRef.current;
    const toolbar = toolbarRef.current;
    if (!container || !toolbar) return;

    const adapter = new QuillAdapter({
      container,
      toolbarContainer: toolbar,
      placeholder,
      readOnly,
      upload: getArticleServices().upload,
      onChange: (html) => {
        lastHtmlRef.current = html;
        onChangeRef.current(html);
      },
      // Autosave the HTML into the editor draft store (persisted
      // `articles.draft`) — reuses `useArticleEditor`'s store.
      onAutoSave: (html) =>
        useArticleEditorStore.getState().update({ content: html }),
      autosaveDebounceMs: 800,
    });
    adapter.loadHtml(lastHtmlRef.current);
    adapterRef.current = adapter;

    return () => {
      adapter.destroy();
      adapterRef.current = null;
    };
    // Intentionally init-once; the initial value is captured via refs above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // External `value` changes (autosave restore / programmatic) → reload silently.
  useEffect(() => {
    const adapter = adapterRef.current;
    if (!adapter || value === lastHtmlRef.current) return;
    adapter.loadHtml(value);
    lastHtmlRef.current = value;
  }, [value]);

  // readOnly changes → lock/unlock the editor.
  useEffect(() => {
    adapterRef.current?.enable(!readOnly);
  }, [readOnly]);

  return (
    <div className={cn("overflow-hidden rounded-lg border", className)}>
      <EditorToolbar ref={toolbarRef} advanced={advanced} />
      <div
        ref={containerRef}
        className="ql-container ql-snow min-h-[200px]"
        style={minHeight ? { minHeight: `${minHeight}px` } : undefined}
      />
    </div>
  );
}
