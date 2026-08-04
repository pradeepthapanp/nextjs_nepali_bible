"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils/cn";

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  /** Accessible label (required for screen readers). */
  label?: string;
  /** Controlled value; omit for uncontrolled usage. */
  value?: string;
  /** Fired on every change. */
  onValueChange?: (value: string) => void;
  /** Fired when the user clears the field. */
  onClear?: () => void;
}

/**
 * Search field with leading icon, accessible label and a clear button.
 * Fully reusable across features (Bible search, article search, etc.); the
 * parent controls query state (optionally with `useDebouncedValue`).
 */
export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput(
    {
      label = "Search",
      value,
      onValueChange,
      onClear,
      className,
      ...props
    },
    ref,
  ) {
    const [internalValue, setInternalValue] = React.useState("");

    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;

    const handleChange = (next: string) => {
      if (!isControlled) setInternalValue(next);
      onValueChange?.(next);
    };

    const handleClear = () => {
      if (!isControlled) setInternalValue("");
      onValueChange?.("");
      onClear?.();
    };

    const showClear = currentValue.length > 0 && Boolean(onValueChange || onClear);

    return (
      <div className={cn("relative w-full", className)}>
        <Search
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          ref={ref}
          type="search"
          role="searchbox"
          aria-label={label}
          value={currentValue}
          onChange={(event) => handleChange(event.target.value)}
          className="pl-9 pr-9"
          {...props}
        />
        {showClear ? (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-4" aria-hidden />
          </button>
        ) : null}
      </div>
    );
  },
);
