import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind class names intelligently.
 *
 * `clsx` handles conditional classes; `twMerge` resolves conflicting Tailwind
 * utilities (e.g. `px-2` + `px-4` → `px-4`). Use everywhere class strings are
 * composed so overrides behave predictably.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
