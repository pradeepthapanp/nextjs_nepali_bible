"use client";

import { useTranslations } from "next-intl";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** True while the delete-account mutation runs (disables the dialog). */
  loading?: boolean;
  /** Deletes the account (the page wires this to `useProfileEditor.deleteAccount`). */
  onConfirm?: () => void;
  onCancel?: () => void;
}

/**
 * DeleteAccountDialog — the "Delete Account" confirmation (the web equivalent
 * of Flutter's `_confirmDeleteAccount` `AlertDialog` in `profile_page.dart`).
 * REUSES the shared `ConfirmDialog` (destructive) — no dialog machinery is
 * duplicated. The account deletion itself is wired at the page via
 * `useProfileEditor.deleteAccount` (`AuthService.deleteMyAccount`).
 */
export function DeleteAccountDialog({
  open,
  onOpenChange,
  loading = false,
  onConfirm,
  onCancel,
}: DeleteAccountDialogProps) {
  const t = useTranslations("auth");
  const tc = useTranslations("common");
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("deleteAccountTitle")}
      description={t("deleteAccountDescription")}
      confirmLabel={t("deleteAccountConfirm")}
      cancelLabel={tc("cancel")}
      variant="destructive"
      loading={loading}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
