/**
 * Authentication validation helpers — faithful ports of the Flutter validators
 * in `signin_signup_page.dart` (email regex, password ≥ 6, Nepal phone = 10
 * digits starting with 9) and `profile_page.dart` (name 4–32, phone +977 10
 * digits). Planned in the architecture README to land with the UI phase.
 * Pure + framework-free so they are directly unit-testable.
 */
import {
  AUTH_NAME_MAX_LENGTH,
  AUTH_NAME_MIN_LENGTH,
  AUTH_PASSWORD_MIN_LENGTH,
  AUTH_PHONE_COUNTRY_CODE,
  AUTH_PHONE_DIGIT_LENGTH,
} from "../constants";

/** The Flutter email pattern (`signin_signup_page.dart` `_emailRegex`). */
const EMAIL_PATTERN =
  /^[a-zA-Z0-9.a-zA-Z0-9.!#$%&'*+\-/=?^_`{|}~]+@[a-zA-Z0-9]+\.[a-zA-Z]+/;

/** True for a structurally valid email (the Flutter `_emailRegex`). */
export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

/** True when the password meets the minimum length (Flutter `≥ 6`). */
export function isValidPassword(value: string): boolean {
  return value.length >= AUTH_PASSWORD_MIN_LENGTH;
}

/** True for a profile full name within 4–32 chars (`profile_page.dart`). */
export function isValidName(value: string): boolean {
  const name = value.trim();
  return (
    name.length >= AUTH_NAME_MIN_LENGTH && name.length <= AUTH_NAME_MAX_LENGTH
  );
}

/**
 * The bare Nepal mobile digits (10 digits starting with 9) extracted from a
 * value: strips separators and a leading `+977` country code.
 */
export function nepalPhoneDigits(value: string): string {
  return value.replace(/[\s()-]/g, "").replace(/^\+?977/, "");
}

/** True for a valid Nepal mobile number (10 digits starting with 9). */
export function isValidNepalPhone(value: string): boolean {
  const digits = nepalPhoneDigits(value);
  return digits.length === AUTH_PHONE_DIGIT_LENGTH && digits.startsWith("9");
}

/** Normalize to the stored form `+977` + 10 digits (the `profiles.phone`). */
export function formatNepalPhone(value: string): string {
  return `${AUTH_PHONE_COUNTRY_CODE}${nepalPhoneDigits(value)}`;
}

/** A readable message for a thrown auth error (falls back on a default). */
export function getAuthErrorMessage(
  error: unknown,
  fallback = "Something went wrong",
): string {
  return error instanceof Error && error.message ? error.message : fallback;
}
