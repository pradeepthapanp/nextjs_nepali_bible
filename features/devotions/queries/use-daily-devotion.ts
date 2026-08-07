"use client";

import { useQuery } from "@tanstack/react-query";
import { getDevotionServices } from "../services";
import { devotionKeys } from "./query-keys";

/**
 * useDailyDevotion — today's devotion (the web replacement of Flutter
 * `dailyDevotionProvider` in `providers/devotion/local_devotion_provider.dart`).
 *
 * PUBLIC — NO enabled guard / session dependency (Flutter's provider is a
 * plain `FutureProvider`, no auth). Returns `Devotion | null`:
 *   - loading → `isLoading`
 *   - no devotion today → `data === null` (the page shows the EmptyState)
 *   - error → `isError` (the page shows the ErrorState + retry)
 */
export function useDailyDevotion() {
  return useQuery({
    queryKey: devotionKeys.daily,
    queryFn: () => getDevotionServices().devotion.getDailyDevotion(),
  });
}
