"use client";

import { Gauge } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAudioPlayerStore } from "../store";
import { PLAYBACK_SPEEDS } from "../types";
import { cn } from "@/utils/cn";

export interface PlaybackSpeedSelectProps {
  className?: string;
}

/**
 * PlaybackSpeedSelect — the playback-speed control (the web replacement of
 * Flutter's `PlaybackSpeedPopupWidget`: a chip with a 0.75–2.0x popup). Uses
 * an accessible native `<select>`; reads/writes the player store directly
 * (only the speed fields, so it never re-renders on position ticks).
 */
export function PlaybackSpeedSelect({ className }: PlaybackSpeedSelectProps) {
  const t = useTranslations("audio");
  const speed = useAudioPlayerStore((state) => state.speed);
  const setSpeed = useAudioPlayerStore((state) => state.setSpeed);

  return (
    <label
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border bg-card px-2.5 py-1 text-sm font-medium",
        className,
      )}
    >
      <Gauge className="size-4 text-primary" aria-hidden />
      <span className="sr-only">{t("speed")}</span>
      <select
        value={speed}
        onChange={(event) => setSpeed(Number(event.target.value))}
        className="cursor-pointer bg-transparent font-semibold text-primary outline-none"
      >
        {PLAYBACK_SPEEDS.map((option) => (
          <option key={option} value={option}>
            {option}x
          </option>
        ))}
      </select>
    </label>
  );
}
