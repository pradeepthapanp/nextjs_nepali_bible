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
 * AudioIndicator — the labeled play/pause control for the audio Bible.
 *
 * Replaces the play/pause affordance in Flutter's `bible_audio` widgets
 * (`play_pause_menu.dart`, `audio_bible_list.dart`). Presentational: playback
 * is delegated via `onToggle`; `aria-pressed` reflects the playing state. The
 * outline button shows a clear "Play audio" / "Pause" label so the control is
 * discoverable next to the reading progress bar.
 */
export function AudioIndicator({
  isPlaying,
  onToggle,
  disabled,
  className,
}: AudioIndicatorProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onToggle}
      disabled={disabled || !onToggle}
      aria-pressed={isPlaying}
      aria-label={isPlaying ? "Pause audio" : "Play audio"}
      className={cn(
        "h-9 gap-2",
        isPlaying && "border-primary/40 bg-primary/10 text-primary",
        className,
      )}
    >
      {isPlaying ? (
        <Pause className="size-4" aria-hidden />
      ) : (
        <Play className="size-4" aria-hidden />
      )}
      <span className="text-xs font-medium">
        {isPlaying ? "Pause" : "Play audio"}
      </span>
    </Button>
  );
}
