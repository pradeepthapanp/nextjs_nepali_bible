"use client";

import { HtmlEditor } from "@/components/editor";
import { ARTICLE_IMAGE_UPLOAD_FOLDER } from "../../constants";
import { getArticleServices } from "../../services";
import { useArticleEditorStore } from "../../store";

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
 * ArticleEditor — the article-specific wrapper over the SHARED WYSIWYG editor
 * (`HtmlEditor` from `@/components/editor` — the single Quill implementation,
 * also used by Notes). It owns NO Quill/conversion logic itself: it supplies
 * the article wiring — the SHARED `UploadService` (via `getArticleServices`),
 * the article image-upload folder, and the debounced autosave → the persisted
 * `useArticleEditorStore` draft (`articles.draft`). The public props are
 * unchanged from before the shared-editor refactor.
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
  return (
    <HtmlEditor
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      placeholder={placeholder}
      minHeight={minHeight}
      advanced={advanced}
      className={className}
      upload={getArticleServices().upload}
      imageUploadFolder={ARTICLE_IMAGE_UPLOAD_FOLDER}
      // Autosave the HTML into the editor draft store (persisted
      // `articles.draft`) — reuses `useArticleEditor`'s store via the
      // platform's `AutoSaveManager` (no second autosave mechanism).
      onAutoSave={(html) =>
        useArticleEditorStore.getState().update({ content: html })
      }
      autosaveDebounceMs={800}
    />
  );
}

