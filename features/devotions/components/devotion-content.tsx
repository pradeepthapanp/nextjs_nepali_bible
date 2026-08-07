"use client";

import { useMemo } from "react";
import { readerFontStack } from "@/utils/fonts";
import { sanitizeHtml } from "@/utils/sanitize-html";
import { useReaderSettingsContext } from "@/components/reader";
import { parseDevotionBibleLink } from "../utils";
import type { DevotionBibleReference } from "../types";
import { cn } from "@/utils/cn";

export interface DevotionContentProps {
  /** The devotion body — HTML (sanitized before rendering). */
  content: string;
  /** Called when a `B:` bible link is tapped (the page wires `openBibleReference`). */
  onOpenReference: (reference: DevotionBibleReference) => void;
  className?: string;
}

/**
 * DevotionContent — renders the devotion HTML safely with the reader settings
 * (font size / line height / paragraph spacing / alignment / family) and
 * intercepts the `B:<book> <chapter>:<verse>` links — the web port of the
 * Flutter `Html(data: devotion.devotion, onLinkTap: _parseBibleLink)`.
 *
 * Sanitizes with the SHARED `sanitizeHtml` (`@/utils/sanitize-html`) and
 * consumes the reader-settings CONTEXT (the page provides it via the shared
 * `ReaderSettingsProvider`), so it mirrors `ArticleContent` without importing
 * `@features/articles`.
 */
export function DevotionContent({
  content,
  onOpenReference,
  className,
}: DevotionContentProps) {
  const { fontSize, lineHeight, paragraphSpacing, alignment, fontFamily } =
    useReaderSettingsContext();
  const sanitized = useMemo(() => sanitizeHtml(content), [content]);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const anchor = (event.target as HTMLElement).closest("a");
    if (!anchor) return;
    const reference = parseDevotionBibleLink(
      anchor.getAttribute("href") ?? "",
    );
    if (reference) {
      event.preventDefault();
      onOpenReference(reference);
    }
  };

  return (
    <div
      className={cn("devotion-content", className)}
      style={{
        fontSize: `${fontSize}px`,
        lineHeight: `${lineHeight}`,
        textAlign: alignment,
        fontFamily: readerFontStack(fontFamily),
        ["--reader-paragraph-spacing" as string]: `${paragraphSpacing}px`,
      }}
      onClick={handleClick}
      // The HTML is sanitized (the SHARED DOMPurify wrapper) before injection —
      // the same sanitizer the Articles reader uses.
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
