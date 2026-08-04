"use client";

import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  AlignVerticalSpaceAround,
  Hash,
  MessageSquare,
  Minus,
  Plus,
  Type,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

/** Text alignment, mirroring the Flutter `FontAlignment` enum. */
export type ReaderAlignment = "left" | "center" | "right" | "justify";

export interface ReaderToolbarProps {
  fontSize: number;
  lineHeight: number;
  alignment: ReaderAlignment;
  redLetters: boolean;
  showComments: boolean;
  showCrossReferences: boolean;
  showVerseNumbers: boolean;
  onFontSizeChange?: (value: number) => void;
  onLineHeightChange?: (value: number) => void;
  onAlignmentChange?: (alignment: ReaderAlignment) => void;
  onRedLettersChange?: (value: boolean) => void;
  onCommentsChange?: (value: boolean) => void;
  onCrossReferencesChange?: (value: boolean) => void;
  onVerseNumbersChange?: (value: boolean) => void;
  className?: string;
}

const ALIGNMENTS: { value: ReaderAlignment; icon: typeof AlignLeft; label: string }[] = [
  { value: "left", icon: AlignLeft, label: "Align left" },
  { value: "center", icon: AlignCenter, label: "Align center" },
  { value: "right", icon: AlignRight, label: "Align right" },
  { value: "justify", icon: AlignJustify, label: "Justify" },
];

/**
 * ReaderToolbar — the reader settings control bar.
 *
 * Replaces the reader popups in Flutter (`font_size_popup_widget.dart`,
 * `font_alignment_popup_widget.dart`, `paragraph_spacing_popup.dart`,
 * `english_language_visibility_widget.dart`). Purely presentational: it owns
 * no state, receives the current settings and reports changes via callbacks.
 * Every control is a real button (`aria-pressed` for toggles), keyboard
 * accessible, and the bar wraps responsively on mobile.
 */
export function ReaderToolbar({
  fontSize,
  lineHeight,
  alignment,
  redLetters,
  showComments,
  showCrossReferences,
  showVerseNumbers,
  onFontSizeChange,
  onLineHeightChange,
  onAlignmentChange,
  onRedLettersChange,
  onCommentsChange,
  onCrossReferencesChange,
  onVerseNumbersChange,
  className,
}: ReaderToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border bg-card px-3 py-2 text-card-foreground shadow-sm",
        className,
      )}
    >
      {/* Font size stepper */}
      <div role="group" aria-label="Font size" className="flex items-center gap-1">
        <Type className="size-4 text-muted-foreground" aria-hidden />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFontSizeChange?.(fontSize - 1)}
          disabled={!onFontSizeChange}
          aria-label="Decrease font size"
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
          aria-label="Increase font size"
        >
          <Plus aria-hidden />
        </Button>
      </div>

      {/* Line height stepper */}
      <div role="group" aria-label="Line height" className="flex items-center gap-1">
        <AlignVerticalSpaceAround className="size-4 text-muted-foreground" aria-hidden />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onLineHeightChange?.(Number((lineHeight - 0.1).toFixed(1)))}
          disabled={!onLineHeightChange}
          aria-label="Decrease line height"
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
          aria-label="Increase line height"
        >
          <Plus aria-hidden />
        </Button>
      </div>

      {/* Alignment segmented control */}
      <div role="group" aria-label="Text alignment" className="flex items-center rounded-lg bg-muted p-0.5">
        {ALIGNMENTS.map(({ value, icon: Icon, label }) => (
          <Button
            key={value}
            variant="ghost"
            size="sm"
            onClick={() => onAlignmentChange?.(value)}
            disabled={!onAlignmentChange}
            aria-pressed={alignment === value}
            aria-label={label}
            className={cn(
              "h-8 w-8 p-0",
              alignment === value && "bg-background shadow-sm",
            )}
          >
            <Icon className="size-4" aria-hidden />
          </Button>
        ))}
      </div>

      {/* Display toggles */}
      <div role="group" aria-label="Display options" className="flex items-center gap-1">
        <ToggleChip
          pressed={redLetters}
          onPress={onRedLettersChange}
          label="Red letters"
        />
        <ToggleChip
          pressed={showComments}
          onPress={onCommentsChange}
          label="Comments"
        />
        <ToggleChip
          pressed={showCrossReferences}
          onPress={onCrossReferencesChange}
          label="References"
        />
        <ToggleChip
          pressed={showVerseNumbers}
          onPress={onVerseNumbersChange}
          label="Verse numbers"
          icon={<Hash className="size-3.5" aria-hidden />}
        />
      </div>
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
