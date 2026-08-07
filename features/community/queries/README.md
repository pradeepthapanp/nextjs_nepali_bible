# Community — React Query layer (implemented)

The Community React Query layer is implemented: the cache-key hierarchy
(`query-keys.ts`, `prayerKeys`/`noticeKeys`/`communityKeys`) + every query +
every mutation. All calls go through the Community SERVICES (which reuse the
SHARED `ProfileService`/`UploadService`) — never Supabase directly in hooks.
React Query owns ALL server state (no Zustand); the services remain the only
backend layer.

## Cache hierarchy (`query-keys.ts`)

```
community
├── prayers
│   ├── list → infinite          (useInfinitePrayers / usePrayers — lists() is a PREFIX of infinite())
│   ├── detail/{id}              (usePrayer)
│   ├── count/{id}               (usePrayerCount — WEB-FIRST column read)
│   ├── replies/{prayerId}       (usePrayerRepliesQuery)
│   ├── has-prayed/{userId}/{id} (useHasPrayed — PER-USER so a different user never sees stale membership)
│   └── profile/{userId}         (public profiles — a later hooks-layer use)
└── notices
    ├── list → infinite          (useInfiniteNotices / useNotices — lists() is a PREFIX of infinite())
    ├── detail/{id}              (useNotice)
    └── profile/{userId}         (public profiles — later)
```

The SESSION is NOT a query key — it lives in the existing `SupabaseProvider`
(the one auth source). The per-user `hasPrayed` key is a small refinement over
the architecture (Flutter's `hasPrayedProvider` is keyed by prayerId, but keying
by `{userId, prayerId}` prevents stale membership across signed-in users).

## Queries

| Hook | Cache key | Flutter notifier | Service method |
| --- | --- | --- | --- |
| `useInfinitePrayers()` | `prayerKeys.infinite()` | `PrayersNotifier.build` + `loadMore` | `PrayerService.getPrayers` (page `PRAYER_PAGE_SIZE` 50, hasMore on full page, `placeholderData: previous`) |
| `usePrayers()` | `prayerKeys.lists()` | `PrayersNotifier.build` (first page) | `PrayerService.getPrayers` |
| `usePrayer(id?)` | `prayerKeys.detail(id)` | — (WEB-FIRST) | `PrayerService.getPrayer` (enabled on id) |
| `usePrayerCount(id?)` | `prayerKeys.count(id)` | — (WEB-FIRST) | `PrayerPraysService.getPrayerCount` (enabled on id) |
| `usePrayerRepliesQuery(prayerId?)` | `prayerKeys.replies(prayerId)` | `prayerRepliesNotifierProvider` | `PrayerReplyService.getReplies` |
| `useHasPrayed(prayerId?)` | `prayerKeys.hasPrayed(userId, prayerId)` | `hasPrayedProvider` | `PrayerPraysService.hasPrayed` (enabled on id + session) |
| `useInfiniteNotices()` | `noticeKeys.infinite()` | `NoticesNotifier.build` + `loadMore` | `NoticeService.getNotices` (page `NOTICE_PAGE_SIZE` 50, hasMore on full page) |
| `useNotices()` | `noticeKeys.lists()` | `NoticesNotifier.build` (first page) | `NoticeService.getNotices` |
| `useNotice(id?)` | `noticeKeys.detail(id)` | — (WEB-FIRST) | `NoticeService.getNotice` (enabled on id) |

Helpers exported for the behavior/component layers: `flattenPrayerPages`,
`flattenNoticePages`, `mutatePrayerPages`/`restorePrayerPages`,
`mutateNoticePages`/`restoreNoticePages`, `bumpPrayerCountInCache`,
`bumpReplyCountInCache`.

## Mutations + optimistic-update strategy

