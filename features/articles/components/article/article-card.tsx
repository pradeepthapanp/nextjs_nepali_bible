"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Article } from "../../types";
import { timeAgo } from "../../utils/time-ago";
import { DeleteArticleDialog } from "../dialogs/delete-article-dialog";
import { CategoryChip } from "./category-chip";
import { cn } from "@/utils/cn";

export interface ArticleCardProps {
  article: Article;
  onOpen?: (article: Article) => void;
  /** Show the admin Edit/Delete menu (driven by the caller's `canManage`). */
  canManage?: boolean;
  onEdit?: (article: Article) => void;
  onDelete?: (article: Article) => void;
  className?: string;
}

/**
 * ArticleCard — one article row in the list (the web replacement of the
 * `Card`/`InkWell` + `PopupMenuButton` in `articles_page.dart`): title,
 * excerpt, category chip + author + time + views, and an admin
 * Edit/Delete menu. Presentational — data + callbacks come via props.
 */
export function ArticleCard({
  article,
  onOpen,
  canManage,
  onEdit,
  onDelete,
  className,
}: ArticleCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <Card interactive className={cn("p-0", className)}>
      <div className="flex items-start gap-1 p-4">
        <button
          type="button"
          onClick={() => onOpen?.(article)}
          disabled={!onOpen}
          className="min-w-0 flex-1 text-left"
          aria-label={`Open ${article.title}`}
        >
          <h3 className="line-clamp-2 font-semibold leading-tight text-foreground">
            {article.title}
          </h3>
          {article.excerpt ? (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {article.excerpt}
            </p>
          ) : null}
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <CategoryChip category={article.category} />
            {article.authorName ? <span>{article.authorName}</span> : null}
            <span>{timeAgo(article.createdAt)}</span>
            <span>{article.viewCount} views</span>
          </div>
        </button>

        {canManage ? (
          <div className="relative shrink-0">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label="Article options"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <MoreHorizontal />
            </Button>
            {menuOpen ? (
              <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border bg-popover p-1 shadow-md">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit?.(article);
                  }}
                >
                  <Pencil /> Edit
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-destructive"
                  onClick={() => {
                    setMenuOpen(false);
                    setConfirmOpen(true);
                  }}
                >
                  <Trash2 /> Delete
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <DeleteArticleDialog
        article={article}
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={(target) => onDelete?.(target)}
      />
    </Card>
  );
}
