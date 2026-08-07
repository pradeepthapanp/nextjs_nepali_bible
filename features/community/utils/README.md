# Community — utils (implemented)

The community pure helpers are implemented (framework-free, unit-testable —
runtime-verified, temp script deleted).

## Implemented helpers

| Helper | Flutter port | Responsibility |
| --- | --- | --- |
| `buildPrayerUrl` / `parsePrayerPath` | the `/prayers` routes | `/prayers`, `/prayers/{id}`, `/prayers/new`, `/prayers/edit/{id}` — the only place the prayer URLs are built/parsed (`/new` + `/edit/` matched before `/{id}`) |
| `buildNoticeUrl` / `parseNoticePath` | the `/notices` routes | `/notices`, `/notices/{id}`, `/notices/new`, `/notices/edit/{id}` |
| `sortNotices(notices, sort)` | `NoticesNotifier.sortNotices` | newest / oldest / alphabetical; returns a NEW array (never mutates the React Query cache) |
| `isOwnNotice(notice, userId)` | `_NoticeList` `userId == mine` | the "My Notices" client filter |
| `canManagePrayer` | `PrayersPage` `canManage`/`isAdmin` | owner **or** admin/editor (the user's explicit spec) |
| `canModerate(role)` | `isAdmin` (publish actions) | admin **or** editor |
| `canManageNotice` | `NoticesPage` `isOwner \|\| isAdmin` | owner **or** admin/editor |
| `canManageReply` | `_ReplyTile` `isOwner` | reply owner **or** an admin |

## Reuse (nothing duplicated)

- **`canManage`** — the permission helpers import the SHARED role rule from
  `@/types/profile` (no copy).
- **`unwrap`** — from `@/services/helpers` (used by the future services).
- **`mediaPathFromUrl`** — from `@/utils/media` (notice image cleanup).
- **`fileExtension`/`getContentType`** — from `@/utils/content-type` (notice
  image upload path).
- **Relative time** — the community cards/tiles use the SAME formatter as
  Articles (`timeAgo` in `features/articles/utils/time-ago.ts`). During the
  implementation phase this is PROMOTED to a shared `@/utils/time-ago.ts`
  (Articles re-exports it — the `unwrap`/`clipboard`/`fonts` promotion
  pattern), so the community never re-implements it. The prayer-card "just
  now/min/hr/day + full date" format (`formatPrayerDate`) is a small extension
  built on the same shared helper (documented in `hooks/README.md`).
