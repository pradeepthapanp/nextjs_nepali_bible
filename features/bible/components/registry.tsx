"use client";

import { createRendererRegistry } from "@features/bible/parsers";
import type { RendererRegistry } from "@features/bible/parsers";
import type {
  CrossReferenceMarkerNode,
  EmphasisNode,
  FootnoteMarkerNode,
  InlineHighlightNode,
  InlineNoteNode,
  NoteNode,
  ParagraphNode,
  PoetryNode,
  ReferenceLinkNode,
  SearchHighlightNode,
  StrongsNode,
  SuperscriptNode,
  TextNode,
  TitleBlockNode,
  TitleNode,
  VerseNumberNode,
  WordsOfJesusNode,
} from "@features/bible/parsers";
import { setDefaultVerseRenderer } from "./context";
import {
  VerseCrossReferenceMarker,
  VerseEmphasis,
  VerseFootnoteMarker,
  VerseHighlight,
  VerseInlineNote,
  VerseNumber,
  VerseParagraph,
  VersePoetry,
  VerseReferenceChip,
  VerseSearchHighlight,
  VerseStrongs,
  VerseSuperscript,
  VerseText,
  VerseTitle,
  VerseWordsOfJesus,
} from "./verse";

/**
 * createVerseRendererRegistry — wires every engine node type to its React
 * component.
 *
 * This is the single extension point: future node types (new plugins) are
 * handled by registering a renderer here — no existing component changes.
 * The returned registry implements the UI-agnostic `RendererRegistry<ReactNode>`
 * from `parsers/renderer` and can be passed to `<VerseRenderProvider>`.
 */
export function createVerseRendererRegistry(): RendererRegistry<React.ReactNode> {
  const registry = createRendererRegistry<React.ReactNode>((text) => (
    <span>{text}</span>
  ));

  /* ---- Inline nodes ---- */
  registry.registerInline({
    match: (node) => node.type === "text",
    render: (node) => <VerseText node={node as TextNode} />,
  });
  registry.registerInline({
    match: (node) => node.type === "verse-number",
    render: (node) => <VerseNumber node={node as VerseNumberNode} />,
  });
  registry.registerInline({
    match: (node) => node.type === "emphasis",
    render: (node) => <VerseEmphasis node={node as EmphasisNode} />,
  });
  registry.registerInline({
    match: (node) => node.type === "words-of-jesus",
    render: (node) => <VerseWordsOfJesus node={node as WordsOfJesusNode} />,
  });
  registry.registerInline({
    match: (node) => node.type === "title",
    render: (node) => <VerseTitle node={node as TitleNode} />,
  });
  registry.registerInline({
    match: (node) => node.type === "note",
    render: (node) => <VerseInlineNote node={node as NoteNode} />,
  });
  registry.registerInline({
    match: (node) => node.type === "inline-note",
    render: (node) => <VerseInlineNote node={node as InlineNoteNode} />,
  });
  registry.registerInline({
    match: (node) => node.type === "reference-link",
    render: (node) => <VerseReferenceChip node={node as ReferenceLinkNode} />,
  });
  registry.registerInline({
    match: (node) => node.type === "search-highlight",
    render: (node) => <VerseSearchHighlight node={node as SearchHighlightNode} />,
  });
  registry.registerInline({
    match: (node) => node.type === "inline-highlight",
    render: (node) => <VerseHighlight node={node as InlineHighlightNode} />,
  });
  registry.registerInline({
    match: (node) => node.type === "strongs",
    render: (node) => <VerseStrongs node={node as StrongsNode} />,
  });
  registry.registerInline({
    match: (node) => node.type === "footnote-marker",
    render: (node) => <VerseFootnoteMarker node={node as FootnoteMarkerNode} />,
  });
  registry.registerInline({
    match: (node) => node.type === "cross-reference-marker",
    render: (node) => <VerseCrossReferenceMarker node={node as CrossReferenceMarkerNode} />,
  });
  registry.registerInline({
    match: (node) => node.type === "superscript",
    render: (node) => <VerseSuperscript node={node as SuperscriptNode} />,
  });
  registry.registerInline({
    match: (node) => node.type === "line-break",
    render: () => <br />,
  });
  // paragraph-break should be consumed by buildBlocks; defensive no-op.
  registry.registerInline({
    match: (node) => node.type === "paragraph-break",
    render: () => null,
  });

  /* ---- Block nodes ---- */
  registry.registerBlock({
    match: (node) => node.type === "paragraph",
    render: (node) => <VerseParagraph block={node as ParagraphNode} />,
  });
  registry.registerBlock({
    match: (node) => node.type === "poetry",
    render: (node) => <VersePoetry block={node as PoetryNode} />,
  });
  registry.registerBlock({
    match: (node) => node.type === "title",
    render: (node) => <VerseTitle node={node as TitleBlockNode} />,
  });

  return registry;
}

// Initialise the default renderer so components work standalone (outside a
// <VerseRenderProvider>), e.g. `<VerseParagraph block={…} />`.
setDefaultVerseRenderer(createVerseRendererRegistry());
