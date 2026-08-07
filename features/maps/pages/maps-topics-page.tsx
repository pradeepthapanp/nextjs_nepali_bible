"use client";

import { Map as MapIcon } from "lucide-react";
import { PageContainer } from "@/components/ui/page-container";
import { useMapNavigation } from "../hooks";
import { useMapTopics } from "../queries";
import { MapTopicList } from "../components";

/**
 * MapsTopicsPage — the page-level orchestration for the Maps section root
 * (the web replacement of `BibleMapsView` in `maps_view.dart`): the topics
 * list with loading/error/empty states and the topic → list navigation.
 *
 * Composes ONLY behavior/query hooks + reusable components:
 *   - `useMapTopics` (React Query) — the topics (`get_bible_map_topics` RPC);
 *   - `useMapNavigation` (behavior) — `openTopic` deep link (`/maps/topic/…`).
 * No Supabase, no duplicated logic.
 */
export function MapsTopicsPage() {
  const { data: topics, isLoading, isError, error, refetch } = useMapTopics();
  const { openTopic } = useMapNavigation();

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-center px-4 py-3">
          <h1 className="flex items-center gap-2 text-xl font-bold">
            <MapIcon className="size-5" aria-hidden />
            Maps &amp; Charts
          </h1>
        </div>
      </header>

      <PageContainer maxWidth="3xl">
        <MapTopicList
          topics={topics ?? []}
          isLoading={isLoading}
          isError={isError}
          error={error}
          onRetry={() => void refetch()}
          onOpen={(topic) => openTopic(topic)}
        />
      </PageContainer>
    </div>
  );
}
