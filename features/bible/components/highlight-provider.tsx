"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useHighlights } from "../queries";
import type { HighlightColor } from "../types";

/**
 * Highlight rendering context.
 *
 * Provides each verse's highlight colour to every `VerseContainer` WITHOUT
 * prop drilling or modifying BibleHome / ChapterViewer / the parser. It reads
 * the existing `useHighlights` React Query hook once (mounted at the app
 * root), so the reader, search results — any surface that renders a
 * `VerseContainer` — repaints automatically when a highlight is saved or
 * removed (including the optimistic mutations).
 *
 * Mirrors the Flutter `verseHighlightMapProvider`
 * (`lib/providers/bible/verse_highlight_map_provider.dart`), which mapped
 * verseUuid → VerseHighlight for the SelectionBar's common-colour lookup.
 */

export interface HighlightContextValue {
  /** The highlight colour for a verse id, or undefined when not highlighted. */
  highlightFor: (verseId: string) => HighlightColor | undefined;
}

const HighlightContext = createContext<HighlightContextValue>({
  highlightFor: () => undefined,
});

export function HighlightProvider({ children }: { children: ReactNode }) {
  const { data: highlights } = useHighlights();

  const value = useMemo<HighlightContextValue>(() => {
    const map: Record<string, HighlightColor> = {};
    for (const highlight of highlights ?? []) {
      map[highlight.verseId] = highlight.color;
    }
    return { highlightFor: (verseId) => map[verseId] };
  }, [highlights]);

  return (
    <HighlightContext.Provider value={value}>
      {children}
    </HighlightContext.Provider>
  );
}

/** Reads the highlight map; safe default (no highlights) when unmounted. */
export function useHighlightContext(): HighlightContextValue {
  return useContext(HighlightContext);
}
