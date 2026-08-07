# Authentication — Zustand layer (contract)

The auth Zustand stores are **contract-only**. Following the project
convention ("only persist what survives restarts / only create stores that are
actually needed"), the auth feature has exactly ONE planned store, and it is
NON-persisted.

## `useAuthFormStore` (planned — NON-persisted)

The sign-in / sign-up / OTP form's TRANSIENT UI state (the web equivalent of
`_SignInSignUpPageState`'s fields in `signin_signup_page.dart`).

```ts
type AuthFormMode = "signIn" | "signUp" | "verifyOtp";

interface AuthFormStore {
  mode: AuthFormMode;                 // the Flutter `_isLogin` + `_showOtpField`
  email: string; password: string;
  fullName: string; phone: string;    // sign-up fields
  otp: string;                        // verification code
  isSending: boolean;                 // `_loading`
  otpSecondsRemaining: number;        // the 60s resend countdown
  pendingVerificationEmail: string | null; // `_pendingVerificationEmail`
  setMode(mode): void;
  setField(field, value): void;
  startOtp(email): void;              // reset countdown + pending email
  tickOtp(): void;                    // countdown tick
  reset(): void;
}
```

- NOT persisted (transient form state — must never survive a restart; the
  session itself is the provider's job).
- Mirrors the `useCommentComposerStore` / `useMapViewerStore` pattern (one
  NON-persisted UI store per surface).

## Deliberately NOT a store (the ONE auth source)

- **No session store.** The session is owned by the existing `SupabaseProvider`
  (`useSupabase().session` via `getSession()` + `onAuthStateChange`). The auth
  feature DERIVES `AuthState` from it; a second session store would create two
  sources of truth.
- **No profile store.** The signed-in profile lives in the React Query cache
  (`authKeys.profile(userId)`), the established convention (no server data in
  stores).
