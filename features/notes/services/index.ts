import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { UploadService } from "@/services/upload-service";
import { SupabaseUploadService } from "@/services/upload-service";
import { SupabaseNoteService } from "./note-service";

export * from "./note-service";

/**
 * Aggregate of every Notes data service — the single gateway the query layer
 * talks to. Notes only need the note service + the SHARED `UploadService`
 * (inline note images go through the shared edge-function upload). No
 * profile/role service — notes are a read-own/write-own user feature (RLS).
 */
export interface NoteServices {
  note: SupabaseNoteService;
  /** The SHARED `UploadService` (same client) — for inline note images. */
  upload: UploadService;
}

/** Builds a fresh service aggregate (defaults to the browser Supabase client). */
export function createNoteServices(
  client: SupabaseClient = createClient(),
): NoteServices {
  return {
    note: new SupabaseNoteService(client),
    upload: new SupabaseUploadService(client),
  };
}

// Lazily-cached singleton for client components (React Query hooks).
let services: NoteServices | undefined;

/** Returns a memoized service aggregate (safe to call from any hook). */
export function getNoteServices(): NoteServices {
  if (!services) {
    services = createNoteServices();
  }
  return services;
}

