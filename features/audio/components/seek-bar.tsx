"use client";

import { useCallback, useRef } from "react";
import { cn } from "@/utils/cn";
import { progressFraction } from "../utils";

export interface SeekBarProps {
  /** Current position in seconds. */
  position: number;
  /** Total duration in seconds. */
  duration: number;
  /** Buffered seconds (drives the secondary fill). */
  buffered?: number;
  disabled?: boolean;
  /** Fired with the target position (seconds) on seek. */
  onSeek?: (seconds: number) => void;
  className?: string;
}

/**
 * SeekBar — the interactive progress slider of the Full player (the web
 * replacement of Flutter's `Slider` in `_FullAudioPlayerSheet` /
 * `FullAudioBiblePlayer`). Click/drag to seek, keyboard-accessible
 * (`role="slider"`, arrow keys ±10s, Home/End), with a buffered secondary
 * fill. Fully controlled — the position comes from the player store.
 */
export function SeekBar({
  position,
  duration,
  buffered,
  disabled,
  onSeek,
  className,
}: SeekBarProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const fraction = progressFraction(position, duration);
  const bufferedFraction = progressFraction(buffered ?? 0, duration);

  const seekFromClientX = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track || !duration) return;
      const rect = track.getBoundingClientRect();
      if (rect.width <= 0) return;
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      onSeek?.(ratio * duration);
    },
    [duration, onSeek],
  );

  return (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-valuemin={0}
      aria-valuemax={Math.round(duration) || 0}
      aria-valuenow={Math.round(position)}
      aria-label="Seek"
      aria-disabled={disabled || undefined}
      onPointerDown={(event) => {
        if (disabled) return;
        event.currentTarget.setPointerCapture?.(event.pointerId);
        seekFromClientX(event.clientX);
      }}
      onPointerMove={(event) => {
        if (disabled || event.buttons !== 1) return;
        seekFromClientX(event.clientX);
      }}
      onKeyDown={(event) => {
        if (disabled || !duration) return;
        if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
          event.preventDefault();
          onSeek?.(Math.max(0, position - 10));
        } else if (event.key === "ArrowRight" || event.key === "ArrowUp") {
          event.preventDefault();
          onSeek?.(Math.min(duration, position + 10));
        } else if (event.key === "Home") {
          event.preventDefault();
          onSeek?.(0);
        } else if (event.key === "End") {
          event.preventDefault();
          onSeek?.(duration);
        }
      }}
      className={cn(
        "group relative flex h-6 cursor-pointer touch-none select-none items-center",
        disabled && "cursor-default",
        className,
      )}
    >
      {/* track */}
      <div className="absolute left-0 h-1.5 w-full rounded-full bg-muted" />
      {/* buffered */}
      <div
        className="absolute left-0 h-1.5 rounded-full bg-muted-foreground/30"
        style={{ width: `${bufferedFraction * 100}%` }}
      />
      {/* played */}
      <div
        className="absolute left-0 h-1.5 rounded-full bg-primary"
        style={{ width: `${fraction * 100}%` }}
      />
      {/* thumb */}
      <div
        className="absolute size-3.5 -translate-x-1/2 rounded-full bg-primary opacity-0 shadow transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
        style={{ left: `${fraction * 100}%` }}
      />
    </div>
  );
}
