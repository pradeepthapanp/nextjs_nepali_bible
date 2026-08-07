"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export interface DiscardChangesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

/**
 * DiscardChangesDialog — the "you have unsaved changes" confirm for the editor
 * (replaces Flutter's `_showDiscardDialog` AlertDialog). A thin wrapper over
 * the SHARED `ConfirmDialog` — the editor page opens it when `hasChanges` and
 * the user tries to leave.
 */
export function DiscardChangesDialog({
  open,
  onOpenChange,
  onConfirm,
}: DiscardChangesDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Discard article?"
      description="You have unsaved changes. Are you sure you want to leave this page?"
      cancelLabel="Continue Editing"
      confirmLabel="Discard"
      variant="destructive"
      onConfirm={onConfirm}
    />
  );
}
