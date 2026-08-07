import type { Artist, ArtistSort } from "../types";

/**
 * Artist sorting helper — a pure port of `ArtistsNotifier.sortArtists`
 * (`lib/providers/music/artists_provider.dart`). Unlike the Flutter notifier,
 * which sorts its state list in place, this returns a NEW array and never
 * mutates its input.
 */
export function artistSort(artists: Artist[], sort: ArtistSort): Artist[] {
  const sorted = [...artists];
  switch (sort) {
    case "nameAsc":
      sorted.sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
      );
      break;
    case "nameDesc":
      sorted.sort((a, b) =>
        b.name.toLowerCase().localeCompare(a.name.toLowerCase()),
      );
      break;
    case "lastUpdatedAsc":
      sorted.sort((a, b) => a.lastUpdated.localeCompare(b.lastUpdated));
      break;
    case "lastUpdatedDesc":
      sorted.sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated));
      break;
  }
  return sorted;
}
