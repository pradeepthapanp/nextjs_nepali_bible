# Community — services (implemented)

The community data layer is implemented: `PrayerService`, `PrayerPraysService`,
`PrayerReplyService`, `NoticeService` + the `CommunityServices` aggregate
factory + memoized `getCommunityServices()` singleton. All through ONE shared
`@supabase/ssr` client (via `@/lib/supabase/client`) and the SHARED
`ProfileService`/`UploadService` — no duplicated upload/profile/helper logic,
never Supabase directly in hooks/components.

## `PrayerService` (`prayers` table — `prayer-service.ts`)

| Method | Flutter port | Notes |
| --- | --- | --- |
| `getPrayers({limit, offset})` | `fetchPrayers` | `order created_at desc`, `.range` |
| `getPrayer(id)` | — (WEB-FIRST) | `.eq("id", id).maybeSingle()` → `Prayer \| null` (the `/prayers/{id}` deep link) |
| `createPrayer(input)` | `createPrayer` | insert `title/details/user_id/author_name` (from the session auth metadata — nullable, faithful) / `is_anonymous`, `.select().single()` |
| `updatePrayer(id, input)` | `updatePrayer` | update title/details/anonymous + stamp `updated_at`, `.select().single()` |
| `deletePrayer(id)` | `deletePrayer` | row delete |
| `publishPrayer(id)` | `publishPrayer` | update `{ published: true }` |
| `incrementPrayerCount(id)` | — (WEB-FIRST) | read `prayer_count` → write `+1` (the `incrementReplyCount` pattern) |
| `incrementReplyCount(id)` / `decrementReplyCount(id)` | `incrementReplyCount` / `decrementReplyCount` | read `reply_count` → write `±1` (min 0) |

**NOT implemented** (no Flutter support): `incrementViewCount` (prayers have no
views — only the dead Discussion feature had `viewsCount`) and `searchPrayers`
(the prayers page has no search). Mapper `mapPrayer` exported.

## `PrayerPraysService` (`prayer_prays` + `prayers.prayer_count` — `prayer-prays-service.ts`)

