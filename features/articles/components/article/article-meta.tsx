"use client";

import { CalendarDays, Eye } from "lucide-react";
import type { Article } from "../../types";
import { timeAgo } from "../../utils/time-ago";
import { CategoryChip } from "./category-chip";
import { cn } from "@/utils/cn";

export interface ArticleMetaProps {
  article: Article;
  className?: string;
}

/**
 * ArticleMeta — the article metadata row (category chip, author, relative
 * time, view count). The web replacement of the Flutter `_InfoChip`-style
 * metadata in the article header/list card. Presentational.
 */
export function ArticleMeta({ article, className }: ArticleMetaProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground",
        className,
      )}
    >
      <CategoryChip category={article.category} />
      {article.authorName ? <span>{article.authorName}</span> : null}
      <span className="inline-flex items-center gap-1">
        <CalendarDays className="size-3" aria-hidden />
        {timeAgo(article.createdAt)}
      </span>
      <span className="inline-flex items-center gap-1">
        <Eye className="size-3" aria-hidden />
        {article.viewCount}
      </span>
    </div>
  );
}
