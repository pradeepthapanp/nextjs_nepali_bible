/**
 * Relative timestamp formatter — the web replacement of the `timeago` package
 * (`time_ago.format` in the Flutter articles pages). PROMOTED to the shared
 * `@/utils/time-ago.ts` so every feature (including the Community feature)
 * reuses one helper; this module re-exports it so existing importers keep
 * working (the `unwrap`/`clipboard`/`fonts` promotion pattern).
 */
export { timeAgo } from "@/utils/time-ago";
