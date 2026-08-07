"use client";

import { AudioLines, Headphones, RotateCcw, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PLAYBACK_SPEEDS,
  useAudioPlayerStore,
  useAudioSettingsStore,
  type RepeatMode,
} from "@features/audio";
import {
  SegmentedControl,
  SettingsSelect,
  SettingRow,
  ToggleSwitch,
} from "./settings-controls";

const REPEAT_OPTIONS: { value: RepeatMode; label: string }[] = [
  { value: "off", label: "Off" },
  { value: "all", label: "All" },
  { value: "one", label: "One" },
];

/**
 * AudioSection — the Settings → Audio section.
 *
 * COMPOSES the shared Audio Platform:
 *   - the ONE shared `useAudioSettingsStore` (created for this feature) holds
 *     the user's playback DEFAULTS (speed / repeat / shuffle) — edited here,
 *     applied by `useAudioPlayerStore.playQueue` on every new queue;
 *   - `useAudioPlayerStore` (the live engine state) is shown read-only below
 *     so the section reflects actual playback. Playback state itself is never
 *     duplicated — the engine remains the single owner.
 */
export function AudioSection() {
  const {
    defaultSpeed,
    defaultRepeatMode,
    shuffleDefault,
    setDefaultSpeed,
    setDefaultRepeatMode,
    setShuffleDefault,
    reset,
  } = useAudioSettingsStore();

  // Live playback state (read-only — compose the platform, don't re-implement).
  const currentItem = useAudioPlayerStore((state) => state.currentItem);
  const isPlaying = useAudioPlayerStore((state) => state.isPlaying);
  const speed = useAudioPlayerStore((state) => state.speed);
  const repeatMode = useAudioPlayerStore((state) => state.repeatMode);
  const shuffleEnabled = useAudioPlayerStore((state) => state.shuffleEnabled);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Audio</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Defaults applied every time you start a new track or chapter. These
          are saved on this device.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AudioLines className="size-4 text-primary" aria-hidden />
            Playback Defaults
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          <SettingRow
            title="Default playback speed"
            description="Applied to every new track."
          >
            <SegmentedControl
              label="Default playback speed"
              value={defaultSpeed}
              onChange={setDefaultSpeed}
              options={PLAYBACK_SPEEDS.map((value) => ({
                value,
                label: `${value}×`,
              }))}
            />
          </SettingRow>

          <SettingRow
            title="Repeat mode"
            description="Off plays once; All loops the queue; One loops the current track."
          >
            <div className="w-36">
              <SettingsSelect
                label="Default repeat mode"
                value={defaultRepeatMode}
                onChange={setDefaultRepeatMode}
                options={REPEAT_OPTIONS}
              />
            </div>
          </SettingRow>

          <SettingRow
            title="Shuffle by default"
            description="Start new queues in shuffle order."
          >
            <ToggleSwitch
              checked={shuffleDefault}
              onChange={setShuffleDefault}
              label="Shuffle by default"
            />
          </SettingRow>

          <div className="pt-3">
            <Button type="button" variant="outline" size="sm" onClick={reset}>
              <RotateCcw className="size-4" aria-hidden />
              Reset to defaults
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Headphones className="size-4 text-primary" aria-hidden />
            Now Playing
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentItem ? (
            <div className="space-y-1">
              <p className="font-medium text-foreground">{currentItem.title}</p>
              <p className="text-sm text-muted-foreground">
                {isPlaying ? "Playing" : "Paused"} · {speed}× · Repeat{" "}
                {repeatMode} ·{" "}
                <Shuffle
                  className="inline size-3.5"
                  aria-hidden
                />
                {shuffleEnabled ? "Shuffle on" : "Shuffle off"}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nothing playing right now. Start a song or Bible chapter and it
              will appear here.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
