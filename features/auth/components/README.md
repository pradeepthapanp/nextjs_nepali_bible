# Authentication — components + page orchestration (implemented)

The auth components/pages are implemented. Everything reuses the shared
design system — most importantly the shared `AuthLayout`
(`@/components/layouts/auth-layout`) — plus shared `Input`/`Button`/`Label`,
`LoadingState`/`EmptyState`, the shared `ConfirmDialog` (delete account) and
the design-system primitives. No Zustand store was needed: every form owns its
transient field state locally (per the user's instruction — a store is only
created if a real shared UI state is discovered; none was).

## Reusable components (implemented)

| Flutter widget/behavior | Component | Responsibility |
| --- | --- | --- |
| `SignInSignUpPage` login fields | `SignInForm` | email/password (Flutter validators, show/hide password, "Forgot password?", "Sign Up" link); submits via `useAuthActions.signIn` |
| `SignInSignUpPage` sign-up fields | `SignUpForm` | full-name/phone(+977)/email/password (Flutter validators); submits via `useAuthActions.signUp`; "check your email" success state |
| — (WEB-FIRST; Flutter's reset email is commented out) | `ForgotPasswordForm`, `ResetPasswordForm` | forgot → `useAuthActions.forgotPassword` (`resetPasswordForEmail`); reset → `useAuthActions.resetPassword` (`updatePassword`) |
| Google button | `SocialSignInButton` | "Continue with Google" (presentational; the page wires `useAuthActions.signInWithGoogle` → Supabase OAuth) |
| `ProfilePage` body | `ProfileAvatar`/`ProfileForm` | avatar + edit badge (page uploads via `useProfileEditor.uploadAvatar` → shared `UploadService`); editable name/phone + read-only email (saves via `useProfileEditor.updateProfile` → shared `ProfileService`) |
| `AuthStatePage` (`auth_state_page.dart`) | `AuthGate` | CLIENT protected guard: uses `useProtectedRoute` (provider session); loading → signed-out redirect to `/sign-in?next={path}`; renders children when signed in |
| — | `AdminGate` | uses `useAdminRoute` (provider auth + shared `canManage`); signed-out → `/sign-in?next=`; signed-in non-admin → "Admin access required" |
| `_confirmDeleteAccount` dialog | `DeleteAccountDialog` | shared `ConfirmDialog` (destructive) |

## Page orchestrators (implemented — live in `components/` per the feature convention)

| Page | Replaces (Flutter) | Route |
| --- | --- | --- |
| `SignInPage` | `SignInSignUpPage` (login mode) | `/sign-in` |
| `SignUpPage` | `SignInSignUpPage` (sign-up mode) | `/sign-up` |
| `ForgotPasswordPage` | — (WEB-FIRST) | `/forgot-password` |
| `ResetPasswordPage` | — (WEB-FIRST; recovery link) | `/reset-password` |
| `ProfilePage` | `ProfilePage` (`profile_page.dart`) | `/profile` (protected — `AuthGate` + middleware) |
| `AuthCallbackPage` | — (the OAuth/recovery redirect target) | `/auth/callback` |
| `AuthRouteDispatcher` | — | picks the page per path via `useAuthNavigation` (`parseAuthPath`) |

Flutter's single `SignInSignUpPage` (login/sign-up toggle + OTP) is split into
`/sign-in` + `/sign-up` (the user's explicit routes). The OTP verification step
(Flutter `_showOtpField`) is intentionally NOT part of this phase's UI: the
OTP mutations (`useResendVerification`/`useVerifySignupOtp`) were not in the
requested query-layer list, so after a successful sign-up `SignUpForm` shows a
"check your email" success state and links back to sign in (the `AuthService`
OTP methods exist; thin mutations + an `OtpVerifyPanel` can be added when the
sign-up OTP step is built).

## Protected-route strategy (now fully implemented)

- **Server (middleware)** — `lib/supabase/middleware.ts` (the former
  `TODO(features/auth)`): after `supabase.auth.getUser()`, guards `/profile`
  and `/admin` → redirect to `/sign-in?next={path}` when signed out; the
  `/admin` role check via the server client (`from("profiles").select("role")`)
  redirects non-admin/editor users to `/profile`; already-signed-in users
  visiting `/sign-in`/`/sign-up` are redirected to `/profile`.
- **Client (AuthGate/AdminGate)** — the in-app guards (client navigation):
  `AuthGate` uses `useProtectedRoute` (provider session), shows loading until
  `isLoaded`, redirects signed-out users to `/sign-in?next={path}`; `AdminGate`
  uses `useAdminRoute` (provider + shared `canManage`) with an access-restricted
  state for signed-in non-admins.
- **Post-auth redirect** — after sign-in, `useAuthActions` navigates to the
  `?next=` target (or `AUTH_DEFAULT_SIGNED_IN_PATH`); `AuthCallbackPage`
  forwards to the same after the OAuth/recovery session is set.
