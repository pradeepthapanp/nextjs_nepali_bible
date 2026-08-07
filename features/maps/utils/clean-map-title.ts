/**
 * cleanMapTitle — strips the leading numeric prefix from a map title (the
 * faithful port of the Flutter `_cleanTitle` helper used by both
 * `maps_details_view.dart` and `map_image_viewer.dart`):
 * `input.replaceFirst(RegExp(r'^\d+\.?\s*'), '')` — "251. The Church #1" →
 * "The Church #1".
 */
export function cleanMapTitle(title: string): string {
  return title.replace(/^\d+\.?\s*/, "");
}
