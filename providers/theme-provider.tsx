"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

/**
 * Theme provider backed by `next-themes`.
 *
 * It toggles the `.dark` class on `<html>` (see `attribute="class"`), which is
 * consumed by the `@custom-variant dark` rule in `styles/globals.css`. A
 * `suppressHydrationWarning` on `<html>` in the root layout is required to avoid
 * hydration mismatches from the inline theme script.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
