"use client";

import type { ReactNode } from "react";
import {
  ReaderSettingsProvider as SharedReaderSettingsProvider,
  type ReaderSettingsContextValue,
  useReaderSettingsContext,
} from "@/components/reader";
import { useArticleReaderSettings } from "../../hooks";

/**
 * Reader settings context (Articles) — provides the article-reader preferences
 * (from the persisted `useArticleReaderSettings` hook) to the reader surface
 * without prop drilling. RE-EXPORTS the SHARED context/hook (`@components/reader`)
 * and supplies the articles settings value to the generic shared
 * `ReaderSettingsProvider`, so `ArticleContent`, `ReaderToolbar` and
 * `ReaderSettingsPanel` consume ONE source (values + setters) exactly as before.
 */
export type { ReaderSettingsContextValue };

export interface ReaderSettingsProviderProps {
  children: ReactNode;
}

export function ReaderSettingsProvider({
  children,
}: ReaderSettingsProviderProps) {
  const settings = useArticleReaderSettings();
  return (
    <SharedReaderSettingsProvider value={settings}>
      {children}
    </SharedReaderSettingsProvider>
  );
}

export { useReaderSettingsContext };
