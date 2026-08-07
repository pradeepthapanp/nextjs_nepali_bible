# Authentication — behavior hooks (implemented)

The auth behavior hooks are implemented (`use-auth.ts`, `use-auth-actions.ts`,
`use-auth-navigation.ts`, `use-profile-editor.ts`, `use-protected-route.ts`,
`use-admin-route.ts`). Each composes the query/mutation hooks + the SHARED
services + the provider — pages compose these hooks and never touch Supabase.

| Hook | Composes | Replaces |
| --- | --- | --- |
| `useAuth()` | `useAuthState` (provider) + `useProfile` (shared service) | the `authStateProvider` + `currentUserProvider` composition |
| `useAuthActions()` | the auth mutations + `useRouter` (`?next=` post-auth redirect) | the imperative `_repo` calls in the pages |
| `useAuthNavigation()` | Next router + `buildAuthUrl`/`parseAuthPath` | the Flutter `Navigator`/go_router auth flows |
| `useProfileEditor()` | `useProfile` + `useUpdateProfile`/`useUploadAvatar`/`useSignOut`/`useDeleteAccount`/`useUpdatePassword`/`useUpdateEmail` | `_ProfilePageState` |
| `useProtectedRoute()` | `useAuthState` (provider) | `AuthStatePage` guard state |
| `useAdminRoute()` | `useProtectedRoute` + `useProfile` (`canManage`) | the admin-role gate |

## Contract notes (now satisfied)

- **`useAuth`** — the consolidated surface: `{ status, isLoaded,
  isAuthenticated, session, user, profile, canManage, refetchProfile }`.
  DERIVES auth from the provider (ONE source) + profile from the shared
  `ProfileService` via `useProfile`.
- **`useAuthActions`** — `signIn`, `signUp`, `signInWithGoogle` (Supabase
  OAuth), `signOut`, `forgotPassword`, `resetPassword`, `deleteAccount`,
  `afterAuth`; reads `?next=` from `window.location` (no `useSearchParams` →
  no Suspense requirement) and redirects after sign-in / password reset.
- **`useAuthNavigation`** — `currentLink` (parsed auth deep link), `go(link)`,
  `goSignIn`/`goSignUp`/`goForgotPassword`/`goResetPassword`/`goProfile`/
  `goCallback`, `back`.
- **`useProfileEditor`** — `{ profile, canManage, updateProfile,
  uploadAvatar (shared UploadService via AuthService), signOut, deleteAccount,
  changePassword, changeEmail, isSaving }`. No duplicated profile/upload logic.
- **`useProtectedRoute`** — `{ isReady, isAuthenticated, user, status }` —
  DERIVES from the provider, does NOT create another session; a page/`AuthGate`
  redirects signed-out users to `/sign-in?next={path}`.
- **`useAdminRoute`** — `{ isReady (session + role loaded), isAuthenticated,
  canManage, isAdmin, user, profile }` via the shared `canManage` role rule.
- The `useAuthForm` hook (sign-in/up form behavior) is NOT built in this phase
  (not in the requested list) — it lands with the UI phase, composing these
  actions + the planned `useAuthFormStore`.
