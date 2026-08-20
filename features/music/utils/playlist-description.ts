/**
 * Playlist SEO description helper — derives a description from EXISTING
 * playlist content only (name + stored description + song count). Never
 * invents content. Pure + framework-free (server + client safe).
 */
import { normalizeText, titledDescription } from "@/lib/seo-text";
import type { Playlist } from "../types";

/**
 * Generates a playlist description:
 *   - when the playlist has a stored `description`, uses it (normalized);
 *   - otherwise derives "{Name} — a Nepali song playlist with {n} songs"
 *     from the name + the REAL song count (existing data).
 * The name + song count together keep descriptions distinct even when two
 * user playlists share the same name (no duplicates).
 */
export function derivePlaylistDescription(
  playlist: Pick<Playlist, "name" | "description">,
  songCount?: number,
): string {
  const name = normalizeText(playlist.name || "Playlist");
  const stored = playlist.description?.trim();
  if (stored) return normalizeText(stored);
  const count =
    typeof songCount === "number" && songCount > 0 ? `${songCount} songs` : "songs";
  return titledDescription(name, `Nepali song playlist with ${count}`);
}
