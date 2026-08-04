import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { SupabaseAudioService } from "./audio-service";
import { SupabaseBibleService } from "./bible-service";
import { SupabaseBookmarkService } from "./bookmark-service";
import { SupabaseCommentaryService } from "./commentary-service";
import { SupabaseCrossReferenceService } from "./cross-reference-service";
import { SupabaseDictionaryService } from "./dictionary-service";
import { SupabaseHighlightService } from "./highlight-service";
import { SupabaseNoteService } from "./note-service";
import { LocalProgressService } from "./progress-service";
import { SupabaseSearchService } from "./search-service";

export * from "./bible-service";
export * from "./commentary-service";
export * from "./cross-reference-service";
export * from "./highlight-service";
export * from "./note-service";
export * from "./audio-service";
export * from "./search-service";
export * from "./dictionary-service";
export * from "./bookmark-service";
export * from "./progress-service";

/**
 * Aggregate of every Bible data service — the single gateway the query layer
 * (and, later, Server Components) talk to. Kept in one place so there is one
 * way to obtain services and one place to swap implementations.
 */
export interface BibleServices {
  bible: SupabaseBibleService;
  commentary: SupabaseCommentaryService;
  crossReference: SupabaseCrossReferenceService;
  highlight: SupabaseHighlightService;
  note: SupabaseNoteService;
  audio: SupabaseAudioService;
  search: SupabaseSearchService;
  dictionary: SupabaseDictionaryService;
  bookmark: SupabaseBookmarkService;
  progress: LocalProgressService;
}

/**
 * Builds a fresh service aggregate.
 * - Defaults to the browser Supabase client (`@/lib/supabase/client`) for
 *   React Query usage; pass the server client (`@/lib/supabase/server`) for
 *   Server Components / route handlers.
 * - A single `SupabaseBibleService` instance is shared by the cross-reference
 *   and search services (they reuse its `getVerses`/`getBooks`), so there is
 *   no duplicated fetching logic.
 */
export function createBibleServices(
  client: SupabaseClient = createClient(),
): BibleServices {
  const bible = new SupabaseBibleService(client);
  return {
    bible,
    commentary: new SupabaseCommentaryService(client),
    crossReference: new SupabaseCrossReferenceService(client, bible),
    highlight: new SupabaseHighlightService(client),
    note: new SupabaseNoteService(client),
    audio: new SupabaseAudioService(client),
    search: new SupabaseSearchService(client, bible),
    dictionary: new SupabaseDictionaryService(),
    bookmark: new SupabaseBookmarkService(),
    progress: new LocalProgressService(),
  };
}

// Lazily-cached singleton for client components (React Query hooks).
let services: BibleServices | undefined;

/** Returns a memoized service aggregate (safe to call from any hook). */
export function getBibleServices(): BibleServices {
  if (!services) {
    services = createBibleServices();
  }
  return services;
}
