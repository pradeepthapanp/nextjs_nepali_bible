"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { FeatureIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

export interface ReaderNavigationProps {
  onPrev?: () => void;
  onNext?: () => void;
  canPrev?: boolean;
  canNext?: boolean;
  /** Opens the enclosing song list (e.g. the playlist/category it came from). */
  onOpenList?: () => void;
  className?: string;
}

/**
 * ReaderNavigation — the prev/next (and optional "open list") controls for
 * the Song Reader page swiper (the web equivalent of the paging affordance in
 * `MusicLanded`). Presentational: delegates to callbacks; the parent composes
 * `useSongReader`/`useSongNavigation`.
 */
export function ReaderNavigation({
  onPrev,
  onNext,
  canPrev,
  canNext,
  onOpenList,
  className,
}: ReaderNavigationProps) {
  return (
    <nav
      aria-label="Song navigation"
      className={cn("flex items-center justify-between gap-2", className)}
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onPrev}
        disabled={!canPrev}
        aria-label="Previous song"
      >
        <ChevronLeft className="size-4" aria-hidden />
      </Button>
      {onOpenList ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onOpenList}
          aria-label="Open song list"
        >
          <FeatureIcon name="playlists" className="text-base" aria-hidden />
        </Button>
      ) : (
        <span aria-hidden />
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onNext}
        disabled={!canNext}
        aria-label="Next song"
      >
        <ChevronRight className="size-4" aria-hidden />
      </Button>
    </nav>
  );
}
