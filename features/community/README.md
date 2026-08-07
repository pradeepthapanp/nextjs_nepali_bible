# Community feature (architecture — Prayers + Notices)

Production-grade Next.js architecture for the Community feature, derived from
a full study of the Flutter implementation (`lib/community/`:
`community_page.dart`, `prayers_page.dart`, `notices_page.dart`,
`add_notice_page.dart`, `widget/{add_edit_prayer_sheet,prayer_detail_sheet,
has_prayed_widget,notice_detail_sheet}.dart`; `lib/providers/community/`:
`prayers_provider.dart`, `prayer_replies_provider.dart`, `has_prayed_provider.dart`,
`notices_provider.dart`; the `prayers`/`prayer_replies`/`prayer_prays`/`notices`
repository methods; `lib/models/{prayer,prayer_reply,notice}.dart`; the
`/prayers` + `/notices` routes) AND the live Supabase schema (tables +
columns verified — see below).

**Implemented (complete feature)**: types, constants, the cache-key
hierarchy, the pure utils (deep links, sort, permissions), the SERVICES (the
data layer), the React Query layer (all queries + mutations), the two
genuinely required UI-only Zustand stores, the behavior hooks AND the full
UI (reusable components, page orchestrators, the route dispatcher, the route
shells). See the folder READMEs for the per-layer contracts. No backend
schema/APIs invented.

## Two sub-features

The feature is organized into two sub-features — **prayers/** and **notices/** —
as file pairs within each layer folder (`types/prayers.ts` + `types/notices.ts`,
`services/…prayer…` + `services/…notice…`, etc.):

| Layer | Prayers | Notices |
| --- | --- | --- |
| `types/` | `prayers.ts` (Prayer, PrayerReply, inputs) | `notices.ts` (Notice, inputs, NoticeSort) |
| `constants/` | `prayers.ts` (page size, validators) | `notices.ts` (page size, upload folder, sort options) |
| `queries/` | `prayerKeys`/`noticeKeys` + all prayer/notice queries + mutations (React Query) | `noticeKeys` + all notice queries + mutations |
| `services/` | `PrayerService` + `PrayerPraysService` + `PrayerReplyService` (comments) | `NoticeService` (+ notice image via the SHARED `UploadService`) |
| `store/` | — (no prayer UI store needed) | `useNoticeSortStore` (+ `useCommunityNavigationStore` shared) |
| `hooks/` | `usePrayerLibrary` / `usePrayerActions` / `usePrayerDetail` / `usePrayerReplies` / `usePrayerPrays` (+ `useCurrentProfile`, `useCommunityNavigation`) | `useNoticeLibrary` / `useNoticeActions` / `useNoticeDetail` |
| `components/` | PrayerCard/List/Header/Meta/Actions + Reply*/PrayButton/CountBadge, pages | NoticeCard/List/Header/Meta/Actions/Image, pages |
| `utils/` | deep-link, permissions (shared) | deep-link, sort |

`community/README.md` (this file) documents the whole feature; each layer
folder has its own README with the detailed contracts.

## Flutter → Next page mapping

Flutter renders `/prayers` and `/notices` as ONE `CommunityPage` tab container
(`TabBar` Prayers | Notices) with detail/create/edit as BOTTOM SHEETS. The web
splits the tabs into separate sections per the user's explicit deep-link model
(each section gets its own catch-all + route dispatcher).

| Flutter page/widget | Web page (planned) | Route |
| --- | --- | --- |
| `CommunityPage` (tab container) | `CommunityNav` tabs (Prayers / Notices) + the two section pages | — (a `CommunityPage` shell is NOT needed — each section is its own route) |
| `PrayersPage` (list) | `PrayersPage` | `/prayers` (signed-in) |
| `PrayerDetailsSheet` (bottom sheet) | `PrayerDetailPage` | `/prayers/{id}` (signed-in) |
| `AddEditPrayerSheet` (bottom sheet) | `AddEditPrayerPage` | `/prayers/new` / `/prayers/edit/{id}` (signed-in) |
| `NoticesPage` (list) | `NoticesPage` | `/notices` (signed-in) |
| `NoticeDetailSheet` (bottom sheet) | `NoticeDetailPage` | `/notices/{id}` (signed-in) |
| `AddNewNoticePage` (full page) | `AddEditNoticePage` | `/notices/new` / `/notices/edit/{id}` (signed-in) |
| `AuthStatePage` wrapper | the shared **`AuthGate`** | wraps every community route (signed-in → `/sign-in?next=`) |
| `HasPrayedWidget` | `HasPrayedButton` | inline on prayer cards + detail |
| `_ReplyTile` / reply composer | `PrayerReplyTile` / `PrayerReplyComposer` | inside `PrayerDetailPage` |
| `NoticeDetailSheet` image viewer | full-screen image viewer (web) | inside `NoticeDetailPage` |

