"use client";

import { useAuthNavigation } from "../hooks";
import { AuthCallbackPage } from "./auth-callback-page";
import { ForgotPasswordPage } from "./forgot-password-page";
import { ProfilePage } from "./profile-page";
import { ResetPasswordPage } from "./reset-password-page";
import { SignInPage } from "./sign-in-page";
import { SignUpPage } from "./sign-up-page";

/**
 * AuthRouteDispatcher — route-level dispatch for the Authentication routes
 * (the counterpart to the Maps/Articles/Bible/Music route dispatchers). Each
 * auth route (`/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`,
 * `/profile`, `/auth/callback`) mounts a thin server shell that renders this
 * dispatcher; it reads the current path via `useAuthNavigation().currentLink`
 * (the single `parseAuthPath` URL source) and renders the matching page.
 *
 * This centralizes page selection in one place — pages are never imported
 * directly by the route shells.
 */
export function AuthRouteDispatcher() {
  const { currentLink } = useAuthNavigation();

  switch (currentLink?.kind) {
    case "signIn":
      return <SignInPage />;
    case "signUp":
      return <SignUpPage />;
    case "forgotPassword":
      return <ForgotPasswordPage />;
    case "resetPassword":
      return <ResetPasswordPage />;
    case "profile":
      return <ProfilePage />;
    case "callback":
      return <AuthCallbackPage />;
    default:
      // Off-section paths shouldn't mount here; fall back to sign-in.
      return <SignInPage />;
  }
}
