"use client";

import { useState } from "react";
import { HeartHandshake, Plus } from "lucide-react";
import { AuthGate } from "@features/auth";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/ui/page-container";
import { useCommunityNavigation, usePrayerLibrary } from "../hooks";
import { usePrayerReplyCounts } from "../queries";
import type { Prayer } from "../types";
import { DeletePrayerDialog } from "./dialogs/delete-prayer-dialog";
import { PrayerList } from "./prayer/prayer-list";

/**
 * PrayersPage — page-level orchestration for the prayer requests library (the
 * web replacement of `PrayersPage` in `lib/community/prayers_page.dart`).
 *
 * COMPOSES ONLY existing pieces — no Supabase, no queries, no permissions, no
 * navigation logic is re-implemented here:
 *   - `AuthGate` — PROTECTED (signed-in only);
 *   - `usePrayerLibrary` — the infinite list, the per-prayer
 *     edit/delete/publish permissions + actions, `loadMore`, `refetch`;
 *   - `useCommunityNavigation` — `openNewPrayer` / `openPrayer` (deep links);
 *   - `PrayerList` + `DeletePrayerDialog` — the reusable list + delete dialog.
 * This page is orchestration only — the delete dialog just confirms and calls
 * `library.deletePrayer`; business logic stays inside the hooks.
 */
export function PrayersPage() {
  const library = usePrayerLibrary();
  // ACTUAL reply counts derived from the `prayer_replies` rows (the
  // `reply_count` column can drift stale — historically doubled).
  const replyCounts = usePrayerReplyCounts();
  const { openNewPrayer, openPrayer } = useCommunityNavigation();
  const [pendingDelete, setPendingDelete] = useState<Prayer | null>(null);

  return (
    <AuthGate>
      <div className="min-h-dvh bg-background text-foreground">
        <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
          <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-3">
            <h1 className="flex items-center gap-2 text-xl font-bold">
              <HeartHandshake className="size-5 text-primary" aria-hidden />
              Prayer Requests
            </h1>
            <Button type="button" size="sm" onClick={openNewPrayer}>
              <Plus aria-hidden />
              New Prayer
            </Button>
          </div>
        </header>

        <PageContainer maxWidth="3xl" className="py-6 pb-16">
          <PrayerList
            prayers={library.prayers}
            replyCounts={replyCounts}
            isLoading={library.isLoading}
            isError={library.isError}
            error={library.error}
            onRetry={library.refetch}
            hasMore={library.hasMore}
            isLoadingMore={library.isLoadingMore}
            onLoadMore={library.loadMore}
            onOpen={(prayer) => openPrayer(prayer.id)}
            canManagePrayer={library.canManagePrayer}
            canModerate={library.canModerate}
            onPublish={library.publishPrayer}
            onEdit={library.editPrayer}
            onDelete={setPendingDelete}
          />
        </PageContainer>

        <DeletePrayerDialog
          open={Boolean(pendingDelete)}
          onOpenChange={(open) => {
            if (!open) setPendingDelete(null);
          }}
          onConfirm={() => {
            if (pendingDelete) library.deletePrayer(pendingDelete);
            setPendingDelete(null);
          }}
        />
      </div>
    </AuthGate>
  );
}
