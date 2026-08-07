"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ProfileUpdate } from "@/services/profile-service";
import { getAuthServices } from "../services";
import { authKeys } from "./query-keys";

/**
 * Auth mutations — every Authentication flow mutation. All calls go through
 * the `AuthService` + the SHARED `ProfileService` / `UploadService` (never
 * Supabase directly).
 *
 * The SESSION updates through the provider's `onAuthStateChange` — these
 * mutations NEVER write the session to the React Query cache (no duplicated
 * session state). Only the profile cache (`authKeys.profile`) is invalidated
 * where the profile changes (updateProfile / uploadAvatar).
 */

/** Sign in with email/password (replaces Flutter `_submit` → `signIn`). */
export function useSignIn() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      getAuthServices().auth.signIn({ email, password }),
  });
}

/** Create an account (replaces Flutter `signUp`). */
export function useSignUp() {
  return useMutation({
    mutationFn: (input: {
      email: string;
      password: string;
      fullName?: string;
      phoneNumber?: string;
    }) => getAuthServices().auth.signUp(input),
  });
}

/** Google OAuth via **Supabase** (replaces Flutter `signInWithGoogle`). */
export function useGoogleSignIn() {
  return useMutation({
    mutationFn: () => getAuthServices().auth.signInWithGoogle(),
  });
}

/** Sign out (the provider's session nulls → guards redirect). */
export function useSignOut() {
  return useMutation({
    mutationFn: () => getAuthServices().auth.signOut(),
  });
}

/** Forgot password — send the reset email (WEB-FIRST `resetPasswordForEmail`). */
export function useForgotPassword() {
  return useMutation({
    mutationFn: ({ email }: { email: string }) =>
      getAuthServices().auth.resetPasswordForEmail({ email }),
  });
}

/**
 * Change the password while signed in (replaces Flutter `updatePassword`).
 * The single password-update mutation — both the profile "change password"
 * and the recovery flow share this service call.
 */
export function useUpdatePassword() {
  return useMutation({
    mutationFn: ({ password }: { password: string }) =>
      getAuthServices().auth.updatePassword({ password }),
  });
}

/**
 * Reset password — the recovery-link flow. WEB-FIRST: the user lands on
 * `/reset-password` (Supabase recovery token in the hash) and submits the new
 * password. The service call is the SAME `updatePassword`; this hook is the
 * recovery-page alias (no duplicated mutation logic).
 */
export function useResetPassword() {
  return useUpdatePassword();
}

/** Update the account email (WEB-FIRST `auth.updateUser({ email })`). */
export function useUpdateEmail() {
  return useMutation({
    mutationFn: ({ email }: { email: string }) =>
      getAuthServices().auth.updateEmail({ email }),
  });
}

/** Edit the profile via the SHARED `ProfileService.updateProfile`. */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, patch }: { userId: string; patch: ProfileUpdate }) =>
      getAuthServices().profile.updateProfile(userId, patch),
    onSuccess: (_data, { userId }) => {
      void queryClient.invalidateQueries({ queryKey: authKeys.profile(userId) });
    },
  });
}

/** Upload the avatar via the SHARED `UploadService` (through `AuthService`). */
export function useUploadAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      blob,
      fileName,
    }: {
      userId: string;
      blob: Blob;
      fileName: string;
    }) => getAuthServices().auth.uploadAvatar({ userId, blob, fileName }),
    onSuccess: (_data, { userId }) => {
      void queryClient.invalidateQueries({ queryKey: authKeys.profile(userId) });
    },
  });
}

/** Delete the account via the `delete_my_account` RPC + sign out. */
export function useDeleteAccount() {
  return useMutation({
    mutationFn: () => getAuthServices().auth.deleteMyAccount(),
  });
}
