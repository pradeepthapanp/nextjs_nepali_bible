"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { useReaderSettings } from "../store";
import { loadGoogleFont } from "../utils/fonts";

/**
 * useReaderAppearance — applies the reader appearance at the document level:
 *   - the reading theme: "system" | "light" | "dark" map to `next-themes`;
 *     "lamp" (sepia) additionally adds a `.reader-theme-lamp` class on
 *     <html> whose CSS variables (tokens.css) repaint every reader surface
 *     (BibleHome, ChapterViewer, search results, selection toolbar/context
 *     menu) instantly — no reload, no duplicated theme state.
 *   - the selected font family: loads its Google Fonts stylesheet once.
 *
 * Mounted once by the /bible route dispatcher.
 *
 * The theme is applied ONLY when the reader's own theme changes — `setTheme`
 * is held in a ref so next-themes recreating it on every global `ThemeToggle`
 * click does NOT re-trigger this effect. (Otherwise the reader would re-apply
 * its own theme over the global toggle, making that toggle appear broken on
 * the Bible page.)
 */
export function useReaderAppearance() {
  const theme = useReaderSettings((state) => state.theme);
  const fontFamily = useReaderSettings((state) => state.fontFamily);
  const { setTheme } = useTheme();

  // next-themes recreates `setTheme` whenever the app theme changes; keep the
  // latest setter in a ref so the effect below depends only on the reader
  // theme (synced in an effect — never during render).
  const setThemeRef = useRef(setTheme);
  useEffect(() => {
    setThemeRef.current = setTheme;
  }, [setTheme]);

  // Reading theme → next-themes + lamp class.
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "lamp") {
      root.classList.add("reader-theme-lamp");
      setThemeRef.current("light"); // keep the app chrome light under the sepia surface
    } else {
      root.classList.remove("reader-theme-lamp");
      setThemeRef.current(theme === "system" ? "system" : theme);
    }
  }, [theme]);

  // Font family → load the Google Fonts stylesheet when needed.
  useEffect(() => {
    loadGoogleFont(fontFamily);
  }, [fontFamily]);
}
