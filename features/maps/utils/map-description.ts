/**
 * Map SEO description helper — derives a description from EXISTING map
 * content only (title + topic); never invents facts. Used by the maps page
 * `generateMetadata` and the map viewer. Pure + framework-free.
 */
import { titledDescription } from "@/lib/seo-text";
import type { BibleMap } from "../types";
import { cleanMapTitle } from "./clean-map-title";

/**
 * Generates a unique description for a map from its EXISTING title + topic:
 *   "{CleanTitle} — a Bible map from the {topic} collection".
 * The clean title prefixes every description, so no two maps share an
 * identical description (no duplicates).
 */
export function deriveMapDescription(map: Pick<BibleMap, "title" | "topic">): string {
  const title = cleanMapTitle(map.title || "Bible map");
  const topic = map.topic?.trim();
  return topic
    ? titledDescription(title, `A Bible map from the ${topic} collection`)
    : titledDescription(title, "Bible map");
}
