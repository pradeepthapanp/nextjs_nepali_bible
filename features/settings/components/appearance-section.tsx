"use client";

import { Monitor, Moon, Sun, Type } from "lucide-react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMounted } from "@/hooks/use-mounted";
import { APP_DEFAULT_FONT_FAMILY, APP_FONT_FAMILIES } from "@/utils/fonts";
import { cn } from "@/utils/cn";
import { SegmentedControl } from "./settings-controls";

const THEME_OPTIONS = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
] as const;

/**
 * AppearanceSection — the Settings → Appearance section.
 *
 * REUSES the existing theme system (`next-themes` via the root `ThemeProvider`
 * — the same `useTheme` the global `ThemeToggle` uses) for System / Light /
 * Dark, and the SHARED reader font list (`APP_FONT_FAMILIES` from
 * `@/utils/fonts`) as the informational "Reading fonts" surface. No new theme
 * or font state is created.
 */
export function AppearanceSection() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Appearance</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Choose how the app looks. These preferences apply everywhere and are
          saved on this device.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Monitor className="size-4 text-primary" aria-hidden />
            Theme
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="max-w-sm space-y-0.5">
              <p className="text-sm font-medium text-foreground">App theme</p>
              <p className="text-sm text-muted-foreground">
                System follows your device; Light and Dark force the theme.
              </p>
            </div>
            {mounted ? (
              <SegmentedControl
                label="App theme"
                value={(theme ?? "system") as "system" | "light" | "dark"}
                onChange={(value) => setTheme(value)}
                options={THEME_OPTIONS.map((option) => ({
                  value: option.value,
                  label: option.label,
                }))}
              />
            ) : null}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {THEME_OPTIONS.map((option) => {
              const Icon =
                option.value === "system"
                  ? Monitor
                  : option.value === "light"
                    ? Sun
                    : Moon;
              const active = mounted && theme === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setTheme(option.value)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-lg border p-4 text-sm font-medium transition-colors",
                    active
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-input text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                  {option.label}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Type className="size-4 text-primary" aria-hidden />
            Reading Fonts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The reader (Bible, articles and devotions) offers these Devanagari
            font families. The default is{" "}
            <span className="font-medium text-foreground">
              {APP_DEFAULT_FONT_FAMILY}
            </span>
            ; choose your preferred family in Settings → Reading.
          </p>
          <ul className="mt-4 grid gap-1.5 sm:grid-cols-2">
            {APP_FONT_FAMILIES.map((family) => (
              <li
                key={family}
                className="flex items-center gap-2 rounded-md border border-border/60 px-3 py-2 text-sm"
                style={{ fontFamily: `"${family}", sans-serif` }}
              >
                {family}
                {family === APP_DEFAULT_FONT_FAMILY ? (
                  <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                    Default
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
