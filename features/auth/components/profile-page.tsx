"use client";

import { useState } from "react";
import { LogOut, ShieldCheck, Trash2, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { PageContainer } from "@/components/ui/page-container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/loading-state";
import { useProfileEditor } from "../hooks";
import { getAuthErrorMessage } from "../utils";
import { AuthGate } from "./auth-gate";
import { DeleteAccountDialog } from "./delete-account-dialog";
import { ProfileAvatar } from "./profile-avatar";
import { ProfileForm } from "./profile-form";

/**
 * ProfilePage — the `/profile` page (the web equivalent of Flutter's
 * `ProfilePage` in `profile_page.dart`: avatar upload, full-name/phone edit,
 * sign out, delete account). PROTECTED: wrapped in the shared `AuthGate`
 * (which reuses `useProtectedRoute` — the provider is the one auth source).
 * COMPOSES the existing `useProfileEditor()` hook for every action:
 *   - avatar upload   → `uploadAvatar(file, name)` (SHARED `UploadService`)
 *   - name/phone edit → `updateProfile(patch)`   (SHARED `ProfileService`)
 *   - sign out        → `signOut()`              (`AuthService.signOut`)
 *   - delete account  → `deleteAccount()`        (`AuthService.deleteMyAccount`)
 * No Supabase, no duplicated profile/upload/auth logic.
 */
export function ProfilePage() {
  return (
    <AuthGate>
      <ProfileSurface />
    </AuthGate>
  );
}

function ProfileSurface() {
  const t = useTranslations("auth");
  const tc = useTranslations("common");
  const {
    profile,
    canManage,
    isAuthenticated,
    isLoadingProfile,
    isSaving,
    error,
    updateProfile,
    uploadAvatar,
    signOut,
    deleteAccount,
  } = useProfileEditor();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleSelectAvatar = (file: File) => {
    uploadAvatar(file, file.name)
      .then(() => toast.success(t("toastProfilePictureUpdated")))
      .catch((err) =>
        toast.error(getAuthErrorMessage(err, t("errorUpdatingImage"))),
      );
  };

  const handleSaveName = (fullName: string) => {
    updateProfile({ fullName });
    toast.success(t("toastProfileNameUpdated"));
  };

  const handleSavePhone = (phone: string) => {
    updateProfile({ phone });
    toast.success(t("toastPhoneUpdated"));
  };

  const handleSignOut = () => {
    signOut();
    // The provider session nulls → the AuthGate redirects to /sign-in.
  };

  const handleDelete = () => {
    setDeleteOpen(false);
    deleteAccount();
    toast.success(t("toastAccountDeleted"));
  };

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-center px-4 py-3">
          <h1 className="flex items-center gap-2 text-xl font-bold">
            <UserRound className="size-5" aria-hidden />
            {t("profileTitle")}
          </h1>
        </div>
      </header>

      <PageContainer maxWidth="md" className="py-8">
        {isLoadingProfile || !profile ? (
          <LoadingState label={t("loadingProfile")} />
        ) : (
          <div className="space-y-6">
            {error ? (
              <p
                role="alert"
                className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {getAuthErrorMessage(error, tc("error"))}
              </p>
            ) : null}

            <div className="flex flex-col items-center gap-3 text-center">
              <ProfileAvatar
                profile={profile}
                uploading={isSaving}
                onSelect={handleSelectAvatar}
              />
              <div>
                <h2 className="text-lg font-semibold">
                  {profile.fullName || t("profileRoleUser")}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {profile.email ?? ""}
                </p>
                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-900 dark:text-brand-200">
                  <ShieldCheck className="size-3" aria-hidden />
                  {canManage ? t("profileRoleAdmin") : t("profileRoleUser")}
                </span>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("profilePersonalDetails")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ProfileForm
                  profile={profile}
                  saving={isSaving}
                  onSaveName={handleSaveName}
                  onSavePhone={handleSavePhone}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("profileAccount")}</CardTitle>
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
          </div>
        )}
      </PageContainer>

      <DeleteAccountDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        loading={isSaving}
        onConfirm={handleDelete}
      />
    </div>
  );
}
