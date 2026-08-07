"use client";

import { useArticleReaderSettingsStore } from "../store";

/**
 * useArticleReaderSettings — wraps the persisted `useArticleReaderSettingsStore`
 * and exposes the article-reader preferences (mirrors the Music
 * `useSongSettings` wrapper). All clamping happens inside the store setters
 * (which reuse the shared `@/utils/fonts` + the feature ranges), so this hook
 * never re-clamps or re-derives business logic.
 *
 * Composes ONLY the reader-settings store (Zustand, persisted under
 * `articles.reader-settings`) — the reading surface applies these values
 * directly (font size / line height / paragraph spacing / font family /
 * alignment / theme).
 */
export function useArticleReaderSettings() {
  const fontSize = useArticleReaderSettingsStore((state) => state.fontSize);
  const lineHeight = useArticleReaderSettingsStore((state) => state.lineHeight);
  const paragraphSpacing = useArticleReaderSettingsStore(
    (state) => state.paragraphSpacing,
  );
  const fontFamily = useArticleReaderSettingsStore((state) => state.fontFamily);
  const alignment = useArticleReaderSettingsStore((state) => state.alignment);
  const theme = useArticleReaderSettingsStore((state) => state.theme);
  const setFontSize = useArticleReaderSettingsStore((state) => state.setFontSize);
  const setLineHeight = useArticleReaderSettingsStore(
    (state) => state.setLineHeight,
  );
  const setParagraphSpacing = useArticleReaderSettingsStore(
    (state) => state.setParagraphSpacing,
  );
  const setFontFamily = useArticleReaderSettingsStore(
    (state) => state.setFontFamily,
  );
  const setAlignment = useArticleReaderSettingsStore(
    (state) => state.setAlignment,
  );
  const setTheme = useArticleReaderSettingsStore((state) => state.setTheme);
  const reset = useArticleReaderSettingsStore((state) => state.reset);

  return {
    fontSize,
    lineHeight,
    paragraphSpacing,
    fontFamily,
    alignment,
    theme,
    setFontSize,
    setLineHeight,
    setParagraphSpacing,
    setFontFamily,
    setAlignment,
    setTheme,
    reset,
  };
}
