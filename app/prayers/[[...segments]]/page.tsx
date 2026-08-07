import { Suspense } from "react";
import { CommunityRouteDispatcher } from "@/features/community/components/community-route-dispatcher";

/**
 * Prayers route — the mount point for the Prayers section.
 *
 * A single optional catch-all covers every deep-link shape handled by
 * `parsePrayerPath`:
 *   /prayers             → prayer requests list
 *   /prayers/{id}        → prayer detail
 *   /prayers/new         → create prayer
 *   /prayers/edit/{id}   → edit prayer
 * `CommunityRouteDispatcher` picks the page from the path; each page reads its
 * own params/data, so this page stays a thin server shell.
 * `Suspense` mirrors the other catch-all route shells.
 */
export default function PrayersPage() {
  return (
    <Suspense fallback={null}>
      <CommunityRouteDispatcher />
    </Suspense>
  );
}
