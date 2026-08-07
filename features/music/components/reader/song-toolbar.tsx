"use client";

import { Minus, Music2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSongSettings } from "@features/music/hooks";
import { cn } from "@/utils/cn";
import { TransposeIndicator } from "../lyrics/transpose-indicator";

export interface SongToolbarProps {
  className?: string;
}

/**
 * SongToolbar — the reader settings toolbar (the web equivalent of
 * `song_settings_sheet.dart`): NP/EN language toggle, show/hide chords,
 * transpose −/+ (with `TransposeIndicator`) and font-size steppers.
 *
 * Uses the existing `useSongSettings()` behavior hook for ALL state and
 * actions — no business logic is duplicated here. The clamp helpers live in
 * the settings store setters, so steppers simply pass ±1.
 */
export function SongToolbar({ className }: SongToolbarProps) {
  const settings = useSongSettings();

  return (
    <div
      className={cn("flex flex-wrap items-center gap-3", className)}
      aria-label="Reader settings"
    >
      {/* Language */}
      <div role="group" aria-label="Lyrics language" className="flex gap-1">
        <Button
          type="button"
          variant={settings.isNepali ? "secondary" : "outline"}
          size="sm"
          onClick={() => settings.setLyricsLanguage("np")}
          aria-pressed={settings.isNepali}
        >
          NP
        </Button>
        <Button
          type="button"
          variant={!settings.isNepali ? "secondary" : "outline"}
          size="sm"
          onClick={() => settings.setLyricsLanguage("en")}
          aria-pressed={!settings.isNepali}
        >
          EN
        </Button>
      </div>

      {/* Show chords */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => settings.setShowChords(!settings.showChords)}
        aria-pressed={settings.showChords}
      >
        <Music2 className="size-4" aria-hidden />
        Chords
      </Button>

      {/* Transpose */}
      <div role="group" aria-label="Transpose" className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Transpose down"
          onClick={settings.decreaseTranspose}
        >
          <Minus className="size-4" aria-hidden />
        </Button>
        <TransposeIndicator transpose={settings.transpose} />
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Transpose up"
          onClick={settings.increaseTranspose}
        >
          <Plus className="size-4" aria-hidden />
        </Button>
      </div>

      {/* Font size */}
      <div role="group" aria-label="Font size" className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Decrease font size"
          onClick={() => settings.setFontSize(settings.fontSize - 1)}
        >
          <Minus className="size-4" aria-hidden />
        </Button>
        <span className="min-w-9 text-center text-sm tabular-nums">
          {settings.fontSizeDisplay}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Increase font size"
          onClick={() => settings.setFontSize(settings.fontSize + 1)}
        >
          <Plus className="size-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
