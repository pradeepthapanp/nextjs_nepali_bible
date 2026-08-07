"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

export interface FavoriteButtonProps {
  isFavorite: boolean;
  /** Receives the click event so parents can stopPropagation (e.g. inside a
   * clickable row). */
  onToggle?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  /** Accessible label overrides (defaults adapt to the favorite state). */
  label?: string;
  className?: string;
}

/**
 * FavoriteButton — the heart toggle (the web equivalent of a per-song
 * "favorite" affordance). Purely presentational and controlled: the parent
 * composes the favorites behavior (`useFavoriteSongs`) and passes
 * `isFavorite` + `onToggle` — the button itself never queries or mutates.
 * Uses `aria-pressed` so screen readers announce the toggle state.
 */
export function FavoriteButton({
  isFavorite,
  onToggle,
  disabled,
  label,
  className,
}: FavoriteButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={isFavorite}
      aria-label={
        label ?? (isFavorite ? "Remove from favorites" : "Add to favorites")
      }
      className={cn(
        "text-muted-foreground hover:text-destructive",
        isFavorite && "text-destructive",
        className,
      )}
    >
      <Heart className={cn("size-4", isFavorite && "fill-current")} />
    </Button>
  );
}
