import type Quill from "quill";
import type { UploadService } from "@/services/upload-service";
import { fileExtension } from "@/utils/content-type";

/**
 * ImageEmbedHandler — inline image embeds (a WEB-FIRST capability; Flutter's
 * article editor has no inline images, only the featured-image upload).
 *
 * Uploads go through the SHARED `UploadService` (the edge-function + XHR logic
 * lives only in `@/services/upload-service` — nothing is duplicated here);
 * the returned media URL is inserted as a Quill `image` embed. Delta is never
 * exposed. The storage folder is caller-supplied (`imageUploadFolder`), so the
 * shared platform is feature-agnostic (articles → `articles`, notes → `notes`).
 */
export class ImageEmbedHandler {
  constructor(
    private readonly quill: Quill,
    private readonly upload: UploadService,
    private readonly imageUploadFolder: string,
  ) {}

  /** Upload a picked/pasted image file and insert it at the caret. */
  async insertImageFile(
    file: File,
    onProgress?: (progress: number) => void,
  ): Promise<string> {
    const ext = fileExtension(file.name);
    const path = `${this.imageUploadFolder}/editor/${Date.now()}.${ext}`;
    const url = await this.upload.uploadFile(file, path, onProgress);
    this.insertImageUrl(url);
    return url;
  }

  /** Insert an already-uploaded image URL at the caret. */
  insertImageUrl(url: string): void {
    const index = this.quill.getSelection()?.index ?? this.quill.getLength() - 1;
    this.quill.insertEmbed(index, "image", url, "user");
    this.quill.setSelection(index + 1, 0, "silent");
  }
}
