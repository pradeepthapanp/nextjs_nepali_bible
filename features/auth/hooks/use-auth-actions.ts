"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { AUTH_DEFAULT_SIGNED_IN_PATH } from "../constants";
import {
  useDeleteAccount,
  useForgotPassword,
  useGoogleSignIn,
  useResetPassword,
  useSignIn,
  useSignOut,
  useSignUp,
} from "../queries";

/**
 * useAuthActions — the imperative Authentication actions (the web equivalent
 * of the `_submit` / `_verifyOtp` / `_signInWithGoogle` / `_signOut` flows).
 * COMPOSES the auth mutations (which call the `AuthService`) + the router for
 * the post-auth redirect.
 *
 * The `?next=` query param (deep-linked protected-route target) is read at
 * call time from `window.location` (no `useSearchParams` → no Suspense
 * requirement) and used after a successful sign-in.
 */
export function useAuthActions() {
  const router = useRouter();
  const signInMutation = useSignIn();
  const signUpMutation = useSignUp();
  const googleSignInMutation = useGoogleSignIn();
  const signOutMutation = useSignOut();
  const forgotPasswordMutation = useForgotPassword();
  const resetPasswordMutation = useResetPassword();
  const deleteAccountMutation = useDeleteAccount();

  /** The post-auth target: `?next=` (the deep-linked page) or the default. */
  const resolveNext = useCallback((): string => {
    if (typeof window === "undefined") return AUTH_DEFAULT_SIGNED_IN_PATH;
    return (
      new URLSearchParams(window.location.search).get("next") ??
      AUTH_DEFAULT_SIGNED_IN_PATH
    );
  }, []);

  const afterAuth = useCallback(
    (target?: string) => {
      router.replace(target ?? resolveNext());
    },
    [router, resolveNext],
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      await signInMutation.mutateAsync({ email, password });
      afterAuth();
    },
    [signInMutation, afterAuth],
  );

  const signUp = useCallback(
    async (input: {
      email: string;
      password: string;
      fullName?: string;
      phoneNumber?: string;
    }) => {
      await signUpMutation.mutateAsync(input);
    },
    [signUpMutation],
  );

  const signInWithGoogle = useCallback(async () => {
    await googleSignInMutation.mutateAsync(undefined);
  }, [googleSignInMutation]);

  const signOut = useCallback(() => {
    signOutMutation.mutate(undefined);
  }, [signOutMutation]);

  const forgotPassword = useCallback(
    async (email: string) => {
      await forgotPasswordMutation.mutateAsync({ email });
    },
    [forgotPasswordMutation],
  );

  const resetPassword = useCallback(
    async (password: string) => {
      await resetPasswordMutation.mutateAsync({ password });
      afterAuth();
    },
    [resetPasswordMutation, afterAuth],
  );

  const deleteAccount = useCallback(() => {
    deleteAccountMutation.mutate(undefined);
  }, [deleteAccountMutation]);

  const isPending =
    signInMutation.isPending ||
    signUpMutation.isPending ||
    googleSignInMutation.isPending ||
    signOutMutation.isPending ||
    forgotPasswordMutation.isPending ||
    resetPasswordMutation.isPending ||
    deleteAccountMutation.isPending;

  return {
    // Actions
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    forgotPassword,
    resetPassword,
    deleteAccount,
    afterAuth,
    // Surface
    isPending,
    error:
      signInMutation.error ??
      signUpMutation.error ??
      googleSignInMutation.error ??
      signOutMutation.error ??
      forgotPasswordMutation.error ??
      resetPasswordMutation.error ??
      deleteAccountMutation.error,
  };
}