| Method | Flutter port | Notes |
| --- | --- | --- |
| `hasPrayed(prayerId)` | `hasPrayed` | `prayer_prays` maybeSingle → boolean; `false` when signed out (faithful) |
| `pray(prayerId)` / `unPray(prayerId)` | `pray` / `unPray` | `prayer_prays` insert `{prayer_id, user_id}` / delete eq; require a session (throw `"User not signed in"` — the web equivalent of Flutter's `currentUser!`) |
| `togglePrayer(prayerId)` | the `PrayersNotifier.togglePrayer` DECISION | **the prayer toggle implementation** — reads `hasPrayed`, then calls `pray` or `unPray`, and resolves with the NEW state (`true` = now prayed). Faithful to the Flutter notifier (which read the current membership then called pray/unPray), moved into the service so the query layer stays thin. The optimistic `prayerCount` flip (`±1`) is a query-layer concern. |
| `getPrayerCount(prayerId)` | — (WEB-FIRST) | reads the existing `prayers.prayer_count` column |

## `PrayerReplyService` (the prayer-comments service — `prayer-reply-service.ts`)

| Method | Flutter port | Notes |
| --- | --- | --- |
| `getReplies(prayerId)` | `fetchReplies` | `eq prayer_id`, `order created_at desc` |
| `createReply({prayerId, reply})` | `createReply` | insert `prayer_id/user_id/author_name` (session metadata, nullable — faithful) / `reply`, `.select().single()` |
| `updateReply({replyId, reply})` | `editReply` | update `{ reply, updated_at }`, `.select().single()` |
| `deleteReply(replyId)` | `deleteReply` | row delete |

The reply-count sync is on `PrayerService.incrementReplyCount`/`decrementReplyCount`
(faithful — Flutter's `PrayerRepliesNotifier` calls `PrayersNotifier` for it).
A generic cross-feature `CommentService` is intentionally NOT created:
`prayer_replies` ≠ `article_comments` (different tables/schemas), so a forced
abstraction would be invented architecture. Mapper `mapPrayerReply` exported.

## `NoticeService` (`notices` table + images — `notice-service.ts`)

| Method | Flutter port | Notes |
| --- | --- | --- |
| `getNotices({limit?, offset?})` | `fetchNotices` | `order created_at desc`, `.range` (defaults 50/0) |
| `getNotice(id)` | `getNotice` | `.maybeSingle()` → `Notice \| null` |
| `createNotice(input)` | `createNotice` | **requires a session — throws exactly `"User not authenticated"`** (faithful); insert all fields, `.select().single()` |
| `updateNotice(input)` | `updateNotice` | update all editable fields + stamp `updated_at`, `.select().single()` |
| `deleteNotice(notice)` | `deleteNotice` + `deleteImageFile` | row delete, then best-effort image cleanup (below) |
| `setNoticePublished(id, isPublished)` | `setNoticePublished` | update `{ is_published }` |
| `uploadNoticeImage(blob, fileName, onProgress?)` | the page's `uploadImage` | **reuses the SHARED `UploadService.uploadFile`** with the path `images/notices/{timestamp}.{ext}` (Flutter builds `notices/{ts}.{ext}` + `UploadNotifier.uploadImage` prepends `images/`); the shared service owns the `get-upload-url`/PUT edge-function flow |
| `deleteNoticeImage(imageUrl)` | `NoticesNotifier.deleteImageFile` | **reuses the SHARED `UploadService.deleteFile`** + `mediaPathFromUrl` (the `https://media.sgmbiblezone.com/` prefix extraction) — best-effort (swallowed) |

**NOT implemented** (dead Flutter code): `fetchPublishedNotices` / `fetchActiveNotices`
(defined in the repository but never called). No `NoticeComment` (no table).

**WEB ADAPTATION**: Flutter's `fetchNotices` returns `[]` when signed out; the
web service does NOT special-case signed-out (the `/notices` routes are
`AuthGate`-protected so the session is present; RLS enforces row visibility) —
documented as the one intentional difference.

## Image upload flow (the shared UploadService boundary)

1. The notice editor (a later phase) picks a file and calls
   `NoticeService.uploadNoticeImage(blob, fileName, onProgress)`.
2. The service builds the community-specific storage path
   `images/notices/{timestamp}.{ext}` (`fileExtension` from `@/utils/content-type`)
   and delegates to the SHARED `UploadService.uploadFile` — which invokes the
   `get-upload-url` edge function, PUTs the bytes with progress, and returns
   the media URL. NO upload logic is duplicated in the community feature.
3. Deletes flow through `deleteNoticeImage` → `mediaPathFromUrl` → shared
   `UploadService.deleteFile` (`delete-file` edge function).

## Permissions (NOT in the services)

The services are permission-agnostic — they perform CRUD only (exactly like
Flutter's repository; RLS on the backend enforces row security, and anon writes
are rejected by RLS — probed). Role-based UI gating (`canManage` +
`canManagePrayer`/`canManageNotice`/`canManageReply` from the arch phase's
`utils/permissions.ts`) is a HOOKS/COMPONENTS concern for the next phase — no
role checking is duplicated in the data layer.

## Aggregate + factory (`index.ts`)

- `CommunityServices { prayer, prays, reply, notice, profile, upload }` +
  `createCommunityServices(client = createClient())` — ONE shared
  `@supabase/ssr` browser client across ALL six; the shared
  `SupabaseUploadService` + `SupabaseProfileService` are built on the SAME
  client, the upload is injected into `SupabaseNoticeService` (images), and
  both are exposed on the aggregate (public profiles + uploads for the query
  layer). Memoized `getCommunityServices()` singleton.
- Mappers `mapPrayer`, `mapPrayerReply`, `mapNotice` exported.
- Reuses shared `unwrap` (`@/services/helpers`), `mediaPathFromUrl`
  (`@/utils/media`), `fileExtension` (`@/utils/content-type`), `createClient`
  (`@/lib/supabase/client`). No RPCs, no placeholder/`todo()` stubs — all four
  tables verified against the live backend.

## Verified schema + behavior (live probe, deleted)

`prayers`, `prayer_replies`, `prayer_prays`, `notices` all exist with exactly
the Flutter-model columns; anon INSERTs into `prayer_prays`/`notices` are
rejected by RLS (→ mutations need the session); `notice_comments` does not
exist. Runtime smoke (deleted): one shared client, memoized singleton, all
methods present, reads return arrays / null-for-missing, `hasPrayed` false
signed-out, `togglePrayer` throws `"User not signed in"`, `createNotice`
throws `"User not authenticated"` signed-out.
