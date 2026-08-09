"use client";

import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faComments,
  faCross,
  faHashtag,
  faLanguage,
  faLink,
} from "@fortawesome/free-solid-svg-icons";
import {
  ALargeSmall,
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  ChevronDown,
  Minus,
  Plus,
  SlidersHorizontal,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { ToggleSwitch } from "@features/settings/components";
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
  /** Show the English NIV parallel verse under each Nepali verse. */
  showEnglishVerses: boolean;
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
  /** Audio play/pause control rendered next to the book/chapter selector. */
  audioIndicator?: React.ReactNode;
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
  onEnglishVersesChange?: (value: boolean) => void;
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
  showEnglishVerses,
  onEnglishVersesChange,
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
  audioIndicator,
  className,
}: ReaderToolbarProps) {
  const t = useTranslations("reader");

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

      {/* Audio play/pause — rendered next to the book/chapter selector. */}
      {audioIndicator}

      {/* Text controls popup — collapses font size, line height, paragraph
          spacing and alignment into one compact dropdown so the toolbar stays
          a single row. */}
      <TextControlsPopover
        fontSize={fontSize}
        lineHeight={lineHeight}
        paragraphSpacing={paragraphSpacing}
        alignment={alignment}
        fontFamily={fontFamily}
        onFontSizeChange={onFontSizeChange}
        onLineHeightChange={onLineHeightChange}
        onParagraphSpacingChange={onParagraphSpacingChange}
        onAlignmentChange={onAlignmentChange}
        onFontFamilyChange={onFontFamilyChange}
      />

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
          className="w-44"
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
          className="w-44"
        />
      </div>

      <span className="h-6 w-px bg-border" aria-hidden />

      {/* Display settings popover — reading theme + reader toggles. */}
      <DisplayControlsPopover
        theme={theme}
        redLetters={redLetters}
        showComments={showComments}
        showCrossReferences={showCrossReferences}
        showVerseNumbers={showVerseNumbers}
        showEnglishVerses={showEnglishVerses}
        onThemeChange={onThemeChange}
        onRedLettersChange={onRedLettersChange}
        onCommentsChange={onCommentsChange}
        onCrossReferencesChange={onCrossReferencesChange}
        onVerseNumbersChange={onVerseNumbersChange}
        onEnglishVersesChange={onEnglishVersesChange}
      />
    </div>
  );
}

/** One labeled row in the Text popover. */
function SettingRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

/** Compact minus / value / plus stepper used inside the Text popover. */
function Stepper({
  display,
  onDecrease,
  onIncrease,
  disabled,
  decreaseLabel,
  increaseLabel,
}: {
  display: string;
  onDecrease?: () => void;
  onIncrease?: () => void;
  disabled?: boolean;
  decreaseLabel: string;
  increaseLabel: string;
}) {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={onDecrease}
        disabled={disabled}
        aria-label={decreaseLabel}
        className="h-7 px-1.5"
      >
        <Minus aria-hidden />
      </Button>
      <span className="w-8 text-center text-xs tabular-nums" aria-live="polite">
        {display}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={onIncrease}
        disabled={disabled}
        aria-label={increaseLabel}
        className="h-7 px-1.5"
      >
        <Plus aria-hidden />
      </Button>
    </div>
  );
}

/**
 * Compact "Text" dropdown — collapses the font size, line height, paragraph
 * spacing and alignment controls into one popover so the toolbar stays a
 * single row. Presentational: receives the current values and reports changes
 * via callbacks (same contract as the inline controls it replaces).
 */
