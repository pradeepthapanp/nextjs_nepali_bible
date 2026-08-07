# Online Songs (implemented)

The Online Songs (audio library) feature. **All playback is delegated to the
shared Audio Platform** (`@features/audio`) — this feature never implements
queue, playback, progress, speed, shuffle, repeat, the Mini/Full player or the
Media Session API; it only maps its `Audio` model into `AudioItem`s and hands
them to `playQueue(...)`.

## Flutter mapping

| Web piece | Flutter class |
| --- | --- |
| `AudioListPage` | `AudiosListPage` (`lib/audios/audios_list_page.dart`) |
| `AudioCard` | `_AudioCard` (the card inside `audios_list_page.dart`) |
| `AddEditAudioPage` | `AddEditNewAudioPage` (`lib/audios/add_new_audio_page.dart`) |
| `AudioSearchBar` / `AudioFilters` | web refinement (Flutter had no list search/filter) |
| `services/song-service.ts` | `SupabaseRepository` audio methods (`fetchAudios`, `getAudio`, `insertAudio`, `updateAudio`, `deleteAudio`, `incrementPlayCount`, `fetchAudioCategories`) |
| `@/services/upload-service.ts` (shared) | `UploadNotifier` (`get-upload-url` / `delete-file` edge functions + PUT with progress) |
| `@/services/profile-service.ts` (shared) | `fetchProfileById` / `currentUserProvider` (role gating) |
| `queries/use-songs.ts` | `AudioNotifier` (`build` + `loadMore`, page size 20) |
| `queries/use-audio-mutations.ts` | `AudioNotifier` `createAudio` / `updateAudio` / `deleteAudio` / `incrementPlayCount` (optimistic) |
| `hooks/use-audio-playback.ts` | `AudioController.playOrToggleAudioPlaylistFromServer` + `Audio.toAudioSource` |
| `store/song-search-store.ts` | web refinement (client-side search/filter UI state) |
| `AudioPlayerHost` (mounted by the page) | the page's `bottomNavigationBar: MiniAudioPlayer()` |

## Pages

- **`/songs`** (`AudioListPage`) — the library: paginated list (infinite),
  client-side search (`AudioSearchBar`) + category filter (`AudioFilters`),
  loading / empty / error states, admin "Add Audio" entry, per-card
  edit/delete, and the shared `AudioPlayerHost` (mini player) fixed at the
  bottom. Cards are memoized and read "now playing" state via targeted
  platform-store selectors, so only the playing card re-renders on position
  ticks.
- **`/songs/new`** (`AddEditAudioPage`) — admin create: validated text fields +
  optional cover upload + required audio upload (progress card), then
  `createAudio`.
- **`/songs/edit/{id}`** (`AddEditAudioPage`) — admin edit: text-only update
  (Flutter hides file pickers when editing).

Both admin routes are gated on `canManage` (admin/editor role from
`useCurrentProfile`).

## Services

- **`SongService`** — `audios` table CRUD + `getCategories` + `incrementPlayCount`.
- **`UploadService`** — SHARED (`@/services/upload-service`): `get-upload-url`
  edge function → signed PUT (XHR for progress) → media URL; `delete-file`
  edge function. Songs builds its own storage paths (`audio_covers/{uuid}_{base}.{ext}`,
  `songs/…`) via `useAudioUpload`.
- **`ProfileService`** — SHARED (`@/services/profile-service`): `profiles` row
  by user id (role for the admin gate via the shared `canManage` rule in
  `@/types/profile`).
- The aggregate `getSongServices()` wires the Songs-specific `SongService`
  plus the two shared services on one `SupabaseClient` (mirrors
  `MusicServices` / `BibleServices`).

## Queries

`songsKeys` (`infinite`, `detail(id)`, `categories`, `profile(userId)`) +
`useInfiniteAudios` (page size 20, `hasMore` on a full page) + `useAudio` +
`useAudioCategories` + `useCurrentProfile` (admin gate) + optimistic
mutations: `useCreateAudio` (temp id + refresh), `useUpdateAudio`,
`useDeleteAudio` (best-effort media-file cleanup), `useIncrementPlayCount`.

## Hooks

- **`useAudioLibrary`** — list behavior: pagination, client-side search +
  category filtering, delete, admin gate.
- **`useAudioPlayback`** — the ONLY contact with the Audio Platform: maps
  `Audio` → `AudioItem`, calls `playQueue`, toggles play/pause for the current
  item, bumps play count (Flutter `playOrToggleAudioPlaylistFromServer`). Reads
  the platform store imperatively so the list never re-renders on ticks.
- **`useAudioUpload`** — upload progress state for the Add/Edit form.

## Verified

`/songs` loads real `audios` rows; playing a card starts the shared platform
(artwork/title/remaining in the mini player, live duration on the playing
card, full player with seek + queue(11) + shuffle/repeat/speed/stop); search
("भजन २") and category filter (Country) filter correctly; `/songs/new` shows
"Admin only" when signed out; `/songs/edit/{bad-id}` shows "Audio not found";
refresh restores the page; 375px viewport has no horizontal overflow; zero
console errors; lint + build pass. Admin CRUD happy path (create/update/delete
with real uploads) requires a signed-in admin/editor account (backend has no
test account; SMTP unconfigured) — the flow is type/lint/build-clean and wired
to the services.

Not built here: nothing else — this is the complete Online Songs feature.
