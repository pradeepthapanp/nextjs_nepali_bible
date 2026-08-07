/**
 * Shared clipboard helper (top-level `utils/` = cross-feature code).
 *
 * Extracted from `features/bible/utils/selection.ts` so both the Bible and
 * Music features share one implementation (features must not import from
 * `@features/*`).
 */

/**
 * Copies text to the clipboard (secure-context API with a legacy fallback for
 * insecure origins such as plain HTTP on a LAN).
 */
export async function copyTextToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  // Legacy fallback for insecure origins (e.g. plain HTTP on a LAN).
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand("copy");
  } finally {
    document.body.removeChild(textarea);
  }
}
