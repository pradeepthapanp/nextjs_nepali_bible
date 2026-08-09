"use client";

import Quill from "quill";

/**
 * Divider blot — registers a custom Quill `divider` embed that renders
 * `<hr class="ql-divider">`. Quill 2 has no built-in divider; registering the
 * blot also lets Quill's clipboard map pasted `<hr>` back to the `divider`
 * embed, so the HTML ⇄ Delta round-trip works (Delta→HTML is handled by
 * `HtmlConverter`'s divider pre-pass).
 *
 * Idempotent — runs once per module load, and is a no-op off the DOM.
 */
let registered = false;

export function ensureDividerBlot(): void {
  if (registered || typeof document === "undefined") return;
  registered = true;

  // `Quill.import` returns `any` (per @types/quill) — extend the embed blot.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const BlockEmbed = Quill.import("blots/block/embed") as any;
  const DividerBlot = class extends BlockEmbed {
    static create(value: unknown) {
      const node = super.create(value) as HTMLElement;
      node.setAttribute("class", "ql-divider");
      return node;
    }
    static value(node: HTMLElement) {
      return node.getAttribute("class") === "ql-divider";
    }
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Quill.register(DividerBlot as any);
}
