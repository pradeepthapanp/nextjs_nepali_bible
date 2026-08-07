"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AuthGate } from "@features/auth";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageContainer } from "@/components/ui/page-container";
import { usePrayerDetail } from "../hooks";
import { PrayerCountBadge } from "./prayer/prayer-count-badge";
import { PrayerHeader } from "./prayer/prayer-header";
import { PrayerPrayButton } from "./prayer/prayer-pray-button";
import { PrayerReplyComposer } from "./prayer/prayer-reply-composer";
import { PrayerReplyList } from "./prayer/prayer-reply-list";

export interface PrayerDetailPageProps {
  /** The prayer id from the deep link (`/prayers/{id}`). */
  id: string;
}

/**
 * PrayerDetailPage — page-level orchestration for a prayer DETAIL (the web
 * replacement of `PrayerDetailsSheet` in `lib/community/prayer_details_sheet.dart`,
 * surfaced as a deep-link page).
 *
 * COMPOSES ONLY existing pieces — no Supabase, no queries, no permissions, no
 * reply logic is re-implemented here:
 *   - `AuthGate` — PROTECTED (signed-in only);
 *   - `usePrayerDetail(id)` — the prayer, the replies behavior
 *     (`sendReply`/`editReply`/`removeReply` + `canManageReply`), and the prays
 *     behavior (`prayerCount`/`hasPrayed`/`togglePrayer`);
 *   - `PrayerHeader` / `PrayerPrayButton` / `PrayerCountBadge` /
 *     `PrayerReplyList` / `PrayerReplyComposer` — the reusable surfaces.
 * This page is orchestration only.
 *
 * NOTE (faithful to Flutter): the detail has NO edit/delete/publish actions —
 * those live on the list cards (Flutter's `PrayerDetailsSheet` only shows the
 * toggle + replies; the edit/delete menu is on the `PrayersPage` cards).
 */
export function PrayerDetailPage({ id }: PrayerDetailPageProps) {
  const router = useRouter();
  const detail = usePrayerDetail(id);

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.replace("/prayers");
    }
  };

  return (
    <AuthGate>
      <div className="min-h-dvh bg-background text-foreground">
        <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
          <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 py-3">
            <Button type="button" variant="ghost" size="icon" onClick={goBack} aria-label="Back">
              <ArrowLeft className="size-5" aria-hidden />
            </Button>
            <h1 className="text-xl font-bold">Prayer Request</h1>
          </div>
        </header>

        <PageContainer maxWidth="3xl" className="py-6 pb-16">
          {detail.isLoading || !detail.prayer ? (
            <LoadingState label="Loading prayer…" />
          ) : detail.isError ? (
            <ErrorState
              title="Error loading prayer"
              description="Something went wrong while loading this prayer request."
              onRetry={detail.refetch}
            />
          ) : (
            <div className="space-y-6">
              <PrayerHeader prayer={detail.prayer} />

              <div className="flex items-center gap-3">
                <PrayerPrayButton prayerId={detail.prayer.id} />
                <PrayerCountBadge count={detail.prayerCount} />
                <span className="text-sm text-muted-foreground">
                  {detail.prayer.replyCount} replies
                </span>
              </div>

              <div className="space-y-3">
                <h2 className="text-lg font-bold">Replies</h2>
                <PrayerReplyList
                  replies={detail.replies ?? []}
                  isLoading={detail.repliesLoading}
                  isError={detail.repliesError}
                  canManageReply={detail.canManageReply}
                  onEdit={detail.editReply}
                  onDelete={detail.removeReply}
                />
                <PrayerReplyComposer
                  onSend={detail.sendReply}
                  isSending={detail.isSendingReply}
                  placeholder="Write a prayer reply..."
                />
              </div>
            </div>
          )}
        </PageContainer>
      </div>
    </AuthGate>
  );
}
