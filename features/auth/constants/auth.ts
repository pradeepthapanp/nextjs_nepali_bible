/**
 * Authentication constants — the validation + flow tuning values extracted
 * from the Flutter auth implementation (`signin_signup_page.dart`,
 * `profile_page.dart`, `supabase_repository_provider.dart`). Nothing invented.
 */

/** Minimum password length (Flutter `'Minimum 6 characters'`). */
export const AUTH_PASSWORD_MIN_LENGTH = 6;

/** Nepal phone country code prefix (Flutter `prefixText: '+977 '`). */
export const AUTH_PHONE_COUNTRY_CODE = "+977";

/** Nepal mobile digits after the country code (Flutter `maxLength: 10`). */
export const AUTH_PHONE_DIGIT_LENGTH = 10;

/** Profile full-name validation (Flutter `_saveUserName`: 4–32 chars). */
export const AUTH_NAME_MIN_LENGTH = 4;
export const AUTH_NAME_MAX_LENGTH = 32;

/** Sign-up OTP length (Flutter `maxLength: 6`). */
export const AUTH_OTP_LENGTH = 6;

/** Resend-OTP countdown (Flutter `_secondsRemaining = 60`). */
export const AUTH_OTP_RESEND_SECONDS = 60;

/** Avatar picker image quality (Flutter `imageQuality: 75`). */
export const AUTH_AVATAR_QUALITY = 75;

/**
 * Avatar storage path prefix — the Flutter avatar goes to the `avatars`
 * bucket as `{userId}-avatar.{ext}` (upsert); expressed in the shared
 * `UploadService` path convention (`avatars/{userId}-avatar.{ext}`).
 */
export const AUTH_AVATAR_UPLOAD_PATH_PREFIX = "avatars";

/** The OAuth provider (Supabase `signInWithOAuth`, not Firebase). */
export const AUTH_GOOGLE_PROVIDER = "google";

/** The Supabase redirect target for OAuth + password-recovery callbacks. */
export const AUTH_CALLBACK_PATH = "/auth/callback";

/** Where signed-in users land after a successful sign-in by default. */
export const AUTH_DEFAULT_SIGNED_IN_PATH = "/profile";

/** The recovery email redirect (Supabase `resetPasswordForEmail`). */
export const AUTH_RESET_PASSWORD_REDIRECT_PATH = "/reset-password";
