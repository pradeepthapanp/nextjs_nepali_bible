"use client";

import { useCallback, useSyncExternalStore } from "react";
import { BREAKPOINTS } from "@/lib/constants";

/**
 * Reactively tracks a CSS media query in the browser.
 *
 * Implemented with `useSyncExternalStore` — the idiomatic React way to
 * subscribe to an external store (`window.matchMedia`) without calling
 * `setState` inside effects. Returns `false` during SSR to avoid hydration
 * mismatches, then corrects itself once mounted.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const mediaQueryList = window.matchMedia(query);
      mediaQueryList.addEventListener("change", onStoreChange);
      return () => mediaQueryList.removeEventListener("change", onStoreChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [
    query,
  ]);

  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** True when the viewport is narrower than the `md` breakpoint. */
export function useIsMobile() {
  return useMediaQuery(`(max-width: ${BREAKPOINTS.md - 1}px)`);
}

/** True when the viewport is at or above the `md` breakpoint. */
export function useIsDesktop() {
  return useMediaQuery(`(min-width: ${BREAKPOINTS.md}px)`);
}
