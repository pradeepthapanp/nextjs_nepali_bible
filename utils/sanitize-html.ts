import DOMPurify from "dompurify";

/**
 * Shared HTML sanitizer — the SINGLE sanitizer for rendering backend HTML
 * safely. PROMOTED from `features/articles/utils/sanitize-html.ts` (the
 * `timeAgo` pattern) so every feature that renders raw HTML (Articles,
 * Devotions) uses one implementation. A no-op on the server
 * (`typeof document === "undefined"`), since DOMPurify needs a DOM; every
 * consumer renders client-side.
 */
export function sanitizeHtml(html: string): string {
  if (typeof document === "undefined") return html;
  return DOMPurify.sanitize(html);
}
