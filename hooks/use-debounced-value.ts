"use client";

import { useEffect, useState } from "react";

/**
 * Returns a value that updates only after `delay` ms of inactivity.
 * Useful for search inputs / filters that trigger async lookups.
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
