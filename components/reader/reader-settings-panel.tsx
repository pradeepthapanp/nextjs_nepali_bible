"use client";

import { Minus, Plus, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { APP_FONT_FAMILIES } from "@/utils/fonts";
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

export interface ReaderSettingsPanelProps {
  className?: string;
}

function StepperRow({
  label,
  decreaseAria,
  increaseAria,
  onDecrease,
  onIncrease,
  display,
}: {
  label: string;
  decreaseAria: string;
  increaseAria: string;
  onDecrease: () => void;
  onIncrease: () => void;
  display: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label className="text-sm">{label}</Label>
      <div className="flex items-center gap-1">
        <Button type="button" size="icon" variant="outline" onClick={onDecrease} aria-label={decreaseAria}>
          <Minus />
        </Button>
        <span className="min-w-10 text-center text-sm tabular-nums">{display}</span>
        <Button type="button" size="icon" variant="outline" onClick={onIncrease} aria-label={increaseAria}>
          <Plus />
        </Button>
      </div>
    </div>
  );
}

/**
 * ReaderSettingsPanel — the full reader settings surface (font size, line
 * height, paragraph spacing, font family, alignment, theme + reset). SHARED:
 * consumes the reader-settings CONTEXT; all clamping happens in the store
 * setters. Composes nothing new — it is a control panel over the persisted
 * reader-settings hook (Articles or Devotions).
 */
export function ReaderSettingsPanel({ className }: ReaderSettingsPanelProps) {
  const {
    fontSize,
    lineHeight,
    paragraphSpacing,
    fontFamily,
    alignment,
    theme,
    setFontSize,
    setLineHeight,
    setParagraphSpacing,
    setFontFamily,
    setAlignment,
    setTheme,
    reset,
  } = useReaderSettingsContext();
  const t = useTranslations("reader");

  return (
    <div className={cn("flex flex-col gap-4 rounded-xl border bg-card p-4", className)}>
      <StepperRow
        label={t("fontSize")}
        decreaseAria={t("decreaseFontSize")}
        increaseAria={t("increaseFontSize")}
        display={`${fontSize}px`}
        onDecrease={() => setFontSize(fontSize - 1)}
        onIncrease={() => setFontSize(fontSize + 1)}
      />
      <StepperRow
        label={t("lineHeight")}
        decreaseAria={t("decreaseLineHeight")}
        increaseAria={t("increaseLineHeight")}
        display={lineHeight.toFixed(1)}
        onDecrease={() => setLineHeight(lineHeight - 0.1)}
        onIncrease={() => setLineHeight(lineHeight + 0.1)}
      />
      <StepperRow
        label={t("paragraphSpacing")}
        decreaseAria={t("decreaseParagraphSpacing")}
        increaseAria={t("increaseParagraphSpacing")}
        display={`${paragraphSpacing}px`}
        onDecrease={() => setParagraphSpacing(paragraphSpacing - 2)}
        onIncrease={() => setParagraphSpacing(paragraphSpacing + 2)}
      />

      <div className="flex items-center justify-between gap-3">
        <Label htmlFor="reader-font-family" className="text-sm">
          {t("fontFamily")}
        </Label>
        <select
          id="reader-font-family"
          value={fontFamily}
          onChange={(event) => setFontFamily(event.target.value)}
          className="h-9 max-w-52 rounded-md border border-input bg-background px-2 text-sm"
        >
          {APP_FONT_FAMILIES.map((family) => (
            <option key={family} value={family}>
              {family}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Label className="text-sm">{t("textAlignment")}</Label>
        <div className="flex gap-1">
          {(["left", "center", "right", "justify"] as const).map((value) => (
            <Button
              key={value}
              type="button"
              size="sm"
              variant={alignment === value ? "secondary" : "outline"}
              aria-pressed={alignment === value}
              onClick={() => setAlignment(value)}
            >
              {t(ALIGN_KEYS[value])}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Label htmlFor="reader-theme" className="text-sm">
          {t("readingTheme")}
        </Label>
        <select
          id="reader-theme"
          value={theme}
          onChange={(event) => setTheme(event.target.value as (typeof theme))}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
        >
          {READER_THEMES.map((option) => (
            <option key={option.value} value={option.value}>
              {t(THEME_KEYS[option.value])}
            </option>
          ))}
        </select>
      </div>

      <Button type="button" variant="outline" onClick={reset} className="self-end">
        <RotateCcw /> {t("reset")}
      </Button>
    </div>
  );
}
