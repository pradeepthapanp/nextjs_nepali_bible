import type Quill from "quill";
import type Delta from "quill-delta";
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";

/**
 * HtmlConverter — the internal HTML ⇄ Delta conversion primitives.
 *
 * This is the ONLY module that touches the conversion packages / Quill's
 * clipboard, and it is used EXCLUSIVELY by `QuillAdapter` (the single public
 * conversion boundary). No other file in the app converts HTML ⇄ Delta — Delta
 * never leaves `features/articles/editor`.
 *
 *   - Delta → HTML: `quill-delta-to-html` (the JS original of Flutter's
 *     `vsc_quill_delta_to_html`). The `divider` embed (a custom blot that
 *     renders `<hr class="ql-divider">`) is rendered by a pre-pass, because
 *     the package drops unknown custom embeds.
 *   - HTML → Delta: Quill's own `Clipboard.convert` (the `html-to-delta` npm
 *     package is not published; functionally equivalent for Quill HTML).
 */
export interface DeltaToHtmlOptions {
  /** Whether to keep paragraphs as separate `<p>` blocks (default true). */
  multiLineParagraph?: boolean;
}

function convertOps(ops: unknown[]): string {
  return new QuillDeltaToHtmlConverter(ops as never[], {}).convert();
}

export const HtmlConverter = {
  /** Delta → HTML. Splits at `divider` embeds so they render as `<hr>`. */
  deltaToHtml(delta: Delta, _options?: DeltaToHtmlOptions): string {
    const ops = delta.ops ?? [];
    let html = "";
    let chunk: unknown[] = [];
    for (const op of ops) {
      const insert = (op as { insert?: unknown }).insert;
      if (
        insert &&
        typeof insert === "object" &&
        insert !== null &&
        "divider" in (insert as Record<string, unknown>)
      ) {
        html += convertOps(chunk);
        html += '<hr class="ql-divider"/>';
        chunk = [];
      } else {
        chunk.push(op);
      }
    }
    html += convertOps(chunk);
    return html;
  },

  /** HTML → Delta (uses the adapter's Quill instance clipboard parser). */
  htmlToDelta(html: string, quill: Quill): Delta {
    return quill.clipboard.convert({ html });
  },

  /** Whether the HTML has no meaningful content (the "Content is empty" check). */
  isEmptyHtml(html: string | undefined | null): boolean {
    if (!html) return true;
    const trimmed = html.trim();
    return trimmed === "" || trimmed === "<p><br></p>";
  },
};
