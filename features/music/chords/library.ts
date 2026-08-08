import type { GuitarChordDiagram } from "./types";

/**
 * Reusable guitar chord library — common worship chords (Major, minor, 7,
 * maj7, m7, sus2, sus4, dim, aug) across all 12 roots.
 *
 * Design:
 * - The common first-position ("cowboy") chords are hand-authored in `OPEN`
 *   (verified against standard worship voicings).
 * - Every other root × type is GENERATED from a movable barre shape
 *   (E-shape family for roots on the low E string, A-shape family for roots
 *   on the A string) so all 108 combinations resolve with real voicings.
 * - `getChordDiagram()` is the single resolver: it also handles slash chords
 *   (`"D/F#"` → base diagram + bass note) and returns `null` for anything the
 *   library does not know (the UI then shows "Diagram unavailable.").
 *
 * IMPORTANT: chord names passed here are already-transposed reader strings
 * (the lyrics engine transposes before rendering), so a transposed chord
 * opens the correct diagram automatically.
 */

/* ------------------------------------------------------------------ *
 * Root/scale facts (mirror `constants/chords.ts` spellings — sharps). *
 * ------------------------------------------------------------------ */

type Root =
  | "C" | "C#" | "D" | "D#" | "E"
  | "F" | "F#" | "G" | "G#" | "A" | "A#" | "B";

type Suffix = "" | "m" | "7" | "maj7" | "m7" | "sus2" | "sus4" | "dim" | "aug";

/** Which movable family each root uses (the LOWEST barre position wins). */
const ROOT_FAMILY: Record<Root, "E" | "A"> = {
  C: "A", "C#": "A", D: "A", "D#": "A",
  E: "E", F: "E", "F#": "E", G: "E", "G#": "E", A: "E",
  "A#": "A", B: "A",
};

/** Fret of each root on the low E string. */
const E_STRING_FRET: Record<Root, number> = {
  E: 0, F: 1, "F#": 2, G: 3, "G#": 4, A: 5, "A#": 6,
  B: 7, C: 8, "C#": 9, D: 10, "D#": 11,
};

/** Fret of each root on the A string. */
const A_STRING_FRET: Record<Root, number> = {
  A: 0, "A#": 1, B: 2, C: 3, "C#": 4, D: 5, "D#": 6,
  E: 7, F: 8, "F#": 9, G: 10, "G#": 11,
};

/**
 * Movable shapes. Fret values are OFFSETS from the root fret; `-1` = mute.
 * `dim` and `aug` use their own voicings (both families support them; dim/aug
 * are drawn without a barre line).
 */
const E_SHAPE: Partial<Record<Suffix, number[]>> = {
  "": [0, 2, 2, 1, 0, 0],
  m: [0, 2, 2, 0, 0, 0],
  "7": [0, 2, 0, 1, 0, 0],
  maj7: [0, 2, 1, 1, 0, 0],
  m7: [0, 2, 0, 0, 0, 0],
  sus2: [0, 2, 2, 4, 0, 0],
  sus4: [0, 2, 2, 2, 0, 0],
  aug: [0, 3, 2, 1, 1, 0],
  dim: [0, 1, 1, 3, 4, 3],
};

const A_SHAPE: Partial<Record<Suffix, number[]>> = {
  "": [-1, 0, 2, 2, 2, 0],
  m: [-1, 0, 2, 2, 1, 0],
  "7": [-1, 0, 2, 0, 2, 0],
  maj7: [-1, 0, 2, 1, 2, 0],
  m7: [-1, 0, 2, 0, 1, 0],
  sus2: [-1, 0, 2, 2, 0, 0],
  sus4: [-1, 0, 2, 2, 3, 0],
  aug: [-1, 0, 3, 2, 2, 1],
  dim: [-1, 0, 1, 2, 1, 2],
};

/* ------------------------------------------------------------------ *
 * First-position (open) chords — hand-authored worship voicings.      *
 * ------------------------------------------------------------------ */

