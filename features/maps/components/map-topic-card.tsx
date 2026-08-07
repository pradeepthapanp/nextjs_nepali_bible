"use client";

import { ChevronRight } from "lucide-react";
import type { MapTopic } from "../types";
import { cn } from "@/utils/cn";

export interface MapTopicCardProps {
  topic: MapTopic;
  onOpen?: (topic: MapTopic) => void;
  className?: string;
}

/**
 * MapTopicCard — one topic row in the topics list (the web replacement of the
 * `ListTile` in `BibleMapsView`). Presentational: a full-width button with the
 * centered topic title (2-line ellipsis, like Flutter) and a chevron.
 */
export function MapTopicCard({
  topic,
  onOpen,
  className,
}: MapTopicCardProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen?.(topic)}
      disabled={!onOpen}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3 text-left transition-colors",
        "hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default",
        className,
      )}
    >
      <span className="min-w-0 flex-1 text-center text-base font-semibold leading-snug line-clamp-2 text-foreground">
        {topic}
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
    </button>
  );
}
