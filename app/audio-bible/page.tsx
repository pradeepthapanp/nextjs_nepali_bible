import type { Metadata } from "next";
import { Suspense } from "react";
import { AudioBiblePage } from "@/features/bible/components/audio-bible-page";
import { pageDescriptions, seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Audio Bible",
  description: pageDescriptions.bible,
  path: "/audio-bible",
});

/**
 * Audio Bible route (`/audio-bible`) — choose a Bible version / book /
 * chapter and play the chapter or the whole book through the shared Audio
 * Platform. Thin server shell; `Suspense` is required because the page uses
 * `useSearchParams` (deep-linked `?book=&chapter=&v=`) and is prerendered.
 */
export default function AudioBibleRoute() {
  return (
    <Suspense fallback={null}>
      <AudioBiblePage />
    </Suspense>
  );
}
