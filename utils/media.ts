/**
 * Media CDN helpers — shared by every feature that stores media through the
 * Supabase edge functions and needs to translate a public media URL back into
 * a storage path (e.g. to delete the object).
 */

/** Media CDN base URL (the Flutter app's media host). */
export const MEDIA_BASE_URL = "https://media.sgmbiblezone.com/";

/**
 * Extracts the storage path from a media URL — a direct port of the Flutter
 * `_AudioNotifierState._extractPath` (which stripped the
 * `https://media.sgmbiblezone.com/` prefix so the `delete-file` edge function
 * can remove the object). Returns null for non-media URLs.
 */
export function mediaPathFromUrl(url: string | undefined): string | null {
  if (!url) return null;
  if (!url.startsWith(MEDIA_BASE_URL)) return null;
  return url.substring(MEDIA_BASE_URL.length);
}
