# Community — Zustand stores (implemented — exactly two, both UI-only)

The community store layer is implemented with ONLY the two genuinely required
UI-only stores (`use-notice-sort-store.ts`, `use-community-navigation-store.ts`)
— per the user's instruction, Zustand is introduced ONLY where UI-only state
requires it. The guiding rules (established across the Music/Articles/Maps
features and confirmed for auth):

- **NO session store** — the `SupabaseProvider` owns the session (one auth
  source); the community derives `currentUserId`/role from it.
- **NO server-data store** — prayers/notices/replies/profile live in the React
  Query cache; stores hold ONLY transient UI state.
- **NO hasPrayed store** — the "has prayed" membership is server state fetched
  via `useHasPrayed` (React Query) and toggled via `useTogglePrayer`.
- **NO prayer/notice composer store** — the editor page form state is local
  (the auth-forms precedent).

## Implemented stores

| Store | State | Why (Flutter port) |
| --- | --- | --- |
| `useNoticeSortStore` (NON-persisted) | `{ sort: NoticeSort, setSort }` (default `"newest"`) | Flutter `NoticesNotifier.sortNotices` + the `_showSortDialog` selection. On the web the list is React Query, so the STORE holds the chosen sort and `useNoticeLibrary` applies the pure `sortNotices` util over the cache (the query cache is never mutated). |
| `useCommunityNavigationStore` (NON-persisted) | `{ pendingTarget: CommunityDeepLink \| null, setPendingTarget, consumePendingTarget }` (one-shot) | mirrors `useArticleNavigationStore` / Music `useReaderNavigationStore`: a deep link set BEFORE the section mounted (e.g. from a home-screen entry point) is consumed once by the route dispatcher and turned into a real navigation. |

Nothing else needs a store (verified against the Flutter implementation — the
prayer list has no filter/sort UI, the notice "Public/My Notices" split is a
client filter, and the reply composer is page-local). No persisted stores (all
transient UI state — no settings survive restarts in this feature).

