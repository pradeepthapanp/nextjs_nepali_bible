# Articles utils (architecture)

Pure, framework-free helpers — the web replacements of Flutter helpers used by
the Articles pages. No React, no Supabase.

## Util contracts (future)

| Util | Replaces (Flutter) | Notes |
| --- | --- | --- |
| `slugify(title)` | `_AddEditArticlePageState.generateSlug` | lowercase, strip non `[a-z0-9\s-]`, spaces→`-`, collapse/trim `-` |
| `timeAgo(iso)` | `timeago` package (`time_ago.format`) | relative timestamps for cards/comments ("3h", "2d") |
| `sanitizeHtml(html)` | `flutter_html` parsing | DOMPurify-based sanitizer for the reader + a guard before storing editor output |
| `readingTime(text)` | — (Flutter stores `reading_time` on the model but the editor never computes it) | optional web refinement to derive minutes |
| `mediaPathFromUrl(url)` | `_extractPath` (media CDN prefix) | **shared** — already at `@/utils/media.ts` (with `MEDIA_BASE_URL`) |
| `getTextAlign(value)` | `helpers/get_text_align.dart` | maps the reader alignment to CSS text-align (only if not using the shared reader-settings store's alignment) |

## Reusable infrastructure (already shared)

- `formatTime`/`progressFraction` from the Shared Audio Platform — **not**
  needed (no article audio), but available if articles later embed audio.
- Shared `@/utils/cn`, `@/utils/clipboard` (share — if a Share action is added;
  Flutter Articles has no share today).
- `mediaPathFromUrl` + `MEDIA_BASE_URL` live at `@/utils/media.ts` (extracted
  from Online Songs). Reader font utilities (`loadGoogleFont`, `readerFontStack`,
  `APP_FONT_FAMILIES`) live at `@/utils/fonts.ts`.
