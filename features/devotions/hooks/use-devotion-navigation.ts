"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { buildBibleUrl } from "@features/bible/utils/deep-link";
import { parseDevotionPath } from "../utils";
import type { DevotionBibleReference } from "../types";

/**
 * useDevotionNavigation — the devotion navigation (the parsed deep link, back,
 * and opening bible references).
 *
 * Bible references REUSE the EXISTING `buildBibleUrl` deep-link helper
 * (`@features/bible/utils/deep-link`) — the user-sanctioned reuse (the
 * Community `AuthGate` precedent) — so NO bible URL logic is duplicated.
 * Flutter opened a `ReferenceVersesSheet` on `B:` links; the web navigates to
 * the passage instead (the bible feature's `goTo` precedent — a documented web
 * adaptation).
 */
export function useDevotionNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  /** The parsed devotion deep link of the current path (or null off-section). */
  const currentLink = useMemo(() => parseDevotionPath(pathname), [pathname]);

  /** Opens a bible reference (from a devotion `B:` link) at the passage. */
  const openBibleReference = useCallback(
    (reference: DevotionBibleReference) => {
      router.push(
        buildBibleUrl({
          kind: "verse",
          bookNumber: reference.bookNumber,
          chapter: reference.chapter,
          verse: reference.verse,
        }),
      );
    },
    [router],
  );

  /** Goes back when there is history, else home. */
  const goBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.replace("/");
    }
  }, [router]);

  /** Goes home (the "Read Bible" tile — Flutter `context.go(AppRoutes.home)`). */
  const openHome = useCallback(() => {
    router.push("/");
  }, [router]);

  return {
    currentLink,
    openBibleReference,
    goBack,
    openHome,
  };
}
