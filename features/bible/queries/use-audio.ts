"use client";

import { useQuery } from "@tanstack/react-query";
import { getBibleServices } from "../services";
import { bibleKeys } from "./query-keys";

/** The audio track for one chapter (drives the audio player bar). */
export function useChapterAudio(bookNumber: number, chapter: number) {
  return useQuery({
    queryKey: bibleKeys.audio(bookNumber, chapter),
    queryFn: () =>
      getBibleServices().audio.getChapterAudio(bookNumber, chapter),
    enabled: bookNumber > 0 && chapter > 0,
  });
}

/** All audio tracks for a book (drives the audio Bible list). */
export function useBookAudios(bookNumber: number) {
  return useQuery({
    queryKey: bibleKeys.bookAudio(bookNumber),
    queryFn: () => getBibleServices().audio.getBookAudios(bookNumber),
    enabled: bookNumber > 0,
  });
}