All community routes require a SIGNED-IN session (Flutter `AuthStatePage`
shows the sign-in page when signed out) → the web wraps every community page
in the shared `AuthGate` (from the Authentication feature).

## Repository → service mapping

| Flutter repository method | Web service method |
| --- | --- |
| `fetchPrayers({limit,offset})` | `PrayerService.getPrayers({limit,offset})` (order created_at desc, range) |
| — (WEB-FIRST for the detail deep link) | `PrayerService.getPrayer(id)` → `Prayer \| null` |
| `createPrayer` | `PrayerService.createPrayer(input)` (insert title/details/user_id/author_name/is_anonymous) |
| `updatePrayer` | `PrayerService.updatePrayer(id, input)` (update + updated_at) |
| `deletePrayer` | `PrayerService.deletePrayer(id)` |
| `publishPrayer` | `PrayerService.publishPrayer(id)` (update published:true) |
| — (WEB-FIRST; the toggle decision) | `PrayerPraysService.togglePrayer(id)` → new state |
| `pray` / `unPray` | `PrayerPraysService.pray(id)` / `unPray(id)` (`prayer_prays` insert/delete) |
| `hasPrayed` | `PrayerPraysService.hasPrayed(id)` (`prayer_prays` maybeSingle, false signed-out) |
| — (WEB-FIRST column read) | `PrayerPraysService.getPrayerCount(id)` |
| `incrementReplyCount` / `decrementReplyCount` | `PrayerService.incrementReplyCount(id)` / `decrementReplyCount(id)` |
| — (WEB-FIRST count bump) | `PrayerService.incrementPrayerCount(id)` |
| `fetchReplies(prayerId)` | `PrayerReplyService.getReplies(prayerId)` (order created_at desc) |
| `createReply` | `PrayerReplyService.createReply({prayerId, reply})` (insert + author_name) |
| `editReply` | `PrayerReplyService.updateReply({replyId, reply})` |
| `deleteReply` | `PrayerReplyService.deleteReply(replyId)` |
| `fetchNotices({limit,offset})` | `NoticeService.getNotices({limit,offset})` (order created_at desc, range) |
| `getNotice` | `NoticeService.getNotice(id)` → `Notice \| null` |
| `createNotice` | `NoticeService.createNotice(input)` (requires session — throws `"User not authenticated"`) |
| `updateNotice` | `NoticeService.updateNotice(input + id)` (all fields + updated_at) |
| `deleteNotice` + `deleteImageFile` | `NoticeService.deleteNotice(notice)` (+ best-effort image delete via shared `UploadService`) |
| `setNoticePublished` | `NoticeService.setNoticePublished(id, isPublished)` |
| `UploadNotifier.uploadImage` (notice image) | `NoticeService.uploadNoticeImage` → shared `UploadService.uploadFile` (`images/notices/{ts}.{ext}`) |
| `UploadNotifier.deleteFile` (notice image) | `NoticeService.deleteNoticeImage` → shared `UploadService.deleteFile` (+ `mediaPathFromUrl`) |
| `publicProfileProvider(userId)` | shared `ProfileService.getProfileById(userId)` (exposed on `CommunityServices.profile`) |

**Dead Flutter code — NOT ported** (no placeholder implementations):
- the whole **Discussions** sub-feature (`DiscussionPage`, `add_discussion_dialog.dart`,
  `discussion_details_sheet.dart`, `discussions_provider.dart`,
  `discussions_answers_provider.dart`, `Discussion`/`DiscussionAnswer` models)
  — the page is fully commented out, the CommunityPage Discussions tab is
  commented out, and `/discussions` renders an empty tab container.
- `fetchPublishedNotices` / `fetchActiveNotices` — defined in the repository
  but never called by any UI (dead).
- the `_searchController` in `notices_page.dart` — declared/disposed but never
  wired to a search UI (dead).

## Permission model

| Action | Allowed | Source |
| --- | --- | --- |
| View prayers / notices | any signed-in user | Flutter `AuthStatePage` |
| Create a prayer | any signed-in user | FAB `AddEditPrayerSheet` |
| Comment (reply) on a prayer | any signed-in user | `PrayerDetailsSheet._sendReply` |
| Edit / delete OWN prayer | the owner | `isOwner = prayer.userId == userId` |
| Edit / delete ANY prayer | admin **or** editor | **user's explicit spec** (extends Flutter's admin-only `canManage` rule — a documented web adaptation) |
| Publish a prayer | admin **or** editor | Flutter `isAdmin` (publish button) |
| Edit / delete a notice | owner, admin **or** editor | Flutter `isOwner || isAdmin` |
| Publish / unpublish a notice | admin **or** editor | Flutter `isAdmin` FilterChip |
| Edit / delete a prayer reply | reply owner **or** an admin | Flutter `_ReplyTile` `isOwner` |

