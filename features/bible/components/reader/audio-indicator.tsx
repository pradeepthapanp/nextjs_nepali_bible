"use client";

import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

export interface AudioIndicatorProps {
  isPlaying: boolean;
  onToggle?: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * AudioIndicator — a compact play/pause control for the audio Bible.
 *
 * Replaces the play/pause affordance in Flutter's `bible_audio` widgets
 * (`play_pause_menu.dart`, `audio_bible_list.dart`). Presentational: playback
 * is delegated via `onToggle`; `aria-pressed` reflects the playing state.
 */
export function AudioIndicator({
  isPlaying,
  onToggle,
  disabled,
  className,
}: AudioIndicatorProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onToggle}
      disabled={disabled || !onToggle}
      aria-pressed={isPlaying}
      aria-label={isPlaying ? "Pause audio" : "Play audio"}
      className={cn(className)}
    >
      {isPlaying ? (
        <Pause className="size-5" aria-hidden />
      ) : (
        <Play className="size-5" aria-hidden />
      )}
    </Button>
  );
}
