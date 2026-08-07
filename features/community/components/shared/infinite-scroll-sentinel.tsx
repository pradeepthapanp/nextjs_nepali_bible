"use client";

import { useEffect, useRef } from "react";
import { Spinner } from "@/components/ui/spinner";

export interface InfiniteScrollSentinelProps {
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}

/**
 * InfiniteScrollSentinel — the infinite-scroll trigger for the prayer/notice
 * lists (the web equivalent of the Flutter `loadMore` on scroll). An
 * IntersectionObserver watches a sentinel at the bottom of the list and calls
 * `onLoadMore` when it becomes visible (guarded by `hasMore`/`isLoadingMore`).
 * Renders the trailing loading spinner while fetching the next page.
 */
export function InfiniteScrollSentinel({
  hasMore,
  isLoadingMore,
  onLoadMore,
}: InfiniteScrollSentinelProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Refs synced in effects (react-hooks/refs — never written during render).
  const onLoadMoreRef = useRef(onLoadMore);
  const isLoadingMoreRef = useRef(isLoadingMore);
  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);
  useEffect(() => {
    isLoadingMoreRef.current = isLoadingMore;
  }, [isLoadingMore]);

  useEffect(() => {
    if (!hasMore || typeof IntersectionObserver === "undefined") return;
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isLoadingMoreRef.current) {
          onLoadMoreRef.current();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore]);

  if (!hasMore) return null;
  return (
    <div ref={ref} className="flex items-center justify-center py-4" aria-busy={isLoadingMore}>
      {isLoadingMore ? <Spinner className="size-6 text-primary" /> : null}
    </div>
  );
}
