/**
 * Guitar chord diagram domain types for the Song Reader's tappable chords.
 *
 * A chord is modeled as a 6-string voicing (low E → high e) so it can be
 * rendered as a standard chord box and reused anywhere (reader dialog, chord
 * charts, admin previews).
 */

/** A barre: one finger pressed across consecutive strings at a fret. */
export interface GuitarChordBarre {
  /** First string of the barre (0 = low E). */
  from: number;
  /** Last string of the barre (5 = high e). */
  to: number;
  /** Fret the barre sits on. */
  fret: number;
}

/** A single guitar chord voicing. */
export interface GuitarChordDiagram {
  /** Display name, e.g. `"C"`, `"Am7"` or `"D/F#"`. */
  name: string;
  /**
   * Six strings low E → high e:
   *   - `-1` → muted (x)
   *   - `0`  → open string
   *   - `>0` → fretted fret
   */
  frets: number[];
  /** Optional per-string fingering hints (1-4), aligned with `frets`. */
  fingers?: (number | null)[];
  /** Optional barre, drawn as a line across the strings. */
  barre?: GuitarChordBarre;
  /** Slash-chord bass note shown in the title (e.g. `"F#"` in `"D/F#"`). */
  bassNote?: string;
}
