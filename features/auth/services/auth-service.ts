import type { AuthResponse, SupabaseClient } from "@supabase/supabase-js";
import { unwrap } from "@/services/helpers";
import type { UploadService } from "@/services/upload-service";
import { fileExtension } from "@/utils/content-type";
import {
  AUTH_AVATAR_UPLOAD_PATH_PREFIX,
  AUTH_GOOGLE_PROVIDER,
  AUTH_GOOGLE_REDIRECT_URL,
  AUTH_RESET_PASSWORD_REDIRECT_PATH,
} from "../constants";
import type { SignupStatus } from "../types";

/**
 * Auth service — a direct port of the SupabaseRepository authentication
 * methods (`signIn`, `signUp`, `signOut`, `signInWithGoogle`,
 * `resendVerificationEmail`, `verifySignupOtp`, `getSignupStatus`,
 * `updatePassword`, `markEmailVerified`, `deleteMyAccount`) from
 * `lib/providers/supabase/supabase_repository_provider.dart`, plus three
 * WEB-FIRST methods (`resetPasswordForEmail`, `updateEmail`, `uploadAvatar`).
 *
 * Uses the EXISTING Supabase auth configured in this project (`@supabase/ssr`
 * via `@/lib/supabase/client` + `@/lib/supabase/server`) and the SHARED
 * `UploadService` for the avatar upload — no duplicated auth/upload logic.
 * Google sign-in uses **Supabase OAuth** (`signInWithOAuth`), NOT Firebase
 * (the Flutter native GoogleSignIn→idToken flow becomes web-native OAuth).
 *
 * The auth *state* (session) is NOT managed here — it flows through the
 * existing `SupabaseProvider` `onAuthStateChange` (the single auth source).
 */

/** Validates/narrows the `get_signup_status` RPC value (Flutter switch). */
export function toSignupStatus(value: unknown): SignupStatus {
  return value === "new" || value === "unverified" || value === "verified"
    ? value
    : "new";
}

export interface AuthService {
  /** Sign in with email/password (replaces `signIn`). */
  signIn(options: { email: string; password: string }): Promise<AuthResponse>;
  /**
   * Create an account (replaces `signUp`). The `full_name` / `phone_number`
   * go into the auth `data` (Flutter's `UserMetadata`), NOT the profiles row.
   */
  signUp(options: {
    email: string;
    password: string;
    fullName?: string;
    phoneNumber?: string;
  }): Promise<AuthResponse>;
  /** Sign out (replaces `signOut`). */
  signOut(): Promise<void>;
  /**
   * Google OAuth (replaces `signInWithGoogle`). WEB ADAPTATION: Flutter uses
   * the native GoogleSignIn SDK + `signInWithIdToken`; the web uses **Supabase
   * `signInWithOAuth`** (the SDK redirects to Google, back to `/auth/callback`).
   * Resolves with the OAuth result (the redirect URL, or null once the browser
   * starts redirecting) after the SDK initiates the flow.
   */
  signInWithGoogle(): Promise<{
    provider: "google";
    url: string | null;
  } | null>;
  /** Resend the sign-up verification email (replaces `resendVerificationEmail`). */
  resendVerificationEmail(options: { email: string }): Promise<void>;
  /**
   * Verify the sign-up OTP (replaces `verifySignupOtp`), then stamps
   * `email_verified` on the profile.
   */
  verifySignupOtp(options: { email: string; token: string }): Promise<void>;
  /** The `get_signup_status` RPC → 'new' | 'unverified' | 'verified'. */
  getSignupStatus(options: { email: string }): Promise<SignupStatus>;
  /** WEB-FIRST: send a password-reset email (Flutter's is commented out). */
  resetPasswordForEmail(options: { email: string }): Promise<void>;
  /** Update the password (replaces `updatePassword`). */
  updatePassword(options: { password: string }): Promise<void>;
  /** WEB-FIRST: update the account email (`auth.updateUser`). */
  updateEmail(options: { email: string }): Promise<void>;
  /** Stamp `email_verified` on the profile (replaces `markEmailVerified`). */
  markEmailVerified(options: { userId: string }): Promise<void>;
  /** Delete the account via the `delete_my_account` RPC + sign out. */
  deleteMyAccount(): Promise<void>;
  /**
   * Upload the profile avatar via the SHARED `UploadService` (replaces
   * Flutter's `_uploadAvatar` → `storage.from('avatars')`): the path is
   * `avatars/{userId}-avatar.{ext}` (faithful, upsert = overwrite via PUT).
   */
  uploadAvatar(options: {
    userId: string;
    blob: Blob;
    fileName: string;
    onProgress?: (progress: number) => void;
  }): Promise<string>;
}