| Mutation | Service method(s) | Strategy (faithful to the Flutter notifier) |
| --- | --- | --- |
| `useCreatePrayer` | `PrayerService.createPrayer` | NETWORK-FIRST: prepend the returned row + write detail (Flutter awaits `createPrayer` then prepends), invalidate `lists()` |
| `useUpdatePrayer` | `PrayerService.updatePrayer` | NETWORK-FIRST: replace in pages + detail (Flutter maps in place), invalidate `lists()` + `detail` |
| `useDeletePrayer` | `PrayerService.deletePrayer` | OPTIMISTIC: remove + drop detail, rollback on error (Flutter `removePrayer`), invalidate `lists()` |
| `usePublishPrayer` | `PrayerService.publishPrayer` | OPTIMISTIC `published: true` + rollback (Flutter `publishPrayer`), invalidate `lists()` |
| `useIncrementPrayerCount` | `PrayerService.incrementPrayerCount` | OPTIMISTIC +1 `prayerCount` (WEB-FIRST; mirrors the Articles `incrementViewCount`), reconcile on error |
| `useCreatePrayerReply` | `PrayerReplyService.createReply` + `PrayerService.incrementReplyCount` | NETWORK-FIRST: insert + count bump, prepend reply + local `replyCount +1` (Flutter `createReply` prepends then `incrementReplyCount`) |
| `useUpdatePrayerReply` | `PrayerReplyService.updateReply` | OPTIMISTIC in-place replace + rollback (Flutter `editReply`), invalidate `replies` |
| `useDeletePrayerReply` | `PrayerReplyService.deleteReply` + `PrayerService.decrementReplyCount` | OPTIMISTIC remove + local `replyCount −1`, rollback (Flutter `deleteReply` then `decrementReplyCount`), invalidate `replies` |
| `useTogglePrayer` | `PrayerPraysService.togglePrayer` | OPTIMISTIC: flip membership + `prayerCount ±1` in pages+detail (Flutter `togglePrayer`), rollback on error, invalidate `hasPrayed` + `lists()` |
| `useCreateNotice` | `NoticeService.createNotice` | NETWORK-FIRST: prepend the returned row + write detail (Flutter awaits then prepends), invalidate `lists()` |
| `useUpdateNotice` | `NoticeService.updateNotice` | NETWORK-FIRST: replace in pages + detail, invalidate `lists()` + `detail` |
| `useDeleteNotice` | `NoticeService.deleteNotice` | NETWORK-FIRST: remove + drop detail (Flutter awaits `deleteNotice` then removes; the image cleanup is inside the shared service), invalidate `lists()` |
| `useSetNoticePublished` | `NoticeService.setNoticePublished` | OPTIMISTIC `isPublished` flip + rollback (Flutter `setPublished`), invalidate `lists()` |
| `useUploadNoticeImage` | `NoticeService.uploadNoticeImage` → SHARED `UploadService` | imperative helper mutation returning the media URL (no cache side effects — the editor feeds the URL into create/update) |

### Optimistic-update pattern (reused from Bible/Music/Articles)

- **Network-first** (create/update + notices delete): the mutation awaits the
  service, then `setQueryData` (prepend / replace) in the infinite pages +
  detail cache on `onSuccess`, and `invalidateQueries(lists())` on `onSettled`.
  `lists()` is a PREFIX of `infinite()`, so ONE invalidation refreshes both the
  finite and the infinite list — the two never drift.
- **Optimistic** (delete, publish, toggle, set-published, reply edit/delete):
  `onMutate` snapshots the previous pages/detail, applies the change
  (`setQueryData`), `onError` restores via the snapshot, `onSettled`
  invalidates the affected keys.

## Invalidation strategy (targeted only)

- `lists()` invalidations refresh the list (prefix of `infinite()`).
- `detail(id)` invalidated/updated only for the specific prayer/notice.
- `replies(prayerId)` invalidated only for that prayer.
- `hasPrayed(userId, prayerId)` invalidated only for that user+prayer.
- The reply-count / prayer-count bumps are LOCAL cache writes on the exact
  prayer's pages + detail — no broad invalidation.

## Flutter behaviors that required adaptation

- **`usePrayer`/`useNotice`** — Flutter pushed the whole object via bottom
  sheets (no fetch); the web fetches by id for the `/prayers/{id}` and
  `/notices/{id}` deep links (WEB-FIRST).
- **`usePrayerCount`** — WEB-FIRST `prayers.prayer_count` read (Flutter relied
  on the optimistic count + the DB trigger).
- **`useTogglePrayer`** — the toggle DECISION moved into the service
  (`PrayerPraysService.togglePrayer` returns the new state); the mutation owns
  the optimistic membership + `prayerCount ±1` cache flip + rollback +
  invalidation.
- **`hasPrayed` keyed per-user** — prevents stale membership across users.
- **Reply count persisted via the mutation** — Flutter's `createReply`/`deleteReply`
  call `incrementReplyCount`/`decrementReplyCount` on the prayer; the web
  mutations call the same two service methods (business logic stays in the
  services).
- **`useUploadNoticeImage` as a mutation** — Flutter's upload was an imperative
  notifier flow; on the web it is a helper mutation returning the media URL
  (progress via the mutation variables), keeping uploads inside the SHARED
  `UploadService`.