function TextControlsPopover({
  fontSize,
  lineHeight,
  paragraphSpacing,
  alignment,
  fontFamily,
  onFontSizeChange,
  onLineHeightChange,
  onParagraphSpacingChange,
  onAlignmentChange,
  onFontFamilyChange,
}: {
  fontSize: number;
  lineHeight: number;
  paragraphSpacing: number;
  alignment: ReaderAlignment;
  fontFamily: string;
  onFontSizeChange?: (value: number) => void;
  onLineHeightChange?: (value: number) => void;
  onParagraphSpacingChange?: (value: number) => void;
  onAlignmentChange?: (alignment: ReaderAlignment) => void;
  onFontFamilyChange?: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("reader");

  // Close on outside pointerdown or Escape while the popover is open.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="h-8 gap-1.5 px-2 text-xs"
      >
        <ALargeSmall className="size-4" aria-hidden />
        {t("text")}
        <ChevronDown
          className={cn(
            "size-3.5 transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </Button>

      {open ? (
        <div
          role="group"
          aria-label={t("text")}
          className="absolute right-0 top-full z-50 mt-2 w-64 space-y-3 rounded-xl border bg-card p-3 text-card-foreground shadow-lg"
        >
          <SettingRow label={t("fontFamily")}>
            <SelectControl
              id="reader-font-family"
              label={t("fontFamily")}
              value={fontFamily}
              options={READER_FONT_FAMILIES.map((family) => ({
                value: family,
                label: family,
              }))}
              onChange={onFontFamilyChange}
              className="w-36"
            />
          </SettingRow>

          <SettingRow label={t("fontSize")}>
            <Stepper
              display={`${fontSize}`}
              onDecrease={() => onFontSizeChange?.(fontSize - 1)}
              onIncrease={() => onFontSizeChange?.(fontSize + 1)}
              disabled={!onFontSizeChange}
              decreaseLabel={t("decreaseFontSize")}
              increaseLabel={t("increaseFontSize")}
            />
          </SettingRow>

          <SettingRow label={t("lineHeight")}>
            <Stepper
              display={lineHeight.toFixed(1)}
              onDecrease={() =>
                onLineHeightChange?.(Number((lineHeight - 0.1).toFixed(1)))
              }
              onIncrease={() =>
                onLineHeightChange?.(Number((lineHeight + 0.1).toFixed(1)))
              }
              disabled={!onLineHeightChange}
              decreaseLabel={t("decreaseLineHeight")}
              increaseLabel={t("increaseLineHeight")}
            />
          </SettingRow>

          <SettingRow label={t("paragraphSpacing")}>
            <Stepper
              display={`${paragraphSpacing}`}
              onDecrease={() =>
                onParagraphSpacingChange?.(
                  paragraphSpacing - READER_PARAGRAPH_SPACING_STEP,
                )
              }
              onIncrease={() =>
                onParagraphSpacingChange?.(
                  paragraphSpacing + READER_PARAGRAPH_SPACING_STEP,
                )
              }
              disabled={!onParagraphSpacingChange}
              decreaseLabel={t("decreaseParagraphSpacing")}
              increaseLabel={t("increaseParagraphSpacing")}
            />
          </SettingRow>

          <SettingRow label={t("textAlignment")}>
            <div
              role="group"
              aria-label={t("textAlignment")}
              className="flex items-center rounded-lg bg-muted p-0.5"
            >
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
                    "h-7 w-8 p-0",
                    alignment === value && "bg-background shadow-sm",
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                </Button>
              ))}
            </div>
          </SettingRow>
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

/**
 * Compact "Display" dropdown — the reader display settings (reading theme,
 * red letters, comments, references, verse numbers) in a popover matching the
 * Text controls popover. Presentational: receives the current settings and
 * reports changes via callbacks (same contract as the inline controls it
 * replaces).
 */
function DisplayControlsPopover({
  theme,
  redLetters,
  showComments,
  showCrossReferences,
  showVerseNumbers,
  showEnglishVerses,
  onThemeChange,
  onRedLettersChange,
  onCommentsChange,
  onCrossReferencesChange,
  onVerseNumbersChange,
  onEnglishVersesChange,
}: {
  theme: ReaderTheme;
  redLetters: boolean;
  showComments: boolean;
  showCrossReferences: boolean;
  showVerseNumbers: boolean;
  showEnglishVerses: boolean;
  onThemeChange?: (theme: ReaderTheme) => void;
  onRedLettersChange?: (value: boolean) => void;
  onCommentsChange?: (value: boolean) => void;
  onCrossReferencesChange?: (value: boolean) => void;
  onVerseNumbersChange?: (value: boolean) => void;
  onEnglishVersesChange?: (value: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("reader");
  const hasTogglesOn =
    redLetters ||
    showComments ||
    showCrossReferences ||
    showVerseNumbers ||
    showEnglishVerses;

  // Close on outside pointerdown or Escape while the popover is open.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="h-8 gap-1.5 px-2 text-xs"
      >
        <SlidersHorizontal className="size-3.5" aria-hidden />
        {t("display")}
        {hasTogglesOn ? (
          <span className="size-1.5 rounded-full bg-primary" aria-hidden />
        ) : null}
        <ChevronDown
          className={cn(
            "size-3.5 transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </Button>

      {open ? (
        <div
          role="group"
          aria-label={t("display")}
          className="absolute right-0 top-full z-50 mt-2 w-72 space-y-3 rounded-xl border bg-card p-3 text-card-foreground shadow-lg"
        >
          <SettingRow label={t("readingTheme")}>
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
          </SettingRow>

          <div className="space-y-1 border-t pt-2">
            <ToggleSwitchRow
              icon={faCross}
              label={t("redLetters")}
              checked={redLetters}
              onChange={onRedLettersChange}
            />
            <ToggleSwitchRow
              icon={faComments}
              label={t("comments")}
              checked={showComments}
              onChange={onCommentsChange}
            />
            <ToggleSwitchRow
              icon={faLink}
              label={t("references")}
              checked={showCrossReferences}
              onChange={onCrossReferencesChange}
            />
            <ToggleSwitchRow
              icon={faHashtag}
              label={t("verseNumbers")}
              checked={showVerseNumbers}
              onChange={onVerseNumbersChange}
            />
            <ToggleSwitchRow
              icon={faLanguage}
              label={t("englishVerses")}
              checked={showEnglishVerses}
              onChange={onEnglishVersesChange}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** One labeled toggle row: Font Awesome icon + label on the left, switch on the right. */
function ToggleSwitchRow({
  icon,
  label,
  checked,
  onChange,
}: {
  icon: IconDefinition;
  label: string;
  checked: boolean;
  onChange?: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 py-1">
      <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <FontAwesomeIcon icon={icon} className="w-3.5" aria-hidden />
        {label}
      </span>
      <ToggleSwitch
        checked={checked}
        onChange={(value) => onChange?.(value)}
        label={label}
        disabled={!onChange}
      />
    </div>
  );
}
