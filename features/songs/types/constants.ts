/**
 * Online Songs constants — a direct port of the Flutter audio list / upload
 * tuning:
 *   - `AUDIO_PAGE_SIZE` = `AudioNotifier._pageSize` (20);
 *   - upload storage paths mirror `AddEditNewAudioPage` (covers under
 *     `images/audio_covers/…`, audio under `audio/songs/…`);
 *   - `MEDIA_BASE_URL` (the media CDN host) is SHARED — it lives in
 *     `@/utils/media`.
 */
export const AUDIO_PAGE_SIZE = 20;

/** Storage path prefixes (mirroring `AddEditNewAudioPage` / `UploadNotifier`). */
export const COVER_UPLOAD_FOLDER = "audio_covers";
export const AUDIO_UPLOAD_FOLDER = "songs";

/** Filter sentinel for the category filter ("all" shows every audio). */
export const ALL_CATEGORY = "all";
