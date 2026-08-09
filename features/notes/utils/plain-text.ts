/**
 * Notes pure utils. The list page's search + preview need the note's HTML
 * reduced to plain text (Flutter uses `HtmlParser.parseHTML(...).text`), and
 * the stored colour (a Flutter ARGB-int string) needs converting to a CSS
 * colour. Both are tiny, framework-free helpers.
 */

/** Strip HTML to plain text (used for the note list preview + search). */
export function noteToPlainText(html?: string): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** Convert a stored note colour (Flutter ARGB-int string or hex) to CSS. */
export function noteColorToCss(color?: string): string | undefined {
  if (!color) return undefined;
  const trimmed = color.trim();
  if (/^#[0-9a-fA-F]{3,8}$/.test(trimmed)) return trimmed;
  const int = Number.parseInt(trimmed, 10);
  if (Number.isNaN(int)) return undefined;
  // Flutter stores `Color.toARGB32()` as a decimal int (e.g. 4294967295 = white).
  const rgb = int & 0xffffff;
  return `#${rgb.toString(16).padStart(6, "0")}`;
}

/**
 * Serialize a hex colour the way the Flutter app stores it
 * (`Color.toARGB32().toString()` — an opaque ARGB decimal int string) so
 * web-created notes remain interoperable with the Flutter app.
 */
export function hexToArgbString(hex: string): string {
  const clean = hex.replace("#", "").padStart(6, "0");
  const value = Number.parseInt(clean, 16);
  return String((0xff000000 | value) >>> 0);
}
