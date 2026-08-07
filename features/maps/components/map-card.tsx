"use client";

import { ChevronRight, Image as ImageIcon } from "lucide-react";
import type { BibleMap } from "../types";
import { cleanMapTitle } from "../utils";
import { cn } from "@/utils/cn";

export interface MapCardProps {
  map: BibleMap;
  onOpen?: (map: BibleMap) => void;
  className?: string;
}

/**
 * MapCard — one map row in a topic's maps list (the web replacement of the
 * `ListTile` in `MapsDetailView`): an image icon, the CLEANED title (leading
 * number stripped via `cleanMapTitle`, like Flutter `_cleanTitle`) and a
 * chevron. Presentational.
 */
export function MapCard({ map, onOpen, className }: MapCardProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen?.(map)}
      disabled={!onOpen}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg border bg-card px-4 py-3 text-left transition-colors",
        "hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default",
        className,
      )}
    >
      <ImageIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      <span className="min-w-0 flex-1 text-sm font-semibold leading-snug line-clamp-2 text-foreground">
        {cleanMapTitle(map.title)}
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
    </button>
  );
}
