"use client";

import { useCallback } from "react";
import {
  useCreatePrayer,
  useDeletePrayer,
  usePublishPrayer,
  useUpdatePrayer,
} from "../queries";
import type { Prayer, PrayerInput } from "../types";
import { canManagePrayer, canModerate } from "../utils";
import { useCurrentProfile } from "./use-current-profile";

/**
 * usePrayerActions — the prayer create/update/delete/publish actions (the web
 * equivalent of the imperative `AddEditPrayerSheet._save` + the list menu).
 *
 * COMPOSES the React Query mutations (`useCreatePrayer`/`useUpdatePrayer`/
 * `useDeletePrayer`/`usePublishPrayer`) — NO mutation logic is duplicated
 * here — plus the pure permission helpers (owner OR admin/editor, reusing the
 * shared `canManage`). The editor PAGE composes this and navigates via
 * `useCommunityNavigation` after create/update.
 */
export function usePrayerActions() {
  const { userId, role } = useCurrentProfile();
  const createMutation = useCreatePrayer();
  const updateMutation = useUpdatePrayer();
  const deleteMutation = useDeletePrayer();
  const publishMutation = usePublishPrayer();

  const createPrayer = useCallback(
    async (input: PrayerInput) => createMutation.mutateAsync(input),
    [createMutation],
  );
  const updatePrayer = useCallback(
    async (id: string, input: PrayerInput) =>
      updateMutation.mutateAsync({ id, input }),
    [updateMutation],
  );
  const deletePrayer = useCallback(
    (prayer: Prayer) => deleteMutation.mutate(prayer.id),
    [deleteMutation],
  );
  const publishPrayer = useCallback(
    (prayerId: string) => publishMutation.mutate(prayerId),
    [publishMutation],
  );

  /** Edit/delete permission for a specific prayer (owner OR admin/editor). */
  const canManagePrayerFor = useCallback(
    (prayer: Prayer) => canManagePrayer(prayer, userId ?? undefined, role),
    [userId, role],
  );

  return {
    createPrayer,
    updatePrayer,
    deletePrayer,
    publishPrayer,
    canManagePrayer: canManagePrayerFor,
    canModerate: canModerate(role),
    isPending:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending ||
      publishMutation.isPending,
    error:
      createMutation.error ??
      updateMutation.error ??
      deleteMutation.error ??
      publishMutation.error,
  };
}
