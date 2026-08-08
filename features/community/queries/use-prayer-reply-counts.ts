"use client";

import { useQuery } from "@tanstack/react-query";
import { getCommunityServices } from "../services";
import { prayerKeys } from "./query-keys";

/**
 * Actual per-prayer reply counts (`prayerId` → count), derived from the
 * `prayer_replies` rows — NOT the `prayers.reply_count` column, which can
 * drift stale (it was historically doubled by a double-increment). One shared
 * query (React Query dedupes it across every card), so the prayers LIST shows
 * true comment counts. `staleTime` keeps repeat loads cheap; the reply
 * create/delete mutations invalidate this key so the list stays fresh.
 */
export function usePrayerReplyCounts(): Record<string, number> {
  const { data } = useQuery({
    queryKey: prayerKeys.replyCounts(),
    queryFn: () => getCommunityServices().reply.getReplyCounts(),
    staleTime: 60_000,
  });
  return data ?? {};
}
