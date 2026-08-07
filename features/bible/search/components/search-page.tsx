"use client";

import { useEffect } from "react";
import { useReaderSettings, useVerseInteractionStore } from "../../store";
import { readerFontStack } from "../../utils/fonts";
import { VerseInteractionHost } from "../../components/interaction/verse-interaction-host";
import { useSearchFeature } from "../hooks";
import { SearchBar } from "./search-bar";
import { SearchFilters } from "./search-filters";
import { SearchResults } from "./search-results";
import { SearchSuggestions } from "./search-suggestions";

/**
 * SearchPage — the /bible/search page.
 *
 * Orchestration only (no business logic here): one call to the search feature
 * hook drives instant search, debounce, deep links, history and infinite
 * scroll. The Verse Interaction Host is mounted exactly once so selection,
 * copy, share and the context menu work inside the results. When the search
 * itself changes (query / filters), any active selection is cleared.
 *
 * Replaces the Flutter search screen scaffold in `lib/bible/search_verses.dart`
 * (which was commented-out; its testament/language/priority controls are
 * mirrored by `SearchFilters`).
 */
export function SearchPage() {
  const feature = useSearchFeature();
  const clearInteraction = useVerseInteractionStore((state) => state.clear);
  // Reader Settings apply to search results too (font/line-height/paragraph
  // spacing/family/alignment) so the reading experience stays consistent
  // between the reader and search — instant, no reload.
  const settings = useReaderSettings();

  // Clear any verse selection when the search changes (new results).
  useEffect(() => {
    clearInteraction();
  }, [clearInteraction, feature.debouncedQuery, feature.filters]);

  return (
    <div
      className="mx-auto w-full max-w-3xl px-4 pb-28 pt-4 md:pt-6"
      style={
        {
          fontSize: settings.fontSize,
          lineHeight: settings.lineHeight,
          textAlign: settings.alignment,
          fontFamily: readerFontStack(settings.fontFamily),
          "--reader-paragraph-spacing": `${settings.paragraphSpacing}px`,
        } as React.CSSProperties
      }
    >
      <header className="mb-5 space-y-3">
        <h1 className="text-2xl font-bold tracking-tight">बाइबल खोज</h1>
        <SearchBar />
        <SearchFilters />
      </header>

      {feature.isReady ? (
        <SearchResults feature={feature} />
      ) : (
        <SearchSuggestions />
      )}

      <VerseInteractionHost />
    </div>
  );
}
