"use client";

import { useEffect } from "react";

/**
 * Locks body scroll while `active` is true (used by drawers and dialogs).
 * Restores the previous overflow value on cleanup.
 */
export function useLockBodyScroll(active: boolean) {
  useEffect(() => {
    if (!active) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [active]);
}
