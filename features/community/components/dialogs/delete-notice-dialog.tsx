"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export interface DeleteNoticeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** True while the delete mutation runs. */
  loading?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

/**
 * DeleteNoticeDialog — the "Delete Notice" confirmation (the web equivalent of
 * the `NoticesPage`/`AddNewNoticePage` delete `AlertDialog`). REUSES the
 * shared `ConfirmDialog` (destructive) — no dialog machinery is duplicated.
 * The delete itself is wired at the page via `useNoticeLibrary.deleteNotice`
 * / `useNoticeDetail.deleteNotice`.
 */
export function DeleteNoticeDialog({
  open,
  onOpenChange,
  loading = false,
  onConfirm,
  onCancel,
}: DeleteNoticeDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Notice"
      description="Are you sure you want to delete this notice? This action cannot be undone."
      confirmLabel="Delete"
      cancelLabel="Cancel"
      variant="destructive"
      loading={loading}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
