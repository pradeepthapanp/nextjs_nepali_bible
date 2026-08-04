"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getBibleServices } from "../services";
import type { Reference } from "../types";
import { bibleKeys } from "./query-keys";

/** All of the user's bookmarks. */
export function useBookmarks() {
  return useQuery({
    queryKey: bibleKeys.bookmarks.all(),
    queryFn: () => getBibleServices().bookmark.getBookmarks(),
  });
}

/** Bookmark mutations — invalidate the bookmarks cache on success. */
export function useBookmarkMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: bibleKeys.bookmarks.all() });

  const add = useMutation({
    mutationFn: ({ reference, label }: { reference: Reference; label?: string }) =>
      getBibleServices().bookmark.addBookmark(reference, label),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => getBibleServices().bookmark.removeBookmark(id),
    onSuccess: invalidate,
  });

  return { add, remove };
}
