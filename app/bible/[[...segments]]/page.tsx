import { Suspense } from "react";
import { BibleRouteDispatcher } from "@/features/bible/components/bible-route-dispatcher";

/**
 * Bible route — the mount point for the reader and search.
 *
 * A single catch-all route covers the deep-link shapes handled by
 * `parseBibleUrl` (`/bible`, `/bible/{book}`, `/bible/{book}/{chapter}`,
 * `/bible/search`). `BibleRouteDispatcher` routes `/bible/search` to the
 * Search feature and everything else to `BibleHome`; both read the
 * path/search params themselves, so this page stays a thin server shell.
 * `Suspense` is required because the children use `useSearchParams`
 * (via `useDeepLink`) and this page is prerendered.
 */
export default function BiblePage() {
  return (
    <Suspense fallback={null}>
      <BibleRouteDispatcher />
    </Suspense>
  );
}
