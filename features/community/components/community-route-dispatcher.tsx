"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  buildNoticeUrl,
  buildPrayerUrl,
  parseNoticePath,
  parsePrayerPath,
} from "../utils";
import { useCommunityNavigation } from "../hooks";
import { AddEditNoticePage } from "./add-edit-notice-page";
import { AddEditPrayerPage } from "./add-edit-prayer-page";
import { NoticeDetailPage } from "./notice-detail-page";
import { NoticesPage } from "./notices-page";
import { PrayerDetailPage } from "./prayer-detail-page";
import { PrayersPage } from "./prayers-page";

/**
 * CommunityRouteDispatcher — route-level dispatch for the `/prayers` and
 * `/notices` catch-alls (the counterpart to the Articles/Music/Bible route
 * dispatchers).
 *
 * Supported shapes (parsed by the shared `parsePrayerPath`/`parseNoticePath`):
 *   /prayers                → PrayersPage
 *   /prayers/{id}           → PrayerDetailPage
 *   /prayers/new            → AddEditPrayerPage (create)
 *   /prayers/edit/{id}      → AddEditPrayerPage (edit)
 *   /notices                → NoticesPage
 *   /notices/{id}           → NoticeDetailPage
 *   /notices/new            → AddEditNoticePage (create)
 *   /notices/edit/{id}      → AddEditNoticePage (edit)
 *
 * Each child reads its own data/deep links from the URL, so this component
 * only picks which page to mount. A `pendingTarget` set in the navigation
 * store before the section mounted (e.g. by an external entry point) is
 * consumed once and turned into a real navigation here.
 */
export function CommunityRouteDispatcher() {
  const router = useRouter();
  const pathname = usePathname();
  const { pendingTarget, consumePendingTarget } = useCommunityNavigation();

  const link = useMemo(
    () => parsePrayerPath(pathname) ?? parseNoticePath(pathname),
    [pathname],
  );

  // Apply a pending deep-link target exactly once (one-shot store read).
  useEffect(() => {
    if (!pendingTarget) return;
    const target = consumePendingTarget();
    if (target) {
      const isPrayer =
        target.kind === "prayers" ||
        target.kind === "prayer" ||
        target.kind === "prayerNew" ||
        target.kind === "prayerEdit";
      router.replace(isPrayer ? buildPrayerUrl(target) : buildNoticeUrl(target));
    }
  }, [pendingTarget, consumePendingTarget, router]);

  if (link?.kind === "prayer") {
    return <PrayerDetailPage id={link.id} />;
  }
  if (link?.kind === "prayerNew") {
    return <AddEditPrayerPage />;
  }
  if (link?.kind === "prayerEdit") {
    return <AddEditPrayerPage id={link.id} />;
  }
  if (link?.kind === "notice") {
    return <NoticeDetailPage id={link.id} />;
  }
  if (link?.kind === "noticeNew") {
    return <AddEditNoticePage />;
  }
  if (link?.kind === "noticeEdit") {
    return <AddEditNoticePage id={link.id} />;
  }
  if (link?.kind === "notices") {
    return <NoticesPage />;
  }
  return <PrayersPage />;
}
