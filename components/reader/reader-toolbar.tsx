"use client";

import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Minus,
  Plus,
  Type,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useReaderSettingsContext } from "./reader-settings-provider";
import { READER_THEMES, type ReaderTheme } from "./types";
import { cn } from "@/utils/cn";

const ALIGN_KEYS = {
  left: "alignLeft",
  center: "alignCenter",
  right: "alignRight",
  justify: "alignJustify",
} as const;

const THEME_KEYS: Record<ReaderTheme, "themeSystem" | "themeLight" | "themeDark" | "themeLamp"> = {
  system: "themeSystem",
  light: "themeLight",
  dark: "themeDark",
  lamp: "themeLamp",
};

const ALIGNMENTS = [
  { value: "left", icon: AlignLeft },
  { value: "center", icon: AlignCenter },
  { value: "right", icon: AlignRight },
  { value: "justify", icon: AlignJustify },
] as const;

export interface ReaderToolbarProps {
  className?: string;
}

/**
 * ReaderToolbar — the compact reader control bar (font size + line height
 * steppers, text alignment, reading theme). SHARED: consumes the
 * reader-settings CONTEXT (which composes a persisted reader-settings store
 * hook — Articles or Devotions); all clamping happens in the store setters —
 * no logic is re-derived here.
 */
export function ReaderToolbar({ className }: ReaderToolbarProps) {
  const {
    fontSize,
    lineHeight,
    alignment,
    theme,
    setFontSize,
    setLineHeight,
    setAlignment,
    setTheme,
  } = useReaderSettingsContext();
  const t = useTranslations("reader");

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1 rounded-lg border bg-background px-2 py-1",
        className,
      )}
    >
      <Type className="size-4 text-muted-foreground" aria-hidden />
      <Button
        type="button"
        size="icon"
        variant="ghost"
        aria-label={t("decreaseFontSize")}
        onClick={() => setFontSize(fontSize - 1)}
      >
        <Minus />
      </Button>
      <span className="min-w-7 text-center text-xs tabular-nums">{fontSize}</span>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        aria-label={t("increaseFontSize")}
        onClick={() => setFontSize(fontSize + 1)}
      >
        <Plus />
      </Button>

      <span className="mx-1 h-4 w-px bg-border" aria-hidden />

      <Button
        type="button"
        size="icon"
        variant="ghost"
        aria-label={t("decreaseLineHeight")}
        onClick={() => setLineHeight(lineHeight - 0.1)}
      >
        <Minus />
      </Button>
      <span className="min-w-7 text-center text-xs tabular-nums">
        {lineHeight.toFixed(1)}
      </span>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        aria-label={t("increaseLineHeight")}
        onClick={() => setLineHeight(lineHeight + 0.1)}
      >
        <Plus />
      </Button>

      <span className="mx-1 h-4 w-px bg-border" aria-hidden />

      {ALIGNMENTS.map(({ value, icon: Icon }) => (
        <Button
          key={value}
          type="button"
          size="icon"
          variant={alignment === value ? "secondary" : "ghost"}
          aria-pressed={alignment === value}
          aria-label={t(ALIGN_KEYS[value])}
          onClick={() => setAlignment(value)}
        >
          <Icon />
        </Button>
      ))}

      <span className="mx-1 h-4 w-px bg-border" aria-hidden />

      <select
        value={theme}
        onChange={(event) => setTheme(event.target.value as (typeof theme))}
        aria-label={t("readingTheme")}
        className="h-8 rounded-md border border-input bg-background px-1.5 text-xs"
      >
        {READER_THEMES.map((option) => (
          <option key={option.value} value={option.value}>
            {t(THEME_KEYS[option.value])}
          </option>
        ))}
      </select>
    </div>
  );
}
