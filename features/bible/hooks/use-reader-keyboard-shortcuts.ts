"use client";

import { useEffect } from "react";
import { useReaderSettings } from "../store";

/**
 * useReaderKeyboardShortcuts — reader settings keyboard shortcuts.
 *
 *   Ctrl/Cmd + =  → increase font size
 *   Ctrl/Cmd + -  → decrease font size
 *   Ctrl/Cmd + 0  → reset all reader settings to defaults
 *
 * Shortcuts are ignored while typing in an input/textarea/select or an
 * editable element, and the browser's default zoom is prevented for the
 * handled combinations. Mounted once by the /bible route dispatcher.
 */
export function useReaderKeyboardShortcuts() {
  const setFontSize = useReaderSettings((state) => state.setFontSize);
  const reset = useReaderSettings((state) => state.reset);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }
      const mod = event.metaKey || event.ctrlKey;
      if (!mod || event.altKey) return;
      const key = event.key.toLowerCase();

      if (key === "=" || key === "+") {
        event.preventDefault();
        const current = useReaderSettings.getState().fontSize;
        setFontSize(current + 1);
        return;
      }
      if (key === "-" || key === "_") {
        event.preventDefault();
        const current = useReaderSettings.getState().fontSize;
        setFontSize(current - 1);
        return;
      }
      if (key === "0") {
        event.preventDefault();
        reset();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setFontSize, reset]);
}
