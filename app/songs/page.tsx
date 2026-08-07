import { AudioListPage } from "@/features/songs/components/audio-list-page";

/**
 * Online Songs library route — the `AudiosListPage` (web `/audio_songs`).
 * Client component; no Suspense needed (no `useSearchParams`).
 */
export default function SongsPage() {
  return <AudioListPage />;
}
