/**
 * Upload state — a direct port of the Flutter `UploadState` model
 * (`lib/models/upload_state.dart`): progress + error surfaced while a file is
 * pushed through the `get-upload-url` / `delete-file` edge functions. Shared
 * by every feature that uploads files (audio covers, songs, article featured
 * images, notices).
 */
export interface UploadState {
  isUploading: boolean;
  /** 0..1 fraction of the current upload. */
  progress: number;
  /** The storage path being uploaded (for display/labels). */
  filePath?: string;
  /** The file label shown while uploading (e.g. the cover/audio filename). */
  uploading?: string;
  error?: string;
}

export const INITIAL_UPLOAD_STATE: UploadState = {
  isUploading: false,
  progress: 0,
};
