"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export interface DeletePrayerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** True while the delete mutation runs. */
  loading?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

/**
 * DeletePrayerDialog — the "Delete prayer?" confirmation (the web equivalent
 * of the `PrayersPage` delete `AlertDialog`). REUSES the shared
 * `ConfirmDialog` (destructive) — no dialog machinery is duplicated. The
 * delete itself is wired at the page via `usePrayerLibrary.deletePrayer`.
 */
export function DeletePrayerDialog({
  open,
  onOpenChange,
  loading = false,
  onConfirm,
  onCancel,
}: DeletePrayerDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete prayer?"
      description="This prayer request and all of its replies will be permanently deleted."
      confirmLabel="Delete"
      cancelLabel="Cancel"
      variant="destructive"
      loading={loading}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
