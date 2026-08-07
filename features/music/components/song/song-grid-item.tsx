"use client";

import { SongCard, type SongCardProps } from "./song-card";

/**
 * SongGridItem — the semantic grid item: a `<li>` wrapper around `SongCard`
 * (reuse — no duplicated rendering). Use inside a responsive `<ul>` grid.
 */
export function SongGridItem(props: SongCardProps) {
  return (
    <li className="h-full">
      <SongCard {...props} />
    </li>
  );
}
