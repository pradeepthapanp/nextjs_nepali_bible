"use client";

import { SongListItem, type SongListItemProps } from "../song/song-list-item";

export type SearchResultCardProps = SongListItemProps;

/**
 * SearchResultCard — a song search result row. Reuses `SongListItem` (the
 * shared song-row presentation) so search results never duplicate the song
 * rendering. The search relevance/snippet concerns are handled by the search
 * query layer — this component is purely presentational.
 */
export function SearchResultCard(props: SearchResultCardProps) {
  return <SongListItem {...props} />;
}
