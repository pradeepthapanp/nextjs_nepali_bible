# Authentication — utils (implemented)

The auth pure helpers are implemented (framework-free, unit-testable —
smoke-verified 30/30, temp script deleted).

## Implemented helpers

| Helper | Flutter port | Responsibility |
| --- | --- | --- |
| `isValidEmail(email)` | the `_emailRegex` validator | standard email shape check (the Flutter regex) |
| `isValidPassword(pw)` | the password validator | ≥ `AUTH_PASSWORD_MIN_LENGTH` (6) |
| `isValidName(name)` | `_saveUserName` | 4–32 chars (profile edit) |
| `isValidNepalPhone(phone)` / `nepalPhoneDigits` / `formatNepalPhone` | the `_phoneController`/`_savePhone` validators | `+977` + 10 digits starting with `9`; normalize to the stored `+977{10}` form |
| `getAuthErrorMessage(error, fallback)` | — | a readable message for a thrown auth error |
| `buildAuthUrl(link: AuthDeepLink)` | the go_router auth paths | `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`, `/profile`, `/auth/callback` — the single place auth URLs are built |
| `parseAuthPath(pathname)` | — | parses those paths → `AuthDeepLink \| null` (exact-match the 5 routes + `/auth/…` → callback) |

The password-recovery hash handling is NOT a separate util: the provider's
`getSession()` (via the `@supabase/ssr` browser client) recovers the recovery
session from the URL hash automatically — `ResetPasswordPage` only waits on
`useAuthState` (no manual hash parsing needed).

## Reuse (nothing duplicated)

- The SHARED `Profile` type + `canManage`/`toUserRole` (`@/types/profile`), the
  shared `ProfileService` + `UploadService` — no copies.
- The shared `@/components/ui` primitives, `AuthLayout`, and the provider
  session — the auth feature composes them, never re-implements them.
