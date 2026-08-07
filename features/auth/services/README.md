# Authentication — data layer (implemented)

`auth-service.ts` + `index.ts` are now REAL implementations, and the SHARED
`ProfileService` has been extended with `updateProfile`. All auth calls go
through ONE feature-local service (`AuthService`) plus the EXISTING shared
services — no duplication.

## AuthService (implemented — `SupabaseAuthService(client, upload)`)

| Flutter repository method | Implemented method | Backend |
| --- | --- | --- |
| `signIn(email, password)` | `signIn({ email, password })` | `client.auth.signInWithPassword` (throws on error, returns the `AuthResponse`) |
| `signUp(email, password, fullName, phoneNumber)` | `signUp({ email, password, fullName?, phoneNumber? })` | `client.auth.signUp({ options: { data: { full_name, phone_number } } })` |
| `signInWithGoogle()` | `signInWithGoogle()` | **`client.auth.signInWithOAuth({ provider: "google", options: { redirectTo: origin + "/auth/callback" } })`** — Supabase OAuth (the web form of the Flutter native GoogleSignIn→idToken flow). NOT Firebase. |
| `resendVerificationEmail(email)` | `resendVerificationEmail({ email })` | `client.auth.resend({ type: "signup", email })` |
| `verifySignupOtp(email, token)` | `verifySignupOtp({ email, token })` | `client.auth.verifyOtp({ type: "signup" })` + `markEmailVerified(user.id)` |
| `getSignupStatus(email)` | `getSignupStatus({ email })` | `client.rpc("get_signup_status", { email_to_check })` → narrowed by `toSignupStatus` |
| `updatePassword(password)` | `updatePassword({ password })` | `client.auth.updateUser({ password })` |
| — (commented out in Flutter) | `resetPasswordForEmail({ email })` | `client.auth.resetPasswordForEmail(email, { redirectTo: origin + "/reset-password" })` — **WEB-FIRST** |
| — (WEB-FIRST) | `updateEmail({ email })` | `client.auth.updateUser({ email })` |
| `markEmailVerified(userId)` | `markEmailVerified({ userId })` | `client.from("profiles").update({ email_verified: true }).eq("id", userId)` |
| `deleteMyAccount()` | `deleteMyAccount()` | `client.rpc("delete_my_account")` + `signOut()` |
| `_uploadAvatar` (avatars bucket) | `uploadAvatar({ userId, blob, fileName, onProgress? })` | **shared `UploadService.uploadFile`** at `avatars/{userId}-avatar.{ext}` (upsert = overwrite via PUT) |

Aggregate: `AuthServices { auth, profile, upload }` + `createAuthServices(client = createClient())`
(ONE shared `@supabase/ssr` client across all three) + memoized `getAuthServices()`.

## ProfileService (shared — EXTENDED, not duplicated)

The existing `@/services/profile-service` gained `updateProfile`:

```ts
interface ProfileService {
  getProfileById(userId): Promise<Profile | null>;      // existed
  updateProfile(userId, { fullName?, avatarUrl?, phone? }): Promise<void>; // NEW
}
```

`updateProfile` is a faithful port of Flutter's `updateProfile`
(`profiles.update({ full_name, avatar_url, phone }).eq('id', userId)`), writing
only the provided fields. The auth feature (and any future feature) consumes it
via the shared service — **no duplicate ProfileService**.

## UploadService (shared — reused, not duplicated)

`uploadAvatar` builds the avatar path (`avatars/{userId}-avatar.{ext}` via
`AUTH_AVATAR_UPLOAD_PATH_PREFIX` + `fileExtension`) and delegates to the SHARED
`UploadService.uploadFile` (edge-function signed PUT + progress). No upload
logic is duplicated in the auth feature.

## No invented backend

Everything maps to EXISTING Supabase APIs: `auth.*` (signInWithPassword /
signUp / signInWithOAuth / resend / verifyOtp / updateUser /
resetPasswordForEmail / signOut), the `get_signup_status` RPC, the
`delete_my_account` RPC, and the `profiles` table. No schema/table invented.

## Verify (data layer)

- one shared Supabase client (smoke-verified: auth/profile/upload all share
  `createClient()`);
- no duplicated auth/profile/upload logic (the auth service ports the Flutter
  methods 1:1; profile + upload reuse the shared services);
- Google OAuth uses Supabase `signInWithOAuth` (not Firebase);
- lint + build PASS; runtime smoke: singleton + shared client, all 13 methods
  present, `getSignupStatus` RPC (bogus → 'new'), `signIn` bogus throws
  "Invalid login credentials".
