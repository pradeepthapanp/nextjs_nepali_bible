import { Suspense } from "react";
import { BibleHome } from "@/features/bible/components/bible-home";

/**
 * Bible route — the mount point for the reader.
 *
 * A single catch-all route covers the deep-link shapes handled by
 * `parseBibleUrl` (`/bible`, `/bible/{book}`, `/bible/{book}/{chapter}`,
 * `/bible/search`). `BibleHome` reads the path/search params itself, so this
 * page stays a thin server shell. `Suspense` is required because `BibleHome`
 * uses `useSearchParams` (via `useDeepLink`) and this page is prerendered.
 */
export default function BiblePage() {
  return (
    <Suspense fallback={null}>
      <BibleHome />
    </Suspense>
  );
}
