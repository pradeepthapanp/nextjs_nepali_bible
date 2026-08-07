"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthLayout } from "@/components/layouts/auth-layout";
import { useAuthActions } from "../hooks";
import { useAuthState } from "../queries";
import { getAuthErrorMessage } from "../utils";
import { SignUpForm } from "./sign-up-form";
import { SocialSignInButton } from "./social-sign-in-button";

/**
 * SignUpPage — the `/sign-up` page (the web equivalent of the sign-up branch
 * of Flutter's single `SignInSignUpPage`). COMPOSES the existing
 * `useAuthActions.signUp` / `signInWithGoogle` mutations (via `SignUpForm` +
 * `SocialSignInButton`) inside the shared `AuthLayout`. Already-signed-in
 * users are redirected to `/profile`. No Supabase, no duplicated auth logic.
 */
export function SignUpPage() {
  const router = useRouter();
  const { status, isLoaded } = useAuthState();
  const { signInWithGoogle, isPending } = useAuthActions();

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
      title="Create Account"
      description="Join नेपाली बाइबल"
    >
      <div className="space-y-6">
        <SignUpForm />

        <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground">
          <span className="h-px flex-1 bg-border" aria-hidden />
          Or
          <span className="h-px flex-1 bg-border" aria-hidden />
        </div>

        <SocialSignInButton onClick={handleGoogle} loading={isPending} />
      </div>
    </AuthLayout>
  );
}
