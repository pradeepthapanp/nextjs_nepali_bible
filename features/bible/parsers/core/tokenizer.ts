import { decodeHtmlEntities } from "./entities";

/**
 * Tokenizer: turns verse/commentary HTML into a flat token stream. This is a
 * pure, unit-testable function — the first stage of the Verse Rendering
 * Engine. It understands the tag subset used by the dataset (`pb`, `n`, `t`,
 * `j`, `e`, `nv`, `ev`, `x`, `reflink`, `sup`, `b`, `i`, `br`, …) and passes
 * everything else through as tokens for the tag registry.
 */

export type Token =
  | { type: "text"; text: string }
  | { type: "tag-open"; name: string; attrs: Record<string, string> }
  | { type: "tag-close"; name: string }
  | { type: "tag-void"; name: string; attrs: Record<string, string> };

/** Tags that never have a closing tag (self-closing or void). */
export const VOID_TAGS = new Set(["pb", "br", "hr", "img"]);

/** Parses `name attr="v" attr2='v' attr3=v` into a name + attributes. */
function parseTag(raw: string): {
  name: string;
  attrs: Record<string, string>;
} {
  const nameMatch = raw.match(/^[a-zA-Z][a-zA-Z0-9-]*/);
  const name = (nameMatch?.[0] ?? "").toLowerCase();
  const attrs: Record<string, string> = {};
  const rest = raw.slice(name.length);
  const attrRe =
    /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match: RegExpExecArray | null;
  while ((match = attrRe.exec(rest)) !== null) {
    attrs[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? "";
  }
  return { name, attrs };
}

export function tokenizeHtml(input: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;
  let textBuffer = "";

  const flushText = () => {
    if (textBuffer) {
      tokens.push({ type: "text", text: decodeHtmlEntities(textBuffer) });
      textBuffer = "";
    }
  };

  while (index < input.length) {
    const char = input[index];

    if (char !== "<") {
      textBuffer += char;
      index += 1;
      continue;
    }

    // HTML comment — skip to the closing delimiter.
    if (input.startsWith("<!--", index)) {
      const end = input.indexOf("-->", index + 4);
      index = end === -1 ? input.length : end + 3;
      continue;
    }

    const close = input.indexOf(">", index);
    if (close === -1) {
      textBuffer += input.slice(index);
      break;
    }

    let raw = input.slice(index + 1, close).trim();
    index = close + 1;
    if (!raw) continue;

    // Closing tag: `</name>`.
    if (raw.startsWith("/")) {
      const name = raw.slice(1).trim().toLowerCase();
      flushText();
      tokens.push({ type: "tag-close", name });
      continue;
    }

    // Self-closing tag: `<name/>`.
    let selfClosing = false;
    if (raw.endsWith("/")) {
      selfClosing = true;
      raw = raw.slice(0, -1).trim();
    }

    const { name, attrs } = parseTag(raw);
    flushText();
    if (selfClosing || VOID_TAGS.has(name)) {
      tokens.push({ type: "tag-void", name, attrs });
    } else {
      tokens.push({ type: "tag-open", name, attrs });
    }
  }

  flushText();
  return tokens;
}
