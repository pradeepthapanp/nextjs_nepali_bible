"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthLayout } from "@/components/layouts/auth-layout";
import { useAuthActions } from "../hooks";
import { useAuthState } from "../queries";
import { getAuthErrorMessage } from "../utils";
import { SignInForm } from "./sign-in-form";
import { SocialSignInButton } from "./social-sign-in-button";

/**
 * SignInPage — the `/sign-in` page (the web equivalent of the login branch of
 * Flutter's single `SignInSignUpPage`). COMPOSES the existing
 * `useAuthActions.signIn` / `signInWithGoogle` mutations (via `SignInForm` +
 * `SocialSignInButton`) inside the shared `AuthLayout`. Already-signed-in
 * users are redirected to `/profile` (the provider session is the one auth
 * source). No Supabase, no duplicated auth logic.
 */
export function SignInPage() {
  const router = useRouter();
  const { status, isLoaded } = useAuthState();
  const { signInWithGoogle, isPending } = useAuthActions();

  // Skip the sign-in page once a session exists (client-side; the middleware
  // does the same for full page loads).
  useEffect(() => {
    if (isLoaded && status === "signedIn") {
      router.replace("/profile");
    }
  }, [isLoaded, status, router]);

  const handleGoogle = () => {
    signInWithGoogle().catch((error) =>
      toast.error(getAuthErrorMessage(error, "Unable to sign in with Google")),
    );
  };

  return (
    <AuthLayout
      title="Sign In"
      description="Welcome back to नेपाली बाइबल"
    >
      <div className="space-y-6">
        <SignInForm />

        <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground">
          <span className="h-px flex-1 bg-border" aria-hidden />
          Or
          <span className="h-px flex-1 bg-border" aria-hidden />
        </div>

        <SocialSignInButton
          onClick={handleGoogle}
          loading={isPending}
        />
      </div>
    </AuthLayout>
  );
}