Implemented as pure helpers in `utils/permissions.ts`, REUSING the shared
`canManage` role rule (`@/types/profile`):

- `canManagePrayer(prayer, userId, role)` — `owner || canManage(role)`
- `canModerate(role)` — `canManage(role)` (publish actions)
- `canManageNotice(notice, userId, role)` — `owner || canManage(role)`
- `canManageReply(reply, userId, role)` — `owner || role === "admin"`

## Deep-link strategy

- **Model** (`types/deep-link.ts`): `PrayerDeepLink` (`prayers` | `prayer{id}` |
  `prayerNew` | `prayerEdit{id}`) and `NoticeDeepLink` (`notices` | `notice{id}` |
  `noticeNew` | `noticeEdit{id}`).
- **URL source** (`utils/deep-link.ts`): `buildPrayerUrl`/`parsePrayerPath` +
  `buildNoticeUrl`/`parseNoticePath` — the ONLY places the URLs are built and
  parsed (`/prayers`, `/prayers/{id}`, `/prayers/new`, `/prayers/edit/{id}`
  and the `/notices` equivalents; `/new` and `/edit/` are matched before the
  bare `/{id}` segment).
- **Routes** (implemented): `app/prayers/[[...segments]]/page.tsx` and
  `app/notices/[[...segments]]/page.tsx` → `<Suspense><CommunityRouteDispatcher/>`
  (thin server shells, mirroring Maps/Articles/Music). The dispatcher reads
  the current path via the pure parsers and mounts the matching page. Flutter's
  in-memory bottom sheets become URL routes (`/prayers/{id}`, etc.) so
  refresh/Back/Forward/deep links work.
- **Navigation** (implemented): `useCommunityNavigation` composes the router +
  the pure builders/parsers (`navigate`, `openPrayer`, `openNotice`, `openNewPrayer`,
  `openNewNotice`, `openEditPrayer`, `openEditNotice`) + the one-shot
  pending-target store (`useCommunityNavigationStore`) applied by the
  dispatcher (the Maps/Articles pattern).

## Reuse (nothing duplicated)

- **Authentication**: the existing `SupabaseProvider` session (the one auth
  source) + the shared `AuthGate`/`AdminGate` (`@features/auth`) gate the
  signed-in-only routes; the behavior hooks derive `userId` from the provider
  session and `role` from `useCurrentProfile` (the SHARED `ProfileService`),
  composing the shared `canManage` rule via the pure permission helpers.
- **Profile**: the current user's role + author avatars/names come from the
  SHARED `ProfileService` (`getProfileById` — the web equivalent of Flutter
  `publicProfileProvider`), cached under `communityKeys.profile(userId)` via
  `useCurrentProfile`. NO duplicate ProfileService.
- **Upload**: notice images upload via the SHARED `UploadService.uploadFile`
  (`images/notices/{ts}.{ext}` path built in the editor hook) + delete via
  `UploadService.deleteFile` + `mediaPathFromUrl` (`@/utils/media`). NO
  duplicate upload logic (the `get-upload-url` edge fn + PUT lives only in the
  shared service).
- **Dialogs**: delete-prayer / delete-notice / delete-reply / discard-changes
  are thin wrappers over the SHARED `ConfirmDialog` — no dialog machinery
  duplicated (the Authentication `DeleteAccountDialog` pattern).
- **States**: `LoadingState` / `ErrorState` / `EmptyState` / `Spinner` from the
  design system.
- **Generic helpers**: relative-time formatting REUSES the same helper as
  Articles (`features/articles/utils/time-ago.ts`) — promoted to a shared
  `@/utils/time-ago.ts` during implementation (Articles re-exports it, the
  `unwrap`/`clipboard`/`fonts` promotion pattern). `unwrap` (`@/services/helpers`),
  `mediaPathFromUrl` (`@/utils/media`), `fileExtension` (`@/utils/content-type`)
  are all reused, not re-implemented.
- **canManage**: the permission helpers import the SHARED `canManage` role rule.

## Backend schema (VERIFIED against the live Supabase backend)

A runtime probe (deleted) confirmed the tables exist with EXACTLY the Flutter
model columns (PostgREST rejects unknown columns — all selects passed):

- `prayers`: `id, title, details, user_id, author_name, is_anonymous,
  prayer_count, reply_count, published, status, created_at, updated_at`.
- `prayer_replies`: `id, prayer_id, user_id, author_name, reply, created_at,
  updated_at`.
