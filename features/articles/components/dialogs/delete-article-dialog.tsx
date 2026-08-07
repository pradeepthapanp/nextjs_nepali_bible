"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { Article } from "../../types";

export interface DeleteArticleDialogProps {
  article: Article | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (article: Article) => void;
}

/**
 * DeleteArticleDialog — the destructive confirm for deleting an article
 * (replaces Flutter's `_confirmDelete` AlertDialog). A thin wrapper over the
 * SHARED `ConfirmDialog` (focus trap / Escape / scroll lock / motion) — no
 * dialog machinery is duplicated.
 */
export function DeleteArticleDialog({
  article,
  open,
  onOpenChange,
  onConfirm,
}: DeleteArticleDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Article"
      description={
        article
          ? `Are you sure you want to delete "${article.title}"? This action cannot be undone.`
          : undefined
      }
      variant="destructive"
      confirmLabel="Delete"
      onConfirm={() => {
        if (article) onConfirm(article);
      }}
    />
  );
}
