"use client";

import { create } from "zustand";
import type { NoticeSort } from "../types";

interface NoticeSortState {
  /** The active notice-list sort (Flutter `NoticesNotifier.sortNotices` selection). */
  sort: NoticeSort;
  setSort: (sort: NoticeSort) => void;
}

/**
 * useNoticeSortStore — the ONLY sort UI state in the Community feature
 * (NON-persisted, transient). Flutter sorted the in-memory list from the sort
 * dialog; on the web the notice list lives in the React Query cache (never
 * mutated), so the STORE holds the selected `NoticeSort` and the list page /
 * `useNoticeLibrary` applies the pure `sortNotices` util over the cache.
 * This is genuinely UI-only state (no server data) — the sanctioned
 * "notice sort" store.
 */
export const useNoticeSortStore = create<NoticeSortState>((set) => ({
  sort: "newest",
  setSort: (sort) => set({ sort }),
}));
