"use client";

import { useDevotionReaderSettingsStore } from "../store";

/**
 * useDevotionReaderSettings — wraps the persisted `useDevotionReaderSettingsStore`
 * and exposes the devotion reader preferences (the `useArticleReaderSettings`
 * wrapper pattern). All clamping happens inside the store setters (which reuse
 * the shared `@/utils/fonts` + the feature ranges), so this hook never
 * re-clamps or re-derives business logic.
 *
 * The return shape is the SHARED `ReaderSettingsContextValue`
 * (`@components/reader`), so the page can hand it straight to the shared
 * `ReaderSettingsProvider` and the shared `ReaderToolbar`/`ReaderSettingsPanel`
 * consume it unchanged.
 */
export function useDevotionReaderSettings() {
  const fontSize = useDevotionReaderSettingsStore((state) => state.fontSize);
  const lineHeight = useDevotionReaderSettingsStore((state) => state.lineHeight);
  const paragraphSpacing = useDevotionReaderSettingsStore(
    (state) => state.paragraphSpacing,
  );
  const fontFamily = useDevotionReaderSettingsStore((state) => state.fontFamily);
  const alignment = useDevotionReaderSettingsStore((state) => state.alignment);
  const theme = useDevotionReaderSettingsStore((state) => state.theme);
  const setFontSize = useDevotionReaderSettingsStore((state) => state.setFontSize);
  const setLineHeight = useDevotionReaderSettingsStore(
    (state) => state.setLineHeight,
  );
  const setParagraphSpacing = useDevotionReaderSettingsStore(
    (state) => state.setParagraphSpacing,
  );
  const setFontFamily = useDevotionReaderSettingsStore(
    (state) => state.setFontFamily,
  );
  const setAlignment = useDevotionReaderSettingsStore(
    (state) => state.setAlignment,
  );
  const setTheme = useDevotionReaderSettingsStore((state) => state.setTheme);
  const reset = useDevotionReaderSettingsStore((state) => state.reset);

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
