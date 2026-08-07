/**
 * The Online Songs feature — reuses the shared Audio Platform
 * (`@features/audio`) for ALL playback (queue, progress, speed, shuffle,
 * repeat, Mini/Full player, Media Session). This feature provides the audio
 * library CRUD, search/filters, the list page and the admin create/edit page.
 *
 *   types/      Audio + constants (Profile/UserRole + UploadState are SHARED
 *               in `@/types`)
 *   utils/      Audio→AudioItem mapping + client search/filter (content-type,
 *               media paths, duration display are SHARED in `@/utils` /
 *               `@features/audio`)
 *   services/   SongService (audios table) — UploadService (edge functions)
 *               and ProfileService (roles) are SHARED in `@/services`
 *   queries/    songsKeys + useInfiniteAudios/useAudio/useAudioCategories +
 *               optimistic mutations + useCurrentProfile
 *   store/      useSongSearchStore (client-side filter UI state)
 *   hooks/      useAudioLibrary, useAudioPlayback, useAudioUpload
 *   components/ AudioSearchBar, AudioFilters, AudioCard, AudioListPage,
 *               AddEditAudioPage
 */

export * from "./types";
export * from "./utils";
export * from "./services";
export * from "./queries";
export * from "./store";
export * from "./hooks";
export * from "./components";
