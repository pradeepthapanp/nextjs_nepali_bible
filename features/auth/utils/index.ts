/**
 * Barrel for the Authentication pure utils.
 *
 *   auth-deep-link.ts   buildAuthUrl / parseAuthPath — the single URL source
 *   validation.ts       isValidEmail / isValidPassword / isValidName /
 *                       isValidNepalPhone / formatNepalPhone / getAuthErrorMessage
 *                       — faithful ports of the Flutter form validators.
 */

export * from "./auth-deep-link";
export * from "./validation";
