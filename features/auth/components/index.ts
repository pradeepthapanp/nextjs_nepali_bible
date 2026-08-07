/**
 * Barrel for the Authentication components + page orchestrators.
 *
 * Forms / buttons:
 *   social-sign-in-button.tsx   SocialSignInButton — "Continue with Google"
 *   sign-in-form.tsx            SignInForm — email/password (Flutter login branch)
 *   sign-up-form.tsx            SignUpForm — name/phone/email/password
 *   forgot-password-form.tsx    ForgotPasswordForm — reset email (WEB-FIRST)
 *   reset-password-form.tsx     ResetPasswordForm — new password (recovery link)
 * Profile:
 *   profile-avatar.tsx          ProfileAvatar — avatar + edit (shared UploadService)
 *   profile-form.tsx            ProfileForm — name/phone edit (shared ProfileService)
 *   delete-account-dialog.tsx   DeleteAccountDialog — shared ConfirmDialog
 * Guards:
 *   auth-gate.tsx               AuthGate — protected-route guard (useProtectedRoute)
 *   admin-gate.tsx              AdminGate — admin/editor guard (useAdminRoute)
 * Pages (orchestrators — compose the hooks + reusable components):
 *   sign-in-page.tsx            SignInPage       → /sign-in
 *   sign-up-page.tsx            SignUpPage       → /sign-up
 *   forgot-password-page.tsx    ForgotPasswordPage → /forgot-password
 *   reset-password-page.tsx     ResetPasswordPage  → /reset-password
 *   profile-page.tsx            ProfilePage      → /profile (protected)
 *   auth-callback-page.tsx      AuthCallbackPage   → /auth/callback
 *   auth-route-dispatcher.tsx   AuthRouteDispatcher — picks the page per path
 */

export * from "./social-sign-in-button";
export * from "./sign-in-form";
export * from "./sign-up-form";
export * from "./forgot-password-form";
export * from "./reset-password-form";
export * from "./profile-avatar";
export * from "./profile-form";
export * from "./delete-account-dialog";
export * from "./auth-gate";
export * from "./admin-gate";
export * from "./sign-in-page";
export * from "./sign-up-page";
export * from "./forgot-password-page";
export * from "./reset-password-page";
export * from "./profile-page";
export * from "./auth-callback-page";
export * from "./auth-route-dispatcher";
