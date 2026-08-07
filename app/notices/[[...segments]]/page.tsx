import { Suspense } from "react";
import { CommunityRouteDispatcher } from "@/features/community/components/community-route-dispatcher";

/**
 * Notices route — the mount point for the Notices section.
 *
 * A single optional catch-all covers every deep-link shape handled by
 * `parseNoticePath`:
 *   /notices             → notices list
 *   /notices/{id}        → notice detail
 *   /notices/new         → create notice
 *   /notices/edit/{id}   → edit notice
 * `CommunityRouteDispatcher` picks the page from the path; each page reads its
 * own params/data, so this page stays a thin server shell.
 * `Suspense` mirrors the other catch-all route shells.
 */
export default function NoticesPage() {
  return (
    <Suspense fallback={null}>
      <CommunityRouteDispatcher />
    </Suspense>
  );
}
