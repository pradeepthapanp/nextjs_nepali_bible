"use client";

import { useQuery } from "@tanstack/react-query";
import { getBibleServices } from "../services";
import { bibleKeys } from "./query-keys";

/**
 * The canonical book list. Consumed by the book/chapter pickers and by
 * reference-math (infinite navigation needs each book's chapter count).
 */
export function useBooks() {
  return useQuery({
    queryKey: bibleKeys.books(),
    queryFn: () => getBibleServices().bible.getBooks(),
    staleTime: Infinity, // the canon does not change at runtime
  });
}
