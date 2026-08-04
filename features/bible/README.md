# Bible Feature

Architecture-only module for the Bible feature. **No UI and no Flutter code has
been migrated yet** — this folder defines the contracts (types, services,
queries, stores, hooks, parsers, constants) that the future Bible UI and the
Flutter migration will be built on.

## Folder responsibilities

| Folder | Responsibility | Example |
| --- | --- | --- |
| `components/` | Bible-specific UI (NOT implemented yet — see its README). | ChapterViewer, VerseText, BookPicker |
| `hooks/` | Feature behavior composed from stores + queries (what the Flutter "providers"/controllers did). | `useChapterNavigation`, `useHighlightActions` |
| `services/` | Data access layer — the future replacement for `SupabaseRepository`'s Bible methods. | `BibleService.getVerses`, `HighlightService.saveHighlight` |
| `queries/` | TanStack Query hooks + cache keys. Server state lives here, not in stores. | `useChapter`, `useHighlights` |
| `store/` | Zustand stores for ephemeral client UI state (reader position, selection, parallel panes, search filters, audio). | `useReadingStore`, `useSelectionStore` |
| `types/` | Domain models mapped from the Flutter models (`lib/models/*.dart`). | `Verse`, `Book`, `CrossReference` |
| `utils/` | Pure, framework-free helpers (no React, no Supabase). | `nextChapter`, `toNepaliDigits`, `buildBibleUrl` |
| `parsers/` | Text/HTML/markup parsers that turn raw verse/commentary strings into renderable segments (mirrors Flutter `lib/bible/widgets/*_parse.dart`). | `parseNepaliVerse` |
| `constants/` | Static domain facts (canonical boundaries, defaults, highlight colors, search options). | `OLD_TESTAMENT_BOOK_COUNT`, `DEFAULT_BIBLE_VERSION` |

## Data flow (single direction)

```
components (future) → hooks → queries → services → Supabase
                          │         │
                          └── store (UI state only)  └── types / parsers / utils / constants
```

- **Server state** (verses, books, highlights, notes, search results) is owned by
  React Query (`queries/`), keyed in `queries/query-keys.ts`.
- **Client UI state** (current reading position, verse selection, parallel
  panes, search filters, audio playback) is owned by Zustand (`store/`).
- **Services** are the only layer that touches Supabase; they will replace the
  `SupabaseRepository` Bible methods one-for-one during migration.
- **Parsers / utils / constants** are pure and framework-free, so they are
  directly unit-testable and shared between server and client.

## Capability → module map

| Future capability | Where it lives |
| --- | --- |
| Bible reading | `useChapter`/`useChapterContent` (queries), `reading-store`, `ChapterViewer` (components, future) |
| Multiple Bible versions | `BibleVersion` (types), `useBibles` (queries), `reading-store.versionId` |
| Book selection | `Book` + `useBooks` (queries), `canonical.ts` (constants), `BookPicker` (components, future) |
| Chapter selection | `Chapter` + `useChapter`, `reference-math` (utils), `ChapterPicker` (components, future) |
| Verse selection | `selection-store`, `useVerseSelection` (hooks) |
| Cross references | `CrossReference` (types), `cross-reference-service`, `cross-reference-parser`, `useCrossReferences` |
| Verse highlighting | `Highlight` (types), `highlight-service`, `useHighlightActions` (hooks), `highlight-colors.ts` |
| Notes | `Note` (types), `note-service`, `useNoteActions` (hooks) |
| Bookmarks / favorites | `Bookmark` (types), `bookmark-service`, `useBookmarks` (queries) |
| Search | `SearchResult` (types), `search-service`, `useSearchVerses` (queries), `search-store`, `useSearch` (hooks) |
| Audio Bible | `BibleAudio` (types), `audio-service`, `useChapterAudio` (queries), `audio-store`, `useAudioBible` (hooks) |
| Commentary | `Commentary` + `CommentaryEntry` (types), `commentary-service`, `commentary-parser`, `useCommentaries` |
| Dictionaries | `DictionaryEntry` (types), `dictionary-service`, `useDictionary` (queries) |
| Reading progress | `ReadingPosition` (types), `progress-service`, `useReadingProgress` (queries), `reading-store` |
| Deep-link URLs | `BibleDeepLink` (types), `utils/deep-link.ts`, `useDeepLink` (hooks) |
| Parallel Bible | `ParallelPane` (types), `parallel-store`, `useParallelBible` (hooks) |
| Infinite chapter navigation | `reference-math` (utils), `useChapterNavigation` (hooks) |

## No duplicate responsibility

- **One owner per concern**: verses/books live in `bible-service`; cross refs in
  `cross-reference-service`; commentary in `commentary-service`; highlights in
  `highlight-service`; notes in `note-service`; audio in `audio-service`; search
  in `search-service`; progress in `progress-service`.
- **Query cache owns server data; stores own UI state only** — highlight data is
  cached by React Query (not duplicated in a store).
- **Types are single definitions** re-exported through `types/index.ts`; utils
  operate on those types and contain no data (data lives in `constants/`).
