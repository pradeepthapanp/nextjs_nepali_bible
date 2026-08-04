"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";

/**
 * Provides the app-wide TanStack Query client to the React tree.
 *
 * Uses `getQueryClient()` from `lib/query-client.ts` so the browser reuses a
 * single cached instance while the server always gets a fresh one per request.
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
