import type Quill from "quill";
import type { ImageEmbedHandler } from "./image-embed-handler";

/**
 * ClipboardHandler — paste behavior for the editor. Pasted IMAGE FILES are
 * intercepted, uploaded through the SHARED `UploadService` (via
 * `ImageEmbedHandler`) and inserted as image embeds; pasted HTML/text keeps
 * Quill's built-in (sanitizing) clipboard handling.
 */
export class ClipboardHandler {
  private readonly handlePaste = (event: ClipboardEvent): void => {
    const files = Array.from(event.clipboardData?.files ?? []);
    const images = files.filter((file) => file.type.startsWith("image/"));
    if (images.length === 0) return;
    event.preventDefault();
    for (const image of images) {
      void this.imageEmbed.insertImageFile(image);
    }
  };

  constructor(
    private readonly quill: Quill,
    private readonly imageEmbed: ImageEmbedHandler,
    private readonly container: HTMLElement,
  ) {
    this.container.addEventListener("paste", this.handlePaste);
  }

  destroy(): void {
    this.container.removeEventListener("paste", this.handlePaste);
  }
}
