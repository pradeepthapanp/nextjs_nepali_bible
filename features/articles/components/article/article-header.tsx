"use client";

import type { Article } from "../../types";
import { ArticleMeta } from "./article-meta";
import { FeaturedImage } from "../editor/featured-image";
import { cn } from "@/utils/cn";

export interface ArticleHeaderProps {
  article: Article;
  className?: string;
}

/**
 * ArticleHeader — the article-detail hero header (the web replacement of
 * Flutter's `_ArticleHeaderDelegate` / `_ArticleHeader`): a collapsing
 * featured-image banner with the title + metadata overlaid. Presentational.
 */
export function ArticleHeader({ article, className }: ArticleHeaderProps) {
  return (
    <div className={cn("relative w-full overflow-hidden", className)}>
      <FeaturedImage
        src={article.featuredImage}
        alt={article.title}
        className="h-64 w-full"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5">
        <h1 className="text-2xl font-bold leading-tight text-white drop-shadow">
          {article.title}
        </h1>
        <ArticleMeta article={article} className="mt-2 text-white/85" />
      </div>
    </div>
  );
}
