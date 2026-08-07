"use client";

import { useCallback, useState } from "react";
import { getSongServices } from "../services";
import { AUDIO_UPLOAD_FOLDER, COVER_UPLOAD_FOLDER } from "../types";
import { INITIAL_UPLOAD_STATE, type UploadState } from "@/types/upload";

/**
 * useAudioUpload — the upload behavior for the Add/Edit page (the web
 * equivalent of `UploadNotifier` consumption in `AddEditNewAudioPage`: upload
 * progress + error surfaced during `uploadFile`). Files are pushed through the
 * SHARED `UploadService` edge functions; this hook builds the Songs storage
 * paths (`audio_covers/…` / `songs/…`) and only tracks the reactive progress
 * state for the progress card.
 */
export function useAudioUpload() {
  const [state, setState] = useState<UploadState>(INITIAL_UPLOAD_STATE);

  /** Upload a cover image; resolves to its media URL. */
  const uploadCover = useCallback(
    async (blob: Blob, fileName: string, label: string): Promise<string> => {
      setState({
        isUploading: true,
        progress: 0,
        uploading: label,
        filePath: fileName,
        error: undefined,
      });
      try {
        const url = await getSongServices().upload.uploadFile(
          blob,
          `${COVER_UPLOAD_FOLDER}/${fileName}`,
          (progress) => setState((s) => ({ ...s, progress })),
        );
        setState(INITIAL_UPLOAD_STATE);
        return url;
      } catch (error) {
        setState((s) => ({
          ...s,
          isUploading: false,
          error: error instanceof Error ? error.message : String(error),
        }));
        throw error;
      }
    },
    [],
  );

  /** Upload an audio file; resolves to its media URL. */
  const uploadAudio = useCallback(
    async (blob: Blob, fileName: string, label: string): Promise<string> => {
      setState({
        isUploading: true,
        progress: 0,
        uploading: label,
        filePath: fileName,
        error: undefined,
      });
      try {
        const url = await getSongServices().upload.uploadFile(
          blob,
          `${AUDIO_UPLOAD_FOLDER}/${fileName}`,
          (progress) => setState((s) => ({ ...s, progress })),
        );
        setState(INITIAL_UPLOAD_STATE);
        return url;
      } catch (error) {
        setState((s) => ({
          ...s,
          isUploading: false,
          error: error instanceof Error ? error.message : String(error),
        }));
        throw error;
      }
    },
    [],
  );

  /** Best-effort delete of an old media file (e.g. when replacing a cover). */
  const deleteFile = useCallback((path: string) => {
    void getSongServices().upload.deleteFile(path).catch(() => undefined);
  }, []);

  const reset = useCallback(() => setState(INITIAL_UPLOAD_STATE), []);

  return { state, uploadCover, uploadAudio, deleteFile, reset };
}
