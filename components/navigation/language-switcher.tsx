"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Languages } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useMounted } from "@/hooks/use-mounted";
import { cn } from "@/utils/cn";

export interface LanguageOption {
  value: string;
  label: string;
  short: string;
}

const defaultLocales: LanguageOption[] = [
  { value: "ne", label: "नेपाली", short: "ने" },
  { value: "en", label: "English", short: "EN" },
];

export interface LanguageSwitcherProps {
  /** Current language code (defaults to Nepali). */
  value?: string;
  /** Fired when the user picks a language. */
  onValueChange?: (value: string) => void;
  locales?: LanguageOption[];
  className?: string;
}

/**
 * LanguageSwitcher — accessible language selector (combobox-like listbox).
 * - WAI-ARIA listbox semantics: `aria-haspopup="listbox"`, `aria-expanded`,
 *   `role="listbox"`/`role="option"` with `aria-selected`.
 * - Keyboard support: opens with the button, arrows move between options,
 *   Enter/Space selects, Escape closes and returns focus to the button.
 * - Closes on outside click and animates with Framer Motion.
 * The actual i18n wiring is a later concern — this component only reports the
 * chosen value via `onValueChange`.
 */
export function LanguageSwitcher({
  value = "ne",
  onValueChange,
  locales = defaultLocales,
  className,
}: LanguageSwitcherProps) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const mounted = useMounted();
  const t = useTranslations("nav");

  const current = locales.find((locale) => locale.value === value) ?? locales[0];

  // Close on outside click.
  React.useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  // Escape closes and returns focus to the trigger button.
  React.useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        const trigger = containerRef.current?.querySelector(
          "button",
        ) as HTMLElement | null;
        trigger?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Move focus to the selected option when the listbox opens.
  React.useEffect(() => {
    if (!open) return;
    const selected = containerRef.current?.querySelector(
      '[aria-selected="true"]',
    ) as HTMLElement | null;
    selected?.focus();
  }, [open]);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        aria-label={t("language")}
        className={className}
      />
    );
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Button
        variant="ghost"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("selectLanguage")}
        onClick={() => setOpen((value) => !value)}
        className="gap-1.5 px-2.5"
      >
        <Languages className="size-4" aria-hidden />
        <span className="text-sm font-medium">{current.short}</span>
        <ChevronDown
          className={cn(
            "size-3.5 transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </Button>

      <AnimatePresence>
        {open ? (
          <motion.ul
            role="listbox"
            aria-label={t("language")}
            className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
          >
            {locales.map((locale, index) => {
              const selected = locale.value === value;
              return (
                <li
                  key={locale.value}
                  role="option"
                  aria-selected={selected}
                  tabIndex={selected ? 0 : -1}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm outline-none",
                    selected
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground hover:bg-accent/60",
                  )}
                  onClick={() => {
                    onValueChange?.(locale.value);
                    setOpen(false);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                      event.preventDefault();
                      const direction = event.key === "ArrowDown" ? 1 : -1;
                      const nextIndex =
                        (index + direction + locales.length) % locales.length;
                      (
                        event.currentTarget.parentElement
                          ?.children[nextIndex] as HTMLElement | undefined
                      )?.focus();
                    } else if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onValueChange?.(locale.value);
                      setOpen(false);
                    }
                  }}
                >
                  <span>{locale.label}</span>
                  {selected ? (
                    <Check className="ml-auto size-4" aria-hidden />
                  ) : null}
                </li>
              );
            })}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
