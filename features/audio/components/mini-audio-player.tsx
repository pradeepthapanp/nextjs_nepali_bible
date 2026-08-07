"use client";

import { useState } from "react";
import { ChevronUp, Pause, Play, SkipBack, SkipForward, Square } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useAudioPlayer } from "../hooks";
import { cn } from "@/utils/cn";
import { AudioArtwork } from "./audio-artwork";
import { FullAudioPlayer } from "./full-audio-player";
import { PlaybackSpeedSelect } from "./playback-speed-select";
import { ProgressLine } from "./progress-line";

export interface MiniAudioPlayerProps {
  className?: string;
}

/**
 * MiniAudioPlayer — the compact "now playing" bottom bar (the web replacement
 * of Flutter's `MiniAudioPlayer` in `lib/audios/widgets/mini_audio_player.dart`):
 * a thin progress line, artwork + title/artist, remaining time, and the
 * shuffle / speed / previous / play-pause / next / stop controls. Renders
 * nothing until a queue is loaded. Tapping the artwork/title opens the
 * `FullAudioPlayer`.
 */
export function MiniAudioPlayer({ className }: MiniAudioPlayerProps) {
  const {
    currentItem,
    isPlaying,
    isLoading,
    progress,
    remainingLabel,
    togglePlayPause,
    previous,
    next,
    stop,
  } = useAudioPlayer();
  const t = useTranslations("audio");
  const [fullOpen, setFullOpen] = useState(false);

  if (!currentItem) return null;

  const showTime = !isLoading;

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90",
        className,
      )}
    >
      <ProgressLine value={progress} />
      <div className="flex items-center gap-1 px-2 py-2 sm:gap-2 sm:px-4">
        <button
          type="button"
          onClick={() => setFullOpen(true)}
          aria-label={t("openFullPlayerFor", { title: currentItem.title })}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <AudioArtwork
            src={currentItem.artworkUrl}
            alt={currentItem.title}
            className="size-12 rounded-lg"
          />
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold text-foreground">
              {currentItem.title}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {currentItem.artist ?? t("unknownArtist")}
            </span>
            {showTime && remainingLabel ? (
              <span className="truncate text-[10px] font-medium text-primary">
                {remainingLabel}
              </span>
            ) : null}
          </span>
        </button>

        <ChevronUp
          className="hidden size-4 shrink-0 text-muted-foreground sm:block"
          aria-hidden
        />

        <PlaybackSpeedSelect className="hidden md:inline-flex" />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t("previous")}
          onClick={previous}
          className="shrink-0"
        >
          <SkipBack aria-hidden />
        </Button>
        <Button
          type="button"
          size="icon"
          aria-label={isPlaying ? t("pause") : t("play")}
          onClick={togglePlayPause}
          disabled={isLoading}
          className="shrink-0 rounded-full"
        >
          {isLoading ? (
            <Spinner className="size-4" />
          ) : isPlaying ? (
            <Pause aria-hidden />
          ) : (
            <Play aria-hidden />
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t("next")}
          onClick={next}
          className="shrink-0"
        >
          <SkipForward aria-hidden />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t("stop")}
          onClick={stop}
          className="shrink-0"
        >
          <Square aria-hidden />
        </Button>
      </div>

      <FullAudioPlayer open={fullOpen} onOpenChange={setFullOpen} />
    </div>
  );
}
