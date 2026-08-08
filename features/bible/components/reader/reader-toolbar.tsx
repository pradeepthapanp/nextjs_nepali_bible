"use client";

import { useState } from "react";
import {
  ALargeSmall,
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  AlignVerticalSpaceAround,
  ChevronDown,
  Hash,
  MessageSquare,
  Minus,
  Pilcrow,
  Plus,
  SlidersHorizontal,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import {
  READER_FONT_FAMILIES,
  READER_PARAGRAPH_SPACING_STEP,
  READER_THEMES,
  type ReaderAlignment,
  type ReaderTheme,
} from "../../constants";
import type { BibleVersion, Commentary } from "../../types";
import { BookChapterSelectorButton } from "./book-chapter-selector-button";

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

// Re-export the shared types so existing importers keep working.
export type { ReaderAlignment, ReaderTheme };

export interface ReaderToolbarProps {
  fontSize: number;
  lineHeight: number;
  paragraphSpacing: number;
  fontFamily: string;
  alignment: ReaderAlignment;
  theme: ReaderTheme;
  redLetters: boolean;
  showComments: boolean;
  showCrossReferences: boolean;
  showVerseNumbers: boolean;
  /** Current Bible version id + available versions (Bible version dropdown). */
  versionId: string;
  versions: BibleVersion[];
  /** Current commentary book id + available commentary books. */
  commentaryId: string;
  commentaries: Commentary[];
  /** Current book name for the sticky book/chapter selector (hidden when absent). */
  bookName?: string;
  /** Pre-formatted chapter label (Nepali digits) for the sticky selector. */
  chapterLabel?: string;
  onOpenBook?: () => void;
  onOpenChapter?: () => void;
  onVersionChange?: (versionId: string) => void;
  onCommentaryChange?: (commentaryId: string) => void;
  onFontSizeChange?: (value: number) => void;
  onLineHeightChange?: (value: number) => void;
  onParagraphSpacingChange?: (value: number) => void;
  onFontFamilyChange?: (value: string) => void;
  onAlignmentChange?: (alignment: ReaderAlignment) => void;
  onThemeChange?: (theme: ReaderTheme) => void;
  onRedLettersChange?: (value: boolean) => void;
  onCommentsChange?: (value: boolean) => void;
  onCrossReferencesChange?: (value: boolean) => void;
  onVerseNumbersChange?: (value: boolean) => void;
  className?: string;
}

const ALIGNMENTS: { value: ReaderAlignment; icon: typeof AlignLeft }[] = [
  { value: "left", icon: AlignLeft },
  { value: "center", icon: AlignCenter },
  { value: "right", icon: AlignRight },
  { value: "justify", icon: AlignJustify },
];

/**
 * ReaderToolbar — the reader settings control bar.
 *
 * Replaces the reader popups in Flutter (`font_size_popup_widget.dart`,
 * `font_alignment_popup_widget.dart`, `paragraph_height_popup.dart`,
 * `theme_selection_dropdown.dart`, `font_selection_dropdown.dart`,
 * `english_language_visibility_widget.dart`). Purely presentational: it owns
 * no state, receives the current settings and reports changes via callbacks.
 * Every control is a real button (`aria-pressed` for toggles) or a native
 * `<select>` (font family / theme), keyboard accessible, and the bar wraps
 * responsively on mobile.
 */
export function ReaderToolbar({
  fontSize,
  lineHeight,
  paragraphSpacing,
  fontFamily,
  alignment,
  theme,
  redLetters,
  showComments,
  showCrossReferences,
  showVerseNumbers,
  onFontSizeChange,
  onLineHeightChange,
  onParagraphSpacingChange,
  onFontFamilyChange,
  onAlignmentChange,
  onThemeChange,
  onRedLettersChange,
  onCommentsChange,
  onCrossReferencesChange,
  onVerseNumbersChange,
  versionId,
  versions,
  onVersionChange,
  commentaryId,
  commentaries,
  onCommentaryChange,
  bookName,
  chapterLabel,
  onOpenBook,
  onOpenChapter,
  className,
}: ReaderToolbarProps) {
  const [displayOpen, setDisplayOpen] = useState(false);
  const t = useTranslations("reader");
  const hasDisplayTogglesOn =
    redLetters || showComments || showCrossReferences || showVerseNumbers;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border bg-card px-3 py-2 text-card-foreground shadow-sm",
        className,
      )}
    >
      {/* Sticky book/chapter selector — always visible, before the font size
          control, for quick navigation (the chapter header's selector scrolls
          away with the content). */}
      {bookName && chapterLabel ? (
        <>
          <BookChapterSelectorButton
            bookName={bookName}
            chapterLabel={chapterLabel}
            onOpenBook={onOpenBook}
            onOpenChapter={onOpenChapter}
          />
          <span className="h-6 w-px bg-border" aria-hidden />
        </>
      ) : null}

      {/* Font size stepper */}
      <div role="group" aria-label={t("fontSize")} className="flex items-center gap-1">
        <ALargeSmall className="size-4 text-muted-foreground" aria-hidden />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFontSizeChange?.(fontSize - 1)}
          disabled={!onFontSizeChange}
          aria-label={t("decreaseFontSize")}
        >
          <Minus aria-hidden />
        </Button>
        <span className="w-6 text-center text-xs tabular-nums" aria-live="polite">
          {fontSize}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFontSizeChange?.(fontSize + 1)}
          disabled={!onFontSizeChange}
          aria-label={t("increaseFontSize")}
        >
          <Plus aria-hidden />
        </Button>
      </div>

      <span className="h-6 w-px bg-border" aria-hidden />

      {/* Line height stepper */}
      <div role="group" aria-label={t("lineHeight")} className="flex items-center gap-1">
        <AlignVerticalSpaceAround className="size-4 text-muted-foreground" aria-hidden />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onLineHeightChange?.(Number((lineHeight - 0.1).toFixed(1)))}
          disabled={!onLineHeightChange}
          aria-label={t("decreaseLineHeight")}
        >
          <Minus aria-hidden />
        </Button>
        <span className="w-8 text-center text-xs tabular-nums" aria-live="polite">
          {lineHeight.toFixed(1)}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onLineHeightChange?.(Number((lineHeight + 0.1).toFixed(1)))}
          disabled={!onLineHeightChange}
          aria-label={t("increaseLineHeight")}
        >
          <Plus aria-hidden />
        </Button>
      </div>

      <span className="h-6 w-px bg-border" aria-hidden />

      {/* Paragraph spacing stepper */}
      <div
        role="group"
        aria-label={t("paragraphSpacing")}
        className="flex items-center gap-1"
      >
        <Pilcrow className="size-4 text-muted-foreground" aria-hidden />
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            onParagraphSpacingChange?.(
              paragraphSpacing - READER_PARAGRAPH_SPACING_STEP,
            )
          }
          disabled={!onParagraphSpacingChange}
          aria-label={t("decreaseParagraphSpacing")}
        >
          <Minus aria-hidden />
        </Button>
        <span className="w-6 text-center text-xs tabular-nums" aria-live="polite">
          {paragraphSpacing}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            onParagraphSpacingChange?.(
              paragraphSpacing + READER_PARAGRAPH_SPACING_STEP,
            )
          }
          disabled={!onParagraphSpacingChange}
          aria-label={t("increaseParagraphSpacing")}
        >
          <Plus aria-hidden />
        </Button>
      </div>

      <span className="h-6 w-px bg-border" aria-hidden />

      {/* Font family select */}
      <div role="group" aria-label={t("fontFamily")} className="flex items-center gap-1">
        <SelectControl
          id="reader-font-family"
          label={t("fontFamily")}
          value={fontFamily}
          options={READER_FONT_FAMILIES.map((family) => ({
            value: family,
            label: family,
          }))}
          onChange={onFontFamilyChange}
          className="w-44"
        />
      </div>

      <span className="h-6 w-px bg-border" aria-hidden />

      {/* Alignment segmented control */}
      <div role="group" aria-label={t("textAlignment")} className="flex items-center rounded-lg bg-muted p-0.5">
        {ALIGNMENTS.map(({ value, icon: Icon }) => (
          <Button
            key={value}
            variant="ghost"
            size="sm"
            onClick={() => onAlignmentChange?.(value)}
            disabled={!onAlignmentChange}
            aria-pressed={alignment === value}
            aria-label={t(ALIGN_KEYS[value])}
            className={cn(
              "h-8 w-8 p-0",
              alignment === value && "bg-background shadow-sm",
            )}
          >
            <Icon className="size-4" aria-hidden />
          </Button>
        ))}
      </div>

      <span className="h-6 w-px bg-border" aria-hidden />

      {/* Bible version dropdown */}
      <div role="group" aria-label={t("bibleVersion")} className="flex items-center gap-1">
        <SelectControl
          id="reader-bible-version"
          label={t("bibleVersion")}
          value={versionId}
          options={versions.map((version) => ({
            value: version.id,
            label: `${version.shortCode} — ${version.name}`,
          }))}
          onChange={onVersionChange}
          className="w-52"
        />
      </div>

      <span className="h-6 w-px bg-border" aria-hidden />

      {/* Commentary dropdown */}
      <div role="group" aria-label={t("commentary")} className="flex items-center gap-1">
        <SelectControl
          id="reader-commentary"
          label={t("commentary")}
          value={commentaryId}
          options={commentaries.map((commentary) => ({
            value: commentary.id,
            label: commentary.name,
          }))}
          onChange={onCommentaryChange}
          className="w-52"
        />
      </div>

      <span className="h-6 w-px bg-border" aria-hidden />

      {/* Display toggle button — a compact "more-context" control that
          collapses the reader toggles (red letters, comments, references,
          verse numbers) until expanded. A small dot marks when any toggle is
          on. */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setDisplayOpen((open) => !open)}
        aria-expanded={displayOpen}
        className="h-8 gap-1.5 px-2 text-xs"
      >
        <SlidersHorizontal className="size-3.5" aria-hidden />
        {t("display")}
        {hasDisplayTogglesOn ? (
          <span className="size-1.5 rounded-full bg-primary" aria-hidden />
        ) : null}
        <ChevronDown
          className={cn(
            "size-3.5 transition-transform",
            displayOpen && "rotate-180",
          )}
          aria-hidden
        />
      </Button>

      {displayOpen ? (
        <div
          role="group"
          aria-label={t("display")}
          className="flex basis-full flex-wrap items-center gap-x-4 gap-y-2 border-t pt-2"
        >
          {/* Reading theme — moved under Display */}
          <div role="group" aria-label={t("readingTheme")} className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              {t("readingTheme")}
            </span>
            <SelectControl
              id="reader-theme"
              label={t("readingTheme")}
              value={theme}
              options={READER_THEMES.map(({ value }) => ({
                value,
                label: t(THEME_KEYS[value]),
              }))}
              onChange={onThemeChange}
              className="w-36"
            />
          </div>

          <span className="h-6 w-px bg-border" aria-hidden />

          <ToggleChip
            pressed={redLetters}
            onPress={onRedLettersChange}
            label={t("redLetters")}
          />
          <ToggleChip
            pressed={showComments}
            onPress={onCommentsChange}
            label={t("comments")}
          />
          <ToggleChip
            pressed={showCrossReferences}
            onPress={onCrossReferencesChange}
            label={t("references")}
          />
          <ToggleChip
            pressed={showVerseNumbers}
            onPress={onVerseNumbersChange}
            label={t("verseNumbers")}
            icon={<Hash className="size-3.5" aria-hidden />}
          />
        </div>
      ) : null}
    </div>
  );
}

/** Compact native select used for the font family / theme controls. */
function SelectControl<T extends string>({
  id,
  label,
  value,
  options,
  onChange,
  className,
}: {
  id: string;
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange?: (value: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange?.(event.target.value as T)}
        disabled={!onChange}
        // Explicit `color-scheme` + option colors keep the native dropdown
        // (and its unselected options) readable in dark mode — the browser's
        // default popup can otherwise render a light background under the
        // light `text-foreground`, making the options invisible.
        className="h-8 w-full appearance-none truncate rounded-lg border border-input bg-transparent pl-2 pr-7 text-xs font-medium text-foreground [color-scheme:light] dark:[color-scheme:dark] [&>option]:bg-background [&>option]:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  );
}

function ToggleChip({
  pressed,
  onPress,
  label,
  icon,
}: {
  pressed: boolean;
  onPress?: (value: boolean) => void;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onPress?.(!pressed)}
      disabled={!onPress}
      aria-pressed={pressed}
      className={cn(
        "h-8 gap-1.5 px-2 text-xs",
        pressed ? "bg-primary/10 text-primary" : "text-muted-foreground",
      )}
    >
      {icon ?? <MessageSquare className="size-3.5" aria-hidden />}
      {label}
    </Button>
  );
}
