"use client";

import { useCallback } from "react";
import { usePrayer } from "../queries";
import type { Prayer } from "../types";
import { canManagePrayer, canModerate } from "../utils";
import { useCommunityNavigation } from "./use-community-navigation";
import { useCurrentProfile } from "./use-current-profile";
import { usePrayerPrays } from "./use-prayer-prays";
import { usePrayerReplies } from "./use-prayer-replies";

/**
 * usePrayerDetail — the prayer DETAIL behavior (the web equivalent of
 * `PrayerDetailsSheet`): the prayer + its stats + replies + the toggle.
 *
 * COMPOSES:
 *   - `usePrayer(id)` (React Query) — the prayer (WEB-FIRST detail deep link);
 *   - `usePrayerReplies(id)` (behavior) — replies + reply actions + ownership;
 *   - `usePrayerPrays(id)` (behavior) — hasPrayed + prayerCount + toggle;
 *   - `useCurrentProfile` (SHARED `ProfileService`) — owner/role permissions;
 *   - `useCommunityNavigation` — `openEditPrayer`.
 *
 * No Supabase, no duplicated query/permission logic — everything composes the
 * existing hooks + the pure permission helpers.
 */
export function usePrayerDetail(id: string | undefined) {
  const {
    data: prayer,
    isLoading,
    isError,
    error,
    refetch,
  } = usePrayer(id);
  const replies = usePrayerReplies(id);
  const prays = usePrayerPrays(id);
  const { userId, role } = useCurrentProfile();
  const { openEditPrayer } = useCommunityNavigation();

  /** Edit/delete permission for the prayer (owner OR admin/editor). */
  const canManagePrayerFor = useCallback(
    (p: Prayer) => canManagePrayer(p, userId ?? undefined, role),
    [userId, role],
  );

  return {
    // Prayer.
    prayer: prayer ?? null,
    isLoading,
    isError,
    error,
    refetch: () => void refetch(),
    // Replies (behavior — the reply list + actions + ownership).
    replies: replies.replies,
    repliesLoading: replies.isLoading,
    repliesError: replies.isError,
    isSendingReply: replies.isSending,
    canManageReply: replies.canManageReply,
    sendReply: replies.sendReply,
    editReply: replies.editReply,
    removeReply: replies.removeReply,
    // Prayer prays (behavior — membership + count + toggle).
    hasPrayed: prays.hasPrayed,
    prayerCount: prays.prayerCount,
    isToggling: prays.isToggling,
    togglePrayer: prays.toggle,
    // Permissions + navigation.
    canModerate: canModerate(role),
    canManagePrayer: canManagePrayerFor,
    editPrayer: prayer ? () => openEditPrayer(prayer.id) : undefined,
  };
}
