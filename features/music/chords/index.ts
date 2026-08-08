/**
 * Reusable guitar chord library + presentation for the Song Reader's
 * tappable chords.
 *
 *   types.ts          — `GuitarChordDiagram` / `GuitarChordBarre`
 *   library.ts        — `getChordDiagram()` (the chord data + resolver)
 *   chord-diagram.tsx — `<ChordDiagram>` (the SVG chord box)
 *   chord-dialog.tsx  — `<ChordDialog>` (built on the shared `useDialog`)
 */

export * from "./types";
export * from "./library";
export * from "./chord-diagram";
export * from "./chord-dialog";
