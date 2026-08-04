"use client";

import { useEffect, type RefObject } from "react";

interface UseFocusTrapOptions {
  /** Whether the trap is active (e.g. the dialog is open). */
  active: boolean;
  /** The element that contains the focusable content. */
  containerRef: RefObject<HTMLElement | null>;
  /** Optional element to focus on open (defaults to the first focusable). */
  initialFocusRef?: RefObject<HTMLElement | null>;
}

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter(
    (el) =>
      !el.hasAttribute("hidden") && el.getAttribute("aria-hidden") !== "true",
  );
}

/**
 * Traps keyboard focus inside `containerRef` while `active`.
 * - Moves focus into the container on open.
 * - Cycles Tab / Shift+Tab within the container.
 */
export function useFocusTrap({
  active,
  containerRef,
  initialFocusRef,
}: UseFocusTrapOptions) {
  // Move focus into the container when it opens.
  useEffect(() => {
    if (!active) return;

    const container = containerRef.current;
    if (!container) return;

    const target =
      initialFocusRef?.current ??
      getFocusableElements(container)[0] ??
      container;
    target.focus();
  }, [active, containerRef, initialFocusRef]);

  // Cycle focus on Tab / Shift+Tab.
  useEffect(() => {
    if (!active) return;

    const container = containerRef.current;
    if (!container) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      const focusables = getFocusableElements(container);
      if (focusables.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const activeElement = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (activeElement === first || !container.contains(activeElement)) {
          event.preventDefault();
          last.focus();
        }
      } else if (
        activeElement === last ||
        !container.contains(activeElement)
      ) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [active, containerRef]);
}
