"use client";

export interface ChordTextProps {
  chord: string;
  lyric: string;
  /** Opens the chord chart sheet for this chord (Flutter's tappable chord). */
  onChordTap?: (chord: string) => void;
}

/**
 * ChordText — a single chord-over-lyric unit (the web equivalent of the
 * chord/lyric pair `Column` in `custom_chords_widget.dart` / `ChordLyricPair`).
 * The chord is a real button (opens the chord chart when `onChordTap` is
 * provided) rendered above the lyric. Never parses or transposes — it
 * receives an already-parsed chord + lyric.
 */
export function ChordText({ chord, lyric, onChordTap }: ChordTextProps) {
  return (
    <span className="inline-flex flex-col items-start align-bottom">
      {chord ? (
        <button
          type="button"
          onClick={() => onChordTap?.(chord)}
          disabled={!onChordTap}
          aria-label={onChordTap ? `Show chord ${chord}` : undefined}
          className="text-sm font-bold leading-none text-primary disabled:cursor-default disabled:opacity-100"
        >
          {chord}
        </button>
      ) : null}
      <span className="leading-snug">{lyric}</span>
    </span>
  );
}
