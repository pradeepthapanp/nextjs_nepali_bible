# Store

This directory holds **Zustand** client-side stores for cross-cutting, ephemeral
UI state (e.g. theme preferences, player state, navigation UI state).

## Convention

- One file per store, e.g. `store/ui-store.ts`, `store/player-store.ts`.
- Store files are plain Zustand stores — no React context/provider needed:

```ts
import { create } from "zustand";

interface UiState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));
```

## Rules

- Prefer **server state** (data from APIs) in TanStack Query, not Zustand.
  Use Zustand for ephemeral client-only UI state.
- Persistent app state (theme, locale, auth) uses dedicated mechanisms —
  `next-themes` for theme, Supabase auth for sessions.
- Selectors should be used at call sites to avoid unnecessary re-renders.

This folder intentionally contains no stores yet — they will be added with the
first features during migration.
