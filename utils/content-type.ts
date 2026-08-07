/**
 * Content-type for uploads — a direct port of `UploadNotifier._getContentType`
 * (`lib/providers/global/upload_notifier_provider.dart`). Generic: derives the
 * MIME type from a file name OR a storage path (paths end in `.ext`, so
 * `getContentType("audio_covers/uuid_x.jpg")` still works).
 */
export function getContentType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "mp3":
      return "audio/mpeg";
    case "wav":
      return "audio/wav";
    case "m4a":
      return "audio/mp4";
    case "aac":
      return "audio/aac";
    case "ogg":
      return "audio/ogg";
    default:
      return "application/octet-stream";
  }
}

/**
 * The file extension of a name (lowercase, no dot) — mirrors Flutter's
 * `PlatformFile.extension` used when building upload file names.
 */
export function fileExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

/** The base name (before the first dot), lowercased — mirrors Flutter. */
export function fileBaseName(fileName: string): string {
  return fileName.split(".")[0]?.toLowerCase() ?? "file";
}
