"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AuthGate } from "@features/auth";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageContainer } from "@/components/ui/page-container";
import { useNoticeDetail } from "../hooks";
import { DeleteNoticeDialog } from "./dialogs/delete-notice-dialog";
import { NoticeActions } from "./notice/notice-actions";
import { NoticeHeader } from "./notice/notice-header";
import { NoticeImage } from "./notice/notice-image";

export interface NoticeDetailPageProps {
  /** The notice id from the deep link (`/notices/{id}`). */
  id: string;
}

/**
 * NoticeDetailPage — page-level orchestration for a notice DETAIL (the web
 * replacement of `NoticeDetailSheet` in `lib/community/notice_detail_sheet.dart`,
 * surfaced as a deep-link page).
 *
 * COMPOSES ONLY existing pieces — no Supabase, no queries, no permissions, no
 * upload/navigation logic is re-implemented here:
 *   - `AuthGate` — PROTECTED (signed-in only);
 *   - `useNoticeDetail(id)` — the notice, `canManageNotice`/`canModerate`,
 *     `setNoticePublished`, `editNotice`, `deleteNotice`;
 *   - `NoticeImage` / `NoticeHeader` / `NoticeActions` / `DeleteNoticeDialog`
 *     — the reusable surfaces (delete is confirmed via the shared dialog).
 * This page is orchestration only.
 */
export function NoticeDetailPage({ id }: NoticeDetailPageProps) {
  const router = useRouter();
  const detail = useNoticeDetail(id);
  const [pendingDelete, setPendingDelete] = useState(false);

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.replace("/notices");
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
            <h1 className="text-xl font-bold">Notice</h1>
          </div>
        </header>

        <PageContainer maxWidth="3xl" className="py-6 pb-16">
          {detail.isLoading || !detail.notice ? (
            <LoadingState label="Loading notice…" />
          ) : detail.isError ? (
            <ErrorState
              title="Error loading notice"
              description="Something went wrong while loading this notice."
              onRetry={detail.refetch}
            />
          ) : (
            <div className="space-y-6">
              {detail.notice.imageUrl ? (
                <NoticeImage
                  src={detail.notice.imageUrl}
                  alt={detail.notice.title}
                />
              ) : null}

              <div className="space-y-3">
                <NoticeHeader notice={detail.notice} />
                <NoticeActions
                  notice={detail.notice}
                  canManage={detail.canManageNotice}
                  canModerate={detail.canModerate}
                  onSetPublished={detail.setNoticePublished}
                  onEdit={detail.editNotice}
                  onDelete={() => setPendingDelete(true)}
                />
              </div>

              <div className="rounded-lg bg-muted/40 p-4">
                <p className="whitespace-pre-line leading-relaxed">
                  {detail.notice.description || "No description provided."}
                </p>
              </div>
            </div>
          )}
        </PageContainer>

        <DeleteNoticeDialog
          open={pendingDelete}
          onOpenChange={setPendingDelete}
          onConfirm={() => {
            detail.deleteNotice();
            setPendingDelete(false);
          }}
        />
      </div>
    </AuthGate>
  );
}
