"use client";

import { ThemeProvider } from "@/providers/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { SupabaseProvider } from "@/providers/supabase-provider";
import { HighlightProvider } from "@/features/bible/components/highlight-provider";
import { Toaster } from "@/components/ui/sonner";

/**
 * Composition root for all client-side providers.
 *
 * Imported once from the root layout and wraps the entire application:
 *
 *   ThemeProvider → QueryProvider → SupabaseProvider → { children } + Toaster
 *
 * Keeping the composition in one file makes the provider ordering explicit and
 * easy to reason about. Each provider has a single, isolated responsibility.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryProvider>
        <SupabaseProvider>
          <HighlightProvider>
            {children}
            <Toaster />
          </HighlightProvider>
        </SupabaseProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
