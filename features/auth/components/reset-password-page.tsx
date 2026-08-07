"use client";

import { KeyRound } from "lucide-react";
import { AuthLayout } from "@/components/layouts/auth-layout";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { useAuthState } from "../queries";
import { ResetPasswordForm } from "./reset-password-form";

/**
 * ResetPasswordPage — the `/reset-password` page (WEB-FIRST). The user lands
 * here from the Supabase password-reset email with the recovery token in the
 * URL hash; the provider's `getSession()` recovers that session (the one auth
 * source). Once authenticated, `ResetPasswordForm` submits the new password
 * via the existing `useAuthActions.resetPassword` mutation. Without a valid
 * recovery session, an "invalid or expired link" state is shown.
 */
export function ResetPasswordPage() {
  const { status, isLoaded } = useAuthState();
  const isAuthenticated = status === "signedIn";

  return (
    <AuthLayout
      title="Reset Password"
      description="Choose a new password for your account."
    >
      {!isLoaded ? (
        <LoadingState label="Checking your reset link…" />
      ) : isAuthenticated ? (
        <ResetPasswordForm />
      ) : (
        <EmptyState
          icon={KeyRound}
          title="Invalid or expired reset link"
          description="This password reset link is invalid or has expired. Request a new one to continue."
          action={
            <Button href="/forgot-password">Request a new link</Button>
          }
        />
      )}
    </AuthLayout>
  );
}
