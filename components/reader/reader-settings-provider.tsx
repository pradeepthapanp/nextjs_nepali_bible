"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { ReaderSettingsContextValue } from "./types";

const ReaderSettingsContext = createContext<ReaderSettingsContextValue | undefined>(
  undefined,
);

export interface ReaderSettingsProviderProps {
  /**
   * The reader-settings value — from a persisted reader-settings store hook
   * (e.g. `useArticleReaderSettings` / `useDevotionReaderSettings`). The
   * provider is deliberately GENERIC (takes the value as a prop) so every
   * reading surface supplies its own persisted prefs; the shared
   * `ReaderToolbar`/`ReaderSettingsPanel`/`useReaderSettingsContext` then work
   * identically across features.
   */
  value: ReaderSettingsContextValue;
  children: ReactNode;
}

export function ReaderSettingsProvider({
  value,
  children,
}: ReaderSettingsProviderProps) {
  return (
    <ReaderSettingsContext.Provider value={value}>
      {children}
    </ReaderSettingsContext.Provider>
  );
}

export function useReaderSettingsContext(): ReaderSettingsContextValue {
  const context = useContext(ReaderSettingsContext);
  if (!context) {
    throw new Error(
      "useReaderSettingsContext must be used within a ReaderSettingsProvider",
    );
  }
  return context;
}
