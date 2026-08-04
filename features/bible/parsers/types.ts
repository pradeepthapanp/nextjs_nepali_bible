import type {
  CrossReference,
  HighlightColor,
  Reference,
  Verse,
} from "../types";

/**
 * Verse Rendering Engine — data model.
 *
 * A verse (whose `text` is HTML markup) is parsed into a **structured render
 * tree** of typed nodes (never HTML strings). React components (added later)
 * consume this tree through the UI-agnostic renderer interfaces in
 * `parsers/renderer/types.ts`.
 *
 * Flow: Verse → tokens → InlineNode[] → BlockNode[] (VerseRenderTree) → React.
 */

/* ---------------------------------------------------------------------------
 * Inline nodes
 * ------------------------------------------------------------------------- */

export type InlineNode =
  | TextNode
  | VerseNumberNode
  | EmphasisNode
  | WordsOfJesusNode
  | TitleNode
  | NoteNode
  | ReferenceLinkNode
  | SearchHighlightNode
  | InlineHighlightNode
  | InlineNoteNode
  | StrongsNode
  | FootnoteMarkerNode
  | CrossReferenceMarkerNode
  | SuperscriptNode
  | LineBreakNode
  | ParagraphBreakNode;

/** Normal text (after HTML entity decoding). */
export interface TextNode {
  type: "text";
  text: string;
}

/** The verse's leading number (Nepali digits for `ne`, Arabic for `en`). */
export interface VerseNumberNode {
  type: "verse-number";
  text: string;
}

/** Bold / italic run — from `<b>`, `<strong>`, `<e>`, `<i>`, `<em>`. */
export interface EmphasisNode {
  type: "emphasis";
  variant: "bold" | "italic";
  children: InlineNode[];
}

/** Words of Jesus — from `<j>`; rendered red when `redLetters` is on. */
export interface WordsOfJesusNode {
  type: "words-of-jesus";
  children: InlineNode[];
}

/** Inline title run — from `<t>`. */
export interface TitleNode {
  type: "title";
  children: InlineNode[];
}

/** Inline note — from `<n>` (styled dimmer; a note annotation). */
export interface NoteNode {
  type: "note";
  text: string;
}

/** A cross-reference / commentary link — from `<reflink target="…">`. */
export interface ReferenceLinkNode {
  type: "reference-link";
  /** Resolved target reference, or null when unresolvable. */
  target: Reference | null;
  /** Visible link label (the tag's text content). */
  label: string;
}

/** Search-result highlight — wraps matched text (plugin-driven). */
export interface SearchHighlightNode {
  type: "search-highlight";
  children: InlineNode[];
}

/** Inline highlight — a coloured run within a verse (plugin-driven, future). */
export interface InlineHighlightNode {
  type: "inline-highlight";
  color: HighlightColor;
  children: InlineNode[];
}

/** Inline note annotation (richer than `<n>`, future). */
export interface InlineNoteNode {
  type: "inline-note";
  children: InlineNode[];
}

/** Strong's number — future (`<w>`/`<s>` tag). */
export interface StrongsNode {
  type: "strongs";
  number: string;
  children: InlineNode[];
}

/** Footnote marker — future (`<f>`/`<fn>` tag). */
export interface FootnoteMarkerNode {
  type: "footnote-marker";
  id: string;
}

/** Cross-reference superscript marker — from `<x>` (resolved by plugin). */
export interface CrossReferenceMarkerNode {
  type: "cross-reference-marker";
  label: string;
  /** Resolved reference, when a resolver/plugin supplies one. */
  reference?: CrossReference;
  children: InlineNode[];
}

/** Superscript run — from `<sup>`. */
export interface SuperscriptNode {
  type: "superscript";
  children: InlineNode[];
}

/** Hard line break — from `<br>` (used by poetry/verse layout). */
export interface LineBreakNode {
  type: "line-break";
}

/**
 * Paragraph boundary — from `<pb>`. Consumed by `buildBlocks`; not present in
 * the final `VerseRenderTree`.
 */
export interface ParagraphBreakNode {
  type: "paragraph-break";
}

/* ---------------------------------------------------------------------------
 * Block nodes
 * ------------------------------------------------------------------------- */

export type BlockNode = ParagraphNode | PoetryNode | TitleBlockNode;

export interface ParagraphNode {
  type: "paragraph";
  children: InlineNode[];
}

/** Poetry — a set of lines (future; produced by a poetry plugin). */
export interface PoetryNode {
  type: "poetry";
  lines: InlineNode[][];
}

/** A section title (from `<t>` at block level or a `VerseTitle` row). */
export interface TitleBlockNode {
  type: "title";
  children: InlineNode[];
}

/* ---------------------------------------------------------------------------
 * Render trees
 * ------------------------------------------------------------------------- */

/** The result of parsing a verse: block-level layout + inline segments. */
export interface VerseRenderTree {
  verse: Verse;
  blocks: BlockNode[];
}

/** The result of parsing a commentary entry (with its marker chip). */
export interface CommentaryRenderTree {
  /** Commentary marker chip (e.g. a verse anchor) from `Cmt.marker`. */
  marker?: string | number;
  blocks: BlockNode[];
}

/** The result of parsing a section title (`VerseTitle`). */
export interface TitleRenderTree {
  /** Original title with book numbers replaced by short names. */
  title: string;
  blocks: BlockNode[];
}

/* ---------------------------------------------------------------------------
 * Parse options & public types
 * ------------------------------------------------------------------------- */

export interface VerseParseOptions {
  /** Defaults to "ne" — affects verse-number digits and default tag styles. */
  language?: "ne" | "en";
  /** Render `<j>` as words-of-jesus (red letters). Defaults to true. */
  redLetters?: boolean;
  /** Prepend a verse-number segment. Defaults to true. */
  verseNumber?: boolean;
  /** Resolves `<reflink>` labels ("Gen 1:1") to references. */
  referenceResolver?: (label: string) => Reference | null;
  /** Search query for the search-highlight plugin. */
  searchQuery?: string;
  /** Additional parser plugins (extensibility point). */
  plugins?: VerseParserPlugin[];
}

/** Context passed to tag handlers during parsing. */
export interface TagContext {
  attrs: Record<string, string>;
  /** Already-parsed child nodes. */
  children: InlineNode[];
  options: VerseParseOptions;
}

/** Minimal registry contract tag handlers register against. */
export interface TagRegistryLike {
  register(name: string, builder: (ctx: TagContext) => InlineNode[]): void;
}

/**
 * A parser plugin — the extension point for future features (Strong's
 * numbers, footnotes, inline highlights/notes, poetry, …). New features are
 * added as plugins without changing existing handlers.
 */
export interface VerseParserPlugin {
  name: string;
  /** Register custom tag handlers on the shared registry. */
  register?(registry: TagRegistryLike): void;
  /** Post-process the inline node list (e.g. search highlighting). */
  transform?(
    nodes: InlineNode[],
    options: VerseParseOptions,
  ): InlineNode[];
}

export type VerseParser = (
  verse: Verse,
  options?: VerseParseOptions,
) => VerseRenderTree;
