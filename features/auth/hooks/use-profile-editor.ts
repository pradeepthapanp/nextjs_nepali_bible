"use client";

import { useCallback } from "react";
import { useSupabase } from "@/providers/supabase-provider";
import type { ProfileUpdate } from "@/services/profile-service";
import {
  useDeleteAccount,
  useProfile,
  useSignOut,
  useUpdateEmail,
  useUpdatePassword,
  useUpdateProfile,
  useUploadAvatar,
} from "../queries";

/**
 * useProfileEditor — the profile-editing behavior (the web equivalent of
 * `_ProfilePageState` in `profile_page.dart`: avatar, full-name/phone edit,
 * password/email change, sign out, delete account). COMPOSES the auth
 * mutations, which call the SHARED `ProfileService.updateProfile` (the single
 * profiles-table write) and the SHARED `UploadService` (through
 * `AuthService.uploadAvatar`) — no duplicated profile/upload logic.
 */
export function useProfileEditor() {
  const { session } = useSupabase();
  const userId = session?.user?.id;

  const { profile, canManage, isAuthenticated, isLoading } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const uploadAvatarMutation = useUploadAvatar();
  const signOutMutation = useSignOut();
  const deleteAccountMutation = useDeleteAccount();
  const updatePasswordMutation = useUpdatePassword();
  const updateEmailMutation = useUpdateEmail();

  /** Edit the profile (shared ProfileService.updateProfile). */
  const updateProfile = useCallback(
    (patch: ProfileUpdate) => {
      if (!userId) return;
      updateProfileMutation.mutate({ userId, patch });
    },
    [userId, updateProfileMutation],
  );

  /** Upload a new avatar (shared UploadService via AuthService.uploadAvatar). */
  const uploadAvatar = useCallback(
    (blob: Blob, fileName: string) => {
      if (!userId) return Promise.resolve(undefined);
      return uploadAvatarMutation.mutateAsync({ userId, blob, fileName });
    },
    [userId, uploadAvatarMutation],
  );

  const signOut = useCallback(() => signOutMutation.mutate(undefined), [signOutMutation]);
  const deleteAccount = useCallback(
    () => deleteAccountMutation.mutate(undefined),
    [deleteAccountMutation],
  );
  const changePassword = useCallback(
    (password: string) => updatePasswordMutation.mutate({ password }),
    [updatePasswordMutation],
  );
  const changeEmail = useCallback(
    (email: string) => updateEmailMutation.mutate({ email }),
    [updateEmailMutation],
  );

  const isSaving =
    updateProfileMutation.isPending ||
    uploadAvatarMutation.isPending ||
    signOutMutation.isPending ||
    deleteAccountMutation.isPending ||
    updatePasswordMutation.isPending ||
    updateEmailMutation.isPending;

  return {
    // Profile state.
    profile,
    canManage,
    isAuthenticated,
    isLoadingProfile: isLoading,
    // Actions.
    updateProfile,
    uploadAvatar,
    signOut,
    deleteAccount,
    changePassword,
    changeEmail,
    // Surface.
    isSaving,
    error:
      updateProfileMutation.error ??
      uploadAvatarMutation.error ??
      signOutMutation.error ??
      deleteAccountMutation.error ??
      updatePasswordMutation.error ??
      updateEmailMutation.error,
  };
}
