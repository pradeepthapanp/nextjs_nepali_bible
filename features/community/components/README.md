# Community — components + page orchestration (implemented)

Everything reuses the shared design system (`PageContainer` + feature headers
like the Maps/Songs/Articles pages), the shared `Input`/`Button`/`Label`/
`Card`/`Avatar`/`Spinner`, `LoadingState`/`ErrorState`/`EmptyState`, the shared
`ConfirmDialog` (via the delete dialogs), and the shared `AuthGate` (from the
Authentication feature). No services, queries, stores or hooks are created
here — the components are **presentational** and the pages are **orchestration
only**; business logic stays inside the behavior hooks.

## Reusable components (implemented)

### shared

| Component | Responsibility |
| --- | --- |
| `InfiniteScrollSentinel` | IntersectionObserver sentinel for the infinite lists (loads the next page as it enters the viewport; `react-hooks/refs`-compliant — refs synced in effects) |

### Prayers

| Component | Responsibility |
| --- | --- |
| `PrayerCard` | title (2-line), details (3-line), `PrayerMeta`, the `PrayerPrayButton` + `PrayerCountBadge` + reply count, and `PrayerActions` (publish chip / edit / delete). Clickable (opens detail); action buttons stop propagation. |
| `PrayerList` | Loading/Error/Empty + the cards + the infinite sentinel |
| `PrayerHeader` | detail header: title, details, `PrayerMeta`, praying/reply stats, anonymous badge |
| `PrayerMeta` | author (or `Anonymous` with the EyeOff badge) + relative time |
| `PrayerActions` | admin publish button / green "Published" chip; owner/admin edit + delete ghost buttons |
| `PrayerPrayButton` | thumbs-up toggle — composes `usePrayerPrays(prayerId)` itself (one hook call per card) |
| `PrayerCountBadge` | presentational thumbs-up + count |
| `PrayerReplyItem` | avatar, author, relative time, text, owner/admin edit/delete (inline edit state) |
| `PrayerReplyList` | Loading/Error/Empty + the reply tiles |
| `PrayerReplyComposer` | multiline input + send (Enter sends, Shift+Enter newline) |

### Notices

| Component | Responsibility |
| --- | --- |
| `NoticeCard` | 16:9 image (when present), `NoticeMeta`, title, description (3-line), `NoticeActions`. Clickable; action buttons stop propagation. |
| `NoticeList` | Loading/Error/Empty + the cards + the infinite sentinel |
| `NoticeHeader` | detail header: title, `NoticeMeta`, published / expires info |
| `NoticeMeta` | neutral publisher label + `timeAgo` (NOTICE: notices have no `authorName`, and a per-author public-profile hook is out of scope — a **neutral "Community Notice" label** is shown; the shared `ProfileService` remains available if a future `usePublicProfile` is added) |
| `NoticeActions` | admin publish toggle chip; owner/admin edit + delete ghost buttons |
| `NoticeImage` | image with loading/error fallbacks (render-phase status reset — lint-clean) |

### Dialogs

| Component | Responsibility |
| --- | --- |
| `DeletePrayerDialog` | thin wrapper over shared `ConfirmDialog` (destructive) — prayer + replies |
| `DeleteNoticeDialog` | thin wrapper over shared `ConfirmDialog` (destructive) |

## Page orchestrators (implemented — live in `components/` per the convention)

| Page | Replaces (Flutter) | Route |
| --- | --- | --- |
| `PrayersPage` | `PrayersPage` + the `CommunityPage` Prayers tab | `/prayers` (AuthGate) |
| `PrayerDetailPage` | `PrayerDetailsSheet` (bottom sheet → page) | `/prayers/{id}` (AuthGate) |
| `AddEditPrayerPage` | `AddEditPrayerSheet` (bottom sheet → page) | `/prayers/new` / `/prayers/edit/{id}` (AuthGate) |
| `NoticesPage` | `NoticesPage` + the `CommunityPage` Notices tab | `/notices` (AuthGate) |
| `NoticeDetailPage` | `NoticeDetailSheet` (bottom sheet → page) | `/notices/{id}` (AuthGate) |
| `AddEditNoticePage` | `AddNewNoticePage` | `/notices/new` / `/notices/edit/{id}` (AuthGate) |
| `CommunityRouteDispatcher` | — | picks the prayer/notice page per path (pure `parsePrayerPath`/`parseNoticePath` + one-shot pending target) |

Flutter's bottom sheets become full routes so refresh/Back/Forward/deep links
work. Every page composes the behavior hooks + `AuthGate`; the edit forms seed
their fields from the loaded entity via the render-phase state-adjustment
pattern (no setState in effects) and navigate with the shared deep-link
helpers after save.

## Route shells (implemented)

`app/prayers/[[...segments]]/page.tsx` → `<Suspense><CommunityRouteDispatcher/>`
and `app/notices/[[...segments]]/page.tsx` → `<Suspense><CommunityRouteDispatcher/>`
(thin server shells, mirroring Maps/Articles/Music). Each page is wrapped in
the shared `AuthGate` (signed-in required — Flutter `AuthStatePage`), which
redirects signed-out users to `/sign-in?next=…`. Admin/editor-only actions
(publish, delete others') gate inline via the behavior hooks' permission
helpers (`canManagePrayer`/`canModerate`/`canManageNotice`/`canManageReply`).
