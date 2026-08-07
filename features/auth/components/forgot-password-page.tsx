"use client";

import { AuthLayout } from "@/components/layouts/auth-layout";
import { ForgotPasswordForm } from "./forgot-password-form";

/**
 * ForgotPasswordPage — the `/forgot-password` page (WEB-FIRST; the Flutter
 * reset email is commented out). COMPOSES the existing
 * `useAuthActions.forgotPassword` mutation (via `ForgotPasswordForm`) inside
 * the shared `AuthLayout`. No Supabase, no duplicated auth logic.
 */
export function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Forgot Password"
      description="Enter your email and we'll send you a password reset link."
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
