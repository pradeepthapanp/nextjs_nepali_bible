"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/ui/page-container";
import { useMapNavigation, useMapSearch } from "../hooks";
import { MapList, MapSearchBar } from "../components";
import type { MapTopic } from "../types";

export interface MapsListPageProps {
  /** The URL-decoded topic from `/maps/topic/{topic}`. */
  topic: MapTopic;
}

/**
 * MapsListPage — the page-level orchestration for a topic's maps list (the
 * web replacement of `MapsDetailView` in `maps_details_view.dart`): the maps
 * of a topic, the client-side title search, the "Showing X of Y" hint, the
 * empty/error states and the map → viewer navigation.
 *
 * Composes ONLY behavior/query hooks + reusable components:
 *   - `useMapSearch(topic)` — the maps query (React Query) + the CLIENT-SIDE
 *     search (exactly like Flutter `_filterTitles`) + the query surface;
 *   - `useMapNavigation` — `openMap` deep link (`/maps/view/{id}`) + `back`.
 * No Supabase, no duplicated search/navigation logic.
 */
export function MapsListPage({ topic }: MapsListPageProps) {
  const {
    query,
    setQuery,
    clear,
    maps,
    filteredMaps,
    isLoading,
    isError,
    error,
    refetch,
  } = useMapSearch(topic);
  const { openMap, back } = useMapNavigation();

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        <div className="mx-auto w-full max-w-3xl space-y-3 px-4 pb-3 pt-3">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Back to maps"
              onClick={back}
            >
              <ArrowLeft aria-hidden />
            </Button>
            <h1 className="min-w-0 flex-1 truncate text-lg font-bold">
              {topic}
            </h1>
          </div>
          <MapSearchBar
            value={query}
            onValueChange={setQuery}
            onClear={clear}
            placeholder={`Search ${topic}...`}
          />
        </div>
      </header>

      <PageContainer maxWidth="3xl">
        <MapList
          maps={filteredMaps}
          total={maps.length}
          searchQuery={query}
          isLoading={isLoading}
          isError={isError}
          error={error}
          onRetry={refetch}
          onOpen={(map) => openMap(map.id)}
        />
      </PageContainer>
    </div>
  );
}
