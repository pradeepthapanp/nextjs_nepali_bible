"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

export interface ChapterFooterProps {
  onPrevious?: () => void;
  onNext?: () => void;
  canPrevious?: boolean;
  canNext?: boolean;
  /** Optional position label (e.g. "अध्याय १/५०"). */
  label?: string;
  className?: string;
}

/**
 * ChapterFooter — prev/next chapter navigation (infinite chapter navigation).
 *
 * Replaces the bottom navigation / chapter paging in Flutter's
 * `bible_home.dart` / `full_chapter_verse.dart`. Presentational: navigation is
 * delegated via callbacks and disabled when unavailable. Keyboard accessible
 * (real buttons) and responsive (stacks on mobile).
 */
export function ChapterFooter({
  onPrevious,
  onNext,
  canPrevious = true,
  canNext = true,
  label,
  className,
}: ChapterFooterProps) {
  return (
    <nav
      aria-label="Chapter navigation"
      className={cn(
        "flex flex-col items-center gap-2 border-t pt-4 sm:flex-row sm:justify-between",
        className,
      )}
    >
      <Button
        variant="outline"
        size="sm"
        onClick={onPrevious}
        disabled={!canPrevious}
        aria-label="Previous chapter"
      >
        <ChevronLeft aria-hidden />
        <span className="sm:hidden">अघिल्लो</span>
        <span className="hidden sm:inline">Previous</span>
      </Button>

      {label ? (
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {label}
        </p>
      ) : null}

      <Button
        variant="outline"
        size="sm"
        onClick={onNext}
        disabled={!canNext}
        aria-label="Next chapter"
      >
        <span className="sm:hidden">अर्को</span>
        <span className="hidden sm:inline">Next</span>
        <ChevronRight aria-hidden />
      </Button>
    </nav>
  );
}
