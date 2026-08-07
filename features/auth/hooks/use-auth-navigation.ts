"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { AuthDeepLink } from "../types";
import { buildAuthUrl, parseAuthPath } from "../utils";

/**
 * useAuthNavigation — the deep-link + navigation behavior for the
 * Authentication section. COMPOSES the Next router + the pure
 * `buildAuthUrl` / `parseAuthPath` helpers (the single URL source in
 * `utils/auth-deep-link`).
 */
export function useAuthNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  /** The parsed auth deep link of the current path (or null off `/auth`). */
  const currentLink = useMemo(() => parseAuthPath(pathname), [pathname]);

  /** Push any auth deep link (builds the URL via the single helper). */
  const go = useCallback(
    (link: AuthDeepLink) => router.push(buildAuthUrl(link)),
    [router],
  );

  const goSignIn = useCallback(() => go({ kind: "signIn" }), [go]);
  const goSignUp = useCallback(() => go({ kind: "signUp" }), [go]);
  const goForgotPassword = useCallback(
    () => go({ kind: "forgotPassword" }),
    [go],
  );
  const goResetPassword = useCallback(
    () => go({ kind: "resetPassword" }),
    [go],
  );
  const goProfile = useCallback(() => go({ kind: "profile" }), [go]);
  const goCallback = useCallback(() => go({ kind: "callback" }), [go]);

  /** Back (used by the auth pages' close buttons). */
  const back = useCallback(() => router.back(), [router]);

  return {
    currentLink,
    go,
    goSignIn,
    goSignUp,
    goForgotPassword,
    goResetPassword,
    goProfile,
    goCallback,
    back,
  };
}
