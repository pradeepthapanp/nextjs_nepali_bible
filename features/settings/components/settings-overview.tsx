"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { FeatureIcon } from "@/components/icons";
import { Card, CardContent } from "@/components/ui/card";
import { SETTINGS_SECTIONS } from "../constants";

/**
 * SettingsOverview — the `/settings` landing. Lists every Settings section as
 * a card (derived from `SETTINGS_SECTIONS`, the single source of truth) so the
 * overview can never drift from the sidebar. Public — no auth required.
 */
export function SettingsOverview() {
  const t = useTranslations();

  const label = (section: (typeof SETTINGS_SECTIONS)[number]) =>
    section.labelKey ? t(section.labelKey) : section.label;
  const description = (section: (typeof SETTINGS_SECTIONS)[number]) =>
    section.descriptionKey ? t(section.descriptionKey) : section.description;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          {t("settings.settings")}
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          {t("settings.settingsSubtitle")}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {SETTINGS_SECTIONS.map((section) => (
          <Link key={section.href} href={section.href} className="group">
            <Card interactive className="h-full">
              <CardContent className="flex h-full flex-col gap-2 p-5">
                <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <FeatureIcon name={section.icon} aria-hidden />
                </span>
                <h3 className="mt-1 font-semibold text-foreground">
                  {label(section)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {description(section)}
                </p>
                <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-medium text-primary">
                  {t("home.open")}
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
