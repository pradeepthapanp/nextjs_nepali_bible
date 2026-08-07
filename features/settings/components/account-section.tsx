"use client";

import { useState } from "react";
import { BadgeCheck, LogOut, Mail, Trash2, UserCog } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/loading-state";
import {
  AuthGate,
  DeleteAccountDialog,
} from "@features/auth";
import { useAuth, useProfileEditor } from "@features/auth/hooks";

/**
 * AccountSection — the Settings → Account section.
 *
 * REUSES the existing authentication hooks only: `useAuth` (the provider-derived
 * session + profile — one auth source) for the signed-in email / provider /
 * email-verified display, and `useProfileEditor` for the sign-out + delete
 * account actions (`AuthService.signOut` / `deleteMyAccount`). No duplicated
 * authentication logic.
 */
export function AccountSection() {
  return (
    <AuthGate>
      <AccountSurface />
    </AuthGate>
  );
}

function AccountSurface() {
  const t = useTranslations("auth");
  const { user, profile, isAuthenticated, isLoaded } = useAuth();
  const { signOut, deleteAccount, isSaving } = useProfileEditor();
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!isLoaded) {
    return <LoadingState label={t("loadingAccount")} />;
  }

  // Provider: prefer the session user's app metadata, fall back to identities.
  const provider =
    (user?.app_metadata?.provider as string | undefined) ??
    user?.identities?.[0]?.provider ??
    "email";
  const emailVerified =
    profile?.emailVerified ?? Boolean(user?.email_confirmed_at);

  const handleSignOut = () => {
    signOut();
  };

  const handleDelete = () => {
    setDeleteOpen(false);
    deleteAccount();
    toast.success(t("toastAccountDeleted"));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <UserCog className="size-4 text-primary" aria-hidden />
            {t("accountInformation")}
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          <div className="flex items-center justify-between gap-4 py-3">
            <div className="min-w-0 space-y-0.5">
              <p className="text-sm font-medium text-foreground">{t("emailLabel")}</p>
              <p className="text-sm text-muted-foreground">
                {t("accountEmailDesc")}
              </p>
            </div>
            <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <Mail className="size-4 text-muted-foreground" aria-hidden />
              {user?.email ?? "—"}
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 py-3">
            <div className="min-w-0 space-y-0.5">
              <p className="text-sm font-medium text-foreground">{t("accountProvider")}</p>
              <p className="text-sm text-muted-foreground">
                {t("accountProviderDesc")}
              </p>
            </div>
            <p className="text-sm font-medium capitalize text-foreground">
              {provider === "google" ? t("accountProviderGoogle") : t("accountProviderEmail")}
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 py-3">
            <div className="min-w-0 space-y-0.5">
              <p className="text-sm font-medium text-foreground">
                {t("accountEmailVerified")}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("accountEmailVerifiedDesc")}
              </p>
            </div>
            <span
              className={
                emailVerified
                  ? "inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200"
                  : "inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900 dark:text-amber-200"
              }
            >
              <BadgeCheck className="size-3" aria-hidden />
              {emailVerified ? t("accountVerified") : t("accountUnverified")}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("accountActions")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleSignOut}
            disabled={isSaving || !isAuthenticated}
          >
            <LogOut className="size-4" aria-hidden />
            {t("profileSignOut")}
          </Button>
          <Button
            variant="ghost"
            className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setDeleteOpen(true)}
            disabled={isSaving || !isAuthenticated}
          >
            <Trash2 className="size-4" aria-hidden />
            {t("profileDeleteAccount")}
          </Button>
        </CardContent>
      </Card>

      <DeleteAccountDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        loading={isSaving}
        onConfirm={handleDelete}
      />
    </div>
  );
}
