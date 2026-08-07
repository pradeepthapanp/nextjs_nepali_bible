"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCommunityNavigationStore } from "../store";
import type { CommunityDeepLink } from "../types";
import {
  buildNoticeUrl,
  buildPrayerUrl,
  parseNoticePath,
  parsePrayerPath,
} from "../utils";

/**
 * useCommunityNavigation — the deep-link + navigation behavior for the
 * Community section (Prayers + Notices). COMPOSES the Next router + the pure
 * `buildPrayerUrl`/`parsePrayerPath`/`buildNoticeUrl`/`parseNoticePath`
 * helpers (the single URL source in `utils/deep-link`) + the one-shot pending
 * target store (the sanctioned navigation store).
 */
export function useCommunityNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { pendingTarget, setPendingTarget, consumePendingTarget } =
    useCommunityNavigationStore();

  /** The parsed community deep link of the current path (or null off-section). */
  const currentLink = useMemo<CommunityDeepLink | null>(
    () => parsePrayerPath(pathname) ?? parseNoticePath(pathname),
    [pathname],
  );

  /** Push any community deep link (built via the single URL helpers). */
  const navigate = useCallback(
    (link: CommunityDeepLink) => {
      const isPrayer =
        link.kind === "prayers" ||
        link.kind === "prayer" ||
        link.kind === "prayerNew" ||
        link.kind === "prayerEdit";
      router.push(isPrayer ? buildPrayerUrl(link) : buildNoticeUrl(link));
    },
    [router],
  );

  const openPrayer = useCallback(
    (id: string) => navigate({ kind: "prayer", id }),
    [navigate],
  );
  const openNotice = useCallback(
    (id: string) => navigate({ kind: "notice", id }),
    [navigate],
  );
  const openNewPrayer = useCallback(() => navigate({ kind: "prayerNew" }), [
    navigate,
  ]);
  const openNewNotice = useCallback(() => navigate({ kind: "noticeNew" }), [
    navigate,
  ]);
  const openEditPrayer = useCallback(
    (id: string) => navigate({ kind: "prayerEdit", id }),
    [navigate],
  );
  const openEditNotice = useCallback(
    (id: string) => navigate({ kind: "noticeEdit", id }),
    [navigate],
  );

  return {
    currentLink,
    pendingTarget,
    setPendingTarget,
    consumePendingTarget,
    navigate,
    openPrayer,
    openNotice,
    openNewPrayer,
    openNewNotice,
    openEditPrayer,
    openEditNotice,
  };
}
