"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Returns `true` once the component has mounted on the client.
 *
 * Implemented with `useSyncExternalStore` so it is lint-clean (no setState in
 * effects) and hydration-safe: server and the initial client render report
 * `false`, then the client re-renders to `true` after mount. Use it to defer
 * rendering browser-only UI (theme, menus) until after hydration.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
