"use client";

import { Copy, Heart, ListPlus, Share2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Song } from "@features/music/types";
import { cn } from "@/utils/cn";
import { DialogPanel } from "./dialog-panel";

interface SongOptionsItem {
  key: string;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  /** Renders destructive-styled items (e.g. remove from favorites). */
  destructive?: boolean;
}

export interface SongOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  song: Song;
  isFavorite?: boolean;
  /** Copy the song (parent composes `songToClipboardText` + shared clipboard). */
  onCopy?: () => void;
  onShare?: () => void;
  onAddToPlaylist?: () => void;
  onToggleFavorite?: () => void;
  className?: string;
}

/**
 * SongOptionsDialog — the per-song actions menu (a web-first equivalent of a
 * long-press / options menu on a song). Presentational: it only renders the
 * provided action items — clipboard, share and favorites logic live in the
 * parent (reusing `songToClipboardText` + the shared clipboard helper and the
 * `useFavoriteSongs` behavior), so nothing is duplicated here.
 */
export function SongOptionsDialog({
  open,
  onOpenChange,
  song,
  isFavorite,
  onCopy,
  onShare,
  onAddToPlaylist,
  onToggleFavorite,
  className,
}: SongOptionsDialogProps) {
  const items: SongOptionsItem[] = [];
  if (onCopy) items.push({ key: "copy", label: "Copy", icon: Copy, onClick: onCopy });
  if (onShare) items.push({ key: "share", label: "Share", icon: Share2, onClick: onShare });
  if (onAddToPlaylist)
    items.push({ key: "add-to-playlist", label: "Add to playlist", icon: ListPlus, onClick: onAddToPlaylist });
  if (onToggleFavorite)
    items.push({
      key: "favorite",
      label: isFavorite ? "Remove from favorites" : "Add to favorites",
      icon: Heart,
      onClick: onToggleFavorite,
      destructive: isFavorite,
    });

  return (
    <DialogPanel
      open={open}
      onOpenChange={onOpenChange}
      title={song.name ?? "Song options"}
      className={className}
    >
      <ul role="menu" aria-label="Song actions" className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.key} role="none">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  item.onClick();
                  onOpenChange(false);
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  item.destructive
                    ? "text-destructive hover:bg-destructive/10"
                    : "text-foreground hover:bg-accent",
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </DialogPanel>
  );
}
