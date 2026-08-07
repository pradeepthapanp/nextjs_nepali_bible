import type { SupabaseClient } from "@supabase/supabase-js";
import { getContentType } from "@/utils/content-type";

/**
 * Upload service — shared. A direct port of `UploadNotifier`
 * (`lib/providers/global/upload_notifier_provider.dart`): files are pushed
 * through the Supabase edge functions `get-upload-url` (signed PUT URL) and
 * `delete-file`. Upload progress streams back via `onProgress` (the web
 * equivalent of Dio's `onSendProgress`, implemented with XMLHttpRequest since
 * `fetch` has no upload-progress API).
 *
 * Generic: the caller supplies the FULL storage path (e.g.
 * `audio_covers/{uuid}_x.jpg`, `articles/{ts}.jpg`); the content type is
 * derived from the path's extension. Features build their own paths, so no
 * feature folder is hardcoded here.
 */

export interface UploadService {
  /** Upload a file to `{path}` → the media URL (progress 0..1 via `onProgress`). */
  uploadFile(
    blob: Blob,
    path: string,
    onProgress?: (progress: number) => void,
  ): Promise<string>;
  /** Delete a storage object by path (the `delete-file` edge function). */
  deleteFile(path: string): Promise<void>;
}

interface UploadUrlPayload {
  uploadUrl: string;
  fileUrl: string;
}

export class SupabaseUploadService implements UploadService {
  constructor(private readonly client: SupabaseClient) {}

  async uploadFile(
    blob: Blob,
    path: string,
    onProgress?: (progress: number) => void,
  ): Promise<string> {
    return this.upload(blob, path, getContentType(path), onProgress);
  }

  async deleteFile(path: string): Promise<void> {
    const response = await this.client.functions.invoke("delete-file", {
      body: { path },
    });
    if (response.error) throw response.error;
  }

  private async upload(
    blob: Blob,
    path: string,
    contentType: string,
    onProgress?: (progress: number) => void,
  ): Promise<string> {
    const response = await this.client.functions.invoke<UploadUrlPayload>(
      "get-upload-url",
      { body: { path, contentType } },
    );
    if (response.error) throw response.error;
    if (!response.data?.uploadUrl || !response.data?.fileUrl) {
      throw new Error("Upload URL not available");
    }
    const { uploadUrl, fileUrl } = response.data;

    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", contentType);
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) onProgress?.(event.loaded / event.total);
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else reject(new Error(`Upload failed: ${xhr.status}`));
      };
      xhr.onerror = () => reject(new Error("Upload failed"));
      xhr.send(blob);
    });

    onProgress?.(1);
    return fileUrl;
  }
}