const OPEN: Record<string, number[]> = {
  // Major
  C: [-1, 3, 2, 0, 1, 0],
  D: [-1, -1, 0, 2, 3, 2],
  E: [0, 2, 2, 1, 0, 0],
  G: [3, 2, 0, 0, 0, 3],
  A: [-1, 0, 2, 2, 2, 0],
  // Minor
  Dm: [-1, -1, 0, 2, 3, 1],
  Em: [0, 2, 2, 0, 0, 0],
  Am: [-1, 0, 2, 2, 1, 0],
  // 7
  C7: [-1, 3, 2, 3, 1, 0],
  D7: [-1, -1, 0, 2, 1, 2],
  E7: [0, 2, 0, 1, 0, 0],
  G7: [3, 2, 0, 0, 0, 1],
  A7: [-1, 0, 2, 0, 2, 0],
  B7: [-1, 2, 1, 2, 0, 2],
  // maj7
  Cmaj7: [-1, 3, 2, 0, 0, 0],
  Dmaj7: [-1, -1, 0, 2, 2, 2],
  Emaj7: [0, 2, 1, 1, 0, 0],
  Gmaj7: [3, 2, 0, 0, 0, 2],
  Amaj7: [-1, 0, 2, 1, 2, 0],
  // m7
  Dm7: [-1, -1, 0, 2, 1, 1],
  Em7: [0, 2, 0, 0, 0, 0],
  Am7: [-1, 0, 2, 0, 1, 0],
  // sus2
  Csus2: [-1, 3, 0, 0, 1, 3],
  Dsus2: [-1, -1, 0, 2, 3, 0],
  Esus2: [0, 2, 2, 4, 0, 0],
  Gsus2: [3, 0, 0, 2, 3, 3],
  Asus2: [-1, 0, 2, 2, 0, 0],
  // sus4
  Csus4: [-1, 3, 3, 0, 1, 1],
  Dsus4: [-1, -1, 0, 2, 3, 3],
  Esus4: [0, 2, 2, 2, 0, 0],
  Gsus4: [3, 3, 0, 0, 1, 3],
  Asus4: [-1, 0, 2, 2, 3, 0],
  // aug (open, no barre)
  Caug: [-1, 3, 2, 1, 1, 0],
  Eaug: [0, 3, 2, 1, 1, 0],
  Gaug: [3, 2, 1, 0, 0, 3],
  Aaug: [-1, 0, 3, 2, 2, 1],
};

/* ------------------------------------------------------------------ *
 * Resolution                                                          *
 * ------------------------------------------------------------------ */

const ROOT_PATTERN = /^([A-G][b#]?)(.*)$/;

/** Common flat spellings → their sharp enharmonic (the library is keyed by
 * sharps because the reader renders sharps; flat inputs still resolve). */
const FLAT_TO_SHARP: Record<string, Root> = {
  Db: "C#", Eb: "D#", Gb: "F#", Ab: "G#", Bb: "A#",
};

/** Splits a chord into `{ root, suffix }`, or null when it is not a chord. */
function parseChord(chord: string): { root: Root; suffix: string } | null {
  const match = ROOT_PATTERN.exec(chord.trim());
  if (!match) return null;
  const rawRoot = match[1] as string;
  const root = (rawRoot in ROOT_FAMILY ? rawRoot : FLAT_TO_SHARP[rawRoot]) as
    | Root
    | undefined;
  if (!root) return null;
  return { root, suffix: match[2] ?? "" };
}

/** Generates a barre voicing for a root × suffix, or null when unsupported. */
function resolveDiagram(root: Root, suffix: Suffix): GuitarChordDiagram | null {
  const family = ROOT_FAMILY[root];
  const template = (family === "E" ? E_SHAPE : A_SHAPE)[suffix];
  if (!template) return null;
  const rootFret =
    family === "E" ? E_STRING_FRET[root] : A_STRING_FRET[root];
  const frets = template.map((fret) => (fret === -1 ? -1 : fret + rootFret));

  // A barre exists on E-shape (across all 6) and A-shape (across 1-5) roots
  // for the non-sus/dim/aug shapes; open position (rootFret 0) has no barre.
  const hasBarre = suffix !== "dim" && suffix !== "aug" && rootFret > 0;
  const barre = hasBarre
    ? family === "E"
      ? { from: 0, to: 5, fret: rootFret }
      : { from: 1, to: 5, fret: rootFret }
    : undefined;

  return { name: `${root}${suffix}`, frets, barre };
}

/**
 * Resolves any chord string (already-transposed) to a diagram, or null when
 * the chord is not in the library. Slash chords (`"D/F#"`) resolve the BASE
 * chord and expose the bass note for the title. Unknown chords → null (the
 * UI shows "Diagram unavailable.").
 */
export function getChordDiagram(chord: string): GuitarChordDiagram | null {
  const trimmed = chord.trim();
  if (!trimmed) return null;

  // Slash chord: base + bass note (e.g. "D/F#" → "D" + "F#").
  const slash = trimmed.split("/");
  const base = slash[0].trim();
  const bassNote = slash.length > 1 ? slash.slice(1).join("/").trim() : undefined;

  const parsed = parseChord(base);
  if (!parsed) return null;
  if (!(parsed.suffix in E_SHAPE) && !(parsed.suffix in A_SHAPE)) return null;

  const open = OPEN[`${parsed.root}${parsed.suffix}`];
  const diagram = open
    ? { name: `${parsed.root}${parsed.suffix}`, frets: open }
    : resolveDiagram(parsed.root, parsed.suffix as Suffix);
  if (!diagram) return null;

  return { ...diagram, name: trimmed, bassNote };
}
