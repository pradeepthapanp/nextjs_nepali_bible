"use client";

import { Megaphone } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import type { Notice } from "../../types";
import { InfiniteScrollSentinel } from "../shared/infinite-scroll-sentinel";
import { NoticeCard } from "./notice-card";
import { cn } from "@/utils/cn";

export interface NoticeListProps {
  notices: Notice[];
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  onRetry?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  onOpen?: (notice: Notice) => void;
  /** Per-notice edit/delete permission (the page wires the pure helper). */
  canManageNotice?: (notice: Notice) => boolean;
  /** Admin/editor publish permission. */
  canModerate?: boolean;
  onSetPublished?: (notice: Notice, isPublished: boolean) => void;
  onEdit?: (notice: Notice) => void;
  onDelete?: (notice: Notice) => void;
  className?: string;
}

/**
 * NoticeList — the notice list surface (the web equivalent of the `_NoticeList`
 * in `NoticesPage` + its loading/error/empty states + `loadMore`).
 * Presentational: it renders the shared states + the `NoticeCard`s + the
 * infinite-scroll sentinel. Data + handlers come via props (the page composes
 * `useNoticeLibrary`).
 */
export function NoticeList({
  notices,
  isLoading,
  isError,
  onRetry,
  hasMore,
  isLoadingMore,
  onLoadMore,
  onOpen,
  canManageNotice,
  canModerate,
  onSetPublished,
  onEdit,
  onDelete,
  className,
}: NoticeListProps) {
  if (isLoading) return <LoadingState label="Loading notices…" />;
  if (isError) {
    return (
      <ErrorState
        title="Error loading notices"
        description="Something went wrong while loading the notices."
        onRetry={onRetry}
      />
    );
  }
  if (notices.length === 0) {
    return (
      <EmptyState
        icon={Megaphone}
        title="No Notices Found"
        description="Check back later for updates."
      />
    );
  }
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {notices.map((notice) => (
        <NoticeCard
          key={notice.id}
          notice={notice}
          canManage={canManageNotice?.(notice) ?? false}
          canModerate={canModerate ?? false}
          onOpen={() => onOpen?.(notice)}
          onSetPublished={(isPublished) => onSetPublished?.(notice, isPublished)}
          onEdit={() => onEdit?.(notice)}
          onDelete={() => onDelete?.(notice)}
        />
      ))}
      <InfiniteScrollSentinel
        hasMore={hasMore ?? false}
        isLoadingMore={isLoadingMore ?? false}
        onLoadMore={() => onLoadMore?.()}
      />
    </div>
  );
}
