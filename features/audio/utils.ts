/**
 * Pure formatting/derived helpers for the Audio Platform — framework-free so
 * they are unit-testable and shared by the hooks and components.
 */

/**
 * Formats seconds as `m:ss` (or `h:mm:ss`) — a direct port of the Flutter
 * `_FullAudioPlayerSheet._formatTime` / `FullAudioBiblePlayer._format`.
 */
export function formatTime(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds || 0));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  const ss = String(secs).padStart(2, "0");
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${ss}`;
  }
  return `${minutes}:${ss}`;
}

/**
 * Formats the remaining time as `-m:ss` — a direct port of the Flutter
 * `MiniAudioPlayer._formatDuration` (returns "" until playback starts).
 */
export function formatRemaining(position: number, duration: number): string {
  if (duration <= 0 || position <= 0) return "";
  return `-${formatTime(Math.max(0, duration - position))}`;
}

/**
 * 0..1 progress fraction (clamped) — the web replacement of the inline
 * `position/duration` ratio the Flutter players computed for their progress
 * bars. Returns 0 for unknown/empty durations.
 */
export function progressFraction(position: number, duration: number): number {
  if (!duration || duration <= 0 || position <= 0) return 0;
  return Math.min(1, Math.max(0, position / duration));
}
