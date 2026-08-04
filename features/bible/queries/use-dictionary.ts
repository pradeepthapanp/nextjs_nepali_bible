"use client";

import { useQuery } from "@tanstack/react-query";
import { SEARCH_MIN_QUERY_LENGTH } from "../constants";
import { getBibleServices } from "../services";
import { bibleKeys } from "./query-keys";

/** Dictionary lookup — disabled until the term is long enough. */
export function useDictionary(term: string) {
  return useQuery({
    queryKey: bibleKeys.dictionary(term),
    queryFn: () => getBibleServices().dictionary.searchDictionary(term),
    enabled: term.trim().length >= SEARCH_MIN_QUERY_LENGTH,
  });
}
