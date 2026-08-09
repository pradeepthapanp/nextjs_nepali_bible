"use client";

import { useEffect, useRef } from "react";
import type { UploadService } from "@/services/upload-service";
import { cn } from "@/utils/cn";
import { QuillAdapter } from "./quill-adapter";
import { EditorToolbar } from "./editor-toolbar";

export interface HtmlEditorProps {
  /** The document's HTML content (the canonical persisted format). */
  value: string;
  /** Emitted HTML whenever the editor content changes — NEVER Delta. */
  onChange: (html: string) => void;
  /** The SHARED `UploadService` — used only for inline image embeds. */
  upload: UploadService;
  /** Storage folder for inline image embeds (e.g. "articles", "notes"). */
  imageUploadFolder: string;
  readOnly?: boolean;
  placeholder?: string;
  /** Minimum editor height in px. */
  minHeight?: number;
  /** Show the advanced toolbar controls (Flutter `_showAdvancedToolbar`). */
  advanced?: boolean;
  /** Receives the debounced HTML autosave — the caller wires it to its own
   * editor/draft store (reuses the platform's `AutoSaveManager`; no second
   * autosave mechanism). */
  onAutoSave?: (html: string) => void;
  autosaveDebounceMs?: number;
  className?: string;
}

/**
 * HtmlEditor — the generic React wrapper over the shared Quill Editor Platform
 * (`@/components/editor`). This is the SINGLE Quill editor implementation used
 * by every feature (Articles, Notes, …). It owns NO Quill/conversion logic
 * itself: it creates a `QuillAdapter` (the single HTML ⇄ Delta boundary) on
 * mount and wires `onChange(html)`, `value`, `readOnly`, the caller-supplied
 * SHARED `UploadService` (for image embeds), the caller-supplied image folder
 * and the debounced autosave → `onAutoSave` (the caller wires it to its own
 * draft store).
 *
 * HTML IN / HTML OUT — no Delta ever leaves the component. Feature-specific
 * concerns (upload service, image folder, autosave target) are all props.
 */
export function HtmlEditor({
  value,
  onChange,
  upload,
  imageUploadFolder,
  readOnly = false,
  placeholder = "Write…",
  minHeight,
  advanced = false,
  onAutoSave,
  autosaveDebounceMs,
  className,
}: HtmlEditorProps) {
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
      upload,
      imageUploadFolder,
      onChange: (html) => {
        lastHtmlRef.current = html;
        onChangeRef.current(html);
      },
      onAutoSave,
      autosaveDebounceMs,
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