- `prayer_prays`: `prayer_id, user_id` (the "has prayed" join table).
- `notices`: `id, title, description, image_url, user_id, is_published,
  published_at, expires_at, created_at, updated_at`.
- `notice_comments` does NOT exist → **no `NoticeComment`** (notices have no
  comments — faithful to Flutter).

All community operations are plain table queries — NO RPCs, no new tables, no
invented backend APIs.

## Scope (implemented vs contract)

**Implemented (complete feature)**: `types/`, `constants/`, `queries/query-keys.ts`
(the `prayerKeys`/`noticeKeys`/`communityKeys` hierarchy), `utils/` (deep-link
builders/parsers, `sortNotices`/`isOwnNotice`, the permission helpers), the
`services/` data layer (`PrayerService`, `PrayerPraysService`,
`PrayerReplyService`, `NoticeService` + the `CommunityServices` factory + the
memoized `getCommunityServices()` singleton), the `queries/` React Query layer
(9 queries + 14 mutations), the `store/` layer (the two genuinely required
UI-only stores: `useNoticeSortStore` + `useCommunityNavigationStore`), the
`hooks/` behavior layer (`useCurrentProfile`, `useCommunityNavigation`,
`usePrayerLibrary`/`usePrayerActions`/`usePrayerDetail`/`usePrayerReplies`/
`usePrayerPrays`, `useNoticeLibrary`/`useNoticeDetail`/`useNoticeActions`)
AND — this final phase — the complete UI: the reusable components (`shared/`
`InfiniteScrollSentinel`; `prayer/` PrayerCard/List/Header/Meta/Actions +
PrayerReplyItem/List/Composer + PrayerPrayButton/CountBadge; `notice/`
NoticeCard/List/Header/Meta/Actions/Image; `dialogs/` DeletePrayerDialog +
DeleteNoticeDialog), the page orchestrators (PrayersPage, PrayerDetailPage,
AddEditPrayerPage, NoticesPage, NoticeDetailPage, AddEditNoticePage), the
`CommunityRouteDispatcher` and the two route shells
(`app/prayers/[[...segments]]`, `app/notices/[[...segments]]`) + the
`index.ts` barrels and `README`s. Verified by lint + build + runtime smoke
(temp scripts deleted) + a signed-out browser check of the route guards.

**Notable adaptation (documented)**: notices have no `authorName`, and a
per-author public-profile hook was deliberately NOT added (out of the phase
scope) → `NoticeMeta` shows a neutral **"Community Notice"** publisher label;
the shared `ProfileService` remains available if a future `usePublicProfile`
is added.

## Verify

- **Reuses Authentication**: community routes wrap the shared `AuthGate`;
  sessions/permissions derive from the provider + `canManage`.
- **Reuses ProfileService**: author avatars/names via the SHARED profile
  service — no copy.
- **Reuses shared dialogs/states**: `ConfirmDialog`, `LoadingState`,
  `ErrorState`, `EmptyState`.
- **No duplicated architecture**: every Flutter piece maps 1:1; the shared
  `ProfileService`/`UploadService`/`canManage`/`time-ago` are reused, not
  copied; dead Flutter code (Discussions, unused notice queries, the unused
  search controller) is documented, NOT ported.
- **No placeholder implementations**: everything implemented (types, constants,
  query-keys, pure utils, the data-layer services, the React Query layer, the
  two UI-only stores, the behavior hooks) is real and runtime-verified;
  everything else is a documented contract.
- **Behavior hooks verified**: every hook composes the existing React Query
  hooks + the SHARED `ProfileService`/`UploadService` + the provider — no
  direct Supabase, no duplicated business/query/permission/upload logic, no
  cross-feature imports; React Query remains the only server-state layer.
- **Data layer verified**: `CommunityServices` uses ONE shared `@supabase/ssr`
  client across all six services; `NoticeService` delegates image upload/delete
  to the SHARED `UploadService` (no duplicated upload logic); the services are
  permission-agnostic (no duplicated role checking — RLS + the UI-layer
  permission helpers handle gating); the four tables are verified against the
  live backend; no invented schema/RPCs/search/pagination.
- **React Query layer verified**: 9 queries + 14 mutations, all through the
  Community services (no `.from(`/`.rpc(`/`createClient` in queries — the
  services remain the only backend layer); React Query owns ALL server state
  (no Zustand); targeted invalidation only (`lists()` prefix of `infinite()`,
  per-prayer `replies`/`hasPrayed(userId, id)` keys); runtime smoke 17/17
  (temp script deleted — key shapes, prefix relationship, hooks read the
  prefetched cache, all mutations expose `mutate`, `useHasPrayed` disabled
  signed-out); no duplicated cache keys.
