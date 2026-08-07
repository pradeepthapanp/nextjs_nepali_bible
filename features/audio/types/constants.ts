import type { RepeatMode } from "./player";

/**
 * Playback options — the direct port of the Flutter speed choices in
 * `playback_speed_popup_widget.dart` (0.75x, 1x, 1.25x, 1.5x, 2x) plus the
 * platform's own defaults. `AudioPlayer.speedStream` defaults to 1.0 in
 * Flutter; the repeat default is just_audio's `LoopMode.off`.
 */
export const PLAYBACK_SPEEDS = [0.75, 1, 1.25, 1.5, 2] as const;

export const DEFAULT_PLAYBACK_SPEED = 1;
export const DEFAULT_REPEAT_MODE: RepeatMode = "off";

/** Seconds skipped by the seek keyboard shortcut / media-session actions. */
export const SEEK_STEP_SECONDS = 10;

/** The repeat cycle order (off → all → one → off) used by the full player. */
export const REPEAT_CYCLE: readonly RepeatMode[] = ["off", "all", "one"];

/**
 * The playback-position threshold (seconds) at which `previous()` restarts the
 * current item instead of jumping to the previous one — a direct port of
 * `just_audio`'s `seekToPrevious` behavior (3s).
 */
export const PREVIOUS_RESTART_THRESHOLD = 3;
