"use client";

import { useState } from "react";
import { Eye, EyeOff, KeyRound, LogOut, ShieldCheck, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingState } from "@/components/ui/loading-state";
import { Spinner } from "@/components/ui/spinner";
import {
  AuthGate,
  DeleteAccountDialog,
  ProfileAvatar,
  ProfileForm,
} from "@features/auth";
import { useProfileEditor } from "@features/auth/hooks";
import {
  AUTH_PASSWORD_MIN_LENGTH,
} from "@features/auth/constants";
import { getAuthErrorMessage, isValidPassword } from "@features/auth/utils";

/**
 * ProfileSection — the Settings → Profile section.
 *
 * REUSES the existing profile infrastructure end to end (no duplicated profile
 * logic): `AuthGate` (protected route), `useProfileEditor` (which composes
 * `ProfileService.updateProfile`, the shared `UploadService` avatar upload,
 * and the auth mutations), `ProfileAvatar` (avatar upload), `ProfileForm`
 * (name / phone / read-only email) and `DeleteAccountDialog`. The "Change
 * password" card reuses the existing `useProfileEditor.changePassword`
 * mutation (the same `AuthService.updatePassword` flow as reset-password).
 */
export function ProfileSection() {
  return (
    <AuthGate>
      <ProfileSurface />
    </AuthGate>
  );
}

function ProfileSurface() {
  const t = useTranslations("auth");
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
  };

  const handleDelete = () => {
    setDeleteOpen(false);
    deleteAccount();
    toast.success(t("toastAccountDeleted"));
  };

  if (isLoadingProfile || !profile) {
    return <LoadingState label={t("loadingProfile")} />;
  }

  return (
    <div className="space-y-6">
      {error ? (
        <p
          role="alert"
          className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {getAuthErrorMessage(error, "Something went wrong")}
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
            {profile.fullName || "User"}
          </h2>
          <p className="text-sm text-muted-foreground">{profile.email ?? ""}</p>
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
          <CardTitle className="text-base">{t("profileSecurity")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
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

      <DeleteAccountDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        loading={isSaving}
        onConfirm={handleDelete}
      />
    </div>
  );
}

/** Change-password card — reuses the existing `useProfileEditor.changePassword`. */
function ChangePasswordForm() {
  const t = useTranslations("auth");
  const { changePassword, isSaving } = useProfileEditor();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!password) {
      setError(t("validationPasswordRequired"));
      return;
    }
    if (!isValidPassword(password)) {
      setError(t("validationPasswordMin", { min: AUTH_PASSWORD_MIN_LENGTH }));
      return;
    }
    if (confirm !== password) {
      setError(t("validationConfirmMatch"));
      return;
    }
    setError(null);
    changePassword(password);
    setPassword("");
    setConfirm("");
    toast.success(t("toastPasswordUpdated"));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="settings-new-password">{t("newPasswordLabel")}</Label>
        <div className="relative">
          <Input
            id="settings-new-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isSaving}
            aria-invalid={Boolean(error)}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            aria-label={showPassword ? t("hidePassword") : t("showPassword")}
          >
            {showPassword ? (
              <EyeOff className="size-4" aria-hidden />
            ) : (
              <Eye className="size-4" aria-hidden />
            )}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="settings-confirm-password">{t("confirmPasswordLabel")}</Label>
        <Input
          id="settings-confirm-password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          disabled={isSaving}
          aria-invalid={Boolean(error)}
        />
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}

      <Button type="submit" variant="secondary" disabled={isSaving}>
        {isSaving ? <Spinner className="size-4" /> : <KeyRound className="size-4" aria-hidden />}
        {t("profileChangePassword")}
      </Button>
    </form>
  );
}
