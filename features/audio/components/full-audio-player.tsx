"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ListMusic,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Square,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useDialog } from "@/hooks/use-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useAudioPlayer } from "../hooks";
import { cn } from "@/utils/cn";
import { formatTime } from "../utils";
import { AudioArtwork } from "./audio-artwork";
import { PlaybackSpeedSelect } from "./playback-speed-select";
import { SeekBar } from "./seek-bar";

export interface FullAudioPlayerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * FullAudioPlayer — the expanded player dialog (the web replacement of
 * Flutter's `FullAudioPlayer` / `_FullAudioPlayerSheet` bottom sheet): artwork,
 * title/artist/description, a seek bar with time labels, prev/play/next, and
 * the shuffle / repeat / speed / stop controls plus the queue list.
 *
 * Rendered inside the `MiniAudioPlayer` (tapping the artwork/title opens it).
 * Built on the shared `useDialog` lifecycle (Escape, focus trap, scroll lock,
 * focus restore) + framer-motion. Fully presentational — every value/action
 * comes from `useAudioPlayer`.
 */
export function FullAudioPlayer({ open, onOpenChange }: FullAudioPlayerProps) {
  const {
    currentItem,
    queue,
    currentIndex,
    isPlaying,
    isLoading,
    position,
    duration,
    buffered,
    shuffleEnabled,
    repeatMode,
    togglePlayPause,
    previous,
    next,
    stop,
    seek,
    playAtIndex,
    toggleShuffle,
    cycleRepeat,
  } = useAudioPlayer();
  const t = useTranslations("audio");

  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const { onClose } = useDialog({ open, onOpenChange, containerRef: panelRef });

  return (
    <AnimatePresence>
      {open && currentItem ? (
        <div className="fixed inset-0 z-50 grid place-items-end sm:place-items-center">
          <motion.div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={t("playerLabel")}
            className="relative z-10 flex max-h-[92dvh] w-full max-w-lg flex-col gap-4 overflow-y-auto rounded-t-2xl border bg-card p-5 shadow-lg sm:rounded-2xl"
            initial={{ y: 64, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 64, opacity: 0 }}
          >
            <header className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-muted-foreground">
                {t("nowPlaying")}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={t("closeFullPlayer")}
                onClick={onClose}
              >
                <X aria-hidden />
              </Button>
            </header>

            <AudioArtwork
              src={currentItem.artworkUrl}
              alt={currentItem.title}
              className="mx-auto aspect-square w-full max-w-xs rounded-xl"
            />

            <div className="text-center">
              <h2 className="truncate text-lg font-bold text-foreground">
                {currentItem.title}
              </h2>
              <p className="truncate text-sm text-muted-foreground">
                {currentItem.artist ?? t("unknownArtist")}
              </p>
              {currentItem.description ? (
                <p className="mt-1 truncate text-xs text-primary/80">
                  {currentItem.description}
                </p>
              ) : null}
            </div>

            <div className="space-y-1">
              <SeekBar
                position={position}
                duration={duration}
                buffered={buffered}
                disabled={isLoading && duration === 0}
                onSeek={seek}
              />
              <div className="flex justify-between text-xs tabular-nums text-muted-foreground">
                <span>{formatTime(position)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={t("previous")}
                onClick={previous}
              >
                <SkipBack aria-hidden />
              </Button>
              <Button
                type="button"
                size="lg"
                aria-label={isPlaying ? t("pause") : t("play")}
                onClick={togglePlayPause}
                disabled={isLoading}
                className="size-14 rounded-full p-0"
              >
                {isLoading ? (
                  <Spinner className="size-6" />
                ) : isPlaying ? (
                  <Pause className="size-6" aria-hidden />
                ) : (
                  <Play className="size-6" aria-hidden />
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={t("next")}
                onClick={next}
              >
                <SkipForward aria-hidden />
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button
                type="button"
                variant={shuffleEnabled ? "secondary" : "outline"}
                size="sm"
                aria-pressed={shuffleEnabled}
                onClick={toggleShuffle}
              >
                <Shuffle aria-hidden />
                {t("shuffle")} {shuffleEnabled ? t("on") : t("off")}
              </Button>
              <Button
                type="button"
                variant={repeatMode !== "off" ? "secondary" : "outline"}
                size="sm"
                aria-label={t("repeat")}
                onClick={cycleRepeat}
              >
                {repeatMode === "one" ? (
                  <Repeat1 aria-hidden />
                ) : (
                  <Repeat aria-hidden />
                )}
                {repeatMode === "off"
                  ? t("repeat")
                  : repeatMode === "one"
                    ? t("one")
                    : t("all")}
              </Button>
              <PlaybackSpeedSelect />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={stop}
              >
                <Square aria-hidden />
                {t("stop")}
              </Button>
            </div>

            {queue.length > 0 ? (
              <div className="border-t pt-3">
                <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  <ListMusic className="size-4 text-primary" aria-hidden />
                  {t("queue")} ({queue.length})
                </h3>
                <ul className="max-h-44 space-y-1 overflow-y-auto">
                  {queue.map((item, index) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => playAtIndex(index)}
                        aria-current={index === currentIndex}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm",
                          index === currentIndex
                            ? "bg-primary/10 font-semibold text-primary"
                            : "text-foreground hover:bg-accent",
                        )}
                      >
                        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                          {index + 1}
                        </span>
                        <span className="truncate">{item.title}</span>
                        {index === currentIndex && isPlaying ? (
                          <Play className="ml-auto size-3 shrink-0" aria-hidden />
                        ) : null}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
