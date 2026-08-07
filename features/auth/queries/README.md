# Authentication — React Query layer (implemented)

The cache-key hierarchy (`query-keys.ts`, `authKeys`) AND the query/mutation
hooks are implemented: `use-auth.ts` (queries) + `use-auth-mutations.ts`
(mutations). All auth calls go through the `AuthService` + the SHARED
`ProfileService` / `UploadService` — never Supabase directly in hooks.

## Queries (implemented)

| Hook | Cache key / source | Flutter provider | Service method |
| --- | --- | --- | --- |
| `useAuthState()` | the `SupabaseProvider` session (NOT a query key) | `authStateProvider` | — (derived) |
| `useCurrentUser()` | the provider session | `authStateProvider` | — (derived) |
| `useProfile()` | `authKeys.profile(userId)` | `currentUserProvider` / `profileStream` | shared `ProfileService.getProfileById` |

- **`useAuthState`** — `status = isLoaded ? (session ? "signedIn" : "signedOut") : "loading"`, derived purely from `useSupabase()` (the ONE auth source — no duplicated session state).
- **`useCurrentUser`** — `{ user, isLoaded, isAuthenticated }` (convenience over `useAuthState`).
- **`useProfile`** — shared `ProfileService`, gated `enabled: Boolean(userId)`, returns `{ profile, canManage, ... }` (the shared `canManage` role rule).

## Mutations (implemented — session synced via the provider)

| Mutation | Service method | Notes |
| --- | --- | --- |
| `useSignIn` | `AuthService.signIn` | `auth.signInWithPassword`; session updates via the provider `onAuthStateChange` — NO session cache write |
| `useSignUp` | `AuthService.signUp` | `auth.signUp` |
| `useGoogleSignIn` | `AuthService.signInWithGoogle` | **Supabase OAuth** |
| `useSignOut` | `AuthService.signOut` | → provider session null → guards redirect |
| `useForgotPassword` | `AuthService.resetPasswordForEmail` | WEB-FIRST |
| `useUpdatePassword` | `AuthService.updatePassword` | the single password mutation (profile change + recovery) |
| `useResetPassword` | `useUpdatePassword` | recovery-flow alias (same service call, no duplicated mutation logic) |
| `useUpdateEmail` | `AuthService.updateEmail` | WEB-FIRST |
| `useUpdateProfile` | shared `ProfileService.updateProfile` | invalidates `authKeys.profile(userId)` on success |
| `useUploadAvatar` | `AuthService.uploadAvatar` → shared `UploadService` | invalidates `authKeys.profile(userId)` on success |
| `useDeleteAccount` | `AuthService.deleteMyAccount` | RPC + signOut |

Auth mutations are NETWORK-FIRST and carry NO session cache writes — the
provider subscription is the single source of truth; only the profile cache is
invalidated where the profile changes.

## No duplicated profile query

The profile is fetched/updated via the SHARED `ProfileService` (one
`profiles`-table gateway) — the auth feature only owns the `authKeys.profile`
cache slot. The OTP resend/verify mutations (`useResendVerification` /
`useVerifySignupOtp` from the arch README) are NOT built in this phase (not in
the requested list) — the `AuthService` methods exist and thin mutations can be
added with the sign-up UI.
