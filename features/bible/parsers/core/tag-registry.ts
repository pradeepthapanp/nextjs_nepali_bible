import type {
  InlineNode,
  TagContext,
  TagRegistryLike,
} from "../types";
import { flattenText } from "./nodes";

/** A tag handler: receives parsed children + attributes and returns nodes. */
export type TagBuilder = (ctx: TagContext) => InlineNode[];

/**
 * Maps tag names to builders — the heart of the engine's extensibility.
 * The default registry reproduces the Flutter tag set (`pb`, `n`, `t`, `j`,
 * `e`, `nv`, `ev`, `x`, `reflink`, `sup`, `b`, `i`, `br`); plugins register
 * additional tags (Strong's, footnotes, …) without touching existing handlers.
 */
export class TagRegistry implements TagRegistryLike {
  private readonly handlers = new Map<string, TagBuilder>();

  register(name: string, builder: TagBuilder): void {
    this.handlers.set(name, builder);
  }

  has(name: string): boolean {
    return this.handlers.has(name);
  }

  /** Builds nodes for a tag; unknown tags pass their children through. */
  build(name: string, ctx: TagContext): InlineNode[] {
    const handler = this.handlers.get(name);
    return handler ? handler(ctx) : ctx.children;
  }
}

/**
 * Default tag handlers — a faithful mapping of the Flutter parser widgets
 * (`nep_parse.dart`, `eng_parse.dart`, `general_verse_parse.dart`,
 * `title_parser.dart`'s `<x>`, `cmt_parse.dart`'s `<reflink>`).
 */
export function createDefaultRegistry(): TagRegistry {
  const registry = new TagRegistry();

  // Words of Jesus — red when `redLetters` is enabled.
  registry.register("j", ({ children, options }) =>
    options.redLetters === false
      ? children
      : [{ type: "words-of-jesus", children }],
  );

  // Emphasis (bold / italic).
  registry.register("e", ({ children }) => [
    { type: "emphasis", variant: "bold", children },
  ]);
  registry.register("b", ({ children }) => [
    { type: "emphasis", variant: "bold", children },
  ]);
  registry.register("strong", ({ children }) => [
    { type: "emphasis", variant: "bold", children },
  ]);
  registry.register("i", ({ children }) => [
    { type: "emphasis", variant: "italic", children },
  ]);
  registry.register("em", ({ children }) => [
    { type: "emphasis", variant: "italic", children },
  ]);

  registry.register("sup", ({ children }) => [
    { type: "superscript", children },
  ]);

  // Footnotes (`<f>…</f>`) — ignored: the footnote marker/content is not
  // rendered in the verse (matches the product decision to drop footnotes).
  registry.register("f", () => []);
  registry.register("fn", () => []);

  // Inline note — styled dimmer (matches Flutter `n` styling).
  registry.register("n", ({ children }) => [
    { type: "note", text: flattenText(children) },
  ]);

  // Verse numbers (Nepali `nv` / English `ev`).
  registry.register("nv", ({ children }) => [
    { type: "verse-number", text: flattenText(children) },
  ]);
  registry.register("ev", ({ children }) => [
    { type: "verse-number", text: flattenText(children) },
  ]);

  // Inline title run.
  registry.register("t", ({ children }) => [{ type: "title", children }]);

  // Commentary reference link (`<reflink target="Psa 14:1">भजनसंग्रह १४:१</reflink>`).
  // Resolve from the `target` attribute when present (English short name +
  // Arabic digits, exactly like Flutter `CmtParser.openReference` reads
  // `ctx.attributes['target']`); the Nepali label is display-only and falls
  // back only when no target attribute exists.
  registry.register("reflink", ({ children, attrs, options }) => {
    const label = flattenText(children);
    const targetSource = attrs.target?.trim() || label;
    const target = options.referenceResolver?.(targetSource) ?? null;
    return [{ type: "reference-link", target, label }];
  });

  // Structural breaks.
  registry.register("pb", () => [{ type: "paragraph-break" }]);
  registry.register("br", () => [{ type: "line-break" }]);

  return registry;
}
