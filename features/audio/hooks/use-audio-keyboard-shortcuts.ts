"use client";

import { useEffect } from "react";
import { useAudioPlayerStore } from "../store";
import { SEEK_STEP_SECONDS } from "../types";

/**
 * useAudioKeyboardShortcuts — global playback shortcuts for the Audio
 * Platform (mounted once by the player host):
 *
 *   Space            → play / pause
 *   ← / →            → seek backward / forward 10s
 *   n / p            → next / previous
 *
 * Shortcuts are ignored while typing in a form control, or while an overlay
 * dialog is open (the Full player owns its own seek/controls in that case).
 */
export function useAudioKeyboardShortcuts(enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    const isSwallowed = (target: EventTarget | null): boolean => {
      if (!(target instanceof HTMLElement)) return false;
      if (target.closest('[role="dialog"]')) return true;
      const tag = target.tagName;
      return (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target.isContentEditable
      );
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (isSwallowed(event.target)) return;
      const store = useAudioPlayerStore.getState();
      if (!store.currentItem) return;

      switch (event.key) {
        case " ":
          event.preventDefault();
          store.togglePlayPause();
          break;
        case "ArrowLeft":
          event.preventDefault();
          store.seek(Math.max(0, store.position - SEEK_STEP_SECONDS));
          break;
        case "ArrowRight":
          event.preventDefault();
          store.seek(store.position + SEEK_STEP_SECONDS);
          break;
        case "n":
        case "N":
          store.next();
          break;
        case "p":
        case "P":
          store.previous();
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled]);
}
