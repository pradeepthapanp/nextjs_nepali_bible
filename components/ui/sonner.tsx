"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

/**
 * App-wide Sonner toast host.
 *
 * Bridges `next-themes` and Sonner so toasts automatically follow the active
 * theme. Mounted once inside `providers/providers.tsx`.
 */
export function Toaster(props: ToasterProps) {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-right"
      richColors
      closeButton
      {...props}
    />
  );
}
