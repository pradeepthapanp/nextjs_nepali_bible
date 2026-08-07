"use client";

import { cn } from "@/utils/cn";
import { ReaderNavigation } from "./reader-navigation";
import { ReaderProgress } from "./reader-progress";

export interface ReaderFooterProps {
  onPrev?: () => void;
  onNext?: () => void;
  onOpenList?: () => void;
  /** 0-based current position (enables `canPrev`/`canNext` derivation). */
  currentPosition?: number;
  /** Total songs (enables `canNext` + the progress bar). */
  total?: number;
  className?: string;
}

/**
 * ReaderFooter — the Song Reader footer chrome: composes `ReaderNavigation`
 * (prev/next/open-list, deriving the enabled states from the position) and,
 * when both `currentPosition` and `total` are provided, `ReaderProgress`.
 */
export function ReaderFooter({
  onPrev,
  onNext,
  onOpenList,
  currentPosition,
  total,
  className,
}: ReaderFooterProps) {
  const current = currentPosition ?? 0;
  const count = total ?? 0;
  return (
    <footer className={cn("flex flex-col gap-2", className)}>
      <ReaderNavigation
        onPrev={onPrev}
        onNext={onNext}
        canPrev={current > 0}
        canNext={current < count - 1}
        onOpenList={onOpenList}
      />
      {currentPosition !== undefined && total !== undefined ? (
        <ReaderProgress current={currentPosition} total={total} />
      ) : null}
    </footer>
  );
}
