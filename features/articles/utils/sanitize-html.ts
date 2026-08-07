/**
 * Sanitizes raw HTML for safe rendering — RE-EXPORTS the SHARED sanitizer
 * (`@/utils/sanitize-html`, the DOMPurify wrapper promoted from this file) so
 * Articles and Devotions share ONE implementation.
 */
export { sanitizeHtml } from "@/utils/sanitize-html";
