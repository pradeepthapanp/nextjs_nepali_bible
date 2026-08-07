# Community — behavior hooks (implemented)

The community behavior hooks are implemented (`use-current-profile.ts`,
`use-community-navigation.ts`, `use-prayer-{library,actions,detail,replies,
prays}.ts`, `use-notice-{library,detail,actions}.ts`). Each composes the
existing React Query hooks + the pure utils + the SHARED `ProfileService` /
`UploadService` + the provider — pages compose these hooks and never touch
Supabase. No business/query/permission/upload logic is duplicated.

## Supporting hook

| Hook | Composes | Responsibility |
| --- | --- | --- |
| `useCurrentProfile()` | `useSupabase()` (the one auth source) + `useQuery` over the SHARED `ProfileService.getProfileById` (`communityKeys.profile`) | the current user's profile + `userId` + `role` (for the permission helpers) — the Songs/Articles `useCurrentProfile` pattern. SUPPORTING hook: the React Query layer omitted the profile query from its requested scope, so it lives here for the behavior hooks to compose ProfileService. |

## Prayers

| Hook | Composes | Replaces |
| --- | --- | --- |
| `usePrayerLibrary()` | `useInfinitePrayers` (flatten) + `usePublishPrayer`/`useDeletePrayer` + `useCommunityNavigation` (edit) + `useCurrentProfile` + pure `canManagePrayer`/`canModerate` | `_PrayersPageState` + `PrayersNotifier` consumption |
| `usePrayerActions()` | `useCreatePrayer`/`useUpdatePrayer`/`useDeletePrayer`/`usePublishPrayer` + `useCurrentProfile` + pure permissions | the imperative `AddEditPrayerSheet._save` + list menu |
| `usePrayerDetail(id?)` | `usePrayer` + `usePrayerReplies` (behavior) + `usePrayerPrays` (behavior) + `useCurrentProfile` + `useCommunityNavigation` (edit) + pure permissions | `PrayerDetailsSheet` |
| `usePrayerReplies(prayerId?)` | `usePrayerRepliesQuery` + `useCreatePrayerReply`/`useUpdatePrayerReply`/`useDeletePrayerReply` + `useCurrentProfile` + pure `canManageReply` | `PrayerRepliesNotifier` + `_ReplyTile` ownership |
| `usePrayerPrays(prayerId?)` | `useHasPrayed` + `usePrayerCount` + `useTogglePrayer` | `HasPrayedWidget._toggle` + `PrayersNotifier.togglePrayer` |

## Notices

| Hook | Composes | Replaces |
| --- | --- | --- |
| `useNoticeLibrary()` | `useInfiniteNotices` (flatten) + `useNoticeSortStore` + pure `sortNotices` + `isOwnNotice` (Public / My Notices) + `useSetNoticePublished`/`useDeleteNotice` + `useCommunityNavigation` (edit) + `useCurrentProfile` + pure `canManageNotice`/`canModerate` | `_NoticesPageState` + `_NoticeList` |
| `useNoticeDetail(id?)` | `useNotice` + `useSetNoticePublished`/`useDeleteNotice` + `useCommunityNavigation` (edit) + `useCurrentProfile` + pure permissions | `NoticeDetailSheet` + the notice owner/admin menu |
| `useNoticeActions()` | `useCreateNotice`/`useUpdateNotice`/`useDeleteNotice`/`useUploadNoticeImage` + `useCurrentProfile` + pure permissions | `AddNewNoticePage._save` + the upload flow |

## Shared

| Hook | Composes | Replaces |
| --- | --- | --- |
| `useCommunityNavigation()` | Next router + the pure `buildPrayerUrl`/`parsePrayerPath`/`buildNoticeUrl`/`parseNoticePath` + `useCommunityNavigationStore` (one-shot pending target) | the Flutter `Navigator`/go_router community flows |

## Composition notes

- **Permissions**: every hook derives `userId` from the provider session and
  `role` from `useCurrentProfile` (the SHARED `ProfileService`) and composes
  the pure `canManagePrayer`/`canModerate`/`canManageNotice`/`canManageReply`
  helpers (which reuse the shared `canManage`) — no duplicated auth/permission
  logic, no cross-feature imports.
- **React Query is the ONLY server-state layer**: hooks never call Supabase
  directly; they trigger the query mutations, whose optimistic/rollback/
  invalidation logic lives once in `queries/`.
- **Upload**: `useNoticeActions.uploadNoticeImage` delegates to the SHARED
  `UploadService` (via `NoticeService`) — no duplicated `get-upload-url`/PUT/
  `delete-file` logic.
- **`usePrayerPrays` is per-prayer** (hasPrayed/count/toggle are per-id server
  state): each `PrayerCard` / the detail page calls it once; it is never
  called in a loop (hooks cannot be conditional).
- **The editor forms are NOT hooks**: `AddEditPrayerPage`/`AddEditNoticePage`
  keep their form state LOCAL (the auth-forms precedent) and compose
  `usePrayerActions`/`useNoticeActions` + `useCommunityNavigation`.
- `usePublicProfile(userId)` (author avatars/names) is deferred to the
  components phase (the SHARED `ProfileService` is already composed here via
  `useCurrentProfile`; a per-user public-profile query can reuse the same
  `communityKeys.profile` slot).
