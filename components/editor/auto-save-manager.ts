/**
 * AutoSaveManager — debounced autosave of the editor's HTML content.
 *
 * The adapter calls `schedule()` on every change; after `debounceMs` of
 * inactivity the current HTML (via `getHtml`, which funnels through the
 * QuillAdapter → HtmlConverter boundary) is handed to `onAutoSave`. The caller
 * (e.g. the `ArticleEditor` component) wires `onAutoSave` to
 * `useArticleEditor().update({ content: html })` — reusing the editor store /
 * autosave persistence without duplicating it here. Delta is never exposed.
 */
export interface AutoSaveManagerOptions {
  /** Reads the current HTML at save time (the adapter's `getHtml`). */
  getHtml: () => string;
  /** Saves the debounced HTML (component wires it to the editor store). */
  onAutoSave: (html: string) => void;
  /** Inactivity window before an autosave fires (default 800ms). */
  debounceMs?: number;
}

export class AutoSaveManager {
  private timer: ReturnType<typeof setTimeout> | null = null;
  private lastSavedHtml: string | null = null;

  constructor(private readonly options: AutoSaveManagerOptions) {}

  /** Called on every editor change — debounces and autosaves. */
  schedule(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.timer = null;
      this.save();
    }, this.options.debounceMs ?? 800);
  }

  /** Save immediately if a debounced save is pending. */
  flush(): void {
    if (!this.timer) return;
    clearTimeout(this.timer);
    this.timer = null;
    this.save();
  }

  /** Cancel any pending autosave (e.g. on unmount). */
  cancel(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  destroy(): void {
    this.cancel();
  }

  private save(): void {
    const html = this.options.getHtml();
    if (html === this.lastSavedHtml) return;
    this.lastSavedHtml = html;
    this.options.onAutoSave(html);
  }
}
