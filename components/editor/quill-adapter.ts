"use client";

import Quill from "quill";
import "quill/dist/quill.snow.css";
import type { UploadService } from "@/services/upload-service";
import { HtmlConverter } from "./html-converter";
import { ensureDividerBlot } from "./divider-blot";
import { SelectionManager } from "./selection-manager";
import { EditorHistory } from "./editor-history";
import { EditorCommands } from "./editor-commands";
import { ImageEmbedHandler } from "./image-embed-handler";
import { ClipboardHandler } from "./clipboard-handler";
import { AutoSaveManager } from "./auto-save-manager";
import type { EditorSelection } from "./types";

export interface QuillAdapterOptions {
  /** The element Quill mounts into. */
  container: HTMLElement;
  /** An optional toolbar container (the `EditorToolbar` element). */
  toolbarContainer?: HTMLElement;
  placeholder?: string;
  readOnly?: boolean;
  /** The SHARED `UploadService` — used only for inline image embeds. */
  upload: UploadService;
  /** Storage folder for inline image embeds (e.g. "articles", "notes"). */
  imageUploadFolder: string;
  /** Fired with the resulting HTML after every user edit. */
  onChange?: (html: string) => void;
  onSelectionChange?: (selection: EditorSelection | null) => void;
  /** Enable debounced autosave (default true). */
  autoSave?: boolean;
  /** Receives the debounced HTML — the caller wires it to the editor store. */
  onAutoSave?: (html: string) => void;
  autosaveDebounceMs?: number;
}

/**
 * QuillAdapter — THE single adapter for the article editor (the web equivalent
 * of the Flutter `QuillController` + `QuillSimpleToolbar` actions + the
 * `QuillDeltaToHtmlConverter`/`HtmlToDelta` wiring in
 * `add_edit_article_page.dart`).
 *
 * SINGLE CONVERSION BOUNDARY: this class (through `HtmlConverter`, which it
 * exclusively owns) is the ONLY place HTML ⇄ Delta happens. The public surface
 * is HTML (`loadHtml` / `getHtml`), selection, formatting commands, undo/redo
 * and the insert operations — Delta never leaves `@/components/editor`.
 *
 * Internally it owns a Quill instance and composes the managers:
 * `selection`, `history`, `commands`, `images`, `clipboard`, `autosave`.
 */
export class QuillAdapter {
  readonly selection: SelectionManager;
  readonly history: EditorHistory;
  readonly commands: EditorCommands;
  readonly images: ImageEmbedHandler;
  readonly clipboard: ClipboardHandler;
  readonly autosave: AutoSaveManager;

  private readonly quill: Quill;
  private readonly onChange?: (html: string) => void;
  private readonly autoSaveEnabled: boolean;
  private lastHtml = "";

  constructor(options: QuillAdapterOptions) {
    ensureDividerBlot();

    const quill = new Quill(options.container, {
      theme: "snow",
      modules: options.toolbarContainer
        ? { toolbar: { container: options.toolbarContainer } }
        : { toolbar: true },
      placeholder: options.placeholder,
      readOnly: options.readOnly,
    });
    this.quill = quill;
    this.onChange = options.onChange;
    this.autoSaveEnabled = options.autoSave !== false;

    this.selection = new SelectionManager(quill, options.onSelectionChange);
    this.history = new EditorHistory(quill);
    this.commands = new EditorCommands(quill);
    this.images = new ImageEmbedHandler(quill, options.upload, options.imageUploadFolder);
    this.clipboard = new ClipboardHandler(quill, this.images, options.container);
    this.autosave = new AutoSaveManager({
      getHtml: () => this.getHtml(),
      debounceMs: options.autosaveDebounceMs,
      onAutoSave: (html) => options.onAutoSave?.(html),
    });

    quill.on("text-change", (_delta, _old, source) => {
      if (source === "silent") return;
      const html = this.getHtml();
      if (html !== this.lastHtml) {
        this.lastHtml = html;
        this.onChange?.(html);
      }
      if (this.autoSaveEnabled) this.autosave.schedule();
    });

    this.lastHtml = this.getHtml();
  }

  // ---- HTML boundary (the ONLY HTML ⇄ Delta conversion) ----

  /** Load HTML into the editor (HTML → Delta, silently — no onChange). */
  loadHtml(html: string): void {
    const delta = HtmlConverter.htmlToDelta(html, this.quill);
    this.quill.setContents(delta, "silent");
    this.lastHtml = html;
  }

  /** The editor's current content as HTML (Delta → HTML). */
  getHtml(): string {
    return HtmlConverter.deltaToHtml(this.quill.getContents());
  }

  /** Whether the editor has no meaningful content. */
  isEmpty(): boolean {
    return HtmlConverter.isEmptyHtml(this.getHtml());
  }

  // ---- lifecycle ----

  /** Lock/unlock the editor for reading (`readOnly`). */
  enable(editable: boolean): void {
    this.quill.enable(editable);
  }

  focus(): void {
    this.selection.focus();
  }

  destroy(): void {
    this.clipboard.destroy();
    this.autosave.destroy();
    // `destroy` isn't on the @types/quill class — call it if Quill 2 exposes it.
    (this.quill as unknown as { destroy?: () => void }).destroy?.();
  }
}
