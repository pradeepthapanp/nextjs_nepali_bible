"use client";

import { MessageCircle } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import type { PrayerReply } from "../../types";
import { PrayerReplyItem } from "./prayer-reply-item";
import { cn } from "@/utils/cn";

export interface PrayerReplyListProps {
  replies: PrayerReply[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  /** Per-reply edit/delete permission (reply owner OR admin). */
  canManageReply?: (reply: PrayerReply) => boolean;
  onEdit?: (replyId: string, text: string) => void;
  onDelete?: (replyId: string) => void;
  className?: string;
}

/**
 * PrayerReplyList — the prayer replies list (the web equivalent of the replies
 * section in `PrayerDetailsSheet`: loading/error/empty states + the reply
 * tiles). Presentational; the page wires `usePrayerReplies` data + actions.
 */
export function PrayerReplyList({
  replies,
  isLoading,
  isError,
  onRetry,
  canManageReply,
  onEdit,
  onDelete,
  className,
}: PrayerReplyListProps) {
  if (isLoading) return <LoadingState label="Loading replies…" />;
  if (isError) {
    return (
      <ErrorState
        title="Error loading replies"
        description="Failed to load the replies. Please try again."
        onRetry={onRetry}
      />
    );
  }
  if (replies.length === 0) {
    return (
      <EmptyState
        icon={MessageCircle}
        title="No replies yet"
        description="Be the first to reply and pray for this request."
      />
    );
  }
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {replies.map((reply) => (
        <PrayerReplyItem
          key={reply.id}
          reply={reply}
          canManage={canManageReply?.(reply) ?? false}
          onEdit={onEdit ?? (() => undefined)}
          onDelete={onDelete ?? (() => undefined)}
        />
      ))}
    </div>
  );
}