/** The callback origin for OAuth/recovery (client-only; server uses the path). */
function authRedirectPath(path: string): string {
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
}

export class SupabaseAuthService implements AuthService {
  constructor(
    private readonly client: SupabaseClient,
    private readonly upload: UploadService,
  ) {}

  async signIn(options: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    const response = await this.client.auth.signInWithPassword({
      email: options.email,
      password: options.password,
    });
    if (response.error) throw response.error;
    return response;
  }

  async signUp(options: {
    email: string;
    password: string;
    fullName?: string;
    phoneNumber?: string;
  }): Promise<AuthResponse> {
    const response = await this.client.auth.signUp({
      email: options.email,
      password: options.password,
      options: {
        data: {
          full_name: options.fullName ?? null,
          phone_number: options.phoneNumber ?? null,
        },
      },
    });
    if (response.error) throw response.error;
    return response;
  }

  async signOut(): Promise<void> {
    const { error } = await this.client.auth.signOut();
    if (error) throw error;
  }

  async signInWithGoogle(): Promise<{
    provider: "google";
    url: string | null;
  } | null> {
    const response = await this.client.auth.signInWithOAuth({
      provider: AUTH_GOOGLE_PROVIDER,
      options: {
        // Fixed production callback (see AUTH_GOOGLE_REDIRECT_URL) — the
        // Supabase Google client only allowlists the prod domain, so after a
        // successful login the user lands on bachannepal.com/auth/callback.
        redirectTo: AUTH_GOOGLE_REDIRECT_URL,
      },
    });
    if (response.error) throw response.error;
    return response.data
      ? {
          provider: "google",
          url: response.data.url ? response.data.url.toString() : null,
        }
      : null;
  }

  async resendVerificationEmail(options: { email: string }): Promise<void> {
    const { error } = await this.client.auth.resend({
      type: "signup",
      email: options.email,
    });
    if (error) throw error;
  }

  async verifySignupOtp(options: {
    email: string;
    token: string;
  }): Promise<void> {
    const response = await this.client.auth.verifyOtp({
      email: options.email,
      token: options.token,
      type: "signup",
    });
    if (response.error) throw response.error;
    if (response.data?.user) {
      await this.markEmailVerified({ userId: response.data.user.id });
    }
  }

  async getSignupStatus(options: { email: string }): Promise<SignupStatus> {
    const response = await this.client.rpc("get_signup_status", {
      email_to_check: options.email,
    });
    return toSignupStatus(unwrap(response));
  }

  async resetPasswordForEmail(options: { email: string }): Promise<void> {
    const { error } = await this.client.auth.resetPasswordForEmail(
      options.email,
      {
        redirectTo: authRedirectPath(AUTH_RESET_PASSWORD_REDIRECT_PATH),
      },
    );
    if (error) throw error;
  }

  async updatePassword(options: { password: string }): Promise<void> {
    const { error } = await this.client.auth.updateUser({
      password: options.password,
    });
    if (error) throw error;
  }

  async updateEmail(options: { email: string }): Promise<void> {
    const { error } = await this.client.auth.updateUser({
      email: options.email,
    });
    if (error) throw error;
  }

  async markEmailVerified(options: { userId: string }): Promise<void> {
    const response = await this.client
      .from("profiles")
      .update({ email_verified: true })
      .eq("id", options.userId);
    unwrap(response);
  }

  async deleteMyAccount(): Promise<void> {
    unwrap(await this.client.rpc("delete_my_account"));
    await this.signOut();
  }

  async uploadAvatar(options: {
    userId: string;
    blob: Blob;
    fileName: string;
    onProgress?: (progress: number) => void;
  }): Promise<string> {
    const ext = fileExtension(options.fileName);
    const path = `${AUTH_AVATAR_UPLOAD_PATH_PREFIX}/${options.userId}-avatar.${ext}`;
    return this.upload.uploadFile(options.blob, path, options.onProgress);
  }
}
