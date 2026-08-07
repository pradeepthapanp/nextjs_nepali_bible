"use client";

import { useMemo } from "react";
import { readerFontStack } from "@/utils/fonts";
import { sanitizeHtml } from "../../utils/sanitize-html";
import { useReaderSettingsContext } from "../context/reader-settings-provider";
import { cn } from "@/utils/cn";

export interface ArticleContentProps {
  /** The article's HTML content (the canonical stored format). */
  content: string;
  className?: string;
}

/**
 * ArticleContent — renders an article's body. Receives HTML (the canonical
 * stored format), sanitizes it with the SHARED `sanitizeHtml` (never
 * re-implemented here) and applies the reader settings (font size / line
 * height / alignment / family) from the reader context.
 *
 * It NEVER knows Quill or Delta — HTML in, sanitized HTML out.
 */
export function ArticleContent({ content, className }: ArticleContentProps) {
  const { fontSize, lineHeight, paragraphSpacing, alignment, fontFamily } =
    useReaderSettingsContext();
  const sanitized = useMemo(() => sanitizeHtml(content), [content]);

  return (
    <div
      className={cn("article-content", className)}
      style={{
        fontSize: `${fontSize}px`,
        lineHeight: `${lineHeight}`,
        textAlign: alignment,
        fontFamily: readerFontStack(fontFamily),
        ["--reader-paragraph-spacing" as string]: `${paragraphSpacing}px`,
      }}
      // The HTML is sanitized (DOMPurify) before injection — the single
      // sanitizer shared by every article-content surface.
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
