"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/layouts/auth-layout";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { AUTH_DEFAULT_SIGNED_IN_PATH } from "../constants";
import { useAuthState } from "../queries";

/**
 * AuthCallbackPage — the `/auth/callback` page: the Supabase OAuth +
 * password-recovery redirect target (WEB-FIRST; the web counterpart of the
 * native OAuth deep-link handling). The browser Supabase client (through the
 * existing `SupabaseProvider`) detects the `?code`/`#access_token` in the URL,
 * so this page only WAITS on the provider session (the one auth source) and
 * then redirects to `?next=` or `AUTH_DEFAULT_SIGNED_IN_PATH` (`/profile`).
 * No Supabase, no duplicated auth logic.
 */
export function AuthCallbackPage() {
  const router = useRouter();
  const { status, isLoaded } = useAuthState();
  const isAuthenticated = status === "signedIn";

  useEffect(() => {
    if (!isLoaded) return;
    if (isAuthenticated) {
      const next =
        typeof window === "undefined"
          ? null
          : new URLSearchParams(window.location.search).get("next");
      router.replace(next ?? AUTH_DEFAULT_SIGNED_IN_PATH);
    }
  }, [isLoaded, isAuthenticated, router]);

  if (!isLoaded) {
    return (
      <AuthLayout
        title="Signing you in…"
        description="Please wait while we complete your sign in."
      >
        <LoadingState label="Completing sign in…" />
      </AuthLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <AuthLayout title="Sign in failed">
        <EmptyState
          title="Unable to complete sign in"
          description="We couldn't complete the sign-in with your provider. Please try again."
          action={<Button href="/sign-in">Back to Sign In</Button>}
        />
      </AuthLayout>
    );
  }

  // Authenticated: the effect above redirects; show a brief loading state so
  // the callback page never flashes.
  return (
    <AuthLayout title="Signed in!">
      <LoadingState label="Taking you to your account…" />
    </AuthLayout>
  );
}
