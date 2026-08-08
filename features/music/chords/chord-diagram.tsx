"use client";

import { useMemo } from "react";
import type { GuitarChordDiagram } from "./types";
import { cn } from "@/utils/cn";

/** x position of each string (low E → high e). */
const STRING_X = [34, 58, 82, 106, 130, 154];
/** Vertical origin of the nut / first fret line. */
const NUT_Y = 34;
/** Height of one fret row. */
const ROW_HEIGHT = 30;
/** Padding around the box. */
const PAD = 14;
const WIDTH = STRING_X[STRING_X.length - 1] + PAD * 2;

export interface ChordDiagramProps {
  diagram: GuitarChordDiagram;
  className?: string;
}

/**
 * ChordDiagram — a standard 6-string guitar chord box as inline SVG.
 *
 * Presentational: renders a `GuitarChordDiagram` (muted/open markers, fretted
 * dots, optional barre, fret-number label for shifted positions). Scales with
 * its container (fixed viewBox) so it stays crisp and mobile friendly.
 */
export function ChordDiagram({ diagram, className }: ChordDiagramProps) {
  const { frets, barre } = diagram;

  const layout = useMemo(() => {
    const minFretted = Math.min(
      ...frets.filter((fret) => fret > 0),
      Number.POSITIVE_INFINITY,
    );
    const hasOpen = frets.includes(0);
    const baseFret =
      hasOpen || minFretted === Number.POSITIVE_INFINITY ? 1 : minFretted;
    const relFrets = frets.map((fret) =>
      fret === -1 ? -1 : fret === 0 ? 0 : fret - baseFret + 1,
    );
    const maxRel = Math.max(...relFrets.filter((f) => f > 0), 1);
    const rows = Math.max(4, maxRel);
    const height = NUT_Y + rows * ROW_HEIGHT + PAD;
    return { baseFret, relFrets, rows, height };
  }, [frets]);

  const { baseFret, relFrets, rows, height } = layout;
  const nutY = NUT_Y;

  // Rows of horizontal fret lines (nut + rows).
  const fretLines = Array.from({ length: rows + 1 }, (_, i) => nutY + i * ROW_HEIGHT);

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${height}`}
      role="img"
      aria-label={`${diagram.name} guitar chord diagram`}
      className={cn(
        "h-auto w-40 max-w-full text-muted-foreground",
        className,
      )}
    >
      {/* Fret label for shifted positions (baseFret > 1). */}
      {baseFret > 1 ? (
        <text
          x={4}
          y={nutY + ROW_HEIGHT * 0.62}
          fontSize="10"
          className="fill-muted-foreground"
        >
          {baseFret}
        </text>
      ) : null}

      {/* Vertical strings */}
      {STRING_X.map((x, i) => (
        <line
          key={`s${i}`}
          x1={x}
          y1={fretLines[0]}
          x2={x}
          y2={fretLines[rows]}
          stroke="currentColor"
          strokeWidth={i === 0 || i === STRING_X.length - 1 ? 1.6 : 1.1}
        />
      ))}

      {/* Horizontal fret lines */}
      {fretLines.map((y, i) => (
        <line
          key={`f${i}`}
          x1={STRING_X[0]}
          y1={y}
          x2={STRING_X[STRING_X.length - 1]}
          y2={y}
          stroke="currentColor"
          strokeWidth={baseFret === 1 && i === 0 ? 3 : 1}
        />
      ))}

      {/* Muted / open markers */}
      {relFrets.map((rel, i) =>
        rel === -1 ? (
          <text
            key={`m${i}`}
            x={STRING_X[i]}
            y={fretLines[0] - 10}
            textAnchor="middle"
            fontSize="13"
            className="fill-muted-foreground"
          >
            x
          </text>
        ) : rel === 0 ? (
          <text
            key={`o${i}`}
            x={STRING_X[i]}
            y={fretLines[0] - 10}
            textAnchor="middle"
            fontSize="13"
            className="fill-muted-foreground"
          >
            o
          </text>
        ) : null,
      )}

      {/* Fretted dots */}
      <g className="text-primary">
        {relFrets.map((rel, i) =>
          rel > 0 ? (
            <circle
              key={`d${i}`}
              cx={STRING_X[i]}
              cy={nutY + (rel - 1) * ROW_HEIGHT + ROW_HEIGHT / 2}
              r={8.5}
              fill="currentColor"
            />
          ) : null,
        )}
      </g>

      {/* Barre — the barre fret is always >= baseFret, so its row is >= 0. */}
      {barre ? (
        <line
          x1={STRING_X[barre.from]}
          y1={nutY + (barre.fret - baseFret) * ROW_HEIGHT + ROW_HEIGHT / 2}
          x2={STRING_X[barre.to]}
          y2={nutY + (barre.fret - baseFret) * ROW_HEIGHT + ROW_HEIGHT / 2}
          stroke="currentColor"
          strokeWidth={7}
          strokeLinecap="round"
          className="text-primary"
        />
      ) : null}
    </svg>
  );
}
