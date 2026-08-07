"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SearchX, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { useBibleNavigation } from "../../hooks/use-bible-navigation";
import { useVerseInteraction } from "../../hooks/use-verse-interaction";
import {
  createVerseRendererRegistry,
  VerseRenderProvider,
} from "../../components";
import { useReaderSettings, useVerseInteractionStore } from "../../store";
import type { SelectedVerse } from "../../types";
import { toNepaliDigits } from "../../utils/nepali-numbers";
import type { SearchFeature } from "../hooks";
import { SearchResultCard } from "./search-result-card";

/**
 * SearchResults — the infinite-scrolling result list.
 *
 * COMPOSITION ONLY — nothing here is duplicated:
 *   - results come from the feature (React Query infinite over the existing
 *     search service),
 *   - each card reuses the parser + `VerseContainer` + renderer registry,
 *   - selection / copy / share / context menu come from `useVerseInteraction`,
 *   - opening a result reuses `useBibleNavigation.goTo` (→ `ChapterViewer`).
 *
 * Supports infinite scrolling (IntersectionObserver sentinel) and keyboard
 * navigation (↑/↓ move the focus ring, Enter opens).
 */
export function SearchResults({ feature }: { feature: SearchFeature }) {
  const { debouncedQuery, results, search } = feature;
  const { setQuery } = search;
  const interaction = useVerseInteraction();
  const { goTo } = useBibleNavigation();
  // Reader display settings → forwarded to each card so search results reflect
  // the same red-letters / verse-number toggles as the reader, instantly.
  const redLetters = useReaderSettings((state) => state.redLetters);
  const showVerseNumbers = useReaderSettings((state) => state.showVerseNumbers);

  // Reactive selection ids (re-renders cards when the selection changes).
  // Select the stable array reference — mapping inside the selector would
  // return a fresh array every snapshot and trigger an infinite re-render.
  const selectedVerses = useVerseInteractionStore((state) => state.verses);
  const selectedIds = useMemo(
    () => selectedVerses.map((verse) => verse.id),
    [selectedVerses],
  );
  const { setChapterOrder } = interaction;

  // One shared renderer registry for every card — inline reference links
  // (commentary reflinks) inside search results open the referenced passage.
  const registry = useMemo(
    () =>
      createVerseRendererRegistry({
        onOpenReference: (target) => {
          if (!target) return;
          goTo(target.bookNumber, target.chapter, target.verse ?? 1);
        },
      }),
    [goTo],
  );

  // Selection payloads in display order (Shift+click range support).
  const ordered = useMemo<SelectedVerse[]>(
    () =>
      results.flatResults.map((result) => ({
        id: result.verse.uuid,
        bookNumber: result.verse.bookNumber,
        chapter: result.verse.chapter,
        verse: result.verse.verse,
        text: result.verse.text,
        bookName: result.book.longName,
      })),
    [results.flatResults],
  );

  useEffect(() => {
    setChapterOrder(ordered);
  }, [setChapterOrder, ordered]);

  const openAt = useCallback(
    (index: number) => {
      const result = results.flatResults[index];
      if (!result) return;
      goTo(result.verse.bookNumber, result.verse.chapter, result.verse.verse);
    },
    [results.flatResults, goTo],
  );

  // --- Keyboard navigation (↑/↓ move focus, Enter opens) ---
  const [activeIndex, setActiveIndex] = useState(-1);
  const handleListKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((index) =>
          index < results.flatResults.length - 1 ? index + 1 : index,
        );
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((index) => (index > 0 ? index - 1 : index));
      } else if (event.key === "Enter" && activeIndex >= 0) {
        event.preventDefault();
        openAt(activeIndex);
      }
    },
    [results.flatResults.length, activeIndex, openAt],
  );

  // --- Infinite scroll sentinel ---
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = results;
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // --- Loading / error / empty ---
  if (results.isLoading) {
    return <LoadingState label="खोज्दै…" />;
  }
  if (results.isError) {
    return (
      <ErrorState
        title="खोज सफल भएन"
        description="फेरि प्रयास गर्नुहोस् वा अर्को शब्द खोज्नुहोस्।"
        error={results.error as Error | undefined}
        onRetry={() => results.refetch()}
      />
    );
  }
  if (results.flatResults.length === 0) {
    return (
      <EmptyState
        icon={SearchX}
        title="कुनै नतिजा भेटिएन"
        description={`"${debouncedQuery}" को लागि कुनै पद फेला परेन।`}
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQuery("")}
          >
            <X className="size-4" aria-hidden />
            खाली गर्नुहोस्
          </Button>
        }
      />
    );
  }

  const countLabel = `${toNepaliDigits(results.total)} नतिजा`;

  return (
    <div
      onKeyDown={handleListKeyDown}
      role="region"
      aria-label="खोज नतिजा"
      className="space-y-3"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">{countLabel}</p>
        <Button variant="ghost" size="sm" onClick={() => setQuery("")}>
          <X className="size-4" aria-hidden />
          खाली गर्नुहोस्
        </Button>
      </div>

      <VerseRenderProvider registry={registry}>
        <ol className="space-y-2">
          {results.flatResults.map((result, index) => (
            <li key={`${result.version.id}:${result.verse.uuid}`}>
              <SearchResultCard
                result={result}
                query={debouncedQuery}
                redLetters={redLetters}
                showVerseNumbers={showVerseNumbers}
                selected={selectedIds.includes(result.verse.uuid)}
                active={index === activeIndex}
                onOpen={() => openAt(index)}
                onPointerDown={(event) =>
                  interaction.onVersePointerDown(ordered[index], event)
                }
                onPointerUp={(event) =>
                  interaction.onVersePointerUp(ordered[index], event)
                }
                onPointerMove={(event) =>
                  interaction.onVersePointerMove(ordered[index], event)
                }
                onKeyDown={(event) =>
                  interaction.onVerseKeyDown(ordered[index], event)
                }
                onContextMenu={(event) =>
                  interaction.onVerseContextMenu(ordered[index], event)
                }
              />
            </li>
          ))}
        </ol>
      </VerseRenderProvider>

      {results.isFetchingNextPage ? (
        <LoadingState label="थप लोड गर्दै…" />
      ) : null}
      <div ref={sentinelRef} aria-hidden className="h-px" />
    </div>
  );
}
