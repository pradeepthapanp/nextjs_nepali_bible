"use client";

import { useState } from "react";
import { Megaphone, Plus } from "lucide-react";
import { AuthGate } from "@features/auth";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/ui/page-container";
import { useCommunityNavigation, useNoticeLibrary } from "../hooks";
import { useNoticeSortStore } from "../store";
import type { Notice, NoticeSort } from "../types";
import { cn } from "@/utils/cn";
import { DeleteNoticeDialog } from "./dialogs/delete-notice-dialog";
import { NoticeList } from "./notice/notice-list";

/**
 * NoticesPage — page-level orchestration for the notices library (the web
 * replacement of `NoticesPage` in `lib/community/notices_page.dart`).
 *
 * COMPOSES ONLY existing pieces — no Supabase, no queries, no permissions, no
 * sort/navigation logic is re-implemented here:
 *   - `AuthGate` — PROTECTED (signed-in only);
 *   - `useNoticeLibrary` — the infinite list, the Public/My Notices tabs
 *     (`publicNotices`/`myNotices`), the per-notice edit/delete/publish
 *     permissions + actions, `loadMore`, `refetch`;
 *   - `useNoticeSortStore` — the sanctioned UI-only sort (newest/oldest/A–Z);
 *   - `useCommunityNavigation` — `openNewNotice` / `openNotice` (deep links);
 *   - `NoticeList` + `DeleteNoticeDialog` — the reusable list + delete dialog.
 * This page is orchestration only — business logic stays inside the hooks.
 */
export function NoticesPage() {
  const library = useNoticeLibrary();
  const { openNewNotice, openNotice } = useCommunityNavigation();
  const { sort, setSort } = useNoticeSortStore();
  const [tab, setTab] = useState<"public" | "mine">("public");
  const [pendingDelete, setPendingDelete] = useState<Notice | null>(null);

  const visible = tab === "mine" ? library.myNotices : library.publicNotices;

  return (
    <AuthGate>
      <div className="min-h-dvh bg-background text-foreground">
        <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
          <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-3">
            <h1 className="flex items-center gap-2 text-xl font-bold">
              <Megaphone className="size-5 text-primary" aria-hidden />
              Notices
            </h1>
            <Button type="button" size="sm" onClick={openNewNotice}>
              <Plus aria-hidden />
              New Notice
            </Button>
          </div>
        </header>

        <PageContainer maxWidth="3xl" className="py-6 pb-16">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div
              role="tablist"
              aria-label="Notice tabs"
              className="flex rounded-lg bg-muted p-1"
            >
              {(["public", "mine"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={tab === value}
                  onClick={() => setTab(value)}
                  className={cn(
                    "rounded-md px-4 py-1.5 text-sm font-medium transition",
                    tab === value
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {value === "public" ? "Public" : "My Notices"}
                </button>
              ))}
            </div>

            <label className="ml-auto flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Sort</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as NoticeSort)}
                className="rounded-lg border border-input bg-background px-2 py-1.5 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Sort notices"
              >
                <option value="newest">Latest First</option>
                <option value="oldest">Oldest First</option>
                <option value="alphabetical">A–Z</option>
              </select>
            </label>
          </div>

          <NoticeList
            notices={visible}
            isLoading={library.isLoading}
            isError={library.isError}
            error={library.error}
            onRetry={library.refetch}
            hasMore={library.hasMore}
            isLoadingMore={library.isLoadingMore}
            onLoadMore={library.loadMore}
            onOpen={(notice) => openNotice(notice.id)}
            canManageNotice={library.canManageNotice}
            canModerate={library.canModerate}
            onSetPublished={(notice, isPublished) =>
              library.setNoticePublished(notice.id, isPublished)
            }
            onEdit={library.editNotice}
            onDelete={setPendingDelete}
          />
        </PageContainer>

        <DeleteNoticeDialog
          open={Boolean(pendingDelete)}
          onOpenChange={(open) => {
            if (!open) setPendingDelete(null);
          }}
          onConfirm={() => {
            if (pendingDelete) library.deleteNotice(pendingDelete);
            setPendingDelete(null);
          }}
        />
      </div>
    </AuthGate>
  );
}
