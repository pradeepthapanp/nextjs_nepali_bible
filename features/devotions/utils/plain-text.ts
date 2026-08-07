/**
 * Devotion plain-text extraction — the SHARE text (Flutter
 * `ShareCopy.shareHtmlContent`: `HtmlParser.parseHTML(content).text`, then
 * strip `<[^>]*>` + `\[.*?\]` + trim). DISTINCT from `sanitizeHtml` (which is
 * for SAFE rendering); this is the human-readable share body.
 */
export function devotionToPlainText(html: string): string {
  const text =
    typeof document !== "undefined"
      ? (() => {
          const template = document.createElement("template");
          template.innerHTML = html;
          return template.content.textContent ?? "";
        })()
      : html.replace(/<[^>]*>/g, "");
  return text.replace(/<[^>]*>/g, "").replace(/\[.*?\]/g, "").trim();
}
