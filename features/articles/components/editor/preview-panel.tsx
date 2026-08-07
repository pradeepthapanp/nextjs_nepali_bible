"use client";

import { Eye } from "lucide-react";
import { ArticleContent } from "../article/article-content";
import { cn } from "@/utils/cn";

export interface PreviewPanelProps {
  /** The article HTML to preview (the editor's current content). */
  content: string;
  className?: string;
}

/**
 * PreviewPanel — a live preview of the article content (a web refinement;
 * Flutter has no editor preview). Reuses `ArticleContent`, so sanitization is
 * the SINGLE shared `sanitizeHtml` and the reader settings apply — nothing is
 * duplicated. Presentational.
 */
export function PreviewPanel({ content, className }: PreviewPanelProps) {
  return (
    <div className={cn("rounded-xl border bg-background p-4", className)}>
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Eye className="size-4" aria-hidden /> Preview
      </div>
      <ArticleContent content={content} />
    </div>
  );
}
