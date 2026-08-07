"use client";

import { memo, useState } from "react";
import { MoreHorizontal, Pause, Pencil, Play, Trash2 } from "lucide-react";
import { AudioArtwork, useAudioPlayerStore } from "@features/audio";
import { formatTime } from "@features/audio/utils";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Spinner } from "@/components/ui/spinner";
import type { Audio } from "../types";
import { cn } from "@/utils/cn";

export interface AudioCardProps {
  audio: Audio;
  /** Admin: show the edit/delete menu. */
  canManage?: boolean;
  /** Play/toggle this audio (parent builds the queue via the Audio Platform). */
  onToggle?: () => void;
  onEdit?: () => void;
  /** Fired after the delete confirmation is accepted. */
  onDelete?: () => void;
  className?: string;
}

/**
 * AudioCard — one audio library row (the web replacement of Flutter's
 * `_AudioCard` in `audios_list_page.dart`): artwork, title, artist subtitle,
 * description, category chip + play count, and a play/pause control. The admin
 * menu (edit/delete) mirrors the Flutter `PopupMenuButton`.
 *
 * The "now playing" state is read from the shared Audio Platform via TARGETED
 * store selectors that return a stable value for non-current cards — so only
 * the playing card re-renders on position ticks (its live duration comes from
 * the platform's progress state; the DB has no duration column).
 */
export const AudioCard = memo(function AudioCard({
  audio,
  canManage = false,
  onToggle,
  onEdit,
  onDelete,
  className,
}: AudioCardProps) {
  const currentItemId = useAudioPlayerStore((state) => state.currentItem?.id ?? null);
  const isCurrent = currentItemId === audio.id;
  const isCurrentPlaying = useAudioPlayerStore((state) =>
    isCurrent ? state.isPlaying : false,
  );
  const isCurrentLoading = useAudioPlayerStore((state) =>
    isCurrent ? state.isLoading : false,
  );
  const duration = useAudioPlayerStore((state) =>
    isCurrent ? state.duration : 0,
  );

  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <div
        role={onToggle ? "button" : undefined}
        tabIndex={onToggle ? 0 : undefined}
        onClick={onToggle}
        onKeyDown={
          onToggle
            ? (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onToggle();
                }
              }
            : undefined
        }
        className={cn(
          "flex w-full items-start gap-3 rounded-xl border bg-card p-3 text-left",
          onToggle && "cursor-pointer hover:bg-accent/60",
          isCurrent && "border-primary/40 bg-primary/5",
          className,
        )}
      >
        <AudioArtwork
          src={audio.artUrl}
          alt={audio.title}
          className="size-14 shrink-0 rounded-lg"
        />

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-foreground">
                {audio.title}
              </h3>
              {audio.artist ? (
                <p className="truncate text-xs font-medium text-primary">
                  {audio.artist}
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={
                  isCurrentPlaying
                    ? `Pause ${audio.title}`
                    : `Play ${audio.title}`
                }
                onClick={(event) => {
                  event.stopPropagation();
                  onToggle?.();
                }}
                disabled={isCurrentLoading}
              >
                {isCurrentLoading ? (
                  <Spinner className="size-4" />
                ) : isCurrentPlaying ? (
                  <Pause aria-hidden />
                ) : (
                  <Play aria-hidden />
                )}
              </Button>
              {canManage ? (
                <div className="relative">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Options for ${audio.title}`}
                    aria-expanded={menuOpen}
                    onClick={(event) => {
                      event.stopPropagation();
                      setMenuOpen((open) => !open);
                    }}
                  >
                    <MoreHorizontal aria-hidden />
                  </Button>
                  {menuOpen ? (
                    <>
                      <button
                        type="button"
                        aria-label="Close menu"
                        className="fixed inset-0 z-40 cursor-default"
                        onClick={(event) => {
                          event.stopPropagation();
                          setMenuOpen(false);
                        }}
                      />
                      <div className="absolute right-0 top-full z-50 mt-1 w-36 overflow-hidden rounded-lg border bg-popover p-1 shadow-md">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setMenuOpen(false);
                            onEdit?.();
                          }}
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-foreground hover:bg-accent"
                        >
                          <Pencil className="size-4" aria-hidden />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setMenuOpen(false);
                            setDeleteOpen(true);
                          }}
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="size-4" aria-hidden />
                          Delete
                        </button>
                      </div>
                    </>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          {audio.description ? (
            <p className="line-clamp-1 text-xs text-muted-foreground">
              {audio.description}
            </p>
          ) : null}

          <div className="flex items-center gap-2">
            {audio.category ? (
              <span className="rounded bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                {audio.category}
              </span>
            ) : null}
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              {isCurrent && duration > 0 ? (
                formatTime(duration)
              ) : (
                <>
                  <Play className="size-3" aria-hidden />
                  {audio.playCount}
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete audio"
        description={`Delete "${audio.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={onDelete}
      />
    </>
  );
});

